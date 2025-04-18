"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Home,
  MessageSquare,
  Upload,
  Users,
  User,
  ChevronLeft,
  ChevronRight,
  Palette,
  ShoppingCart,
  Camera,
} from "lucide-react"
import { useShop } from "../Context/ShopContext"

import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { styled } from "@mui/material/styles"

const drawerWidth = 240
const collapsedDrawerWidth = 68

const StyledDrawer = styled(Drawer)(({ theme, open }) => ({
  width: open ? drawerWidth : collapsedDrawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  overflowX: "hidden",
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  "& .MuiDrawer-paper": {
    width: open ? drawerWidth : collapsedDrawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    overflowX: "hidden",
    display: "flex",
    flexDirection: "column",
  },
}))

const NavBar = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [isExpanded, setIsExpanded] = useState(!isMobile)
  const location = useLocation()
  const currentPath = location.pathname
  const { getEquippedSkin, equippedSkinId, userId, defaultSkin } = useShop()

  const [currentSkin, setCurrentSkin] = useState(getEquippedSkin())

  // Enhanced effect to handle skin persistence across navigation
  useEffect(() => {
    // Make the key user-specific
    const localStorageKey = userId ? `lastEquippedSkinId_${userId}` : "lastEquippedSkinId"

    // Clear any stored skin data if userId is null (logged out)
    if (!userId) {
      setCurrentSkin(defaultSkin)
      console.log("[Navbar] No user logged in, using default skin")
      return
    }

    // First, try to get the equipped skin from the ShopContext
    const contextSkin = getEquippedSkin()

    // If we have a skin ID in context that isn't default, use and store it
    if (equippedSkinId && equippedSkinId !== defaultSkin.id) {
      setCurrentSkin(contextSkin)
      localStorage.setItem(localStorageKey, equippedSkinId)
      console.log("[Navbar] Using equipped skin from context:", equippedSkinId)
      return
    }

    // If the context doesn't have a non-default skin, try to get from localStorage
    const savedSkinId = localStorage.getItem(localStorageKey)

    if (savedSkinId && savedSkinId !== defaultSkin.id) {
      // If we have a saved skin ID, use it to retrieve the skin data
      const fallbackSkin = getEquippedSkin()

      if (fallbackSkin && fallbackSkin.id !== defaultSkin.id) {
        setCurrentSkin(fallbackSkin)
        console.log("[Navbar] Restored skin from localStorage:", savedSkinId)
        return
      }
    }

    // Default fallback - use whatever the context provides
    setCurrentSkin(getEquippedSkin())
    console.log("[Navbar] Using default skin from context")
  }, [getEquippedSkin, equippedSkinId, userId, defaultSkin])

  // Update expanded state when screen size changes
  useEffect(() => {
    setIsExpanded(!isMobile)
  }, [isMobile])

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded)
  }

  const navItems = [
    { icon: Home, label: "Home", path: "/", external: false },
    { icon: MessageSquare, label: "Friends", path: "/friends", external: false },
    { icon: Upload, label: "Upload", path: "/upload", external: false },
    { icon: Users, label: "Community", path: "/community", external: false },
    { icon: User, label: "Profile", path: "/profile", external: false },
    { icon: Palette, label: "Style Guide", path: "/style-guide", external: false },
    { icon: Camera, label: "Feed", path: "/feed", external: false },
    { icon: ShoppingCart, label: "Shop", path: "/shop", external: false },
  ]

  return (
    <StyledDrawer variant="permanent" open={isExpanded}>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
          <Box
            onClick={toggleSidebar}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "#f5f5f5",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "#e0e0e0",
              },
            }}
          >
            {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </Box>
        </Box>
        <Box
          sx={{
            height: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
            transition: theme.transitions.create(["padding", "justify-content"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src={currentSkin.logo}
              alt="Bubble Brain Logo"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </Box>
          {isExpanded && (
            <Typography
              variant="h6"
              sx={{
                ml: 2,
                fontFamily: '"Sour Gummy", sans-serif',
                fontWeight: 600,
                fontSize: "1.5rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Bubble <br/>Brain
            </Typography>
          )}
        </Box>

        <List
          sx={{
            flexGrow: 1,
            py: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPath === item.path

            return (
              <ListItem key={item.path} disablePadding sx={{ display: "flex" }}>
                <ListItemButton
                  component={item.external ? "a" : Link}
                  href={item.external ? `https://webdev.cse.buffalo.edu/hci/teams/droptable${item.path}` : undefined}
                  to={!item.external ? item.path : undefined}
                  target={item.external ? "_blank" : undefined}
                  selected={isActive}
                  sx={{
                    minHeight: 48,
                    justifyContent: isExpanded ? "initial" : "center",
                    px: 2.5,
                    backgroundColor: isActive ? "rgba(29, 110, 241, 0.08)" : "transparent",
                    "&:hover": {
                      backgroundColor: isActive ? "rgba(29, 110, 241, 0.12)" : "rgba(0, 0, 0, 0.04)",
                    },
                    borderRadius: 1,
                    my: 0.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: isExpanded ? 3 : "auto",
                      justifyContent: "center",
                      color: isActive ? "#1D6EF1" : "#1D1D20",
                    }}
                  >
                    <Icon size={24} />
                  </ListItemIcon>
                  {isExpanded && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontFamily: '"Sour Gummy", sans-serif',
                        fontSize: "16px",
                        color: isActive ? "#1D6EF1" : "#1D1D20",
                        fontWeight: isActive ? 600 : 400,
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>

        {/* <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
          <Box
            onClick={toggleSidebar}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "#f5f5f5",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "#e0e0e0",
              },
            }}
          >
            {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </Box>
        </Box> */}
      </Box>
    </StyledDrawer>
  )
}

export default NavBar

"use client"

import { useState, useEffect, useContext } from "react"
import { Link, useLocation } from "react-router-dom"
import {
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
import { BackgroundContext } from "../App"
import text from "../text.json"

const drawerWidth = 240
const collapsedDrawerWidth = 68

// Custom Spring/Wiggle Configuration
// This cubic-bezier creates an "overshoot" effect (values > 1) which looks like a wiggle/bounce
const wiggleEasing = "cubic-bezier(0.34, 1.56, 0.64, 1)"
const transitionDuration = 600 // Increased duration slightly so the wiggle is visible

const StyledDrawer = styled(Drawer)(({ theme, open }) => ({
    width: open ? drawerWidth : collapsedDrawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    overflowX: "hidden",
    // Updated Transition for the Container
    transition: theme.transitions.create("width", {
        easing: wiggleEasing,
        duration: transitionDuration,
    }),
    "& .MuiDrawer-paper": {
        width: open ? drawerWidth : collapsedDrawerWidth,
        // Updated Transition for the Paper (the actual visible background)
        transition: theme.transitions.create("width", {
            easing: wiggleEasing,
            duration: transitionDuration,
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
        const localStorageKey = userId ? `lastEquippedSkinId_${userId}` : "lastEquippedSkinId"

        if (!userId) {
            setCurrentSkin(defaultSkin)
            return
        }

        const contextSkin = getEquippedSkin()

        if (equippedSkinId && equippedSkinId !== defaultSkin.id) {
            setCurrentSkin(contextSkin)
            localStorage.setItem(localStorageKey, equippedSkinId)
            return
        }

        const savedSkinId = localStorage.getItem(localStorageKey)

        if (savedSkinId && savedSkinId !== defaultSkin.id) {
            const fallbackSkin = getEquippedSkin()
            if (fallbackSkin && fallbackSkin.id !== defaultSkin.id) {
                setCurrentSkin(fallbackSkin)
                return
            }
        }

        setCurrentSkin(getEquippedSkin())
    }, [getEquippedSkin, equippedSkinId, userId, defaultSkin])

    useEffect(() => {
        setIsExpanded(!isMobile)
    }, [isMobile])

    const toggleSidebar = () => {
        setIsExpanded(!isExpanded)
    }

    const { language } = useContext(BackgroundContext)
    const langKey = language === "English" ? "en" : "es"
    const navViewText = text[langKey]

    const navItems = [
        { icon: MessageSquare, label: [navViewText.navbar.items.friends], path: "/friends", external: false },
        { icon: Upload, label: [navViewText.navbar.items.upload], path: "/upload", external: false },
        { icon: Users, label: [navViewText.navbar.items.community], path: "/community", external: false },
        { icon: User, label: [navViewText.navbar.items.profile], path: "/profile", external: false },
        { icon: Palette, label: [navViewText.navbar.items.styleGuide], path: "/style-guide", external: false },
        { icon: Camera, label: [navViewText.navbar.items.feed], path: "/feed", external: false },
        { icon: ShoppingCart, label: [navViewText.navbar.items.shop], path: "/shop", external: false },
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
                        // We also apply the wiggle timing to the padding/content transitions
                        transition: theme.transitions.create(["padding", "justify-content"], {
                            easing: wiggleEasing,
                            duration: transitionDuration,
                        }),
                    }}
                >
                    <Box
                        component={Link}
                        to="/"
                        sx={{
                            width: 72,
                            height: 72,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            cursor: "pointer",
                            textDecoration: "none",
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
                                // Simple fade in for text
                                animation: "fadeIn 0.5s ease-in",
                                "@keyframes fadeIn": {
                                    "0%": { opacity: 0 },
                                    "100%": { opacity: 1 },
                                }
                            }}
                        >
                            Bubble <br />
                            Brain
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
            </Box>
        </StyledDrawer>
    )
}

export default NavBar
// "use client"

// import { useState } from "react"
// import { Link, useLocation } from "react-router-dom"
// import { Home, MessageSquare, Upload, Users, Settings, User, ChevronLeft, ChevronRight } from "lucide-react"

// const NavBar = () => {
//   const [isExpanded, setIsExpanded] = useState(true)

//   // Get current path to highlight active link
//   const location = useLocation()
//   const currentPath = location.pathname

//   const navItems = [
//     { icon: Home, label: "Home", path: "/" },
//     { icon: MessageSquare, label: "Chat", path: "/chat" },
//     { icon: Upload, label: "Upload", path: "/upload" },
//     { icon: Users, label: "Community", path: "/community" },
//     { icon: Settings, label: "Settings", path: "/settings" },
//     { icon: User, label: "Profile", path: "/profile" },
//   ]

//   return (
//     <nav
//       className={`fixed left-0 top-0 h-full bg-white border-r transition-all duration-300 flex flex-col ${
//         isExpanded ? "w-64" : "w-16"
//       }`}
//     >
//       <div className="flex-grow" />
//       <div className="mb-auto space-y-6 px-3">
//         {navItems.map((item, index) => {
//           const Icon = item.icon
//           const isActive = currentPath === item.path
//           return (
//             <Link
//               key={index}
//               to={item.path}
//               className={`flex items-center px-3 py-2 rounded-lg transition-colors group ${
//                 isExpanded ? "justify-start" : "justify-center"
//               } ${isActive ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"}`}
//             >
//               <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : ""}`} />
//               {isExpanded && (
//                 <span className={`ml-3 text-sm font-medium ${isActive ? "text-blue-600" : ""}`}>{item.label}</span>
//               )}
//               {!isExpanded && (
//                 <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
//                   {item.label}
//                 </span>
//               )}
//             </Link>
//           )
//         })}
//       </div>
//       <div className="flex-grow" />
//       <button
//         onClick={() => setIsExpanded(!isExpanded)}
//         className={`absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white p-1.5 rounded-full border shadow-sm text-gray-700 hover:text-gray-900`}
//       >
//         {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
//       </button>
//     </nav>
//   )
// }

// export default NavBar

"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Home, MessageSquare, Upload, Users, Settings, User, ChevronLeft, ChevronRight,Palette} from "lucide-react"
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

  // Update expanded state when screen size changes
  useEffect(() => {
    setIsExpanded(!isMobile)
  }, [isMobile])

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded)
  }

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: MessageSquare, label: "Chat", path: "/chat" },
    { icon: Upload, label: "Upload", path: "/upload" },
    { icon: Users, label: "Community", path: "/community" },
    { icon: Settings, label: "Settings", path: "/settings" },
    { icon: User, label: "Profile", path: "/profile" },
    { icon: Palette, label: "Style Guide", path: "/style-guide" },
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
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame-V163AsalyIRqbHW6Fe7OWFHHuwoL99.png"
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
              Bubble Brain
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
                  component={Link}
                  to={item.path}
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


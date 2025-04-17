"use client"

import React from "react"
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Button,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material"
import { Home, Book, Palette, Bell, Aperture, Layout, HelpCircle, Download, EllipsisVertical } from "lucide-react"
import { styled } from "@mui/material/styles"
import { useNavigate } from "react-router-dom"

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

const StyleGuideSidebar = () => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("md"))
    const [open, setOpen] = React.useState(!isMobile)

    const toggleSidebar = () => {
        setOpen(!open)
    }

    const navigate = useNavigate()

    const handleBackToHome = () => {
        navigate("/")
    }

    const scrollToSection = (id) => {
        const element = document.getElementById(id)
        if (element) {
            element.scrollIntoView({ behavior: "smooth" })
        }
    }

    const handleDownloadNavbar = () => {
        const navbarCode = `
// Your navbar code here
`

        const blob = new Blob([navbarCode], { type: "text/jsx" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = "StyleGuideSidebar.jsx"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    const navItems = [
        { icon: Home, label: "Overview", section: "overview" },
        { icon: Layout, label: "Layout", section: "layout" },
        { icon: Book, label: "Typography", section: "typography" },
        { icon: Palette, label: "Colors", section: "colors" },
        { icon: Bell, label: "Feedback", section: "feedback" },
        { icon: HelpCircle, label: "Inline Help", section: "inline-help" },
        { icon: Aperture, label: "Icons", section: "icons" },
    ]

    return (
        <StyledDrawer variant="permanent" open={open}>
            <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
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
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-0DPUYuvvKjAGrGH43l8E132YmtvjL0.png"
                            alt="Bubble Brain Logo"
                            sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                            }}
                        />
                    </Box>
                    {open && (
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
                            Style Guide
                        </Typography>
                    )}
                </Box>

                <List
                    sx={{
                        flexGrow: 1,
                        py: 2,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    }}
                >
                    {navItems.map(({ icon: Icon, label, section }) => (
                        <ListItem key={section} disablePadding sx={{ display: "flex" }}>
                            <ListItemButton
                                onClick={() => scrollToSection(section)}
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? "initial" : "center",
                                    px: 2.5,
                                    flex: 1, // Make the button take full height of ListItem
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : "auto",
                                        justifyContent: "center",
                                        color: "#1D1D20", // Set icon color to #1D1D20
                                    }}
                                >
                                    <Icon size={28} />
                                </ListItemIcon>
                                {open && (
                                    <ListItemText
                                        primary={label}
                                        primaryTypographyProps={{
                                            fontFamily: '"Sour Gummy", sans-serif',
                                            fontSize: "16px",
                                        }}
                                    />
                                )}
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>

                <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={open ? <Home size={16} /> : null}
                        onClick={handleBackToHome}
                        sx={{
                            bgcolor: "#5B8C5A",
                            "&:hover": { bgcolor: "#4A7A49" },
                            color: "white",
                            minWidth: open ? "auto" : "40px",
                            padding: open ? undefined : "6px",
                            fontSize: "16px",
                        }}
                    >
                        {open ? "Back" : <Home size={28} />}
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={open ? <Download size={16} /> : null}
                        onClick={handleDownloadNavbar}
                        sx={{
                            bgcolor: "#5B8C5A",
                            "&:hover": { bgcolor: "#4A7A49" },
                            color: "white",
                            minWidth: open ? "auto" : "40px",
                            padding: open ? undefined : "6px",
                            fontSize: "16px",
                        }}
                    >
                        {open ? "Download" : <Download size={28} />}
                    </Button>
                    <IconButton
                        onClick={toggleSidebar}
                        sx={{
                            width: open ? "auto" : 40,
                            height: 40,
                            borderRadius: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            color: "#1D1D20",
                            transition: theme.transitions.create(["width", "margin"], {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                            "&:hover": {
                                color: "#5B8C5A",
                            },
                            ...(open && {
                                width: "100%",
                                justifyContent: "flex-start",
                                px: 2,
                            }),
                        }}
                    >
                        <EllipsisVertical size={28} />
                        {open && (
                            <Typography
                                sx={{
                                    ml: 2,
                                    fontFamily: '"Sour Gummy", sans-serif',
                                    fontSize: "16px",
                                }}
                            >
                                Toggle Sidebar
                            </Typography>
                        )}
                    </IconButton>
                </Box>
            </Box>
        </StyledDrawer>
    )
}

export default StyleGuideSidebar

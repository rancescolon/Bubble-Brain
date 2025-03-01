"use client"

import { useState } from "react"
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    CardHeader,
    Button,
    Grid,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    useTheme,
    Zoom,
} from "@mui/material"
import {
    Home,
    HelpCircle,
    Download,
    ChevronDown,
    ChevronUp,
    Copy,
    MoreVertical,
    MessageSquare,
    Upload,
    Users,
    Settings,
    User,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"
import { styled } from "@mui/material/styles"
import StyleGuideSidebar from "./Sidebar"
import React from "react"

// Custom styled Component
const GradientBackground = styled(Box)(({ theme }) => ({
    background: "linear-gradient(180deg, #F4FDFF 0%, #97C7F1 100%)",
    minHeight: "100vh",
    padding: theme.spacing(4),
    fontFamily: '"Sour Gummy", sans-serif',
    transition: "none", // Disable any transitions
}))

const SectionContainer = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(16),
}))

const ColorBox = ({ color, name, hex }) => {
    const [copied, setCopied] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    const copyToClipboard = () => {
        navigator.clipboard.writeText(hex).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "7rem", position: "relative" }}>
            <Box
                sx={{
                    width: "100%",
                    height: "4rem",
                    borderRadius: 2,
                    backgroundColor: hex,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    position: "relative",
                    "&:hover": {
                        transform: "scale(1.05)",
                    },
                }}
                onClick={copyToClipboard}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: isHovered ? 1 : 0,
                        transition: "opacity 0.2s",
                    }}
                >
                    <Copy size={24} color="white" />
                </Box>
            </Box>
            <Typography variant="body2" sx={{ mt: 1, fontWeight: "medium", textAlign: "center", color: "#1D1D20" }}>
                {name}
            </Typography>
            <Typography variant="body2" sx={{ color: "#1D1D20", textAlign: "center" }}>
                {hex}
            </Typography>
            <Box
                sx={{
                    position: "absolute",
                    bottom: "-24px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    bgcolor: "#008001",
                    color: "white",
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: "0.75rem",
                    opacity: copied ? 1 : 0,
                    transition: "opacity 0.2s",
                    zIndex: 1,
                }}
            >
                Copied!
            </Box>
        </Box>
    )
}

const IconDisplay = ({ Icon, name, isLogo = false }) => {
    const [copied, setCopied] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    const handleClick = () => {
        if (isLogo) {
            const link = document.createElement("a")
            link.href = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-0DPUYuvvKjAGrGH43l8E132YmtvjL0.png"
            link.download = "bubble-brain-logo.png"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } else {
            const cssText = `<${Icon.displayName} className="w-6 h-6 cursor-pointer hover:text-[#5B8C5A] transition-colors duration-200" />`
            navigator.clipboard.writeText(cssText).then(() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            })
        }
    }

    return (
        <Box sx={{ position: "relative", pb: 4 }}>
            <Card
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 3,
                    borderRadius: 2,
                    boxShadow: 1,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                        boxShadow: 3,
                    },
                    position: "relative",
                }}
                onClick={handleClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Box sx={{ transition: "opacity 0.2s", opacity: isHovered ? 0.2 : 1 }}>
                    {isLogo ? (
                        <Box
                            component="img"
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-0DPUYuvvKjAGrGH43l8E132YmtvjL0.png"
                            alt="Bubble Brain Logo"
                            sx={{
                                width: 60,
                                height: 60,
                                mb: 2,
                                objectFit: "contain",
                            }}
                        />
                    ) : (
                        <Icon size={48} style={{ marginBottom: 16, color: "#1D1D20" }} />
                    )}
                </Box>
                <Typography variant="body2" sx={{ fontWeight: "medium", color: "#1D1D20" }}>
                    {name}
                </Typography>
                {isHovered && (
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "rgba(0, 0, 0, 0.1)",
                            borderRadius: 2,
                        }}
                    >
                        {isLogo ? <Download size={32} color="#1D1D20" /> : <Copy size={32} color="#1D1D20" />}
                    </Box>
                )}
            </Card>
            {copied && !isLogo && (
                <Box
                    sx={{
                        position: "absolute",
                        bottom: 0,
                        left: "50%",
                        transform: "translateX(-50%)",
                        px: 1,
                        py: 0.5,
                        bgcolor: "#008001",
                        color: "white",
                        fontSize: "0.75rem",
                        borderRadius: 1,
                        whiteSpace: "nowrap",
                    }}
                >
                    Copied!
                </Box>
            )}
        </Box>
    )
}

const StyleGuidePage = () => {
    const theme = useTheme()
    const [isAnimating, setIsAnimating] = useState(false)
    const [isPopped, setIsPopped] = useState(false)
    const [showParticles, setShowParticles] = useState(false)
    const [isButtonAnimating, setIsButtonAnimating] = useState(false)
    const [isShaking, setIsShaking] = useState(false)
    const [isHidden, setIsHidden] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isWiggling, setIsWiggling] = useState(false)
    const [showAllIcons, setShowAllIcons] = useState(false)

    // Typography Section Content
    const typographyExamples = [
        {
            title: "Normal Text",
            items: [
                {
                    size: "14px",
                    text: "Sour Gummy Normal",
                    className: "text-[14px] font-normal",
                    usage: " Use for normal Text, Paragraphs, captions",
                },
                {
                    size: "16px",
                    text: "Sour Gummy Normal",
                    className: "text-[16px] font-normal",
                    usage: "Use for normal text, Subheaders, body text",
                },
            ],
        },
        {
            title: "Semi Focus",
            items: [
                {
                    size: "26px",
                    text: "Sour Gummy Semi Bold",
                    className: "text-[26px] font-semibold",
                    usage: " Use for supheader or Section titles",
                },
                {
                    size: "32px",
                    text: "Sour Gummy Semi Bold",
                    className: "text-[32px] font-semibold",
                    usage: "Header3, titles",
                },
            ],
        },
        {
            title: "Focus Text",
            items: [
                {
                    size: "40px",
                    text: "Sour Gummy Extra Bold",
                    className: "text-[40px] font-extrabold",
                    usage: "Header 2, important headers",
                },
                {
                    size: "52px",
                    text: "Sour Gummy Extra Bold",
                    className: "text-[52px] font-extrabold",
                    usage: "Main titles, Header 1",
                },
            ],
        },
    ]

    // Color Sections Content
    const colorSections = [
        {
            title: "Core Colors",
            colors: [
                { name: "Dark", class: "bg-core-dark", hex: "#1D1D20" },
                { name: "Light", class: "bg-core-light", hex: "#F4FDFF" },
                { name: "Danger Red", class: "bg-red-600", hex: "#DC2626" },
                { name: "Confirm Green", class: "bg-[#48BB78]", hex: "#48BB78" },
            ],
        },
        {
            title: "Water Colors",
            colors: [
                { name: "Water 1", class: "bg-water-1", hex: "#F4FDFF" },
                { name: "Water 2", class: "bg-water-2", hex: "#1D6EF1" },
                { name: "Water 3", class: "bg-water-3", hex: "#97C7F1" },
                { name: "Water 4", class: "bg-water-4", hex: "#C5EDFD" },
            ],
        },
        {
            title: "Sea Element Colors",
            colors: [
                { name: "Sea 1", class: "bg-sea-1", hex: "#1D6EF1" },
                { name: "Sea 2", class: "bg-sea-2", hex: "#5B8C5A" },
                { name: "Sea 3", class: "bg-sea-3", hex: "#EF7B6C" },
                { name: "Sea 4", class: "bg-sea-4", hex: "#C5EDFD" },
                { name: "Sea 5", class: "bg-sea-5", hex: "#9DDCB1" },
            ],
        },
        {
            title: "Background Element Colors",
            colors: [
                { name: "Sea weed 1", class: "bg-bg-1", hex: "#5B8C5A" },
                { name: "Sea weed 2", class: "bg-bg-2", hex: "#9DDCB1" },
                { name: "Sand 1", class: "bg-bg-3", hex: "#E9D0CE" },
                { name: "Sand 2", class: "bg-bg-4", hex: "#F1DEFB" },
            ],
        },
    ]

    // Vibration function for haptic feedback
    const vibrate = (pattern) => {
        if (typeof window !== "undefined" && "vibrate" in navigator) {
            navigator.vibrate(pattern)
        }
    }

    const handlePop = () => {
        vibrate([200, 100, 200])
        setShowParticles(true)
        setIsButtonAnimating(true)
        setTimeout(() => {
            setIsPopped(true)
            setTimeout(() => {
                setShowParticles(false)
                setIsButtonAnimating(false)
                setIsShaking(true)
            }, 1000)
        }, 100)
    }

    const handleDelete = () => {
        setIsHidden(true)
        setIsPopped(false)
        setIsShaking(false)
        setIsDialogOpen(false)
    }

    const handleCancel = () => {
        setIsDialogOpen(false)
    }

    const handlePressMeToggle = () => {
        setIsWiggling((prev) => !prev)
    }

    const icons = [
        { isLogo: true, name: "Logo" },
        { icon: Home, name: "Home" },
        { icon: MessageSquare, name: "Chat" },
        { icon: Users, name: "Community" },
        { icon: Settings, name: "Settings" },
        { icon: User, name: "Profile" },
        { icon: MoreVertical, name: "More" },
        { icon: Upload, name: "Upload" },
        { icon: Download, name: "Download" },
        { icon: Copy, name: "Copy" },
        { icon: ChevronLeft, name: "Left" },
        { icon: ChevronRight, name: "Right" },
        { icon: ChevronUp, name: "Up" },
        { icon: ChevronDown, name: "Down" },
        { icon: HelpCircle, name: "Help" },
    ]

    const visibleIcons = showAllIcons ? icons : icons.slice(0, 9)

    const handleDownloadColorPalette = () => {
        const cssContent = `
/* Custom theme colors */
:root {
--core-dark: hsl(220 3% 11%);
--core-light: hsl(204 100% 98%);
--danger-red: hsl(0 84% 60%);
--confirm-green: hsl(145 55% 51%);

--water-1: hsl(204 100% 98%);
--water-2: hsl(217 86% 53%);
--water-3: hsl(208 79% 77%);
--water-4: hsl(201 82% 88%);

--sea-1: hsl(217 86% 53%);
--sea-2: hsl(120 21% 45%);
--sea-3: hsl(6 80% 68%);
--sea-4: hsl(201 82% 88%);
--sea-5: hsl(157 53% 74%);

--bg-1: hsl(120 21% 45%);
--bg-2: hsl(157 53% 74%);
--bg-3: hsl(11 47% 86%);
--bg-4: hsl(288 82% 93%);
}

/* Color Classes */
.bg-core-dark { background-color: var(--core-dark); }
.bg-core-light { background-color: var(--core-light); }
.bg-danger-red { background-color: var(--danger-red); }
.bg-confirm-green { background-color: var(--confirm-green); }

.bg-water-1 { background-color: var(--water-1); }
.bg-water-2 { background-color: var(--water-2); }
.bg-water-3 { background-color: var(--water-3); }
.bg-water-4 { background-color: var(--water-4); }

.bg-sea-1 { background-color: var(--sea-1); }
.bg-sea-2 { background-color: var(--sea-2); }
.bg-sea-3 { background-color: var(--sea-3); }
.bg-sea-4 { background-color: var(--sea-4); }
.bg-sea-5 { background-color: var(--sea-5); }

.bg-bg-1 { background-color: var(--bg-1); }
.bg-bg-2 { background-color: var(--bg-2); }
.bg-bg-3 { background-color: var(--bg-3); }
.bg-bg-4 { background-color: var(--bg-4); }
  `.trim()

        const blob = new Blob([cssContent], { type: "text/css" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = "bubble-brain-colors.css"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    const handleDownloadAllIcons = () => {
        const iconNames = icons.map((icon) => icon.name).join("\n")
        const blob = new Blob([iconNames], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = "bubble-brain-icons.txt"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    return (
        <Box sx={{ display: "flex" }}>
            <StyleGuideSidebar />
            <GradientBackground>
                <style jsx="true">{`
                    @import url('https://fonts.googleapis.com/css2?family=Sour+Gummy:wght@400;600;800&display=swap');

                    @keyframes wiggle {
                        0%, 100% { transform: rotate(-3deg); }
                        50% { transform: rotate(3deg); }
                    }

                    .animate-wiggle {
                        animation: wiggle 1s ease-in-out infinite;
                    }

                    @keyframes particle-burst {
                        0% {
                            transform: translate(0, 0) scale(0);
                            opacity: 1;
                        }
                        100% {
                            transform: translate(var(--particle-distance, 50px), 0) scale(1.5);
                            opacity: 0;
                        }
                    }

                    .animate-particle-burst {
                        animation: particle-burst 0.5s ease-out forwards;
                    }

                    @keyframes pop-and-shake {
                        0%, 100% { transform: scale(1); }
                        10% { transform: scale(1.2); }
                        20% { transform: scale(0.9); }
                        30% { transform: scale(1.1); }
                        40% { transform: scale(0.95); }
                        50% { transform: scale(1); }
                        60%, 80% { transform: translateX(-4px); }
                        70%, 90% { transform: translateX(4px); }
                    }

                    .animate-pop-and-shake {
                        animation: pop-and-shake 1s ease-in-out;
                    }

                    @keyframes continuous-shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-2px); }
                        75% { transform: translateX(2px); }
                    }

                    .animate-continuous-shake {
                        animation: continuous-shake 0.5s ease-in-out infinite;
                    }

                    @keyframes color-change {
                        0%, 100% { background-color: #5B8C5A; }
                        50% { background-color: #9DDCB1; }
                    }
                    .animate-color-change {
                        animation: color-change 4s infinite;
                    }
                `}</style>

                <Container maxWidth={false} disableGutters>
                    <Box sx={{ py: 8, px: { xs: 2, sm: 4, md: 8 } }}>
                        {/* Overview Section */}
                        <SectionContainer id="overview">
                            <Box sx={{ textAlign: "center", mb: 4 }}>
                                <Typography variant="h2" sx={{ fontSize: "40px", fontWeight: 800, color: "#1D1D20" }}>
                                    Bubble Brain Style Guide
                                </Typography>
                                <Typography variant="body1" sx={{ fontSize: "14px", color: "#1D1D20" }}>
                                    A comprehensive guide to the Bubble Brain design system and component library
                                </Typography>
                            </Box>
                        </SectionContainer>

                        {/* Layout and Navigation Section */}
                        <SectionContainer id="layout">
                            <Box sx={{ textAlign: "center", mb: 4 }}>
                                <Typography variant="h2" sx={{ fontSize: "40px", fontWeight: 800, color: "#1D1D20" }}>
                                    Layout and Navigation
                                </Typography>
                                <Typography variant="body1" sx={{ fontSize: "14px", color: "#1D1D20" }}>
                                    Guidelines for page layout and navigation structure
                                </Typography>
                            </Box>
                            <Card sx={{ bgcolor: "rgba(197, 237, 253, 0.5)", backdropFilter: "blur(4px)" }}>
                                <CardHeader
                                    title={
                                        <Typography
                                            variant="h3"
                                            sx={{ fontSize: "26px", fontWeight: 600, textAlign: "center", color: "#1D1D20" }}
                                        >
                                            Two-Column Layout
                                        </Typography>
                                    }
                                />
                                <CardContent>
                                    <Box sx={{ display: "flex" }}>
                                        <Box
                                            sx={{ width: "20%", bgcolor: "#5B8C5A", p: 2, color: "white", borderRight: "1px solid #9DDCB1" }}
                                        >
                                            Sidebar
                                        </Box>
                                        <Box sx={{ width: "80%", bgcolor: "#9DDCB1", p: 2 }}>Main Content</Box>
                                    </Box>
                                    <Typography variant="body1" sx={{ mt: 2, fontSize: "14px", color: "#1D1D20" }}>
                                        Use a two-column layout for most pages. The sidebar should contain navigation elements, while the
                                        main content area should hold the primary information or functionality.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </SectionContainer>

                        {/* Typography Section */}
                        <SectionContainer id="typography">
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mb: 1 }}>
                                <Typography variant="h2" sx={{ fontSize: "40px", fontWeight: 800, color: "#1D1D20" }}>
                                    Typography
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<Download size={16} />}
                                    sx={{
                                        bgcolor: "#5B8C5A",
                                        "&:hover": { bgcolor: "#48BB78" },
                                        color: "white",
                                    }}
                                    href="/SourGummy-VariableFont_wdth,wght.ttf"
                                    download
                                >
                                    Download Font
                                </Button>
                            </Box>
                            <Typography variant="body1" sx={{ fontSize: "14px", color: "#1D1D20", textAlign: "center", mb: 4 }}>
                                Font styles and sizes used in the Bubble Brain application
                            </Typography>

                            <Grid container spacing={4}>
                                {typographyExamples.map((section) => (
                                    <Grid item xs={12} key={section.title}>
                                        <Card sx={{ bgcolor: "rgba(197, 237, 253, 0.5)", backdropFilter: "blur(4px)" }}>
                                            <CardHeader
                                                title={
                                                    <Typography
                                                        variant="h3"
                                                        sx={{ fontSize: "26px", fontWeight: 600, textAlign: "center", color: "#1D1D20" }}
                                                    >
                                                        {section.title}
                                                    </Typography>
                                                }
                                            />
                                            <CardContent>
                                                <Grid container spacing={2}>
                                                    {section.items.map((item) => (
                                                        <Grid item xs={12} key={item.size}>
                                                            <Box sx={{ mb: 2 }}>
                                                                <Typography variant="body1" sx={{ fontSize: "14px", color: "#1D1D20", mb: 1 }}>
                                                                    {item.size} {item.text}
                                                                </Typography>
                                                                <Typography
                                                                    sx={{
                                                                        fontSize: item.size,
                                                                        fontWeight: item.className.includes("normal")
                                                                            ? 400
                                                                            : item.className.includes("semibold")
                                                                                ? 600
                                                                                : 800,
                                                                        color: "#1D1D20",
                                                                    }}
                                                                >
                                                                    Ex: The quick brown fox jumps over the lazy dog
                                                                </Typography>
                                                                <Typography variant="body1" sx={{ fontSize: "14px", color: "#1D1D20" }}>
                                                                    Usage: {item.usage}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </SectionContainer>

                        {/* Colors Section */}
                        <SectionContainer id="colors">
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                                <Typography variant="h2" sx={{ fontSize: "52px", fontWeight: 800, color: "#1D1D20" }}>
                                    Color Palette
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<Download size={16} />}
                                    sx={{
                                        bgcolor: "#5B8C5A",
                                        "&:hover": { bgcolor: "#48BB78" },
                                        color: "white",
                                    }}
                                    onClick={handleDownloadColorPalette}
                                >
                                    Download CSS
                                </Button>
                            </Box>
                            <Typography variant="body1" sx={{ fontSize: "16px", color: "#1D1D20", textAlign: "center", mb: 4 }}>
                                The color system used throughout the Bubble Brain application. Click on a color to copy its hex code.
                            </Typography>

                            <Grid container spacing={4}>
                                {colorSections.map((section) => (
                                    <Grid item xs={12} key={section.title}>
                                        <Card sx={{ bgcolor: "rgba(197, 237, 253, 0.5)", backdropFilter: "blur(4px)" }}>
                                            <CardHeader
                                                title={
                                                    <Typography
                                                        variant="h3"
                                                        sx={{ fontSize: "26px", fontWeight: 600, textAlign: "center", color: "#1D1D20" }}
                                                    >
                                                        {section.title}
                                                    </Typography>
                                                }
                                            />
                                            <CardContent>
                                                <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 4 }}>
                                                    {section.colors.map((color) => (
                                                        <ColorBox key={color.name} color={color.class} name={color.name} hex={color.hex} />
                                                    ))}
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </SectionContainer>

                        {/* Feedback Section */}
                        <SectionContainer id="feedback">
                            <Box sx={{ textAlign: "center", mb: 4 }}>
                                <Typography variant="h2" sx={{ fontSize: "40px", fontWeight: 800, color: "#1D1D20" }}>
                                    Feedback and Interactions
                                </Typography>
                                <Typography variant="body1" sx={{ fontSize: "14px", color: "#1D1D20" }}>
                                    Guidelines for providing user feedback and handling interactions
                                </Typography>
                            </Box>

                            <Grid container spacing={4}>
                                {/* Positive Feedback */}
                                <Grid item xs={12} md={6}>
                                    <Card sx={{ bgcolor: "rgba(197, 237, 253, 0.5)", backdropFilter: "blur(4px)", height: "100%" }}>
                                        <CardHeader
                                            title={
                                                <Typography
                                                    variant="h3"
                                                    sx={{ fontSize: "26px", fontWeight: 600, textAlign: "center", color: "#1D1D20" }}
                                                >
                                                    Positive Feedback
                                                </Typography>
                                            }
                                        />
                                        <CardContent
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                height: "300px",
                                            }}
                                        >
                                            <Button
                                                variant="contained"
                                                sx={{
                                                    width: "10rem",
                                                    height: "3rem",
                                                    fontSize: "1rem",
                                                    color: "#F4FDFF",
                                                    bgcolor: "#5B8C5A",
                                                    "&:hover": { bgcolor: "#48BB78" },
                                                    transition: "background-color 0.3s",
                                                }}
                                                onClick={handlePressMeToggle}
                                            >
                                                {isWiggling ? "Stop Me" : "Press Me"}
                                            </Button>

                                            <Box sx={{ width: "8rem", height: "8rem", position: "relative" }}>
                                                <Box
                                                    component="img"
                                                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-bJ5ifipsPsr4NVM3tHZh7wBe8yC0j0.png"
                                                    alt="Dr. Bubble"
                                                    sx={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "contain",
                                                        animation: isWiggling ? "wiggle 1s ease-in-out infinite" : "none",
                                                    }}
                                                />
                                            </Box>

                                            <Button
                                                variant="contained"
                                                sx={{
                                                    width: "10rem",
                                                    height: "3rem",
                                                    fontSize: "1rem",
                                                    transition: "colors",
                                                    "&:active": { transform: "scale(1.1)" },
                                                }}
                                            >
                                                Hover & Press Effect
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* Negative Feedback */}
                                <Grid item xs={12} md={6}>
                                    <Card sx={{ bgcolor: "rgba(197, 237, 253, 0.5)", backdropFilter: "blur(4px)", height: "100%" }}>
                                        <CardHeader
                                            title={
                                                <Typography
                                                    variant="h3"
                                                    sx={{ fontSize: "26px", fontWeight: 600, textAlign: "center", color: "#1D1D20" }}
                                                >
                                                    Negative Feedback
                                                </Typography>
                                            }
                                        />
                                        <CardContent
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                height: "300px",
                                            }}
                                        >
                                            <Button
                                                variant="contained"
                                                color="error"
                                                sx={{
                                                    width: "10rem",
                                                    height: "3rem",
                                                    fontSize: "1rem",
                                                    position: "relative",
                                                    color: "#F4FDFF",
                                                    overflow: "hidden",
                                                    "&::before": {
                                                        content: '""',
                                                        position: "absolute",
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        background: "rgba(255, 255, 255, 0.1)",
                                                        transform: "scale(0)",
                                                        transition: "transform 0.3s ease-out",
                                                        borderRadius: "inherit",
                                                    },
                                                    "&:hover::before": {
                                                        transform: "scale(1)",
                                                    },
                                                }}
                                                onClick={handlePop}
                                            >
                                                Don't press Me
                                            </Button>

                                            <Box sx={{ width: "8rem", height: "8rem", position: "relative" }}>
                                                <Box
                                                    sx={{
                                                        position: "absolute",
                                                        inset: 0,
                                                        pointerEvents: "none",
                                                        "& > div": {
                                                            position: "absolute",
                                                            width: "0.5rem",
                                                            height: "0.5rem",
                                                            bgcolor: "#C5EDFD",
                                                            borderRadius: "50%",
                                                            left: "50%",
                                                            top: "50%",
                                                        },
                                                    }}
                                                >
                                                    {Array.from({ length: 8 }).map((_, i) => (
                                                        <Box
                                                            key={i}
                                                            sx={{
                                                                transform: `rotate(${i * 45}deg) translateX(${showParticles ? "50px" : "0px"})`,
                                                                transition: "transform 0.5s ease-out, opacity 0.5s ease-out",
                                                                opacity: showParticles ? 1 : 0,
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                                <Box
                                                    sx={{
                                                        position: "absolute",
                                                        inset: 0,
                                                        transition: "all 0.3s",
                                                        animation: isHidden
                                                            ? "none"
                                                            : isButtonAnimating
                                                                ? "pop-and-shake 1s ease-in-out"
                                                                : isShaking
                                                                    ? "continuous-shake 0.5s ease-in-out infinite"
                                                                    : "none",
                                                        opacity: isHidden ? 0 : 1,
                                                        pointerEvents: isHidden ? "none" : "auto",
                                                    }}
                                                >
                                                    <Box
                                                        component="img"
                                                        src={
                                                            isPopped
                                                                ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Adobe%20Express%20-%20file%20(1)-ApA6Dza4X91X2JTDfTXMvxy4e4fzqF.png"
                                                                : "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-bJ5ifipsPsr4NVM3tHZh7wBe8yC0j0.png"
                                                        }
                                                        alt="Dr. Bubble"
                                                        sx={{ width: "100%", height: "100%", objectFit: "contain" }}
                                                    />
                                                </Box>
                                            </Box>

                                            <Button
                                                variant="contained"
                                                sx={{
                                                    width: "10rem",
                                                    height: "3rem",
                                                    fontSize: "1rem",
                                                    bgcolor: "#1D1D20",
                                                    "&:hover": { bgcolor: "#DC2626" },
                                                }}
                                                onClick={() => setIsDialogOpen(true)}
                                            >
                                                Delete Item
                                            </Button>
                                            <Dialog
                                                open={isDialogOpen}
                                                onClose={() => setIsDialogOpen(false)}
                                                PaperProps={{
                                                    sx: { bgcolor: "#F4FDFF", color: "#1D1D20" },
                                                }}
                                            >
                                                <DialogTitle sx={{ color: "#1D1D20" }}>Are you sure?</DialogTitle>
                                                <DialogContent>
                                                    <DialogContentText sx={{ color: "#1D1D20" }}>This action cannot be undone.</DialogContentText>
                                                </DialogContent>
                                                <DialogActions>
                                                    <Button onClick={handleCancel} variant="outlined" sx={{ color: "#1D1D20" }}>
                                                        Cancel
                                                    </Button>
                                                    <Button onClick={handleDelete} variant="contained" color="error" sx={{ color: "#F4FDFF" }}>
                                                        Delete
                                                    </Button>
                                                </DialogActions>
                                            </Dialog>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>

                            {/* Modal Guidelines */}
                            <Card sx={{ bgcolor: "rgba(197, 237, 253, 0.5)", backdropFilter: "blur(4px)", mt: 4 }}>
                                <CardHeader
                                    title={
                                        <Typography
                                            variant="h3"
                                            sx={{ fontSize: "26px", fontWeight: 600, textAlign: "center", color: "#1D1D20" }}
                                        >
                                            Modal Guidelines
                                        </Typography>
                                    }
                                />
                                <CardContent>
                                    <Typography variant="body1" sx={{ fontSize: "14px", color: "#1D1D20", mb: 2 }}>
                                        Modals should be centered on the screen with a maximum width of 500px and a minimum width of 300px.
                                        They should have a semi-transparent backdrop to focus attention on the modal content.
                                    </Typography>
                                    <Button variant="contained" onClick={() => setIsDialogOpen(true)}>
                                        Open Example Modal
                                    </Button>
                                </CardContent>
                            </Card>
                        </SectionContainer>

                        {/* Inline Help */}
                        <SectionContainer id="inline-help">
                            <Box sx={{ textAlign: "center", mb: 4 }}>
                                <Typography variant="h2" sx={{ fontSize: "40px", fontWeight: 800, color: "#1D1D20" }}>
                                    Inline Help
                                </Typography>
                                <Typography variant="body1" sx={{ fontSize: "14px", color: "#1D1D20" }}>
                                    Guidelines for providing inline help and tooltips
                                </Typography>
                            </Box>

                            <Card sx={{ bgcolor: "rgba(197, 237, 253, 0.5)", backdropFilter: "blur(4px)" }}>
                                <CardHeader
                                    title={
                                        <Typography
                                            variant="h3"
                                            sx={{ fontSize: "26px", fontWeight: 600, textAlign: "center", color: "#1D1D20" }}
                                        >
                                            Tooltip Example
                                        </Typography>
                                    }
                                />
                                <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                                    <Tooltip
                                        title={
                                            <React.Fragment>
                                                <Typography color="inherit">Tooltip with HTML</Typography>
                                                <em>{"And here's"}</em> <b>{"some"}</b> <u>{"amazing content"}</u>.{" "}
                                                {"It's very engaging. Right?"}
                                            </React.Fragment>
                                        }
                                        arrow
                                        placement="top"
                                        TransitionComponent={Zoom}
                                    >
                                        <Button
                                            variant="outlined"
                                            sx={{
                                                "&:hover": {
                                                    backgroundColor: "rgba(25, 118, 210, 0.04)",
                                                    transform: "scale(1.05)",
                                                    transition: "transform 0.3s",
                                                },
                                            }}
                                        >
                                            Hover for Interactive Help
                                        </Button>
                                    </Tooltip>
                                    <Typography
                                        variant="body1"
                                        sx={{ fontSize: "14px", color: "#1D1D20", textAlign: "center", maxWidth: "md" }}
                                    >
                                        Use tooltips for short, helpful information. They should appear on hover and be concise. For longer
                                        explanations, consider using an info icon that opens a modal with more details.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </SectionContainer>

                        {/* Icons Section */}
                        <SectionContainer id="icons">
                            <Box sx={{ textAlign: "center", mb: 4 }}>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                                    <Typography variant="h2" sx={{ fontSize: "52px", fontWeight: 800, color: "#1D1D20" }}>
                                        Icons
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={<Download size={16} />}
                                        sx={{
                                            bgcolor: "#5B8C5A",
                                            "&:hover": { bgcolor: "#48BB78" },
                                            color: "white",
                                        }}
                                        onClick={handleDownloadAllIcons}
                                    >
                                        Download All
                                    </Button>
                                </Box>
                                <Typography variant="body1" sx={{ fontSize: "16px", color: "#1D1D20", mt: 2 }}>
                                    Icons used throughout the Bubble Brain application. Hover and click on an icon to copy its CSS. Click
                                    on the logo to download it.
                                </Typography>
                            </Box>

                            <Card sx={{ bgcolor: "rgba(197, 237, 253, 0.5)", backdropFilter: "blur(4px)", p: 4 }}>
                                <CardHeader
                                    title={
                                        <Typography
                                            variant="h3"
                                            sx={{ fontSize: "32px", fontWeight: 600, textAlign: "center", color: "#1D1D20" }}
                                        >
                                            Lucide Icons
                                        </Typography>
                                    }
                                />
                                <CardContent>
                                    <Grid container spacing={4}>
                                        {visibleIcons.map((icon, index) => (
                                            <Grid item xs={12} sm={6} md={4} key={index}>
                                                <IconDisplay Icon={icon.icon} name={icon.name} isLogo={icon.isLogo} />
                                            </Grid>
                                        ))}
                                    </Grid>
                                    {icons.length > 9 && (
                                        <Box sx={{ mt: 4, textAlign: "center" }}>
                                            <Button
                                                variant="contained"
                                                startIcon={showAllIcons ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                sx={{
                                                    bgcolor: "#5B8C5A",
                                                    "&:hover": { bgcolor: "#48BB78" },
                                                    color: "white",
                                                }}
                                                onClick={() => setShowAllIcons(!showAllIcons)}
                                            >
                                                {showAllIcons ? "See Less" : "See More"}
                                            </Button>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </SectionContainer>
                    </Box>
                </Container>
            </GradientBackground>
        </Box>
    )
}

export default StyleGuidePage


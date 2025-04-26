"use client"

import { useState } from "react"
import { Box, Container, Typography, Card, CardContent, Button, Grid } from "@mui/material"
import { Globe, Check } from "lucide-react"
import { styled } from "@mui/material/styles"
import { useNavigate } from "react-router-dom"

// Custom styled Component
const GradientBackground = styled(Box)(({ theme }) => ({
    background: "linear-gradient(180deg, #F4FDFF 0%, #97C7F1 100%)",
    minHeight: "100vh",
    padding: theme.spacing(4),
    fontFamily: '"Sour Gummy", sans-serif',
    transition: "none", // Disable any transitions
}))

const LanguageCard = ({ language, flag, onClick, isSelected }) => {
    console.log("on language page")
    const [isHovered, setIsHovered] = useState(false)

    return (
        <Card
            sx={{
                bgcolor: isSelected ? "rgba(91, 140, 90, 0.2)" : "rgba(197, 237, 253, 0.5)",
                backdropFilter: "blur(4px)",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                position: "relative",
                overflow: "hidden",
                border: isSelected ? "2px solid #5B8C5A" : "none",
                "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 3,
                },
            }}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography variant="h3" sx={{ fontSize: "26px", fontWeight: 600, color: "#1D1D20" }}>
                        {language}
                    </Typography>
                    {isSelected && (
                        <Box sx={{ ml: "auto" }}>
                            <Check size={24} color="#5B8C5A" />
                        </Box>
                    )}
                </Box>

                {isHovered && !isSelected && (
                    <Box
                        sx={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: "4px",
                            bgcolor: "#5B8C5A",
                            animation: "color-change 4s infinite",
                        }}
                    />
                )}
            </CardContent>
        </Card>
    )
}

const LanguageSelectionPage = ({ language, setLanguage }) => {
    const navigate = useNavigate()
    const [isWiggling, setIsWiggling] = useState(false)

    // Translations for UI text - expanded to include notification messages
    const translations = {
        English: {
            pageTitle: "Choose Your Language",
            pageSubtitle: "Select your preferred language for the Bubble Brain experience",
            continueButton: "Continue with English",
            successNotification: "Language set to English successfully!",
            closeButton: "✕",
            redirectingMessage: "Redirecting to home page...",
        },
        Español: {
            pageTitle: "Elige tu idioma",
            pageSubtitle: "Selecciona tu idioma preferido para la experiencia Bubble Brain",
            continueButton: "Continuar en Español",
            successNotification: "¡Español elegido para el Idioma!",
            closeButton: "✕",
            redirectingMessage: "Redirigiendo a la página principal...",
        },
    }

    // Get current translations based on selected language
    const currentTranslations = translations[language]

    // Simplified to only include English and Spanish
    const languages = [{ language: "English" }, { language: "Español" }]

    const handleLanguageSelect = (language) => {
        setLanguage(language)
        // Trigger wiggle animation on logo
        setIsWiggling(true)
        setTimeout(() => setIsWiggling(false), 1000)
    }

    // Add this state for controlling the notification visibility
    const [showNotification, setShowNotification] = useState(false)
    const [notificationMessage, setNotificationMessage] = useState("")
    const [isRedirecting, setIsRedirecting] = useState(false)

    const handleContinue = () => {
        // Save the selected language to localStorage
        localStorage.setItem("selectedLanguage", language)

        // Show the success notification
        setNotificationMessage(currentTranslations.successNotification)
        setShowNotification(true)

        // After a short delay, update the notification to show redirecting message
        setTimeout(() => {
            setNotificationMessage(currentTranslations.redirectingMessage)
            setIsRedirecting(true)

            // After another short delay, redirect to home page
            setTimeout(() => {
                navigate("/")
            }, 1500)
        }, 1500)
    }

    // Updated notification component to use translated messages
    const SuccessNotification = () => {
        if (!showNotification) return null

        return (
            <Box
                sx={{
                    position: "fixed",
                    top: "20px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "90%",
                    maxWidth: "400px",
                    bgcolor: "rgba(220, 243, 232, 0.95)",
                    borderRadius: "4px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 16px",
                    zIndex: 9999,
                    border: "1px solid #c3e6d3",
                    animation: "slideDown 0.3s ease-out",
                }}
            >
                <Check size={20} color="#5B8C5A" style={{ marginRight: "8px" }} />
                <Typography sx={{ color: "#2d5a2d", flexGrow: 1 }}>{notificationMessage}</Typography>
                {!isRedirecting && (
                    <Button
                        onClick={() => setShowNotification(false)}
                        sx={{
                            minWidth: "auto",
                            p: 0,
                            color: "#5B8C5A",
                            "&:hover": { bgcolor: "transparent" },
                        }}
                    >
                        {currentTranslations.closeButton}
                    </Button>
                )}
            </Box>
        )
    }

    return (
        <GradientBackground>
            <SuccessNotification />
            <style jsx="true">{`
                @import url('https://fonts.googleapis.com/css2?family=Sour+Gummy:wght@400;600;800&display=swap');

                @keyframes wiggle {
                    0%,
                    100% {
                        transform: rotate(-3deg);
                    }
                    50% {
                        transform: rotate(3deg);
                    }
                }

                .animate-wiggle {
                    animation: wiggle 1s ease-in-out;
                }

                @keyframes color-change {
                    0%,
                    100% {
                        background-color: #5B8C5A;
                    }
                    50% {
                        background-color: #9DDCB1;
                    }
                }
                .animate-color-change {
                    animation: color-change 4s infinite;
                }

                @keyframes slideDown {
                    from {
                        transform: translate(-50%, -20px);
                        opacity: 0;
                    }
                    to {
                        transform: translate(-50%, 0);
                        opacity: 1;
                    }
                }
            `}</style>

            <Container maxWidth="md">
                <Box sx={{ py: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {/* Logo and Title */}
                    <Box
                        sx={{
                            textAlign: "center",
                            mb: 6,
                            position: "relative",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h1" sx={{ fontSize: "52px", fontWeight: 800, color: "#1D1D20" }}>
                            {currentTranslations.pageTitle}
                        </Typography>
                        <Typography variant="body1" sx={{ fontSize: "16px", color: "#1D1D20", mt: 1 }}>
                            {currentTranslations.pageSubtitle}
                        </Typography>
                    </Box>

                    {/* Language Selection Grid - Centered with only two options */}
                    <Grid container spacing={4} sx={{ mb: 6, justifyContent: "center" }}>
                        {languages.map((lang) => (
                            <Grid item xs={12} sm={6} md={5} key={lang.language}>
                                <LanguageCard
                                    language={lang.language}
                                    flag={lang.flag}
                                    isSelected={language === lang.language}
                                    onClick={() => handleLanguageSelect(lang.language)}
                                />
                            </Grid>
                        ))}
                    </Grid>

                    {/* Continue Button */}
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<Globe size={16} />}
                            onClick={handleContinue}
                            sx={{
                                bgcolor: "#5B8C5A",
                                "&:hover": { bgcolor: "#48BB78" },
                                color: "white",
                                px: 4,
                                py: 1.5,
                                fontSize: "16px",
                                fontWeight: 600,
                                transition: "transform 0.2s",
                                "&:active": { transform: "scale(0.98)" },
                            }}
                        >
                            {currentTranslations.continueButton}
                        </Button>
                    </Box>
                </Box>
            </Container>
        </GradientBackground>
    )
}

export default LanguageSelectionPage

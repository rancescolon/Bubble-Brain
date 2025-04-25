"use client"

import { useState, useEffect, useRef, useContext } from "react"
import { useNavigate } from "react-router-dom"
import {
    Box,
    Typography,
    Button,
    Container,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    Snackbar,
    Alert,
} from "@mui/material"
import { Check } from "lucide-react"
import background from "../assets/image3.png"
import { useShop } from "../Context/ShopContext"
import { BackgroundContext } from "../App"
import { getSelectedLanguage } from "../App"
import text from "../text.json"

// Using the same categories from the tag selector
const CATEGORIES = [
    "Math",
    "Science",
    "Literature",
    "History",
    "Geography",
    "Foreign Languages",
    "Art",
    "Music",
    "Physical Education",
    "Technology",
    "Business Studies",
    "Philosophy",
    "Psychology",
    "Sociology",
    "Economics",
    "Health Education",
    "Home Economics",
    "Public Speaking",
    "Technology & Engineering",
    "Debate",
    "Environmental Science",
    "Theatre",
    "Law",
    "Education",
    "Career Development",
]

const CategorySelector = () => {
    const { currentBackground, language } = useContext(BackgroundContext);
    const langKey = language === "English" ? "en" : "es";
    const categoryText = text[langKey].categorySelection;

    const [selectedCategories, setSelectedCategories] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const navigate = useNavigate()
    const maxCategories = 5

    // Get shop data refresh function
    const { refreshUserData, userId } = useShop()
    const hasRefreshedRef = useRef(false)

    // Add effect to refresh skin data
    useEffect(() => {
        // This ensures the skin data is refreshed when the category selection component mounts
        const refreshSkinData = async () => {
            if (!hasRefreshedRef.current && userId) {
                console.log("[CategorySelection] Refreshing skin data on initial load")
                hasRefreshedRef.current = true

                try {
                    const success = await refreshUserData()
                    if (success) {
                        console.log("[CategorySelection] Successfully refreshed skin data")
                    } else {
                        console.warn("[CategorySelection] Failed to refresh skin data")
                    }
                } catch (err) {
                    console.error("[CategorySelection] Error refreshing skin data:", err)
                }
            }
        }

        refreshSkinData()
    }, [refreshUserData, userId])

    useEffect(() => {
        // Check if user is logged in
        const token = sessionStorage.getItem("token")
        const userId = sessionStorage.getItem("user")

        if (!token || !userId) {
            console.log("[CategorySelection] Refreshing skin data on initial load")
            // navigate("/login")
            return
        }

        // Check if user already has category badges
        checkExistingBadges()
    }, [navigate])

    const checkExistingBadges = async () => {
        setIsLoading(true)
        const token = sessionStorage.getItem("token")
        const userId = sessionStorage.getItem("user")

        try {
            // Fetch user badges
            const response = await fetch(`${process.env.REACT_APP_API_PATH}/user-badge?userID=${userId}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                throw new Error("Failed to fetch user badges")
            }

            const data = await response.json()

            // Check if user has any category badges
            if (data && data[0] && data[0].length > 0) {
                // Extract category names from badge attributes
                const categoryBadges = data[0].filter((badge) => badge.attributes && badge.attributes.type === "category")

                if (categoryBadges.length > 0) {
                    // User already has category badges, redirect to home
                    navigate("/")
                    return
                }
            }

            setIsLoading(false)
        } catch (error) {
            console.error("Error checking badges:", error)
            setIsLoading(false)
        }
    }

    const handleCategorySelection = (category) => {
        if (selectedCategories.includes(category)) {
            // Remove category
            setSelectedCategories(selectedCategories.filter((c) => c !== category))
        } else if (selectedCategories.length < maxCategories) {
            // Add category
            setSelectedCategories([...selectedCategories, category])
        }
    }

    const handleSaveCategories = async () => {
        if (selectedCategories.length === 0) {
            setError(categoryText.error.selectAtLeastOne)
            return
        }

        setIsSaving(true)
        setError(null)

        const token = sessionStorage.getItem("token")
        const userId = sessionStorage.getItem("user")

        try {
            // Create badges for each selected category
            const badgePromises = selectedCategories.map(async (category) => {
                // First check if badge exists for this category
                const badgeResponse = await fetch(
                    `${process.env.REACT_APP_API_PATH}/badge?name=${encodeURIComponent(category)}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                )

                const badgeData = await badgeResponse.json()
                let badgeId

                // If badge doesn't exist, create it
                if (!badgeData || !badgeData[0] || badgeData[0].length === 0) {
                    const createBadgeResponse = await fetch(`${process.env.REACT_APP_API_PATH}/badge`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            name: category,
                            description: `Interest in ${category}`,
                            attributes: {
                                type: "category",
                                visible: false,
                            },
                        }),
                    })

                    if (!createBadgeResponse.ok) {
                        throw new Error(`Failed to create badge for ${category}`)
                    }

                    const newBadge = await createBadgeResponse.json()
                    badgeId = newBadge.id
                } else {
                    // Use existing badge
                    badgeId = badgeData[0][0].id
                }

                // Assign badge to user
                const assignBadgeResponse = await fetch(`${process.env.REACT_APP_API_PATH}/user-badge`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        userID: userId,
                        badgeID: badgeId,
                        attributes: {
                            type: "category",
                            category: category,
                        },
                    }),
                })

                if (!assignBadgeResponse.ok) {
                    throw new Error(`Failed to assign ${category} badge to user`)
                }

                return assignBadgeResponse.json()
            })

            // Wait for all badges to be created and assigned
            await Promise.all(badgePromises)

            setSuccess(true)

            // Refresh skin data one more time before redirecting to ensure it's properly loaded
            try {
                console.log("[CategorySelection] Final skin data refresh before redirect")
                await refreshUserData()
            } catch (err) {
                console.warn("[CategorySelection] Error in final skin refresh:", err)
                // Continue with redirect even if refresh fails
            }

            // Redirect to home page after a short delay and force page refresh
            setTimeout(() => {
                console.log("[CategorySelection] Redirecting to home page after saving categories")
                // First navigate to home
                navigate("/")
                // Then force a page refresh
                window.location.reload(true)
            }, 1500)
        } catch (error) {
            console.error("Error saving categories:", error)
            setError("Failed to save your categories. Please try again.")
        } finally {
            setIsSaving(false)
        }
    }

    const handleSkip = async () => {
        // Refresh skin data before navigating to home
        try {
            console.log("[CategorySelection] Refreshing skin data before skipping to homepage")
            await refreshUserData()
        } catch (err) {
            console.warn("[CategorySelection] Error refreshing skin data during skip:", err)
            // Continue with redirect even if refresh fails
        }

        // Redirect to home page and force page refresh
        navigate("/")
        window.location.reload(true)
    }

    if (isLoading) {
        return (
            <Box
                sx={{
                    flexGrow: 1,
                    bgcolor: "#1D1D20",
                    minHeight: "100vh",
                    backgroundImage: `url(${background})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    opacity: 1.0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <CircularProgress sx={{ color: "#FFFFFF" }} />
            </Box>
        )
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundImage: `url(${background})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
                py: 8,
            }}
        >
            <Container maxWidth="md">
                <Card sx={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}>
                    <CardContent>
                        <Typography variant="h4" component="h1" gutterBottom align="center">
                            {categoryText.title}
                        </Typography>
                        <Typography variant="body1" paragraph align="center">
                            {categoryText.subtitle}
                        </Typography>

                        {isLoading ? (
                            <Box display="flex" justifyContent="center" my={4}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Grid container spacing={2}>
                                {CATEGORIES.map((category) => (
                                    <Grid item xs={12} sm={6} md={4} key={category}>
                                        <Button
                                            fullWidth
                                            variant={selectedCategories.includes(category) ? "contained" : "outlined"}
                                            onClick={() => handleCategorySelection(category)}
                                            disabled={!selectedCategories.includes(category) && selectedCategories.length >= maxCategories}
                                            sx={{ mb: 1 }}
                                        >
                                            {category}
                                            {selectedCategories.includes(category) && <Check size={20} style={{ marginLeft: 8 }} />}
                                        </Button>
                                    </Grid>
                                ))}
                            </Grid>
                        )}

                        <Box display="flex" justifyContent="center" mt={4} gap={2}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSaveCategories}
                                disabled={isSaving || selectedCategories.length === 0}
                            >
                                {isSaving ? <CircularProgress size={24} /> : categoryText.saveButton}
                            </Button>
                            <Button variant="outlined" onClick={handleSkip}>
                                {categoryText.skipButton}
                            </Button>
                        </Box>

                        {error && (
                            <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
                                <Alert onClose={() => setError(null)} severity="error" sx={{ width: "100%" }}>
                                    {error}
                                </Alert>
                            </Snackbar>
                        )}

                        {success && (
                            <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)}>
                                <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: "100%" }}>
                                    {categoryText.successMessage}
                                </Alert>
                            </Snackbar>
                        )}
                    </CardContent>
                </Card>
            </Container>
        </Box>
    )
}

export default CategorySelector

"use client"

import { useState, useEffect } from "react"
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
    const [selectedCategories, setSelectedCategories] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const navigate = useNavigate()
    const maxCategories = 5

    useEffect(() => {
        // Check if user is logged in
        const token = sessionStorage.getItem("token")
        const userId = sessionStorage.getItem("user")

        if (!token || !userId) {
            navigate("/login")
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
            setError("Please select at least one category")
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

            // Redirect to home page after a short delay
            setTimeout(() => {
                navigate("/")
            }, 1500)
        } catch (error) {
            console.error("Error saving categories:", error)
            setError("Failed to save your categories. Please try again.")
        } finally {
            setIsSaving(false)
        }
    }

    const handleSkip = () => {
        // Redirect to home page
        navigate("/")
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
                flexGrow: 1,
                bgcolor: "#1D1D20",
                minHeight: "100vh",
                backgroundImage: `url(${background})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                opacity: 1.0,
            }}
        >
            <Container
                maxWidth="md"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "100vh",
                    py: 4,
                }}
            >
                <Box
                    sx={{
                        bgcolor: "#FFFFFF",
                        py: 8,
                        px: 4,
                        width: "100%",
                        borderRadius: 2,
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                >
                    <Typography
                        variant="h2"
                        align="center"
                        color="#1D1D20"
                        gutterBottom
                        sx={{
                            fontFamily: "SourGummy, sans-serif",
                            fontWeight: 800,
                            fontSize: "42px",
                        }}
                    >
                        Choose Your Interests
                    </Typography>
                    <Typography
                        variant="h5"
                        align="center"
                        color="#1D1D20"
                        paragraph
                        sx={{
                            fontFamily: "SourGummy, sans-serif",
                            fontWeight: 600,
                            fontSize: "22px",
                            mb: 4,
                        }}
                    >
                        Select up to {maxCategories} categories that interest you
                    </Typography>

                    <Typography
                        variant="body1"
                        align="center"
                        color="#1D1D20"
                        paragraph
                        sx={{
                            fontFamily: "SourGummy, sans-serif",
                            fontWeight: 500,
                            fontSize: "16px",
                            mb: 4,
                        }}
                    >
                        This helps us personalize your experience and show you relevant content
                    </Typography>

                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        {CATEGORIES.map((category) => (
                            <Grid item xs={6} sm={4} md={3} key={category}>
                                <Card
                                    onClick={() => handleCategorySelection(category)}
                                    sx={{
                                        cursor: "pointer",
                                        bgcolor: selectedCategories.includes(category) ? "#1D6EF1" : "#F4FDFF",
                                        color: selectedCategories.includes(category) ? "white" : "#1D1D20",
                                        border: selectedCategories.includes(category) ? "2px solid #1D6EF1" : "2px solid #E9D0CE",
                                        borderRadius: 2,
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                            transform: "translateY(-2px)",
                                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                                        },
                                        position: "relative",
                                        height: "100%",
                                        opacity:
                                            selectedCategories.length >= maxCategories && !selectedCategories.includes(category) ? 0.5 : 1,
                                    }}
                                >
                                    <CardContent sx={{ p: 2, textAlign: "center" }}>
                                        <Typography
                                            sx={{
                                                fontFamily: "SourGummy, sans-serif",
                                                fontWeight: 600,
                                                fontSize: "14px",
                                            }}
                                        >
                                            {category}
                                        </Typography>
                                        {selectedCategories.includes(category) && (
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    top: 8,
                                                    right: 8,
                                                    bgcolor: "white",
                                                    borderRadius: "50%",
                                                    width: 20,
                                                    height: 20,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <Check size={14} color="#1D6EF1" />
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
                        <Button
                            onClick={handleSkip}
                            sx={{
                                fontFamily: "SourGummy, sans-serif",
                                fontWeight: 600,
                                fontSize: "16px",
                                color: "#1D1D20",
                                "&:hover": {
                                    bgcolor: "rgba(29, 29, 32, 0.05)",
                                },
                            }}
                        >
                            Skip for Now
                        </Button>
                        <Button
                            onClick={handleSaveCategories}
                            disabled={selectedCategories.length === 0 || isSaving}
                            sx={{
                                bgcolor: "#EF7B6C",
                                "&:hover": {
                                    bgcolor: "#e66a59",
                                },
                                fontFamily: "SourGummy, sans-serif",
                                fontWeight: 600,
                                fontSize: "16px",
                                color: "#F4FDFF",
                                px: 4,
                                py: 1,
                            }}
                        >
                            {isSaving ? "Saving..." : "Save Preferences"}
                        </Button>
                    </Box>

                    <Box sx={{ mt: 2, textAlign: "center" }}>
                        <Typography
                            variant="body2"
                            color="#1D1D20"
                            sx={{
                                fontFamily: "SourGummy, sans-serif",
                                fontWeight: 500,
                                fontSize: "14px",
                            }}
                        >
                            Selected: {selectedCategories.length}/{maxCategories}
                        </Typography>
                    </Box>
                </Box>
            </Container>

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert onClose={() => setError(null)} severity="error" sx={{ width: "100%" }}>
                    {error}
                </Alert>
            </Snackbar>

            <Snackbar
                open={success}
                autoHideDuration={6000}
                onClose={() => setSuccess(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: "100%" }}>
                    Preferences saved successfully!
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default CategorySelector


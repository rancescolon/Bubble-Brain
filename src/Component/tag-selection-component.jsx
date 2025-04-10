"use client"

import { useState, useEffect } from "react"
import { Box, Typography, Chip, Grid, Button } from "@mui/material"

/**
 * A reusable component for selecting categories and tags
 *
 * @param {Object} props - Component props
 * @param {Object} props.categories - Object containing categories and their tags
 * @param {Function} props.onSave - Function called when saving selections
 * @param {Function} props.onCancel - Function called when canceling
 * @param {number} props.maxCategories - Maximum number of categories that can be selected
 * @param {number} props.maxTags - Maximum number of tags that can be selected
 * @param {Array} props.initialCategories - Initially selected categories
 * @param {Array} props.initialTags - Initially selected tags
 */
const TagSelectionComponent = ({
                                   categories,
                                   onSave,
                                   onCancel,
                                   maxCategories = 3,
                                   maxTags = 5,
                                   initialCategories = [],
                                   initialTags = [],
                               }) => {
    const [selectedCategories, setSelectedCategories] = useState(initialCategories)
    const [selectedTags, setSelectedTags] = useState(initialTags)
    const [error, setError] = useState(null)

    // Initialize with initial values when they change
    useEffect(() => {
        setSelectedCategories(initialCategories)
        setSelectedTags(initialTags)
    }, [initialCategories, initialTags])

    const handleCategorySelect = (category) => {
        setSelectedCategories((prev) => {
            // If already selected, remove it
            if (prev.includes(category)) {
                const newCategories = prev.filter((c) => c !== category)
                // Also remove any tags from this category
                setSelectedTags((prevTags) => prevTags.filter((tag) => !categories[category].includes(tag)))
                return newCategories
            }
            // If not selected and we have less than max, add it
            else if (prev.length < maxCategories) {
                return [...prev, category]
            }
            // If we already have max categories, show an error
            else {
                setError(`You can select up to ${maxCategories} categories`)
                setTimeout(() => setError(null), 3000)
                return prev
            }
        })
    }

    const handleTagSelect = (tag) => {
        setSelectedTags((prev) => {
            // If already selected, remove it
            if (prev.includes(tag)) {
                return prev.filter((t) => t !== tag)
            }
            // If not selected and we have less than max, add it
            else if (prev.length < maxTags) {
                return [...prev, tag]
            }
            // If we already have max tags, show an error
            else {
                setError(`You can select up to ${maxTags} tags`)
                setTimeout(() => setError(null), 3000)
                return prev
            }
        })
    }

    const handleSave = () => {
        if (selectedCategories.length === 0) {
            setError("Please select at least one category")
            setTimeout(() => setError(null), 3000)
            return
        }
        onSave(selectedCategories, selectedTags)
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography
                variant="h6"
                sx={{
                    fontFamily: "SourGummy, sans-serif",
                    mb: 2,
                }}
            >
                Select Categories (up to {maxCategories})
            </Typography>

            <Box sx={{ mb: 4 }}>
                <Grid container spacing={1}>
                    {Object.keys(categories).map((category) => (
                        <Grid item key={category}>
                            <Chip
                                label={category}
                                onClick={() => handleCategorySelect(category)}
                                color={selectedCategories.includes(category) ? "primary" : "default"}
                                sx={{
                                    fontFamily: "SourGummy, sans-serif",
                                    m: 0.5,
                                    bgcolor: selectedCategories.includes(category) ? "#1D6EF1" : "#F4FDFF",
                                    color: selectedCategories.includes(category) ? "white" : "#1D1D20",
                                    "&:hover": {
                                        bgcolor: selectedCategories.includes(category) ? "#1557B0" : "#E9ECEF",
                                    },
                                }}
                            />
                        </Grid>
                    ))}
                </Grid>
                <Typography variant="caption" sx={{ display: "block", mt: 1, fontFamily: "SourGummy, sans-serif" }}>
                    Selected: {selectedCategories.length}/{maxCategories}
                </Typography>
            </Box>

            {selectedCategories.length > 0 && (
                <>
                    <Typography
                        variant="h6"
                        sx={{
                            fontFamily: "SourGummy, sans-serif",
                            mb: 2,
                        }}
                    >
                        Select Tags (up to {maxTags})
                    </Typography>

                    <Box sx={{ mb: 4 }}>
                        {selectedCategories.map((category) => (
                            <Box key={category} sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontFamily: "SourGummy, sans-serif", mb: 1 }}>
                                    {category} Tags:
                                </Typography>
                                <Grid container spacing={1}>
                                    {categories[category].map((tag) => (
                                        <Grid item key={tag}>
                                            <Chip
                                                label={tag}
                                                onClick={() => handleTagSelect(tag)}
                                                color={selectedTags.includes(tag) ? "primary" : "default"}
                                                size="small"
                                                sx={{
                                                    fontFamily: "SourGummy, sans-serif",
                                                    m: 0.5,
                                                    bgcolor: selectedTags.includes(tag) ? "#1D6EF1" : "#F4FDFF",
                                                    color: selectedTags.includes(tag) ? "white" : "#1D1D20",
                                                    "&:hover": {
                                                        bgcolor: selectedTags.includes(tag) ? "#1557B0" : "#E9ECEF",
                                                    },
                                                }}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        ))}
                        <Typography variant="caption" sx={{ display: "block", mt: 1, fontFamily: "SourGummy, sans-serif" }}>
                            Selected: {selectedTags.length}/{maxTags}
                        </Typography>
                    </Box>
                </>
            )}

            {error && (
                <Typography
                    color="error"
                    sx={{
                        mb: 2,
                        fontFamily: "SourGummy, sans-serif",
                        fontSize: "0.875rem",
                    }}
                >
                    {error}
                </Typography>
            )}

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
                <Button
                    variant="outlined"
                    onClick={onCancel}
                    sx={{
                        fontFamily: "SourGummy, sans-serif",
                    }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={selectedCategories.length === 0}
                    sx={{
                        bgcolor: "#1D6EF1",
                        "&:hover": {
                            bgcolor: "#1557B0",
                        },
                        fontFamily: "SourGummy, sans-serif",
                    }}
                >
                    Save Tags
                </Button>
            </Box>
        </Box>
    )
}

export default TagSelectionComponent

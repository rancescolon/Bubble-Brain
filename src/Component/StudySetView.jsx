"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Container,
  CircularProgress,
  Alert,
  Grid,
  TextField,
  Avatar,
  Divider,
  Menu,
  MenuItem,
  Snackbar,
} from "@mui/material"
import { ArrowLeft, Share2, Edit2, Trash2 } from "lucide-react"
import background from "../assets/image3.png"

const API_BASE_URL = "https://webdev.cse.buffalo.edu/hci/api/api/droptable"

// Create a local storage key for comments based on study set ID
const getLocalStorageKey = (studySetId) => `study_set_comments_${studySetId}`

const StudySetView = () => {
  const { communityId, studySetId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [studySet, setStudySet] = useState(location.state?.studySet || null)
  const [loading, setLoading] = useState(!location.state?.studySet)
  const [error, setError] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [score, setScore] = useState(0)
  const [matchedPairs, setMatchedPairs] = useState(new Set())
  const [incorrectMatch, setIncorrectMatch] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [editingComment, setEditingComment] = useState(null)
  const [editedCommentText, setEditedCommentText] = useState("")
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedCommentId, setSelectedCommentId] = useState(null)
  const [loadingComments, setLoadingComments] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [currentUserId, setCurrentUserId] = useState(null)

  const backgroundStyle = {
    backgroundImage: `url(${background})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
    minWidth: "1024px",
  }

  const fontStyle = {
    fontFamily: "SourGummy, sans-serif",
  }

  // Get current user ID on component mount
  useEffect(() => {
    const userId = sessionStorage.getItem("userId")
    if (userId) {
      setCurrentUserId(userId)
      console.log("Current user ID:", userId)
    }
  }, [])

  // Load comments from local storage on initial render
  useEffect(() => {
    if (studySetId) {
      const localStorageKey = getLocalStorageKey(studySetId)
      const savedComments = localStorage.getItem(localStorageKey)

      if (savedComments) {
        try {
          const parsedComments = JSON.parse(savedComments)
          if (Array.isArray(parsedComments) && parsedComments.length > 0) {
            console.log("Loaded comments from local storage:", parsedComments)
            setComments(parsedComments)
          }
        } catch (err) {
          console.error("Error parsing comments from local storage:", err)
        }
      }

      // Always fetch from server to get the latest
      fetchComments()
    }
  }, [studySetId])

  // Save comments to local storage whenever they change
  useEffect(() => {
    if (studySetId && comments.length > 0) {
      const localStorageKey = getLocalStorageKey(studySetId)
      localStorage.setItem(localStorageKey, JSON.stringify(comments))
      console.log("Saved comments to local storage:", comments)
    }
  }, [comments, studySetId])

  useEffect(() => {
    if (!location.state?.studySet) {
      fetchStudySetDetails()
    }
  }, [studySetId])

  const showSnackbar = (message) => {
    setSnackbarMessage(message)
    setSnackbarOpen(true)
  }

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  const fetchStudySetDetails = async () => {
    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        setError("You must be logged in to view this study set")
        setLoading(false)
        return
      }

      // Fetch study set details
      const response = await fetch(`${API_BASE_URL}/posts/${studySetId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch study set details")
      }

      const data = await response.json()
      console.log("Fetched study set data:", data) // Debug log

      let content
      try {
        content = JSON.parse(data.content || "{}")
        console.log("Parsed content:", content) // Debug log
      } catch (parseError) {
        console.error("Error parsing content:", parseError)
        content = {}
      }

      // Ensure content has the correct structure
      const studySetData = {
        id: data.id,
        title: content.name || data.title,
        description: `Created by ${data.author?.email?.split("@")[0] || "Anonymous"}`,
        type: content.type || "flashcards",
        content: content.content || [],
        fileId: data.fileId,
      }

      console.log("Setting study set data:", studySetData) // Debug log
      setStudySet(studySetData)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching study set:", err)
      setError("Failed to load study set details")
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      setLoadingComments(true)
      const token = sessionStorage.getItem("token")
      if (!token) {
        console.log("No token available for fetching comments")
        setLoadingComments(false)
        return
      }

      console.log(`Fetching comments for post ID: ${studySetId}`)

      // Try to fetch comments using post-reactions API
      const response = await fetch(`${API_BASE_URL}/post-reactions?postId=${studySetId}&type=comment`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Comments response status:", response.status)

      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.status}`)
      }

      const data = await response.json()
      console.log("Fetched comments:", data)

      // Transform post-reactions to comment format if needed and filter out invalid entries
      const formattedComments = data
        .filter((reaction) => reaction.content && reaction.content.trim() !== "") // Filter out empty comments
        .map((reaction) => ({
          id: reaction.id,
          content: reaction.content || "No content",
          createdAt: reaction.createdAt || new Date().toISOString(),
          author: reaction.author || { email: "Anonymous" },
        }))

      // Get existing comments from local storage to merge with server data
      const localStorageKey = getLocalStorageKey(studySetId)
      const savedComments = localStorage.getItem(localStorageKey)
      let localComments = []

      if (savedComments) {
        try {
          const parsedComments = JSON.parse(savedComments)
          if (Array.isArray(parsedComments)) {
            // Keep only temporary comments (those not yet saved to server)
            localComments = parsedComments.filter(
              (comment) => typeof comment.id === "string" && comment.id.startsWith("temp-"),
            )
          }
        } catch (err) {
          console.error("Error parsing local comments:", err)
        }
      }

      // Combine server comments with local temporary comments
      const combinedComments = [...formattedComments, ...localComments]

      setComments(combinedComments)

      // Save the combined comments to local storage
      localStorage.setItem(localStorageKey, JSON.stringify(combinedComments))
      console.log("Saved combined comments to local storage:", combinedComments)
    } catch (err) {
      console.error("Error fetching comments:", err)
      // Try fallback method - regular comments API
      try {
        const token = sessionStorage.getItem("token")
        const fallbackResponse = await fetch(`${API_BASE_URL}/comments?postId=${studySetId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          // Filter and format fallback data
          const formattedFallbackComments = fallbackData
            .filter((comment) => comment.content && comment.content.trim() !== "")
            .map((comment) => ({
              id: comment.id,
              content: comment.content || "No content",
              createdAt: comment.createdAt || new Date().toISOString(),
              author: comment.author || { email: "Anonymous" },
            }))

          // Get existing comments from local storage
          const localStorageKey = getLocalStorageKey(studySetId)
          const savedComments = localStorage.getItem(localStorageKey)
          let localComments = []

          if (savedComments) {
            try {
              const parsedComments = JSON.parse(savedComments)
              if (Array.isArray(parsedComments)) {
                // Keep only temporary comments
                localComments = parsedComments.filter(
                  (comment) => typeof comment.id === "string" && comment.id.startsWith("temp-"),
                )
              }
            } catch (err) {
              console.error("Error parsing local comments:", err)
            }
          }

          // Combine server comments with local temporary comments
          const combinedComments = [...formattedFallbackComments, ...localComments]

          setComments(combinedComments)

          // Save to local storage
          localStorage.setItem(localStorageKey, JSON.stringify(combinedComments))
        }
      } catch (fallbackErr) {
        console.error("Fallback fetch also failed:", fallbackErr)
        // If all fetches fail, we'll still have the local storage data if available
      }
    } finally {
      setLoadingComments(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      setLoadingComments(true)
      const token = sessionStorage.getItem("token")
      if (!token) {
        alert("You must be logged in to post comments")
        setLoadingComments(false)
        return
      }

      const userId = sessionStorage.getItem("userId")
      const userEmail = sessionStorage.getItem("email") || "Current User"

      // Create a temporary comment to show immediately in the UI
      const tempComment = {
        id: `temp-${Date.now()}`,
        content: newComment,
        createdAt: new Date().toISOString(),
        author: {
          email: userEmail,
          id: userId,
        },
      }

      // Add to UI immediately for better user experience
      const updatedComments = [...comments, tempComment]
      setComments(updatedComments)
      setNewComment("")

      // Save to local storage immediately
      const localStorageKey = getLocalStorageKey(studySetId)
      localStorage.setItem(localStorageKey, JSON.stringify(updatedComments))

      // Try the simplest possible approach
      console.log("Posting comment using simplified approach")
      const response = await fetch(`${API_BASE_URL}/post-reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId: Number.parseInt(studySetId, 10),
          type: "comment",
          content: tempComment.content,
        }),
      })

      if (!response.ok) {
        console.error("Error posting comment:", response.status)
        showSnackbar("Comment saved locally but couldn't be sent to server")
        // Even if the server request fails, we keep the comment in the UI
        // to avoid disrupting the user experience
      } else {
        console.log("Comment posted successfully")
        const serverComment = await response.json()
        console.log("Server response for new comment:", serverComment)

        // Replace the temporary comment with the server-generated one
        const updatedWithServerComment = comments.map((comment) =>
          comment.id === tempComment.id
            ? {
                id: serverComment.id,
                content: serverComment.content || tempComment.content,
                createdAt: serverComment.createdAt || tempComment.createdAt,
                author: serverComment.author || tempComment.author,
              }
            : comment,
        )

        setComments(updatedWithServerComment)

        // Update local storage with the server comment
        localStorage.setItem(localStorageKey, JSON.stringify(updatedWithServerComment))
        showSnackbar("Comment posted successfully!")
      }
    } catch (err) {
      console.error("Network error posting comment:", err)
      showSnackbar("Comment saved locally but couldn't be sent to server")
      // We don't remove the comment from the UI even if there's an error
      // This provides a better user experience when there are network issues
    } finally {
      setLoadingComments(false)
    }
  }

  const handleEditComment = async (commentId, newContent) => {
    if (!newContent.trim()) return

    try {
      // First update locally for immediate feedback
      const updatedComments = comments.map((comment) =>
        comment.id === commentId ? { ...comment, content: newContent } : comment,
      )
      setComments(updatedComments)

      // Save to local storage
      const localStorageKey = getLocalStorageKey(studySetId)
      localStorage.setItem(localStorageKey, JSON.stringify(updatedComments))

      // Reset editing state
      setEditingComment(null)
      setEditedCommentText("")

      const token = sessionStorage.getItem("token")
      if (!token) return

      // Try to update on the server
      // Only try if it's not a temporary comment
      if (typeof commentId === "number" || !String(commentId).startsWith("temp-")) {
        const response = await fetch(`${API_BASE_URL}/post-reactions/${commentId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: newContent,
          }),
        })

        if (!response.ok) {
          console.error("Failed to update comment on server:", response.status)
          showSnackbar("Comment updated locally but couldn't be updated on server")
          // We keep the local update even if server update fails
        } else {
          showSnackbar("Comment updated successfully!")
        }
      } else {
        showSnackbar("Comment updated locally!")
      }
    } catch (err) {
      console.error("Error updating comment:", err)
      showSnackbar("Comment updated locally but couldn't be updated on server")
      // Keep the local update even if there's an error
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      // First remove locally for immediate feedback
      const updatedComments = comments.filter((comment) => comment.id !== commentId)
      setComments(updatedComments)

      // Save to local storage
      const localStorageKey = getLocalStorageKey(studySetId)
      localStorage.setItem(localStorageKey, JSON.stringify(updatedComments))

      // Close menu if open
      handleCommentMenuClose()

      const token = sessionStorage.getItem("token")
      if (!token) return

      // Only try to delete on server if it's not a temporary comment
      if (typeof commentId === "number" || !String(commentId).startsWith("temp-")) {
        // Try post-reactions endpoint
        const response = await fetch(`${API_BASE_URL}/post-reactions/${commentId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          console.error("Failed to delete comment on server:", response.status)
          showSnackbar("Comment removed locally but couldn't be deleted from server")
          // We keep the local deletion even if server deletion fails
        } else {
          showSnackbar("Comment deleted successfully!")
        }
      } else {
        showSnackbar("Comment removed!")
      }
    } catch (err) {
      console.error("Error deleting comment:", err)
      showSnackbar("Comment removed locally but couldn't be deleted from server")
      // Keep the local deletion even if there's an error
    }
  }

  const handleCommentMenuOpen = (event, commentId) => {
    setAnchorEl(event.currentTarget)
    setSelectedCommentId(commentId)
  }

  const handleCommentMenuClose = () => {
    setAnchorEl(null)
    setSelectedCommentId(null)
  }

  const startEditingComment = (comment) => {
    setEditingComment(comment.id)
    setEditedCommentText(comment.content)
    handleCommentMenuClose()
  }

  const cancelEditingComment = () => {
    setEditingComment(null)
    setEditedCommentText("")
  }

  const handleBack = () => {
    navigate(`/community/view/${communityId}`)
  }

  const handleNext = () => {
    if (currentIndex < studySet.content.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowAnswer(false)
      setSelectedAnswer(null)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setShowAnswer(false)
      setSelectedAnswer(null)
    }
  }

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer)
    setShowAnswer(true)
    if (answer === studySet.content[currentIndex].answer) {
      setScore(score + 1)
    }
  }

  const isCurrentUserComment = (comment) => {
    const userId = sessionStorage.getItem("userId")

    // For debugging
    console.log("Checking if comment is from current user:")
    console.log("Current user ID:", userId)
    console.log("Comment author ID:", comment.author?.id)
    console.log("Comment:", comment)

    // Check if the comment author ID matches the current user ID
    // Also consider temporary comments created by the current user
    return (
      (comment.author && userId === String(comment.author.id)) ||
      (typeof comment.id === "string" && comment.id.startsWith("temp-"))
    )
  }

  const renderStudySetContent = () => {
    if (!studySet?.content) {
      console.log("No content available:", studySet) // Debug log
      return null
    }

    console.log("Rendering content for type:", studySet.type) // Debug log
    console.log("Current content:", studySet.content) // Debug log

    switch (studySet.type) {
      case "flashcards":
        if (!studySet.content[currentIndex]) {
          console.log("No content at current index:", currentIndex) // Debug log
          return null
        }
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "400px",
              perspective: "1000px",
              mb: 8,
              position: "relative",
            }}
          >
            {/* Flashcard */}
            <Box
              sx={{
                width: "100%",
                maxWidth: "600px",
                height: "100%",
                cursor: "pointer",
                position: "relative",
                transformStyle: "preserve-3d",
                transition: "transform 0.6s",
                transform: showAnswer ? "rotateY(180deg)" : "rotateY(0)",
              }}
              onClick={() => setShowAnswer(!showAnswer)}
            >
              {/* Front of card */}
              <Card
                sx={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  backfaceVisibility: "hidden",
                  "&:hover": {
                    boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "linear-gradient(45deg, #1D6EF1 0%, #5B8C5A 100%)",
                    opacity: 0.1,
                    borderRadius: "inherit",
                    zIndex: 0,
                  },
                }}
              >
                <CardContent
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                    zIndex: 1,
                    p: 4,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: "text.secondary",
                        ...fontStyle,
                        textTransform: "uppercase",
                        letterSpacing: "2px",
                      }}
                    >
                      Question
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        textAlign: "center",
                        ...fontStyle,
                        fontWeight: 600,
                      }}
                    >
                      {studySet.content[currentIndex].front}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        mt: 2,
                        textAlign: "center",
                        ...fontStyle,
                      }}
                    >
                      Click to see answer
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Back of card */}
              <Card
                sx={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  "&:hover": {
                    boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "linear-gradient(45deg, #1D6EF1 0%, #5B8C5A 100%)",
                    opacity: 0.1,
                    borderRadius: "inherit",
                    zIndex: 0,
                  },
                }}
              >
                <CardContent
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                    zIndex: 1,
                    p: 4,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: "text.secondary",
                        ...fontStyle,
                        textTransform: "uppercase",
                        letterSpacing: "2px",
                      }}
                    >
                      Answer
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        textAlign: "center",
                        ...fontStyle,
                        fontWeight: 600,
                      }}
                    >
                      {studySet.content[currentIndex].back}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        mt: 2,
                        textAlign: "center",
                        ...fontStyle,
                      }}
                    >
                      Click to see question
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Card Counter and Navigation */}
            <Box
              sx={{
                position: "absolute",
                bottom: -60,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                alignItems: "center",
                gap: 2,
                bgcolor: "rgba(255, 255, 255, 0.9)",
                px: 3,
                py: 1,
                borderRadius: 2,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                zIndex: 2,
              }}
            >
              <Button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                sx={{
                  minWidth: "40px",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  bgcolor: "rgba(255, 255, 255, 0.9)",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 1)",
                  },
                  "&.Mui-disabled": {
                    bgcolor: "rgba(255, 255, 255, 0.5)",
                  },
                }}
              >
                <ArrowLeft size={24} color="#1D6EF1" />
              </Button>

              <Typography
                variant="body1"
                sx={{
                  ...fontStyle,
                  color: "#1D1D20",
                  fontWeight: 500,
                }}
              >
                {currentIndex + 1} of {studySet.content.length}
              </Typography>

              <Button
                onClick={handleNext}
                disabled={currentIndex === studySet.content.length - 1}
                sx={{
                  minWidth: "40px",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  bgcolor: "rgba(255, 255, 255, 0.9)",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 1)",
                  },
                  "&.Mui-disabled": {
                    bgcolor: "rgba(255, 255, 255, 0.5)",
                  },
                }}
              >
                <ArrowLeft size={24} color="#1D6EF1" style={{ transform: "rotate(180deg)" }} />
              </Button>
            </Box>
          </Box>
        )

      case "fill_in_blank":
        if (!studySet.content[currentIndex]) {
          console.log("No content at current index:", currentIndex)
          return null
        }
        return (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, ...fontStyle }}>
                Question {currentIndex + 1}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, ...fontStyle }}>
                {studySet.content[currentIndex].question}
              </Typography>
              {showAnswer && (
                <Typography variant="body1" sx={{ color: "success.main", ...fontStyle }}>
                  Answer: {studySet.content[currentIndex].answer}
                </Typography>
              )}
              <Button variant="contained" onClick={() => setShowAnswer(!showAnswer)} sx={{ mt: 2, bgcolor: "#1D6EF1" }}>
                {showAnswer ? "Hide Answer" : "Show Answer"}
              </Button>
            </CardContent>
          </Card>
        )

      case "matching":
        if (!studySet.content || studySet.content.length === 0) {
          console.log("No matching content available")
          return null
        }
        return (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, ...fontStyle }}>
                Match the following
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 3,
                  ...fontStyle,
                  color: "text.secondary",
                  textAlign: "center",
                  bgcolor: "rgba(29, 110, 241, 0.1)",
                  p: 2,
                  borderRadius: 1,
                }}
              >
                Click on a term or definition to select it, then click on its matching pair from the other column.
                Correct matches will turn green, incorrect matches will briefly turn red.
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle1" sx={{ mb: 2, ...fontStyle }}>
                    Terms:
                  </Typography>
                  {studySet.content.map((item, index) => (
                    <Button
                      key={index}
                      variant={selectedAnswer === `term-${index}` ? "contained" : "outlined"}
                      onClick={() => {
                        if (!selectedAnswer) {
                          setSelectedAnswer(`term-${index}`)
                          setIncorrectMatch(null)
                        } else if (selectedAnswer.startsWith("def-")) {
                          const defIndex = Number.parseInt(selectedAnswer.split("-")[1])
                          if (defIndex === index) {
                            // Check if this pair hasn't been matched before
                            const pairKey = `${index}-${defIndex}`
                            if (!matchedPairs.has(pairKey)) {
                              setScore(score + 1)
                              setMatchedPairs((prev) => new Set([...prev, pairKey]))
                            }
                            setSelectedAnswer(null)
                            setIncorrectMatch(null)
                          } else {
                            setSelectedAnswer(null)
                            setIncorrectMatch(`term-${index}`)
                            setTimeout(() => setIncorrectMatch(null), 1000)
                          }
                        } else {
                          setSelectedAnswer(`term-${index}`)
                          setIncorrectMatch(null)
                        }
                      }}
                      disabled={matchedPairs.has(`${index}-${index}`)}
                      sx={{
                        width: "100%",
                        mb: 1,
                        justifyContent: "flex-start",
                        textAlign: "left",
                        ...fontStyle,
                        bgcolor: matchedPairs.has(`${index}-${index}`)
                          ? "#4CAF50"
                          : incorrectMatch === `term-${index}`
                            ? "#DC2626"
                            : selectedAnswer === `term-${index}`
                              ? "#1D6EF1"
                              : "transparent",
                        color:
                          matchedPairs.has(`${index}-${index}`) ||
                          selectedAnswer === `term-${index}` ||
                          incorrectMatch === `term-${index}`
                            ? "white"
                            : "inherit",
                        "&:hover": {
                          bgcolor: matchedPairs.has(`${index}-${index}`)
                            ? "#4CAF50"
                            : incorrectMatch === `term-${index}`
                              ? "#DC2626"
                              : selectedAnswer === `term-${index}`
                                ? "#1557B0"
                                : "rgba(29, 110, 241, 0.1)",
                        },
                      }}
                    >
                      {item.term}
                    </Button>
                  ))}
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle1" sx={{ mb: 2, ...fontStyle }}>
                    Definitions:
                  </Typography>
                  {studySet.content.map((item, index) => (
                    <Button
                      key={index}
                      variant={selectedAnswer === `def-${index}` ? "contained" : "outlined"}
                      onClick={() => {
                        if (!selectedAnswer) {
                          setSelectedAnswer(`def-${index}`)
                          setIncorrectMatch(null)
                        } else if (selectedAnswer.startsWith("term-")) {
                          const termIndex = Number.parseInt(selectedAnswer.split("-")[1])
                          if (termIndex === index) {
                            // Check if this pair hasn't been matched before
                            const pairKey = `${termIndex}-${index}`
                            if (!matchedPairs.has(pairKey)) {
                              setScore(score + 1)
                              setMatchedPairs((prev) => new Set([...prev, pairKey]))
                            }
                            setSelectedAnswer(null)
                            setIncorrectMatch(null)
                          } else {
                            setSelectedAnswer(null)
                            setIncorrectMatch(`def-${index}`)
                            setTimeout(() => setIncorrectMatch(null), 1000)
                          }
                        } else {
                          setSelectedAnswer(`def-${index}`)
                          setIncorrectMatch(null)
                        }
                      }}
                      disabled={matchedPairs.has(`${index}-${index}`)}
                      sx={{
                        width: "100%",
                        mb: 1,
                        justifyContent: "flex-start",
                        textAlign: "left",
                        ...fontStyle,
                        bgcolor: matchedPairs.has(`${index}-${index}`)
                          ? "#4CAF50"
                          : incorrectMatch === `def-${index}`
                            ? "#DC2626"
                            : selectedAnswer === `def-${index}`
                              ? "#1D6EF1"
                              : "transparent",
                        color:
                          matchedPairs.has(`${index}-${index}`) ||
                          selectedAnswer === `def-${index}` ||
                          incorrectMatch === `def-${index}`
                            ? "white"
                            : "inherit",
                        "&:hover": {
                          bgcolor: matchedPairs.has(`${index}-${index}`)
                            ? "#4CAF50"
                            : incorrectMatch === `def-${index}`
                              ? "#DC2626"
                              : selectedAnswer === `def-${index}`
                                ? "#1557B0"
                                : "rgba(29, 110, 241, 0.1)",
                        },
                      }}
                    >
                      {item.definition}
                    </Button>
                  ))}
                </Grid>
              </Grid>
              <Typography
                variant="h6"
                sx={{
                  mt: 4,
                  textAlign: "center",
                  ...fontStyle,
                  color: score === studySet.content.length ? "success.main" : "text.primary",
                }}
              >
                Score: {score} / {studySet.content.length}
              </Typography>
            </CardContent>
          </Card>
        )

      case "multiple_choice":
        if (!studySet.content[currentIndex]) {
          console.log("No content at current index:", currentIndex)
          return null
        }
        return (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, ...fontStyle }}>
                Question {currentIndex + 1}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, ...fontStyle }}>
                {studySet.content[currentIndex].question}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {studySet.content[currentIndex].options.map((option, index) => {
                  const isCorrectAnswer =
                    option === studySet.content[currentIndex].options[studySet.content[currentIndex].correctAnswer]
                  const isSelected = selectedAnswer === option
                  const isIncorrectSelected = isSelected && !isCorrectAnswer

                  return (
                    <Button
                      key={index}
                      variant="outlined"
                      onClick={() => {
                        setSelectedAnswer(option)
                        if (isCorrectAnswer) {
                          setShowAnswer(true)
                          if (!showAnswer) {
                            setScore(score + 1)
                          }
                        } else {
                          // For incorrect answers, briefly show red and then allow retry
                          setTimeout(() => {
                            setSelectedAnswer(null)
                          }, 500)
                        }
                      }}
                      disabled={showAnswer}
                      sx={{
                        justifyContent: "flex-start",
                        textAlign: "left",
                        ...fontStyle,
                        bgcolor:
                          isCorrectAnswer && showAnswer
                            ? "#4CAF50"
                            : isIncorrectSelected
                              ? "#DC2626"
                              : isSelected
                                ? "#1D6EF1"
                                : "transparent",
                        color: (isCorrectAnswer && showAnswer) || isSelected ? "white" : "inherit",
                        transition: "background-color 0.3s",
                        "&:hover": {
                          bgcolor:
                            isCorrectAnswer && showAnswer
                              ? "#4CAF50"
                              : isIncorrectSelected
                                ? "#DC2626"
                                : isSelected
                                  ? "#1557B0"
                                  : "rgba(29, 110, 241, 0.1)",
                        },
                      }}
                    >
                      {option}
                    </Button>
                  )
                })}
              </Box>
              {showAnswer && (
                <Typography
                  variant="body1"
                  sx={{
                    color: "success.main",
                    mt: 2,
                    ...fontStyle,
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                >
                  Correct!
                </Typography>
              )}
            </CardContent>
          </Card>
        )

      default:
        return (
          <Typography variant="body1" sx={{ ...fontStyle }}>
            Unsupported study set type: {studySet.type}
          </Typography>
        )
    }
  }

  const renderCommentSection = () => {
    return (
      <Card sx={{ mt: 4, mb: 4 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3, ...fontStyle }}>
            Comments
          </Typography>

          {/* Add new comment */}
          <Box sx={{ mb: 4, display: "flex", flexDirection: "column" }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover fieldset": {
                    borderColor: "#1D6EF1",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#1D6EF1",
                  },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleAddComment}
              disabled={!newComment.trim() || loadingComments}
              sx={{
                alignSelf: "flex-end",
                bgcolor: "#1D6EF1",
                "&:hover": {
                  bgcolor: "#1557B0",
                },
                borderRadius: 2,
                ...fontStyle,
              }}
            >
              {loadingComments ? "Posting..." : "Post Comment"}
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Comments list */}
          {loadingComments ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={30} sx={{ color: "#1D6EF1" }} />
            </Box>
          ) : comments.length === 0 ? (
            <Typography
              variant="body1"
              sx={{
                textAlign: "center",
                py: 3,
                color: "text.secondary",
                ...fontStyle,
              }}
            >
              No comments yet. Be the first to comment!
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {comments.map((comment) => {
                const isEditing = editingComment === comment.id
                const isUserComment = isCurrentUserComment(comment)

                // Format the date properly or use a fallback
                let formattedDate = "Unknown date"
                try {
                  const date = new Date(comment.createdAt)
                  // Check if date is valid
                  if (!isNaN(date.getTime())) {
                    formattedDate = date.toLocaleString()
                  }
                } catch (e) {
                  console.error("Error formatting date:", e)
                }

                return (
                  <Box
                    key={comment.id}
                    sx={{
                      display: "flex",
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: isUserComment ? "rgba(29, 110, 241, 0.05)" : "transparent",
                      border: isUserComment ? "1px solid rgba(29, 110, 241, 0.2)" : "none",
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "#1D6EF1",
                        width: 40,
                        height: 40,
                      }}
                    >
                      {comment.author?.email ? comment.author.email.charAt(0).toUpperCase() : "?"}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ ...fontStyle }}>
                            {comment.author?.email ? comment.author.email.split("@")[0] : "Anonymous"}
                            {isUserComment && (
                              <Typography
                                component="span"
                                sx={{
                                  ml: 1,
                                  fontSize: "0.75rem",
                                  bgcolor: "#1D6EF1",
                                  color: "white",
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: 1,
                                }}
                              >
                                You
                              </Typography>
                            )}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary", ...fontStyle }}>
                            {formattedDate}
                          </Typography>
                        </Box>
                        {isUserComment && (
                          <Box sx={{ display: "flex", gap: 1 }}>
                            {!isEditing && (
                              <>
                                <Button
                                  size="small"
                                  startIcon={<Edit2 size={16} />}
                                  onClick={() => startEditingComment(comment)}
                                  sx={{
                                    color: "#1D6EF1",
                                    borderColor: "#1D6EF1",
                                    "&:hover": { bgcolor: "rgba(29, 110, 241, 0.1)" },
                                    textTransform: "none",
                                  }}
                                  variant="outlined"
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="small"
                                  startIcon={<Trash2 size={16} />}
                                  onClick={() => handleDeleteComment(comment.id)}
                                  sx={{
                                    color: "#DC2626",
                                    borderColor: "#DC2626",
                                    "&:hover": { bgcolor: "rgba(220, 38, 38, 0.1)" },
                                    textTransform: "none",
                                  }}
                                  variant="outlined"
                                >
                                  Delete
                                </Button>
                              </>
                            )}
                          </Box>
                        )}
                      </Box>

                      {isEditing ? (
                        <Box sx={{ mt: 2 }}>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            value={editedCommentText}
                            onChange={(e) => setEditedCommentText(e.target.value)}
                            sx={{
                              mb: 2,
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                              },
                            }}
                          />
                          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                            <Button
                              size="small"
                              onClick={cancelEditingComment}
                              sx={{
                                ...fontStyle,
                                color: "text.secondary",
                                "&:hover": { bgcolor: "rgba(0, 0, 0, 0.05)" },
                              }}
                              variant="text"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleEditComment(comment.id, editedCommentText)}
                              sx={{ bgcolor: "#1D6EF1", ...fontStyle }}
                            >
                              Save Changes
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ mt: 1, ...fontStyle }}>
                          {comment.content || "No content"}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )
              })}
            </Box>
          )}

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCommentMenuClose}>
            <MenuItem
              onClick={() => {
                const comment = comments.find((c) => c.id === selectedCommentId)
                if (comment) startEditingComment(comment)
              }}
            >
              <Edit2 size={16} style={{ marginRight: 8 }} />
              Edit
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleDeleteComment(selectedCommentId)
                handleCommentMenuClose()
              }}
            >
              <Trash2 size={16} style={{ marginRight: 8 }} />
              Delete
            </MenuItem>
          </Menu>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box sx={backgroundStyle}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
          <Button startIcon={<ArrowLeft />} onClick={handleBack} sx={{ color: "white", mr: 2 }}>
            Back to Community
          </Button>
          <Typography variant="h4" sx={{ color: "white", ...fontStyle }}>
            {studySet?.title}
          </Typography>
        </Box>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="body1" sx={{ mb: 2, ...fontStyle }}>
              {studySet?.description}
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Share2 />}
                onClick={() => {
                  const shareUrl = `${window.location.origin}/community/${communityId}/study-set/${studySetId}`
                  navigator.clipboard.writeText(shareUrl)
                  alert("Link copied to clipboard!")
                }}
                sx={{ color: "#1D6EF1", borderColor: "#1D6EF1" }}
              >
                Share
              </Button>
            </Box>
          </CardContent>
        </Card>

        {renderStudySetContent()}

        {studySet?.type !== "flashcards" && studySet?.type !== "matching" && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              bgcolor: "rgba(255, 255, 255, 0.9)",
              px: 3,
              py: 1,
              borderRadius: 2,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              width: "fit-content",
              mx: "auto",
              mt: 4,
            }}
          >
            <Button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              sx={{
                minWidth: "40px",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                bgcolor: "rgba(255, 255, 255, 0.9)",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 1)",
                },
                "&.Mui-disabled": {
                  bgcolor: "rgba(255, 255, 255, 0.5)",
                },
              }}
            >
              <ArrowLeft size={24} color="#1D6EF1" />
            </Button>

            <Typography
              variant="body1"
              sx={{
                ...fontStyle,
                color: "#1D1D20",
                fontWeight: 500,
              }}
            >
              {currentIndex + 1} of {studySet?.content?.length}
            </Typography>

            <Button
              onClick={handleNext}
              disabled={currentIndex === studySet?.content?.length - 1}
              sx={{
                minWidth: "40px",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                bgcolor: "rgba(255, 255, 255, 0.9)",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 1)",
                },
                "&.Mui-disabled": {
                  bgcolor: "rgba(255, 255, 255, 0.5)",
                },
              }}
            >
              <ArrowLeft size={24} color="#1D6EF1" style={{ transform: "rotate(180deg)" }} />
            </Button>
          </Box>
        )}

        {studySet?.type === "multiple_choice" && (
          <Box
            sx={{
              mt: 4,
              textAlign: "center",
              bgcolor: "rgba(255, 255, 255, 0.9)",
              p: 3,
              borderRadius: 2,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              maxWidth: "300px",
              mx: "auto",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                ...fontStyle,
                color: "#1D1D20",
                fontWeight: 700,
                mb: 1,
              }}
            >
              Score
            </Typography>
            <Typography
              variant="h4"
              sx={{
                ...fontStyle,
                color: score === studySet.content.length ? "#4CAF50" : "#1D1D20",
                fontWeight: 800,
              }}
            >
              {score} / {studySet.content.length}
            </Typography>
          </Box>
        )}

        {renderCommentSection()}
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{
          "& .MuiSnackbarContent-root": {
            bgcolor: "#1D6EF1",
            color: "white",
            fontWeight: 500,
          },
        }}
      />
    </Box>
  )
}

export default StudySetView


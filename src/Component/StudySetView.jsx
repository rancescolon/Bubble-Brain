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
  useMediaQuery,
  useTheme,
  IconButton,
} from "@mui/material"
import { ArrowLeft, Edit2, Trash2, RotateCcw } from "lucide-react"
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
  const [studyStartTime, setStudyStartTime] = useState(null)
  const [totalStudyTime, setTotalStudyTime] = useState(0)
  const [isStudying, setIsStudying] = useState(false)
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

  // Theme and responsive breakpoints
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"))

  const backgroundStyle = {
    backgroundImage: `url(${background})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
    width: "100%",
    maxWidth: "100vw",
    overflowX: "hidden",
  }

  const fontStyle = {
    fontFamily: "SourGummy, sans-serif",
  }

  // Add viewport meta tag to document head
  useEffect(() => {
    // Check if viewport meta tag exists
    let viewportMeta = document.querySelector('meta[name="viewport"]')

    // If it doesn't exist, create it
    if (!viewportMeta) {
      viewportMeta = document.createElement("meta")
      viewportMeta.name = "viewport"
      document.head.appendChild(viewportMeta)
    }

    // Set the content attribute
    viewportMeta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"

    // Clean up function
    return () => {
      // Optional: remove or reset the viewport meta tag when component unmounts
      // viewportMeta.content = 'width=device-width, initial-scale=1.0';
    }
  }, [])

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
  }, [studySetId, location.state])

  useEffect(() => {
    if (studySet) {
      startStudySession()
    }
  }, [studySet])

  useEffect(() => {
    return () => {
      if (isStudying) {
        endStudySession()
      }
    }
  }, [isStudying])

  useEffect(() => {
    let interval
    if (isStudying) {
      interval = setInterval(() => {
        const currentTime = Date.now()
        const elapsedSeconds = Math.floor((currentTime - studyStartTime) / 1000)
        setTotalStudyTime(elapsedSeconds)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isStudying, studyStartTime])

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
      console.log("Fetched study set data:", data)

      let content
      try {
        content = JSON.parse(data.content || "{}")
        console.log("Parsed content:", content)
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

      console.log("Setting study set data:", studySetData)
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
        .filter((reaction) => reaction.content && reaction.content.trim() !== "")
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

      // Make sure studySetId is properly parsed as a number
      const postId = Number.parseInt(studySetId, 10)

      if (isNaN(postId)) {
        console.error("Invalid study set ID:", studySetId)
        showSnackbar("Comment saved locally but couldn't be sent to server: Invalid study set ID")
        setLoadingComments(false)
        return
      }

      console.log("Posting comment with postId:", postId)

      // Try the post-reactions endpoint with proper error handling
      const response = await fetch(`${API_BASE_URL}/post-reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId: postId,
          type: "comment",
          content: tempComment.content,
        }),
      })

      // Log the full response for debugging
      console.log("Server response status:", response.status)

      if (!response.ok) {
        // Try alternative endpoint if the first one fails
        console.log("First endpoint failed, trying alternative...")

        const alternativeResponse = await fetch(`${API_BASE_URL}/comments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            postId: postId,
            content: tempComment.content,
          }),
        })

        if (!alternativeResponse.ok) {
          throw new Error(`Failed to post comment: ${response.status}, ${alternativeResponse.status}`)
        }

        const serverComment = await alternativeResponse.json()
        console.log("Alternative endpoint success, server response:", serverComment)

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
        localStorage.setItem(localStorageKey, JSON.stringify(updatedWithServerComment))
        showSnackbar("Comment posted successfully!")
      } else {
        console.log("Comment posted successfully to primary endpoint")
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
        localStorage.setItem(localStorageKey, JSON.stringify(updatedWithServerComment))
        showSnackbar("Comment posted successfully!")
      }
    } catch (err) {
      console.error("Network error posting comment:", err)
      showSnackbar("Comment saved locally. We'll try to sync it when connection improves.")
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

  const handleDeleteComment = async (commentId, author) => {
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
      const userId = sessionStorage.getItem("userId")
      if (!token) return
      if (userId != author) {
        alert("You are not the creator of this post")
        return
      }
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

  const startStudySession = () => {
    setStudyStartTime(Date.now())
    setIsStudying(true)
  }

  const endStudySession = async () => {
    if (!studyStartTime) {
      console.log("No study start time found, cannot save study time")
      return
    }

    const sessionDuration = Math.floor((Date.now() - studyStartTime) / 1000)
    console.log("Calculated session duration:", sessionDuration, "seconds")

    try {
      const token = sessionStorage.getItem("token")
      const userStr = sessionStorage.getItem("user")
      console.log("Raw user string from session:", userStr)

      if (!token || !userStr) {
        console.error("Missing token or user data")
        return
      }

      // Parse user data to get ID
      let userId
      try {
        const parsed = JSON.parse(userStr)
        userId =
          typeof parsed === "object" && parsed !== null && parsed.id
            ? parsed.id
            : typeof parsed === "number"
              ? parsed
              : Number(userStr)
        console.log("Extracted user ID:", userId)
      } catch (e) {
        userId = Number(userStr)
        console.log("Using raw user ID:", userId)
      }

      // Prepare study time data
      const studyData = {
        title: `Study Time Log - ${studySet.title}`,
        content: JSON.stringify({
          type: "study_time",
          duration: sessionDuration,
          studySetId: studySet.id,
          studySetTitle: studySet.title,
          timestamp: new Date().toISOString(),
        }),
        postType: "study_time",
        authorID: userId,
        parentID: studySet.id,
        groupID: Number.parseInt(communityId) || 0,
        attributes: {
          type: "study_time",
          duration: sessionDuration,
          studySetId: studySet.id,
        },
      }

      console.log("Saving study time data:", studyData)

      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(studyData),
      })

      console.log("Study time save response status:", response.status)
      const responseBody = await response.json()
      console.log("Study time save response body:", responseBody)

      if (!response.ok) {
        throw new Error(`Failed to save study time: ${response.status}`)
      }
    } catch (error) {
      console.error("Error saving study time:", error)
    }

    setIsStudying(false)
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
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

  const resetMatchingGame = () => {
    setMatchedPairs(new Set())
    setScore(0)
    setSelectedAnswer(null)
    setIncorrectMatch(null)
  }

  const renderStudySetContent = () => {
    if (!studySet?.content) {
      console.log("No content available:", studySet)
      return null
    }

    console.log("Rendering content for type:", studySet.type)
    console.log("Current content:", studySet.content)

    switch (studySet.type) {
      case "flashcards":
        if (!studySet.content[currentIndex]) {
          console.log("No content at current index:", currentIndex)
          return null
        }
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: { xs: "300px", sm: "350px", md: "400px" },
              perspective: "1000px",
              mb: { xs: 4, sm: 6, md: 8 },
              position: "relative",
              width: "100%",
            }}
          >
            {/* Flashcard */}
            <Box
              sx={{
                width: "100%",
                maxWidth: { xs: "100%", sm: "500px", md: "600px" },
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
                    p: { xs: 2, sm: 3, md: 4 },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: { xs: 1, sm: 2 },
                      width: "100%",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: "text.secondary",
                        ...fontStyle,
                        textTransform: "uppercase",
                        letterSpacing: "2px",
                        fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
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
                        fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                        width: "100%",
                      }}
                    >
                      {studySet.content[currentIndex].front}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        mt: { xs: 1, sm: 2 },
                        textAlign: "center",
                        ...fontStyle,
                        fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
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
                    p: { xs: 2, sm: 3, md: 4 },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: { xs: 1, sm: 2 },
                      width: "100%",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: "text.secondary",
                        ...fontStyle,
                        textTransform: "uppercase",
                        letterSpacing: "2px",
                        fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
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
                        fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                        width: "100%",
                      }}
                    >
                      {studySet.content[currentIndex].back}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        mt: { xs: 1, sm: 2 },
                        textAlign: "center",
                        ...fontStyle,
                        fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
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
                bottom: { xs: -40, sm: -50, md: -60 },
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                alignItems: "center",
                gap: { xs: 1, sm: 2 },
                bgcolor: "rgba(255, 255, 255, 0.9)",
                px: { xs: 2, sm: 3 },
                py: 1,
                borderRadius: 2,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                zIndex: 2,
                width: "fit-content",
              }}
            >
              <Button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                sx={{
                  minWidth: { xs: "32px", sm: "40px" },
                  width: { xs: "32px", sm: "40px" },
                  height: { xs: "32px", sm: "40px" },
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
                <ArrowLeft size={isMobile ? 18 : 24} color="#1D6EF1" />
              </Button>

              <Typography
                variant="body1"
                sx={{
                  ...fontStyle,
                  color: "#1D1D20",
                  fontWeight: 500,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                {currentIndex + 1} of {studySet.content.length}
              </Typography>

              <Button
                onClick={handleNext}
                disabled={currentIndex === studySet.content.length - 1}
                sx={{
                  minWidth: { xs: "32px", sm: "40px" },
                  width: { xs: "32px", sm: "40px" },
                  height: { xs: "32px", sm: "40px" },
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
                <ArrowLeft size={isMobile ? 18 : 24} color="#1D6EF1" style={{ transform: "rotate(180deg)" }} />
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
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  ...fontStyle,
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                }}
              >
                Question {currentIndex + 1}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 2,
                  ...fontStyle,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  wordBreak: "break-word",
                }}
              >
                {studySet.content[currentIndex].question}
              </Typography>
              {showAnswer && (
                <Typography
                  variant="body1"
                  sx={{
                    color: "success.main",
                    ...fontStyle,
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                    fontWeight: 600,
                    p: 2,
                    bgcolor: "rgba(76, 175, 80, 0.1)",
                    borderRadius: 1,
                    wordBreak: "break-word",
                  }}
                >
                  Answer: {studySet.content[currentIndex].answer}
                </Typography>
              )}
              <Button
                variant="contained"
                onClick={() => setShowAnswer(!showAnswer)}
                sx={{
                  mt: 2,
                  bgcolor: "#1D6EF1",
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
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
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    ...fontStyle,
                    fontSize: { xs: "1.1rem", sm: "1.25rem" },
                  }}
                >
                  Match the following
                </Typography>

                <IconButton
                  onClick={resetMatchingGame}
                  title="Reset game"
                  sx={{
                    bgcolor: "rgba(29, 110, 241, 0.1)",
                    "&:hover": {
                      bgcolor: "rgba(29, 110, 241, 0.2)",
                    },
                  }}
                >
                  <RotateCcw size={isMobile ? 16 : 20} color="#1D6EF1" />
                </IconButton>
              </Box>

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
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                }}
              >
                Click on a term or definition to select it, then click on its matching pair from the other column.
                Correct matches will turn green, incorrect matches will briefly turn red.
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      mb: 2,
                      ...fontStyle,
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                    }}
                  >
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
                        fontSize: { xs: "0.8rem", sm: "0.9rem" },
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
                        wordBreak: "break-word",
                        whiteSpace: "normal",
                        height: "auto",
                        py: 1,
                      }}
                    >
                      {item.term}
                    </Button>
                  ))}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      mb: 2,
                      ...fontStyle,
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                    }}
                  >
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
                        fontSize: { xs: "0.8rem", sm: "0.9rem" },
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
                        wordBreak: "break-word",
                        whiteSpace: "normal",
                        height: "auto",
                        py: 1,
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
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
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
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  ...fontStyle,
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                }}
              >
                Question {currentIndex + 1}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 2,
                  ...fontStyle,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  wordBreak: "break-word",
                }}
              >
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
                        fontSize: { xs: "0.8rem", sm: "0.9rem" },
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
                        wordBreak: "break-word",
                        whiteSpace: "normal",
                        height: "auto",
                        py: 1,
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
                    fontSize: { xs: "0.9rem", sm: "1rem" },
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
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h5"
            sx={{
              mb: 3,
              ...fontStyle,
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
            }}
          >
            Comments
          </Typography>

          {/* Add new comment */}
          <Box sx={{ mb: 4, display: "flex", flexDirection: "column" }}>
            <TextField
              fullWidth
              multiline
              rows={isMobile ? 2 : 3}
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
              size={isMobile ? "small" : "medium"}
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
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              {loadingComments ? "Posting..." : "Post Comment"}
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Comments list */}
          {loadingComments ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={isMobile ? 24 : 30} sx={{ color: "#1D6EF1" }} />
            </Box>
          ) : comments.length === 0 ? (
            <Typography
              variant="body1"
              sx={{
                textAlign: "center",
                py: 3,
                color: "text.secondary",
                ...fontStyle,
                fontSize: { xs: "0.9rem", sm: "1rem" },
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
                      gap: { xs: 1, sm: 2 },
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 2,
                      bgcolor: isUserComment ? "rgba(29, 110, 241, 0.05)" : "transparent",
                      border: isUserComment ? "1px solid rgba(29, 110, 241, 0.2)" : "none",
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "#1D6EF1",
                        width: { xs: 32, sm: 40 },
                        height: { xs: 32, sm: 40 },
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                      }}
                    >
                      {comment.author?.email ? comment.author.email.charAt(0).toUpperCase() : "?"}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 1,
                          flexDirection: { xs: "column", sm: "row" },
                          gap: { xs: 0.5, sm: 0 },
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            ...fontStyle,
                            fontSize: { xs: "0.875rem", sm: "1rem" },
                          }}
                        >
                          {isUserComment
                            ? "You"
                            : comment.author?.email
                              ? comment.author.email.split("@")[0]
                              : "Anonymous"}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            ...fontStyle,
                            fontSize: { xs: "0.7rem", sm: "0.75rem" },
                          }}
                        >
                          {formattedDate}
                        </Typography>
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
                            size={isMobile ? "small" : "medium"}
                          />
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              justifyContent: "flex-end",
                              flexWrap: "wrap",
                            }}
                          >
                            <Button
                              size="small"
                              onClick={cancelEditingComment}
                              sx={{
                                ...fontStyle,
                                color: "text.secondary",
                                "&:hover": { bgcolor: "rgba(0, 0, 0, 0.05)" },
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              }}
                              variant="text"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleEditComment(comment.id, editedCommentText)}
                              sx={{
                                bgcolor: "#1D6EF1",
                                ...fontStyle,
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              }}
                            >
                              Save Changes
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <>
                          <Typography
                            variant="body2"
                            sx={{
                              mt: 1,
                              ...fontStyle,
                              textAlign: "left",
                              fontSize: { xs: "0.875rem", sm: "1rem" },
                              wordBreak: "break-word",
                            }}
                          >
                            {comment.content || "No content"}
                          </Typography>

                          {isUserComment && (
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                justifyContent: { xs: "flex-start", sm: "flex-end" },
                                mt: 2,
                                flexWrap: "wrap",
                              }}
                            >
                              <Button
                                size="small"
                                startIcon={<Edit2 size={isMobile ? 14 : 16} />}
                                onClick={() => startEditingComment(comment)}
                                sx={{
                                  color: "#1D6EF1",
                                  borderColor: "#1D6EF1",
                                  "&:hover": { bgcolor: "rgba(29, 110, 241, 0.1)" },
                                  textTransform: "none",
                                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                }}
                                variant="outlined"
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                startIcon={<Trash2 size={isMobile ? 14 : 16} />}
                                onClick={() => handleDeleteComment(comment.id, comment.author.id)}
                                sx={{
                                  color: "#DC2626",
                                  borderColor: "#DC2626",
                                  "&:hover": { bgcolor: "rgba(220, 38, 38, 0.1)" },
                                  textTransform: "none",
                                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                }}
                                variant="outlined"
                              >
                                Delete
                              </Button>
                            </Box>
                          )}
                        </>
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
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            mb: { xs: 2, sm: 3, md: 4 },
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 0 },
          }}
        >
          <Button
            startIcon={<ArrowLeft size={isMobile ? 16 : 24} />}
            onClick={handleBack}
            sx={{
              color: "white",
              mr: 2,
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            Back to Community
          </Button>
          <Typography
            variant="h4"
            sx={{
              color: "white",
              ...fontStyle,
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" },
              wordBreak: "break-word",
            }}
          >
            {studySet?.title}
          </Typography>
          <Box
            sx={{
              ml: { xs: 0, sm: "auto" },
              mt: { xs: 2, sm: 0 },
              bgcolor: "rgba(255, 255, 255, 0.9)",
              px: { xs: 2, sm: 3 },
              py: 1,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              alignSelf: { xs: "flex-start", sm: "auto" },
            }}
          >
            <Typography
              sx={{
                color: "#1D1D20",
                ...fontStyle,
                fontSize: { xs: "0.9rem", sm: "1.1rem" },
                fontWeight: 500,
              }}
            >
              Study Time:
            </Typography>
            <Typography
              sx={{
                color: "#1D6EF1",
                fontWeight: "bold",
                ...fontStyle,
                fontSize: { xs: "0.9rem", sm: "1.1rem" },
              }}
            >
              {formatTime(totalStudyTime)}
            </Typography>
          </Box>
        </Box>

        {renderStudySetContent()}

        {studySet?.type !== "flashcards" && studySet?.type !== "matching" && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: { xs: 1, sm: 2 },
              bgcolor: "rgba(255, 255, 255, 0.9)",
              px: { xs: 2, sm: 3 },
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
                minWidth: { xs: "32px", sm: "40px" },
                width: { xs: "32px", sm: "40px" },
                height: { xs: "32px", sm: "40px" },
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
              <ArrowLeft size={isMobile ? 18 : 24} color="#1D6EF1" />
            </Button>

            <Typography
              variant="body1"
              sx={{
                ...fontStyle,
                color: "#1D1D20",
                fontWeight: 500,
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              {currentIndex + 1} of {studySet?.content?.length}
            </Typography>

            <Button
              onClick={handleNext}
              disabled={currentIndex === studySet?.content?.length - 1}
              sx={{
                minWidth: { xs: "32px", sm: "40px" },
                width: { xs: "32px", sm: "40px" },
                height: { xs: "32px", sm: "40px" },
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
              <ArrowLeft size={isMobile ? 18 : 24} color="#1D6EF1" style={{ transform: "rotate(180deg)" }} />
            </Button>
          </Box>
        )}

        {studySet?.type === "multiple_choice" && (
          <Box
            sx={{
              mt: 4,
              textAlign: "center",
              bgcolor: "rgba(255, 255, 255, 0.9)",
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              maxWidth: { xs: "200px", sm: "300px" },
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
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
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
                fontSize: { xs: "1.5rem", sm: "2rem" },
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

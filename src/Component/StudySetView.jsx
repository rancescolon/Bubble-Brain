"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { Box, Typography, Button, Card, CardContent, Container, CircularProgress, Alert, Grid } from "@mui/material"
import { ArrowLeft, Download, Share2 } from "lucide-react"
import background from "../assets/image3.png"

const API_BASE_URL = "https://webdev.cse.buffalo.edu/hci/api/api/droptable"

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

  useEffect(() => {
    if (!location.state?.studySet) {
      fetchStudySetDetails()
    }
  }, [studySetId])

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
          <Card sx={{ mb: 4, cursor: "pointer" }} onClick={() => setShowAnswer(!showAnswer)}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2, ...fontStyle }}>
                {showAnswer ? "Answer" : "Question"}
              </Typography>
              <Typography variant="h6" sx={{ ...fontStyle }}>
                {showAnswer ? studySet.content[currentIndex].back : studySet.content[currentIndex].front}
              </Typography>
            </CardContent>
          </Card>
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
              <Button
                variant="contained"
                onClick={() => setShowAnswer(!showAnswer)}
                sx={{ mt: 2, bgcolor: "#1D6EF1" }}
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
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, ...fontStyle }}>
                Match the following
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle1" sx={{ ...fontStyle }}>Terms:</Typography>
                  {studySet.content.map((item, index) => (
                    <Typography key={index} sx={{ ...fontStyle }}>{item.term}</Typography>
                  ))}
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle1" sx={{ ...fontStyle }}>Definitions:</Typography>
                  {studySet.content.map((item, index) => (
                    <Typography key={index} sx={{ ...fontStyle }}>{item.definition}</Typography>
                  ))}
                </Grid>
              </Grid>
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
                {studySet.content[currentIndex].options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === option ? "contained" : "outlined"}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={showAnswer}
                    sx={{ 
                      justifyContent: "flex-start",
                      textAlign: "left",
                      ...fontStyle
                    }}
                  >
                    {option}
                  </Button>
                ))}
              </Box>
              {showAnswer && (
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: selectedAnswer === studySet.content[currentIndex].answer ? "success.main" : "error.main",
                    mt: 2,
                    ...fontStyle
                  }}
                >
                  {selectedAnswer === studySet.content[currentIndex].answer 
                    ? "Correct!" 
                    : `Incorrect. The answer is: ${studySet.content[currentIndex].answer}`}
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
          <Button
            startIcon={<ArrowLeft />}
            onClick={handleBack}
            sx={{ color: "white", mr: 2 }}
          >
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

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button
            variant="contained"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            sx={{ bgcolor: "#1D6EF1" }}
          >
            Previous
          </Button>
          <Typography variant="body1" sx={{ ...fontStyle }}>
            {currentIndex + 1} of {studySet?.content?.length}
          </Typography>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={currentIndex === studySet?.content?.length - 1}
            sx={{ bgcolor: "#1D6EF1" }}
          >
            Next
          </Button>
        </Box>

        {studySet?.type === "multiple_choice" && (
          <Typography variant="h6" sx={{ mt: 4, textAlign: "center", ...fontStyle }}>
            Score: {score} / {studySet.content.length}
          </Typography>
        )}
      </Container>
    </Box>
  )
}

export default StudySetView 
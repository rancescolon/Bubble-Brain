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
  const [matchedPairs, setMatchedPairs] = useState(new Set())
  const [incorrectMatch, setIncorrectMatch] = useState(null)

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
          <Box sx={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            height: "400px",
            perspective: "1000px",
            mb: 8,
            position: "relative"
          }}>
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
                  }
                }}
              >
                <CardContent sx={{ 
                  height: "100%", 
                  display: "flex", 
                  flexDirection: "column", 
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                  zIndex: 1,
                  p: 4
                }}>
                  <Box sx={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center",
                    gap: 2
                  }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: "text.secondary",
                        ...fontStyle,
                        textTransform: "uppercase",
                        letterSpacing: "2px"
                      }}
                    >
                      Question
                    </Typography>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        textAlign: "center",
                        ...fontStyle,
                        fontWeight: 600
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
                        ...fontStyle
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
                  }
                }}
              >
                <CardContent sx={{ 
                  height: "100%", 
                  display: "flex", 
                  flexDirection: "column", 
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                  zIndex: 1,
                  p: 4
                }}>
                  <Box sx={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center",
                    gap: 2
                  }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: "text.secondary",
                        ...fontStyle,
                        textTransform: "uppercase",
                        letterSpacing: "2px"
                      }}
                    >
                      Answer
                    </Typography>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        textAlign: "center",
                        ...fontStyle,
                        fontWeight: 600
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
                        ...fontStyle
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
                zIndex: 2
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
                  }
                }}
              >
                <ArrowLeft size={24} color="#1D6EF1" />
              </Button>

              <Typography 
                variant="body1" 
                sx={{ 
                  ...fontStyle,
                  color: "#1D1D20",
                  fontWeight: 500
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
                  }
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
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 3, 
                  ...fontStyle,
                  color: "text.secondary",
                  textAlign: "center",
                  bgcolor: "rgba(29, 110, 241, 0.1)",
                  p: 2,
                  borderRadius: 1
                }}
              >
                Click on a term or definition to select it, then click on its matching pair from the other column. 
                Correct matches will turn green, incorrect matches will briefly turn red.
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle1" sx={{ mb: 2, ...fontStyle }}>Terms:</Typography>
                  {studySet.content.map((item, index) => (
                    <Button
                      key={index}
                      variant={selectedAnswer === `term-${index}` ? "contained" : "outlined"}
                      onClick={() => {
                        if (!selectedAnswer) {
                          setSelectedAnswer(`term-${index}`)
                          setIncorrectMatch(null)
                        } else if (selectedAnswer.startsWith('def-')) {
                          const defIndex = parseInt(selectedAnswer.split('-')[1])
                          if (defIndex === index) {
                            // Check if this pair hasn't been matched before
                            const pairKey = `${index}-${defIndex}`
                            if (!matchedPairs.has(pairKey)) {
                              setScore(score + 1)
                              setMatchedPairs(prev => new Set([...prev, pairKey]))
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
                        color: matchedPairs.has(`${index}-${index}`) || selectedAnswer === `term-${index}` || incorrectMatch === `term-${index}`
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
                        }
                      }}
                    >
                      {item.term}
                    </Button>
                  ))}
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle1" sx={{ mb: 2, ...fontStyle }}>Definitions:</Typography>
                  {studySet.content.map((item, index) => (
                    <Button
                      key={index}
                      variant={selectedAnswer === `def-${index}` ? "contained" : "outlined"}
                      onClick={() => {
                        if (!selectedAnswer) {
                          setSelectedAnswer(`def-${index}`)
                          setIncorrectMatch(null)
                        } else if (selectedAnswer.startsWith('term-')) {
                          const termIndex = parseInt(selectedAnswer.split('-')[1])
                          if (termIndex === index) {
                            // Check if this pair hasn't been matched before
                            const pairKey = `${termIndex}-${index}`
                            if (!matchedPairs.has(pairKey)) {
                              setScore(score + 1)
                              setMatchedPairs(prev => new Set([...prev, pairKey]))
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
                        color: matchedPairs.has(`${index}-${index}`) || selectedAnswer === `def-${index}` || incorrectMatch === `def-${index}`
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
                        }
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
                  color: score === studySet.content.length ? "success.main" : "text.primary"
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
                  const isCorrectAnswer = option === studySet.content[currentIndex].options[studySet.content[currentIndex].correctAnswer];
                  const isSelected = selectedAnswer === option;
                  const isIncorrectSelected = isSelected && !isCorrectAnswer;
                  
                  return (
                  <Button
                    key={index}
                      variant="outlined"
                      onClick={() => {
                        setSelectedAnswer(option);
                        if (isCorrectAnswer) {
                          setShowAnswer(true);
                          if (!showAnswer) {
                            setScore(score + 1);
                          }
                        } else {
                          // For incorrect answers, briefly show red and then allow retry
                          setTimeout(() => {
                            setSelectedAnswer(null);
                          }, 500);
                        }
                      }}
                    disabled={showAnswer}
                    sx={{ 
                      justifyContent: "flex-start",
                      textAlign: "left",
                        ...fontStyle,
                        bgcolor: isCorrectAnswer && showAnswer
                          ? "#4CAF50"
                          : isIncorrectSelected
                            ? "#DC2626"
                            : isSelected
                              ? "#1D6EF1"
                              : "transparent",
                        color: (isCorrectAnswer && showAnswer) || isSelected
                          ? "white"
                          : "inherit",
                        transition: "background-color 0.3s",
                        "&:hover": {
                          bgcolor: isCorrectAnswer && showAnswer
                            ? "#4CAF50"
                            : isIncorrectSelected
                              ? "#DC2626"
                              : isSelected
                                ? "#1557B0"
                                : "rgba(29, 110, 241, 0.1)",
                        }
                    }}
                  >
                    {option}
                  </Button>
                  );
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
                    fontWeight: 600
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

        {studySet?.type !== "flashcards" && studySet?.type !== "matching" && (
        <Box sx={{ 
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
          mt: 4
        }}>
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
              }
            }}
          >
            <ArrowLeft size={24} color="#1D6EF1" />
          </Button>

          <Typography 
            variant="body1" 
            sx={{ 
              ...fontStyle,
              color: "#1D1D20",
              fontWeight: 500
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
              }
            }}
          >
            <ArrowLeft size={24} color="#1D6EF1" style={{ transform: "rotate(180deg)" }} />
          </Button>
        </Box>
        )}

        {studySet?.type === "multiple_choice" && (
          <Box sx={{ 
            mt: 4, 
            textAlign: "center",
            bgcolor: "rgba(255, 255, 255, 0.9)",
            p: 3,
            borderRadius: 2,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            maxWidth: "300px",
            mx: "auto"
          }}>
            <Typography 
              variant="h5" 
              sx={{ 
                ...fontStyle,
                color: "#1D1D20",
                fontWeight: 700,
                mb: 1
              }}
            >
              Score
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                ...fontStyle,
                color: score === studySet.content.length ? "#4CAF50" : "#1D1D20",
                fontWeight: 800
              }}
            >
              {score} / {studySet.content.length}
          </Typography>
          </Box>
        )}
      </Container>
    </Box>
  )
}

export default StudySetView 
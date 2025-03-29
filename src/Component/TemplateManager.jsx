"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Grid,
  useMediaQuery,
  useTheme,
  Drawer,
  Tabs,
  Tab,
} from "@mui/material"
import { Plus, Trash2, BookOpen, X, Save } from "lucide-react"
import background from "../assets/image3.png"

const API_BASE_URL = "https://webdev.cse.buffalo.edu/hci/api/api/droptable"

const TemplateManager = ({ onSelectTemplate, onClose }) => {
  const [templates, setTemplates] = useState([])
  const [selectedType, setSelectedType] = useState("flashcards")
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [mobileView, setMobileView] = useState("form") // 'types', 'form', 'saved'
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Theme and responsive breakpoints
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"))

  // Template states
  const [flashcards, setFlashcards] = useState([{ front: "", back: "" }])
  const [fillInBlank, setFillInBlank] = useState([{ question: "", answer: "" }])
  const [matching, setMatching] = useState([{ term: "", definition: "" }])
  const [multipleChoice, setMultipleChoice] = useState([
    {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    },
  ])

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

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const token = sessionStorage.getItem("token")
      const userId = sessionStorage.getItem("user")

      if (!token || !userId) {
        setError("Please log in to view templates")
        return
      }

      const response = await fetch(`${API_BASE_URL}/posts?type=template&authorID=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data && data[0]) {
        const templatesData = data[0]
          .map((template) => {
            try {
              const content = JSON.parse(template.content)
              return {
                id: template.id,
                type: content.type,
                content: content.content,
                name: content.name || template.title || "Untitled Template",
              }
            } catch (e) {
              console.error("Error parsing template content:", e)
              return null
            }
          })
          .filter((template) => template !== null)

        setTemplates(templatesData)
      } else {
        setTemplates([])
      }
    } catch (err) {
      console.error("Error fetching templates:", err)
      setError("Failed to load templates. Please try again.")
    }
  }

  const handleSaveTemplate = async () => {
    try {
      const token = sessionStorage.getItem("token")
      const userId = sessionStorage.getItem("user")

      if (!token || !userId) {
        setError("Please log in to save templates")
        return
      }

      if (!templateName.trim()) {
        setError("Please enter a template name")
        return
      }

      let content
      switch (selectedType) {
        case "flashcards":
          content = flashcards
          break
        case "fill_in_blank":
          content = fillInBlank
          break
        case "matching":
          content = matching
          break
        case "multiple_choice":
          content = multipleChoice
          break
        default:
          throw new Error("Invalid template type")
      }

      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: templateName,
          content: JSON.stringify({
            type: selectedType,
            content: content,
            name: templateName,
          }),
          type: "template",
          authorID: userId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      setSuccess(true)
      setTemplateName("") // Reset template name
      fetchTemplates() // Refresh the templates list

      // On mobile, switch to saved templates view after saving
      if (isMobile) {
        setMobileView("saved")
      }
    } catch (err) {
      console.error("Error saving template:", err)
      setError(err.message || "Failed to save template. Please try again.")
    }
  }

  const handleUseTemplate = (template) => {
    onSelectTemplate(template)
    onClose()
  }

  const handleTypeChange = (type) => {
    setSelectedType(type)
    setFlashcards([{ front: "", back: "" }])
    setFillInBlank([{ question: "", answer: "" }])
    setMatching([{ term: "", definition: "" }])
    setMultipleChoice([{ question: "", options: ["", "", "", ""], correctAnswer: 0 }])

    // On mobile, switch to form view after selecting type
    if (isMobile) {
      setMobileView("form")
      setDrawerOpen(false)
    }
  }

  const handleAddFlashcard = () => {
    setFlashcards([...flashcards, { front: "", back: "" }])
  }

  const handleRemoveFlashcard = (index) => {
    const newFlashcards = flashcards.filter((_, i) => i !== index)
    setFlashcards(newFlashcards.length ? newFlashcards : [{ front: "", back: "" }])
  }

  const handleFlashcardChange = (index, field, value) => {
    const newFlashcards = [...flashcards]
    newFlashcards[index][field] = value
    setFlashcards(newFlashcards)
  }

  const handleAddFillInBlank = () => {
    setFillInBlank([...fillInBlank, { question: "", answer: "" }])
  }

  const handleRemoveFillInBlank = (index) => {
    const newQuestions = fillInBlank.filter((_, i) => i !== index)
    setFillInBlank(newQuestions.length ? newQuestions : [{ question: "", answer: "" }])
  }

  const handleFillInBlankChange = (index, field, value) => {
    const newQuestions = [...fillInBlank]
    newQuestions[index][field] = value
    setFillInBlank(newQuestions)
  }

  const handleAddMatching = () => {
    setMatching([...matching, { term: "", definition: "" }])
  }

  const handleRemoveMatching = (index) => {
    const newMatching = matching.filter((_, i) => i !== index)
    setMatching(newMatching.length ? newMatching : [{ term: "", definition: "" }])
  }

  const handleMatchingChange = (index, field, value) => {
    const newMatching = [...matching]
    newMatching[index][field] = value
    setMatching(newMatching)
  }

  const handleAddMultipleChoice = () => {
    setMultipleChoice([
      ...multipleChoice,
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    ])
  }

  const handleRemoveMultipleChoice = (index) => {
    const newQuestions = multipleChoice.filter((_, i) => i !== index)
    setMultipleChoice(
      newQuestions.length
        ? newQuestions
        : [
            {
              question: "",
              options: ["", "", "", ""],
              correctAnswer: 0,
            },
          ],
    )
  }

  const handleMultipleChoiceChange = (index, field, value) => {
    const newQuestions = [...multipleChoice]
    if (field === "options") {
      newQuestions[index].options[value.index] = value.text
    } else {
      newQuestions[index][field] = value
    }
    setMultipleChoice(newQuestions)
  }

  const handlePreviewTemplate = (template) => {
    setPreviewTemplate(template)

    // On mobile, show preview in a dialog
    if (isMobile && template) {
      setDrawerOpen(true)
    }
  }

  const renderTemplatePreview = (template) => {
    if (!template) return null

    const content = template.content
    switch (template.type) {
      case "flashcards":
        return (
          <Box sx={{ width: "100%" }}>
            <Typography variant="h6" sx={{ mb: 2, ...fontStyle }}>
              Preview
            </Typography>
            {content.map((card, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ ...fontStyle }}>
                    Card {index + 1}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Front:
                      </Typography>
                      <Typography>{card.front}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Back:
                      </Typography>
                      <Typography>{card.back}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Box>
        )

      case "fill_in_blank":
        return (
          <Box sx={{ width: "100%" }}>
            <Typography variant="h6" sx={{ mb: 2, ...fontStyle }}>
              Preview
            </Typography>
            {content.map((item, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ ...fontStyle }}>
                    Question {index + 1}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Question:
                  </Typography>
                  <Typography>{item.question}</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                    Answer:
                  </Typography>
                  <Typography>{item.answer}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )

      case "matching":
        return (
          <Box sx={{ width: "100%" }}>
            <Typography variant="h6" sx={{ mb: 2, ...fontStyle }}>
              Preview
            </Typography>
            {content.map((item, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ ...fontStyle }}>
                    Pair {index + 1}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Term:
                      </Typography>
                      <Typography>{item.term}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Definition:
                      </Typography>
                      <Typography>{item.definition}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Box>
        )

      case "multiple_choice":
        return (
          <Box sx={{ width: "100%" }}>
            <Typography variant="h6" sx={{ mb: 2, ...fontStyle }}>
              Preview
            </Typography>
            {content.map((item, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ ...fontStyle }}>
                    Question {index + 1}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Question:
                  </Typography>
                  <Typography>{item.question}</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                    Options:
                  </Typography>
                  {item.options.map((option, optIndex) => (
                    <Typography key={optIndex}>
                      {optIndex + 1}. {option}
                      {optIndex === item.correctAnswer && (
                        <span style={{ color: "#4CAF50", marginLeft: "8px" }}>✓</span>
                      )}
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            ))}
          </Box>
        )

      default:
        return null
    }
  }

  const renderTemplateForm = () => {
    switch (selectedType) {
      case "flashcards":
        return (
          <Box sx={{ width: "100%" }}>
            {flashcards.map((card, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        ...fontStyle,
                        fontSize: { xs: "1rem", sm: "1.25rem" },
                      }}
                    >
                      Flashcard {index + 1}
                    </Typography>
                    <IconButton onClick={() => handleRemoveFlashcard(index)}>
                      <Trash2 size={isMobile ? 18 : 24} />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Front"
                        value={card.front}
                        onChange={(e) => handleFlashcardChange(index, "front", e.target.value)}
                        sx={{ ...fontStyle }}
                        inputProps={{ maxLength: 50 }}
                        size={isMobile ? "small" : "medium"}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Back"
                        value={card.back}
                        onChange={(e) => handleFlashcardChange(index, "back", e.target.value)}
                        sx={{ ...fontStyle }}
                        inputProps={{ maxLength: 50 }}
                        size={isMobile ? "small" : "medium"}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
            <Button
              startIcon={<Plus size={isMobile ? 16 : 20} />}
              onClick={handleAddFlashcard}
              sx={{
                mt: 2,
                bgcolor: "#1D6EF1",
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              Add Flashcard
            </Button>
          </Box>
        )

      case "fill_in_blank":
        return (
          <Box sx={{ width: "100%" }}>
            {fillInBlank.map((item, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        ...fontStyle,
                        fontSize: { xs: "1rem", sm: "1.25rem" },
                      }}
                    >
                      Question {index + 1}
                    </Typography>
                    <IconButton onClick={() => handleRemoveFillInBlank(index)}>
                      <Trash2 size={isMobile ? 18 : 24} />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            const newQuestions = [...fillInBlank]
                            newQuestions[index].question += " _____"
                            setFillInBlank(newQuestions)
                          }}
                          sx={{
                            ...fontStyle,
                            borderColor: "#1D6EF1",
                            color: "#1D6EF1",
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            "&:hover": {
                              borderColor: "#1557B0",
                              backgroundColor: "rgba(29, 110, 241, 0.1)",
                            },
                          }}
                          size={isMobile ? "small" : "medium"}
                        >
                          Add Blank
                        </Button>
                      </Box>
                      <TextField
                        fullWidth
                        label="Question"
                        value={item.question}
                        onChange={(e) => handleFillInBlankChange(index, "question", e.target.value)}
                        placeholder="Example: The capital of France is _____"
                        multiline
                        rows={isMobile ? 1 : 2}
                        sx={{
                          ...fontStyle,
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#F8F9FA",
                          },
                        }}
                        inputProps={{ maxLength: 80 }}
                        size={isMobile ? "small" : "medium"}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Correct Answer"
                        value={item.answer}
                        onChange={(e) => handleFillInBlankChange(index, "answer", e.target.value)}
                        placeholder="Example: Paris"
                        sx={{
                          ...fontStyle,
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#F8F9FA",
                          },
                        }}
                        inputProps={{ maxLength: 50 }}
                        size={isMobile ? "small" : "medium"}
                      />
                    </Grid>
                  </Grid>
                  {item.question && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: "#F8F9FA", borderRadius: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          mb: 1,
                          ...fontStyle,
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        }}
                      >
                        Preview:
                      </Typography>
                      <Typography
                        sx={{
                          ...fontStyle,
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                        }}
                      >
                        {item.question.split("_____").map((part, i, arr) => (
                          <span key={i}>
                            {part}
                            {i < arr.length - 1 && (
                              <Box
                                component="span"
                                sx={{
                                  display: "inline-block",
                                  minWidth: { xs: "80px", sm: "150px" },
                                  height: { xs: "20px", sm: "24px" },
                                  borderBottom: "2px dashed #1D6EF1",
                                  mx: 1,
                                  verticalAlign: "middle",
                                  position: "relative",
                                  "&::after": {
                                    content: '""',
                                    position: "absolute",
                                    bottom: "-2px",
                                    left: 0,
                                    right: 0,
                                    height: "2px",
                                    backgroundColor: "#1D6EF1",
                                  },
                                }}
                              />
                            )}
                          </span>
                        ))}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
            <Button
              startIcon={<Plus size={isMobile ? 16 : 20} />}
              onClick={handleAddFillInBlank}
              sx={{
                mt: 2,
                bgcolor: "#1D6EF1",
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              Add Question
            </Button>
          </Box>
        )

      case "matching":
        return (
          <Box sx={{ width: "100%" }}>
            {matching.map((item, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        ...fontStyle,
                        fontSize: { xs: "1rem", sm: "1.25rem" },
                      }}
                    >
                      Pair {index + 1}
                    </Typography>
                    <IconButton onClick={() => handleRemoveMatching(index)}>
                      <Trash2 size={isMobile ? 18 : 24} />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Term"
                        value={item.term}
                        onChange={(e) => handleMatchingChange(index, "term", e.target.value)}
                        sx={{ ...fontStyle }}
                        inputProps={{ maxLength: 50 }}
                        size={isMobile ? "small" : "medium"}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Definition"
                        value={item.definition}
                        onChange={(e) => handleMatchingChange(index, "definition", e.target.value)}
                        sx={{ ...fontStyle }}
                        inputProps={{ maxLength: 100 }}
                        size={isMobile ? "small" : "medium"}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
            <Button
              startIcon={<Plus size={isMobile ? 16 : 20} />}
              onClick={handleAddMatching}
              sx={{
                mt: 2,
                bgcolor: "#1D6EF1",
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              Add Pair
            </Button>
          </Box>
        )

      case "multiple_choice":
        return (
          <Box sx={{ width: "100%" }}>
            {multipleChoice.map((item, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        ...fontStyle,
                        fontSize: { xs: "1rem", sm: "1.25rem" },
                      }}
                    >
                      Question {index + 1}
                    </Typography>
                    <IconButton onClick={() => handleRemoveMultipleChoice(index)}>
                      <Trash2 size={isMobile ? 18 : 24} />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Question"
                        value={item.question}
                        onChange={(e) => handleMultipleChoiceChange(index, "question", e.target.value)}
                        sx={{ ...fontStyle }}
                        inputProps={{ maxLength: 80 }}
                        size={isMobile ? "small" : "medium"}
                      />
                    </Grid>
                    {item.options.map((option, optionIndex) => (
                      <Grid item xs={12} sm={6} key={optionIndex}>
                        <TextField
                          fullWidth
                          label={`Option ${optionIndex + 1}`}
                          value={option}
                          onChange={(e) =>
                            handleMultipleChoiceChange(index, "options", {
                              index: optionIndex,
                              text: e.target.value,
                            })
                          }
                          sx={{ ...fontStyle }}
                          inputProps={{ maxLength: 50 }}
                          size={isMobile ? "small" : "medium"}
                        />
                      </Grid>
                    ))}
                    <Grid item xs={12}>
                      <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                        <InputLabel>Correct Answer</InputLabel>
                        <Select
                          value={item.correctAnswer}
                          label="Correct Answer"
                          onChange={(e) => handleMultipleChoiceChange(index, "correctAnswer", e.target.value)}
                        >
                          {item.options.map((_, i) => (
                            <MenuItem key={i} value={i}>
                              Option {i + 1}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
            <Button
              startIcon={<Plus size={isMobile ? 16 : 20} />}
              onClick={handleAddMultipleChoice}
              sx={{
                mt: 2,
                bgcolor: "#1D6EF1",
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              Add Question
            </Button>
          </Box>
        )

      default:
        return null
    }
  }

  const fontStyle = {
    fontFamily: "SourGummy, sans-serif",
  }

  // Mobile navigation tabs
  const renderMobileTabs = () => (
    <Tabs
      value={mobileView}
      onChange={(_, newValue) => setMobileView(newValue)}
      variant="fullWidth"
      sx={{
        mb: 2,
        bgcolor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 1,
      }}
    >
      <Tab
        label="Types"
        value="types"
        sx={{
          ...fontStyle,
          fontSize: "0.875rem",
        }}
      />
      <Tab
        label="Form"
        value="form"
        sx={{
          ...fontStyle,
          fontSize: "0.875rem",
        }}
      />
      <Tab
        label="Saved"
        value="saved"
        sx={{
          ...fontStyle,
          fontSize: "0.875rem",
        }}
      />
    </Tabs>
  )

  // Mobile drawer for template preview
  const renderMobileDrawer = () => (
    <Drawer
      anchor="bottom"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      sx={{
        "& .MuiDrawer-paper": {
          maxHeight: "80vh",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          px: 2,
          py: 3,
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <IconButton onClick={() => setDrawerOpen(false)} sx={{ position: "absolute", top: -20, right: -10 }}>
          <X size={24} />
        </IconButton>

        {previewTemplate && (
          <>
            <Typography
              variant="h6"
              sx={{
                ...fontStyle,
                mb: 2,
                textAlign: "center",
              }}
            >
              {previewTemplate.name}
            </Typography>

            <Box sx={{ maxHeight: "calc(80vh - 120px)", overflowY: "auto", mb: 2 }}>
              {renderTemplatePreview(previewTemplate)}
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant="contained"
                onClick={() => handleUseTemplate(previewTemplate)}
                sx={{ bgcolor: "#1D6EF1" }}
              >
                Use Template
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  )

  return (
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: "#1D1D20",
        height: "100vh",
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        opacity: 1.0,
        overflow: "hidden",
        width: "100%",
        maxWidth: "100vw",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          height: "100%",
          py: 2,
          px: { xs: 1, sm: 2 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "white",
              ...fontStyle,
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
            }}
          >
            Template Manager
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <X size={isMobile ? 20 : 24} />
          </IconButton>
        </Box>

        {/* Mobile Tabs Navigation */}
        {isMobile && renderMobileTabs()}

        {/* Desktop and Tablet Layout */}
        {!isMobile && (
          <Box
            sx={{
              display: "flex",
              gap: 2,
              height: "calc(100% - 80px)",
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            {/* Template Type Selection */}
            <Box
              sx={{
                width: { sm: "100%", md: "200px" },
                flexShrink: 0,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: "white",
                  mb: 1,
                  ...fontStyle,
                  fontSize: { sm: "1.25rem", md: "1.5rem" },
                }}
              >
                Template Types
              </Typography>
              <Card
                sx={{
                  height: { md: "calc(100% - 40px)" },
                  mb: { sm: 2, md: 0 },
                }}
              >
                <CardContent sx={{ p: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { sm: "row", md: "column" },
                      gap: 1,
                      flexWrap: { sm: "wrap", md: "nowrap" },
                    }}
                  >
                    {["flashcards", "fill_in_blank", "matching", "multiple_choice"].map((type) => (
                      <Button
                        key={type}
                        variant={selectedType === type ? "contained" : "outlined"}
                        onClick={() => handleTypeChange(type)}
                        sx={{
                          justifyContent: "flex-start",
                          textTransform: "none",
                          ...fontStyle,
                          bgcolor: selectedType === type ? "#1D6EF1" : "transparent",
                          color: selectedType === type ? "white" : "#1D1D20",
                          "&:hover": {
                            bgcolor: selectedType === type ? "#1557B0" : "rgba(29, 110, 241, 0.1)",
                          },
                          py: 1,
                          px: 2,
                          flex: { sm: "1 0 calc(50% - 8px)", md: "0 0 auto" },
                        }}
                      >
                        {type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Button>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Template Form */}
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                order: { sm: 3, md: 2 },
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: "white",
                  mb: 1,
                  ...fontStyle,
                  fontSize: { sm: "1.25rem", md: "1.5rem" },
                }}
              >
                {selectedType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} Template
              </Typography>
              <Card
                sx={{
                  flexGrow: 1,
                  overflow: "auto",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <TextField
                    fullWidth
                    label="Template Name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    sx={{
                      mb: 2,
                      ...fontStyle,
                    }}
                    inputProps={{ maxLength: 20 }}
                    size={isTablet ? "small" : "medium"}
                  />
                  <Box
                    sx={{
                      flexGrow: 1,
                      overflow: "auto",
                      mb: 2,
                    }}
                  >
                    {renderTemplateForm()}
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button
                      variant="contained"
                      onClick={handleSaveTemplate}
                      disabled={!templateName.trim()}
                      sx={{
                        bgcolor: "#1D6EF1",
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                      }}
                      startIcon={<Save size={isTablet ? 16 : 20} />}
                    >
                      Save Template
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Saved Templates */}
            <Box
              sx={{
                width: { sm: "100%", md: "250px" },
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                order: { sm: 2, md: 3 },
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: "white",
                  mb: 1,
                  ...fontStyle,
                  fontSize: { sm: "1.25rem", md: "1.5rem" },
                }}
              >
                Saved Templates
              </Typography>
              <Card
                sx={{
                  flexGrow: 1,
                  overflow: "auto",
                }}
              >
                <CardContent sx={{ p: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    {templates.length > 0 ? (
                      templates.map((template) => (
                        <Box key={template.id}>
                          <Button
                            variant="outlined"
                            onClick={() => handlePreviewTemplate(template)}
                            sx={{
                              justifyContent: "flex-start",
                              textTransform: "none",
                              ...fontStyle,
                              color: "#1D1D20",
                              width: "100%",
                              py: 1,
                              px: 2,
                              "&:hover": {
                                bgcolor: "rgba(29, 110, 241, 0.1)",
                              },
                              fontSize: { xs: "0.875rem", sm: "1rem" },
                            }}
                          >
                            <BookOpen size={isTablet ? 14 : 16} style={{ marginRight: 8 }} />
                            {template.name}
                          </Button>
                          {previewTemplate?.id === template.id && !isMobile && (
                            <Box sx={{ mt: 1, p: 1, bgcolor: "#F8F9FA", borderRadius: 1 }}>
                              <Box
                                sx={{
                                  maxHeight: { sm: "150px", md: "200px" },
                                  overflow: "auto",
                                }}
                              >
                                {renderTemplatePreview(template)}
                              </Box>
                              <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
                                <Button
                                  variant="contained"
                                  onClick={() => handleUseTemplate(template)}
                                  sx={{
                                    bgcolor: "#1D6EF1",
                                    py: 0.5,
                                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                  }}
                                >
                                  Use Template
                                </Button>
                              </Box>
                            </Box>
                          )}
                        </Box>
                      ))
                    ) : (
                      <Box
                        sx={{
                          p: 2,
                          textAlign: "center",
                          color: "#666",
                        }}
                      >
                        <Typography sx={{ ...fontStyle }}>No saved templates yet</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}

        {/* Mobile Layout */}
        {isMobile && (
          <>
            {/* Types View */}
            {mobileView === "types" && (
              <Card sx={{ height: "calc(100% - 120px)", overflow: "auto" }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {["flashcards", "fill_in_blank", "matching", "multiple_choice"].map((type) => (
                      <Button
                        key={type}
                        variant={selectedType === type ? "contained" : "outlined"}
                        onClick={() => handleTypeChange(type)}
                        sx={{
                          justifyContent: "flex-start",
                          textTransform: "none",
                          ...fontStyle,
                          bgcolor: selectedType === type ? "#1D6EF1" : "transparent",
                          color: selectedType === type ? "white" : "#1D1D20",
                          "&:hover": {
                            bgcolor: selectedType === type ? "#1557B0" : "rgba(29, 110, 241, 0.1)",
                          },
                          py: 1.5,
                          px: 2,
                        }}
                      >
                        {type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Button>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Form View */}
            {mobileView === "form" && (
              <Card sx={{ height: "calc(100% - 120px)", overflow: "auto" }}>
                <CardContent sx={{ p: 1.5 }}>
                  <TextField
                    fullWidth
                    label="Template Name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    sx={{ mb: 2, ...fontStyle }}
                    inputProps={{ maxLength: 20 }}
                    size="small"
                  />
                  <Box sx={{ mb: 2 }}>{renderTemplateForm()}</Box>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Button
                      variant="contained"
                      onClick={handleSaveTemplate}
                      disabled={!templateName.trim()}
                      sx={{ bgcolor: "#1D6EF1" }}
                      startIcon={<Save size={16} />}
                    >
                      Save Template
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Saved Templates View */}
            {mobileView === "saved" && (
              <Card sx={{ height: "calc(100% - 120px)", overflow: "auto" }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {templates.length > 0 ? (
                      templates.map((template) => (
                        <Button
                          key={template.id}
                          variant="outlined"
                          onClick={() => handlePreviewTemplate(template)}
                          sx={{
                            justifyContent: "flex-start",
                            textTransform: "none",
                            ...fontStyle,
                            color: "#1D1D20",
                            width: "100%",
                            py: 1,
                            px: 2,
                            "&:hover": {
                              bgcolor: "rgba(29, 110, 241, 0.1)",
                            },
                          }}
                        >
                          <BookOpen size={16} style={{ marginRight: 8 }} />
                          {template.name}
                        </Button>
                      ))
                    ) : (
                      <Box sx={{ p: 2, textAlign: "center", color: "#666" }}>
                        <Typography sx={{ ...fontStyle }}>No saved templates yet</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </Container>

      {/* Mobile Preview Drawer */}
      {isMobile && renderMobileDrawer()}

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
          Template saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default TemplateManager

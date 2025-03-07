"use client"

import { useState, useEffect } from "react"
import { Box, Typography, Button, Card, CardContent, Container, TextField, Alert, Snackbar, Select, MenuItem, FormControl, InputLabel, IconButton, Grid, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material"
import { Plus, Trash2, BookOpen, X } from "lucide-react"
import background from "../assets/image3.png"

const API_BASE_URL = "https://webdev.cse.buffalo.edu/hci/api/api/droptable"

const TemplateManager = ({ onSelectTemplate, onClose }) => {
  const [templates, setTemplates] = useState([])
  const [selectedType, setSelectedType] = useState("flashcards")
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [previewTemplate, setPreviewTemplate] = useState(null)

  // Template states
  const [flashcards, setFlashcards] = useState([{ front: "", back: "" }])
  const [fillInBlank, setFillInBlank] = useState([{ question: "", answer: "" }])
  const [matching, setMatching] = useState([{ term: "", definition: "" }])
  const [multipleChoice, setMultipleChoice] = useState([{ 
    question: "", 
    options: ["", "", "", ""], 
    correctAnswer: 0 
  }])

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
        const templatesData = data[0].map(template => {
          try {
            const content = JSON.parse(template.content)
            return {
              id: template.id,
              type: content.type,
              content: content.content,
              name: content.name || template.title || "Untitled Template"
            }
          } catch (e) {
            console.error("Error parsing template content:", e)
            return null
          }
        }).filter(template => template !== null)
        
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
            name: templateName
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
  }

  const handleAddFlashcard = () => {
    setFlashcards([...flashcards, { front: "", back: "" }])
  }

  const handleRemoveFlashcard = (index) => {
    const newFlashcards = flashcards.filter((_, i) => i !== index)
    setFlashcards(newFlashcards)
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
    setFillInBlank(newQuestions)
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
    setMatching(newMatching)
  }

  const handleMatchingChange = (index, field, value) => {
    const newMatching = [...matching]
    newMatching[index][field] = value
    setMatching(newMatching)
  }

  const handleAddMultipleChoice = () => {
    setMultipleChoice([...multipleChoice, { 
      question: "", 
      options: ["", "", "", ""], 
      correctAnswer: 0 
    }])
  }

  const handleRemoveMultipleChoice = (index) => {
    const newQuestions = multipleChoice.filter((_, i) => i !== index)
    setMultipleChoice(newQuestions)
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
  }

  const renderTemplatePreview = (template) => {
    if (!template) return null

    const content = template.content
    switch (template.type) {
      case "flashcards":
        return (
          <Box sx={{ width: "100%" }}>
            <Typography variant="h6" sx={{ mb: 2, ...fontStyle }}>Preview</Typography>
            {content.map((card, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ ...fontStyle }}>Card {index + 1}</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>Front:</Typography>
                      <Typography>{card.front}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>Back:</Typography>
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
            <Typography variant="h6" sx={{ mb: 2, ...fontStyle }}>Preview</Typography>
            {content.map((item, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ ...fontStyle }}>Question {index + 1}</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>Question:</Typography>
                  <Typography>{item.question}</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>Answer:</Typography>
                  <Typography>{item.answer}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )

      case "matching":
        return (
          <Box sx={{ width: "100%" }}>
            <Typography variant="h6" sx={{ mb: 2, ...fontStyle }}>Preview</Typography>
            {content.map((item, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ ...fontStyle }}>Pair {index + 1}</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>Term:</Typography>
                      <Typography>{item.term}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>Definition:</Typography>
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
            <Typography variant="h6" sx={{ mb: 2, ...fontStyle }}>Preview</Typography>
            {content.map((item, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ ...fontStyle }}>Question {index + 1}</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>Question:</Typography>
                  <Typography>{item.question}</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>Options:</Typography>
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
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" sx={{ ...fontStyle }}>Flashcard {index + 1}</Typography>
                    <IconButton onClick={() => handleRemoveFlashcard(index)}>
                      <Trash2 />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Front"
                        value={card.front}
                        onChange={(e) => handleFlashcardChange(index, "front", e.target.value)}
                        sx={{ ...fontStyle }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Back"
                        value={card.back}
                        onChange={(e) => handleFlashcardChange(index, "back", e.target.value)}
                        sx={{ ...fontStyle }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
            <Button
              startIcon={<Plus />}
              onClick={handleAddFlashcard}
              sx={{ mt: 2, bgcolor: "#1D6EF1" }}
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
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" sx={{ ...fontStyle }}>Question {index + 1}</Typography>
                    <IconButton onClick={() => handleRemoveFillInBlank(index)}>
                      <Trash2 />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
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
                            "&:hover": {
                              borderColor: "#1557B0",
                              backgroundColor: "rgba(29, 110, 241, 0.1)",
                            }
                          }}
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
                        rows={2}
                        sx={{ 
                          ...fontStyle,
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#F8F9FA",
                          }
                        }}
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
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                  {item.question && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: "#F8F9FA", borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ color: "text.secondary", mb: 1, ...fontStyle }}>
                        Preview:
                      </Typography>
                      <Typography sx={{ ...fontStyle }}>
                        {item.question.split("_____").map((part, i, arr) => (
                          <span key={i}>
                            {part}
                            {i < arr.length - 1 && (
                              <Box
                                component="span"
                                sx={{
                                  display: "inline-block",
                                  minWidth: "150px",
                                  height: "24px",
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
                                  }
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
              startIcon={<Plus />}
              onClick={handleAddFillInBlank}
              sx={{ mt: 2, bgcolor: "#1D6EF1" }}
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
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" sx={{ ...fontStyle }}>Pair {index + 1}</Typography>
                    <IconButton onClick={() => handleRemoveMatching(index)}>
                      <Trash2 />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Term"
                        value={item.term}
                        onChange={(e) => handleMatchingChange(index, "term", e.target.value)}
                        sx={{ ...fontStyle }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Definition"
                        value={item.definition}
                        onChange={(e) => handleMatchingChange(index, "definition", e.target.value)}
                        sx={{ ...fontStyle }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
            <Button
              startIcon={<Plus />}
              onClick={handleAddMatching}
              sx={{ mt: 2, bgcolor: "#1D6EF1" }}
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
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" sx={{ ...fontStyle }}>Question {index + 1}</Typography>
                    <IconButton onClick={() => handleRemoveMultipleChoice(index)}>
                      <Trash2 />
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
                      />
                    </Grid>
                    {item.options.map((option, optionIndex) => (
                      <Grid item xs={12} key={optionIndex}>
                        <TextField
                          fullWidth
                          label={`Option ${optionIndex + 1}`}
                          value={option}
                          onChange={(e) => handleMultipleChoiceChange(index, "options", {
                            index: optionIndex,
                            text: e.target.value
                          })}
                          sx={{ ...fontStyle }}
                        />
                      </Grid>
                    ))}
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Correct Answer</InputLabel>
                        <Select
                          value={item.correctAnswer}
                          label="Correct Answer"
                          onChange={(e) => handleMultipleChoiceChange(index, "correctAnswer", e.target.value)}
                        >
                          {item.options.map((_, i) => (
                            <MenuItem key={i} value={i}>Option {i + 1}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
            <Button
              startIcon={<Plus />}
              onClick={handleAddMultipleChoice}
              sx={{ mt: 2, bgcolor: "#1D6EF1" }}
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
      }}
    >
      <Container maxWidth="lg" sx={{ height: "100%", py: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h4" sx={{ color: "white", ...fontStyle }}>
            Template Manager
          </Typography>
          <IconButton 
            onClick={onClose}
            sx={{ 
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              }
            }}
          >
            <X size={24} />
          </IconButton>
        </Box>
        <Box sx={{ display: "flex", gap: 2, height: "calc(100% - 80px)" }}>
          {/* Template Type Selection */}
          <Box sx={{ width: "200px", flexShrink: 0 }}>
            <Typography variant="h5" sx={{ color: "white", mb: 1, ...fontStyle }}>
              Template Types
            </Typography>
            <Card sx={{ height: "calc(100% - 40px)" }}>
              <CardContent sx={{ p: 1 }}>
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
                        py: 1,
                        px: 2,
                      }}
                    >
                      {type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Template Form */}
          <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
            <Typography variant="h5" sx={{ color: "white", mb: 1, ...fontStyle }}>
              {selectedType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())} Template
            </Typography>
            <Card sx={{ flexGrow: 1, overflow: "auto" }}>
              <CardContent sx={{ p: 2 }}>
                <TextField
                  fullWidth
                  label="Template Name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  sx={{ mb: 2, ...fontStyle }}
                />
                <Box sx={{ height: "calc(100% - 120px)", overflow: "auto" }}>
                  {renderTemplateForm()}
                </Box>
                <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    onClick={handleSaveTemplate}
                    disabled={!templateName.trim()}
                    sx={{ bgcolor: "#1D6EF1" }}
                  >
                    Save Template
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Saved Templates */}
          <Box sx={{ width: "250px", flexShrink: 0, display: "flex", flexDirection: "column" }}>
            <Typography variant="h5" sx={{ color: "white", mb: 1, ...fontStyle }}>
              Saved Templates
            </Typography>
            <Card sx={{ flexGrow: 1, overflow: "auto" }}>
              <CardContent sx={{ p: 1 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {templates.map((template) => (
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
                        }}
                      >
                        <BookOpen size={16} style={{ marginRight: 8 }} />
                        {template.name}
                      </Button>
                      {previewTemplate?.id === template.id && (
                        <Box sx={{ mt: 1, p: 1, bgcolor: "#F8F9FA", borderRadius: 1 }}>
                          <Box sx={{ maxHeight: "200px", overflow: "auto" }}>
                            {renderTemplatePreview(template)}
                          </Box>
                          <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
                            <Button
                              variant="contained"
                              onClick={() => handleUseTemplate(template)}
                              sx={{ bgcolor: "#1D6EF1", py: 0.5 }}
                            >
                              Use Template
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
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
          Template saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default TemplateManager 
"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { Box, Typography, Button, Card, CardContent, Container, TextField, Alert, Snackbar, Select, MenuItem, FormControl, InputLabel, IconButton, Grid, Dialog } from "@mui/material"
import { Upload as UploadIcon, Share2, BookOpen, Plus, Trash2, X, CheckCircle2 } from "lucide-react"
import { BackgroundContext } from "../App"
import TemplateManager from "./TemplateManager"

const API_BASE_URL = "https://webdev.cse.buffalo.edu/hci/api/api/droptable"

const Upload = () => {
  const { currentBackground } = useContext(BackgroundContext);
  const navigate = useNavigate()
  const [studySetName, setStudySetName] = useState("")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [selectedCommunity, setSelectedCommunity] = useState("")
  const [communities, setCommunities] = useState([])
  const [showTemplateManager, setShowTemplateManager] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [templateType, setTemplateType] = useState("")
  const [templateContent, setTemplateContent] = useState("")
  const [templateName, setTemplateName] = useState("")

  // Add this function to get the base URL
  const getBaseUrl = () => {
    // Check if we're in production by looking for the specific domain
    const isProduction = window.location.hostname.includes('webdev.cse.buffalo.edu');
    
    if (isProduction) {
      // In production, include the full path
      return `${window.location.origin}/hci/teams/droptable`;
    } else {
      // In development, just use the origin
      return window.location.origin;
    }
  };

  // Fetch communities when component mounts
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const token = sessionStorage.getItem("token")
        
        // Get all communities
        const response = await fetch(`${API_BASE_URL}/groups`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (!response.ok) {
          throw new Error("Failed to fetch communities")
        }
        
        const data = await response.json()
        
        // Transform the API response to match our expected format
        if (data && data[0]) {
          const communitiesData = data[0].map(community => ({
            id: community.id,
            name: community.name,
            description: community.attributes?.description || "No description available"
          }))
          setCommunities(communitiesData)
        } else {
          setCommunities([])
        }
      } catch (err) {
        console.error("Error fetching communities:", err)
        setError("Failed to load communities")
      }
    }
    fetchCommunities()
  }, [])

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
    setTemplateType(template.type)
    setTemplateContent(template.content)
    setTemplateName(template.name)
  }

  const createPost = async () => {
    const token = sessionStorage.getItem("token")
    const userId = sessionStorage.getItem("user")
    
    if (!userId) {
      throw new Error("User not found. Please log in again.")
    }

    // Ensure we have valid content
    if (!selectedTemplate || !selectedTemplate.content) {
      throw new Error("Invalid template selected")
    }

    // Ensure we have a valid community ID
    if (!selectedCommunity) {
      throw new Error("Please select a community")
    }

    // Keep the original string value for attributes
    const communityIdString = String(selectedCommunity)
    
    // Simplify the post data to match what works in CommunityView.jsx
    const postData = {
      content: JSON.stringify({
        name: studySetName,
        type: selectedTemplate.type || "flashcards",
        content: selectedTemplate.content || [],
        communityId: communityIdString
      }),
      type: "study_set",
      authorID: parseInt(userId),
      attributes: {
        description: "Study set created by Anonymous",
        communityId: communityIdString
      }
    }

    console.log("Sending post data:", postData)
    console.log("Creating study set for community ID:", communityIdString)
    console.log("JSON content:", postData.content)

    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      })

      if (!response.ok) {
        let errorMessage = "Failed to create study set"
        try {
          const errorData = await response.json()
          console.error("Error response:", errorData)
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          const errorText = await response.text()
          console.error("Error response text:", errorText)
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log("Success response:", result)
      
      // Now that we have the post ID, update it with the groupID
      try {
        console.log("Updating post with community information...")
        const updateResponse = await fetch(`${API_BASE_URL}/posts/${result.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            attributes: {
              ...result.attributes,
              communityId: communityIdString
            }
          }),
        })
        
        if (updateResponse.ok) {
          console.log("Successfully updated post attributes")
        } else {
          console.warn("Failed to update post attributes, but post was created")
        }
      } catch (updateError) {
        console.warn("Error updating post attributes, but post was created:", updateError)
      }
      
      return result
    } catch (error) {
      console.error("Error creating post:", error)
      throw error
    }
  }

  const handleUpload = async () => {
    try {
      setUploading(true)
      setError(null)

      if (!selectedCommunity) {
        throw new Error("Please select a community")
      }

      if (!selectedTemplate) {
        throw new Error("Please select a template")
      }

      if (!studySetName.trim()) {
        throw new Error("Please enter a name for your study set")
      }

      // Create a post with the template content
      console.log("Creating study set...")
      const result = await createPost()
      console.log("Study set created successfully:", result)

      setSuccess(true)
      // Reset form
      setStudySetName("")
      setSelectedCommunity("")
      setSelectedTemplate(null)
      
      // Show a more detailed success message
      setTimeout(() => {
        // If the user wants to view the study set in the community
        if (window.confirm("Study set created successfully! Would you like to view it in the community?")) {
          // Use the communityId from the result if available, otherwise use selectedCommunity
          const communityToView = result.attributes?.communityId || selectedCommunity
          
          // Use the correct URL format for both local and production environments
          const communityViewUrl = `/community/view/${communityToView}`;
          navigate(communityViewUrl);
        }
      }, 500);
    } catch (err) {
      console.error("Error in handleUpload:", err)
      setError(err.message || "Failed to create study set. Please try again.")
      
      // Show a more detailed error message
      alert(`Error: ${err.message || "Failed to create study set. Please try again."}`)
    } finally {
      setUploading(false)
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
        minHeight: "100vh",
        backgroundImage: `url(${currentBackground.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        opacity: 1.0,
      }}
    >
      <Container maxWidth="md" sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh',
        py: 4
      }}>
        <Box
          sx={{
            bgcolor: "#FFFFFF",
            py: 8,
            px: 4,
            width: '100%',
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
              fontSize: "52px",
            }}
          >
            Create Your Study Set
          </Typography>
          <Typography
            variant="h5"
            align="center"
            color="#1D1D20"
            paragraph
            sx={{
              fontFamily: "SourGummy, sans-serif",
              fontWeight: 600,
              fontSize: "26px",
            }}
          >
            Choose a template and create your study set
          </Typography>

          <Box sx={{ mt: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <TextField
              fullWidth
              label="Study Set Name"
              variant="outlined"
              value={studySetName}
              onChange={(e) => setStudySetName(e.target.value)}
              disabled={uploading}
              sx={{
                maxWidth: "600px",
                "& .MuiOutlinedInput-root": {
                  fontFamily: "SourGummy, sans-serif",
                },
                "& .MuiInputLabel-root": {
                  fontFamily: "SourGummy, sans-serif",
                },
              }}
              inputProps={{ maxLength: 30 }}
            />

            <Button
              variant="contained"
              onClick={() => setShowTemplateManager(true)}
              sx={{ 
                maxWidth: "600px",
                width: "100%",
                bgcolor: "#1D6EF1",
                "&:hover": {
                  bgcolor: "#1557B0",
                },
                fontFamily: "SourGummy, sans-serif",
                fontWeight: 600,
                fontSize: "18px",
                py: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <BookOpen size={24} />
                <Typography>Select Template</Typography>
              </Box>
            </Button>

            {selectedTemplate && (
              <Box sx={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 2,
                maxWidth: "600px",
                width: "100%",
                bgcolor: "#F8F9FA",
                p: 2,
                borderRadius: 1,
                border: "1px solid #E9ECEF"
              }}>
                <CheckCircle2 size={20} color="#1D6EF1" />
                <Typography sx={{ 
                  ...fontStyle,
                  color: "#1D1D20",
                  fontWeight: 500,
                  fontSize: "16px"
                }}>
                  Current template selected: {selectedTemplate.name}
                </Typography>
              </Box>
            )}

            <FormControl fullWidth sx={{ maxWidth: "600px" }}>
              <InputLabel>Select Community</InputLabel>
              <Select
                value={selectedCommunity}
                label="Select Community"
                onChange={(e) => setSelectedCommunity(e.target.value)}
                disabled={uploading}
              >
                {communities.map((community) => (
                  <MenuItem key={community.id} value={community.id}>
                    {community.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedCommunity && (
              <Box sx={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 2,
                maxWidth: "600px",
                width: "100%",
                bgcolor: "#F8F9FA",
                p: 2,
                borderRadius: 1,
                border: "1px solid #E9ECEF"
              }}>
                <CheckCircle2 size={20} color="#1D6EF1" />
                <Typography sx={{ 
                  ...fontStyle,
                  color: "#1D1D20",
                  fontWeight: 500,
                  fontSize: "16px"
                }}>
                  Study set will be uploaded to: {communities.find(c => c.id === selectedCommunity)?.name || 'selected community'}
                </Typography>
              </Box>
            )}

            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!studySetName || !selectedCommunity || !selectedTemplate || uploading}
              sx={{
                bgcolor: "#EF7B6C",
                "&:hover": {
                  bgcolor: "#e66a59",
                },
                fontFamily: "SourGummy, sans-serif",
                fontWeight: 600,
                fontSize: "18px",
                px: 4,
                py: 1,
              }}
            >
              {uploading ? "Posting..." : `Post "${studySetName}" to ${communities.find(c => c.id === selectedCommunity)?.name || 'community'}`}
            </Button>
          </Box>
        </Box>
      </Container>

      <Dialog
        open={showTemplateManager}
        onClose={() => setShowTemplateManager(false)}
        maxWidth="lg"
        fullWidth
      >
        <TemplateManager
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplateManager(false)}
        />
      </Dialog>

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
          Study set created successfully!
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Upload


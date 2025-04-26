"use client"
//The code for the upload page was assisted with the help of ChatGPT
import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Typography,
  Button,
  Container,
  TextField,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Dialog,
  FormControlLabel,
  Switch,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from "@mui/material"
import { BookOpen, CheckCircle2, Lock, Unlock, Users } from "lucide-react"
import { BackgroundContext } from "../App"
import TemplateManager from "./TemplateManager"
import text from "../text.json"

const API_BASE_URL = "https://webdev.cse.buffalo.edu/hci/api/api/droptable"

const Upload = () => {
  const { currentBackground, language } = useContext(BackgroundContext)
  const navigate = useNavigate()
  const langKey = language === "English" ? "en" : "es"
  const uploadText = text[langKey].upload
  
  const [studySetName, setStudySetName] = useState("")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedCommunity, setSelectedCommunity] = useState("")
  const [communities, setCommunities] = useState([])
  const [showTemplateManager, setShowTemplateManager] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [membersOnly, setMembersOnly] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState([])
  const [accessType, setAccessType] = useState("everyone") // "everyone", "allMembers", "specificMembers"
  const [communityMembers, setCommunityMembers] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedTags, setSelectedTags] = useState([])

  // Add a new state for custom popups
  const [customPopup, setCustomPopup] = useState({
    show: false,
    message: "",
    type: "success",
    postId: null,
    communityId: null,
  })

  // School categories for tag selection
  const school_categories = {
    [text[langKey].categories.Math]: text[langKey].school_categories.Math,
    [text[langKey].categories.Science]: text[langKey].school_categories.Science,
    [text[langKey].categories.Literature]: text[langKey].school_categories.Literature,
    [text[langKey].categories.History]: text[langKey].school_categories.History,
    [text[langKey].categories.Geography]: text[langKey].school_categories.Geography,
    [text[langKey].categories["Foreign Languages"]]: text[langKey].school_categories["Foreign Languages"],
    [text[langKey].categories.Art]: text[langKey].school_categories.Art,
    [text[langKey].categories.Music]: text[langKey].school_categories.Music,
    [text[langKey].categories["Physical Education"]]: text[langKey].school_categories["Physical Education"],
    [text[langKey].categories.Technology]: text[langKey].school_categories.Technology,
    [text[langKey].categories["Business Studies"]]: text[langKey].school_categories["Business Studies"],
    [text[langKey].categories.Philosophy]: text[langKey].school_categories.Philosophy,
    [text[langKey].categories.Psychology]: text[langKey].school_categories.Psychology,
    [text[langKey].categories.Sociology]: text[langKey].school_categories.Sociology,
    [text[langKey].categories.Economics]: text[langKey].school_categories.Economics,
    [text[langKey].categories["Health Education"]]: text[langKey].school_categories["Health Education"],
    [text[langKey].categories["Home Economics"]]: text[langKey].school_categories["Home Economics"],
    [text[langKey].categories["Public Speaking"]]: text[langKey].school_categories["Public Speaking"],
    [text[langKey].categories["Technology & Engineering"]]: text[langKey].school_categories["Technology & Engineering"],
    [text[langKey].categories.Debate]: text[langKey].school_categories.Debate,
    [text[langKey].categories["Environmental Science"]]: text[langKey].school_categories["Environmental Science"],
    [text[langKey].categories.Theatre]: text[langKey].school_categories.Theatre,
    [text[langKey].categories.Law]: text[langKey].school_categories.Law,
    [text[langKey].categories.Education]: text[langKey].school_categories.Education,
    [text[langKey].categories["Career Development"]]: text[langKey].school_categories["Career Development"],
  }

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
          const communitiesData = data[0].map((community) => ({
            id: community.id,
            name: community.name,
            description: community.attributes?.description || "No description available",
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

  // Fetch community members when a community is selected
  useEffect(() => {
    if (selectedCommunity) {
      fetchCommunityMembers(selectedCommunity)
    } else {
      setCommunityMembers([])
    }
  }, [selectedCommunity])

  const fetchCommunityMembers = async (communityId) => {
    try {
      const token = sessionStorage.getItem("token")
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/group-members?groupID=${communityId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch community members")
      }

      const data = await response.json()

      if (data && data[0] && data[0].length > 0) {
        // Fetch user details for each member
        const membersWithDetails = await Promise.all(
            data[0].map(async (member) => {
              try {
                const userResponse = await fetch(`${API_BASE_URL}/users/${member.userID}`, {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                })

                if (!userResponse.ok) {
                  return {
                    id: member.id,
                    userID: member.userID,
                    email: "Unknown User",
                    isAdmin: false,
                  }
                }

                const userData = await userResponse.json()
                return {
                  id: member.id,
                  userID: member.userID,
                  email: userData.email,
                  isAdmin: false, // We don't have owner info here
                }
              } catch (error) {
                console.error("Error fetching user details:", error)
                return {
                  id: member.id,
                  userID: member.userID,
                  email: "Unknown User",
                  isAdmin: false,
                }
              }
            }),
        )
        setCommunityMembers(membersWithDetails)
      } else {
        setCommunityMembers([])
      }
    } catch (err) {
      console.error("Error fetching community members:", err)
      setCommunityMembers([])
    }
  }

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
    setSelectedCategories(template.categories || [])
    setSelectedTags(template.tags || [])
  }

  const createPost = async () => {
    const token = sessionStorage.getItem("token")
    const userId = sessionStorage.getItem("user")

    if (!userId) {
      throw new Error(uploadText.errorUserNotFound)
    }

    // Ensure we have valid content
    if (!selectedTemplate || !selectedTemplate.content) {
      throw new Error(uploadText.errorInvalidTemplate)
    }

    // Ensure we have a valid community ID
    if (!selectedCommunity) {
      throw new Error(uploadText.errorSelectCommunity)
    }

    // Keep the original string value for attributes
    const communityIdString = String(selectedCommunity)

    // Simplify the post data to match what works in CommunityView.jsx
    const postData = {
      content: JSON.stringify({
        name: studySetName,
        type: selectedTemplate.type || "flashcards",
        content: selectedTemplate.content || [],
        communityId: communityIdString,
        categories: selectedCategories,
        tags: selectedTags,
      }),
      type: "study_set",
      authorID: Number.parseInt(userId),
      attributes: {
        description: "Study set created by Anonymous",
        communityId: communityIdString,
        categories: selectedCategories,
        tags: selectedTags,
      },
    }

    console.log("Sending post data:", postData)
    console.log("Creating study set for community ID:", communityIdString)
    console.log("JSON content:", postData.content)
    console.log("Members only:", membersOnly)
    console.log("Access type:", accessType)
    console.log("Selected members:", selectedMembers)
    console.log("Selected categories:", selectedCategories)
    console.log("Selected tags:", selectedTags)

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
              communityId: communityIdString,
              membersOnly: membersOnly,
              accessType: accessType,
              selectedMembers: accessType === "specificMembers" ? selectedMembers : [],
              categories: selectedCategories,
              tags: selectedTags,
            },
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
        throw new Error(uploadText.errorSelectCommunity)
      }

      if (!selectedTemplate) {
        throw new Error(uploadText.errorInvalidTemplate)
      }

      if (!studySetName.trim()) {
        throw new Error(uploadText.errorEmptyName)
      }

      // Check if specific members option is selected but no members chosen
      if (accessType === "specificMembers" && selectedMembers.length === 0) {
        throw new Error(uploadText.errorSelectMembers)
      }

      // Create a post with the template content
      console.log("Creating study set...")
      const result = await createPost()
      console.log("Study set created successfully:", result)

      // Reset form
      setStudySetName("")
      setSelectedCommunity("")
      setSelectedTemplate(null)
      setMembersOnly(false)
      setSelectedMembers([])
      setAccessType("everyone")
      setSelectedCategories([])
      setSelectedTags([])

      // Show success popup with a button to view the post
      setTimeout(() => {
        setCustomPopup({
          show: true,
          message: uploadText.successStudySetCreated,
          type: "success",
          postId: result.id,
          communityId: result.attributes?.communityId || selectedCommunity,
        })
      }, 500)
    } catch (err) {
      console.error("Error in handleUpload:", err)
      setError(err.message || uploadText.errorFailedCreateStudySet)

      // Replace the error alert in the catch block with custom popup
      setCustomPopup({
        show: true,
        message: `Error: ${err.message || uploadText.errorFailedCreateStudySet}`,
        type: "error",
      })
    } finally {
      setUploading(false)
    }
  }

  const fontStyle = {
    fontFamily: "SourGummy, sans-serif",
  }

  const handleCategorySelect = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
      // Also remove any tags from this category
      setSelectedTags(selectedTags.filter((tag) => !school_categories[category].includes(tag)))
    } else if (selectedCategories.length < 3) {
      setSelectedCategories([...selectedCategories, category])
    } else {
      setError("You can select up to 3 categories")
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleTagSelect = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag])
    } else {
      setError("You can select up to 5 tags")
      setTimeout(() => setError(null), 3000)
    }
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
                  fontSize: "52px",
                }}
            >
              {uploadText.title}
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
              {uploadText.subtitle}
            </Typography>

            <Box sx={{ mt: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <TextField
                  fullWidth
                  label={uploadText.labelStudySetName}
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
                  <Typography>{uploadText.buttonSelectTemplate}</Typography>
                </Box>
              </Button>

              {selectedTemplate && (
                  <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        maxWidth: "600px",
                        width: "100%",
                        bgcolor: "#F8F9FA",
                        p: 2,
                        borderRadius: 1,
                        border: "1px solid #E9ECEF",
                      }}
                  >
                    <CheckCircle2 size={20} color="#1D6EF1" />
                    <Typography
                        sx={{
                          ...fontStyle,
                          color: "#1D1D20",
                          fontWeight: 500,
                          fontSize: "16px",
                        }}
                    >
                      {uploadText.currentTemplateSelected.replace("{{templateName}}", selectedTemplate.name)}
                    </Typography>
                  </Box>
              )}

              <FormControl fullWidth sx={{ maxWidth: "600px" }}>
                <InputLabel>{uploadText.labelSelectCommunity}</InputLabel>
                <Select
                    value={selectedCommunity}
                    label={uploadText.labelSelectCommunity}
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
                  <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        maxWidth: "600px",
                        width: "100%",
                        bgcolor: "#F8F9FA",
                        p: 2,
                        borderRadius: 1,
                        border: "1px solid #E9ECEF",
                      }}
                  >
                    <CheckCircle2 size={20} color="#1D6EF1" />
                    <Typography
                        sx={{
                          ...fontStyle,
                          color: "#1D1D20",
                          fontWeight: 500,
                          fontSize: "16px",
                        }}
                    >
                      {uploadText.studySetUploadedTo.replace("{{communityName}}", communities.find((c) => c.id === selectedCommunity)?.name || "selected community")}
                    </Typography>
                  </Box>
              )}

              <Typography
                  variant="h6"
                  sx={{
                    fontFamily: "SourGummy, sans-serif",
                    mb: 2,
                    mt: 1,
                    maxWidth: "600px",
                    width: "100%",
                    color: "#1D1D20",
                  }}
              >
                {uploadText.accessControlTitle}
              </Typography>

              <FormControl component="fieldset" sx={{ maxWidth: "600px", width: "100%" }}>
                <Typography sx={{ fontFamily: "SourGummy, sans-serif", mb: 1, fontSize: "14px", color: "#1D1D20" }}>
                  {uploadText.questionWhoCanView}
                </Typography>
                <Grid container direction="column" spacing={1}>
                  <Grid item>
                    <FormControlLabel
                        value="everyone"
                        control={
                          <Switch
                              checked={accessType === "everyone"}
                              onChange={() => {
                                setAccessType("everyone")
                                setMembersOnly(false)
                                setSelectedMembers([])
                              }}
                              color="primary"
                          />
                        }
                        label={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Unlock size={16} />
                            <Typography sx={{ fontFamily: "SourGummy, sans-serif", color: "#1D1D20" }}>
                              {uploadText.optionEveryone}
                            </Typography>
                          </Box>
                        }
                        sx={{
                          "& .MuiFormControlLabel-label": {
                            fontFamily: "SourGummy, sans-serif",
                          },
                        }}
                    />
                  </Grid>

                  <Grid item>
                    <FormControlLabel
                        value="allMembers"
                        control={
                          <Switch
                              checked={accessType === "allMembers"}
                              onChange={() => {
                                setAccessType("allMembers")
                                setMembersOnly(true)
                                setSelectedMembers([])
                              }}
                              color="primary"
                          />
                        }
                        label={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Lock size={16} />
                            <Typography sx={{ fontFamily: "SourGummy, sans-serif", color: "#1D1D20" }}>
                              {uploadText.optionAllMembers}
                            </Typography>
                          </Box>
                        }
                        sx={{
                          "& .MuiFormControlLabel-label": {
                            fontFamily: "SourGummy, sans-serif",
                          },
                        }}
                    />
                  </Grid>

                  <Grid item>
                    <FormControlLabel
                        value="specificMembers"
                        control={
                          <Switch
                              checked={accessType === "specificMembers"}
                              onChange={() => {
                                setAccessType("specificMembers")
                                setMembersOnly(true)
                              }}
                              color="primary"
                          />
                        }
                        label={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Users size={16} />
                            <Typography sx={{ fontFamily: "SourGummy, sans-serif", color: "#1D1D20" }}>
                              {uploadText.optionSpecificMembers}
                            </Typography>
                          </Box>
                        }
                        sx={{
                          "& .MuiFormControlLabel-label": {
                            fontFamily: "SourGummy, sans-serif",
                          },
                        }}
                    />
                  </Grid>
                </Grid>
              </FormControl>

              {accessType === "specificMembers" && selectedCommunity && (
                  <FormControl fullWidth sx={{ maxWidth: "600px", mt: 2 }}>
                    <InputLabel id="member-selection-label" sx={{ fontFamily: "SourGummy, sans-serif" }}>
                      {uploadText.labelSelectMembers}
                    </InputLabel>
                    <Select
                        labelId="member-selection-label"
                        id="member-selection"
                        multiple
                        value={selectedMembers}
                        onChange={(e) => {
                          console.log("Selected members:", e.target.value)
                          setSelectedMembers(e.target.value)
                        }}
                        input={<OutlinedInput label={uploadText.labelSelectMembers} />}
                        renderValue={(selected) => (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                              {selected.map((value) => {
                                const member = communityMembers.find((m) => m.userID === value || m.id === value)
                                return (
                                    <Chip
                                        key={value}
                                        label={member ? member.email : `Member ${value}`}
                                        sx={{ fontFamily: "SourGummy, sans-serif" }}
                                    />
                                )
                              })}
                            </Box>
                        )}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 224,
                              width: 250,
                            },
                          },
                          anchorOrigin: {
                            vertical: "bottom",
                            horizontal: "left",
                          },
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            fontFamily: "SourGummy, sans-serif",
                          },
                          "& .MuiInputLabel-root": {
                            fontFamily: "SourGummy, sans-serif",
                          },
                        }}
                    >
                      {communityMembers.length > 0 ? (
                          communityMembers.map((member) => (
                              <MenuItem key={member.userID || member.id} value={member.userID || member.id}>
                                <Checkbox
                                    checked={selectedMembers.includes(member.userID) || selectedMembers.includes(member.id)}
                                />
                                <ListItemText
                                    primary={
                                      <Typography sx={{ fontFamily: "SourGummy, sans-serif", color: "#1D1D20" }}>
                                        {member.email} {member.isAdmin ? " (Admin)" : ""}
                                      </Typography>
                                    }
                                />
                              </MenuItem>
                          ))
                      ) : (
                          <MenuItem disabled>
                            <Typography sx={{ fontFamily: "SourGummy, sans-serif", color: "#1D1D20" }}>
                              {uploadText.noMembersFound}
                            </Typography>
                          </MenuItem>
                      )}
                    </Select>
                    <Typography
                        variant="caption"
                        sx={{ mt: 1, fontFamily: "SourGummy, sans-serif", color: "#1D1D20", display: "block" }}
                    >
                      {uploadText.infoOnlySelectedMembers}
                    </Typography>
                  </FormControl>
              )}

              <Typography
                  variant="h6"
                  sx={{
                    fontFamily: "SourGummy, sans-serif",
                    mb: 2,
                    mt: 1,
                    maxWidth: "600px",
                    width: "100%",
                    color: "#1D1D20",
                  }}
              >
                {uploadText.categoriesTagsTitle}
              </Typography>

              <Box sx={{ maxWidth: "600px", width: "100%" }}>
                <Typography sx={{ fontFamily: "SourGummy, sans-serif", mb: 1, fontSize: "14px", color: "#1D1D20" }}>
                  {uploadText.instructionSelectCategories}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  {Object.keys(school_categories).map((category) => (
                      <Chip
                          key={category}
                          label={category}
                          onClick={() => handleCategorySelect(category)}
                          color={selectedCategories.includes(category) ? "primary" : "default"}
                          sx={{
                            fontFamily: "SourGummy, sans-serif",
                            bgcolor: selectedCategories.includes(category) ? "#1D6EF1" : "#F4FDFF",
                            color: selectedCategories.includes(category) ? "white" : "#1D1D20",
                            "&:hover": {
                              bgcolor: selectedCategories.includes(category) ? "#1557B0" : "#E9ECEF",
                            },
                          }}
                      />
                  ))}
                </Box>
                <Typography
                    variant="caption"
                    sx={{ display: "block", mb: 2, fontFamily: "SourGummy, sans-serif", color: "#1D1D20" }}
                >
                  {uploadText.selectedCategoriesCount.replace("{{count}}", selectedCategories.length)}
                </Typography>

                {selectedCategories.length > 0 && (
                    <>
                      <Typography sx={{ fontFamily: "SourGummy, sans-serif", mb: 1, fontSize: "14px", color: "#1D1D20" }}>
                        {uploadText.instructionSelectTags}
                      </Typography>
                      {selectedCategories.map((category) => (
                          <Box key={category} sx={{ mb: 2 }}>
                            <Typography
                                variant="subtitle2"
                                sx={{ fontFamily: "SourGummy, sans-serif", mb: 1, color: "#1D1D20" }}
                            >
                              {uploadText.categoryTagLabel.replace("{{category}}", category)}
                            </Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                              {school_categories[category].map((tag) => (
                                  <Chip
                                      key={tag}
                                      label={tag}
                                      onClick={() => handleTagSelect(tag)}
                                      color={selectedTags.includes(tag) ? "primary" : "default"}
                                      sx={{
                                        fontFamily: "SourGummy, sans-serif",
                                        bgcolor: selectedTags.includes(tag) ? "#1D6EF1" : "#F4FDFF",
                                        color: selectedTags.includes(tag) ? "white" : "#1D1D20",
                                        "&:hover": {
                                          bgcolor: selectedTags.includes(tag) ? "#1557B0" : "#E9ECEF",
                                        },
                                      }}
                                  />
                              ))}
                            </Box>
                          </Box>
                      ))}
                      <Typography
                          variant="caption"
                          sx={{ display: "block", mb: 2, fontFamily: "SourGummy, sans-serif", color: "#1D1D20" }}
                      >
                        {uploadText.selectedTagsCount.replace("{{count}}", selectedTags.length)}
                      </Typography>
                    </>
                )}
              </Box>

              <Button
                  variant="contained"
                  onClick={handleUpload}
                  disabled={
                      !studySetName ||
                      !selectedCommunity ||
                      !selectedTemplate ||
                      uploading ||
                      (accessType === "specificMembers" && selectedMembers.length === 0)
                  }
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
                    maxWidth: "600px",
                    width: "100%",
                  }}
              >
                {uploading
                    ? uploadText.posting
                    : uploadText.buttonPost
                        .replace("{{studySetName}}", studySetName)
                        .replace("{{communityName}}", communities.find((c) => c.id === selectedCommunity)?.name || "community")}
              </Button>
            </Box>
          </Box>
        </Container>

        {customPopup.show && (
            <Box
                sx={{
                  position: "fixed",
                  top: "20px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 9999,
                  width: "90%",
                  maxWidth: "500px",
                  borderRadius: "4px",
                  backgroundColor: customPopup.type === "success" ? "#d4edda" : "#f8d7da",
                  color: customPopup.type === "success" ? "#155724" : "#721c24",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {customPopup.type === "success" ? (
                    <CheckCircle2 size={20} color="#155724" />
                ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#721c24" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                )}
                <Typography
                    sx={{
                      fontFamily: "SourGummy, sans-serif",
                      fontWeight: 500,
                      fontSize: "16px",
                    }}
                >
                  {customPopup.message}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {customPopup.type === "success" && customPopup.communityId && (
                    <Button
                        onClick={() => {
                          const communityViewUrl = `/community/view/${customPopup.communityId}`
                          navigate(communityViewUrl)
                          setCustomPopup({ ...customPopup, show: false })
                        }}
                        sx={{
                          fontFamily: "SourGummy, sans-serif",
                          color: "#1D6EF1",
                          textTransform: "none",
                          fontSize: "14px",
                          padding: "4px 8px",
                          minWidth: "auto",
                          "&:hover": {
                            backgroundColor: "rgba(29, 110, 241, 0.1)",
                          },
                        }}
                    >
                      {uploadText.buttonSeePost}
                    </Button>
                )}

                <Button
                    onClick={() => setCustomPopup({ ...customPopup, show: false })}
                    sx={{
                      minWidth: "auto",
                      p: 0,
                      color: customPopup.type === "success" ? "#155724" : "#721c24",
                      "&:hover": {
                        backgroundColor: "transparent",
                      },
                    }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </Button>
              </Box>
            </Box>
        )}

        <Dialog open={showTemplateManager} onClose={() => setShowTemplateManager(false)} maxWidth="lg" fullWidth>
          <TemplateManager 
            onSelectTemplate={handleTemplateSelect} 
            onClose={() => setShowTemplateManager(false)}
            language={language}
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
      </Box>
  )
}

export default Upload

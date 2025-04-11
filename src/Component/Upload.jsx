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

const API_BASE_URL = "https://webdev.cse.buffalo.edu/hci/api/api/droptable"

// Style for the multiselect dropdown
const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
}

const Upload = () => {
  const { currentBackground } = useContext(BackgroundContext)
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

  const [membersOnly, setMembersOnly] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState([])
  const [accessType, setAccessType] = useState("everyone") // "everyone", "allMembers", "specificMembers"
  const [communityMembers, setCommunityMembers] = useState([])

  const [currentStep, setCurrentStep] = useState(1) // 1: Name, 2: Template, 3: Content, 4: Tags
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const isMobile = window.innerWidth <= 768

  // School categories for tag selection
  const school_categories = {
    Math: [
      "Algebra",
      "Geometry",
      "Calculus",
      "Trigonometry",
      "Statistics",
      "Probability",
      "Functions",
      "Matrices",
      "Equations",
      "Graphs",
    ],
    Science: [
      "Physics",
      "Chemistry",
      "Biology",
      "Earth Science",
      "Astronomy",
      "Genetics",
      "Ecology",
      "Laboratory",
      "Periodic Table",
      "Experiments",
    ],
    Literature: [
      "Novels",
      "Poetry",
      "Shakespeare",
      "Analysis",
      "Short Stories",
      "Fiction",
      "Non-fiction",
      "Literary Devices",
      "Themes",
      "Book Reviews",
    ],
    History: [
      "Ancient Civilizations",
      "World Wars",
      "U.S. History",
      "Revolutions",
      "Geography",
      "Historical Figures",
      "Wars",
      "Presidents",
      "Political Movements",
      "Artifacts",
    ],
    Geography: [
      "Maps",
      "Countries",
      "Capitals",
      "Climate",
      "Landforms",
      "Physical Geography",
      "Urbanization",
      "Migration",
      "Natural Resources",
      "Time Zones",
    ],
    "Foreign Languages": [
      "Spanish",
      "French",
      "German",
      "Italian",
      "Chinese",
      "Japanese",
      "Vocabulary",
      "Grammar",
      "Pronunciation",
      "Language Exchange",
    ],
    Art: [
      "Painting",
      "Sculpture",
      "Drawing",
      "Digital Art",
      "Art History",
      "Canvas",
      "Portraits",
      "Abstract",
      "Artists",
      "Creativity",
    ],
    Music: [
      "Instruments",
      "Composers",
      "Genres",
      "Music Theory",
      "Choir",
      "Band",
      "Symphony",
      "Singing",
      "Sheet Music",
      "Rhythm",
    ],
    "Physical Education": [
      "Sports",
      "Fitness",
      "Exercises",
      "Health",
      "Endurance",
      "Teamwork",
      "Running",
      "Strength Training",
      "Flexibility",
      "Physical Health",
    ],
    Technology: [
      "Coding",
      "Software",
      "Hardware",
      "Programming",
      "Artificial Intelligence",
      "Web Development",
      "Robotics",
      "Cybersecurity",
      "Databases",
      "Machine Learning",
    ],
    "Business Studies": [
      "Economics",
      "Finance",
      "Marketing",
      "Entrepreneurship",
      "Accounting",
      "Management",
      "Business Plans",
      "Investment",
      "Trade",
      "Corporations",
    ],
    Philosophy: [
      "Ethics",
      "Logic",
      "Metaphysics",
      "Epistemology",
      "Plato",
      "Aristotle",
      "Morality",
      "Knowledge",
      "Free Will",
      "Political Philosophy",
    ],
    Psychology: [
      "Behavior",
      "Cognition",
      "Mental Health",
      "Emotions",
      "Motivation",
      "Perception",
      "Social Psychology",
      "Developmental Psychology",
      "Therapy",
      "Neuroscience",
    ],
    Sociology: [
      "Society",
      "Culture",
      "Social Change",
      "Inequality",
      "Groups",
      "Socialization",
      "Deviance",
      "Families",
      "Education Systems",
      "Race & Ethnicity",
    ],
    Economics: [
      "Supply and Demand",
      "Inflation",
      "GDP",
      "Trade",
      "Markets",
      "Microeconomics",
      "Macroeconomics",
      "Economic Systems",
      "Resources",
      "Taxes",
    ],
    "Health Education": [
      "Nutrition",
      "Mental Health",
      "Wellness",
      "Exercise",
      "Hygiene",
      "Diseases",
      "Prevention",
      "Vaccines",
      "Sexual Health",
      "First Aid",
    ],
    "Home Economics": [
      "Cooking",
      "Sewing",
      "Budgeting",
      "Interior Design",
      "Childcare",
      "Household Management",
      "Nutrition",
      "Textiles",
      "Family Planning",
      "Sustainability",
    ],
    "Public Speaking": [
      "Presentations",
      "Rhetoric",
      "Speech Writing",
      "Communication Skills",
      "Confidence",
      "Debates",
      "Persuasion",
      "Audience",
      "Body Language",
      "Speech Delivery",
    ],
    "Technology & Engineering": [
      "Robotics",
      "Engineering Design",
      "CAD (Computer-Aided Design)",
      "Prototyping",
      "Electronics",
      "Renewable Energy",
      "Structural Engineering",
      "Computer Engineering",
      "3D Printing",
      "Programming",
    ],
    Debate: [
      "Argumentation",
      "Persuasion",
      "Logical Fallacies",
      "Evidence",
      "Counterarguments",
      "Rhetorical Strategies",
      "Public Speaking",
      "Research",
      "Debating Styles",
      "Cross-examination",
    ],
    "Environmental Science": [
      "Ecosystems",
      "Conservation",
      "Climate Change",
      "Pollution",
      "Sustainability",
      "Renewable Energy",
      "Biodiversity",
      "Recycling",
      "Environmental Policy",
      "Environmental Impact",
    ],
    Theatre: [
      "Acting",
      "Stage Design",
      "Directing",
      "Playwriting",
      "Auditions",
      "Performances",
      "Costumes",
      "Set Construction",
      "Lighting",
      "Rehearsals",
    ],
    Law: [
      "Legal Studies",
      "Constitutional Law",
      "Criminal Law",
      "Civil Law",
      "Contracts",
      "Courts",
      "Lawyers",
      "Law Enforcement",
      "Legal Systems",
      "Human Rights",
    ],
    Education: [
      "Pedagogy",
      "Classroom Management",
      "Learning Styles",
      "Curriculum Development",
      "Assessment",
      "Special Education",
      "Teaching Strategies",
      "Technology in Education",
      "Teacher Training",
      "Online Learning",
    ],
    "Career Development": [
      "Job Search",
      "Internships",
      "Networking",
      "Resumes",
      "Interviews",
      "Professional Skills",
      "Career Pathways",
      "Entrepreneurship",
      "Certifications",
      "Personal Branding",
    ],
  }

  // Add this function to get the base URL
  const getBaseUrl = () => {
    // Check if we're in production by looking for the specific domain
    const isProduction = window.location.hostname.includes("webdev.cse.buffalo.edu")

    if (isProduction) {
      // In production, include the full path
      return `${window.location.origin}/hci/teams/droptable`
    } else {
      // In development, just use the origin
      return window.location.origin
    }
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
    setTemplateType(template.type)
    setTemplateContent(template.content)
    setTemplateName(template.name)

    // Extract categories and tags from the template if they exist
    if (template.categories && Array.isArray(template.categories)) {
      setSelectedCategories(template.categories)
    }

    if (template.tags && Array.isArray(template.tags)) {
      setSelectedTags(template.tags)
    }
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
        throw new Error("Please select a community")
      }

      if (!selectedTemplate) {
        throw new Error("Please select a template")
      }

      if (!studySetName.trim()) {
        throw new Error("Please enter a name for your study set")
      }

      // Check if specific members option is selected but no members chosen
      if (accessType === "specificMembers" && selectedMembers.length === 0) {
        throw new Error("Please select at least one member who can access this study set")
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
      setMembersOnly(false)
      setSelectedMembers([])
      setAccessType("everyone")
      setSelectedCategories([])
      setSelectedTags([])
      setCurrentStep(1)

      // Show a more detailed success message
      setTimeout(() => {
        // If the user wants to view the study set in the community
        if (window.confirm("Study set created successfully! Would you like to view it in the community?")) {
          // Use the communityId from the result if available, otherwise use selectedCommunity
          const communityToView = result.attributes?.communityId || selectedCommunity

          // Use the correct URL format for both local and production environments
          const communityViewUrl = `/community/view/${communityToView}`
          navigate(communityViewUrl)
        }
      }, 500)
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

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
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
                      Study set will be uploaded to:{" "}
                      {communities.find((c) => c.id === selectedCommunity)?.name || "selected community"}
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
                Access Control
              </Typography>

              <FormControl component="fieldset" sx={{ maxWidth: "600px", width: "100%" }}>
                <Typography sx={{ fontFamily: "SourGummy, sans-serif", mb: 1, fontSize: "14px", color: "#1D1D20" }}>
                  Who can view this study set?
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
                              Everyone - Study set visible to all users
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
                              Community Members Only - Only visible to anyone who joined the community
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
                              Specific Members - Choose exactly who can see this study set
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

              {/* Show member selection when specific members option is chosen */}
              {accessType === "specificMembers" && selectedCommunity && (
                  <FormControl fullWidth sx={{ maxWidth: "600px", mt: 2 }}>
                    <InputLabel id="member-selection-label" sx={{ fontFamily: "SourGummy, sans-serif" }}>
                      Select Members
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
                        input={<OutlinedInput label="Select Members" />}
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
                              No members found in this community
                            </Typography>
                          </MenuItem>
                      )}
                    </Select>
                    <Typography
                        variant="caption"
                        sx={{ mt: 1, fontFamily: "SourGummy, sans-serif", color: "#1D1D20", display: "block" }}
                    >
                      Only selected members will be able to view this study set
                    </Typography>
                  </FormControl>
              )}

              {/* Categories and Tags Section */}
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
                Categories & Tags
              </Typography>

              <Box sx={{ maxWidth: "600px", width: "100%" }}>
                <Typography sx={{ fontFamily: "SourGummy, sans-serif", mb: 1, fontSize: "14px", color: "#1D1D20" }}>
                  Select Categories (up to 3)
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
                  Selected: {selectedCategories.length}/3
                </Typography>

                {selectedCategories.length > 0 && (
                    <>
                      <Typography sx={{ fontFamily: "SourGummy, sans-serif", mb: 1, fontSize: "14px", color: "#1D1D20" }}>
                        Select Tags (up to 5)
                      </Typography>
                      {selectedCategories.map((category) => (
                          <Box key={category} sx={{ mb: 2 }}>
                            <Typography
                                variant="subtitle2"
                                sx={{ fontFamily: "SourGummy, sans-serif", mb: 1, color: "#1D1D20" }}
                            >
                              {category} Tags:
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
                        Selected: {selectedTags.length}/5
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
                    ? "Posting..."
                    : `Post "${studySetName}" to ${communities.find((c) => c.id === selectedCommunity)?.name || "community"}`}
              </Button>
            </Box>
          </Box>
        </Container>

        <Dialog open={showTemplateManager} onClose={() => setShowTemplateManager(false)} maxWidth="lg" fullWidth>
          <TemplateManager onSelectTemplate={handleTemplateSelect} onClose={() => setShowTemplateManager(false)} />
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

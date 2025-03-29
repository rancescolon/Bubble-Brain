"use client"

import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  Snackbar,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import { LogOut, Save, Upload, Users } from "lucide-react"
import background from "../assets/image3.png"

// Custom styled components following style guide
const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    color: "black",
    fontSize: "1.2rem",
    "& fieldset": {
      borderColor: "rgba(0, 0, 0, 0.23)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(0, 0, 0, 0.5)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#1D6EF1",
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(0, 0, 0, 0.7)",
    fontSize: "1.1rem",
    fontWeight: 500,
  },
}))

const SaveButton = styled(Button)({
  backgroundColor: "#5B8C5A",
  color: "white",
  fontSize: "1.1rem",
  fontWeight: 600,
  "&:hover": {
    backgroundColor: "#48BB78",
  },
})

const ActionButton = styled(Button)({
  backgroundColor: "#1D6EF1",
  color: "white",
  fontSize: "1.1rem",
  fontWeight: 600,
  "&:hover": {
    backgroundColor: "#1555BC",
  },
})

const LogoutButton = styled(Button)({
  backgroundColor: "#DC2626",
  color: "white",
  "&:hover": {
    backgroundColor: "#B91C1C",
  },
})

const API_BASE_URL = "https://webdev.cse.buffalo.edu/hci/api/api/droptable"

export default function Profile() {
  const [profilePic, setProfilePic] = useState("")
  const [username, setUsername] = useState("")
  // eslint-disable-next-line no-unused-vars
  const [firstName, setFirstName] = useState("")
  // eslint-disable-next-line no-unused-vars
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  // eslint-disable-next-line no-unused-vars
  const [uploadedStudySets, setUploadedStudySets] = useState([])
  const [myCommunities, setMyCommunities] = useState([])
  const [studyStats, setStudyStats] = useState({
    totalTime: 0,
    recentSets: [],
    loading: true,
    error: null,
  })
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" })
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    name: "",
    picture: "",
  })
  // eslint-disable-next-line no-unused-vars
  const [newUsername, setNewUsername] = useState("")

  // Theme and responsive breakpoints
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"))

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
    const storedPic = sessionStorage.getItem("profilePicture")
    const storedUsername = sessionStorage.getItem("username")
    const storedFirstName = sessionStorage.getItem("firstname")
    const storedLastName = sessionStorage.getItem("lastname")
    const storedEmail = sessionStorage.getItem("email")

    if (storedPic) setProfilePic(storedPic)
    if (storedUsername) setUsername(storedUsername)
    if (storedFirstName) setFirstName(storedFirstName)
    if (storedLastName) setLastName(storedLastName)
    if (storedEmail) setEmail(storedEmail)

    fetchUserData()
    fetchStudyStats()
    fetchUserStudySets()
    fetchUserCommunities()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserData = async () => {
    try {
      const userId = sessionStorage.getItem("user")
      const token = sessionStorage.getItem("token")

      if (!userId || !token) {
        throw new Error("User not authenticated")
      }

      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch user data")
      }

      const data = await response.json()
      console.log("User data:", data)

      const name = data.attributes?.name || data.name || sessionStorage.getItem("name")

      const username = data.attributes?.username || data.username || data.email?.split("@")[0] || "Not provided"

      setUserData({
        username: username,
        email: data.email || "Not provided",
        name: name,
        picture: data.attributes?.picture || data.picture || sessionStorage.getItem("profilePicture") || "",
      })

      setNewUsername(username)
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  const fetchStudyStats = async () => {
    try {
      const token = sessionStorage.getItem("token")
      const userStr = sessionStorage.getItem("user")
      console.log("Raw user string from session:", userStr)
      console.log("Token exists:", !!token)

      if (!token || !userStr) {
        console.error("Missing token or user data")
        setStudyStats((prev) => ({ ...prev, loading: false, error: "Please log in to view study statistics" }))
        return
      }

      let userId
      try {
        const parsed = JSON.parse(userStr)
        if (typeof parsed === "object" && parsed !== null && parsed.id) {
          userId = parsed.id
        } else if (typeof parsed === "number" || !isNaN(Number(parsed))) {
          userId = Number(parsed)
        } else {
          throw new Error("Invalid user data format")
        }
        console.log("Extracted user ID:", userId)
      } catch (e) {
        if (!isNaN(Number(userStr))) {
          userId = Number(userStr)
          console.log("Using raw user ID:", userId)
        } else {
          console.error("Error parsing user data:", e)
          setStudyStats((prev) => ({ ...prev, loading: false, error: "Invalid user data" }))
          return
        }
      }

      const postsUrl = `${API_BASE_URL}/posts?authorID=${userId}`
      console.log("Making posts API request to:", postsUrl)

      const postsResponse = await fetch(postsUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!postsResponse.ok) {
        throw new Error(`Failed to fetch posts data: ${await postsResponse.text()}`)
      }

      const postsData = await postsResponse.json()
      console.log("All posts response:", postsData)

      const studyTimeLogs =
        postsData[0]?.filter((post) => {
          console.log("Checking post for study time:", post)

          if (post.postType === "study_time") {
            console.log("Found study time post by postType:", post.id)
            return true
          }

          try {
            const content = JSON.parse(post.content || "{}")
            console.log("Parsed content for post", post.id, ":", content)

            if (content.type === "study_time") {
              console.log("Found study time post by content type:", post.id)
              return true
            }

            if (post.attributes && post.attributes.type === "study_time") {
              console.log("Found study time post by attributes:", post.id)
              return true
            }

            return false
          } catch (e) {
            console.warn("Error parsing post content:", post.id, e)
            return false
          }
        }) || []

      console.log("Filtered study time logs:", studyTimeLogs)

      let totalTime = 0
      const setStats = new Map()

      studyTimeLogs.forEach((log) => {
        try {
          if (!log.content) {
            console.warn("Log missing content:", log)
            return
          }

          let content
          try {
            content = JSON.parse(log.content)
            console.log("Processing study time log:", content)
          } catch (e) {
            console.error("Error parsing log content:", e)
            return
          }

          const duration = content.duration || (log.attributes && log.attributes.duration)
          const studySetId = content.studySetId || (log.attributes && log.attributes.studySetId)
          const studySetTitle = content.studySetTitle || content.name || "Unknown Set"

          if (!duration) {
            console.warn("Log missing duration:", content)
            return
          }

          console.log("Adding duration:", duration, "for set:", studySetTitle)
          totalTime += duration

          if (studySetId) {
            const key = studySetId.toString()
            if (!setStats.has(key)) {
              setStats.set(key, {
                id: studySetId,
                title: studySetTitle,
                totalTime: 0,
                lastStudied: content.timestamp || new Date().toISOString(),
              })
            }

            const stats = setStats.get(key)
            stats.totalTime += duration
            if (
              content.timestamp &&
              (!stats.lastStudied || new Date(content.timestamp) > new Date(stats.lastStudied))
            ) {
              stats.lastStudied = content.timestamp
            }
          }
        } catch (parseError) {
          console.error("Error processing log:", parseError, log)
        }
      })

      const recentSets = Array.from(setStats.values())
        .sort((a, b) => new Date(b.lastStudied) - new Date(a.lastStudied))
        .slice(0, 3)

      console.log("Final processed stats:", { totalTime, recentSets })

      setStudyStats({
        totalTime,
        recentSets,
        loading: false,
        error: null,
      })
    } catch (error) {
      console.error("Error in fetchStudyStats:", error)
      setStudyStats((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to load study statistics",
      }))
    }
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`
    }
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${remainingSeconds}s`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleSaveUsername = async () => {
    try {
      const userId = sessionStorage.getItem("user")
      const token = sessionStorage.getItem("token")

      if (!userId || !token) {
        throw new Error("User not authenticated")
      }

      if (!username.trim()) {
        setNotification({
          open: true,
          message: "Username cannot be empty",
          severity: "error",
        })
        return
      }

      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          attributes: {
            username: username,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update username")
      }

      // Update local state
      setUserData((prev) => ({
        ...prev,
        username: username,
      }))

      // Store in session storage for easy access
      sessionStorage.setItem("username", username)

      setNotification({
        open: true,
        message: "Username updated successfully",
        severity: "success",
      })
    } catch (error) {
      console.error("Error updating username:", error)
      setNotification({
        open: true,
        message: "Failed to update username",
        severity: "error",
      })
    }
  }

  const handleLogout = () => {
    // Implement the logic to log out the user
    console.log("Logging out")
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("user")
    sessionStorage.removeItem("profilePicture")
    sessionStorage.removeItem("username")
    sessionStorage.removeItem("firstname")
    sessionStorage.removeItem("lastname")
    sessionStorage.removeItem("email")
    navigate("/login")
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result
        setProfilePic(base64String)
        sessionStorage.setItem("profilePicture", base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  const fetchUserStudySets = async () => {
    try {
      const token = sessionStorage.getItem("token")
      const userId = sessionStorage.getItem("user")
      if (!userId) return
      const response = await fetch(`${API_BASE_URL}/posts?type=study_set&authorID=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to fetch study sets")
      const data = await response.json()
      const parsedStudySets = data.map((set) => {
        let studySetContent = {}
        try {
          studySetContent = JSON.parse(set.content)
        } catch {}
        return {
          id: set.id,
          name: studySetContent?.name || "Unnamed Study Set",
          communityId: set.attributes?.communityId || null,
        }
      })
      setUploadedStudySets(parsedStudySets)
    } catch (error) {
      console.error("Error fetching study sets:", error)
    }
  }

  const fetchUserCommunities = async () => {
    try {
      const token = sessionStorage.getItem("token")
      if (!token) return
      const response = await fetch(`${API_BASE_URL}/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to fetch communities")
      const data = await response.json()
      const user = JSON.parse(sessionStorage.getItem("user"))
      if (user) {
        const userCommunities = data[0].filter((group) => group.ownerID === user.id)
        setMyCommunities(userCommunities)
      }
    } catch (error) {
      console.error("Error fetching communities:", error)
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100vw",
        overflowX: "hidden",
        bgcolor: "#1b1b1b",
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        py: 3,
        px: { xs: 1, sm: 2, md: 3 },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          maxHeight: { xs: "100vh", sm: "90vh" },
          overflowY: "auto",
          px: { xs: 1, sm: 2 },
        }}
      >
        <Stack spacing={2}>
          {/* Top Row */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
            }}
          >
            {/* Profile Information */}
            <Card
              sx={{
                bgcolor: "white",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                flex: 1,
                width: "100%",
              }}
            >
              <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                    alignItems: "center",
                    height: "100%",
                    pl: { xs: 1, sm: 2, md: 4 },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 0.5,
                      pl: { xs: 0, sm: 2 },
                    }}
                  >
                    <Box
                      component="img"
                      src={profilePic || "/placeholder.svg"}
                      alt="Profile"
                      sx={{
                        width: { xs: 80, sm: 100 },
                        height: { xs: 80, sm: 100 },
                        borderRadius: "50%",
                        border: "3px solid #1D6EF1",
                        cursor: "pointer",
                        objectFit: "cover",
                      }}
                      onClick={() => fileInputRef.current.click()}
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      style={{ display: "none" }}
                    />
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      width: "100%",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#1D1D20",
                        fontWeight: 800,
                        fontSize: { xs: "1rem", sm: "1.1rem" },
                        textAlign: "center",
                      }}
                    >
                      Profile Information
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          flexWrap: { xs: "wrap", sm: "nowrap" },
                          justifyContent: { xs: "center", sm: "flex-start" },
                          width: "100%",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#1D1D20",
                            fontWeight: 500,
                            textAlign: { xs: "center", sm: "left" },
                          }}
                        >
                          Current Username:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#1D1D20",
                            textAlign: { xs: "center", sm: "left" },
                            wordBreak: "break-word",
                          }}
                        >
                          {userData.username || username}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          flexWrap: { xs: "wrap", sm: "nowrap" },
                          justifyContent: { xs: "center", sm: "flex-start" },
                          width: "100%",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#1D1D20",
                            fontWeight: 500,
                            textAlign: { xs: "center", sm: "left" },
                          }}
                        >
                          Email:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#1D1D20",
                            textAlign: { xs: "center", sm: "left" },
                            wordBreak: "break-word",
                          }}
                        >
                          {userData.email || email}
                        </Typography>
                      </Box>
                      <LogoutButton
                        startIcon={<LogOut size={16} />}
                        onClick={handleLogout}
                        sx={{
                          height: "32px",
                          fontSize: "0.9rem",
                          mt: { xs: 1, sm: 0 },
                        }}
                      >
                        Logout
                      </LogoutButton>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Profile Actions */}
            <Card
              sx={{
                bgcolor: "white",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                flex: 1,
                width: "100%",
              }}
            >
              <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#1D1D20",
                    fontWeight: 800,
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                    mb: 1,
                    textAlign: "center",
                  }}
                >
                  Profile Actions
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      flexDirection: { xs: "column", sm: "row" },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#1D1D20",
                        fontWeight: 500,
                        textAlign: { xs: "center", sm: "left" },
                      }}
                    >
                      New Username:
                    </Typography>
                    <StyledTextField
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      size="small"
                      sx={{
                        width: { xs: "100%", sm: "150px" },
                        "& .MuiOutlinedInput-root": {
                          fontSize: { xs: "1rem", sm: "1.2rem" },
                        },
                      }}
                    />
                  </Box>
                  <SaveButton
                    startIcon={<Save size={16} />}
                    onClick={handleSaveUsername}
                    sx={{
                      height: "32px",
                      fontSize: "0.9rem",
                      mt: { xs: 1, sm: 0 },
                    }}
                  >
                    Save
                  </SaveButton>
                </Box>
              </CardContent>
            </Card>

            {/* Streak Box */}
            <Card
              sx={{
                bgcolor: "white",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                flex: 1,
                width: "100%",
                display: { xs: "none", md: "block" }, // Hide on mobile to save space
              }}
            >
              <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#1D1D20",
                    mb: 1,
                    fontWeight: "bold",
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                    textAlign: "center",
                  }}
                >
                  Current Streak
                </Typography>
                <Box sx={{ textAlign: "center", py: 0.5 }}>
                  <Typography sx={{ color: "#6B7280" }}>No streak tracked yet</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Bottom Row */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
            }}
          >
            {/* Left Column */}
            <Stack
              spacing={2}
              sx={{
                flex: 1,
                width: "100%",
              }}
            >
              {/* Quick Actions */}
              <Card
                sx={{
                  bgcolor: "white",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                  height: { xs: "auto", md: "calc(50% - 8px)" },
                }}
              >
                <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#1D1D20",
                      mb: 1,
                      fontWeight: "bold",
                      fontSize: { xs: "1rem", sm: "1.1rem" },
                      textAlign: { xs: "center", sm: "left" },
                    }}
                  >
                    Quick Actions
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      height: { xs: "auto", md: "calc(100% - 40px)" },
                      justifyContent: "space-between",
                      py: 2,
                    }}
                  >
                    <ActionButton
                      startIcon={<Upload size={isMobile ? 16 : 20} />}
                      onClick={() => navigate("/upload")}
                      fullWidth
                      sx={{
                        height: { xs: "40px", sm: "48px" },
                        fontSize: { xs: "0.9rem", sm: "1.1rem" },
                      }}
                    >
                      Upload Study Set
                    </ActionButton>
                    <ActionButton
                      startIcon={<Users size={isMobile ? 16 : 20} />}
                      onClick={() => navigate("/community")}
                      fullWidth
                      sx={{
                        height: { xs: "40px", sm: "48px" },
                        fontSize: { xs: "0.9rem", sm: "1.1rem" },
                      }}
                    >
                      Join Community
                    </ActionButton>
                  </Box>
                </CardContent>
              </Card>

              {/* Communities */}
              <Card
                sx={{
                  bgcolor: "white",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                  height: { xs: "auto", md: "calc(50% - 8px)" },
                }}
              >
                <CardContent sx={{ p: { xs: 1, sm: 1.5 } }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#1D1D20",
                      mb: 1.5,
                      fontWeight: "bold",
                      fontSize: { xs: "1rem", sm: "1.1rem" },
                      textAlign: { xs: "center", sm: "left" },
                    }}
                  >
                    Your Communities
                  </Typography>
                  <Box
                    sx={{
                      maxHeight: { xs: "150px", sm: "180px" },
                      overflowY: "auto",
                      border: "1px solid #E5E7EB",
                      borderRadius: 1,
                      p: 1,
                    }}
                  >
                    {myCommunities.length > 0 ? (
                      <Stack spacing={1}>
                        {myCommunities.map((community) => (
                          <Box
                            key={community.id}
                            sx={{
                              bgcolor: "#C5EDFD",
                              p: { xs: 1, sm: 1.25 },
                              borderRadius: 1,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              "&:hover": {
                                bgcolor: "#97C7F1",
                              },
                            }}
                            onClick={() => navigate(`/community/view/${community.id}`)}
                          >
                            <Box
                              sx={{
                                bgcolor: "#1D6EF1",
                                borderRadius: "50%",
                                width: { xs: 24, sm: 28 },
                                height: { xs: 24, sm: 28 },
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                mr: { xs: 0.75, sm: 1.25 },
                              }}
                            >
                              {community.name.charAt(0).toUpperCase()}
                            </Box>
                            <Typography
                              sx={{
                                color: "#1D1D20",
                                fontWeight: 500,
                                fontSize: { xs: "0.875rem", sm: "1rem" },
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {community.name}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Box sx={{ bgcolor: "#F9FAFB", p: 1.5, borderRadius: 1, textAlign: "center" }}>
                        <Typography sx={{ color: "#6B7280" }}>No communities yet</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Stack>

            {/* Right Column - Study Statistics */}
            <Card
              sx={{
                bgcolor: "white",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                flex: 1,
                width: "100%",
              }}
            >
              <CardContent sx={{ p: { xs: 1, sm: 1.5 } }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#1D1D20",
                    mb: 1,
                    fontWeight: "bold",
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                    textAlign: { xs: "center", sm: "left" },
                  }}
                >
                  Study Statistics
                </Typography>
                {studyStats.loading ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "16px",
                      py: 2,
                    }}
                  >
                    <Box
                      sx={{
                        animation: "spin 1s linear infinite",
                        height: "8px",
                        width: "8px",
                        borderRadius: "50%",
                        borderWidth: "2px",
                        borderStyle: "solid",
                        borderColor: "transparent",
                        borderBottomColor: "gray",
                        "@keyframes spin": {
                          "0%": {
                            transform: "rotate(0deg)",
                          },
                          "100%": {
                            transform: "rotate(360deg)",
                          },
                        },
                      }}
                    />
                  </Box>
                ) : studyStats.error ? (
                  <Typography
                    sx={{
                      color: "red",
                      textAlign: "center",
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    {studyStats.error}
                  </Typography>
                ) : (
                  <Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        sx={{
                          fontSize: { xs: "1rem", sm: "1.125rem" },
                          mb: 0.5,
                          textAlign: { xs: "center", sm: "left" },
                        }}
                      >
                        Total Study Time
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: { xs: "1.5rem", sm: "1.75rem" },
                          fontWeight: "bold",
                          color: "#1D6EF1",
                          textAlign: { xs: "center", sm: "left" },
                        }}
                      >
                        {formatTime(studyStats.totalTime)}
                      </Typography>
                    </Box>

                    {studyStats.recentSets.length > 0 && (
                      <Box>
                        <Typography
                          sx={{
                            fontSize: { xs: "1rem", sm: "1.125rem" },
                            mb: 1,
                            textAlign: { xs: "center", sm: "left" },
                          }}
                        >
                          Recently Studied Sets
                        </Typography>
                        <Stack spacing={1}>
                          {studyStats.recentSets.map((set) => (
                            <Box
                              key={set.id}
                              sx={{
                                bgcolor: "#C5EDFD",
                                p: { xs: 1.5, sm: 2 },
                                borderRadius: 1,
                                cursor: "pointer",
                                transition: "background-color 0.2s",
                                "&:hover": {
                                  bgcolor: "#97C7F1",
                                },
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 600,
                                  color: "#1D1D20",
                                  fontSize: { xs: "0.875rem", sm: "1rem" },
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {set.title}
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  mt: 0.5,
                                  flexDirection: { xs: "column", sm: "row" },
                                  gap: { xs: 0.5, sm: 0 },
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                    color: "#1D1D20",
                                  }}
                                >
                                  Time: {formatTime(set.totalTime)}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                    color: "#1D1D20",
                                  }}
                                >
                                  Last: {formatDate(set.lastStudied)}
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Stack>
      </Container>

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

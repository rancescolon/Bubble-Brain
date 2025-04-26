"use client"
//The code for the profile page was assisted with the help of ChatGPT
import { useEffect, useState, useRef, useContext } from "react"
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import { LogOut, Save, Upload, Users, UserCircle } from "lucide-react"
import { BackgroundContext } from "../App"
import brainToggleOn from '../assets/braintoggleon.png'; // Import ON image
import brainToggleOff from '../assets/braintoggleoff.png'; // Import OFF image
import text from "../text.json"
import LanguageContext from "./../App"
import { getSelectedLanguage } from "../App";

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

const DeleteAccountButton = styled(Button)({
  backgroundColor: "#991B1B",
  color: "white",
  marginTop: "1rem",
  "&:hover": {
    backgroundColor: "#7F1D1D",
  },
})

const API_BASE_URL = "https://webdev.cse.buffalo.edu/hci/api/api/droptable"

export default function Profile({ setLoggedIn }) {
    const { currentBackground, language } = useContext(BackgroundContext);
    const langKey = language === "English" ? "en" : "es";
    const profileText = text[langKey].profilePage;
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
  const [streakPopup, setStreakPopup] = useState({ open: false, message: "" })
  const [hasShownStreakPopup, setHasShownStreakPopup] = useState(() => {
    const lastShown = sessionStorage.getItem("lastStreakPopupDate")
    const today = new Date().toISOString().split("T")[0] // "YYYY-MM-DD"
    return lastShown === today
  })
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
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showProfilePics, setShowProfilePics] = useState(true)

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
    // Load profile picture visibility setting from local storage
    const storedSetting = localStorage.getItem("showProfilePics")
    setShowProfilePics(storedSetting === null ? true : storedSetting === "true") // Default to true if not set

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

      // Step 1: Normalize dates to YYYY-MM-DD (remove time) and use Set to avoid duplicates
      const normalizeDate = (isoString) => {
        const date = new Date(isoString)
        date.setHours(0, 0, 0, 0)
        return date.getTime()
      }

      const uniqueStudyDates = new Set(
        studyTimeLogs
          .map((log) => {
            try {
              const content = JSON.parse(log.content || "{}")
              return content.timestamp || log.createdAt
            } catch {
              return log.createdAt
            }
          })
          .filter(Boolean)
          .map(normalizeDate)
      )

      // Step 2: Sort dates from newest to oldest
      const sortedDates = Array.from(uniqueStudyDates).sort((a, b) => b - a)

      // Step 3: Calculate current streak
      let streak = 0
      let current = new Date()
      current.setHours(0, 0, 0, 0)

      for (let i = 0; i < sortedDates.length; i++) {
        const diffDays = (current.getTime() - sortedDates[i]) / (1000 * 60 * 60 * 24)
      
        if (diffDays === 0 || diffDays === 1) {
          streak++
          current.setDate(current.getDate() - 1)
        } else if (diffDays > 1) {
          break
        }
      }

      if (streak > 0 && !hasShownStreakPopup) {
        const today = new Date().toISOString().split("T")[0]
        setStreakPopup({
          open: true,
          message: `🔥 You're on a ${streak}-day streak! Keep going!`,
        })
        setHasShownStreakPopup(true)
        sessionStorage.setItem("lastStreakPopupDate", today)
      }
          
      setStudyStats({
        totalTime,
        recentSets,
        streak,
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
          message: profileText.errorEmptyUsername,
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
        message: profileText.successUsernameUpdated,
        severity: "success",
      })
    } catch (error) {
      console.error("Error updating username:", error)
      setNotification({
        open: true,
        message: profileText.errorUsernameUpdateFailed,
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
    setLoggedIn(false)
    navigate("/login")
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      // --- Add file size check ---
      const MAX_SIZE_KB = 74;
      const MAX_SIZE_BYTES = MAX_SIZE_KB * 1024;

      if (file.size > MAX_SIZE_BYTES) {
        setNotification({
          open: true,
          message: `${profileText.errorFileTooLarge} (${MAX_SIZE_KB}KB)`,
          severity: "error",
        });
        return; // Stop processing if file is too large
      }
      // --- End file size check ---

      // Store the current picture before attempting the update
      const oldProfilePic = profilePic;

      const reader = new FileReader()
      reader.onloadend = () => {
         const base64String = reader.result
        // Optimistically update UI
        setProfilePic(base64String)
        sessionStorage.setItem("profilePicture", base64String)
        // Pass both new and old picture data to the API function
        saveProfilePictureToAPI(base64String, oldProfilePic)
      }
      reader.readAsDataURL(file)
    }
  }

  const saveProfilePictureToAPI = async (newBase64String, oldBase64String) => {
    try {
      const userId = sessionStorage.getItem("user")
      const token = sessionStorage.getItem("token")

      if (!userId || !token) {
        throw new Error("User not authenticated")
      }

      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          attributes: {
            picture: newBase64String, // Send the new picture
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Data:", errorData);

        // --- Revert on API error ---
        setProfilePic(oldBase64String); 
        sessionStorage.setItem("profilePicture", oldBase64String);
        setUserData((prev) => ({ ...prev, picture: oldBase64String }));
        // --- End Revert ---

        throw new Error(`Failed to update profile picture: ${errorData.message || response.statusText}`);
      }

       // Optionally update userData state if necessary, though fetchUserData should handle it
      setUserData((prev) => ({ ...prev, picture: newBase64String }));

      setNotification({
        open: true,
        message: profileText.successPicUpdated,
        severity: "success",
      })

    } catch (error) {
      // --- Revert on fetch/other error ---
      setProfilePic(oldBase64String); 
      sessionStorage.setItem("profilePicture", oldBase64String);
      setUserData((prev) => ({ ...prev, picture: oldBase64String }));
      // --- End Revert ---

      console.error("Error updating profile picture:", error)
      setNotification({
        open: true,
        message: `${profileText.errorPicUpdateFailed}: ${error.message}`,
        severity: "error",
      })
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
      const userStr = sessionStorage.getItem("user")
      if (!token || !userStr) return
  
      const userId = typeof userStr === "string" && !isNaN(userStr) ? parseInt(userStr) : JSON.parse(userStr).id
  
      const [groupsRes, membershipsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/groups`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/group-members?userID=${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
  
      if (!groupsRes.ok || !membershipsRes.ok) throw new Error("Failed to fetch communities")
  
      const allGroups = await groupsRes.json()
      const memberships = await membershipsRes.json()
  
      const joinedGroupIds = (memberships[0] || []).map((m) => m.groupID)
      const myCommunities = (allGroups[0] || []).filter(
        (group) => group.ownerID === userId || joinedGroupIds.includes(group.id)
      )
  
      setMyCommunities(myCommunities)
    } catch (error) {
      console.error("Error fetching joined communities:", error)
    }
  }
  

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true)
      const userStr = sessionStorage.getItem("user")
      const token = sessionStorage.getItem("token")

      if (!userStr || !token) {
        throw new Error("User not authenticated")
      }

      // Parse the user ID correctly
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
      } catch (e) {
        if (!isNaN(Number(userStr))) {
          userId = Number(userStr)
        } else {
          throw new Error("Invalid user data format")
        }
      }

      console.log("Attempting to delete user with ID:", userId)

      // First, delete all user's study sets
      const postsResponse = await fetch(`${API_BASE_URL}/posts?authorID=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (postsResponse.ok) {
        const posts = await postsResponse.json()
        console.log("Found posts to delete:", posts)
        // Delete each study set
        for (const post of posts) {
          if (post.id) { // Only delete if post has an ID
            const deletePostResponse = await fetch(`${API_BASE_URL}/posts/${post.id}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            })
            if (!deletePostResponse.ok) {
              console.warn(`Failed to delete post ${post.id}:`, await deletePostResponse.text())
            }
          }
        }
      }

      // Delete the user account
      console.log("Attempting to delete user account...")
      const deleteResponse = await fetch(`${API_BASE_URL}/users/${userId}?relatedObjectsAction=delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      })

      if (!deleteResponse.ok) {
        const errorText = await deleteResponse.text()
        console.error("Delete user response error:", errorText)
        throw new Error(`Failed to delete account: ${errorText}`)
      }

      // Clear all session storage and local storage
      sessionStorage.clear()
      localStorage.clear()
      
      // Show success message
      setNotification({
        open: true,
        message: "Account successfully deleted",
        severity: "success",
      })

      // Force a page reload to clear all state
      window.location.href = "/register"

    } catch (error) {
      console.error("Error deleting account:", error)
      setNotification({
        open: true,
        message: error.message || "Failed to delete account. Please try again.",
        severity: "error",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  // --- Add handler for the toggle button ---
  const handleToggleProfilePics = () => {
    const newValue = !showProfilePics
    setShowProfilePics(newValue)
    localStorage.setItem("showProfilePics", String(newValue)) // Store as string
    
    // Dispatch a storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'showProfilePics',
      newValue: String(newValue),
      oldValue: String(!newValue),
      storageArea: localStorage
    }))
    
    setNotification({
      open: true,
      message: `Profile picture viewing ${newValue ? "enabled" : "disabled"}`,
      severity: "info",
    })
  }
  // --- End of added handler ---

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100vw",
        overflowX: "hidden",
        bgcolor: "#1b1b1b",
        backgroundImage: `url(${currentBackground.image})`,
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
          minHeight: "100vh",        // ✅ Full viewport height
          maxHeight: "none",         // ✅ Remove cap
          overflowY: "visible",      // ✅ Let it scroll the page, not the container
          px: { xs: 1, sm: 2 },
          pl: { xs: '50px', sm: 0 },
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
                    {/* --- Updated Profile Picture Area --- */}
                    {profilePic || userData.picture ? (
                      <Box
                        component="img"
                        src={profilePic || userData.picture}
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
                    ) : (
                      <Box
                        sx={{
                          width: { xs: 80, sm: 100 },
                          height: { xs: 80, sm: 100 },
                          borderRadius: "50%",
                          border: "3px dashed #1D6EF1", // Dashed border for placeholder
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: "#f0f0f0", // Lighter grey background
                          cursor: "pointer",
                          color: "#bdbdbd", // Lighter grey icon color
                          '&:hover': { // Add hover effect
                            bgcolor: '#e0e0e0',
                            color: '#757575',
                          }
                        }}
                        onClick={() => fileInputRef.current.click()}
                        title="Click to upload profile picture" // Add tooltip
                      >
                        <UserCircle size={isMobile ? 40 : 50} /> {/* Use UserCircle icon */}
                      </Box>
                    )}
                    {/* --- End of Updated Profile Picture Area --- */}
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
                      {profileText.profileInformation}
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
                          {profileText.currentUsername}
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
                          {profileText.emailLabel}
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
                        {profileText.logout}
                      </LogoutButton>
                      <DeleteAccountButton
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isDeleting}
                        sx={{
                          height: "32px",
                          fontSize: "0.9rem",
                          mt: 1,
                        }}
                      >
                        {profileText.deleteAccount}
                      </DeleteAccountButton>
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
                  {profileText.profileActions}
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
                      {profileText.newUsername}
                    </Typography>
                    <StyledTextField
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      inputProps={{ maxLength: 20 }}
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
                    {profileText.save}
                  </SaveButton>
                </Box>
                {/* --- Add Profile Picture Toggle Action Inside Profile Actions --- */}
                <Box sx={{ mt: 3, textAlign: 'center' }}> {/* Add margin top and center align */} 
                  <Typography
                    variant="h6" // Match title style
                    sx={{
                      color: "#1D1D20",
                      fontWeight: 800,
                      fontSize: { xs: "1rem", sm: "1.1rem" },
                      mb: 1,
                      textAlign: "center",
                    }}
                  >
                    {profileText.showProfilePictures}
                  </Typography>
                  <IconButton onClick={handleToggleProfilePics} aria-label="toggle profile picture visibility">
                    <img
                      src={showProfilePics ? brainToggleOn : brainToggleOff}
                      alt={showProfilePics ? profileText.picsOn : profileText.picsOff}
                      style={{ width: '100px', height: '100px' }}
                    />
                  </IconButton>
                </Box>
                {/* --- End of Added Section --- */}
                <Box sx={{ mt: 3, textAlign: "center" }}>
                     <ActionButton
                       onClick={() => navigate("/languageSelection")}
                       sx={{ fontSize: { xs: "0.9rem", sm: "1.1rem" } }}
                     >
                       {profileText.changeLanguage}
                     </ActionButton>
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
                  {profileText.currentStreak}
                </Typography>
                <Box sx={{ textAlign: "center", py: 0.5 }}>
                <Typography
                    sx={{
                      fontSize: { xs: "1.75rem", sm: "2rem" },
                      fontWeight: "bold",
                      color: "#1D6EF1",
                    }}
                  >
                    {studyStats.streak ?? 0}{" "}
                    {profileText.dayLabel}
                    {studyStats.streak === 1 ? "" : profileText.dayPlural}
                    {studyStats.streak >= 5 && "🔥".repeat(Math.floor(studyStats.streak / 5))}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      color: "#4B5563",
                      mt: 0.5,
                    }}
                  >
                    {profileText.keepItUp}
                  </Typography>

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
                  height: { xs: "auto", md: "200px" },
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
                    {profileText.quickActions}
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
                      {profileText.uploadedMaterials}
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
                      {profileText.studyGroups}
                    </ActionButton>
                  </Box>
                </CardContent>
              </Card>

              {/* Communities */}
              <Card
                sx={{
                  bgcolor: "white",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                  width: "100%",
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#1D1D20",
                      fontWeight: 800,
                      fontSize: "1.1rem",
                      mb: 2,
                      textAlign: "center",
                    }}
                  >
                    {profileText.myCommunities}
                  </Typography>
                  
                  {myCommunities.length > 0 ? (
                      <Box
                      sx={{
                        maxHeight: "300px",
                        overflowY: "auto",
                        pr: 1,
                        pb: 4, // 👈 Add bottom padding
                      }}
                      >
                    
                      <Stack spacing={1}>
                        {myCommunities.map((community) => (
                          <Box
                            key={community.id}
                            sx={{
                              backgroundColor: "#F9FAFB",
                              border: "1px solid #E0E0E0",
                              borderRadius: "8px",
                              padding: "8px 12px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              height: "60px", // 👈 Compact height
                            }}
                          >
                            <Box sx={{ flex: 1, overflow: "hidden" }}>
                              <Typography
                                variant="subtitle2"
                                fontWeight={600}
                                sx={{
                                  fontSize: "0.95rem",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {community.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  fontSize: "0.75rem",
                                }}
                              >
                                {community.attributes?.description || "No description"}
                              </Typography>
                            </Box>
                            <Button
                              variant="contained"
                              size="small"
                              sx={{
                                fontSize: "0.7rem",
                                padding: "4px 10px",
                                ml: 2,
                                backgroundColor: "#1D6EF1",
                                minWidth: "unset",
                              }}
                              onClick={() => navigate(`/community/view/${community.id}`)}
                            >
                              {profileText.view}
                            </Button>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  ) : (
                    <Typography align="center" color="text.secondary" fontSize="0.9rem">
                      {profileText.noCommunitiesJoined}
                    </Typography>
                  )}
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
                  {profileText.studyStatistics}
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
                        {profileText.totalStudyTime}
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
                          {profileText.recentlyStudiedSets}
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
                                  {profileText.timeLabel}: {formatTime(set.totalTime)}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                    color: "#1D1D20",
                                  }}
                                >
                                  {profileText.lastLabel}: {formatDate(set.lastStudied)}
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
            <Snackbar
        open={streakPopup.open}
        autoHideDuration={5000}
        onClose={() => setStreakPopup({ ...streakPopup, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setStreakPopup({ ...streakPopup, open: false })}
          severity="success"
          variant="filled"
          sx={{ fontWeight: 600 }}
        >
          {streakPopup.message}
        </Alert>
      </Snackbar>

      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
      >
        <DialogTitle>{profileText.deleteAccountTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>
          {profileText.deleteAccountWarning}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)}>{profileText.cancel}</Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            disabled={isDeleting}
          >
            {isDeleting ? profileText.deleting : profileText.deleteAccount}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}                     
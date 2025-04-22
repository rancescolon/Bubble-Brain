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
  Divider,
  CircularProgress,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import { LogOut, Save, Upload, Users, UserCircle } from "lucide-react"
import { BackgroundContext } from "../App"
import brainToggleOn from '../assets/braintoggleon.png'; // Import ON image
import brainToggleOff from '../assets/braintoggleoff.png'; // Import OFF image

// Custom styled components following style guide
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    color: '#1D1D20', // Core Dark
    fontSize: '1rem', // 16px Normal
    fontFamily: 'Sour Gummy, sans-serif', // Explicit font
    '& fieldset': {
      borderColor: 'rgba(0, 0, 0, 0.23)', // Subtle border
    },
    '&:hover fieldset': {
      borderColor: 'rgba(0, 0, 0, 0.5)', // Subtle hover border
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1D6EF1', // Water 2 / Sea 1
    },
  },
  '& .MuiInputLabel-root': {
    color: '#1D1D20', // Core Dark
    opacity: 0.9,
    fontSize: '0.875rem', // 14px Normal for labels
    fontWeight: 400, // Normal weight
    fontFamily: 'Sour Gummy, sans-serif', // Explicit font
  },
}));

const BaseButton = styled(Button)(({ theme }) => ({
  color: '#F4FDFF', // Core Light text
  fontSize: '0.875rem', // 14px Normal base size
  fontWeight: 600, // Semi Bold weight
  fontFamily: 'Sour Gummy, sans-serif', // Explicit font
  textTransform: 'none', // Keep text case as is
  borderRadius: '8px', // Consistent rounding
  padding: '6px 16px', // Standard padding
  transition: 'background-color 0.3s ease, transform 0.1s ease',
  '&:active': {
    transform: 'scale(0.98)', // Press effect
  }
}));

const SaveButton = styled(BaseButton)({
  backgroundColor: '#5B8C5A', // Sea 2
  '&:hover': {
    backgroundColor: '#48BB78', // Confirm Green
  },
});

const ActionButton = styled(BaseButton)({
  backgroundColor: '#1D6EF1', // Water 2 / Sea 1
  fontSize: '1rem', // 16px Normal for primary actions
  '&:hover': {
    backgroundColor: '#1555BC', // Slightly darker Water 2
  },
});

const LogoutButton = styled(BaseButton)({
  backgroundColor: '#EF7B6C', // Danger Red
  '&:hover': {
    backgroundColor: '#B91C1C', // Slightly darker Danger Red
  },
});

const DeleteAccountButton = styled(BaseButton)({
  backgroundColor: '#DC2626', // Danger Red
  marginTop: '1rem',
  '&:hover': {
    backgroundColor: '#B91C1C', // Slightly darker Danger Red
  },
  '&.Mui-disabled': {
    backgroundColor: 'rgba(220, 38, 38, 0.5)', // Consistent disabled style
    color: 'rgba(244, 253, 255, 0.7)',
  }
});

const API_BASE_URL = "https://webdev.cse.buffalo.edu/hci/api/api/droptable"

export default function Profile({ setLoggedIn }) {
  const { currentBackground } = useContext(BackgroundContext);
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

          if (!duration || isNaN(duration)) {
            console.warn("Log missing or invalid duration:", content)
            return
          }

          console.log("Adding duration:", duration, "for set:", studySetTitle)
          totalTime += Number(duration)

          if (studySetId) {
            const key = studySetId.toString()
            if (!setStats.has(key)) {
              setStats.set(key, {
                id: studySetId,
                title: studySetTitle,
                totalTime: 0,
                lastStudied: content.timestamp || log.createdAt || new Date().toISOString(),
              })
            }

            const stats = setStats.get(key)
            stats.totalTime += Number(duration)

            const logTimestamp = content.timestamp || log.createdAt
            if (
              logTimestamp &&
              (!stats.lastStudied || new Date(logTimestamp) > new Date(stats.lastStudied))
            ) {
              stats.lastStudied = logTimestamp
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

      const normalizeDate = (isoString) => {
        try {
          const date = new Date(isoString);
          if (isNaN(date.getTime())) {
              console.warn("Invalid date string for normalization:", isoString);
              return null;
          }
          date.setHours(0, 0, 0, 0);
          return date.getTime();
        } catch (e) {
           console.warn("Error normalizing date:", isoString, e);
           return null;
        }
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
          .filter(Boolean)
      )

      const sortedDates = Array.from(uniqueStudyDates).sort((a, b) => b - a)

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
    const remainingSeconds = Math.round(seconds % 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`
    }
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${remainingSeconds}s`
  }

  const formatDate = (dateString) => {
    try {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    } catch (e) {
        console.warn("Error formatting date:", dateString, e);
        return "Invalid Date";
    }
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

      if (username.length > 20) {
        setNotification({
          open: true,
          message: "Username cannot exceed 20 characters",
          severity: "error",
        })
        return;
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

      setUserData((prev) => ({
        ...prev,
        username: username,
      }))

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
    console.log("Logging out")
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("user")
    sessionStorage.removeItem("profilePicture")
    sessionStorage.removeItem("username")
    sessionStorage.removeItem("firstname")
    sessionStorage.removeItem("lastname")
    sessionStorage.removeItem("email")
    sessionStorage.removeItem("lastStreakPopupDate")
    setLoggedIn(false)
    navigate("/login")
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const MAX_SIZE_KB = 74;
      const MAX_SIZE_BYTES = MAX_SIZE_KB * 1024;

      if (file.size > MAX_SIZE_BYTES) {
        setNotification({
          open: true,
          message: `File size exceeds the ${MAX_SIZE_KB}KB limit.`,
          severity: "error",
        });
        if(fileInputRef.current) {
          fileInputRef.current.value = "";
      }
        return;
      }

      const oldProfilePic = profilePic;

      const reader = new FileReader()
      reader.onloadend = () => {
         const base64String = reader.result
        setProfilePic(base64String)
        sessionStorage.setItem("profilePicture", base64String)
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
            picture: newBase64String,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Data:", errorData);

        setProfilePic(oldBase64String); 
        sessionStorage.setItem("profilePicture", oldBase64String);
        setUserData((prev) => ({ ...prev, picture: oldBase64String }));

        throw new Error(`Failed to update profile picture: ${errorData.message || response.statusText}`);
      }

      setUserData((prev) => ({ ...prev, picture: newBase64String }));

      setNotification({
        open: true,
        message: "Profile picture updated successfully",
        severity: "success",
      })

    } catch (error) {
      setProfilePic(oldBase64String); 
      sessionStorage.setItem("profilePicture", oldBase64String);
      setUserData((prev) => ({ ...prev, picture: oldBase64String }));

      console.error("Error updating profile picture:", error)
      setNotification({
        open: true,
        message: `Failed to update profile picture: ${error.message}`,
        severity: "error",
      })
    }
  }

  const fetchUserStudySets = async () => {
    try {
      const token = sessionStorage.getItem("token")
      const userId = sessionStorage.getItem("user")
      if (!userId || !token) return
      const response = await fetch(`${API_BASE_URL}/posts?type=study_set&authorID=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to fetch study sets")
      const data = await response.json()
      const studySets = data[0] || [];
      const parsedStudySets = studySets.map((set) => {
        let studySetContent = {}
        try {
          studySetContent = JSON.parse(set.content || '{}');
        } catch (e) {
            console.warn("Error parsing study set content:", e, set.content);
        }
        return {
          id: set.id,
          name: studySetContent?.name || set.title || "Unnamed Study Set",
          communityId: set.attributes?.communityId || null,
        }
      }).filter(set => set.id);
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
  
      let userId;
      try {
          const parsedUser = JSON.parse(userStr);
          userId = typeof parsedUser === 'object' ? parsedUser.id : Number(userStr);
      } catch (e) {
           if (!isNaN(Number(userStr))) {
               userId = Number(userStr);
           } else {
               throw new Error("Invalid user format in session storage");
           }
      }

      if (!userId || isNaN(userId)) {
          throw new Error("Could not extract valid user ID");
      }
  
      const [groupsRes, membershipsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/groups`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/group-members?userID=${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
  
      if (!groupsRes.ok || !membershipsRes.ok) throw new Error("Failed to fetch communities or memberships")
  
      const allGroupsData = await groupsRes.json()
      const membershipsData = await membershipsRes.json()
  
      const allGroups = allGroupsData[0] || [];
      const memberships = membershipsData[0] || [];
  
      const joinedGroupIds = new Set(memberships.map((m) => m.groupID));
      const myCommunities = allGroups.filter(
        (group) => group.ownerID === userId || joinedGroupIds.has(group.id)
      );
  
      setMyCommunities(myCommunities);
    } catch (error) {
      console.error("Error fetching joined communities:", error);
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

      const postsResponse = await fetch(`${API_BASE_URL}/posts?authorID=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (postsResponse.ok) {
        const postsData = await postsResponse.json()
        const posts = postsData[0] || [];
        console.log(`Found ${posts.length} posts to delete for user ${userId}`, posts)
        for (const post of posts) {
          if (post.id) {
            console.log(`Deleting post ${post.id}...`);
            const deletePostResponse = await fetch(`${API_BASE_URL}/posts/${post.id}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            })
            if (!deletePostResponse.ok) {
              console.warn(`Failed to delete post ${post.id}: ${deletePostResponse.status}`, await deletePostResponse.text())
            } else {
              console.log(`Successfully deleted post ${post.id}`);
            }
          } else {
            console.warn("Found post without ID, skipping deletion:", post);
          }
        }
      } else {
         console.warn("Could not fetch user posts for deletion:", postsResponse.status);
      }

      console.log("Attempting to delete user account...")
      const deleteUserResponse = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      })

      if (!deleteUserResponse.ok) {
        const errorText = await deleteUserResponse.text()
        console.error("Delete user response error:", deleteUserResponse.status, errorText)
        throw new Error(`Failed to delete account: ${errorText || deleteUserResponse.statusText}`)
      }

      sessionStorage.clear()
      localStorage.clear();
      
      setNotification({
        open: true,
        message: "Account successfully deleted",
        severity: "success",
      })

      setTimeout(() => {
        window.location.href = "/register";
      }, 2000);

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

  const handleToggleProfilePics = () => {
    const newValue = !showProfilePics
    setShowProfilePics(newValue)
    localStorage.setItem("showProfilePics", String(newValue))
    
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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100vw",
        overflowX: "hidden",
        bgcolor: '#1D1D20',
        backgroundImage: `url(${currentBackground.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: 'fixed',
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1, sm: 2, md: 3 },
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        fontFamily: 'Sour Gummy, sans-serif',
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          maxHeight: { xs: "none", sm: "calc(100vh - 64px)" },
          overflowY: "auto",
          px: { xs: 1, sm: 2 },
        }}
      >
        <Stack spacing={3}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 3,
            }}
          >
            <Card
              sx={{
                bgcolor: '#F4FDFF',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                flex: 1,
                width: "100%",
                borderRadius: '16px',
                height: '280px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 }, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#1D1D20',
                    fontWeight: 600,
                    fontSize: '1.25rem',
                    mb: 1,
                    textAlign: "center",
                    fontFamily: 'Sour Gummy, sans-serif',
                    width: "100%",
                    flexShrink: 0,
                  }}
                >
                  Profile Information
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.5,
                    width: '100%',
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      color: '#1D1D20',
                      fontWeight: 600,
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                      textAlign: 'center',
                      fontFamily: 'Sour Gummy, sans-serif',
                      wordBreak: "break-word",
                    }}
                  >
                    {userData.name}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.5,
                      width: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 0.5,
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          color: '#1D1D20',
                          fontWeight: 400,
                          fontSize: '0.875rem',
                          textAlign: "center",
                          fontFamily: 'Sour Gummy, sans-serif',
                        }}
                      >
                        Username:
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: '#1D1D20',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          textAlign: "center",
                          wordBreak: "break-word",
                          fontFamily: 'Sour Gummy, sans-serif',
                        }}
                      >
                        {userData.username || username}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 0.5,
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          color: '#1D1D20',
                          fontWeight: 400,
                          fontSize: '0.875rem',
                          textAlign: "center",
                          fontFamily: 'Sour Gummy, sans-serif',
                        }}
                      >
                        Email:
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: '#1D1D20',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          textAlign: "center",
                          wordBreak: "break-word",
                          fontFamily: 'Sour Gummy, sans-serif',
                        }}
                      >
                        {userData.email || email}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    mb: 'auto',
                  }}
                >
                  {profilePic || userData.picture ? (
                    <Box
                      component="img"
                      src={profilePic || userData.picture}
                      alt="Profile"
                      sx={{
                        width: { xs: 60, sm: 80, md: 90 },
                        height: { xs: 60, sm: 80, md: 90 },
                        borderRadius: "50%",
                        border: '3px solid #1D6EF1',
                        cursor: "pointer",
                        objectFit: "cover",
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                      onClick={() => fileInputRef.current.click()}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: { xs: 60, sm: 80, md: 90 },
                        height: { xs: 60, sm: 80, md: 90 },
                        borderRadius: "50%",
                        border: '3px dashed #1D6EF1',
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: '#C5EDFD',
                        cursor: "pointer",
                        color: '#1D6EF1',
                        transition: 'background-color 0.2s, color 0.2s',
                        '&:hover': {
                          bgcolor: '#97C7F1',
                          color: '#1555BC',
                        }
                      }}
                      onClick={() => fileInputRef.current.click()}
                      title="Click to upload profile picture"
                    >
                      <UserCircle size={isMobile ? 30 : isTablet ? 40 : 50} />
                    </Box>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/gif"
                    style={{ display: "none" }}
                  />
                </Box>

                <Stack
                  direction="row"
                  spacing={2}
                  sx={{
                    mt: 'auto',
                    pt: 1,
                    alignSelf: 'center',
                    flexShrink: 0,
                  }}
                >
                  <LogoutButton
                    startIcon={<LogOut size={16} />}
                    onClick={handleLogout}
                    size="small"
                  >
                    Logout
                  </LogoutButton>
                  <DeleteAccountButton
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeleting}
                    size="small"
                  >
                    Delete Account
                  </DeleteAccountButton>
                </Stack>
              </CardContent>
            </Card>

            <Card
              sx={{
                bgcolor: '#F4FDFF',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                flex: 1,
                width: "100%",
                borderRadius: '16px',
                height: '280px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#1D1D20',
                    fontWeight: 600,
                    fontSize: '1.25rem',
                    mb: 2,
                    textAlign: "center",
                    fontFamily: 'Sour Gummy, sans-serif',
                  }}
                >
                  Profile Actions
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" justifyContent="center" mb={3}>
                    <StyledTextField
                    label="New Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      inputProps={{ maxLength: 20 }}
                      size="small"
                      sx={{
                      width: { xs: "100%", sm: "200px" },
                      }}
                    variant="outlined"
                    />
                  <SaveButton
                    startIcon={<Save size={16} />}
                    onClick={handleSaveUsername}
                    size="medium"
                  >
                    Save Username
                  </SaveButton>
                </Stack>

                <Box sx={{ textAlign: 'center', mt: -2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#1D1D20',
                      fontWeight: 600,
                      fontSize: '1rem',
                      mb: 1,
                      textAlign: "center",
                      fontFamily: 'Sour Gummy, sans-serif',
                    }}
                  >
                    Toggle Picture Visibility
                  </Typography>
                  <IconButton onClick={handleToggleProfilePics} aria-label="toggle profile picture visibility">
                    <img
                      src={showProfilePics ? brainToggleOn : brainToggleOff}
                      alt={showProfilePics ? "Profile pictures on" : "Profile pictures off"}
                      style={{ width: '80px', height: '80px' }}
                    />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>

            <Card
              sx={{
                bgcolor: '#F4FDFF',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                flex: 1,
                width: "100%",
                borderRadius: '16px',
                height: '280px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 }, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#1D1D20',
                      fontWeight: 600,
                      fontSize: '1.25rem',
                      textAlign: "center",
                      fontFamily: 'Sour Gummy, sans-serif',
                      mb: 2,
                    }}
                  >
                    Current Streak
                  </Typography>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      sx={{
                        fontSize: '1.75rem',
                        fontWeight: 600,
                        color: '#1D6EF1',
                        fontFamily: 'Sour Gummy, sans-serif',
                        lineHeight: 1.1,
                        mb: 1,
                      }}
                    >
                      {studyStats.loading ? '...' : (studyStats.streak ?? 0)} day{studyStats.streak === 1 ? "" : "s"}
                      {studyStats.streak >= 5 && ` 🔥`.repeat(Math.min(5, Math.floor(studyStats.streak / 5)))}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '1rem',
                        color: '#1D1D20',
                        mt: 0.5,
                        fontFamily: 'Sour Gummy, sans-serif',
                        fontWeight: 600,
                      }}
                    >
                      {studyStats.loading ? 'Calculating...' : 'Keep it up!'}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.875rem',
                        color: '#1D1D20',
                        mt: 1,
                        fontFamily: 'Sour Gummy, sans-serif',
                        opacity: 0.8,
                      }}
                    >
                      {studyStats.streak > 0 ? `You've studied for ${studyStats.streak} day${studyStats.streak === 1 ? '' : 's'} in a row!` : 'Start your study streak today!'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 3,
            }}
          >
            <Stack
              spacing={3}
              sx={{
                flex: 1,
                width: "100%",
              }}
            >
              <Card
                sx={{
                  bgcolor: '#F4FDFF',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  borderRadius: '16px',
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#1D1D20',
                      fontWeight: 600,
                      fontSize: '1.25rem',
                      mb: 2,
                      textAlign: "center",
                      fontFamily: 'Sour Gummy, sans-serif',
                    }}
                  >
                    Quick Actions
                  </Typography>
                  <Stack spacing={1} sx={{ py: 0.5, alignItems: 'center' }}>
                    <ActionButton
                      startIcon={<Upload size={isMobile ? 16 : 18} />}
                      onClick={() => navigate("/upload")}
                      fullWidth
                      size="small"
                    >
                      Upload Study Set
                    </ActionButton>
                    <ActionButton
                      startIcon={<Users size={isMobile ? 16 : 18} />}
                      onClick={() => navigate("/community")}
                      fullWidth
                      size="small"
                    >
                      Explore Communities
                    </ActionButton>
                  </Stack>
                </CardContent>
              </Card>

              <Card
                sx={{
                  bgcolor: '#F4FDFF',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  borderRadius: '16px',
                  height: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#1D1D20',
                      fontWeight: 600,
                      fontSize: '1.25rem',
                      mb: 1,
                      textAlign: "center",
                      fontFamily: 'Sour Gummy, sans-serif',
                    }}
                  >
                    My Communities
                  </Typography>

                  {myCommunities.length > 0 ? (
                    <Box sx={{ position: 'relative', flex: 1 }}>
                      <Box
                        sx={{
                          maxHeight: "140px",
                          overflowY: "auto",
                          pr: 1,
                          pb: 1,
                          scrollBehavior: 'smooth',
                          '&::-webkit-scrollbar': {
                            width: '6px',
                          },
                          '&::-webkit-scrollbar-track': {
                            background: '#F4FDFF',
                            borderRadius: '4px',
                          },
                          '&::-webkit-scrollbar-thumb': {
                            background: '#C5EDFD',
                            borderRadius: '4px',
                            '&:hover': {
                              background: '#97C7F1',
                            },
                          },
                        }}
                      >
                        <Stack spacing={1}>
                          {myCommunities.map((community) => (
                            <Box
                              key={community.id}
                              sx={{
                                backgroundColor: '#C5EDFD',
                                border: '1px solid #97C7F1',
                                borderRadius: '12px',
                                padding: "8px 12px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                minHeight: "50px",
                                transition: 'background-color 0.2s',
                                '&:hover': {
                                  bgcolor: '#97C7F1',
                                }
                              }}
                            >
                              <Box sx={{ flex: 1, overflow: "hidden", mr: 1 }}>
                                <Typography
                                  variant="body1"
                                  fontWeight={600}
                                  sx={{
                                    fontSize: '1rem',
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    color: '#1D1D20',
                                    fontFamily: 'Sour Gummy, sans-serif',
                                    lineHeight: 1.3,
                                  }}
                                  title={community.name}
                                >
                                  {community.name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    fontSize: '0.875rem',
                                    fontFamily: 'Sour Gummy, sans-serif',
                                    lineHeight: 1.3,
                                  }}
                                  title={community.attributes?.description || "No description"}
                                >
                                  {community.attributes?.description || "No description"}
                                </Typography>
                              </Box>
                              <Button
                                variant="contained"
                                size="small"
                                sx={{
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  padding: "4px 10px",
                                  ml: 1,
                                  backgroundColor: '#1D6EF1',
                                  minWidth: "60px",
                                  color: '#F4FDFF',
                                  fontFamily: 'Sour Gummy, sans-serif',
                                  '&:hover': {
                                    backgroundColor: '#1555BC',
                                  },
                                }}
                                onClick={() => navigate(`/community/view/${community.id}`)}
                              >
                                View
                              </Button>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    </Box>
                  ) : (
                    <Typography align="center" color="text.secondary" fontSize="0.875rem" sx={{ fontFamily: 'Sour Gummy, sans-serif', py: 2 }}>
                      You're not part of any communities yet.
                    </Typography>
                  )}
                </CardContent>
              </Card>

            </Stack>

            <Card
              sx={{
                bgcolor: '#F4FDFF',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                borderRadius: '16px',
                flex: 1,
                width: "100%",
                height: '415px',
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#1D1D20',
                    fontWeight: 600,
                    fontSize: '1.25rem',
                    mb: 1,
                    textAlign: "center",
                    fontFamily: 'Sour Gummy, sans-serif',
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
                      height: "100px",
                    }}
                  >
                    <CircularProgress size={30} sx={{ color: '#1D6EF1' }} />
                    <Typography sx={{ ml: 1.5, fontFamily: 'Sour Gummy, sans-serif', color: '#1D1D20' }}>Loading Stats...</Typography>
                  </Box>
                ) : studyStats.error ? (
                  <Typography
                    sx={{
                      color: '#DC2626',
                      textAlign: "center",
                      fontSize: '0.875rem',
                      fontFamily: 'Sour Gummy, sans-serif',
                      py: 1,
                    }}
                  >
                    {studyStats.error}
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography
                        sx={{
                          fontSize: '1rem',
                          fontWeight: 400,
                          mb: 0.5,
                          textAlign: "center",
                          color: '#1D1D20',
                          fontFamily: 'Sour Gummy, sans-serif',
                        }}
                      >
                        Total Study Time
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '1.75rem',
                          fontWeight: 600,
                          color: '#1D6EF1',
                          textAlign: "center",
                          fontFamily: 'Sour Gummy, sans-serif',
                        }}
                      >
                        {formatTime(studyStats.totalTime)}
                      </Typography>
                    </Box>

                    {studyStats.recentSets.length > 0 && (
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography
                          sx={{
                            fontSize: '1rem',
                            fontWeight: 400,
                            mb: 1,
                            textAlign: "center",
                            color: '#1D1D20',
                            fontFamily: 'Sour Gummy, sans-serif',
                          }}
                        >
                          Recently Studied Sets
                        </Typography>
                        <Stack spacing={1}>
                          {studyStats.recentSets.map((set) => (
                            <Box
                              key={set.id}
                              sx={{
                                bgcolor: '#C5EDFD',
                                p: { xs: 1, sm: 1.25 },
                                borderRadius: '12px',
                                cursor: "pointer",
                                transition: "background-color 0.2s, transform 0.1s ease",
                                '&:hover': {
                                  bgcolor: '#97C7F1',
                                },
                              }}
                              onClick={() => navigate(`/study/${set.id}`)}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 600,
                                  color: '#1D1D20',
                                  fontSize: '0.875rem',
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  fontFamily: 'Sour Gummy, sans-serif',
                                  mb: 0.5,
                                }}
                                title={set.title}
                              >
                                {set.title}
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  flexDirection: { xs: "column", sm: "row" },
                                  gap: { xs: 0.5, sm: 1 },
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: '0.75rem',
                                    color: '#1D1D20',
                                    fontFamily: 'Sour Gummy, sans-serif',
                                  }}
                                >
                                  Time: {formatTime(set.totalTime)}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: '0.75rem',
                                    color: '#1D1D20',
                                    fontFamily: 'Sour Gummy, sans-serif',
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
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Box>
        </Stack>
      </Container>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          variant="filled"
          sx={{ fontFamily: 'Sour Gummy, sans-serif', fontWeight: 600 }}
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
          sx={{ fontFamily: 'Sour Gummy, sans-serif', fontWeight: 600 }}
        >
          {streakPopup.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        PaperProps={{ sx: { borderRadius: '16px', bgcolor: '#F4FDFF', fontFamily: 'Sour Gummy, sans-serif' } }}
      >
        <DialogTitle sx={{ color: '#1D1D20', fontWeight: 600, fontSize: '1.5rem', fontFamily: 'Sour Gummy, sans-serif' }}>
            Confirm Account Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#1D1D20', fontSize: '1rem', fontFamily: 'Sour Gummy, sans-serif' }}>
            Are you sure you want to delete your account? This action cannot be undone.
            All your study sets, progress, and other data will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px', justifyContent: 'space-between' }}>
           <Button
             onClick={() => setShowDeleteConfirm(false)}
             sx={{
                 color: '#1D6EF1',
                 fontSize: '0.875rem',
                 fontWeight: 600,
                 fontFamily: 'Sour Gummy, sans-serif',
                 textTransform: 'none',
                 '&:hover': { bgcolor: 'rgba(29, 110, 241, 0.1)'}
            }}
          >
             Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            sx={{
                 color: '#DC2626',
                 fontSize: '0.875rem',
                 fontWeight: 600,
                 fontFamily: 'Sour Gummy, sans-serif',
                 textTransform: 'none',
                 '&:hover': { bgcolor: 'rgba(220, 38, 38, 0.1)'},
                 '&.Mui-disabled': { color: 'rgba(220, 38, 38, 0.5)' }
            }}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}                     
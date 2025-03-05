"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Divider,
  Button,
  Paper,
  TextField,
  Alert,
  Snackbar,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import { LogOut, Save } from "lucide-react"
import background from "../assets/image3.png"

// Custom styled components
const InfoCard = styled(Paper)(({ theme }) => ({
  padding: "16px",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  color: "white",
  borderRadius: "8px",
  marginBottom: "16px",
  width: "100%",
}))

const InfoLabel = styled(Typography)({
  color: "rgba(255, 255, 255, 0.7)",
  fontSize: "0.875rem",
  marginBottom: "4px",
})

const InfoValue = styled(Typography)({
  color: "white",
  fontSize: "1rem",
  fontWeight: 500,
})

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    color: "white",
    "& fieldset": {
      borderColor: "rgba(255, 255, 255, 0.23)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(255, 255, 255, 0.5)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#00AEEF",
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255, 255, 255, 0.7)",
  },
  "& .MuiOutlinedInput-input": {
    color: "white",
  },
}))

const SaveButton = styled(Button)({
  backgroundColor: "#00AEEF",
  color: "white",
  "&:hover": {
    backgroundColor: "#0099D4",
  },
})

const LogoutButton = styled(Button)({
  backgroundColor: "#f44336",
  color: "white",
  "&:hover": {
    backgroundColor: "#d32f2f",
  },
})

const Settings = () => {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    name: "",
    picture: "",
  })
  const [newUsername, setNewUsername] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" })

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const userId = sessionStorage.getItem("user")
      const token = sessionStorage.getItem("token")

      if (!userId || !token) {
        throw new Error("User not authenticated")
      }

      const response = await fetch(`${process.env.REACT_APP_API_PATH}/users/${userId}`, {
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
      console.log("User data:", data) // Debug log

      // Get name from the correct field based on registration form
      const name =
        data.attributes?.name || // Check if name is in attributes
        data.name || // Check if name is directly in data
        sessionStorage.getItem("name") || // Check session storage
        "Not provided" // Fallback

      const username =
        data.attributes?.username ||
        data.username ||
        data.email?.split("@")[0] || // Fallback to email username part
        "Not provided"

      setUserData({
        username: username,
        email: data.email || "Not provided",
        name: name,
        picture: data.attributes?.picture || data.picture || sessionStorage.getItem("profilePicture") || "",
      })

      setNewUsername(username)
    } catch (error) {
      console.error("Error fetching user data:", error)
      setError("Failed to load user data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveUsername = async () => {
    try {
      const userId = sessionStorage.getItem("user")
      const token = sessionStorage.getItem("token")

      if (!userId || !token) {
        throw new Error("User not authenticated")
      }

      if (!newUsername.trim()) {
        setNotification({
          open: true,
          message: "Username cannot be empty",
          severity: "error",
        })
        return
      }

      const response = await fetch(`${process.env.REACT_APP_API_PATH}/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          attributes: {
            username: newUsername,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update username")
      }

      // Update local state
      setUserData((prev) => ({
        ...prev,
        username: newUsername,
      }))

      // Store in session storage for easy access
      sessionStorage.setItem("username", newUsername)

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
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("user")
    sessionStorage.removeItem("name")
    sessionStorage.removeItem("username")
    sessionStorage.removeItem("profilePicture")
    window.location.href = "/login"
  }

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false })
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#1b1b1b",
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card sx={{ bgcolor: "rgba(58, 58, 58, 0.95)", backdropFilter: "blur(5px)" }}>
          <CardContent>
            <Typography variant="h4" color="white" gutterBottom>
              Account Settings
            </Typography>
            <Typography variant="body1" color="gray" gutterBottom>
              View and update your personal information
            </Typography>

            {loading ? (
              <Typography color="white" sx={{ textAlign: "center", my: 4 }}>
                Loading your information...
              </Typography>
            ) : error ? (
              <Typography color="error" sx={{ textAlign: "center", my: 4 }}>
                {error}
              </Typography>
            ) : (
              <>
                <Box sx={{ mt: 4, display: "flex", alignItems: "center", mb: 4 }}>
                  <Avatar
                    src={userData.picture || "/placeholder.svg"}
                    sx={{
                      width: 100,
                      height: 100,
                      mr: 2,
                      border: "2px solid #00AEEF",
                    }}
                  />
                  <Box>
                    <Typography variant="h5" color="white">
                      {userData.name}
                    </Typography>
                    <Typography variant="body2" color="gray">
                      {userData.email}
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={8}>
                    <StyledTextField
                      fullWidth
                      label="Username"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Set your username"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <SaveButton
                      variant="contained"
                      onClick={handleSaveUsername}
                      startIcon={<Save size={16} />}
                      fullWidth
                      sx={{ height: "56px" }}
                    >
                      Save
                    </SaveButton>
                  </Grid>

                  <Grid item xs={12}>
                    <InfoCard>
                      <InfoLabel>Email</InfoLabel>
                      <InfoValue>{userData.email}</InfoValue>
                    </InfoCard>
                  </Grid>

                  <Grid item xs={12}>
                    <InfoCard>
                      <InfoLabel>Name</InfoLabel>
                      <InfoValue>{userData.name}</InfoValue>
                    </InfoCard>
                  </Grid>

                  <Grid item xs={12}>
                    <InfoCard>
                      <InfoLabel>Password</InfoLabel>
                      <InfoValue>••••••••</InfoValue>
                    </InfoCard>
                  </Grid>
                </Grid>
              </>
            )}

            {/* Logout Section */}
            <Box sx={{ mt: 6 }}>
              <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.12)", my: 2 }} />
              <Typography variant="h6" color="white" gutterBottom>
                Account Actions
              </Typography>
              <Box sx={{ mt: 2 }}>
                <LogoutButton variant="contained" startIcon={<LogOut size={16} />} onClick={handleLogout} fullWidth>
                  Logout
                </LogoutButton>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Settings


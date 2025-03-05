// "use client"

// import { useState, useEffect } from "react"
// import {
//   Box,
//   Container,
//   Typography,
//   Card,
//   CardContent,
//   Grid,
//   Avatar,
//   Divider,
//   Button,
//   Paper,
//   TextField,
//   Alert,
//   Snackbar,
// } from "@mui/material"
// import { styled } from "@mui/material/styles"
// import { LogOut, Save } from "lucide-react"
// import background from "../assets/image3.png"

// // Custom styled components
// const InfoCard = styled(Paper)(({ theme }) => ({
//   padding: "16px",
//   backgroundColor: "white",
//   color: "black",
//   borderRadius: "8px",
//   marginBottom: "16px",
//   width: "100%",
// }))

// // Update the InfoLabel styled component to have larger text
// const InfoLabel = styled(Typography)({
//   color: "rgba(0, 0, 0, 0.7)",
//   fontSize: "1.1rem", // Increased from 0.875rem
//   marginBottom: "4px",
//   fontWeight: 500, // Added for more prominence
// })

// // Update the InfoValue styled component to have larger text
// const InfoValue = styled(Typography)({
//   color: "black",
//   fontSize: "1.2rem", // Increased from 1rem
//   fontWeight: 500,
// })

// // Update the StyledTextField to have larger label
// const StyledTextField = styled(TextField)(({ theme }) => ({
//   "& .MuiOutlinedInput-root": {
//     color: "black",
//     fontSize: "1.2rem", // Increased font size for input
//     "& fieldset": {
//       borderColor: "rgba(0, 0, 0, 0.23)",
//     },
//     "&:hover fieldset": {
//       borderColor: "rgba(0, 0, 0, 0.5)",
//     },
//     "&.Mui-focused fieldset": {
//       borderColor: "#00AEEF",
//     },
//   },
//   "& .MuiInputLabel-root": {
//     color: "rgba(0, 0, 0, 0.7)",
//     fontSize: "1.1rem", // Increased label font size
//     fontWeight: 500, // Added for more prominence
//   },
//   "& .MuiOutlinedInput-input": {
//     color: "black",
//   },
// }))

// // Update the SaveButton to be larger
// const SaveButton = styled(Button)({
//   backgroundColor: "#00AEEF",
//   color: "white",
//   fontSize: "1.1rem", // Increased font size
//   fontWeight: 600, // Made font weight bolder
//   "&:hover": {
//     backgroundColor: "#0099D4",
//   },
// })

// const LogoutButton = styled(Button)({
//   backgroundColor: "#f44336",
//   color: "white",
//   "&:hover": {
//     backgroundColor: "#d32f2f",
//   },
// })

// const Settings = () => {
//   const [userData, setUserData] = useState({
//     username: "",
//     email: "",
//     name: "",
//     picture: "",
//   })
//   const [newUsername, setNewUsername] = useState("")
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [notification, setNotification] = useState({ open: false, message: "", severity: "success" })

//   useEffect(() => {
//     fetchUserData()
//   }, [])

//   const fetchUserData = async () => {
//     try {
//       const userId = sessionStorage.getItem("user")
//       const token = sessionStorage.getItem("token")

//       if (!userId || !token) {
//         throw new Error("User not authenticated")
//       }

//       const response = await fetch(`${process.env.REACT_APP_API_PATH}/users/${userId}`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       })

//       if (!response.ok) {
//         throw new Error("Failed to fetch user data")
//       }

//       const data = await response.json()
//       console.log("User data:", data) // Debug log

//       // Get name from the correct field based on registration form
//       const name =
//         data.attributes?.name || // Check if name is in attributes
//         data.name || // Check if name is directly in data
//         sessionStorage.getItem("name") || // Check session storage
//         "Not provided" // Fallback

//       const username =
//         data.attributes?.username ||
//         data.username ||
//         data.email?.split("@")[0] || // Fallback to email username part
//         "Not provided"

//       setUserData({
//         username: username,
//         email: data.email || "Not provided",
//         name: name,
//         picture: data.attributes?.picture || data.picture || sessionStorage.getItem("profilePicture") || "",
//       })

//       setNewUsername(username)
//     } catch (error) {
//       console.error("Error fetching user data:", error)
//       setError("Failed to load user data. Please try again later.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleSaveUsername = async () => {
//     try {
//       const userId = sessionStorage.getItem("user")
//       const token = sessionStorage.getItem("token")

//       if (!userId || !token) {
//         throw new Error("User not authenticated")
//       }

//       if (!newUsername.trim()) {
//         setNotification({
//           open: true,
//           message: "Username cannot be empty",
//           severity: "error",
//         })
//         return
//       }

//       const response = await fetch(`${process.env.REACT_APP_API_PATH}/users/${userId}`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           attributes: {
//             username: newUsername,
//           },
//         }),
//       })

//       if (!response.ok) {
//         throw new Error("Failed to update username")
//       }

//       // Update local state
//       setUserData((prev) => ({
//         ...prev,
//         username: newUsername,
//       }))

//       // Store in session storage for easy access
//       sessionStorage.setItem("username", newUsername)

//       setNotification({
//         open: true,
//         message: "Username updated successfully",
//         severity: "success",
//       })
//     } catch (error) {
//       console.error("Error updating username:", error)
//       setNotification({
//         open: true,
//         message: "Failed to update username",
//         severity: "error",
//       })
//     }
//   }

//   const handleLogout = () => {
//     sessionStorage.removeItem("token")
//     sessionStorage.removeItem("user")
//     sessionStorage.removeItem("name")
//     sessionStorage.removeItem("username")
//     sessionStorage.removeItem("profilePicture")
//     window.location.href = "/login"
//   }

//   const handleCloseNotification = () => {
//     setNotification({ ...notification, open: false })
//   }

//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         bgcolor: "#1b1b1b",
//         backgroundImage: `url(${background})`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundRepeat: "no-repeat",
//       }}
//     >
//       <Container maxWidth="md" sx={{ py: 4 }}>
//         <Card sx={{ bgcolor: "white", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }}>
//           <CardContent>
//             <Typography variant="h3" color="black" gutterBottom>
//               Account Settings
//             </Typography>
//             <Typography variant="body1" color="text.secondary" gutterBottom>
//               View and update your personal information
//             </Typography>

//             {loading ? (
//               <Typography color="white" sx={{ textAlign: "center", my: 4 }}>
//                 Loading your information...
//               </Typography>
//             ) : error ? (
//               <Typography color="error" sx={{ textAlign: "center", my: 4 }}>
//                 {error}
//               </Typography>
//             ) : (
//               <>
//                 <Box sx={{ mt: 4, display: "flex", alignItems: "center", mb: 4 }}>
//                   <Avatar
//                     src={userData.picture || "/placeholder.svg"}
//                     sx={{
//                       width: 100,
//                       height: 100,
//                       mr: 2,
//                       border: "2px solid #00AEEF",
//                     }}
//                   />
//                   <Box>
//                     <Typography variant="h4" color="black">
//                       {userData.name}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary">
//                       {userData.email}
//                     </Typography>
//                   </Box>
//                 </Box>

//                 <Grid container spacing={3}>
//                   <Grid item xs={12} sm={8}>
//                     <StyledTextField
//                       fullWidth
//                       label="Username"
//                       value={newUsername}
//                       onChange={(e) => setNewUsername(e.target.value)}
//                       placeholder="Set your username"
//                     />
//                   </Grid>
//                   <Grid item xs={12} sm={4}>
//                     <SaveButton
//                       variant="contained"
//                       onClick={handleSaveUsername}
//                       startIcon={<Save size={20} />} // Increased icon size from 16 to 20
//                       fullWidth
//                       sx={{ height: "60px" }} // Increased from 56px to 60px
//                     >
//                       Save
//                     </SaveButton>
//                   </Grid>

//                   <Grid item xs={12}>
//                     <InfoCard >
//                       <InfoLabel>Email</InfoLabel>
//                       <InfoValue>{userData.email}</InfoValue>
//                     </InfoCard>
//                   </Grid>

//                   <Grid item xs={12}>
//                     <InfoCard>
//                       <InfoLabel>Name</InfoLabel>
//                       <InfoValue>{userData.name}</InfoValue>
//                     </InfoCard>
//                   </Grid>

//                   <Grid item xs={12}>
//                     <InfoCard>
//                       <InfoLabel>Password</InfoLabel>
//                       <InfoValue>••••••••</InfoValue>
//                     </InfoCard>
//                   </Grid>
//                 </Grid>
//               </>
//             )}

//             {/* Logout Section */}
//             <Box sx={{ mt: 6 }}>
//               <Divider sx={{ bgcolor: "rgba(0, 0, 0, 0.12)", my: 2 }} />
//               <Typography variant="h5" color="black" gutterBottom>
//                 Account Actions
//               </Typography>
//               <Box sx={{ mt: 2 }}>
//                 <LogoutButton variant="contained" startIcon={<LogOut size={16} />} onClick={handleLogout} fullWidth>
//                   Logout
//                 </LogoutButton>
//               </Box>
//             </Box>
//           </CardContent>
//         </Card>
//       </Container>

//       {/* Notification */}
//       <Snackbar
//         open={notification.open}
//         autoHideDuration={6000}
//         onClose={handleCloseNotification}
//         anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
//       >
//         <Alert onClose={handleCloseNotification} severity={notification.severity} variant="filled">
//           {notification.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   )
// }

// export default Settings
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
const InfoCard = styled(Paper)(({ theme, readonly }) => ({
  padding: "16px",
  backgroundColor: readonly ? "#f5f5f5" : "white", // Grey background for readonly fields
  color: "black",
  borderRadius: "8px",
  marginBottom: "16px",
  width: "100%",
  border: readonly ? "1px solid #e0e0e0" : "none", // Light border for readonly fields
}))

// Update the InfoLabel styled component to have larger text
const InfoLabel = styled(Typography)(({ readonly }) => ({
  color: readonly ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.7)", // Lighter color for readonly fields
  fontSize: "1.1rem", // Increased from 0.875rem
  marginBottom: "4px",
  fontWeight: 500, // Added for more prominence
}))

// Update the InfoValue styled component to have larger text
const InfoValue = styled(Typography)(({ readonly }) => ({
  color: readonly ? "rgba(0, 0, 0, 0.7)" : "black", // Lighter color for readonly fields
  fontSize: "1.2rem", // Increased from 1rem
  fontWeight: 500,
}))

// Update the StyledTextField to have larger label
const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    color: "black",
    fontSize: "1.2rem", // Increased font size for input
    "& fieldset": {
      borderColor: "rgba(0, 0, 0, 0.23)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(0, 0, 0, 0.5)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#00AEEF",
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(0, 0, 0, 0.7)",
    fontSize: "1.1rem", // Increased label font size
    fontWeight: 500, // Added for more prominence
  },
  "& .MuiOutlinedInput-input": {
    color: "black",
  },
}))

// Update the SaveButton to be larger
const SaveButton = styled(Button)({
  backgroundColor: "#00AEEF",
  color: "white",
  fontSize: "1.1rem", // Increased font size
  fontWeight: 600, // Made font weight bolder
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
        sessionStorage.getItem("name") 

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
        <Card sx={{ bgcolor: "white", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }}>
          <CardContent>
            <Typography variant="h3" color="black" gutterBottom>
              Account Settings
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              View and update your personal information
            </Typography>

            {loading ? (
              <Typography color="text.primary" sx={{ textAlign: "center", my: 4 }}>
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
                    <Typography variant="h4" color="black">
                      {userData.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
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
                      startIcon={<Save size={20} />} // Increased icon size from 16 to 20
                      fullWidth
                      sx={{ height: "60px" }} // Increased from 56px to 60px
                    >
                      Save
                    </SaveButton>
                  </Grid>

                  <Grid item xs={12}>
                    <InfoCard readonly={true}>
                      <InfoLabel readonly={true}>Email</InfoLabel>
                      <InfoValue readonly={true}>{userData.email}</InfoValue>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                        Email cannot be changed
                      </Typography>
                    </InfoCard>
                  </Grid>

                  <Grid item xs={12}>
                    <InfoCard readonly={true}>
                      <InfoLabel readonly={true}>Name</InfoLabel>
                      <InfoValue readonly={true}>{userData.name}</InfoValue>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                        Name cannot be changed
                      </Typography>
                    </InfoCard>
                  </Grid>

                  <Grid item xs={12}>
                    <InfoCard readonly={true}>
                      <InfoLabel readonly={true}>Password</InfoLabel>
                      <InfoValue readonly={true}>••••••••</InfoValue>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                        Password cannot be changed here
                      </Typography>
                    </InfoCard>
                  </Grid>
                </Grid>
              </>
            )}

            {/* Logout Section */}
            <Box sx={{ mt: 6 }}>
              <Divider sx={{ bgcolor: "rgba(0, 0, 0, 0.12)", my: 2 }} />
              <Typography variant="h5" color="black" gutterBottom>
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


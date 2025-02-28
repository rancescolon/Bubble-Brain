"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Switch,
  Card,
  CardContent,
  Grid,
  Avatar,
  IconButton,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import { Upload } from "lucide-react"
import background from "../assets/image3.png"

// Custom styled components
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
}))

const SaveButton = styled(Button)({
  backgroundColor: "#00AEEF",
  color: "white",
  "&:hover": {
    backgroundColor: "#0099D4",
  },
})

const Profile = () => {
  const [username, setUsername] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [picture, setPicture] = useState("")
  const [notifications, setNotifications] = useState(true)
  const [privacy, setPrivacy] = useState(false)
  const [responseMessage, setResponseMessage] = useState("")

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_PATH}/users/${sessionStorage.getItem("user")}`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        if (result && result.attributes) {
          setUsername(result.attributes.username || "")
          setFirstName(result.attributes.firstName || "")
          setLastName(result.attributes.lastName || "")
          setEmail(result.attributes.email || "")
          setPicture(result.attributes.picture || "")
          setNotifications(result.attributes.notifications || true)
          setPrivacy(result.attributes.privacy || false)
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error)
      })
  }, [])

  const handleSubmit = (field, value) => {
    fetch(`${process.env.REACT_APP_API_PATH}/users/${sessionStorage.getItem("user")}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        attributes: {
          [field]: value,
        },
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        setResponseMessage(`${field} updated successfully`)
        setTimeout(() => setResponseMessage(""), 3000)
        if (field === "name") {
          sessionStorage.setItem("firstname", value.firstName);
          sessionStorage.setItem("lastname", value.lastName);
        }
      })
      .catch((error) => {
        console.error("Error updating profile:", error)
        setResponseMessage("Update failed")
      })
  }

  const uploadPicture = (event) => {
    const file = event.target.files[0]
    const formData = new FormData()
    formData.append("uploaderID", sessionStorage.getItem("user"))
    formData.append("attributes", JSON.stringify({}))
    formData.append("file", file)

    fetch(process.env.REACT_APP_API_PATH + "/file-uploads", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((result) => {
        const pictureURL = "https://webdev.cse.buffalo.edu" + result.path
        setPicture(pictureURL)
        sessionStorage.setItem("profilePicture", pictureURL);
        handleSubmit("picture", pictureURL)
      })
      .catch((error) => {
        console.error("Error uploading picture:", error)
      })
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
              Manage your personal information and settings
            </Typography>

            <Box sx={{ mt: 4, display: "flex", alignItems: "center", mb: 4 }}>
              <Avatar src={picture || "/placeholder.svg"} sx={{ width: 100, height: 100, mr: 2 }} />
              <Box>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="icon-button-file"
                  type="file"
                  onChange={uploadPicture}
                />
                <label htmlFor="icon-button-file">
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="span"
                    sx={{
                      bgcolor: "#00AEEF",
                      color: "white",
                      "&:hover": { bgcolor: "#0099D4" },
                    }}
                  >
                    <Upload />
                  </IconButton>
                </label>
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={8}>
                <StyledTextField
                  fullWidth
                  label="Name"
                  value={`${firstName} ${lastName}`}
                  onChange={(e) => {
                    const [first, ...rest] = e.target.value.split(" ")
                    setFirstName(first)
                    setLastName(rest.join(" "))
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <SaveButton variant="contained" onClick={() => handleSubmit("name", { firstName, lastName })}>
                  Save
                </SaveButton>
              </Grid>

              <Grid item xs={12} sm={8}>
                <StyledTextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <SaveButton variant="contained" onClick={() => handleSubmit("email", email)}>
                  Save
                </SaveButton>
              </Grid>

              <Grid item xs={12} sm={8}>
                <StyledTextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <SaveButton variant="contained" onClick={() => handleSubmit("password", password)}>
                  Save
                </SaveButton>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
                  <Typography color="white">Enable Notifications</Typography>
                  <Switch
                    checked={notifications}
                    onChange={(e) => {
                      setNotifications(e.target.checked)
                      handleSubmit("notifications", e.target.checked)
                    }}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#00AEEF",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                        backgroundColor: "#00AEEF",
                      },
                    }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography color="white">Privacy Settings</Typography>
                  <Switch
                    checked={privacy}
                    onChange={(e) => {
                      setPrivacy(e.target.checked)
                      handleSubmit("privacy", e.target.checked)
                    }}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#00AEEF",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                        backgroundColor: "#00AEEF",
                      },
                    }}
                  />
                </Box>
              </Grid>
            </Grid>

            {responseMessage && (
              <Typography color="primary" sx={{ mt: 2, color: "#00AEEF" }}>
                {responseMessage}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}

export default Profile



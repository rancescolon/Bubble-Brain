// import React, { useState, useEffect } from "react";
// import "../App.css";

// // The Profile component shows data from the user table.  This is set up fairly generically to allow for you to customize
// // user data by adding it to the attributes for each user, which is just a set of name value pairs that you can add things to
// // in order to support your group specific functionality.  In this example, we store basic profile information for the user
// const Profile = (props) => {
//   // states which contain basic user information/attributes
//   // Initially set them all as empty strings to post them to the backend
//   const [username, setUsername] = useState("");
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [favoriteColor, setFavoriteColor] = useState("");
//   const [responseMessage, setResponseMessage] = useState("");
//   const [picture, setPicture] = useState("");

//   // Replace componentDidMount for fetching data
//   useEffect(() => {
//     fetch(
//       `${process.env.REACT_APP_API_PATH}/users/${sessionStorage.getItem(
//         "user"
//       )}`,
//       {
//         method: "get",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${sessionStorage.getItem("token")}`,
//         },
//       }
//     )
//       .then((res) => res.json())
//       .then((result) => {
//         if (result && result.attributes) {
//           // if the attributes already exists and they are stored, set the states to those attributes
//           // so that nothing gets overwritten
//           setUsername(result.attributes.username || "");
//           setFirstName(result.attributes.firstName || "");
//           setLastName(result.attributes.lastName || "");
//           setFavoriteColor(result.attributes.favoritecolor || "");
//           setPicture(result.attributes.picture || "");
//         }
//       })
//       .catch((error) => {
//         alert("error!");
//       });
//   }, []);

//   // This is the function that will get called the first time that the component gets rendered.  This is where we load the current
//   // values from the database via the API, and put them in the state so that they can be rendered to the screen.
//   const submitHandler = (event) => {
//     //keep the form from actually submitting, since we are handling the action ourselves via
//     //the fetch calls to the API
//     event.preventDefault();

//     //make the api call to the user controller, and update the user fields (username, firstname, lastname)
//     fetch(
//       `${process.env.REACT_APP_API_PATH}/users/${sessionStorage.getItem(
//         "user"
//       )}`,
//       {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${sessionStorage.getItem("token")}`,
//         },
//         body: JSON.stringify({
//           attributes: {
//             username: username,
//             firstName: firstName,
//             lastName: lastName,
//             favoritecolor: favoriteColor,
//             picture: picture,
//           },
//         }),
//       }
//     )
//       .then((res) => res.json())
//       .then((result) => {
//         setResponseMessage(result.Status);
//       })
//       .catch((error) => {
//         alert("error!");
//       });
//   };

//   const uploadPicture = (event) => {
//     event.preventDefault();

//     // event.target.files[0] holds the file object that the user is uploading
//     const file = event.target.files[0];

//     // FormData objects are used to capture HTML form and submit it using fetch or another network method.
//     // provides a way to construct a set of key/value pairs representing form fields and their values
//     // we can use this formData to send the attributes for the file-uploads endpoint
//     const formData = new FormData();

//     formData.append("uploaderID", sessionStorage.getItem("user")); // the id of the user who is uploading the file
//     formData.append("attributes", JSON.stringify({})); // attributes holds an empty object, can put whatever you want here
//     formData.append("file", file); // the file itself

//     // make api call to file-uploads endpoint to post the profile picture
//     fetch(process.env.REACT_APP_API_PATH + "/file-uploads", {
//       method: "POST",
//       headers: {
//         Authorization: "Bearer " + sessionStorage.getItem("token"),
//       },
//       body: formData, // send the formdata to the backend
//     })
//       .then((res) => res.json())
//       .then((result) => {
//         // pictureURL holds the url of where the picture is stored to show on the page
//         let pictureURL = "https://webdev.cse.buffalo.edu" + result.path;
//         setPicture(pictureURL);
//       });
//   };

//   // This is the function that draws the component to the screen.  It will get called every time the
//   // state changes, automatically.  This is why you see the username and firstname change on the screen
//   // as you type them.
//   return (
//     <>
//       <img src={picture} alt="picture" />
//       <form onSubmit={submitHandler} className="profileform">
//         <label>
//           Picture
//           <input type="file" accept="image/*" onChange={uploadPicture} />
//         </label>
//         <label>
//           Username
//           <input
//             type="text"
//             onChange={(e) => setUsername(e.target.value)}
//             value={username}
//           />
//         </label>
//         <label>
//           First Name
//           <input
//             type="text"
//             onChange={(e) => setFirstName(e.target.value)}
//             value={firstName}
//           />
//         </label>
//         <label>
//           Last Name
//           <input
//             type="text"
//             onChange={(e) => setLastName(e.target.value)}
//             value={lastName}
//           />
//         </label>
//         <label>
//           Favorite Color
//           <input
//             type="text"
//             onChange={(e) => setFavoriteColor(e.target.value)}
//             value={favoriteColor}
//           />
//         </label>
//         <input type="submit" value="submit" />
//         <p>Username is : {username}</p>
//         <p>Firstname is : {firstName}</p>
//         {responseMessage}
//       </form>
//     </>
//   );
// };

// export default Profile;
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

// Custom styled Component
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



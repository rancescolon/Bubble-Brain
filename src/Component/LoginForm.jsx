
// "use client"

// import { useState } from "react"
// import { Link, useNavigate } from "react-router-dom"
// import { AppBar, Toolbar, Typography, Button, TextField, Box, Container } from "@mui/material"
// import BubbleTrapAnimation from "./BubbleTrapAnimation"
// import Frame from "../assets/Frame.png"
// import background from "../assets/image3.png"

// const LoginForm = ({ setLoggedIn }) => {
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [sessionToken, setSessionToken] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const [showAnimation, setShowAnimation] = useState(false)
//   const [loginResult, setLoginResult] = useState(null)
//   const navigate = useNavigate()

//   const submitHandler = (event) => {
//     event.preventDefault()
//     setIsLoading(true)

//     fetch(process.env.REACT_APP_API_PATH + "/auth/login", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         email,
//         password,
//       }),
//     })
//       .then((res) => res.json())
//       .then((result) => {
//         if (result.userID) {
//           console.log(result)
//           sessionStorage.setItem("token", result.token)
//           sessionStorage.setItem("user", result.userID)
//           setLoginResult(result)

//           const isFirstLogin = !localStorage.getItem("hasLoggedInBefore")
//           if (isFirstLogin) {
//             setShowAnimation(true)
//             localStorage.setItem("hasLoggedInBefore", "true")
//           } else {
//             completeLogin(result)
//           }
//         }
//       })
//       .catch((err) => {
//         console.log(err)
//       })
//       .finally(() => {
//         setIsLoading(false)
//       })
//   }

//   const completeLogin = (result) => {
//     if (!result && loginResult) {
//       result = loginResult
//     }
//     if (result) {
//       setLoggedIn(true)
//       setSessionToken(result.token)
//       navigate("/")
//       window.location.reload()
//     } else {
//       console.error("No login result available")
//       navigate("/login")
//     }
//   }

//   return (
//     <>
//       {showAnimation ? (
//         <BubbleTrapAnimation onComplete={() => completeLogin(loginResult)} />
//       ) : (
//         <Box
//           sx={{
//             flexGrow: 1,
//             bgcolor: "#1D1D20",
//             minHeight: "100vh",
//             backgroundImage: `url(${background})`,
//             backgroundSize: "cover",
//             backgroundPosition: "center",
//             backgroundRepeat: "no-repeat",
//             opacity: 1.0,
//           }}
//         >
//           <AppBar position="static" sx={{ bgcolor: "#1D6EF1", boxShadow: "none" }}>
//             <Toolbar>
//               <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
//                 <img
//                   src={Frame || "/placeholder.svg"}
//                   alt="Bubble Brain Logo"
//                   style={{ height: 80, width: 80, marginRight: 8 }}
//                 />
//                 <Typography
//                   variant="h6"
//                   component={Link}
//                   to="/"
//                   sx={{
//                     fontFamily: "SourGummy, sans-serif",
//                     fontWeight: 800,
//                     fontSize: "52px",
//                     color: "#F4FDFF",
//                     textDecoration: "none",
//                   }}
//                 >
//                   Bubble Brain
//                 </Typography>
//               </Box>
//               <Button
//                 component={Link}
//                 to="/register"
//                 sx={{
//                   fontFamily: "SourGummy, sans-serif",
//                   fontWeight: 500,
//                   fontSize: "16px",
//                   color: "#F4FDFF",
//                   "&:hover": {
//                     bgcolor: "rgba(244, 253, 255, 0.1)",
//                   },
//                 }}
//               >
//                 Sign Up
//               </Button>
//             </Toolbar>
//           </AppBar>

//           <Container maxWidth="sm">
//             <Box
//               sx={{
//                 bgcolor: "#FFFFFF",
//                 mt: 4,
//                 p: 4,
//                 borderRadius: 2,
//                 boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
//               }}
//             >
//               <Typography
//                 variant="h4"
//                 align="center"
//                 gutterBottom
//                 sx={{
//                   fontFamily: "SourGummy, sans-serif",
//                   fontWeight: 800,
//                   fontSize: "40px",
//                   color: "#1D1D20",
//                 }}
//               >
//                 Welcome Back!
//               </Typography>

//               <form onSubmit={submitHandler}>
//                 <TextField
//                   fullWidth
//                   label="Email"
//                   variant="outlined"
//                   margin="normal"
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                   InputLabelProps={{
//                     style: { fontFamily: "SourGummy, sans-serif" },
//                   }}
//                   InputProps={{
//                     style: { fontFamily: "SourGummy, sans-serif" },
//                   }}
//                 />
//                 <TextField
//                   fullWidth
//                   label="Password"
//                   variant="outlined"
//                   margin="normal"
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                   InputLabelProps={{
//                     style: { fontFamily: "SourGummy, sans-serif" },
//                   }}
//                   InputProps={{
//                     style: { fontFamily: "SourGummy, sans-serif" },
//                   }}
//                 />
//                 <Button
//                   type="submit"
//                   fullWidth
//                   variant="contained"
//                   disabled={isLoading}
//                   sx={{
//                     mt: 3,
//                     mb: 2,
//                     bgcolor: "#EF7B6C",
//                     "&:hover": {
//                       bgcolor: "#e66a59",
//                     },
//                     fontFamily: "SourGummy, sans-serif",
//                     fontWeight: 600,
//                     fontSize: "24px",
//                     color: "#F4FDFF",
//                   }}
//                 >
//                   {isLoading ? "Logging in..." : "Login"}
//                 </Button>
//               </form>

//               <Box sx={{ mt: 2, textAlign: "center" }}>
//                 <Link
//                   to="/reset-password"
//                   style={{
//                     fontFamily: "SourGummy, sans-serif",
//                     fontWeight: 500,
//                     fontSize: "14px",
//                     color: "#1D6EF1",
//                     textDecoration: "none",
//                   }}
//                 >
//                   Forgot Password?
//                 </Link>
//               </Box>

//               <Box sx={{ mt: 2, textAlign: "center" }}>
//                 <Typography
//                   sx={{
//                     fontFamily: "SourGummy, sans-serif",
//                     fontWeight: 500,
//                     fontSize: "14px",
//                     color: "#1D1D20",
//                   }}
//                 >
//                   Don't have an account?{" "}
//                   <Link
//                     to="/register"
//                     style={{
//                       fontFamily: "SourGummy, sans-serif",
//                       fontWeight: 500,
//                       fontSize: "14px",
//                       color: "#1D6EF1",
//                       textDecoration: "none",
//                     }}
//                   >
//                     Sign Up
//                   </Link>
//                 </Typography>
//               </Box>
//             </Box>
//           </Container>
//         </Box>
//       )}
//     </>
//   )
// }

// export default LoginForm

"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AppBar, Toolbar, Typography, Button, TextField, Box, Container, Snackbar } from "@mui/material"
import BubbleTrapAnimation from "./BubbleTrapAnimation"
import Frame from "../assets/Frame.png"
import background from "../assets/image3.png"

const LoginForm = ({ setLoggedIn }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [sessionToken, setSessionToken] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  const [loginResult, setLoginResult] = useState(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const navigate = useNavigate()

  const submitHandler = (event) => {
    event.preventDefault()
    setIsLoading(true)

    fetch(process.env.REACT_APP_API_PATH + "/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.userID) {
          console.log(result)
          sessionStorage.setItem("token", result.token)
          sessionStorage.setItem("user", result.userID)
          setLoginResult(result)

          const isFirstLogin = !localStorage.getItem("hasLoggedInBefore")
          if (isFirstLogin) {
            setShowAnimation(true)
            localStorage.setItem("hasLoggedInBefore", "true")
          } else {
            completeLogin(result)
          }
        } else {
          setOpenSnackbar(true)
        }
      })
      .catch((err) => {
        console.log(err)
        setOpenSnackbar(true)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const completeLogin = (result) => {
    if (!result && loginResult) {
      result = loginResult
    }
    if (result) {
      setLoggedIn(true)
      setSessionToken(result.token)
      navigate("/")
      window.location.reload()
    } else {
      console.error("No login result available")
      navigate("/login")
    }
  }

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return
    }
    setOpenSnackbar(false)
  }

  return (
    <>
      {showAnimation ? (
        <BubbleTrapAnimation onComplete={() => completeLogin(loginResult)} />
      ) : (
        <Box
          sx={{
            flexGrow: 1,
            bgcolor: "#1D1D20",
            minHeight: "100vh",
            backgroundImage: `url(${background})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: 1.0,
          }}
        >
          <AppBar position="static" sx={{ bgcolor: "#1D6EF1", boxShadow: "none" }}>
            <Toolbar>
              <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
                <img
                  src={Frame || "/placeholder.svg"}
                  alt="Bubble Brain Logo"
                  style={{ height: 80, width: 80, marginRight: 8 }}
                />
                <Typography
                  variant="h6"
                  component={Link}
                  to="/"
                  sx={{
                    fontFamily: "SourGummy, sans-serif",
                    fontWeight: 800,
                    fontSize: "52px",
                    color: "#F4FDFF",
                    textDecoration: "none",
                  }}
                >
                  Bubble Brain
                </Typography>
              </Box>
              <Button
                component={Link}
                to="/register"
                sx={{
                  fontFamily: "SourGummy, sans-serif",
                  fontWeight: 500,
                  fontSize: "16px",
                  color: "#F4FDFF",
                  "&:hover": {
                    bgcolor: "rgba(244, 253, 255, 0.1)",
                  },
                }}
              >
                Sign Up
              </Button>
            </Toolbar>
          </AppBar>

          <Container maxWidth="sm">
            <Box
              sx={{
                bgcolor: "#FFFFFF",
                mt: 4,
                p: 4,
                borderRadius: 2,
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            >
              <Typography
                variant="h4"
                align="center"
                gutterBottom
                sx={{
                  fontFamily: "SourGummy, sans-serif",
                  fontWeight: 800,
                  fontSize: "40px",
                  color: "#1D1D20",
                }}
              >
                Welcome Back!
              </Typography>

              <form onSubmit={submitHandler}>
                <TextField
                  fullWidth
                  label="Email"
                  variant="outlined"
                  margin="normal"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  InputLabelProps={{
                    style: { fontFamily: "SourGummy, sans-serif" },
                  }}
                  InputProps={{
                    style: { fontFamily: "SourGummy, sans-serif" },
                  }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  variant="outlined"
                  margin="normal"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  InputLabelProps={{
                    style: { fontFamily: "SourGummy, sans-serif" },
                  }}
                  InputProps={{
                    style: { fontFamily: "SourGummy, sans-serif" },
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  sx={{
                    mt: 3,
                    mb: 2,
                    bgcolor: "#EF7B6C",
                    "&:hover": {
                      bgcolor: "#e66a59",
                    },
                    fontFamily: "SourGummy, sans-serif",
                    fontWeight: 600,
                    fontSize: "24px",
                    color: "#F4FDFF",
                  }}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>

              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Link
                  to="/reset-password"
                  style={{
                    fontFamily: "SourGummy, sans-serif",
                    fontWeight: 500,
                    fontSize: "14px",
                    color: "#1D6EF1",
                    textDecoration: "none",
                  }}
                >
                  Forgot Password?
                </Link>
              </Box>

              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Typography
                  sx={{
                    fontFamily: "SourGummy, sans-serif",
                    fontWeight: 500,
                    fontSize: "14px",
                    color: "#1D1D20",
                  }}
                >
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    style={{
                      fontFamily: "SourGummy, sans-serif",
                      fontWeight: 500,
                      fontSize: "14px",
                      color: "#1D6EF1",
                      textDecoration: "none",
                    }}
                  >
                    Sign Up
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Container>

          <Snackbar
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            open={openSnackbar}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            message="Incorrect email or password"
          />
        </Box>
      )}
    </>
  )
}

export default LoginForm


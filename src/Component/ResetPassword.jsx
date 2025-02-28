

// "use client"

// import { useState } from "react"
// import { Link, useNavigate } from "react-router-dom"
// import { Eye, EyeOff } from "lucide-react"
// import {
//   AppBar,
//   Toolbar,
//   Typography,
//   Button,
//   TextField,
//   Box,
//   Container,
//   IconButton,
//   InputAdornment,
// } from "@mui/material"
// import Logo from "../assets/Frame.png"
// import background from "../assets/image3.png"

// const ResetPassword = () => {
//   const [email, setEmail] = useState("")
//   const [gotToken, setGotToken] = useState(false)
//   const [token, setToken] = useState("")
//   const [password, setPassword] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const [showPassword, setShowPassword] = useState(false)
//   const navigate = useNavigate()

//   const handleResetRequest = (event) => {
//     event.preventDefault()
//     setIsLoading(true)

//     fetch(process.env.REACT_APP_API_PATH + "/auth/request-reset", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         email,
//       }),
//     })
//       .then((res) => {
//         if (res.ok) {
//           setGotToken(true)
//         }
//       })
//       .catch((error) => {
//         console.error("Error:", error)
//       })
//       .finally(() => {
//         setIsLoading(false)
//       })
//   }

//   const handleResetPassword = (event) => {
//     event.preventDefault()
//     setIsLoading(true)

//     fetch(process.env.REACT_APP_API_PATH + "/auth/reset-password", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         token,
//         password,
//       }),
//     })
//       .then((res) => {
//         if (res.ok) {
//           navigate("/login")
//         }
//       })
//       .catch((error) => {
//         console.error("Error:", error)
//       })
//       .finally(() => {
//         setIsLoading(false)
//       })
//   }

//   return (
//     <Box
//       sx={{
//         flexGrow: 1,
//         bgcolor: "#1D1D20",
//         minHeight: "100vh",
//         backgroundImage: `url(${background})`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundRepeat: "no-repeat",
//         opacity: 1.0,
//       }}
//     >
//       <AppBar position="static" sx={{ bgcolor: "#1D6EF1", boxShadow: "none" }}>
//         <Toolbar>
//           <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
//             <img
//               src={Logo || "/placeholder.svg"}
//               alt="Bubble Brain Logo"
//               style={{ height: 80, width: 80, marginRight: 8 }}
//             />
//             <Typography
//               variant="h6"
//               component={Link}
//               to="/login"
//               sx={{
//                 fontFamily: "SourGummy, sans-serif",
//                 fontWeight: 800,
//                 fontSize: "52px",
//                 color: "#F4FDFF",
//                 textDecoration: "none",
//               }}
//             >
//               Bubble Brain
//             </Typography>
//           </Box>
//           <Button
//             component={Link}
//             to="/login"
//             sx={{
//               fontFamily: "SourGummy, sans-serif",
//               fontWeight: 500,
//               fontSize: "16px",
//               color: "#F4FDFF",
//               "&:hover": {
//                 bgcolor: "rgba(244, 253, 255, 0.1)",
//               },
//             }}
//           >
//             Login
//           </Button>
//         </Toolbar>
//       </AppBar>

//       <Container maxWidth="sm">
//         <Box
//           sx={{
//             bgcolor: "#FFFFFF",
//             mt: 4,
//             p: 4,
//             borderRadius: 2,
//             boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
//           }}
//         >
//           {!gotToken ? (
//             <>
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
//                 Reset Password
//               </Typography>
//               <Typography
//                 align="center"
//                 sx={{
//                   fontFamily: "SourGummy, sans-serif",
//                   fontWeight: 500,
//                   fontSize: "14px",
//                   color: "#1D1D20",
//                   mb: 3,
//                 }}
//               >
//                 Enter the email associated with your account below to receive instructions on resetting your account's
//                 password.
//               </Typography>

//               <form onSubmit={handleResetRequest}>
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
//                   {isLoading ? "Sending..." : "Send Reset Instructions"}
//                 </Button>
//               </form>
//             </>
//           ) : (
//             <>
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
//                 Change Your Password
//               </Typography>
//               <Typography
//                 align="center"
//                 sx={{
//                   fontFamily: "SourGummy, sans-serif",
//                   fontWeight: 500,
//                   fontSize: "14px",
//                   color: "#1D1D20",
//                   mb: 3,
//                 }}
//               >
//                 Enter a new password below to change your password.
//               </Typography>

//               <form onSubmit={handleResetPassword}>
//                 <TextField
//                   fullWidth
//                   label="Reset Token"
//                   variant="outlined"
//                   margin="normal"
//                   value={token}
//                   onChange={(e) => setToken(e.target.value)}
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
//                   label="New Password"
//                   variant="outlined"
//                   margin="normal"
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                   InputLabelProps={{
//                     style: { fontFamily: "SourGummy, sans-serif" },
//                   }}
//                   InputProps={{
//                     style: { fontFamily: "SourGummy, sans-serif" },
//                     endAdornment: (
//                       <InputAdornment position="end">
//                         <IconButton
//                           aria-label="toggle password visibility"
//                           onClick={() => setShowPassword(!showPassword)}
//                           edge="end"
//                         >
//                           {showPassword ? <EyeOff /> : <Eye />}
//                         </IconButton>
//                       </InputAdornment>
//                     ),
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
//                   {isLoading ? "Changing..." : "Change Password"}
//                 </Button>
//               </form>
//             </>
//           )}

//           <Box sx={{ mt: 2, textAlign: "center" }}>
//             <Link
//               to="/login"
//               style={{
//                 fontFamily: "SourGummy, sans-serif",
//                 fontWeight: 500,
//                 fontSize: "14px",
//                 color: "#1D6EF1",
//                 textDecoration: "none",
//               }}
//             >
//               Back to Login
//             </Link>
//           </Box>
//         </Box>
//       </Container>
//     </Box>
//   )
// }

// export default ResetPassword

"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  TextField,
  Box,
  Container,
  IconButton,
  InputAdornment,
} from "@mui/material"
import Logo from "../assets/Frame.png"
import background from "../assets/image3.png"

const ResetPassword = () => {
  const [email, setEmail] = useState("")
  const [gotToken, setGotToken] = useState(false)
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleResetRequest = (event) => {
    event.preventDefault()
    setIsLoading(true)

    fetch(process.env.REACT_APP_API_PATH + "/auth/request-reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    })
      .then((res) => {
        if (res.ok) {
          setGotToken(true)
        }
      })
      .catch((error) => {
        console.error("Error:", error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleResetPassword = (event) => {
    event.preventDefault()
    setIsLoading(true)

    fetch(process.env.REACT_APP_API_PATH + "/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        password,
      }),
    })
      .then((res) => {
        if (res.ok) {
          navigate("/login")
        }
      })
      .catch((error) => {
        console.error("Error:", error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
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
              src={Logo || "/placeholder.svg"}
              alt="Bubble Brain Logo"
              style={{ height: 80, width: 80, marginRight: 8 }}
            />
            <Typography
              variant="h6"
              component={Link}
              to="/login"
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
            to="/login"
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
            Login
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
          {!gotToken ? (
            <>
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
                Reset Password
              </Typography>
              <Typography
                align="center"
                sx={{
                  fontFamily: "SourGummy, sans-serif",
                  fontWeight: 500,
                  fontSize: "16px",
                  color: "#1D1D20",
                  mb: 3,
                }}
              >
                Follow these steps to reset your password:
                <Box component="ol" sx={{ textAlign: "left", mt: 2 }}>
                  <li>Enter your email address below</li>
                  <li>Check your email for the reset token</li>
                  <li>Return here to enter the token and set a new password</li>
                </Box>
              </Typography>

              <form onSubmit={handleResetRequest}>
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
                  {isLoading ? "Sending..." : "Send Reset Instructions"}
                </Button>
              </form>
            </>
          ) : (
            <>
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
                Change Your Password
              </Typography>
              <Typography
                align="center"
                sx={{
                  fontFamily: "SourGummy, sans-serif",
                  fontWeight: 500,
                  fontSize: "16px",
                  color: "#1D1D20",
                  mb: 3,
                }}
              >
                Check your email for the reset token. Enter it below along with your new password. The token expires in
                30 minutes for security.
              </Typography>

              <form onSubmit={handleResetPassword}>
                <TextField
                  fullWidth
                  label="Reset Token"
                  variant="outlined"
                  margin="normal"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
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
                  label="New Password"
                  variant="outlined"
                  margin="normal"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  InputLabelProps={{
                    style: { fontFamily: "SourGummy, sans-serif" },
                  }}
                  InputProps={{
                    style: { fontFamily: "SourGummy, sans-serif" },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <EyeOff /> : <Eye />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  helperText="Password must contain at least 8 characters, including one uppercase letter, one number, and one special character"
                  FormHelperTextProps={{
                    sx: {
                      fontFamily: "SourGummy, sans-serif",
                      fontSize: "12px",
                    },
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
                  {isLoading ? "Changing..." : "Change Password"}
                </Button>
              </form>
            </>
          )}

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Link
              to="/login"
              style={{
                fontFamily: "SourGummy, sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                color: "#1D6EF1",
                textDecoration: "none",
              }}
            >
              Back to Login
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default ResetPassword


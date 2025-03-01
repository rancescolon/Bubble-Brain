

// "use client"

// import { useEffect, useState } from "react"
// import { Link, useNavigate } from "react-router-dom"
// import { AppBar, Toolbar, Typography, Button, TextField, Box, Container } from "@mui/material"
// import Logo from "../assets/Frame.png"
// import background from "../assets/image3.png"

// const RegisterForm = ({ setLoggedIn }) => {
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [name, setName] = useState("")
//   const [phonenumber, setPhoneNumber] = useState("")
//   const [zipcode, setZipCode] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState("")
//   const navigate = useNavigate()

//   const submitHandler = (event) => {
//     event.preventDefault()
//     setIsLoading(true)
//     setError("")

//     fetch(process.env.REACT_APP_API_PATH + "/auth/signup", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         name,
//         email,
//         password,
//         phonenumber,
//         zipcode,
//       }),
//     })
//       .then((res) => {
//         if (!res.ok) {
//           throw new Error("Signup failed")
//         }
//         return res.json()
//       })
//       .then((result) => {
//         console.log(result)
//         navigate("/login", { state: { message: "Registration successful! Please log in." } })
//       })
//       .catch((error) => {
//         console.error("Error:", error)
//         setError(
//           "Registration failed. Ensure you are using a valid email with a special character, number, and letters.",
//         )
//       })
//       .finally(() => {
//         setIsLoading(false)
//       })
//   }

//   useEffect(() => {
//     if (sessionStorage.getItem("token")) {
//       navigate("/login")
//     }
//   }, [navigate])

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
//           <Typography
//             variant="h4"
//             align="center"
//             gutterBottom
//             sx={{
//               fontFamily: "SourGummy, sans-serif",
//               fontWeight: 800,
//               fontSize: "40px",
//               color: "#1D1D20",
//             }}
//           >
//             Create an Account
//           </Typography>

//           {error && (
//             <Typography
//               color="error"
//               align="center"
//               sx={{
//                 fontFamily: "SourGummy, sans-serif",
//                 fontWeight: 500,
//                 fontSize: "14px",
//                 mb: 2,
//               }}
//             >
//               {error}
//             </Typography>
//           )}

//           <form onSubmit={submitHandler}>
//             <TextField
//               fullWidth
//               label="Name"
//               variant="outlined"
//               margin="normal"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required
//               InputLabelProps={{
//                 style: { fontFamily: "SourGummy, sans-serif" },
//               }}
//               InputProps={{
//                 style: { fontFamily: "SourGummy, sans-serif" },
//               }}
//             />
//             <TextField
//               fullWidth
//               label="Email"
//               variant="outlined"
//               margin="normal"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               InputLabelProps={{
//                 style: { fontFamily: "SourGummy, sans-serif" },
//               }}
//               InputProps={{
//                 style: { fontFamily: "SourGummy, sans-serif" },
//               }}
//             />
//             <TextField
//               fullWidth
//               label="Password"
//               variant="outlined"
//               margin="normal"
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               InputLabelProps={{
//                 style: { fontFamily: "SourGummy, sans-serif" },
//               }}
//               InputProps={{
//                 style: { fontFamily: "SourGummy, sans-serif" },
//               }}
//             />
//             <TextField
//               fullWidth
//               label="Phone Number"
//               variant="outlined"
//               margin="normal"
//               value={phonenumber}
//               onChange={(e) => setPhoneNumber(e.target.value)}
//               required
//               InputLabelProps={{
//                 style: { fontFamily: "SourGummy, sans-serif" },
//               }}
//               InputProps={{
//                 style: { fontFamily: "SourGummy, sans-serif" },
//               }}
//             />
//             <TextField
//               fullWidth
//               label="Zip Code"
//               variant="outlined"
//               margin="normal"
//               value={zipcode}
//               onChange={(e) => setZipCode(e.target.value)}
//               required
//               InputLabelProps={{
//                 style: { fontFamily: "SourGummy, sans-serif" },
//               }}
//               InputProps={{
//                 style: { fontFamily: "SourGummy, sans-serif" },
//               }}
//             />
//             <Button
//               type="submit"
//               fullWidth
//               variant="contained"
//               disabled={isLoading}
//               sx={{
//                 mt: 3,
//                 mb: 2,
//                 bgcolor: "#EF7B6C",
//                 "&:hover": {
//                   bgcolor: "#e66a59",
//                 },
//                 fontFamily: "SourGummy, sans-serif",
//                 fontWeight: 600,
//                 fontSize: "24px",
//                 color: "#F4FDFF",
//               }}
//             >
//               {isLoading ? "Signing up..." : "Sign Up"}
//             </Button>
//           </form>

//           <Box sx={{ mt: 2, textAlign: "center" }}>
//             <Typography
//               sx={{
//                 fontFamily: "SourGummy, sans-serif",
//                 fontWeight: 500,
//                 fontSize: "14px",
//                 color: "#1D1D20",
//               }}
//             >
//               Have an account?{" "}
//               <Link
//                 to="/login"
//                 style={{
//                   fontFamily: "SourGummy, sans-serif",
//                   fontWeight: 500,
//                   fontSize: "14px",
//                   color: "#1D6EF1",
//                   textDecoration: "none",
//                 }}
//               >
//                 Login
//               </Link>
//             </Typography>
//           </Box>
//           <Box sx={{ mt: 1, textAlign: "center" }}>
//             <Link
//               to="/reset-password"
//               style={{
//                 fontFamily: "SourGummy, sans-serif",
//                 fontWeight: 500,
//                 fontSize: "14px",
//                 color: "#1D6EF1",
//                 textDecoration: "none",
//               }}
//             >
//               Reset your password
//             </Link>
//           </Box>
//         </Box>
//       </Container>
//     </Box>
//   )
// }

// export default RegisterForm

"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AppBar, Toolbar, Typography, Button, TextField, Box, Container } from "@mui/material"
import Logo from "../assets/Frame.png"
import background from "../assets/image3.png"

const RegisterForm = ({ setLoggedIn }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [phonenumber, setPhoneNumber] = useState("")
  const [zipcode, setZipCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const submitHandler = (event) => {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate password
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
      setError(
        "Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.",
      )
      setIsLoading(false)
      return
    }

    // Validate phone number
    if (!/^$$\d{3}$$ \d{3}-\d{4}$/.test(phonenumber)) {
      setError("Please enter a valid phone number in the format (XXX) XXX-XXXX.")
      setIsLoading(false)
      return
    }

    // Validate zip code
    if (!/^\d{5}(-\d{4})?$/.test(zipcode)) {
      setError("Please enter a valid 5-digit zip code or 9-digit ZIP+4 code.")
      setIsLoading(false)
      return
    }

    fetch(process.env.REACT_APP_API_PATH + "/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        phonenumber,
        zipcode,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Signup failed")
        }
        return res.json()
      })
      .then((result) => {
        console.log(result)
        navigate("/login", { state: { message: "Registration successful! Please log in." } })
      })
      .catch((error) => {
        console.error("Error:", error)
        setError("Registration failed. Please check your information and try again.")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    if (sessionStorage.getItem("token")) {
      navigate("/login")
    }
  }, [navigate])

  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/[^\d]/g, "")
    if (phoneNumber.length < 4) return phoneNumber
    if (phoneNumber.length < 7) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
  }

  const handlePhoneNumberChange = (e) => {
    const formattedPhoneNumber = formatPhoneNumber(e.target.value)
    setPhoneNumber(formattedPhoneNumber)
  }

  const formatZipCode = (value) => {
    const digits = value.replace(/[^\d]/g, "")
    if (digits.length <= 5) return digits
    return `${digits.slice(0, 5)}-${digits.slice(5, 9)}`
  }

  const handleZipCodeChange = (e) => {
    const formattedZipCode = formatZipCode(e.target.value)
    setZipCode(formattedZipCode)
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
            Create an Account
          </Typography>

          {error && (
            <Typography
              color="error"
              align="center"
              sx={{
                fontFamily: "SourGummy, sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                mb: 2,
              }}
            >
              {error}
            </Typography>
          )}

          <form onSubmit={submitHandler}>
            <TextField
              fullWidth
              label="Name"
              variant="outlined"
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              InputLabelProps={{
                style: { fontFamily: "SourGummy, sans-serif" },
              }}
              InputProps={{
                style: { fontFamily: "SourGummy, sans-serif" },
              }}
              helperText="Enter your full name"
            />
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
              helperText="Enter a valid email address"
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
              helperText="Password must be at least 8 characters long and include an uppercase letter, a number, and a special character"
            />
            <TextField
              fullWidth
              label="Phone Number"
              variant="outlined"
              margin="normal"
              value={phonenumber}
              onChange={handlePhoneNumberChange}
              required
              InputLabelProps={{
                style: { fontFamily: "SourGummy, sans-serif" },
              }}
              InputProps={{
                style: { fontFamily: "SourGummy, sans-serif" },
              }}
              helperText="Enter your phone number in the format (XXX) XXX-XXXX"
            />
            <TextField
              fullWidth
              label="Zip Code"
              variant="outlined"
              margin="normal"
              value={zipcode}
              onChange={handleZipCodeChange}
              required
              InputLabelProps={{
                style: { fontFamily: "SourGummy, sans-serif" },
              }}
              InputProps={{
                style: { fontFamily: "SourGummy, sans-serif" },
              }}
              helperText="Enter a valid 5-digit zip code"
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
              {isLoading ? "Signing up..." : "Sign Up"}
            </Button>
          </form>

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography
              sx={{
                fontFamily: "SourGummy, sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                color: "#1D1D20",
              }}
            >
              Have an account?{" "}
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
                Login
              </Link>
            </Typography>
          </Box>
          {/* <Box sx={{ mt: 1, textAlign: "center" }}>
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
              Reset your password
            </Link>
          </Box> */}
        </Box>
      </Container>
    </Box>
  )
}

export default RegisterForm


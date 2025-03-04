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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const submitHandler = (event) => {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    fetch(process.env.REACT_APP_API_PATH + "/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        attributes: {
          name: name, // Store name as an attribute
        },
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Signup failed")
        }
        return res.json()
      })
      .then((result) => {
        console.log("Registration result:", result)

        // Option 1: Auto-login after registration
        // sessionStorage.setItem("token", result.token)
        // sessionStorage.setItem("user", result.userID)
        // sessionStorage.setItem("name", name)
        // if (setLoggedIn) {
        //   setLoggedIn(true)
        // }
        // navigate("/")

        // Option 2: Redirect to login page (preferred)
        // Don't set session storage or login state
        navigate("/login", {
          state: {
            message: "Registration successful! Please log in with your new account.",
            email: email, // Pass email to pre-fill the login form
          },
        })
      })
      .catch((error) => {
        console.error("Error:", error)
        setError(
          "Registration failed. Ensure you are using a valid email with a special character, number, and letters.",
        )
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (sessionStorage.getItem("token")) {
      navigate("/")
    }
  }, [navigate])

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
          <Box sx={{ mt: 1, textAlign: "center" }}>
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
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default RegisterForm


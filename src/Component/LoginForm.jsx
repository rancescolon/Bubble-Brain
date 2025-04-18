"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { AppBar, Toolbar, Typography, Button, TextField, Box, Container, Snackbar, Alert } from "@mui/material"
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
    const [snackbarMessage, setSnackbarMessage] = useState("Incorrect email or password")
    const [snackbarSeverity, setSnackbarSeverity] = useState("error")
    const navigate = useNavigate()
    const location = useLocation()

    // Check for registration success message
    useEffect(() => {
        if (location.state?.message) {
            setSnackbarMessage(location.state.message)
            setSnackbarSeverity("success")
            setOpenSnackbar(true)

            // Pre-fill email if provided from registration
            if (location.state.email) {
                setEmail(location.state.email)
            }

            // Clear the state to prevent showing the message on refresh
            window.history.replaceState({}, document.title)
        }
    }, [location])

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
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Login failed")
                }
                return res.json()
            })
            .then((result) => {
                console.log("Login result:", result)
                sessionStorage.setItem("token", result.token)
                sessionStorage.setItem("user", result.userID)
                setLoginResult(result)

                // Check if this is the first login
                const isFirstLogin = !localStorage.getItem("hasLoggedInBefore")
                console.log("Is first login:", isFirstLogin)

                if (isFirstLogin) {
                    console.log("Showing animation")
                    setShowAnimation(true)
                    localStorage.setItem("hasLoggedInBefore", "true")
                } else {
                    console.log("Skipping animation, not first login")
                    completeLogin(result)
                }
            })
            .catch((err) => {
                console.error("Login error:", err)
                setSnackbarMessage("Incorrect email or password")
                setSnackbarSeverity("error")
                setOpenSnackbar(true)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    const completeLogin = (result) => {
        console.log("Completing login")
        if (!result && loginResult) {
            result = loginResult
        }

        if (result) {
            // Fetch user details to get name
            fetch(`${process.env.REACT_APP_API_PATH}/users/${result.userID}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${result.token}`,
                },
            })
                .then((res) => res.json())
                .then((userData) => {
                    console.log("User data:", userData)
                    // Store name in session storage
                    if (userData.attributes?.name) {
                        sessionStorage.setItem("name", userData.attributes.name)
                    }

                    // Complete login process
                    setLoggedIn(true)
                    setSessionToken(result.token)
                    navigate("/")
                })
                .catch((err) => {
                    console.error("Error fetching user data:", err)
                    // Still complete login even if user data fetch fails
                    setLoggedIn(true)
                    setSessionToken(result.token)
                    navigate("/")
                })
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

    // If showing animation, render only the animation component
    if (showAnimation) {
        return <BubbleTrapAnimation onComplete={() => completeLogin(loginResult)} />
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
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} variant="filled" sx={{ width: "100%" }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default LoginForm

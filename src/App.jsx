"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material"
import Settings from "./components/Settings"
import HomePage from "./components/HomePage"
import Navbar from "./components/Navbar"
import Friends from "./components/Friends"
import Groups from "./components/Groups"
import Modal from "./components/Modal"
import PromiseComponent from "./components/PromiseComponent"
import LoginForm from "./components/LoginForm"
import RegisterForm from "./components/RegisterForm"
import ResetPassword from "./components/ResetPassword"
import Messaging from "./components/Messaging"
import { io } from "socket.io-client"
import AboutMe from "./components/AboutMe"
import AboutUs from "./components/AboutUs"
import AboutRances from "./components/AboutRances"
import AboutTariq from "./components/AboutTariq"
import AboutJacob from "./components/AboutJacob"
import AboutCayden from "./components/AboutCayden"
import StyleGuidePage from "./components/StyleGuide/StyleGuide"

const socket = io(process.env.REACT_APP_API_PATH_SOCKET, {
  path: "/hci/api/realtime-socket/socket.io",
  query: {
    tenantID: "example",
  },
})
export { socket }

const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem("token")

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}

function NavbarWrapper({ toggleModal, logout }) {
  const location = useLocation()
  const hideNavbarPaths = ["/login", "/register","/style-guide"]

  if (hideNavbarPaths.includes(location.pathname)) {
    return null
  }

  return <Navbar toggleModal={toggleModal} logout={logout} />
}

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: "#5B8C5A",
    },
    secondary: {
      main: "#1D6EF1",
    },
    error: {
      main: "#DC2626",
    },
    background: {
      default: "#F4FDFF",
      paper: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: '"Sour Gummy", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
})

function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [refreshPosts, setRefreshPosts] = useState(false)
  const [hasSeenAnimation, setHasSeenAnimation] = useState(false)

  useEffect(() => {
    const hasLoggedInBefore = localStorage.getItem("hasLoggedInBefore")
    setHasSeenAnimation(!!hasLoggedInBefore)
  }, [])

  useEffect(() => {
    const token = sessionStorage.getItem("token")
    if (token) {
      setLoggedIn(true)
    }
  }, [])

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to HCI socket server")
    })
  }, [])

  const logout = (e) => {
    e.preventDefault()
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("user")
    setLoggedIn(false)
    window.location.reload()
  }

  const login = (e) => {
    e.preventDefault()
    setRefreshPosts(true)
    setLoggedIn(true)
  }

  const doRefreshPosts = () => {
    setRefreshPosts(true)
  }

  const toggleModal = (e) => {
    e.preventDefault()
    setOpenModal((prev) => !prev)
  }

  return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router basename={process.env.PUBLIC_URL}>
          <div className="App">
            <header className="App-header">
              <NavbarWrapper toggleModal={toggleModal} logout={logout} />
              <div className="maincontent" id="mainContent">
                <Routes>
                  <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      }
                  />
                  <Route
                      path="/"
                      element={
                        loggedIn ? (
                            <HomePage setLoggedIn={setLoggedIn} doRefreshPosts={doRefreshPosts} appRefresh={refreshPosts} />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                      }
                  />
                  <Route
                      path="/login"
                      element={!loggedIn ? <LoginForm setLoggedIn={setLoggedIn} /> : <Navigate to="/" replace />}
                  />
                  <Route path="/register" element={<RegisterForm setLoggedIn={setLoggedIn} />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route
                      path="/friends"
                      element={
                        <ProtectedRoute>
                          <Friends />
                        </ProtectedRoute>
                      }
                  />
                  <Route
                      path="/groups"
                      element={
                        <ProtectedRoute>
                          <Groups />
                        </ProtectedRoute>
                      }
                  />
                  <Route path="/promise" element={<PromiseComponent />} />
                  <Route
                      path="/messages/:roomID"
                      element={
                        <ProtectedRoute>
                          <Messaging />
                        </ProtectedRoute>
                      }
                  />
                  <Route path="/akibmahdi" element={<AboutMe />} />
                  <Route path="/rances" element={<AboutRances />} />
                  <Route path="/biviji" element={<AboutTariq />} />
                  <Route path="/aboutus" element={<AboutUs />} />
                  <Route path="/jacobmie" element={<AboutJacob />} />
                  <Route path="/caydenla" element={<AboutCayden />} />
                  <Route path="/style-guide" element={<StyleGuidePage />} />
                </Routes>
              </div>
            </header>

            <Modal show={openModal} onClose={toggleModal}>
              This is a modal dialog!
            </Modal>
          </div>
        </Router>
      </ThemeProvider>
  )
}

export default App


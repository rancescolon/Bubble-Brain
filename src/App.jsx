// "use client"

// import { useState, useEffect } from "react"
// import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"
// import { ThemeProvider, createTheme, CssBaseline } from "@mui/material"
// import Settings from "./Component/Settings"
// import HomePage from "./Component/HomePage"
// import Navbar from "./Component/Navbar"
// import Friends from "./Component/Friends"
// import Groups from "./Component/Groups"
// import Modal from "./Component/Modal"
// import PromiseComponent from "./Component/PromiseComponent"
// import LoginForm from "./Component/LoginForm"
// import RegisterForm from "./Component/RegisterForm"
// import ResetPassword from "./Component/ResetPassword"
// import Messaging from "./Component/Messaging"
// import { io } from "socket.io-client"
// import AboutMe from "./Component/AboutMe"
// import AboutUs from "./Component/AboutUs"
// import AboutRances from "./Component/AboutRances"
// import AboutTariq from "./Component/AboutTariq"
// import AboutJacob from "./Component/AboutJacob"
// import AboutCayden from "./Component/AboutCayden"
// import StyleGuidePage from "./Component/StyleGuide/StyleGuide"
// import Profile from "./Component/Profile"
// import BubbleTrapAnimation from "./Component/BubbleTrapAnimation"
// import Communities from "./Component/Communities"
// import CommunityView from "./Component/CommunityView"
// import Upload from "./Component/Upload"
// import StudySetView from "./Component/StudySetView"
// // import SideBar from "./Component/StyleGuide/SideBar"

// const socket = io(process.env.REACT_APP_API_PATH_SOCKET, {
//   path: "/hci/api/realtime-socket/socket.io",
//   query: {
//     tenantID: "droptable",
//   },
//   transports: ["websocket"],
//   reconnection: true,
//   reconnectionAttempts: 5,
//   reconnectionDelay: 1000,
//   timeout: 10000,
//   autoConnect: true,
//   forceNew: true
// })

// // Enhanced socket connection handling
// socket.on("connect", () => {
//   console.log("Connected to chat server with socket ID:", socket.id)
//   const userId = sessionStorage.getItem("user")
//   if (userId) {
//     socket.emit("user_connected", { userId: parseInt(userId) })
//     console.log("Emitted user_connected event for user:", userId)
//   }
// })

// socket.on("connect_error", (error) => {
//   console.error("Socket connection error:", error)
//   console.log("Connection details:", {
//     url: process.env.REACT_APP_API_PATH_SOCKET,
//     transport: socket.io.engine.transport.name,
//     userId: sessionStorage.getItem("user"),
//     path: "/hci/api/realtime-socket/socket.io",
//     query: { tenantID: "droptable" }
//   })
// })

// socket.on("disconnect", (reason) => {
//   console.log("Disconnected from chat server. Reason:", reason)
//   if (reason === "io server disconnect" || reason === "transport close") {
//     console.log("Attempting to reconnect...")
//     socket.connect()
//   }
// })

// socket.on("reconnect", (attemptNumber) => {
//   console.log("Reconnected to chat server after", attemptNumber, "attempts")
//   const userId = sessionStorage.getItem("user")
//   if (userId) {
//     socket.emit("user_connected", { userId: parseInt(userId) })
//     console.log("Re-emitted user_connected event for user:", userId)
//   }
// })

// socket.on("reconnect_attempt", (attemptNumber) => {
//   console.log("Attempting to reconnect:", attemptNumber)
// })

// socket.on("reconnect_error", (error) => {
//   console.error("Reconnection error:", error)
// })

// socket.on("reconnect_failed", () => {
//   console.error("Failed to reconnect after all attempts")
// })

// // Chat event handlers
// socket.on("/chat/join-room", (data) => {
//   console.log("Join room event received:", data)
// })

// socket.on("/room-created", (data) => {
//   console.log("Room created event received:", data)
// })

// socket.on("/send-message", (data) => {
//   console.log("Message received:", data)
// })

// export { socket }

// const ProtectedRoute = ({ children }) => {
//   const token = sessionStorage.getItem("token")

//   if (!token) {
//     return <Navigate to="/login" replace />
//   }

//   return children
// }

// function NavbarWrapper({ toggleModal, logout }) {
//   const location = useLocation()
//   const hideNavbarPaths = ["/login", "/register", "/style-guide"]

//   if (hideNavbarPaths.includes(location.pathname)) {
//     return null
//   }

//   return <Navbar toggleModal={toggleModal} logout={logout} />
// }

// // Create a theme instance
// const theme = createTheme({
//   palette: {
//     primary: {
//       main: "#5B8C5A",
//     },
//     secondary: {
//       main: "#1D6EF1",
//     },
//     error: {
//       main: "#DC2626",
//     },
//     background: {
//       default: "#F4FDFF",
//       paper: "#FFFFFF",
//     },
//   },
//   typography: {
//     fontFamily: '"Sour Gummy", sans-serif',
//   },
//   components: {
//     MuiButton: {
//       styleOverrides: {
//         root: {
//           textTransform: "none",
//           borderRadius: 8,
//         },
//       },
//     },
//     MuiCard: {
//       styleOverrides: {
//         root: {
//           borderRadius: 16,
//         },
//       },
//     },
//   },
// })

// function App() {
//   const [loggedIn, setLoggedIn] = useState(false)
//   const [openModal, setOpenModal] = useState(false)
//   const [refreshPosts, setRefreshPosts] = useState(false)
//   const [hasSeenAnimation, setHasSeenAnimation] = useState(false)

//   useEffect(() => {
//     const hasLoggedInBefore = localStorage.getItem("hasLoggedInBefore")
//     setHasSeenAnimation(!!hasLoggedInBefore)
//   }, [])

//   useEffect(() => {
//     const token = sessionStorage.getItem("token")
//     if (token) {
//       setLoggedIn(true)
//     }
//   }, [])

//   useEffect(() => {
//     socket.on("connect", () => {
//       console.log("Connected to HCI socket server")
//     })
//   }, [])

//   const logout = (e) => {
//     e.preventDefault()
//     sessionStorage.removeItem("token")
//     sessionStorage.removeItem("user")
//     setLoggedIn(false)
//     window.location.reload()
//   }

//   const login = (e) => {
//     e.preventDefault()
//     setRefreshPosts(true)
//     setLoggedIn(true)
//   }

//   const doRefreshPosts = () => {
//     setRefreshPosts(true)
//   }

//   const toggleModal = (e) => {
//     e.preventDefault()
//     setOpenModal((prev) => !prev)
//   }

//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <Router basename={process.env.PUBLIC_URL}>
//         <div className="App">
//           <header className="App-header">
//             <NavbarWrapper toggleModal={toggleModal} logout={logout} />
//             <div className="maincontent" id="mainContent">
//               <Routes>
//                 <Route
//                   path="/settings"
//                   element={
//                     <ProtectedRoute>
//                       <Settings />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/"
//                   element={
//                     loggedIn ? (
//                       <HomePage setLoggedIn={setLoggedIn} doRefreshPosts={doRefreshPosts} appRefresh={refreshPosts} />
//                     ) : (
//                       <Navigate to="/login" replace />
//                     )
//                   }
//                 />
//                 <Route
//                   path="/login"
//                   element={!loggedIn ? <LoginForm setLoggedIn={setLoggedIn} /> : <Navigate to="/" replace />}
//                 />
//                 <Route path="/register" element={<RegisterForm setLoggedIn={setLoggedIn} />} />
//                 <Route path="/reset-password" element={<ResetPassword />} />
//                 <Route
//                   path="/friends"
//                   element={
//                     <ProtectedRoute>
//                       <Friends />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/groups"
//                   element={
//                     <ProtectedRoute>
//                       <Groups />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/profile"
//                   element={
//                     <ProtectedRoute>
//                       <Profile />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route path="/promise" element={<PromiseComponent />} />
//                 <Route
//                   path="/messages/:roomID"
//                   element={
//                     <ProtectedRoute>
//                       <Messaging />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/community"
//                   element={
//                     <ProtectedRoute>
//                       <Communities />
//                     </ProtectedRoute>
//                   }
//                 />
//                 {/* <Route path="/community" element={<Communities />} /> */}
//                 <Route path="/community/view/:id" element={
//                   <ProtectedRoute>
//                     <CommunityView />
//                   </ProtectedRoute>
                  
//                   } />
//                 <Route path="/akibmahdi" element={<AboutMe />} />
//                 <Route path="/rances" element={<AboutRances />} />
//                 <Route path="/biviji" element={<AboutTariq />} />
//                 <Route path="/aboutus" element={<AboutUs />} />
//                 <Route path="/jacobmie" element={<AboutJacob />} />
//                 <Route path="/caydenla" element={<AboutCayden />} />
//                 <Route path="/style-guide" element={<StyleGuidePage />} />
//                 <Route
//                   path="/upload"
//                   element={
//                     <ProtectedRoute>
//                       <Upload />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/community/:communityId/study-set/:studySetId"
//                   element={
//                     <ProtectedRoute>
//                       <StudySetView />
//                     </ProtectedRoute>
//                   }
//                 />
//               </Routes>
//             </div>
//           </header>

//           <Modal show={openModal} onClose={toggleModal}>
//             This is a modal dialog!
//           </Modal>
//         </div>
//       </Router>
//     </ThemeProvider>
//   )
// }

// export default App

"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material"
import Settings from "./Component/Settings"
import HomePage from "./Component/HomePage"
import Navbar from "./Component/Navbar"
import Friends from "./Component/Friends"
import Groups from "./Component/Groups"
import Modal from "./Component/Modal"
import PromiseComponent from "./Component/PromiseComponent"
import LoginForm from "./Component/LoginForm"
import RegisterForm from "./Component/RegisterForm"
import ResetPassword from "./Component/ResetPassword"
import Messaging from "./Component/Messaging"
import CommunityMessaging from "./Component/CommunityMessaging"
import { io } from "socket.io-client"
import AboutMe from "./Component/AboutMe"
import AboutUs from "./Component/AboutUs"
import AboutRances from "./Component/AboutRances"
import AboutTariq from "./Component/AboutTariq"
import AboutJacob from "./Component/AboutJacob"
import AboutCayden from "./Component/AboutCayden"
import StyleGuidePage from "./Component/StyleGuide/StyleGuide"
import Profile from "./Component/Profile"
import BubbleTrapAnimation from "./Component/BubbleTrapAnimation"
import Communities from "./Component/Communities"
import CommunityView from "./Component/CommunityView"
import Upload from "./Component/Upload"
import StudySetView from "./Component/StudySetView"
import socketService from './services/socketService';
// import SideBar from "./Component/StyleGuide/SideBar"

const socket = io(process.env.REACT_APP_API_PATH_SOCKET, {
  path: "/hci/api/realtime-socket/socket.io",
  query: {
    tenantID: "droptable",
  },
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
  autoConnect: true,
  forceNew: true
})

// Enhanced socket connection handling with detailed logging
socket.on("connect", () => {
  console.log("Connected to chat server with socket ID:", socket.id);
  
  // Log detailed connection info
  console.log("Socket connection details:", {
    url: process.env.REACT_APP_API_PATH_SOCKET,
    transport: socket.io?.engine?.transport?.name || 'unknown',
    path: "/hci/api/realtime-socket/socket.io",
    query: { tenantID: "droptable" },
    timestamp: new Date().toISOString()
  });
  
  const userId = sessionStorage.getItem("user");
  if (userId) {
    socket.emit("user_connected", { userId: parseInt(userId) });
    console.log("Emitted user_connected event for user:", userId);
  }
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
  console.log("Connection details:", {
    url: process.env.REACT_APP_API_PATH_SOCKET,
    transport: socket.io?.engine?.transport?.name || 'unknown',
    userId: sessionStorage.getItem("user"),
    path: "/hci/api/realtime-socket/socket.io",
    query: { tenantID: "droptable" },
    timestamp: new Date().toISOString(),
    errorMessage: error.message,
    errorStack: error.stack
  });
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected from chat server. Reason:", reason);
  if (reason === "io server disconnect" || reason === "transport close") {
    console.log("Attempting to reconnect...");
    socket.connect();
  }
});

// Enhanced reconnection logging
socket.on("reconnect", (attemptNumber) => {
  console.log("Reconnected to chat server after", attemptNumber, "attempts at", new Date().toISOString());
  
  const userId = sessionStorage.getItem("user");
  if (userId) {
    socket.emit("user_connected", { userId: parseInt(userId) });
    console.log("Re-emitted user_connected event for user:", userId);
    
    // Re-join any active rooms after reconnection
    const activeRoom = sessionStorage.getItem("activeRoomID");
    const activeCommunityRoom = sessionStorage.getItem("activeCommunityRoomID");
    const communityId = sessionStorage.getItem("activeCommunityID");
    
    if (activeRoom) {
      console.log("Rejoining direct message room after reconnection:", activeRoom);
      socket.emit("/chat/join-room", {
        fromUserID: parseInt(userId),
        toUserID: parseInt(sessionStorage.getItem("toUserID") || 0),
        roomID: activeRoom
      });
    }
    
    if (activeCommunityRoom && communityId) {
      console.log("Rejoining community room after reconnection:", activeCommunityRoom);
      socket.emit("/community/join-room", {
        userID: parseInt(userId),
        communityID: parseInt(communityId),
        roomID: activeCommunityRoom
      });
    }
  }
});

socket.on("reconnect_attempt", (attemptNumber) => {
  console.log("Attempting to reconnect:", attemptNumber, "at", new Date().toISOString());
});

socket.on("reconnect_error", (error) => {
  console.error("Reconnection error:", error);
});

socket.on("reconnect_failed", () => {
  console.error("Failed to reconnect after all attempts");
});

// Direct message chat event handlers
socket.on("/chat/join-room", (data) => {
  console.log("Join room event received:", data);
});

socket.on("/room-created", (data) => {
  console.log("Room created event received:", data);
});

socket.on("/send-message", (data) => {
  console.log("Message received:", data);
});

// Community chat event handlers
socket.on("/community/join-room", (data) => {
  console.log("Community room join event received:", data);
});

socket.on("/room-created-community", (data) => {
  console.log("Community room created event received:", data);
});

socket.on("/community/message", (data) => {
  console.log("Community message received:", data);
});

socket.on("/community/member-online", (data) => {
  console.log("Community member online status received:", data);
});

socket.on("/community/member-offline", (data) => {
  console.log("Community member offline status received:", data);
});

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
  const hideNavbarPaths = ["/login", "/register", "/style-guide"]

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
    sessionStorage.removeItem("activeRoomID")
    sessionStorage.removeItem("activeCommunityID")
    sessionStorage.removeItem("activeCommunityRoomID")
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
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
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
                <Route
                  path="/community"
                  element={
                    <ProtectedRoute>
                      <Communities />
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/community/view/:id" 
                  element={
                    <ProtectedRoute>
                      <CommunityView />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/community/:communityId/chat" 
                  element={
                    <ProtectedRoute>
                      <CommunityMessaging />
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
                <Route
                  path="/upload"
                  element={
                    <ProtectedRoute>
                      <Upload />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/community/:communityId/study-set/:studySetId"
                  element={
                    <ProtectedRoute>
                      <StudySetView />
                    </ProtectedRoute>
                  }
                />
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
"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material"
import { IconButton, Tooltip, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Grid } from "@mui/material"
import { Image } from "lucide-react"
import { styled } from "@mui/material/styles"
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
import socketService from './services/socketService'
import Feed from './pages/Feed'
import Shop from './Component/Shop'
import { ShopProvider } from './Context/ShopContext'
// import SideBar from "./Component/StyleGuide/SideBar"

// Import default background and other backgrounds you want to use
import defaultBackground from "./assets/image3.png" // Your existing background
// Import your additional backgrounds - make sure to create these files
import background1 from "./assets/fish1.png" // Create this file
import background2 from "./assets/fish1.png" // Create this file
import background3 from "./assets/fish2.png" // Create this file
import background4 from "./assets/fish3.png"
import CategorySelection from "./Component/category-selection"; // Create this file

// Create Background Context
export const BackgroundContext = createContext();

// Styled component for background thumbnails
const BackgroundThumbnail = styled(Box)(({ selected }) => ({
  width: '100%',
  height: '60px',
  borderRadius: '8px',
  cursor: 'pointer',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  transition: 'transform 0.2s, box-shadow 0.2s',
  border: selected ? '3px solid #1D6EF1' : '3px solid transparent',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
  },
}));

// Background selector component - moved inside Router context
function BackgroundSelector() {
  const { backgroundOptions, currentBackground, changeBackground } = useContext(BackgroundContext);
  const [showSelector, setShowSelector] = useState(false);

  return (
    <>
      <Tooltip title="Change Background">
        <IconButton
          onClick={() => setShowSelector(true)}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 1000,
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.95)',
            },
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          }}
        >
          <Image size={24} color="#1D6EF1" />
        </IconButton>
      </Tooltip>

      <Dialog
        open={showSelector}
        onClose={() => setShowSelector(false)}
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: '12px',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center' }}>Choose Background</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {backgroundOptions.map((bg) => (
              <Grid item xs={6} key={bg.id}>
                <BackgroundThumbnail
                  selected={currentBackground.id === bg.id}
                  onClick={() => {
                    changeBackground(bg);
                    setShowSelector(false);
                  }}
                  sx={{
                    backgroundImage: `url(${bg.image})`,
                  }}
                />
                <Typography align="center" variant="body2" sx={{ mt: 0.5 }}>
                  {bg.name}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowSelector(false)}
            sx={{ color: '#1D6EF1', fontWeight: 'bold' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// Safe conditional component that uses useLocation inside Router
function ConditionalBackgroundSelector({ loggedIn }) {
  const location = useLocation();
  const hideBackgroundSelectorPaths = ["/login", "/register", "/style-guide"];
  const showBackgroundSelector = loggedIn && !hideBackgroundSelectorPaths.includes(location.pathname);
  
  if (!showBackgroundSelector) return null;
  
  return <BackgroundSelector />;
}

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

function AppContent({ backgroundOptions, currentBackground, changeBackground }) {
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
    
    // Get the user ID before removing from sessionStorage 
    const userStr = sessionStorage.getItem("user");
    let userId = null;
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userId = (typeof user === 'object' && user !== null && user.id !== undefined) ? user.id : userStr;
      } catch (e) {
        userId = userStr; // Fallback if not JSON
      }
    }
    
    // If we have a userId, clear the fisherman cooldown
    if (userId) {
      const fishermanCooldownKey = `lastFishermanClickTime_${userId}`;
      localStorage.removeItem(fishermanCooldownKey);
    }
    
    // Clear session storage as before
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
    <>
      <div className="App">
        <header className="App-header">
          <NavbarWrapper toggleModal={toggleModal} logout={logout} />
          <div className="maincontent" id="mainContent">
            <Routes>
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
              <Route path="/select-categories" element={<CategorySelection />} />
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
                    <Profile setLoggedIn={setLoggedIn} />
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
              <Route path="/feed" element={<Feed />} />
              <Route 
                path="/shop" 
                element={
                  <ProtectedRoute>
                    <Shop />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </header>

        <Modal show={openModal} onClose={toggleModal}>
          This is a modal dialog!
        </Modal>
        
        {/* Background Selector - Now safely inside Router context */}
        <ConditionalBackgroundSelector loggedIn={loggedIn} />
      </div>
    </>
  )
}

function App() {
  // Background state
  const [backgroundOptions] = useState([
    { id: 'default', image: defaultBackground, name: 'Default' },
    { id: 'bg1', image: background1, name: 'Blue Gradient' },
    { id: 'bg2', image: background2, name: 'Purple Waves' },
    { id: 'bg3', image: background3, name: 'Green Nature' },
    { id: 'bg4', image: background4, name: 'Orange Sunset' },
  ]);
  
  const [currentBackground, setCurrentBackground] = useState(() => {
    // Initialize from localStorage if available
    const savedBgId = localStorage.getItem('selectedBackground');
    return backgroundOptions.find(bg => bg.id === savedBgId) || backgroundOptions[0];
  });
  
  // Function to change background
  const changeBackground = (backgroundOption) => {
    setCurrentBackground(backgroundOption);
    localStorage.setItem('selectedBackground', backgroundOption.id);
  };

  // Get user ID from sessionStorage to use as key
  // This should re-render App when login/logout happens, assuming login/logout triggers a state change in App or a parent
  const userStr = sessionStorage.getItem("user");
  let userIdKey = null;
  if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userIdKey = (typeof user === 'object' && user !== null && user.id !== undefined) ? user.id : userStr;
      } catch (e) {
        userIdKey = userStr; // Fallback if not JSON but potentially an ID
      }
  }
  // Use a fallback like 'logged_out' if userIdKey is null/undefined to ensure key changes
  const shopProviderKey = userIdKey !== null && userIdKey !== undefined ? String(userIdKey) : 'logged_out';

  return (
    <BackgroundContext.Provider value={{ backgroundOptions, currentBackground, changeBackground }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            width: '100%',
            maxWidth: '100vw',
            overflowX: 'hidden',
            backgroundImage: `url(${currentBackground.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            transition: 'background-image 0.5s ease-in-out',
          }}
        >
          <Router basename={process.env.PUBLIC_URL}>
            <ShopProvider key={shopProviderKey}>
              <AppContent 
                backgroundOptions={backgroundOptions}
                currentBackground={currentBackground}
                changeBackground={changeBackground}
              />
            </ShopProvider>
          </Router>
        </Box>
      </ThemeProvider>
    </BackgroundContext.Provider>
  )
}

export default App
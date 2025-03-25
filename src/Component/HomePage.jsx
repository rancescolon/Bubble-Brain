"use client"

import { useEffect, useState, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Box,
  Avatar,
  CircularProgress,
  Alert,
} from "@mui/material"
import fish1 from "../assets/fish1.png"
import fish2 from "../assets/fish2.png"
import fish3 from "../assets/fish3.png"
import logo from "../assets/Frame.png"
import background from "../assets/image3.png"
import DrBubbles from "./DrBubbles"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Fallback mock users in case API fails
const MOCK_USERS = [
  {
    id: "mock1",
    name: "Demo User",
    activity: "Online now",
    status: "online",
    avatar: null,
    email: "demo@example.com",
    isCurrentUser: true,
    lastActivity: Date.now(),
  },
  {
    id: "mock2",
    name: "Jane Smith",
    activity: "Online now",
    status: "online",
    avatar: null,
    email: "jane@example.com",
    isCurrentUser: false,
    lastActivity: Date.now(),
  },
  {
    id: "mock3",
    name: "John Doe",
    activity: "Last active 5 minutes ago",
    status: "offline",
    avatar: null,
    email: "john@example.com",
    isCurrentUser: false,
    lastActivity: Date.now() - 300000,
  },
]

const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()
  const [showGuide, setShowGuide] = useState(true)
  const [latestCommunities, setLatestCommunities] = useState([])
  const [latestCourses, setLatestCourses] = useState([])
  const [activeUsers, setActiveUsers] = useState([]) // Start with empty array
  const [loadingCommunities, setLoadingCommunities] = useState(true)
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)

  // Refs for carousel scrolling
  const communitiesRef = useRef(null)
  const coursesRef = useRef(null)
  const usersRef = useRef(null)

  useEffect(() => {
    const token = sessionStorage.getItem("token")
    console.log("Token in useEffect:", token ? "Token exists" : "No token")
    setIsLoggedIn(!!token)

    if (token) {
      fetchLatestCommunities()
      fetchLatestCourses()
      fetchActiveUsers() // Fetch real users
    } else {
      // If no token, use mock data
      setActiveUsers(MOCK_USERS)
      setLoadingUsers(false)
    }
  }, [])

  const fetchLatestCommunities = () => {
    setLoadingCommunities(true)
    const token = sessionStorage.getItem("token")

    if (!token) {
      setLoadingCommunities(false)
      return
    }

    fetch(`${process.env.REACT_APP_API_PATH}/groups?limit=10`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((result) => {
        if (result && result[0]) {
          const communities = result[0].map((group) => ({
            id: group.id,
            name: group.name || "Community",
            description: group.description || "No description available",
            members: group.members?.length || 0,
            image: group.thumbnailURL || getRandomImage(),
            authorId: group.ownerID,
          }))
          setLatestCommunities(communities)
        }
        setLoadingCommunities(false)
      })
      .catch((error) => {
        console.error("Error fetching communities:", error)
        setLoadingCommunities(false)
      })
  }

  const fetchLatestCourses = () => {
    setLoadingCourses(true)
    const token = sessionStorage.getItem("token")

    if (!token) {
      setLoadingCourses(false)
      return
    }

    // First fetch the courses
    fetch(`${process.env.REACT_APP_API_PATH}/posts?type=course&limit=10`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((result) => {
        if (result && result[0]) {
          // For each course, fetch its study time posts
          const coursePromises = result[0].map(async (post) => {
            try {
              // Fetch study time posts for this course
              const studyTimeResponse = await fetch(
                `${process.env.REACT_APP_API_PATH}/posts?type=study_time&parentID=${post.id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              )
              
              if (!studyTimeResponse.ok) {
                throw new Error(`Failed to fetch study time: ${studyTimeResponse.status}`)
              }

              const studyTimeData = await studyTimeResponse.json()
              
              // Calculate total study time from all study time posts
              let totalStudyTime = 0
              if (studyTimeData && studyTimeData[0]) {
                totalStudyTime = studyTimeData[0].reduce((total, studyPost) => {
                  try {
                    const content = JSON.parse(studyPost.content || "{}")
                    return total + (content.duration || 0)
                  } catch (e) {
                    console.error("Error parsing study time content:", e)
                    return total
                  }
                }, 0)
              }

              // Format the description
              let description = post.content || "No description available"
              
              // Clean up any JSON-like content from the description
              description = description.replace(/\{.*?\}/g, "").trim()

              // Format time as HH:MM:SS
              const hours = Math.floor(totalStudyTime / 3600)
              const minutes = Math.floor((totalStudyTime % 3600) / 60)
              const seconds = totalStudyTime % 60
              const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

              return {
                id: post.id,
                title: post.title || "Course",
                description: description,
                timeInSeconds: totalStudyTime,
                formattedTime: formattedTime,
                students: post._count?.children || 0,
                image: post.thumbnailURL || getRandomImage(),
                authorId: post.authorID,
              }
            } catch (error) {
              console.error("Error processing course:", error)
              return {
                id: post.id,
                title: post.title || "Course",
                description: post.content || "No description available",
                timeInSeconds: 0,
                formattedTime: "00:00:00",
                students: post._count?.children || 0,
                image: post.thumbnailURL || getRandomImage(),
                authorId: post.authorID,
              }
            }
          })

          // Wait for all course promises to resolve
          Promise.all(coursePromises)
            .then((courses) => {
              setLatestCourses(courses)
              setLoadingCourses(false)
            })
            .catch((error) => {
              console.error("Error processing courses:", error)
              setLoadingCourses(false)
            })
        } else {
          setLoadingCourses(false)
        }
      })
      .catch((error) => {
        console.error("Error fetching courses:", error)
        setLoadingCourses(false)
      })
  }

  const fetchActiveUsers = () => {
    setLoadingUsers(true)
    const token = sessionStorage.getItem("token")
    const currentUser = JSON.parse(sessionStorage.getItem("user") || "{}")
    console.log("Current user from session:", currentUser)

    if (!token) {
      console.log("No token found, using mock data")
      setActiveUsers(MOCK_USERS)
      setLoadingUsers(false)
      return
    }

    console.log("Fetching users from:", `${process.env.REACT_APP_API_PATH}/users`)

    fetch(`${process.env.REACT_APP_API_PATH}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        console.log("API Response status:", res.status)
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((result) => {
        console.log("API Response:", result)

        // Extract users array from various possible response formats
        let usersArray = []

        if (Array.isArray(result)) {
          // If result is directly an array of users
          usersArray = result[0] // Take the first element which contains the users array
        } else if (result && typeof result === "object") {
          // If result is an object with a data property containing users
          if (Array.isArray(result.data)) {
            usersArray = result.data
          } else if (result[0] && Array.isArray(result[0])) {
            // Handle case where API returns [users_array, count]
            usersArray = result[0]
          } else if (result.users && Array.isArray(result.users)) {
            usersArray = result.users
          }
        }

        console.log("Raw API Response:", result)
        console.log("Extracted users array:", usersArray)

        if (usersArray && usersArray.length > 0) {
          const processedUsers = usersArray
            .map((user) => {
              console.log("Processing individual user:", user)

              // Extract user ID
              const userId = user.id || user._id || `user-${Math.random()}`
              const isCurrentUser = currentUser && currentUser.toString() === userId.toString()

              console.log("User ID comparison:", {
                userId,
                currentUserId: currentUser,
                isMatch: isCurrentUser,
              })

              // Get last activity time - consider them active if logged in
              const lastActivityTime = Date.now() // Consider them active now since they're logged in
              const lastActive = lastActivityTime
              const isRecentlyActive = true // If they're in the users list, consider them active

              // Extract username with better fallback handling
              let userName = null
              if (user.attributes && user.attributes.username) {
                userName = user.attributes.username
              } else if (user.attributes && user.attributes.firstName && user.attributes.lastName) {
                userName = `${user.attributes.firstName} ${user.attributes.lastName}`
              } else if (user.username) {
                userName = user.username
              } else if (user.firstName && user.lastName) {
                userName = `${user.firstName} ${user.lastName}`
              }

              // If still no username found, try to get it from email
              if (!userName && user.attributes && user.attributes.email) {
                userName = user.attributes.email.split("@")[0]
              } else if (!userName && user.email) {
                userName = user.email.split("@")[0]
              }

              // Final fallback for username
              userName = userName || "Anonymous User"

              // Extract email
              const email =
                (user.attributes && user.attributes.email) ||
                user.email ||
                (userName !== "Anonymous User"
                  ? `${userName.toLowerCase().replace(/\s+/g, ".")}@bubblebrain.com`
                  : "no-email@bubblebrain.com")

              // Extract avatar/profile picture
              const avatar =
                (user.attributes && user.attributes.profilePicture) || user.avatar || user.profilePicture || null

              // Determine online status - consider them online if they're in the list
              const status = "online"

              // Format activity text
              const activity = isCurrentUser ? "Online now (You)" : "Online now"

              const processedUser = {
                id: userId,
                name: userName,
                activity: activity,
                status: status,
                avatar: avatar,
                email: email,
                isCurrentUser: isCurrentUser,
                lastActivity: lastActive,
              }

              console.log("Processed user data:", processedUser)
              return processedUser
            })
            // Sort with current user first, then by last activity
            .sort((a, b) => {
              if (a.isCurrentUser) return -1
              if (b.isCurrentUser) return 1
              return b.lastActivity - a.lastActivity
            })

          console.log("Final processed users:", processedUsers)
          setActiveUsers(processedUsers)
        } else {
          console.log("No users found in response")
          setActiveUsers([])
        }

        setLoadingUsers(false)
      })
      .catch((error) => {
        console.error("Error fetching users:", error)
        console.log("Using mock data due to error")
        setActiveUsers(MOCK_USERS)
        setLoadingUsers(false)
      })
  }

  const formatLastActive = (timestamp) => {
    if (!timestamp) return "Never"

    const now = new Date().getTime()
    const diff = now - timestamp

    // Less than a minute
    if (diff < 60000) {
      return "Just now"
    }
    // Less than an hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000)
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
    }
    // Less than a day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000)
      return `${hours} hour${hours > 1 ? "s" : ""} ago`
    }
    // More than a day
    const days = Math.floor(diff / 86400000)
    return `${days} day${days > 1 ? "s" : ""} ago`
  }

  // Helper function to get a random image when thumbnailURL is not available
  const getRandomImage = () => {
    const images = [fish1, fish2, fish3]
    return images[Math.floor(Math.random() * images.length)]
  }

  const handleLogout = () => {
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("user")
    setIsLoggedIn(false)
  }

  const scrollCarousel = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -300 : 300
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  const handleCommunityClick = (communityId) => {
    navigate(`/community/view/${communityId}`)
  }

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`)
  }

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`)
  }

  // Track render attempts for debugging
  useEffect(() => {
    console.log("Active users state updated:", activeUsers)
  }, [activeUsers])

  // Set up polling for active users
  useEffect(() => {
    const token = sessionStorage.getItem("token")
    if (!token) return

    // Initial fetch after a short delay
    const initialFetchTimer = setTimeout(() => {
      fetchActiveUsers()
    }, 1000)

    // Set up polling every 30 seconds
    const intervalId = setInterval(() => {
      fetchActiveUsers()
    }, 30000)

    // Clean up
    return () => {
      clearTimeout(initialFetchTimer)
      clearInterval(intervalId)
    }
  }, [])

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
              src={logo || "/placeholder.svg"}
              alt="Bubble Brain Logo"
              style={{ height: 80, width: 80, marginRight: 8 }}
            />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontFamily: "SourGummy, sans-serif",
                fontWeight: 800,
                fontSize: "52px",
                color: "#F4FDFF",
              }}
            >
              Bubble Brain
            </Typography>
          </Box>
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            {["Home", "Courses", "Quizzes", "Contact"].map((item) => (
              <Button
                key={item}
                id={`nav-${item.toLowerCase()}`}
                color="inherit"
                component={Link}
                to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
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
                {item}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      {showGuide && <DrBubbles onClose={() => setShowGuide(false)} />}

      <Container>
        <Box
          sx={{
            bgcolor: "#FFFFFF",
            py: 8,
            px: 2,
            mt: 2,
            borderRadius: 2,
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <Typography
            variant="h2"
            align="center"
            color="#1D1D20"
            gutterBottom
            sx={{
              fontFamily: "SourGummy, sans-serif",
              fontWeight: 800,
              fontSize: "52px",
            }}
          >
            Dive into Learning
          </Typography>
          <Typography
            variant="h5"
            align="center"
            color="#1D1D20"
            paragraph
            sx={{
              fontFamily: "SourGummy, sans-serif",
              fontWeight: 600,
              fontSize: "26px",
            }}
          >
            Explore our gamified courses and quizzes designed to make learning fun and engaging.
          </Typography>
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              component={Link}
              to="/courses"
              size="large"
              sx={{
                bgcolor: "#EF7B6C",
                "&:hover": {
                  bgcolor: "#e66a59",
                },
                fontFamily: "SourGummy, sans-serif",
                fontWeight: 600,
                fontSize: "32px",
                color: "#F4FDFF",
                px: 4,
                py: 1,
                borderRadius: 2,
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              Get Started
            </Button>
          </Box>
        </Box>

        {/* Latest Communities Carousel */}
        <Box
          sx={{
            mt: 6,
            mb: 6,
            bgcolor: "#FFFFFF",
            py: 4,
            px: 2,
            borderRadius: 2,
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography
              variant="h3"
              color="#1D1D20"
              sx={{
                fontFamily: "SourGummy, sans-serif",
                fontWeight: 700,
                fontSize: "36px",
              }}
            >
              Latest Communities
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                onClick={() => scrollCarousel(communitiesRef, "left")}
                sx={{
                  minWidth: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  bgcolor: "#EF7B6C",
                  color: "white",
                  "&:hover": { bgcolor: "#e66a59" },
                }}
              >
                <ChevronLeft />
              </Button>
              <Button
                onClick={() => scrollCarousel(communitiesRef, "right")}
                sx={{
                  minWidth: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  bgcolor: "#EF7B6C",
                  color: "white",
                  "&:hover": { bgcolor: "#e66a59" },
                }}
              >
                <ChevronRight />
              </Button>
            </Box>
          </Box>

          <Box
            ref={communitiesRef}
            sx={{
              display: "flex",
              overflowX: "auto",
              gap: 2,
              pb: 2,
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
              msOverflowStyle: "none",
              minHeight: "280px",
            }}
          >
            {loadingCommunities ? (
              <Box sx={{ display: "flex", justifyContent: "center", width: "100%", alignItems: "center" }}>
                <CircularProgress sx={{ color: "#1D6EF1" }} />
              </Box>
            ) : latestCommunities.length > 0 ? (
              latestCommunities.map((community) => (
                <Card
                  key={community.id}
                  sx={{
                    minWidth: 280,
                    maxWidth: 280,
                    bgcolor: "#FFFFFF",
                    borderRadius: 2,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
                      cursor: "pointer",
                    },
                    flex: "0 0 auto",
                  }}
                  onClick={() => handleCommunityClick(community.id)}
                >
                  <CardMedia
                    component="img"
                    sx={{ height: 140, objectFit: "contain", pt: 2 }}
                    image={community.image}
                    alt={community.name}
                  />
                  <CardContent>
                    <Typography
                      gutterBottom
                      variant="h5"
                      component="h2"
                      color="#1D1D20"
                      sx={{
                        fontFamily: "SourGummy, sans-serif",
                        fontWeight: 600,
                        fontSize: "22px",
                      }}
                    >
                      {community.name}
                    </Typography>
                    <Typography
                      color="#1D1D20"
                      sx={{
                        fontFamily: "SourGummy, sans-serif",
                        fontWeight: 500,
                        fontSize: "14px",
                        mb: 1,
                        height: "60px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {community.description}
                    </Typography>
                    <Typography
                      color="#1D6EF1"
                      sx={{
                        fontFamily: "SourGummy, sans-serif",
                        fontWeight: 600,
                        fontSize: "14px",
                      }}
                    >
                      {community.members} members
                    </Typography>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Box sx={{ display: "flex", justifyContent: "center", width: "100%", alignItems: "center" }}>
                <Typography
                  color="#1D1D20"
                  sx={{
                    fontFamily: "SourGummy, sans-serif",
                    fontWeight: 500,
                    fontSize: "16px",
                  }}
                >
                  No communities found. Create one to get started!
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button
              component={Link}
              to="/community"
              sx={{
                fontFamily: "SourGummy, sans-serif",
                fontWeight: 600,
                color: "#1D6EF1",
              }}
            >
              View All Communities
            </Button>
          </Box>
        </Box>

        {/* Latest Courses Carousel */}
        <Box
          sx={{
            mt: 6,
            mb: 6,
            bgcolor: "#FFFFFF",
            py: 4,
            px: 2,
            borderRadius: 2,
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography
              variant="h3"
              color="#1D1D20"
              sx={{
                fontFamily: "SourGummy, sans-serif",
                fontWeight: 700,
                fontSize: "36px",
              }}
            >
              Latest Courses
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                onClick={() => scrollCarousel(coursesRef, "left")}
                sx={{
                  minWidth: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  bgcolor: "#EF7B6C",
                  color: "white",
                  "&:hover": { bgcolor: "#e66a59" },
                }}
              >
                <ChevronLeft />
              </Button>
              <Button
                onClick={() => scrollCarousel(coursesRef, "right")}
                sx={{
                  minWidth: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  bgcolor: "#EF7B6C",
                  color: "white",
                  "&:hover": { bgcolor: "#e66a59" },
                }}
              >
                <ChevronRight />
              </Button>
            </Box>
          </Box>

          <Box
            ref={coursesRef}
            sx={{
              display: "flex",
              overflowX: "auto",
              gap: 2,
              pb: 2,
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
              msOverflowStyle: "none",
              minHeight: "280px",
            }}
          >
            {loadingCourses ? (
              <Box sx={{ display: "flex", justifyContent: "center", width: "100%", alignItems: "center" }}>
                <CircularProgress sx={{ color: "#1D6EF1" }} />
              </Box>
            ) : latestCourses.length > 0 ? (
              latestCourses.map((course) => (
                <Card
                  key={course.id}
                  sx={{
                    minWidth: 280,
                    maxWidth: 280,
                    bgcolor: "#FFFFFF",
                    borderRadius: 2,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
                      cursor: "pointer",
                    },
                    flex: "0 0 auto",
                  }}
                  onClick={() => handleCourseClick(course.id)}
                >
                  <CardMedia
                    component="img"
                    sx={{ height: 140, objectFit: "contain", pt: 2 }}
                    image={course.image}
                    alt={course.title || "Course Image"}
                  />
                  <CardContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Typography
                        variant="h5"
                        component="h2"
                        color="#1D1D20"
                        sx={{
                          fontFamily: "SourGummy, sans-serif",
                          fontWeight: 600,
                          fontSize: "22px",
                          borderBottom: "2px solid #EF7B6C",
                          pb: 1,
                        }}
                      >
                        Course Title:
                        <Typography
                          component="span"
                          sx={{
                            display: "block",
                            color: "#1D6EF1",
                            mt: 1,
                          }}
                        >
                          {course.title || "Untitled Course"}
                        </Typography>
                      </Typography>

                      <Typography
                        color="#1D1D20"
                        sx={{
                          fontFamily: "SourGummy, sans-serif",
                          fontWeight: 600,
                          fontSize: "16px",
                        }}
                      >
                        Description
                      </Typography>
                      <Typography
                        component="div"
                        sx={{
                          fontWeight: 500,
                          fontSize: "14px",
                          color: "#666",
                          mt: 1,
                          height: "60px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          lineHeight: "1.5",
                          letterSpacing: "0.3px",
                        }}
                      >
                        {course.description || "No description available"}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Box sx={{ display: "flex", justifyContent: "center", width: "100%", alignItems: "center" }}>
                <Typography
                  color="#1D1D20"
                  sx={{
                    fontFamily: "SourGummy, sans-serif",
                    fontWeight: 500,
                    fontSize: "16px",
                  }}
                >
                  No courses found. Check back soon for new content!
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Active Users Section */}
        <Box
          sx={{
            mt: 6,
            mb: 6,
            bgcolor: "#FFFFFF",
            py: 4,
            px: 2,
            borderRadius: 2,
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography
              variant="h3"
              color="#1D1D20"
              sx={{
                fontFamily: "SourGummy, sans-serif",
                fontWeight: 700,
                fontSize: "36px",
              }}
            >
              Active Users
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                onClick={() => scrollCarousel(usersRef, "left")}
                sx={{
                  minWidth: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  bgcolor: "#EF7B6C",
                  color: "white",
                  "&:hover": { bgcolor: "#e66a59" },
                }}
              >
                <ChevronLeft />
              </Button>
              <Button
                onClick={() => scrollCarousel(usersRef, "right")}
                sx={{
                  minWidth: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  bgcolor: "#EF7B6C",
                  color: "white",
                  "&:hover": { bgcolor: "#e66a59" },
                }}
              >
                <ChevronRight />
              </Button>
            </Box>
          </Box>

          <Box
            ref={usersRef}
            sx={{
              display: "flex",
              overflowX: "auto",
              gap: 2,
              pb: 2,
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
              msOverflowStyle: "none",
              minHeight: "150px",
            }}
          >
            {loadingUsers ? (
              <Box sx={{ display: "flex", justifyContent: "center", width: "100%", alignItems: "center" }}>
                <CircularProgress sx={{ color: "#1D6EF1" }} />
              </Box>
            ) : activeUsers && activeUsers.length > 0 ? (
              activeUsers.map((user) => (
                <Card
                  key={user.id}
                  sx={{
                    minWidth: 280,
                    maxWidth: 280,
                    bgcolor: user.isCurrentUser ? "#f0f8ff" : "#FFFFFF",
                    borderRadius: 2,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
                      cursor: "pointer",
                    },
                    flex: "0 0 auto",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    p: 2,
                    position: "relative",
                    border: user.isCurrentUser ? "2px solid #1D6EF1" : "1px solid #e0e0e0",
                  }}
                  onClick={() => handleUserClick(user.id)}
                >
                  <Box sx={{ position: "relative" }}>
                    <Avatar
                      src={user.avatar}
                      alt={user.name}
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: "#1D6EF1",
                        mr: 2,
                        border: user.isCurrentUser ? "2px solid #EF7B6C" : "none",
                        color: "white",
                        fontSize: "1.5rem",
                      }}
                    >
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </Avatar>
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: 8,
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: user.status === "online" ? "#4CAF50" : "#9e9e9e",
                        border: "2px solid white",
                      }}
                    />
                  </Box>
                  <Box sx={{ overflow: "hidden" }}>
                    <Typography
                      variant="h6"
                      color="#1D1D20"
                      sx={{
                        fontFamily: "SourGummy, sans-serif",
                        fontWeight: 600,
                        fontSize: "18px",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {user.name} {user.isCurrentUser && "(You)"}
                    </Typography>
                    <Typography
                      color={user.status === "online" ? "#4CAF50" : "#9e9e9e"}
                      sx={{
                        fontFamily: "SourGummy, sans-serif",
                        fontWeight: 500,
                        fontSize: "14px",
                      }}
                    >
                      {user.activity}
                    </Typography>
                    <Typography
                      color="#666"
                      sx={{
                        fontFamily: "SourGummy, sans-serif",
                        fontWeight: 500,
                        fontSize: "12px",
                        mt: 0.5,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "180px",
                      }}
                    >
                      {user.email}
                    </Typography>
                  </Box>
                </Card>
              ))
            ) : (
              <Box sx={{ display: "flex", justifyContent: "center", width: "100%", alignItems: "center" }}>
                <Typography
                  color="#1D1D20"
                  sx={{
                    fontFamily: "SourGummy, sans-serif",
                    fontWeight: 500,
                    fontSize: "16px",
                  }}
                >
                  No active users found. Be the first to engage with the community!
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default HomePage


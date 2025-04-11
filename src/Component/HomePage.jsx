"use client"
//The code for the homepage was assisted with the help of ChatGPT
import { useEffect, useState, useRef, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  AppBar,
  Alert,
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
  Grid,
  Snackbar,
  Stack,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { motion } from "framer-motion"
import fish1 from "../assets/fish1.png"
import fish2 from "../assets/fish2.png"
import fish3 from "../assets/fish3.png"
import logo from "../assets/Frame.png"
import DrBubbles from "./DrBubbles"
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, HelpCircle } from "lucide-react"
import { BackgroundContext } from "../App"
import CreatePost from "./CreatePost"
import PostFeed from "./PostFeed"

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
  const { currentBackground } = useContext(BackgroundContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()
  const [showGuide, setShowGuide] = useState(true)
  const [latestCommunities, setLatestCommunities] = useState([])
  const [latestCourses, setLatestCourses] = useState([])
  const [activeUsers, setActiveUsers] = useState([]) // Start with empty array
  const [loadingCommunities, setLoadingCommunities] = useState(true)
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)

  const [leaderboardData, setLeaderboardData] = useState([])
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true)
  const [recentStudySets, setRecentStudySets] = useState([])
  const [loadingStudySets, setLoadingStudySets] = useState(true)
  const [userStats, setUserStats] = useState([])
  const [loadingUserStats, setLoadingUserStats] = useState(true)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isTablet = useMediaQuery(theme.breakpoints.down("md"))
  const isDrawerCompact = useMediaQuery(theme.breakpoints.down("md"))

  // Adjust initial Y position for mobile
  const initialX = isMobile ? 40 : 50;
  const initialY = isMobile ? -75 : 5; 
  const [helpBubblePosition, setHelpBubblePosition] = useState({ x: initialX, y: initialY })
  const [isQuestionBubbleVisible, setIsQuestionBubbleVisible] = useState(true)
  const [streakPopup, setStreakPopup] = useState({ open: false, message: "" })

  // Add missing refs
  const leaderboardRef = useRef(null)
  const communitiesRef = useRef(null)
  const coursesRef = useRef(null)
  const usersRef = useRef(null)

  const [refreshFeed, setRefreshFeed] = useState(false);

  // const handlePostCreated = () => {
  //   setRefreshFeed(prev => !prev);
  // };

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
                },
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

              // Better handling of JSON content in description
              let description = "No description available"
              try {
                if (post.content) {
                  // Check if the content is JSON
                  if (post.content.startsWith("{") && post.content.endsWith("}")) {
                    // Try to parse it as JSON
                    const contentObj = JSON.parse(post.content)
                    // Extract description from JSON if available
                    if (contentObj.description) {
                      description = contentObj.description
                    } else if (contentObj.text) {
                      description = contentObj.text
                    } else {
                      // If no specific description field, use the first string property we find
                      for (const key in contentObj) {
                        if (typeof contentObj[key] === "string" && contentObj[key].length > 10) {
                          description = contentObj[key]
                          break
                        }
                      }
                    }
                  } else {
                    // Not JSON, use as is
                    description = post.content
                  }
                }
              } catch (e) {
                console.error("Error parsing course description:", e)
                // Fallback to raw content with basic cleanup
                description = post.content ? post.content.replace(/\{.*?\}/g, "").trim() : "No description available"
              }

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
      // Filter mock users to only show those active in the last 30 minutes
      const thirtyMinutesAgo = Date.now() - 1800000
      const recentlyActiveMockUsers = MOCK_USERS.filter((user) => user.lastActivity >= thirtyMinutesAgo)
      setActiveUsers(recentlyActiveMockUsers)
      setLoadingUsers(false)
      return
    }

    console.log("Fetching users from:", `${process.env.REACT_APP_API_PATH}/users`)

    // First get all users
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
      .then(async (result) => {
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

        console.log("Extracted users array:", usersArray)

        if (usersArray && usersArray.length > 0) {
          // For each user, fetch their detailed information to get last activity
          const userDetailsPromises = usersArray.map(async (user) => {
            try {
              const userId = user.id || user._id || `user-${Math.random()}`
              const isCurrentUser = currentUser && currentUser.toString() === userId.toString()

              // If this is the current user or we need detailed info, fetch user details
              if (isCurrentUser || true) {
                // Always fetch details for now
                const detailsResponse = await fetch(`${process.env.REACT_APP_API_PATH}/users/${userId}`, {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                })

                if (detailsResponse.ok) {
                  const userDetails = await detailsResponse.json()
                  console.log(`User details for ${userId}:`, userDetails)

                  // Extract last activity time from user details if available
                  // This assumes the API returns lastActivity in the user details
                  // If not, we'll use the current time as a fallback
                  const lastActivityTime =
                    (userDetails.lastActivity ? new Date(userDetails.lastActivity).getTime() : null) ||
                    (userDetails.attributes && userDetails.attributes.lastActivity
                      ? new Date(userDetails.attributes.lastActivity).getTime()
                      : null) ||
                    Date.now() // Fallback to current time

                  return processUserData(user, userDetails, isCurrentUser, lastActivityTime)
                }
              }

              // If we couldn't get details or didn't need to, process with basic info
              return processUserData(user, null, isCurrentUser, Date.now())
            } catch (error) {
              console.error(`Error fetching details for user:`, error)
              return processUserData(user, null, false, Date.now())
            }
          })

          // Wait for all user details to be fetched
          const processedUsers = await Promise.all(userDetailsPromises)

          // Sort users: current user first, then by last activity
          const sortedUsers = processedUsers.sort((a, b) => {
            if (a.isCurrentUser) return -1
            if (b.isCurrentUser) return 1
            return b.lastActivity - a.lastActivity
          })

          console.log("All processed users:", sortedUsers)

          // Filter users to only show those active in the last 30 minutes
          const thirtyMinutesAgo = Date.now() - 1800000
          const recentlyActiveUsers = sortedUsers.filter((user) => user.lastActivity >= thirtyMinutesAgo)

          console.log("Users active in last 30 minutes:", recentlyActiveUsers)
          setActiveUsers(recentlyActiveUsers)
        } else {
          console.log("No users found in response")
          setActiveUsers([])
        }

        setLoadingUsers(false)
      })
      .catch((error) => {
        console.error("Error fetching users:", error)
        console.log("Using mock data due to error")
        // Filter mock users to only show those active in the last 30 minutes
        const thirtyMinutesAgo = Date.now() - 1800000
        const recentlyActiveMockUsers = MOCK_USERS.filter((user) => user.lastActivity >= thirtyMinutesAgo)
        setActiveUsers(recentlyActiveMockUsers)
        setLoadingUsers(false)
      })
  }

  // Helper function to process user data consistently
  const processUserData = (user, userDetails, isCurrentUser, lastActivityTime) => {
    console.log("Processing user data:", { user, userDetails, isCurrentUser, lastActivityTime })

    // Combine basic user data with details if available
    const combinedUser = userDetails ? { ...user, ...userDetails } : user

    // Extract username with better fallback handling
    let userName = null
    if (combinedUser.attributes && combinedUser.attributes.username) {
      userName = combinedUser.attributes.username
    } else if (combinedUser.attributes && combinedUser.attributes.firstName && combinedUser.attributes.lastName) {
      userName = `${combinedUser.attributes.firstName} ${combinedUser.attributes.lastName}`
    } else if (combinedUser.username) {
      userName = combinedUser.username
    } else if (combinedUser.firstName && combinedUser.lastName) {
      userName = `${combinedUser.firstName} ${combinedUser.lastName}`
    }

    // If still no username found, try to get it from email
    if (!userName && combinedUser.attributes && combinedUser.attributes.email) {
      userName = combinedUser.attributes.email.split("@")[0]
    } else if (!userName && combinedUser.email) {
      userName = combinedUser.email.split("@")[0]
    }

    // Final fallback for username
    userName = userName || "Anonymous User"

    // Extract email
    const email =
      (combinedUser.attributes && combinedUser.attributes.email) ||
      combinedUser.email ||
      (userName !== "Anonymous User"
        ? `${userName.toLowerCase().replace(/\s+/g, ".")}@bubblebrain.com`
        : "no-email@bubblebrain.com")

    // Extract avatar/profile picture
    const avatar =
      (combinedUser.attributes && combinedUser.attributes.profilePicture) ||
      combinedUser.avatar ||
      combinedUser.profilePicture ||
      null

    // Determine online status based on last activity
    const now = Date.now()
    const fiveMinutesAgo = now - 300000 // 5 minutes in milliseconds
    const status = lastActivityTime >= fiveMinutesAgo ? "online" : "offline"

    // Format activity text based on last activity time
    let activity
    if (isCurrentUser) {
      activity = "Online now (You)"
    } else if (status === "online") {
      activity = "Online now"
    } else {
      activity = `Last active ${formatLastActive(lastActivityTime)}`
    }

    return {
      id: combinedUser.id || combinedUser._id || `user-${Math.random()}`,
      name: userName,
      activity: activity,
      status: status,
      avatar: avatar,
      email: email,
      isCurrentUser: isCurrentUser,
      lastActivity: lastActivityTime,
    }
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


  // Add this helper function to format the study time
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  // Add this to your useEffect
  useEffect(() => {
    const token = sessionStorage.getItem("token")
    if (token) {
      // Fetch both leaderboard and user stats together
      const fetchData = async () => {
        try {
          await Promise.all([
            fetchLeaderboardData(),
            fetchUserStats()
          ])
        } catch (error) {
          console.error("Error fetching data:", error)
        }
      }
      
      fetchData()
      
      // Set up polling every 30 seconds
      const intervalId = setInterval(fetchData, 30000)
      
      // Cleanup on unmount
      return () => clearInterval(intervalId)
    }
  }, []) // Empty dependency array since we want this to run only once on mount

  // Remove the separate useEffect for fetchLeaderboardData

  const fetchLeaderboardData = async () => {
    setLoadingLeaderboard(true)
    const token = sessionStorage.getItem("token")

    if (!token) {
      setLoadingLeaderboard(false)
      return
    }

    try {
      // Fetch all users
      const usersResponse = await fetch(`${process.env.REACT_APP_API_PATH}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!usersResponse.ok) {
        throw new Error("Failed to fetch users")
      }

      const usersData = await usersResponse.json()
      const users = usersData[0] || []

      if (!users || users.length === 0) {
        console.error("No users found in API response")
        setLeaderboardData([])
        return
      }

      // Fetch study time for each user
      const leaderboardPromises = users.map(async (user) => {
        try {
          const studyTimeResponse = await fetch(
            `${process.env.REACT_APP_API_PATH}/posts?type=study_time&authorID=${user.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )

          if (!studyTimeResponse.ok) {
            throw new Error(`Failed to fetch study time for user ${user.id}`)
          }

          const studyTimeData = await studyTimeResponse.json()
          let totalStudyTime = 0
          let studySessions = 0

          if (studyTimeData && studyTimeData[0]) {
            // Count total sessions
            studySessions = studyTimeData[0].length

            // Calculate total study time
            totalStudyTime = studyTimeData[0].reduce((total, post) => {
              try {
                const content = typeof post.content === 'string' ? JSON.parse(post.content) : post.content
                return total + (content.duration || 0)
              } catch (e) {
                console.warn(`Error parsing study time content for user ${user.id}:`, e)
                return total
              }
            }, 0)
          }

          // Get user display name from attributes
          let displayName = "Anonymous User"
          if (user.attributes?.username) {
            displayName = user.attributes.username
          } else if (user.username) {
            displayName = user.username
          } else if (user.attributes?.firstName && user.attributes?.lastName) {
            displayName = `${user.attributes.firstName} ${user.attributes.lastName}`
          } else if (user.firstName && user.lastName) {
            displayName = `${user.firstName} ${user.lastName}`
          } else if (user.attributes?.email) {
            displayName = user.attributes.email.split('@')[0]
          } else if (user.email) {
            displayName = user.email.split('@')[0]
          }

          return {
            id: user.id,
            name: displayName,
            avatar: user.attributes?.profilePicture || user.avatar,
            totalStudyTime,
            studySessions,
          }
        } catch (error) {
          console.error(`Error processing user ${user.id}:`, error)
          return null
        }
      })

      const leaderboardResults = (await Promise.all(leaderboardPromises)).filter(Boolean)
      
      if (!leaderboardResults || leaderboardResults.length === 0) {
        console.error("No valid leaderboard results found")
        setLeaderboardData([])
        return
      }

      // Sort by total study time and get top 5
      const sortedLeaderboard = leaderboardResults
        .sort((a, b) => b.totalStudyTime - a.totalStudyTime)
        .slice(0, 5)

      console.log("Sorted leaderboard data:", sortedLeaderboard)
      setLeaderboardData(sortedLeaderboard)
    } catch (error) {
      console.error("Error fetching leaderboard data:", error)
      setLeaderboardData([])
    } finally {
      setLoadingLeaderboard(false)
    }
  }

  const fetchUserStats = async () => {
    setLoadingUserStats(true)
    const token = sessionStorage.getItem("token")
    
    if (!token) {
      setLoadingUserStats(false)
      return
    }

    try {
      // Fetch all users
      const usersResponse = await fetch(`${process.env.REACT_APP_API_PATH}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!usersResponse.ok) {
        throw new Error(`Failed to fetch users: ${usersResponse.status}`)
      }

      const usersData = await usersResponse.json()
      const users = usersData[0] || []

      if (!users || users.length === 0) {
        console.error("No users found in API response")
        setUserStats([])
        return
      }

      console.log(`Processing statistics for ${users.length} users`)

      // We'll create custom statistics for each metric we want to display
      const statsPromises = users.map(async (user) => {
        try {
          // Get user ID safely
          const userId = user.id || user._id
          if (!userId) {
            console.error("User without ID found:", user)
            return null
          }

          // Get study sessions for timing statistics
          const studySessionsResponse = await fetch(
            `${process.env.REACT_APP_API_PATH}/posts?type=study_time&authorID=${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          
          if (!studySessionsResponse.ok) {
            console.error(`Failed to fetch study sessions for user ${userId}: ${studySessionsResponse.status}`)
            return null
          }

          const studySessionsData = await studySessionsResponse.json()
          const studySessions = studySessionsData && studySessionsData[0] ? studySessionsData[0] : []

          console.log(`User ${userId}: Found ${studySessions.length} study sessions`)

          // Study session metrics
          let longestSession = 0;
          let sessionCount = studySessions.length;
          let todaySessionCount = 0;
          
          // Get today's date (midnight) for comparing sessions
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayTimestamp = today.getTime();
          
          // Process study sessions
          studySessions.forEach(session => {
            try {
              const content = typeof session.content === 'string' ? JSON.parse(session.content) : session.content
              
              // Check session duration and add to total
              if (content && content.duration && !isNaN(content.duration)) {
                const duration = Number(content.duration);
                longestSession = Math.max(longestSession, duration);
              }
              
              // Check if session was today
              if (content && content.startTime) {
                try {
                  const sessionDate = new Date(content.startTime);
                  // If session timestamp is today or later (today's date)
                  if (sessionDate.getTime() >= todayTimestamp) {
                    todaySessionCount++;
                  }
                } catch (e) {
                  console.warn(`Error parsing start time for user ${userId}:`, e)
                }
              } else if (session.timestamp || session.created) {
                // Fallback to post timestamp if content has no startTime
                const sessionTime = new Date(session.timestamp || session.created);
                if (sessionTime.getTime() >= todayTimestamp) {
                  todaySessionCount++;
                }
              }
            } catch (e) {
              console.warn(`Error parsing study session content for user ${userId}:`, e)
            }
          })

          // Get user display name 
          let displayName = extractUserDisplayName(user)

          // Return user stats
          return {
            id: userId,
            name: displayName,
            avatar: user.attributes?.profilePicture || user.avatar,
            longestSession,
            sessionCount,
            todaySessionCount
          }
        } catch (error) {
          console.error(`Error processing statistics for user:`, error)
          return null
        }
      })

      // Wait for all user stats to be processed
      let statsResults = (await Promise.all(statsPromises)).filter(Boolean)
      
      if (!statsResults || statsResults.length === 0) {
        console.error("No valid user statistics found")
        setUserStats([])
        return
      }

      console.log(`Found ${statsResults.length} users with valid statistics`)
      
      // Find the top user for each stat category
      const topMarathon = findTopUserForStat(statsResults, 'longestSession', 'marathon')
      const topSessions = findTopUserForStat(statsResults, 'sessionCount', 'studySessions')
      const topTodaySessions = findTopUserForStat(statsResults, 'todaySessionCount', 'todaySessions')
      
      // Combine all top users, ensuring we have all 3 badges
      let finalStats = [
        topMarathon, 
        topSessions, 
        topTodaySessions
      ].filter(Boolean) // Remove any null values
      
      console.log("Final user achievements:", finalStats)
      
      // Set the state with our final statistics
      setUserStats(finalStats)
    } catch (error) {
      console.error("Error fetching user statistics:", error)
      setUserStats([])
    } finally {
      setLoadingUserStats(false)
    }
  }

  // Helper function to create default stats when API fails
  const createDefaultStats = () => {
    return [
      { id: 'default-1', name: 'Study Expert', avatar: null, statType: 'marathon', statValue: 0 },
      { id: 'default-2', name: 'Session King', avatar: null, statType: 'studySessions', statValue: 0 },
      { id: 'default-3', name: 'Today Champ', avatar: null, statType: 'todaySessions', statValue: 0 }
    ];
  }

  // Helper function to create default badges for a single user
  const createDefaultBadges = (user) => {
    // Include only the stats we want to display
    const statTypes = ['marathon', 'studySessions', 'todaySessions'];
    console.log("Creating default badges for types:", statTypes);
    return statTypes.map(type => createPlaceholderStat(user, type));
  }

  // Helper function to create a placeholder stat for a user
  const createPlaceholderStat = (user, statType) => {
    let statValue = 0;
    switch (statType) {
      case 'marathon':
        statValue = user.longestSession || 0;
        break;
      case 'studySessions':
        statValue = user.sessionCount || 0;
        break;
      case 'todaySessions':
        statValue = user.todaySessionCount || 0;
        break;
    }
    
    return {
      id: `${user.id}-${statType}`,
      name: user.name,
      avatar: user.avatar,
      statType: statType,
      statValue: statValue
    };
  }

  // Helper function to find the top user for a specific stat
  const findTopUserForStat = (users, statKey, statType) => {
    console.log(`Finding top user for ${statType} using stat key ${statKey}`);

    // Sort users by the stat value in descending order
    const sortedUsers = [...users].sort((a, b) => b[statKey] - a[statKey]);
    
    console.log(`Sorted ${sortedUsers.length} users for ${statType}`);
    
    // Take the top user for this stat
    const topUser = sortedUsers[0];
    
    // If no user found, return null
    if (!topUser) {
      console.warn(`No top user found for ${statType}`);
      return null;
    }
    
    console.log(`Top user for ${statType}: ${topUser.name} with value ${topUser[statKey]}`);
    
    // Return formatted stat object
    return {
      id: topUser.id,
      name: topUser.name,
      avatar: topUser.avatar,
      statType: statType,
      statValue: topUser[statKey]
    }
  }

  // Helper function to extract user display name from user object
  const extractUserDisplayName = (user) => {
    if (!user) return "Anonymous User"
    
    // Try to get username from different possible locations
    if (user.attributes?.username) return user.attributes.username
    if (user.username) return user.username
    
    // Try to construct name from first and last name
    if (user.attributes?.firstName && user.attributes?.lastName) {
      return `${user.attributes.firstName} ${user.attributes.lastName}`
    }
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    
    // Try to extract name from email
    if (user.attributes?.email) return user.attributes.email.split('@')[0]
    if (user.email) return user.email.split('@')[0]
    
    // Final fallback
    return "Anonymous User"
  }

  // Helper function to get stat icon
  const getStatIcon = (statType) => {
    switch (statType) {
      case 'marathon':
        return '⏱️';
      case 'studySessions':
        return '📚';
      case 'todaySessions':
        return '🔥';
      default:
        return '🏆';
    }
  };

  // Helper function to get the title for each stat type
  const getStatTitle = (statType) => {
    switch (statType) {
      case 'marathon':
        return 'Sailor of Study';
      case 'studySessions':
        return 'Sea of Sessions';
      case 'todaySessions':
        return 'Session Shark';
      default:
        return 'Achievement';
    }
  };

  // Helper function to format the stat value based on its type
  const formatStatValue = (statType, value) => {
    if (value === undefined || value === null) return "N/A";
    
    switch (statType) {
      case 'marathon':
        // Convert seconds to minutes for readability
        const minutes = Math.floor(value / 60);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) {
          const remainingMinutes = minutes % 60;
          return `${hours}h ${remainingMinutes}m `;
        }
        return `${minutes} minute${minutes !== 1 ? 's' : ''} `;
      case 'studySessions':
        return `${value} session${value !== 1 ? 's' : ''}`;
      case 'todaySessions':
        return `${value} today`;
      default:
        return value;
    }
  };

  // Helper function to get a gradient based on stat type
  const getStatGradient = (statType) => {
    switch (statType) {
      case 'marathon':
        return 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)';
      case 'studySessions':
        return 'linear-gradient(135deg, #EF7B6C 0%, #E9D0CE 100%)';
      case 'todaySessions':
        return 'linear-gradient(135deg, #FFA500 0%, #FFC107 100%)';
      default:
        return 'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)';
    }
  };

  // Helper function to get avatar background color based on stat type
  const getAvatarColor = (statType) => {
    switch (statType) {
      case 'marathon':
        return '#e64c4c';
      case 'studySessions':
        return '#EF7B6C';
      case 'todaySessions':
        return '#FFA500';
      default:
        return '#3e6bd4';
    }
  };

  // Helper function to get the caption for each stat type
  const getStatCaption = (statType) => {
    switch (statType) {
      case 'marathon':
        return 'Longest continuous study session';
      case 'studySessions':
        return 'Highest number of study sessions';
      case 'todaySessions':
        return 'Most study sessions completed today';
      default:
        return 'Outstanding achievement';
    }
  };

  // Remove the separate useEffect for fetchLeaderboardData and fetchUserStats
  // Remove the useEffect that has fetchUserStats in it

  // Add this new consolidated useEffect after the other useEffects
  useEffect(() => {
    const token = sessionStorage.getItem("token")
    console.log("Token in useEffect:", token ? "Token exists" : "No token")
    setIsLoggedIn(!!token)

    const fetchAllData = async () => {
      try {
        if (token) {
          // Set all loading states to true
          setLoadingCommunities(true)
          setLoadingCourses(true)
          setLoadingUsers(true)
          setLoadingLeaderboard(true)
          setLoadingUserStats(true)

          // Fetch all data in parallel
          await Promise.all([
            fetchLatestCommunities(),
            fetchLatestCourses(),
            fetchActiveUsers(),
            fetchLeaderboardData(),
            fetchUserStats()
          ])
        } else {
          // If no token, use mock data
          setActiveUsers(MOCK_USERS)
          setLoadingUsers(false)
          setLoadingUserStats(false)
          setLoadingLeaderboard(false)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        // Set loading states to false in case of error
        setLoadingCommunities(false)
        setLoadingCourses(false)
        setLoadingUsers(false)
        setLoadingLeaderboard(false)
        setLoadingUserStats(false)
      }
    }

    // Initial fetch
    fetchAllData()

    // Set up polling for active users and leaderboard data
    const intervalId = setInterval(() => {
      if (token) {
        fetchActiveUsers()
        fetchLeaderboardData()
        fetchUserStats()
      }
    }, 90000)

    // Cleanup on unmount
    return () => clearInterval(intervalId)
  }, []) // Empty dependency array since we want this to run only once on mount
  useEffect(() => {
    const token = sessionStorage.getItem("token")
    const userStr = sessionStorage.getItem("user")
  
    if (!token || !userStr) return
  
    // Streak check (once per day)
    const showStreakPopupIfNeeded = async () => {
      try {
        const user = JSON.parse(userStr)
        const userId = typeof user === "object" ? user.id : Number(userStr)
        const postsRes = await fetch(`${process.env.REACT_APP_API_PATH}/posts?type=study_time&authorID=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
  
        if (!postsRes.ok) return
  
        const postsData = await postsRes.json()
        const posts = postsData[0] || []
  
        // Filter unique days
        const uniqueDays = new Set(
          posts.map(post => {
            try {
              const content = JSON.parse(post.content || "{}")
              const ts = content.timestamp || post.timestamp || post.created
              const date = new Date(ts)
              date.setHours(0, 0, 0, 0)
              return date.getTime()
            } catch {
              return null
            }
          }).filter(Boolean)
        )
  
        // Sort by most recent
        const sortedDays = Array.from(uniqueDays).sort((a, b) => b - a)
  
        // Calculate streak (daily or 5-minute test mode if you want!)
        let streak = 0
        let today = new Date()
        today.setHours(0, 0, 0, 0)
        let current = today.getTime()
  
        for (let i = 0; i < sortedDays.length; i++) {
          const diff = (current - sortedDays[i]) / (1000 * 60 * 60 * 24)
          if (diff === 0 || diff === 1) {
            streak++
            current -= 86400000
          } else {
            break
          }
        }
  
        // Check if we've already shown it today
        const lastShown = sessionStorage.getItem("lastStreakPopupDate")
        const todayStr = new Date().toISOString().split("T")[0]
  
        if (streak > 0 && lastShown !== todayStr) {
          setStreakPopup({
            open: true,
            message: `🔥 You're on a ${streak}-day streak! Keep going!`,
          })
          sessionStorage.setItem("lastStreakPopupDate", todayStr)
        }
      } catch (e) {
        console.error("Streak popup error:", e)
      }
    }
  
    showStreakPopupIfNeeded()
  }, [])
  
  // Add this useEffect to handle scroll behavior for both Dr. Bubbles and question mark bubble
  useEffect(() => {
    if (isMobile) {
      const handleScroll = () => {
        const scrollPosition = window.scrollY
        setIsQuestionBubbleVisible(scrollPosition < 100) // Hide after scrolling 100px
      }

      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [isMobile])

  // Add missing functions
  const scrollCarousel = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -300 : 300
      ref.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth"
      })
    }
  }

  const truncateText = (text, maxLength) => {
    if (!text) return ""
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }

  return (
    <>
      <Box
        sx={{
          flexGrow: 1,
          bgcolor: "#1D1D20",
          minHeight: "100vh",
          backgroundImage: `url(${currentBackground.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 1.0,
          width: "100%",
          maxWidth: "100vw",
          overflowX: "hidden",
          position: "relative",
          [theme.breakpoints.down('sm')]: {
            maxWidth: '100%',
            margin: 0,
            padding: 0,
            width: '100vw',
            overflowX: 'hidden',
          }
        }}
      >
        <AppBar position="static" sx={{ opacity: 0, boxShadow: "none" }}>
          <Toolbar sx={{ visibility: "hidden" }}>
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
            
        {/* Help bubble that appears when guide is closed */}
        {!showGuide && isQuestionBubbleVisible && (
          <Tooltip title="Click for Dr. Bubbles' guide!" placement="right" arrow>
            <Box
              component={motion.div}
              animate={{
                x: helpBubblePosition.x,
                y: helpBubblePosition.y,
                transition: {
                  type: "spring",
                  stiffness: 100,
                  damping: 10,
                },
              }}
              onClick={() => setShowGuide(true)}
              sx={{
                position: "fixed",
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #00AEEF 60%, #0095CC)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 900,
                boxShadow: "0 4px 8px rgba(0,0,0,0.25)",
                border: "3px solid white",
                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                "&:hover": {
                  boxShadow: "0 6px 12px rgba(0,0,0,0.3)",
                  background: "linear-gradient(135deg, #00C3FF 60%, #00A8E8)",
                },
                // Add a subtle shine effect
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: "5%",
                  left: "10%",
                  width: "40%",
                  height: "20%",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.4)",
                  zIndex: 1,
                }
              }}
            >
              {/* Cartoon-style question mark */}
              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontFamily: "SourGummy, sans-serif",
                  fontSize: "36px",
                  fontWeight: "bold",
                  textShadow: "2px 2px 0 #007DAF",
                  transform: "translateY(-1px)",
                  userSelect: "none",
                  zIndex: 2,
                }}
              >
                ?
              </Box>
              
              {/* Pulsing ring */}
              <Box
                component={motion.div}
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.6, 0, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeOut",
                }}
                sx={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.6)",
                }}
              />

              {/* Floating animation */}
              <Box
                component={motion.div}
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                sx={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
            </Box>
          </Tooltip>
        )}

        <Container 
          maxWidth="lg" 
          sx={{ 
            px: { xs: 2, sm: 2, md: 3 },
            width: '100%',
            maxWidth: { xs: '100%', sm: 'lg' },
            overflow: 'hidden',
            [theme.breakpoints.down('sm')]: {
              maxWidth: '100%',
              padding: '0 8px',
              margin: 0,
              width: '100%',
              overflowX: 'hidden',
            }
          }}
        >
          {/* Add CreatePost component at the top with more visible styling */}
          {/* <Box 
            sx={{ 
              mb: 4,
              width: "100%",
              maxWidth: "800px",
              mx: "auto",
              [theme.breakpoints.down('sm')]: {
                p: 0,
                mb: 3,
              }
            }}
          >
            <CreatePost onPostCreated={handlePostCreated} />
          </Box>

          {/* Add PostFeed component */}
          {/* <Box 
            sx={{ 
              width: "100%",
              maxWidth: "800px",
              mx: "auto",
              mb: 4,
              [theme.breakpoints.down('sm')]: {
                p: 0,
              }
            }}
          >
            <PostFeed key={refreshFeed} />
          </Box> */} */

          <Box
            sx={{
              bgcolor: "#FFFFFF",
              py: { xs: 3, md: 8 },
              px: { xs: 2, md: 3 },
              mt: 2,
              borderRadius: 2,
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              mx: { xs: 0, sm: 0, md: 0 },
              width: { xs: '100%', sm: '100%' },
              overflow: 'hidden',
              position: 'relative',
              [theme.breakpoints.down('sm')]: {
                margin: '24px 0',
                width: '100%',
                borderRadius: 0,
                paddingTop: '16px',
                paddingBottom: '16px',
                overflowX: 'hidden',
                ml: 0,
                mr: 0,
              }
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
                fontSize: { xs: "28px", sm: "42px", md: "52px" },
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
                fontSize: { xs: "14px", sm: "22px", md: "26px" },
                [theme.breakpoints.down('sm')]: {
                  maxWidth: '80%', // Limit width on mobile to encourage wrapping
                  mx: 'auto', // Center the text block
                }
              }}
            >
              Explore our gamified courses and quizzes designed to make learning fun and engaging.
            </Typography>

            <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
              <Button
                variant="contained"
                component={Link}
                to="/community"
                size="large"
                sx={{
                  bgcolor: "#EF7B6C",
                  "&:hover": {
                    bgcolor: "#e66a59",
                  },
                  fontFamily: "SourGummy, sans-serif",
                  fontWeight: 600,
                  fontSize: { xs: "24px", sm: "28px", md: "32px" },
                  color: "#F4FDFF",
                  px: { xs: 3, md: 4 },
                  py: { xs: 0.5, md: 1 },
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
              py: { xs: 3, md: 4 },
              px: { xs: 1, md: 2 }, // Keep outer padding 8px (1) on xs
              overflow: 'visible', // Remove overflow: hidden
              borderRadius: 2,
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              mx: { xs: 0, sm: 0, md: 0 },
              width: { xs: '100%', sm: '100%' },
              position: 'relative',
              [theme.breakpoints.down('sm')]: {
                margin: '24px 0',
                width: '100%',
                borderRadius: 0,
                paddingTop: '16px',
                paddingBottom: '16px',
                paddingLeft: theme.spacing(1), // Use px property above for padding
                paddingRight: theme.spacing(1), // Use px property above for padding
                overflowX: 'visible', // Ensure not hidden on mobile either
                ml: 0, // Ensure no extra margin
                mr: 0, // Ensure no extra margin
              }
            }}
          >
            <Box sx={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              mb: 2,
              position: 'relative',
              zIndex: 2,
              mt: { xs: 4, sm: 0 },
              [theme.breakpoints.down('sm')]: {
                padding: '0 8px',
                // Center title on mobile
                flexDirection: 'column', // Stack title and arrows vertically
                alignItems: 'center', // Center items horizontally
              }
            }}>
              <Typography
                variant="h3"
                color="#1D1D20"
                sx={{
                  fontFamily: "SourGummy, sans-serif",
                  fontWeight: 700,
                  fontSize: { xs: "24px", sm: "30px", md: "36px" },
                  // Ensure title is centered when stacked
                  textAlign: { xs: 'center', sm: 'left' },
                  width: '100%', // Take full width for centering
                  mb: { xs: 1, sm: 0 }, // Add margin below title on mobile
                }}
              >
                Latest Communities
              </Typography>
              <Box sx={{ 
                display: "flex", 
                gap: 1,
                [theme.breakpoints.down('sm')]: {
                  position: 'relative',
                  right: '0', // Reset right positioning if needed
                  top: 0,
                  // Shift arrows slightly left by reducing gap or adding negative margin
                  marginLeft: '-5px', // Example shift
                }
              }}>
                <Button
                  onClick={() => scrollCarousel(communitiesRef, "left")}
                  sx={{

                    minWidth: { xs: "32px", md: "40px" },
                    height: { xs: "32px", md: "40px" },
                    borderRadius: "50%",
                    bgcolor: "#EF7B6C",
                    color: "white",
                    "&:hover": { bgcolor: "#e66a59" },
                    p: { xs: 0.5, md: 1 },

                  }}
                >

                  <ChevronLeft size={isMobile ? 16 : 24} />
                </Button>
                <Button
                  onClick={() => scrollCarousel(communitiesRef, "right")}
                  sx={{
                    minWidth: { xs: "32px", md: "40px" },
                    height: { xs: "32px", md: "40px" },
                    borderRadius: "50%",
                    bgcolor: "#EF7B6C",
                    color: "white",
                    "&:hover": { bgcolor: "#e66a59" },
                    p: { xs: 0.5, md: 1 },

                  }}
                >
                  <ChevronRight size={isMobile ? 16 : 24} />
                </Button>
              </Box>

            </Box>

            <Box
              ref={communitiesRef}
              sx={{
                display: "flex",
                overflowX: "auto", // Explicitly auto
                gap: { xs: 1, md: 2 }, // Keep gap 8px (1) on xs
                pb: 2,
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
                msOverflowStyle: "none",
                minHeight: { xs: "250px", md: "280px" },
                px: { xs: 1, md: 0 }, // Add inner padding 8px (1) on xs
                width: '100%',
                // overflow: 'hidden', // Remove this from inner box
                scrollSnapType: 'x mandatory',
                [theme.breakpoints.down('sm')]: {
                  paddingLeft: theme.spacing(1), // Ensure inner padding is 8px
                  paddingRight: theme.spacing(1), // Ensure inner padding is 8px
                  // No mt needed here
                }
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
                      minWidth: { xs: 'calc(50% - 4px)', sm: 250, md: 280 }, // Set width to calc(50% - 4px)
                      maxWidth: { xs: 'calc(50% - 4px)', sm: 250, md: 280 }, // Set width to calc(50% - 4px)
                      bgcolor: "#FFFFFF",
                      borderRadius: 2,
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
                        cursor: "pointer",
                      },
                      flex: "0 0 auto",
                      scrollSnapAlign: 'start',
                    }}
                    onClick={() => handleCommunityClick(community.id)}
                  >
                    <CardMedia
                      component="img"
                      sx={{ height: { xs: 120, md: 140 }, objectFit: "contain", pt: 2 }}
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
                          fontSize: { xs: "18px", md: "22px" },
                        }}
                      >
                        {community.name}
                      </Typography>
                      <Typography
                        color="#1D1D20"
                        sx={{
                          fontFamily: "SourGummy, sans-serif",
                          fontWeight: 500,
                          fontSize: { xs: "12px", md: "14px" },
                          mb: 1,
                          height: { xs: "48px", md: "60px" },
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
                          fontSize: { xs: "12px", md: "14px" },
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
                      fontSize: { xs: "14px", md: "16px" },
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
                  fontSize: { xs: "14px", md: "16px" },
                }}
              >
                View All Communities
              </Button>
            </Box>
          </Box>

          {/* Two-column layout for Champions and User Achievements */}
          <Grid 
            container 
            spacing={0} 
            sx={{ 
              mt: 3, 
              mb: 6, 
              px: { xs: 0, sm: 0, md: 0 },
              width: "100%",
              mx: 0,
              [theme.breakpoints.down('sm')]: {
                padding: '0 8px',
              }
            }}
          >
            {/* Bubble Brainiacs - Left column (half size) */}
            <Grid item xs={12} md={6} sx={{ pr: { md: 1.5 }, pl: 0 }}>
              <Box
                sx={{
                  bgcolor: "#FFFFFF",
                  py: { xs: 2, md: 3 },
                  px: { xs: 2, md: 2 },
                  borderRadius: "24px",
                  boxShadow: "0 4px 20px rgba(29, 110, 241, 0.15)",
                  position: "relative",
                  overflow: "hidden",
                  height: "100%",
                  width: "100%",
                  [theme.breakpoints.down('sm')]: {
                    padding: '16px 8px', // Adjusted padding for mobile consistency
                    // Center title and subtitle box
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }
                }}
              >
                <Box sx={{ 
                  display: "flex", 
                  flexDirection: 'column', // Stack title and subtitle
                  justifyContent: "center", // Center vertically within this box
                  alignItems: { xs: "center", md: "flex-start" }, // Center horizontally on xs, left on md
                  mb: 2, 
                  position: "relative", 
                  zIndex: 1,
                  width: '100%', // Ensure box takes full width for centering
                  textAlign: { xs: 'center', md: 'left' }, // Center text on xs, left on md
                }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontFamily: "SourGummy, sans-serif",
                      fontWeight: 700,
                      fontSize: { xs: "24px", sm: "30px", md: "36px" },
                      color: "#1D1D20",
                    }}
                  >
                    Bubble Brainiacs
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "SourGummy, sans-serif",
                      color: "#555",
                      fontSize: { xs: "12px", md: "14px" },
                      // mb: 2, // Removed mb from here as parent Box handles spacing
                      position: "relative",
                      zIndex: 1,
                      textAlign: "center", // Ensure text is centered
                      pl: 0,
                      mt: 0.5, // Add slight top margin
                    }}
                  >
                    Top students ranked by total study time. 
                  </Typography>
                </Box>

                {/* Scrollable Container */}
                <Box
                  ref={leaderboardRef}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    maxHeight: "unset",
                    padding: 1,
                    paddingRight: 2,
                    width: '100%', // Ensure container takes full width
                    [theme.breakpoints.down('sm')]: {
                      // Shift cards slightly right
                      pl: 'calc(1rem + 5px)', // Add 5px to existing padding/margin
                      pr: 'calc(1rem - 5px)', // Adjust right padding if needed
                      boxSizing: 'border-box',
                    }
                    // Remove scrollbar styles
                  }}
                >
                  {loadingLeaderboard ? (
                    <Box sx={{ display: "flex", justifyContent: "center", width: "100%", alignItems: "center", py: 4 }}>
                      <CircularProgress sx={{ color: "#1D6EF1" }} />
                    </Box>
                  ) : leaderboardData.length > 0 ? (
                    // Limit display to only first 3 users
                    leaderboardData.slice(0, 3).map((user, index) => (
                      <Card
                        key={user.id}
                        sx={{
                          width: "100%",
                          background: "#FFFFFF",
                          backdropFilter: "blur(10px)",
                          borderRadius: "16px",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 8px 20px rgba(29, 110, 241, 0.2)",
                          },
                          border: index < 3 ? `2px solid ${
                            index === 0 ? "#FFD700" : 
                            index === 1 ? "#C0C0C0" : 
                            "#CD7F32"
                          }` : "2px solid rgba(151, 199, 241, 0.5)",
                          overflow: "hidden",
                          position: "relative",
                          mb: 3,
                          height: { xs: "70px", md: "80px" },
                          display: "flex",
                          alignItems: "center",
                          [theme.breakpoints.down('sm')]: {
                            padding: '0 8px',
                          }
                        }}
                      >
                        {/* Rank Number */}
                        <Box
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: { xs: "12px", md: "16px" },
                            transform: "translateY(-50%)",
                            width: { xs: "32px", md: "40px" },
                            height: { xs: "32px", md: "40px" },
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "transparent",
                            borderRadius: "50%",
                            color: "#FFFFFF",
                            fontSize: { xs: "16px", md: "18px" },
                            fontWeight: "bold",
                            fontFamily: "SourGummy, sans-serif",
                            zIndex: 2,
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              inset: 0,
                              borderRadius: "50%",
                              padding: "2px",
                              background: `linear-gradient(135deg, ${
                                index === 0 ? "#FFD700, #FFA500" : 
                                index === 1 ? "#C0C0C0, #A0A0A0" : 
                                index === 2 ? "#CD7F32, #8B4513" : 
                                "#1D6EF1, #97C7F1"
                              })`,
                              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                              WebkitMaskComposite: "xor",
                              maskComposite: "exclude",
                            },
                            "&::after": {
                              content: '""',
                              position: "absolute",
                              inset: "2px",
                              borderRadius: "50%",
                              background: `linear-gradient(135deg, ${
                                index === 0 ? "#FFD700, #FFA500" : 
                                index === 1 ? "#C0C0C0, #A0A0A0" : 
                                index === 2 ? "#CD7F32, #8B4513" : 
                                "#1D6EF1, #97C7F1"
                              })`,
                              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                            },
                          }}
                        >
                          <Box sx={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                            {index === 0 && (
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: "-25px",
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                  fontSize: { xs: "20px", md: "24px" },
                                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                                  animation: "float 2s ease-in-out infinite",
                                  "@keyframes float": {
                                    "0%, 100%": { transform: "translateX(-50%) translateY(0)" },
                                    "50%": { transform: "translateX(-50%) translateY(-5px)" },
                                  },
                                }}
                              >
                                👑
                              </Box>
                            )}
                            <span>
                              {index + 1}
                            </span>
                          </Box>
                        </Box>

                        <CardContent sx={{ 
                          pt: 1, 
                          pb: 1, 
                          pl: { xs: '44px', md: 6 }, 
                          pr: { xs: 1, md: 2 },
                          width: "100%",
                          height: "100%",
                          display: "flex", 
                          flexDirection: "column", 
                          justifyContent: "center",
                          [theme.breakpoints.down('sm')]: {
                            padding: '0 8px',
                            pl: '44px',
                          }
                        }}>
                          {/* Ensure smaller gap for mobile */}
                          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0, md: 2 } }}> 
                            <Avatar
                              src={user.avatar}
                              alt={user.name}
                              sx={{
                                width: { xs: 40, md: 50 },
                                height: { xs: 40, md: 50 },
                                background: `linear-gradient(135deg, ${
                                  index === 0 ? "#FFD700, #FFA500" : 
                                  index === 1 ? "#C0C0C0, #A0A0A0" : 
                                  index === 2 ? "#CD7F32, #8B4513" : 
                                  "#1D6EF1, #97C7F1"
                                })`,
                                border: "3px solid rgba(255, 255, 255, 0.8)",
                                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                                ml: { xs: 0, md: 1 },
                              }}
                            >
                              {user.name.charAt(0).toUpperCase()}
                            </Avatar>

                            {/* Apply negative margin on mobile */}
                            <Box sx={{ flexGrow: 1, marginLeft: { xs: '-2px', md: 0 } }}>
                              <Tooltip title={user.name} placement="top" arrow>
                                <Typography
                                  variant="h5"
                                  sx={{
                                    fontFamily: "SourGummy, sans-serif",
                                    fontWeight: 600,
                                    fontSize: { xs: "16px", md: "18px" },
                                    color: "#1D1D20",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {truncateText(user.name, isMobile ? 8 : 10)}
                                </Typography>
                              </Tooltip>
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.5 }}>
                                <Typography
                                  sx={{
                                    fontFamily: "SourGummy, sans-serif",
                                    color: "#1D6EF1",
                                    fontWeight: 600,
                                    fontSize: { xs: "12px", md: "14px" },
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    lineHeight: 1.1,
                                  }}
                                >
                                  {formatTime(user.totalStudyTime)}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontFamily: "SourGummy, sans-serif",
                                    color: "#48BB78",
                                    fontSize: { xs: "10px", md: "12px" },
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    lineHeight: 1.1,
                                  }}
                                >
                                  {user.studySessions} sessions
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Typography
                      sx={{
                        fontFamily: "SourGummy, sans-serif",
                        fontSize: { xs: "14px", md: "16px" },
                        color: "#1D1D20",
                        textAlign: "center",
                        width: "100%",
                      }}
                    >
                      No study time data available yet. Start studying to climb the leaderboard!
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>

            {/* User Achievements */}
            <Grid item xs={12} md={6} sx={{ pl: { md: 1.5 }, pr: 0, position: "relative" }}>
              <Box
                sx={{
                  bgcolor: "#FFFFFF",
                  py: { xs: 2, md: 3 },
                  px: { xs: 2, md: 2 },
                  borderRadius: "24px",
                  boxShadow: "0 4px 20px rgba(29, 110, 241, 0.15)",
                  position: "relative",
                  overflow: "hidden",
                  height: "100%",
                  width: "100%",
                  [theme.breakpoints.down('sm')]: {
                    padding: '16px 8px', // Adjusted padding
                    mt: 2, // Add margin top on mobile to separate from brainiacs
                    // Center title and subtitle box
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }
                }}
              >
                <Box sx={{ 
                  display: "flex", 
                  flexDirection: 'column', // Stack title and subtitle
                  justifyContent: "center", // Center vertically
                  alignItems: { xs: "center", md: "flex-start" }, // Center horizontally on xs, left on md
                  mb: 2, 
                  position: "relative", 
                  zIndex: 1,
                  width: '100%', // Ensure box takes full width for centering
                  textAlign: { xs: 'center', md: 'left' }, // Center text on xs, left on md
                }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontFamily: "SourGummy, sans-serif",
                      fontWeight: 700,
                      fontSize: { xs: "24px", sm: "30px", md: "36px" },
                      color: "#1D1D20",
                    }}
                  >
                    Bubble Achievers
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "SourGummy, sans-serif",
                      color: "#555",
                      fontSize: { xs: "12px", md: "14px" },
                      // mb: 2, // Removed mb from here
                      position: "relative",
                      zIndex: 1,
                      textAlign: "center", // Ensure text is centered
                      pl: 0,
                       mt: 0.5, // Add slight top margin
                    }}
                  >
                    Remarkable feats across study categories.
                  </Typography>
                </Box>

                {loadingUserStats ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress sx={{ color: "#1D6EF1" }} />
                  </Box>
                ) : userStats.length === 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        textAlign: 'center', 
                        mb: 2,
                        fontFamily: "SourGummy, sans-serif",
                        color: "#1D1D20",
                        fontSize: { xs: "14px", md: "16px" },
                      }}
                    >
                      No user badges available yet.
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        textAlign: 'center',
                        fontFamily: "SourGummy, sans-serif",
                        color: "#1D1D20",
                        fontSize: { xs: "12px", md: "14px" }, 
                      }}
                    >
                      Start studying, answering quizzes, and collecting fish to earn badges!
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      maxHeight: "unset",
                      padding: 1,
                      paddingRight: 2,
                      width: '100%', // Ensure container takes full width
                       [theme.breakpoints.down('sm')]: {
                         // Shift cards slightly right
                         pl: 'calc(1rem + 5px)', // Add 5px to existing padding/margin
                         pr: 'calc(1rem - 5px)', // Adjust right padding if needed
                         boxSizing: 'border-box',
                       }
                      // Remove scrollbar styles
                    }}
                  >
                    {userStats.slice(0, 3).map((stat, index) => (
                      <Card
                        key={`${stat.id}-${index}`}
                        sx={{
                          width: "100%",
                          background: "#FFFFFF",
                          backdropFilter: "blur(10px)",
                          borderRadius: "16px",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 8px 20px rgba(29, 110, 241, 0.2)",
                          },
                          border: index < 3 ? `2px solid ${
                            index === 0 ? "#EF7B6C" : // Sea 3 from style guide
                            index === 1 ? "#5B8C5A" : // Sea 2 from style guide
                            "#1D6EF1"                 // Sea 1 from style guide
                          }` : "2px solid rgba(151, 199, 241, 0.5)",
                          overflow: "hidden",
                          position: "relative",
                          mb: 3,
                          height: { xs: "70px", md: "80px" },
                          display: "flex",
                          alignItems: "center",
                          [theme.breakpoints.down('sm')]: {
                            padding: '0 8px',
                          }
                        }}
                      >
                        {/* Badge Icon */}
                        <Box
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: { xs: "12px", md: "16px" },
                            transform: "translateY(-50%)",
                            width: { xs: "32px", md: "40px" },
                            height: { xs: "32px", md: "40px" },
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "transparent",
                            borderRadius: "50%",
                            color: "#FFFFFF",
                            fontSize: { xs: "16px", md: "18px" },
                            fontWeight: "bold",
                            fontFamily: "SourGummy, sans-serif",
                            zIndex: 2,
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              inset: 0,
                              borderRadius: "50%",
                              padding: "2px",
                              background: `linear-gradient(135deg, ${
                                index === 0 ? "#EF7B6C, #E9D0CE" : // Sea 3 & Sand 1 gradient
                                index === 1 ? "#5B8C5A, #9DDCB1" : // Sea 2 & Sea 5 gradient
                                index === 2 ? "#1D6EF1, #97C7F1" : // Sea 1 & Water 3 gradient
                                "#1D6EF1, #97C7F1"
                              })`,
                              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                              WebkitMaskComposite: "xor",
                              maskComposite: "exclude",
                            },
                            "&::after": {
                              content: '""',
                              position: "absolute",
                              inset: "2px",
                              borderRadius: "50%",
                              background: `linear-gradient(135deg, ${
                                index === 0 ? "#EF7B6C, #E9D0CE" : // Sea 3 & Sand 1 gradient
                                index === 1 ? "#5B8C5A, #9DDCB1" : // Sea 2 & Sea 5 gradient
                                index === 2 ? "#1D6EF1, #97C7F1" : // Sea 1 & Water 3 gradient
                                "#1D6EF1, #97C7F1"
                              })`,
                              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                            },
                          }}
                        >
                          <Box sx={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {getStatIcon(stat.statType)}
                          </Box>
                        </Box>

                        <CardContent sx={{ 
                          pt: 1, 
                          pb: 1, 
                          pl: { xs: '40px', md: 6 }, 
                          pr: { xs: 1, md: 2 },
                          width: "100%",
                          height: "100%",
                          display: "flex", 
                          flexDirection: "column", 
                          justifyContent: "center",
                          [theme.breakpoints.down('sm')]: {
                            padding: '0 8px', 
                            // Reduce mobile pl override
                            pl: '40px', 
                          }
                        }}>
                          {/* Remove gap for mobile */}
                          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0, md: 2 } }}> 
                            <Avatar
                              src={stat.avatar}
                              alt={stat.name}
                              sx={{
                                width: { xs: 40, md: 50 },
                                height: { xs: 40, md: 50 },
                                background: `linear-gradient(135deg, ${
                                  index === 0 ? "#EF7B6C, #E9D0CE" : // Sea 3 & Sand 1 gradient
                                  index === 1 ? "#5B8C5A, #9DDCB1" : // Sea 2 & Sea 5 gradient
                                  index === 2 ? "#1D6EF1, #97C7F1" : // Sea 1 & Water 3 gradient
                                  "#1D6EF1, #97C7F1"
                                })`,
                                border: "3px solid rgba(255, 255, 255, 0.8)",
                                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                                ml: { xs: 0, md: 1 },
                              }}
                            >
                              {stat.name?.charAt(0).toUpperCase() || "?"}
                            </Avatar>

                            {/* Apply negative margin on mobile */}
                            <Box sx={{ flexGrow: 1, position: "relative", marginLeft: { xs: '-2px', md: 0 } }}>
                              {/* Title and caption container */}
                              <Box sx={{ position: "relative" }}>
                                <Typography
                                  variant="h5"
                                  sx={{
                                    fontFamily: "SourGummy, sans-serif",
                                    fontWeight: 600,
                                    fontSize: { xs: "14px", md: "18px" },
                                    color: "#1D1D20",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    mb: 0.5,
                                    lineHeight: 1.2,
                                    textAlign: "center",
                                  }}
                                >
                                  {getStatTitle(stat.statType)}
                                </Typography>
                              </Box>
                                
                              {/* User name and stat value */}
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: { xs: 0.5, md: 1.5 } }}>
                                <Tooltip title={stat.name} placement="top" arrow>
                                  <Typography
                                    sx={{
                                      fontFamily: "SourGummy, sans-serif",
                                      color: "#1D1D20",
                                      fontWeight: 600,
                                      fontSize: { xs: "12px", md: "14px" },
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      lineHeight: 1.1,
                                      maxWidth: { xs: "80px", md: "140px" }, // Smaller max width on mobile
                                    }}
                                  >
                                    {truncateText(stat.name, isMobile ? 8 : 10)}
                                  </Typography>
                                </Tooltip>
                                <Typography
                                  sx={{
                                    fontFamily: "SourGummy, sans-serif",
                                    color: index === 0 ? "#EF7B6C" : // Sea 3 from style guide
                                           index === 1 ? "#5B8C5A" : // Sea 2 from style guide
                                           index === 2 ? "#1D6EF1" : // Sea 1 from style guide
                                           "#48BB78",
                                    fontSize: { xs: "10px", md: "12px" },
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    lineHeight: 1.1,
                                  }}
                                >
                                  {formatStatValue(stat.statType, stat.statValue)}
                                </Typography>
                              </Box>
                                
                              {/* Caption text positioned at the bottom and centered - hide on mobile */}
                              <Typography
                                sx={{
                                  position: "absolute",
                                  bottom: "2px",
                                  left: 0,
                                  right: 0,
                                  width: "100%",
                                  textAlign: "center",
                                  fontFamily: "SourGummy, sans-serif",
                                  color: "#555",
                                  fontSize: { xs: "8px", md: "10px" },
                                  lineHeight: 1,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  opacity: 0.9,
                                  display: { xs: "none", sm: "block" },
                                }}
                              >
                                {getStatCaption(stat.statType)}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* Active Users Section */}
          <Box
            sx={{
              mt: 6,
              mb: 6,
              bgcolor: "#FFFFFF",
              py: { xs: 3, md: 4 },
              px: { xs: 1, md: 2 }, // Ensure outer padding is 8px (1) on xs
              overflow: 'visible', // Keep overflow visible
              borderRadius: 2,
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              mx: { xs: 0, sm: 0, md: 0 },
              width: { xs: '100%', sm: '100%' },
              position: 'relative',
              [theme.breakpoints.down('sm')]: {
                margin: 0,
                width: '100%',
                borderRadius: 0,
                // Remove specific padding Left/Right, rely on px above
                paddingTop: '16px',
                paddingBottom: '16px',
                overflowX: 'visible',
                mt: 4,
                ml: 0,
                mr: 0,
              }
            }}
          >
            <Box sx={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              mb: 2,
              position: 'relative',
              zIndex: 2,
              mt: { xs: 0, sm: 0 },
              [theme.breakpoints.down('sm')]: {
                padding: '0 8px',
                mb: 3,
                // Center title on mobile
                flexDirection: 'column', // Stack title and arrows vertically
                alignItems: 'center', // Center items horizontally
              }
            }}>
              <Typography
                variant="h3"
                color="#1D1D20"
                sx={{
                  fontFamily: "SourGummy, sans-serif",
                  fontWeight: 700,
                  fontSize: { xs: "24px", sm: "30px", md: "36px" },
                  [theme.breakpoints.down('sm')]: {
                    mt: 1,
                    ml: 1,
                    // Ensure title is centered when stacked
                    textAlign: 'center',
                    width: '100%', // Take full width for centering
                    mb: 1, // Add margin below title on mobile
                  }
                }}
              >
                Active Users
              </Typography>
              <Box sx={{ 
                display: "flex", 
                gap: 1,
                [theme.breakpoints.down('sm')]: {
                  position: 'relative',
                  right: '0', // Reset right positioning if needed
                  top: 0,
                   // Shift arrows slightly left by reducing gap or adding negative margin
                   marginLeft: '-5px', // Example shift
                }
              }}>
                <Button
                  onClick={() => scrollCarousel(usersRef, "left")}
                  sx={{
                    minWidth: { xs: "32px", md: "40px" },
                    height: { xs: "32px", md: "40px" },
                    borderRadius: "50%",
                    bgcolor: "#EF7B6C",
                    color: "white",
                    "&:hover": { bgcolor: "#e66a59" },
                    p: { xs: 0.5, md: 1 },

                  }}
                >

                  <ChevronLeft size={isMobile ? 16 : 24} />
                </Button>
                <Button
                  onClick={() => scrollCarousel(usersRef, "right")}
                  sx={{
                    minWidth: { xs: "32px", md: "40px" },
                    height: { xs: "32px", md: "40px" },
                    borderRadius: "50%",
                    bgcolor: "#EF7B6C",
                    color: "white",
                    "&:hover": { bgcolor: "#e66a59" },
                    p: { xs: 0.5, md: 1 },
                  }}
                >
                  <ChevronRight size={isMobile ? 16 : 24} />
                </Button>
              </Box>
            </Box>

            <Box
              ref={usersRef}
              sx={{
                display: "flex",
                overflowX: "auto",
                gap: { xs: 1, md: 2 },
                pb: 2,
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
                msOverflowStyle: "none",
                minHeight: { xs: "130px", md: "150px" },
                px: { xs: 0, md: 0 }, // Set inner padding to 0 on xs
                width: '100%',
                scrollSnapType: 'x mandatory',
                boxSizing: 'border-box', // Keep box-sizing
                [theme.breakpoints.down('sm')]: {
                  paddingLeft: 0, // Ensure inner padding is 0
                  paddingRight: 0, // Ensure inner padding is 0
                  mt: 1,
                }
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
                      minWidth: { xs: 'calc(50% - 4px)', sm: 240, md: 280 }, // Keep precise calculation
                      maxWidth: { xs: 'calc(50% - 4px)', sm: 240, md: 280 }, // Keep precise calculation
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
                      p: { xs: 1, md: 2 },
                      position: "relative",
                      border: user.isCurrentUser ? "2px solid #1D6EF1" : "1px solid #e0e0e0",
                      scrollSnapAlign: 'start',
                      boxSizing: 'border-box',
                      mx: { xs: '1px', sm: 0 }, // Add small horizontal margin on xs
                    }}
                    onClick={() => handleUserClick(user.id)}
                  >
                    <Box sx={{ position: "relative" }}>
                      <Avatar
                        src={user.avatar}
                        alt={user.name}
                        sx={{
                          width: { xs: 40, sm: 50, md: 60 },
                          height: { xs: 40, sm: 50, md: 60 },
                          bgcolor: "#1D6EF1",
                          mr: { xs: 1, md: 2 },
                          border: user.isCurrentUser ? "2px solid #EF7B6C" : "none",
                          color: "white",
                          fontSize: { xs: "1.2rem", md: "1.5rem" },
                        }}
                      >
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </Avatar>
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          right: { xs: 4, md: 8 },
                          width: { xs: 8, md: 12 },
                          height: { xs: 8, md: 12 },
                          borderRadius: "50%",
                          bgcolor: user.status === "online" ? "#4CAF50" : "#9e9e9e",
                          border: "2px solid white",
                        }}
                      />
                    </Box>
                    <Box sx={{ overflow: "hidden" }}>
                      <Tooltip title={user.name + (user.isCurrentUser ? " (You)" : "")} placement="top" arrow>
                        <Typography
                          variant="h6"
                          color="#1D1D20"
                          sx={{
                            fontFamily: "SourGummy, sans-serif",
                            fontWeight: 600,
                            fontSize: { xs: "14px", sm: "16px", md: "18px" },
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {truncateText(user.name, isMobile ? 8 : 10)} {user.isCurrentUser && "(You)"}
                        </Typography>
                      </Tooltip>
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
                      <Tooltip title={user.email} placement="top" arrow>
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
                          {truncateText(user.email, 20)}
                        </Typography>
                      </Tooltip>
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
                    No users active in the last 30 minutes. Be the first to engage with the community!
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Container>
      </Box>
      <Snackbar open={streakPopup.open} autoHideDuration={5000} onClose={() => setStreakPopup({ ...streakPopup, open: false })} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={() => setStreakPopup({ ...streakPopup, open: false })} severity="success" variant="filled" sx={{ fontWeight: 600 }}>
          {streakPopup.message}
        </Alert>
      </Snackbar>
    </>
  )
  
}

export default HomePage

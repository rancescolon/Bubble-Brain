

// "use client"

// import { useEffect, useState } from "react"
// import { Link, useNavigate } from "react-router-dom"
// import { AppBar, Toolbar, Typography, Button, Card, CardContent, CardMedia, Grid, Container, Box } from "@mui/material"
// import fish1 from "../assets/fish1.png"
// import fish2 from "../assets/fish2.png"
// import fish3 from "../assets/fish3.png"
// import logo from "../assets/Frame.png"
// import background from "../assets/image3.png"
// import DrBubbles from "./DrBubbles"

// const HomePage = () => {
//   const [isLoggedIn, setIsLoggedIn] = useState(false)
//   const navigate = useNavigate()
//   const [showGuide, setShowGuide] = useState(true)

//   useEffect(() => {
//     const token = sessionStorage.getItem("token")
//     setIsLoggedIn(!!token)
//   }, [])

//   const handleLogout = () => {
//     sessionStorage.removeItem("token")
//     sessionStorage.removeItem("user")
//     setIsLoggedIn(false)
//   }

//   const featuredContent = [
//     {
//       title: "Marine Biology 101",
//       description: "Learn the basics of marine life with our interactive course.",
//       image: fish1,
//     },
//     {
//       title: "Oceanic History Quiz",
//       description: "Test your knowledge of the ocean's past with fun and challenging quizzes.",
//       image: fish2,
//     },
//     {
//       title: "Underwater Challenges",
//       description: "Complete challenges and earn rewards as you learn more about the ocean.",
//       image: fish3,
//     },
//   ]

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
//               src={logo || "/placeholder.svg"}
//               alt="Bubble Brain Logo"
//               style={{ height: 80, width: 80, marginRight: 8 }}
//             />
//             <Typography
//               variant="h6"
//               component="div"
//               sx={{
//                 fontFamily: "SourGummy, sans-serif",
//                 fontWeight: 800,
//                 fontSize: "52px",
//                 color: "#F4FDFF",
//               }}
//             >
//               Bubble Brain
//             </Typography>
//           </Box>
//           <Box sx={{ display: { xs: "none", md: "block" } }}>
//             {["Home", "Courses", "Quizzes", "Contact"].map((item) => (
//               <Button
//                 key={item}
//                 id={`nav-${item.toLowerCase()}`}
//                 color="inherit"
//                 component={Link}
//                 to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
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
//                 {item}
//               </Button>
//             ))}
//           </Box>
//         </Toolbar>
//       </AppBar>

//       {showGuide && <DrBubbles onClose={() => setShowGuide(false)} />}

//       <Container>
//         <Box
//           sx={{
//             bgcolor: "#FFFFFF",
//             py: 8,
//             px: 2,
//             mt: 2,
//             borderRadius: 2,
//             boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
//           }}
//         >
//           <Typography
//             variant="h2"
//             align="center"
//             color="#1D1D20"
//             gutterBottom
//             sx={{
//               fontFamily: "SourGummy, sans-serif",
//               fontWeight: 800,
//               fontSize: "52px",
//             }}
//           >
//             Dive into Learning
//           </Typography>
//           <Typography
//             variant="h5"
//             align="center"
//             color="#1D1D20"
//             paragraph
//             sx={{
//               fontFamily: "SourGummy, sans-serif",
//               fontWeight: 600,
//               fontSize: "26px",
//             }}
//           >
//             Explore our gamified courses and quizzes designed to make learning fun and engaging.
//           </Typography>
//           <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
//             <Button
//               variant="contained"
//               component={Link}
//               to="/courses"
//               size="large"
//               sx={{
//                 bgcolor: "#EF7B6C",
//                 "&:hover": {
//                   bgcolor: "#e66a59",
//                 },
//                 fontFamily: "SourGummy, sans-serif",
//                 fontWeight: 600,
//                 fontSize: "32px",
//                 color: "#F4FDFF",
//                 px: 4,
//                 py: 1,
//                 borderRadius: 2,
//                 boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
//               }}
//             >
//               Get Started
//             </Button>
//           </Box>
//         </Box>

//         <Grid container spacing={4} sx={{ mt: 4 }}>
//           {featuredContent.map((item, index) => (
//             <Grid item key={index} xs={12} sm={6} md={4}>
//               <Card
//                 sx={{
//                   height: "100%",
//                   display: "flex",
//                   flexDirection: "column",
//                   bgcolor: "#FFFFFF",
//                   borderRadius: 2,
//                   transition: "transform 0.2s, box-shadow 0.2s",
//                   "&:hover": {
//                     transform: "translateY(-4px)",
//                     boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
//                   },
//                 }}
//               >
//                 <CardMedia
//                   component="img"
//                   sx={{ height: 140, objectFit: "contain", pt: 2 }}
//                   image={item.image}
//                   alt={item.title}
//                 />
//                 <CardContent sx={{ flexGrow: 1 }}>
//                   <Typography
//                     gutterBottom
//                     variant="h5"
//                     component="h2"
//                     color="#1D1D20"
//                     sx={{
//                       fontFamily: "SourGummy, sans-serif",
//                       fontWeight: 600,
//                       fontSize: "26px",
//                     }}
//                   >
//                     {item.title}
//                   </Typography>
//                   <Typography
//                     color="#1D1D20"
//                     sx={{
//                       fontFamily: "SourGummy, sans-serif",
//                       fontWeight: 500,
//                       fontSize: "16px",
//                     }}
//                   >
//                     {item.description}
//                   </Typography>
//                 </CardContent>
//               </Card>
//             </Grid>
//           ))}
//         </Grid>
//       </Container>
//     </Box>
//   )
// }

// export default HomePage

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
  Grid,
  Container,
  Box,
  Avatar,
  CircularProgress,
} from "@mui/material"
import fish1 from "../assets/fish1.png"
import fish2 from "../assets/fish2.png"
import fish3 from "../assets/fish3.png"
import logo from "../assets/Frame.png"
import background from "../assets/image3.png"
import DrBubbles from "./DrBubbles"
import BubbleTrapAnimation from "./BubbleTrapAnimation"
import { ChevronLeft, ChevronRight } from "lucide-react"

const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()
  const [showGuide, setShowGuide] = useState(true)
  const [latestCommunities, setLatestCommunities] = useState([])
  const [latestCourses, setLatestCourses] = useState([])
  const [activeUsers, setActiveUsers] = useState([])
  const [loadingCommunities, setLoadingCommunities] = useState(true)
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)

  // Refs for carousel scrolling
  const communitiesRef = useRef(null)
  const coursesRef = useRef(null)
  const usersRef = useRef(null)

  useEffect(() => {
    const token = sessionStorage.getItem("token")
    setIsLoggedIn(!!token)

    if (token) {
      fetchLatestCommunities()
      fetchLatestCourses()
      fetchActiveUsers()
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
          const courses = result[0].map((post) => ({
            id: post.id,
            title: post.title || "Course",
            description: post.content || "No description available",
            students: post._count?.children || 0,
            image: post.thumbnailURL || getRandomImage(),
            authorId: post.authorID,
          }))
          setLatestCourses(courses)
        }
        setLoadingCourses(false)
      })
      .catch((error) => {
        console.error("Error fetching courses:", error)
        setLoadingCourses(false)
      })
  }

  const fetchActiveUsers = () => {
    setLoadingUsers(true)
    const token = sessionStorage.getItem("token")

    if (!token) {
      setLoadingUsers(false)
      return
    }

    fetch(`${process.env.REACT_APP_API_PATH}/users?limit=10`, {
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
          const users = result[0].map((user) => ({
            id: user.id,
            name: user.attributes?.username || user.email?.split("@")[0] || "User",
            activity: "Active user",
            avatar: user.attributes?.profilePicture || null,
            email: user.email,
          }))
          setActiveUsers(users)
        }
        setLoadingUsers(false)
      })
      .catch((error) => {
        console.error("Error fetching users:", error)
        setLoadingUsers(false)
      })
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

  // const featuredContent = [
  //   {
  //     title: "Marine Biology 101",
  //     description: "Learn the basics of marine life with our interactive course.",
  //     image: fish1,
  //   },
  //   {
  //     title: "Oceanic History Quiz",
  //     description: "Test your knowledge of the ocean's past with fun and challenging quizzes.",
  //     image: fish2,
  //   },
  //   {
  //     title: "Underwater Challenges",
  //     description: "Complete challenges and earn rewards as you learn more about the ocean.",
  //     image: fish3,
  //   },
  // ]

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

        {/* Featured Content Section */}
        {/* <Box
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
          <Typography
            variant="h3"
            color="#1D1D20"
            gutterBottom
            sx={{
              fontFamily: "SourGummy, sans-serif",
              fontWeight: 700,
              fontSize: "36px",
              textAlign: "center",
            }}
          >
            Featured Content
          </Typography>
          <Grid container spacing={4}>
            {featuredContent.map((item, index) => (
              <Grid item key={index} xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    bgcolor: "#FFFFFF",
                    borderRadius: 2,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    sx={{ height: 140, objectFit: "contain", pt: 2 }}
                    image={item.image}
                    alt={item.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      gutterBottom
                      variant="h5"
                      component="h2"
                      color="#1D1D20"
                      sx={{
                        fontFamily: "SourGummy, sans-serif",
                        fontWeight: 600,
                        fontSize: "26px",
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      color="#1D1D20"
                      sx={{
                        fontFamily: "SourGummy, sans-serif",
                        fontWeight: 500,
                        fontSize: "16px",
                      }}
                    >
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box> */}

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
                    alt={course.title}
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
                      {course.title}
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
                      {course.description}
                    </Typography>
                    <Typography
                      color="#1D6EF1"
                      sx={{
                        fontFamily: "SourGummy, sans-serif",
                        fontWeight: 600,
                        fontSize: "14px",
                      }}
                    >
                      {course.students} students enrolled
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
                  No courses found. Check back soon for new content!
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button
              component={Link}
              to="/courses"
              sx={{
                fontFamily: "SourGummy, sans-serif",
                fontWeight: 600,
                color: "#1D6EF1",
              }}
            >
              View All Courses
            </Button>
          </Box>
        </Box>

        {/* Active Users Carousel */}
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
              minHeight: "100px",
            }}
          >
            {loadingUsers ? (
              <Box sx={{ display: "flex", justifyContent: "center", width: "100%", alignItems: "center" }}>
                <CircularProgress sx={{ color: "#1D6EF1" }} />
              </Box>
            ) : activeUsers.length > 0 ? (
              activeUsers.map((user) => (
                <Card
                  key={user.id}
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
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    p: 2,
                  }}
                  onClick={() => handleUserClick(user.id)}
                >
                  <Avatar
                    src={user.avatar}
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: "#1D6EF1",
                      mr: 2,
                    }}
                  >
                    {user.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h6"
                      color="#1D1D20"
                      sx={{
                        fontFamily: "SourGummy, sans-serif",
                        fontWeight: 600,
                        fontSize: "18px",
                      }}
                    >
                      {user.name}
                    </Typography>
                    <Typography
                      color="#1D1D20"
                      sx={{
                        fontFamily: "SourGummy, sans-serif",
                        fontWeight: 500,
                        fontSize: "14px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {user.activity}
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


// "use client"

// import { useEffect, useState, useRef } from "react"
// import { Link, useNavigate } from "react-router-dom"
// import {
//   AppBar,
//   Toolbar,
//   Typography,
//   Button,
//   Card,
//   CardContent,
//   CardMedia,
//   Grid,
//   Container,
//   Box,
//   Avatar,
//   CircularProgress,
// } from "@mui/material"
// import fish1 from "../assets/fish1.png"
// import fish2 from "../assets/fish2.png"
// import fish3 from "../assets/fish3.png"
// import logo from "../assets/Frame.png"
// import background from "../assets/image3.png"
// import DrBubbles from "./DrBubbles"
// import { ChevronLeft, ChevronRight } from "lucide-react"

// const HomePage = () => {
//   const [isLoggedIn, setIsLoggedIn] = useState(false)
//   const navigate = useNavigate()
//   const [showGuide, setShowGuide] = useState(true)
//   const [latestCommunities, setLatestCommunities] = useState([])
//   const [latestCourses, setLatestCourses] = useState([])
//   const [activeUsers, setActiveUsers] = useState([])
//   const [loadingCommunities, setLoadingCommunities] = useState(true)
//   const [loadingCourses, setLoadingCourses] = useState(true)
//   const [loadingUsers, setLoadingUsers] = useState(true)

//   // Refs for carousel scrolling
//   const communitiesRef = useRef(null)
//   const coursesRef = useRef(null)
//   const usersRef = useRef(null)

//   useEffect(() => {
//     const token = sessionStorage.getItem("token")
//     setIsLoggedIn(!!token)

//     if (token) {
//       fetchLatestCommunities()
//       fetchLatestCourses()
//       fetchActiveUsers()
//     }
//   }, [])

//   const fetchLatestCommunities = () => {
//     setLoadingCommunities(true)
//     const token = sessionStorage.getItem("token")

//     if (!token) {
//       setLoadingCommunities(false)
//       return
//     }

//     fetch(`${process.env.REACT_APP_API_PATH}/groups?limit=10`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     })
//       .then((res) => {
//         if (!res.ok) {
//           throw new Error(`HTTP error! status: ${res.status}`)
//         }
//         return res.json()
//       })
//       .then((result) => {
//         if (result && result[0]) {
//           const communities = result[0].map((group) => ({
//             id: group.id,
//             name: group.name || "Community",
//             description: group.description || "No description available",
//             members: group.members?.length || 0,
//             image: group.thumbnailURL || getRandomImage(),
//             authorId: group.ownerID,
//           }))
//           setLatestCommunities(communities)
//         }
//         setLoadingCommunities(false)
//       })
//       .catch((error) => {
//         console.error("Error fetching communities:", error)
//         setLoadingCommunities(false)
//       })
//   }

//   const fetchLatestCourses = () => {
//     setLoadingCourses(true)
//     const token = sessionStorage.getItem("token")

//     if (!token) {
//       setLoadingCourses(false)
//       return
//     }

//     fetch(`${process.env.REACT_APP_API_PATH}/posts?type=course&limit=10`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     })
//       .then((res) => {
//         if (!res.ok) {
//           throw new Error(`HTTP error! status: ${res.status}`)
//         }
//         return res.json()
//       })
//       .then((result) => {
//         if (result && result[0]) {
//           const courses = result[0].map((post) => ({
//             id: post.id,
//             title: post.title || "Course",
//             description: post.content || "No description available",
//             students: post._count?.children || 0,
//             image: post.thumbnailURL || getRandomImage(),
//             authorId: post.authorID,
//           }))
//           setLatestCourses(courses)
//         }
//         setLoadingCourses(false)
//       })
//       .catch((error) => {
//         console.error("Error fetching courses:", error)
//         setLoadingCourses(false)
//       })
//   }

//   const fetchActiveUsers = () => {
//     setLoadingUsers(true)
//     const token = sessionStorage.getItem("token")

//     if (!token) {
//       setLoadingUsers(false)
//       return
//     }

//     fetch(`${process.env.REACT_APP_API_PATH}/users?limit=10`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     })
//       .then((res) => {
//         if (!res.ok) {
//           throw new Error(`HTTP error! status: ${res.status}`)
//         }
//         return res.json()
//       })
//       .then((result) => {
//         if (result && result[0]) {
//           const users = result[0].map((user) => ({
//             id: user.id,
//             name: user.attributes?.username || user.email?.split("@")[0] || "User",
//             activity: "Active user",
//             avatar: user.attributes?.profilePicture || null,
//             email: user.email,
//           }))
//           setActiveUsers(users)
//         }
//         setLoadingUsers(false)
//       })
//       .catch((error) => {
//         console.error("Error fetching users:", error)
//         setLoadingUsers(false)
//       })
//   }

//   // Helper function to get a random image when thumbnailURL is not available
//   const getRandomImage = () => {
//     const images = [fish1, fish2, fish3]
//     return images[Math.floor(Math.random() * images.length)]
//   }

//   const handleLogout = () => {
//     sessionStorage.removeItem("token")
//     sessionStorage.removeItem("user")
//     setIsLoggedIn(false)
//   }

//   const scrollCarousel = (ref, direction) => {
//     if (ref.current) {
//       const scrollAmount = direction === "left" ? -300 : 300
//       ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
//     }
//   }

//   const handleCommunityClick = (communityId) => {
//     navigate(`/community/${communityId}`)
//   }

//   const handleCourseClick = (courseId) => {
//     navigate(`/courses/${courseId}`)
//   }

//   const handleUserClick = (userId) => {
//     navigate(`/profile/${userId}`)
//   }

//   const featuredContent = [
//     {
//       title: "Marine Biology 101",
//       description: "Learn the basics of marine life with our interactive course.",
//       image: fish1,
//     },
//     {
//       title: "Oceanic History Quiz",
//       description: "Test your knowledge of the ocean's past with fun and challenging quizzes.",
//       image: fish2,
//     },
//     {
//       title: "Underwater Challenges",
//       description: "Complete challenges and earn rewards as you learn more about the ocean.",
//       image: fish3,
//     },
//   ]

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
//               src={logo || "/placeholder.svg"}
//               alt="Bubble Brain Logo"
//               style={{ height: 80, width: 80, marginRight: 8 }}
//             />
//             <Typography
//               variant="h6"
//               component="div"
//               sx={{
//                 fontFamily: "SourGummy, sans-serif",
//                 fontWeight: 800,
//                 fontSize: "52px",
//                 color: "#F4FDFF",
//               }}
//             >
//               Bubble Brain
//             </Typography>
//           </Box>
//           <Box sx={{ display: { xs: "none", md: "block" } }}>
//             {["Home", "Courses", "Quizzes", "Contact"].map((item) => (
//               <Button
//                 key={item}
//                 id={`nav-${item.toLowerCase()}`}
//                 color="inherit"
//                 component={Link}
//                 to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
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
//                 {item}
//               </Button>
//             ))}
//           </Box>
//         </Toolbar>
//       </AppBar>

//       {showGuide && <DrBubbles onClose={() => setShowGuide(false)} />}

//       <Container>
//         <Box
//           sx={{
//             bgcolor: "#FFFFFF",
//             py: 8,
//             px: 2,
//             mt: 2,
//             borderRadius: 2,
//             boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
//           }}
//         >
//           <Typography
//             variant="h2"
//             align="center"
//             color="#1D1D20"
//             gutterBottom
//             sx={{
//               fontFamily: "SourGummy, sans-serif",
//               fontWeight: 800,
//               fontSize: "52px",
//             }}
//           >
//             Dive into Learning
//           </Typography>
//           <Typography
//             variant="h5"
//             align="center"
//             color="#1D1D20"
//             paragraph
//             sx={{
//               fontFamily: "SourGummy, sans-serif",
//               fontWeight: 600,
//               fontSize: "26px",
//             }}
//           >
//             Explore our gamified courses and quizzes designed to make learning fun and engaging.
//           </Typography>
//           <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
//             <Button
//               variant="contained"
//               component={Link}
//               to="/courses"
//               size="large"
//               sx={{
//                 bgcolor: "#EF7B6C",
//                 "&:hover": {
//                   bgcolor: "#e66a59",
//                 },
//                 fontFamily: "SourGummy, sans-serif",
//                 fontWeight: 600,
//                 fontSize: "32px",
//                 color: "#F4FDFF",
//                 px: 4,
//                 py: 1,
//                 borderRadius: 2,
//                 boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
//               }}
//             >
//               Get Started
//             </Button>
//           </Box>
//         </Box>

//         {/* Featured Content Section */}
//         <Box
//           sx={{
//             mt: 6,
//             mb: 6,
//             bgcolor: "#FFFFFF",
//             py: 4,
//             px: 2,
//             borderRadius: 2,
//             boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
//           }}
//         >
//           <Typography
//             variant="h3"
//             color="#1D1D20"
//             gutterBottom
//             sx={{
//               fontFamily: "SourGummy, sans-serif",
//               fontWeight: 700,
//               fontSize: "36px",
//               textAlign: "center",
//             }}
//           >
//             Featured Content
//           </Typography>
//           <Grid container spacing={4}>
//             {featuredContent.map((item, index) => (
//               <Grid item key={index} xs={12} sm={6} md={4}>
//                 <Card
//                   sx={{
//                     height: "100%",
//                     display: "flex",
//                     flexDirection: "column",
//                     bgcolor: "#FFFFFF",
//                     borderRadius: 2,
//                     transition: "transform 0.2s, box-shadow 0.2s",
//                     "&:hover": {
//                       transform: "translateY(-4px)",
//                       boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
//                     },
//                   }}
//                 >
//                   <CardMedia
//                     component="img"
//                     sx={{ height: 140, objectFit: "contain", pt: 2 }}
//                     image={item.image}
//                     alt={item.title}
//                   />
//                   <CardContent sx={{ flexGrow: 1 }}>
//                     <Typography
//                       gutterBottom
//                       variant="h5"
//                       component="h2"
//                       color="#1D1D20"
//                       sx={{
//                         fontFamily: "SourGummy, sans-serif",
//                         fontWeight: 600,
//                         fontSize: "26px",
//                       }}
//                     >
//                       {item.title}
//                     </Typography>
//                     <Typography
//                       color="#1D1D20"
//                       sx={{
//                         fontFamily: "SourGummy, sans-serif",
//                         fontWeight: 500,
//                         fontSize: "16px",
//                       }}
//                     >
//                       {item.description}
//                     </Typography>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             ))}
//           </Grid>
//         </Box>

//         {/* Latest Communities Carousel */}
//         <Box
//           sx={{
//             mt: 6,
//             mb: 6,
//             bgcolor: "#FFFFFF",
//             py: 4,
//             px: 2,
//             borderRadius: 2,
//             boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
//           }}
//         >
//           <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
//             <Typography
//               variant="h3"
//               color="#1D1D20"
//               sx={{
//                 fontFamily: "SourGummy, sans-serif",
//                 fontWeight: 700,
//                 fontSize: "36px",
//               }}
//             >
//               Latest Communities
//             </Typography>
//             <Box sx={{ display: "flex", gap: 1 }}>
//               <Button
//                 onClick={() => scrollCarousel(communitiesRef, "left")}
//                 sx={{
//                   minWidth: "40px",
//                   height: "40px",
//                   borderRadius: "50%",
//                   bgcolor: "#EF7B6C",
//                   color: "white",
//                   "&:hover": { bgcolor: "#e66a59" },
//                 }}
//               >
//                 <ChevronLeft />
//               </Button>
//               <Button
//                 onClick={() => scrollCarousel(communitiesRef, "right")}
//                 sx={{
//                   minWidth: "40px",
//                   height: "40px",
//                   borderRadius: "50%",
//                   bgcolor: "#EF7B6C",
//                   color: "white",
//                   "&:hover": { bgcolor: "#e66a59" },
//                 }}
//               >
//                 <ChevronRight />
//               </Button>
//             </Box>
//           </Box>

//           <Box
//             ref={communitiesRef}
//             sx={{
//               display: "flex",
//               overflowX: "auto",
//               gap: 2,
//               pb: 2,
//               scrollbarWidth: "none",
//               "&::-webkit-scrollbar": { display: "none" },
//               msOverflowStyle: "none",
//               minHeight: "280px",
//             }}
//           >
//             {loadingCommunities ? (
//               <Box sx={{ display: "flex", justifyContent: "center", width: "100%", alignItems: "center" }}>
//                 <CircularProgress sx={{ color: "#1D6EF1" }} />
//               </Box>
//             ) : latestCommunities.length > 0 ? (
//               latestCommunities.map((community) => (
//                 <Card
//                   key={community.id}
//                   sx={{
//                     minWidth: 280,
//                     maxWidth: 280,
//                     bgcolor: "#FFFFFF",
//                     borderRadius: 2,
//                     transition: "transform 0.2s, box-shadow 0.2s",
//                     "&:hover": {
//                       transform: "translateY(-4px)",
//                       boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
//                       cursor: "pointer",
//                     },
//                     flex: "0 0 auto",
//                   }}
//                   onClick={() => handleCommunityClick(community.id)}
//                 >
//                   <CardMedia
//                     component="img"
//                     sx={{ height: 140, objectFit: "contain", pt: 2 }}
//                     image={community.image}
//                     alt={community.name}
//                   />
//                   <CardContent>
//                     <Typography
//                       gutterBottom
//                       variant="h5"
//                       component="h2"
//                       color="#1D1D20"
//                       sx={{
//                         fontFamily: "SourGummy, sans-serif",
//                         fontWeight: 600,
//                         fontSize: "22px",
//                       }}
//                     >
//                       {community.name}
//                     </Typography>
//                     <Typography
//                       color="#1D1D20"
//                       sx={{
//                         fontFamily: "SourGummy, sans-serif",
//                         fontWeight: 500,
//                         fontSize: "14px",
//                         mb: 1,
//                         height: "60px",
//                         overflow: "hidden",
//                         textOverflow: "ellipsis",
//                         display: "-webkit-box",
//                         WebkitLineClamp: 3,
//                         WebkitBoxOrient: "vertical",
//                       }}
//                     >
//                       {community.description}
//                     </Typography>
//                     <Typography
//                       color="#1D6EF1"
//                       sx={{
//                         fontFamily: "SourGummy, sans-serif",
//                         fontWeight: 600,
//                         fontSize: "14px",
//                       }}
//                     >
//                       {community.members} members
//                     </Typography>
//                   </CardContent>
//                 </Card>
//               ))
//             ) : (
//               <Box sx={{ display: "flex", justifyContent: "center", width: "100%", alignItems: "center" }}>
//                 <Typography
//                   color="#1D1D20"
//                   sx={{
//                     fontFamily: "SourGummy, sans-serif",
//                     fontWeight: 500,
//                     fontSize: "16px",
//                   }}
//                 >
//                   No communities found. Create one to get started!
//                 </Typography>
//               </Box>
//             )}
//           </Box>
//           <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
//             <Button
//               component={Link}
//               to="/community"
//               sx={{
//                 fontFamily: "SourGummy, sans-serif",
//                 fontWeight: 600,
//                 color: "#1D6EF1",
//               }}
//             >
//               View All Communities
//             </Button>
//           </Box>
//         </Box>

//         {/* Latest Courses Carousel */}
//         <Box
//           sx={{
//             mt: 6,
//             mb: 6,
//             bgcolor: "#FFFFFF",
//             py: 4,
//             px: 2,
//             borderRadius: 2,
//             boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
//           }}
//         >
//           <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
//             <Typography
//               variant="h3"
//               color="#1D1D20"
//               sx={{
//                 fontFamily: "SourGummy, sans-serif",
//                 fontWeight: 700,
//                 fontSize: "36px",
//               }}
//             >
//               Latest Courses
//             </Typography>
//             <Box sx={{ display: "flex", gap: 1 }}>
//               <Button
//                 onClick={() => scrollCarousel(coursesRef, "left")}
//                 sx={{
//                   minWidth: "40px",
//                   height: "40px",
//                   borderRadius: "50%",
//                   bgcolor: "#EF7B6C",
//                   color: "white",
//                   "&:hover": { bgcolor: "#e66a59" },
//                 }}
//               >
//                 <ChevronLeft />
//               </Button>
//               <Button
//                 onClick={() => scrollCarousel(coursesRef, "right")}
//                 sx={{
//                   minWidth: "40px",
//                   height: "40px",
//                   borderRadius: "50%",
//                   bgcolor: "#EF7B6C",
//                   color: "white",
//                   "&:hover": { bgcolor: "#e66a59" },
//                 }}
//               >
//                 <ChevronRight />
//               </Button>
//             </Box>
//           </Box>

//           <Box
//             ref={coursesRef}
//             sx={{
//               display: "flex",
//               overflowX: "auto",
//               gap: 2,
//               pb: 2,
//               scrollbarWidth: "none",
//               "&::-webkit-scrollbar": { display: "none" },
//               msOverflowStyle: "none",
//               minHeight: "280px",
//             }}
//           >
//             {loadingCourses ? (
//               <Box sx={{ display: "flex", justifyContent: "center", width: "100%", alignItems: "center" }}>
//                 <CircularProgress sx={{ color: "#1D6EF1" }} />
//               </Box>
//             ) : latestCourses.length > 0 ? (
//               latestCourses.map((course) => (
//                 <Card
//                   key={course.id}
//                   sx={{
//                     minWidth: 280,
//                     maxWidth: 280,
//                     bgcolor: "#FFFFFF",
//                     borderRadius: 2,
//                     transition: "transform 0.2s, box-shadow 0.2s",
//                     "&:hover": {
//                       transform: "translateY(-4px)",
//                       boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
//                       cursor: "pointer",
//                     },
//                     flex: "0 0 auto",
//                   }}
//                   onClick={() => handleCourseClick(course.id)}
//                 >
//                   <CardMedia
//                     component="img"
//                     sx={{ height: 140, objectFit: "contain", pt: 2 }}
//                     image={course.image}
//                     alt={course.title}
//                   />
//                   <CardContent>
//                     <Typography
//                       gutterBottom
//                       variant="h5"
//                       component="h2"
//                       color="#1D1D20"
//                       sx={{
//                         fontFamily: "SourGummy, sans-serif",
//                         fontWeight: 600,
//                         fontSize: "22px",
//                       }}
//                     >
//                       {course.title}
//                     </Typography>
//                     <Typography
//                       color="#1D1D20"
//                       sx={{
//                         fontFamily: "SourGummy, sans-serif",
//                         fontWeight: 500,
//                         fontSize: "14px",
//                         mb: 1,
//                         height: "60px",
//                         overflow: "hidden",
//                         textOverflow: "ellipsis",
//                         display: "-webkit-box",
//                         WebkitLineClamp: 3,
//                         WebkitBoxOrient: "vertical",
//                       }}
//                     >
//                       {course.description}
//                     </Typography>
//                     <Typography
//                       color="#1D6EF1"
//                       sx={{
//                         fontFamily: "SourGummy, sans-serif",
//                         fontWeight: 600,
//                         fontSize: "14px",
//                       }}
//                     >
//                       {course.students} students enrolled
//                     </Typography>
//                   </CardContent>
//                 </Card>
//               ))
//             ) : (
//               <Box sx={{ display: "flex", justifyContent: "center", width: "100%", alignItems: "center" }}>
//                 <Typography
//                   color="#1D1D20"
//                   sx={{
//                     fontFamily: "SourGummy, sans-serif",
//                     fontWeight: 500,
//                     fontSize: "16px",
//                   }}
//                 >
//                   No courses found. Check back soon for new content!
//                 </Typography>
//               </Box>
//             )}
//           </Box>
//           <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
//             <Button
//               component={Link}
//               to="/courses"
//               sx={{
//                 fontFamily: "SourGummy, sans-serif",
//                 fontWeight: 600,
//                 color: "#1D6EF1",
//               }}
//             >
//               View All Courses
//             </Button>
//           </Box>
//         </Box>

//         {/* Active Users Carousel */}
//         <Box
//           sx={{
//             mt: 6,
//             mb: 6,
//             bgcolor: "#FFFFFF",
//             py: 4,
//             px: 2,
//             borderRadius: 2,
//             boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
//           }}
//         >
//           <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
//             <Typography
//               variant="h3"
//               color="#1D1D20"
//               sx={{
//                 fontFamily: "SourGummy, sans-serif",
//                 fontWeight: 700,
//                 fontSize: "36px",
//               }}
//             >
//               Active Users
//             </Typography>
//             <Box sx={{ display: "flex", gap: 1 }}>
//               <Button
//                 onClick={() => scrollCarousel(usersRef, "left")}
//                 sx={{
//                   minWidth: "40px",
//                   height: "40px",
//                   borderRadius: "50%",
//                   bgcolor: "#EF7B6C",
//                   color: "white",
//                   "&:hover": { bgcolor: "#e66a59" },
//                 }}
//               >
//                 <ChevronLeft />
//               </Button>
//               <Button
//                 onClick={() => scrollCarousel(usersRef, "right")}
//                 sx={{
//                   minWidth: "40px",
//                   height: "40px",
//                   borderRadius: "50%",
//                   bgcolor: "#EF7B6C",
//                   color: "white",
//                   "&:hover": { bgcolor: "#e66a59" },
//                 }}
//               >
//                 <ChevronRight />
//               </Button>
//             </Box>
//           </Box>

//           <Box
//             ref={usersRef}
//             sx={{
//               display: "flex",
//               overflowX: "auto",
//               gap: 2,
//               pb: 2,
//               scrollbarWidth: "none",
//               "&::-webkit-scrollbar": { display: "none" },
//               msOverflowStyle: "none",
//               minHeight: "100px",
//             }}
//           >
//             {loadingUsers ? (
//               <Box sx={{ display: "flex", justifyContent: "center", width: "100%", alignItems: "center" }}>
//                 <CircularProgress sx={{ color: "#1D6EF1" }} />
//               </Box>
//             ) : activeUsers.length > 0 ? (
//               activeUsers.map((user) => (
//                 <Card
//                   key={user.id}
//                   sx={{
//                     minWidth: 280,
//                     maxWidth: 280,
//                     bgcolor: "#FFFFFF",
//                     borderRadius: 2,
//                     transition: "transform 0.2s, box-shadow 0.2s",
//                     "&:hover": {
//                       transform: "translateY(-4px)",
//                       boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
//                       cursor: "pointer",
//                     },
//                     flex: "0 0 auto",
//                     display: "flex",
//                     flexDirection: "row",
//                     alignItems: "center",
//                     p: 2,
//                   }}
//                   onClick={() => handleUserClick(user.id)}
//                 >
//                   <Avatar
//                     src={user.avatar}
//                     sx={{
//                       width: 60,
//                       height: 60,
//                       bgcolor: "#1D6EF1",
//                       mr: 2,
//                     }}
//                   >
//                     {user.name.charAt(0)}
//                   </Avatar>
//                   <Box>
//                     <Typography
//                       variant="h6"
//                       color="#1D1D20"
//                       sx={{
//                         fontFamily: "SourGummy, sans-serif",
//                         fontWeight: 600,
//                         fontSize: "18px",
//                       }}
//                     >
//                       {user.name}
//                     </Typography>
//                     <Typography
//                       color="#1D1D20"
//                       sx={{
//                         fontFamily: "SourGummy, sans-serif",
//                         fontWeight: 500,
//                         fontSize: "14px",
//                         overflow: "hidden",
//                         textOverflow: "ellipsis",
//                         display: "-webkit-box",
//                         WebkitLineClamp: 2,
//                         WebkitBoxOrient: "vertical",
//                       }}
//                     >
//                       {user.activity}
//                     </Typography>
//                   </Box>
//                 </Card>
//               ))
//             ) : (
//               <Box sx={{ display: "flex", justifyContent: "center", width: "100%", alignItems: "center" }}>
//                 <Typography
//                   color="#1D1D20"
//                   sx={{
//                     fontFamily: "SourGummy, sans-serif",
//                     fontWeight: 500,
//                     fontSize: "16px",
//                   }}
//                 >
//                   No active users found. Be the first to engage with the community!
//                 </Typography>
//               </Box>
//             )}
//           </Box>
//         </Box>
//       </Container>
//     </Box>
//   )
// }

// export default HomePage



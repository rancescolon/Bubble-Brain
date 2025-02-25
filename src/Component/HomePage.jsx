
// "use client"

// import { useEffect, useState } from "react"
// import { Link, useNavigate } from "react-router-dom"
// import { AppBar, Toolbar, Typography, Button, Card, CardContent, CardMedia, Grid, Container, Box } from "@mui/material"
// // import NavBar from "./Navbar"
// import fish1 from "../assets/fish1.png"
// import fish2 from "../assets/fish2.png"
// import fish3 from "../assets/fish3.png"
// import logo from "../assets/Frame.png"
// import background from "../assets/image3.png"

// const HomePage = () => {
//   const [isLoggedIn, setIsLoggedIn] = useState(false)
//   const navigate = useNavigate()

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
//     <Box sx={{ 
//       flexGrow: 1, 
//       bgcolor: "#1b1b1b", 
//       minHeight: "100vh",
//       backgroundImage: `url(${background})`,
//       backgroundSize: 'cover',
//       backgroundPosition: 'center',
//       backgroundRepeat: 'no-repeat',
//       opacity: 1.0,  // Adjust this value as needed
//     }}>
//       <AppBar position="static" sx={{ bgcolor: "#3A3A3A" }}>
//         <Toolbar>
//           <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
//             <img src={logo || "/placeholder.svg"} alt="QuizRot Logo" style={{ height: 32, marginRight: 8 }} />
//             <Typography variant="h6" component="div">
//               Bubble Brain 
//             </Typography>
//           </Box>
//           <Box sx={{ display: { xs: "none", md: "block" } }}>
//             <Button color="inherit" component={Link} to="/">
//               Home
//             </Button>
//             <Button color="inherit" component={Link} to="/courses">
//               Courses
//             </Button>
//             <Button color="inherit" component={Link} to="/quizzes">
//               Quizzes
//             </Button>
//             <Button color="inherit" component={Link} to="/contact">
//               Contact
//             </Button>
//           </Box>
//         </Toolbar>
//       </AppBar>

//       {/* <NavBar /> */}

//       <Container>
//         <Box sx={{ bgcolor: "#2A2A2A", py: 8, px: 2, mt: 2, borderRadius: 2 }}>
//           <Typography variant="h2" align="center" color="white" gutterBottom>
//             Dive into Learning
//           </Typography>
//           <Typography variant="h5" align="center" color="white" paragraph>
//             Explore our gamified courses and quizzes designed to make learning fun and engaging.
//           </Typography>
//           <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
//           <Button
//               variant="contained"
//               component={Link}
//               to="/courses"
//               size="large"
//               sx={{
//                 bgcolor: "#00AEEF",
//                 "&:hover": {
//                   bgcolor: "#0099D4", // A slightly darker shade for hover effect
//                 },
//               }}
//             >
//               Get Started
//             </Button>
//           </Box>
//         </Box>

//         <Grid container spacing={4} sx={{ mt: 4 }}>
//           {featuredContent.map((item, index) => (
//             <Grid item key={index} xs={12} sm={6} md={4}>
//               <Card sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "#3A3A3A" }}>
//                 <CardMedia
//                   component="img"
//                   sx={{ height: 140, objectFit: "contain", pt: 2 }}
//                   image={item.image}
//                   alt={item.title}
//                 />
//                 <CardContent sx={{ flexGrow: 1 }}>
//                   <Typography gutterBottom variant="h5" component="h2" color="white">
//                     {item.title}
//                   </Typography>
//                   <Typography color="white">{item.description}</Typography>
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

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AppBar, Toolbar, Typography, Button, Card, CardContent, CardMedia, Grid, Container, Box } from "@mui/material"
import fish1 from "../assets/fish1.png"
import fish2 from "../assets/fish2.png"
import fish3 from "../assets/fish3.png"
import logo from "../assets/Frame.png"
import background from "../assets/image3.png"

const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = sessionStorage.getItem("token")
    setIsLoggedIn(!!token)
  }, [])

  const handleLogout = () => {
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("user")
    setIsLoggedIn(false)
  }

  const featuredContent = [
    {
      title: "Marine Biology 101",
      description: "Learn the basics of marine life with our interactive course.",
      image: fish1,
    },
    {
      title: "Oceanic History Quiz",
      description: "Test your knowledge of the ocean's past with fun and challenging quizzes.",
      image: fish2,
    },
    {
      title: "Underwater Challenges",
      description: "Complete challenges and earn rewards as you learn more about the ocean.",
      image: fish3,
    },
  ]

  return (
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: "#1b1b1b",
        minHeight: "100vh",
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        opacity: 1.0,
      }}
    >
      <AppBar position="static" sx={{ bgcolor: "#3A3A3A" }}>
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <img src={logo || "/placeholder.svg"} alt="Bubble Brain Logo" style={{ height: 80, width: 80, marginRight: 8 }} />
            {/* Focus text - Logo */}
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontFamily: "SourGummy, sans-serif",
                fontWeight: 800,
                fontSize: "52px",
              }}
            >
              Bubble Brain
            </Typography>
          </Box>
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            {/* Normal text */}
            {["Home", "Courses", "Quizzes", "Contact"].map((item) => (
              <Button
                key={item}
                color="inherit"
                component={Link}
                to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                sx={{
                  fontFamily: "SourGummy, sans-serif",
                  fontWeight: 500,
                  fontSize: "16px",
                }}
              >
                {item}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      <Container>
        <Box sx={{ bgcolor: "#2A2A2A", py: 8, px: 2, mt: 2, borderRadius: 2 }}>
          {/* Focus text - Heading */}
          <Typography
            variant="h2"
            align="center"
            color="white"
            gutterBottom
            sx={{
              fontFamily: "SourGummy, sans-serif",
              fontWeight: 800,
              fontSize: "52px",
            }}
          >
            Dive into Learning
          </Typography>
          {/* Semi focus - Subheading */}
          <Typography
            variant="h5"
            align="center"
            color="white"
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
                bgcolor: "#00AEEF",
                "&:hover": {
                  bgcolor: "#0099D4",
                },
                fontFamily: "SourGummy, sans-serif",
                fontWeight: 600,
                fontSize: "32px",
              }}
            >
              Get Started
            </Button>
          </Box>
        </Box>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          {featuredContent.map((item, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "#3A3A3A" }}>
                <CardMedia
                  component="img"
                  sx={{ height: 140, objectFit: "contain", pt: 2 }}
                  image={item.image}
                  alt={item.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Semi focus - Card title */}
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="h2"
                    color="white"
                    sx={{
                      fontFamily: "SourGummy, sans-serif",
                      fontWeight: 600,
                      fontSize: "26px",
                    }}
                  >
                    {item.title}
                  </Typography>
                  {/* Normal text - Card description */}
                  <Typography
                    color="white"
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
      </Container>
    </Box>
  )
}

export default HomePage


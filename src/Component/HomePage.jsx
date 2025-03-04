

"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AppBar, Toolbar, Typography, Button, Card, CardContent, CardMedia, Grid, Container, Box } from "@mui/material"
import fish1 from "../assets/fish1.png"
import fish2 from "../assets/fish2.png"
import fish3 from "../assets/fish3.png"
import logo from "../assets/Frame.png"
import background from "../assets/image3.png"
import DrBubbles from "./DrBubbles"

const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()
  const [showGuide, setShowGuide] = useState(true)

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

        <Grid container spacing={4} sx={{ mt: 4 }}>
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
      </Container>
    </Box>
  )
}

export default HomePage


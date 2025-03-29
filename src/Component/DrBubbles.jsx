"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Box, Typography, Button, useMediaQuery, IconButton } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { X } from "lucide-react"

const DrBubbles = ({ onClose }) => {
  const [step, setStep] = useState(0)
  const [position, setPosition] = useState({ x: 15, y: 40 })
  const [isVisible, setIsVisible] = useState(true)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  useEffect(() => {
    if (isMobile) {
      const handleScroll = () => {
        const scrollPosition = window.scrollY
        setIsVisible(scrollPosition < 100) // Hide after scrolling 100px
      }

      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [isMobile])

  const guideSteps = [
    {
      element: "nav-start",
      message: "Welcome! I'm Dr. Bubbles, and I'll help you navigate around. Let's start with the Home button!",
      position: { x: 15, y: 40 },
    },
    {
      element: "nav-home",
      message: "Return to this page at anytime here!",
      position: { x: 15, y: 135 },
    },
    {
      element: "nav-friends",
      message: "Here you can connect with others and make new friends!",
      position: { x: 15, y: 180 },
    },
    {
      element: "nav-community",
      message: "Join exciting communities and view study sets!",
      position: { x: 15, y: 245 },
    },
    {
      element: "nav-profile",
      message: "View and manage your profile and progress here!",
      position: { x: 15, y: 300 },
    },
    {
      element: "nav-style-guide",
      message: "Check out our style guide to understand the design system!",
      position: { x: 15, y: 350 },
    },
  ]

  useEffect(() => {
    if (step < guideSteps.length) {
      setPosition({
        x: guideSteps[step].position.x,
        y: guideSteps[step].position.y,
      })
    }
  }, [step])

  const handleNext = () => {
    if (step < guideSteps.length - 1) {
      setStep(step + 1)
    } else {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <Box
          component={motion.div}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          sx={{
            position: "fixed",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            pointerEvents: "none",
            transform: "scale(1)",
            transformOrigin: "left top",
            [theme.breakpoints.down('sm')]: {
              top: '25px',
              left: '60px',
              position: 'fixed',
              transform: 'none',
              transformOrigin: 'initial',
            }
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
        >
          <Box
            component={motion.div}
            animate={{
              x: position.x,
              y: position.y,
              transition: {
                type: "spring",
                stiffness: 100,
                damping: 10,
              },
            }}
            sx={{
              position: "fixed",
              display: "flex",
              flexDirection: isMobile ? "row" : "row",
              alignItems: "center",
              gap: "10px",
              pointerEvents: "auto",
              transform: "scale(1)",
              transformOrigin: "left top",
              [theme.breakpoints.down('sm')]: {
                top: '25px',
                left: '60px',
                position: 'fixed',
                transform: 'none',
                transformOrigin: 'initial',
              }
            }}
          >
            {/* Dr. Bubbles Character */}
            <Box
              component={motion.div}
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              sx={{
                width: isMobile ? "60px" : "80px",
                height: isMobile ? "60px" : "80px",
                position: "relative",
              }}
            >
              <Box
                component="img"
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame-sxeNjAKs5YePSv0ET618soWjWdT1wY.png"
                alt="Dr. Bubbles"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
              {/* Bubble animations */}
              <Box
                component={motion.div}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 0.3, 0.7],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                sx={{
                  position: "absolute",
                  top: "-10%",
                  right: "-10%",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(255,255,255,0.2))",
                  filter: "blur(1px)",
                }}
              />
            </Box>

            {/* Message Bubble */}
            <Box
              component={motion.div}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              sx={{
                background: "rgba(255, 255, 255, 0.95)",
                padding: "3px 6px",
                borderRadius: "8px",
                maxWidth: isMobile ? "200px" : "200px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                position: "relative",
                [theme.breakpoints.down('sm')]: {
                  top: '-15px',
                  marginLeft: '10px',
                }
              }}
            >
              {/* Close button */}
              <IconButton 
                onClick={onClose}
                size="small"
                sx={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  backgroundColor: "#EF7B6C",
                  color: "white",
                  width: "16px",
                  height: "16px",
                  padding: "1px",
                  "&:hover": {
                    backgroundColor: "#e66a59"
                  },
                  "& svg": {
                    width: "10px",
                    height: "10px"
                  }
                }}
              >
                <X />
              </IconButton>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "SourGummy, sans-serif",
                  fontSize: isMobile ? "14px" : "16px",
                  color: "#333",
                  lineHeight: 1.2,
                  mb: 1,
                }}
              >
                {guideSteps[step].message}
              </Typography>
              <Button
                onClick={handleNext}
                variant="contained"
                sx={{
                  background: "#00AEEF",
                  color: "white",
                  marginTop: "1px",
                  fontFamily: "SourGummy, sans-serif",
                  fontSize: isMobile ? "9px" : "12px",
                  padding: "1px 4px",
                  minHeight: "16px",
                  "&:hover": {
                    background: "#0099cc",
                  },
                }}
              >
                {step < guideSteps.length - 1 ? "Next" : "Got it!"}
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </AnimatePresence>
  )
}

export default DrBubbles

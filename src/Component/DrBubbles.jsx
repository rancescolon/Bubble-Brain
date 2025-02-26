"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Box, Typography, Button, useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"

const DrBubbles = ({ onClose }) => {
  const [step, setStep] = useState(0)
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const guideSteps = [
    {
      element: "nav-home",
      message: "Welcome! I'm Dr. Bubbles, and I'll help you navigate around. Let's start with the Home button!",
      position: { x: -200, y: 100 },
    },
    {
      element: "nav-courses",
      message: "Here you'll find all our exciting courses about marine biology and ocean life!",
      position: { x: -100, y: 100 },
    },
    {
      element: "nav-quizzes",
      message: "Test your knowledge with our fun quizzes in this section!",
      position: { x: 0, y: 100 },
    },
    {
      element: "nav-contact",
      message: "Need help? You can reach out to us here!",
      position: { x: 100, y: 100 },
    },
  ]

  useEffect(() => {
    if (step < guideSteps.length) {
      const element = document.getElementById(guideSteps[step].element)
      if (element) {
        const rect = element.getBoundingClientRect()
        setPosition({
          x: isMobile ? 20 : rect.left - 250,
          y: isMobile ? rect.bottom + window.scrollY + 20 : rect.bottom + window.scrollY + 20,
        })
      }
    }
  }, [step, isMobile])

  const handleNext = () => {
    if (step < guideSteps.length - 1) {
      setStep(step + 1)
    } else {
      onClose()
    }
  }

  return (
    <AnimatePresence>
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
          gap: "20px",
          pointerEvents: "none",
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
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            gap: "20px",
            pointerEvents: "auto",
          }}
        >
          {/* Dr. Bubbles Character */}
          <Box
            component={motion.div}
            animate={{
              y: [0, -10, 0],
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
                width: "20px",
                height: "20px",
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
              padding: "15px 20px",
              borderRadius: "20px",
              maxWidth: isMobile ? "250px" : "300px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              position: "relative",
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontFamily: "SourGummy, sans-serif",
                fontSize: isMobile ? "14px" : "16px",
                color: "#333",
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
                marginTop: "10px",
                fontFamily: "SourGummy, sans-serif",
                fontSize: isMobile ? "12px" : "14px",
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
    </AnimatePresence>
  )
}

export default DrBubbles


"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const DrBubbles = ({ onClose }) => {
  const [step, setStep] = useState(0)
  const [position, setPosition] = useState({ x: 50, y: 50 })

  const guideSteps = [
    {
      element: "nav-home",
      message: "Welcome! I'm Dr. Bubbles, and I'll help you navigate around. Let's start with the Home button!",
      position: { x: -200, y: 100 }, // Adjusted x position
    },
    {
      element: "nav-courses",
      message: "Here you'll find all our exciting courses about marine biology and ocean life!",
      position: { x: -100, y: 100 }, // Adjusted x position
    },
    {
      element: "nav-quizzes",
      message: "Test your knowledge with our fun quizzes in this section!",
      position: { x: 0, y: 100 }, // Adjusted x position
    },
    {
      element: "nav-contact",
      message: "Need help? You can reach out to us here!",
      position: { x: 100, y: 100 }, // Adjusted x position
    },
  ]

  useEffect(() => {
    if (step < guideSteps.length) {
      const element = document.getElementById(guideSteps[step].element)
      if (element) {
        const rect = element.getBoundingClientRect()
        setPosition({
          x: rect.left - 250, // Adjusted to move Dr. Bubbles more to the left
          y: rect.bottom + window.scrollY + 20,
        })
      }
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
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        style={{
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
        <motion.div
          animate={{
            x: position.x,
            y: position.y,
            transition: {
              type: "spring",
              stiffness: 100,
              damping: 10,
            },
          }}
          style={{
            position: "fixed",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            pointerEvents: "auto",
          }}
        >
          {/* Dr. Bubbles Character */}
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            style={{
              width: "80px",
              height: "80px",
              position: "relative",
            }}
          >
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame-sxeNjAKs5YePSv0ET618soWjWdT1wY.png"
              alt="Dr. Bubbles"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
            {/* Bubble animations */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 0.3, 0.7],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              style={{
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
          </motion.div>

          {/* Message Bubble */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              padding: "15px 20px",
              borderRadius: "20px",
              maxWidth: "300px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              position: "relative",
              fontFamily: "SourGummy, sans-serif",
              fontSize: "16px",
              color: "#333",
            }}
          >
            <p>{guideSteps[step].message}</p>
            <button
              onClick={handleNext}
              style={{
                background: "#00AEEF",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                marginTop: "10px",
                cursor: "pointer",
                fontFamily: "SourGummy, sans-serif",
                fontSize: "14px",
              }}
            >
              {step < guideSteps.length - 1 ? "Next" : "Got it!"}
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default DrBubbles


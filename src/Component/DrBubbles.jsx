"use client"

import {useState, useEffect, useContext} from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Box, Typography, Button, useMediaQuery, IconButton } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { X } from "lucide-react"
import { useShop } from "../Context/ShopContext"
import {BackgroundContext} from "../App";
import text from "../text.json";

const DrBubbles = ({ onClose }) => {
  const { getEquippedSkin, equippedSkinId, defaultSkin, userId } = useShop()
  const [step, setStep] = useState(0)
  const [position, setPosition] = useState({ x: 15, y: 40 })
  const [isVisible, setIsVisible] = useState(true)
  const [currentSkin, setCurrentSkin] = useState(getEquippedSkin())
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const { currentBackground, language } = useContext(BackgroundContext)
  const langKey = language === "English" ? "en" : "es"
  const DrBubblesViewText = text[langKey].drBubbles

  // Add an effect to handle skin updates and persistence
  useEffect(() => {
    // Make the key user-specific
    const localStorageKey = userId ? `lastEquippedSkinId_${userId}` : 'lastEquippedSkinId';
    
    // Clear any stored skin data if userId is null (logged out)
    if (!userId) {
      setCurrentSkin(defaultSkin);
      console.log("[DrBubbles] No user logged in, using default skin");
      return;
    }
    
    // First, try to get the equipped skin from the context
    const contextSkin = getEquippedSkin();
    
    // If we have a valid non-default skin in context, use it
    if (equippedSkinId && equippedSkinId !== defaultSkin.id) {
      setCurrentSkin(contextSkin);
      return;
    }
    
    // Otherwise, check localStorage for a saved skin ID
    const savedSkinId = localStorage.getItem(localStorageKey);
    
    if (savedSkinId && savedSkinId !== defaultSkin.id) {
      // If we found a saved skin ID, use it
      const storedSkin = contextSkin.id !== defaultSkin.id ? contextSkin : defaultSkin;
      setCurrentSkin(storedSkin);
      return;
    }
    
    // Fallback to whatever we get from context
    setCurrentSkin(contextSkin);
  }, [getEquippedSkin, equippedSkinId, defaultSkin, userId]);

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
      message: DrBubblesViewText.guideSteps.navStart,
      position: { x: 15, y: 40 },
    },
    {
      element: "nav-home",
      message: DrBubblesViewText.guideSteps.navHome,
      position: { x: 14, y: 40 },
    },
    {
      element: "nav-friends",
      message: DrBubblesViewText.guideSteps.navFriends,
      position: { x: 15, y: 115 },
    },
    {
      element: "nav-upload",
      message: DrBubblesViewText.guideSteps.navUpload,
      position: { x: 15, y: 170 },
    },
    {
      element: "nav-community",
      message: DrBubblesViewText.guideSteps.navCommunity,
      position: { x: 15, y: 225 },
    },
    {
      element: "nav-profile",
      message: DrBubblesViewText.guideSteps.navProfile,
      position: { x: 15, y: 280 },
    },
    {
      element: "nav-style-guide",
      message: DrBubblesViewText.guideSteps.navStyleGuide,
      position: { x: 15, y: 330 },
    },

    {
      element: "nav-feed",
      message: DrBubblesViewText.guideSteps.navFeed,
      position: { x: 15, y: 390 },
    },

    {
      element: "nav-shop",
      message: DrBubblesViewText.guideSteps.navShop,
      position: { x: 15, y: 440 },
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
                src={currentSkin.image}
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
                {step < guideSteps.length - 1 ? DrBubblesViewText.buttons.next: DrBubblesViewText.buttons.gotIt}
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </AnimatePresence>
  )
}

export default DrBubbles
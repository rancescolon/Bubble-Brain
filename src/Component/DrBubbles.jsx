"use client"

import { useState, useEffect, useContext ,useMemo} from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Box, Typography, Button, useMediaQuery, IconButton, Tooltip } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { X } from "lucide-react"
import { useShop } from "../Context/ShopContext"
import { BackgroundContext } from "../App"
import text from "../text.json"

const DrBubbles = () => {
  const { getEquippedSkin, equippedSkinId, defaultSkin, userId } = useShop()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  // --- STATE ---
  const [isOpen, setIsOpen] = useState(true)
  const [step, setStep] = useState(0)
  const [position, setPosition] = useState({ x: 15, y: 40 })
  const [isVisibleOnScroll, setIsVisibleOnScroll] = useState(true)
  const [currentSkin, setCurrentSkin] = useState(getEquippedSkin())

  // --- CONTEXT ---
  const { language } = useContext(BackgroundContext)
  const langKey = language === "English" ? "en" : "es"
  const DrBubblesViewText = text[langKey].drBubbles

  // --- 1. LOCAL STORAGE & INIT ---
  useEffect(() => {
    const storageKey = userId ? `drBubblesGuideOpen_${userId}` : "drBubblesGuideOpen"
    const savedState = localStorage.getItem(storageKey)
    if (savedState !== null) {
      setIsOpen(JSON.parse(savedState))
    } else {
      setIsOpen(true)
    }
  }, [userId])

  const handleToggle = (newState) => {
    setIsOpen(newState)

    // Reset step if closing
    if (!newState) {
      setStep(0)
    }

    const storageKey = userId ? `drBubblesGuideOpen_${userId}` : "drBubblesGuideOpen"
    localStorage.setItem(storageKey, JSON.stringify(newState))
  }

  // --- 2. SKIN SYNC ---
  useEffect(() => {
    const localStorageKey = userId ? `lastEquippedSkinId_${userId}` : 'lastEquippedSkinId';
    if (!userId) {
      setCurrentSkin(defaultSkin);
      return;
    }
    const contextSkin = getEquippedSkin();
    if (equippedSkinId && equippedSkinId !== defaultSkin.id) {
      setCurrentSkin(contextSkin);
      return;
    }
    const savedSkinId = localStorage.getItem(localStorageKey);
    if (savedSkinId && savedSkinId !== defaultSkin.id) {
      const storedSkin = contextSkin.id !== defaultSkin.id ? contextSkin : defaultSkin;
      setCurrentSkin(storedSkin);
      return;
    }
    setCurrentSkin(contextSkin);
  }, [getEquippedSkin, equippedSkinId, defaultSkin, userId]);

  // --- 3. MOBILE SCROLL HIDING ---
  useEffect(() => {
    if (isMobile) {
      const handleScroll = () => {
        setIsVisibleOnScroll(window.scrollY < 100)
      }
      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    } else {
      setIsVisibleOnScroll(true)
    }
  }, [isMobile])

  // --- GUIDE DATA ---
  const guideSteps = useMemo(() => [
    { element: "nav-start", message: DrBubblesViewText.guideSteps.navStart, position: { x: 15, y: 40 } },
    { element: "nav-home", message: DrBubblesViewText.guideSteps.navHome, position: { x: 14, y: 40 } },
    { element: "nav-friends", message: DrBubblesViewText.guideSteps.navFriends, position: { x: 15, y: 115 } },
    { element: "nav-upload", message: DrBubblesViewText.guideSteps.navUpload, position: { x: 15, y: 170 } },
    { element: "nav-community", message: DrBubblesViewText.guideSteps.navCommunity, position: { x: 15, y: 225 } },
    { element: "nav-profile", message: DrBubblesViewText.guideSteps.navProfile, position: { x: 15, y: 280 } },
    { element: "nav-style-guide", message: DrBubblesViewText.guideSteps.navStyleGuide, position: { x: 15, y: 330 } },
    { element: "nav-feed", message: DrBubblesViewText.guideSteps.navFeed, position: { x: 15, y: 390 } },
    { element: "nav-shop", message: DrBubblesViewText.guideSteps.navShop, position: { x: 15, y: 440 } },
  ], [DrBubblesViewText]);

  useEffect(() => {
    if (step < guideSteps.length) {
      setPosition({ x: guideSteps[step].position.x, y: guideSteps[step].position.y })
    }
  }, [step,guideSteps])

  const handleNext = () => {
    if (step < guideSteps.length - 1) {
      setStep(step + 1)
    } else {
      handleToggle(false)
    }
  }

  if (!isVisibleOnScroll) return null;

  return (
      <AnimatePresence>
        {isOpen ? (
            // ===============================================
            // VIEW 1: THE OPEN GUIDE
            // ===============================================
            <Box
                key="guide-view"
                component={motion.div}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                style={{ willChange: "transform" }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                sx={{
                  position: "fixed",
                  zIndex: 1000,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  pointerEvents: "none",
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
              {/* Movement Container */}
              <Box
                  component={motion.div}
                  animate={{
                    x: position.x,
                    y: position.y,
                    transition: { type: "spring", stiffness: 100, damping: 10 },
                  }}
                  sx={{
                    position: "fixed",
                    display: "flex",
                    flexDirection: isMobile ? "row" : "row",
                    alignItems: "center",
                    gap: "10px",
                    pointerEvents: "auto",
                    [theme.breakpoints.down('sm')]: {
                      top: '25px',
                      left: '60px',
                      position: 'fixed',
                    }
                  }}
              >
                {/* Character Image */}
                <Box
                    component={motion.div}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    sx={{

                      width: isMobile ? "50px" : "80px",
                      height: isMobile ? "50px" : "80px",
                      position: "relative",
                      flexShrink: 0
                    }}
                >
                  <Box component="img" src={currentSkin.image} alt="Dr. Bubbles" sx={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  <Box
                      component={motion.div}
                      animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0.3, 0.7] }}
                      transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      sx={{
                        position: "absolute", top: "-10%", right: "-10%", width: "6px", height: "6px",
                        borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(255,255,255,0.2))",
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

                      // --- ADD THESE LINES ---
                      width: "max-content",   // 1. Forces box to wrap text naturally
                      flexShrink: 0,          // 2. Prevents it from being squished by the image
                      // -----------------------

                      maxWidth: "200px",      // Keeps your existing ceiling
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      position: "relative",
                      [theme.breakpoints.down('sm')]: { top: '-15px', marginLeft: '10px' }
                    }}
                >

                  <IconButton
                      onClick={() => handleToggle(false)}
                      size="small"
                      sx={{
                        position: "absolute", top: "-6px", right: "-6px",
                        backgroundColor: "#EF7B6C", color: "white", width: "16px", height: "16px", padding: "1px",
                        "&:hover": { backgroundColor: "#e66a59" },
                        "& svg": { width: "10px", height: "10px" }
                      }}
                  >
                    <X />
                  </IconButton>
                  <Typography variant="body1" sx={{ fontFamily: "SourGummy, sans-serif", fontSize: isMobile ? "14px" : "16px", color: "#333", lineHeight: 1.2, mb: 1 }}>
                    {guideSteps[step].message}
                  </Typography>
                  <Button
                      onClick={handleNext}
                      variant="contained"
                      sx={{
                        background: "#00AEEF", color: "white", marginTop: "1px", fontFamily: "SourGummy, sans-serif",
                        fontSize: isMobile ? "9px" : "12px", padding: "1px 4px", minHeight: "16px",
                        "&:hover": { background: "#0099cc" },
                      }}
                  >
                    {step < guideSteps.length - 1 ? DrBubblesViewText.buttons.next : DrBubblesViewText.buttons.gotIt}
                  </Button>
                </Box>
              </Box>
            </Box>
        ) : (
            // ===============================================
            // VIEW 2: THE QUESTION MARK BUBBLE
            // ===============================================
            <Tooltip key="question-view" title="Click for Dr. Bubbles' guide!" placement="right" arrow>
              <Box
                  component={motion.div}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    x: isMobile ? 100 : 50,
                    y: isMobile ? -75 : 5,
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 10 }}
                  style={{ willChange: "transform" }}
                  onClick={() => handleToggle(true)}
                  sx={{
                    position: "fixed",
                    left: { xs: 'auto', sm: 'auto' },
                    right: { xs: '20px', sm: 'auto' },
                    top: { xs: '100px', sm: 'auto' },
                    zIndex: 1400,
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #00AEEF 60%, #0095CC)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.25)",
                    border: "3px solid white",
                    transition: "background 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 6px 12px rgba(0,0,0,0.3)",
                      background: "linear-gradient(135deg, #00C3FF 60%, #00A8E8)",
                    },
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
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
                    sx={{
                      position: "absolute", width: "100%", height: "100%", borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.6)",
                    }}
                />
                {/* Float animation */}
                <Box
                    component={motion.div}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    sx={{ position: "absolute", width: "100%", height: "100%" }}
                />
              </Box>
            </Tooltip>
        )}
      </AnimatePresence>
  )
}

export default DrBubbles
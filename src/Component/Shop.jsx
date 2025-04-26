"use client"
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useShop, availableSkins, rarityLevels as importedRarityLevels, setBubbleBucks, setPurchasedSkins as setContextPurchasedSkins, setEquippedSkinId } from '../Context/ShopContext';
import { BackgroundContext } from '../App';
import bubbleBuckImage from '../assets/bubblebuck.png'; // Import buck image
import actualBuyButtonImage from '../assets/actualbuybutton.png'; // Add this import
import actualOwnedButtonImage from '../assets/actualownedbutton.png'; // Add this import
import finalEquippedButtonImage from '../assets/finalequippedbutton.png'; // Add this import
import updatedEquipButtonImage from '../assets/updatedequipbutton.png'; // Import the new Equip action button image
import sittingFishermanImage from '../assets/fallingevilfisherman1.png'; // Import the sitting fisherman - Corrected case
import bubbleBorderBoxImage from '../assets/bubbleborderbox.png'; // Import the new background box image
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  CircularProgress,
  Paper,
  Divider,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Stack,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip
} from '@mui/material';
import { ShoppingCart, CheckCircle, HelpCircle, PlusCircle, MinusCircle, RefreshCw } from 'lucide-react'; // Added RefreshCw
import text from '../text.json'; // Added import
// Add Spanish button imports
import spanishBuyButtonImage from '../assets/spanishbuybutton.png'; 
import spanishEquipButtonImage from '../assets/spanishequipbutton.png'; 
import spanishOwnedButtonImage from '../assets/spanishownedbutton.png'; 
import spanishEquippedButtonImage from '../assets/spanishequippedbutton.png';


import { motion } from "framer-motion";

//The code for the Shop page was assisted with the help of ChatGPT
// Helper to format time (from HomePage.jsx)
const formatTime = (seconds) => {
    if (seconds === undefined || seconds === null) return "0h 0m";
    const totalMinutes = Math.floor(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
};

const Shop = () => {
  const { 
    bubbleBucks, 
    purchasedSkins, 
    equippedSkinId, 
    buySkin, 
    equipSkin, 
    getEquippedSkin,
    defaultSkin,
    addBubbleBucks,
    isLoading: isShopLoading,
    updateBackendUserData, 
    userId,
    refreshUserData,
    setPurchasedSkins: setContextPurchasedSkins,
    setBubbleBucks: setContextBubbleBucks,
    setEquippedSkinId: setContextEquippedSkinId,
  } = useShop();

  const { 
    currentBackground, 
    language // Added language from context
  } = useContext(BackgroundContext); 
  const langKey = language === "English" ? "en" : "es"; // Determine language key
  const shopText = text[langKey].shopPage; // Get shop specific text

  const [totalStudyTimeSeconds, setTotalStudyTimeSeconds] = useState(0);
  const [loadingStudyTime, setLoadingStudyTime] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [sortBy, setSortBy] = useState('rarityAsc'); 
  const [isMachineShaking, setIsMachineShaking] = useState(false); // Keep for fisherman
  const [lastFishermanClickTime, setLastFishermanClickTime] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasRefreshedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch total study time for the current user
  useEffect(() => {
    const fetchStudyTime = async () => {
      setLoadingStudyTime(true);
      const token = sessionStorage.getItem('token');
      const userStr = sessionStorage.getItem('user');

      if (!token || !userStr) {
        console.warn('User not logged in. Cannot fetch study time.');
        setLoadingStudyTime(false);
        setSnackbar({ open: true, message: shopText.loginPromptShop, severity: 'warning' }); // Use shopText
        return;
      }

      try {
        const user = JSON.parse(userStr);
        // Use user.id if user is an object, otherwise assume userStr is the ID
        const userId = typeof user === 'object' && user.id ? user.id : userStr;

        const response = await fetch(
          `${process.env.REACT_APP_API_PATH}/posts?type=study_time&authorID=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch study time: ${response.status}`);
        }

        const studyTimeData = await response.json();
        let totalSeconds = 0;
        if (studyTimeData && studyTimeData[0]) {
          totalSeconds = studyTimeData[0].reduce((total, post) => {
            try {
              const content = typeof post.content === 'string' ? JSON.parse(post.content) : post.content;
              return total + (content.duration || 0);
            } catch (e) {
              console.warn(`Error parsing study time content for post ${post.id}:`, e);
              return total;
            }
          }, 0);
        }
        setTotalStudyTimeSeconds(totalSeconds);
      } catch (error) {
        console.error("Error fetching study time:", error);
        setSnackbar({ open: true, message: shopText.loadTimeFail, severity: 'error' }); // Use shopText
      } finally {
        setLoadingStudyTime(false);
      }
    };

    // Only fetch if we have a userId
    if (userId) {
      fetchStudyTime();
    } else {
      setTotalStudyTimeSeconds(0);
      setLoadingStudyTime(false);
    }
  }, [userId, shopText]); // Added shopText dependency

  // New useEffect to sync bubble bucks with study time
  useEffect(() => {
    // *** ADD CHECK: Don't run if shop is loading ***
    if (isShopLoading) {
      console.log("[Shop] Skipping study time sync because shop is loading.");
      return;
    }
    // Skip if still loading study time or no user ID or no study time data
    if (loadingStudyTime || !userId || !totalStudyTimeSeconds) return;
    
    // Create user-specific localStorage key for tracking last synced time
    const LAST_SYNCED_KEY = `lastSyncedStudyTime_${userId}`;
    
    // Get last synced study time from localStorage (in seconds)
    const lastSyncedTimeStr = localStorage.getItem(LAST_SYNCED_KEY);
    const lastSyncedTime = lastSyncedTimeStr ? parseInt(lastSyncedTimeStr, 10) : 0;
    
    // Calculate new study time since last sync (in seconds)
    const newStudyTimeSeconds = Math.max(0, totalStudyTimeSeconds - lastSyncedTime);
    
    // Convert new study seconds to minutes (rounded down)
    const newStudyMinutes = Math.floor(newStudyTimeSeconds / 60);
    
    console.log("[Shop] Study time sync:", {
      totalStudySeconds: totalStudyTimeSeconds,
      lastSyncedTime: lastSyncedTime,
      newStudySeconds: newStudyTimeSeconds,
      newStudyMinutes: newStudyMinutes,
      currentBubbleBucks: bubbleBucks
    });
    
    // Only update if there are new study minutes to add
    if (newStudyMinutes > 0) {
      console.log(`[Shop] Adding ${newStudyMinutes} bubble bucks for new study time`);
      
      // Calculate new total
      const newTotal = bubbleBucks + newStudyMinutes;
      
      // Update backend directly
      updateBackendUserData({
        bubbleBucks: newTotal
      }).then(success => {
        if (success) {
          // Update local state
          console.log("[Shop] Successfully added bubble bucks for new study time");
          addBubbleBucks(newStudyMinutes);
          
          // Update the last synced time in localStorage
          localStorage.setItem(LAST_SYNCED_KEY, totalStudyTimeSeconds.toString());
        } else {
          console.error("[Shop] Failed to update bubble bucks");
          setSnackbar({
            open: true,
            message: shopText.updateBucksFail, // Use shopText
            severity: "error"
          });
        }
      });
    } else {
      // No new minutes, but still update last synced time to current total
      localStorage.setItem(LAST_SYNCED_KEY, totalStudyTimeSeconds.toString());
    }

  }, [totalStudyTimeSeconds, bubbleBucks, userId, loadingStudyTime, updateBackendUserData, addBubbleBucks, isShopLoading, shopText]);

  // Load fisherman click time from localStorage when userId becomes available
  useEffect(() => {
    if (!userId) return; // Don't try to load if no userId
    
    // Create user-specific key
    const userSpecificKey = `lastFishermanClickTime_${userId}`;
    
    // Load from localStorage only when userId is available
    const savedTime = localStorage.getItem(userSpecificKey);
    if (savedTime) {
      setLastFishermanClickTime(parseInt(savedTime, 10));
    } else {
      setLastFishermanClickTime(null); // Reset if no saved time for this user
    }
    
    // Cleanup function - reset state when component unmounts or userId changes
    return () => {
      setLastFishermanClickTime(null);
    };
  }, [userId]); // Only run when userId changes

  // Save lastFishermanClickTime to localStorage when it changes
  useEffect(() => {
    if (!userId || lastFishermanClickTime === null) return; // Exit if no user ID or no time
    
    // Create user-specific key
    const userSpecificKey = `lastFishermanClickTime_${userId}`;
    
    // Update localStorage
    localStorage.setItem(userSpecificKey, lastFishermanClickTime.toString());
  }, [lastFishermanClickTime, userId]); // Run when either changes

  // Handle clicking the fisherman - ADDED LOGGING
  const handleFishermanClick = async () => {
    console.log("[Fisherman] Click handler entered. Current state:", { userId, isMachineShaking });

    // Make sure user is logged in
    if (!userId) {

        setSnackbar({ 
        open: true, 
        message: shopText.loginPromptFeature, // Use shopText

        severity: 'warning' 
      });
      return;
    }

    const fishermanSkinId = 'fisherman1';
    const ownsFisherman = purchasedSkins.includes(fishermanSkinId);
    const amountToAdd = ownsFisherman ? 510 : 260; // Determine amount

    // Create user-specific key for localStorage
    const userSpecificKey = `lastFishermanClickTime_${userId}`;
    
    // Check cooldown directly from localStorage and state
    const currentTime = Date.now();
    const cooldownDuration = 600000; 
    
    // Get the time from localStorage first, as it's the most reliable source
    const savedTimeStr = localStorage.getItem(userSpecificKey);
    const savedTime = savedTimeStr ? parseInt(savedTimeStr, 10) : null;
    
    // Use localStorage time or state time, whichever is more recent
    const lastClickTime = savedTime || lastFishermanClickTime;
    const timeSinceLastClick = lastClickTime ? currentTime - lastClickTime : Infinity;

    if (timeSinceLastClick < cooldownDuration) {
      const remainingTime = cooldownDuration - timeSinceLastClick;
      const remainingMinutes = Math.ceil(remainingTime / (60 * 1000));
      console.log(`[Fisherman] Exiting: Cooldown active. Remaining: ${remainingMinutes}m`);
      setSnackbar({ 
        open: true, 
        message: shopText.cooldown.replace('{minutes}', remainingMinutes).replace('{plural}', remainingMinutes > 1 ? shopText.pluralS : ''), // Use shopText
        severity: 'error' 
      });
      return; 
    }

    // Prevent double-click during animation
    console.log("[Fisherman] Checking if machine is shaking:", isMachineShaking);
    if (isMachineShaking) {
        console.log("[Fisherman] Exiting: Machine is already shaking.");
        return;
    }

    setIsMachineShaking(true); 
    setLastFishermanClickTime(currentTime);
    localStorage.setItem(userSpecificKey, currentTime.toString());

    // 1. Optimistic UI update
    const optimisticSuccess = addBubbleBucks(amountToAdd);

    if (optimisticSuccess) {
       const newBucksTotal = bubbleBucks + amountToAdd; // Calculate new total for backend
       
       // 2. Update backend
       console.log("[Fisherman] Attempting backend update with new total:", newBucksTotal);
       const backendSuccess = await updateBackendUserData({ bubbleBucks: newBucksTotal });
       console.log("[Fisherman] Backend update result:", backendSuccess); // Log backend success

       if (backendSuccess) {
          // DEBUG: Log before setting snackbar
          const snackbarParams = { open: true, message: `Caught ${amountToAdd} Bubble Bucks!`, severity: 'success' };
          console.log("[Fisherman] Backend successful, setting snackbar:", snackbarParams);
          // Show success message after backend confirmation

          setSnackbar({ open: true, message: shopText.caughtBucks.replace('{amount}', amountToAdd), severity: 'success' }); // Use shopText

        } else {
          console.error("[Fisherman] Backend update failed. Reverting optimistic update.");
          // Revert optimistic update if backend fails

          addBubbleBucks(-amountToAdd); // Subtract the added amount
          setLastFishermanClickTime(null); // Reset cooldown if backend failed
          localStorage.removeItem(userSpecificKey); // Remove from localStorage too
          setSnackbar({ open: true, message: shopText.saveBucksFail, severity: 'error' }); // Use shopText
       }
    } else {
       // This case should be rare (e.g., invalid amount), but handle it
       setLastFishermanClickTime(null); // Reset cooldown if optimistic update failed
       localStorage.removeItem(userSpecificKey); // Remove from localStorage too
       setSnackbar({ open: true, message: shopText.addBucksError, severity: 'error' }); // Use shopText

    }

    // End animation after a delay
    setTimeout(() => {
      setIsMachineShaking(false); 
    }, 1200); 
  };

  // REFACTORED handleBuy
  const handleBuy = async (skin) => {
    console.log("[Shop] handleBuy started for skin:", skin.id);
    
    // 1. Pre-checks (unchanged)
    if (purchasedSkins.includes(skin.id)) {
      console.log("[Shop] Skin already owned, equipping instead.");
      await handleEquip(skin.id); // Call the existing handleEquip function
      return;
    }
    if (bubbleBucks < skin.price) {
      setSnackbar({ 
        open: true, 
        message: shopText.notEnoughBucks.replace('{price}', skin.price).replace('{name}', skin.name), // Use shopText 
        severity: 'error' 
      });
      return;
    }

    // 2. Show "Purchasing..." Snackbar (unchanged)
    setSnackbar({ 
      open: true, 
      message: shopText.purchasing.replace('{name}', skin.name), // Use shopText
      severity: 'info' 
    });

    // 3. Prepare updated data
    const newBucks = bubbleBucks - skin.price;
    const newPurchasedSkins = [...purchasedSkins, skin.id];
    // Automatically equip the purchased skin
    const newEquippedSkinId = skin.id; 

    console.log("[Shop] Preparing backend update:", {
      bubbleBucks: newBucks,
      purchasedSkins: newPurchasedSkins,
      equippedSkinId: newEquippedSkinId
    });

    try {
      // 4. Update backend FIRST
      const updateSuccess = await updateBackendUserData({
        bubbleBucks: newBucks,
        purchasedSkins: newPurchasedSkins,
        equippedSkinId: newEquippedSkinId // Update equipped skin in the same call
      });

      if (!updateSuccess) {
        console.error("[Shop] Backend update failed during purchase for skin:", skin.id);
        throw new Error("Backend update failed");
      }
      
      console.log("[Shop] Backend update successful for purchase.");

      // 5. Update local context state DIRECTLY after successful backend update
      console.log("[Shop] Updating local context state directly after purchase.");
      if (setContextBubbleBucks) setContextBubbleBucks(newBucks);
      if (setContextPurchasedSkins) setContextPurchasedSkins(newPurchasedSkins);
      if (setContextEquippedSkinId) setContextEquippedSkinId(newEquippedSkinId);
      
      // 6. Show final success message (unchanged)
      setSnackbar({ 
        open: true, 

        message: shopText.purchaseSuccess.replace('{name}', skin.name), // Use shopText

        severity: 'success' 
      });

      console.log("[Shop] Purchase and equip completed locally for skin:", skin.id);
      
      // --- Optional: Log final state for verification ---
      // Note: Context state updates might be async, so logging 'bubbleBucks' here
      // might still show the old value immediately after the setter call.
      // Rely on the UI reflecting the change.
      // console.log("[Shop] Final context state likely updated (async):", {
      //   newBucks, newPurchasedSkins, newEquippedSkinId
      // });

    } catch (error) {
      console.error("[Shop] Error during purchase transaction:", error);
      // Revert optimistic "Purchasing..." snackbar with error message
      setSnackbar({ 
        open: true, 
        message: shopText.purchaseFail.replace('{name}', skin.name), // Use shopText
        severity: 'error' 
      });
      
      // Optional: Refresh data to try and sync with potential partial backend changes
      // await refreshUserData(); 
    }
  };

  // UNCHANGED handleEquip
  const handleEquip = async (skinId) => {
    console.log("[Shop] handleEquip called for skin:", skinId);
    // Default skin can always be equipped
    if (skinId === defaultSkin.id) {
      await equipSkin(skinId); // Use the original equipSkin from context here
      setSnackbar({ 
        open: true, 
        message: shopText.defaultEquipped, // Use shopText
        severity: 'info' 
      });
      return;
    }
    
    // Check if we already own this skin
    const alreadyOwned = purchasedSkins.includes(skinId);
    
    // If we don't own the skin, show a message
    if (!alreadyOwned) {
      const skin = availableSkins.find(s => s.id === skinId);
      if (!skin) {
        console.error(`[Shop] Skin with ID ${skinId} not found in available skins`);
        setSnackbar({ 
          open: true, 
          message: shopText.skinNotFound, // Use shopText
          severity: 'error' 
        });
        return;
      }
      
      setSnackbar({ 
        open: true, 
        message: shopText.purchaseToEquip.replace('{name}', skin.name), // Use shopText
        severity: 'warning' 
      });
      return;
    }
    
    try {
      // Call equipSkin function from context to update state and backend
      await equipSkin(skinId); 
      
      // Add robust check/fix: Ensure equipped skin is in purchased list *after* equipSkin call
      if (!purchasedSkins.includes(skinId)) {
        console.warn("[Shop] Equipped skin still not in purchased list after equipSkin. Forcing update.");
        const updatedSkins = [...purchasedSkins, skinId];
        
        // Force backend update
        const fixSuccess = await updateBackendUserData({
          purchasedSkins: updatedSkins,
          equippedSkinId: skinId // Ensure equipped ID is also sent
        });
        
        if (fixSuccess) {
          // Update local state directly
          if (setContextPurchasedSkins) setContextPurchasedSkins(updatedSkins);
          console.log("[Shop] Successfully forced equipped skin into purchased list.");
        } else {
          console.error("[Shop] Failed to force equipped skin into purchased list.");
        }
      }
      
      const currentSkin = availableSkins.find(s => s.id === skinId) || { name: "skin" };
      setSnackbar({ 
        open: true, 
        message: shopText.equipSuccess.replace('{name}', currentSkin.name), // Use shopText
        severity: 'success' 
      });
      
      console.log("[Shop] After equipping: equippedSkinId =", equippedSkinId, "purchasedSkins =", [...purchasedSkins]);
    } catch (error) {
      console.error("[Shop] Error equipping skin:", error);
      setSnackbar({ 
        open: true, 
        message: shopText.equipFail, // Use shopText
        severity: 'error' 
      });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // --- Sorting Logic ---
  const rarityMap = importedRarityLevels || {}; // Handle potential undefined import initially
  const getSortValue = (skin) => {
    return rarityMap[skin.rarityId]?.sortOrder ?? -1; // Default for unknown rarity
  };

  let sortedSkins = [...availableSkins]; // Create a copy
  if (sortBy === 'rarityAsc') {
    sortedSkins.sort((a, b) => getSortValue(a) - getSortValue(b));
  } else if (sortBy === 'rarityDesc') {
    sortedSkins.sort((a, b) => getSortValue(b) - getSortValue(a));
  } else if (sortBy === 'priceAsc') {
    sortedSkins.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'priceDesc') {
    sortedSkins.sort((a, b) => b.price - a.price);
  }
  // --- End Sorting Logic ---

  const equippedSkin = getEquippedSkin();

  // --- DEBUG LOG --- 
  console.log("[Shop.jsx] Purchased Skins:", purchasedSkins);
  console.log("[Shop.jsx] Owns Fisherman?", purchasedSkins.includes('fisherman1'));
  console.log("[Shop] Current userId:", userId);
  console.log("[Shop] Equipped skin ID:", equippedSkinId);
  console.log("[Shop] Equipped skin found in available skins:", !!availableSkins.find(s => s.id === equippedSkinId));
  console.log("[Shop] Is equipped skin in purchased list:", purchasedSkins.includes(equippedSkinId));
  console.log("[Shop] Current skin from getEquippedSkin():", getEquippedSkin());
  // --- END DEBUG LOG ---

  // Enhance the useEffect for handling purchased skins
  useEffect(() => {
    // Don't do anything if not logged in
    if (!userId) return;
    
    // Don't clear data when user navigates away and returns - use the mostReliableData function
    const findMostReliableData = () => {
      // Create keys for different storage locations
      const SKINS_CACHE_KEY = `lastKnownPurchasedSkins_${userId}`;
      const SESSION_SKINS_KEY = `sessionPurchasedSkins_${userId}`;
      
      try {
        // 1. Current state data (if exists)
        const currentStateData = purchasedSkins.length > 0 ? [...purchasedSkins] : null;
        
        // 2. Session storage data (survives page navigation)
        let sessionData = null;
        try {
          const sessionStr = sessionStorage.getItem(SESSION_SKINS_KEY);
          if (sessionStr) {
            const parsed = JSON.parse(sessionStr);
            sessionData = Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
          }
        } catch (e) {
          console.error("[Shop] Error parsing session storage skins", e);
        }
        
        // 3. Local storage data (survives browser restart)
        let localData = null;
        try {
          const localStr = localStorage.getItem(SKINS_CACHE_KEY);
          if (localStr) {
            const parsed = JSON.parse(localStr);
            localData = Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
          }
        } catch (e) {
          console.error("[Shop] Error parsing local storage skins", e);
        }
        
        // Log what we found in each source
        console.log("[Shop] Available skin data sources:", {
          currentState: currentStateData?.length || 0,
          sessionStorage: sessionData?.length || 0,
          localStorage: localData?.length || 0
        });
        
        // Use the source with the most skins
        const currentCount = currentStateData?.length || 0;
        const sessionCount = sessionData?.length || 0;
        const localCount = localData?.length || 0;
        
        // If all sources have some data, use the one with the most items
        if (currentCount > 0 || sessionCount > 0 || localCount > 0) {
          if (currentCount >= sessionCount && currentCount >= localCount) {
            return currentStateData;
          } else if (sessionCount >= currentCount && sessionCount >= localCount) {
            return sessionData;
          } else {
            return localData;
          }
        }
        
        // No valid data found in any source
        return null;
      } catch (e) {
        console.error("[Shop] Error finding most reliable data", e);
        return purchasedSkins.length > 0 ? [...purchasedSkins] : null;
      }
    };
    
    // Check if we need to restore skin data after navigation
    if (isShopLoading === false) { // Only run when loading is complete
      const bestSkinData = findMostReliableData();
      
      // If we have data in storage but not in state, we need to restore
      if (bestSkinData && bestSkinData.length > 0) {
        // If current state is empty or has fewer skins, restore from storage
        if (purchasedSkins.length < bestSkinData.length) {
          console.log("[Shop] Restoring skins from storage", { current: purchasedSkins.length, storage: bestSkinData.length });
          // Update state DIRECTLY using the context setter
          if (setContextPurchasedSkins) setContextPurchasedSkins(bestSkinData); 

          // Update backend (unchanged logic, but ensures consistency)
          updateBackendUserData({
            purchasedSkins: bestSkinData,
            equippedSkinId: equippedSkinId !== defaultSkin.id ? equippedSkinId : undefined
          }).then(success => {
            if (success) {
              console.log("[Shop] Successfully synced restored skins to backend");
              // Optional: Refresh might still be useful here IF backend sync has side effects
              // refreshUserData(); 
            } else {
              console.error("[Shop] Failed to sync restored skins to backend");
            }
          });
        } else {
          // Current state looks good, just save it for next navigation
          console.log("[Shop] Current skin data looks good, caching for future navigation");
        }
        
        // Always update both storage locations with best data
        if (bestSkinData.length > 0) {
          const dataStr = JSON.stringify(bestSkinData);
          localStorage.setItem(`lastKnownPurchasedSkins_${userId}`, dataStr);
          sessionStorage.setItem(`sessionPurchasedSkins_${userId}`, dataStr);
        }
      }
    }
  }, [userId, isShopLoading, purchasedSkins, equippedSkinId, defaultSkin.id, setContextPurchasedSkins, updateBackendUserData]); // Added setters and backend update to dependency array
  
  // Add an event listener for page visibility changes to handle tab switching
  useEffect(() => {
    if (!userId) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("[Shop] Tab became visible again, checking data consistency");
        
        // Don't trigger if we're already refreshing
        if (!isRefreshing) {
          // Simple check - if we have equipped skin but no purchased skins, refresh
          if (equippedSkinId !== defaultSkin.id && purchasedSkins.length === 0) {
            console.log("[Shop] Data inconsistency detected on visibility change, refreshing");
            handleRefreshData();
          }
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId, isRefreshing, purchasedSkins.length, equippedSkinId, defaultSkin.id]);

  // Function to manually refresh shop data
  const handleRefreshData = async () => {
    // Prevent double-clicking refresh while already refreshing
    if (isRefreshing) {
      console.log("[Shop] Already refreshing, ignoring duplicate request");
      return;
    }
    
    // Check if the required data and functions exist
    if (!userId || !refreshUserData) {
      setSnackbar({
        open: true,
        message: shopText.cannotRefresh, // Use shopText
        severity: "error"
      });
      return;
    }

    setIsRefreshing(true);
    setSnackbar({
      open: true,
      message: shopText.refreshingData, // Use shopText
      severity: "info"
    });
    
    // Save current state BEFORE the refresh
    const currentPurchasedSkins = [...purchasedSkins];
    const currentEquippedSkin = equippedSkinId;
    const currentBubbleBucks = bubbleBucks;
    
    console.log("[Shop] Current state before refresh:", {
      bubbleBucks: currentBubbleBucks,
      purchasedSkins: currentPurchasedSkins,
      equippedSkinId: currentEquippedSkin
    });
    
    try {
      // First, force an update to ensure our data is stored correctly
      // This fixes issues where refreshUserData might not have our latest state
      if (currentPurchasedSkins.length > 0) {
        console.log("[Shop] Pre-refresh: Forcing purchased skins to be saved");
        await updateBackendUserData({
          purchasedSkins: currentPurchasedSkins,
          equippedSkinId: currentEquippedSkin
        });
      }
      
      // Now refresh user data from backend - with timeout safety
      const refreshPromise = refreshUserData();
      
      // Add a timeout to ensure we don't get stuck
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => resolve('timeout'), 10000); // 10 second timeout
      });
      
      // Use Promise.race to handle potential infinite refreshes
      const result = await Promise.race([refreshPromise, timeoutPromise]);
      
      if (result === 'timeout') {
        console.error("[Shop] Refresh operation timed out after 10 seconds");
        throw new Error("Refresh operation timed out");
      }
      
      console.log("[Shop] After refresh: purchasedSkins =", purchasedSkins, "equippedSkinId =", equippedSkinId);
      
      // Calculate exactly which skins are missing after refresh
      const missingSkins = currentPurchasedSkins.filter(id => !purchasedSkins.includes(id));
      
      // If we've lost ANY skins, including equipped skin, restore everything
      if (missingSkins.length > 0 || 
         (currentEquippedSkin && !purchasedSkins.includes(currentEquippedSkin) && currentEquippedSkin !== defaultSkin.id)) {
        
        console.log("[Shop] Data was lost during refresh! Missing skins:", missingSkins);
        console.log("[Shop] Equipped skin preserved?", purchasedSkins.includes(currentEquippedSkin));
        
        // Combine current and previous purchases without duplicates
        const combinedSkins = [...new Set([...purchasedSkins, ...currentPurchasedSkins])];
        
        console.log("[Shop] Restoring ALL data. Combined skins:", combinedSkins);
        
        // Critical: Force update to restore ALL our data
        const updateSuccess = await updateBackendUserData({
          purchasedSkins: combinedSkins,
          equippedSkinId: currentEquippedSkin
        });
        
        if (updateSuccess) {
          console.log("[Shop] Successfully restored all data");
          // Refresh again to get our restored data
          await refreshUserData();
          
          // Final verification
          const stillMissingSkins = currentPurchasedSkins.filter(id => !purchasedSkins.includes(id));
          if (stillMissingSkins.length > 0) {
            console.error("[Shop] CRITICAL: Still missing skins after restore:", stillMissingSkins);
            setSnackbar({
              open: true,
              message: shopText.restoreFailSome, // Needs key
              severity: "warning"
            });
            return;
          }
        } else {
          console.error("[Shop] Failed to restore data!");
          setSnackbar({
            open: true,
            message: shopText.restoreFailAll, // Needs key
            severity: "error"
          });
          return;
        }
      }
      
      // Restore bubble bucks if they decreased
      if (currentBubbleBucks > bubbleBucks) {
        console.log("[Shop] Bubble bucks decreased from", currentBubbleBucks, "to", bubbleBucks);
        await updateBackendUserData({
          bubbleBucks: currentBubbleBucks
        });
        // One more refresh to get the correct bubble bucks
        await refreshUserData();
      }
      
      // Final verification - ensure we didn't lose any skins
      const finalMissingSkins = currentPurchasedSkins.filter(id => !purchasedSkins.includes(id));
      if (finalMissingSkins.length > 0) {
        console.error("[Shop] CRITICAL: Still missing skins after all recovery attempts:", finalMissingSkins);
        setSnackbar({
          open: true,
          message: shopText.restoreFailCritical, // Needs key
          severity: "error"
        });
        return;
      }
      
      // Show success message
      setSnackbar({
        open: true,
        message: shopText.refreshSuccess, // Use shopText
        severity: "success"
      });
      
      console.log("[Shop] Final state after refresh:", {
        bubbleBucks,
        purchasedSkins: [...purchasedSkins],
        equippedSkinId
      });
    } catch (error) {
      console.error("[Shop] Error refreshing shop data:", error);
      
      setSnackbar({
        open: true,
        message: shopText.refreshFail, // Use shopText
        severity: "error"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Add a one-time effect to ensure equipped skin is in purchased list
  useEffect(() => {
    // Skip if not logged in or no equipped skin
    if (!userId || !equippedSkinId || equippedSkinId === defaultSkin.id) return;
    
    // Skip if already in purchased skins
    if (purchasedSkins.includes(equippedSkinId)) return;
    
    const syncEquippedSkin = async () => {
      console.log("[Shop] Equipped skin not in purchased list on load! Adding it...");
      
      try {
        // Add equipped skin to purchased list
        const updatedSkins = [...purchasedSkins, equippedSkinId];
        
        await updateBackendUserData({
          purchasedSkins: updatedSkins
        });
        
        // Refresh data to make sure it's saved
        await refreshUserData();
        
        console.log("[Shop] Equipped skin added to purchased list:", equippedSkinId);
      } catch (error) {
        console.error("[Shop] Error syncing equipped skin:", error);
      }
    };
    
    syncEquippedSkin();
  }, [userId, equippedSkinId, purchasedSkins, updateBackendUserData, refreshUserData, setContextPurchasedSkins]); // Added context setters/funcs

  // Add a one-time effect to save and restore bubble bucks between sessions
  useEffect(() => {
    if (!userId) return;
    
    const STORAGE_KEY = `lastKnownBubbleBucks_${userId}`;
    
    // First, check if we just logged in and have 0 bubble bucks
    if (bubbleBucks === 0) {
      // Try to get the last known bubble bucks from localStorage
      const lastKnownBucksStr = localStorage.getItem(STORAGE_KEY);
      const lastKnownBucks = lastKnownBucksStr ? parseInt(lastKnownBucksStr, 10) : 0;
      
      // If we have a non-zero value in localStorage, use it to restore
      if (lastKnownBucks > 0) {
        console.log("[Shop] Detected 0 bubble bucks after login. Restoring from cache:", lastKnownBucks);
        
        // Update backend
        updateBackendUserData({
          bubbleBucks: lastKnownBucks
        }).then(success => {
          if (success) {
            console.log("[Shop] Successfully restored bubble bucks from cache");
            refreshUserData();
          } else {
            console.error("[Shop] Failed to restore bubble bucks from cache");
          }
        });
      }
    } 
    else if (bubbleBucks > 0) {
      // Store current bubble bucks for future sessions
      console.log("[Shop] Saving current bubble bucks to cache:", bubbleBucks);
      localStorage.setItem(STORAGE_KEY, bubbleBucks.toString());
    }
    
  }, [userId, bubbleBucks, updateBackendUserData, refreshUserData, setContextBubbleBucks]); // Added context setters/funcs

  // Add a safe one-time load effect with a strict mounting check
  useEffect(() => {
    // Use a local variable to ensure this only runs once per mount
    let isMounted = true;
    
    const loadInitialData = async () => {
      // *** ADD CHECK: Only run if context is still in initial loading phase ***
      if (!isShopLoading && !isRefreshing) {
        console.log("[Shop] Skipping loadInitialData because context/shop is already loaded/refreshing.");
        return; 
      }

      // Skip if no user data is available
      if (!userId || !refreshUserData) return;
      
      console.log("[Shop] Initial data load started");
      
      try {
        // Only call refresh if component is still mounted
        if (isMounted) {
          setIsRefreshing(true);
          
          // First, check if we have cached skin data to verify against
          const SKINS_CACHE_KEY = `lastKnownPurchasedSkins_${userId}`;
          let cachedSkins = [];
          
          try {
            const cachedSkinsStr = localStorage.getItem(SKINS_CACHE_KEY);
            if (cachedSkinsStr) {
              const parsed = JSON.parse(cachedSkinsStr);
              if (Array.isArray(parsed) && parsed.length > 0) {
                cachedSkins = parsed;
                console.log("[Shop] Found cached skins for verification:", cachedSkins.length);
              }
            }
          } catch (e) {
            console.error("[Shop] Error parsing cached skins:", e);
          }
          
          // Now refresh user data from backend
          await refreshUserData();
          
          console.log("[Shop] Initial load complete, current skins:", purchasedSkins.length);
          
          // If we have cached skins but none loaded, restore the cached skins
          if (cachedSkins.length > 0 && purchasedSkins.length === 0) {
            console.log("[Shop] No skins loaded from backend, restoring from cache");
            
            // Update state optimistically
            if (setContextPurchasedSkins) setContextPurchasedSkins(cachedSkins);
            
            // Update backend to ensure data is saved
            const updateSuccess = await updateBackendUserData({
              purchasedSkins: cachedSkins
            });
            
            if (updateSuccess) {
              console.log("[Shop] Successfully restored skins from cache");
              
              // One final refresh to ensure state is consistent
              await refreshUserData();
            } else {
              console.error("[Shop] Failed to restore skins from cache");
            }
          }
        }
      } catch (error) {
        console.error("[Shop] Error loading initial data:", error);
      } finally {
        if (isMounted) {
          setIsRefreshing(false);
        }
      }
    };
    
    // Load data once on mount
    loadInitialData();
    
    // Clean up function
    return () => {
      isMounted = false;
    };
  }, [userId, isShopLoading, refreshUserData, updateBackendUserData, setContextPurchasedSkins]); // Added context setters/funcs

  // --- Moved Loading Check Higher --- 
  // This check now happens BEFORE the main Box is defined
  if (isShopLoading) {
    // Return ONLY the loading indicator, not nested in the styled Box
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)', bgcolor: 'rgba(255, 255, 255, 0.7)' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2, fontFamily: 'SourGummy, sans-serif', fontSize: '1.5rem' }}>Loading Shop...</Typography>
      </Box>
    );
  }
  // --- End Loading Check ---

  return (
    <Box
      sx={{
        flexGrow: 1,
        minHeight: "calc(100vh - 64px)",
        backgroundImage: `url(${currentBackground.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: 'fixed',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Paper 
          elevation={4} 
          sx={{
            pt: { xs: 4, sm: 5, md: 6 },
            px: { xs: 2, sm: 3, md: 4 },
            pb: { xs: 2, sm: 3, md: 4 },
            borderRadius: '16px', 
            bgcolor: 'white', 
            overflow: 'hidden' 
          }}
        >
          {/* Title container */}
          <Box sx={{ position: 'relative', textAlign: 'center', mb: 4 }}>
            {/* Positioned Fisherman Image */}
            <Box
              component="img"
              src={sittingFishermanImage}
              alt="Click for Bucks!"
              onClick={() => {
                console.log("<<< FISHERMAN IMAGE CLICKED IN JSX >>>"); 
                handleFishermanClick(); 
              }}
              sx={{
                position: 'absolute',
                top: langKey === 'es' 
                  ? { xs: '130px', sm: '52px', md: '52px' }
                  : { xs: '135px', sm: '62px', md: '62px' },
                left: { xs: 'calc(50% + 11px)', sm: 'calc(50% + 113px)', md: 'calc(50% + 113px)' }, 
                width: '70px',
                height: 'auto',
                zIndex: 2,
                pointerEvents: 'auto',
                cursor: 'pointer',    
                filter: 'none',       
                transition: 'transform 0.2s ease-in-out, filter 0.3s ease-in-out, top 0.3s ease-in-out',
                '&:hover': {
                  filter: 'drop-shadow(0 0 15px rgba(255, 0, 0, 1))', 
                  transform: 'scale(1.05)', 
                },
                '@media (aspect-ratio: 3/4)': {
                  top: langKey === 'es' ? '55px' : '60px',
                  left: 'calc(50% + 113px)', 
                },
              }}
            />
            
            <Typography variant="h2" gutterBottom align="center" sx={{ fontFamily: 'SourGummy, sans-serif', fontWeight: 1000, color: '#1D1D20' }}>
              {shopText.title}
            </Typography>
            
            {/* Refresh button */}
            <IconButton
              onClick={handleRefreshData}
              disabled={isRefreshing || isLoading}
              sx={{
                position: 'absolute',
                top: { xs: '-12px', md: '-12px' },
                right: { xs: '8px', md: '12px' },
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                },
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                '@media (aspect-ratio: 3/4)': {
                  top: '-20px',
                },
              }}
              aria-label={shopText.refreshAlt}
            >
              <RefreshCw size={24} className={isRefreshing ? 'spin' : ''} />
            </IconButton>
          </Box>

          {/* User Stats Section - MODIFIED */} 
          <Paper elevation={2} sx={{ 
            p: 3, 
            mb: 4, 
            mt: { xs: 10, sm: 0 },
            borderRadius: '16px', 
            bgcolor: 'rgba(244, 253, 255, 0.6)', 
            backdropFilter: 'blur(2px)' 
          }}>
            <Grid container spacing={3} alignItems="center" justifyContent="center">
              <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}> 
                <Typography variant="h5" sx={{ fontFamily: 'SourGummy, sans-serif', fontWeight: 600, mb: 2 }}>
                    {shopText.yourStats}
                </Typography>
                <Tooltip title={shopText.earnBucksTooltip} arrow>
                  <Box display="flex" alignItems="center" justifyContent='center' mb={2}> 
                  <Typography sx={{ fontFamily: 'SourGummy, sans-serif', mr: 1, fontSize: '1.2rem' }}>{shopText.bubbleBucksLabel}</Typography>
                  <Box display="flex" alignItems="center" sx={{ fontWeight: 'bold' }}>
                    <img src={bubbleBuckImage} alt={shopText.bubbleBuckAlt} style={{ width: '80px', height: '80px', marginRight: '8px' }} />
                    <Typography variant="h5" component="span" sx={{ fontFamily: 'SourGummy, sans-serif', fontWeight: 600 }}>{bubbleBucks}</Typography>
                  </Box>
                </Box>
                </Tooltip>
                
                <Typography variant="body2" sx={{ 
                  fontFamily: 'SourGummy, sans-serif', 
                  color: 'text.secondary', 
                  mt: -1, 
                  mb: 2,
                  textAlign: 'center' 
                }}>
                  {shopText.conversionRate}
                </Typography>
                
                {bubbleBucks === 0 && purchasedSkins.length === 0 && (
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main' }}>
                    <RefreshCw size={18} style={{ marginRight: '8px' }} />
                    <Typography variant="body2" sx={{ fontFamily: 'SourGummy, sans-serif' }}>
                      {shopText.refreshPrompt}
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Paper>

          {/* Available Skins Section */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} mt={4}>
            <Typography variant="h4" sx={{ fontFamily: 'SourGummy, sans-serif', fontWeight: 600, color: '#1D1D20' }}>
              {shopText.skinsStore}
            </Typography>
            <FormControl sx={{ m: 1, minWidth: 150 }} size="small">
              <InputLabel id="sort-by-label" sx={{ fontFamily: 'SourGummy, sans-serif' }}>{shopText.sortBy}</InputLabel>
              <Select
                labelId="sort-by-label"
                id="sort-by-select"
                value={sortBy}
                label={shopText.sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ fontFamily: 'SourGummy, sans-serif' }}
              >
                <MenuItem value="default" sx={{ fontFamily: 'SourGummy, sans-serif' }}>{shopText.sortDefault}</MenuItem>
                <MenuItem value="rarityAsc" sx={{ fontFamily: 'SourGummy, sans-serif' }}>{shopText.sortRarityAsc}</MenuItem>
                <MenuItem value="rarityDesc" sx={{ fontFamily: 'SourGummy, sans-serif' }}>{shopText.sortRarityDesc}</MenuItem>
                <MenuItem value="priceAsc" sx={{ fontFamily: 'SourGummy, sans-serif' }}>{shopText.sortPriceAsc}</MenuItem>
                <MenuItem value="priceDesc" sx={{ fontFamily: 'SourGummy, sans-serif' }}>{shopText.sortPriceDesc}</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Grid container spacing={3}>
            {sortedSkins.map((skin, index) => {
              const isOwned = purchasedSkins.includes(skin.id);
              const isEquipped = equippedSkinId === skin.id;
              const canAfford = bubbleBucks >= skin.price;
              const rarity = rarityMap[skin.rarityId];
              const isMythic = skin.rarityId === 'mythic';
              return (
                <Grid item xs={12} sm={6} md={4} key={skin.id} sx={{ display: 'flex' }}>
                  <motion.div
                    className="skin-item"
                    style={{ 
                      display: 'flex',          
                      flexDirection: 'column', 
                      height: '100%',          
                      width: '100%',           
                      animationDelay: `${index * 0.1}s`,
                      opacity: 0,
                      transform: 'translateY(20px)',
                      animation: 'fadeInUp 0.3s ease forwards'
                    }}
                  >
                    <Card sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      borderRadius: '16px', 
                      boxShadow: 3,
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      border: '2px solid transparent',
                    }}>
                      <CardMedia
                        component="img"
                        sx={{ 
                            height: 180, 
                            objectFit: 'contain', 
                            pt: 2, 
                            backgroundColor: rarity ? rarity.bgColor : '#f5f5f5'
                        }}
                        image={skin.image} 
                        alt={skin.name}
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.style.display='none';
                          const placeholder = e.target.parentNode.querySelector('.image-placeholder');
                          if(placeholder) placeholder.style.display='block';
                        }}
                      />
                      <Box className="image-placeholder" sx={{ display: 'none', height: 180, pt: 2, backgroundColor: '#f5f5f5', textAlign: 'center', color: '#999'}}>
                        <HelpCircle size={48} style={{marginTop: '30px'}}/>
                        <Typography variant="caption">{shopText.imageNotFound}</Typography>
                      </Box>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="h6" component="div" sx={{ fontFamily: 'SourGummy, sans-serif', fontWeight: 600 }}>
                          {shopText[`skin_${skin.id}`] || skin.name}
                        </Typography>
                        {rarity && (
                          <Typography variant="body2" sx={{
                            fontFamily: 'SourGummy, sans-serif',
                            fontWeight: 'bold',
                            color: rarity.textColor || '#000000',
                            mb: 1,
                            textShadow: 'none'
                          }}>
                            {shopText.rarityNames && shopText.rarityNames[rarity.id] ? shopText.rarityNames[rarity.id] : rarity.name}
                          </Typography>
                        )}
                        <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                          <img 
                            src={bubbleBuckImage} 
                            alt="" 
                            style={{ width: '80px', height: '80px', marginRight: '8px' }}
                          />
                          <Typography 
                            variant="h6"
                            sx={{ 
                              fontFamily: 'SourGummy, sans-serif', 
                              fontWeight: 600,
                              color: '#000000'
                            }}
                          >
                            {skin.price}
                          </Typography>
                        </Box>

                        {/* Action Buttons */}
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                          {isEquipped ? (
                            <Box
                              component="img"
                              src={langKey === 'es' ? spanishEquippedButtonImage : finalEquippedButtonImage}
                              alt={shopText.equippedAlt}
                              sx={{ width: 'auto', height: '70px', display: 'block', mx: 'auto' }}
                            />
                          ) : isOwned ? (
                            <Box
                              component="img"
                              src={langKey === 'es' ? spanishEquipButtonImage : updatedEquipButtonImage}
                              alt={shopText.equipAlt}
                              onClick={() => handleEquip(skin.id)}
                              sx={{
                                width: 'auto',
                                height: '70px',
                                cursor: 'pointer',
                                display: 'block',
                                mx: 'auto',
                                transition: 'transform 0.1s ease',
                                '&:hover': { transform: 'scale(1.05)' }
                              }}
                            />
                          ) : ( // Not owned
                            <Box
                              component="img"
                              src={langKey === 'es' ? spanishBuyButtonImage : actualBuyButtonImage}
                              alt={shopText.buyAlt}
                              onClick={() => handleBuy(skin)}
                              sx={{
                                width: 'auto',
                                height: langKey === 'es' ? '70px' : '30px', 
                                cursor: canAfford ? 'pointer' : 'not-allowed',
                                display: 'block',
                                mx: 'auto',
                                filter: canAfford ? 'none' : 'grayscale(80%)',
                                transition: 'transform 0.1s ease',
                                '&:hover': {
                                  transform: canAfford ? 'scale(1.05)' : 'none'
                                },
                              }}
                            />
                          )}
                        </Box>
                        {/* End Action Buttons */}

                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>

          {/* ADDED Owned Skins Section */}
          <Typography variant="h4" gutterBottom sx={{ fontFamily: 'SourGummy, sans-serif', fontWeight: 600, mt: 6, mb: 2, color: '#1D1D20' }}>
            {shopText.yourWardrobe}
          </Typography>
          <Paper elevation={2} sx={{ p: 3, borderRadius: '16px', bgcolor: 'rgba(244, 253, 255, 0.8)', backdropFilter: 'blur(2px)' }}>
            
            
            <Grid container spacing={2}> 
              {[
                defaultSkin,
                ...(equippedSkinId !== defaultSkin.id && !purchasedSkins.includes(equippedSkinId) && availableSkins.find(s => s.id === equippedSkinId) 
                  ? [availableSkins.find(s => s.id === equippedSkinId)] 
                  : []),
                ...availableSkins.filter(skin => 
                  purchasedSkins.includes(skin.id) && 
                  skin.id !== defaultSkin.id
                )
              ].filter(Boolean).map((skin) => {
                const isCurrentlyEquipped = equippedSkinId === skin.id;
                const isPurchasedOrEquipped = purchasedSkins.includes(skin.id) || skin.id === defaultSkin.id || isCurrentlyEquipped;
                
                return (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={`owned-${skin.id}`}>
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        borderRadius: '12px', 
                        boxShadow: isCurrentlyEquipped ? '0 0 15px rgba(29, 110, 241, 0.7)' : 2, 
                        border: isCurrentlyEquipped ? '2px solid #1D6EF1' : '2px solid transparent',
                        overflow: 'hidden', 
                        bgcolor: 'rgba(255, 255, 255, 0.95)'
                      }}
                    >
                      <CardMedia
                        component="img"
                        sx={{ height: 100, objectFit: 'contain', pt: 1, backgroundColor: '#eee' }}
                        image={skin.image} 
                        alt={skin.name}
                        onError={(e) => { 
                          e.target.onerror = null; 
                          e.target.style.display='none'; 
                          const placeholder = e.target.parentNode.querySelector('.image-placeholder-owned');
                          if(placeholder) placeholder.style.display='block';
                        }}
                      />
                      <Box className="image-placeholder-owned" sx={{ display: 'none', height: 100, pt: 1, backgroundColor: '#eee', textAlign: 'center', color: '#999'}}>
                        <HelpCircle size={32} style={{marginTop: '15px'}}/>
                        <Typography variant="caption">{shopText.imageMissing}</Typography>
                      </Box>
                      <CardContent sx={{ flexGrow: 1, p: 1, textAlign: 'center', display: 'flex', flexDirection: 'column' }}> 
                        <Typography gutterBottom variant="body2" component="div" sx={{ fontFamily: 'SourGummy, sans-serif', fontWeight: 600, lineHeight: 1.2 }}>
                          {shopText[`skin_${skin.id}`] || skin.name}
                        </Typography>
                        
                        <Box sx={{ mt: -0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}> 
                          {isCurrentlyEquipped ? (
                            <Box
                              component="img"
                              src={langKey === 'es' ? spanishEquippedButtonImage : finalEquippedButtonImage}
                              alt={shopText.equippedAlt} 
                              sx={{
                                width: 'auto',
                                height: '70px',
                                display: 'block',
                                mx: 'auto'
                              }}
                            />
                          ) : (
                            <Box
                              component="img"
                              src={langKey === 'es' ? spanishEquipButtonImage : updatedEquipButtonImage}
                              alt={shopText.equipAlt} 
                              onClick={() => handleEquip(skin.id)}
                              sx={{
                                width: 'auto',
                                height: '70px',
                                cursor: 'pointer',
                                display: 'block',
                                mx: 'auto',
                                transition: 'transform 0.1s ease',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                }
                              }}
                            />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
            
            {purchasedSkins.length === 0 && !isLoading && (
              <Typography sx={{textAlign: 'center', fontFamily: 'SourGummy, sans-serif', color: 'text.secondary', mt: 2}}>
                {shopText.buyPrompt}
              </Typography>
            )}
          </Paper>
        </Paper>
      </Container>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Shop;

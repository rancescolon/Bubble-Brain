// ShopContext.jsx - Provides state and functions for the shop system
// Manages bubbleBucks, purchased skins, equipped skins, and shop interactions
import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
// Import skin images
import scarfImage from '../assets/brainwithscarf1.png';
import kingImage from '../assets/bubblebrainking1.png';
import pirateImage from '../assets/bubblebrainpirate1.png';
import wizardImage from '../assets/bubblebrainwizard1.png';
import evilOctopusImage from '../assets/bubblebraineviloctopus1.png';
import sleepyImage from '../assets/bubblebrainsleepy1.png';
import mysteryImage from '../assets/drbubblebrainmystery1.png';
import robberImage from '../assets/finalrobberbrain1.png';
import fishermanImage from '../assets/evilfishermanbrain1.png';
import mindControlImage from '../assets/mindcontrolbrain.PNG';
import scroogeImage from '../assets/Scrooge_McBubble.png';
import dirtyBubbleImage from '../assets/Dirty_bubble.png';
import kittyImage from '../assets/Bubble_kitty.png';
import wazowskiImage from '../assets/Bubble_Wazowski.png';
import airBubbleImage from '../assets/airBubble.png';

const ShopContext = createContext();
//The code for the ShopContext.jsx was assisted with the help of ChatGPT
// Rarity level definitions for skin categorization
export const rarityLevels = {
  common: {
    id: 'common',
    name: 'Coral Crawler',
    bgColor: '#f5f5dc',
    textColor: '#8B4513', 
    sortOrder: 0
  },
  uncommon: {
    id: 'uncommon',
    name: 'Kelp Kicker',
    bgColor: '#e8f5e9',
    textColor: '#388e3c', 
    sortOrder: 1
  },
  outlaw: {
    id: 'outlaw',
    name: 'Reefrunner Outlaw',
    bgColor: '#FF9094', 
    textColor: '#FF9094',
    sortOrder: 3
  },
  legendary: {
    id: 'legendary',
    name: 'Pearl Warden',
    bgColor: '#f3e5f5',
    textColor: '#6a1b9a', 
    sortOrder: 2
  },
  mythic: {
    id: 'mythic',
    name: 'Abyssborne',
    bgColor: '#0B0000', 
    textColor: '#0B0000', 
    sortOrder: 4
  },
};

// Default skin definition (free for all users)
const defaultSkin = {
  id: 'default',
  name: 'Dr. Bubbles (Default)',
  image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame-sxeNjAKs5YePSv0ET618soWjWdT1wY.png',
  logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame-V163AsalyIRqbHW6Fe7OWFHHuwoL99.png'
};

// Available skins that can be purchased in the shop
export const availableSkins = [
    {
    id: 'scarf1',
    name: 'Scarf Bubbles',
    price: 60, 
    rarityId: 'common',
    image: scarfImage,
    logo: scarfImage
  },
  {
    id: 'pirate1',
    name: 'Pirate Bubbles',
    price: 60, 
    rarityId: 'common',
    image: pirateImage,
    logo: pirateImage
  },
    {
    id: 'wazowski1',
    name: 'Bubble Wazowski',
    price: 60, 
    rarityId: 'common',
    image: wazowskiImage,
    logo: wazowskiImage
  },
  {
    id: 'airbubble1',
    name: 'Air Bubble',
    price: 60, 
    rarityId: 'common',
    image: airBubbleImage,
    logo: airBubbleImage
  },
  {
    id: 'sleepy1',
    name: 'Sleepy Bubbles',
    price: 100, 
    rarityId: 'uncommon',
    image: sleepyImage,
    logo: sleepyImage
  },
    {
    id: 'kitty1',
    name: 'Bubble Kitty',
    price: 100, 
    rarityId: 'uncommon',
    image: kittyImage,
    logo: kittyImage
  },
  {
    id: 'wizard1',
    name: 'Wizard Bubbles',
    price: 350, // Adjusted back?
    rarityId: 'legendary',
    image: wizardImage,
    logo: wizardImage
  },
  {
    id: 'king1',
    name: 'King Bubbles',
    price: 350, // Adjusted back?
    rarityId: 'legendary',
    image: kingImage,
    logo: kingImage
  },
  {
    id: 'scrooge1',
    name: 'Scrooge McBubble',
    price: 350, // Adjusted back?
    rarityId: 'legendary',
    image: scroogeImage,
    logo: scroogeImage
  },
  {
    id: 'eviloctopus1',
    name: 'Evil Octopus Bubbles',
    price: 600, // Adjusted back?
    rarityId: 'outlaw',
    image: evilOctopusImage,
    logo: evilOctopusImage
  },
  {
    id: 'robber1',
    name: 'Evil Robber Bubbles',
    price: 600, // Adjusted back?
    rarityId: 'outlaw',
    image: robberImage,
    logo: robberImage
  },
  {
    id: 'fisherman1',
    name: 'Evil Fisherman Bubbles',
    price: 600, // Adjusted back?
    rarityId: 'outlaw',
    image: fishermanImage,
    logo: fishermanImage
  },
  {
    id: 'dirtybubble1',
    name: 'Evil Dirty Bubble',
    price: 600, // Adjusted back?
    rarityId: 'outlaw',
    image: dirtyBubbleImage,
    logo: dirtyBubbleImage
  },
  {
    id: 'mystery1',
    name: 'Mystery Bubbles',
    price: 850, 
    rarityId: 'mythic',
    image: mysteryImage,
    logo: mysteryImage
  },
  {
    id: 'mindcontrol1',
    name: 'Mind Control Bubbles',
    price: 850, 
    rarityId: 'mythic',
    image: mindControlImage,
    logo: mindControlImage
  },
];

// The Shop Provider component manages all shop state and logic
export const ShopProvider = ({ children }) => {
  // State for shop data
  const [bubbleBucks, setBubbleBucks] = useState(0);
  const [purchasedSkins, setPurchasedSkins] = useState([]);
  const [equippedSkinId, setEquippedSkinId] = useState(defaultSkin.id);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize userId and token directly from sessionStorage
  const [userId, setUserId] = useState(() => {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) return null;
    try {
      const user = JSON.parse(userStr);
      return (typeof user === 'object' && user !== null && user.id !== undefined) ? user.id : userStr;
    } catch (e) {
      return userStr; // Fallback if not JSON
    }
  });
  const [token, setToken] = useState(() => sessionStorage.getItem('token'));

  // Effect to fetch user-specific shop data when userId or token state changes
  useEffect(() => {
    console.log("[ShopContext] Fetch Effect Triggered. Checking state...");
    console.log(`[ShopContext] Current state: UserID=${userId}, Token=${token ? 'Exists' : 'Missing'}`);

    // Check for userId and token state
    if (!userId || !token) {
      console.log("[ShopContext] No userId or token in state, skipping fetch.");
      setIsLoading(false); 
      // Reset state if we run without credentials (e.g., logout)
      setBubbleBucks(0);
      setPurchasedSkins([]);
      setEquippedSkinId(defaultSkin.id);
      return; 
    }

    // Proceed to fetch data
    console.log(`[ShopContext] UserId/Token found in state, proceeding to fetch.`);
    setIsLoading(true);

    // Define the async fetch function
    const fetchShopData = async () => {
      console.log(`[ShopContext] fetchShopData called for UserID: ${userId}`);
      // Reset the equipped skin immediately when fetching data for a new user?
      // setEquippedSkinId(defaultSkin.id);
      
      const fetchUrl = `${process.env.REACT_APP_API_PATH}/users/${userId}?_=${Date.now()}`;
      console.log(`[ShopContext] Fetching URL: ${fetchUrl}`);

      try {
        // First, check localStorage for cached data to use as fallback
        const lastKnownBucksKey = `lastKnownBubbleBucks_${userId}`;
        const lastKnownBucksStr = localStorage.getItem(lastKnownBucksKey);
        const cachedBubbleBucks = lastKnownBucksStr ? parseInt(lastKnownBucksStr, 10) : 0;
        
        // Also check for cached skins
        const lastKnownSkinsKey = `lastKnownPurchasedSkins_${userId}`;
        const lastKnownSkinsStr = localStorage.getItem(lastKnownSkinsKey);
        let cachedSkins = [];
        try {
          if (lastKnownSkinsStr) {
            const parsed = JSON.parse(lastKnownSkinsStr);
            cachedSkins = Array.isArray(parsed) ? parsed : [];
            console.log("[ShopContext] Found cached skins:", cachedSkins);
          }
        } catch (e) {
          console.error("[ShopContext] Error parsing cached skins:", e);
        }
        
        // Check for cached equipped skin ID - user specific
        const lastEquippedSkinIdKey = `lastEquippedSkinId_${userId}`;
        const cachedEquippedSkinId = localStorage.getItem(lastEquippedSkinIdKey);
        if (cachedEquippedSkinId && cachedEquippedSkinId !== defaultSkin.id) {
          console.log("[ShopContext] Found cached equipped skin ID:", cachedEquippedSkinId);
        }
        
        // Fetch user data including bubbleBucks
        const response = await fetch(fetchUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`[ShopContext] Fetch response status: ${response.status}`);

        if (!response.ok) {
           let errorData = null;
           try { 
             errorData = await response.json(); 
             console.error("[ShopContext] Fetch error response body:", errorData);
           } catch(e) { 
             const textError = await response.text();
             console.error("[ShopContext] Fetch error response text:", textError);
             errorData = textError; 
           } 
           console.error(`[ShopContext] Failed to fetch user data: ${response.status}`, errorData);
           throw new Error(`Failed to fetch user data: ${response.status}`);
        }

        const userData = await response.json();
        console.log("[ShopContext] Raw user data received:", userData);
        const attributes = userData.attributes || {};

        // Log the raw data received from the server
        console.log("[ShopContext] Raw data received from server:", {
          attributes: JSON.stringify(attributes)
        });

        // Check if bubbleBucks are 0 but we have a non-zero cached value
        const fetchedBubbleBucks = attributes.bubbleBucks !== undefined ? attributes.bubbleBucks : 0;
        let finalBubbleBucks = fetchedBubbleBucks;
        
        // If server returned 0 but we have cached value, use cached and update server
        if (fetchedBubbleBucks === 0 && cachedBubbleBucks > 0) {
          console.log(`[ShopContext] Server returned 0 bubble bucks, but found cached value: ${cachedBubbleBucks}`);
          finalBubbleBucks = cachedBubbleBucks;
        }
        
        // Get fetched skins with fallback to empty array
        const fetchedSkins = attributes.purchasedSkins || [];
        
        // If we have cached skins but server returned empty/fewer, use cached
        let finalSkins = [...fetchedSkins];
        if (cachedSkins.length > fetchedSkins.length) {
          console.log(`[ShopContext] Server returned ${fetchedSkins.length} skins, but we have ${cachedSkins.length} cached`);
          // Combine both arrays without duplicates
          finalSkins = [...new Set([...fetchedSkins, ...cachedSkins])];
        }
        
        // Always save our latest user skin data with the correct user ID
        localStorage.setItem(lastKnownSkinsKey, JSON.stringify(finalSkins));
        
        // Get equipped skin with fallback to cached value or default
        let fetchedEquippedSkin = attributes.equippedSkinId || null;
        let finalEquippedSkin = fetchedEquippedSkin;
        
        // If the server returned no equipped skin ID but we have one in local storage, use that
        if ((!fetchedEquippedSkin || fetchedEquippedSkin === defaultSkin.id) && 
            cachedEquippedSkinId && cachedEquippedSkinId !== defaultSkin.id) {
          console.log(`[ShopContext] Server returned no equipped skin, using cached: ${cachedEquippedSkinId}`);
          finalEquippedSkin = cachedEquippedSkinId;
          
          // Verify the cached skin exists in our available skins
          const skinExists = availableSkins.some(skin => skin.id === cachedEquippedSkinId);
          if (!skinExists) {
            console.warn(`[ShopContext] Cached skin ID ${cachedEquippedSkinId} not found in available skins`);
            finalEquippedSkin = defaultSkin.id;
          }
        }
        
        // If equipped skin is not in purchased skins, add it (unless it's the default)
        if (finalEquippedSkin && finalEquippedSkin !== defaultSkin.id && !finalSkins.includes(finalEquippedSkin)) {
          console.log(`[ShopContext] Adding equipped skin ${finalEquippedSkin} to purchased skins`);
          finalSkins.push(finalEquippedSkin);
        }
        
        // Default to default skin if still no equipped skin
        if (!finalEquippedSkin) {
          finalEquippedSkin = defaultSkin.id;
        }
        
        // Check if we need to update the backend
        const needsBackendUpdate = (
          (fetchedBubbleBucks === 0 && cachedBubbleBucks > 0) || 
          (cachedSkins.length > fetchedSkins.length) ||
          (cachedEquippedSkinId && cachedEquippedSkinId !== fetchedEquippedSkin)
        );
        
        if (needsBackendUpdate) {
          // Immediately update backend to ensure data persistence
          console.log("[ShopContext] Detected data loss, updating backend with cached data");
          updateBackendUserData({
            bubbleBucks: finalBubbleBucks,
            purchasedSkins: finalSkins,
            equippedSkinId: finalEquippedSkin
          }).then(success => {
            if (success) {
              console.log("[ShopContext] Successfully restored data from cache");
            } else {
              console.error("[ShopContext] Failed to restore data from cache");
            }
          });
        }

        // Update state with our final data
        setBubbleBucks(finalBubbleBucks); 
        setPurchasedSkins(finalSkins);
        setEquippedSkinId(finalEquippedSkin);
        
        // Always update localStorage with current data - user specific
        localStorage.setItem(lastEquippedSkinIdKey, finalEquippedSkin);

        // Cache current data for future sessions
        if (finalBubbleBucks > 0) {
          localStorage.setItem(lastKnownBucksKey, finalBubbleBucks.toString());
        }
        
        console.log("[ShopContext] State updated from fetch:", {
          bucks: finalBubbleBucks,
          skins: finalSkins,
          equipped: finalEquippedSkin,
        });

        console.log("[ShopContext] State updated successfully after fetch.");

      } catch (error) {
        console.error("[ShopContext] Error caught during fetchShopData execution:", error);
        
        // On error, try to recover from cache with user-specific keys
        const lastKnownBucksKey = `lastKnownBubbleBucks_${userId}`;
        const lastKnownBucksStr = localStorage.getItem(lastKnownBucksKey);
        const cachedBubbleBucks = lastKnownBucksStr ? parseInt(lastKnownBucksStr, 10) : null;
        
        const lastKnownSkinsKey = `lastKnownPurchasedSkins_${userId}`;
        const lastKnownSkinsStr = localStorage.getItem(lastKnownSkinsKey);
        
        let cachedSkins = null;
        try {
          if (lastKnownSkinsStr) {
            const parsed = JSON.parse(lastKnownSkinsStr);
            cachedSkins = Array.isArray(parsed) ? parsed : null;
          }
        } catch (e) {
          console.error("[ShopContext] Error parsing cached skins during recovery:", e);
        }
        
        // Get cached equipped skin ID - user specific
        const cachedEquippedSkinId = localStorage.getItem(`lastEquippedSkinId_${userId}`);
        
        // Only update state from cache if we have data
        if (cachedBubbleBucks !== null) {
          console.log("[ShopContext] Restoring bubble bucks from cache after fetch error:", cachedBubbleBucks);
          setBubbleBucks(cachedBubbleBucks);
        }
        
        if (cachedSkins !== null && cachedSkins.length > 0) {
          console.log("[ShopContext] Restoring skins from cache after fetch error:", cachedSkins);
          setPurchasedSkins(cachedSkins);
        }
        
        if (cachedEquippedSkinId && cachedEquippedSkinId !== defaultSkin.id) {
          console.log("[ShopContext] Restoring equipped skin from cache after fetch error:", cachedEquippedSkinId);
          setEquippedSkinId(cachedEquippedSkinId);
        }
      } finally {
        // Ensure loading is set to false regardless of success or failure
        console.log("[ShopContext] fetchShopData finally block reached, setting loading to false.");
        setIsLoading(false);
      }
    };

    // Call the fetch function
    fetchShopData();

    // Run when userId or token state changes
  }, [userId, token]); // Dependency array includes userId and token state

  // Function to manually refresh user data
  const refreshUserData = async (explicitUserId = null, explicitToken = null) => {
    console.log("[ShopContext] Manual refresh requested.", { explicitUserId, explicitToken: explicitToken ? 'Yes' : 'No' });

    // Determine effective credentials: use explicit args if provided, else fallback to state
    const effectiveUserId = explicitUserId ?? userId;
    const effectiveToken = explicitToken ?? token;
    console.log(`[ShopContext] Effective credentials for refresh: UserID=${effectiveUserId}, Token=${effectiveToken ? 'Exists' : 'Missing'}`);

    // Use effective credentials for the check
    if (!effectiveUserId || !effectiveToken) {
      console.error("[ShopContext] Cannot fetch shop data: effective userId or token missing.", { effectiveUserId, hasEffectiveToken: !!effectiveToken });
      setIsLoading(false); // Ensure loading is false if we abort early
      return Promise.resolve(false);
    }

    // If already loading, don't start another fetch (use internal isLoading state)
    if (isLoading) {
      console.log("[ShopContext] Already loading data, skipping refresh request");
      return Promise.resolve(false);
    }
    
    // Set loading state
    setIsLoading(true);
    
    try {
      console.log(`[ShopContext] Fetching shop data for UserID: ${effectiveUserId}`);
      
      // Fetch user data using effective credentials
      let response;
      try {
        response = await fetch(`${process.env.REACT_APP_API_PATH}/users/${effectiveUserId}?_=${Date.now()}`, {
          headers: { Authorization: `Bearer ${effectiveToken}` }
        });
      } catch (fetchError) {
        console.error("[ShopContext] Network error during fetch:", fetchError);
        throw new Error(`Network error: ${fetchError.message}`);
      }
      
      // Handle non-OK responses
      if (!response.ok) {
        // Try to get error details from response
        let errorDetails = "";
        try {
          const errorData = await response.json();
          errorDetails = JSON.stringify(errorData);
        } catch (e) {
          errorDetails = await response.text() || response.statusText;
        }
        
        console.error(`[ShopContext] Server returned ${response.status}: ${errorDetails}`);
        throw new Error(`Server responded with status: ${response.status} - ${errorDetails}`);
      }

      let userData;
      try {
        userData = await response.json();
      } catch (jsonError) {
        console.error("[ShopContext] Error parsing response JSON:", jsonError);
        throw new Error(`Invalid JSON response: ${jsonError.message}`);
      }
      
      // Validate response data structure
      if (!userData || typeof userData !== 'object') {
        console.error("[ShopContext] Invalid user data format received:", userData);
        throw new Error("Invalid user data format received");
      }
      
      const attributes = userData.attributes || {};
      
      // Log the raw data
      console.log("[ShopContext] Raw data received:", userData);
      console.log("[ShopContext] Attributes processed:", attributes);

      // Extract and validate user data
      const fetchedBubbleBucks = attributes.bubbleBucks;
      const fetchedSkins = attributes.purchasedSkins || [];
      const fetchedEquippedSkinId = attributes.equippedSkinId || defaultSkin.id;
      
      // Validate bubbleBucks is a number
      const validBubbleBucks = typeof fetchedBubbleBucks === 'number' ? fetchedBubbleBucks : bubbleBucks;
      
      // Validate the skins array
      const validSkins = Array.isArray(fetchedSkins) ? fetchedSkins : purchasedSkins;
      
      // Validate equippedSkinId is a string
      const validEquippedSkinId = fetchedEquippedSkinId ? fetchedEquippedSkinId : equippedSkinId;
      
      console.log("[ShopContext] Data after validation:", {
        bubbleBucks: validBubbleBucks,
        purchasedSkins: validSkins,
        equippedSkinId: validEquippedSkinId
      });

      // Only update state if values are valid and different from current state
      let stateChanged = false;
      
      if (validBubbleBucks !== bubbleBucks) {
        setBubbleBucks(validBubbleBucks);
        stateChanged = true;
      }
      
      if (JSON.stringify(validSkins) !== JSON.stringify(purchasedSkins)) {
        setPurchasedSkins(validSkins);
        stateChanged = true;
      }
      
      if (validEquippedSkinId !== equippedSkinId) {
        setEquippedSkinId(validEquippedSkinId);
        stateChanged = true;
      }

      // Log the result
      console.log("[ShopContext] Refresh completed. State changed:", stateChanged);
      
      return Promise.resolve(true);
    } catch (error) {
      console.error("[ShopContext] Failed to refresh user data:", error);
      return Promise.resolve(false);
    } finally {
      // Ensure loading is set to false after refresh attempt
      console.log("[ShopContext] refreshUserData finally block reached, setting loading to false.");
      setIsLoading(false);
    }
  };

  // Function to update user attributes in the backend
  const updateBackendUserData = async (dataToUpdate) => {
    if (!userId || !token) {
      console.error("[ShopContext] Cannot update backend: userId or token missing.");
      return false;
    }
    if (Object.keys(dataToUpdate).length === 0) {
       console.warn("[ShopContext] updateBackendUserData called with empty data.");
       return true; 
    }
    
    // Prevent sending null values that could erase data
    Object.keys(dataToUpdate).forEach(key => {
      if (dataToUpdate[key] === null) {
        console.error(`[ShopContext] Preventing null value for key ${key} from being sent to backend`);
        delete dataToUpdate[key];
      }
    });
    
    // Add safeguards for critical attributes
    if (dataToUpdate.purchasedSkins && !Array.isArray(dataToUpdate.purchasedSkins)) {
      console.error(`[ShopContext] Invalid purchasedSkins format: ${typeof dataToUpdate.purchasedSkins}`);
      return false;
    }
    
    // Ensure purchasedSkins doesn't get emptied accidentally
    if (dataToUpdate.purchasedSkins && dataToUpdate.purchasedSkins.length === 0 && purchasedSkins.length > 0) {
      console.error(`[ShopContext] Preventing overwrite of purchasedSkins with empty array`);
      return false;
    }

    const requestBody = { attributes: dataToUpdate };
    console.log("[ShopContext] Attempting to update backend with body:", JSON.stringify(requestBody));
    try {
      const response = await fetch(`${process.env.REACT_APP_API_PATH}/users/${userId}?_=${Date.now()}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[ShopContext] Backend update failed: ${response.status}`, errorBody);
        return false;
      }
      
      // Log the success with detail
      console.log("[ShopContext] Backend update successful for:", Object.keys(dataToUpdate).join(', '));
      console.log("[ShopContext] Updated values:", JSON.stringify(dataToUpdate));
      
      return true;
    } catch (error) {
      console.error("Error updating backend:", error);
      return false;
    }
  };

  // Function to purchase a skin
  const buySkin = async (skinId) => {
    if (isLoading) { 
      console.warn("[ShopContext] buySkin called while loading."); 
      return false;
    }
    
    const skin = availableSkins.find(s => s.id === skinId);
    if (!skin) { 
      console.error('[ShopContext] buySkin: Skin not found', skinId); 
      return false; 
    }
    
    if (purchasedSkins.includes(skinId)) { 
      console.warn('[ShopContext] buySkin: Skin already purchased', skinId); 
      return true; // Return true if already purchased
    }

    console.log("[ShopContext] Attempting to buy skin:", skinId, "Current bubbleBucks:", bubbleBucks, "Price:", skin.price);

    // Check affordability using internal state
    if (bubbleBucks >= skin.price) {
      const newBucks = bubbleBucks - skin.price;
      const newSkins = [...purchasedSkins, skinId];

      // Optimistic Update (bucks and skins)
      const previousBucks = bubbleBucks;
      const previousSkins = [...purchasedSkins];
      setBubbleBucks(newBucks);
      setPurchasedSkins(newSkins);
      console.log("[ShopContext] Optimistically updated state for buySkin", { newBucks, newSkins });

      // Update Backend
      const success = await updateBackendUserData({
        bubbleBucks: newBucks,
        purchasedSkins: newSkins
      });

      if (!success) {
        // Revert optimistic update if backend update fails
        console.log("[ShopContext] Backend update failed, reverting to previous state:", { previousBucks, previousSkins });
        setBubbleBucks(previousBucks);
        setPurchasedSkins(previousSkins);
        console.error('[ShopContext] Failed to save purchase to backend. Reverting state.');
        return false;
      }
      console.log(`[ShopContext] Successfully purchased and saved skin: ${skin.name}`);
      return true;
    } else {
      console.warn('[ShopContext] buySkin: Not enough Bubble Bucks', { have: bubbleBucks, need: skin.price });
      return false;
    }
  };

  // Function to equip a skin
  const equipSkin = async (skinId) => {
    if (isLoading) { 
      console.warn("[ShopContext] equipSkin called while loading."); 
      return; 
    }
    
    if (skinId === equippedSkinId) { 
      console.warn("[ShopContext] equipSkin: Skin already equipped", skinId); 
      return; 
    }

    console.log("[ShopContext] Equipping skin:", skinId, "Current equipped:", equippedSkinId, "Purchased skins:", [...purchasedSkins]);

    const skinToEquip = availableSkins.find(s => s.id === skinId);
    const isDefault = skinId === defaultSkin.id;

    // Don't check purchasedSkins for the default skin
    if (isDefault || purchasedSkins.includes(skinId)) {
      const oldEquippedSkinId = equippedSkinId;
      // Optimistic update
      setEquippedSkinId(skinId);
      
      // Save to localStorage to persist across navigation - using user-specific key
      const localStorageKey = userId ? `lastEquippedSkinId_${userId}` : 'lastEquippedSkinId';
      localStorage.setItem(localStorageKey, skinId);
      
      console.log("[ShopContext] Optimistically updated state for equipSkin", { 
        newSkinId: skinId,
        purchasedSkins: [...purchasedSkins],
        bubbleBucks
      });

      // Update backend
      const success = await updateBackendUserData({ equippedSkinId: skinId });

      if (!success) {
        // Revert optimistic update if backend update fails
        setEquippedSkinId(oldEquippedSkinId);
        localStorage.setItem(localStorageKey, oldEquippedSkinId);
        console.error('[ShopContext] Failed to save equipped skin to backend. Reverting state.');
      } else {
        console.log(`[ShopContext] Successfully equipped and saved skin ID: ${skinId}`);
      }
    } else {
      console.error('[ShopContext] Cannot equip skin: not purchased or invalid ID.', skinId);
    }
  };

  // Function to add Bubble Bucks
  const addBubbleBucks = (amount) => {
    if (typeof amount === 'number' && amount !== 0) {
      const newBucks = bubbleBucks + amount;
      // Optimistic update (caller should handle backend update if needed)
      setBubbleBucks(newBucks);
      console.log(`[ShopContext] Optimistically updated Bubble Bucks by ${amount}. New optimistic total: ${newBucks}`);
      return true; // Indicate optimistic success
    } else {
      console.warn(`[ShopContext] Invalid amount passed to addBubbleBucks: ${amount}`);
      return false;
    }
  };

  // Function to get the currently equipped skin
  const getEquippedSkin = () => {
    const currentEquipped = equippedSkinId || defaultSkin.id;
    if (currentEquipped === defaultSkin.id) {
        return defaultSkin;
    }
    // Find in availableSkins, default if somehow equipped ID isn't in available list
    return availableSkins.find(s => s.id === currentEquipped) || defaultSkin;
  };

  // Function to clear all user-specific data (called during logout)
  const clearUserData = () => {
    console.log("[ShopContext] Clearing user state (not storage)");
    setBubbleBucks(0);
    setPurchasedSkins([]);
    setEquippedSkinId(defaultSkin.id);
    setUserId(null); // Clear userId state
    setToken(null); // Clear token state
    setIsLoading(false); // Ensure loading is false after clearing
  };

  // Context value with all state and functions
  const value = {
    bubbleBucks,
    purchasedSkins,
    setPurchasedSkins, // Export this setter for Shop component
    equippedSkinId,
    buySkin,
    equipSkin,
    getEquippedSkin,
    addBubbleBucks,
    updateBackendUserData, 
    availableSkins,
    defaultSkin,
    rarityLevels,
    isLoading, 
    userId,
    token,
    refreshUserData,
    clearUserData, // Add the new function to the context
    // Expose state setters
    setUserId, 
    setToken,
    // Expose missing state setters
    setBubbleBucks,
    setEquippedSkinId,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

// Custom hook to use the ShopContext
export const useShop = () => useContext(ShopContext); 
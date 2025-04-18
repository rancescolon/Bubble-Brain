import React, { createContext, useState, useContext, useEffect } from 'react';

// Import your background images
import defaultBackground from '../assets/image3.png';
import background1 from '../assets/fish1.png';
import background2 from '../assets/fish2.png';
import background3 from '../assets/fish3.png';
import background4 from '../assets/coolfish.png';
import background5 from '../assets/coolfish.png';

// Define background options
export const backgroundOptions = [
  { id: 'default', image: defaultBackground, name: 'Default' },
  { id: 'bg1', image: background1, name: 'Blue Gradient' },
  { id: 'bg2', image: background2, name: 'Purple Waves' },
  { id: 'bg3', image: background3, name: 'Green Nature' },
  { id: 'bg4', image: background4, name: 'Orange Sunset' },
  { id: 'bg5', image: background5, name: 'Aesthetic' },
];

// Create the context
const BackgroundContext = createContext();

/**
 * BackgroundProvider - Context provider for app-wide background state
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.Component}
 */
export const BackgroundProvider = ({ children }) => {
  // State for current background
  const [currentBackground, setCurrentBackground] = useState(() => {
    // Initialize from localStorage if available
    const savedBgId = localStorage.getItem('selectedBackground');
    return backgroundOptions.find(bg => bg.id === savedBgId) || backgroundOptions[0];
  });

  // Handle background change
  const changeBackground = (backgroundOption) => {
    setCurrentBackground(backgroundOption);
    localStorage.setItem('selectedBackground', backgroundOption.id);
    
    // Optional: Show notification or feedback (integrate with your notification system)
    if (window.showNotification) {
      window.showNotification({
        message: `Background changed to ${backgroundOption.name}`,
        severity: 'success',
      });
    }
  };

  // Context value
  const value = {
    backgroundOptions,
    currentBackground,
    changeBackground,
    currentBackgroundId: currentBackground.id,
  };

  return (
    <BackgroundContext.Provider value={value}>
      {children}
    </BackgroundContext.Provider>
  );
};

// Custom hook for using the background context
export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};

export default BackgroundContext;
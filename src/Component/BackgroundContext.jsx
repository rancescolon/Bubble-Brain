import React, { createContext, useState, useContext, useEffect } from 'react';

// Import your background images
import defaultBackground from '../assets/image3.png';
import background1 from '../assets/City-life.jpg';
import background2 from '../assets/Home.png';
import background3 from '../assets/war.png';
import background4 from '../assets/coolfish.png';

// Define background options
export const backgroundOptions = [
  { id: 'default', image: defaultBackground, name: 'Default' },
  { id: 'bg1', image: background1, name: 'City Life' },
  { id: 'bg2', image: background2, name: 'Home' },
  { id: 'bg3', image: background3, name: 'War' },
  { id: 'bg4', image: background4, name: 'Realism' },
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
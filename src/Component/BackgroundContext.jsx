import React, { createContext, useState, useContext, useEffect } from 'react';
import { getSelectedLanguage } from "../App";

// Import your background images
import defaultBackground from '../assets/image3.png';
import background1 from '../assets/gang.png';
import background2 from '../assets/voyage.png';
import background3 from '../assets/war.png';
import background4 from '../assets/building.png';

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
  const language = getSelectedLanguage();
  const langKey = language === "English" ? "en" : "es";
  const backgroundText = text[langKey].background;

  // Define background options with translated names
  const backgroundOptions = [
    { id: 'default', image: defaultBackground, name: backgroundText.names.default },
    { id: 'bg1', image: background1, name: backgroundText.names.lifeOfCrime },
    { id: 'bg2', image: background2, name: backgroundText.names.voyage },
    { id: 'bg3', image: background3, name: backgroundText.names.war },
    { id: 'bg4', image: background4, name: backgroundText.names.construction },
  ];

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
        message: backgroundText.notifications.backgroundChanged.replace('{{name}}', backgroundOption.name),
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
    language,
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
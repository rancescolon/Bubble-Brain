import React from 'react';
import { Box } from '@mui/material';
import { useBackground } from './BackgroundContext';
import BackgroundSelector from './BackgroundSelector';
import { getSelectedLanguage } from "../App";
import text from "../text.json";

/**
 * AppWrapper - Wraps the entire app with background styling
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {React.Component}
 */
const AppWrapper = ({ children }) => {
  const { backgroundOptions, currentBackground, changeBackground, currentBackgroundId, language } = useBackground();
  const langKey = language === "English" ? "en" : "es";
  const appWrapperText = text[langKey].appWrapper;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
        backgroundImage: `url(${currentBackground.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        transition: 'background-image 0.5s ease-in-out',
      }}
    >
      {/* Background Selector */}
      <BackgroundSelector
        backgroundOptions={backgroundOptions}
        onBackgroundChange={changeBackground}
        currentBackgroundId={currentBackgroundId}
        position="bottom-right"
        miniPalette={true}
        title={appWrapperText.backgroundSelector.title}
        selectLabel={appWrapperText.backgroundSelector.selectBackground}
        currentLabel={appWrapperText.backgroundSelector.currentBackground}
      />

      {/* App Content */}
      {children}
    </Box>
  );
};

export default AppWrapper;
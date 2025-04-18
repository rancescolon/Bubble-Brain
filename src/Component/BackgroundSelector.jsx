import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Tooltip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Slide,
} from '@mui/material';
import { Image } from 'lucide-react';
import { styled } from '@mui/material/styles';

// Styled thumbnail component for background options
const BackgroundThumbnail = styled(Box)(({ selected }) => ({
  width: '100%',
  height: '60px',
  borderRadius: '8px',
  cursor: 'pointer',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  transition: 'transform 0.2s, box-shadow 0.2s',
  border: selected ? '3px solid #1D6EF1' : '3px solid transparent',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
  },
}));

// Slide up transition for the mini palette
const SlideTransition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * BackgroundSelector - A reusable component for selecting backgrounds
 * 
 * @param {Object} props
 * @param {Array} props.backgroundOptions - Array of background options with format [{id, image, name}]
 * @param {Function} props.onBackgroundChange - Callback function when background is changed
 * @param {string} props.currentBackgroundId - ID of the currently selected background
 * @param {Object} props.style - Additional styles for the button container
 * @param {string} props.position - Position of the button ('top-right', 'top-left', 'bottom-right', 'bottom-left')
 * @param {boolean} props.miniPalette - Whether to show a mini palette instead of full dialog
 * @returns {React.Component}
 */
const BackgroundSelector = ({
  backgroundOptions,
  onBackgroundChange,
  currentBackgroundId,
  style = {},
  position = 'top-right',
  miniPalette = false,
}) => {
  const [showSelector, setShowSelector] = useState(false);
  const [quickPalette, setQuickPalette] = useState(false);

  // Position styles mapping
  const positionStyles = {
    'top-right': { top: 16, right: 16 },
    'top-left': { top: 16, left: 16 },
    'bottom-right': { bottom: 16, right: 16 },
    'bottom-left': { bottom: 16, left: 16 },
  };

  // Get current background object
  const currentBackground = backgroundOptions.find(bg => bg.id === currentBackgroundId) || backgroundOptions[0];

  const handleBackgroundChange = (bgOption) => {
    onBackgroundChange(bgOption);
    setShowSelector(false);
    setQuickPalette(false);
  };

  // Show quick palette with most recent selections
  const toggleQuickPalette = () => {
    if (miniPalette) {
      setQuickPalette(!quickPalette);
    } else {
      setShowSelector(true);
    }
  };

  return (
    <>
      {/* Button Container */}
      <Box
        sx={{
          position: 'fixed',
          zIndex: 1000,
          ...positionStyles[position],
          ...style,
        }}
      >
        <Tooltip title="Change Background">
          <IconButton
            onClick={toggleQuickPalette}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.95)',
              },
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}
          >
            <Image size={24} color="#1D6EF1" />
          </IconButton>
        </Tooltip>

        {/* Mini Palette (when enabled) */}
        {miniPalette && quickPalette && (
          <Box
            sx={{
              position: 'absolute',
              bottom: position.includes('bottom') ? '48px' : 'auto',
              top: position.includes('top') ? '48px' : 'auto',
              right: position.includes('right') ? '0' : 'auto',
              left: position.includes('left') ? '0' : 'auto',
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '8px',
              p: 1,
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              width: '180px',
            }}
          >
            <Grid container spacing={1}>
              {backgroundOptions.slice(0, 5).map((bg) => (
                <Grid item xs={6} key={bg.id}>
                  <Tooltip title={bg.name}>
                    <BackgroundThumbnail
                      selected={currentBackgroundId === bg.id}
                      onClick={() => handleBackgroundChange(bg)}
                      sx={{
                        backgroundImage: `url(${bg.image})`,
                        height: '40px',
                      }}
                    />
                  </Tooltip>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt: 1, textAlign: 'center' }}>
              <Button 
                size="small" 
                onClick={() => {
                  setQuickPalette(false);
                  setShowSelector(true);
                }}
                sx={{ fontSize: '0.7rem' }}
              >
                More Options
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      {/* Full Dialog Selector */}
      <Dialog
        open={showSelector}
        onClose={() => setShowSelector(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Choose Background</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {backgroundOptions.map((bg) => (
              <Grid item xs={6} sm={5} key={bg.id}>
                <BackgroundThumbnail
                  selected={currentBackgroundId === bg.id}
                  onClick={() => handleBackgroundChange(bg)}
                  sx={{
                    backgroundImage: `url(${bg.image})`,
                  }}
                />
                <Typography align="center" variant="body2" sx={{ mt: 0.5 }}>
                  {bg.name}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSelector(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BackgroundSelector;
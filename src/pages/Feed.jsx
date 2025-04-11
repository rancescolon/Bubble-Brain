import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
} from '@mui/material';
import CreatePost from '../Component/CreatePost';
import PostFeed from '../Component/PostFeed';
import { useContext } from 'react';
import { BackgroundContext } from '../App';

const Feed = () => {
  const { currentBackground } = useContext(BackgroundContext);
  const [refreshFeed, setRefreshFeed] = useState(false);

  const handlePostCreated = () => {
    setRefreshFeed(prev => !prev);
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: "#1D1D20",
        minHeight: "100vh",
        backgroundImage: `url(${currentBackground.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        opacity: 1.0,
        width: "100%",
        maxWidth: "100vw",
        overflowX: "hidden",
        position: "relative",
        py: 4,
      }}
    >
      <Container 
        maxWidth="lg"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="h2"
          align="center"
          sx={{
            color: '#FFFFFF',
            mb: 4,
            fontFamily: "SourGummy, sans-serif",
            fontWeight: 800,
            fontSize: { xs: "32px", md: "48px" },
          }}
        >
          Social Feed
        </Typography>

        <Box 
          sx={{ 
            width: "100%",
            maxWidth: "800px",
            mb: 4,
          }}
        >
          <CreatePost onPostCreated={handlePostCreated} />
        </Box>

        <Box 
          sx={{ 
            width: "100%",
            maxWidth: "800px",
          }}
        >
          <PostFeed key={refreshFeed} />
        </Box>
      </Container>
    </Box>
  );
};

export default Feed; 
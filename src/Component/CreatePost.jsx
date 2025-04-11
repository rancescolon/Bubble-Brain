import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { PhotoCamera, VideoLibrary, Public, People, Lock } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const API_BASE_URL = "https://webdev.cse.buffalo.edu/hci/api/api/droptable";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const CreatePost = ({ onPostCreated }) => {
  const [postText, setPostText] = useState("");
  const [audience, setAudience] = useState("public");
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handlePostTextChange = (event) => {
    setPostText(event.target.value);
  };

  const handleAudienceChange = (event) => {
    setAudience(event.target.value);
  };

  const handleSubmit = async () => {
    if (!postText.trim()) {
      setError("Please add some content to your post");
      return;
    }

    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("user");

    if (!token || !userId) {
      setError("Please log in to create a post");
      return;
    }

    setUploading(true);

    try {
      // Create the post without media
      const postData = {
        authorID: Number(userId),
        content: JSON.stringify({
          text: postText,
          audience: audience,
          hasMedia: false
        }),
        type: "social_post",
        attributes: {
          audience: audience,
          mediaCount: 0,
        }
      };

      const postResponse = await fetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      if (!postResponse.ok) {
        throw new Error("Failed to create post");
      }

      // Reset form and show success message
      setPostText("");
      setAudience("public");
      setShowSuccess(true);
      setError(null);

      // Notify parent component that a new post was created
      if (onPostCreated) {
        onPostCreated();
      }

    } catch (err) {
      console.error("Error creating post:", err);
      setError(err.message || "Failed to create post");
    } finally {
      setUploading(false);
    }
  };

  const getAudienceIcon = () => {
    switch (audience) {
      case "public":
        return <Public />;
      case "connections":
        return <People />;
      case "private":
        return <Lock />;
      default:
        return <Public />;
    }
  };

  return (
    <Box sx={{ 
      maxWidth: 600, 
      mx: "auto", 
      p: 2,
      bgcolor: "#FFFFFF",
      borderRadius: 2,
      boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
      '& .MuiTextField-root': {
        mb: 2,
        width: '100%',
      },
      '& .MuiButton-root': {
        mt: 2,
      },
      '& .MuiFormControl-root': {
        mb: 2,
        width: '100%',
      }
    }}>
      <Typography 
        variant="h6" 
        gutterBottom
        sx={{
          fontFamily: "SourGummy, sans-serif",
          fontWeight: 600,
          color: "#1D1D20",
          mb: 3
        }}
      >
        Create Post
      </Typography>

      <TextField
        fullWidth
        multiline
        rows={4}
        placeholder="What's on your mind?"
        value={postText}
        onChange={handlePostTextChange}
        disabled={uploading}
        sx={{ 
          mb: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: '#F4FDFF',
          }
        }}
      />

      {/* Audience Selection */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Audience</InputLabel>
        <Select
          value={audience}
          onChange={handleAudienceChange}
          disabled={uploading}
          startAdornment={getAudienceIcon()}
        >
          <MenuItem value="public">Public</MenuItem>
          <MenuItem value="connections">Connections Only</MenuItem>
          <MenuItem value="private">Private</MenuItem>
        </Select>
      </FormControl>

      {/* Submit Button */}
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={!postText.trim() || uploading}
        fullWidth
        sx={{
          bgcolor: "#1D6EF1",
          "&:hover": {
            bgcolor: "#1557B0",
          },
          "&:disabled": {
            bgcolor: "#E0E0E0",
          }
        }}
      >
        {uploading ? "Posting..." : "Post"}
      </Button>

      {/* Success Message */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert 
          severity="success" 
          onClose={() => setShowSuccess(false)}
          sx={{ width: '100%' }}
        >
          Post created successfully!
        </Alert>
      </Snackbar>

      {/* Error Message */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreatePost; 
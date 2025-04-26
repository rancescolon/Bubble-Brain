import React, { useState, useRef, useContext } from "react";
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
  Stack,
} from "@mui/material";
import { PhotoCamera, VideoLibrary, Public, People, Lock, Clear } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { BackgroundContext } from "../App"
import text from "../translations.json"

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
  const { language } = useContext(BackgroundContext);
  const langKey = language === "English" ? "en" : "es";
  const createPostText = text[langKey].createPost;

  const [postText, setPostText] = useState("");
  const [audience, setAudience] = useState("public");
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // New state for image upload
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const fileInputRef = useRef(null);

  const handlePostTextChange = (event) => {
    setPostText(event.target.value);
  };

  const handleAudienceChange = (event) => {
    setAudience(event.target.value);
  };
  
  // Add image change handler
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    
    if (file) {
      // File size validation
      const MAX_SIZE_KB = 100;
      const MAX_SIZE_BYTES = MAX_SIZE_KB * 1024;
      
      if (file.size > MAX_SIZE_BYTES) {
        setError(`File size exceeds the ${MAX_SIZE_KB}KB limit.`);
        return;
      }
      
      // Save file for later upload
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Add helper function for base64 conversion
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  // Remove image handler
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!postText.trim() && !imageFile) {
      setError("Please add some content or an image to your post");
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
      // Convert image to base64 if there is one
      let base64Image = null;
      if (imageFile) {
        base64Image = await convertFileToBase64(imageFile);
      }
      
      // Create post data with or without image
      const postData = {
        authorID: Number(userId),
        content: JSON.stringify({
          text: postText,
          audience: audience,
          hasMedia: !!imageFile,
          image: base64Image
        }),
        type: "social_post",
        attributes: {
          audience: audience,
          mediaCount: imageFile ? 1 : 0,
          hasImage: !!imageFile
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
      setImageFile(null);
      setImagePreview(null);
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
        {createPostText.title}
      </Typography>

      <TextField
        fullWidth
        multiline
        rows={4}
        placeholder={createPostText.placeholder}
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
      
      {/* Image Preview Area - Show only if there's an image */}
      {imagePreview && (
        <Box 
          sx={{
            position: "relative",
            mb: 2,
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            p: 1,
            bgcolor: "#F4FDFF",
          }}
        >
          <IconButton 
            sx={{ 
              position: "absolute", 
              top: 8, 
              right: 8, 
              bgcolor: "rgba(255,255,255,0.7)",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.9)",
              }
            }}
            onClick={handleRemoveImage}
            size="small"
          >
            <Clear />
          </IconButton>
          <Box
            component="img"
            src={imagePreview}
            alt="Preview"
            sx={{
              width: "100%",
              maxHeight: "200px",
              objectFit: "contain",
              borderRadius: 1,
            }}
          />
        </Box>
      )}
      
      {/* Media Options and Audience Selection in a flexbox row */}
      <Stack 
        direction="row" 
        spacing={2} 
        sx={{ 
          mb: 2,
          alignItems: "center"
        }}
      >
        {/* Image Upload Button */}
        <Button
          component="label"
          variant="outlined"
          startIcon={<PhotoCamera />}
          disabled={uploading}
          sx={{
            borderRadius: 2,
            color: "#1D6EF1",
            borderColor: "#1D6EF1",
            "&:hover": {
              borderColor: "#1557B0",
              bgcolor: "rgba(29, 110, 241, 0.04)",
            },
          }}
        >
          {createPostText.buttons.addPhoto}
          <VisuallyHiddenInput 
            type="file" 
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
          />
        </Button>
        
        {/* Audience Selection */}
        <FormControl sx={{ flexGrow: 1 }}>
          <InputLabel>{createPostText.audience.label}</InputLabel>
          <Select
            value={audience}
            onChange={handleAudienceChange}
            disabled={uploading}
            startAdornment={getAudienceIcon()}
          >
            <MenuItem value="public">{createPostText.audience.public}</MenuItem>
            <MenuItem value="connections">{createPostText.audience.connections}</MenuItem>
            <MenuItem value="private">{createPostText.audience.private}</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Submit Button */}
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={(!postText.trim() && !imageFile) || uploading}
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
        {uploading ? createPostText.buttons.posting : createPostText.buttons.post}
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
          {createPostText.snackbar.success}
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
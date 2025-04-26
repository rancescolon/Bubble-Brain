import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Avatar,
  IconButton,
  CircularProgress,
  Grid,
  Divider,
  Paper,
  TextField,
  Button,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ThumbUp, Comment, Share, Favorite, FavoriteBorder, ChatBubbleOutline, Send, Delete } from '@mui/icons-material';
import { BackgroundContext } from "../App"
import text from "../translations.json"

const API_BASE_URL = "https://webdev.cse.buffalo.edu/hci/api/api/droptable";

const PostFeed = () => {
  const { language } = useContext(BackgroundContext);
  const langKey = language === "English" ? "en" : "es";
  const feedText = text[langKey].feedToggle;
  const alertsText = text[langKey].alerts;
  const buttonsText = text[langKey].buttons;
  const labelsText = text[langKey].labels;
  const errorsText = text[langKey].errors;
  const postText = text[langKey].post;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [userReactions, setUserReactions] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [feedView, setFeedView] = useState('public');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    type: null, // 'post' or 'comment'
    id: null,
    postId: null, // for comments
  });

  const getCurrentUserInfo = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.warn("No authentication token found");
        return null;
      }
      
      // Parse the JWT token to extract user ID
      // JWT tokens are in format: header.payload.signature
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          if (payload && payload.id) {
            console.log("Extracted user ID from token:", payload.id);
            sessionStorage.setItem("user", payload.id);
            return { id: payload.id };
          }
        }
      } catch (e) {
        console.warn("Could not parse JWT token", e);
      }
      
      // If we can't extract from token, look at session data
      const userID = sessionStorage.getItem("user");
                    
      if (userID) {
        console.log("Found user ID in storage:", userID);
        return { id: userID };
      }
      
      console.warn("Could not determine user ID");
      return null;
    } catch (error) {
      console.error("Error getting user info:", error);
      return null;
    }
  };

  const fetchUserData = async (userIds) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      throw new Error("Please log in to view posts");
    }

    const userCache = {};
    for (const userId of userIds) {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      userCache[userId] = {
        email: data.email || "Not provided",
        username: data.attributes?.username || data.email?.split("@")[0] || "Anonymous User",
      };
      
      // Only save the current user's ID if it matches the one we're fetching
      const currentUserId = sessionStorage.getItem("user");
      if (String(userId) === String(currentUserId)) {
        if (!sessionStorage.getItem("user")) {
          console.log("Saving current user ID:", userId);
          sessionStorage.setItem("user", userId);
        }
      }
    }
    return userCache;
  };

  const fetchUserReactions = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to view reactions");
      }
      
      // Get user info which will set userID in sessionStorage
      await getCurrentUserInfo();
      const userId = sessionStorage.getItem("user");
      
      if (!userId) {
        console.warn("Could not determine user ID. Like functionality may be limited.");
        return; // Continue without user reactions rather than throwing error
      }
      
      console.log("Fetching reactions for user ID:", userId);

      // Get all reactions created by the current user
      const userReactionsResponse = await fetch(`${API_BASE_URL}/posts?type=post_reaction&authorID=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userReactionsResponse.ok) {
        throw new Error("Failed to fetch user reactions");
      }

      // Get all reactions for all posts to count likes
      const allReactionsResponse = await fetch(`${API_BASE_URL}/posts?type=post_reaction`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!allReactionsResponse.ok) {
        throw new Error("Failed to fetch all reactions");
      }

      // Process current user's reactions
      const userData = await userReactionsResponse.json();
      if (userData && userData[0]) {
        // Create a map of postId -> reaction for quick lookup
        const reactionMap = {};
        userData[0].forEach(reaction => {
          try {
            const attributes = reaction.attributes || {};
            if (attributes.additionalProps && attributes.additionalProps.postID) {
              reactionMap[attributes.additionalProps.postID] = reaction;
            }
          } catch (e) {
            console.error("Error processing reaction:", e);
          }
        });
        
        setUserReactions(reactionMap);
        
        // Create a map of liked posts
        const likedPostsMap = {};
        Object.keys(reactionMap).forEach(postId => {
          likedPostsMap[postId] = true;
        });
        
        setLikedPosts(likedPostsMap);
      }

      // Process all reactions to count likes per post
      const allData = await allReactionsResponse.json();
      if (allData && allData[0]) {
        // Count likes per post
        const counts = {};
        allData[0].forEach(reaction => {
          try {
            const attributes = reaction.attributes || {};
            if (attributes.additionalProps && attributes.additionalProps.postID) {
              const postId = attributes.additionalProps.postID;
              if (!counts[postId]) {
                counts[postId] = 0;
              }
              counts[postId]++;
            }
          } catch (e) {
            console.error("Error processing like count:", e);
          }
        });
        
        setLikeCounts(counts);
        console.log("Like counts:", counts);
      }
    } catch (err) {
      console.error("Error fetching reactions:", err);
    }
  };

  const fetchPosts = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to view posts");
      }
      const response = await fetch(`${API_BASE_URL}/posts?type=social_post&attributes.type=social_post`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      if (data && data[0]) {
        // Filter posts based on feedView
        const filteredPosts = data[0].filter(post => {
          if (typeof post.content === 'string') {
            try {
              const content = JSON.parse(post.content);
              if (feedView === 'public') {
                return content.audience === 'public';
              } else if (feedView === 'private' && currentUserId) {
                return content.audience === 'private' && String(post.authorID) === String(currentUserId);
              }
              return false;
            } catch (e) {
              // Skip posts with invalid content
              return false;
            }
          }
          return false; // Skip posts with non-string content
        });
        const userIds = [...new Set(filteredPosts.map(post => post.authorID))];
        const userCache = await fetchUserData(userIds);
        const socialPosts = filteredPosts.map(post => ({
          ...post,
          authorEmail: userCache[post.authorID]?.email || '',
          authorUsername: userCache[post.authorID]?.username || '',
        }));
        const sortedPosts = socialPosts.sort((a, b) => 
          new Date(b.created) - new Date(a.created)
        );
        setPosts(sortedPosts);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to view comments");
      }

      // Get all posts with type 'post_comment'
      const response = await fetch(`${API_BASE_URL}/posts?type=post_comment`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }

      const data = await response.json();
      if (data && data[0]) {
        // Create a map of postId -> array of comments
        const commentsMap = {};
        
        // We need to get user info for comment authors
        const userIds = [...new Set(data[0].map(comment => comment.authorID))];
        const userCache = await fetchUserData(userIds);
        
        // Process comments and organize by post ID
        for (const comment of data[0]) {
          try {
            const attributes = comment.attributes || {};
            if (attributes.additionalProps && attributes.additionalProps.postID) {
              const postId = attributes.additionalProps.postID;
              
              // Create entry for this post if it doesn't exist
              if (!commentsMap[postId]) {
                commentsMap[postId] = [];
              }
              
              // Add user info to comment
              const authorInfo = userCache[comment.authorID] || {
                username: "Unknown User",
                email: "unknown@example.com"
              };
              
              // Parse comment content
              let commentText = comment.content;
              try {
                // If content is JSON, parse it
                const contentObj = JSON.parse(comment.content);
                if (contentObj.text) {
                  commentText = contentObj.text;
                }
              } catch (e) {
                // Content is already a string
              }
              
              // Add comment to the map
              commentsMap[postId].push({
                id: comment.id,
                text: commentText,
                authorId: comment.authorID,
                authorUsername: authorInfo.username,
                authorEmail: authorInfo.email,
                created: comment.created
              });
            }
          } catch (e) {
            console.error("Error processing comment:", e);
          }
        }
        
        // Sort comments by date (newest first) for each post
        Object.keys(commentsMap).forEach(postId => {
          commentsMap[postId].sort((a, b) => new Date(b.created) - new Date(a.created));
        });
        
        setComments(commentsMap);
        console.log("Comments loaded:", commentsMap);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  useEffect(() => {
    const initializeComponent = async () => {
      // First get user info to ensure we have the user ID
      const userInfo = await getCurrentUserInfo();
      if (userInfo && userInfo.id) {
        setCurrentUserId(userInfo.id);
      }
      // Then fetch posts, reactions, and comments
      await Promise.all([
        fetchPosts(),
        fetchUserReactions(),
        fetchComments()
      ]);
    };
    initializeComponent();
  }, []);

  // Refetch posts when feedView changes
  useEffect(() => {
    fetchPosts();
  }, [feedView, currentUserId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLikeToggle = async (postId) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        alert("Please log in to like posts");
        return;
      }
      
      // Debug: Show post ID for troubleshooting
      console.log("Toggle like for post ID:", postId, "Type:", typeof postId);
      
      // Check if we need to initialize user info first
      if (!sessionStorage.getItem("user")) {
        await getCurrentUserInfo();
      }
      
      // Optimistically update UI first for better user experience
      setLikedPosts(prev => ({
        ...prev,
        [postId]: !prev[postId]
      }));
      
      if (likedPosts[postId]) {
        // If already liked, unlike it
        await unlikePost(postId);
      } else {
        // If not liked, like it
        await likePost(postId);
      }
      
    } catch (error) {
      console.error("Error toggling like:", error);
      
      // Revert the optimistic update if there was an error
      setLikedPosts(prev => ({
        ...prev,
        [postId]: !prev[postId] // Toggle back
      }));
      
      alert("Failed to update like status. Please try again.");
    }
  };

  const likePost = async (postId) => {
    const token = sessionStorage.getItem("token");
    
    if (!token) {
      throw new Error("Authentication required - no token found");
    }
    
    // Check if post is already liked
    if (likedPosts[postId]) {
      console.log("Post already liked, ignoring request");
      return null; // Post already liked, no need to do anything
    }
    
    // Get the current user info which will also set the userID in sessionStorage
    const userInfo = await getCurrentUserInfo();
    const userId = userInfo?.id || sessionStorage.getItem("user");
    
    if (!userId) {
      // If we still can't get a user ID, we need to abort
      alert("Could not determine your user ID. Please try logging out and back in.");
      throw new Error("Authentication required - could not determine user ID");
    }
    
    console.log(`Creating like for post ${postId} by user ${userId}`);
    
    // Format that matches the API docs exactly
    // Convert postId to string if it's not already
    const postIdStr = String(postId);
    const userIdStr = String(userId);
    
    // Try another format based on your screenshot
    const reactionData = {
      authorID: userIdStr,
      content: "like",
      type: "post_reaction",
      attributes: {
        additionalProps: {
          postID: postIdStr
        }
      }
    };
    
    console.log("Sending reaction data:", JSON.stringify(reactionData, null, 2));
    
    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reactionData),
      });
      
      const responseText = await response.text();
      console.log("API Response:", responseText);
      
      if (!response.ok) {
        console.error("API Error:", response.status, responseText);
        throw new Error(`Failed to like post: ${response.status}`);
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.warn("Could not parse response as JSON:", e);
        data = { id: Date.now().toString() }; // Fallback ID
      }
      
      // Update userReactions with the new reaction
      setUserReactions(prev => ({
        ...prev,
        [postId]: data
      }));
      
      // Update like counts
      setLikeCounts(prev => ({
        ...prev,
        [postId]: (prev[postId] || 0) + 1
      }));
      
      return data;
    } catch (error) {
      console.error("Error in likePost:", error);
      throw error;
    }
  };
  
  const unlikePost = async (postId) => {
    const token = sessionStorage.getItem("token");
    
    if (!token) {
      throw new Error("Authentication required - no token found");
    }
    
    // Check if post is not liked
    if (!likedPosts[postId]) {
      console.log("Post not liked, ignoring unlike request");
      return true; // Post not liked, nothing to do
    }
    
    // Find the reaction ID for this post
    const reaction = userReactions[postId];
    if (!reaction || !reaction.id) {
      console.warn("Reaction not found for postId:", postId);
      console.log("Available reactions:", userReactions);
      // If we can't find the reaction, let's just update the UI state
      // This can happen if the reaction was created in this session
      return true;
    }
    
    const response = await fetch(`${API_BASE_URL}/posts/${reaction.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error("Failed to unlike post");
    }
    
    // Remove from userReactions
    const updatedReactions = { ...userReactions };
    delete updatedReactions[postId];
    setUserReactions(updatedReactions);
    
    // Update like counts
    setLikeCounts(prev => ({
      ...prev,
      [postId]: Math.max((prev[postId] || 1) - 1, 0) // Ensure count doesn't go below 0
    }));
    
    return true;
  };

  // Add a comment to a post
  const addComment = async (postId, commentText) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to comment");
      }
      
      // Get the current user info
      await getCurrentUserInfo();
      const userId = sessionStorage.getItem("user");
      
      if (!userId) {
        alert("Could not determine your user ID. Please try logging out and back in.");
        throw new Error("Authentication required - could not determine user ID");
      }
      
      console.log(`Adding comment to post ${postId} by user ${userId}: "${commentText}"`);
      
      // Format for the comment - using the exact format needed by the API
      const commentData = {
        authorID: userId,
        content: JSON.stringify({ text: commentText }), // Structure content as JSON
        type: "post_comment",
        attributes: {
          additionalProps: {
            postID: String(postId)
          }
        }
      };
      
      console.log("Sending comment data:", JSON.stringify(commentData, null, 2));
      
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(commentData),
      });
      
      const responseText = await response.text();
      console.log("API Response for comment:", responseText);
      
      if (!response.ok) {
        console.error("API Error:", response.status, responseText);
        throw new Error(`Failed to add comment: ${response.status}`);
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.warn("Could not parse response as JSON:", e);
        throw new Error("Invalid response from server");
      }
      
      // Fetch user info to display the correct username
      const userResponse = await fetch(`${API_BASE_URL}/users/${userId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data for comment");
      }
      
      const userData = await userResponse.json();
      const username = userData.attributes?.username || userData.email?.split("@")[0] || "Anonymous User";
      
      // Create new comment object with the actual username
      const newComment = {
        id: data.id,
        text: commentText,
        authorId: userId,
        authorUsername: username,
        authorEmail: userData.email || "",
        created: new Date().toISOString()
      };
      
      // Update comments state
      setComments(prev => {
        const updatedComments = { ...prev };
        if (!updatedComments[postId]) {
          updatedComments[postId] = [];
        }
        updatedComments[postId] = [newComment, ...updatedComments[postId]];
        return updatedComments;
      });
      
      // Clear the new comment input
      setNewComments(prev => ({
        ...prev,
        [postId]: ""
      }));
      
      return data;
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  };

  // Handle comment input change
  const handleCommentChange = (postId, value) => {
    setNewComments(prev => ({
      ...prev,
      [postId]: value
    }));
  };
  
  // Handle comment submission
  const handleCommentSubmit = async (postId, event) => {
    if (event) {
      event.preventDefault();
    }
    
    const commentText = newComments[postId];
    if (!commentText || commentText.trim() === "") {
      return;
    }
    
    try {
      await addComment(postId, commentText.trim());
    } catch (error) {
      console.error("Failed to submit comment:", error);
      alert("Failed to submit comment. Please try again.");
    }
  };

  const deletePost = async (postId) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to delete posts");
      }

      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      // Remove the post from the local state
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      
      // Also remove any associated comments and reactions
      setComments(prev => {
        const updated = { ...prev };
        delete updated[postId];
        return updated;
      });
      
      setLikeCounts(prev => {
        const updated = { ...prev };
        delete updated[postId];
        return updated;
      });
      
      setLikedPosts(prev => {
        const updated = { ...prev };
        delete updated[postId];
        return updated;
      });
      
      setUserReactions(prev => {
        const updated = { ...prev };
        delete updated[postId];
        return updated;
      });

    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

  const deleteComment = async (commentId, postId) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to delete comments");
      }

      const response = await fetch(`${API_BASE_URL}/posts/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      // Remove the comment from the local state
      setComments(prev => {
        const updated = { ...prev };
        if (updated[postId]) {
          updated[postId] = updated[postId].filter(comment => comment.id !== commentId);
        }
        return updated;
      });

    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again.");
    }
  };

  const handleDeleteClick = (type, id, postId = null) => {
    setDeleteDialog({
      open: true,
      type,
      id,
      postId,
    });
  };

  const handleDeleteConfirm = async () => {
    const { type, id, postId } = deleteDialog;
    try {
      if (type === 'post') {
        await deletePost(id);
      } else if (type === 'comment') {
        await deleteComment(id, postId);
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    } finally {
      setDeleteDialog({ open: false, type: null, id: null, postId: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, type: null, id: null, postId: null });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4, maxWidth: 600, mx: 'auto' }}>
      {/* Feed View Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Button
          variant={feedView === 'public' ? 'contained' : 'outlined'}
          onClick={() => setFeedView('public')}
          sx={{ 
            mr: 1,
            bgcolor: feedView === 'public' ? '#1D6EF1' : '#F4FDFF',
            color: feedView === 'public' ? 'white' : '#1D6EF1',
            '&:hover': {
              bgcolor: feedView === 'public' ? '#1557B0' : '#E3F2FF'
            }
          }}
        >
          {feedText.public}
        </Button>
        <Button
          variant={feedView === 'private' ? 'contained' : 'outlined'}
          onClick={() => setFeedView('private')}
          sx={{ 
            bgcolor: feedView === 'private' ? '#1D6EF1' : '#F4FDFF',
            color: feedView === 'private' ? 'white' : '#1D6EF1',
            '&:hover': {
              bgcolor: feedView === 'private' ? '#1557B0' : '#E3F2FF'
            }
          }}
        >
          {feedText.private}
        </Button>
      </Box>
      {posts.map((post) => {
        let content;
        try {
          content = JSON.parse(post.content);
        } catch (e) {
          content = { text: post.content };
        }

        return (
          <Paper 
            key={post.id} 
            elevation={0}
            sx={{ 
              mb: 4,
              borderRadius: 2,
              border: '1px solid #dbdbdb',
              overflow: 'hidden',
            }}
          >
            {/* Post Header */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              p: 2,
              borderBottom: content.image ? 'none' : '1px solid #efefef'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  src={post.attributes?.authorAvatar}
                  sx={{ width: 32, height: 32, mr: 1.5 }}
                >
                  {post.authorUsername?.[0] || 'U'}
                </Avatar>
                <Typography 
                  variant="subtitle2"
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '14px',
                  }}
                >
                  {post.authorUsername || post.authorEmail?.split("@")[0] || 'Anonymous User'}
                </Typography>
              </Box>
              
              {/* Delete button - only show for post creator */}
              {post.authorID && currentUserId && String(post.authorID) === String(currentUserId) && (
                <IconButton
                  size="small"
                  onClick={() => {
                    handleDeleteClick('post', post.id);
                  }}
                  sx={{ color: 'error.main' }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              )}
            </Box>

            {/* Add Image Display Section Here */}
            {content.image && (
              <Box 
                sx={{ 
                  width: '100%',
                  height: { xs: '300px', sm: '400px' }, // Fixed height for consistency
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden',
                  bgcolor: '#fafafa',
                  borderTop: '1px solid #efefef',
                  borderBottom: '1px solid #efefef'
                }}
              >
                <img 
                  src={content.image} 
                  alt="Post" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover', // Changed from 'contain' to 'cover'
                    objectPosition: 'center'
                  }}
                />
              </Box>
            )}


              {/* Post Actions */}
              <Box sx={{ px: 2, pt: 1.5, display: 'flex', gap: 1 }}>
                <IconButton 
                  size="small"
                  onClick={() => handleLikeToggle(post.id)}
                  sx={{ p: 0.5 }}
                >
                  {likedPosts[post.id] ? (
                    <Favorite fontSize="medium" sx={{ color: '#ED4956' }} />
                  ) : (
                    <FavoriteBorder fontSize="medium" />
                  )}
                </IconButton>
                <IconButton 
                  size="small"
                  onClick={() => {
                    // Focus on the comment input
                    const commentBox = document.getElementById(`comment-input-${post.id}`);
                    if (commentBox) {
                      commentBox.focus();
                    }
                  }}
                  sx={{ p: 0.5 }}
                >
                  <ChatBubbleOutline fontSize="medium" />
                </IconButton>
                <IconButton 
                  size="small"
                  sx={{ p: 0.5 }}
                >
                  <Send fontSize="medium" />
                </IconButton>
              </Box>

              {/* Post Content */}
              <Box sx={{ px: 2, pt: 1, pb: 2 }}>
                {/* Like count display */}
                {likeCounts[post.id] > 0 && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: '14px',
                      mb: 1
                    }}
                  >
                    {likeCounts[post.id] === 1 
                      ? labelsText.likes.one
                      : labelsText.likes.other.replace('{{count}}', likeCounts[post.id])}
                  </Typography>
                )}
                
                {/* Caption with username */}
                <Box sx={{ display: 'flex', mb: 0.5 }}>
                  <Typography 
                    component="span" 
                    variant="body2"
                    sx={{ 
                      fontWeight: 600,
                      fontSize: '14px',
                      mr: 1
                    }}
                  >
                    {post.authorUsername || post.authorEmail?.split("@")[0] || 'Anonymous User'}
                  </Typography>
                  <Typography 
                    component="span" 
                    variant="body2"
                    sx={{ 
                      fontSize: '14px',
                    }}
                  >
                    {content.text}
                  </Typography>
                </Box>
                
                {/* Comments section */}
                {comments[post.id] && comments[post.id].length > 0 && (
                  <Box sx={{ mt: 1, mb: 1 }}>
                    {/* Show all comments if expanded, otherwise show first 2 */}
                    {(expandedComments[post.id] ? comments[post.id] : comments[post.id].slice(0, 2)).map((comment) => (
                      <Box key={comment.id} sx={{ display: 'flex', mb: 1 }}>
                        <Typography 
                          component="span" 
                          variant="body2"
                          sx={{ 
                            fontWeight: 600,
                            fontSize: '14px',
                            mr: 1
                          }}
                        >
                          {comment.authorUsername || comment.authorEmail?.split("@")[0] || 'Anonymous User'}
                        </Typography>
                        <Box sx={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
                          <Typography 
                            component="span" 
                            variant="body2"
                            sx={{ 
                              fontSize: '14px',
                            }}
                          >
                            {comment.text}
                          </Typography>
                          {String(comment.authorId) === String(currentUserId) && (
                            <IconButton
                              size="small"
                              onClick={() => {
                                handleDeleteClick('comment', comment.id, post.id);
                              }}
                              sx={{ ml: 'auto', p: 0.5, color: 'error.main' }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    ))}
                    
                    {/* Show expand/collapse button if there are more than 2 comments */}
                    {comments[post.id].length > 2 && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: '14px',
                          mb: 1,
                          cursor: 'pointer',
                          '&:hover': {
                            color: 'primary.main'
                          }
                        }}
                        onClick={() => {
                          setExpandedComments(prev => ({
                            ...prev,
                            [post.id]: !prev[post.id]
                          }));
                        }}
                      >
                        {expandedComments[post.id] 
                          ? buttonsText.showLess 
                          : buttonsText.viewAllComments.replace('{{count}}', comments[post.id].length)}
                      </Typography>
                    )}
                  </Box>
                )}
                
                {/* Post Time */}
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    display: 'block',
                    mb: 1
                  }}
                >
                  {formatDate(post.created)}
                </Typography>
                
                {/* Add comment form */}
                <Box 
                  component="form" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    mt: 1,
                    borderTop: '1px solid #efefef',
                    pt: 1
                  }}
                  onSubmit={(e) => handleCommentSubmit(post.id, e)}
                >
                  <TextField
                    id={`comment-input-${post.id}`}
                    placeholder={labelsText.addComment}
                    variant="standard"
                    fullWidth
                    value={newComments[post.id] || ''}
                    onChange={(e) => handleCommentChange(post.id, e.target.value)}
                    InputProps={{
                      disableUnderline: true,
                    }}
                    sx={{ 
                      fontSize: '14px',
                      '& .MuiInputBase-input': {
                        fontSize: '14px',
                      }
                    }}
                  />
                  <Button
                    disabled={!newComments[post.id] || newComments[post.id].trim() === ''}
                    onClick={(e) => handleCommentSubmit(post.id, e)}
                    sx={{ 
                      color: '#0095f6',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '14px',
                      minWidth: 'auto',
                      '&.Mui-disabled': {
                        color: '#0095f666',
                      }
                    }}
                  >
                    {buttonsText.post}
                  </Button>
                </Box>
              </Box>
            </Paper>
          );
        })}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          Delete {deleteDialog.type === 'post' ? 'Post' : 'Comment'}?
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {deleteDialog.type}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PostFeed;
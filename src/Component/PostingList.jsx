import React, { useState, useEffect, useRef } from "react";
import Post from "./Post.jsx";
import "../App.css";

/*
  The PostingList is going to load all the posts in the system. This model won't work well if you have a lot of 
  posts - you would want to find a way to limit the posts shown.
*/
const PostingList = ({ refresh, posts, error, isLoaded, type, loadPosts }) => {
  if (!sessionStorage.getItem("token")) {
    return <div>Please Log In...</div>;
  } else if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  } else if (posts.length > 0) {
    return (
      <div className="posts">
        {posts.map((post, index) => (
          <div 
            key={post.id}
            className="post-item"
            style={{ 
              animationDelay: `${index * 0.1}s`,
              opacity: 0,
              transform: 'translateY(20px)',
              animation: 'fadeInUp 0.3s ease forwards'
            }}
          >
            <Post post={post} type={type} loadPosts={loadPosts} />
          </div>
        ))}
      </div>
    );
  } else {
    return <div>No Posts Found</div>;
  }
};

export default PostingList;

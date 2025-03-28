import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../App";
import { Send, ArrowLeft, AlertCircle } from "lucide-react";
import background from "../assets/image3.png";

// This CommunityMessaging component handles group chat for community members
const CommunityMessaging = () => {
  const [userData, setUserData] = useState({});
  const [communityData, setCommunityData] = useState({});
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [error, setError] = useState(null);
  const [detailedError, setDetailedError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
  const userToken = sessionStorage.getItem("token");
  const userId = sessionStorage.getItem("user");
  
  // Get communityId from URL params
  const { communityId } = useParams();
  const communityRoomID = `community-${communityId}`;
  const messagesEndRef = useRef(null);

  // API base URL
  const API_BASE_URL = "https://webdev.cse.buffalo.edu/hci/api/api/droptable";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket connection handling
  useEffect(() => {
    console.log("Setting up socket connection for community chat");
    
    const handleConnect = () => {
      console.log("Socket connected for community chat");
      setIsConnected(true);
      setError(null);
      setDetailedError(null);
      // Join the community room on connection/reconnection
      socket.emit("/community/join-room", {
        userID: parseInt(userId),
        communityID: parseInt(communityId),
        roomID: communityRoomID
      });
      console.log("Emitted join-room event for community:", {
        userID: parseInt(userId),
        communityID: parseInt(communityId),
        roomID: communityRoomID
      });
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected from community chat");
      setIsConnected(false);
      setError("Lost connection to chat server");
      setDetailedError(`Disconnected from socket server at ${new Date().toISOString()}. Socket ID: ${socket.id || 'unknown'}`);
    };

    const handleConnectError = (err) => {
      console.error("Socket connection error for community chat:", err);
      setIsConnected(false);
      const errorDetails = {
        message: err.message,
        time: new Date().toISOString(),
        transportType: socket.io?.engine?.transport?.name || 'unknown',
        socketId: socket.id || 'not assigned',
        reconnectionAttempts: socket.io?.reconnectionAttempts || 'unknown',
      };
      setDetailedError(JSON.stringify(errorDetails, null, 2));
      setError(`Connection error: ${err.message}`);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    // If already connected, join the room
    if (socket.connected) {
      handleConnect();
    } else {
      console.log("Socket not connected yet, will join on connection");
      socket.connect();
    }

    // Clean up listeners
    return () => {
      console.log("Cleaning up socket listeners for community chat");
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      
      // Leave the room when component unmounts
      socket.emit("/community/leave-room", { 
        roomID: communityRoomID,
        userID: parseInt(userId),
        communityID: parseInt(communityId)
      });
      console.log("Emitted leave-room event for community:", {
        roomID: communityRoomID,
        userID: parseInt(userId),
        communityID: parseInt(communityId)
      });
    };
  }, [communityId, userId, communityRoomID]);

  useEffect(() => {
    if (!userToken) {
      console.error("No auth token found");
      setError("Authentication required");
      setDetailedError("No authentication token found in session storage");
      navigate("/login");
      return;
    }

    const loadUserData = async () => {
      try {
        console.log(`Fetching user data for ID: ${userId}`);
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to fetch user data. Status: ${response.status}, Response: ${errorText}`);
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("User data fetched successfully:", data);
        setUserData(data);
      } catch (err) {
        console.error("Error loading user data:", err);
        setError("Failed to load user data");
        setDetailedError(`Error fetching user data: ${err.message}\nStack: ${err.stack}`);
      }
    };

    const loadCommunityData = async () => {
      try {
        console.log(`Fetching community data for ID: ${communityId}`);
        const response = await fetch(`${API_BASE_URL}/groups/${communityId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to fetch community data. Status: ${response.status}, Response: ${errorText}`);
          throw new Error(`Failed to fetch community data: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Community data fetched successfully:", data);
        setCommunityData(data);
      } catch (err) {
        console.error("Error loading community data:", err);
        setError("Failed to load community data");
        setDetailedError(`Error fetching community data: ${err.message}\nStack: ${err.stack}`);
      }
    };

    const loadCommunityMembers = async () => {
      try {
        console.log(`Fetching members for community ID: ${communityId}`);
        const response = await fetch(`${API_BASE_URL}/group-members?groupID=${communityId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to fetch community members. Status: ${response.status}, Response: ${errorText}`);
          throw new Error(`Failed to fetch community members: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Community members fetched successfully:", data);
        
        if (data && data[0] && data[0].length > 0) {
          // Transform API data to match our component's expected format
          const membersData = await Promise.all(data[0].map(async (member) => {
            try {
              // Fetch detailed user data for each member
              const userResponse = await fetch(`${API_BASE_URL}/users/${member.userID}`, {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${userToken}`,
                },
              });
              
              if (!userResponse.ok) {
                console.warn(`Could not fetch details for user ${member.userID}`);
                return {
                  id: member.userID,
                  name: `User ${member.userID}`,
                  isAdmin: false,
                  isOnline: false
                };
              }
              
              const userData = await userResponse.json();
              return {
                id: member.userID,
                name: userData.attributes?.name || userData.email?.split("@")[0] || `User ${member.userID}`,
                isAdmin: member.userID === communityData?.ownerID,
                isOnline: false // Default to offline, will be updated by socket events
              };
            } catch (err) {
              console.error(`Error fetching details for member ${member.userID}:`, err);
              return {
                id: member.userID,
                name: `User ${member.userID}`,
                isAdmin: false,
                isOnline: false
              };
            }
          }));
          setMembers(membersData);
        } else {
          setMembers([]);
        }
      } catch (err) {
        console.error("Error loading community members:", err);
        setError("Failed to load community members");
        setDetailedError(`Error fetching community members: ${err.message}\nStack: ${err.stack}`);
      }
    };

    const loadChatHistory = async () => {
      try {
        console.log(`Fetching chat history for community ID: ${communityId}`);
        
        // Fetch posts with the type "community_message" for this community
        const response = await fetch(`${API_BASE_URL}/posts?type=community_message&groupID=${communityId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to fetch chat history. Status: ${response.status}, Response: ${errorText}`);
          throw new Error(`Failed to fetch chat history: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Chat history fetched successfully:", data);
        
        if (data && data[0] && data[0].length > 0) {
          // Sort messages by timestamp
          const sortedMessages = data[0]
            .filter(post => post.attributes?.roomId === communityRoomID)
            .sort((a, b) => {
              const timeA = a.attributes?.timestamp || a.createdAt;
              const timeB = b.attributes?.timestamp || b.createdAt;
              return new Date(timeA) - new Date(timeB);
            })
            .map(post => ({
              id: `msg-${post.id}-${Math.random().toString(36).substr(2, 9)}`,
              fromUserID: post.authorID,
              message: post.content,
              timestamp: post.attributes?.timestamp || post.createdAt,
              senderName: post.authorName || "Unknown User"
            }));
          
          setMessages(sortedMessages);
        } else {
          // Initialize with a welcome message
          const welcomeMsg = {
            id: `welcome-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            fromUserID: "system",
            message: `Welcome to the ${communityData.name || 'community'} chat room!`,
            timestamp: new Date().toISOString(),
            senderName: "System"
          };
          setMessages([welcomeMsg]);
        }
      } catch (err) {
        console.error("Error loading chat history:", err);
        setError("Failed to load chat history");
        setDetailedError(`Error fetching chat history: ${err.message}\nStack: ${err.stack}`);
        
        // Initialize with a welcome message even on error
        const welcomeMsg = {
          id: `welcome-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          fromUserID: "system",
          message: `Welcome to the community chat room!`,
          timestamp: new Date().toISOString(),
          senderName: "System"
        };
        setMessages([welcomeMsg]);
      } finally {
        setIsLoading(false);
      }
    };

    // Load all data
    Promise.all([
      loadUserData(),
      loadCommunityData(),
      loadCommunityMembers(),
      loadChatHistory()
    ]).catch(err => {
      console.error("Error loading initial data:", err);
      setError("Failed to load necessary data");
      setDetailedError(`Error loading initial data: ${err.message}\nStack: ${err.stack}`);
      setIsLoading(false);
    });

    // Message handling
    const handleMessageReceived = (msg) => {
      console.log("Received community message:", msg);
      if (msg.roomID !== communityRoomID) {
        console.log(`Ignoring message for room ${msg.roomID}, we're in ${communityRoomID}`);
        return;
      }
      
      setMessages((prevMessages) => {
        // Generate a truly unique ID if one isn't provided
        const uniqueId = msg.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Check if message already exists to prevent duplicates
        if (prevMessages.some(m => m.id === uniqueId)) {
          console.log("Duplicate message detected, ignoring:", uniqueId);
          return prevMessages;
        }
        
        return [...prevMessages, {
          ...msg,
          id: uniqueId,
          timestamp: msg.timestamp || new Date().toISOString(),
        }];
      });
    };

    socket.on("/community/message", handleMessageReceived);

    // Member status updates
    const handleMemberOnline = (data) => {
      if (data.communityID === parseInt(communityId)) {
        console.log("Member online:", data);
        setMembers(prev => {
          return prev.map(member => {
            if (member.id === data.userID) {
              return { ...member, isOnline: true };
            }
            return member;
          });
        });
      }
    };

    const handleMemberOffline = (data) => {
      if (data.communityID === parseInt(communityId)) {
        console.log("Member offline:", data);
        setMembers(prev => {
          return prev.map(member => {
            if (member.id === data.userID) {
              return { ...member, isOnline: false };
            }
            return member;
          });
        });
      }
    };

    socket.on("/community/member-online", handleMemberOnline);
    socket.on("/community/member-offline", handleMemberOffline);

    return () => {
      socket.off("/community/message", handleMessageReceived);
      socket.off("/community/member-online", handleMemberOnline);
      socket.off("/community/member-offline", handleMemberOffline);
    };
  }, [navigate, userToken, communityId, userId, communityRoomID, communityData.name, API_BASE_URL]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    setIsSending(true);
    console.log("Preparing to send message to community chat");
    
    const timestamp = new Date().toISOString();
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const messageData = {
      fromUserID: parseInt(userId),
      communityID: parseInt(communityId),
      message: message.trim(),
      roomID: communityRoomID,
      timestamp: timestamp,
      id: messageId,
      senderName: userData.attributes?.name || userData.email?.split("@")[0] || "You"
    };

    try {
      console.log("Sending community message data:", messageData);
      
      // Add message to UI immediately for better UX
      setMessages(prevMessages => [...prevMessages, {
        ...messageData,
        fromUserID: parseInt(userId),
        message: message.trim(),
        timestamp: timestamp,
        id: messageId,
        senderName: "You" // Client-side display name for the sender
      }]);
      setMessage("");

      // Emit the message through socket
      socket.emit("/community/send-message", messageData);
      console.log("Emitted community message via socket");

      // Save message to posts for persistence
      console.log("Saving community message to database");
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          authorID: messageData.fromUserID,
          content: messageData.message,
          type: "community_message",
          groupID: parseInt(communityId),
          attributes: {
            roomId: communityRoomID,
            timestamp: timestamp,
            messageId: messageId
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to save community message. Status: ${response.status}, Response: ${errorText}`);
        throw new Error(`Failed to save message: ${response.status}`);
      }
      
      console.log("Message saved successfully to database");
    } catch (err) {
      console.error("Error sending/saving community message:", err);
      setError("Failed to send message");
      setDetailedError(`Error sending message: ${err.message}\nStack: ${err.stack}\nTimestamp: ${new Date().toISOString()}`);
      
      // Remove the message from UI if sending failed
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.id !== messageId)
      );
      
      // Put the message text back in the input field
      setMessage(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleBack = () => {
    navigate(`/community/view/${communityId}`);
  };

  const formatTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      console.error("Error formatting timestamp:", err);
      return "Invalid time";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1D1D20] text-white flex items-center justify-center"
        style={{
          backgroundImage: `url(${background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-white p-6 rounded-xl shadow-lg text-[#1D1D20]">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1D6EF1] mb-4"></div>
            <p>Loading community chat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#1D1D20] text-white"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex gap-4 h-[80vh]">
          {/* Members Sidebar */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden w-64 hidden md:block">
            <div className="bg-[#1D6EF1] p-4">
              <h3 className="text-xl font-bold text-white">Community Members</h3>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-60px)]">
              <div className="space-y-3">
                {members.length > 0 ? (
                  members.map((member) => (
                    <div key={member.id} className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${member.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <div className="bg-[#1D6EF1] rounded-full w-8 h-8 flex items-center justify-center text-white mr-2">
                        <span>{member.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-[#1D1D20]">{member.name}</p>
                        {member.isAdmin && (
                          <span className="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-700">Admin</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No members found</p>
                )}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden flex-1 flex flex-col">
            {/* Header */}
            <div className="bg-[#1D6EF1] p-4 flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={handleBack}
                  className="text-white hover:bg-[#97C7F1] p-2 rounded-lg transition-colors mr-4"
                >
                  <ArrowLeft size={24} />
                </button>
                <div>
                  <h2 className="text-xl font-bold">
                    {communityData.name || "Community"} Chat
                  </h2>
                  <p className="text-sm opacity-75">
                    {isConnected ? "Connected" : "Disconnected"} • {members.length} members
                  </p>
                </div>
              </div>
              {error && (
                <div className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {error}
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="bg-[#F4FDFF] flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isOwnMessage = msg.fromUserID === parseInt(userId);
                  const isSystemMessage = msg.fromUserID === "system";
                  
                  return (
                    <div
                      key={msg.id || `msg-${msg.timestamp}-${Math.random().toString(36).substr(2, 5)}`}
                      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    >
                      {isSystemMessage ? (
                        <div className="max-w-[80%] bg-gray-200 text-[#1D1D20] rounded-lg p-3 mx-auto">
                          <p className="break-words text-center">{msg.message}</p>
                          <p className="text-xs mt-1 opacity-75 text-center">
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      ) : (
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isOwnMessage
                              ? "bg-[#1D6EF1] text-white"
                              : "bg-white border border-gray-200 text-[#1D1D20]"
                          }`}
                        >
                          {!isOwnMessage && (
                            <p className="text-xs font-bold mb-1">{msg.senderName}</p>
                          )}
                          <p className="break-words">{msg.message}</p>
                          <p className="text-xs mt-1 opacity-75">
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="bg-white p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message to the community..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6EF1] text-[#1D1D20]"
                  disabled={!isConnected || isSending}
                />
                <button
                  type="submit"
                  className={`text-white p-2 rounded-lg transition-colors ${
                    isConnected && !isSending
                      ? "bg-[#1D6EF1] hover:bg-[#97C7F1]"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!isConnected || isSending || !message.trim()}
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Detailed Error Log (only visible during errors and can be toggled) */}
        {detailedError && (
          <div className="mt-4 bg-white rounded-xl shadow-lg p-4">
            <details>
              <summary className="text-red-500 cursor-pointer font-medium">Error details (for debugging)</summary>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs text-red-800 overflow-x-auto">
                {detailedError}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityMessaging;
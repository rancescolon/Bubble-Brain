"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, UserPlus, UserMinus, Ban, MessageCircle } from "lucide-react"
import background from "../assets/image3.png"
import { socket } from "../App"  // Import the shared socket instance

const Friends = () => {
  const [connections, setConnections] = useState([])
  const [blockedUsers, setBlockedUsers] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(null)
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [newFriendEmail, setNewFriendEmail] = useState("")
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" })
  const [allUsers, setAllUsers] = useState([])
  const [userSearchQuery, setUserSearchQuery] = useState("")
  const [showAllUsers, setShowAllUsers] = useState(false)
  const navigate = useNavigate()

  const fontStyle = {
    fontFamily: "SourGummy, sans-serif",
  }

  useEffect(() => {
    const userToken = sessionStorage.getItem("token")
    if (!userToken) {
      navigate("/")
    } else {
      loadFriends()
      loadBlockedUsers()
      loadPendingRequests()
      loadAllUsers()
    }
  }, [navigate])

  const loadFriends = () => {
    const userId = sessionStorage.getItem("user")
    const token = sessionStorage.getItem("token")

    // First fetch outgoing connections
    fetch(`${process.env.REACT_APP_API_PATH}/connections?fromUserID=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(async (result) => {
        // Filter outgoing connections to only show accepted friends
        const outgoingConnections = result[0].filter(conn => 
          conn.attributes?.status === 'accepted' && !conn.attributes?.blocked
        )

        // Then fetch incoming connections
        const incomingResponse = await fetch(`${process.env.REACT_APP_API_PATH}/connections?toUserID=${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        const incomingResult = await incomingResponse.json()
        
        // Filter incoming connections to only show accepted friends
        const incomingConnections = incomingResult[0].filter(conn => 
          conn.attributes?.status === 'accepted' && !conn.attributes?.blocked
        )

        // Combine connections and remove duplicates based on the friend's user ID
        const uniqueConnections = [];
        const seenUsers = new Set();

        [...outgoingConnections, ...incomingConnections].forEach(conn => {
          const userId = sessionStorage.getItem("user");
          const friendId = conn.fromUserID === parseInt(userId) ? conn.toUserID : conn.fromUserID;
          
          if (!seenUsers.has(friendId)) {
            seenUsers.add(friendId);
            uniqueConnections.push(conn);
          }
        });

        setConnections(uniqueConnections);
        setIsLoaded(true);
      })
      .catch((error) => {
        setError(error)
        setIsLoaded(true)
      })
  }

  const loadBlockedUsers = () => {
    const userId = sessionStorage.getItem("user")
    const token = sessionStorage.getItem("token")

    fetch(`${process.env.REACT_APP_API_PATH}/connections?fromUserID=${userId}`, {
      method: "GET",
        headers: {
          "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(
        (result) => {
          // Filter to show only blocked connections
          const blockedConnections = result[0].filter(conn => 
            conn.attributes?.blocked === true
          )
          setBlockedUsers(blockedConnections)
        },
        (error) => {
          console.error("Error loading blocked users:", error)
        }
      )
  }

  const loadPendingRequests = () => {
    const userId = sessionStorage.getItem("user")
    const token = sessionStorage.getItem("token")

    fetch(`${process.env.REACT_APP_API_PATH}/connections?toUserID=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(
        (result) => {
          // Filter to show only pending friend requests
          const pendingConnections = result[0].filter(conn => 
            conn.attributes?.status === 'pending' && !conn.attributes?.blocked
          )
          setPendingRequests(pendingConnections)
        },
        (error) => {
          console.error("Error loading pending requests:", error)
        }
      )
  }

  const loadAllUsers = async () => {
    const token = sessionStorage.getItem("token")
    const userId = sessionStorage.getItem("user")

    try {
      const response = await fetch(`${process.env.REACT_APP_API_PATH}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()
      // Filter out the current user and format the user data
      const filteredUsers = data[0].filter(user => user.id !== parseInt(userId))
      setAllUsers(filteredUsers)
    } catch (error) {
      console.error("Error loading users:", error)
      showNotification("Failed to load users", "error")
    }
  }

  const handleAddFriend = async (e) => {
    e.preventDefault()
    const userId = sessionStorage.getItem("user")
    const token = sessionStorage.getItem("token")

    try {
      // First, search for the user by email
      const searchResponse = await fetch(`${process.env.REACT_APP_API_PATH}/users?email=${newFriendEmail}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const searchResult = await searchResponse.json()

      if (!searchResult[0] || searchResult[0].length === 0) {
        showNotification("User not found", "error")
        return
      }

      const targetUser = searchResult[0][0]

      // Check if trying to add self
      if (parseInt(userId) === targetUser.id) {
        showNotification("You cannot add yourself as a friend", "error")
        return
      }

      // Check if already friends or has pending request
      const existingConnectionsResponse = await fetch(
        `${process.env.REACT_APP_API_PATH}/connections?fromUserID=${userId}&toUserID=${targetUser.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      const existingConnections = await existingConnectionsResponse.json()

      // Also check reverse connections (where target user is sender)
      const reverseConnectionsResponse = await fetch(
        `${process.env.REACT_APP_API_PATH}/connections?fromUserID=${targetUser.id}&toUserID=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      const reverseConnections = await reverseConnectionsResponse.json()

      const allConnections = [...(existingConnections[0] || []), ...(reverseConnections[0] || [])]
      
      // Check existing connections
      const existingFriendship = allConnections.find(conn => 
        conn.attributes?.status === 'accepted' && !conn.attributes?.blocked
      )
      
      const pendingRequest = allConnections.find(conn => 
        conn.attributes?.status === 'pending' && !conn.attributes?.blocked
      )

      if (existingFriendship) {
        showNotification("This user is already in your friends list", "error")
        setNewFriendEmail("")
        setShowAddFriend(false)
        return
      }

      if (pendingRequest) {
        showNotification("A friend request with this user is already pending", "error")
        setNewFriendEmail("")
        setShowAddFriend(false)
        return
      }

      // If no existing connection, create new friend request
      const response = await fetch(`${process.env.REACT_APP_API_PATH}/connections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fromUserID: userId,
          toUserID: targetUser.id,
          attributes: {
            status: "pending",
            type: "friend",
          },
        }),
      })

      if (response.ok) {
        showNotification("Friend request sent successfully!", "success")
        setNewFriendEmail("")
        setShowAddFriend(false)
        loadFriends()
      } else {
        showNotification("Failed to send friend request", "error")
      }
    } catch (error) {
      console.error("Error adding friend:", error)
      showNotification("Error adding friend", "error")
    }
  }

  const handleRemoveFriend = async (friendId) => {
    const token = sessionStorage.getItem("token")
    const userId = sessionStorage.getItem("user")

    try {
      const response = await fetch(`${process.env.REACT_APP_API_PATH}/connections/${friendId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        showNotification("Friend removed successfully", "success")
        loadFriends()
      } else {
        showNotification("Failed to remove friend", "error")
      }
    } catch (error) {
      console.error("Error removing friend:", error)
      showNotification("Error removing friend", "error")
    }
  }

  const handleBlockUser = async (userId, connectionId) => {
    const token = sessionStorage.getItem("token")

    try {
      const response = await fetch(`${process.env.REACT_APP_API_PATH}/connections/${connectionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          attributes: {
            blocked: true,
          },
        }),
      })

      if (response.ok) {
        showNotification("User blocked successfully", "success")
        loadFriends()
        loadBlockedUsers()
      } else {
        showNotification("Failed to block user", "error")
      }
    } catch (error) {
      console.error("Error blocking user:", error)
      showNotification("Error blocking user", "error")
    }
  }

  const handleUnblockUser = async (connectionId) => {
    const token = sessionStorage.getItem("token")

    try {
      const response = await fetch(`${process.env.REACT_APP_API_PATH}/connections/${connectionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          attributes: {
            blocked: false,
          },
        }),
      })

      if (response.ok) {
        showNotification("User unblocked successfully", "success")
        loadBlockedUsers()
      } else {
        showNotification("Failed to unblock user", "error")
      }
    } catch (error) {
      console.error("Error unblocking user:", error)
      showNotification("Error unblocking user", "error")
    }
  }

  const handleAcceptRequest = async (requestId) => {
    const token = sessionStorage.getItem("token")
    const userId = sessionStorage.getItem("user")

    try {
      // First update the incoming request to accepted status
      const response = await fetch(`${process.env.REACT_APP_API_PATH}/connections/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          attributes: {
            status: "accepted"
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to accept friend request")
      }

      // Get the request details to create reciprocal connection
      const requestResponse = await fetch(`${process.env.REACT_APP_API_PATH}/connections/${requestId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const requestData = await requestResponse.json()

      // Create reciprocal connection
      const reciprocalResponse = await fetch(`${process.env.REACT_APP_API_PATH}/connections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fromUserID: userId,
          toUserID: requestData.fromUserID,
          attributes: {
            status: "accepted",
            type: "friend"
          },
        }),
      })

      if (!reciprocalResponse.ok) {
        console.warn("Failed to create reciprocal connection, but request was accepted")
      }

      showNotification("Friend request accepted!", "success")
      loadPendingRequests()
      loadFriends()
    } catch (error) {
      console.error("Error accepting friend request:", error)
      showNotification("Error accepting friend request", "error")
    }
  }

  const handleDeclineRequest = async (requestId) => {
    const token = sessionStorage.getItem("token")

    try {
      const response = await fetch(`${process.env.REACT_APP_API_PATH}/connections/${requestId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        showNotification("Friend request declined", "success")
        loadPendingRequests()
      } else {
        showNotification("Failed to decline friend request", "error")
      }
    } catch (error) {
      console.error("Error declining friend request:", error)
      showNotification("Error declining friend request", "error")
    }
  }

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" })
    }, 3000)
  }

  const handleStartChat = (friendId) => {
    console.log("Starting chat with friend:", friendId);
    
    if (!socket.connected) {
      console.error("Socket not connected");
      showNotification("Chat server connection failed", "error");
      return;
    }
    
    // First store the target user ID
    sessionStorage.setItem("toUserID", friendId);
    
    // Create payload for room creation
    const payload = {
      fromUserID: parseInt(sessionStorage.getItem("user")),
      toUserID: friendId
    };
    
    console.log("Emitting join-room event with payload:", payload);
    
    // Remove any existing listeners to prevent duplicates
    socket.off("/room-created");
    
    // Set up listener for room creation response
    socket.on("/room-created", (data) => {
      console.log("Room created response:", data);
      if (data && data.roomID) {
        console.log("Navigating to room:", data.roomID);
        sessionStorage.setItem("roomID", data.roomID);
        navigate(`/messages/${data.roomID}`);
      } else {
        console.error("No room ID received");
        showNotification("Failed to create chat room", "error");
      }
    });
    
    // Emit socket event for room creation/joining
    socket.emit("/chat/join-room", payload);

    // Add a timeout to handle no response
    setTimeout(() => {
      if (!sessionStorage.getItem("roomID")) {
        console.error("Room creation timed out");
        showNotification("Failed to connect to chat server", "error");
        // Clean up the listener after timeout
        socket.off("/room-created");
      }
    }, 5000);
  };

  const handleAddFriendFromList = async (targetUser) => {
    const userId = sessionStorage.getItem("user")
    const token = sessionStorage.getItem("token")

    try {
      // Check if already friends or has pending request
      const existingConnectionsResponse = await fetch(
        `${process.env.REACT_APP_API_PATH}/connections?fromUserID=${userId}&toUserID=${targetUser.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      const existingConnections = await existingConnectionsResponse.json()

      // Also check reverse connections
      const reverseConnectionsResponse = await fetch(
        `${process.env.REACT_APP_API_PATH}/connections?fromUserID=${targetUser.id}&toUserID=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      const reverseConnections = await reverseConnectionsResponse.json()

      const allConnections = [...(existingConnections[0] || []), ...(reverseConnections[0] || [])]
      
      const existingFriendship = allConnections.find(conn => 
        conn.attributes?.status === 'accepted' && !conn.attributes?.blocked
      )
      
      const pendingRequest = allConnections.find(conn => 
        conn.attributes?.status === 'pending' && !conn.attributes?.blocked
      )

      if (existingFriendship) {
        showNotification("This user is already in your friends list", "error")
        return
      }

      if (pendingRequest) {
        showNotification("A friend request with this user is already pending", "error")
        return
      }

      // Send friend request
      const response = await fetch(`${process.env.REACT_APP_API_PATH}/connections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fromUserID: userId,
          toUserID: targetUser.id,
          attributes: {
            status: "pending",
            type: "friend",
          },
        }),
      })

      if (response.ok) {
        showNotification("Friend request sent successfully!", "success")
        loadFriends()
      } else {
        showNotification("Failed to send friend request", "error")
      }
    } catch (error) {
      console.error("Error adding friend:", error)
      showNotification("Error adding friend", "error")
    }
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-t-xl p-6 shadow-lg">
            <h1 className="text-3xl font-bold text-[#1D1D20]" style={fontStyle}>
              Friends
            </h1>
            <p className="text-gray-600 mt-2" style={fontStyle}>
              Manage your Bubble Brain connections
            </p>
          </div>

          {/* Search and Add Friend */}
          <div className="bg-[#F4FDFF] p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search friends..."
                  className="w-full p-3 pl-10 rounded-lg border-2 border-[#97C7F1] text-[#1D1D20] focus:outline-none focus:ring-2 focus:ring-[#1D6EF1]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={fontStyle}
                />
                <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
              </div>
              <button
                className="bg-[#1D6EF1] hover:bg-[#97C7F1] text-white px-6 py-3 rounded-lg flex items-center justify-center transition-colors"
                onClick={() => setShowAllUsers(!showAllUsers)}
                style={fontStyle}
              >
                <UserPlus className="mr-2" size={20} />
                {showAllUsers ? 'Hide Users' : 'Find Users'}
              </button>
            </div>

            {/* All Users Section */}
            {showAllUsers && (
              <div className="mt-6 bg-white rounded-lg p-4 shadow-lg">
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="w-full p-3 pl-10 rounded-lg border-2 border-[#97C7F1] text-[#1D1D20] focus:outline-none focus:ring-2 focus:ring-[#1D6EF1]"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      style={fontStyle}
                    />
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                  </div>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {allUsers
                    .filter(user => {
                      try {
                        const userName = (user.attributes?.name || "").toLowerCase();
                        const userEmail = (user.email || "").toLowerCase();
                        const searchTerm = (userSearchQuery || "").toLowerCase();
                        
                        return userName.includes(searchTerm) || userEmail.includes(searchTerm);
                      } catch (error) {
                        console.error("Error filtering user:", error);
                        return false;
                      }
                    })
                    .map(user => {
                      const displayName = user.attributes?.name || user.email || "Unknown User";
                      const displayInitial = (displayName[0] || "?").toUpperCase();

                      return (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 bg-[#F4FDFF] rounded-lg hover:bg-[#C5EDFD] transition-colors"
                        >
                          <div className="flex items-center">
                            <div className="bg-[#1D6EF1] rounded-full w-10 h-10 flex items-center justify-center text-white mr-3">
                              <span style={fontStyle}>{displayInitial}</span>
                            </div>
                            <div>
                              <h3 className="text-[#1D1D20] font-semibold" style={fontStyle}>
                                {displayName}
                              </h3>
                              <p className="text-gray-600 text-sm" style={fontStyle}>
                                {user.email || "No email"}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAddFriendFromList(user)}
                            className="px-4 py-2 bg-[#48BB78] hover:bg-[#9DDCB1] text-white rounded-lg transition-colors"
                            style={fontStyle}
                          >
                            Add Friend
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* Friend Requests Section */}
          {pendingRequests.length > 0 && (
            <div className="bg-white p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[#1D1D20] mb-4" style={fontStyle}>
                Pending Friend Requests ({pendingRequests.length})
              </h2>
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 bg-[#F4FDFF] rounded-lg border-2 border-[#1D6EF1] animate-pulse"
                  >
                    <div className="flex items-center">
                      <div className="bg-[#1D6EF1] rounded-full w-12 h-12 flex items-center justify-center text-white mr-4">
                        <span style={fontStyle}>
                          {request.fromUser?.attributes?.name?.charAt(0).toUpperCase() || "?"}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-[#1D1D20] font-semibold" style={fontStyle}>
                          {request.fromUser?.attributes?.name || "Unknown User"}
                        </h3>
                        <p className="text-gray-600 text-sm" style={fontStyle}>
                          {request.fromUser?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="px-4 py-2 bg-[#48BB78] hover:bg-[#9DDCB1] text-white rounded-lg transition-colors"
                        style={fontStyle}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(request.id)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        style={fontStyle}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friends List */}
          <div className="bg-white rounded-b-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-[#1D1D20] mb-4" style={fontStyle}>
              Your Friends
            </h2>
            {isLoaded ? (
              connections.length > 0 ? (
                <div className="space-y-4">
                  {connections
                    .filter((friend) => {
                      try {
                        const userId = sessionStorage.getItem("user");
                        const isOutgoing = friend.fromUserID === parseInt(userId);
                        const friendUser = isOutgoing ? friend.toUser : friend.fromUser;
                        const userName = (friendUser?.attributes?.name || friendUser?.email || "").toLowerCase();
                        const searchTermLower = (searchQuery || "").toLowerCase();
                        return userName.includes(searchTermLower);
                      } catch (error) {
                        console.error("Error filtering friend:", error);
                        return false;
                      }
                    })
                    .map((friend) => {
                      const userId = sessionStorage.getItem("user");
                      const isOutgoing = friend.fromUserID === parseInt(userId);
                      const friendUser = isOutgoing ? friend.toUser : friend.fromUser;
                      const chatUserId = isOutgoing ? friend.toUserID : friend.fromUserID;
                      const displayName = friendUser?.attributes?.name || friendUser?.email || "Unknown User";
                      const displayInitial = (displayName[0] || "?").toUpperCase();

                      return (
                        <div
                          key={friend.id}
                          className="flex items-center justify-between p-4 bg-[#F4FDFF] rounded-lg hover:bg-[#C5EDFD] transition-colors"
                        >
                          <div className="flex items-center">
                            <div className="bg-[#1D6EF1] rounded-full w-12 h-12 flex items-center justify-center text-white mr-4">
                              <span style={fontStyle}>{displayInitial}</span>
                            </div>
                            <div>
                              <h3 className="text-[#1D1D20] font-semibold" style={fontStyle}>
                                {displayName}
                              </h3>
                              <p className="text-gray-600 text-sm" style={fontStyle}>
                                {friendUser?.email || "No email"}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleStartChat(chatUserId)}
                              className="p-2 text-[#1D6EF1] hover:bg-[#97C7F1] hover:text-white rounded-lg transition-colors"
                              title="Message"
                            >
                              <MessageCircle size={20} />
                            </button>
                            <button
                              onClick={() => handleBlockUser(chatUserId, friend.id)}
                              className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                              title="Block"
                            >
                              <Ban size={20} />
                            </button>
                            <button
                              onClick={() => handleRemoveFriend(friend.id)}
                              className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                              title="Remove"
                            >
                              <UserMinus size={20} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8 bg-[#F4FDFF] rounded-lg">
                  <p className="text-gray-600" style={fontStyle}>
                    No friends yet. Add some friends to get started!
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1D6EF1] mx-auto"></div>
              </div>
            )}

            {/* Blocked Users Section */}
            {blockedUsers.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-[#1D1D20] mb-4" style={fontStyle}>
                  Blocked Users
                </h2>
                <div className="space-y-4">
                  {blockedUsers.map((blocked) => (
                    <div
                      key={blocked.id}
                      className="flex items-center justify-between p-4 bg-gray-100 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="bg-gray-400 rounded-full w-12 h-12 flex items-center justify-center text-white mr-4">
                          <span style={fontStyle}>
                            {blocked.toUser?.attributes?.name?.charAt(0).toUpperCase() || "?"}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-gray-800 font-semibold" style={fontStyle}>
                            {blocked.toUser?.attributes?.name || "Unknown User"}
                          </h3>
                          <p className="text-gray-600 text-sm" style={fontStyle}>
                            Blocked
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnblockUser(blocked.id)}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                        style={fontStyle}
                      >
                        Unblock
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
          style={fontStyle}
        >
          {notification.message}
        </div>
      )}
    </div>
  )
}

export default Friends

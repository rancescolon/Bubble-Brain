"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { socket } from "../App"
import { Send, ArrowLeft } from "lucide-react"
import background from "../assets/image3.png"

// This Messaging component shows a way in which you can set up messaging between
// two users with the use of websockets.
const Messaging = () => {
  const [userData, setUserData] = useState({})
  const [otherUserData, setOtherUserData] = useState({})
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [isConnected, setIsConnected] = useState(socket.connected)
  const [error, setError] = useState(null)
  const [isSending, setIsSending] = useState(false)
  const navigate = useNavigate()
  const userToken = sessionStorage.getItem("token")
  // The useParams hook from react-router-dom returns an object.
  // The object keys are the parameter names declared in the path string
  // in the Route definition, and the values are the corresponding
  // URL segment from the matching URL.
  // We can destructor the object to give us the roomID in a variable
  // that we can use throughout the component
  const { roomID } = useParams()
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Focus the input field when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Socket connection handling
  useEffect(() => {
    const handleConnect = () => {
      console.log("Socket connected")
      setIsConnected(true)
      setError(null)
      // Join the room on connection/reconnection
      socket.emit("/chat/join-room", {
        fromUserID: Number.parseInt(sessionStorage.getItem("user")),
        toUserID: Number.parseInt(sessionStorage.getItem("toUserID")),
        roomID: roomID,
      })
    }

    const handleDisconnect = () => {
      console.log("Socket disconnected")
      setIsConnected(false)
      setError("Lost connection to chat server")
    }

    const handleConnectError = (err) => {
      console.error("Socket connection error:", err)
      setIsConnected(false)
      setError(`Connection error: ${err.message}`)
    }

    socket.on("connect", handleConnect)
    socket.on("disconnect", handleDisconnect)
    socket.on("connect_error", handleConnectError)

    // Clean up listeners
    return () => {
      socket.off("connect", handleConnect)
      socket.off("disconnect", handleDisconnect)
      socket.off("connect_error", handleConnectError)
    }
  }, [roomID])

  useEffect(() => {
    if (!userToken) {
      console.error("No auth token found")
      navigate("/")
      return
    }

    const loadUserData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_PATH}/users/${sessionStorage.getItem("user")}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        })
        if (!response.ok) throw new Error(`Failed to fetch user data: ${response.status}`)
        const data = await response.json()
        setUserData(data)
      } catch (err) {
        console.error("Error loading user data:", err)
        setError("Failed to load user data")
      }
    }

    const loadOtherUserData = async () => {
      const otherUserId = sessionStorage.getItem("toUserID")
      if (!otherUserId) {
        console.error("No target user ID found")
        return
      }

      try {
        const response = await fetch(`${process.env.REACT_APP_API_PATH}/users/${otherUserId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        })
        if (!response.ok) throw new Error(`Failed to fetch other user data: ${response.status}`)
        const data = await response.json()
        setOtherUserData(data)
      } catch (err) {
        console.error("Error loading other user data:", err)
        setError("Failed to load chat partner data")
      }
    }

    const loadChatHistory = async () => {
      try {
        // Get the current user ID and the other user ID
        const currentUserId = Number.parseInt(sessionStorage.getItem("user"))
        const otherUserId = Number.parseInt(sessionStorage.getItem("toUserID"))

        if (!roomID || !currentUserId || !otherUserId) {
          console.error("Missing required IDs for chat history")
          setMessages([])
          return
        }

        // Fetch only messages for this specific room
        const response = await fetch(
            `${process.env.REACT_APP_API_PATH}/posts?type=chat_message&attributes.roomId=${roomID}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`,
              },
            },
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch chat history: ${response.status}`)
        }

        const data = await response.json()
        if (data && data[0] && Array.isArray(data[0])) {
          // Transform the posts into message format
          const historyMessages = data[0]
              .filter((post) => {
                // Ensure we only get messages that are part of this conversation
                // Either sent by current user to other user, or received from other user
                return (
                    (post.authorID === currentUserId && post.attributes?.toUserId === otherUserId) ||
                    (post.authorID === otherUserId && post.attributes?.toUserId === currentUserId)
                )
              })
              .map((post) => ({
                id: post.attributes?.messageId || post.id,
                fromUserID: post.authorID,
                toUserID: post.attributes?.toUserId,
                message: post.content,
                roomID: post.attributes?.roomId,
                timestamp: post.attributes?.timestamp || post.createAt || new Date().toISOString(),
              }))

          // Sort messages by timestamp
          historyMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

          setMessages(historyMessages)
        } else {
          setMessages([])
        }
      } catch (error) {
        console.error("Error loading chat history:", error)
        setError("Failed to load chat history")
        setMessages([])
      }
    }

    loadUserData()
    loadOtherUserData()
    loadChatHistory()

    // Message handling
    const handleMessageReceived = (msg) => {
      console.log("Received message:", msg)
      setMessages((prevMessages) => {
        // Check if message already exists to prevent duplicates
        if (prevMessages.some((m) => m.id === msg.id)) {
          return prevMessages
        }
        return [
          ...prevMessages,
          {
            ...msg,
            id: msg.id || Date.now(),
            timestamp: msg.timestamp || new Date().toISOString(),
          },
        ]
      })
    }

    socket.on("/send-message", handleMessageReceived)

    // Join the room
    socket.emit("/chat/join-room", {
      fromUserID: Number.parseInt(sessionStorage.getItem("user")),
      toUserID: Number.parseInt(sessionStorage.getItem("toUserID")),
      roomID: roomID,
    })

    return () => {
      socket.off("/send-message", handleMessageReceived)
      // Leave the room when component unmounts
      socket.emit("/chat/leave-room", { roomID })
    }
  }, [navigate, userToken, roomID])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim() || isSending) return

    setIsSending(true)
    const timestamp = new Date().toISOString()
    const messageData = {
      fromUserID: Number.parseInt(userData.id),
      toUserID: Number.parseInt(otherUserData.id),
      message: message.trim(),
      roomID: roomID,
      timestamp: timestamp,
      id: Date.now(),
    }

    try {
      // Add message to UI immediately
      setMessages((prevMessages) => [...prevMessages, messageData])
      setMessage("")

      // Emit the message through socket
      socket.emit("/chat/send", messageData)

      // Save message to posts for persistence (but don't load old ones)
      const response = await fetch(`${process.env.REACT_APP_API_PATH}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          authorID: messageData.fromUserID,
          content: messageData.message,
          type: "chat_message",
          attributes: {
            roomId: roomID,
            toUserId: messageData.toUserID,
            timestamp: timestamp,
            messageId: messageData.id, // Store the message ID to prevent duplicates
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to save message: ${response.status}`)
      }
    } catch (err) {
      console.error("Error sending/saving message:", err)
      setError("Failed to send message")

      // Remove the message from UI if sending failed
      setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== messageData.id))
    } finally {
      setIsSending(false)

      // Focus the input field after sending a message
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 0)
    }
  }

  const handleBack = () => {
    navigate("/friends")
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
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-[#1D6EF1] p-4 flex items-center justify-between">
              <div className="flex items-center">
                <button
                    onClick={handleBack}
                    className="text-white hover:bg-[#97C7F1] p-2 rounded-full transition-colors mr-4"
                >
                  <ArrowLeft size={24} />
                </button>
                <div>
                  <h2 className="text-xl font-bold">{otherUserData.attributes?.name || otherUserData.email || "Chat"}</h2>
                  <p className="text-sm opacity-75">{isConnected ? "Online" : "Offline"}</p>
                </div>
              </div>
              {error && <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">{error}</div>}
            </div>

            {/* Messages */}
            <div className="bg-[#F4FDFF] h-[60vh] overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isOwnMessage = msg.fromUserID === Number.parseInt(userData.id)
                  return (
                      <div key={msg.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                        <div
                            className={`max-w-[70%] rounded-2xl p-3 ${
                                isOwnMessage ? "bg-[#1D6EF1] text-white" : "bg-white border border-gray-200 text-[#1D1D20]"
                            }`}
                        >
                          <p className="break-words">{msg.message}</p>
                          <p className="text-xs mt-1 opacity-75">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="bg-white p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1D6EF1] text-[#1D1D20]"
                    disabled={!isConnected || isSending}
                    autoFocus
                />
                <button
                    type="submit"
                    className={`text-white p-2 rounded-full transition-colors ${
                        isConnected && !isSending ? "bg-[#1D6EF1] hover:bg-[#97C7F1]" : "bg-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!isConnected || isSending || !message.trim()}
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
  )
}

export default Messaging


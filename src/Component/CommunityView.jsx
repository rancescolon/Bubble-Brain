"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { MessageSquare, Plus, Heart, Share2, Trash2, ArrowLeft, Send, Users, X } from "lucide-react"
import { socket } from "../App"
import { useMediaQuery, useTheme } from "@mui/material"

// API base URL
const API_BASE_URL = "https://webdev.cse.buffalo.edu/hci/api/api/droptable"

export default function CommunityView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [community, setCommunity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showChatRoom, setShowChatRoom] = useState(false)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [members, setMembers] = useState([])
  const [studySets, setStudySets] = useState([])
  const [selectedType, setSelectedType] = useState("all")
  const [showAddStudySetDialog, setShowAddStudySetDialog] = useState(false)
  const [studySetName, setStudySetName] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [templateContent, setTemplateContent] = useState([])
  const [currentStep, setCurrentStep] = useState(1) // 1: Name, 2: Template, 3: Content
  const messagesEndRef = useRef(null)
  const [showMembers, setShowMembers] = useState(false)
  const [copiedSetId, setCopiedSetId] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" })

  // Theme and responsive breakpoints
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"))

  // Add viewport meta tag to document head
  useEffect(() => {
    // Check if viewport meta tag exists
    let viewportMeta = document.querySelector('meta[name="viewport"]')

    // If it doesn't exist, create it
    if (!viewportMeta) {
      viewportMeta = document.createElement("meta")
      viewportMeta.name = "viewport"
      document.head.appendChild(viewportMeta)
    }

    // Set the content attribute
    viewportMeta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"

    // Clean up function
    return () => {
      // Optional: remove or reset the viewport meta tag when component unmounts
      // viewportMeta.content = 'width=device-width, initial-scale=1.0';
    }
  }, [])

  // Get base URL for sharing
  const getBaseUrl = () => {
    const isProduction = window.location.hostname.includes("webdev.cse.buffalo.edu")
    if (isProduction) {
      return `${window.location.origin}/hci/teams/droptable`
    } else {
      return window.location.origin
    }
  }

  // Helper function to format study set type for display
  const formatStudySetType = (type) => {
    if (!type) return ""

    // Replace underscores with spaces
    const typeWithSpaces = type.replace(/_/g, " ")

    // Capitalize first letter of each word
    return typeWithSpaces
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  useEffect(() => {
    fetchCommunityDetails()
  }, [id])

  // Auto-scroll to bottom of messages when they change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchCommunityDetails = () => {
    const token = sessionStorage.getItem("token")
    if (!token) {
      setError("You must be logged in to view this community")
      setLoading(false)
      return
    }

    // Fetch community details
    fetch(`${API_BASE_URL}/groups/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        // Transform API data to match our component's expected format
        const communityData = {
          id: data.id,
          name: data.name || "Community",
          description: data.description || "No description available",
          likes: 0,
          authorId: data.ownerID,
        }

        setCommunity(communityData)

        // Fetch members
        fetchMembers()

        // Fetch messages
        fetchMessages()

        // Fetch study sets
        fetchStudySets()

        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching community:", error)
        setError("Failed to load community details")
        setLoading(false)
      })
  }

  const fetchMembers = () => {
    const token = sessionStorage.getItem("token")

    fetch(`${API_BASE_URL}/group-members?groupID=${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then(async (data) => {
        if (data && data[0] && data[0].length > 0) {
          // Fetch user details for each member
          const membersWithDetails = await Promise.all(
            data[0].map(async (member) => {
              try {
                // Fetch user details
                const userResponse = await fetch(`${API_BASE_URL}/users/${member.userID}`, {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                })

                if (!userResponse.ok) {
                  throw new Error(`Failed to fetch user data: ${userResponse.status}`)
                }

                const userData = await userResponse.json()

                return {
                  id: member.id,
                  userID: member.userID,
                  email: userData.email,
                  isAdmin: member.userID === community?.authorId,
                }
              } catch (error) {
                console.error("Error fetching user details:", error)
                return {
                  id: member.id,
                  userID: member.userID,
                  email: "Unknown User",
                  isAdmin: member.userID === community?.authorId,
                }
              }
            }),
          )
          setMembers(membersWithDetails)
        } else {
          // If no members returned, at least add the owner as admin
          setMembers([
            {
              id: community?.authorId,
              userID: community?.authorId,
              email: "Owner",
              isAdmin: true,
            },
          ])
        }
      })
      .catch((error) => {
        console.error("Error fetching members:", error)
        setMembers([
          {
            id: community?.authorId,
            userID: community?.authorId,
            email: "Owner",
            isAdmin: true,
          },
        ])
      })
  }

  const fetchMessages = () => {
    const token = sessionStorage.getItem("token")

    fetch(`${API_BASE_URL}/posts?parentID=${id}&type=message`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((result) => {
        if (result && result[0] && result[0].length > 0) {
          // Transform API data to match our component's expected format
          const messagesData = result[0].map((message, idx) => ({
            id: `msg-${message.id}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
            sender: message.authorName || "User",
            text: message.content || "No message content",
            timestamp: message.createdAt || new Date().toISOString(),
          }))
          setMessages(messagesData)
        } else {
          // Set default welcome messages if none exist
          const initialMessages = [
            {
              id: `welcome-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              sender: "System",
              text: "Welcome to the community chat!",
              timestamp: new Date().toISOString(),
            },
          ]
          setMessages(initialMessages)
        }
      })
      .catch((error) => {
        console.error("Error fetching messages:", error)
        // Set default welcome message if fetch fails
        const initialMessages = [
          {
            id: `welcome-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            sender: "System",
            text: "Welcome to the community chat!",
            timestamp: new Date().toISOString(),
          },
        ]
        setMessages(initialMessages)
      })
  }

  const fetchStudySets = () => {
    const token = sessionStorage.getItem("token")
    const currentCommunityId = id // Keep as string for comparison

    // Try to fetch study sets specifically for this community
    fetch(`${API_BASE_URL}/posts?type=study_set`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((result) => {
        if (result && result[0] && result[0].length > 0) {
          // First, filter to only include study sets for this community
          const communityStudySets = result[0].filter((post) => {
            // Try to parse the content to check for communityId
            let contentObj = null
            try {
              if (post.content && typeof post.content === "string") {
                contentObj = JSON.parse(post.content)
              }
            } catch (e) {
              console.warn("Could not parse content for post", post.id)
            }

            // Check if communityId is in the content
            if (contentObj && contentObj.communityId === currentCommunityId) {
              return true
            }

            // Check if the post has our custom attribute that indicates the community
            if (post.attributes && post.attributes.communityId === currentCommunityId) {
              return true
            }

            // Check if parentID matches the community ID
            if (post.parentID && String(post.parentID) === currentCommunityId) {
              return true
            }

            // Also check the groupID as string comparison
            const postGroupId = String(post.groupID || "")
            const belongsViaGroupId = postGroupId === currentCommunityId

            return (
              belongsViaGroupId ||
              (contentObj && contentObj.communityId === currentCommunityId) ||
              (post.attributes && post.attributes.communityId === currentCommunityId) ||
              (post.parentID && String(post.parentID) === currentCommunityId)
            )
          })

          // Transform API data to match our component's expected format
          const studySetsData = communityStudySets
            .map((post) => {
              try {
                // Try to parse the content as JSON, but handle invalid JSON gracefully
                let content = {}

                try {
                  if (post.content && typeof post.content === "string") {
                    content = JSON.parse(post.content)

                    // If we don't have a name, use a default
                    if (!content.name) {
                      content.name = "Untitled Study Set"
                    }

                    // If we don't have a type, use a default
                    if (!content.type) {
                      content.type = "flashcards"
                    }

                    // If we don't have content array, use an empty array
                    if (!Array.isArray(content.content)) {
                      content.content = []
                    }
                  }
                } catch (parseError) {
                  console.warn("Could not parse post content as JSON:", parseError.message)
                  // Create a default content object for non-JSON content
                  content = {
                    name: "Untitled Study Set",
                    type: "flashcards",
                    content: [{ front: post.content || "Content unavailable", back: "" }],
                  }
                }

                // Include all study sets with reasonable defaults
                const creatorName = post.author?.email?.split("@")[0] || "Anonymous"
                const creator = post.author?.id

                return {
                  id: post.id,
                  title: content.name || "Untitled Study Set",
                  description: `Created by ${creatorName}`,
                  type: content.type || "flashcards",
                  content: content.content || [],
                  fileId: post.fileId,
                  likes: post._count?.reactions || 0,
                  groupID: post.groupID,
                  communityId: content.communityId || post.attributes?.communityId || post.parentID || post.groupID,
                  creator: creator,
                }
              } catch (error) {
                console.error("Error processing post:", error)
                return null
              }
            })
            .filter(Boolean) // Remove null entries

          setStudySets(studySetsData)
        } else {
          setStudySets([])
        }
      })
      .catch((error) => {
        console.error("Error fetching study sets:", error)
        setStudySets([])
      })
  }

  const handleBack = () => {
    navigate("/community")
  }

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)

    // Initialize with empty content based on the template type
    let initialContent = []
    if (template.type === "flashcards") {
      initialContent = [{ front: "", back: "" }]
    } else if (template.type === "multiple_choice") {
      initialContent = [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }]
    } else if (template.type === "fill_in_blank") {
      initialContent = [{ text: "", answer: "" }]
    } else if (template.type === "matching") {
      initialContent = [{ left: "", right: "" }]
    }

    setTemplateContent(initialContent)
    setCurrentStep(3) // Move to content editing step
  }

  const handleAddStudyMaterial = () => {
    setShowAddStudySetDialog(true)
  }

  const createStudySet = async () => {
    try {
      if (!studySetName.trim()) {
        alert("Please enter a name for your study set")
        return
      }

      if (!selectedTemplate) {
        alert("Please select a template")
        return
      }

      if (!templateContent || templateContent.length === 0) {
        alert("Please add some content to your study set")
        return
      }

      const token = sessionStorage.getItem("token")
      const userId = sessionStorage.getItem("user")
      const currentCommunityId = id

      if (!token || !userId) {
        alert("You must be logged in to add study material")
        return
      }

      // Format the post data according to the API requirements
      const postData = {
        content: JSON.stringify({
          name: studySetName,
          type: selectedTemplate.type,
          content: templateContent,
          communityId: currentCommunityId,
        }),
        type: "study_set",
        authorID: Number.parseInt(userId),
        groupID: Number.parseInt(currentCommunityId) || 0,
        attributes: {
          description: "Study set created in community",
          communityId: currentCommunityId,
        },
      }

      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(`Failed to create study set: ${response.status}`)
      }

      const result = await response.json()

      // Add the new study set to the state with proper structure
      const newStudySet = {
        id: result.id,
        title: studySetName,
        description: "Created by you",
        type: selectedTemplate.type,
        content: templateContent,
        likes: 0,
        groupID: Number.parseInt(currentCommunityId) || 0,
        communityId: currentCommunityId,
      }

      // Update state in a safe way
      setStudySets((prevSets) => [...prevSets, newStudySet])

      // Reset form state
      setStudySetName("")
      setSelectedTemplate(null)
      setTemplateContent([])
      setCurrentStep(1)
      setShowAddStudySetDialog(false)

      // Refresh the study sets to ensure we have the latest data
      setTimeout(() => {
        fetchStudySets()
      }, 1000)

      alert("Study set created successfully!")
    } catch (error) {
      console.error("Error creating study set:", error)
      alert(`Failed to create study set: ${error.message}`)
    }
  }

  const handleAddMember = () => {
    const token = sessionStorage.getItem("token")

    if (!token) {
      alert("You must be logged in to add a member")
      return
    }

    // In a real implementation, you would show a modal to select a user
    // For now, we'll just simulate adding a member with a prompt
    const userEmail = prompt("Enter the email of the user you want to add:")

    if (!userEmail) return

    // First, search for the user by email
    fetch(`${API_BASE_URL}/users?email=${userEmail}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((result) => {
        if (result && result[0] && result[0].length > 0) {
          const userId = result[0][0].id

          // Now add the user to the group using the correct endpoint
          return fetch(`${API_BASE_URL}/group-members`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userID: userId,
              groupID: id,
            }),
          })
        } else {
          throw new Error("User not found")
        }
      })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then(() => {
        // Refresh the members list
        fetchMembers()
        alert("Member added successfully!")
      })
      .catch((error) => {
        console.error("Error adding member:", error)
        alert("Failed to add member. Please check the email and try again.")
      })
  }

  const handleViewStudySet = (studySet) => {
    // Navigate to a new route for viewing the study set with state
    navigate(`/community/${id}/study-set/${studySet.id}`, {
      state: {
        studySet: {
          ...studySet,
          content: studySet.content,
        },
      },
    })
  }

  const handleDeleteStudySet = (id, creator) => {
    const token = sessionStorage.getItem("token")
    const userId = sessionStorage.getItem("user")

    if (!token || !userId) {
      alert("You must be logged in to delete a study set")
      return
    }
    if (userId != creator) {
      alert("You are not the creator of this post")
      return
    }
    fetch(`${API_BASE_URL}/posts/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }

        // Remove the study set from state
        const updatedStudySets = studySets.filter((set) => set.id !== id)
        setStudySets(updatedStudySets)
      })
      .catch((error) => {
        console.error("Error deleting study set:", error)
        alert("Failed to delete study set. Please try again.")
      })
  }

  const handleShareStudySet = (id) => {
    // Use the getBaseUrl function to create the correct link
    const studySetLink = `${getBaseUrl()}/community/${community.id}/study-set/${id}`

    navigator.clipboard
      .writeText(studySetLink)
      .then(() => {
        // Set the copied state for this specific study set
        setCopiedSetId(id)

        // Reset after 2 seconds
        setTimeout(() => {
          setCopiedSetId(null)
        }, 2000)
      })
      .catch((err) => {
        console.error("Could not copy text: ", err)
      })
  }

  // Add this new function after the handleShareStudySet function
  const handleLikeStudySet = (studySetId) => {
    const token = sessionStorage.getItem("token")
    const user = sessionStorage.getItem("user") ? JSON.parse(sessionStorage.getItem("user")) : null

    if (!token || !user) return

    const reactionData = {
      userID: user.id,
      postID: studySetId,
      type: "like",
    }

    fetch(`${API_BASE_URL}/reactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reactionData),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        return res.json()
      })
      .catch((error) => {
        console.error("Error liking study set:", error)
      })

    // Update the UI optimistically
    const updatedStudySets = studySets.map((set) => {
      if (set.id === studySetId) {
        return { ...set, likes: set.likes + 1 }
      }
      return set
    })

    setStudySets(updatedStudySets)
  }

  // Updated handleOpenChatRoom function
  const handleOpenChatRoom = () => {
    console.log("Opening community chat room for community ID:", id)

    if (!socket || !socket.connected) {
      console.error("Socket not connected, attempting to connect")

      // Create a notification to inform the user
      showNotification("Connecting to chat server...", "info")

      // Try to use the existing socket instance from import
      if (socket) {
        socket.connect()

        // Give the socket a moment to connect
        setTimeout(() => {
          if (socket.connected) {
            navigateToChatRoom()
          } else {
            console.error("Failed to connect to chat server")
            showNotification("Chat server connection failed. Please try again.", "error")
          }
        }, 2000)
      } else {
        console.error("Socket instance not available")
        showNotification("Chat service unavailable", "error")
      }
      return
    }

    // Socket is already connected, navigate immediately
    navigateToChatRoom()
  }

  // Helper function to navigate to the community chat room
  const navigateToChatRoom = () => {
    try {
      // Store community ID for potential reconnections
      sessionStorage.setItem("activeCommunityID", id)
      sessionStorage.setItem("activeCommunityRoomID", `community-${id}`)

      // Create payload for room creation/joining
      const payload = {
        userID: Number.parseInt(sessionStorage.getItem("user")),
        communityID: Number.parseInt(id),
        roomID: `community-${id}`,
      }

      console.log("Emitting community join-room event with payload:", payload)

      // Emit socket event for joining community room (the server will create it if it doesn't exist)
      socket.emit("/community/join-room", payload)

      // Navigate to the community chat page
      navigate(`/community/${id}/chat`)
    } catch (error) {
      console.error("Error navigating to community chat:", error)
      showNotification("Failed to open chat room", "error")
    }
  }

  // Show notification function
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" })
    }, 3000)
  }

  const handleBackToCommunity = () => {
    setShowChatRoom(false)
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const token = sessionStorage.getItem("token")
    const user = sessionStorage.getItem("user") ? JSON.parse(sessionStorage.getItem("user")) : null

    if (!token || !user) {
      alert("You must be logged in to send a message")
      return
    }

    const messageData = {
      content: newMessage,
      authorID: user.id,
      parentID: id,
      type: "message",
    }

    // Optimistically add the message to the UI
    const optimisticMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sender: "You",
      text: newMessage,
      timestamp: new Date().toISOString(),
    }

    setMessages([...messages, optimisticMessage])
    setNewMessage("") // Clear input immediately

    fetch(`${API_BASE_URL}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(messageData),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((result) => {
        // Message sent successfully
        console.log("Message sent successfully:", result)
      })
      .catch((error) => {
        console.error("Error sending message:", error)
        alert("Failed to send message. Please try again.")

        // Remove the optimistic message on error
        setMessages(messages.filter((msg) => msg.id !== optimisticMessage.id))
      })
  }

  const handleAddItem = () => {
    let newItemTemplate = {}

    if (selectedTemplate.type === "flashcards") {
      newItemTemplate = { front: "", back: "" }
    } else if (selectedTemplate.type === "multiple_choice") {
      newItemTemplate = { question: "", options: ["", "", "", ""], correctAnswer: 0 }
    } else if (selectedTemplate.type === "fill_in_blank") {
      newItemTemplate = { text: "", answer: "" }
    } else if (selectedTemplate.type === "matching") {
      newItemTemplate = { left: "", right: "" }
    }

    setTemplateContent([...templateContent, newItemTemplate])
  }

  const handleUpdateItem = (index, field, value) => {
    const updatedContent = [...templateContent]

    if (field.includes(".")) {
      // Handle nested fields like options.0
      const [mainField, subField] = field.split(".")
      updatedContent[index][mainField][Number.parseInt(subField)] = value
    } else {
      updatedContent[index][field] = value
    }

    setTemplateContent(updatedContent)
  }

  const handleRemoveItem = (index) => {
    const updatedContent = [...templateContent]
    updatedContent.splice(index, 1)
    setTemplateContent(updatedContent)
  }

  const handleNextStep = () => {
    if (currentStep === 1 && studySetName.trim()) {
      setCurrentStep(2)
    }
  }

  const handleBackStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const toggleMembers = () => {
    setShowMembers(!showMembers)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4FDFF]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1D6EF1]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4FDFF]">
        <div className="bg-white p-8 rounded-xl shadow-md">
          <p className="text-[#DC2626] text-[16px]">{error}</p>
        </div>
      </div>
    )
  }

  // Chat Room View
  if (showChatRoom) {
    return (
      <div className="min-h-screen flex bg-[#F4FDFF]">
        {/* Sidebar - Navigation */}
        <div
          className={`${isMobile ? "w-[45px]" : "w-[65px]"} bg-white fixed left-0 top-0 bottom-0 overflow-y-auto border-r border-[#E9D0CE]`}
        >
          {/* Navigation content */}
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${isMobile ? "ml-[45px]" : "ml-[65px]"} mr-0`}>
          {/* Back button without header bar */}
          <div className="h-16 flex items-center px-4">
            <button className="text-[#1D6EF1] mr-3 rounded-full p-1 hover:bg-[#F4FDFF]" onClick={handleBackToCommunity}>
              <ArrowLeft size={isMobile ? 16 : 20} />
            </button>
            <h1 className={`${isMobile ? "text-[20px]" : "text-[26px]"} font-semibold text-[#1D1D20]`}>Chat Room</h1>
          </div>

          {/* Messages Container */}
          <div
            className={`flex-1 bg-white p-${isMobile ? "3" : "6"} mx-${isMobile ? "2" : "6"} mt-${isMobile ? "2" : "6"} mb-0 rounded-t-xl overflow-y-auto max-h-[calc(100vh-180px)]`}
          >
            {messages.length > 0 ? (
              messages.map((message, index) => (
                <div
                  key={message.id || `message-${index}`}
                  className={`mb-4 ${message.sender === "You" ? "text-right" : "text-center"}`}
                >
                  <div
                    className={`inline-block p-${isMobile ? "2" : "3"} rounded-lg ${
                      message.sender === "You"
                        ? "bg-[#1D6EF1] text-white"
                        : message.sender === "System"
                          ? "bg-[#97C7F1] text-white"
                          : "bg-[#C5EDFD] text-[#1D1D20]"
                    }`}
                  >
                    <div className={`font-semibold mb-1 text-[${isMobile ? "12px" : "14px"}]`}>{message.sender}</div>
                    <div className={`text-[${isMobile ? "12px" : "14px"}]`}>{message.text}</div>
                    <div className={`text-[${isMobile ? "10px" : "12px"}] mt-1 opacity-70`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={`text-center text-[#1D1D20]/70 text-[${isMobile ? "12px" : "14px"}]`}>
                No messages yet. Start the conversation!
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div
            className={`px-${isMobile ? "2" : "6"} py-${isMobile ? "2" : "4"} mx-${isMobile ? "2" : "6"} mb-${isMobile ? "2" : "6"} bg-white rounded-b-xl border-t border-[#E9D0CE]`}
          >
            <div className="flex">
              <input
                type="text"
                placeholder="Type a message..."
                className={`flex-1 p-${isMobile ? "2" : "3"} border border-[#E9D0CE] rounded-l-xl text-[#1D1D20] text-[${isMobile ? "12px" : "14px"}]`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <button
                className={`bg-[#1D6EF1] hover:bg-[#1D6EF1]/90 text-white p-${isMobile ? "2" : "3"} rounded-r-xl flex items-center justify-center min-w-[${isMobile ? "80px" : "100px"}]`}
                onClick={handleSendMessage}
              >
                <Send size={isMobile ? 14 : 18} className="mr-2" />
                <span className={`text-[${isMobile ? "12px" : "14px"}]`}>Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main Community View
  return (
    <div className="min-h-screen flex bg-[#F4FDFF]">
      {/* Left Sidebar - Navigation */}
      <div
        className={`${isMobile ? "w-[45px]" : "w-[65px]"} bg-white fixed left-0 top-0 bottom-0 overflow-y-auto border-r border-[#E9D0CE]`}
      >
        {/* Navigation content */}
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 ${isMobile ? "ml-[45px]" : "ml-[65px]"} transition-all duration-300 ${showMembers ? (isMobile ? "mr-[200px]" : "mr-[260px]") : "mr-0"}`}
      >
        {/* Header */}
        {/* Study Sets Section with Action Buttons */}
        <div className={`mb-${isMobile ? "4" : "8"} px-${isMobile ? "2" : "6"} pt-${isMobile ? "2" : "6"}`}>
          <div
            className={`flex ${isMobile ? "flex-col" : "items-center"} justify-between mb-${isMobile ? "3" : "6"} ${isMobile ? "gap-2" : ""}`}
          >
            <div className={`flex ${isMobile ? "flex-wrap" : ""} items-center gap-${isMobile ? "2" : "4"}`}>
              <button
                className="text-[#1D1D20] mr-3 flex items-center rounded-full p-2 hover:bg-[#F4FDFF]"
                onClick={handleBack}
              >
                <ArrowLeft size={isMobile ? 16 : 20} />
              </button>
              <h2 className={`${isMobile ? "text-[24px]" : "text-[32px]"} font-semibold text-[#1D1D20]`}>Study Sets</h2>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className={`bg-white rounded-xl p-${isMobile ? "1" : "2"} text-[#1D1D20] border border-[#E9D0CE] text-[${isMobile ? "12px" : "14px"}]`}
              >
                <option value="all">View All</option>
                <option value="flashcards">Flashcards</option>
                <option value="fill_in_blank">Fill in the Blank</option>
                <option value="matching">Matching</option>
                <option value="multiple_choice">Multiple Choice</option>
              </select>
            </div>

            <div className={`flex ${isMobile ? "flex-wrap" : ""} gap-2 ${isMobile ? "mt-2" : ""}`}>
              <button
                className={`bg-[#1D6EF1] hover:bg-[#1D6EF1]/90 text-white py-${isMobile ? "1" : "2"} px-${isMobile ? "2" : "4"} rounded-xl text-[${isMobile ? "14px" : "16px"}] flex items-center`}
                onClick={handleAddStudyMaterial}
              >
                <Plus size={isMobile ? 14 : 18} className="mr-2" />
                <span>{isMobile ? "Add" : "Add Study Material"}</span>
              </button>

              <button
                className={`bg-[#1D6EF1] hover:bg-[#1D6EF1]/90 text-white py-${isMobile ? "1" : "2"} px-${isMobile ? "2" : "4"} rounded-xl text-[${isMobile ? "14px" : "16px"}] flex items-center`}
                onClick={handleOpenChatRoom}
              >
                <MessageSquare size={isMobile ? 14 : 18} className="mr-2" />
                <span>Message</span>
              </button>

              <button
                className={`bg-[#1D6EF1] hover:bg-[#1D6EF1]/90 text-white py-${isMobile ? "1" : "2"} px-${isMobile ? "2" : "4"} rounded-xl text-[${isMobile ? "14px" : "16px"}] flex items-center`}
                onClick={toggleMembers}
              >
                <Users size={isMobile ? 14 : 18} className="mr-2" />
                <span>Members</span>
              </button>
            </div>
          </div>

          {/* Study Sets Section */}
          {studySets.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 w-full">
              {studySets
                .filter((set) => selectedType === "all" || set.type === selectedType)
                .map((studySet) => (
                  <div
                    key={studySet.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className={`p-${isMobile ? "3" : "5"}`}>
                      <div className="flex items-start">
                        <div
                          className={`bg-[#1D6EF1] rounded-full w-${isMobile ? "10" : "12"} h-${isMobile ? "10" : "12"} flex items-center justify-center text-white mr-${isMobile ? "2" : "4"} flex-shrink-0`}
                        >
                          <span className="font-semibold">{studySet.title.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="min-w-0">
                              <h2
                                className={`${isMobile ? "text-[20px]" : "text-[26px]"} font-semibold text-[#1D1D20] cursor-pointer truncate`}
                                onClick={() => handleViewStudySet(studySet)}
                              >
                                {studySet.title}
                              </h2>
                              <p
                                className={`${isMobile ? "text-[12px]" : "text-[14px]"} text-[#1D1D20]/70 truncate text-left w-full`}
                              >
                                {studySet.description}
                              </p>
                            </div>
                            <span
                              className={`${isMobile ? "text-[12px]" : "text-[14px]"} bg-[#1D6EF1] px-${isMobile ? "2" : "3"} py-1 rounded-xl ml-2 flex-shrink-0`}
                            >
                              {formatStudySetType(studySet.type)}
                            </span>
                          </div>
                          <div
                            className={`flex ${isMobile ? "flex-col" : "justify-between"} items-${isMobile ? "start" : "center"} mt-3 ${isMobile ? "gap-2" : ""}`}
                          >
                            <div className={`flex items-center ${isMobile ? "flex-wrap gap-1" : ""}`}>
                              <button
                                className={`flex items-center bg-[#C5EDFD] text-[#EF7B6C] py-1 px-${isMobile ? "2" : "3"} rounded-xl mr-2`}
                                onClick={() => handleLikeStudySet(studySet.id)}
                              >
                                <Heart size={isMobile ? 14 : 16} className="mr-1" fill="#EF7B6C" />
                                <span className={`text-[${isMobile ? "12px" : "14px"}]`}>{studySet.likes}</span>
                              </button>
                              <button
                                className={`bg-[#48BB78] hover:bg-[#48BB78]/90 text-white py-1 px-${isMobile ? "2" : "3"} rounded-xl mr-2 flex items-center`}
                                onClick={() => handleShareStudySet(studySet.id)}
                              >
                                {copiedSetId === studySet.id ? (
                                  <span className={`text-[${isMobile ? "12px" : "14px"}]`}>Copied!</span>
                                ) : (
                                  <>
                                    <Share2 size={isMobile ? 14 : 16} className="mr-1" />
                                    <span className={`text-[${isMobile ? "12px" : "14px"}]`}>Share</span>
                                  </>
                                )}
                              </button>
                              <button
                                className={`text-[${isMobile ? "12px" : "14px"}] text-[#F4FDFF] flex items-center bg-[#1D1D20] hover:bg-[#DC2626] p-1 px-${isMobile ? "2" : "3"} rounded-xl transition-colors`}
                                onClick={() => handleDeleteStudySet(studySet.id, studySet.creator)}
                              >
                                <Trash2 size={isMobile ? 14 : 16} className="mr-1 text-[#F4FDFF]" />
                                <span>Delete</span>
                              </button>
                            </div>
                            <div className={`flex-shrink-0 ${isMobile ? "" : "ml-4"}`}>
                              <p className={`text-[${isMobile ? "12px" : "14px"}] font-semibold text-left`}>You</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className={`text-center py-${isMobile ? "4" : "8"} bg-white/80 rounded-xl`}>
              <p className={`text-[${isMobile ? "14px" : "16px"}] text-[#1D1D20]/70`}>No study sets available.</p>
            </div>
          )}
        </div>
      </div>

      {/* Members Sidebar - Only shown when toggled */}
      {showMembers && (
        <div
          className={`${isMobile ? "w-[200px]" : "w-[260px]"} bg-white fixed right-0 top-0 bottom-0 overflow-y-auto shadow-lg border-l border-[#E9D0CE] transition-all duration-300 rounded-l-xl`}
        >
          <div className={`p-${isMobile ? "3" : "6"}`}>
            <div className={`flex items-center justify-between mb-${isMobile ? "3" : "6"}`}>
              <h2 className={`${isMobile ? "text-[20px]" : "text-[26px]"} font-semibold text-[#1D1D20]`}>Members</h2>
              <div className="flex items-center gap-2">
                <button
                  className="text-[#1D1D20] hover:text-[#1D1D20]/70 p-1 rounded-full"
                  onClick={toggleMembers}
                  aria-label="Close members panel"
                >
                  <X size={isMobile ? 16 : 20} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {members.length > 0 ? (
                members.map((member, index) => (
                  <div
                    key={member.id || `member-${index}`}
                    className={`flex items-center justify-between p-${isMobile ? "1" : "2"} rounded-xl hover:bg-[#F4FDFF]`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`bg-[#1D6EF1] rounded-full w-${isMobile ? "6" : "8"} h-${isMobile ? "6" : "8"} flex items-center justify-center text-white mr-2`}
                      >
                        <span>{member.email ? member.email[0].toUpperCase() : "?"}</span>
                      </div>
                      <span className={`text-[${isMobile ? "14px" : "16px"}] text-[#1D1D20] truncate max-w-[160px]`}>
                        {member.email}
                      </span>
                    </div>
                    {member.isAdmin && (
                      <span
                        className={`text-[${isMobile ? "12px" : "14px"}] bg-[#97C7F1] px-2 py-1 rounded-xl text-white`}
                      >
                        Admin
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className={`text-[${isMobile ? "12px" : "14px"}] text-[#1D1D20]/70`}>No members yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Study Set Dialog */}
      {showAddStudySetDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 md:p-6 max-w-2xl w-[95%] max-h-[90vh] overflow-y-auto mx-auto my-auto">
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-semibold text-[#1D1D20]">
                  {currentStep === 1
                    ? "Name Your Study Set"
                    : currentStep === 2
                      ? "Select a Template"
                      : "Customize Your Content"}
                </h2>
                <button
                  className="text-[#1D1D20] hover:text-[#1D1D20]/70 p-2 rounded-full"
                  onClick={() => {
                    setShowAddStudySetDialog(false)
                    setCurrentStep(1)
                    setStudySetName("")
                    setSelectedTemplate(null)
                    setTemplateContent([])
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Rest of the dialog content remains the same */}

              {/* Step indicators */}
              <div className="flex mb-4 md:mb-6 rounded-xl overflow-hidden">
                <div
                  className={`flex-1 p-2 text-center ${currentStep === 1 ? "bg-[#1D6EF1] text-white" : "bg-[#F4FDFF]"}`}
                >
                  1. Name
                </div>
                <div
                  className={`flex-1 p-2 text-center ${currentStep === 2 ? "bg-[#1D6EF1] text-white" : "bg-[#F4FDFF]"}`}
                >
                  2. Template
                </div>
                <div
                  className={`flex-1 p-2 text-center ${currentStep === 3 ? "bg-[#1D6EF1] text-white" : "bg-[#F4FDFF]"}`}
                >
                  3. Content
                </div>
              </div>

              {/* Step 1: Name */}
              {currentStep === 1 && (
                <div>
                  <div className="mb-6">
                    <label className={`block text-[#1D1D20] mb-2 text-[${isMobile ? "14px" : "16px"}]`}>
                      Study Set Name
                    </label>
                    <input
                      type="text"
                      className={`w-full p-${isMobile ? "2" : "3"} border border-[#E9D0CE] rounded-xl text-[#1D1D20] text-[${isMobile ? "12px" : "14px"}]`}
                      value={studySetName}
                      onChange={(e) => setStudySetName(e.target.value)}
                      placeholder="Enter a name for your study set"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      className={`bg-[#1D6EF1] hover:bg-[#1D6EF1]/90 text-white py-${isMobile ? "1" : "2"} px-${isMobile ? "3" : "4"} rounded-xl text-[${isMobile ? "14px" : "16px"}]`}
                      onClick={handleNextStep}
                      disabled={!studySetName.trim()}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Template Selection */}
              {currentStep === 2 && (
                <div>
                  <div className={`grid grid-cols-1 ${isMobile ? "" : "md:grid-cols-2"} gap-4 mb-6`}>
                    {[
                      {
                        id: 1,
                        name: "Basic Flashcards",
                        type: "flashcards",
                        content: [{ front: "", back: "" }],
                      },
                      {
                        id: 2,
                        name: "Multiple Choice Quiz",
                        type: "multiple_choice",
                        content: [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }],
                      },
                      {
                        id: 3,
                        name: "Fill in the Blank",
                        type: "fill_in_blank",
                        content: [{ text: "", answer: "" }],
                      },
                      {
                        id: 4,
                        name: "Matching Exercise",
                        type: "matching",
                        content: [{ left: "", right: "" }],
                      },
                    ].map((template) => (
                      <div
                        key={template.id}
                        className={`border rounded-xl p-${isMobile ? "3" : "4"} cursor-pointer hover:bg-[#F4FDFF] ${
                          selectedTemplate?.type === template.type ? "border-[#1D6EF1] bg-[#F4FDFF]" : ""
                        }`}
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <h3 className={`text-[${isMobile ? "14px" : "16px"}] font-semibold mb-2 text-[#1D1D20]`}>
                          {template.name}
                        </h3>
                        <p className={`text-[${isMobile ? "12px" : "14px"}] text-[#1D1D20]/70`}>
                          Type: {formatStudySetType(template.type)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between">
                    <button
                      className={`bg-[#F4FDFF] hover:bg-[#F4FDFF]/90 text-[#1D1D20] py-${isMobile ? "1" : "2"} px-${isMobile ? "3" : "4"} rounded-xl text-[${isMobile ? "14px" : "16px"}]`}
                      onClick={handleBackStep}
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Content Customization */}
              {currentStep === 3 && (
                <div>
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className={`text-[${isMobile ? "14px" : "16px"}] font-semibold text-[#1D1D20]`}>
                        {selectedTemplate.name} Content
                      </h3>
                      <button
                        className={`bg-[#1D1D20] hover:bg-[#1D6EF1]/90 text-white py-1 px-${isMobile ? "2" : "3"} rounded-xl text-[${isMobile ? "12px" : "14px"}] flex items-center`}
                        onClick={handleAddItem}
                      >
                        <Plus size={isMobile ? 14 : 16} className="mr-1" />
                        Add Item
                      </button>
                    </div>

                    {/* Flashcards Editor */}
                    {selectedTemplate.type === "flashcards" && (
                      <div className="space-y-4">
                        {templateContent.map((item, index) => (
                          <div key={index} className={`border border-[#E9D0CE] rounded-xl p-${isMobile ? "3" : "4"}`}>
                            <div className="flex justify-between items-center mb-2">
                              <h4 className={`font-medium text-[${isMobile ? "14px" : "16px"}] text-[#1D1D20]`}>
                                Card {index + 1}
                              </h4>
                              <button
                                className="text-[#DC2626] rounded-full p-1 hover:bg-[#F4FDFF]"
                                onClick={() => handleRemoveItem(index)}
                                disabled={templateContent.length <= 1}
                              >
                                <Trash2 size={isMobile ? 14 : 16} />
                              </button>
                            </div>
                            <div className="mb-3">
                              <label className={`block text-[#1D1D20] mb-1 text-[${isMobile ? "12px" : "14px"}]`}>
                                Front (Question)
                              </label>
                              <input
                                type="text"
                                className={`w-full p-${isMobile ? "1.5" : "2"} border border-[#E9D0CE] rounded-xl text-[#1D1D20] text-[${isMobile ? "12px" : "14px"}]`}
                                value={item.front}
                                onChange={(e) => handleUpdateItem(index, "front", e.target.value)}
                              />
                            </div>
                            <div>
                              <label className={`block text-[#1D1D20] mb-1 text-[${isMobile ? "12px" : "14px"}]`}>
                                Back (Answer)
                              </label>
                              <input
                                type="text"
                                className={`w-full p-${isMobile ? "1.5" : "2"} border border-[#E9D0CE] rounded-xl text-[#1D1D20] text-[${isMobile ? "12px" : "14px"}]`}
                                value={item.back}
                                onChange={(e) => handleUpdateItem(index, "back", e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Multiple Choice Editor */}
                    {selectedTemplate.type === "multiple_choice" && (
                      <div className="space-y-4">
                        {templateContent.map((item, index) => (
                          <div key={index} className={`border border-[#E9D0CE] rounded-xl p-${isMobile ? "3" : "4"}`}>
                            <div className="flex justify-between items-center mb-2">
                              <h4 className={`font-medium text-[${isMobile ? "14px" : "16px"}] text-[#1D1D20]`}>
                                Question {index + 1}
                              </h4>
                              <button
                                className="text-[#DC2626] rounded-full p-1 hover:bg-[#F4FDFF]"
                                onClick={() => handleRemoveItem(index)}
                                disabled={templateContent.length <= 1}
                              >
                                <Trash2 size={isMobile ? 14 : 16} />
                              </button>
                            </div>
                            <div className="mb-3">
                              <label className={`block text-[#1D1D20] mb-1 text-[${isMobile ? "12px" : "14px"}]`}>
                                Question
                              </label>
                              <input
                                type="text"
                                className={`w-full p-${isMobile ? "1.5" : "2"} border border-[#E9D0CE] rounded-xl text-[#1D1D20] text-[${isMobile ? "12px" : "14px"}]`}
                                value={item.question}
                                onChange={(e) => handleUpdateItem(index, "question", e.target.value)}
                              />
                            </div>
                            <div className="mb-3">
                              <label className={`block text-[#1D1D20] mb-1 text-[${isMobile ? "12px" : "14px"}]`}>
                                Options
                              </label>
                              {item.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center mb-2">
                                  <input
                                    type="radio"
                                    name={`correct-${index}`}
                                    checked={item.correctAnswer === optIndex}
                                    onChange={() => handleUpdateItem(index, "correctAnswer", optIndex)}
                                    className="mr-2"
                                  />
                                  <input
                                    type="text"
                                    className={`flex-1 p-${isMobile ? "1.5" : "2"} border border-[#E9D0CE] rounded-xl text-[#1D1D20] text-[${isMobile ? "12px" : "14px"}]`}
                                    value={option}
                                    onChange={(e) => handleUpdateItem(index, `options.${optIndex}`, e.target.value)}
                                    placeholder={`Option ${optIndex + 1}`}
                                  />
                                </div>
                              ))}
                              <p className={`text-[${isMobile ? "10px" : "12px"}] text-[#1D1D20]/70`}>
                                Select the radio button next to the correct answer
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Fill in the Blank Editor */}
                    {selectedTemplate.type === "fill_in_blank" && (
                      <div className="space-y-4">
                        {templateContent.map((item, index) => (
                          <div key={index} className={`border border-[#E9D0CE] rounded-xl p-${isMobile ? "3" : "4"}`}>
                            <div className="flex justify-between items-center mb-2">
                              <h4 className={`font-medium text-[${isMobile ? "14px" : "16px"}] text-[#1D1D20]`}>
                                Sentence {index + 1}
                              </h4>
                              <button
                                className="text-[#DC2626] rounded-full p-1 hover:bg-[#F4FDFF]"
                                onClick={() => handleRemoveItem(index)}
                                disabled={templateContent.length <= 1}
                              >
                                <Trash2 size={isMobile ? 14 : 16} />
                              </button>
                            </div>
                            <div className="mb-3">
                              <label className={`block text-[#1D1D20] mb-1 text-[${isMobile ? "12px" : "14px"}]`}>
                                Text (use ___ for the blank)
                              </label>
                              <input
                                type="text"
                                className={`w-full p-${isMobile ? "1.5" : "2"} border border-[#E9D0CE] rounded-xl text-[#1D1D20] text-[${isMobile ? "12px" : "14px"}]`}
                                value={item.text}
                                onChange={(e) => handleUpdateItem(index, "text", e.target.value)}
                                placeholder="Example: The sky is ___."
                              />
                            </div>
                            <div>
                              <label className={`block text-[#1D1D20] mb-1 text-[${isMobile ? "12px" : "14px"}]`}>
                                Answer
                              </label>
                              <input
                                type="text"
                                className={`w-full p-${isMobile ? "1.5" : "2"} border border-[#E9D0CE] rounded-xl text-[#1D1D20] text-[${isMobile ? "12px" : "14px"}]`}
                                value={item.answer}
                                onChange={(e) => handleUpdateItem(index, "answer", e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Matching Editor */}
                    {selectedTemplate.type === "matching" && (
                      <div className="space-y-4">
                        {templateContent.map((item, index) => (
                          <div key={index} className={`border border-[#E9D0CE] rounded-xl p-${isMobile ? "3" : "4"}`}>
                            <div className="flex justify-between items-center mb-2">
                              <h4 className={`font-medium text-[${isMobile ? "14px" : "16px"}] text-[#1D1D20]`}>
                                Pair {index + 1}
                              </h4>
                              <button
                                className="text-[#DC2626] rounded-full p-1 hover:bg-[#F4FDFF]"
                                onClick={() => handleRemoveItem(index)}
                                disabled={templateContent.length <= 1}
                              >
                                <Trash2 size={isMobile ? 14 : 16} />
                              </button>
                            </div>
                            <div className={`grid grid-cols-${isMobile ? "1" : "2"} gap-4`}>
                              <div>
                                <label className={`block text-[#1D1D20] mb-1 text-[${isMobile ? "12px" : "14px"}]`}>
                                  Left Item
                                </label>
                                <input
                                  type="text"
                                  className={`w-full p-${isMobile ? "1.5" : "2"} border border-[#E9D0CE] rounded-xl text-[#1D1D20] text-[${isMobile ? "12px" : "14px"}]`}
                                  value={item.left}
                                  onChange={(e) => handleUpdateItem(index, "left", e.target.value)}
                                />
                              </div>
                              <div>
                                <label className={`block text-[#1D1D20] mb-1 text-[${isMobile ? "12px" : "14px"}]`}>
                                  Right Item
                                </label>
                                <input
                                  type="text"
                                  className={`w-full p-${isMobile ? "1.5" : "2"} border border-[#E9D0CE] rounded-xl text-[#1D1D20] text-[${isMobile ? "12px" : "14px"}]`}
                                  value={item.right}
                                  onChange={(e) => handleUpdateItem(index, "right", e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <button
                      className={`bg-[#F4FDFF] hover:bg-[#F4FDFF]/90 text-[#1D1D20] py-${isMobile ? "1" : "2"} px-${isMobile ? "3" : "4"} rounded-xl text-[${isMobile ? "14px" : "16px"}]`}
                      onClick={handleBackStep}
                    >
                      Back
                    </button>
                    <button
                      className={`bg-[#48BB78] hover:bg-[#48BB78]/90 text-white py-${isMobile ? "1" : "2"} px-${isMobile ? "3" : "4"} rounded-xl text-[${isMobile ? "14px" : "16px"}]`}
                      onClick={createStudySet}
                      disabled={templateContent.length === 0}
                    >
                      Create Study Set
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notification Component */}
      {notification.show && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
            notification.type === "success"
              ? "bg-green-500"
              : notification.type === "info"
                ? "bg-blue-500"
                : "bg-red-500"
          } text-white z-50`}
        >
          {notification.message}
        </div>
      )}
    </div>
  )
}


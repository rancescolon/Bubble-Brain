"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { MessageSquare, Plus, Heart, Share2, Trash2, ArrowLeft, Send, Users, X } from "lucide-react"

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
            //likes: 0,
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
        .then((data) => {
          if (data && data[0] && data[0].length > 0) {
            // Transform API data to match our component's expected format
            const membersData = data[0].map((member) => ({
              id: member.id,
              name: member.userID.attributes?.username || member.userID.email?.split("@")[0] || "User",
              isAdmin: member.userID === community?.authorId,
            }))
            setMembers(membersData)
          } else {
            // If no members returned, at least add the owner as admin
            setMembers([
              {
                id: community?.authorId,
                name: "Owner",
                isAdmin: true,
              },
            ])
          }
        })
        .catch((error) => {
          console.error("Error fetching members:", error)
          // Set default member if fetch fails
          setMembers([
            {
              id: community?.authorId,
              name: "Owner",
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
            const messagesData = result[0].map((message) => ({
              id: message.id,
              sender: message.authorName || "User",
              text: message.content || "No message content",
              timestamp: message.createdAt || new Date().toISOString(),
            }))
            setMessages(messagesData)
          } else {
            // Set default welcome messages if none exist
            const initialMessages = [
              { id: 1, sender: "System", text: "Welcome to the community chat!", timestamp: new Date().toISOString() },
            ]
            setMessages(initialMessages)
          }
        })
        .catch((error) => {
          console.error("Error fetching messages:", error)
          // Set default welcome message if fetch fails
          const initialMessages = [
            { id: 1, sender: "System", text: "Welcome to the community chat!", timestamp: new Date().toISOString() },
          ]
          setMessages(initialMessages)
        })
  }
  //The code for study sets was created with the help of ChatGPT
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

                    return {
                      id: post.id,
                      title: content.name || "Untitled Study Set",
                      description: `Created by ${creatorName}`,
                      type: content.type || "flashcards",
                      content: content.content || [],
                      fileId: post.fileId,
                      //likes: post._count?.reactions || 0,
                      groupID: post.groupID,
                      communityId: content.communityId || post.attributes?.communityId || post.parentID || post.groupID,
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
        //likes: 0,
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

  const handleDeleteStudySet = (id) => {
    const token = sessionStorage.getItem("token")

    if (!token) {
      alert("You must be logged in to delete a study set")
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
/*
  // Add this new function after the handleShareStudySet function
  const handleLikeStudySet = (studySetId) => {
    const token = sessionStorage.getItem("token")
    const user = JSON.parse(sessionStorage.getItem("user"))

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
*/
  const handleOpenChatRoom = () => {
    setShowChatRoom(true)
    // Initialize with some sample messages if empty
    if (!messages.length) {
      const initialMessages = [
        { id: 1, sender: "You", text: "Hello everyone!", timestamp: new Date().toISOString() },
        { id: 2, sender: "System", text: "Welcome to the community chat!", timestamp: new Date().toISOString() },
      ]
      setMessages(initialMessages)
    }
  }

  const handleBackToCommunity = () => {
    setShowChatRoom(false)
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const token = sessionStorage.getItem("token")
    const user = JSON.parse(sessionStorage.getItem("user"))

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
      id: Date.now(),
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
          <div className="w-[65px] bg-white fixed left-0 top-0 bottom-0 overflow-y-auto border-r border-[#E9D0CE]">
            {/* Navigation content */}
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col ml-[65px] mr-0">
            {/* Back button without header bar */}
            <div className="h-16 flex items-center px-4">
              <button className="text-[#1D6EF1] mr-3 rounded-full p-1 hover:bg-[#F4FDFF]" onClick={handleBackToCommunity}>
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-[26px] font-semibold text-[#1D1D20]">Chat Room</h1>
            </div>

            {/* Messages Container */}
            <div className="flex-1 bg-white p-6 mx-6 mt-6 mb-0 rounded-t-xl overflow-y-auto max-h-[calc(100vh-180px)]">
              {messages.length > 0 ? (
                  messages.map((message, index) => (
                      <div
                          key={message.id || `message-${index}`}
                          className={`mb-4 ${message.sender === "You" ? "text-right" : "text-center"}`}
                      >
                        <div
                            className={`inline-block p-3 rounded-lg ${
                                message.sender === "You"
                                    ? "bg-[#1D6EF1] text-white"
                                    : message.sender === "System"
                                        ? "bg-[#97C7F1] text-white"
                                        : "bg-[#C5EDFD] text-[#1D1D20]"
                            }`}
                        >
                          <div className="font-semibold mb-1 text-[14px]">{message.sender}</div>
                          <div className="text-[14px]">{message.text}</div>
                          <div className="text-[12px] mt-1 opacity-70">
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                  ))
              ) : (
                  <div className="text-center text-[#1D1D20]/70 text-[14px]">No messages yet. Start the conversation!</div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="px-6 py-4 mx-6 mb-6 bg-white rounded-b-xl border-t border-[#E9D0CE]">
              <div className="flex">
                <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 p-3 border border-[#E9D0CE] rounded-l-xl text-[#1D1D20] text-[14px]"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button
                    className="bg-[#1D6EF1] hover:bg-[#1D6EF1]/90 text-white p-3 rounded-r-xl flex items-center justify-center min-w-[100px]"
                    onClick={handleSendMessage}
                >
                  <Send size={18} className="mr-2" />
                  <span className="text-[14px]">Send</span>
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
        <div className="w-[65px] bg-white fixed left-0 top-0 bottom-0 overflow-y-auto border-r border-[#E9D0CE]">
          {/* Navigation content */}
        </div>

        {/* Main Content */}
        <div className={`flex-1 ml-[65px] transition-all duration-300 ${showMembers ? "mr-[260px]" : "mr-0"}`}>
          {/* Header */}
          {/* Study Sets Section with Action Buttons */}
          <div className="mb-8 px-6 pt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                    className="text-[#1D1D20] mr-3 flex items-center rounded-full p-2 hover:bg-[#F4FDFF]"
                    onClick={handleBack}
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-[32px] font-semibold text-[#1D1D20]">Study Sets</h2>
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="bg-white rounded-xl p-2 text-[#1D1D20] border border-[#E9D0CE] text-[14px]"
                >
                  <option value="all">View All</option>
                  <option value="flashcards">Flashcards</option>
                  <option value="fill_in_blank">Fill in the Blank</option>
                  <option value="matching">Matching</option>
                  <option value="multiple_choice">Multiple Choice</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                    className="bg-[#1D6EF1] hover:bg-[#1D6EF1]/90 text-white py-2 px-4 rounded-xl text-[16px] flex items-center"
                    onClick={handleAddStudyMaterial}
                >
                  <Plus size={18} className="mr-2" />
                  <span>Add Study Material</span>
                </button>

                <button
                    className="bg-[#1D6EF1] hover:bg-[#1D6EF1]/90 text-white py-2 px-4 rounded-xl text-[16px] flex items-center"
                    onClick={handleOpenChatRoom}
                >
                  <MessageSquare size={18} className="mr-2" />
                  <span>Message</span>
                </button>

                <button
                    className="bg-[#1D6EF1] hover:bg-[#1D6EF1]/90 text-white py-2 px-4 rounded-xl text-[16px] flex items-center"
                    onClick={toggleMembers}
                >
                  <Users size={18} className="mr-2" />
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
                            <div className="p-5">
                              <div className="flex items-start">
                                <div className="bg-[#1D6EF1] rounded-full w-12 h-12 flex items-center justify-center text-white mr-4 flex-shrink-0">
                                  <span className="font-semibold">{studySet.title.charAt(0)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="min-w-0">
                                      <h2
                                          className="text-[26px] font-semibold text-[#1D1D20] cursor-pointer truncate"
                                          onClick={() => handleViewStudySet(studySet)}
                                      >
                                        {studySet.title}
                                      </h2>
                                      <p className="text-[14px] text-[#1D1D20]/70 truncate text-left w-full">
                                        {studySet.description}
                                      </p>
                                    </div>
                                    <span className="text-[14px] bg-[#1D6EF1] px-3 py-1 rounded-xl ml-2 flex-shrink-0">
                              {formatStudySetType(studySet.type)}
                            </span>
                                  </div>
                                  <div className="flex justify-between items-center mt-3">
                                    <div className="flex items-center">
                                      {/*
                                      <button
                                          className="flex items-center bg-[#C5EDFD] text-[#EF7B6C] py-1 px-3 rounded-xl mr-2"
                                          onClick={() => handleLikeStudySet(studySet.id)}
                                      >
                                        <Heart size={16} className="mr-1" fill="#EF7B6C" />
                                        <span className="text-[14px]">{studySet.likes}</span>
                                      </button>
                                      */}
                                      <button
                                          className="bg-[#48BB78] hover:bg-[#48BB78]/90 text-white py-1 px-3 rounded-xl mr-2 flex items-center"
                                          onClick={() => handleShareStudySet(studySet.id)}
                                      >
                                        {copiedSetId === studySet.id ? (
                                            <span className="text-[14px]">Copied!</span>
                                        ) : (
                                            <>
                                              <Share2 size={16} className="mr-1" />
                                              <span className="text-[14px]">Share</span>
                                            </>
                                        )}
                                      </button>
                                      <button
                                          className="text-[14px] text-[#F4FDFF] flex items-center bg-[#1D1D20] hover:bg-[#DC2626] p-1 px-3 rounded-xl transition-colors"
                                          onClick={() => handleDeleteStudySet(studySet.id)}
                                      >
                                        <Trash2 size={16} className="mr-1 text-[#F4FDFF]" />
                                        <span>Delete</span>
                                      </button>
                                    </div>
                                    <div className="flex-shrink-0 ml-4">
                                      <p className="text-[14px] font-semibold text-left">You</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                      ))}
                </div>
            ) : (
                <div className="text-center py-8 bg-white/80 rounded-xl">
                  <p className="text-[16px] text-[#1D1D20]/70">No study sets available.</p>
                </div>
            )}
          </div>
        </div>

        {/* Members Sidebar - Only shown when toggled */}
        {showMembers && (
            <div className="w-[260px] bg-white fixed right-0 top-0 bottom-0 overflow-y-auto shadow-lg border-l border-[#E9D0CE] transition-all duration-300 rounded-l-xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[26px] font-semibold text-[#1D1D20]">Members</h2>
                  <div className="flex items-center gap-2">
                    <button
                        className="text-[#1D1D20] hover:text-[#1D1D20]/70 p-1 rounded-full"
                        onClick={toggleMembers}
                        aria-label="Close members panel"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {members.length > 0 ? (
                      members.map((member, index) => (
                          <div
                              key={member.id || `member-${index}`}
                              className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F4FDFF]"
                          >
                            <div className="flex items-center">
                              <div className="bg-[#1D6EF1] rounded-full w-8 h-8 flex items-center justify-center text-white mr-2">
                                <span>{member.name.charAt(0)}</span>
                              </div>
                              <span className="text-[16px] text-[#1D1D20]">{member.name}</span>
                            </div>
                            {member.isAdmin && (
                                <span className="text-[14px] bg-[#97C7F1] px-2 py-1 rounded-xl text-white">Admin</span>
                            )}
                          </div>
                      ))
                  ) : (
                      <p className="text-[14px] text-[#1D1D20]/70">No members yet.</p>
                  )}
                </div>
              </div>
            </div>
        )}

        {/* Add Study Set Dialog */}
        {showAddStudySetDialog && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-[32px] font-semibold text-[#1D1D20]">
                    {currentStep === 1
                        ? "Name Your Study Set"
                        : currentStep === 2
                            ? "Select a Template"
                            : "Customize Your Content"}
                  </h2>
                  <button
                      className="text-[#1D1D20] hover:text-[#1D1D20]/70"
                      onClick={() => {
                        setShowAddStudySetDialog(false)
                        setCurrentStep(1)
                        setStudySetName("")
                        setSelectedTemplate(null)
                        setTemplateContent([])
                      }}
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>

                {/* Step indicators */}
                <div className="flex mb-6">
                  <div
                      className={`flex-1 p-2 text-center ${currentStep === 1 ? "bg-[#1D6EF1] text-white" : "bg-[#F4FDFF]"} rounded-l-xl`}
                  >
                    1. Name
                  </div>
                  <div
                      className={`flex-1 p-2 text-center ${currentStep === 2 ? "bg-[#1D6EF1] text-white" : "bg-[#F4FDFF]"}`}
                  >
                    2. Template
                  </div>
                  <div
                      className={`flex-1 p-2 text-center ${currentStep === 3 ? "bg-[#1D6EF1] text-white" : "bg-[#F4FDFF]"} rounded-r-xl`}
                  >
                    3. Content
                  </div>
                </div>

                {/* Step 1: Name */}
                {currentStep === 1 && (
                    <div>
                      <div className="mb-6">
                        <label className="block text-[#1D1D20] mb-2 text-[16px]">Study Set Name</label>
                        <input
                            type="text"
                            className="w-full p-3 border border-[#E9D0CE] rounded-xl text-[#1D1D20] text-[14px]"
                            value={studySetName}
                            onChange={(e) => setStudySetName(e.target.value)}
                            placeholder="Enter a name for your study set"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                            className="bg-[#1D6EF1] hover:bg-[#1D6EF1]/90 text-white py-2 px-4 rounded-xl text-[16px]"
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                                className={`border rounded-xl p-4 cursor-pointer hover:bg-[#F4FDFF] ${
                                    selectedTemplate?.type === template.type ? "border-[#1D6EF1] bg-[#F4FDFF]" : ""
                                }`}
                                onClick={() => handleTemplateSelect(template)}
                            >
                              <h3 className="text-[16px] font-semibold mb-2 text-[#1D1D20]">{template.name}</h3>
                              <p className="text-[14px] text-[#1D1D20]/70">Type: {formatStudySetType(template.type)}</p>
                            </div>
                        ))}
                      </div>

                      <div className="flex justify-between">
                        <button
                            className="bg-[#F4FDFF] hover:bg-[#F4FDFF]/90 text-[#1D1D20] py-2 px-4 rounded-xl text-[16px]"
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
                          <h3 className="text-[16px] font-semibold text-[#1D1D20]">{selectedTemplate.name} Content</h3>
                          <button
                              className="bg-[#1D1D20] hover:bg-[#1D6EF1]/90 text-white py-1 px-3 rounded-xl text-[14px] flex items-center"
                              onClick={handleAddItem}
                          >
                            <Plus size={16} className="mr-1" />
                            Add Item
                          </button>
                        </div>

                        {/* Flashcards Editor */}
                        {selectedTemplate.type === "flashcards" && (
                            <div className="space-y-4">
                              {templateContent.map((item, index) => (
                                  <div key={index} className="border border-[#E9D0CE] rounded-xl p-4">
                                    <div className="flex justify-between items-center mb-2">
                                      <h4 className="font-medium text-[16px] text-[#1D1D20]">Card {index + 1}</h4>
                                      <button
                                          className="text-[#DC2626] rounded-full p-1 hover:bg-[#F4FDFF]"
                                          onClick={() => handleRemoveItem(index)}
                                          disabled={templateContent.length <= 1}
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                    <div className="mb-3">
                                      <label className="block text-[#1D1D20] mb-1 text-[14px]">Front (Question)</label>
                                      <input
                                          type="text"
                                          className="w-full p-2 border border-[#E9D0CE] rounded-xl text-[#1D1D20] text-[14px]"
                                          value={item.front}
                                          onChange={(e) => handleUpdateItem(index, "front", e.target.value)}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[#1D1D20] mb-1 text-[14px]">Back (Answer)</label>
                                      <input
                                          type="text"
                                          className="w-full p-2 border border-[#E9D0CE] rounded-xl text-[#1D1D20] text-[14px]"
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
                                  <div key={index} className="border border-[#E9D0CE] rounded-xl p-4">
                                    <div className="flex justify-between items-center mb-2">
                                      <h4 className="font-medium text-[16px] text-[#1D1D20]">Question {index + 1}</h4>
                                      <button
                                          className="text-[#DC2626] rounded-full p-1 hover:bg-[#F4FDFF]"
                                          onClick={() => handleRemoveItem(index)}
                                          disabled={templateContent.length <= 1}
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                    <div className="mb-3">
                                      <label className="block text-[#1D1D20] mb-1 text-[14px]">Question</label>
                                      <input
                                          type="text"
                                          className="w-full p-2 border border-[#E9D0CE] rounded-xl text-[#1D1D20] text-[14px]"
                                          value={item.question}
                                          onChange={(e) => handleUpdateItem(index, "question", e.target.value)}
                                      />
                                    </div>
                                    <div className="mb-3">
                                      <label className="block text-[#1D1D20] mb-1 text-[14px]">Options</label>
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
                                                className="flex-1 p-2 border border-[#E9D0CE] rounded-xl text-[#1D1D20] text-[14px]"
                                                value={option}
                                                onChange={(e) => handleUpdateItem(index, `options.${optIndex}`, e.target.value)}
                                                placeholder={`Option ${optIndex + 1}`}
                                            />
                                          </div>
                                      ))}
                                      <p className="text-[12px] text-[#1D1D20]/70">
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
                                  <div key={index} className="border border-[#E9D0CE] rounded-xl p-4">
                                    <div className="flex justify-between items-center mb-2">
                                      <h4 className="font-medium text-[16px] text-[#1D1D20]">Sentence {index + 1}</h4>
                                      <button
                                          className="text-[#DC2626] rounded-full p-1 hover:bg-[#F4FDFF]"
                                          onClick={() => handleRemoveItem(index)}
                                          disabled={templateContent.length <= 1}
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                    <div className="mb-3">
                                      <label className="block text-[#1D1D20] mb-1 text-[14px]">
                                        Text (use ___ for the blank)
                                      </label>
                                      <input
                                          type="text"
                                          className="w-full p-2 border border-[#E9D0CE] rounded-xl text-[#1D1D20] text-[14px]"
                                          value={item.text}
                                          onChange={(e) => handleUpdateItem(index, "text", e.target.value)}
                                          placeholder="Example: The sky is ___."
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[#1D1D20] mb-1 text-[14px]">Answer</label>
                                      <input
                                          type="text"
                                          className="w-full p-2 border border-[#E9D0CE] rounded-xl text-[#1D1D20] text-[14px]"
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
                                  <div key={index} className="border border-[#E9D0CE] rounded-xl p-4">
                                    <div className="flex justify-between items-center mb-2">
                                      <h4 className="font-medium text-[16px] text-[#1D1D20]">Pair {index + 1}</h4>
                                      <button
                                          className="text-[#DC2626] rounded-full p-1 hover:bg-[#F4FDFF]"
                                          onClick={() => handleRemoveItem(index)}
                                          disabled={templateContent.length <= 1}
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-[#1D1D20] mb-1 text-[14px]">Left Item</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 border border-[#E9D0CE] rounded-xl text-[#1D1D20] text-[14px]"
                                            value={item.left}
                                            onChange={(e) => handleUpdateItem(index, "left", e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[#1D1D20] mb-1 text-[14px]">Right Item</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 border border-[#E9D0CE] rounded-xl text-[#1D1D20] text-[14px]"
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
                            className="bg-[#F4FDFF] hover:bg-[#F4FDFF]/90 text-[#1D1D20] py-2 px-4 rounded-xl text-[16px]"
                            onClick={handleBackStep}
                        >
                          Back
                        </button>
                        <button
                            className="bg-[#48BB78] hover:bg-[#48BB78]/90 text-white py-2 px-4 rounded-xl text-[16px]"
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
        )}
      </div>
  )
}


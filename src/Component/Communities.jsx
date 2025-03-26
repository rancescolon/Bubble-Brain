"use client"

import { useState, useRef, useEffect, createContext, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Search, Heart, Share2, MessageCircle, ArrowLeft, Users, BookOpen, FileText } from "lucide-react"

// Create a context for navigation state
const NavContext = createContext({
  navOpen: false,
  toggleNav: () => {},
})

// Custom font import
const fontStyle = {
  fontFamily: '"Sour Gummy", sans-serif',
}

// Adding global style for font
const GlobalStyle = () => (
    <style
        dangerouslySetInnerHTML={{
          __html: `
        @font-face {
          font-family: 'Sour Gummy';
          src: url('/src/assets/fonts/SourGummy-VariableFont_wdth,wght.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
        
        body, button, input, h1, h2, h3, p, span {
          font-family: 'Sour Gummy', sans-serif;
        }

        @media (max-width: 768px) {
          .main-content-shift {
            transition: margin-left 0.3s ease-in-out;
          }
          
          .sidebar-open {
            margin-left: 0;
            transition: margin-left 0.3s ease-in-out;
          }
          
          .sidebar-closed {
            margin-left: -100%;
            transition: margin-left 0.3s ease-in-out;
          }
        }
      `,
        }}
    />
)

const TopBar = () => {
  const { navOpen, toggleNav } = useContext(NavContext)
}

const Communities = () => {
  // Add this console log to verify the API path
  console.log("API Path:", process.env.REACT_APP_API_PATH)

  const [searchQuery, setSearchQuery] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [communityName, setCommunityName] = useState("")
  const [communityDescription, setCommunityDescription] = useState("")
  const [showCommunityDetail, setShowCommunityDetail] = useState(false)
  const [currentCommunity, setCurrentCommunity] = useState(null)
  const [myCommunities, setMyCommunities] = useState([])
  const [showChatRoom, setShowChatRoom] = useState(false)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const modalRef = useRef(null)
  const navigate = useNavigate()

  // Add a new state variable for tracking which community's share button was clicked
  const [copiedCommunityId, setCopiedCommunityId] = useState(null)

  // Communities state
  const [communities, setCommunities] = useState([])

  const backgroundStyle = {
    backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image3-M7gmQibPxwx9MBXzWTzonaopMrRC3Q.png')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
  }

  const toggleNav = () => {
    setNavOpen(!navOpen)
  }

  // Navigation context value
  const navContextValue = {
    navOpen,
    toggleNav,
  }

  // Check for preview mode
  useEffect(() => {
    // Check if we're in preview mode by looking for preview cookies
    const cookies = document.cookie.split(";")
    const hasPreviewCookie = cookies.some(
        (cookie) => cookie.trim().startsWith("__prerender_bypass=") || cookie.trim().startsWith("__next_preview_data="),
    )

    setIsPreviewMode(hasPreviewCookie)

    if (hasPreviewCookie) {
      console.log("Preview mode is active")
      // You could load draft data here if needed
    }
  }, [])

  // Fetch communities on component mount
  useEffect(() => {
    fetchCommunities()
  }, [])

  // Handle body overflow when nav is open on mobile
  useEffect(() => {
    if (navOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [navOpen])

  // Fetch communities from API
  const fetchCommunities = () => {
    setLoading(true)
    setError(null)
    const token = sessionStorage.getItem("token")

    if (!token) {
      setError("You must be logged in to view communities")
      setLoading(false)
      return
    }

    fetch(`${process.env.REACT_APP_API_PATH}/groups`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
          return res.json()
        })
        .then((result) => {
          if (result && result[0]) {
            const communitiesData = result[0].map((group) => ({
              id: group.id,
              name: group.name,
              description: group.description || "No description available",
              authorId: group.ownerID,
              members: [], // We'll fetch members separately if needed
              likes: Math.floor(Math.random() * 50), // Mock likes for visual design
            }))
            setCommunities(communitiesData)

            const user = JSON.parse(sessionStorage.getItem("user"))
            if (user) {
              const userCommunities = communitiesData.filter((community) => community.authorId === user.id)
              setMyCommunities(userCommunities)
            }
          }
          setLoading(false)
        })
        .catch((error) => {
          console.error("Error fetching communities:", error)
          setError("Failed to load communities. Please try again later.")
          setLoading(false)
        })
  }

  // Handle click outside of modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false)
      }
    }

    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showModal])

  // Close nav when window resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && navOpen) {
        setNavOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [navOpen])

  // Filter communities based on search query
  const filteredCommunities = communities.filter((community) =>
      community.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSubmit = () => {
    if (!communityName.trim()) return

    setLoading(true)
    const token = sessionStorage.getItem("token")
    const user = JSON.parse(sessionStorage.getItem("user"))

    if (!token || !user) {
      alert("You must be logged in to create a community")
      setLoading(false)
      return
    }

    const communityData = {
      name: communityName,
      description: communityDescription,
      ownerID: user.id,
    }

    fetch(`${process.env.REACT_APP_API_PATH}/groups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(communityData),
    })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
          }
          return res.json()
        })
        .then((result) => {
          // Create a new community object with our expected format
          const newCommunity = {
            id: result.id,
            name: result.name,
            description: result.description,
            likes: 0,
            members: [{ id: user.id, name: "You", isAdmin: true }],
            flashcards: [],
            messages: [],
            authorId: result.ownerID,
          }

          // Add to communities list
          setCommunities([...communities, newCommunity])

          // Add to my communities
          setMyCommunities([...myCommunities, newCommunity])

          // Show detail page for the new community
          setCurrentCommunity(newCommunity)
          setShowCommunityDetail(true)

          // Reset form
          setCommunityName("")
          setCommunityDescription("")
          setShowModal(false)
          setLoading(false)
        })
        .catch((error) => {
          console.error("Error creating community:", error)
          alert("Failed to create community. Please try again.")
          setLoading(false)
        })
  }

  const handleLikeCommunity = (communityId) => {
    const token = sessionStorage.getItem("token")
    const user = JSON.parse(sessionStorage.getItem("user"))

    if (!token || !user) return

    const reactionData = {
      userID: user.id,
      groupID: communityId,
      type: "like",
    }

    fetch(`${process.env.REACT_APP_API_PATH}/reactions`, {
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
          console.error("Error liking community:", error)
        })

    // Update the UI optimistically
    const updatedCommunities = communities.map((c) => {
      if (c.id === communityId) {
        return { ...c, likes: c.likes + 1 }
      }
      return c
    })

    setCommunities(updatedCommunities)
  }

  const handleJoinCommunity = (communityId) => {
    const token = sessionStorage.getItem("token")
    const user = JSON.parse(sessionStorage.getItem("user"))

    if (!token || !user) {
      alert("You must be logged in to join a community")
      return
    }

    const userId = user.id
    console.log("User ID:", userId) // Debug log
    console.log("Community ID:", communityId) // Debug log

    const joinButtonElement = document.querySelector(`button[data-community-id="${communityId}"]`)
    if (joinButtonElement) {
      joinButtonElement.textContent = "Joining..."
      joinButtonElement.disabled = true
    }

    // Simplified request body - the API might be expecting a simpler format
    const requestBody = {
      userID: userId,
      groupID: communityId,
    }

    console.log("Request body:", requestBody) // Debug log

    fetch(`${process.env.REACT_APP_API_PATH}/group-members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    })
        .then((res) => {
          if (!res.ok) {
            return res.text().then((text) => {
              console.error("Error response:", text)
              throw new Error(`HTTP error! status: ${res.status}, message: ${text}`)
            })
          }
          return res.json()
        })
        .then((result) => {
          console.log("Join result:", result)

          // Update the UI optimistically
          const community = communities.find((c) => c.id === communityId)
          if (community) {
            const updatedCommunity = {
              ...community,
              members: [...(community.members || []), { id: userId, name: user.username || "You" }],
            }

            setCommunities(communities.map((c) => (c.id === communityId ? updatedCommunity : c)))

            if (!myCommunities.some((c) => c.id === communityId)) {
              setMyCommunities([...myCommunities, updatedCommunity])
            }
          }

          alert("Successfully joined the community!")
        })
        .catch((error) => {
          console.error("Error joining community:", error)
          alert(`Failed to join community. Please try again later.`)
        })
        .finally(() => {
          if (joinButtonElement) {
            joinButtonElement.textContent = "Join"
            joinButtonElement.disabled = false
          }
        })
  }

  // Add this function at the beginning of the Communities component to get the base URL
  const getBaseUrl = () => {
    // Check if we're in production by looking for the specific domain
    const isProduction = window.location.hostname.includes("webdev.cse.buffalo.edu")

    if (isProduction) {
      // In production, include the full path
      return `${window.location.origin}/hci/teams/droptable`
    } else {
      // In development, just use the origin
      return window.location.origin
    }
  }

  const handleShareCommunity = (communityId) => {
    // Use the getBaseUrl function to create the correct link with the view path
    const communityLink = `${getBaseUrl()}/community/view/${communityId}`
    console.log("Link copied to clipboard:", communityLink)

    // Set the copied state for this specific community
    setCopiedCommunityId(communityId)

    // In a real implementation, you would use the Clipboard API
    navigator.clipboard
        .writeText(communityLink)
        .then(() => {
          // Reset after 2 seconds
          setTimeout(() => {
            setCopiedCommunityId(null)
          }, 2000)
        })
        .catch((err) => {
          console.error("Could not copy text: ", err)
        })
  }

  const handleViewCommunity = (communityId) => {
    // Use the getBaseUrl function for navigation
    const communityUrl = `/community/view/${communityId}`
    navigate(communityUrl)
  }

  // Add a function to update a community when changes are made
  const handleUpdateCommunity = (updatedCommunity) => {
    // Update the communities array
    const updatedCommunities = communities.map((c) => (c.id === updatedCommunity.id ? updatedCommunity : c))
    setCommunities(updatedCommunities)

    // Also update myCommunities if it exists there
    if (myCommunities.some((c) => c.id === updatedCommunity.id)) {
      const updatedMyCommunities = myCommunities.map((c) => (c.id === updatedCommunity.id ? updatedCommunity : c))
      setMyCommunities(updatedMyCommunities)
    }

    // Update current community reference
    setCurrentCommunity(updatedCommunity)
  }

  const handleBackToCommunities = () => {
    setShowCommunityDetail(false)
    setCurrentCommunity(null)
    setShowChatRoom(false)
    setNavOpen(false) // Close mobile nav when going back
  }

  const handleOpenChatRoom = () => {
    setShowChatRoom(true)
    setNavOpen(false) // Close mobile nav when opening chat

    // Initialize with some sample messages
    if (!currentCommunity.messages || currentCommunity.messages.length === 0) {
      const initialMessages = [
        { id: 1, sender: "You", text: "Hello everyone!", timestamp: new Date().toISOString() },
        { id: 2, sender: "System", text: "Welcome to the community chat!", timestamp: new Date().toISOString() },
      ]
      const updatedCommunity = { ...currentCommunity, messages: initialMessages }
      setCurrentCommunity(updatedCommunity)
      setMessages(initialMessages)
    } else {
      setMessages(currentCommunity.messages)
    }
  }

  const handleBackToCommunity = () => {
    setShowChatRoom(false)
    setNavOpen(false) // Close mobile nav when going back
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message = {
      id: Date.now(),
      sender: "You",
      text: newMessage,
      timestamp: new Date().toISOString(),
    }

    const updatedMessages = [...messages, message]
    setMessages(updatedMessages)

    // Create a copy to avoid direct mutation
    const updatedCommunity = { ...currentCommunity, messages: updatedMessages }
    setCurrentCommunity(updatedCommunity)

    // Clear the message input
    setNewMessage("")
  }

  // Chat Room Component
  const ChatRoom = ({ community }) => {
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)
    const { navOpen, toggleNav } = useContext(NavContext)

    // Auto-scroll to bottom of messages
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    // Focus input on component mount
    useEffect(() => {
      inputRef.current?.focus()
    }, [])

    return (
        <div className="min-h-screen flex flex-col" style={backgroundStyle}>
          <GlobalStyle />
          <TopBar />

          <div className="flex flex-col md:flex-row flex-1 pt-20">
            {/* Mobile Nav Overlay */}
            {navOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={toggleNav} />}

            {/* Member List Sidebar */}
            <div
                className={`fixed md:relative z-30 w-3/4 md:w-72 bg-[#F4FDFF] h-[calc(100vh-5rem)] overflow-y-auto shadow-lg md:rounded-r-lg transition-transform duration-300 ease-in-out ${
                    navOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                }`}
            >
              <div className="p-4 md:p-6">
                <div className="flex items-center mb-8">
                  <button
                      className="text-[#1D6EF1] mr-3 text-2xl flex items-center"
                      onClick={handleBackToCommunity}
                      style={fontStyle}
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    <span>Back</span>
                  </button>
                </div>

                <h2 className="text-2xl font-bold text-[#1D1D20] mb-6" style={fontStyle}>
                  Chat Room
                </h2>

                <div className="space-y-2 mt-8">
                  <h3 className="text-xl font-semibold text-[#1D6EF1] mb-4" style={fontStyle}>
                    <Users className="inline mr-2 h-5 w-5" />
                    Members
                  </h3>
                  <div className="space-y-4">
                    {community.members && community.members.length > 0 ? (
                        community.members.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center p-2 hover:bg-[#C5EDFD] rounded-lg transition-colors"
                            >
                              <div className="bg-[#1D6EF1] rounded-full w-10 h-10 flex items-center justify-center text-white mr-3 shadow-md">
                                <span style={fontStyle}>{member.name.charAt(0).toUpperCase()}</span>
                              </div>
                              <div className="flex flex-col">
                          <span className="text-[#1D1D20] font-semibold" style={fontStyle}>
                            {member.name}
                          </span>
                                {member.isAdmin && (
                                    <span
                                        className="text-xs bg-[#97C7F1] px-2 py-1 rounded-full text-[#1D1D20] inline-block w-fit"
                                        style={fontStyle}
                                    >
                              Admin
                            </span>
                                )}
                              </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4">
                          <p className="text-[#1D1D20]" style={fontStyle}>
                            No members yet
                          </p>
                        </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col p-4 md:p-6 transition-all duration-300 ${navOpen ? "md:ml-72" : ""}`}>
              <div className="bg-[#F4FDFF] bg-opacity-95 p-4 md:p-6 rounded-t-xl overflow-y-auto flex-1 shadow-lg">
                <h1 className="text-xl md:text-2xl font-bold text-[#1D1D20] mb-4" style={fontStyle}>
                  <MessageCircle className="inline mr-2 h-5 w-5 md:h-6 md:w-6" />
                  Community Chat
                </h1>

                <div className="space-y-4 mt-6">
                  {messages.length > 0 ? (
                      messages.map((message) => (
                          <div key={message.id} className={`mb-4 ${message.sender === "You" ? "text-right" : ""}`}>
                            <div
                                className={`inline-block p-3 md:p-4 rounded-lg max-w-[80%] shadow-md ${
                                    message.sender === "You"
                                        ? "bg-[#1D6EF1] text-white"
                                        : message.sender === "System"
                                            ? "bg-[#9DDCB1] text-[#1D1D20]"
                                            : "bg-[#F1DEFB] text-[#1D1D20]"
                                }`}
                            >
                              <div className="font-bold mb-1" style={fontStyle}>
                                {message.sender}
                              </div>
                              <div style={fontStyle} className="text-sm md:text-base">
                                {message.text}
                              </div>
                              <div className="text-xs mt-2 opacity-80" style={fontStyle}>
                                {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
                          </div>
                      ))
                  ) : (
                      <div className="text-center py-8 bg-white bg-opacity-50 rounded-lg" style={fontStyle}>
                        <MessageCircle className="mx-auto h-10 w-10 md:h-12 md:w-12 text-[#97C7F1] mb-4" />
                        <p className="text-[#1D1D20] text-base md:text-lg">No messages yet. Start the conversation!</p>
                      </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 pt-3 md:p-6 md:pt-4 bg-[#F4FDFF] bg-opacity-95 rounded-b-xl shadow-lg">
                <div className="flex">
                  <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 p-3 md:p-4 border border-[#97C7F1] rounded-l-lg text-[#1D1D20] focus:outline-none focus:ring-2 focus:ring-[#1D6EF1] text-sm md:text-base"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      style={fontStyle}
                      ref={inputRef}
                  />
                  <button
                      className="bg-[#1D6EF1] hover:bg-[#97C7F1] text-white p-3 md:p-4 rounded-r-lg transition-colors flex items-center"
                      onClick={handleSendMessage}
                  >
                  <span style={fontStyle} className="mr-2 text-sm md:text-base">
                    Send
                  </span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
    )
  }

  // Community Detail Page Component
  const CommunityDetail = ({ community, onUpdate }) => {
    const [members, setMembers] = useState(community.members || [])
    const [flashcards, setFlashcards] = useState(community.flashcards || [])
    const { navOpen, toggleNav } = useContext(NavContext)

    const handleAddStudyMaterial = () => {
      // Add a blank flashcard
      const newFlashcard = {
        id: Date.now(),
        title: "New Flashcard",
        description: "Edit this flashcard",
        likes: 0,
      }

      const updatedFlashcards = [...flashcards, newFlashcard]
      setFlashcards(updatedFlashcards)

      // Update the community object
      const updatedCommunity = { ...community, flashcards: updatedFlashcards }
      onUpdate(updatedCommunity)
    }

    const handleAddMember = () => {
      // Handle adding member logic
      console.log("Adding new member")
    }

    const handleShareFlashcard = (id) => {
      console.log("Sharing flashcard with id:", id)

      // Use the getBaseUrl function to create the correct link
      const flashcardLink = `${getBaseUrl()}/community/${community.id}/flashcard/${id}`

      navigator.clipboard
          .writeText(flashcardLink)
          .then(() => {
            alert("Flashcard link copied to clipboard!")
          })
          .catch((err) => {
            console.error("Could not copy text: ", err)
          })
    }

    const handleDeleteFlashcard = (id) => {
      const updatedFlashcards = flashcards.filter((card) => card.id !== id)
      setFlashcards(updatedFlashcards)

      // Update the community object
      const updatedCommunity = { ...community, flashcards: updatedFlashcards }
      onUpdate(updatedCommunity)
    }

    return (
        <div className="min-h-screen flex flex-col" style={backgroundStyle}>
          <GlobalStyle />
          <TopBar />

          <div className="flex flex-col md:flex-row flex-1 pt-20">
            {/* Mobile Nav Overlay */}
            {navOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={toggleNav} />}

            {/* Left Sidebar */}
            <div
                className={`fixed md:relative z-30 w-3/4 md:w-72 bg-[#F4FDFF] h-[calc(100vh-5rem)] overflow-y-auto shadow-lg md:rounded-r-lg transition-transform duration-300 ease-in-out ${
                    navOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                }`}
            >
              <div className="p-4 md:p-6">
                <div className="flex items-center mb-8">
                  <button
                      className="text-[#1D6EF1] mr-3 text-2xl flex items-center"
                      onClick={handleBackToCommunities}
                      style={fontStyle}
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    <span>Back</span>
                  </button>
                </div>

                <h2 className="text-2xl font-bold text-[#1D1D20] mb-6" style={fontStyle}>
                  {community.name}
                </h2>

                <p className="text-[#1D1D20] mb-6" style={fontStyle}>
                  {community.description}
                </p>

                <div className="space-y-2 mt-8">
                  <h3 className="text-xl font-semibold text-[#1D6EF1] mb-4" style={fontStyle}>
                    <Users className="inline mr-2 h-5 w-5" />
                    Members
                  </h3>
                  <div className="space-y-4">
                    {members.length > 0 ? (
                        members.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center p-2 hover:bg-[#C5EDFD] rounded-lg transition-colors"
                            >
                              <div className="bg-[#1D6EF1] rounded-full w-10 h-10 flex items-center justify-center text-white mr-3 shadow-md">
                                <span style={fontStyle}>{member.name.charAt(0).toUpperCase()}</span>
                              </div>
                              <div className="flex flex-col">
                          <span className="text-[#1D1D20] font-semibold" style={fontStyle}>
                            {member.name}
                          </span>
                                {member.isAdmin && (
                                    <span
                                        className="text-xs bg-[#97C7F1] px-2 py-1 rounded-full text-[#1D1D20] inline-block w-fit"
                                        style={fontStyle}
                                    >
                              Admin
                            </span>
                                )}
                              </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4">
                          <p className="text-[#1D1D20]" style={fontStyle}>
                            No members yet
                          </p>
                        </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className={`flex-1 p-4 md:p-6 transition-all duration-300 ${navOpen ? "md:ml-72" : ""}`}>
              <div className="bg-[#F4FDFF] bg-opacity-95 p-4 md:p-6 rounded-xl shadow-lg mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <h2 className="text-2xl md:text-3xl font-semibold text-[#1D1D20] flex items-center" style={fontStyle}>
                    <BookOpen className="mr-3 h-6 w-6 md:h-8 md:w-8" />
                    Study Materials
                  </h2>
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
                    <button
                        className="bg-[#1D6EF1] hover:bg-[#97C7F1] text-white py-2 px-3 md:py-2 md:px-4 rounded-lg flex items-center justify-center transition-colors shadow-md"
                        onClick={handleAddStudyMaterial}
                    >
                      <Plus className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                      <span style={fontStyle} className="text-sm md:text-base">
                      Add Study Material
                    </span>
                    </button>
                    <button
                        className="bg-[#5B8C5A] hover:bg-[#9DDCB1] text-white py-2 px-3 md:py-2 md:px-4 rounded-lg flex items-center justify-center transition-colors shadow-md"
                        onClick={handleOpenChatRoom}
                    >
                      <MessageCircle className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                      <span style={fontStyle} className="text-sm md:text-base">
                      Message Members
                    </span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  {flashcards.length > 0 ? (
                      flashcards.map((flashcard) => (
                          <div
                              key={flashcard.id}
                              className="bg-white rounded-xl p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow"
                          >
                            <div className="flex items-start">
                              <div className="bg-[#EF7B6C] rounded-xl w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-white mr-4 md:mr-5 shadow-md">
                                <FileText className="h-6 w-6 md:h-8 md:w-8" />
                              </div>
                              <div className="flex-1">
                                <h2 className="text-xl md:text-2xl font-bold text-[#1D6EF1] mb-2" style={fontStyle}>
                                  {flashcard.title}
                                </h2>
                                <p className="text-sm md:text-base text-[#1D1D20] mb-4" style={fontStyle}>
                                  {flashcard.description}
                                </p>
                                <div className="flex justify-between items-center">
                                  <button
                                      className="flex items-center bg-[#C5EDFD] text-[#1D1D20] px-2 py-1 md:px-3 md:py-2 rounded-xl hover:bg-[#97C7F1] transition-colors"
                                      onClick={() => handleLikeCommunity(flashcard.id)}
                                  >
                                    <Heart className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2 text-[#EF7B6C]" />
                                    <span style={fontStyle} className="text-sm md:text-base">
                                {flashcard.likes}
                              </span>
                                  </button>
                                  <div className="flex items-center space-x-2">
                                    <button
                                        className="text-[#1D6EF1] bg-[#C5EDFD] p-1 md:p-2 rounded-lg hover:bg-[#97C7F1] transition-colors"
                                        onClick={() => handleShareFlashcard(flashcard.id)}
                                        title="Share"
                                    >
                                      <Share2 className="h-4 w-4 md:h-5 md:w-5" />
                                    </button>
                                    <button
                                        className="text-white bg-[#DC2626] p-1 md:p-2 rounded-lg hover:bg-opacity-80 transition-colors"
                                        onClick={() => handleDeleteFlashcard(flashcard.id)}
                                        title="Delete"
                                    >
                                      <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="md:w-5 md:h-5"
                                      >
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                      ))
                  ) : (
                      <div className="bg-white bg-opacity-90 rounded-xl p-6 md:p-8 text-center col-span-full">
                        <FileText className="h-12 w-12 md:h-16 md:w-16 mx-auto text-[#97C7F1] mb-4" />
                        <p className="text-base md:text-xl" style={fontStyle}>
                          No study materials yet. Click "Add Study Material" to create one.
                        </p>
                      </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
    )
  }

  // Main Communities list view
  return (
      <NavContext.Provider value={navContextValue}>
        <GlobalStyle />
        <TopBar />

        {isPreviewMode && (
            <div
                className="fixed top-20 left-0 right-0 bg-yellow-400 text-black py-2 px-4 text-center z-50"
                style={fontStyle}
            >
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                  />
                </svg>
                <span>Preview Mode Active - You're viewing draft content</span>
              </div>
            </div>
        )}

        {showChatRoom && currentCommunity ? (
            <ChatRoom community={currentCommunity} />
        ) : showCommunityDetail && currentCommunity ? (
            <CommunityDetail community={currentCommunity} onUpdate={handleUpdateCommunity} />
        ) : (
            <div className="min-h-screen pt-20" style={backgroundStyle}>
              {/* Mobile Nav Overlay */}
              {navOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={toggleNav} />}

              {/* Main Content */}
              <div className="max-w-7xl mx-auto p-4 md:p-6">
                <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
                  {/* Left Column */}
                  <div className="lg:w-3/4">
                    <div className="bg-[#F4FDFF]/90 rounded-xl p-4 md:p-8 shadow-lg mb-6 md:mb-8">
                      <h1 className="text-3xl md:text-4xl font-extrabold text-[#1D1D20] mb-3 md:mb-4" style={fontStyle}>
                        My Communities
                      </h1>
                      <p className="text-[#1D1D20] text-base md:text-lg mb-4 md:mb-6" style={fontStyle}>
                        Join existing communities or create your own to share study materials and collaborate with others.
                      </p>

                      <div className="relative mb-6 md:mb-8">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                          <Search className="w-5 h-5 text-gray-500" />
                        </div>

                        <input
                            type="text"
                            placeholder="Search communities by name..."
                            className="w-full p-3 md:p-4 pl-12 md:pl-16 rounded-lg border-2 border-[#97C7F1] text-[#1D1D20] focus:outline-none focus:ring-2 focus:ring-[#1D6EF1] focus:border-transparent text-sm md:text-base"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={fontStyle}
                        />
                      </div>

                      {loading ? (
                          <div className="bg-white rounded-xl p-6 md:p-8 text-center">
                            <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-[#1D6EF1] mx-auto mb-4"></div>
                            <p className="text-[#1D1D20] text-lg md:text-xl" style={fontStyle}>
                              Loading communities...
                            </p>
                          </div>
                      ) : error ? (
                          <div className="bg-white rounded-xl p-6 md:p-8 text-center">
                            <div className="bg-[#DC2626] text-white p-3 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mx-auto mb-4">
                              <span>!</span>
                            </div>
                            <p className="text-[#1D1D20] text-lg md:text-xl" style={fontStyle}>
                              {error}
                            </p>
                          </div>
                      ) : (
                          <>
                            <h2 className="text-xl md:text-2xl font-bold text-[#1D1D20] mb-4" style={fontStyle}>
                              Available Communities
                            </h2>

                            {filteredCommunities.length > 0 ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                                  {filteredCommunities.map((community) => (
                                      <div
                                          key={community.id}
                                          className="bg-white rounded-xl p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow"
                                      >
                                        <div className="flex items-start">
                                          <div className="bg-[#EF7B6C] rounded-xl w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-white mr-3 md:mr-5 shadow-md">
                                  <span style={{ ...fontStyle, fontSize: "24px" }} className="md:text-3xl">
                                    {community.name.charAt(0).toUpperCase()}
                                  </span>
                                          </div>
                                          <div className="flex-1">
                                            <h2
                                                className="text-xl md:text-2xl font-bold text-[#1D6EF1] mb-1 md:mb-2 cursor-pointer hover:underline"
                                                onClick={() => navigate(`/community/view/${community.id}`)}
                                                style={fontStyle}
                                            >
                                              {community.name}
                                            </h2>
                                            <p className="text-sm md:text-base text-[#1D1D20] mb-3 md:mb-4" style={fontStyle}>
                                              {community.description}
                                            </p>
                                            <div className="grid grid-cols-3 gap-2 mt-3">
                                              <button
                                                  className="flex items-center justify-center bg-[#C5EDFD] text-[#1D1D20] px-2 py-1 md:px-3 md:py-2 rounded-xl hover:bg-[#97C7F1] transition-colors w-full"
                                                  onClick={() => handleLikeCommunity(community.id)}
                                              >
                                                <Heart className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2 text-[#EF7B6C]" />
                                                <span style={fontStyle} className="text-sm md:text-base">
                                        {community.likes || 0}
                                      </span>
                                              </button>
                                              <button
                                                  className="bg-[#1D6EF1] text-white px-3 py-1 md:px-4 md:py-2 rounded-xl hover:bg-[#97C7F1] transition-colors text-sm md:text-base w-full"
                                                  onClick={() => handleJoinCommunity(community.id)}
                                                  data-community-id={community.id}
                                                  style={fontStyle}
                                              >
                                                Join
                                              </button>
                                              <button
                                                  className="bg-[#48BB78] hover:bg-[#48BB78]/90 text-white py-1 px-3 rounded-xl flex items-center justify-center w-full"
                                                  onClick={() => handleShareCommunity(community.id)}
                                              >
                                                {copiedCommunityId === community.id ? (
                                                    <span className="text-[14px]">Copied!</span>
                                                ) : (
                                                    <>
                                                      <Share2 size={20} className="mr-1" />
                                                      {/*<span className="text-[14px]">Share</span>*/}
                                                    </>
                                                )}
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                  ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl p-6 md:p-8 text-center">
                                  {communities.length === 0 ? (
                                      <>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-12 w-12 md:h-16 md:w-16 mx-auto text-[#97C7F1] mb-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                          <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                          />
                                        </svg>
                                        <p className="text-[#1D1D20] text-lg md:text-xl" style={fontStyle}>
                                          No communities yet. Create your own or search for others.
                                        </p>
                                      </>
                                  ) : (
                                      <>
                                        <Search className="h-12 w-12 md:h-16 md:w-16 mx-auto text-[#97C7F1] mb-4" />
                                        <p className="text-[#1D1D20] text-lg md:text-xl" style={fontStyle}>
                                          No communities match your search.
                                        </p>
                                      </>
                                  )}
                                </div>
                            )}
                          </>
                      )}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="lg:w-1/4">
                    <div
                        className={`${navOpen ? "fixed right-0 top-20 bottom-0 z-30 w-3/4" : ""} md:static md:z-auto bg-[#F4FDFF] p-4 md:p-6 rounded-xl shadow-lg md:sticky md:top-24 transition-all duration-300`}
                    >
                      <button
                          className="w-full bg-[#48BB78] hover:bg-[#9DDCB1] text-white py-2 md:py-3 px-3 md:px-4 rounded-lg flex items-center justify-center mb-4 md:mb-6 transition-colors shadow-md"
                          onClick={() => setShowModal(true)}
                      >
                        <Plus className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                        <span style={fontStyle} className="text-sm md:text-base font-semibold">
                      Create Your Own
                    </span>
                      </button>

                      <h2 className="text-[#1D1D20] text-lg md:text-xl font-semibold mb-3 md:mb-4" style={fontStyle}>
                        My Communities
                      </h2>

                      <div className="space-y-2 md:space-y-3">
                        {myCommunities.length > 0 ? (
                            myCommunities.map((community) => (
                                <div
                                    key={community.id}
                                    className="bg-[#C5EDFD] p-2 md:p-3 rounded-lg cursor-pointer hover:bg-[#97C7F1] transition-colors flex items-center"
                                    onClick={() => navigate(`/community/view/${community.id}`)}
                                >
                                  <div className="bg-[#1D6EF1] rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-white mr-2 md:mr-3">
                                    <span style={fontStyle}>{community.name.charAt(0).toUpperCase()}</span>
                                  </div>
                                  <span
                                      className="text-[#1D1D20] font-medium overflow-hidden text-ellipsis whitespace-nowrap text-sm md:text-base"
                                      style={fontStyle}
                                  >
                            {community.name}
                          </span>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white p-3 md:p-4 rounded-lg text-center">
                              <p className="text-[#1D1D20] text-sm md:text-base" style={fontStyle}>
                                No communities yet
                              </p>
                            </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* Create Community Modal */}
        {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div ref={modalRef} className="bg-[#F4FDFF] p-5 md:p-8 rounded-xl shadow-2xl w-full max-w-md">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-[#1D1D20] text-center" style={fontStyle}>
                  Create Community
                </h2>

                <div className="space-y-4 md:space-y-6">
                  <div>
                    <label className="block text-[#1D1D20] mb-1 md:mb-2 text-base md:text-lg" style={fontStyle}>
                      Community Name
                    </label>
                    <input
                        type="text"
                        placeholder="Enter a name for your community"
                        className="w-full p-2 md:p-3 border-2 border-[#97C7F1] rounded-lg text-[#1D1D20] focus:outline-none focus:ring-2 focus:ring-[#1D6EF1] focus:border-transparent text-sm md:text-base"
                        value={communityName}
                        onChange={(e) => setCommunityName(e.target.value)}
                        style={fontStyle}
                    />
                  </div>

                  <div>
                    <label className="block text-[#1D1D20] mb-1 md:mb-2 text-base md:text-lg" style={fontStyle}>
                      Description
                    </label>
                    <textarea
                        placeholder="Describe your community"
                        className="w-full p-2 md:p-3 border-2 border-[#97C7F1] rounded-lg text-[#1D1D20] focus:outline-none focus:ring-2 focus:ring-[#1D6EF1] focus:border-transparent min-h-[80px] md:min-h-[100px] text-sm md:text-base"
                        value={communityDescription}
                        onChange={(e) => setCommunityDescription(e.target.value)}
                        style={fontStyle}
                    />
                  </div>

                  <div className="flex gap-3 md:gap-4 pt-2 md:pt-4">
                    <button
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-[#1D1D20] py-2 md:py-3 px-3 md:px-4 rounded-lg transition-colors text-sm md:text-base"
                        onClick={() => setShowModal(false)}
                    >
                      <span style={fontStyle}>Cancel</span>
                    </button>
                    <button
                        className="flex-1 bg-[#48BB78] hover:bg-[#9DDCB1] text-white py-2 md:py-3 px-3 md:px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                        onClick={handleSubmit}
                        disabled={!communityName.trim()}
                    >
                      <span style={fontStyle}>Create</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}
      </NavContext.Provider>
  )
}

export default Communities


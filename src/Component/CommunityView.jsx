"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { BookOpen, MessageCircle, ChevronLeft, Users, FileText, Heart, Share2, X } from "lucide-react"

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
      `,
        }}
    />
)

const TopBar = () => {
  const [navOpen, setNavOpen] = useState(false)

  const toggleNav = () => {
    setNavOpen(!navOpen)
  }

  return (
      <header className="fixed top-0 left-0 right-0 bg-[#1D6EF1] h-20 flex items-center px-4 md:px-6 z-10 shadow-md">
        <div className="flex items-center flex-grow">
          <button className="mr-2 text-white md:hidden" onClick={toggleNav} aria-label="Toggle navigation">
            {navOpen ? (
                <X className="h-6 w-6" />
            ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            )}
          </button>
          <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center p-2 shadow-lg">
            <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame-V163AsalyIRqbHW6Fe7OWFHHuwoL99.png"
                alt="Bubble Brain Logo"
                className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-white text-2xl md:text-4xl ml-2 md:ml-4 font-extrabold" style={fontStyle}>
            Bubble Brain
          </h1>
        </div>
        <nav className="hidden md:flex space-x-2 lg:space-x-6">
          {["Home", "Courses", "Quizzes", "Contact"].map((item) => (
              <Link
                  key={item}
                  to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                  className="text-white px-2 py-2 text-sm lg:px-4 lg:text-base hover:bg-white/10 rounded-lg transition-colors"
                  style={fontStyle}
              >
                {item}
              </Link>
          ))}
        </nav>
      </header>
  )
}

const CommunityView = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [community, setCommunity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [studyMaterials, setStudyMaterials] = useState([])
  const [members, setMembers] = useState([])
  const [showChatRoom, setShowChatRoom] = useState(false)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [navOpen, setNavOpen] = useState(false)

  const backgroundStyle = {
    backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image3-M7gmQibPxwx9MBXzWTzonaopMrRC3Q.png')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
  }

  useEffect(() => {
    fetchCommunityDetails()
  }, [id])

  const fetchCommunityDetails = async () => {
    setLoading(true)
    setError(null)
    const token = sessionStorage.getItem("token")

    if (!token) {
      setError("You must be logged in to view this community")
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_PATH}/groups/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch community details")

      const data = await response.json()

      // Initialize with default values if not present
      const communityData = {
        ...data,
        members: data.members || [{ id: 1, name: "You", isAdmin: true }],
        studyMaterials: data.studyMaterials || [],
        messages: data.messages || [],
      }

      setCommunity(communityData)
      setStudyMaterials(communityData.studyMaterials)
      setMembers(communityData.members)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching community details:", err)
      setError(err.message)
      setLoading(false)
    }
  }

  const handleAddStudyMaterial = () => {
    // Add a blank flashcard
    const newFlashcard = {
      id: Date.now(),
      title: "New Flashcard",
      description: "Edit this flashcard",
      likes: 0,
    }

    const updatedMaterials = [...studyMaterials, newFlashcard]
    setStudyMaterials(updatedMaterials)

    // Update the community object
    const updatedCommunity = { ...community, studyMaterials: updatedMaterials }
    setCommunity(updatedCommunity)

    // In a real app, you would save this to the API
    saveStudyMaterial(newFlashcard)
  }

  const saveStudyMaterial = async (material) => {
    const token = sessionStorage.getItem("token")
    if (!token) return

    try {
      // This is a placeholder - adjust to your actual API
      const response = await fetch(`${process.env.REACT_APP_API_PATH}/groups/${id}/materials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(material),
      })

      if (!response.ok) throw new Error("Failed to save study material")

      // Refresh data after saving
      fetchCommunityDetails()
    } catch (err) {
      console.error("Error saving study material:", err)
    }
  }

  const handleMessageMembers = () => {
    setShowChatRoom(true)
    // Initialize with some sample messages if empty
    if (!community.messages || community.messages.length === 0) {
      const initialMessages = [
        { id: 1, sender: "You", text: "Hello everyone!", timestamp: new Date().toISOString() },
        { id: 2, sender: "System", text: "Welcome to the community chat!", timestamp: new Date().toISOString() },
      ]
      setMessages(initialMessages)
    } else {
      setMessages(community.messages)
    }
  }

  const handleBackToCommunity = () => {
    setShowChatRoom(false)
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

    // Update the community object
    const updatedCommunity = { ...community, messages: updatedMessages }
    setCommunity(updatedCommunity)

    // Clear the message input
    setNewMessage("")

    // In a real app, you would save this to the API
    saveMessage(message)
  }

  const saveMessage = async (message) => {
    const token = sessionStorage.getItem("token")
    if (!token) return

    try {
      // This is a placeholder - adjust to your actual API
      const response = await fetch(`${process.env.REACT_APP_API_PATH}/groups/${id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(message),
      })

      if (!response.ok) throw new Error("Failed to send message")
    } catch (err) {
      console.error("Error sending message:", err)
    }
  }

  const handleShareFlashcard = (materialId) => {
    // Simulate copying a link to clipboard
    const flashcardLink = `${window.location.origin}/community/${id}/material/${materialId}`
    console.log("Link copied to clipboard:", flashcardLink)

    // In a real implementation, you would use the Clipboard API
    navigator.clipboard
        .writeText(flashcardLink)
        .then(() => {
          alert("Flashcard link copied to clipboard!")
        })
        .catch((err) => {
          console.error("Could not copy text: ", err)
        })
  }

  const handleDeleteFlashcard = (materialId) => {
    const updatedMaterials = studyMaterials.filter((material) => material.id !== materialId)
    setStudyMaterials(updatedMaterials)

    // Update the community object
    const updatedCommunity = { ...community, studyMaterials: updatedMaterials }
    setCommunity(updatedCommunity)

    // In a real app, you would delete this from the API
    deleteStudyMaterial(materialId)
  }

  const deleteStudyMaterial = async (materialId) => {
    const token = sessionStorage.getItem("token")
    if (!token) return

    try {
      // This is a placeholder - adjust to your actual API
      const response = await fetch(`${process.env.REACT_APP_API_PATH}/groups/${id}/materials/${materialId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to delete study material")
    } catch (err) {
      console.error("Error deleting study material:", err)
    }
  }

  const handleLikeMaterial = (materialId) => {
    const updatedMaterials = studyMaterials.map((material) => {
      if (material.id === materialId) {
        return { ...material, likes: (material.likes || 0) + 1 }
      }
      return material
    })

    setStudyMaterials(updatedMaterials)

    // Update the community object
    const updatedCommunity = { ...community, studyMaterials: updatedMaterials }
    setCommunity(updatedCommunity)

    // In a real app, you would save this to the API
    likeMaterial(materialId)
  }

  const likeMaterial = async (materialId) => {
    const token = sessionStorage.getItem("token")
    if (!token) return

    try {
      // This is a placeholder - adjust to your actual API
      const response = await fetch(`${process.env.REACT_APP_API_PATH}/groups/${id}/materials/${materialId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to like study material")
    } catch (err) {
      console.error("Error liking study material:", err)
    }
  }

  const toggleNav = () => {
    setNavOpen(!navOpen)
  }

  // Chat Room Component
  const ChatRoom = () => {
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)
    const [navOpen, setNavOpen] = useState(false)

    // Auto-scroll to bottom of messages
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    // Focus input on component mount
    useEffect(() => {
      inputRef.current?.focus()
    }, [])

    const toggleNav = () => {
      setNavOpen(!navOpen)
    }

    return (
        <div className="min-h-screen flex flex-col" style={backgroundStyle}>
          <GlobalStyle />
          <TopBar />

          <div className="flex flex-col md:flex-row flex-1 pt-20">
            {/* Member List Sidebar */}
            <div
                className={`${navOpen ? "block" : "hidden"} md:block w-full md:w-72 bg-[#F4FDFF] p-4 md:p-6 h-auto md:h-[calc(100vh-5rem)] overflow-y-auto shadow-lg md:rounded-r-lg mb-4 md:mb-0`}
            >
              <div className="flex items-center mb-8">
                <button
                    className="text-[#1D6EF1] mr-3 text-2xl flex items-center"
                    onClick={handleBackToCommunity}
                    style={fontStyle}
                >
                  <ChevronLeft className="mr-2 h-5 w-5" />
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
                  {members && members.length > 0 ? (
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

            {/* Chat Area */}
            <div className="flex-1 flex flex-col p-4 md:p-6">
              <div className="bg-[#F4FDFF] bg-opacity-95 p-6 rounded-t-xl overflow-y-auto flex-1 shadow-lg">
                <h1 className="text-2xl font-bold text-[#1D1D20] mb-4" style={fontStyle}>
                  <MessageCircle className="inline mr-2 h-6 w-6" />
                  Community Chat
                </h1>

                <div className="space-y-4 mt-6">
                  {messages.length > 0 ? (
                      messages.map((message) => (
                          <div key={message.id} className={`mb-4 ${message.sender === "You" ? "text-right" : ""}`}>
                            <div
                                className={`inline-block p-4 rounded-lg max-w-[80%] shadow-md ${
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
                              <div style={fontStyle} className="text-base">
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
                        <MessageCircle className="mx-auto h-12 w-12 text-[#97C7F1] mb-4" />
                        <p className="text-[#1D1D20] text-lg">No messages yet. Start the conversation!</p>
                      </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="p-6 pt-4 bg-[#F4FDFF] bg-opacity-95 rounded-b-xl shadow-lg">
                <div className="flex">
                  <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 p-4 border border-[#97C7F1] rounded-l-lg text-[#1D1D20] focus:outline-none focus:ring-2 focus:ring-[#1D6EF1]"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      style={fontStyle}
                      ref={inputRef}
                  />
                  <button
                      className="bg-[#1D6EF1] hover:bg-[#97C7F1] text-white p-4 rounded-r-lg transition-colors flex items-center"
                      onClick={handleSendMessage}
                  >
                  <span style={fontStyle} className="mr-2">
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

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center" style={backgroundStyle}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1D6EF1]"></div>
        </div>
    )
  }

  if (error) {
    return (
        <div className="min-h-screen flex items-center justify-center" style={backgroundStyle}>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
    )
  }

  if (showChatRoom) {
    return <ChatRoom />
  }

  return (
      <div className="min-h-screen" style={backgroundStyle}>
        <GlobalStyle />
        <TopBar />

        <div className="flex flex-col md:flex-row pt-20">
          {/* Left Sidebar */}
          <div
              className={`${navOpen ? "block" : "hidden"} md:block w-full md:w-72 bg-[#F4FDFF] min-h-[calc(100vh-5rem)] p-4 md:p-6 shadow-lg`}
          >
            <div className="space-y-6">
              <Link to="/community" className="flex items-center text-[#1D6EF1] hover:text-[#97C7F1] transition-colors">
                <ChevronLeft className="h-5 w-5 mr-2" />
                <span className="text-lg" style={fontStyle}>
                Back
              </span>
              </Link>

              <div className="pt-4">
                <h2 className="text-2xl font-bold text-[#1D1D20] mb-4 flex items-center" style={fontStyle}>
                  <Users className="h-6 w-6 mr-2" />
                  Members
                </h2>

                <div className="space-y-3">
                  {members && members.length > 0 ? (
                      members.map((member) => (
                          <div key={member.id} className="flex items-center p-3 bg-[#C5EDFD] rounded-lg">
                            <div className="w-10 h-10 bg-[#1D6EF1] rounded-full flex items-center justify-center text-white">
                              <span style={fontStyle}>{member.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="ml-3">
                              <p className="font-semibold" style={fontStyle}>
                                {member.name}
                              </p>
                              {member.isAdmin && (
                                  <span className="text-xs bg-[#97C7F1] px-2 py-1 rounded-full" style={fontStyle}>
                            Admin
                          </span>
                              )}
                            </div>
                          </div>
                      ))
                  ) : (
                      <div className="flex items-center p-3 bg-[#C5EDFD] rounded-lg">
                        <div className="w-10 h-10 bg-[#1D6EF1] rounded-full flex items-center justify-center text-white">
                          <span style={fontStyle}>Y</span>
                        </div>
                        <div className="ml-3">
                          <p className="font-semibold" style={fontStyle}>
                            You
                          </p>
                          <span className="text-xs bg-[#97C7F1] px-2 py-1 rounded-full" style={fontStyle}>
                        Admin
                      </span>
                        </div>
                      </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-4 md:p-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold flex items-center" style={fontStyle}>
                  <BookOpen className="h-6 w-6 mr-2" />
                  Study Materials
                </h1>

                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
                  <button
                      onClick={handleAddStudyMaterial}
                      className="flex items-center px-3 py-2 md:px-5 md:py-3 bg-[#1D6EF1] text-white rounded-lg hover:bg-[#4285F4] transition-colors shadow-md"
                  >
                  <span className="text-xl md:text-2xl font-bold mr-1" style={fontStyle}>
                    +
                  </span>
                    <span className="text-sm md:text-lg font-medium" style={fontStyle}>
                    Add Study Material
                  </span>
                  </button>

                  <button
                      onClick={handleMessageMembers}
                      className="flex items-center px-3 py-2 md:px-5 md:py-3 bg-[#5B8C5A] text-white rounded-lg hover:bg-[#6DA368] transition-colors shadow-md"
                  >
                    <MessageCircle className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    <span className="text-sm md:text-lg font-medium" style={fontStyle}>
                    Message Members
                  </span>
                  </button>
                </div>
              </div>

              {studyMaterials.length === 0 ? (
                  <div className="text-center py-16">
                    <FileText className="h-16 w-16 mx-auto text-[#97C7F1] mb-4" />
                    <p className="text-[#1D1D20] text-lg" style={fontStyle}>
                      No study materials yet. Click "Add Study Material" to create one.
                    </p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {studyMaterials.map((material) => (
                        <div
                            key={material.id}
                            className="bg-[#F4FDFF] p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start">
                            <div className="bg-[#EF7B6C] rounded-xl w-16 h-16 flex items-center justify-center text-white mr-5 shadow-md">
                              <FileText className="h-8 w-8" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold mb-2 text-[#1D6EF1]" style={fontStyle}>
                                {material.title}
                              </h3>
                              <p className="text-gray-600 mb-4" style={fontStyle}>
                                {material.description}
                              </p>
                              <div className="flex justify-between items-center">
                                <button
                                    className="flex items-center text-[#1D1D20] bg-[#C5EDFD] px-3 py-2 rounded-lg hover:bg-[#97C7F1] transition-colors"
                                    onClick={() => handleLikeMaterial(material.id)}
                                >
                                  <Heart className="h-5 w-5 mr-2 text-[#EF7B6C]" />
                                  <span style={fontStyle}>{material.likes || 0}</span>
                                </button>
                                <div className="flex items-center space-x-2">
                                  <button
                                      className="text-[#1D6EF1] bg-[#C5EDFD] p-2 rounded-lg hover:bg-[#97C7F1] transition-colors"
                                      onClick={() => handleShareFlashcard(material.id)}
                                      title="Share"
                                  >
                                    <Share2 className="h-5 w-5" />
                                  </button>
                                  <button
                                      className="text-white bg-[#DC2626] p-2 rounded-lg hover:bg-opacity-80 transition-colors"
                                      onClick={() => handleDeleteFlashcard(material.id)}
                                      title="Delete"
                                  >
                                    <X className="h-5 w-5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  )
}

export default CommunityView


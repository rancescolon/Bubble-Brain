"use client"

import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import NavBar from "./Navbar"

// Custom font import
const fontStyle = {
  fontFamily: '"Sour Gummy", sans-serif',
}

// Adding global style for font
const GlobalStyle = () => (
  <style jsx global>{`
    @font-face {
      font-family: 'Sour Gummy';
      src: url('/src/assets/fonts/SourGummy-VariableFont_wdth,wght.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    
    body, button, input, h1, h2, h3, p, span {
      font-family: 'Sour Gummy', sans-serif;
    }
  `}</style>
)

// TopBar Component
const TopBar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-[#1D6EF1] h-20 flex items-center px-4 z-10">
      <div className="flex items-center flex-grow">
        <div className="w-20 h-20 flex items-center justify-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center p-2">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame-V163AsalyIRqbHW6Fe7OWFHHuwoL99.png"
              alt="Bubble Brain Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        <h1 className="text-white text-4xl ml-2" style={fontStyle}>
          Bubble Brain
        </h1>
      </div>
      <div className="hidden md:flex">
        {["Home", "Courses", "Quizzes", "Contact"].map((item) => (
          <Link
            key={item}
            to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
            className="text-white mx-2 px-3 py-2 hover:bg-white/10 rounded transition-colors"
            style={fontStyle}
          >
            {item}
          </Link>
        ))}
      </div>
    </header>
  )
}

const Communities = () => {
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
  const modalRef = useRef(null)
  const navigate = useNavigate()

  // Communities state
  const [communities, setCommunities] = useState([])

  const backgroundStyle = {
    backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image3-M7gmQibPxwx9MBXzWTzonaopMrRC3Q.png')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
    minWidth: "1024px", // Ensure desktop minimum width
  }

  // Fetch communities on component mount
  useEffect(() => {
    fetchCommunities()
  }, [])

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
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((result) => {
        if (result && result[0]) {
          // Transform API data to match our component's expected format
          const communitiesData = result[0].map((group) => ({
            id: group.id,
            name: group.name || "Community",
            description: group.description || "No description available",
            likes: 0, // Groups don't have likes by default
            members: [{ id: group.ownerID, name: "Owner", isAdmin: true }],
            flashcards: [],
            messages: [],
            authorId: group.ownerID,
          }))
          setCommunities(communitiesData)

          // Set my communities (communities created by the current user)
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
    if (!token) return

    // Optimistically update UI
    setCommunities(
      communities.map((community) =>
        community.id === communityId ? { ...community, likes: community.likes + 1 } : community,
      ),
    )

    // Send reaction to API
    fetch(`${process.env.REACT_APP_API_PATH}/reactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        postID: communityId,
        type: "like",
      }),
    }).catch((error) => {
      console.error("Error liking community:", error)
      // Revert optimistic update on error
      setCommunities(
        communities.map((community) =>
          community.id === communityId ? { ...community, likes: community.likes - 1 } : community,
        ),
      )
    })
  }

  const handleJoinCommunity = (communityId) => {
    const community = communities.find((c) => c.id === communityId)

    // Check if already in my communities
    if (!myCommunities.some((c) => c.id === communityId)) {
      setMyCommunities([...myCommunities, community])
    }
  }

  const handleShareCommunity = (communityId) => {
    // Simulate copying a link to clipboard
    const communityLink = `${window.location.origin}/community/${communityId}`
    console.log("Link copied to clipboard:", communityLink)

    // In a real app, you would use the Clipboard API:
    // navigator.clipboard.writeText(communityLink)
  }

  const handleViewCommunity = (communityId) => {
    navigate(`/community/view/${communityId}`)
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
  }

  const handleOpenChatRoom = () => {
    setShowChatRoom(true)
    // Initialize with some sample messages
    if (!currentCommunity.messages || currentCommunity.messages.length === 0) {
      const initialMessages = [
        { id: 1, sender: "You", text: "Hello everyone!", timestamp: new Date().toISOString() },
        { id: 2, sender: "System", text: "Welcome to the community chat!", timestamp: new Date().toISOString() },
      ]
      currentCommunity.messages = initialMessages
      setMessages(initialMessages)
    } else {
      setMessages(currentCommunity.messages)
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

    // Create a copy to avoid direct mutation
    const updatedCommunity = { ...currentCommunity, messages: updatedMessages }
    setCurrentCommunity(updatedCommunity)

    // Clear the message after state updates
    setTimeout(() => {
      setNewMessage("")
    }, 0)
  }

  // Chat Room Component
  const ChatRoom = ({ community }) => {
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)

    // Auto-scroll to bottom of messages
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [])

    // Focus input on component mount
    useEffect(() => {
      inputRef.current?.focus()
    }, [])

    return (
      <div className="min-h-screen flex" style={backgroundStyle}>
        <GlobalStyle />
        <TopBar />
        <NavBar />
        {/* Member List Sidebar */}
        <div className="w-64 bg-white p-6 fixed left-[80px] md:left-[272px] top-20 bottom-0 overflow-y-auto">
          <div className="flex items-center mb-8">
            <button className="text-blue-500 mr-3 text-2xl" onClick={handleBackToCommunity} style={fontStyle}>
              ←
            </button>
            <h1 className="text-2xl font-bold text-blue-500" style={fontStyle}>
              Chat Room
            </h1>
          </div>

          <h2 className="text-xl font-bold mb-4" style={fontStyle}>
            Members
          </h2>
          <div className="space-y-4">
            {community.members.map((member) => (
              <div key={member.id} className="flex items-center">
                <div className="bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center text-white mr-2">
                  <span style={fontStyle}>{member.name.charAt(0)}</span>
                </div>
                <span className="text-black" style={fontStyle}>
                  {member.name}
                </span>
                {member.isAdmin && (
                  <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded text-black" style={fontStyle}>
                    Admin
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col ml-64 pl-[80px] md:pl-[272px] pt-24">
          {/* Messages Container */}
          <div className="flex-1 bg-white bg-opacity-90 p-6 m-6 mb-0 rounded-t overflow-y-auto max-h-[calc(100vh-180px)]">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div key={message.id} className={`mb-4 ${message.sender === "You" ? "text-right" : ""}`}>
                  <div
                    className={`inline-block p-3 rounded-lg ${
                      message.sender === "You"
                        ? "bg-blue-500 text-white"
                        : message.sender === "System"
                          ? "bg-gray-300 text-gray-800"
                          : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <div className="font-bold mb-1" style={fontStyle}>
                      {message.sender}
                    </div>
                    <div style={fontStyle}>{message.text}</div>
                    <div className="text-xs mt-1 opacity-70" style={fontStyle}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500" style={fontStyle}>
                No messages yet. Start the conversation!
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-6 pt-3 m-6 mt-0 bg-white bg-opacity-90 rounded-b">
            <div className="flex">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 p-3 border border-gray-300 rounded-l text-black"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                style={fontStyle}
                ref={inputRef}
              />
              <button className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-r" onClick={handleSendMessage}>
                <span style={fontStyle}>Send</span>
              </button>
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

    const handleAddStudyMaterial = () => {
      // Add a blank flashcard
      const newFlashcard = {
        id: Date.now(),
        title: "New Flashcard",
        description: "Edit this flashcard",
        likes: 0,
      }

      setFlashcards([...flashcards, newFlashcard])

      // Update the community object
      community.flashcards = [...flashcards, newFlashcard]
      onUpdate({ ...community, flashcards: [...flashcards, newFlashcard] })
    }

    const handleAddMember = () => {
      // Handle adding member logic
      console.log("Adding new member")
    }

    const handleShareFlashcard = (id) => {
      console.log("Sharing flashcard with id:", id)
    }

    const handleDeleteFlashcard = (id) => {
      const updatedFlashcards = flashcards.filter((card) => card.id !== id)
      setFlashcards(updatedFlashcards)

      // Update the community object
      community.flashcards = updatedFlashcards
      onUpdate({ ...community, flashcards: updatedFlashcards })
    }

    return (
      <div className="min-h-screen flex" style={backgroundStyle}>
        <GlobalStyle />
        <TopBar />
        <NavBar />
        <div className="flex-1 p-6 pl-[80px] md:pl-[272px] pt-24">
          <div className="flex items-center mb-8">
            <button className="text-white mr-3 text-2xl" onClick={handleBackToCommunities} style={fontStyle}>
              ←
            </button>
            <h1 className="text-4xl font-bold text-white" style={fontStyle}>
              {community.name}
            </h1>
          </div>

          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white" style={fontStyle}>
                Flashcards
              </h2>
            </div>

            {flashcards.length > 0 ? (
              flashcards.map((flashcard) => (
                <div key={flashcard.id} className="bg-white rounded p-4 mb-4">
                  <div className="flex items-start">
                    <div className="bg-red-500 rounded-full w-12 h-12 flex items-center justify-center text-white mr-4">
                      <span style={fontStyle}>{flashcard.title.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-blue-500" style={fontStyle}>
                        {flashcard.title}
                      </h2>
                      <p className="text-sm text-gray-600" style={fontStyle}>
                        {flashcard.description}
                      </p>
                      <div className="flex justify-between mt-2">
                        <div className="flex items-center">
                          <button className="flex items-center text-gray-500 mr-4">
                            <span className="mr-1">❤️</span>
                            <span style={fontStyle}>{flashcard.likes}</span>
                          </button>
                        </div>
                        <div className="flex items-center">
                          <button className="text-blue-500 mr-2" onClick={() => handleShareFlashcard(flashcard.id)}>
                            <span style={fontStyle}>Share</span>
                          </button>
                          <button className="text-red-500" onClick={() => handleDeleteFlashcard(flashcard.id)}>
                            <span className="text-lg">×</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white bg-opacity-75 rounded p-4 text-center">
                <p style={fontStyle}>No flashcards yet. Click "Add Study Material" to create one.</p>
              </div>
            )}
          </div>
        </div>

        <div className="w-64 bg-white p-6 fixed right-0 top-20 bottom-0 overflow-y-auto">
          <div className="flex flex-col mb-6">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mb-4"
              onClick={handleAddStudyMaterial}
            >
              <span style={fontStyle}>Add Study Material</span>
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mb-4"
              onClick={handleOpenChatRoom}
            >
              <span style={fontStyle}>Message Members</span>
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold" style={fontStyle}>
              Members
            </h2>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full flex items-center justify-center"
              onClick={handleAddMember}
              style={{ width: "30px", height: "30px" }}
            >
              <span>+</span>
            </button>
          </div>

          <div className="space-y-4">
            {members.length > 0 ? (
              members.map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <span className="text-black" style={fontStyle}>
                    {member.name}
                  </span>
                  {member.isAdmin && (
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded text-black" style={fontStyle}>
                      Admin
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500" style={fontStyle}>
                No members yet.
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Conditional rendering based on current view
  if (showChatRoom && currentCommunity) {
    return (
      <>
        <GlobalStyle />
        <ChatRoom community={currentCommunity} />
      </>
    )
  }

  if (showCommunityDetail && currentCommunity) {
    return (
      <>
        <GlobalStyle />
        <CommunityDetail community={currentCommunity} onUpdate={handleUpdateCommunity} />
      </>
    )
  }

  // Main Communities list view
  return (
    <>
      <GlobalStyle />
      <TopBar />
      <NavBar />
      <div className="min-h-screen p-6 pl-[80px] md:pl-[272px] pt-24" style={backgroundStyle}>
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-4xl font-bold text-white" style={fontStyle}>
            Communities
          </h1>
          <div className="flex flex-col items-end gap-2">
            <button
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
              onClick={() => setShowModal(true)}
            >
              <span style={fontStyle}>Create your own</span>
            </button>
            <div className="mt-4">
              <h2 className="text-white text-lg mb-2" style={fontStyle}>
                My Communities
              </h2>
              {myCommunities.length > 0 ? (
                myCommunities.map((community) => (
                  <div
                    key={community.id}
                    className="bg-white p-2 rounded w-36 text-center mb-2 cursor-pointer"
                    onClick={() => navigate(`/community/view/${community.id}`)}
                  >
                    <span className="text-black" style={fontStyle}>
                      {community.name}
                    </span>
                  </div>
                ))
              ) : (
                <div className="bg-white p-2 rounded w-36 text-center text-gray-500">
                  <span style={fontStyle}>No communities</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by Name"
            className="w-full p-2 rounded border border-gray-300 text-black"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={fontStyle}
          />
        </div>

        {loading ? (
          <div className="bg-white bg-opacity-75 rounded p-4 text-center">
            <p style={fontStyle}>Loading communities...</p>
          </div>
        ) : error ? (
          <div className="bg-white bg-opacity-75 rounded p-4 text-center">
            <p style={fontStyle}>{error}</p>
          </div>
        ) : filteredCommunities.length > 0 ? (
          filteredCommunities.map((community) => (
            <div key={community.id} className="bg-white rounded p-4 mb-4">
              <div className="flex items-start">
                <div className="bg-red-500 rounded-full w-12 h-12 flex items-center justify-center text-white mr-4">
                  <span style={fontStyle}>{community.name.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <h2
                    className="text-xl font-bold text-blue-500 cursor-pointer"
                    onClick={() => navigate(`/community/view/${community.id}`)}
                    style={fontStyle}
                  >
                    {community.name}
                  </h2>
                  <p className="text-sm text-gray-600" style={fontStyle}>
                    {community.description}
                  </p>
                  <div className="flex justify-between mt-4">
                    <button
                      className="flex items-center text-gray-500"
                      onClick={() => handleLikeCommunity(community.id)}
                    >
                      <span className="mr-1">❤️</span>
                      <span style={fontStyle}>{community.likes}</span>
                    </button>
                    <button className="text-blue-500" onClick={() => handleJoinCommunity(community.id)}>
                      <span style={fontStyle}>Join</span>
                    </button>
                    <button className="text-blue-500" onClick={() => handleShareCommunity(community.id)}>
                      <span style={fontStyle}>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white bg-opacity-75 rounded p-4 text-center">
            {communities.length === 0 ? (
              <p style={fontStyle}>No communities yet. Create your own or search for others.</p>
            ) : (
              <p style={fontStyle}>No communities match your search.</p>
            )}
          </div>
        )}

        {/* Create Community Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div ref={modalRef} className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4 text-center" style={fontStyle}>
                Create your Community
              </h2>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full p-2 border border-gray-300 rounded mb-4 text-black"
                  value={communityName}
                  onChange={(e) => setCommunityName(e.target.value)}
                  style={fontStyle}
                />

                <input
                  type="text"
                  placeholder="Description"
                  className="w-full p-2 border border-gray-300 rounded text-black"
                  value={communityDescription}
                  onChange={(e) => setCommunityDescription(e.target.value)}
                  style={fontStyle}
                />
              </div>

              <button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                onClick={handleSubmit}
                disabled={!communityName.trim()}
              >
                <span style={fontStyle}>Submit</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Communities



// "use client"

// import { useState, useRef, useEffect } from "react"
// import { Link } from "react-router-dom"
// import NavBar from "./Navbar"

// // Custom font import
// const fontStyle = {
//   fontFamily: '"Sour Gummy", sans-serif',
// }

// // Adding global style for font
// const GlobalStyle = () => (
//   <style jsx global>{`
//     @font-face {
//       font-family: 'Sour Gummy';
//       src: url('/src/assets/fonts/SourGummy-VariableFont_wdth,wght.ttf') format('truetype');
//       font-weight: normal;
//       font-style: normal;
//     }
    
//     body, button, input, h1, h2, h3, p, span {
//       font-family: 'Sour Gummy', sans-serif;
//     }
//   `}</style>
// )

// // TopBar Component
// const TopBar = () => {
//   return (
//     <header className="fixed top-0 left-0 right-0 bg-[#1D6EF1] h-20 flex items-center px-4 z-10">
//       <div className="flex items-center flex-grow">
//         <div className="w-20 h-20 flex items-center justify-center">
//           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center p-2">
//             <img
//               src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame-V163AsalyIRqbHW6Fe7OWFHHuwoL99.png"
//               alt="Bubble Brain Logo"
//               className="w-full h-full object-contain"
//             />
//           </div>
//         </div>
//         <h1 className="text-white text-4xl ml-2" style={fontStyle}>
//           Bubble Brain
//         </h1>
//       </div>
//       <div className="hidden md:flex">
//         {["Home", "Courses", "Quizzes", "Contact"].map((item) => (
//           <Link
//             key={item}
//             to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
//             className="text-white mx-2 px-3 py-2 hover:bg-white/10 rounded transition-colors"
//             style={fontStyle}
//           >
//             {item}
//           </Link>
//         ))}
//       </div>
//     </header>
//   )
// }

// const Communities = () => {
//   const [searchQuery, setSearchQuery] = useState("")
//   const [showModal, setShowModal] = useState(false)
//   const [communityName, setCommunityName] = useState("")
//   const [communityDescription, setCommunityDescription] = useState("")
//   const [showCommunityDetail, setShowCommunityDetail] = useState(false)
//   const [currentCommunity, setCurrentCommunity] = useState(null)
//   const [myCommunities, setMyCommunities] = useState([])
//   const [showChatRoom, setShowChatRoom] = useState(false)
//   const [messages, setMessages] = useState([])
//   const [newMessage, setNewMessage] = useState("")
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const modalRef = useRef(null)

//   // Communities state
//   const [communities, setCommunities] = useState([])

//   const backgroundStyle = {
//     backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image3-M7gmQibPxwx9MBXzWTzonaopMrRC3Q.png')`,
//     backgroundSize: "cover",
//     backgroundPosition: "center",
//     minHeight: "100vh",
//     minWidth: "1024px", // Ensure desktop minimum width
//   }

//   // Fetch communities on component mount
//   useEffect(() => {
//     fetchCommunities()
//   }, [])

//   // Fetch communities from API
//   const fetchCommunities = () => {
//     setLoading(true)
//     setError(null)
//     const token = sessionStorage.getItem("token")

//     if (!token) {
//       setError("You must be logged in to view communities")
//       setLoading(false)
//       return
//     }

//     fetch(`${process.env.REACT_APP_API_PATH}/groups`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     })
//       .then((res) => {
//         if (!res.ok) {
//           throw new Error(`HTTP error! status: ${res.status}`)
//         }
//         return res.json()
//       })
//       .then((result) => {
//         if (result && result[0]) {
//           // Transform API data to match our component's expected format
//           const communitiesData = result[0].map((group) => ({
//             id: group.id,
//             name: group.name || "Community",
//             description: group.description || "No description available",
//             likes: 0, // Groups don't have likes by default
//             members: [{ id: group.ownerID, name: "Owner", isAdmin: true }],
//             flashcards: [],
//             messages: [],
//             authorId: group.ownerID,
//           }))
//           setCommunities(communitiesData)

//           // Set my communities (communities created by the current user)
//           const user = JSON.parse(sessionStorage.getItem("user"))
//           if (user) {
//             const userCommunities = communitiesData.filter((community) => community.authorId === user.id)
//             setMyCommunities(userCommunities)
//           }
//         }
//         setLoading(false)
//       })
//       .catch((error) => {
//         console.error("Error fetching communities:", error)
//         setError("Failed to load communities. Please try again later.")
//         setLoading(false)
//       })
//   }

//   // Handle click outside of modal
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (modalRef.current && !modalRef.current.contains(event.target)) {
//         setShowModal(false)
//       }
//     }

//     if (showModal) {
//       document.addEventListener("mousedown", handleClickOutside)
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside)
//     }
//   }, [showModal])

//   // Filter communities based on search query
//   const filteredCommunities = communities.filter((community) =>
//     community.name.toLowerCase().includes(searchQuery.toLowerCase()),
//   )

//   const handleSubmit = () => {
//     if (!communityName.trim()) return

//     setLoading(true)
//     const token = sessionStorage.getItem("token")
//     const user = JSON.parse(sessionStorage.getItem("user"))

//     if (!token || !user) {
//       alert("You must be logged in to create a community")
//       setLoading(false)
//       return
//     }

//     const communityData = {
//       name: communityName,
//       description: communityDescription,
//       ownerID: user.id,
//     }

//     fetch(`${process.env.REACT_APP_API_PATH}/groups`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(communityData),
//     })
//       .then((res) => {
//         if (!res.ok) {
//           throw new Error(`HTTP error! status: ${res.status}`)
//         }
//         return res.json()
//       })
//       .then((result) => {
//         // Create a new community object with our expected format
//         const newCommunity = {
//           id: result.id,
//           name: result.name,
//           description: result.description,
//           likes: 0,
//           members: [{ id: user.id, name: "You", isAdmin: true }],
//           flashcards: [],
//           messages: [],
//           authorId: result.ownerID,
//         }

//         // Add to communities list
//         setCommunities([...communities, newCommunity])

//         // Add to my communities
//         setMyCommunities([...myCommunities, newCommunity])

//         // Show detail page for the new community
//         setCurrentCommunity(newCommunity)
//         setShowCommunityDetail(true)

//         // Reset form
//         setCommunityName("")
//         setCommunityDescription("")
//         setShowModal(false)
//         setLoading(false)
//       })
//       .catch((error) => {
//         console.error("Error creating community:", error)
//         alert("Failed to create community. Please try again.")
//         setLoading(false)
//       })
//   }

//   const handleLikeCommunity = (communityId) => {
//     const token = sessionStorage.getItem("token")
//     if (!token) return

//     // Optimistically update UI
//     setCommunities(
//       communities.map((community) =>
//         community.id === communityId ? { ...community, likes: community.likes + 1 } : community,
//       ),
//     )

//     // Send reaction to API
//     fetch(`${process.env.REACT_APP_API_PATH}/reactions`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({
//         postID: communityId,
//         type: "like",
//       }),
//     }).catch((error) => {
//       console.error("Error liking community:", error)
//       // Revert optimistic update on error
//       setCommunities(
//         communities.map((community) =>
//           community.id === communityId ? { ...community, likes: community.likes - 1 } : community,
//         ),
//       )
//     })
//   }

//   const handleJoinCommunity = (communityId) => {
//     const community = communities.find((c) => c.id === communityId)

//     // Check if already in my communities
//     if (!myCommunities.some((c) => c.id === communityId)) {
//       setMyCommunities([...myCommunities, community])
//     }
//   }

//   const handleShareCommunity = (communityId) => {
//     // Simulate copying a link to clipboard
//     const communityLink = `${window.location.origin}/community/${communityId}`
//     console.log("Link copied to clipboard:", communityLink)

//     // In a real app, you would use the Clipboard API:
//     // navigator.clipboard.writeText(communityLink)
//   }

//   const handleViewCommunity = (communityId) => {
//     // Find the community from the current state
//     const community = communities.find((c) => c.id === communityId)

//     if (community) {
//       // Fetch additional community details if needed
//       const token = sessionStorage.getItem("token")

//       if (token) {
//         // Fetch community members or other details if needed
//         // For now, we'll just use the existing data
//         setCurrentCommunity(community)
//         setShowCommunityDetail(true)
//         setShowChatRoom(false)
//       }
//     }
//   }

//   // Add a function to update a community when changes are made
//   const handleUpdateCommunity = (updatedCommunity) => {
//     // Update the communities array
//     const updatedCommunities = communities.map((c) => (c.id === updatedCommunity.id ? updatedCommunity : c))
//     setCommunities(updatedCommunities)

//     // Also update myCommunities if it exists there
//     if (myCommunities.some((c) => c.id === updatedCommunity.id)) {
//       const updatedMyCommunities = myCommunities.map((c) => (c.id === updatedCommunity.id ? updatedCommunity : c))
//       setMyCommunities(updatedMyCommunities)
//     }

//     // Update current community reference
//     setCurrentCommunity(updatedCommunity)
//   }

//   const handleBackToCommunities = () => {
//     setShowCommunityDetail(false)
//     setCurrentCommunity(null)
//     setShowChatRoom(false)
//   }

//   const handleOpenChatRoom = () => {
//     setShowChatRoom(true)
//     // Initialize with some sample messages
//     if (!currentCommunity.messages || currentCommunity.messages.length === 0) {
//       const initialMessages = [
//         { id: 1, sender: "You", text: "Hello everyone!", timestamp: new Date().toISOString() },
//         { id: 2, sender: "System", text: "Welcome to the community chat!", timestamp: new Date().toISOString() },
//       ]
//       currentCommunity.messages = initialMessages
//       setMessages(initialMessages)
//     } else {
//       setMessages(currentCommunity.messages)
//     }
//   }

//   const handleBackToCommunity = () => {
//     setShowChatRoom(false)
//   }

//   const handleSendMessage = () => {
//     if (!newMessage.trim()) return

//     const message = {
//       id: Date.now(),
//       sender: "You",
//       text: newMessage,
//       timestamp: new Date().toISOString(),
//     }

//     const updatedMessages = [...messages, message]
//     setMessages(updatedMessages)

//     // Create a copy to avoid direct mutation
//     const updatedCommunity = { ...currentCommunity, messages: updatedMessages }
//     setCurrentCommunity(updatedCommunity)

//     // Clear the message after state updates
//     setTimeout(() => {
//       setNewMessage("")
//     }, 0)
//   }

//   // Chat Room Component
//   const ChatRoom = ({ community }) => {
//     const messagesEndRef = useRef(null)
//     const inputRef = useRef(null)

//     // Auto-scroll to bottom of messages
//     useEffect(() => {
//       messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
//     }, [])

//     // Focus input on component mount
//     useEffect(() => {
//       inputRef.current?.focus()
//     }, [])

//     return (
//       <div className="min-h-screen flex" style={backgroundStyle}>
//         <GlobalStyle />
//         <TopBar />
//         <NavBar />
//         {/* Member List Sidebar */}
//         <div className="w-64 bg-white p-6 fixed left-[80px] md:left-[272px] top-20 bottom-0 overflow-y-auto">
//           <div className="flex items-center mb-8">
//             <button className="text-blue-500 mr-3 text-2xl" onClick={handleBackToCommunity} style={fontStyle}>
//               ←
//             </button>
//             <h1 className="text-2xl font-bold text-blue-500" style={fontStyle}>
//               Chat Room
//             </h1>
//           </div>

//           <h2 className="text-xl font-bold mb-4" style={fontStyle}>
//             Members
//           </h2>
//           <div className="space-y-4">
//             {community.members.map((member) => (
//               <div key={member.id} className="flex items-center">
//                 <div className="bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center text-white mr-2">
//                   <span style={fontStyle}>{member.name.charAt(0)}</span>
//                 </div>
//                 <span className="text-black" style={fontStyle}>
//                   {member.name}
//                 </span>
//                 {member.isAdmin && (
//                   <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded text-black" style={fontStyle}>
//                     Admin
//                   </span>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Chat Area */}
//         <div className="flex-1 flex flex-col ml-64 pl-[80px] md:pl-[272px] pt-24">
//           {/* Messages Container */}
//           <div className="flex-1 bg-white bg-opacity-90 p-6 m-6 mb-0 rounded-t overflow-y-auto max-h-[calc(100vh-180px)]">
//             {messages.length > 0 ? (
//               messages.map((message) => (
//                 <div key={message.id} className={`mb-4 ${message.sender === "You" ? "text-right" : ""}`}>
//                   <div
//                     className={`inline-block p-3 rounded-lg ${
//                       message.sender === "You"
//                         ? "bg-blue-500 text-white"
//                         : message.sender === "System"
//                           ? "bg-gray-300 text-gray-800"
//                           : "bg-gray-200 text-gray-800"
//                     }`}
//                   >
//                     <div className="font-bold mb-1" style={fontStyle}>
//                       {message.sender}
//                     </div>
//                     <div style={fontStyle}>{message.text}</div>
//                     <div className="text-xs mt-1 opacity-70" style={fontStyle}>
//                       {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="text-center text-gray-500" style={fontStyle}>
//                 No messages yet. Start the conversation!
//               </div>
//             )}
//             <div ref={messagesEndRef} />
//           </div>

//           {/* Message Input */}
//           <div className="p-6 pt-3 m-6 mt-0 bg-white bg-opacity-90 rounded-b">
//             <div className="flex">
//               <input
//                 type="text"
//                 placeholder="Type a message..."
//                 className="flex-1 p-3 border border-gray-300 rounded-l text-black"
//                 value={newMessage}
//                 onChange={(e) => setNewMessage(e.target.value)}
//                 onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
//                 style={fontStyle}
//                 ref={inputRef}
//               />
//               <button className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-r" onClick={handleSendMessage}>
//                 <span style={fontStyle}>Send</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // Community Detail Page Component
//   const CommunityDetail = ({ community, onUpdate }) => {
//     const [members, setMembers] = useState(community.members || [])
//     const [flashcards, setFlashcards] = useState(community.flashcards || [])

//     const handleAddStudyMaterial = () => {
//       // Add a blank flashcard
//       const newFlashcard = {
//         id: Date.now(),
//         title: "New Flashcard",
//         description: "Edit this flashcard",
//         likes: 0,
//       }

//       setFlashcards([...flashcards, newFlashcard])

//       // Update the community object
//       community.flashcards = [...flashcards, newFlashcard]
//       onUpdate({ ...community, flashcards: [...flashcards, newFlashcard] })
//     }

//     const handleAddMember = () => {
//       // Handle adding member logic
//       console.log("Adding new member")
//     }

//     const handleShareFlashcard = (id) => {
//       console.log("Sharing flashcard with id:", id)
//     }

//     const handleDeleteFlashcard = (id) => {
//       const updatedFlashcards = flashcards.filter((card) => card.id !== id)
//       setFlashcards(updatedFlashcards)

//       // Update the community object
//       community.flashcards = updatedFlashcards
//       onUpdate({ ...community, flashcards: updatedFlashcards })
//     }

//     return (
//       <div className="min-h-screen flex" style={backgroundStyle}>
//         <GlobalStyle />
//         <TopBar />
//         <NavBar />
//         <div className="flex-1 p-6 pl-[80px] md:pl-[272px] pt-24">
//           <div className="flex items-center mb-8">
//             <button className="text-white mr-3 text-2xl" onClick={handleBackToCommunities} style={fontStyle}>
//               ←
//             </button>
//             <h1 className="text-4xl font-bold text-white" style={fontStyle}>
//               {community.name}
//             </h1>
//           </div>

//           <div className="mb-12">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-2xl font-bold text-white" style={fontStyle}>
//                 Flashcards
//               </h2>
//             </div>

//             {flashcards.length > 0 ? (
//               flashcards.map((flashcard) => (
//                 <div key={flashcard.id} className="bg-white rounded p-4 mb-4">
//                   <div className="flex items-start">
//                     <div className="bg-red-500 rounded-full w-12 h-12 flex items-center justify-center text-white mr-4">
//                       <span style={fontStyle}>{flashcard.title.charAt(0)}</span>
//                     </div>
//                     <div className="flex-1">
//                       <h2 className="text-xl font-bold text-blue-500" style={fontStyle}>
//                         {flashcard.title}
//                       </h2>
//                       <p className="text-sm text-gray-600" style={fontStyle}>
//                         {flashcard.description}
//                       </p>
//                       <div className="flex justify-between mt-2">
//                         <div className="flex items-center">
//                           <button className="flex items-center text-gray-500 mr-4">
//                             <span className="mr-1">❤️</span>
//                             <span style={fontStyle}>{flashcard.likes}</span>
//                           </button>
//                         </div>
//                         <div className="flex items-center">
//                           <button className="text-blue-500 mr-2" onClick={() => handleShareFlashcard(flashcard.id)}>
//                             <span style={fontStyle}>Share</span>
//                           </button>
//                           <button className="text-red-500" onClick={() => handleDeleteFlashcard(flashcard.id)}>
//                             <span className="text-lg">×</span>
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="bg-white bg-opacity-75 rounded p-4 text-center">
//                 <p style={fontStyle}>No flashcards yet. Click "Add Study Material" to create one.</p>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="w-64 bg-white p-6 fixed right-0 top-20 bottom-0 overflow-y-auto">
//           <div className="flex flex-col mb-6">
//             <button
//               className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mb-4"
//               onClick={handleAddStudyMaterial}
//             >
//               <span style={fontStyle}>Add Study Material</span>
//             </button>
//             <button
//               className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mb-4"
//               onClick={handleOpenChatRoom}
//             >
//               <span style={fontStyle}>Message Members</span>
//             </button>
//           </div>

//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-xl font-bold" style={fontStyle}>
//               Members
//             </h2>
//             <button
//               className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full flex items-center justify-center"
//               onClick={handleAddMember}
//               style={{ width: "30px", height: "30px" }}
//             >
//               <span>+</span>
//             </button>
//           </div>

//           <div className="space-y-4">
//             {members.length > 0 ? (
//               members.map((member) => (
//                 <div key={member.id} className="flex items-center justify-between">
//                   <span className="text-black" style={fontStyle}>
//                     {member.name}
//                   </span>
//                   {member.isAdmin && (
//                     <span className="text-xs bg-gray-200 px-2 py-1 rounded text-black" style={fontStyle}>
//                       Admin
//                     </span>
//                   )}
//                 </div>
//               ))
//             ) : (
//               <p className="text-gray-500" style={fontStyle}>
//                 No members yet.
//               </p>
//             )}
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // Conditional rendering based on current view
//   if (showChatRoom && currentCommunity) {
//     return (
//       <>
//         <GlobalStyle />
//         <ChatRoom community={currentCommunity} />
//       </>
//     )
//   }

//   if (showCommunityDetail && currentCommunity) {
//     return (
//       <>
//         <GlobalStyle />
//         <CommunityDetail community={currentCommunity} onUpdate={handleUpdateCommunity} />
//       </>
//     )
//   }

//   // Main Communities list view
//   return (
//     <>
//       <GlobalStyle />
//       <TopBar />
//       <NavBar />
//       <div className="min-h-screen p-6 pl-[80px] md:pl-[272px] pt-24" style={backgroundStyle}>
//         <div className="flex justify-between items-start mb-6">
//           <h1 className="text-4xl font-bold text-white" style={fontStyle}>
//             Communities
//           </h1>
//           <div className="flex flex-col items-end gap-2">
//             <button
//               className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
//               onClick={() => setShowModal(true)}
//             >
//               <span style={fontStyle}>Create your own</span>
//             </button>
//             <div className="mt-4">
//               <h2 className="text-white text-lg mb-2" style={fontStyle}>
//                 My Communities
//               </h2>
//               {myCommunities.length > 0 ? (
//                 myCommunities.map((community) => (
//                   <div
//                     key={community.id}
//                     className="bg-white p-2 rounded w-36 text-center mb-2 cursor-pointer"
//                     onClick={() => handleViewCommunity(community.id)}
//                   >
//                     <span className="text-black" style={fontStyle}>
//                       {community.name}
//                     </span>
//                   </div>
//                 ))
//               ) : (
//                 <div className="bg-white p-2 rounded w-36 text-center text-gray-500">
//                   <span style={fontStyle}>No communities</span>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="mb-6">
//           <input
//             type="text"
//             placeholder="Search by Name"
//             className="w-full p-2 rounded border border-gray-300 text-black"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             style={fontStyle}
//           />
//         </div>

//         {loading ? (
//           <div className="bg-white bg-opacity-75 rounded p-4 text-center">
//             <p style={fontStyle}>Loading communities...</p>
//           </div>
//         ) : error ? (
//           <div className="bg-white bg-opacity-75 rounded p-4 text-center">
//             <p style={fontStyle}>{error}</p>
//           </div>
//         ) : filteredCommunities.length > 0 ? (
//           filteredCommunities.map((community) => (
//             <div key={community.id} className="bg-white rounded p-4 mb-4">
//               <div className="flex items-start">
//                 <div className="bg-red-500 rounded-full w-12 h-12 flex items-center justify-center text-white mr-4">
//                   <span style={fontStyle}>{community.name.charAt(0)}</span>
//                 </div>
//                 <div className="flex-1">
//                   <h2
//                     className="text-xl font-bold text-blue-500 cursor-pointer"
//                     onClick={() => handleViewCommunity(community.id)}
//                     style={fontStyle}
//                   >
//                     {community.name}
//                   </h2>
//                   <p className="text-sm text-gray-600" style={fontStyle}>
//                     {community.description}
//                   </p>
//                   <div className="flex justify-between mt-4">
//                     <button
//                       className="flex items-center text-gray-500"
//                       onClick={() => handleLikeCommunity(community.id)}
//                     >
//                       <span className="mr-1">❤️</span>
//                       <span style={fontStyle}>{community.likes}</span>
//                     </button>
//                     <button className="text-blue-500" onClick={() => handleJoinCommunity(community.id)}>
//                       <span style={fontStyle}>Join</span>
//                     </button>
//                     <button className="text-blue-500" onClick={() => handleShareCommunity(community.id)}>
//                       <span style={fontStyle}>Share</span>
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div className="bg-white bg-opacity-75 rounded p-4 text-center">
//             {communities.length === 0 ? (
//               <p style={fontStyle}>No communities yet. Create your own or search for others.</p>
//             ) : (
//               <p style={fontStyle}>No communities match your search.</p>
//             )}
//           </div>
//         )}

//         {/* Create Community Modal */}
//         {showModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div ref={modalRef} className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
//               <h2 className="text-2xl font-bold mb-4 text-center" style={fontStyle}>
//                 Create your Community
//               </h2>

//               <div className="mb-4">
//                 <input
//                   type="text"
//                   placeholder="Name"
//                   className="w-full p-2 border border-gray-300 rounded mb-4 text-black"
//                   value={communityName}
//                   onChange={(e) => setCommunityName(e.target.value)}
//                   style={fontStyle}
//                 />

//                 <input
//                   type="text"
//                   placeholder="Description"
//                   className="w-full p-2 border border-gray-300 rounded text-black"
//                   value={communityDescription}
//                   onChange={(e) => setCommunityDescription(e.target.value)}
//                   style={fontStyle}
//                 />
//               </div>

//               <button
//                 className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
//                 onClick={handleSubmit}
//                 disabled={!communityName.trim()}
//               >
//                 <span style={fontStyle}>Submit</span>
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   )
// }

// export default Communities


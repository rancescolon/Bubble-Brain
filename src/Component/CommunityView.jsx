"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Box, Typography, CircularProgress, Dialog } from "@mui/material"
// import NavBar from "./Navbar"
import background from "../assets/image3.png"
import fish1 from "../assets/fish1.png"
import fish2 from "../assets/fish2.png"
import fish3 from "../assets/fish3.png"

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
    </header>
  )
}

const API_BASE_URL = "https://webdev.cse.buffalo.edu/hci/api/api/droptable"

// Template Manager Component
const TemplateManager = ({ onSelectTemplate, onClose }) => {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: "Basic Flashcards",
      type: "flashcards",
      content: [
        { front: "Question 1", back: "Answer 1" },
        { front: "Question 2", back: "Answer 2" },
      ],
    },
    {
      id: 2,
      name: "Multiple Choice Quiz",
      type: "multiple_choice",
      content: [
        {
          question: "What is 2+2?",
          options: ["3", "4", "5", "6"],
          correctAnswer: 1,
        },
        {
          question: "What is the capital of France?",
          options: ["London", "Berlin", "Paris", "Madrid"],
          correctAnswer: 2,
        },
      ],
    },
    {
      id: 3,
      name: "Fill in the Blank",
      type: "fill_in_blank",
      content: [
        { text: "The sky is ___.", answer: "blue" },
        { text: "Water boils at ___ degrees Celsius.", answer: "100" },
      ],
    },
    {
      id: 4,
      name: "Matching Exercise",
      type: "matching",
      content: [
        { left: "Dog", right: "Bark" },
        { left: "Cat", right: "Meow" },
        { left: "Cow", right: "Moo" },
      ],
    },
  ])

  return (
    <div className="bg-white p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold" style={fontStyle}>
          Select a Template
        </h2>
        <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
          <span className="text-xl">×</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
            onClick={() => {
              onSelectTemplate(template)
              onClose()
            }}
          >
            <h3 className="text-lg font-semibold mb-2" style={fontStyle}>
              {template.name}
            </h3>
            <p className="text-sm text-gray-600" style={fontStyle}>
              Type: {template.type}
            </p>
            <p className="text-sm text-gray-600 mt-2" style={fontStyle}>
              {template.type === "flashcards" && `${template.content.length} flashcards`}
              {template.type === "multiple_choice" && `${template.content.length} questions`}
              {template.type === "fill_in_blank" && `${template.content.length} sentences`}
              {template.type === "matching" && `${template.content.length} pairs`}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

const CommunityView = () => {
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
  const [selectedType, setSelectedType] = useState("flashcards")
  const [showTemplateManager, setShowTemplateManager] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [studySetName, setStudySetName] = useState("")
  const [showAddStudySetDialog, setShowAddStudySetDialog] = useState(false)
  const [templateContent, setTemplateContent] = useState([])
  const [currentStep, setCurrentStep] = useState(1) // 1: Name, 2: Template, 3: Content
  const [editingItemIndex, setEditingItemIndex] = useState(null)
  const [newItem, setNewItem] = useState({})

  const backgroundStyle = {
    backgroundImage: `url(${background})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
    minWidth: "1024px", // Ensure desktop minimum width
  }

  useEffect(() => {
    fetchCommunityDetails()
  }, [])

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

  const fetchStudySets = () => {
    const token = sessionStorage.getItem("token")
    const currentCommunityId = id // Keep as string for comparison

    console.log("Fetching study sets for community:", currentCommunityId) // Debug log

    // Try to fetch study sets specifically for this community first
    fetch(`${API_BASE_URL}/posts?type=study_set`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          console.error("Study sets response not OK:", res.status, res.statusText) // Debug log
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((result) => {
        console.log("All study sets response:", result) // Debug log
        
        if (result && result[0] && result[0].length > 0) {
          console.log("Total study sets found:", result[0].length)
          
          // First, filter to only include study sets for this community
          const communityStudySets = result[0].filter(post => {
            // Try to parse the content to check for communityId
            let contentObj = null;
            try {
              if (post.content && typeof post.content === 'string') {
                contentObj = JSON.parse(post.content);
              }
            } catch (e) {
              console.warn("Could not parse content for post", post.id);
            }
            
            // Check if communityId is in the content
            if (contentObj && contentObj.communityId === currentCommunityId) {
              console.log(`Post ID ${post.id} belongs to community ${currentCommunityId} via content.communityId`);
              return true;
            }
            
            // Check if the post has our custom attribute that indicates the community
            if (post.attributes && post.attributes.communityId === currentCommunityId) {
              console.log(`Post ID ${post.id} belongs to community ${currentCommunityId} via attributes.communityId`);
              return true;
            }
            
            // Check if parentID matches the community ID
            if (post.parentID && String(post.parentID) === currentCommunityId) {
              console.log(`Post ID ${post.id} belongs to community ${currentCommunityId} via parentID`);
              return true;
            }
            
            // Also check the groupID as string comparison to handle potential NaN values
            const postGroupId = String(post.groupID || "");
            const belongsViaGroupId = postGroupId === currentCommunityId;
            if (belongsViaGroupId) {
              console.log(`Post ID ${post.id} belongs to community ${currentCommunityId} via groupID`);
            }
            
            // For debugging
            console.log(`Post ID ${post.id} check: content.communityId=${contentObj?.communityId}, attributes.communityId=${post.attributes?.communityId}, parentID=${post.parentID}, groupID=${postGroupId}, belongs: ${belongsViaGroupId || (contentObj && contentObj.communityId === currentCommunityId) || (post.attributes && post.attributes.communityId === currentCommunityId) || (post.parentID && String(post.parentID) === currentCommunityId)}`);
            
            return belongsViaGroupId || 
                   (contentObj && contentObj.communityId === currentCommunityId) || 
                   (post.attributes && post.attributes.communityId === currentCommunityId) ||
                   (post.parentID && String(post.parentID) === currentCommunityId);
          });
          
          console.log("Study sets for this community:", communityStudySets.length)
          
          // Transform API data to match our component's expected format
          const studySetsData = communityStudySets
            .map((post) => {
              try {
                // Try to parse the content as JSON, but handle invalid JSON gracefully
                let content = {}
                
                try {
                  if (post.content && typeof post.content === 'string') {
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
                    content: [{ front: post.content || "Content unavailable", back: "" }]
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
                  likes: post._count?.reactions || 0,
                  groupID: post.groupID, // Keep groupID for debugging
                  communityId: content.communityId || post.attributes?.communityId || post.parentID || post.groupID // Add communityId for debugging
                }
              } catch (error) {
                console.error("Error processing post:", error)
                return null
              }
            })
            .filter(Boolean) // Remove null entries

          console.log("Transformed study sets:", studySetsData) // Debug log
          setStudySets(studySetsData)
        } else {
          console.log("No study sets found") // Debug log
          setStudySets([])
        }
      })
      .catch((error) => {
        console.error("Error fetching study sets:", error)
        console.error("Error details:", error.message) // Debug log
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
      const currentCommunityId = id // Keep as string for consistency

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
          communityId: currentCommunityId // Add communityId to content as well
        }),
        type: "study_set",
        authorID: parseInt(userId),
        groupID: parseInt(currentCommunityId) || 0, // Use 0 as fallback if parsing fails
        attributes: {
          description: "Study set created in community",
          communityId: currentCommunityId // Store community ID in attributes
        },
      }

      console.log("Creating study set with data:", postData)
      console.log("Creating study set for community ID:", currentCommunityId)
      console.log("JSON content:", postData.content)

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
      console.log("Study set created successfully:", result)

      // Add the new study set to the state with proper structure
      const newStudySet = {
        id: result.id,
        title: studySetName,
        description: "Created by you",
        type: selectedTemplate.type,
        content: templateContent,
        likes: 0,
        groupID: parseInt(currentCommunityId) || 0,
        communityId: currentCommunityId // Add communityId for consistency
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
        fetchStudySets();
      }, 1000);

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
          content: studySet.content, // Pass the actual content
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
    console.log("Sharing study set with id:", id)
  }

  const handleOpenChatRoom = () => {
    setShowChatRoom(true)
    // Initialize with some sample messages
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
        // Message sent successfully, we could update the optimistic message with the real ID if needed
        console.log("Message sent successfully:", result)
      })
      .catch((error) => {
        console.error("Error sending message:", error)
        alert("Failed to send message. Please try again.")

        // Remove the optimistic message on error
        setMessages(messages.filter((msg) => msg.id !== optimisticMessage.id))
      })
  }

  // Helper function to get a random image when thumbnailURL is not available
  const getRandomImage = () => {
    const images = [fish1, fish2, fish3]
    return images[Math.floor(Math.random() * images.length)]
  }

  // Chat Room Component
  const ChatRoom = () => {
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
        {/* <NavBar /> */}
        {/* Member List Sidebar */}
        <div className="w-64 bg-white p-6 fixed left-[20px] md:left-[100px] top-20 bottom-0 overflow-y-auto">
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
            {members.map((member, index) => (
              <div key={member.id || `member-${index}`} className="flex items-center">
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
        <div className="flex-1 flex flex-col ml-64 pl-[20px] md:pl-[100px] pt-24">
          {/* Messages Container */}
          <div className="flex-1 bg-white bg-opacity-90 p-6 m-6 mb-0 rounded-t overflow-y-auto max-h-[calc(100vh-180px)]">
            {messages.length > 0 ? (
              messages.map((message, index) => (
                <div
                  key={message.id || `message-${index}`}
                  className={`mb-4 ${message.sender === "You" ? "text-right" : ""}`}
                >
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

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: `url(${background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <CircularProgress sx={{ color: "#1D6EF1" }} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: `url(${background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Typography
          color="error"
          sx={{
            fontFamily: "SourGummy, sans-serif",
            backgroundColor: "white",
            padding: 4,
            borderRadius: 2,
          }}
        >
          {error}
        </Typography>
      </Box>
    )
  }

  if (showChatRoom) {
    return <ChatRoom />
  }

  return (
    <div className="min-h-screen flex" style={backgroundStyle}>
      <GlobalStyle />
      <TopBar />
      {/* <NavBar /> */}
      <div className="flex-1 p-6 pl-[20px] md:pl-[100px] pt-24">
        <div className="flex items-center mb-8">
          <button className="text-white mr-3 text-2xl" onClick={handleBack} style={fontStyle}>
            ←
          </button>
          <h1 className="text-4xl font-bold text-white" style={fontStyle}>
            {community?.name}
          </h1>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-white" style={fontStyle}>
                Study Sets
              </h2>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-white rounded p-2 text-black"
                style={fontStyle}
              >
                <option value="all">View All</option>
                <option value="flashcards">Flashcards</option>
                <option value="fill_in_blank">Fill in the Blank</option>
                <option value="matching">Matching</option>
                <option value="multiple_choice">Multiple Choice</option>
              </select>
            </div>
          </div>

          {studySets.length > 0 ? (
            studySets
              .filter((set) => selectedType === "all" || set.type === selectedType)
              .map((studySet) => (
                <div key={studySet.id} className="bg-white rounded p-4 mb-4">
                  <div className="flex items-start">
                    <div className="bg-red-500 rounded-full w-12 h-12 flex items-center justify-center text-white mr-4">
                      <span style={fontStyle}>{studySet.title.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2
                            className="text-xl font-bold text-blue-500 cursor-pointer"
                            style={fontStyle}
                            onClick={() => handleViewStudySet(studySet)}
                          >
                            {studySet.title}
                          </h2>
                          <p className="text-sm text-gray-600" style={fontStyle}>
                            {studySet.description}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded" style={fontStyle}>
                          {studySet.type === "fill_in_blank" ? "Fill in the Blank" :
                           studySet.type.charAt(0).toUpperCase() + studySet.type.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between mt-2">
                        <div className="flex items-center">
                          <button className="flex items-center text-gray-500 mr-4">
                            <span className="mr-1">❤️</span>
                            <span style={fontStyle}>{studySet.likes}</span>
                          </button>
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
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-8">
              <p className="text-white" style={fontStyle}>No study sets available.</p>
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
            members.map((member, index) => (
              <div key={member.id || `member-${index}`} className="flex items-center justify-between">
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

      {/* Add Study Set Dialog */}
      <Dialog
        open={showAddStudySetDialog}
        onClose={() => {
          setShowAddStudySetDialog(false)
          setCurrentStep(1)
          setStudySetName("")
          setSelectedTemplate(null)
          setTemplateContent([])
        }}
        maxWidth="md"
        fullWidth
      >
        <div className="p-6 bg-white rounded-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold" style={fontStyle}>
              {currentStep === 1
                ? "Name Your Study Set"
                : currentStep === 2
                  ? "Select a Template"
                  : "Customize Your Content"}
            </h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => {
                setShowAddStudySetDialog(false)
                setCurrentStep(1)
                setStudySetName("")
                setSelectedTemplate(null)
                setTemplateContent([])
              }}
            >
              <span className="text-xl">×</span>
            </button>
          </div>

          {/* Step indicators */}
          <div className="flex mb-6">
            <div
              className={`flex-1 p-2 text-center ${currentStep === 1 ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              style={fontStyle}
            >
              1. Name
            </div>
            <div
              className={`flex-1 p-2 text-center ${currentStep === 2 ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              style={fontStyle}
            >
              2. Template
            </div>
            <div
              className={`flex-1 p-2 text-center ${currentStep === 3 ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              style={fontStyle}
            >
              3. Content
            </div>
          </div>

          {/* Step 1: Name */}
          {currentStep === 1 && (
            <div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2" style={fontStyle}>
                  Study Set Name
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded text-black"
                  value={studySetName}
                  onChange={(e) => setStudySetName(e.target.value)}
                  placeholder="Enter a name for your study set"
                  style={fontStyle}
                />
              </div>

              <div className="flex justify-end">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                  onClick={handleNextStep}
                  disabled={!studySetName.trim()}
                  style={fontStyle}
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
                    className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedTemplate?.type === template.type ? "border-blue-500 bg-blue-50" : ""
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <h3 className="text-lg font-semibold mb-2" style={fontStyle}>
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600" style={fontStyle}>
                      Type: {template.type}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                  onClick={handleBackStep}
                  style={fontStyle}
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
                  <h3 className="text-lg font-semibold" style={fontStyle}>
                    {selectedTemplate.name} Content
                  </h3>
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
                    onClick={handleAddItem}
                    style={fontStyle}
                  >
                    Add Item
                  </button>
                </div>

                {/* Flashcards Editor */}
                {selectedTemplate.type === "flashcards" && (
                  <div className="space-y-4">
                    {templateContent.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium" style={fontStyle}>
                            Card {index + 1}
                          </h4>
                          <button
                            className="text-red-500"
                            onClick={() => handleRemoveItem(index)}
                            disabled={templateContent.length <= 1}
                          >
                            <span className="text-lg">×</span>
                          </button>
                        </div>
                        <div className="mb-3">
                          <label className="block text-gray-700 mb-1 text-sm" style={fontStyle}>
                            Front (Question)
                          </label>
                          <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded text-black"
                            value={item.front}
                            onChange={(e) => handleUpdateItem(index, "front", e.target.value)}
                            style={fontStyle}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-1 text-sm" style={fontStyle}>
                            Back (Answer)
                          </label>
                          <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded text-black"
                            value={item.back}
                            onChange={(e) => handleUpdateItem(index, "back", e.target.value)}
                            style={fontStyle}
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
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium" style={fontStyle}>
                            Question {index + 1}
                          </h4>
                          <button
                            className="text-red-500"
                            onClick={() => handleRemoveItem(index)}
                            disabled={templateContent.length <= 1}
                          >
                            <span className="text-lg">×</span>
                          </button>
                        </div>
                        <div className="mb-3">
                          <label className="block text-gray-700 mb-1 text-sm" style={fontStyle}>
                            Question
                          </label>
                          <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded text-black"
                            value={item.question}
                            onChange={(e) => handleUpdateItem(index, "question", e.target.value)}
                            style={fontStyle}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="block text-gray-700 mb-1 text-sm" style={fontStyle}>
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
                                className="flex-1 p-2 border border-gray-300 rounded text-black"
                                value={option}
                                onChange={(e) => handleUpdateItem(index, `options.${optIndex}`, e.target.value)}
                                placeholder={`Option ${optIndex + 1}`}
                                style={fontStyle}
                              />
                            </div>
                          ))}
                          <p className="text-sm text-gray-500" style={fontStyle}>
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
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium" style={fontStyle}>
                            Sentence {index + 1}
                          </h4>
                          <button
                            className="text-red-500"
                            onClick={() => handleRemoveItem(index)}
                            disabled={templateContent.length <= 1}
                          >
                            <span className="text-lg">×</span>
                          </button>
                        </div>
                        <div className="mb-3">
                          <label className="block text-gray-700 mb-1 text-sm" style={fontStyle}>
                            Text (use ___ for the blank)
                          </label>
                          <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded text-black"
                            value={item.text}
                            onChange={(e) => handleUpdateItem(index, "text", e.target.value)}
                            placeholder="Example: The sky is ___."
                            style={fontStyle}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-1 text-sm" style={fontStyle}>
                            Answer
                          </label>
                          <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded text-black"
                            value={item.answer}
                            onChange={(e) => handleUpdateItem(index, "answer", e.target.value)}
                            style={fontStyle}
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
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium" style={fontStyle}>
                            Pair {index + 1}
                          </h4>
                          <button
                            className="text-red-500"
                            onClick={() => handleRemoveItem(index)}
                            disabled={templateContent.length <= 1}
                          >
                            <span className="text-lg">×</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-700 mb-1 text-sm" style={fontStyle}>
                              Left Item
                            </label>
                            <input
                              type="text"
                              className="w-full p-2 border border-gray-300 rounded text-black"
                              value={item.left}
                              onChange={(e) => handleUpdateItem(index, "left", e.target.value)}
                              style={fontStyle}
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 mb-1 text-sm" style={fontStyle}>
                              Right Item
                            </label>
                            <input
                              type="text"
                              className="w-full p-2 border border-gray-300 rounded text-black"
                              value={item.right}
                              onChange={(e) => handleUpdateItem(index, "right", e.target.value)}
                              style={fontStyle}
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
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                  onClick={handleBackStep}
                  style={fontStyle}
                >
                  Back
                </button>
                <button
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                  onClick={createStudySet}
                  disabled={templateContent.length === 0}
                  style={fontStyle}
                >
                  Create Study Set
                </button>
              </div>
            </div>
          )}
        </div>
      </Dialog>

      {/* Template Manager Dialog - No longer needed
      <Dialog open={showTemplateManager} onClose={() => setShowTemplateManager(false)} maxWidth="lg" fullWidth>
        <TemplateManager onSelectTemplate={handleTemplateSelect} onClose={() => setShowTemplateManager(false)} />
      </Dialog>
      */}
    </div>
  )
}

export default CommunityView

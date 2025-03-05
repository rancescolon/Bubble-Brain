// "use client"

// import { useState, useEffect, useRef } from "react"
// import { useParams, useNavigate } from "react-router-dom"
// import { Box, Typography, CircularProgress } from "@mui/material"
// // import NavBar from "./Navbar"
// import background from "../assets/image3.png"
// import fish1 from "../assets/fish1.png"
// import fish2 from "../assets/fish2.png"
// import fish3 from "../assets/fish3.png"

// // Custom font import
// const fontStyle = {
//   fontFamily: '"Sour Gummy", sans-serif',
// }

// // Adding global style for font
// const GlobalStyle = () => (
//   <style
//     dangerouslySetInnerHTML={{
//       __html: `
//     @font-face {
//       font-family: 'Sour Gummy';
//       src: url('/src/assets/fonts/SourGummy-VariableFont_wdth,wght.ttf') format('truetype');
//       font-weight: normal;
//       font-style: normal;
//     }
    
//     body, button, input, h1, h2, h3, p, span {
//       font-family: 'Sour Gummy', sans-serif;
//     }
//   `,
//     }}
//   />
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
//     </header>
//   )
// }

// const API_BASE_URL = "https://webdev.cse.buffalo.edu/hci/api/api/droptable"

// const CommunityView = () => {
//   const { id } = useParams()
//   const navigate = useNavigate()
//   const [community, setCommunity] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [showChatRoom, setShowChatRoom] = useState(false)
//   const [messages, setMessages] = useState([])
//   const [newMessage, setNewMessage] = useState("")
//   const [members, setMembers] = useState([])
//   const [studySets, setStudySets] = useState([])
//   const [selectedType, setSelectedType] = useState("flashcards")

//   const backgroundStyle = {
//     backgroundImage: `url(${background})`,
//     backgroundSize: "cover",
//     backgroundPosition: "center",
//     minHeight: "100vh",
//     minWidth: "1024px", // Ensure desktop minimum width
//   }

//   useEffect(() => {
//     fetchCommunityDetails()
//   }, [])

//   const fetchCommunityDetails = () => {
//     const token = sessionStorage.getItem("token")
//     if (!token) {
//       setError("You must be logged in to view this community")
//       setLoading(false)
//       return
//     }

//     // Fetch community details
//     fetch(`${API_BASE_URL}/groups/${id}`, {
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
//       .then((data) => {
//         // Transform API data to match our component's expected format
//         const communityData = {
//           id: data.id,
//           name: data.name || "Community",
//           description: data.description || "No description available",
//           likes: 0,
//           authorId: data.ownerID,
//         }

//         setCommunity(communityData)

//         // Fetch members
//         fetchMembers()

//         // Fetch messages
//         fetchMessages()

//         // Fetch study sets
//         fetchStudySets()

//         setLoading(false)
//       })
//       .catch((error) => {
//         console.error("Error fetching community:", error)
//         setError("Failed to load community details")
//         setLoading(false)
//       })
//   }

//   const fetchMembers = () => {
//     const token = sessionStorage.getItem("token")

//     fetch(`${API_BASE_URL}/group-members?groupID=${id}`, {
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
//       .then((data) => {
//         if (data && data[0] && data[0].length > 0) {
//           // Transform API data to match our component's expected format
//           const membersData = data[0].map((member) => ({
//             id: member.id,
//             name: member.userID.attributes?.username || member.userID.email?.split("@")[0] || "User",
//             isAdmin: member.userID === community?.authorId,
//           }))
//           setMembers(membersData)
//         } else {
//           // If no members returned, at least add the owner as admin
//           setMembers([
//             {
//               id: community?.authorId,
//               name: "Owner",
//               isAdmin: true,
//             },
//           ])
//         }
//       })
//       .catch((error) => {
//         console.error("Error fetching members:", error)
//         // Set default member if fetch fails
//         setMembers([
//           {
//             id: community?.authorId,
//             name: "Owner",
//             isAdmin: true,
//           },
//         ])
//       })
//   }

//   const fetchMessages = () => {
//     const token = sessionStorage.getItem("token")

//     fetch(`${API_BASE_URL}/posts?parentID=${id}&type=message`, {
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
//         if (result && result[0] && result[0].length > 0) {
//           // Transform API data to match our component's expected format
//           const messagesData = result[0].map((message) => ({
//             id: message.id,
//             sender: message.authorName || "User",
//             text: message.content || "No message content",
//             timestamp: message.createdAt || new Date().toISOString(),
//           }))
//           setMessages(messagesData)
//         } else {
//           // Set default welcome messages if none exist
//           const initialMessages = [
//             { id: 1, sender: "System", text: "Welcome to the community chat!", timestamp: new Date().toISOString() },
//           ]
//           setMessages(initialMessages)
//         }
//       })
//       .catch((error) => {
//         console.error("Error fetching messages:", error)
//         // Set default welcome message if fetch fails
//         const initialMessages = [
//           { id: 1, sender: "System", text: "Welcome to the community chat!", timestamp: new Date().toISOString() },
//         ]
//         setMessages(initialMessages)
//       })
//   }

//   const fetchStudySets = () => {
//     const token = sessionStorage.getItem("token")

//     console.log("Fetching study sets for community:", id) // Debug log

//     fetch(`${API_BASE_URL}/posts?groupID=${id}&type=study_set`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     })
//       .then((res) => {
//         if (!res.ok) {
//           console.error("Study sets response not OK:", res.status, res.statusText) // Debug log
//           throw new Error(`HTTP error! status: ${res.status}`)
//         }
//         return res.json()
//       })
//       .then((result) => {
//         console.log("Study sets response:", result) // Debug log
//         if (result && result[0] && result[0].length > 0) {
//           // Transform API data to match our component's expected format
//           const studySetsData = result[0]
//             .map((post) => {
//               try {
//                 const content = JSON.parse(post.content || "{}")
//                 const creatorName = post.author?.email?.split("@")[0] || "Anonymous"
//                 // Only include study sets that have a name in their content
//                 if (!content.name) {
//                   return null
//                 }
//                 return {
//                   id: post.id,
//                   title: content.name,
//                   description: `Created by ${creatorName}`,
//                   type: content.type || "flashcards",
//                   content: content.content, // Store the actual content for viewing
//                   fileId: post.fileId,
//                   likes: post._count?.reactions || 0,
//                 }
//               } catch (error) {
//                 console.error("Error parsing post content:", error) // Debug log
//                 return null
//               }
//             })
//             .filter(Boolean) // Remove null entries
          
//           console.log("Transformed study sets:", studySetsData) // Debug log
//           setStudySets(studySetsData)
//         } else {
//           console.log("No study sets found") // Debug log
//           setStudySets([])
//         }
//       })
//       .catch((error) => {
//         console.error("Error fetching study sets:", error)
//         console.error("Error details:", error.message) // Debug log
//         setStudySets([])
//       })
//   }

//   const handleBack = () => {
//     navigate("/community")
//   }

//   const handleAddStudyMaterial = () => {
//     const token = sessionStorage.getItem("token")
//     const user = JSON.parse(sessionStorage.getItem("user"))

//     if (!token || !user) {
//       alert("You must be logged in to add study material")
//       return
//     }

//     const studySetData = {
//       title: "New Study Set",
//       content: "Edit this study set",
//       type: "study_set",
//       groupID: id,
//       authorID: user.id,
//     }

//     fetch(`${API_BASE_URL}/posts`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(studySetData),
//     })
//       .then((res) => {
//         if (!res.ok) {
//           throw new Error(`HTTP error! status: ${res.status}`)
//         }
//         return res.json()
//       })
//       .then((result) => {
//         // Add the new study set to the state
//         const newStudySet = {
//           id: result.id,
//           title: result.title || "New Study Set",
//           description: result.content || "Edit this study set",
//           type: result.type || "flashcards",
//           fileId: result.fileId,
//           likes: 0,
//         }

//         setStudySets([...studySets, newStudySet])
//       })
//       .catch((error) => {
//         console.error("Error creating study set:", error)
//         alert("Failed to create study set. Please try again.")
//       })
//   }

//   const handleAddMember = () => {
//     const token = sessionStorage.getItem("token")

//     if (!token) {
//       alert("You must be logged in to add a member")
//       return
//     }

//     // In a real implementation, you would show a modal to select a user
//     // For now, we'll just simulate adding a member with a prompt
//     const userEmail = prompt("Enter the email of the user you want to add:")

//     if (!userEmail) return

//     // First, search for the user by email
//     fetch(`${API_BASE_URL}/users?email=${userEmail}`, {
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
//         if (result && result[0] && result[0].length > 0) {
//           const userId = result[0][0].id

//           // Now add the user to the group using the correct endpoint
//           return fetch(`${API_BASE_URL}/group-members`, {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//             body: JSON.stringify({
//               userID: userId,
//               groupID: id,
//             }),
//           })
//         } else {
//           throw new Error("User not found")
//         }
//       })
//       .then((res) => {
//         if (!res.ok) {
//           throw new Error(`HTTP error! status: ${res.status}`)
//         }
//         return res.json()
//       })
//       .then(() => {
//         // Refresh the members list
//         fetchMembers()
//         alert("Member added successfully!")
//       })
//       .catch((error) => {
//         console.error("Error adding member:", error)
//         alert("Failed to add member. Please check the email and try again.")
//       })
//   }

//   const handleViewStudySet = (studySet) => {
//     // Navigate to a new route for viewing the study set with state
//     navigate(`/community/${id}/study-set/${studySet.id}`, {
//       state: {
//         studySet: {
//           ...studySet,
//           content: studySet.content // Pass the actual content
//         }
//       }
//     })
//   }

//   const handleDeleteStudySet = (id) => {
//     const token = sessionStorage.getItem("token")

//     if (!token) {
//       alert("You must be logged in to delete a study set")
//       return
//     }

//     fetch(`${API_BASE_URL}/posts/${id}`, {
//       method: "DELETE",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     })
//       .then((res) => {
//         if (!res.ok) {
//           throw new Error(`HTTP error! status: ${res.status}`)
//         }

//         // Remove the study set from state
//         const updatedStudySets = studySets.filter((set) => set.id !== id)
//         setStudySets(updatedStudySets)
//       })
//       .catch((error) => {
//         console.error("Error deleting study set:", error)
//         alert("Failed to delete study set. Please try again.")
//       })
//   }

//   const handleShareStudySet = (id) => {
//     console.log("Sharing study set with id:", id)
//   }

//   const handleOpenChatRoom = () => {
//     setShowChatRoom(true)
//     // Initialize with some sample messages
//     if (!messages.length) {
//       const initialMessages = [
//         { id: 1, sender: "You", text: "Hello everyone!", timestamp: new Date().toISOString() },
//         { id: 2, sender: "System", text: "Welcome to the community chat!", timestamp: new Date().toISOString() },
//       ]
//       setMessages(initialMessages)
//     }
//   }

//   const handleBackToCommunity = () => {
//     setShowChatRoom(false)
//   }

//   const handleSendMessage = () => {
//     if (!newMessage.trim()) return

//     const token = sessionStorage.getItem("token")
//     const user = JSON.parse(sessionStorage.getItem("user"))

//     if (!token || !user) {
//       alert("You must be logged in to send a message")
//       return
//     }

//     const messageData = {
//       content: newMessage,
//       authorID: user.id,
//       parentID: id,
//       type: "message",
//     }

//     // Optimistically add the message to the UI
//     const optimisticMessage = {
//       id: Date.now(),
//       sender: "You",
//       text: newMessage,
//       timestamp: new Date().toISOString(),
//     }

//     setMessages([...messages, optimisticMessage])
//     setNewMessage("") // Clear input immediately

//     fetch(`${API_BASE_URL}/posts`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(messageData),
//     })
//       .then((res) => {
//         if (!res.ok) {
//           throw new Error(`HTTP error! status: ${res.status}`)
//         }
//         return res.json()
//       })
//       .then((result) => {
//         // Message sent successfully, we could update the optimistic message with the real ID if needed
//         console.log("Message sent successfully:", result)
//       })
//       .catch((error) => {
//         console.error("Error sending message:", error)
//         alert("Failed to send message. Please try again.")

//         // Remove the optimistic message on error
//         setMessages(messages.filter((msg) => msg.id !== optimisticMessage.id))
//       })
//   }

//   // Helper function to get a random image when thumbnailURL is not available
//   const getRandomImage = () => {
//     const images = [fish1, fish2, fish3]
//     return images[Math.floor(Math.random() * images.length)]
//   }

//   // Chat Room Component
//   const ChatRoom = () => {
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
//         {/* <NavBar /> */}
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
//             {members.map((member, index) => (
//               <div key={member.id || `member-${index}`} className="flex items-center">
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
//               messages.map((message, index) => (
//                 <div
//                   key={message.id || `message-${index}`}
//                   className={`mb-4 ${message.sender === "You" ? "text-right" : ""}`}
//                 >
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

//   if (loading) {
//     return (
//       <Box
//         sx={{
//           minHeight: "100vh",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           backgroundImage: `url(${background})`,
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//         }}
//       >
//         <CircularProgress sx={{ color: "#1D6EF1" }} />
//       </Box>
//     )
//   }

//   if (error) {
//     return (
//       <Box
//         sx={{
//           minHeight: "100vh",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           backgroundImage: `url(${background})`,
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//         }}
//       >
//         <Typography
//           color="error"
//           sx={{
//             fontFamily: "SourGummy, sans-serif",
//             backgroundColor: "white",
//             padding: 4,
//             borderRadius: 2,
//           }}
//         >
//           {error}
//         </Typography>
//       </Box>
//     )
//   }

//   if (showChatRoom) {
//     return <ChatRoom />
//   }

//   return (
//     <div className="min-h-screen flex" style={backgroundStyle}>
//       <GlobalStyle />
//       <TopBar />
//       {/* <NavBar /> */}
//       <div className="flex-1 p-6 pl-[80px] md:pl-[272px] pt-24">
//         <div className="flex items-center mb-8">
//           <button className="text-white mr-3 text-2xl" onClick={handleBack} style={fontStyle}>
//             ←
//           </button>
//           <h1 className="text-4xl font-bold text-white" style={fontStyle}>
//             {community?.name}
//           </h1>
//         </div>

//         <div className="mb-12">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center gap-4">
//               <h2 className="text-2xl font-bold text-white" style={fontStyle}>
//                 Study Sets
//               </h2>
//               <select
//                 value={selectedType}
//                 onChange={(e) => setSelectedType(e.target.value)}
//                 className="bg-white rounded p-2 text-black"
//                 style={fontStyle}
//               >
//                 <option value="flashcards">Flashcards</option>
//                 <option value="fill_in_blank">Fill in the Blank</option>
//                 <option value="matching">Matching</option>
//                 <option value="multiple_choice">Multiple Choice</option>
//               </select>
//             </div>
//           </div>

//           {studySets.length > 0 ? (
//             studySets
//               .filter((set) => set.type === selectedType)
//               .map((studySet) => (
//                 <div key={studySet.id} className="bg-white rounded p-4 mb-4">
//                   <div className="flex items-start">
//                     <div className="bg-red-500 rounded-full w-12 h-12 flex items-center justify-center text-white mr-4">
//                       <span style={fontStyle}>{studySet.title.charAt(0)}</span>
//                     </div>
//                     <div className="flex-1">
//                       <h2 
//                         className="text-xl font-bold text-blue-500 cursor-pointer" 
//                         style={fontStyle}
//                         onClick={() => handleViewStudySet(studySet)}
//                       >
//                         {studySet.title}
//                       </h2>
//                       <p className="text-sm text-gray-600" style={fontStyle}>
//                         {studySet.description}
//                       </p>
//                       <div className="flex justify-between mt-2">
//                         <div className="flex items-center">
//                           <button className="flex items-center text-gray-500 mr-4">
//                             <span className="mr-1">❤️</span>
//                             <span style={fontStyle}>{studySet.likes}</span>
//                           </button>
//                         </div>
//                         <div className="flex items-center">
//                           <button 
//                             className="text-blue-500 mr-2" 
//                             onClick={() => handleShareStudySet(studySet.id)}
//                           >
//                             <span style={fontStyle}>Share</span>
//                           </button>
//                           <button 
//                             className="text-red-500" 
//                             onClick={() => handleDeleteStudySet(studySet.id)}
//                           >
//                             <span className="text-lg">×</span>
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))
//           ) : (
//             <div className="bg-white bg-opacity-75 rounded p-4 text-center">
//               <p style={fontStyle}>No study sets yet. Click "Add Study Material" to create one.</p>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="w-64 bg-white p-6 fixed right-0 top-20 bottom-0 overflow-y-auto">
//         <div className="flex flex-col mb-6">
//           <button
//             className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mb-4"
//             onClick={handleAddStudyMaterial}
//           >
//             <span style={fontStyle}>Add Study Material</span>
//           </button>
//           <button
//             className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mb-4"
//             onClick={handleOpenChatRoom}
//           >
//             <span style={fontStyle}>Message Members</span>
//           </button>
//         </div>

//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-xl font-bold" style={fontStyle}>
//             Members
//           </h2>
//           <button
//             className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full flex items-center justify-center"
//             onClick={handleAddMember}
//             style={{ width: "30px", height: "30px" }}
//           >
//             <span>+</span>
//           </button>
//         </div>

//         <div className="space-y-4">
//           {members.length > 0 ? (
//             members.map((member, index) => (
//               <div key={member.id || `member-${index}`} className="flex items-center justify-between">
//                 <span className="text-black" style={fontStyle}>
//                   {member.name}
//                 </span>
//                 {member.isAdmin && (
//                   <span className="text-xs bg-gray-200 px-2 py-1 rounded text-black" style={fontStyle}>
//                     Admin
//                   </span>
//                 )}
//               </div>
//             ))
//           ) : (
//             <p className="text-gray-500" style={fontStyle}>
//               No members yet.
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default CommunityView

"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Box, Typography, CircularProgress } from "@mui/material"
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

    console.log("Fetching study sets for community:", id) // Debug log

    fetch(`${API_BASE_URL}/posts?groupID=${id}&type=study_set`, {
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
        console.log("Study sets response:", result) // Debug log
        if (result && result[0] && result[0].length > 0) {
          // Transform API data to match our component's expected format
          const studySetsData = result[0]
            .map((post) => {
              try {
                const content = JSON.parse(post.content || "{}")
                const creatorName = post.author?.email?.split("@")[0] || "Anonymous"
                // Only include study sets that have a name in their content
                if (!content.name) {
                  return null
                }
                return {
                  id: post.id,
                  title: content.name,
                  description: `Created by ${creatorName}`,
                  type: content.type || "flashcards",
                  content: content.content, // Store the actual content for viewing
                  fileId: post.fileId,
                  likes: post._count?.reactions || 0,
                }
              } catch (error) {
                console.error("Error parsing post content:", error) // Debug log
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

  const handleAddStudyMaterial = () => {
    const token = sessionStorage.getItem("token")
    const user = JSON.parse(sessionStorage.getItem("user"))

    if (!token || !user) {
      alert("You must be logged in to add study material")
      return
    }

    const studySetData = {
      title: "New Study Set",
      content: "Edit this study set",
      type: "study_set",
      groupID: id,
      authorID: user.id,
    }

    fetch(`${API_BASE_URL}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(studySetData),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((result) => {
        // Add the new study set to the state
        const newStudySet = {
          id: result.id,
          title: result.title || "New Study Set",
          description: result.content || "Edit this study set",
          type: result.type || "flashcards",
          fileId: result.fileId,
          likes: 0,
        }

        setStudySets([...studySets, newStudySet])
      })
      .catch((error) => {
        console.error("Error creating study set:", error)
        alert("Failed to create study set. Please try again.")
      })
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
          content: studySet.content // Pass the actual content
        }
      }
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
                <option value="flashcards">Flashcards</option>
                <option value="fill_in_blank">Fill in the Blank</option>
                <option value="matching">Matching</option>
                <option value="multiple_choice">Multiple Choice</option>
              </select>
            </div>
          </div>

          {studySets.length > 0 ? (
            studySets
              .filter((set) => set.type === selectedType)
              .map((studySet) => (
                <div key={studySet.id} className="bg-white rounded p-4 mb-4">
                  <div className="flex items-start">
                    <div className="bg-red-500 rounded-full w-12 h-12 flex items-center justify-center text-white mr-4">
                      <span style={fontStyle}>{studySet.title.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
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
                      <div className="flex justify-between mt-2">
                        <div className="flex items-center">
                          <button className="flex items-center text-gray-500 mr-4">
                            <span className="mr-1">❤️</span>
                            <span style={fontStyle}>{studySet.likes}</span>
                          </button>
                        </div>
                        <div className="flex items-center">
                          <button 
                            className="text-blue-500 mr-2" 
                            onClick={() => handleShareStudySet(studySet.id)}
                          >
                            <span style={fontStyle}>Share</span>
                          </button>
                          <button 
                            className="text-red-500" 
                            onClick={() => handleDeleteStudySet(studySet.id)}
                          >
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
              <p style={fontStyle}>No study sets yet. Click "Add Study Material" to create one.</p>
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
    </div>
  )
}

export default CommunityView

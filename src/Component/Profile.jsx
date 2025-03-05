// "use client"

// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";  // Import useNavigate for redirecting
// import { Home, MessageSquare, Upload, Users, Settings, User } from "lucide-react";
// import background from "../assets/image3.png"; // Use the same background as HomePage

// export default function Personal_Account() {
//   const [profilePic, setProfilePic] = useState("");
//   const [username, setUsername] = useState("");
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const navigate = useNavigate();  // Initialize the navigate hook

//   useEffect(() => {
//     // Get profile picture and username from sessionStorage
//     const storedPic = sessionStorage.getItem("profilePicture");
//     const storedUsername = sessionStorage.getItem("username");
//     const storedFirstName = sessionStorage.getItem("firstname");
//     const storedLastName = sessionStorage.getItem("lastname");

//     if (storedPic) {
//       setProfilePic(storedPic);
//     }
//     if (storedUsername) setUsername(storedUsername);
//     if (storedFirstName) setFirstName(storedFirstName);
//     if (storedLastName) setLastName(storedLastName);
//   }, []);

//   const handleUploadClick = () => {
//     navigate('/upload');  // Redirect to /upload
//   };

//   const handleCommunityClick = () => {
//     navigate('/community');  // Redirect to /community
//   };

//   return (
//     <div 
//       className="min-h-screen text-white ml-[30px]" 
//       style={{
//         backgroundColor: "#1b1b1b", // Matches HomePage's background color
//         backgroundImage: `url(${background})`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundRepeat: "no-repeat",
//         fontFamily: "SourGummy, sans-serif", // Apply the same font
//       }}
//     >
//       {/* Profile Section */}
//       <div className="flex justify-center items-center flex-col pt-8">
//         <div className="bg-opacity-60 bg-black rounded-lg p-6 text-white flex flex-col items-center shadow-xl">
//           <img
//             src={profilePic || "/placeholder.svg"}
//             alt="Profile"
//             className="w-24 h-24 rounded-full border-4 border-cyan-400 mb-4"
//           />
//           <h2 className="text-xl font-bold">{firstName && lastName ? `${firstName} ${lastName}` : username || "User"}</h2>
//         </div>
//       </div>

//       {/* Grid Layout */}
//       <div className="grid md:grid-cols-2 gap-4 p-4">
//         {/* Uploaded Materials */}
//         <div className="bg-opacity-60 bg-black rounded-lg p-6 text-white shadow-xl">
//           <h2 className="text-xl font-bold mb-4">Uploaded Materials</h2>
//           <p>Currently no uploaded materials</p>
//           <button 
//             onClick={handleUploadClick} 
//             className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
//           >
//             Upload Now!
//           </button>
//         </div>

//         {/* Study Groups */}
//         <div className="bg-opacity-60 bg-black rounded-lg p-6 text-white shadow-xl">
//           <h2 className="text-xl font-bold mb-4">Study Groups</h2>
//           <p>Currently in no study groups</p>
//           <button 
//             onClick={handleCommunityClick} 
//             className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
//           >
//             Join a Community
//           </button>
//         </div>

//         {/* Achievements (Stretched to full width) */}
//         <div className="col-span-2 bg-opacity-60 bg-black rounded-lg p-6 text-white shadow-xl">
//           <h2 className="text-xl font-bold mb-4">Achievements</h2>
//           <p>Currently no achievements</p>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client"

import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import background from "../assets/image3.png"

export default function Personal_Account() {
  const [profilePic, setProfilePic] = useState("")
  const [username, setUsername] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Get profile picture and username from sessionStorage
    const storedPic = sessionStorage.getItem("profilePicture")
    const storedUsername = sessionStorage.getItem("username")
    const storedFirstName = sessionStorage.getItem("firstname")
    const storedLastName = sessionStorage.getItem("lastname")

    if (storedPic) {
      setProfilePic(storedPic)
    }
    if (storedUsername) setUsername(storedUsername)
    if (storedFirstName) setFirstName(storedFirstName)
    if (storedLastName) setLastName(storedLastName)
  }, [])

  const handleUploadClick = () => {
    navigate("/upload")
  }

  const handleCommunityClick = () => {
    navigate("/community")
  }

  const handleProfilePicClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result
        setProfilePic(base64String)
        sessionStorage.setItem("profilePicture", base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div
      className="min-h-screen text-white"
      style={{
        backgroundColor: "#1b1b1b",
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        fontFamily: "SourGummy, sans-serif",
      }}
    >
      {/* Profile Section */}
      <div className="flex justify-center items-center flex-col pt-8">
        <div className="bg-opacity-60 bg-black rounded-lg p-6 text-white flex flex-col items-center shadow-xl">
          <div className="relative cursor-pointer group" onClick={handleProfilePicClick}>
            <img
              src={profilePic || "/placeholder.svg?height=96&width=96"}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-cyan-400 mb-4 object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-sm">Change</span>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>
          <h2 className="text-xl font-bold">
            {firstName && lastName ? `${firstName} ${lastName}` : username || "User"}
          </h2>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid md:grid-cols-2 gap-4 p-4">
        {/* Uploaded Materials */}
        <div className="bg-opacity-60 bg-black rounded-lg p-6 text-white shadow-xl">
          <h2 className="text-xl font-bold mb-4">Uploaded Materials</h2>
          <p>Currently no uploaded materials</p>
          <button onClick={handleUploadClick} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md">
            Upload Now!
          </button>
        </div>

        {/* Study Groups */}
        <div className="bg-opacity-60 bg-black rounded-lg p-6 text-white shadow-xl">
          <h2 className="text-xl font-bold mb-4">Study Groups</h2>
          <p>Currently in no study groups</p>
          <button onClick={handleCommunityClick} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md">
            Join a Community
          </button>
        </div>

        {/* Achievements (Stretched to full width) */}
        <div className="col-span-2 bg-opacity-60 bg-black rounded-lg p-6 text-white shadow-xl">
          <h2 className="text-xl font-bold mb-4">Achievements</h2>
          <p>Currently no achievements</p>
        </div>
      </div>
    </div>
  )
}


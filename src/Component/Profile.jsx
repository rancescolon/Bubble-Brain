"use client"

import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import background from "../assets/image3.png"

const API_BASE_URL = "https://webdev.cse.buffalo.edu/hci/api/api/droptable"

export default function Personal_Account() {
  const [profilePic, setProfilePic] = useState("")
  const [username, setUsername] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const [studyStats, setStudyStats] = useState({
    totalTime: 0,
    recentSets: [],
    loading: true,
    error: null
  })

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

    fetchStudyStats()
  }, [])

  const fetchStudyStats = async () => {
    try {
      const token = sessionStorage.getItem("token")
      const userStr = sessionStorage.getItem("user")
      console.log("Raw user string from session:", userStr)
      console.log("Token exists:", !!token)

      if (!token || !userStr) {
        console.error("Missing token or user data")
        setStudyStats(prev => ({ ...prev, loading: false, error: "Please log in to view study statistics" }))
        return
      }

      // Handle both object and direct ID formats
      let userId
      try {
        // First try to parse as JSON in case it's an object
        const parsed = JSON.parse(userStr)
        // If parsed is an object with id property, use that
        if (typeof parsed === 'object' && parsed !== null && parsed.id) {
          userId = parsed.id
        } else if (typeof parsed === 'number' || !isNaN(Number(parsed))) {
          // If parsed is a number or can be converted to a number, use it directly
          userId = Number(parsed)
        } else {
          throw new Error("Invalid user data format")
        }
        console.log("Extracted user ID:", userId)
      } catch (e) {
        // If JSON.parse fails, check if the raw string is a number
        if (!isNaN(Number(userStr))) {
          userId = Number(userStr)
          console.log("Using raw user ID:", userId)
        } else {
          console.error("Error parsing user data:", e)
          setStudyStats(prev => ({ ...prev, loading: false, error: "Invalid user data" }))
          return
        }
      }

      // First fetch all posts for this user
      const postsUrl = `${API_BASE_URL}/posts?authorID=${userId}`
      console.log("Making posts API request to:", postsUrl)

      const postsResponse = await fetch(postsUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (!postsResponse.ok) {
        throw new Error(`Failed to fetch posts data: ${await postsResponse.text()}`)
      }

      const postsData = await postsResponse.json()
      console.log("All posts response:", postsData)

      // Filter for study time posts
      const studyTimeLogs = postsData[0]?.filter(post => {
        console.log("Checking post for study time:", post)
        
        // Check postType first
        if (post.postType === 'study_time') {
          console.log("Found study time post by postType:", post.id)
          return true
        }

        // Then check content
        try {
          const content = JSON.parse(post.content || '{}')
          console.log("Parsed content for post", post.id, ":", content)
          
          if (content.type === 'study_time') {
            console.log("Found study time post by content type:", post.id)
            return true
          }
          
          // Also check attributes
          if (post.attributes && post.attributes.type === 'study_time') {
            console.log("Found study time post by attributes:", post.id)
            return true
          }
          
          return false
        } catch (e) {
          console.warn("Error parsing post content:", post.id, e)
          return false
        }
      }) || []

      console.log("Filtered study time logs:", studyTimeLogs)

      // Calculate total study time and organize by study set
      let totalTime = 0
      const setStats = new Map()

      studyTimeLogs.forEach(log => {
        try {
          if (!log.content) {
            console.warn("Log missing content:", log)
            return
          }

          let content
          try {
            content = JSON.parse(log.content)
            console.log("Processing study time log:", content)
          } catch (e) {
            console.error("Error parsing log content:", e)
            return
          }

          // Check for study time data in both content and attributes
          const duration = content.duration || (log.attributes && log.attributes.duration)
          const studySetId = content.studySetId || (log.attributes && log.attributes.studySetId)
          const studySetTitle = content.studySetTitle || content.name || "Unknown Set"

          if (!duration) {
            console.warn("Log missing duration:", content)
            return
          }

          console.log("Adding duration:", duration, "for set:", studySetTitle)
          totalTime += duration

          if (studySetId) {
            const key = studySetId.toString()
            if (!setStats.has(key)) {
              setStats.set(key, {
                id: studySetId,
                title: studySetTitle,
                totalTime: 0,
                lastStudied: content.timestamp || new Date().toISOString()
              })
            }

            const stats = setStats.get(key)
            stats.totalTime += duration
            if (content.timestamp && (!stats.lastStudied || new Date(content.timestamp) > new Date(stats.lastStudied))) {
              stats.lastStudied = content.timestamp
            }
          }
        } catch (parseError) {
          console.error("Error processing log:", parseError, log)
        }
      })

      // Get recent sets sorted by last studied time
      const recentSets = Array.from(setStats.values())
        .sort((a, b) => new Date(b.lastStudied) - new Date(a.lastStudied))
        .slice(0, 3)

      console.log("Final processed stats:", { totalTime, recentSets })

      setStudyStats({
        totalTime,
        recentSets,
        loading: false,
        error: null
      })
    } catch (error) {
      console.error("Error in fetchStudyStats:", error)
      setStudyStats(prev => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to load study statistics"
      }))
    }
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`
    }
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${remainingSeconds}s`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

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

        {/* Study Statistics */}
        <div className="bg-opacity-60 bg-black rounded-lg p-6 text-white shadow-xl">
          <h2 className="text-xl font-bold mb-4">Study Statistics</h2>
          {studyStats.loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : studyStats.error ? (
            <p className="text-red-400">{studyStats.error}</p>
          ) : (
            <div>
              <div className="mb-6">
                <p className="text-lg mb-2">Total Study Time</p>
                <p className="text-3xl font-bold text-cyan-400">{formatTime(studyStats.totalTime)}</p>
              </div>
              
              {studyStats.recentSets.length > 0 && (
                <div>
                  <p className="text-lg mb-2">Recently Studied Sets</p>
                  <div className="space-y-3">
                    {studyStats.recentSets.map(set => (
                      <div key={set.id} className="bg-white bg-opacity-10 rounded-lg p-3">
                        <p className="font-semibold text-cyan-400">{set.title}</p>
                        <div className="flex justify-between text-sm mt-1">
                          <span>Time: {formatTime(set.totalTime)}</span>
                          <span>Last: {formatDate(set.lastStudied)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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


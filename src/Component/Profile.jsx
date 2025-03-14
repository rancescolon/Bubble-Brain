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
  const [uploadedStudySets, setUploadedStudySets] = useState([])
  const [myCommunities, setMyCommunities] = useState([])
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const [studyStats, setStudyStats] = useState({
    totalTime: 0,
    recentSets: [],
    loading: true,
    error: null
  })

  useEffect(() => {
    const storedPic = sessionStorage.getItem("profilePicture")
    const storedUsername = sessionStorage.getItem("username")
    const storedFirstName = sessionStorage.getItem("firstname")
    const storedLastName = sessionStorage.getItem("lastname")

    if (storedPic) setProfilePic(storedPic)
    if (storedUsername) setUsername(storedUsername)
    if (storedFirstName) setFirstName(storedFirstName)
    if (storedLastName) setLastName(storedLastName)

    fetchStudyStats()
    fetchUserStudySets()
    fetchUserCommunities()
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

      let userId
      try {
        const parsed = JSON.parse(userStr)
        if (typeof parsed === 'object' && parsed !== null && parsed.id) {
          userId = parsed.id
        } else if (typeof parsed === 'number' || !isNaN(Number(parsed))) {
          userId = Number(parsed)
        } else {
          throw new Error("Invalid user data format")
        }
        console.log("Extracted user ID:", userId)
      } catch (e) {
        if (!isNaN(Number(userStr))) {
          userId = Number(userStr)
          console.log("Using raw user ID:", userId)
        } else {
          console.error("Error parsing user data:", e)
          setStudyStats(prev => ({ ...prev, loading: false, error: "Invalid user data" }))
          return
        }
      }

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

      const studyTimeLogs = postsData[0]?.filter(post => {
        console.log("Checking post for study time:", post)
        
        if (post.postType === 'study_time') {
          console.log("Found study time post by postType:", post.id)
          return true
        }

        try {
          const content = JSON.parse(post.content || '{}')
          console.log("Parsed content for post", post.id, ":", content)
          
          if (content.type === 'study_time') {
            console.log("Found study time post by content type:", post.id)
            return true
          }
          
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

  const fetchUserStudySets = async () => {
    try {
      const token = sessionStorage.getItem("token")
      const userId = sessionStorage.getItem("user")
      if (!userId) return
      const response = await fetch(`${API_BASE_URL}/posts?type=study_set&authorID=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to fetch study sets")
      const data = await response.json()
      const parsedStudySets = data.map((set) => {
        let studySetContent = {}
        try {
          studySetContent = JSON.parse(set.content)
        } catch {}
        return { id: set.id, name: studySetContent?.name || "Unnamed Study Set", communityId: set.attributes?.communityId || null }
      })
      setUploadedStudySets(parsedStudySets)
    } catch (error) {
      console.error("Error fetching study sets:", error)
    }
  }

  const fetchUserCommunities = async () => {
    try {
      const token = sessionStorage.getItem("token")
      if (!token) return
      const response = await fetch(`${API_BASE_URL}/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to fetch communities")
      const data = await response.json()
      const user = JSON.parse(sessionStorage.getItem("user"))
      if (user) {
        const userCommunities = data[0].filter((group) => group.ownerID === user.id)
        setMyCommunities(userCommunities)
      }
    } catch (error) {
      console.error("Error fetching communities:", error)
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
        fontFamily: "SourGummy, sans-serif",
      }}
    >
      {/* Profile Section */}
      <div className="flex justify-center items-center flex-col pt-8">
        <div className="bg-white rounded p-6 text-black flex flex-col items-center shadow-xl">
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

      <div className="grid md:grid-cols-2 gap-4 p-4">
        {/* Upload Study Set */}
        <div className="bg-white rounded p-6 text-black shadow-xl">
          <h2 className="text-xl font-bold mb-4">Upload Study Set</h2>
          <button onClick={handleUploadClick} className="px-6 py-3 bg-blue-500 text-white rounded-lg text-lg">
            Upload Now!
          </button>
        </div>

        {/* Study Groups */}
        <div className="bg-white rounded p-6 text-black shadow-xl">
          <h2 className="text-xl font-bold mb-4">Study Groups</h2>
          <p>Currently in no study groups</p>
          <button onClick={handleCommunityClick} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md">
            Join a Community
          </button>
        </div>

        {/* Study Statistics */}
        <div className="bg-white rounded p-6 text-black shadow-xl">
          <h2 className="text-xl font-bold mb-4">Study Statistics</h2>
          {studyStats.loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
            </div>
          ) : studyStats.error ? (
            <p className="text-red-500">{studyStats.error}</p>
          ) : (
            <div>
              <div className="mb-6">
                <p className="text-lg mb-2">Total Study Time</p>
                <p className="text-3xl font-bold text-blue-500">{formatTime(studyStats.totalTime)}</p>
              </div>
              
              {studyStats.recentSets.length > 0 && (
                <div>
                  <p className="text-lg mb-2">Recently Studied Sets</p>
                  <div className="space-y-3">
                    {studyStats.recentSets.map(set => (
                      <div
                        key={set.id}
                        className="bg-[#C5EDFD] p-3 rounded-lg cursor-pointer hover:bg-[#97C7F1] transition-colors"
                      >
                        <p className="font-semibold text-[#1D1D20]">{set.title}</p>
                        <div className="flex justify-between text-sm mt-1 text-[#1D1D20]">
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

        {/* Communities Section */}
        <div className="bg-white rounded p-6 text-black shadow-xl">
          <h2 className="text-xl font-bold mb-4">Your Communities</h2>
          <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
            {myCommunities.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {myCommunities.map((community) => (
                  <div key={community.id} className="bg-[#C5EDFD] p-2 rounded-lg cursor-pointer hover:bg-[#97C7F1] transition-colors flex items-center" onClick={() => navigate(`/community/view/${community.id}`)}>
                    <div className="bg-[#1D6EF1] rounded-full w-6 h-6 flex items-center justify-center text-white mr-2">
                      <span>{community.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-[#1D1D20] font-medium overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                      {community.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-100 p-3 rounded-lg text-center">
                <p className="text-gray-600 text-sm">No communities yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Achievements Section */}
        <div className="col-span-2 bg-white rounded-lg p-6 text-black shadow-xl">
          <h2 className="text-xl font-bold text-center">Achievements</h2>
          <p className="text-center text-gray-600 mt-2">No achievements yet</p>
        </div>
      </div>
    </div>
  )
}
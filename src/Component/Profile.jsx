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

  useEffect(() => {
    const storedPic = sessionStorage.getItem("profilePicture")
    const storedUsername = sessionStorage.getItem("username")
    const storedFirstName = sessionStorage.getItem("firstname")
    const storedLastName = sessionStorage.getItem("lastname")

    if (storedPic) setProfilePic(storedPic)
    if (storedUsername) setUsername(storedUsername)
    if (storedFirstName) setFirstName(storedFirstName)
    if (storedLastName) setLastName(storedLastName)

    fetchUserStudySets()
    fetchUserCommunities()
  }, [])

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
      <div className="flex justify-center items-center flex-col pt-8">
        <div className="bg-white rounded-lg p-6 text-black shadow-xl">
          <img src={profilePic || "/placeholder.svg?height=96&width=96"} alt="Profile" className="w-24 h-24 rounded-full border-4 border-cyan-400 mb-4 object-cover" />
          <h2 className="text-xl font-bold">{firstName && lastName ? `${firstName} ${lastName}` : username || "User"}</h2>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4 p-4">
        <div className="bg-white rounded-lg p-6 text-black shadow-xl">
          <h2 className="text-xl font-bold mb-4">Upload Study Set</h2>
          <button onClick={() => navigate("/upload")} className="px-6 py-3 bg-blue-500 text-white rounded-lg text-lg">
            Upload Now!
          </button>
        </div>
        <div className="bg-white rounded-lg p-6 text-black shadow-xl">
          <h2 className="text-xl font-bold mb-4">Your Communities</h2>
          <div className="max-h-40 overflow-y-auto border border-gray-600 rounded-lg p-2">
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
              <div className="bg-white p-3 rounded-lg text-center">
                <p className="text-[#1D1D20] text-sm">No communities yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg p-6 text-black shadow-xl">
        <h2 className="text-xl font-bold text-center">Achievements</h2>
        <p className="text-center text-gray-300 mt-2">No achievements yet</p>
      </div>
    </div>
  )
}

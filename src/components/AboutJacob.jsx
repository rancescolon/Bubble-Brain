"use client"

import { Link } from "react-router-dom"
import { Home, MessageSquare, Upload, Users, Settings, User } from "lucide-react"
import profilePic from '../assets/jacobmie.jpg';
export default function AboutMe() {
  return (
    <div className="min-h-screen bg-black text-white ml-[90px]">
      {" "}
      {/* Added margin-left to account for sidebar */}
      {/* Header - About Me */}
      <div className="p-4">
        <h1 className="text-cyan-400 text-xl mb-4">ABOUT ME</h1>
        <div className="bg-white rounded-lg p-6 text-black">
          <div className="flex items-center gap-4">
            <img
              src={profilePic || "/placeholder.svg"}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-cyan-400"
            />
            <div>
              <h2 className="text-xl font-bold">Jacob Mieszawski</h2>
              <p className="text-gray-600">
              "Hi, I'm Jacob and I'm a senior studying Computer Science. I aspire to be a full stack developer in the future, and my favorite dog breed are Bernese Mountain Dogs just incase you were curious "
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Grid Layout */}
      <div className="grid md:grid-cols-2 gap-4 p-4">
        {/* Uploaded Materials */}
        <div className="bg-white rounded-lg p-6 text-black">
          <h2 className="text-xl font-bold mb-4">Uploaded Materials</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-2">Quantum Mechanics Notes</p>
              <p className="mb-2">Biology Diagrams</p>
              <p>Organic Chemistry Guide</p>
            </div>
            <div>
              <p className="mb-2">Periodic Table Notes</p>
              <p className="mb-2">Algebra II Notes</p>
              <p>Calculus Notes</p>
            </div>
          </div>
        </div>

        {/* Study Groups */}
        <div className="bg-white rounded-lg p-6 text-black">
          <h2 className="text-xl font-bold mb-4">Study Groups</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-2">Quantum Computing</p>
              <p className="mb-2">Systems Programming</p>
              <p>Psychology</p>
            </div>
            <div>
              <p className="mb-2">Geometry</p>
              <p className="mb-2">Forensics</p>
              <p>World History</p>
            </div>
          </div>
        </div>

        {/* Favorite Videos */}
        <div className="bg-white rounded-lg p-6 text-black">
          <h2 className="text-xl font-bold mb-4">Favorite Videos</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-2">Minecraft Parkour</p>
              <p className="mb-2">Subway Surfers</p>
              <p>Skibidi Toilet</p>
            </div>
            <div>
              <p className="mb-2">Soap Cutting</p>
              <p className="mb-2">Baby Gronk</p>
              <p>Fanum Tax</p>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-lg p-6 text-black">
          <h2 className="text-xl font-bold mb-4">Achievements</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧪</span>
              <div>
                <p className="font-bold">IQ +1</p>
                <p className="text-blue-600 text-sm">Score 100% on a study set</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎮</span>
              <div>
                <p className="font-bold">Gigachad Grindset</p>
                <p className="text-blue-600 text-sm">Study every day for a single week</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧠</span>
              <div>
                <p className="font-bold">Collective Brain-cell</p>
                <p className="text-blue-600 text-sm">Join your first study group</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-[100px] right-0 bg-black border-t border-gray-800">
        {" "}
        {/* Adjusted left position */}
        <div className="flex justify-around p-4">
          <Link to="/" className="flex flex-col items-center text-cyan-400">
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </Link>
          <Link to="/chat" className="flex flex-col items-center text-cyan-400">
            <MessageSquare className="w-6 h-6" />
            <span className="text-xs">Chat</span>
          </Link>
          <Link to="/upload" className="flex flex-col items-center text-cyan-400">
            <Upload className="w-6 h-6" />
            <span className="text-xs">Upload</span>
          </Link>
          <Link to="/community" className="flex flex-col items-center text-cyan-400">
            <Users className="w-6 h-6" />
            <span className="text-xs">Community</span>
          </Link>
          <Link to="/settings" className="flex flex-col items-center text-cyan-400">
            <Settings className="w-6 h-6" />
            <span className="text-xs">Settings</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center text-cyan-400">
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  )
}



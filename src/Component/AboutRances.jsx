"use client"

import React, { useContext } from 'react';
import { Link } from "react-router-dom"
import { Home, MessageSquare, Upload, Users, Settings, User } from "lucide-react"
import profilePic from '../assets/rancesco.jpg';
import { BackgroundContext } from '../App';
import { getSelectedLanguage } from "../App";
import text from "../text.json";

const AboutRances = () => {
  const { currentBackground, language } = useContext(BackgroundContext);
  const langKey = language === "English" ? "en" : "es";
  const aboutRancesText = text[langKey].aboutRancesPage;

  return (
    <div className="min-h-screen bg-black text-white ml-[90px]">
      {" "}
      {/* Added margin-left to account for sidebar */}
      {/* Header - About Me */}
      <div className="p-4">
        <h1 className="text-cyan-400 text-xl mb-4">{aboutRancesText.aboutMe}</h1>
        <div className="bg-white rounded-lg p-6 text-black">
          <div className="flex items-center gap-4">
            <img
              src={profilePic || "/placeholder.svg"}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-cyan-400"
            />
            <div>
              <h2 className="text-xl font-bold">Rances Colon</h2>
              <p className="text-gray-600">
                Im like making game in UE and made a game called "Bizarre Bender"
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Grid Layout */}
      <div className="grid md:grid-cols-2 gap-4 p-4">
        {/* Uploaded Materials */}
        <div className="bg-white rounded-lg p-6 text-black">
          <h2 className="text-xl font-bold mb-4">{aboutRancesText.uploadedMaterials}</h2>
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
          <h2 className="text-xl font-bold mb-4">{aboutRancesText.studyGroups}</h2>
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
          <h2 className="text-xl font-bold mb-4">{aboutRancesText.favoriteVideos}</h2>
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
          <h2 className="text-xl font-bold mb-4">{aboutRancesText.achievements}</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧪</span>
              <div>
                <p className="font-bold">{aboutRancesText.iqPlusOne}</p>
                <p className="text-blue-600 text-sm">{aboutRancesText.iqPlusOneDesc}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎮</span>
              <div>
                <p className="font-bold">{aboutRancesText.gigachadGrindset}</p>
                <p className="text-blue-600 text-sm">{aboutRancesText.gigachadGrindsetDesc}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧠</span>
              <div>
                <p className="font-bold">{aboutRancesText.collectiveBrainCell}</p>
                <p className="text-blue-600 text-sm">{aboutRancesText.collectiveBrainCellDesc}</p>
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
            <span className="text-xs">{aboutRancesText.home}</span>
          </Link>
          <Link to="/chat" className="flex flex-col items-center text-cyan-400">
            <MessageSquare className="w-6 h-6" />
            <span className="text-xs">{aboutRancesText.chat}</span>
          </Link>
          <Link to="/upload" className="flex flex-col items-center text-cyan-400">
            <Upload className="w-6 h-6" />
            <span className="text-xs">{aboutRancesText.upload}</span>
          </Link>
          <Link to="/community" className="flex flex-col items-center text-cyan-400">
            <Users className="w-6 h-6" />
            <span className="text-xs">{aboutRancesText.community}</span>
          </Link>
          <Link to="/settings" className="flex flex-col items-center text-cyan-400">
            <Settings className="w-6 h-6" />
            <span className="text-xs">{aboutRancesText.settings}</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center text-cyan-400">
            <User className="w-6 h-6" />
            <span className="text-xs">{aboutRancesText.profile}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AboutRances;



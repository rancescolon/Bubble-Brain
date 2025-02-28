"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Home, MessageSquare, Upload, Users, Settings, User, ChevronLeft, ChevronRight } from "lucide-react"

const NavBar = () => {
  const [isExpanded, setIsExpanded] = useState(true)

  // const navItems = [
  //   { icon: Home, label: "Overview", path: "/" },
  //   { icon: Layout, label: "Typography", path: "/typography" },
  //   { icon: Palette, label: "Colors", path: "/colors" },
  //   { icon: Bell, label: "Feedback", path: "/feedback" },
  // ]
    const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: MessageSquare, label: "Chat", path: "/chat" },
    { icon: Upload, label: "Upload", path: "/upload" },
    { icon: Users, label: "Community", path: "/community" },
    { icon: Settings, label: "Settings", path: "/settings" },
    { icon: User, label: "Profile", path: "/profile" },
  ]

  return (
    <nav
      className={`fixed left-0 top-0 h-full bg-white border-r transition-all duration-300 flex flex-col ${
        isExpanded ? "w-64" : "w-16"
      }`}
    >
      {/* Logo/Header */}
      {/* <div className="p-4 flex items-center justify-center">
        <img src="/placeholder.svg?height=40&width=40" alt="Logo" className="w-10 h-10 rounded-full" />
        {isExpanded && <h1 className="ml-3 text-xl font-semibold">Style Guide</h1>}
      </div> */}

      {/* Spacer */}
      <div className="flex-grow" />

      {/* Nav Items */}
      <div className="mb-auto space-y-6 px-3">
        {navItems.map((item, index) => {
          const Icon = item.icon
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors group ${
                isExpanded ? "justify-start" : "justify-center"
              }`}
            >
              <Icon className="w-5 h-5" />
              {isExpanded && <span className="ml-3 text-sm font-medium">{item.label}</span>}
              {!isExpanded && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Bottom spacer */}
      <div className="flex-grow" />

      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white p-1.5 rounded-full border shadow-sm text-gray-700 hover:text-gray-900`}
      >
        {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
    </nav>
  )
}

export default NavBar
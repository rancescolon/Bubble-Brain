"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Home, MessageSquare, Upload, Users, Settings, User, ChevronLeft, ChevronRight } from "lucide-react"

const NavBar = () => {
  const [isExpanded, setIsExpanded] = useState(true)

  // Get current path to highlight active link
  const location = useLocation()
  const currentPath = location.pathname

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
      <div className="flex-grow" />
      <div className="mb-auto space-y-6 px-3">
        {navItems.map((item, index) => {
          const Icon = item.icon
          const isActive = currentPath === item.path
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-lg transition-colors group ${
                isExpanded ? "justify-start" : "justify-center"
              } ${isActive ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"}`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : ""}`} />
              {isExpanded && (
                <span className={`ml-3 text-sm font-medium ${isActive ? "text-blue-600" : ""}`}>{item.label}</span>
              )}
              {!isExpanded && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </div>
      <div className="flex-grow" />
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


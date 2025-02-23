"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Home, MessageSquare, Upload, Users, Settings, User, ChevronLeft, ChevronRight } from "lucide-react"

const NavBar = ({ toggleModal, logout }) => {
  const [isVisible, setIsVisible] = useState(true)

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
      className={`fixed left-0 top-0 h-full bg-[#1b1b1b] w-20 flex flex-col justify-center items-center transition-transform duration-300 ${
        isVisible ? "translate-x-0" : "-translate-x-16"
      }`}
    >
      {/* NavBar Items */}
      <div className="space-y-8">
        {navItems.map((item, index) => {
          const Icon = item.icon
          return (
            <Link
              key={index}
              to={item.path}
              className="flex flex-col items-center justify-center w-full text-[#00AEEF] hover:text-white transition-colors group"
            >
              <div className="flex flex-col items-center">
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.label}
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`absolute ${
          isVisible ? "-right-3" : "-right-7"
        } top-1/2 transform -translate-y-1/2 bg-[#1b1b1b] p-1.5 rounded-full border border-[#3A3A3A] text-[#00AEEF] hover:text-white transition-colors`}
      >
        {isVisible ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
    </nav>
  )
}

export default NavBar


"use client"
import { Link } from "react-router-dom"
import { Home, MessageSquare, Upload, Users, Settings, User } from "lucide-react"

// Import profile images
import rancesPic from "../assets/rancesco.jpg"
import akibPic from "../assets/Akibpfp.png"
import caydenPic from "../assets/caydenla.jpg"
import jacobPic from "../assets/jacobmie.jpg"
import bivijPic from "../assets/tariqbiv.jpg"

function TeamMemberCard({ name, bio, imageSrc, profileLink }) {
  return (
    <div className="bg-white rounded-lg p-6 mb-4">
      <div className="flex items-center gap-4">
        <img
          src={imageSrc || "/placeholder.svg"}
          alt={`${name}'s profile`}
          className="w-24 h-24 rounded-full border-4 border-[#00aeef]"
        />
        <div>
          {profileLink ? (
            <Link to={profileLink} className="text-xl font-bold text-black hover:text-cyan-600">
              {name}
            </Link>
          ) : (
            <h2 className="text-xl font-bold text-black">{name}</h2>
          )}
          <p className="text-gray-600">{bio}</p>
        </div>
      </div>
    </div>
  )
}

export default function AboutUs() {
  const teamMembers = [
    {
      name: "Rances Colon",
      bio: 'Hi, I\'m Rances a CS student graduating next spring, I like making game in Unreal Engine and made a game called "Bizarre Bender" last semester',
      imageSrc: rancesPic,
      profileLink: "/rances",
    },
    {
      name: "Akib Mahdi",
      bio: "Hi",
      imageSrc: akibPic,
      profileLink: "/akibmahdi",
    },
    {
      name: "Cayden La Bara",
      bio: "Hi",
      imageSrc: caydenPic,
    },
    {
      name: "Mieszawski Jacob",
      bio: "Hi, I'm Jacob and I'm a senior studying Computer Science. I aspire to be a full stack developer in the future, and my favorite dog breed are Bernese Mountain Dogs just incase you were curious ",
      imageSrc: jacobPic,
      profileLink: "/jacobmie",
    },
    {
      name: "Biviji Tariq",
      bio: "Hi",
      imageSrc: bivijPic,
      profileLink: "/biviji",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white ml-[90px] pb-20">
      <div className="p-4">
        <h1 className="text-[#00aeef] text-xl mb-4">About Us</h1>

        {/* Team Members */}
        <div className="space-y-4">
          {teamMembers.map((member, index) => (
            <TeamMemberCard
              key={index}
              name={member.name}
              bio={member.bio}
              imageSrc={member.imageSrc}
              profileLink={member.profileLink}
            />
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-[100px] right-0 bg-black border-t border-gray-800">
        <div className="flex justify-around p-4">
          <NavLink to="/" icon={<Home className="w-6 h-6" />} label="Home" />
          <NavLink to="/chat" icon={<MessageSquare className="w-6 h-6" />} label="Chat" />
          <NavLink to="/upload" icon={<Upload className="w-6 h-6" />} label="Upload" />
          <NavLink to="/community" icon={<Users className="w-6 h-6" />} label="Community" />
          <NavLink to="/settings" icon={<Settings className="w-6 h-6" />} label="Settings" />
          <NavLink to="/profile" icon={<User className="w-6 h-6" />} label="Profile" />
        </div>
      </div>
    </div>
  )
}

function NavLink({ to, icon, label }) {
  return (
    <Link to={to} className="flex flex-col items-center text-cyan-400">
      {icon}
      <span className="text-xs">{label}</span>
    </Link>
  )
}


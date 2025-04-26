"use client"
import React, { useContext } from 'react';
import { Link } from "react-router-dom"
import {Home, MessageSquare, Upload, Users, Settings, User, Palette} from "lucide-react"
import { getSelectedLanguage } from "../App";
import text from "../text.json";

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
  const language = getSelectedLanguage();
  const langKey = language === "English" ? "en" : "es";
  const aboutUsText = text[langKey].aboutUsPage;

  const teamMembers = [
    {
      name: aboutUsText.teamMembers.rances.name,
      bio: aboutUsText.teamMembers.rances.bio,
      imageSrc: rancesPic,
      profileLink: "/rances",
    },
    {
      name: aboutUsText.teamMembers.akib.name,
      bio: aboutUsText.teamMembers.akib.bio,
      imageSrc: akibPic,
      profileLink: "/akibmahdi",
    },
    {
      name: aboutUsText.teamMembers.cayden.name,
      bio: aboutUsText.teamMembers.cayden.bio,
      imageSrc: caydenPic,
      profileLink: "/caydenla",
    },
    {
      name: aboutUsText.teamMembers.jacob.name,
      bio: aboutUsText.teamMembers.jacob.bio,
      imageSrc: jacobPic,
      profileLink: "/jacobmie",
    },
    {
      name: aboutUsText.teamMembers.tariq.name,
      bio: aboutUsText.teamMembers.tariq.bio,
      imageSrc: bivijPic,
      profileLink: "/biviji",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white ml-[90px] pb-20">
      <div className="p-4">
        <h1 className="text-[#00aeef] text-xl mb-4">{aboutUsText.aboutUs}</h1>

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
          <NavLink to="/" icon={<Home className="w-6 h-6" />} label={aboutUsText.home} />
          <NavLink to="/chat" icon={<MessageSquare className="w-6 h-6" />} label={aboutUsText.chat} />
          <NavLink to="/upload" icon={<Upload className="w-6 h-6" />} label={aboutUsText.upload} />
          <NavLink to="/community" icon={<Users className="w-6 h-6" />} label={aboutUsText.community} />
          <NavLink to="/settings" icon={<Settings className="w-6 h-6" />} label={aboutUsText.settings} />
          <NavLink to="/profile" icon={<User className="w-6 h-6" />} label={aboutUsText.profile} />
          <NavLink to="/style-guide" icon={<Palette className="w-6 h-6"/>} label={aboutUsText.styleGuide}/>

        </div>

      </div>
</div>
)
}

function NavLink({to, icon, label}) {
  return (
      <Link to={to} className="flex flex-col items-center text-cyan-400">
        {icon}
        <span className="text-xs">{label}</span>
      </Link>
  )
}


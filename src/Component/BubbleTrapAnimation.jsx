"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import DrBubbles from "../assets/Frame.png"

const BubbleTrapAnimation = ({ onComplete }) => {
  const navigate = useNavigate()
  const [showButton, setShowButton] = useState(false)
  const [showBubble, setShowBubble] = useState(false)

  useEffect(() => {
    // Start bubble animation after a short delay
    setTimeout(() => setShowBubble(true), 500)
    // Show button after bubble forms
    setTimeout(() => setShowButton(true), 2000)
  }, [])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#1D1D20] overflow-hidden">
      <div className="relative flex flex-col items-center">
        {/* Large Bubble Container */}
        <div className="relative w-96 h-96 flex items-center justify-center mb-8">
          {/* Bubble effect */}
          <div
            className={`absolute inset-0 rounded-full transition-all duration-1000 ${
              showBubble ? "scale-100 opacity-100" : "scale-0 opacity-0"
            }`}
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, rgba(173,216,230,0.1) 40%, rgba(135,206,235,0.2) 100%)",
              boxShadow: `
                0 0 50px rgba(135,206,235,0.3),
                inset 0 0 30px rgba(255,255,255,0.2),
                inset 0 0 20px rgba(173,216,230,0.2)
              `,
              border: "1px solid rgba(255,255,255,0.2)",
              backdropFilter: "blur(5px)",
            }}
          >
            {/* Bubble shine effects */}
            <div className="absolute top-[10%] left-[10%] w-[20%] h-[20%] rounded-full bg-white opacity-20 blur-sm" />
            <div className="absolute top-[15%] left-[15%] w-[10%] h-[10%] rounded-full bg-white opacity-30" />
          </div>

          {/* Dr Bubbles image */}
          <img
            src={DrBubbles || "/placeholder.svg"}
            alt="Dr. Bubbles"
            className={`w-64 h-64 object-contain relative z-10 transition-all duration-1000 ${
              showBubble ? "animate-float" : ""
            }`}
          />

          {/* Floating bubbles effect */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${Math.random() * 20 + 5}px`,
                  height: `${Math.random() * 20 + 5}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(173,216,230,0.3))",
                  animation: `float ${3 + Math.random() * 4}s infinite ease-in-out`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Text content */}
        <div className="text-center space-y-4 relative z-10">
          <h2
            className={`text-5xl font-bold text-white mb-2 transition-all duration-500 ${
              showBubble ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-10"
            }`}
            style={{
              fontFamily: "SourGummy, sans-serif",
              textShadow: "0 0 20px rgba(0,174,239,0.5)",
            }}
          >
            Oh no! Dr. Bubbles is trapped!
          </h2>
          <p
            className={`text-blue-300 text-2xl mb-6 transition-all duration-500 delay-300 ${
              showBubble ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-10"
            }`}
            style={{
              fontFamily: "SourGummy, sans-serif",
            }}
          >
            Complete challenges to help free him
          </p>

          {showButton && (
            <button
                onClick={() => navigate("/select-categories")}
                className="px-8 py-4 bg-[#EF7B6C] text-white rounded-lg transform transition-all hover:scale-105 hover:bg-[#e66a59] focus:outline-none focus:ring-2 focus:ring-[#EF7B6C] focus:ring-opacity-50 animate-fade-in"
              style={{
                fontFamily: "SourGummy, sans-serif",
                fontSize: "28px",
                boxShadow: "0 0 30px rgba(239,123,108,0.5)",
              }}
            >
              Start Your Journey
            </button>
          )}
        </div>
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(2deg);
          }
          50% {
            transform: translateY(-20px) rotate(-2deg);
          }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out forwards;
        }

        @keyframes float {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(10px, -15px) rotate(5deg);
          }
          66% {
            transform: translate(-10px, -25px) rotate(-5deg);
          }
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
        }
      `}</style>
    </div>
  )
}

export default BubbleTrapAnimation


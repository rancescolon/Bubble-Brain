// "use client"

// import { useState } from "react"
// import { Link, useNavigate } from "react-router-dom"
// import Frame from "../assets/Frame.png"
// import background from "../assets/image3.png"

// const LoginForm = ({ setLoggedIn }) => {
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [sessionToken, setSessionToken] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const navigate = useNavigate()

//   const submitHandler = (event) => {
//     event.preventDefault()
//     setIsLoading(true)

//     fetch(process.env.REACT_APP_API_PATH + "/auth/login", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         email,
//         password,
//       }),
//     })
//       .then((res) => res.json())
//       .then((result) => {
//         if (result.userID) {
//           console.log(result)
//           sessionStorage.setItem("token", result.token)
//           sessionStorage.setItem("user", result.userID)
//           setLoggedIn(true)
//           setSessionToken(result.token)
//           console.log(sessionToken, "SESSION TOKEN")
//           navigate("/")
//           window.location.reload()
//         }
//       })
//       .catch((err) => {
//         console.log(err)
//       })
//       .finally(() => {
//         setIsLoading(false)
//       })
//   }

//   return (
//     <div
//       className="min-h-screen flex flex-col"
//       style={{
//         backgroundImage: `url(${background})`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundRepeat: "no-repeat",
//         backgroundColor: "#1b1b1b",
//       }}
//     >
//       {/* Header */}
//       <header className="bg-[#3A3A3A] px-4">
//         <div className="max-w-7xl mx-auto flex items-center h-14">
//           <img
//             src={Frame || "/placeholder.svg"}
//             height="80"
//             width="80"
//             alt="Bubble Brain Logo"
//             className="h-8 w-8 mr-2"
//           />
//           {/* Focus text - Logo */}
//           <Link
//             to="/"
//             style={{
//               fontFamily: "SourGummy, sans-serif",
//               fontWeight: 800,
//               fontSize: "52px",
//             }}
//             className="text-white"
//           >
//             Bubble Brain
//           </Link>
//           <div className="flex-grow"></div>
//           {/* Normal text */}
//           <Link
//             to="/register"
//             style={{
//               fontFamily: "SourGummy, sans-serif",
//               fontWeight: 500,
//               fontSize: "16px",
//             }}
//             className="bg-[#00AEEF] text-white px-3 py-1 rounded hover:bg-[#00AEEF]/90 transition-colors"
//           >
//             Sign Up
//           </Link>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="flex-1 flex items-center justify-center p-4">
//         <div className="w-full max-w-md bg-[#3a3a3a] p-8 rounded-lg">
//           {/* Focus text - Heading */}
//           <h1
//             style={{
//               fontFamily: "SourGummy, sans-serif",
//               fontWeight: 800,
//               fontSize: "40px",
//             }}
//             className="text-white text-center mb-6"
//           >
//             Welcome Back!
//           </h1>

//           <form onSubmit={submitHandler} className="space-y-4">
//             <div className="space-y-2">
//               {/* Semi focus - Form labels */}
//               <label
//                 htmlFor="email"
//                 style={{
//                   fontFamily: "SourGummy, sans-serif",
//                   fontWeight: 600,
//                   fontSize: "26px",
//                 }}
//                 className="block text-white"
//               >
//                 Email
//               </label>
//               <input
//                 type="email"
//                 id="email"
//                 value={email}
//                 onChange={(event) => setEmail(event.target.value)}
//                 placeholder="Enter your email"
//                 style={{
//                   fontFamily: "SourGummy, sans-serif",
//                   fontWeight: 500,
//                   fontSize: "16px",
//                 }}
//                 className="w-full px-3 py-2 rounded bg-white text-black placeholder-gray-400"
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               {/* Semi focus - Form labels */}
//               <label
//                 htmlFor="password"
//                 style={{
//                   fontFamily: "SourGummy, sans-serif",
//                   fontWeight: 600,
//                   fontSize: "26px",
//                 }}
//                 className="block text-white"
//               >
//                 Password
//               </label>
//               <input
//                 type="password"
//                 id="password"
//                 value={password}
//                 onChange={(event) => setPassword(event.target.value)}
//                 placeholder="Enter your password"
//                 style={{
//                   fontFamily: "SourGummy, sans-serif",
//                   fontWeight: 500,
//                   fontSize: "16px",
//                 }}
//                 className="w-full px-3 py-2 rounded bg-white text-black placeholder-gray-400"
//                 required
//               />
//             </div>

//             {/* Semi focus - Button */}
//             <button
//               type="submit"
//               disabled={isLoading}
//               style={{
//                 fontFamily: "SourGummy, sans-serif",
//                 fontWeight: 600,
//                 fontSize: "32px",
//               }}
//               className="w-full bg-[#00aeef] hover:bg-[#00aeef]/90 text-white py-2 rounded transition-colors disabled:opacity-50"
//             >
//               {isLoading ? "Logging in..." : "Login"}
//             </button>
//           </form>

//           <div className="mt-4 text-center">
//             {/* Normal text */}
//             <Link
//               to="/reset-password"
//               style={{
//                 fontFamily: "SourGummy, sans-serif",
//                 fontWeight: 500,
//                 fontSize: "14px",
//               }}
//               className="text-[#00aeef] hover:underline"
//             >
//               Forgot Password?
//             </Link>
//           </div>

//           <div className="mt-4 text-center">
//             {/* Normal text */}
//             <span
//               style={{
//                 fontFamily: "SourGummy, sans-serif",
//                 fontWeight: 500,
//                 fontSize: "14px",
//               }}
//               className="text-white"
//             >
//               Don't have an account?{" "}
//             </span>
//             <Link
//               to="/register"
//               style={{
//                 fontFamily: "SourGummy, sans-serif",
//                 fontWeight: 500,
//                 fontSize: "14px",
//               }}
//               className="text-[#00aeef] hover:underline"
//             >
//               Sign Up
//             </Link>
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }

// export default LoginForm
"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import BubbleTrapAnimation from "./BubbleTrapAnimation"
import Frame from "../assets/Frame.png"
import background from "../assets/image3.png"
import { Link } from "react-router-dom"

const LoginForm = ({ setLoggedIn }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [sessionToken, setSessionToken] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  const [loginResult, setLoginResult] = useState(null) // Add this to store login result
  const navigate = useNavigate()

  const submitHandler = (event) => {
    event.preventDefault()
    setIsLoading(true)

    fetch(process.env.REACT_APP_API_PATH + "/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.userID) {
          console.log(result)
          sessionStorage.setItem("token", result.token)
          sessionStorage.setItem("user", result.userID)
          setLoginResult(result) // Store the result

          // Check if this is the first login
          const isFirstLogin = !localStorage.getItem("hasLoggedInBefore")
          if (isFirstLogin) {
            setShowAnimation(true)
            localStorage.setItem("hasLoggedInBefore", "true")
          } else {
            completeLogin(result)
          }
        }
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const completeLogin = (result) => {
    if (!result && loginResult) {
      result = loginResult // Use stored result if none provided
    }
    if (result) {
      setLoggedIn(true)
      setSessionToken(result.token)
      navigate("/")
      window.location.reload()
    } else {
      console.error("No login result available")
      // Handle error - maybe redirect back to login
      navigate("/login")
    }
  }

  return (
    <>
      {showAnimation ? (
        <BubbleTrapAnimation onComplete={() => completeLogin(loginResult)} />
      ) : (
        <div
          className="min-h-screen flex flex-col"
          style={{
            backgroundImage: `url(${background})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundColor: "#1b1b1b",
          }}
        >
          {/* Header */}
          <header className="bg-[#3A3A3A] px-4">
            <div className="max-w-7xl mx-auto flex items-center h-14">
              <img
                src={Frame || "/placeholder.svg"}
                height="32"
                width="32"
                alt="Bubble Brain Logo"
                className="h-8 w-8 mr-2"
              />
              {/* Focus text - Logo */}
              <Link
                to="/"
                style={{
                  fontFamily: "SourGummy, sans-serif",
                  fontWeight: 800,
                  fontSize: "52px",
                }}
                className="text-white"
              >
                Bubble Brain
              </Link>
              <div className="flex-grow"></div>
              {/* Normal text */}
              <Link
                to="/register"
                style={{
                  fontFamily: "SourGummy, sans-serif",
                  fontWeight: 500,
                  fontSize: "16px",
                }}
                className="bg-[#00AEEF] text-white px-3 py-1 rounded hover:bg-[#00AEEF]/90 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#3a3a3a] p-8 rounded-lg">
              {/* Focus text - Heading */}
              <h1
                style={{
                  fontFamily: "SourGummy, sans-serif",
                  fontWeight: 800,
                  fontSize: "40px",
                }}
                className="text-white text-center mb-6"
              >
                Welcome Back!
              </h1>

              <form onSubmit={submitHandler} className="space-y-4">
                <div className="space-y-2">
                  {/* Semi focus - Form labels */}
                  <label
                    htmlFor="email"
                    style={{
                      fontFamily: "SourGummy, sans-serif",
                      fontWeight: 600,
                      fontSize: "26px",
                    }}
                    className="block text-white"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your email"
                    style={{
                      fontFamily: "SourGummy, sans-serif",
                      fontWeight: 500,
                      fontSize: "16px",
                    }}
                    className="w-full px-3 py-2 rounded bg-white text-black placeholder-gray-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  {/* Semi focus - Form labels */}
                  <label
                    htmlFor="password"
                    style={{
                      fontFamily: "SourGummy, sans-serif",
                      fontWeight: 600,
                      fontSize: "26px",
                    }}
                    className="block text-white"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    style={{
                      fontFamily: "SourGummy, sans-serif",
                      fontWeight: 500,
                      fontSize: "16px",
                    }}
                    className="w-full px-3 py-2 rounded bg-white text-black placeholder-gray-400"
                    required
                  />
                </div>

                {/* Semi focus - Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    fontFamily: "SourGummy, sans-serif",
                    fontWeight: 600,
                    fontSize: "32px",
                  }}
                  className="w-full bg-[#00aeef] hover:bg-[#00aeef]/90 text-white py-2 rounded transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Logging in..." : "Login"}
                </button>
              </form>

              <div className="mt-4 text-center">
                {/* Normal text */}
                <Link
                  to="/reset-password"
                  style={{
                    fontFamily: "SourGummy, sans-serif",
                    fontWeight: 500,
                    fontSize: "14px",
                  }}
                  className="text-[#00aeef] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <div className="mt-4 text-center">
                {/* Normal text */}
                <span
                  style={{
                    fontFamily: "SourGummy, sans-serif",
                    fontWeight: 500,
                    fontSize: "14px",
                  }}
                  className="text-white"
                >
                  Don't have an account?{" "}
                </span>
                <Link
                  to="/register"
                  style={{
                    fontFamily: "SourGummy, sans-serif",
                    fontWeight: 500,
                    fontSize: "14px",
                  }}
                  className="text-[#00aeef] hover:underline"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </main>
        </div>
      )}
    </>
  )
}

export default LoginForm


// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";

// // example of how you can set up a component to request a password reset for an account
// // The only thing you need to do is send the email of the account to the backend api route and then
// // the email will get a code and you use that code with the reset-password route
// // (You can see more on the swagger API documentation)
// const ResetPassword = () => {
//   const [email, setEmail] = useState("");
//   // State used to conditionally render different forms
//   // When the user gets the token, this is set to true to show the second form to input a new password
//   const [gotToken, setGotToken] = useState(false);
//   const [token, setToken] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   const handleResetRequest = (event) => {
//     event.preventDefault();

//     // fetch the api route to send a reset password request
//     fetch(process.env.REACT_APP_API_PATH + "/auth/request-reset", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         email,
//       }),
//     }).then((res) => {
//       // the request successfully worked, so set gotToken state to true
//       if (res.ok) {
//         setGotToken(true);
//       }
//     });
//   };

//   const handleResetPassword = (event) => {
//     event.preventDefault();

//     fetch(process.env.REACT_APP_API_PATH + "/auth/reset-password", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         token,
//         password,
//       }),
//     }).then((res) => {
//       if (res.ok) {
//         // New password submitted, so have them go to login page to login with new password
//         navigate("/");
//       }
//     });
//   };

//   return (
//     <>
//       <h1>Reset password</h1>
//       {/* Conditionally render the different forms:
//           When the user first see's this component, show them the form to enter their email to get the token
//           Once they submit this form, they get the token in their email and the form changes to the form where
//           they can enter a new password to reset it 
//       */}
//       {!gotToken ? (
//         <form onSubmit={handleResetRequest}>
//           <label>
//             Email
//             <input
//               type="email"
//               value={email}
//               // event.target refers to the DOM that is triggered from an event, such as onChange, onClick, etc.
//               // event.target.value holds the value that is passed in to the input field from the onChange
//               onChange={(event) => setEmail(event.target.value)}
//             />
//           </label>
//           <input type="submit" className="submitbutton" value="submit" />
//         </form>
//       ) : (
//         <form onSubmit={handleResetPassword}>
//           <label>
//             Token
//             <input
//               type="text"
//               value={token}
//               // event.target refers to the DOM that is triggered from an event, such as onChange, onClick, etc.
//               // event.target.value holds the value that is passed in to the input field from the onChange
//               onChange={(event) => setToken(event.target.value)}
//             />
//           </label>
//           <br />
//           <label>
//             New Password
//             <input
//               type="password"
//               value={password}
//               onChange={(event) => setPassword(event.target.value)}
//             />
//           </label>
//           <input type="submit" className="submitbutton" value="submit" />
//         </form>
//       )}
//       <div>
//         <p>
//           Login <Link to="/">here</Link>
//         </p>
//       </div>
//     </>
//   );
// };

// export default ResetPassword;
// "use client"

// import { useState } from "react"
// import { Link, useNavigate } from "react-router-dom"
// import { Eye, EyeOff } from "lucide-react"
// import Logo from "../assets/Frame.png"
// import background from "../assets/image3.png"

// const ResetPassword = () => {
//   const [email, setEmail] = useState("")
//   const [gotToken, setGotToken] = useState(false)
//   const [token, setToken] = useState("")
//   const [password, setPassword] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const [showPassword, setShowPassword] = useState(false)
//   const navigate = useNavigate()

//   const handleResetRequest = (event) => {
//     event.preventDefault()
//     setIsLoading(true)

//     fetch(process.env.REACT_APP_API_PATH + "/auth/request-reset", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         email,
//       }),
//     })
//       .then((res) => {
//         if (res.ok) {
//           setGotToken(true)
//         }
//       })
//       .catch((error) => {
//         console.error("Error:", error)
//       })
//       .finally(() => {
//         setIsLoading(false)
//       })
//   }

//   const handleResetPassword = (event) => {
//     event.preventDefault()
//     setIsLoading(true)

//     fetch(process.env.REACT_APP_API_PATH + "/auth/reset-password", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         token,
//         password,
//       }),
//     })
//       .then((res) => {
//         if (res.ok) {
//           navigate("/login")
//         }
//       })
//       .catch((error) => {
//         console.error("Error:", error)
//       })
//       .finally(() => {
//         setIsLoading(false)
//       })
//   }

//   return (
//     <div 
//   className="min-h-screen flex flex-col"
//   style={{
//     backgroundImage: `url(${background})`,
//     backgroundSize: 'cover',
//     backgroundPosition: 'center',
//     backgroundRepeat: 'no-repeat',
//     backgroundColor: '#1b1b1b',
//   }}
// >
//       {/* Header */}
//       <header className="bg-[#3A3A3A] px-4">
//         <div className="max-w-7xl mx-auto flex items-center h-14">
//           <img src={Logo} height="32" width="32" alt="QuizRot Logo" className="h-8 w-8 mr-2" />
//           <Link to="/login" className="text-white text-xl font-bold">
//             QuizRot
//           </Link>
//           <div className="flex-grow"></div>
//           <Link
//             to="/login"
//             className="bg-[#00AEEF] text-white px-3 py-1 text-sm rounded hover:bg-[#00AEEF]/90 transition-colors"
//           >
//             Login
//           </Link>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="flex-1 flex items-center justify-center p-4">
//         <div className="w-full max-w-md bg-[#3a3a3a] p-8 rounded-lg">
//           {!gotToken ? (
//             <>
//               <h1 className="text-lg font-bold text-white text-center mb-2">Reset Password</h1>
//               <p className="text-gray-300 text-center mb-6 text-sm">
//                 Enter the email associated with your account below to receive instructions on resetting your account's
//                 password.
//               </p>

//               <form onSubmit={handleResetRequest} className="space-y-4">
//                 <div className="space-y-2">
//                   <label htmlFor="email" className="block text-base text-white font-medium">
//                     Email
//                   </label>
//                   <input
//                     type="email"
//                     id="email"
//                     value={email}
//                     onChange={(event) => setEmail(event.target.value)}
//                     placeholder="Enter your email"
//                     className="w-full px-3 py-2 rounded bg-white text-black placeholder-gray-400 text-sm"
//                     required
//                   />
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={isLoading}
//                   className="w-full bg-[#00aeef] hover:bg-[#00aeef]/90 text-white py-2 rounded transition-colors disabled:opacity-50 text-sm"
//                 >
//                   {isLoading ? "Sending..." : "Send Password Reset Instructions"}
//                 </button>
//               </form>
//             </>
//           ) : (
//             <>
//               <h1 className="text-xl font-bold text-white text-center mb-2">Change Your Password</h1>
//               <p className="text-gray-300 text-center mb-6 text-sm">Enter a new password below to change your password.</p>

//               <form onSubmit={handleResetPassword} className="space-y-4">
//                 <div className="space-y-2">
//                   <label htmlFor="token" className="block text-base text-white font-medium">
//                     Reset Token
//                   </label>
//                   <input
//                     type="text"
//                     id="token"
//                     value={token}
//                     onChange={(event) => setToken(event.target.value)}
//                     placeholder="Enter reset token"
//                     className="w-full px-3 py-2 rounded bg-white text-black placeholder-gray-400 text-sm"
//                     required
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <label htmlFor="password" className="block text-base text-white font-medium">
//                     New Password
//                   </label>
//                   <div className="relative">
//                     <input
//                       type={showPassword ? "text" : "password"}
//                       id="password"
//                       value={password}
//                       onChange={(event) => setPassword(event.target.value)}
//                       placeholder="Enter new password"
//                       className="w-full px-3 py-2 rounded bg-white text-black placeholder-gray-400 text-sm"
//                       required
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
//                     >
//                       {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                     </button>
//                   </div>
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={isLoading}
//                   className="w-full bg-[#00aeef] hover:bg-[#00aeef]/90 text-white py-2 rounded transition-colors disabled:opacity-50 text-sm"
//                 >
//                   {isLoading ? "Changing..." : "Change Password"}
//                 </button>
//               </form>
//             </>
//           )}

//           <div className="mt-4 text-center text-sm">
//             <Link to="/login" className="text-[#00aeef] hover:underline">
//               Back to Login
//             </Link>
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }

// export default ResetPassword

"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import Logo from "../assets/Frame.png"
import background from "../assets/image3.png"

const ResetPassword = () => {
  const [email, setEmail] = useState("")
  const [gotToken, setGotToken] = useState(false)
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleResetRequest = (event) => {
    event.preventDefault()
    setIsLoading(true)

    fetch(process.env.REACT_APP_API_PATH + "/auth/request-reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    })
      .then((res) => {
        if (res.ok) {
          setGotToken(true)
        }
      })
      .catch((error) => {
        console.error("Error:", error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleResetPassword = (event) => {
    event.preventDefault()
    setIsLoading(true)

    fetch(process.env.REACT_APP_API_PATH + "/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        password,
      }),
    })
      .then((res) => {
        if (res.ok) {
          navigate("/login")
        }
      })
      .catch((error) => {
        console.error("Error:", error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
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
            src={Logo || "/placeholder.svg"}
            height="80"
            width="80"
            alt="Bubble Brain Logo"
            className="h-8 w-8 mr-2"
          />
          {/* Focus text - Logo */}
          <Link
            to="/login"
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
            to="/login"
            style={{
              fontFamily: "SourGummy, sans-serif",
              fontWeight: 500,
              fontSize: "16px",
            }}
            className="bg-[#00AEEF] text-white px-3 py-1 rounded hover:bg-[#00AEEF]/90 transition-colors"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#3a3a3a] p-8 rounded-lg">
          {!gotToken ? (
            <>
              {/* Focus text - Heading */}
              <h1
                style={{
                  fontFamily: "SourGummy, sans-serif",
                  fontWeight: 800,
                  fontSize: "40px",
                }}
                className="text-white text-center mb-2"
              >
                Reset Password
              </h1>
              {/* Normal text */}
              <p
                style={{
                  fontFamily: "SourGummy, sans-serif",
                  fontWeight: 500,
                  fontSize: "14px",
                }}
                className="text-gray-300 text-center mb-6"
              >
                Enter the email associated with your account below to receive instructions on resetting your account's
                password.
              </p>

              <form onSubmit={handleResetRequest} className="space-y-4">
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
                  {isLoading ? "Sending..." : "Send Reset Instructions"}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Focus text - Heading */}
              <h1
                style={{
                  fontFamily: "SourGummy, sans-serif",
                  fontWeight: 800,
                  fontSize: "40px",
                }}
                className="text-white text-center mb-2"
              >
                Change Your Password
              </h1>
              {/* Normal text */}
              <p
                style={{
                  fontFamily: "SourGummy, sans-serif",
                  fontWeight: 500,
                  fontSize: "14px",
                }}
                className="text-gray-300 text-center mb-6"
              >
                Enter a new password below to change your password.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  {/* Semi focus - Form labels */}
                  <label
                    htmlFor="token"
                    style={{
                      fontFamily: "SourGummy, sans-serif",
                      fontWeight: 600,
                      fontSize: "26px",
                    }}
                    className="block text-white"
                  >
                    Reset Token
                  </label>
                  <input
                    type="text"
                    id="token"
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                    placeholder="Enter reset token"
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
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter new password"
                      style={{
                        fontFamily: "SourGummy, sans-serif",
                        fontWeight: 500,
                        fontSize: "16px",
                      }}
                      className="w-full px-3 py-2 rounded bg-white text-black placeholder-gray-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
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
                  {isLoading ? "Changing..." : "Change Password"}
                </button>
              </form>
            </>
          )}

          {/* Normal text */}
          <div className="mt-4 text-center">
            <Link
              to="/login"
              style={{
                fontFamily: "SourGummy, sans-serif",
                fontWeight: 500,
                fontSize: "14px",
              }}
              className="text-[#00aeef] hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ResetPassword


// import React, { useEffect, useState } from "react";
// import "../App.css";
// import { Link, useNavigate } from "react-router-dom";

// const LoginForm = ({ setLoggedIn }) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [sessionToken, setSessionToken] = useState("");
//   const navigate = useNavigate();

//   const submitHandler = (event) => {
//     // event.preventDefault() prevents the browser from performing its default action
//     // In this instance, it will prevent the page from reloading
//     // keeps the form from actually submitting as well
//     event.preventDefault();

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
//           // Successfully logged in
//           console.log(result);
//           // set the auth token and user ID in the session state
//           sessionStorage.setItem("token", result.token);
//           sessionStorage.setItem("user", result.userID);
//           // call setLoggedIn hook from App.jsx to save the login state throughout the app
//           setLoggedIn(true);
//           setSessionToken(result.token);
//           console.log(sessionToken, " SESSION TOKEN");
//           // go to the homepage
//           navigate("/");
//           window.location.reload();
//         }
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   };

//   return (
//     <>
//       <h1>Login</h1>
//       <form onSubmit={submitHandler}>
//         <label>
//           Email
//           <input
//             type="email"
//             // event.target refers to the DOM that is triggered from an event, such as onChange, onClick, etc.
//             // event.target.value holds the value that is passed in to the input field from the onChange
//             onChange={(event) => setEmail(event.target.value)}
//           />
//         </label>
//         <br />
//         <label>
//           Password
//           <input
//             type="password"
//             onChange={(event) => setPassword(event.target.value)}
//           />
//         </label>
//         <input type="submit" className="submitbutton" value="submit" />
//       </form>
//       <div>
//         <p>
//           Register <Link to="/register">here</Link>
//         </p>
//       </div>
//       <div>
//         <p>
//           Reset your password <Link to="/reset-password">here</Link>
//         </p>
//       </div>
//     </>
//   );
// };

// export default LoginForm;
"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Frame from "../assets/Frame.jpg"

const LoginForm = ({ setLoggedIn }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [sessionToken, setSessionToken] = useState("")
  const [isLoading, setIsLoading] = useState(false)
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
          setLoggedIn(true)
          setSessionToken(result.token)
          console.log(sessionToken, " SESSION TOKEN")
          navigate("/")
          window.location.reload()
        }
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <div className="min-h-screen bg-[#1b1b1b] flex flex-col">
      {/* Header */}
      <header className="bg-[#3A3A3A] px-4">
        <div className="max-w-7xl mx-auto flex items-center h-14">
        <img src={Frame} height="32" width="32" alt="QuizRot Logo" className="h-8 w-8 mr-2" />
          <Link to="/" className="text-white text-xl font-bold">
            QuizRot
          </Link>
          <div className="flex-grow"></div>
          <Link
            to="/register"
            className="bg-[#00AEEF] text-white px-3 py-1 text-sm rounded hover:bg-[#00AEEF]/90 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#3a3a3a] p-8 rounded-lg">
          <h1 className="text-2xl font-bold text-white text-center mb-6">Welcome Back!</h1>

          <form onSubmit={submitHandler} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-base text-white font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 rounded bg-white text-black placeholder-gray-400"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-base text-white font-medium">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 py-2 rounded bg-white text-black placeholder-gray-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00aeef] hover:bg-[#00aeef]/90 text-white py-2 rounded transition-colors disabled:opacity-50"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/reset-password" className="text-[#00aeef] text-sm hover:underline">
              Forgot Password?
            </Link>
          </div>

          <div className="mt-4 text-center text-sm">
            <span className="text-white">Don't have an account? </span>
            <Link to="/register" className="text-[#00aeef] hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default LoginForm


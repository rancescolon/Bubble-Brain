// import React, { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";

// const RegisterForm = ({ setLoggedIn }) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   // You can assign the user extra attributes for when they register an account.
//   // As you can see on swagger, attributes is optional where its an object and you
//   // can store extra attributes like profile picture, favorite color, etc.
//   // to fill out when the user creates an account.
//   const [attributes, setAttributes] = useState({
//     additionalProp1: {},
//   });
//   const navigate = useNavigate();

//   const submitHandler = (event) => {
//     // event.preventDefault() prevents the browser from performing its default action
//     // In this instance, it will prevent the page from reloading
//     // keeps the form from actually submitting as well
//     event.preventDefault();

//     fetch(process.env.REACT_APP_API_PATH + "/auth/signup", {
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
//         // Successfully registered an account
//         console.log(result);
//         // set the auth token and user ID in the session state
//         sessionStorage.setItem("token", result.token);
//         sessionStorage.setItem("user", result.userID);
//         // call setLoggedIn hook from App.jsx to save the login state throughout the app
//         setLoggedIn(true);
//         // Reload the window for when the user logs in to show the posts
//         navigate("/");
//         window.location.reload();
//       });
//   };

//   useEffect(() => {
//     // If the user is logged in, make sure they cannot see the login form
//     if (sessionStorage.getItem("token")) {
//       navigate("/");
//     }
//   }, []);

//   return (
//     <>
//       <h1>Register</h1>
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
//           Login <Link to="/">here</Link>
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

// export default RegisterForm;
"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Logo from "../assets/Frame.jpg"

const RegisterForm = ({ setLoggedIn }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [attributes, setAttributes] = useState({
    additionalProp1: {},
  })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const submitHandler = (event) => {
    event.preventDefault()
    setIsLoading(true)

    fetch(process.env.REACT_APP_API_PATH + "/auth/signup", {
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
        console.log(result)
        sessionStorage.setItem("token", result.token)
        sessionStorage.setItem("user", result.userID)
        setLoggedIn(true)
        navigate("/")
        window.location.reload()
      })
      .catch((error) => {
        console.error("Error:", error)
        // Handle error (you might want to show an error message to the user)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    if (sessionStorage.getItem("token")) {
      navigate("/")
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-[#1b1b1b] flex flex-col">
      {/* Header */}
      <header className="bg-[#3A3A3A] px-4">
        <div className="max-w-7xl mx-auto flex items-center h-14">
          <img src={Logo} height="32" width="32" alt="QuizRot Logo" className="h-8 w-8 mr-2" />
          <Link to="/" className="text-white text-xl font-bold">
            QuizRot
          </Link>
          <div className="flex-grow"></div>
          <Link
            to="/"
            className="bg-[#00AEEF] text-white px-3 py-1 text-sm rounded hover:bg-[#00AEEF]/90 transition-colors"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#3a3a3a] p-8 rounded-lg">
          <h1 className="text-2xl font-bold text-white text-center mb-6">Create an Account</h1>

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
                placeholder="Create a password"
                className="w-full px-3 py-2 rounded bg-white text-black placeholder-gray-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00aeef] hover:bg-[#00aeef]/90 text-white py-2 rounded transition-colors disabled:opacity-50"
            >
              {isLoading ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-white">Have an account? </span>
            <Link to="/" className="text-[#00aeef] hover:underline">
              Login
            </Link>
          </div>
          <div className="mt-2 text-center text-sm">
            <Link to="/reset-password" className="text-[#00aeef] hover:underline">
              Reset your password
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default RegisterForm




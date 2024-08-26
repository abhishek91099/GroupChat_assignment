// pages/index.js
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const Register = ({ auth, toggleAuth }) => {
  const router = useRouter()
  const [input, setInput] = useState({
    'username': '',
    'password': ''
  })

  useEffect(() => {
    console.log(input)
  }, [input])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.username.length === 0 || input.password.length === 0) {
      window.alert('Input cannot be empty')
    } else {
      fetch('http://192.168.45.1:5000/register', {
        method: "POST",
        body: JSON.stringify({ "username": input.username, "password": input.password }),
        headers: {
          "Content-Type": "application/json",
        },
      }).then(() => {
        router.push('/')
      }).catch(error => {
        console.log(error)
      })
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 max-w-sm bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Register</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              onChange={(e) => { setInput({ ...input, 'username': e.target.value }) }}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              onChange={(e) => { setInput({ ...input, 'password': e.target.value }) }}
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register

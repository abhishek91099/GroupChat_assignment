'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Login = ({ auth, setAuth,toggleAuth, profile, setProfile }) => {
  const router = useRouter();
  const [input, setInput] = useState({ username: '', password: '' });


  // useEffect(() => {
  //   console.log("Login Component Mounted");
  //   console.log("toggleAuth: ", toggleAuth);
  // }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://192.168.45.1:5000/login', {
        method: "POST",
        body: JSON.stringify({ username: input.username, password: input.password }),
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
      });
      const data = await response.json(); 
      console.log(data.user);
      console.log(data,'finding user')
      if (response.ok) {
        // toggleAuth();
        localStorage.setItem('token', data.token);
        setAuth((prevAuth) => !prevAuth)
        console.log(localStorage.getItem('token'), 'mil gya');
        localStorage.setItem('user', JSON.stringify({username: data.user.username, id: data.user.id}));
        setProfile(input.username);
      } else {  
        window.alert('login failed');
        setInput({username:'', password:''});
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };
  useEffect(() => {
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userString && token) {
      const user = JSON.parse(userString);
      setAuth(true);
      setProfile(user.username);
    }
  }, []);
  useEffect(()=>{
    console.log(profile)
  },[profile])


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 max-w-sm bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <form className="space-y-4" >
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={input.username}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              onChange={(e) => setInput({ ...input, username: e.target.value })}
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
              value={input.password}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              onChange={(e) => setInput({ ...input, password: e.target.value })}
            />
          </div>
          <div>
            <button
              onClick={handleSubmit}
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Login
            </button>
            <div className='flex'>
              <h1 className='cursor-pointer hover:text-cyan-500' onClick={() => router.push('/register')}>New User Register</h1>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
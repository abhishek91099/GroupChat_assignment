'use client';
import React, { useEffect, useState } from 'react';
import Chat from './chats/page';
import Login from './login/page';

const Home = () => {
  const [auth, setAuth] = useState(false);
  const [profile, setProfile] = useState('');

  const toggleAuth = () => {
    setAuth((prevAuth) => !prevAuth);
  };

  useEffect(() => {
    const username = localStorage.getItem('username');
    console.log(username,'here in the app')
    if (username != null) {
      console.log(username.length);
      setAuth(true);  
      setProfile(username);
    }
    console.log(auth);
    // console.log(username.user, 'username');
  }, []);

  return (
    auth ? (
      <Chat auth={auth} toggleAuth={toggleAuth} profile={profile} setProfile={setProfile} />
    ) : (
      <Login auth={auth} toggleAuth={toggleAuth} profile={profile} setProfile={setProfile} />
    )
  );
};

export default Home;
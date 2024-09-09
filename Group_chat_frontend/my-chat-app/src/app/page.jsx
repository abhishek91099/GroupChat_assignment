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

  return (
    auth ? (
      <Chat auth={auth} toggleAuth={toggleAuth} profile={profile} setProfile={setProfile} />
    ) : (
      <Login auth={auth} setAuth={setAuth} toggleAuth={toggleAuth} profile={profile} setProfile={setProfile} />
    )
  );
};

export default Home;
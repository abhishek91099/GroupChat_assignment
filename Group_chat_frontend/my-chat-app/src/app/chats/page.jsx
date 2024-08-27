'use client';
import React, { useState, useEffect, useRef, use } from 'react';
import { io } from 'socket.io-client';
import Create_rooms from './create_rooms';
// import Add_users from './add_user';
import Roommember from './room_members';
// Initialize socket outside the component
let socket = null;

const Chat = ({ auth, toggleAuth, profile, setProfile }) => {
  const [text, setMessage] = useState('');
  const [admin,setAdmin]=useState()
  const [messages, setMessages] = useState([]);
  const [side, setSide] = useState([]);
  const [chat, setChat] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const endOfMessagesRef = useRef(null);
  const [online, setOnline] = useState(new Set());
  const socketRef = useRef(null);
  const token = localStorage.getItem('token');
  const [rooms, setRooms] = useState([]);
  const [room_id, setID] = useState([]);
const fetch_rooms=async ()=>{
  try{
    const response =await fetch('http://192.168.45.1:5000/rooms',{
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include'

    })
    if (response.ok){
      const data =await response.json()
      setRooms(data.rooms)
      

    }
  }catch(error){
    console.log(error)

  }

}

// useEffect(() => {
//   console.log(rooms, 'rooms after update');
// }, [rooms]);
useEffect(()=>{
   fetch_rooms()
   
},[])
useEffect(()=>{
  console.log(rooms,'rooms with admin')
},[rooms])

// useEffect(()=>{
//   console.log(rooms,'hjasbd')
// },[rooms])
  const fetch_messages = async (selectedUser) => {
    try {
      const response = await fetch(`http://192.168.45.1:5000/room_messages/${room_id}`, {
        method: "GET",
        // body: JSON.stringify({ room_id:room_id }),
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
      
        const normalizedMessages = data.messages.map(normalizeMessage);
        setMessages(normalizedMessages);
      }
    } catch (error) {
      console.error("Error during fetching messages:", error);
    }
  };

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!socket && auth) {
      socket = io('http://192.168.45.1:5000', {
        query: { 
          token: localStorage.getItem('token')
        },
        withCredentials: true,
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log(socket.id); // Logs the socket ID when connected
      });

      socket.on('disconnect', () => {
        console.log('disconnected'); // Logs 'disconnected' when the connection is lost
      });

      socket.on('online_users', (users) => {
        setOnline(prevOnline => new Set([...prevOnline, ...users]));
      });

      socket.on('user_disconnected', (userid) => {
        setOnline(prevOnline => {
          const newOnline = new Set(prevOnline);
          newOnline.delete(userid);
          return newOnline;
        });
      });

      // socket.on('new_message', (message) => {
      //   console.log(message,'new_message_recieved')
      //   // ack();
      //   // setMessages(prevMessages => [
      //   //   ...prevMessages,
      //   //   { id: new Date().getTime(), sender: message.user, message: message.text }
      //   // ]);
      // });
      socket.on('welcome',(data)=>{
        console.log(data,'welcome data')
      })
      
      // if (chat) {
        
      //   console.log(chat, 'room name'); 
      //   socket.emit('join_room', chat);
      // }

      // fetch_users();
    }

    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('online_users');
        socket.off('user_disconnected');
        // socket.off('new_message');
        socket.off('welcome')
      }
    };
  }, []);
useEffect(()=>{
  if (chat) {
        console.log('roomid',room_id)
    console.log(chat, 'room name'); 
    socketRef.current.emit('join_room', room_id);
    
    socketRef.current.on('new_message', (messages) => {
      const normalizedMessage = normalizeMessage(messages);
      setMessages(prevMessages => [...prevMessages, normalizedMessage])
    });

  }



},[chat])

const normalizeMessage = (message) => {
  if (message.message_text) {
    // This is from the initial fetch
    return {
      id: message.id,
      user: message.username,
      message: message.message_text,
      timestamp: message.sent_at
    };
  } else {
    // This is from the socket
    return {
      id: message.id,
      user: message.user,
      message: message.message,
      timestamp: message.timestamp
    };
  }
};

useEffect(()=>{
  console.log(messages,'new_mesages')
},[messages])
// useEffect(()=>{
//   socket.emit('join_room',room_id)
// },[chat])
  // useEffect(() => {
  //   console.log('State after update:', online);
  // }, [online]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (text.trim() && socketRef.current) {
      // const newMessage = { id: profile.id, sender: profile.user, message: text, receiver: chat, status: 'sending' };
      // setMessages(prevMessages => [...prevMessages, newMessage]);

      socketRef.current.emit('message', { room_id:room_id, message: text});
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('token');
    try{
    // const response = await fetch('http://192.168.29.145:5000/logout', {
    //   method: "POST",
    //   body: JSON.stringify({ sender: profile }),
    //   headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
    // });
    

    if (socketRef.current) {
      socketRef.current.disconnect();
      socket = null;
      socketRef.current = null;
    }
    
    toggleAuth();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setProfile('');}
    catch(error){
      console.log(error)
    }
  };

  const handle_chat = (item) => {
    setChat(item.room_name);
    setAdmin(item.admin_id)
    setID(item.id)

    
    fetch_messages(item);
  };
  useEffect(()=>{
    fetch_messages()
  },[chat])

  // const filteredUsers = side.filter(user => user.username.toLowerCase().includes(searchQuery.toLowerCase()));


  return (
    <div className="h-screen w-screen flex">
      {auth ? (
        <div className="flex w-full h-full">
          <div className="w-full sm:w-1/4 md:w-1/5 lg:w-1/6 bg-gray-800 text-white p-3 flex flex-col">
            <h1 className="text-lg font-bold mb-4">Chats</h1>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 mb-4 rounded-lg bg-gray-700 text-white outline-none"
            />
            <div className="flex flex-col space-y-2 overflow-auto">
              {rooms.map((item) => {
                if (item.room_name !== profile) {
                  return (
                    <div
                      key={item.id}
                      onClick={() => handle_chat(item)}
                      className="cursor-pointer p-2 rounded-lg hover:bg-gray-700"
                    >
                      {item.room_name ? item.room_name : 'No username'} <span className={`inline-block h-3 w-3 rounded-full ml-2 ${online.has(item.username) ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
            <div className="flex flex-col space-y-2 overflow-auto">

            </div>
            <div>
             <Create_rooms token={token} fetchRooms={fetch_rooms} />

            </div>
          </div>
          <div className="flex-1 flex flex-col h-full">
            <div className="flex items-center justify-between bg-gray-700 p-5 text-white">
            <div className="p-5">
              <h1>{profile}</h1>
                {chat ? (
                  <div> 
                    <h1>
                      {chat}
                      <span className={`inline-block h-3 w-3 rounded-full ml-2 ${online.has(chat) ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                    </h1>
                    {online.has(chat) ? (
                      <h1 className="text-lg  mb-4">online</h1>
                    ) : (
                      <h1>offline</h1>
                    )}
                                          
                                          <Roommember token={token} room_id={room_id} chat={chat} admin={admin}/>
                  </div>

                ) : (
                  <></>
                )}
                        
            </div>

            

              <button onClick={logout} className="bg-red-500 px-4 py-2 rounded-lg">Logout</button>
            </div>
            

            
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
  {messages.map((item, index) => {
    return (
      <div
        key={`${item.id}-${index}`}
        className={`flex flex-col ${item.user === profile ? 'items-start' : 'items-end'}`}
      >
        <div className="text-xs text-gray-400 mb-1">
          {item.user}
        </div>
        <div
          className={`max-w-md p-3 rounded-lg ${item.user === chat ? 'bg-gray-800 text-white' : 'bg-gray-600 text-white'}`}
          style={{ zIndex: index }}
        >
          <div>{item.message}</div>
        </div>
      </div>
    );  
  })}
  <div ref={endOfMessagesRef} />
</div>

            {chat ? (
              <div className="flex items-center p-5 bg-gray-700">
                <input
                  placeholder="Type a message..."
                  type="text"
                  value={text}
                  className="flex-1 p-2 rounded-lg bg-gray-800 text-white outline-none"
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  className="bg-cyan-500 px-4 py-2 ml-2 rounded-lg text-white"
                  onClick={handleSubmit}
                >
                  Send
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-20 bg-gray-700 text-white">
                Select a user to start chatting
              </div>
            )}
          </div>
        </div>
      ) : (
        <h1 className="text-center mt-20 text-2xl">Please login</h1>
      )}
    </div>
  );
};

export default Chat;
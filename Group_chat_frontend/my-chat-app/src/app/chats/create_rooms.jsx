import React, { useState, useEffect, useRef } from 'react';


const Create_rooms = ({token,fetchRooms}) => {
  const [showModal, setShowModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [side,setSide] = useState([]); // Example list of online users

  
  const fetch_users = async () => {
    
    try {
      const response = await fetch('http://192.168.45.1:5000/users', {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setSide(data.users);
      }
    } catch (error) {
      console.error("Error during fetching users:", error);
    }
  };
  useEffect(()=>{
    fetch_users()
  },[])

  const handleCreateRoom = async () => {
    console.log('Room Name:', roomName);
    console.log('Selected Members:', selectedMembers);
    // console.log(tokenobject)
    if (roomName.length==0){
      window.alert('room name cannot be empty')
      return
    }
    // const token=tokenobject.token
    
    try{
      
      const response=await fetch(
        'http://192.168.45.1:5000/create_room',{
        method: "POST",
        body: JSON.stringify({ roomname: roomName}),
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
    })
    if (response.ok) {
      const data=await response.json()

    }
    }catch(error){
      console.log(error)
    }
    
    fetchRooms()
    setRoomName('')
    setShowModal(false);
  };

  const handleMemberToggle = (user) => {
    setSelectedMembers(prev =>
      prev.includes(user)
        ? prev.filter(member => member !== user)
        : [...prev, user]
    );
  };

  return (
    <div>
      <button
        onClick={() => setShowModal(true)}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Create Room
      </button>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg font-bold mb-4 text-black">Create Room</h2>
            <input
              type="text"
              placeholder="Room Name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required={true}
              className="w-full p-2 border border-gray-300 rounded mb-4 text-blue-950"
            />

            <button
              onClick={handleCreateRoom}
              className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            >
              Create Room
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Create_rooms;

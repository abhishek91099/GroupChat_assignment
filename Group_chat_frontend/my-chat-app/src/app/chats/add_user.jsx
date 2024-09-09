import React, { useState, useEffect, useRef } from 'react';


const Add_users = ({token,room}) => {
  const [showModal, setShowModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [side,setSide] = useState([]); 

  
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
        console.log(data,'inside add_user')
        setSide(data.users);
      }
    } catch (error) {
      console.error("Error during fetching users:", error);
    }
  };
  useEffect(()=>{
    fetch_users()
  },[])

  useEffect(()=>{
    console.log(side,'inisde')
  },[side])
  const handleaddmember = async () => {
    console.log('Room Name:', roomName);
    console.log('Selected Members:', selectedMembers);
    // console.log(tokenobject)

    // const token=tokenobject.token
    
    try{
        console.log(room,'room bhai')
      console.log(selectedMembers,'selected')
      const response=await fetch(
        'http://192.168.45.1:5000/add_member',{
        method: "POST",
        body: JSON.stringify({ room_id:room,members: selectedMembers}),
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
    })
    if (response.ok) {
      const data=await response.json()

    }
    }catch(error){
      console.log(error)
    }
    
    // fetchRooms()
    // Close the modal after creating the room
    setRoomName('')
    setShowModal(false);
  };
  const handleMemberToggle = (user) => {
    setSelectedMembers(prevSelected => 
      prevSelected.some(member => member.id === user.id)
        ? prevSelected.filter(member => member.id !== user.id)
        : [...prevSelected, user]
    );
  };

  return (
    <div>
      <button
        onClick={() => setShowModal(true)}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Add user
      </button>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-black">
            <h1>Add user to the group</h1>

            <div className="mb-4">
              <h3 className="font-semibold">Select Members</h3>
              <div className="space-y-2">
              {side.map(user => (
  <div key={user.id} className="flex items-center">
    <input
      type="checkbox"
      id={`user-${user.id}`}
      checked={selectedMembers.some(member => member.id === user.id)}
      onChange={() => handleMemberToggle(user)}
      className="form-checkbox h-5 w-5 text-blue-600 focus:ring-blue-500"
    />
    <label htmlFor={`user-${user.id}`} className="ml-2 text-black">{user.username}</label>
  </div>
))}
              </div>
            </div>
            <button
              onClick={handleaddmember}
              className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            >
              Add user
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

export default Add_users;

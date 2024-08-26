import React, { useState, useEffect, useRef } from 'react';


const Roommember=({token,room_id,chat})=>{
    const[roomMember,setRoomMember]=useState([])
    const [showDropdown, setShowDropdown] = useState(false)

    const fetch_member=async ()=>{
        try{
            console.log('room member fetch')
            const response=await fetch(`http://192.168.45.1:5000/room_members/${room_id}`,
                {
                    method: "GET",
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                    credentials: 'include'
              
                  }
            )
            if (response.ok){
                const data =await response.json()
                console.log('fetched data',data)
                setRoomMember(data)
            }
        }
        catch(error){
            console.log(error)
        }

    }
useEffect(()=>{
        fetch_member()
        
    },[chat])
useEffect(()=>{
        console.log(roomMember,'my room members')
    },[roomMember])
    return (
        <div 
          className="relative"
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <div className="cursor-pointer p-2 bg-gray-300 rounded">Room Members</div>
          
          {showDropdown && (
            <div className="absolute h-48 left-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-10 text-black ">
              <ul className="py-1 text-black">
                {roomMember.members.map(member => (
                  <li key={member.id} className="px-4 py-2  hover:text-black ">
                    {member.username}
                  </li>
                ))}
              </ul>     
            </div>
          )}
        </div>
      );
    };
  
export default Roommember
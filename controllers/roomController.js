import Room from '../models/Room.js';
import User from '../models/User.js';
import RoomMember from '../models/RoomMember.js';
import sequelize from '../db_connect.js';

export const  createRoom = async (req, res) => {
  const { room_name } = req.body;
  const admin_id = req.user.id;
  const transaction = await sequelize.transaction();
  try {
    const room = await Room.create({ room_name, admin_id });
    await room.addUser(admin_id)
    await transaction.commit();
    res.status(201).json(room);
    
  } catch (error) {
    await transaction.rollback()
    res.status(500).json({ error: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  const room_id = req.params.id;
  console.log(req.params.id)
  const transaction = await sequelize.transaction();
  try {
    const room = await Room.findOne({ where: { id: room_id, admin_id: req.user.id } });
    if (!room) {
      return res.status(404).json({ message: 'Room not found or not authorized' });
    }
    await room.destroy();
    await transaction.commit();
    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    await transaction.rollback()
    res.status(500).json({ error: error.message });
  }
};


export const addMemberToRoom=async (req, res)=>{
  const room_id = parseInt(req.params.id,10);
  const { username } = req.body;
  const admin_id = req.user.id;
  console.log(typeof room_id,username,typeof admin_id,'here')
  const transaction = await sequelize.transaction();


  try {   
    

    const room = await Room.findOne({ where: { id:room_id, admin_id } });
    if (!room) {
      return res.status(403).json({ message: 'Not authorized or room not found' });
    }

    const user = await User.findOne({ where: { username } });
    console.log(user,'agaya')
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const ispresent = await RoomMember.findOne({ where: { user_id:user.id } });
    if (ispresent) {
      return res.status(401).json({ message: 'username already present' });
    }

    await RoomMember.create({ room_id, user_id: user.id });
    await transaction.commit();
    res.status(201).json({ message: 'User added to room' });
  } catch (error) {
    await transaction.rollback()
    res.status(500).json({ message: error.message });
    console.log('idhar')
  }
}

export const getRooms = async (req,res)=>{
  const { id: room_id } = req.params;
  try{
    const rooms =await Room.findAll()
    return res.status(200).json({rooms})
  }
  catch(error){
    res.status(500).json({error})
    console.log(error)
  }


}

export const removeMember =async (req,res)=>{
  const room_id=req.params.id
  const {username}=req.body
  const transaction = await sequelize.transaction();

  try{
    const rooms =await Room.findOne({where:{id:room_id}})
    if (!rooms){
      return res.status(404).json({message:'No room exist'})
    }  
    const user=await User.findOne({where:{username}})
    if(!user){
      return res.status(404).json({message:'No user exist'})
    }
  const ispresent=await RoomMember.findOne({where:{user_id:user.id}})
  if (!ispresent){
    return res.status(404).json({message:'User not present'})
  }
  await RoomMember.destroy({ 
    where: { 
      room_id, 
      user_id: user.id 
    } 
  })
  await transaction.commit();

  return res.status(200).json({message:`User removed successfully ${user.username}`})
  }
  catch(error){
    await transaction.rollback()
    console.log(error)
    res.status(500).json({error})
  }
}
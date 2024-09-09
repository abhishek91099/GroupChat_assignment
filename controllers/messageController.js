
import Message from '../models/Message.js';
import User from '../models/User.js';
import Room from './../models/Room.js';
import sequelize from '../db_connect.js';
export async function sendMessage(req, res) {
  const { room_id } = req.params;
  const { message_text } = req.body;
  const user_id = req.user.id; // Assuming `req.user` is populated by the auth middleware
  const transaction = await sequelize.transaction();

  try {
    const Rooms=await Room.findOne({where:{id:room_id}})
    if (!Rooms){
      return res.status(404).json({message:'room does not exists'})
    }
    const message = await Message.create({ room_id, user_id, message_text });
    await transaction.commit();
    res.status(201).json(message);
  } catch (error) {
    await transaction.rollback()
    res.status(500).json({ message: error.message });
  }
}

export async function getMessages(req, res) {
  const {room_id } = req.params;
  console.log(room_id,'yaha par')

  try {
    const Rooms=await Room.findOne({where: { id: room_id }})
    console.log(Rooms,'yahahahah')
    if (!Rooms){

      return res.status(404).json({message:'room does not exists'})
    }
    const messages = await Message.findAll({ 
      where: { room_id },
      include: [{ model: User, attributes: ['username'] }], // Optionally include user info
      order: [['sent_at', 'ASC']] 
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
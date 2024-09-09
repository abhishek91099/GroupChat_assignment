import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { 
    saveMessage, 
    getRoomMessages,
  handle_adduser, 
  handlelogin, 

  createRoom, 
  addMemberToRoom, 
  deleteRoom, 
  removeMemberFromRoom, 
  changeRoomAdmin,
  getRoomMembers,
  getRooms,
  getallusers

} from './db_operations.js';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors'

dotenv.config();

const app = express();
app.use(cookieParser());
const server = http.createServer(app);
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST'],
  },
});

app.use(express.json());

// app.use(express.static('public'));

const JWT_SECRET = process.env.JWT_SECRET 


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  // console.log('here',authHeader)

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};


app.get('/', (req, res) => {
  res.send('ok');
});

app.get('/room_messages/:room_id', authenticateToken, async (req, res) => {
    try {
      const { room_id } = req.params;
      const messages = await getRoomMessages(room_id);
      res.json({ messages });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching room messages' });
    }
  });
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await handlelogin(username, password);
    if (user) {
      
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
        res.json({ message: 'Logged in successfully', token, user });
  
    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/logout', authenticateToken, (req, res) => {
  // handlelogout(req.user.id);
  // console.log('here')
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    await handle_adduser(username, password);
    res.json({ message: 'User registered successfully' });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error registering user' });
  }
});

app.post('/create_room', authenticateToken, async (req, res) => {
  // console.log(req.body)
  try {
    const { roomname } = req.body;
    const room = await createRoom(roomname, req.user.id);
    res.json({ message: 'Room created successfully', room });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error creating room' });

  }
});

app.post('/add_member', authenticateToken, async (req, res) => {
  try {
    const { room_id, members } = req.body;
    console.log(req.user.id,'this is user admin')
    
    // console.log(members,'add_users')
    
    for (const item of members) {
      if(item.id !=req.user.id){
      console.log(room_id,'room_id')
      await addMemberToRoom(room_id, item.username, req.user.id);}
    }
    res.json({ message: 'Member added successfully' });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error adding member' });
  }
});

app.delete('/delete_room', authenticateToken, async (req, res) => {
  try {
    const { room_id } = req.body;
    await deleteRoom(room_id, req.user.id);
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting room' });
  }
});
app.get('/users',authenticateToken,async (req,res)=>{
  try{
    // console.log('here')
    const users=await getallusers()
    res.json({users})
  }catch(error){
    console.log(error)
    res.status(500).json({message:'Error geting users'})
  }
})


app.post('/remove_member', authenticateToken, async (req, res) => {
  try {
    const { room_id, username } = req.body;
    await removeMemberFromRoom(room_id, username, req.user.id);
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing member' });
  }
});

app.post('/change_admin', authenticateToken, async (req, res) => {
  try {
    const { room_id, new_admin_username } = req.body;
    await changeRoomAdmin(room_id, new_admin_username, req.user.id);
    res.json({ message: 'Room admin changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing room admin' });
  }
});

app.get('/room_members/:room_id', authenticateToken, async (req, res) => {
  try {
    const { room_id } = req.params;
    const members = await getRoomMembers(room_id, req.user.id);
    res.json({ members });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room members' });
  }
});

app.get('/rooms', authenticateToken, async (req, res) => {
  try {
    const rooms = await getRooms(req.user.id);
    res.json({ rooms });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms' });
  }
});





io.use((socket, next) => {
  // console.log('Handshake query:', socket.handshake.query);
  // console.log('Handshake headers:', socket.handshake.headers);
  // const cookies = socket.request
  // console.log(cookies.cookie)
  const token=socket.handshake.query.token

    if (token) {
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return next(new Error('Authentication error'));
        socket.user = decoded;
        next();
      });
    } else {
      next(new Error('Authentication error'));
    }

});



io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.username}`);

  socket.emit('welcome', `Welcome to the chat, ${socket.user.username}!`);

  socket.on('join_room', (room) => {
    console.log(socket.user.username,room,'join_ned room')
    socket.join(room)
    
    socket.to(room).emit('user_joined', `${socket.user.username} joined the room`);
  });

  socket.on('leave_room', (room) => {
    socket.leave(room);
    socket.to(room).emit('user_left', `${socket.user.username} left the room`);
  });

  socket.on('message', async ({ room_id, message }) => {
    try {
      const savedMessage = await saveMessage(room_id, socket.user.id, message);
      console.log(message,'recieved',room_id,'this room id from',socket.user.username)
      const clientsInRoom = io.sockets.adapter.rooms.get(room_id);
    
    if (clientsInRoom) {
      console.log(`Clients in room ${room_id}:`, Array.from(clientsInRoom));
    } else {
      console.log(`Room ${room_id} does not exist or has no clients.`);
    }
  

      io.to(room_id).emit('new_message', {
        id: savedMessage.id,
        user: socket.user.username,
        message: savedMessage.message_text,
        timestamp: savedMessage.sent_at
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.username}`);
  });

});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, server, io };
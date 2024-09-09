import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import sequelize from './db_connect.js';
import { verifyToken } from './middlewares/authMiddleware.js';
import http from 'http';
import { Server } from 'socket.io';
dotenv.config();
import cors from 'cors'
const app = express();
const port = process.env.PORT || 5000;
// const app = express();
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

app.use(express.json());
// Middleware// For parsing application/json

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', verifyToken, messageRoutes);
app.use('/api/rooms', roomRoutes);

// Test DB Connection and Sync Models
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    // Sync models with the database
    return sequelize.sync();
  })
  .then(() => {
    console.log('All models were synchronized successfully.');
    // Start the server
    server.listen(5000, () => {
      console.log(`Server running on port 5000`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
  export default server;
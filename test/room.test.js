import request from 'supertest';
import server from '../server.js'; // Adjust the path to your Express server
import sequelize from '../db_connect.js';
import User from '../models/User.js';
import Room from '../models/Room.js';
import RoomMember from '../models/RoomMember.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config(); 

const logFilePath = path.join(__dirname, 'logs.txt');

function logError(error) {
  const logMessage = `${new Date().toISOString()} - ${error}\n`;
  fs.appendFileSync(logFilePath, logMessage);
}

describe('Auth and Room Routes', () => {
  let adminToken;
  let userToken;
  let testUser;

  beforeAll(async () => {
    try {
      // Synchronize the database before running tests
      await sequelize.sync({ force: true });

      // Create test users
      const admin = await User.create({
        username: 'admin',
        password: await bcrypt.hash('adminpass', 10),
        role: 'admin'
      });
      const user = await User.create({
        username: 'user',
        password: await bcrypt.hash('userpass', 10),
        role: 'user'
      });

      // Generate tokens
      adminToken = jwt.sign({ id: admin.id, username: admin.username, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
      userToken = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // Create a test user for auth tests
      testUser = await User.create({
        username: 'testuser',
        password: await bcrypt.hash('password123', 10),
        role: 'user',
      });
    } catch (error) {
      logError(error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      // Close the database connection after all tests
      await sequelize.close();
      await server.close(); // Close the server after all tests
    } catch (error) {
      logError(error);
    }
  });

  describe('Auth Controller', () => {
    test('POST /api/auth/login should log in a user with valid credentials', async () => {
      try {
        const res = await request(server)
          .post('/api/auth/login')
          .send({ username: 'testuser', password: 'password123' });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
      } catch (error) {
        logError(error);
        throw error;
      }
    });

    test('POST /api/auth/login should return 401 for invalid credentials', async () => {
      try {
        const res = await request(server)
          .post('/api/auth/login')
          .send({ username: 'testuser', password: 'wrongpassword' });

        expect(res.statusCode).toBe(401);
      } catch (error) {
        logError(error);
        throw error;
      }
    });

    test('POST /api/auth/register should create a new user', async () => {
      try {
        const res = await request(server)
          .post('/api/auth/register')
          .send({ username: 'newuser', password: 'password123', role: 'user' });
          console.log('Response Status: yaha', res.statusCode);
          console.log('Response Body:', res.body);
        expect(res.statusCode).toBe(201);
        expect(res.body.user).toBeDefined();
      } catch (error) {
        logError(error);
        throw error;
      }
    });
    

    test('POST /api/auth/register should return 400 if username already exists', async () => {
      try {
        const res = await request(server)
          .post('/api/auth/register')
          .send({ username: 'testuser', password: 'password123', role: 'user' });

        expect(res.statusCode).toBe(400);
      } catch (error) {
        logError(error);
        throw error;
      }
    });
  });

  describe('Room Routes', () => {
    test('should create a room', async () => {
      const response = await request(server)
        .post('/api/rooms/createRoom')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ room_name: 'Test Room' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('room_name', 'Test Room');
      expect(response.body).toHaveProperty('admin_id');
    });

    test('should get all rooms', async () => {
      const response = await request(server)
        .get('/api/rooms/getRooms')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.rooms).toBeInstanceOf(Array);
    });

    test('should delete a room', async () => {
      const room = await Room.create({ room_name: 'Room to delete', admin_id: 1 });
      
      const response = await request(server)
        .delete(`/api/rooms/${room.id}/deleteRoom`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Room deleted successfully');
    });

    test('should add a member to a room', async () => {
      const room = await Room.create({ room_name: 'Room to add member', admin_id: 1 });
      
      const response = await request(server)
        .post(`/api/rooms/${room.id}/addmembers`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: 'user' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User added to room');
    });

    test('should remove a member from a room', async () => {
      const room = await Room.create({ room_name: 'Room to remove member', admin_id: 1 });
      const user = await User.create({ username: 'member', password: 'memberpass', role: 'user' });
      
      await RoomMember.create({ room_id: room.id, user_id: user.id });
      
      const response = await request(server)
        .post(`/api/rooms/${room.id}/removeMember`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: 'member' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'User removed successfully member');
    });
  });
});

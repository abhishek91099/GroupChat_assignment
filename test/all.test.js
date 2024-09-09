import request from 'supertest';
import server from '../server.js'; // Adjust the path to your Express server
import sequelize from '../db_connect.js';
import Room from '../models/Room.js';
import User from '../models/User.js';
import RoomMember from '../models/RoomMember.js';
import jwt from 'jsonwebtoken'; // Ensure you have a way to generate JWT tokens

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Room Routes', () => {
  let adminToken;
  let nonAdminToken;
  let roomId;
  let admin;
  let nonAdminUser;

  beforeAll(async () => {
    admin = await User.create({ username: 'admin', password: 'adminpass', role: 'admin' });
    nonAdminUser = await User.create({ username: 'nonadmin', password: 'nonadminpass', role: 'user' });

    adminToken = jwt.sign({ id: admin.id }, process.env.JWT_SECRET);
    nonAdminToken = jwt.sign({ id: nonAdminUser.id }, process.env.JWT_SECRET);

    const room = await Room.create({ room_name: 'Test Room', admin_id: admin.id });
    roomId = room.id;
  });

  test('should allow admin to create a room', async () => {
    const response = await request(server)
      .post('/api/rooms/createRoom')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ room_name: 'Admin Room' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('room_name', 'Admin Room');
    expect(response.body).toHaveProperty('admin_id', admin.id);
  });

  test('should not allow non-admin to delete a room', async () => {
    const response = await request(server)
      .delete(`/api/rooms/${roomId}/deleteRoom`)
      .set('Authorization', `Bearer ${nonAdminToken}`);

    expect(response.status).toBe(403);
  });

  test('should not allow non-admin to add members to a room', async () => {
    const response = await request(server)
      .post(`/api/rooms/${roomId}/addmembers`)
      .set('Authorization', `Bearer ${nonAdminToken}`)
      .send({ username: 'nonadmin' });

    expect(response.status).toBe(403);
  });

  test('should not allow non-admin to remove members from a room', async () => {
    await RoomMember.create({ room_id: roomId, user_id: nonAdminUser.id });

    const response = await request(server)
      .post(`/api/rooms/${roomId}/removeMember`)
      .set('Authorization', `Bearer ${nonAdminToken}`)
      .send({ username: 'nonadmin' });

    expect(response.status).toBe(403);
  });

  test('should allow admin to delete a room', async () => {
    const response = await request(server)
      .delete(`/api/rooms/${roomId}/deleteRoom`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Room deleted successfully');
  });

  test('should allow admin to add members to a room', async () => {
    await User.create({ username: 'newuser', password: 'newpass', role: 'user' }); // Add a new user
    const response = await request(server)
      .post(`/api/rooms/${roomId}/addmembers`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'newuser' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'User added to room');
  });

  test('should allow admin to remove members from a room', async () => {
    const user = await User.findOne({ where: { username: 'newuser' } });
    await RoomMember.create({ room_id: roomId, user_id: user.id });

    const response = await request(server)
      .post(`/api/rooms/${roomId}/removeMember`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'newuser' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'User removed successfully newuser');
  });

  test('should get all rooms', async () => {
    const response = await request(server)
      .get('/api/rooms/getRooms');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('rooms');
    expect(Array.isArray(response.body.rooms)).toBe(true);
  });
});

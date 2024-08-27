import request from 'supertest';
import { app } from '../server';
import { describe, it, expect } from '@jest/globals'; // Jest global functions

let authToken;

describe('API Tests', () => {
  
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/register')    
      .send({ username: 'testuser1', password: 'testpass1' });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('User registered successfully');
  });

  it('should login a user', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'testuser1', password: 'testpass1' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    authToken = res.body.token;
  });

  it('should create a room', async () => {
    const res = await request(app)
      .post('/create_room')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ roomname: 'TestRoom' });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Room created successfully');
  });

  it('should get rooms', async () => {
    const res = await request(app)
      .get('/rooms')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('rooms');
    expect(Array.isArray(res.body.rooms)).toBe(true);
  });



  it('should get all users', async () => {
    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('users');
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  it('should get room messages', async () => {
    const res = await request(app)
      .get('/room_messages/1')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('messages');
    expect(Array.isArray(res.body.messages)).toBe(true);
  });

 
})
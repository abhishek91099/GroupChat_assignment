// controllers/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
const JWT_SECRET ='eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTcyNDQyNTcxMSwiaWF0IjoxNzI0NDI1NzExfQ.ztWMJNWduUDH8ZG_V_2tP6ugLJP9SERkY_6KpRD5kwQ'
import sequelize from '../db_connect.js';
// Handle user login
export async function handleLogin(req, res) {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred during login' });
  }
}
// Handle user registration
export async function handleRegister(req, res) {
  const { username, password, role } = req.body;
  
  const transaction = await sequelize.transaction();
  try {
    const user = await User.findOne({ where: { username } });
    if (user) {
      await transaction.rollback()
      return res.status(400).json({ message: 'username already taken' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await User.create({ username, password: hashedPassword, role });
    await transaction.commit();
    res.status(201).json({ message: 'User registered successfully', user: newUser });

  } catch (error) {
    await transaction.rollback()
    res.status(500).json({ message: error.message });
  }
}

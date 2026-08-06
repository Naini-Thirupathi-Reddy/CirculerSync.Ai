import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import prisma from '../config/prisma.js';
import { SEED_USERS } from '../utils/mockStore.js';

// Memory fallback user store initialized with seed users
let users = [...SEED_USERS];

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['PRODUCER', 'CONSUMER', 'LOGISTICS', 'ADMIN']),
  orgName: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const signup = async (req, res) => {
  try {
    const data = signupSchema.parse(req.body);
    const existing = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const newUser = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
      orgName: data.orgName || data.name,
      address: data.address || 'New York, NY',
      lat: data.lat || 40.7128,
      lng: data.lng || -74.0060,
      phone: data.phone || '+1 212-555-0199',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name, orgName: newUser.orgName },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return res.status(201).json({ token, user: userWithoutPassword });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, orgName: user.orgName },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { passwordHash: _, ...userWithoutPassword } = user;
    return res.json({ token, user: userWithoutPassword });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { passwordHash: _, ...userWithoutPassword } = user;
    return res.json({ user: userWithoutPassword });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const demoLogin = async (req, res) => {
  try {
    const role = (req.body.role || 'PRODUCER').toUpperCase();
    const demoUser = users.find(u => u.role === role) || users[0];

    const token = jwt.sign(
      { id: demoUser.id, email: demoUser.email, role: demoUser.role, name: demoUser.name, orgName: demoUser.orgName },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { passwordHash: _, ...userWithoutPassword } = demoUser;
    return res.json({ token, user: userWithoutPassword, message: `Logged in as demo ${role}` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

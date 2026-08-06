import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { SEED_USERS } from '../utils/mockStore.js';

let users = [...SEED_USERS];

export const signup = async (req, res) => {
  try {
    const body = req.body || {};
    const name = (body.name || 'User').trim();
    const email = (body.email || 'user@example.com').trim().toLowerCase();
    const role = (body.role || 'PRODUCER').toUpperCase();
    const orgName = (body.orgName || name).trim();
    const address = (body.address || 'Siddipet, India').trim();
    const phone = body.phone || '+1 212-555-0199';

    // Find existing or create new user
    let user = users.find(u => u.email.toLowerCase() === email);
    if (!user) {
      user = {
        id: `user-${Date.now()}`,
        name,
        email,
        passwordHash: '',
        role,
        orgName,
        address,
        lat: 40.7128,
        lng: -74.0060,
        phone,
        createdAt: new Date().toISOString(),
      };
      users.push(user);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, orgName: user.orgName },
      env.JWT_SECRET || 'circular_sync_jwt_secret_key_2026_super_secure',
      { expiresIn: '24h' }
    );

    const { passwordHash: _, ...userWithoutPassword } = user;
    return res.status(201).json({ token, user: userWithoutPassword });
  } catch (err) {
    const fallbackUser = {
      id: `u-${Date.now()}`,
      name: req.body?.name || 'SPOORTHI',
      email: req.body?.email || 'spoorthireddy@gmail.com',
      role: (req.body?.role || 'PRODUCER').toUpperCase(),
      orgName: req.body?.orgName || 'spoors',
      address: req.body?.address || 'Siddipet',
    };
    const token = jwt.sign(
      fallbackUser,
      env.JWT_SECRET || 'circular_sync_jwt_secret_key_2026_super_secure',
      { expiresIn: '24h' }
    );
    return res.status(200).json({ token, user: fallbackUser });
  }
};

export const login = async (req, res) => {
  try {
    const { email } = req.body || {};
    const reqEmail = (email || 'sarah@greenbean.com').trim().toLowerCase();

    let user = users.find(u => u.email.toLowerCase() === reqEmail);
    if (!user) {
      user = {
        id: `user-${Date.now()}`,
        name: email ? email.split('@')[0] : 'Sarah Jenkins',
        email: reqEmail,
        passwordHash: '',
        role: 'PRODUCER',
        orgName: email ? `${email.split('@')[0]}'s Hub` : 'GreenBean Cafe & Bakery',
        address: 'New York, NY',
        lat: 40.7128,
        lng: -74.0060,
        phone: '+1 212-555-0199',
        createdAt: new Date().toISOString(),
      };
      users.push(user);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, orgName: user.orgName },
      env.JWT_SECRET || 'circular_sync_jwt_secret_key_2026_super_secure',
      { expiresIn: '24h' }
    );

    const { passwordHash: _, ...userWithoutPassword } = user;
    return res.json({ token, user: userWithoutPassword });
  } catch (err) {
    const fallbackUser = SEED_USERS[0];
    const token = jwt.sign(
      { id: fallbackUser.id, email: fallbackUser.email, role: fallbackUser.role, name: fallbackUser.name, orgName: fallbackUser.orgName },
      env.JWT_SECRET || 'circular_sync_jwt_secret_key_2026_super_secure',
      { expiresIn: '24h' }
    );
    return res.json({ token, user: fallbackUser });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const googleEmail = (req.body?.email || 'user.gmail@gmail.com').toLowerCase();
    const googleName = req.body?.name || 'Google User';

    let user = users.find(u => u.email.toLowerCase() === googleEmail);
    if (!user) {
      user = {
        id: `google-${Date.now()}`,
        name: googleName,
        email: googleEmail,
        passwordHash: '',
        role: 'PRODUCER',
        orgName: `${googleName}'s Organic Hub`,
        address: 'New York, NY',
        lat: 40.7230,
        lng: -73.9985,
        phone: '+1 212-555-0999',
        createdAt: new Date().toISOString(),
      };
      users.push(user);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, orgName: user.orgName },
      env.JWT_SECRET || 'circular_sync_jwt_secret_key_2026_super_secure',
      { expiresIn: '24h' }
    );

    const { passwordHash: _, ...userWithoutPassword } = user;
    return res.json({ token, user: userWithoutPassword, message: 'Authenticated with Google' });
  } catch (err) {
    const fallbackUser = SEED_USERS[0];
    const token = jwt.sign(
      { id: fallbackUser.id, email: fallbackUser.email, role: fallbackUser.role, name: fallbackUser.name, orgName: fallbackUser.orgName },
      env.JWT_SECRET || 'circular_sync_jwt_secret_key_2026_super_secure',
      { expiresIn: '24h' }
    );
    return res.json({ token, user: fallbackUser });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id) || SEED_USERS[0];
    const { passwordHash: _, ...userWithoutPassword } = user;
    return res.json({ user: userWithoutPassword });
  } catch (err) {
    return res.json({ user: SEED_USERS[0] });
  }
};

export const demoLogin = async (req, res) => {
  try {
    const role = (req.body?.role || 'PRODUCER').toUpperCase();
    const demoUser = users.find(u => u.role === role) || users[0];

    const token = jwt.sign(
      { id: demoUser.id, email: demoUser.email, role: demoUser.role, name: demoUser.name, orgName: demoUser.orgName },
      env.JWT_SECRET || 'circular_sync_jwt_secret_key_2026_super_secure',
      { expiresIn: '24h' }
    );

    const { passwordHash: _, ...userWithoutPassword } = demoUser;
    return res.json({ token, user: userWithoutPassword, message: `Logged in as demo ${role}` });
  } catch (err) {
    const fallbackUser = SEED_USERS[0];
    const token = jwt.sign(
      { id: fallbackUser.id, email: fallbackUser.email, role: fallbackUser.role, name: fallbackUser.name, orgName: fallbackUser.orgName },
      env.JWT_SECRET || 'circular_sync_jwt_secret_key_2026_super_secure',
      { expiresIn: '24h' }
    );
    return res.json({ token, user: fallbackUser });
  }
};

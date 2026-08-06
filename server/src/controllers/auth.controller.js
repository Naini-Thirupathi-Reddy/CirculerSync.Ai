import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { SEED_USERS } from '../utils/mockStore.js';

// ─── In-Memory User Store ────────────────────────────────
// Each user: { id, name, email, passwordHash, role, orgName, address }
const users = SEED_USERS.map((u) => ({
  ...u,
  passwordHash: u.passwordHash || null,
}));

// ─── Helper: create JWT ──────────────────────────────────
const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name, orgName: user.orgName },
    env.JWT_SECRET,
    { expiresIn: '24h' },
  );

// ═══════════════════════════════════════════════════════════
//  1. SIGN UP  — email + password + name
// ═══════════════════════════════════════════════════════════
export const signup = async (req, res) => {
  try {
    const { email, password, name, orgName } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Check if email already exists
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const newUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'PRODUCER',
      orgName: orgName?.trim() || `${name.trim()}'s Organization`,
      address: 'New York, NY',
    };
    users.push(newUser);

    // Issue JWT
    const token = signToken(newUser);
    const { passwordHash: _, ...safeUser } = newUser;

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error('[signup]', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

// ═══════════════════════════════════════════════════════════
//  2. SIGN IN  — email + password
// ═══════════════════════════════════════════════════════════
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'No account found with this email. Please sign up first.' });
    }

    // If user has no password (seed user), allow setting one on first login
    if (!user.passwordHash) {
      const passwordHash = await bcrypt.hash(password, 12);
      user.passwordHash = passwordHash;
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    // Issue JWT
    const token = signToken(user);
    const { passwordHash: _, ...safeUser } = user;

    return res.json({
      message: 'Signed in successfully.',
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

// ═══════════════════════════════════════════════════════════
//  3. GET /auth/me  — Verify JWT & return current user
// ═══════════════════════════════════════════════════════════
export const getMe = async (req, res) => {
  try {
    const user = users.find((u) => u.id === req.user?.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const { passwordHash: _, ...safeUser } = user;
    return res.json({ user: safeUser });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ═══════════════════════════════════════════════════════════
//  4. Demo login — for hackathon judges (skip real auth)
// ═══════════════════════════════════════════════════════════
export const demoLogin = async (req, res) => {
  const role = (req.body?.role || 'PRODUCER').toUpperCase();
  const user = users.find((u) => u.role === role) || users[0];
  const token = signToken(user);
  const { passwordHash: _, ...safeUser } = user;
  return res.json({ token, user: safeUser, message: `Demo ${role} login.` });
};

// ═══════════════════════════════════════════════════════════
//  Legacy aliases (backward compat for routes)
// ═══════════════════════════════════════════════════════════
export const googleAuth = login;
export const verifyOtp = (req, res) => res.status(410).json({ error: 'OTP flow removed. Use email/password.' });
export const resendOtp = (req, res) => res.status(410).json({ error: 'OTP flow removed. Use email/password.' });

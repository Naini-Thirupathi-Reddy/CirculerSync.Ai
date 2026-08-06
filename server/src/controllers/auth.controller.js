import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';
import { SEED_USERS } from '../utils/mockStore.js';

// ─── In-Memory User Store ────────────────────────────────
let users = [...SEED_USERS];

// ─── Google OAuth2 Client for token verification ─────────
const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

// ─── Secure OTP Store ────────────────────────────────────
// Key: email -> { hashedOtp, rawOtpDemo, expiresAt, attempts, lastResentAt }
const otpStore = new Map();

// ─── Nodemailer Transport ────────────────────────────────
const createEmailTransporter = () => {
  if (env.SMTP_USER && env.SMTP_PASS &&
      env.SMTP_USER !== 'your_gmail_address@gmail.com' &&
      env.SMTP_PASS !== 'your_gmail_app_password') {
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return null;
};

const sendOtpEmail = async (recipientEmail, otpCode) => {
  const transporter = createEmailTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: '"CircularSync AI" <noreply@circularsync.com>',
        to: recipientEmail,
        subject: '🔒 Your CircularSync AI Login Code',
        html: `<div style="font-family:Arial;max-width:400px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:8px;background:#f7f5f0;">
          <h2 style="color:#241b14;text-align:center;">CircularSync AI</h2>
          <p>Your one-time verification code is:</p>
          <div style="background:#5c6e45;color:#fff;font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;padding:15px;border-radius:6px;margin:16px 0;">${otpCode}</div>
          <p style="color:#888;font-size:12px;text-align:center;">Valid for 5 minutes. Do not share.</p>
        </div>`,
      });
      console.log(`[Email] OTP sent to ${recipientEmail}`);
    } catch (err) {
      console.warn(`[Email] Failed: ${err.message}`);
    }
  } else {
    console.log(`[Dev] OTP for ${recipientEmail}: ${otpCode}`);
  }
};

// ─── Helper: find or create user ─────────────────────────
const findOrCreateUser = (email, name) => {
  let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    const username = name || email.split('@')[0];
    user = {
      id: `usr-${Date.now()}`,
      name: username,
      email: email.toLowerCase(),
      role: 'PRODUCER',
      orgName: `${username}'s Organization`,
      address: 'New York, NY',
    };
    users.push(user);
  }
  return user;
};

// ─── Helper: create JWT ──────────────────────────────────
const createToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name, orgName: user.orgName },
    env.JWT_SECRET,
    { expiresIn: '24h' },
  );

// ─── Helper: generate & store OTP ────────────────────────
const generateAndStoreOtp = async (email) => {
  const rawOtp = crypto.randomInt(100000, 999999).toString();
  const hashedOtp = await bcrypt.hash(rawOtp, 10);
  otpStore.set(email, {
    hashedOtp,
    rawOtpDemo: rawOtp,
    expiresAt: Date.now() + 5 * 60 * 1000,
    attempts: 0,
    lastResentAt: Date.now(),
  });
  return rawOtp;
};

// ═══════════════════════════════════════════════════════════
//  1. REAL Google Sign-In — verify Google's JWT credential
// ═══════════════════════════════════════════════════════════
export const googleAuth = async (req, res) => {
  try {
    const { credential, email: fallbackEmail } = req.body;

    let verifiedEmail = null;
    let verifiedName = null;

    // ── Path A: Real Google credential token from GSI ─────
    if (credential) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        verifiedEmail = payload.email;
        verifiedName = payload.name || payload.given_name;

        if (!payload.email_verified) {
          return res.status(403).json({ error: 'Google account email is not verified.' });
        }
      } catch (verifyErr) {
        return res.status(401).json({ error: 'Invalid Google credential. Please sign in again.' });
      }
    }
    // ── Path B: Plain email (fallback for demo/dev) ──────
    else if (fallbackEmail) {
      verifiedEmail = fallbackEmail.trim().toLowerCase();
    } else {
      return res.status(400).json({ error: 'Google credential or email is required.' });
    }

    // Rate-limit check
    const existing = otpStore.get(verifiedEmail);
    if (existing && Date.now() - existing.lastResentAt < 60000) {
      const wait = Math.ceil((60000 - (Date.now() - existing.lastResentAt)) / 1000);
      return res.status(429).json({ error: `Please wait ${wait}s before requesting a new OTP.`, waitSeconds: wait, requiresOtp: true, email: verifiedEmail });
    }

    // Generate OTP
    const rawOtp = await generateAndStoreOtp(verifiedEmail);
    findOrCreateUser(verifiedEmail, verifiedName);
    await sendOtpEmail(verifiedEmail, rawOtp);

    return res.json({
      message: 'OTP sent.',
      email: verifiedEmail,
      name: verifiedName,
      requiresOtp: true,
      demoOtp: rawOtp,          // shown on-screen for hackathon demo
      expiresAt: Date.now() + 300000,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ═══════════════════════════════════════════════════════════
//  2. Verify OTP
// ═══════════════════════════════════════════════════════════
export const verifyOtp = async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const otp = (req.body.otp || '').toString().trim();

    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required.' });

    const record = otpStore.get(email);
    if (!record) return res.status(400).json({ error: 'No OTP session. Request a new one.', canResend: true });
    if (record.attempts >= 5) { otpStore.delete(email); return res.status(429).json({ error: 'Max attempts reached. Request a new OTP.', canResend: true }); }
    if (Date.now() > record.expiresAt) return res.status(400).json({ error: 'OTP Expired', canResend: true });

    record.attempts += 1;
    const valid = await bcrypt.compare(otp, record.hashedOtp);
    if (!valid && otp !== record.rawOtpDemo) {
      return res.status(400).json({ error: 'Invalid OTP', remainingAttempts: 5 - record.attempts });
    }

    otpStore.delete(email);
    const user = findOrCreateUser(email);
    const token = createToken(user);
    const { passwordHash: _, ...safe } = user;
    return res.json({ message: 'Authenticated.', token, user: safe });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ═══════════════════════════════════════════════════════════
//  3. Resend OTP (rate-limited 60 s)
// ═══════════════════════════════════════════════════════════
export const resendOtp = async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'Email required.' });

    const existing = otpStore.get(email);
    if (existing && Date.now() - existing.lastResentAt < 60000) {
      const wait = Math.ceil((60000 - (Date.now() - existing.lastResentAt)) / 1000);
      return res.status(429).json({ error: `Wait ${wait}s.`, waitSeconds: wait });
    }

    const rawOtp = await generateAndStoreOtp(email);
    await sendOtpEmail(email, rawOtp);
    return res.json({ message: 'New OTP sent.', email, demoOtp: rawOtp, expiresAt: Date.now() + 300000 });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ═══════════════════════════════════════════════════════════
//  Legacy endpoints (backward compat)
// ═══════════════════════════════════════════════════════════
export const login = googleAuth;
export const signup = googleAuth;

export const getMe = async (req, res) => {
  const user = users.find(u => u.id === req.user?.id) || SEED_USERS[0];
  const { passwordHash: _, ...safe } = user;
  res.json({ user: safe });
};

export const demoLogin = async (req, res) => {
  const role = (req.body?.role || 'PRODUCER').toUpperCase();
  const user = users.find(u => u.role === role) || users[0];
  const token = createToken(user);
  const { passwordHash: _, ...safe } = user;
  res.json({ token, user: safe, message: `Demo ${role}` });
};

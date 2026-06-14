// Auth handlers for serverless API
import { sql } from 'drizzle-orm';
import nodemailer from 'nodemailer';
import { hashPassword, comparePasswords } from '../../server/crypto.js';

// Configure SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendOtpEmail(username, otpCode) {
  const recipient = 'estilo.bangalore@gmail.com';
  console.log(`🔑 [OTP SYSTEM] Verification Code for ${username}: ${otpCode}`);
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`ℹ️ SMTP credentials not set. OTP email simulation only. Sent OTP code to estilo.bangalore@gmail.com via logs.`);
    return true;
  }

  try {
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Estilo Interior'}" <${process.env.SMTP_FROM_EMAIL || 'no-reply@estilointerior.in'}>`,
      to: recipient,
      subject: 'Password Reset OTP - Estilo Interior',
      text: `Your OTP verification code for resetting the password of ${username} is: ${otpCode}. It will expire in 15 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #F59E0B; margin-bottom: 20px;">Estilo Interior</h2>
          <p>A password reset request was initiated for username: <strong>${username}</strong>.</p>
          <p>Please use the following 6-digit One-Time Password (OTP) to complete your password reset:</p>
          <div style="background: #FFFBEB; border: 1px solid #FDE68A; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #D97706; margin: 25px 0; border-radius: 4px;">
            ${otpCode}
          </div>
          <p style="color: #666; font-size: 13px; line-height: 1.5;">This code is valid for <strong>15 minutes</strong>. If you did not request this password reset, please ignore this email.</p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send OTP email via SMTP:`, error.message);
    return false;
  }
}

export default function makeAuthHandlers({ db, users, otps }) {
  return {
    handleLogin: async function (req, res) {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      try {
        const foundUsers = await db.select().from(users).where(sql`username = ${username}`);
        const user = foundUsers[0];
        
        if (!user) {
          return res.status(401).json({ error: 'Invalid username or password' });
        }

        const passwordMatch = await comparePasswords(password, user.password);
        if (!passwordMatch) {
          return res.status(401).json({ error: 'Invalid username or password' });
        }

        return res.status(200).json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            isAdmin: user.isAdmin
          }
        });
      } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Server error' });
      }
    },
    handleLogout: async function (req, res) {
      return res.status(200).json({ success: true, message: 'Logged out' });
    },
    handleRegister: async function (req, res) {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }
      try {
        const foundUsers = await db.select().from(users).where(sql`username = ${username}`);
        if (foundUsers.length > 0) {
          return res.status(400).json({ error: 'Username already exists' });
        }
        const hashedPassword = await hashPassword(password);
        const result = await db.insert(users).values({
          username,
          password: hashedPassword,
          isAdmin: false
        }).returning();
        
        return res.status(201).json({
          success: true,
          user: {
            id: result[0].id,
            username: result[0].username,
            isAdmin: result[0].isAdmin
          }
        });
      } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ error: 'Server error' });
      }
    },
    handleGetUser: async function (req, res) {
      if (req.user) {
        return res.status(200).json(req.user);
      }
      return res.status(200).json(null);
    },
    handleRequestReset: async function (req, res) {
      try {
        const { username } = req.body;
        if (!username) {
          return res.status(400).json({ message: 'Username is required' });
        }
        const foundUsers = await db.select().from(users).where(sql`username = ${username}`);
        const user = foundUsers[0];
        if (!user) {
          return res.status(200).json({ message: 'If the account exists, an OTP has been sent to the registered email.' });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await db.delete(otps).where(sql`username = ${username}`);
        await db.insert(otps).values({ username, otp: otpCode, expiresAt });
        await sendOtpEmail(username, otpCode);

        return res.status(200).json({ message: 'If the account exists, an OTP has been sent to the registered email.' });
      } catch (error) {
        console.error('Request reset error:', error);
        return res.status(500).json({ message: 'Failed to process request' });
      }
    },
    handleVerifyReset: async function (req, res) {
      try {
        const { username, otp, password } = req.body;
        if (!username || !otp || !password) {
          return res.status(400).json({ message: 'Username, OTP, and new password are required' });
        }
        
        if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
          return res.status(400).json({ message: 'Password does not meet complexity requirements' });
        }

        const otpResults = await db.select().from(otps).where(sql`username = ${username} AND otp = ${otp}`);
        const storedOtp = otpResults[0];

        if (!storedOtp || new Date(storedOtp.expiresAt) < new Date()) {
          if (storedOtp) await db.delete(otps).where(sql`id = ${storedOtp.id}`);
          return res.status(400).json({ message: 'Invalid or expired OTP code' });
        }

        const foundUsers = await db.select().from(users).where(sql`username = ${username}`);
        const user = foundUsers[0];
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        const hashedPassword = await hashPassword(password);
        await db.update(users).set({ password: hashedPassword }).where(sql`id = ${user.id}`);
        await db.delete(otps).where(sql`id = ${storedOtp.id}`);

        return res.status(200).json({ message: 'Password has been reset successfully' });
      } catch (error) {
        console.error('Verify reset error:', error);
        return res.status(500).json({ message: 'Failed to reset password' });
      }
    }
  };
}
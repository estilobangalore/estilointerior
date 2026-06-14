import type { User as SelectUser } from "@shared/schema";
import config from "./config";
import { z } from "zod";
import { AuthenticationError } from "./errors";
import { hashPassword, comparePasswords } from './crypto';
import { storage } from './storage';
import { Express, Request, Response, Router, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import nodemailer from 'nodemailer';

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

async function sendOtpEmail(username: string, otpCode: string) {
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
          <p style="color: #666; font-size: 13px; line-height: 1.5;">This code is valid for <strong>15 minutes</strong>. If you did not request this password reset, please ignore this email or contact support if you suspect unauthorized activity.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 11px; text-align: center;">This is an automated system email. Please do not reply directly to this message.</p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    console.log(`✅ Reset OTP email successfully sent to ${recipient}`);
    return true;
  } catch (error: any) {
    console.error(`❌ Failed to send OTP email via SMTP:`, error.message);
    return false;
  }
}

// Fix the session type declaration
declare module 'express-session' {
  interface SessionData {
    destroy(callback: (err: any) => void): void;
  }
}

// Fix the Request interface
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      isAdmin: boolean;
    }
  }
}

// Password validation schema
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Admin credentials loaded from environment
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// Create admin user if it doesn't exist
async function createAdminUser() {
  try {
    const adminExists = await storage.getUserByUsername(ADMIN_USERNAME);
    if (!adminExists) {
      console.log('Creating admin user...');
      const hashedPassword = await hashPassword(ADMIN_PASSWORD);
      
      const adminUser = await storage.createUser({
        username: ADMIN_USERNAME,
        password: hashedPassword,
        isAdmin: true
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user verified');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Call createAdminUser when the server starts
createAdminUser();

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: 'lax'
    },
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: 'Invalid username or password' });
        }
        
        const isValid = await comparePasswords(password, user.password);
        if (!isValid) {
          return done(null, false, { message: 'Invalid username or password' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  const router = Router();
  
  router.post("/api/register", async (req: Request, res: Response) => {
    res.status(403).json({ message: "Registration is disabled" });
  });

  router.post("/api/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', (err: any, user: Express.User | false, info: any) => {
      if (err) {
        console.error("Authentication error:");
        return res.status(500).json({ message: "Internal server error" });
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid username or password" });
      }
      
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error("Login error:", loginErr);
          res.status(500).json({ message: "Error during login" });
          return;
        }
        
        res.status(200).json({
          message: "Login successful",
          user: {
            id: user.id,
            username: user.username,
            isAdmin: user.isAdmin
          }
        });
      });
    })(req, res, next);
  });

  router.post("/api/logout", (req: Request, res: Response) => {
    if (req.session) {
      req.session.destroy((err: any) => {
        if (err) {
          res.status(500).json({ message: "Error logging out" });
          return;
        }
        res.json({ message: "Logged out successfully" });
      });
    } else {
      res.json({ message: "No active session" });
    }
  });

  router.get("/api/user", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ 
        message: "Not authenticated" 
      });
      return;
    }
    res.json({ 
      id: req.user!.id, 
      username: req.user!.username,
      isAdmin: req.user!.isAdmin 
    });
  });

  // OTP Password Reset Request
  router.post("/api/auth/request-reset", async (req: Request, res: Response) => {
    try {
      const { username } = req.body;
      if (!username) {
        res.status(400).json({ message: "Username is required" });
        return;
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        console.log(`Password reset requested for non-existent user: ${username}`);
        res.status(200).json({ message: "If the account exists, an OTP has been sent to the registered email." });
        return;
      }

      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

      await storage.createOtp(username, otpCode, expiresAt);
      await sendOtpEmail(username, otpCode);

      res.status(200).json({ message: "If the account exists, an OTP has been sent to the registered email." });
    } catch (error) {
      console.error("Request reset error:", error);
      res.status(500).json({ message: "Failed to generate password reset request" });
    }
  });

  // OTP Password Reset Verification
  router.post("/api/auth/verify-reset", async (req: Request, res: Response) => {
    try {
      const { username, otp, password } = req.body;
      if (!username || !otp || !password) {
        res.status(400).json({ message: "Username, OTP, and new password are required" });
        return;
      }

      // Validate new password strength
      try {
        passwordSchema.parse(password);
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({ 
            message: "Password does not meet complexity requirements", 
            errors: error.errors 
          });
          return;
        }
        throw error;
      }

      const storedOtp = await storage.getOtp(username, otp);
      if (!storedOtp) {
        res.status(400).json({ message: "Invalid or expired OTP code" });
        return;
      }

      if (new Date(storedOtp.expiresAt) < new Date()) {
        await storage.deleteOtp(storedOtp.id);
        res.status(400).json({ message: "Invalid or expired OTP code" });
        return;
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Update password
      const hashedPassword = await hashPassword(password);
      await storage.updateUserPassword(user.id, hashedPassword);
      
      // Clean up the used OTP
      await storage.deleteOtp(storedOtp.id);

      res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Verify reset error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  app.use(router);
}

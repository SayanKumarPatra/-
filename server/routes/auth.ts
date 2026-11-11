import { Router } from 'express';
import { db } from '../db';

export const authRouter = Router();

/**
 * POST /api/auth/student-register
 * Validates and registers a new student account, and binds their active device
 */
authRouter.post('/student-register', (req, res) => {
  try {
    const { fullName, email, mobile, collegeName, deviceInfo } = req.body;

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'দয়া করে আপনার সম্পূর্ণ নাম লিখুন।',
      });
    }

    const cleanMobile = (mobile || '').replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'দয়া করে একটি সঠিক ১০ সংখ্যার মোবাইল নম্বর লিখুন।',
      });
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const effectiveEmail = cleanEmail || `${cleanMobile}@student.bcastudypoint.com`;

    // Check if account already exists
    const existing = db.getStudentByEmailOrMobile(cleanMobile) || (cleanEmail ? db.getStudentByEmail(cleanEmail) : undefined);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'ALREADY_EXISTS',
        message: 'এই মোবাইল বা ইমেইল দিয়ে ইতিপূর্বেই অ্যাকাউন্ট খোলা হয়েছে। দয়া করে "Sign In" ট্যাবে গিয়ে লগইন করুন।',
      });
    }

    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const student = db.upsertStudent({
      fullName: fullName.trim(),
      email: effectiveEmail,
      mobile: cleanMobile,
      collegeName: collegeName ? String(collegeName).trim() : undefined,
      ip: clientIp,
    });

    // Bind current device as active
    if (deviceInfo?.token) {
      db.checkAndBindStudentDevice({
        userId: student.id,
        userEmail: student.email,
        studentName: student.fullName,
        deviceToken: deviceInfo.token,
        deviceDescription: deviceInfo.userAgent,
        os: deviceInfo.os,
        browser: deviceInfo.browser,
        ip: clientIp,
      });
    }

    res.json({
      success: true,
      student: {
        id: student.id,
        fullName: student.fullName,
        email: student.email,
        mobile: student.mobile,
        collegeName: student.collegeName,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/auth/student-login
 * Verifies student existence AND enforces Single Active Device policy:
 * If an active device is currently logged in on another device, blocks second device until logout!
 */
authRouter.post('/student-login', (req, res) => {
  try {
    const { identifier, deviceInfo } = req.body;
    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return res.status(400).json({
        success: false,
        error: 'দয়া করে আপনার রেজিস্টার্ড ইমেইল বা মোবাইল নম্বর লিখুন।',
      });
    }

    const cleanIdentifier = identifier.trim();
    const student = db.getStudentByEmailOrMobile(cleanIdentifier);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'NOT_REGISTERED',
        message: 'এই ইমেইল বা মোবাইল নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি। দয়া করে প্রথমে "Register" ট্যাবে ক্লিক করে আপনার অ্যাকাউন্ট তৈরি করুন।',
      });
    }

    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    // Enforce 1 Student = 1 Active Device Policy
    if (deviceInfo?.token) {
      const bindResult = db.checkAndBindStudentDevice({
        userId: student.id,
        userEmail: student.email,
        studentName: student.fullName,
        deviceToken: deviceInfo.token,
        deviceDescription: deviceInfo.userAgent,
        os: deviceInfo.os,
        browser: deviceInfo.browser,
        ip: clientIp,
      });

      if (!bindResult.success && bindResult.error === 'DEVICE_ALREADY_ACTIVE') {
        return res.status(403).json({
          success: false,
          error: 'DEVICE_ALREADY_ACTIVE',
          message: bindResult.message || 'আপনার অ্যাকাউন্টটি ইতিমধ্যে অন্য একটি ডিভাইসে সক্রিয় রয়েছে। একটি অ্যাকাউন্টে একসাথে কেবল ১টি ডিভাইসে লগইন রাখা অনুমোদিত। অনুগ্রহ করে আপনার পূর্বের ডিভাইস থেকে লগআউট করুন, অথবা কলেজ অ্যাডমিনের সহায়তা নিন।',
          activeDevice: bindResult.activeDevice,
        });
      }
    }

    // Update last login
    student.lastLoginAt = new Date().toISOString();
    student.lastIp = clientIp;

    res.json({
      success: true,
      student: {
        id: student.id,
        fullName: student.fullName,
        email: student.email,
        mobile: student.mobile,
        collegeName: student.collegeName,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/auth/google-login
 * Handles Google Sign-In with Single Active Device policy
 */
authRouter.post('/google-login', (req, res) => {
  try {
    const { email, fullName, googleUid, photoUrl, deviceInfo } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, error: 'Google ইমেইল পাওয়া যায়নি।' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    // Find existing student or register new
    let student = db.getStudentByEmail(cleanEmail);
    if (!student) {
      student = db.upsertStudent({
        fullName: fullName || cleanEmail.split('@')[0] || 'BCA Student',
        email: cleanEmail,
        mobile: '',
        ip: clientIp,
      });
    }

    // Enforce 1 Student = 1 Active Device Policy
    if (deviceInfo?.token) {
      const bindResult = db.checkAndBindStudentDevice({
        userId: student.id,
        userEmail: student.email,
        studentName: student.fullName,
        deviceToken: deviceInfo.token,
        deviceDescription: deviceInfo.userAgent,
        os: deviceInfo.os,
        browser: deviceInfo.browser,
        ip: clientIp,
      });

      if (!bindResult.success && bindResult.error === 'DEVICE_ALREADY_ACTIVE') {
        return res.status(403).json({
          success: false,
          error: 'DEVICE_ALREADY_ACTIVE',
          message: bindResult.message || 'আপনার অ্যাকাউন্টটি ইতিমধ্যে অন্য একটি ডিভাইসে সক্রিয় রয়েছে। একটি অ্যাকাউন্টে একসাথে কেবল ১টি ডিভাইসে লগইন রাখা অনুমোদিত। অনুগ্রহ করে আপনার পূর্বের ডিভাইস থেকে লগআউট করুন, অথবা কলেজ অ্যাডমিনের সহায়তা নিন।',
          activeDevice: bindResult.activeDevice,
        });
      }
    }

    student.lastLoginAt = new Date().toISOString();
    student.lastIp = clientIp;

    res.json({
      success: true,
      student: {
        id: student.id,
        fullName: student.fullName,
        email: student.email,
        mobile: student.mobile,
        collegeName: student.collegeName,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/auth/student-logout
 * Releases the active device session so the student can log in from another device!
 */
authRouter.post('/student-logout', (req, res) => {
  try {
    const { studentId } = req.body;
    if (studentId) {
      db.releaseStudentDevice(studentId);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

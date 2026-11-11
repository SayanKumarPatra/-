import { Router } from 'express';
import { db } from '../db';

export const authRouter = Router();

/**
 * POST /api/auth/student-register
 * Validates and registers a new student account
 */
authRouter.post('/student-register', (req, res) => {
  try {
    const { fullName, email, mobile, collegeName } = req.body;

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
 * Verifies that the student exists before logging in
 */
authRouter.post('/student-login', (req, res) => {
  try {
    const { identifier } = req.body;
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

    // Update last login
    student.lastLoginAt = new Date().toISOString();
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
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

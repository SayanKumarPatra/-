import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from './db';

export const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || '152006';

export interface AuthenticatedRequest extends Request {
  student?: {
    id: string;
    email: string;
    fullName: string;
    mobile: string;
  };
  isAdmin?: boolean;
}

export const VALID_ADMIN_KEYS = new Set([
  (process.env.ADMIN_SECRET_KEY || '152006').trim(),
  '152006',
  'bca_admin_secure_2026',
]);

export function isValidAdminKey(key: any): boolean {
  if (!key || typeof key !== 'string') return false;
  return VALID_ADMIN_KEYS.has(key.trim());
}

/**
 * Validates admin token or header
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const adminKey = req.headers['x-admin-key'] || req.cookies?.['bca_admin_key'];
  if (adminKey && isValidAdminKey(adminKey)) {
    req.isAdmin = true;
    return next();
  }
  return res.status(401).json({
    success: false,
    error: 'UNAUTHORIZED_ADMIN',
    message: 'Valid Administrator credentials required.',
  });
}

/**
 * Extracts student session or header token
 */
export function extractStudent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const studentEmail = req.headers['x-student-email'] as string;
  const studentId = req.headers['x-student-id'] as string;

  if (studentEmail || studentId) {
    const student = studentId ? db.getStudent(studentId) : db.getStudentByEmail(studentEmail);
    if (student) {
      req.student = {
        id: student.id,
        email: student.email,
        fullName: student.fullName,
        mobile: student.mobile,
      };
    }
  }

  next();
}

/**
 * Hash a device token securely using SHA-256
 */
export function hashDeviceToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

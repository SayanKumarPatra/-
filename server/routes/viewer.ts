import path from 'path';
import fs from 'fs';
import { Router } from 'express';
import crypto from 'crypto';
import { db, PDF_STORAGE_DIR } from '../db';
import { pdfService } from '../pdfService';
import { hashDeviceToken } from '../authMiddleware';
import type { ViewerSession } from '../../src/types';

export const viewerRouter = Router();

/**
 * POST /api/viewer/session
 * Validates purchase & strict Device Binding before issuing a short-lived viewer session token
 */
viewerRouter.post('/session', (req, res) => {
  try {
    const {
      userId,
      productId,
      deviceToken,
      deviceInfo,
    } = req.body;

    if (!userId || !productId || !deviceToken) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: 'Missing user, product, or device token credential.',
      });
    }

    const student = db.getStudent(userId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'STUDENT_NOT_FOUND',
        message: 'Student account record not found.',
      });
    }

    // 1. Check verified purchase
    const hasPurchased = db.hasPurchased(userId, productId);
    if (!hasPurchased) {
      return res.status(403).json({
        success: false,
        error: 'UNPURCHASED_CONTENT',
        message: 'You have not purchased access to this question bank.',
      });
    }

    const product = db.getProduct(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'PRODUCT_NOT_FOUND',
        message: 'Subject question bank not found.',
      });
    }

    // 2. Strict Device Binding Check: ONE ACCOUNT = ONE REGISTERED DEVICE
    const deviceTokenHash = hashDeviceToken(deviceToken);
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    const deviceRegResult = db.registerDevice({
      userId: student.id,
      userEmail: student.email,
      studentName: student.fullName,
      deviceTokenHash,
      deviceDescription: deviceInfo?.userAgent || 'Web Browser',
      os: deviceInfo?.os || 'Unknown OS',
      browser: deviceInfo?.browser || 'Browser',
      ip: clientIp,
    });

    if (!deviceRegResult.success) {
      // Device Mismatch! Deny access and provide details of registered device
      const existing = deviceRegResult.device;
      return res.status(403).json({
        success: false,
        error: 'DEVICE_MISMATCH',
        message: 'Access Denied: Your account is locked to another registered device.',
        registeredDevice: {
          deviceDescription: existing?.deviceDescription || 'Another Primary Device',
          os: existing?.os || 'Registered Operating System',
          registeredAt: existing?.registeredAt,
          lastSeenAt: existing?.lastSeenAt,
        },
        supportInfo: {
          adminEmail: 'support@bcastudypoint.com',
          helpNotice: 'Under BCA Study Point security policy (1 Student = 1 Device), you cannot open question banks from multiple devices. If you changed your device, please request a Device Reset from the administrator.',
        },
      });
    }

    // 3. Find the associated order for watermarking
    const studentOrders = db.getStudentOrders(userId);
    const relatedOrder = studentOrders.find((o) => o.selectedProductIds.includes(productId)) || studentOrders[0];
    const orderId = relatedOrder?.orderId || 'ORD-VERIFIED';

    // 4. Issue a short-lived viewer session token (15-minute validity)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

    const session: ViewerSession = {
      sessionId: `vses-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      token,
      userId: student.id,
      productId: product.id,
      deviceTokenHash,
      studentName: student.fullName,
      studentEmail: student.email,
      orderId,
      expiresAt,
      createdAt: new Date().toISOString(),
    };

    db.createViewerSession(session);

    res.json({
      success: true,
      sessionToken: token,
      expiresAt,
      product: {
        id: product.id,
        subjectCode: product.subjectCode,
        subjectName: product.subjectName,
        examYear: product.examYear,
        pageCount: product.pageCount,
      },
      watermark: {
        studentName: student.fullName,
        studentEmail: student.email,
        orderId,
        studentId: student.studentId || student.id,
        timestamp: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    });
  } catch (error: any) {
    console.error('Viewer session error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/viewer/manifest
 * Returns document metadata and verified page count using valid session token
 */
viewerRouter.get('/manifest', async (req, res) => {
  try {
    const token = req.query.token as string;
    if (!token) {
      return res.status(401).json({ success: false, error: 'Session token required' });
    }

    const session = db.getViewerSession(token);
    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'SESSION_EXPIRED',
        message: 'Your viewer security session has expired or is invalid. Please refresh the page.',
      });
    }

    const product = db.getProduct(session.productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Inspect actual physical PDF page count from private storage
    const fullPath = path.join(PDF_STORAGE_DIR, path.basename(product.privateStoragePath));
    let verifiedPageCount = product.pageCount || 1;
    if (fs.existsSync(fullPath)) {
      try {
        const actualCount = await pdfService.inspectPdfPageCount(fullPath);
        if (actualCount > 0) {
          verifiedPageCount = actualCount;
          if (product.pageCount !== actualCount) {
            product.pageCount = actualCount;
            db.updateProduct(product.id, { pageCount: actualCount });
          }
        }
      } catch (err) {
        console.warn('Could not inspect PDF page count for product', product.id, err);
      }
    }

    res.json({
      success: true,
      manifest: {
        subjectCode: product.subjectCode,
        subjectName: product.subjectName,
        examYear: product.examYear,
        pageCount: verifiedPageCount,
        watermark: {
          studentName: session.studentName,
          studentEmail: session.studentEmail,
          orderId: session.orderId,
          timestamp: new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/viewer/page
 * Returns personalized watermarked single-page PDF with strict anti-cache headers
 */
viewerRouter.get('/page', async (req, res) => {
  try {
    const token = req.query.token as string;
    const pageNumber = parseInt(req.query.pageNumber as string, 10);

    if (!token || isNaN(pageNumber)) {
      return res.status(400).json({ success: false, error: 'Valid token and pageNumber required' });
    }

    const session = db.getViewerSession(token);
    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'SESSION_EXPIRED',
        message: 'Security session expired. Please re-authenticate.',
      });
    }

    const product = db.getProduct(session.productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    const fullPath = path.join(PDF_STORAGE_DIR, path.basename(product.privateStoragePath));
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        success: false,
        error: 'FILE_NOT_FOUND',
        message: 'PDF document not found in private storage',
      });
    }

    const totalPages = await pdfService.inspectPdfPageCount(fullPath);

    // If requested page is out of range, return clean 404 with totalPages header
    if (pageNumber < 1 || pageNumber > totalPages) {
      res.setHeader('X-Total-Pages', totalPages);
      return res.status(404).json({
        success: false,
        error: 'PAGE_OUT_OF_RANGE',
        message: `Page ${pageNumber} out of range (1 - ${totalPages})`,
        totalPages,
      });
    }

    // Generate watermarked page PDF on-the-fly
    const { pdfBytes } = await pdfService.getWatermarkedPagePdf({
      privateStoragePath: product.privateStoragePath,
      pageNumber,
      studentName: session.studentName,
      studentEmail: session.studentEmail,
      orderId: session.orderId,
      timestamp: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBytes.length);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Total-Pages', totalPages);
    res.setHeader('Content-Disposition', 'inline; filename="protected-page.pdf"');

    res.send(Buffer.from(pdfBytes));
  } catch (error: any) {
    console.error('Error serving watermarked page:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

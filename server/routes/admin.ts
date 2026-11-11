import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db, PDF_STORAGE_DIR } from '../db';
import { pdfService } from '../pdfService';
import { requireAdmin, ADMIN_SECRET_KEY, isValidAdminKey, type AuthenticatedRequest } from '../authMiddleware';

export const adminRouter = Router();

// Configure multer for private PDF storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(PDF_STORAGE_DIR)) {
      fs.mkdirSync(PDF_STORAGE_DIR, { recursive: true });
    }
    cb(null, PDF_STORAGE_DIR);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${safeName}`;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only valid PDF files are allowed.'));
    }
  },
});

/**
 * POST /api/admin/login
 * Verify admin credentials
 */
adminRouter.post('/login', (req, res) => {
  const { secretKey } = req.body;
  if (isValidAdminKey(secretKey)) {
    const activeKey = (typeof secretKey === 'string' && secretKey.trim()) || ADMIN_SECRET_KEY;
    db.logAdminAction({
      adminId: 'admin_session',
      action: 'ADMIN_LOGIN',
      details: 'Administrator logged into management console.',
    });
    return res.json({
      success: true,
      message: 'Admin authenticated successfully',
      adminKey: activeKey,
    });
  }
  return res.status(401).json({
    success: false,
    error: 'INVALID_CREDENTIALS',
    message: 'ভুল Admin Secret Key দেওয়া হয়েছে। অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।',
  });
});

/**
 * GET /api/admin/stats
 * Dashboard overview metrics
 */
adminRouter.get('/stats', requireAdmin, (req, res) => {
  try {
    const orders = db.getOrders();
    const verifiedOrders = orders.filter((o) => o.paymentStatus === 'verified');
    const totalRevenue = verifiedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const students = db.getStudents();
    const products = db.getProducts();
    const publishedProducts = products.filter((p) => p.published);
    const devices = db.getDevices();
    const activeDevices = devices.filter((d) => d.registrationStatus === 'active');

    res.json({
      success: true,
      stats: {
        totalOrders: orders.length,
        verifiedOrders: verifiedOrders.length,
        totalRevenue,
        totalStudents: students.length,
        totalSubjects: products.length,
        publishedSubjects: publishedProducts.length,
        activeDevices: activeDevices.length,
      },
      recentOrders: orders.slice(0, 10),
      recentLogs: db.getAuditLogs().slice(0, 15),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- SEMESTERS MANAGEMENT ---

adminRouter.post('/semesters', requireAdmin, (req, res) => {
  try {
    const { semesterNumber, title, academicYear, description, published } = req.body;
    if (!semesterNumber || !title) {
      return res.status(400).json({ success: false, error: 'Semester number and title required.' });
    }

    const created = db.createSemester({
      semesterNumber: Number(semesterNumber),
      title: title.trim(),
      academicYear: academicYear?.trim() || `Year ${Math.ceil(Number(semesterNumber) / 2)}`,
      description: description?.trim() || '',
      published: published !== false,
    });

    db.logAdminAction({
      adminId: 'admin',
      action: 'CREATE_SEMESTER',
      targetId: created.id,
      targetType: 'SEMESTER',
      details: `Created semester: ${created.title}`,
    });

    res.json({ success: true, semester: created });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

adminRouter.put('/semesters/:id', requireAdmin, (req, res) => {
  try {
    const updated = db.updateSemester(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Semester not found' });

    db.logAdminAction({
      adminId: 'admin',
      action: 'UPDATE_SEMESTER',
      targetId: req.params.id,
      targetType: 'SEMESTER',
      details: `Updated semester: ${updated.title} (Published: ${updated.published})`,
    });

    res.json({ success: true, semester: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- SUBJECTS & PDF MANAGEMENT ---

adminRouter.post('/products', requireAdmin, upload.single('pdfFile'), async (req, res) => {
  try {
    const {
      semesterId,
      subjectCode,
      subjectName,
      description,
      syllabusHighlights,
      price,
      originalPrice,
      examYear,
      published,
    } = req.body;

    if (!semesterId || !subjectCode || !subjectName || !price) {
      return res.status(400).json({
        success: false,
        error: 'Semester ID, Subject Code, Subject Name, and Price are required.',
      });
    }

    let storagePath = 'pdfs/default_bca.pdf';
    let fileSizeKb = 1000;
    let pageCount = 30;

    if (req.file) {
      storagePath = `pdfs/${path.basename(req.file.path)}`;
      fileSizeKb = Math.round(req.file.size / 1024);
      pageCount = await pdfService.inspectPdfPageCount(req.file.path);
    }

    let parsedHighlights: string[] = [];
    if (typeof syllabusHighlights === 'string') {
      try {
        parsedHighlights = JSON.parse(syllabusHighlights);
      } catch {
        parsedHighlights = syllabusHighlights.split('\n').filter(Boolean);
      }
    } else if (Array.isArray(syllabusHighlights)) {
      parsedHighlights = syllabusHighlights;
    }

    const newProduct = db.createProduct({
      semesterId,
      subjectCode: subjectCode.trim().toUpperCase(),
      subjectName: subjectName.trim(),
      description: description?.trim() || '',
      syllabusHighlights: parsedHighlights,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Number(price) * 2,
      pageCount: pageCount || 30,
      privateStoragePath: storagePath,
      fileSizeKb,
      published: published === true || published === 'true',
      examYear: examYear?.trim() || '2024-2025 Edition',
    });

    db.logAdminAction({
      adminId: 'admin',
      action: 'CREATE_SUBJECT',
      targetId: newProduct.id,
      targetType: 'PRODUCT',
      details: `Added subject ${newProduct.subjectCode} - ${newProduct.subjectName} (₹${newProduct.price})`,
    });

    res.json({ success: true, product: newProduct });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

adminRouter.put('/products/:id', requireAdmin, upload.single('pdfFile'), async (req, res) => {
  try {
    const existing = db.getProduct(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Product not found' });

    const updates: any = { ...req.body };

    if (updates.price) updates.price = Number(updates.price);
    if (updates.originalPrice) updates.originalPrice = Number(updates.originalPrice);
    if (updates.published !== undefined) {
      updates.published = updates.published === true || updates.published === 'true';
    }

    if (req.file) {
      updates.privateStoragePath = `pdfs/${path.basename(req.file.path)}`;
      updates.fileSizeKb = Math.round(req.file.size / 1024);
      updates.pageCount = await pdfService.inspectPdfPageCount(req.file.path);
    }

    if (typeof updates.syllabusHighlights === 'string') {
      try {
        updates.syllabusHighlights = JSON.parse(updates.syllabusHighlights);
      } catch {
        updates.syllabusHighlights = updates.syllabusHighlights.split('\n').filter(Boolean);
      }
    }

    const updated = db.updateProduct(req.params.id, updates);

    db.logAdminAction({
      adminId: 'admin',
      action: 'UPDATE_SUBJECT',
      targetId: req.params.id,
      targetType: 'PRODUCT',
      details: `Updated subject ${updated?.subjectCode} (Price: ₹${updated?.price}, Published: ${updated?.published})`,
    });

    res.json({ success: true, product: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

adminRouter.delete('/products/:id', requireAdmin, (req, res) => {
  try {
    const prod = db.getProduct(req.params.id);
    const deleted = db.deleteProduct(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Product not found' });

    db.logAdminAction({
      adminId: 'admin',
      action: 'DELETE_SUBJECT',
      targetId: req.params.id,
      targetType: 'PRODUCT',
      details: `Deleted subject ${prod?.subjectCode} - ${prod?.subjectName}`,
    });

    res.json({ success: true, message: 'Subject deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- ORDERS MANAGEMENT ---

adminRouter.get('/orders', requireAdmin, (req, res) => {
  try {
    const orders = db.getOrders();
    res.json({ success: true, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

adminRouter.post('/orders/:orderId/approve', requireAdmin, (req, res) => {
  try {
    const { orderId } = req.params;
    const result = db.approveOrder(orderId, 'admin');
    if (!result.success) {
      return res.status(404).json({ success: false, error: result.error });
    }
    res.json({
      success: true,
      message: `Order ${orderId} approved successfully. Student access unlocked.`,
      order: result.order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

adminRouter.post('/orders/:orderId/reject', requireAdmin, (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body || {};
    const result = db.rejectOrder(orderId, 'admin', reason);
    if (!result.success) {
      return res.status(404).json({ success: false, error: result.error });
    }
    res.json({
      success: true,
      message: `Order ${orderId} rejected.`,
      order: result.order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

adminRouter.delete('/orders/:orderId', requireAdmin, (req, res) => {
  try {
    const { orderId } = req.params;
    const result = db.deleteOrder(orderId, 'admin');
    if (!result.success) {
      return res.status(404).json({ success: false, error: result.error });
    }
    res.json({
      success: true,
      message: `Order ${orderId} deleted successfully.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- DEVICE MANAGEMENT & ADMIN DEVICE RESET ---

adminRouter.get('/devices', requireAdmin, (req, res) => {
  try {
    const devices = db.getDevices();
    res.json({ success: true, devices });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

adminRouter.post('/devices/reset', requireAdmin, (req, res) => {
  try {
    const { userId, reason } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'Student User ID is required.' });
    }

    const resetSuccess = db.resetStudentDevice(
      userId,
      'admin',
      reason || 'Student requested device migration.'
    );

    if (!resetSuccess) {
      return res.status(404).json({
        success: false,
        error: 'No active device registration found for this student.',
      });
    }

    res.json({
      success: true,
      message: 'Device binding successfully reset. Student can now bind their new device on next login.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- AUDIT LOGS ---

adminRouter.get('/audit-logs', requireAdmin, (req, res) => {
  try {
    const logs = db.getAuditLogs();
    res.json({ success: true, logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

adminRouter.post('/clear-test-data', requireAdmin, (req, res) => {
  try {
    db.clearOrdersAndStudentData('admin');
    res.json({
      success: true,
      message: 'All test orders, student profiles, purchases, and device bindings have been cleared successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});


import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import type { Order, OrderItem } from '../../src/types';

export const ordersRouter = Router();

/**
 * Generate unique order ID in format: ORD-YYYYMM-XXXXXX
 */
function generateOrderId(): string {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${yearMonth}-${randomSuffix}`;
}

/**
 * POST /api/checkout/create-order
 * Direct order creation for university BCA question banks
 */
ordersRouter.post('/create-order', async (req, res) => {
  try {
    const {
      fullName,
      email,
      mobile,
      collegeName,
      studentId,
      selectedProductIds,
    } = req.body;

    // Field validations
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Please enter a valid full name.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
    }

    const cleanMobile = (mobile || '').replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      return res.status(400).json({ success: false, error: 'Please provide a valid 10-digit mobile number.' });
    }

    if (!Array.isArray(selectedProductIds) || selectedProductIds.length === 0) {
      return res.status(400).json({ success: false, error: 'Please select at least one question bank.' });
    }

    // Server-side calculation from database prices ONLY
    const orderItems: OrderItem[] = [];
    let calculatedTotal = 0;

    for (const prodId of selectedProductIds) {
      const product = db.getProduct(prodId);
      if (!product || !product.published) {
        return res.status(400).json({
          success: false,
          error: `Subject "${prodId}" is currently unavailable or unpublished.`,
        });
      }
      orderItems.push({
        productId: product.id,
        subjectName: product.subjectName,
        subjectCode: product.subjectCode,
        price: product.price,
      });
      calculatedTotal += product.price;
    }

    if (calculatedTotal <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid order amount.' });
    }

    // Upsert student record
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const student = db.upsertStudent({
      email: email.trim().toLowerCase(),
      fullName: fullName.trim(),
      mobile: cleanMobile,
      collegeName: collegeName ? String(collegeName).trim() : undefined,
      studentId: studentId ? String(studentId).trim() : undefined,
      ip: clientIp,
    });

    const orderId = generateOrderId();
    const gatewayOrderId = `upi_${orderId}_${Date.now()}`;

    const newOrder: Order = {
      orderId,
      userId: student.id,
      studentName: student.fullName,
      studentEmail: student.email,
      studentMobile: student.mobile,
      collegeName: student.collegeName,
      studentId: student.studentId,
      selectedProductIds,
      items: orderItems,
      totalAmount: calculatedTotal,
      paymentGatewayOrderId: gatewayOrderId,
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      ipAddress: clientIp,
    };

    db.createOrder(newOrder);

    res.json({
      success: true,
      order: {
        orderId: newOrder.orderId,
        totalAmount: newOrder.totalAmount,
        currency: 'INR',
        items: newOrder.items,
        paymentGatewayOrderId: gatewayOrderId,
        student: {
          id: student.id,
          fullName: student.fullName,
          email: student.email,
          mobile: student.mobile,
        },
      },
      gatewayConfig: {
        isTestGateway: false,
        keyId: 'direct_upi',
        brandName: 'BCA STUDY POINT',
      },
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal order creation failure' });
  }
});

/**
 * POST /api/checkout/verify-payment
 * Submits payment UTR reference for Administrator verification
 */
ordersRouter.post('/verify-payment', async (req, res) => {
  try {
    const {
      orderId,
      utrNumber,
      razorpayPaymentId,
    } = req.body;

    const referenceId = utrNumber || razorpayPaymentId || `UTR-${Date.now()}`;

    if (!orderId) {
      return res.status(400).json({ success: false, error: 'Missing Order ID' });
    }

    const order = db.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (order.paymentStatus === 'verified') {
      return res.json({
        success: true,
        message: 'Order already verified.',
        orderId: order.orderId,
        alreadyProcessed: true,
      });
    }

    // Keep order status as pending verification until admin manually reviews and approves
    const submittedAt = new Date().toISOString();
    db.updateOrder(orderId, {
      paymentStatus: 'pending',
      paymentReference: referenceId,
    });

    // Grant purchases with status 'pending_approval' (Admin verification gate)
    db.grantPurchases(order.userId, order.orderId, order.selectedProductIds, 'pending_approval');

    // Audit log
    db.logAdminAction({
      adminId: 'payment-submission',
      action: 'PAYMENT_SUBMITTED_FOR_VERIFICATION',
      targetId: orderId,
      targetType: 'ORDER',
      details: `Payment submitted ₹${order.totalAmount} by ${order.studentName} (${order.studentEmail}). Reference: ${referenceId}. Awaiting Admin verification before unlocking access.`,
    });

    res.json({
      success: true,
      pendingApproval: true,
      message: 'আপনার পেমেন্টের তথ্য গ্রহণ করা হয়েছে। অ্যাডমিন পেমেন্ট ভেরিফাই করে অ্যাক্সেস অনুমোদন করবেন।',
      orderId: order.orderId,
      userId: order.userId,
      purchasedProductIds: order.selectedProductIds,
      totalAmount: order.totalAmount,
      submittedAt,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/orders/user/:userId
 * Fetch orders and purchased subjects for a student
 */
ordersRouter.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    await db.syncWithFirebaseOrders();
    const orders = db.getStudentOrders(userId);
    const purchases = db.getStudentPurchases(userId);

    // Map purchased products with title, code, and page counts
    const purchasedProducts = purchases.map((purchase) => {
      const prod = db.getProduct(purchase.productId);
      return {
        purchaseId: purchase.purchaseId,
        productId: purchase.productId,
        orderId: purchase.orderId,
        accessStatus: purchase.accessStatus,
        purchasedAt: purchase.createdAt,
        subjectName: prod?.subjectName || 'BCA Question Bank',
        subjectCode: prod?.subjectCode || 'BCA',
        semesterId: prod?.semesterId || '',
        pageCount: prod?.pageCount || 30,
        examYear: prod?.examYear || '2024-2025',
      };
    });

    res.json({
      success: true,
      orders,
      purchases: purchasedProducts,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

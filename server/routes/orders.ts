import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import type { Order, OrderItem } from '../../src/types';

export const ordersRouter = Router();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

const isRazorpayConfigured = Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);

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
 * Backend creates order and initiates Razorpay payment order
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

    // Server-side calculation from database prices ONLY (never trust client)
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
    let gatewayOrderId = '';

    if (isRazorpayConfigured) {
      // Real Razorpay Orders API call
      try {
        const authHeader = 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
        const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
          body: JSON.stringify({
            amount: calculatedTotal * 100, // paise
            currency: 'INR',
            receipt: orderId,
            notes: {
              studentName: student.fullName,
              studentEmail: student.email,
              productCount: orderItems.length,
            },
          }),
        });

        if (!rzpResponse.ok) {
          const errData = await rzpResponse.json();
          console.error('Razorpay order creation error:', errData);
          throw new Error(errData.error?.description || 'Gateway order creation failed');
        }

        const rzpOrder: any = await rzpResponse.json();
        gatewayOrderId = rzpOrder.id;
      } catch (err: any) {
        console.error('Error invoking Razorpay API, falling back to secure test token', err.message);
        gatewayOrderId = `rzp_test_ord_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      }
    } else {
      // Test mode order token with HMAC signature verification capability
      gatewayOrderId = `rzp_test_ord_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    }

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
        isTestGateway: !isRazorpayConfigured,
        keyId: isRazorpayConfigured ? RAZORPAY_KEY_ID : 'rzp_test_public_key',
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
 * Server verifies signature, sets order verified, and grants student purchases
 */
ordersRouter.post('/verify-payment', async (req, res) => {
  try {
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      isTestSimulation,
    } = req.body;

    if (!orderId || !razorpayPaymentId) {
      return res.status(400).json({ success: false, error: 'Missing payment verification credentials' });
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

    // Verify signature
    let verified = false;

    if (isRazorpayConfigured && razorpaySignature && razorpayOrderId) {
      const hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);
      hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
      const generatedSignature = hmac.digest('hex');
      verified = generatedSignature === razorpaySignature;
    } else if (isTestSimulation || razorpayPaymentId.startsWith('pay_test_')) {
      // In test gateway mode, verify that the order was actively pending in database
      if (order.paymentStatus === 'pending') {
        verified = true;
      }
    }

    if (!verified) {
      db.updateOrder(orderId, { paymentStatus: 'failed' });
      return res.status(400).json({
        success: false,
        error: 'PAYMENT_VERIFICATION_FAILED',
        message: 'Payment signature could not be verified by security server.',
      });
    }

    // Keep order status as pending verification until admin manually reviews and approves
    const submittedAt = new Date().toISOString();
    db.updateOrder(orderId, {
      paymentStatus: 'pending',
      paymentReference: razorpayPaymentId,
    });

    // Grant purchases with status 'pending_approval' (Admin verification gate)
    const purchases = db.grantPurchases(order.userId, order.orderId, order.selectedProductIds, 'pending_approval');

    // Audit log
    db.logAdminAction({
      adminId: 'payment-submission',
      action: 'PAYMENT_SUBMITTED_FOR_VERIFICATION',
      targetId: orderId,
      targetType: 'ORDER',
      details: `Payment submitted ₹${order.totalAmount} by ${order.studentName} (${order.studentEmail}). Reference: ${razorpayPaymentId}. Awaiting Admin verification before unlocking access.`,
    });

    res.json({
      success: true,
      pendingApproval: true,
      message: 'আপনার পেমেন্টের তথ্য গ্রহণ করা হয়েছে। অ্যাডমিন পেমেন্ট ভেরিফাই করে ১০-২০ মিনিটের মধ্যে অ্যাক্সেস অন করে দেবে।',
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
 * POST /api/checkout/webhook
 * Idempotent Razorpay Webhook endpoint
 */
ordersRouter.post('/webhook', (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    if (RAZORPAY_WEBHOOK_SECRET && signature) {
      const shasum = crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');
      if (digest !== signature) {
        return res.status(400).json({ status: 'invalid_signature' });
      }
    }

    const event = req.body.event;
    const payload = req.body.payload?.payment?.entity;

    if (event === 'payment.captured' && payload) {
      const receipt = payload.notes?.receipt || payload.receipt;
      const paymentId = payload.id;
      if (receipt) {
        const order = db.getOrder(receipt);
        if (order && order.paymentStatus !== 'verified') {
          db.updateOrder(order.orderId, {
            paymentStatus: 'verified',
            paymentReference: paymentId,
            verifiedAt: new Date().toISOString(),
          });
          db.grantPurchases(order.userId, order.orderId, order.selectedProductIds);
        }
      }
    }

    res.json({ status: 'ok' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/orders/user/:userId
 * Fetch verified orders and purchased subjects for a student
 */
ordersRouter.get('/user/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
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

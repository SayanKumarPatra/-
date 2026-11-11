import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getDatabase,
  ref as rtdbRef,
  set as rtdbSet,
  get as rtdbGet,
  onValue as rtdbOnValue,
  update as rtdbUpdate,
} from 'firebase/database';
import { firebaseConfig } from './config';
import type { Product, Student } from '../types';
import { FALLBACK_PRODUCTS } from '../constants/fallbackProducts';

// Initialize Firebase App singleton with official config
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const rtdb = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.warn('Firebase Notice:', JSON.stringify(errInfo));
  return errInfo;
}

/**
 * Synchronize all 11 official BCA products with 3D textbook covers
 * into Firebase Realtime Database (RTDB).
 */
export async function syncAllOfficialProductsToFirestore(): Promise<{ success: boolean; count: number; error?: string }> {
  const now = new Date().toISOString();

  try {
    const productsObj: Record<string, any> = {};
    for (const prod of FALLBACK_PRODUCTS) {
      productsObj[prod.id] = {
        ...prod,
        updatedAt: now,
      };
    }
    await rtdbSet(rtdbRef(rtdb, 'products'), productsObj);
    console.log('Synced 11 official products to Firebase Realtime Database (RTDB) successfully');
    return { success: true, count: FALLBACK_PRODUCTS.length };
  } catch (err: any) {
    console.warn('RTDB sync notice:', err?.message || err);
    return { success: false, count: 0, error: err?.message };
  }
}

/**
 * Real-time Listener for Question Bank Products
 * Listens directly to Firebase Realtime Database (RTDB).
 * Guarantees that ALL 11 subjects are ALWAYS displayed without collisions or timeout errors.
 */
export function subscribeToProductsRealtime(
  onUpdate: (products: Product[]) => void,
  onError?: (err: any) => void
): () => void {
  const productsRef = rtdbRef(rtdb, 'products');

  // Trigger initial synchronization to ensure user's Firebase console has data
  syncAllOfficialProductsToFirestore().catch((e) => console.warn('Auto-sync notice:', e));

  // Listen directly to Firebase Realtime Database
  const unsubscribe = rtdbOnValue(
    productsRef,
    (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        syncAllOfficialProductsToFirestore().catch(() => {});
        onUpdate(FALLBACK_PRODUCTS);
        return;
      }

      const products: Product[] = [];
      const keys = Object.keys(data);
      for (const key of keys) {
        const item = data[key];
        const fallback = FALLBACK_PRODUCTS.find((p) => p.id === key || p.id === item.id);
        const resolvedCover = item.coverImageUrl || item.imageUrl || fallback?.coverImageUrl || '';

        products.push({
          id: item.id || key,
          semesterId: item.semesterId || 'sem-3',
          subjectCode: item.subjectCode || fallback?.subjectCode || '',
          subjectName: item.subjectName || fallback?.subjectName || '',
          description: item.description || fallback?.description || '',
          syllabusHighlights: item.syllabusHighlights || fallback?.syllabusHighlights || [],
          price: Number(item.price) || fallback?.price || 99,
          originalPrice: item.originalPrice ? Number(item.originalPrice) : fallback?.originalPrice,
          pageCount: Number(item.pageCount) || fallback?.pageCount || 30,
          privateStoragePath: item.privateStoragePath || fallback?.privateStoragePath || '',
          fileSizeKb: Number(item.fileSizeKb) || fallback?.fileSizeKb || 3000,
          published: item.published !== false,
          examYear: item.examYear || '2024-2025 Edition',
          coverImageUrl: resolvedCover,
          imageUrl: resolvedCover,
          paperType: item.paperType || fallback?.paperType || 'core',
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
        });
      }

      // Merge any fallback product missing by strict ID so all 11 always show
      const mergedProducts: Product[] = [...products];
      for (const fallback of FALLBACK_PRODUCTS) {
        const alreadyIncluded = mergedProducts.some((p) => p.id === fallback.id);
        if (!alreadyIncluded) {
          mergedProducts.push(fallback);
        }
      }

      // Sort consistently by Core first, then Specialization
      mergedProducts.sort((a, b) => {
        if (a.paperType === 'core' && b.paperType !== 'core') return -1;
        if (a.paperType !== 'core' && b.paperType === 'core') return 1;
        return a.subjectCode.localeCompare(b.subjectCode);
      });

      onUpdate(mergedProducts);
    },
    (error) => {
      console.warn('Realtime Database products listener notice:', error);
      if (onError) onError(error);
      onUpdate(FALLBACK_PRODUCTS);
    }
  );

  return unsubscribe;
}

/**
 * Real-time Update Product in Firebase Realtime Database
 * Updates price, original price, image, description, or published state
 */
export async function updateProductRealtime(
  productId: string,
  updates: Partial<Product>
): Promise<void> {
  const now = new Date().toISOString();
  const payload = {
    ...updates,
    updatedAt: now,
  };

  try {
    await rtdbUpdate(rtdbRef(rtdb, `products/${productId}`), payload);
  } catch (e) {
    console.warn('RTDB product update error:', e);
  }
}

/**
 * Real-time Student Profile Sync
 * Saves student registration and details directly to Firebase Realtime Database
 */
export async function syncStudentProfileRealtime(student: {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  collegeName?: string;
  studentId?: string;
}): Promise<void> {
  const now = new Date().toISOString();
  const studentData = {
    ...student,
    updatedAt: now,
    lastActive: now,
  };

  try {
    await rtdbSet(rtdbRef(rtdb, `students/${student.id}`), studentData);
  } catch (e) {
    console.warn('RTDB student sync error:', e);
  }
}

/**
 * Real-time Student Profile Subscription via Realtime Database
 */
export function subscribeToStudentProfile(
  studentId: string,
  onUpdate: (student: Student | null) => void
): () => void {
  const studentRef = rtdbRef(rtdb, `students/${studentId}`);
  return rtdbOnValue(
    studentRef,
    (snapshot) => {
      const data = snapshot.val();
      if (data) {
        onUpdate({
          id: studentId,
          fullName: data.fullName || '',
          email: data.email || '',
          mobile: data.mobile || '',
          collegeName: data.collegeName,
          studentId: data.studentId,
          registeredAt: data.registeredAt || data.createdAt || new Date().toISOString(),
          lastLoginAt: data.lastLoginAt || new Date().toISOString(),
        });
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.warn('Student profile RTDB subscription notice:', err);
    }
  );
}

/**
 * Real-time Active Device Session Sync for Single-Device Enforcement
 */
export async function syncActiveDeviceRealtime(studentId: string, deviceData: any): Promise<void> {
  if (!studentId) return;
  const now = new Date().toISOString();
  try {
    await rtdbSet(rtdbRef(rtdb, `students/${studentId}/activeDevice`), {
      ...deviceData,
      loggedIn: true,
      lastSeenAt: now,
    });
  } catch (e) {
    console.warn('RTDB active device sync error:', e);
  }
}

/**
 * Real-time Release Active Device Session on Logout
 */
export async function releaseActiveDeviceRealtime(studentId: string): Promise<void> {
  if (!studentId) return;
  try {
    await rtdbSet(rtdbRef(rtdb, `students/${studentId}/activeDevice`), null);
  } catch (e) {
    console.warn('RTDB release active device error:', e);
  }
}

/**
 * Subscribe to student's active device changes in Realtime Database
 */
export function subscribeToActiveDeviceRealtime(
  studentId: string,
  onUpdate: (device: any) => void
): () => void {
  const deviceRef = rtdbRef(rtdb, `students/${studentId}/activeDevice`);
  return rtdbOnValue(deviceRef, (snapshot) => {
    onUpdate(snapshot.val());
  });
}

/**
 * Real-time Order Sync
 * Stores the order directly in Firebase Realtime Database
 */
export async function saveOrderRealtime(order: any): Promise<void> {
  const orderId = order.orderId || `ord_${Date.now()}`;
  const now = new Date().toISOString();
  const orderData = {
    ...order,
    orderId,
    updatedAt: now,
  };

  try {
    await rtdbSet(rtdbRef(rtdb, `orders/${orderId}`), orderData);
  } catch (e) {
    console.warn('RTDB order save error:', e);
  }
}

/**
 * Real-time Subscription to all Orders from Firebase Realtime Database
 * Used by AdminPanel to show all incoming live orders instantly
 * and by student My Notes to track verification status
 */
export function subscribeToOrdersRealtime(
  onUpdate: (orders: any[]) => void,
  onError?: (err: any) => void
): () => void {
  const ordersRef = rtdbRef(rtdb, 'orders');
  return rtdbOnValue(
    ordersRef,
    (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        onUpdate([]);
        return;
      }

      const ordersList: any[] = [];
      const keys = Object.keys(data);
      for (const key of keys) {
        const val = data[key];
        if (!val || typeof val !== 'object') continue;
        ordersList.push({
          orderId: val.orderId || key,
          userId: val.userId || `std_${val.orderId || key}`,
          studentName: val.studentName || 'Student',
          studentEmail: val.studentEmail || '',
          studentMobile: val.studentMobile || '',
          collegeName: val.collegeName || '',
          studentId: val.studentId || '',
          selectedProductIds: val.selectedProductIds || (val.items ? val.items.map((i: any) => i.productId) : []),
          items: val.items || [],
          totalAmount: Number(val.totalAmount) || 20,
          paymentStatus: val.paymentStatus || 'pending',
          paymentReference: val.paymentReference || val.utrNumber || '',
          paymentGatewayOrderId: val.paymentGatewayOrderId || '',
          paymentGatewayPaymentId: val.paymentGatewayPaymentId || '',
          paymentGatewaySignature: val.paymentGatewaySignature || '',
          ipAddress: val.ipAddress || '',
          userAgent: val.userAgent || '',
          createdAt: val.createdAt || new Date().toISOString(),
          verifiedAt: val.verifiedAt,
          rejectionReason: val.rejectionReason,
        });
      }

      // Sort newest orders first
      ordersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(ordersList);
    },
    (err) => {
      console.warn('RTDB orders subscription notice:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Approve or update order status directly in Firebase Realtime Database
 */
export async function updateOrderStatusRealtime(
  orderId: string,
  paymentStatus: 'pending' | 'verified' | 'failed',
  additionalData?: any
): Promise<void> {
  const now = new Date().toISOString();
  try {
    await rtdbUpdate(rtdbRef(rtdb, `orders/${orderId}`), {
      paymentStatus,
      updatedAt: now,
      ...(paymentStatus === 'verified' ? { verifiedAt: now } : {}),
      ...(additionalData || {}),
    });
  } catch (e) {
    console.warn('RTDB updateOrderStatusRealtime notice:', e);
  }
}

/**
 * Delete order from Firebase Realtime Database
 */
export async function deleteOrderRealtime(orderId: string): Promise<void> {
  try {
    await rtdbSet(rtdbRef(rtdb, `orders/${orderId}`), null);
  } catch (e) {
    console.warn('RTDB deleteOrderRealtime notice:', e);
  }
}


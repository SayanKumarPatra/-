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
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  getDocFromServer,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { firebaseConfig } from './config';
import type { Product, Student } from '../types';
import { FALLBACK_PRODUCTS } from '../constants/fallbackProducts';

// Initialize Firebase App singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
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
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return errInfo;
}

// Test initial connection to Firestore
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection check: Client appears offline or initial rule blocked.');
    }
  }
}
testConnection();

/**
 * Synchronize all 11 official BCA products with 3D textbook covers into Firestore
 */
export async function syncAllOfficialProductsToFirestore(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    for (const prod of FALLBACK_PRODUCTS) {
      await setDoc(
        doc(db, 'products', prod.id),
        {
          ...prod,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
    console.log('Synced 11 official BCA products into Firestore successfully');
    return { success: true, count: FALLBACK_PRODUCTS.length };
  } catch (err: any) {
    console.warn('Could not sync official products into Firestore:', err);
    return { success: false, count: 0, error: err?.message || 'Firestore write failed' };
  }
}

/**
 * Real-time Listener for Question Bank Products
 * Listens to Firestore 'products' collection.
 * If empty on first boot, auto-seeds with official BCA products.
 */
export function subscribeToProductsRealtime(
  onUpdate: (products: Product[]) => void,
  onError?: (err: any) => void
): () => void {
  const productsCol = collection(db, 'products');

  // Attempt initial sync in background
  syncAllOfficialProductsToFirestore().catch((e) => console.warn('Auto-sync notice:', e));

  const unsubscribe = onSnapshot(
    productsCol,
    async (snapshot) => {
      if (snapshot.empty) {
        // Auto-seed initial products to Firestore so admin can immediately edit them
        console.log('Firestore products empty, seeding default BCA products...');
        await syncAllOfficialProductsToFirestore();
        onUpdate(FALLBACK_PRODUCTS);
        return;
      }

      const products: Product[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const fallback = FALLBACK_PRODUCTS.find((p) => p.id === docSnap.id || p.subjectCode === data.subjectCode);
        const resolvedCover = data.coverImageUrl || data.imageUrl || fallback?.coverImageUrl || '';

        products.push({
          id: docSnap.id,
          semesterId: data.semesterId || 'sem-3',
          subjectCode: data.subjectCode || fallback?.subjectCode || '',
          subjectName: data.subjectName || fallback?.subjectName || '',
          description: data.description || fallback?.description || '',
          syllabusHighlights: data.syllabusHighlights || fallback?.syllabusHighlights || [],
          price: Number(data.price) || fallback?.price || 99,
          originalPrice: data.originalPrice ? Number(data.originalPrice) : fallback?.originalPrice,
          pageCount: Number(data.pageCount) || fallback?.pageCount || 30,
          privateStoragePath: data.privateStoragePath || fallback?.privateStoragePath || '',
          fileSizeKb: Number(data.fileSizeKb) || fallback?.fileSizeKb || 3000,
          published: data.published !== false,
          examYear: data.examYear || '2024-2025 Edition',
          coverImageUrl: resolvedCover,
          imageUrl: resolvedCover,
          paperType: data.paperType || fallback?.paperType || 'core',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });

      onUpdate(products);
    },
    (error) => {
      console.warn('Real-time products snapshot warning:', error);
      if (onError) onError(error);
      // Fallback
      onUpdate(FALLBACK_PRODUCTS);
    }
  );

  return unsubscribe;
}

/**
 * Real-time Update Product in Firestore
 * Updates price, original price, image, description, or published state
 */
export async function updateProductRealtime(
  productId: string,
  updates: Partial<Product>
): Promise<void> {
  const productRef = doc(db, 'products', productId);
  await setDoc(
    productRef,
    {
      ...updates,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

/**
 * Real-time Student Profile Sync
 * Saves student registration and details directly to Firestore
 */
export async function syncStudentProfileRealtime(student: {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  collegeName?: string;
  studentId?: string;
}): Promise<void> {
  const studentRef = doc(db, 'students', student.id);
  await setDoc(
    studentRef,
    {
      ...student,
      updatedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    },
    { merge: true }
  );
}

/**
 * Real-time Student Profile Subscription
 */
export function subscribeToStudentProfile(
  studentId: string,
  onUpdate: (student: Student | null) => void
): () => void {
  const studentRef = doc(db, 'students', studentId);
  return onSnapshot(
    studentRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        onUpdate({
          id: snapshot.id,
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
      console.warn('Student profile snapshot error:', err);
    }
  );
}

/**
 * Real-time Order Sync
 */
export async function saveOrderRealtime(order: any): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', order.orderId || `ord_${Date.now()}`);
    await setDoc(
      orderRef,
      {
        ...order,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Could not save order to Firestore:', err);
  }
}

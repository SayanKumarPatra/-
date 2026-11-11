import type { Semester, Product, Order, Purchase, DeviceBinding, AdminAuditLog } from '../types';

const ADMIN_STORAGE_KEY = 'bca_admin_auth_key';

export function getStoredAdminKey(): string | null {
  return localStorage.getItem(ADMIN_STORAGE_KEY);
}

export function setStoredAdminKey(key: string | null) {
  if (key) {
    localStorage.setItem(ADMIN_STORAGE_KEY, key);
  } else {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  }
}

import { FALLBACK_PRODUCTS } from '../constants/fallbackProducts';

export const api = {
  // --- Public Storefront ---
  async getSemesters(): Promise<{ semesters: Semester[] }> {
    try {
      const res = await fetch('/api/semesters');
      if (!res.ok) throw new Error('Failed to load semesters');
      return await res.json();
    } catch {
      return { semesters: [{ id: 'sem-3', semesterNumber: 3, title: 'BCA Semester 3', academicYear: 'Year 2', description: 'Core and Specialization Question Banks', published: true, createdAt: '', updatedAt: '' }] };
    }
  },

  async getProducts(semesterId?: string): Promise<{ products: Product[] }> {
    try {
      const url = semesterId ? `/api/products?semesterId=${encodeURIComponent(semesterId)}` : '/api/products';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load subjects');
      const data = await res.json();
      if (data.products && data.products.length > 0) {
        return data;
      }
      return { products: FALLBACK_PRODUCTS };
    } catch {
      // Graceful fallback to all 11 BCA 3rd Sem products for static/Vercel/offline deployments
      return { products: FALLBACK_PRODUCTS };
    }
  },

  async getProduct(id: string): Promise<{ product: Product }> {
    const res = await fetch(`/api/products/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Subject question bank not found');
    return res.json();
  },

  // --- Checkout & Payments ---
  async createCheckoutOrder(payload: {
    fullName: string;
    email: string;
    mobile: string;
    collegeName?: string;
    studentId?: string;
    selectedProductIds: string[];
  }): Promise<{
    success: boolean;
    order: {
      orderId: string;
      totalAmount: number;
      currency: string;
      items: any[];
      paymentGatewayOrderId: string;
      student: { id: string; fullName: string; email: string; mobile: string };
    };
    gatewayConfig: {
      isTestGateway: boolean;
      keyId: string;
      brandName: string;
    };
    error?: string;
  }> {
    const res = await fetch('/api/checkout/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to initiate checkout order');
    }
    return data;
  },

  async verifyPayment(payload: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature?: string;
    isTestSimulation?: boolean;
  }): Promise<{
    success: boolean;
    orderId: string;
    userId: string;
    purchasedProductIds: string[];
    totalAmount: number;
    error?: string;
  }> {
    const res = await fetch('/api/checkout/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || 'Payment verification failed');
    }
    return data;
  },

  // --- Student Purchased Content ---
  async getStudentPurchases(userId: string): Promise<{
    orders: Order[];
    purchases: Array<{
      purchaseId: string;
      productId: string;
      orderId: string;
      accessStatus: string;
      purchasedAt: string;
      subjectName: string;
      subjectCode: string;
      semesterId: string;
      pageCount: number;
      examYear: string;
    }>;
  }> {
    const res = await fetch(`/api/orders/user/${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Failed to load purchased question banks');
    return res.json();
  },

  // --- Secure PDF Viewer ---
  async createViewerSession(payload: {
    userId: string;
    productId: string;
    deviceToken: string;
    deviceInfo: any;
  }): Promise<{
    success: boolean;
    sessionToken?: string;
    expiresAt?: number;
    product?: any;
    watermark?: any;
    error?: string;
    message?: string;
    registeredDevice?: any;
    supportInfo?: any;
  }> {
    const res = await fetch('/api/viewer/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      return data;
    }
    return data;
  },

  async getViewerManifest(sessionToken: string) {
    const res = await fetch(`/api/viewer/manifest?token=${encodeURIComponent(sessionToken)}`);
    if (!res.ok) throw new Error('Session expired or document unavailable');
    return res.json();
  },

  getViewerPageUrl(sessionToken: string, pageNumber: number): string {
    return `/api/viewer/page?token=${encodeURIComponent(sessionToken)}&pageNumber=${pageNumber}`;
  },

  // --- Admin API ---
  async adminLogin(secretKey: string): Promise<{ success: boolean; adminKey: string }> {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secretKey }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Invalid administrator secret key');
    }
    return data;
  },

  async getAdminStats(): Promise<{
    stats: {
      totalOrders: number;
      verifiedOrders: number;
      totalRevenue: number;
      totalStudents: number;
      totalSubjects: number;
      publishedSubjects: number;
      activeDevices: number;
    };
    recentOrders: Order[];
    recentLogs: AdminAuditLog[];
  }> {
    const adminKey = getStoredAdminKey();
    const res = await fetch('/api/admin/stats', {
      headers: { 'x-admin-key': adminKey || '' },
    });
    if (!res.ok) throw new Error('Unauthorized or failed to load admin statistics');
    return res.json();
  },

  async createSemester(data: any): Promise<{ semester: Semester }> {
    const adminKey = getStoredAdminKey();
    const res = await fetch('/api/admin/semesters', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey || '',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create semester');
    return res.json();
  },

  async updateSemester(id: string, data: any): Promise<{ semester: Semester }> {
    const adminKey = getStoredAdminKey();
    const res = await fetch(`/api/admin/semesters/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey || '',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update semester');
    return res.json();
  },

  async createProductWithPdf(formData: FormData): Promise<{ product: Product }> {
    const adminKey = getStoredAdminKey();
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: {
        'x-admin-key': adminKey || '',
      },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to upload and create subject');
    return data;
  },

  async updateProductWithPdf(id: string, formData: FormData): Promise<{ product: Product }> {
    const adminKey = getStoredAdminKey();
    const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'x-admin-key': adminKey || '',
      },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update subject');
    return data;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<{ product: Product }> {
    const adminKey = getStoredAdminKey();
    const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey || '',
      },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update subject');
    return data;
  },

  async deleteProduct(id: string): Promise<void> {
    const adminKey = getStoredAdminKey();
    const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        'x-admin-key': adminKey || '',
      },
    });
    if (!res.ok) throw new Error('Failed to delete subject');
  },

  async getAdminOrders(): Promise<{ orders: Order[] }> {
    const adminKey = getStoredAdminKey();
    const res = await fetch('/api/admin/orders', {
      headers: { 'x-admin-key': adminKey || '' },
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async getAdminDevices(): Promise<{ devices: DeviceBinding[] }> {
    const adminKey = getStoredAdminKey();
    const res = await fetch('/api/admin/devices', {
      headers: { 'x-admin-key': adminKey || '' },
    });
    if (!res.ok) throw new Error('Failed to fetch registered devices');
    return res.json();
  },

  async resetDevice(userId: string, reason: string): Promise<{ success: boolean; message: string }> {
    const adminKey = getStoredAdminKey();
    const res = await fetch('/api/admin/devices/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey || '',
      },
      body: JSON.stringify({ userId, reason }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to reset device binding');
    return data;
  },

  async getAdminAuditLogs(): Promise<{ logs: AdminAuditLog[] }> {
    const adminKey = getStoredAdminKey();
    const res = await fetch('/api/admin/audit-logs', {
      headers: { 'x-admin-key': adminKey || '' },
    });
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  async clearTestData(): Promise<{ success: boolean; message: string }> {
    const adminKey = getStoredAdminKey();
    const res = await fetch('/api/admin/clear-test-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey || '',
      },
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to clear test data');
    return data;
  },
};

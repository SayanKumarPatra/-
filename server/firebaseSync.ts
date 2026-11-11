/**
 * Server-side Firebase Realtime Database Sync
 * Synchronizes orders, students, and products directly to https://bcastudypoint-cdfdf-default-rtdb.firebaseio.com
 */

const RTDB_BASE_URL = 'https://bcastudypoint-cdfdf-default-rtdb.firebaseio.com';

async function safeRtdbFetch(endpoint: string, method: string = 'GET', data?: any) {
  try {
    const url = `${RTDB_BASE_URL}/${endpoint}.json`;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!res.ok) {
      console.warn(`[Firebase RTDB] ${method} ${endpoint} failed with status: ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err: any) {
    console.warn(`[Firebase RTDB Sync Error] ${method} ${endpoint}:`, err?.message || err);
    return null;
  }
}

export const firebaseSync = {
  /**
   * Sync all products into Firebase Realtime Database
   */
  async syncProducts(products: any[]) {
    const productsMap: Record<string, any> = {};
    for (const p of products) {
      productsMap[p.id] = p;
    }
    return safeRtdbFetch('products', 'PUT', productsMap);
  },

  /**
   * Sync or update a single order
   */
  async syncOrder(order: any) {
    if (!order?.orderId) return;
    return safeRtdbFetch(`orders/${order.orderId}`, 'PUT', {
      ...order,
      syncedAt: new Date().toISOString(),
    });
  },

  /**
   * Sync a student record
   */
  async syncStudent(student: any) {
    if (!student?.id) return;
    return safeRtdbFetch(`students/${student.id}`, 'PUT', {
      ...student,
      syncedAt: new Date().toISOString(),
    });
  },

  /**
   * Update order status (approved or rejected)
   */
  async updateOrderStatus(orderId: string, status: string, additionalData?: any) {
    return safeRtdbFetch(`orders/${orderId}`, 'PATCH', {
      paymentStatus: status,
      updatedAt: new Date().toISOString(),
      ...(additionalData || {}),
    });
  },

  /**
   * Fetch all orders currently saved in Firebase Realtime Database
   */
  async fetchOrders(): Promise<Record<string, any> | null> {
    return safeRtdbFetch('orders', 'GET');
  },

  /**
   * Fetch all products currently saved in Firebase Realtime Database
   */
  async fetchProducts(): Promise<Record<string, any> | null> {
    return safeRtdbFetch('products', 'GET');
  },

  /**
   * Delete order from Firebase Realtime Database
   */
  async deleteOrder(orderId: string) {
    if (!orderId) return;
    return safeRtdbFetch(`orders/${orderId}`, 'DELETE');
  },
};

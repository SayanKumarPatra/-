/**
 * Types and interfaces for BCA STUDY POINT
 */

export interface Semester {
  id: string;
  semesterNumber: number;
  title: string;
  academicYear: string; // e.g. "Year 1", "Year 2", "Year 3"
  description: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  semesterId: string;
  subjectCode: string; // e.g. "BCA-101"
  subjectName: string; // e.g. "Programming in C & Data Types"
  description: string;
  syllabusHighlights: string[];
  price: number; // in INR (e.g. 149)
  originalPrice?: number; // e.g. 299
  pageCount: number;
  privateStoragePath: string; // e.g. "pdfs/bca_101_c_programming.pdf"
  fileSizeKb: number;
  published: boolean;
  examYear: string; // e.g. "2024-2025 Edition"
  coverImageUrl?: string;
  paperType?: 'core' | 'specialization';
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  email: string;
  fullName: string;
  mobile: string;
  collegeName?: string;
  studentId?: string;
  passwordHash?: string;
  registeredDeviceHash?: string;
  registeredDeviceName?: string;
  registeredAt: string;
  lastLoginAt: string;
  lastIp?: string;
}

export interface OrderItem {
  productId: string;
  subjectName: string;
  subjectCode: string;
  price: number;
}

export interface Order {
  orderId: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  studentMobile: string;
  collegeName?: string;
  studentId?: string;
  selectedProductIds: string[];
  items: OrderItem[];
  totalAmount: number;
  paymentGatewayOrderId?: string;
  paymentReference?: string;
  paymentStatus: 'pending' | 'verified' | 'failed' | 'cancelled';
  paymentMethod?: string;
  createdAt: string;
  verifiedAt?: string;
  ipAddress?: string;
}

export interface Purchase {
  purchaseId: string;
  userId: string;
  productId: string;
  orderId: string;
  accessStatus: 'active' | 'revoked';
  createdAt: string;
}

export interface DeviceBinding {
  id: string;
  userId: string;
  userEmail: string;
  studentName: string;
  deviceTokenHash: string;
  deviceDescription: string;
  os: string;
  browser: string;
  registeredAt: string;
  lastSeenAt: string;
  lastIp: string;
  registrationStatus: 'active' | 'revoked';
  resetCount: number;
}

export interface ViewerSession {
  sessionId: string;
  token: string;
  userId: string;
  productId: string;
  deviceTokenHash: string;
  studentName: string;
  studentEmail: string;
  orderId: string;
  expiresAt: number; // Unix timestamp
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  action: string;
  targetId?: string;
  targetType?: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

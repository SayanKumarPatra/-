import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  Semester,
  Product,
  Student,
  Order,
  Purchase,
  DeviceBinding,
  ViewerSession,
  AdminAuditLog,
} from '../src/types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'bca_database.json');
export const PDF_STORAGE_DIR = path.join(DATA_DIR, 'private_storage', 'pdfs');

interface DatabaseSchema {
  semesters: Semester[];
  products: Product[];
  students: Student[];
  orders: Order[];
  purchases: Purchase[];
  devices: DeviceBinding[];
  viewerSessions: ViewerSession[];
  adminAuditLogs: AdminAuditLog[];
}

// Initial seed data for BCA Study Point - Focused strictly on BCA Semester 3
const SEED_SEMESTERS: Semester[] = [
  {
    id: 'sem-3',
    semesterNumber: 3,
    title: 'BCA Semester 3',
    academicYear: '2nd Year (3rd Semester)',
    description: 'BCA Semester 3 core question banks & specialization pack with verified solutions.',
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SEED_PRODUCTS: Product[] = [
  // Core Papers (Semester 3)
  {
    id: 'prod-bca-maj3',
    semesterId: 'sem-3',
    subjectCode: 'MAJ-3',
    subjectName: 'COMPUTER ARCHITECTURE MAJ-3',
    description: 'Complete 3rd semester university question bank for Computer Architecture (MAJ-3). Processor organization, ALU design, memory hierarchy, pipelining, and instruction cycles.',
    syllabusHighlights: [
      'CPU Organization & Instruction Set Architecture (ISA)',
      'Memory Hierarchy: Cache Mapping & Virtual Memory',
      'Pipelining Hazards: Structural, Data, & Control',
      'I/O Organization & DMA Controller Architecture',
    ],
    price: 99,
    originalPrice: 199,
    pageCount: 38,
    privateStoragePath: 'pdfs/bca_maj3_computer_architecture.pdf',
    fileSizeKb: 3450,
    published: true,
    examYear: '2024-2025 Edition',
    paperType: 'core',
    coverImageUrl: '/assets/aistudio/Computer_Architecture__BCA_Study_Point_18218658.png',
    imageUrl: '/assets/aistudio/Computer_Architecture__BCA_Study_Point_18218658.png',
    createdAt: '2026-11-10T00:00:00.000Z',
    updatedAt: '2026-11-10T00:00:00.000Z',
  },
  {
    id: 'prod-bca-min3',
    semesterId: 'sem-3',
    subjectCode: 'MIN-3',
    subjectName: 'BUSINESS ENVIRONMENT MIN-3',
    description: 'Comprehensive solved question bank for Business Environment (MIN-3). Macroeconomic factors, fiscal & monetary policies, corporate governance, and industrial policies.',
    syllabusHighlights: [
      'Economic, Political & Technological Environment Analysis',
      'Industrial Policies & Make in India Initiatives',
      'Monetary and Fiscal Policies & RBI Framework',
      'Globalization, EXIM Policies, and WTO Regulations',
    ],
    price: 99,
    originalPrice: 199,
    pageCount: 32,
    privateStoragePath: 'pdfs/bca_min3_business_environment.pdf',
    fileSizeKb: 2890,
    published: true,
    examYear: '2024-2025 Edition',
    paperType: 'core',
    coverImageUrl: '/assets/aistudio/Business_Environment_Study_Guide___BCA_d342aa56.png',
    imageUrl: '/assets/aistudio/Business_Environment_Study_Guide___BCA_d342aa56.png',
    createdAt: '2026-11-10T00:00:00.000Z',
    updatedAt: '2026-11-10T00:00:00.000Z',
  },
  {
    id: 'prod-bca-mdc3',
    semesterId: 'sem-3',
    subjectCode: 'MDC-3',
    subjectName: 'BUSNIESS ETHICS & CSR MDC-3',
    description: 'Solved question bank for Business Ethics & Corporate Social Responsibility (MDC-3). Moral standards in management, corporate governance scandals, CSR initiatives, and case studies.',
    syllabusHighlights: [
      'Theories of Ethics: Utilitarianism, Deontology & Virtue Ethics',
      'Corporate Governance Frameworks & Board Accountability',
      'Companies Act 2013 Section 135 CSR Mandate',
      'Environmental Sustainability & Green Business Models',
    ],
    price: 99,
    originalPrice: 199,
    pageCount: 28,
    privateStoragePath: 'pdfs/bca_mdc3_business_ethics.pdf',
    fileSizeKb: 2450,
    published: true,
    examYear: '2024-2025 Edition',
    paperType: 'core',
    coverImageUrl: '/assets/aistudio/BCA_Business_Ethics___CSR_Study_Guide_61e7d68f.png',
    imageUrl: '/assets/aistudio/BCA_Business_Ethics___CSR_Study_Guide_61e7d68f.png',
    createdAt: '2026-11-10T00:00:00.000Z',
    updatedAt: '2026-11-10T00:00:00.000Z',
  },
  {
    id: 'prod-bca-sec3',
    semesterId: 'sem-3',
    subjectCode: 'SEC-3',
    subjectName: 'ADVANCED DATABASES SYSTEMS SEC-3',
    description: 'Complete examination question bank with verified solutions for Advanced Database Systems (SEC-3). Query optimization, indexing, ACID transactions, NoSQL schemas, and concurrency control.',
    syllabusHighlights: [
      'Advanced Relational Algebra & Cost-Based Query Optimization',
      'Transaction Processing, Two-Phase Locking (2PL) & Serializability',
      'B+ Trees, Bitmap Indexes & Hash Clustering',
      'Distributed Databases, CAP Theorem, & MongoDB NoSQL Schemas',
    ],
    price: 129,
    originalPrice: 249,
    pageCount: 46,
    privateStoragePath: 'pdfs/bca_sec3_advanced_databases.pdf',
    fileSizeKb: 4120,
    published: true,
    examYear: '2024-2025 Edition',
    paperType: 'core',
    coverImageUrl: '/assets/aistudio/Advanced_Database_Systems_Cover_f9561bdc.png',
    imageUrl: '/assets/aistudio/Advanced_Database_Systems_Cover_f9561bdc.png',
    createdAt: '2026-11-10T00:00:00.000Z',
    updatedAt: '2026-11-10T00:00:00.000Z',
  },
  {
    id: 'prod-bca-aec3-bengali',
    semesterId: 'sem-3',
    subjectCode: 'AEC-3',
    subjectName: 'BENGALI AEC-3',
    description: 'University syllabus-aligned question bank for Bengali AEC-3. Selected essays, modern prose, grammar, composition, and previous year university paper solutions.',
    syllabusHighlights: [
      'Selected Bengali Literary Works & Thematic Analysis',
      'Grammar, Vocabulary Enrichment & Orthography',
      'Comprehension, Report Writing & Official Correspondence',
      'Past 5 Years Solved University Questions with Model Answers',
    ],
    price: 79,
    originalPrice: 149,
    pageCount: 30,
    privateStoragePath: 'pdfs/bca_aec3_bengali.pdf',
    fileSizeKb: 2650,
    published: true,
    examYear: '2024-2025 Edition',
    paperType: 'core',
    coverImageUrl: '/assets/aistudio/Bengali_AEC-3_Study_Guide_Cover_be6e35e1.png',
    imageUrl: '/assets/aistudio/Bengali_AEC-3_Study_Guide_Cover_be6e35e1.png',
    createdAt: '2026-11-10T00:00:00.000Z',
    updatedAt: '2026-11-10T00:00:00.000Z',
  },
  {
    id: 'prod-bca-aec3-sanskrit',
    semesterId: 'sem-3',
    subjectCode: 'AEC-3',
    subjectName: 'SANSKRIT AEC-3',
    description: 'Curated question bank for Sanskrit AEC-3. Shlokas, translations, classical grammar rules, sandhi, samasa, and probable semester questions.',
    syllabusHighlights: [
      'Prescribed Sanskrit Subhashitani & Literary Passages',
      'Paninian Grammar Fundamentals: Sandhi, Karaka & Samasa',
      'Translation from Sanskrit to Bengali / English',
      'University Examination Probable Questions & Answers',
    ],
    price: 79,
    originalPrice: 149,
    pageCount: 26,
    privateStoragePath: 'pdfs/bca_aec3_sanskrit.pdf',
    fileSizeKb: 2310,
    published: true,
    examYear: '2024-2025 Edition',
    paperType: 'core',
    coverImageUrl: '/assets/aistudio/BCA_Sanskrit_Study_Guide_Cover_b154f707.png',
    imageUrl: '/assets/aistudio/BCA_Sanskrit_Study_Guide_Cover_b154f707.png',
    createdAt: '2026-11-10T00:00:00.000Z',
    updatedAt: '2026-11-10T00:00:00.000Z',
  },

  // Specialization Pack (Semester 3)
  {
    id: 'prod-spec-ai',
    semesterId: 'sem-3',
    subjectCode: 'SPEC-AI',
    subjectName: 'ARTIFICIAL INTELLIGENCE (AI)',
    description: 'Specialization pack question bank for Artificial Intelligence. Heuristic search algorithms (A*, AO*), knowledge representation, first-order logic, rule-based expert systems, and NLP basics.',
    syllabusHighlights: [
      'State-Space Search, A* Heuristic & Minimax Game Trees',
      'Propositional & First-Order Predicate Logic (FOPL)',
      'Unification & Resolution Refutation Proofs',
      'Expert Systems Architecture & Forward/Backward Chaining',
    ],
    price: 149,
    originalPrice: 299,
    pageCount: 42,
    privateStoragePath: 'pdfs/bca_spec_ai.pdf',
    fileSizeKb: 3950,
    published: true,
    examYear: '2024-2025 Edition',
    paperType: 'specialization',
    coverImageUrl: '/assets/aistudio/BCA_Artificial_Intelligence_Question_Bank_afd929e2.png',
    imageUrl: '/assets/aistudio/BCA_Artificial_Intelligence_Question_Bank_afd929e2.png',
    createdAt: '2026-11-10T00:00:00.000Z',
    updatedAt: '2026-11-10T00:00:00.000Z',
  },
  {
    id: 'prod-spec-ml',
    semesterId: 'sem-3',
    subjectCode: 'SPEC-ML',
    subjectName: 'MACHINE LEARNING (ML)',
    description: 'Specialization pack question bank for Machine Learning. Supervised & unsupervised algorithms, regression, classification, decision trees, neural network backpropagation, and model evaluation.',
    syllabusHighlights: [
      'Linear & Logistic Regression, Cost Functions & Gradient Descent',
      'Decision Trees, ID3/C4.5, Entropy & Information Gain',
      'Support Vector Machines (SVM) & Kernel Functions',
      'K-Means Clustering, PCA & Cross-Validation Metrics',
    ],
    price: 149,
    originalPrice: 299,
    pageCount: 44,
    privateStoragePath: 'pdfs/bca_spec_ml.pdf',
    fileSizeKb: 4200,
    published: true,
    examYear: '2024-2025 Edition',
    paperType: 'specialization',
    coverImageUrl: '/assets/aistudio/Machine_Learning_BCA_Question_Bank_1e49d965.png',
    imageUrl: '/assets/aistudio/Machine_Learning_BCA_Question_Bank_1e49d965.png',
    createdAt: '2026-11-10T00:00:00.000Z',
    updatedAt: '2026-11-10T00:00:00.000Z',
  },
  {
    id: 'prod-spec-ds',
    semesterId: 'sem-3',
    subjectCode: 'SPEC-DS',
    subjectName: 'DATA SCIENCE (DS)',
    description: 'Specialization pack question bank for Data Science. Statistical inference, data wrangling with Pandas/NumPy, exploratory data analysis (EDA), hypothesis testing, and predictive modeling.',
    syllabusHighlights: [
      'Probability Distributions, Central Limit Theorem & p-Values',
      'Data Cleaning, Imputation & Outlier Detection in Python',
      'Exploratory Data Analysis (EDA) & Matplotlib/Seaborn Workflows',
      'Dimensionality Reduction & Feature Selection Techniques',
    ],
    price: 149,
    originalPrice: 299,
    pageCount: 40,
    privateStoragePath: 'pdfs/bca_spec_ds.pdf',
    fileSizeKb: 3880,
    published: true,
    examYear: '2024-2025 Edition',
    paperType: 'specialization',
    coverImageUrl: '/assets/aistudio/Data_Science_Question_Bank_Cover_f9489954.png',
    imageUrl: '/assets/aistudio/Data_Science_Question_Bank_Cover_f9489954.png',
    createdAt: '2026-11-10T00:00:00.000Z',
    updatedAt: '2026-11-10T00:00:00.000Z',
  },
  {
    id: 'prod-spec-cs',
    semesterId: 'sem-3',
    subjectCode: 'SPEC-CS',
    subjectName: 'CYBER SECURITY (CS)',
    description: 'Specialization pack question bank for Cyber Security. Cryptography (RSA, AES), network security protocols (SSL/TLS, IPSec), firewall architectures, ethical hacking, and vulnerability assessments.',
    syllabusHighlights: [
      'Symmetric & Asymmetric Ciphers: DES, AES & RSA Cryptosystems',
      'Digital Signatures, Hash Functions (SHA-256) & PKI',
      'Network Attack Vectors: MITM, DDoS, SQL Injection & XSS',
      'Firewalls, IDS/IPS Configuration & Security Incident Audits',
    ],
    price: 149,
    originalPrice: 299,
    pageCount: 40,
    privateStoragePath: 'pdfs/bca_spec_cs.pdf',
    fileSizeKb: 3790,
    published: true,
    examYear: '2024-2025 Edition',
    paperType: 'specialization',
    coverImageUrl: '/assets/aistudio/Cyber_Security_Question_Bank_Cover_b9a7e2d8.png',
    imageUrl: '/assets/aistudio/Cyber_Security_Question_Bank_Cover_b9a7e2d8.png',
    createdAt: '2026-11-10T00:00:00.000Z',
    updatedAt: '2026-11-10T00:00:00.000Z',
  },
  {
    id: 'prod-spec-iot',
    semesterId: 'sem-3',
    subjectCode: 'SPEC-IOT',
    subjectName: 'ITES & IOT (ITES)',
    description: 'Specialization pack question bank for ITES & Internet of Things. Sensor interfacing, microcontroller architectures (Arduino/ESP32), IoT communication protocols (MQTT, CoAP), and cloud IoT platforms.',
    syllabusHighlights: [
      'IoT Architecture: Perception, Network, & Application Layers',
      'Sensor & Actuator Interfacing with Embedded Controllers',
      'IoT Communication: MQTT, CoAP, ZigBee, and LoRaWAN',
      'Cloud IoT Integration, Edge Computing & Smart City Case Studies',
    ],
    price: 149,
    originalPrice: 299,
    pageCount: 36,
    privateStoragePath: 'pdfs/bca_spec_iot.pdf',
    fileSizeKb: 3600,
    published: true,
    examYear: '2024-2025 Edition',
    paperType: 'specialization',
    coverImageUrl: '/assets/aistudio/ITES___IoT_BCA_Study_Guide_4a8dde20.png',
    imageUrl: '/assets/aistudio/ITES___IoT_BCA_Study_Guide_4a8dde20.png',
    createdAt: '2026-11-10T00:00:00.000Z',
    updatedAt: '2026-11-10T00:00:00.000Z',
  },
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirs();
    this.data = this.load();
  }

  private ensureDirs() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(PDF_STORAGE_DIR)) {
      fs.mkdirSync(PDF_STORAGE_DIR, { recursive: true });
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          semesters: parsed.semesters || SEED_SEMESTERS,
          products: parsed.products || SEED_PRODUCTS,
          students: parsed.students || [],
          orders: parsed.orders || [],
          purchases: parsed.purchases || [],
          devices: parsed.devices || [],
          viewerSessions: parsed.viewerSessions || [],
          adminAuditLogs: parsed.adminAuditLogs || [],
        };
      }
    } catch (e) {
      console.error('Failed to parse database file, re-initializing seeds', e);
    }

    const initial: DatabaseSchema = {
      semesters: SEED_SEMESTERS,
      products: SEED_PRODUCTS,
      students: [],
      orders: [],
      purchases: [],
      devices: [],
      viewerSessions: [],
      adminAuditLogs: [
        {
          id: 'log-seed-1',
          adminId: 'system',
          action: 'SYSTEM_BOOTSTRAP',
          details: 'Initialized BCA Study Point core semesters and question banks.',
          timestamp: new Date().toISOString(),
        },
      ],
    };
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database to file:', err);
    }
  }

  private persist() {
    this.saveData(this.data);
  }

  // --- SEMESTERS ---
  getSemesters(): Semester[] {
    return this.data.semesters;
  }

  getPublishedSemesters(): Semester[] {
    return this.data.semesters.filter((s) => s.published);
  }

  getSemester(id: string): Semester | undefined {
    return this.data.semesters.find((s) => s.id === id);
  }

  createSemester(sem: Omit<Semester, 'id' | 'createdAt' | 'updatedAt'>): Semester {
    const newSem: Semester = {
      ...sem,
      id: `sem-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.semesters.push(newSem);
    this.persist();
    return newSem;
  }

  updateSemester(id: string, updates: Partial<Semester>): Semester | undefined {
    const idx = this.data.semesters.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    this.data.semesters[idx] = {
      ...this.data.semesters[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.semesters[idx];
  }

  // --- PRODUCTS ---
  getProducts(): Product[] {
    return this.data.products;
  }

  getPublishedProducts(): Product[] {
    return this.data.products.filter((p) => p.published);
  }

  getProduct(id: string): Product | undefined {
    return this.data.products.find((p) => p.id === id);
  }

  createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.products.push(newProduct);
    this.persist();
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | undefined {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    this.data.products[idx] = {
      ...this.data.products[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.products[idx];
  }

  deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter((p) => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- STUDENTS ---
  getStudents(): Student[] {
    return this.data.students;
  }

  getStudent(id: string): Student | undefined {
    return this.data.students.find((s) => s.id === id);
  }

  getStudentByEmail(email: string): Student | undefined {
    return this.data.students.find(
      (s) => s.email.toLowerCase().trim() === email.toLowerCase().trim()
    );
  }

  upsertStudent(studentData: {
    email: string;
    fullName: string;
    mobile: string;
    collegeName?: string;
    studentId?: string;
    ip?: string;
  }): Student {
    let student = this.getStudentByEmail(studentData.email);
    if (student) {
      student.fullName = studentData.fullName || student.fullName;
      student.mobile = studentData.mobile || student.mobile;
      if (studentData.collegeName) student.collegeName = studentData.collegeName;
      if (studentData.studentId) student.studentId = studentData.studentId;
      student.lastLoginAt = new Date().toISOString();
      if (studentData.ip) student.lastIp = studentData.ip;
      this.persist();
      return student;
    }

    student = {
      id: `std-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email: studentData.email.toLowerCase().trim(),
      fullName: studentData.fullName,
      mobile: studentData.mobile,
      collegeName: studentData.collegeName,
      studentId: studentData.studentId,
      registeredAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      lastIp: studentData.ip,
    };
    this.data.students.push(student);
    this.persist();
    return student;
  }

  // --- ORDERS ---
  getOrders(): Order[] {
    return this.data.orders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getOrder(orderId: string): Order | undefined {
    return this.data.orders.find((o) => o.orderId === orderId);
  }

  getStudentOrders(userId: string): Order[] {
    return this.data.orders.filter((o) => o.userId === userId);
  }

  createOrder(order: Order): Order {
    this.data.orders.push(order);
    this.persist();
    return order;
  }

  updateOrder(orderId: string, updates: Partial<Order>): Order | undefined {
    const idx = this.data.orders.findIndex((o) => o.orderId === orderId);
    if (idx === -1) return undefined;
    this.data.orders[idx] = {
      ...this.data.orders[idx],
      ...updates,
    };
    this.persist();
    return this.data.orders[idx];
  }

  // --- PURCHASES ---
  getPurchases(): Purchase[] {
    return this.data.purchases;
  }

  getStudentPurchases(userId: string): Purchase[] {
    return this.data.purchases.filter(
      (p) => p.userId === userId && p.accessStatus === 'active'
    );
  }

  hasPurchased(userId: string, productId: string): boolean {
    return this.data.purchases.some(
      (p) => p.userId === userId && p.productId === productId && p.accessStatus === 'active'
    );
  }

  grantPurchases(userId: string, orderId: string, productIds: string[]): Purchase[] {
    const created: Purchase[] = [];
    for (const prodId of productIds) {
      const exists = this.data.purchases.find(
        (p) => p.userId === userId && p.productId === prodId
      );
      if (exists) {
        exists.accessStatus = 'active';
        exists.orderId = orderId;
        created.push(exists);
      } else {
        const purchase: Purchase = {
          purchaseId: `pur-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          userId,
          productId: prodId,
          orderId,
          accessStatus: 'active',
          createdAt: new Date().toISOString(),
        };
        this.data.purchases.push(purchase);
        created.push(purchase);
      }
    }
    this.persist();
    return created;
  }

  // --- DEVICE BINDING ---
  getDevices(): DeviceBinding[] {
    return this.data.devices;
  }

  getStudentDevice(userId: string): DeviceBinding | undefined {
    return this.data.devices.find(
      (d) => d.userId === userId && d.registrationStatus === 'active'
    );
  }

  registerDevice(deviceData: {
    userId: string;
    userEmail: string;
    studentName: string;
    deviceTokenHash: string;
    deviceDescription: string;
    os: string;
    browser: string;
    ip: string;
  }): { success: boolean; device?: DeviceBinding; error?: string } {
    const existing = this.data.devices.find(
      (d) => d.userId === deviceData.userId && d.registrationStatus === 'active'
    );

    if (existing) {
      if (existing.deviceTokenHash === deviceData.deviceTokenHash) {
        existing.lastSeenAt = new Date().toISOString();
        existing.lastIp = deviceData.ip;
        this.persist();
        return { success: true, device: existing };
      } else {
        return {
          success: false,
          error: 'DEVICE_MISMATCH',
          device: existing,
        };
      }
    }

    const newDevice: DeviceBinding = {
      id: `dev-${Date.now()}`,
      userId: deviceData.userId,
      userEmail: deviceData.userEmail,
      studentName: deviceData.studentName,
      deviceTokenHash: deviceData.deviceTokenHash,
      deviceDescription: deviceData.deviceDescription,
      os: deviceData.os,
      browser: deviceData.browser,
      registeredAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      lastIp: deviceData.ip,
      registrationStatus: 'active',
      resetCount: 0,
    };

    this.data.devices.push(newDevice);
    this.persist();
    return { success: true, device: newDevice };
  }

  resetStudentDevice(userId: string, adminId: string, reason: string): boolean {
    const devices = this.data.devices.filter(
      (d) => d.userId === userId && d.registrationStatus === 'active'
    );
    if (devices.length === 0) return false;

    for (const d of devices) {
      d.registrationStatus = 'revoked';
      d.resetCount += 1;
    }

    // Invalidate any active viewer sessions for this user
    this.data.viewerSessions = this.data.viewerSessions.filter((s) => s.userId !== userId);

    this.logAdminAction({
      adminId,
      action: 'DEVICE_RESET',
      targetId: userId,
      targetType: 'STUDENT',
      details: `Revoked registered device for user ${userId}. Reason: ${reason}`,
    });

    this.persist();
    return true;
  }

  // --- VIEWER SESSIONS ---
  createViewerSession(session: ViewerSession): ViewerSession {
    this.cleanExpiredSessions();
    this.data.viewerSessions.push(session);
    this.persist();
    return session;
  }

  getViewerSession(token: string): ViewerSession | undefined {
    this.cleanExpiredSessions();
    return this.data.viewerSessions.find((s) => s.token === token);
  }

  private cleanExpiredSessions() {
    const now = Date.now();
    this.data.viewerSessions = this.data.viewerSessions.filter(
      (s) => s.expiresAt > now
    );
  }

  // --- AUDIT LOGS ---
  logAdminAction(log: Omit<AdminAuditLog, 'id' | 'timestamp'>): AdminAuditLog {
    const fullLog: AdminAuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.adminAuditLogs.unshift(fullLog);
    if (this.data.adminAuditLogs.length > 500) {
      this.data.adminAuditLogs = this.data.adminAuditLogs.slice(0, 500);
    }
    this.persist();
    return fullLog;
  }

  clearOrdersAndStudentData(adminId: string = 'admin') {
    this.data.orders = [];
    this.data.purchases = [];
    this.data.students = [];
    this.data.devices = [];
    this.data.viewerSessions = [];
    this.persist();
    this.logAdminAction({
      adminId,
      action: 'SYSTEM_DATA_CLEARED',
      details: 'All old orders, test purchases, students, and device sessions cleared.',
    });
    return true;
  }

  getAuditLogs(): AdminAuditLog[] {
    return this.data.adminAuditLogs;
  }
}

export const db = new Database();

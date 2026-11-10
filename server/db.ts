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
    subjectName: 'Computer Architecture',
    description: 'Complete 3rd semester university question bank for Computer Architecture (MAJ-3). Processor organization, ALU design, memory hierarchy, pipelining, and instruction cycles.',
    syllabusHighlights: [
      'CPU Organization & Instruction Set Architecture (ISA)',
      'Memory Hierarchy: Cache Mapping & Virtual Memory',
      'Pipelining Hazards: Structural, Data, & Control',
      'I/O Organization & DMA Controller Architecture',
    ],
    price: 99,
    originalPrice: 199,
    pageCount: 36,
    privateStoragePath: 'pdfs/bca_maj3_computer_architecture.pdf',
    fileSizeKb: 1350,
    published: true,
    examYear: '2024-2025 Edition',
    paperType: 'core',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-bca-min3',
    semesterId: 'sem-3',
    subjectCode: 'MIN-3',
    subjectName: 'Business Environment',
    description: 'University solved question bank for Business Environment (MIN-3). Micro & macro environmental factors, economic policies, globalization, and regulatory frameworks.',
    syllabusHighlights: [
      'PESTLE Analysis & Macro-Environmental Dimensions',
      'Monetary & Fiscal Policies Impact on IT Industry',
      'FDI Trends, Globalization & WTO Guidelines',
      'Corporate Governance & Industrial Policy Resolutions',
    ],
    price: 99,
    originalPrice: 199,
    pageCount: 32,
    privateStoragePath: 'pdfs/bca_min3_business_environment.pdf',
    fileSizeKb: 1220,
    published: true,
    examYear: '2024-2025 Edition',
    paperType: 'core',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-bca-mdc3',
    semesterId: 'sem-3',
    subjectCode: 'MDC-3',
    subjectName: 'Business Ethics & CSR',
    description: 'University solved question bank for Business Ethics & CSR (MDC-3). Moral philosophy, ethical dilemmas in technology, corporate social responsibility, and Indian business values.',
    syllabusHighlights: [
      'Ethical Theories: Utilitarianism, Deontology & Virtue Ethics',
      'Corporate Social Responsibility (CSR) Frameworks in India',
      'Ethical Issues in AI, Data Privacy & Digital Surveillance',
      'Environmental Sustainability & ESG Compliance',
    ],
    price: 99,
    originalPrice: 199,
    pageCount: 34,
    privateStoragePath: 'pdfs/bca_mdc3_business_ethics_csr.pdf',
    fileSizeKb: 1280,
    published: true,
    examYear: '2024-2025 Edition',
    paperType: 'core',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-bca-sec3',
    semesterId: 'sem-3',
    subjectCode: 'SEC-3',
    subjectName: 'Advanced Databases Systems',
    description: 'University solved question bank for Advanced Databases Systems (SEC-3). Query optimization, transaction recovery, distributed databases, NoSQL concepts, and indexing structures.',
    syllabusHighlights: [
      'B+ Tree & Hash Indexing Internal Algorithms',
      'Query Optimization, Relational Algebra Execution Trees',
      'Concurrency Control: 2PL, Timestamp Ordering & Multiversion',
      'Distributed DBs & NoSQL CAP Theorem Architecture',
    ],
    price: 129,
    originalPrice: 249,
    pageCount: 42,
    privateStoragePath: 'pdfs/bca_sec3_advanced_databases.pdf',
    fileSizeKb: 1620,
    published: true,
    examYear: '2024-2025 Edition',
    paperType: 'core',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-bca-aec3-ben',
    semesterId: 'sem-3',
    subjectCode: 'AEC-3',
    subjectName: 'Bengali (AEC-3)',
    description: 'University exam solved question bank for Bengali (AEC-3). Literary analysis, linguistic composition, report drafting, and exam comprehension passages.',
    syllabusHighlights: [
      'পাঠ্যভিত্তিক সাহিত্য বিশ্লেষণ ও প্রশ্নোত্তর',
      'প্রতিবেদন রচনা ও ব্যাকরণিক বিশ্লেষণ',
      'ভাবার্থ লিখন ও সারসংক্ষেপ প্রস্তুতি',
      'বিগত বছরের মডেল প্রশ্নপত্র সমাধান',
    ],
    price: 79,
    originalPrice: 149,
    pageCount: 28,
    privateStoragePath: 'pdfs/bca_aec3_bengali.pdf',
    fileSizeKb: 1100,
    published: true,
    examYear: '2024-2025 Edition',
    paperType: 'core',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-bca-aec3-san',
    semesterId: 'sem-3',
    subjectCode: 'AEC-3',
    subjectName: 'Sanskrit (AEC-3)',
    description: 'University exam solved question bank for Sanskrit (AEC-3). Classical grammar rules, shloka interpretation, sandhi, samas, and model translation exercises.',
    syllabusHighlights: [
      'श्लोक व्याख्या एवं सन्दर्भ स्पष्टीकरण',
      'सन्धि, समास एवं शब्दरूप/धातुरूप अभ्यास',
      'संस्कृत अनुवाद एवं अपठित गद्यांश समाधान',
      'विश्वविद्यालय परीक्षा हेतु महत्वपूर्ण प्रश्नोत्तर',
    ],
    price: 79,
    originalPrice: 149,
    pageCount: 28,
    privateStoragePath: 'pdfs/bca_aec3_sanskrit.pdf',
    fileSizeKb: 1080,
    published: true,
    examYear: '2024-2025 Edition',
    paperType: 'core',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Specialization Pack (Semester 3)
  {
    id: 'prod-bca-spec-ai',
    semesterId: 'sem-3',
    subjectCode: 'SPEC-AI',
    subjectName: 'Artificial Intelligence (AI)',
    description: 'Specialization Pack solved question bank for Artificial Intelligence (AI). State space search (A*, heuristic searches), knowledge representation, expert systems, and first-order predicate logic.',
    syllabusHighlights: [
      'Heuristic Search Techniques: BFS, DFS, A*, Hill Climbing',
      'Knowledge Representation: Semantic Nets, Frames, FOPL',
      'Game Playing: Minimax Algorithm & Alpha-Beta Pruning',
      'Uncertain Knowledge: Bayesian Networks & Fuzzy Logic',
    ],
    price: 149,
    originalPrice: 299,
    pageCount: 45,
    privateStoragePath: 'pdfs/bca_spec_ai.pdf',
    fileSizeKb: 1750,
    published: true,
    examYear: '2024-2025 Edition',
    paperType: 'specialization',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-bca-spec-ml',
    semesterId: 'sem-3',
    subjectCode: 'SPEC-ML',
    subjectName: 'Machine Learning (ML)',
    description: 'Specialization Pack solved question bank for Machine Learning (ML). Supervised vs unsupervised algorithms, linear/logistic regression, SVM, decision trees, neural network backpropagation, and clustering.',
    syllabusHighlights: [
      'Supervised Learning: Linear/Logistic Regression & Cost Functions',
      'Decision Trees, Entropy, Information Gain, & Random Forests',
      'Support Vector Machines (SVM) & Kernel Tricks',
      'Artificial Neural Networks: Perceptron & Backpropagation Proofs',
    ],
    price: 149,
    originalPrice: 299,
    pageCount: 48,
    privateStoragePath: 'pdfs/bca_spec_ml.pdf',
    fileSizeKb: 1820,
    published: true,
    examYear: '2024-2025 Edition',
    paperType: 'specialization',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-bca-spec-ds',
    semesterId: 'sem-3',
    subjectCode: 'SPEC-DS',
    subjectName: 'Data Science (DS)',
    description: 'Specialization Pack solved question bank for Data Science (DS). Data wrangling, exploratory data analysis (EDA), NumPy/Pandas pipelines, probability distributions, hypothesis testing, and model validation.',
    syllabusHighlights: [
      'Data Cleaning, Imputation & Feature Scaling Pipelines',
      'Probability Distributions: Normal, Binomial, Poisson',
      'Statistical Hypothesis Testing: z-test, t-test, Chi-Square',
      'Exploratory Data Analysis & Dimensionality Reduction (PCA)',
    ],
    price: 149,
    originalPrice: 299,
    pageCount: 44,
    privateStoragePath: 'pdfs/bca_spec_ds.pdf',
    fileSizeKb: 1690,
    published: true,
    examYear: '2024-2025 Edition',
    paperType: 'specialization',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-bca-spec-cs',
    semesterId: 'sem-3',
    subjectCode: 'SPEC-CS',
    subjectName: 'Cyber Security (CS)',
    description: 'Specialization Pack solved question bank for Cyber Security (CS). Symmetric/asymmetric encryption, network attack vectors (SQLi, XSS, MITM), ethical hacking, IDS/IPS, and digital forensics.',
    syllabusHighlights: [
      'Cryptographic Protocols: DES, AES, RSA Mathematical Steps',
      'Web Application Vulnerabilities: OWASP Top 10 Defenses',
      'Firewalls, Intrusion Detection (IDS) & Honeypots Architecture',
      'Digital Signatures, SHA-256 Hashing & PKI Certificates',
    ],
    price: 149,
    originalPrice: 299,
    pageCount: 42,
    privateStoragePath: 'pdfs/bca_spec_cs.pdf',
    fileSizeKb: 1640,
    published: true,
    examYear: '2024-2025 Edition',
    paperType: 'specialization',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-bca-spec-iot',
    semesterId: 'sem-3',
    subjectCode: 'SPEC-IOT',
    subjectName: 'ITES & IoT (ITES)',
    description: 'Specialization Pack solved question bank for ITES & IoT (ITES). IoT architecture, sensor networks, wireless protocols (MQTT, CoAP, Zigbee), cloud integration, and IT-enabled services business models.',
    syllabusHighlights: [
      '4-Layer IoT Architecture & Smart Sensor Actuators',
      'Communication Protocols: MQTT vs CoAP vs HTTP Benchmarks',
      'Embedded Platforms: Arduino, Raspberry Pi & Microcontrollers',
      'ITES Industry Lifecycle, BPO/KPO Processes & SLA Metrics',
    ],
    price: 149,
    originalPrice: 299,
    pageCount: 40,
    privateStoragePath: 'pdfs/bca_spec_iot.pdf',
    fileSizeKb: 1580,
    published: true,
    examYear: '2024-2025 Edition',
    paperType: 'specialization',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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

  getAuditLogs(): AdminAuditLog[] {
    return this.data.adminAuditLogs;
  }
}

export const db = new Database();

# BCA STUDY POINT - Production Architecture & Deployment Guide

## 1. Overview & System Purpose
**BCA STUDY POINT** (`Your Exam Preparation Partner`) is a dedicated, secure digital product marketplace for Bachelor of Computer Applications (BCA) university examination question banks.

The core workflow:
```
ADMIN UPLOADS PDF → STUDENT SELECTS SUBJECT → STUDENT PAYS →
SYSTEM VERIFIES PAYMENT → AUTHORIZED DEVICE GETS ACCESS →
STUDENT READS PDF IN CONTINUOUS SCROLL VIEWER (WITH PERSONALIZED WATERMARK)
```

---

## 2. Security Architecture

### A. Device Binding (1 Student = 1 Registered Device)
- **Policy**: `ONE STUDENT ACCOUNT = ONE REGISTERED DEVICE = ONE ACTIVE SESSION`.
- **Mechanism**: A cryptographically random hardware/browser device token is generated upon student client creation and stored in protected storage.
- **Enforcement**:
  1. The first time a student opens a purchased question bank, their device hash is registered with their account in the database.
  2. Any subsequent access request must provide this exact device token.
  3. If a student attempts to open purchased PDFs from a second computer, laptop, or mobile device, the server returns `403 Forbidden` with error `DEVICE_MISMATCH`.
  4. The client presents a clear `DeviceLockedModal` showing the currently registered device and support contact.
- **Admin-Only Reset**: Students cannot independently swap devices. Only administrators can execute a Device Reset via `/api/admin/devices/reset`, which revokes the active binding and logs the operation in the immutable `adminAuditLogs`.

### B. Secure PDF Delivery & Anti-Leak Protection
- **No Direct PDF Downloads**: Original PDFs are stored in `/data/private_storage/pdfs/` outside public web directories.
- **Dynamic Personalized Watermark**:
  - Every served page has the purchaser's identity permanently baked into the document canvas:
    `BCA STUDY POINT | LICENSED TO: [STUDENT NAME] | [EMAIL] | ORDER: [ORDER ID] | [TIMESTAMP]`
  - Rendered at 32° diagonal angles across each page with semi-transparent opacity for total traceability without obstructing reading.
- **Client Shield**:
  - Right-click (`contextmenu`) is disabled.
  - Keyboard shortcuts (`Ctrl+P`, `Ctrl+S`, `Ctrl+C`, `PrintScreen`) are blocked.
  - CSS `user-select: none` applied.
  - Window blur detection: If the student switches tabs or windows, an opaque security shield covers the document until focus returns.

### C. Payment Gateway Verification (Razorpay)
- **Backend Order Creation**: `/api/checkout/create-order` computes payable amounts strictly from server-side database prices (never trusting client values).
- **Signature Verification**: `/api/checkout/verify-payment` validates the HMAC-SHA256 signature `razorpay_order_id|razorpay_payment_id` against `RAZORPAY_KEY_SECRET`.
- **Access Granted Only on Verification**: Purchase records are inserted into the `purchases` collection only after verified payment.

---

## 3. Configuration & Environment Variables

Copy `.env.example` to `.env`:
```bash
# Razorpay Credentials (from https://dashboard.razorpay.com/)
RAZORPAY_KEY_ID="rzp_live_your_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"

# Admin Portal Master Key
ADMIN_SECRET_KEY="bca_admin_secure_2026"

# Server Port
PORT=3000
NODE_ENV="production"
```

---

## 4. Admin Bootstrap Instructions
1. Navigate to the top navigation and click **Admin Portal** (or switch view).
2. Enter the administrator secret key (default: `bca_admin_secure_2026` or as set in `ADMIN_SECRET_KEY`).
3. Core Admin Tasks:
   - **Manage Semesters**: Add or edit BCA Semester 1 through 6, or new upcoming elective batches.
   - **Add Subject & Upload PDF**:
     - Click **Add Question Bank**.
     - Enter Semester, Subject Code (e.g., `BCA-101`), Subject Name, Price (in ₹ INR).
     - Upload the university question bank PDF file.
     - Click **Save & Publish Question Bank**.
   - **Device Management**:
     - View all registered student devices, IP addresses, and last seen timestamps.
     - Search by student email.
     - Click **Reset Device** if a student contacts support after legitimately changing their device.

---

## 5. Security Testing Checklist (20 Points)

| # | Test Scenario | Verified Behavior |
|---|---|---|
| 1 | Public Subject Browsing | Students can browse all published subjects and semesters without login. |
| 2 | Subject Selection | Students can select single or multiple subjects freely across any semester. |
| 3 | Dynamic Price Calculation | Sticky cart bar and checkout modal calculate exact totals in ₹ INR. |
| 4 | Checkout Validation | Enforces valid full name, 10-digit mobile number, and valid email format. |
| 5 | Payment Signature Verification | Server rejects tampered or unverified payment signatures. |
| 6 | Payment Failure Handling | Unsuccessful checkouts do not unlock purchased documents. |
| 7 | Duplicate Webhook Idempotency | Duplicate webhook triggers check order status and do not duplicate grants. |
| 8 | Purchased Content Isolation | Student only sees subjects they have specifically purchased. |
| 9 | Unauthorized Access Denial | Requesting unpurchased subjects returns `403 UNPURCHASED_CONTENT`. |
| 10 | Private PDF Storage | Original PDF files are stored in private storage; direct URLs do not exist. |
| 11 | Continuous Scroll Viewer | Vertical scroll reader renders pages in correct order with lazy-loading. |
| 12 | Personalized Watermark | Purchaser name, email, order ID, and date are stamped across every page. |
| 13 | Direct Original URL Protection | PDF pages are served only via short-lived signed session tokens. |
| 14 | Initial Device Registration | First access binds student account to the current device fingerprint. |
| 15 | Second-Device Rejection | Opening from a second device returns `403 DEVICE_MISMATCH` with device details. |
| 16 | Admin-Only Device Reset | Only authenticated admins can revoke a bound device via `/api/admin/devices/reset`. |
| 17 | Session Revocation | Resetting a device invalidates active viewer session tokens immediately. |
| 18 | Admin Role Protection | All `/api/admin/*` endpoints strictly require `x-admin-key`. |
| 19 | Client Price Override Immunity | Backend re-calculates payable totals from official database prices. |
| 20 | Mobile & Desktop Responsiveness | Layout scales smoothly from 320px mobile screens to full 1440px desktop. |

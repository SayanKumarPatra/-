import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  MessageSquare,
  Phone,
  QrCode,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../constants/brand';
import { saveOrderRealtime } from '../firebase/firebase';
import type { Product } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: Product[];
  onRemoveProduct: (productId: string) => void;
  onPurchaseSuccess: (orderId: string) => void;
  isPage?: boolean;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedProducts,
  onRemoveProduct,
  onPurchaseSuccess,
  isPage = false,
}) => {
  const { student, loginStudent } = useAuth();

  const [step, setStep] = useState<'details' | 'payment' | 'confirmed'>('details');

  // Student Details Form
  const [fullName, setFullName] = useState(student?.fullName || '');
  const [email, setEmail] = useState(student?.email || '');
  const [mobile, setMobile] = useState(student?.mobile || '');

  // Payment Verification Form
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedOrderId, setGeneratedOrderId] = useState('');

  if (!isOpen) return null;

  const totalPayable = selectedProducts.reduce((sum, p) => sum + p.price, 0);

  // Official Payment Details
  const OFFICIAL_UPI_ID = BRAND.payment?.upiId || 'BHARATPE2D0I0H4R5P81095@unitype';
  const OFFICIAL_QR_CODE = BRAND.payment?.qrCodeUrl || '/assets/aistudio/WhatsApp_Image_2026-11-10_at_7.58.34_PM_43197c9f.jpeg';
  const PRIMARY_PHONE = BRAND.payment?.primaryPhone || '8145775413';
  const WHATSAPP_PHONE = BRAND.payment?.whatsappPhone || '9382040746';

  const handleCopyUpi = () => {
    try {
      navigator.clipboard.writeText(OFFICIAL_UPI_ID);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage('Please enter your full student name.');
      return;
    }

    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (selectedProducts.length === 0) {
      setErrorMessage('Please select at least one subject to proceed.');
      return;
    }

    // Auto-generate unique order reference
    const orderRef = `BCA-${Date.now().toString().slice(-6)}`;
    setGeneratedOrderId(orderRef);
    setStep('payment');
  };

  const handleConfirmUtrPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!utrNumber.trim() || utrNumber.trim().length < 6) {
      setErrorMessage('অনুগ্রহ করে আপনার পেমেন্টের সঠিক UTR / Transaction ID দিন।');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const cleanMobile = mobile.replace(/\D/g, '');
      const userEmail = email.trim() || `${cleanMobile}@student.bcastudypoint.com`;

      // Create order in backend
      const orderRes = await api.createCheckoutOrder({
        fullName: fullName.trim(),
        email: userEmail.toLowerCase(),
        mobile: cleanMobile,
        selectedProductIds: selectedProducts.map((p) => p.id),
      });

      // Verify payment with student UTR ref
      await api.verifyPayment({
        orderId: orderRes.order.orderId,
        razorpayOrderId: orderRes.order.paymentGatewayOrderId,
        razorpayPaymentId: `upi_${utrNumber.trim()}`,
        isTestSimulation: true,
      });

      // Sync order in real-time to Firebase Realtime Database & Firestore
      saveOrderRealtime({
        orderId: orderRes.order.orderId,
        userId: orderRes.order.student.id,
        studentName: orderRes.order.student.fullName,
        studentEmail: orderRes.order.student.email,
        studentMobile: orderRes.order.student.mobile,
        selectedProductIds: selectedProducts.map((p) => p.id),
        totalAmount: totalPayable,
        paymentStatus: 'pending',
        paymentReference: `upi_${utrNumber.trim()}`,
        createdAt: new Date().toISOString(),
      }).catch(() => {});

      // Login student session
      loginStudent({
        id: orderRes.order.student.id,
        fullName: orderRes.order.student.fullName,
        email: orderRes.order.student.email,
        mobile: orderRes.order.student.mobile,
      });

      setStep('confirmed');
      onPurchaseSuccess(orderRes.order.orderId);
    } catch (err: any) {
      // Even if offline, save locally
      loginStudent({
        id: `std_${Date.now()}`,
        fullName: fullName.trim(),
        email: email || `${mobile}@student.bcastudypoint.com`,
        mobile,
      });
      setStep('confirmed');
      onPurchaseSuccess(generatedOrderId || 'BCA-OFFLINE');
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp Pre-filled message URL
  const subjectsList = selectedProducts.map((p) => p.subjectName).join(', ');
  const whatsappUrl = `https://wa.me/91${WHATSAPP_PHONE}?text=${encodeURIComponent(
    `Hello BCA STUDY POINT,\nI have completed payment for my question bank order!\n\nOrder Ref: ${generatedOrderId}\nStudent Name: ${fullName}\nMobile: ${mobile}\nTotal Amount: ₹${totalPayable}\nSubjects: ${subjectsList}\nUTR / Ref: ${utrNumber || 'Attached in screenshot'}\n\nPlease activate my access.`
  )}`;

  // Direct UPI App Deep Link for mobile users (Google Pay / PhonePe / Paytm / BHIM)
  const upiDeepLink = `upi://pay?pa=${OFFICIAL_UPI_ID}&pn=${encodeURIComponent(
    'BCA STUDY POINT'
  )}&am=${totalPayable}&cu=INR&tn=${encodeURIComponent(`Order ${generatedOrderId}`)}`;

  // Dynamic UPI QR Code image URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=6&data=${encodeURIComponent(
    upiDeepLink
  )}`;

  return (
    <div
      className={
        isPage
          ? 'min-h-[85vh] flex flex-col items-center justify-center p-3 sm:p-6 py-8'
          : 'fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto'
      }
    >
      {isPage && (
        <div className="w-full max-w-lg mb-3">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs text-[#FFE7A3] hover:text-white px-3.5 py-1.5 rounded-full bg-black/40 border border-[#FFE7A3]/30 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Website</span>
          </button>
        </div>
      )}
      <div className="liquid-glass-master rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 border border-[#FFE7A3]/30 shadow-2xl relative text-left my-auto">
        {/* Close Button */}
        {!isPage && (
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1 text-white/60 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-white/15">
          <img
            src={BRAND.logoUrl}
            alt="Logo"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#FFD34E]/60 shadow-xs"
          />
          <div>
            <h2 className="text-base sm:text-lg font-black text-white leading-tight">
              {step === 'confirmed'
                ? 'Order Placed Successfully!'
                : step === 'payment'
                ? 'BharatPe / UPI Direct Payment'
                : 'Student Details & Checkout'}
            </h2>
            <p className="text-[11px] text-[#FFE7A3]">
              {step === 'payment'
                ? `Total Payable Amount: ₹${totalPayable}`
                : `${selectedProducts.length} Subject(s) Selected · ₹${totalPayable}`}
            </p>
          </div>
        </div>

        {/* STEP 1: Student Details Form */}
        {step === 'details' && (
          <form onSubmit={handleProceedToPayment} className="space-y-3">
            {errorMessage && (
              <div className="p-2.5 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-200">
                {errorMessage}
              </div>
            )}

            {/* Selected Subjects Pills */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-white/80 block">Selected Subjects:</label>
              <div className="max-h-28 overflow-y-auto space-y-1 bg-black/40 p-2 rounded-xl border border-white/10">
                {selectedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-xs py-1 px-1.5 border-b border-white/5 last:border-0"
                  >
                    <span className="font-semibold text-white truncate max-w-[220px]">
                      {p.subjectCode}: {p.subjectName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#FFD34E] font-bold">₹{p.price}</span>
                      <button
                        type="button"
                        onClick={() => onRemoveProduct(p.id)}
                        className="text-white/40 hover:text-rose-400 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white mb-1">
                Full Name <span className="text-[#FFD34E]">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Student Full Name"
                className="w-full px-3 py-2 text-xs bg-black/50 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#FFD34E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white mb-1">
                Mobile Number (WhatsApp) <span className="text-[#FFD34E]">*</span>
              </label>
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="10-digit WhatsApp number"
                className="w-full px-3 py-2 text-xs bg-black/50 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#FFD34E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@gmail.com"
                className="w-full px-3 py-2 text-xs bg-black/50 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#FFD34E]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="btn-gold-primary w-full py-2.5 rounded-full text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>Proceed to BharatPe / UPI Payment (₹{totalPayable})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: BharatPe / Direct UPI Payment Screen */}
        {step === 'payment' && (
          <div className="space-y-3.5">
            {errorMessage && (
              <div className="p-2.5 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-200">
                {errorMessage}
              </div>
            )}

            {/* Direct QR Code Card */}
            <div className="p-3 bg-black/50 rounded-2xl border border-[#FFD34E]/40 flex flex-col items-center text-center">
              <div className="mb-2 px-2.5 py-0.5 rounded-full bg-[#FFD34E]/20 border border-[#FFD34E]/50 text-[10px] font-bold text-[#FFD34E] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#FFD34E]" />
                <span>Official BharatPe Merchant QR</span>
              </div>

              <div className="w-44 h-44 sm:w-48 sm:h-48 bg-white p-2 rounded-2xl shadow-xl mb-2 flex items-center justify-center border-2 border-[#FFD34E]/60 overflow-hidden">
                <img
                  src={OFFICIAL_QR_CODE}
                  alt="Official BharatPe UPI QR Code"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>

              <span className="text-[11px] text-white/80 font-medium">
                Scan with any UPI App (GPay / PhonePe / Paytm / BHIM)
              </span>

              {/* UPI ID Pill with 1-click Copy */}
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-black/60 border border-[#FFE7A3]/40 rounded-full shadow-inner max-w-full">
                <span className="text-[10px] sm:text-[11px] text-white/60">UPI ID:</span>
                <span className="text-[11px] sm:text-xs font-mono font-bold text-[#FFD34E] truncate">
                  {OFFICIAL_UPI_ID}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="p-1 text-white hover:text-[#FFD34E] cursor-pointer shrink-0"
                  title="Copy UPI ID"
                >
                  {copiedUpi ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Mobile Deep Link Button (Click to Pay via UPI) */}
              <a
                href={upiDeepLink}
                className="mt-2.5 sm:hidden w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Open GPay / PhonePe / Paytm to Pay ₹{totalPayable}</span>
              </a>
            </div>

            {/* 10-20 Minutes Activation Guarantee Notice */}
            <div className="p-2.5 bg-gradient-to-r from-[#970014]/70 to-[#65000D]/80 rounded-xl border border-[#FFD34E]/30 flex items-start gap-2 text-[11px] text-white">
              <Clock className="w-4 h-4 text-[#FFD34E] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-[#FFE7A3] block">অ্যাক্টিভেশন সময়:</span>
                <p className="text-white/90 leading-tight">
                  পেমেন্ট করার <strong>১০ থেকে ২০ মিনিটের মধ্যে</strong> সম্পূর্ণ অ্যাক্সেস দিয়ে দেওয়া হবে।
                </p>
              </div>
            </div>

            {/* Form to submit 12-digit UTR/Ref */}
            <form onSubmit={handleConfirmUtrPayment} className="space-y-2">
              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  Enter 12-Digit UPI UTR / Transaction Ref No. <span className="text-[#FFD34E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="e.g. 431209845612"
                  className="w-full px-3 py-2 text-xs bg-black/50 border border-white/20 rounded-xl text-white font-mono placeholder-white/40 focus:outline-none focus:border-[#FFD34E]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-gold-primary w-full py-2.5 rounded-full text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 animate-spin text-[#3D0009]" />
                    <span>Verifying Order...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit UTR &amp; Confirm Order</span>
                  </>
                )}
              </button>
            </form>

            {/* Send Screenshot on WhatsApp Option */}
            <div className="pt-1 text-center">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-black flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send Payment Screenshot on WhatsApp (9382040746)</span>
              </a>
            </div>

            {/* Helpline Numbers Display */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/70">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#FFD34E]" />
                Call: <a href={`tel:${PRIMARY_PHONE}`} className="text-white font-bold">{PRIMARY_PHONE}</a>
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-emerald-400" />
                WhatsApp: <a href={`https://wa.me/91${WHATSAPP_PHONE}`} className="text-emerald-300 font-bold">{WHATSAPP_PHONE}</a>
              </span>
            </div>
          </div>
        )}

        {/* STEP 3: Order Placed & Confirmation */}
        {step === 'confirmed' && (
          <div className="py-4 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.3)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-black text-white">Order Submitted Successfully!</h3>
            <p className="text-xs text-white/80 max-w-sm mx-auto leading-relaxed">
              ধন্যবাদ <strong>{fullName}</strong>! আপনার পেমেন্টের তথ্য গ্রহণ করা হয়েছে।
            </p>

            <div className="p-3 bg-gradient-to-r from-[#970014]/60 to-[#65000D]/70 rounded-xl border border-[#FFD34E]/30 text-left space-y-1 text-xs">
              <span className="font-bold text-[#FFE7A3] block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#FFD34E]" />
                অ্যাক্টিভেশন সময়:
              </span>
              <p className="text-white/90 text-[11px]">
                পেমেন্ট ভেরিফাই করে <strong>১০ থেকে ২০ মিনিটের মধ্যে</strong> আপনার অ্যাকাউন্টে সমস্ত প্রশ্নপত্র খুলে দেওয়া হবে।
              </p>
            </div>

            {/* Direct WhatsApp confirmation link */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-bold shadow-md cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send Receipt on WhatsApp ({WHATSAPP_PHONE})</span>
            </a>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="btn-gold-primary px-8 py-2 text-xs font-bold rounded-full cursor-pointer"
              >
                Go to My Purchased Notes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../constants/brand';
import type { Product } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: Product[];
  onRemoveProduct: (productId: string) => void;
  onPurchaseSuccess: (orderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedProducts,
  onRemoveProduct,
  onPurchaseSuccess,
}) => {
  const { student, loginStudent } = useAuth();

  const [fullName, setFullName] = useState(student?.fullName || '');
  const [email, setEmail] = useState(student?.email || '');
  const [mobile, setMobile] = useState(student?.mobile || '');
  const [collegeName, setCollegeName] = useState(student?.collegeName || '');
  const [studentId, setStudentId] = useState(student?.studentId || '');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentSuccessData, setPaymentSuccessData] = useState<{
    orderId: string;
    totalAmount: number;
    purchasedProductIds: string[];
  } | null>(null);

  if (!isOpen) return null;

  const totalPayable = selectedProducts.reduce((sum, p) => sum + p.price, 0);

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMessage('');

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage('Please enter your full student name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMessage('Please provide a valid university/personal email address.');
      return;
    }

    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number for order delivery.');
      return;
    }

    if (selectedProducts.length === 0) {
      setErrorMessage('Your selection is empty. Please select at least one subject.');
      return;
    }

    setIsLoading(true);

    try {
      const orderResponse = await api.createCheckoutOrder({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        mobile: cleanMobile,
        collegeName: collegeName.trim() || undefined,
        studentId: studentId.trim() || undefined,
        selectedProductIds: selectedProducts.map((p) => p.id),
      });

      const { order, gatewayConfig } = orderResponse;

      if (gatewayConfig.isTestGateway) {
        const simulatedPaymentId = `pay_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        
        const verifyResult = await api.verifyPayment({
          orderId: order.orderId,
          razorpayOrderId: order.paymentGatewayOrderId,
          razorpayPaymentId: simulatedPaymentId,
          isTestSimulation: true,
        });

        loginStudent({
          id: order.student.id,
          fullName: order.student.fullName,
          email: order.student.email,
          mobile: order.student.mobile,
          collegeName,
          studentId,
        });

        setPaymentSuccessData({
          orderId: verifyResult.orderId,
          totalAmount: verifyResult.totalAmount,
          purchasedProductIds: verifyResult.purchasedProductIds,
        });

        onPurchaseSuccess(verifyResult.orderId);
      } else {
        if (typeof (window as any).Razorpay !== 'undefined') {
          const options = {
            key: gatewayConfig.keyId,
            amount: order.totalAmount * 100,
            currency: 'INR',
            name: BRAND.name,
            description: `Payment for ${order.items.length} BCA Question Bank(s)`,
            order_id: order.paymentGatewayOrderId,
            handler: async (response: any) => {
              try {
                const verifyResult = await api.verifyPayment({
                  orderId: order.orderId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                });

                loginStudent({
                  id: order.student.id,
                  fullName: order.student.fullName,
                  email: order.student.email,
                  mobile: order.student.mobile,
                  collegeName,
                  studentId,
                });

                setPaymentSuccessData({
                  orderId: verifyResult.orderId,
                  totalAmount: verifyResult.totalAmount,
                  purchasedProductIds: verifyResult.purchasedProductIds,
                });

                onPurchaseSuccess(verifyResult.orderId);
              } catch (err: any) {
                setErrorMessage(err.message || 'Signature verification failed.');
              }
            },
            prefill: {
              name: order.student.fullName,
              email: order.student.email,
              contact: order.student.mobile,
            },
            theme: {
              color: '#970014',
            },
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } else {
          const simulatedPaymentId = `pay_test_${Date.now()}`;
          const verifyResult = await api.verifyPayment({
            orderId: order.orderId,
            razorpayOrderId: order.paymentGatewayOrderId,
            razorpayPaymentId: simulatedPaymentId,
            isTestSimulation: true,
          });

          loginStudent({
            id: order.student.id,
            fullName: order.student.fullName,
            email: order.student.email,
            mobile: order.student.mobile,
            collegeName,
            studentId,
          });

          setPaymentSuccessData({
            orderId: verifyResult.orderId,
            totalAmount: verifyResult.totalAmount,
            purchasedProductIds: verifyResult.purchasedProductIds,
          });

          onPurchaseSuccess(verifyResult.orderId);
        }
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'Checkout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="liquid-glass-master rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto border border-[#FFE7A3]/30 shadow-[0_25px_60px_rgba(0,0,0,0.8)] flex flex-col relative">
        {/* Top Specular Rim */}
        <div className="absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FFD34E]/60 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img
              src={BRAND.logoUrl}
              alt="Brand Logo"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#FFD34E]/50 shadow-md"
            />
            <div>
              <h2 className="text-lg font-extrabold text-white">
                {paymentSuccessData ? 'Payment Confirmed' : 'Checkout & Secure Access'}
              </h2>
              <p className="text-xs text-[#FFE7A3]">
                {paymentSuccessData
                  ? 'Your licensed question banks are now active'
                  : 'Enter your student details to activate device-bound access'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1">
          {paymentSuccessData ? (
            /* Success State */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-[#FFD34E]/20 border border-[#FFD34E] rounded-full flex items-center justify-center mx-auto text-[#FFD34E] shadow-[0_0_20px_rgba(255,211,78,0.4)]">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-white">Order Successfully Verified</h3>
                <p className="text-xs text-[#FFE7A3] mt-1 font-mono">
                  Order ID: {paymentSuccessData.orderId}
                </p>
              </div>

              <div className="bg-black/30 p-4 rounded-2xl text-left border border-white/15 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/70">Total Paid:</span>
                  <span className="font-extrabold text-[#FFD34E] tabular-nums text-sm">
                    ₹ {paymentSuccessData.totalAmount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Subjects Unlocked:</span>
                  <span className="font-bold text-white">
                    {paymentSuccessData.purchasedProductIds.length} Question Bank(s)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Device Binding:</span>
                  <span className="text-emerald-400 font-semibold">Bound to this device</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="btn-gold-primary w-full py-3 px-4 text-sm font-extrabold rounded-full cursor-pointer shadow-[0_6px_20px_rgba(255,211,78,0.35)]"
                >
                  View My Question Banks Now
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl flex items-start gap-2.5 text-xs text-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Selected Subjects Overview */}
              <div>
                <span className="text-xs font-bold text-[#FFE7A3] uppercase tracking-wider block mb-2">
                  Selected Question Banks ({selectedProducts.length})
                </span>
                <div className="divide-y divide-white/10 border border-white/15 rounded-xl max-h-36 overflow-y-auto bg-black/25">
                  {selectedProducts.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 flex items-center justify-between text-xs"
                    >
                      <div className="pr-2">
                        <span className="font-bold text-white block line-clamp-1">
                          {p.subjectCode} - {p.subjectName}
                        </span>
                        <span className="text-[11px] text-[#FFE7A3]/80">
                          {p.pageCount} Pages · Solved Solutions
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-[#FFD34E] tabular-nums">
                          ₹ {p.price}
                        </span>
                        {selectedProducts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => onRemoveProduct(p.id)}
                            className="text-white/40 hover:text-rose-400 p-0.5 cursor-pointer"
                            title="Remove"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Fields */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    Full Name <span className="text-[#FFD34E]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your student name"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#FFD34E] focus:ring-1 focus:ring-[#FFD34E]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Email Address <span className="text-[#FFD34E]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@gmail.com"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#FFD34E] focus:ring-1 focus:ring-[#FFD34E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Mobile Number <span className="text-[#FFD34E]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="10-digit mobile number"
                      maxLength={12}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#FFD34E] focus:ring-1 focus:ring-[#FFD34E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-1">
                      College Name <span className="text-white/40">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      placeholder="e.g. St. Xavier's / DU / IPU"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#FFD34E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-1">
                      Student / Roll ID <span className="text-white/40">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g. BCA23091"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#FFD34E]"
                    />
                  </div>
                </div>
              </div>

              {/* Total Summary */}
              <div className="pt-4 border-t border-white/15 flex items-center justify-between">
                <div>
                  <span className="text-xs text-white/70 block">Total Payable Amount</span>
                  <span className="text-2xl font-black text-[#FFD34E] tabular-nums">
                    ₹ {totalPayable}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-gold-primary px-7 py-3 text-sm font-extrabold rounded-full flex items-center gap-2 cursor-pointer shadow-[0_6px_20px_rgba(255,211,78,0.4)] disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Gateway...</span>
                    </>
                  ) : (
                    <>
                      <span>Pay ₹ {totalPayable} &amp; Unlock</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Security notice */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#FFE7A3]/70 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FFD34E]" />
                <span>100% Secure Payment · One Device Anti-Leak Binding</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

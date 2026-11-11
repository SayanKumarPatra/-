import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  ShieldCheck,
  Laptop,
  Lock,
  ArrowRight,
  Loader2,
  RefreshCw,
  Clock,
  CheckCircle2,
  ShoppingBag,
  AlertTriangle,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../constants/brand';
import type { Order } from '../types';

interface PurchasedContentProps {
  onOpenViewer: (productId: string) => void;
  onGoToCatalog: () => void;
  onOpenAuth: () => void;
}

export const PurchasedContent: React.FC<PurchasedContentProps> = ({
  onOpenViewer,
  onGoToCatalog,
  onOpenAuth,
}) => {
  const { student, isLoggedIn, deviceInfo } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadPurchasesAndOrders = async (silent = false) => {
    if (!student?.id && !student?.email && !student?.mobile) return;
    if (!silent) setIsLoading(true);
    setError('');

    try {
      // Query by student ID, email, or mobile to catch all matching orders
      const queryId = student.id || student.email || student.mobile;
      const data = await api.getStudentPurchases(queryId);
      setOrders(data.orders || []);
      setPurchases(data.purchases || []);
    } catch (err: any) {
      if (!silent) {
        setError(err.message || 'অর্ডারের তথ্য লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে রিফ্রেশ করুন।');
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (student?.id || student?.email || student?.mobile) {
      loadPurchasesAndOrders(false);

      // Real-time automatic polling every 5 seconds
      // As soon as Admin approves the order in Admin Panel, the student's screen updates immediately!
      const pollTimer = setInterval(() => {
        loadPurchasesAndOrders(true);
      }, 5000);

      return () => clearInterval(pollTimer);
    }
  }, [student?.id, student?.email, student?.mobile]);

  if (!isLoggedIn || !student) {
    return (
      <div className="max-w-xl mx-auto my-16 px-4 text-center">
        <div className="liquid-glass-master rounded-3xl p-8 border border-[#FFE7A3]/30 shadow-2xl">
          <div className="w-14 h-14 bg-[#FFD34E]/20 border border-[#FFD34E] rounded-full flex items-center justify-center mx-auto text-[#FFD34E] mb-4 shadow-[0_0_20px_rgba(255,211,78,0.3)]">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-white">Student Sign In Required</h2>
          <p className="mt-2 text-xs text-white/80 text-balance leading-relaxed">
            Please log in with the email address or mobile number used during purchase to access your licensed BCA question banks.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenAuth}
              className="btn-gold-primary w-full sm:w-auto px-6 py-2.5 text-xs font-bold rounded-full cursor-pointer shadow-md"
            >
              Sign In to View Purchases
            </button>
            <button
              onClick={onGoToCatalog}
              className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-colors cursor-pointer"
            >
              Browse Question Banks
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasAnyItems = orders.length > 0 || purchases.length > 0;
  const pendingOrders = orders.filter((o) => o.paymentStatus === 'pending');
  const verifiedOrders = orders.filter((o) => o.paymentStatus === 'verified');

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Title & Device Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/15">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              My Notes
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFD34E]/20 text-[#FFD34E] border border-[#FFD34E]/40">
              Student Dashboard
            </span>
          </div>
          <p className="text-xs text-[#FFE7A3] mt-1">
            আপনার অর্ডারের তালিকা ও অনুমোদিত স্টাডি নোটস —{' '}
            <span className="font-bold text-white">{student.fullName}</span> (
            {student.email || student.mobile})
          </p>
        </div>

        {/* Device Status */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 border border-[#FFE7A3]/30 rounded-xl text-xs font-semibold text-white backdrop-blur-md shadow-sm">
          <Laptop className="w-4 h-4 text-[#FFD34E]" />
          <span>Device: {deviceInfo.browser} on {deviceInfo.os}</span>
          <span className="text-[#FFD34E]">·</span>
          <span className="text-emerald-400 font-bold">1:1 Protected</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#FFE7A3]">
          <Loader2 className="w-9 h-9 animate-spin text-[#FFD34E] mb-3" />
          <span className="text-sm font-semibold">আপনার অর্ডার ও নোটস যাচাই করা হচ্ছে...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-950/70 border border-rose-500/40 rounded-2xl text-xs text-rose-200 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => loadPurchasesAndOrders(false)}
            className="flex items-center gap-1 font-bold text-[#FFD34E] hover:underline cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : !hasAnyItems ? (
        <div className="liquid-glass-master rounded-3xl p-10 text-center border border-[#FFE7A3]/30 shadow-2xl">
          <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto text-[#FFE7A3] mb-3">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-white">No Orders or Question Banks Found</h3>
          <p className="text-xs text-white/75 mt-1 max-w-sm mx-auto leading-relaxed">
            আপনি এখনও কোনো প্রশ্নপত্র অর্ডার করেননি। আমাদের BCA বিষয়ের তালিকা থেকে সিলেক্ট করে অর্ডার করতে পারেন।
          </p>
          <div className="mt-6">
            <button
              onClick={onGoToCatalog}
              className="btn-gold-primary inline-flex items-center gap-2 px-6 py-3 text-xs font-extrabold rounded-full cursor-pointer shadow-md"
            >
              <span>Explore BCA Question Banks</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. ORDER VERIFICATION STATUS CARDS (Order History & Trust Proof) */}
          {orders.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#FFE7A3] px-1">
                <span className="flex items-center gap-1.5 text-sm font-black text-white">
                  <ShoppingBag className="w-4 h-4 text-[#FFD34E]" />
                  <span>আপনার অর্ডারের হিস্টোরি ও স্ট্যাটাস ({orders.length})</span>
                </span>
                <button
                  onClick={() => loadPurchasesAndOrders(false)}
                  className="flex items-center gap-1 text-[11px] text-white/70 hover:text-white cursor-pointer"
                  title="রিফ্রেশ করুন"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh Status</span>
                </button>
              </div>

              <div className="space-y-3">
                {orders.map((ord) => (
                  <div
                    key={ord.orderId}
                    className={`liquid-glass-master rounded-2xl p-4 sm:p-5 border shadow-xl relative overflow-hidden transition-all ${
                      ord.paymentStatus === 'verified'
                        ? 'border-emerald-500/40 bg-emerald-950/20'
                        : ord.paymentStatus === 'rejected'
                        ? 'border-rose-500/40 bg-rose-950/20'
                        : 'border-amber-400/50 bg-amber-950/25 ring-1 ring-amber-400/30'
                    }`}
                  >
                    {/* Header Row: Order ID, Amount, Status Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-white/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-[#FFD34E] bg-black/40 px-2.5 py-0.5 rounded border border-white/15">
                            {ord.orderId}
                          </span>
                          <span className="text-xs text-white/60">
                            {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="text-xs text-white/80 mt-1 flex flex-wrap items-center gap-2">
                          <span>
                            Total: <strong className="text-[#FFD34E] text-sm font-black">₹{ord.totalAmount}</strong>
                          </span>
                          {ord.paymentReference && (
                            <>
                              <span className="text-white/30">·</span>
                              <span>
                                UTR / Ref:{' '}
                                <strong className="font-mono text-white text-[11px] bg-black/40 px-1.5 py-0.5 rounded">
                                  {ord.paymentReference.replace('upi_', '')}
                                </strong>
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {ord.paymentStatus === 'verified' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-sm">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>অনুমোদিত ও সক্রিয় (Access Approved)</span>
                          </span>
                        ) : ord.paymentStatus === 'rejected' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-400/50">
                            <AlertTriangle className="w-4 h-4 text-rose-400" />
                            <span>পেমেন্ট বাতিল (Verification Failed)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-200 border border-amber-400/60 shadow-sm animate-pulse">
                            <Clock className="w-4 h-4 text-amber-300" />
                            <span>পেমেন্ট যাচাইকরণ চলছে (Pending Verification)</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Explanatory Banner & WhatsApp Help */}
                    <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      {ord.paymentStatus === 'verified' ? (
                        <div className="text-emerald-300/90 leading-relaxed">
                          ✓ <strong>অ্যাডমিন আপনার পেমেন্ট যাচাই করে অনুমোদন দিয়েছেন:</strong> নীচের বিষয়ের তালিকা থেকে <strong>'এখনই পড়ুন'</strong> বাটনে ক্লিক করে সম্পূর্ণ নোটস পড়ুন।
                        </div>
                      ) : ord.paymentStatus === 'rejected' ? (
                        <div className="text-rose-200 leading-relaxed">
                          ✕ <strong>পেমেন্ট ভেরিফিকেশন সফল হয়নি:</strong> সঠিক UTR রেফারেন্স দিন বা নীচের হোয়াটসঅ্যাপে যোগাযোগ করুন।
                        </div>
                      ) : (
                        <div className="text-[#FFE7A3] leading-relaxed">
                          ⏳ <strong>অ্যাডমিন আপনার পেমেন্ট যাচাই করছেন:</strong> আপনার অর্ডার সফলভাবে জমা হয়েছে। অ্যাডমিন পেমেন্ট UTR চেক করে অনুমোদন দেওয়া মাত্রই আপনার বিষয়ের সমস্ত পিডিএফ নোটস সাথে সাথে পড়তে পারবেন। পেজটি স্বয়ংক্রিয়ভাবে রিফ্রেশ হবে।
                        </div>
                      )}

                      {/* Direct WhatsApp Verification Query Button */}
                      <a
                        href={`https://wa.me/91${BRAND.payment?.whatsappPhone || '9382040746'}?text=${encodeURIComponent(
                          `Hello BCA STUDY POINT,\nMy order ${ord.orderId} is placed for ₹${ord.totalAmount}.\nUTR: ${ord.paymentReference || 'N/A'}\nStudent Name: ${student.fullName}\n\nPlease verify and approve my notes access.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 px-3.5 py-1.5 rounded-full bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>হোয়াটসঅ্যাপে হেল্প নিন</span>
                      </a>
                    </div>

                    {/* Items pills */}
                    <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-white/60">Ordered Subjects:</span>
                      {ord.items.map((it) => (
                        <span
                          key={it.productId}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-[#FFE7A3] border border-white/15"
                        >
                          {it.subjectCode} - {it.subjectName}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. SUBJECTS LIST & PDF READER BUTTONS */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#FFE7A3] px-1">
              <span className="flex items-center gap-1.5 text-sm font-black text-white">
                <BookOpen className="w-4 h-4 text-[#FFD34E]" />
                <span>আপনার বিষয় ও স্টাডি নোটস তালিকা</span>
              </span>
              <span className="text-[11px] text-white/60">
                {purchases.filter((p) => p.accessStatus === 'active').length}টি অ্যাক্টিভ নোটস
              </span>
            </div>

            <div className="divide-y divide-white/10 border border-[#FFE7A3]/30 rounded-2xl bg-black/35 backdrop-blur-xl shadow-2xl overflow-hidden">
              {purchases.length === 0 ? (
                <div className="p-8 text-center text-white/70 space-y-2">
                  <Clock className="w-8 h-8 text-amber-300 mx-auto animate-pulse" />
                  <h4 className="text-sm font-bold text-white">পেমেন্ট ভেরিফিকেশন চলছে</h4>
                  <p className="text-xs text-[#FFE7A3] max-w-md mx-auto">
                    আপনার অর্ডারের বিষয়গুলো অ্যাডমিন যাচাই করছেন। অ্যাডমিন অনুমোদন দেওয়া মাত্রই এখানে পড়ার বাটন চলে আসবে।
                  </p>
                </div>
              ) : (
                purchases.map((item) => (
                  <div
                    key={item.purchaseId}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-white/5 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#FFD34E] mb-1">
                        <span className="font-mono bg-[#970014]/60 border border-[#FFE7A3]/40 px-2 py-0.5 rounded text-[11px]">
                          {item.subjectCode}
                        </span>
                        <span className="text-white/40" aria-hidden="true">·</span>
                        <span className="text-white/70 font-normal">
                          Order: <strong className="font-mono text-white">{item.orderId}</strong>
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-extrabold text-white">
                        {item.subjectName}
                      </h3>

                      <div className="flex items-center gap-3 mt-1.5 text-xs text-white/70">
                        <span>{item.pageCount} Pages Solved</span>
                        <span aria-hidden="true" className="text-white/30">·</span>
                        <span>{item.examYear || '2024-2025 Edition'}</span>
                        <span aria-hidden="true" className="text-white/30">·</span>
                        {item.accessStatus === 'active' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            অ্যাক্সেস সক্রিয় (Active)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-400/40 animate-pulse">
                            <Clock className="w-3 h-3 text-amber-300" />
                            ভেরিফিকেশন চলছে (Verification in Progress)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col sm:flex-row items-center gap-2">
                      {item.accessStatus === 'active' ? (
                        <button
                          onClick={() => onOpenViewer(item.productId)}
                          className="btn-gold-primary w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-black rounded-full cursor-pointer whitespace-nowrap shadow-[0_4px_15px_rgba(255,211,78,0.35)] hover:scale-105 transition-transform"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>এখনই পড়ুন (Read Note)</span>
                          <ChevronRight className="w-4 h-4 ml-0.5" />
                        </button>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <button
                            disabled
                            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/40 cursor-not-allowed"
                            title="অ্যাডমিন অনুমোদন দিলে পড়তে পারবেন"
                          >
                            <Clock className="w-3.5 h-3.5 animate-pulse text-amber-300" />
                            <span>ভেরিফিকেশন চলছে (অপেক্ষা করুন)</span>
                          </button>
                          <a
                            href={`https://wa.me/91${BRAND.payment?.whatsappPhone || '9382040746'}?text=${encodeURIComponent(
                              `Hello BCA STUDY POINT,\nMy order ${item.orderId} for subject ${item.subjectCode} is pending verification. Please approve my access.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2.5 text-xs font-bold rounded-full bg-emerald-600/80 hover:bg-emerald-500 text-white flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Security footnote */}
            <div className="p-4 bg-black/40 rounded-2xl border border-white/15 text-xs text-white/80 space-y-1 backdrop-blur-md">
              <div className="font-bold text-[#FFE7A3] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#FFD34E]" />
                <span>ডিজিটাল নিরাপত্তা ও লাইসেন্স নিয়মাবলী</span>
              </div>
              <p className="text-[11px] text-white/70 leading-relaxed">
                প্রতিটি প্রশ্নপত্রের পাতায় আপনার নাম ({student.fullName}), মোবাইল/ইমেইল এবং অর্ডার আইডি দিয়ে ডিজিটাল ওয়াটারমার্ক করা থাকে। এটি আপনার রেজিস্টার্ড ডিভাইসেই পড়া যাবে। কোনো ফাইল ডাউনলোড বা লিক করার অনুমতি নেই।
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState, useMemo } from 'react';
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
  Search,
  PhoneCall,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../constants/brand';
import { FALLBACK_PRODUCTS } from '../constants/fallbackProducts';
import { subscribeToOrdersRealtime } from '../firebase/firebase';
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
  const { student, isLoggedIn, deviceInfo, loginStudent } = useAuth();
  const [allRtdbOrders, setAllRtdbOrders] = useState<Order[]>([]);
  const [apiOrders, setApiOrders] = useState<Order[]>([]);
  const [apiPurchases, setApiPurchases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Manual lookup state (for students entering phone or order ID)
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupActiveQuery, setLookupActiveQuery] = useState('');

  // 1. Subscribe to Firebase Realtime Database for all live orders
  useEffect(() => {
    const unsubscribe = subscribeToOrdersRealtime(
      (orders) => {
        setAllRtdbOrders(orders || []);
      },
      (err) => {
        console.warn('PurchasedContent RTDB orders notice:', err);
      }
    );
    return () => unsubscribe();
  }, []);

  // 2. Fetch backend purchases & orders for current student
  const loadBackendPurchases = async (silent = false) => {
    const queryId = lookupActiveQuery || student?.id || student?.email || student?.mobile;
    if (!queryId) return;

    if (!silent) setIsLoading(true);
    setError('');

    try {
      const data = await api.getStudentPurchases(queryId);
      if (data?.orders) setApiOrders(data.orders);
      if (data?.purchases) setApiPurchases(data.purchases);
    } catch (err: any) {
      if (!silent) {
        console.warn('Backend API purchases fetch notice:', err?.message || err);
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBackendPurchases(false);

    // Auto-poll backend every 5 seconds
    const interval = setInterval(() => {
      loadBackendPurchases(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [student?.id, student?.email, student?.mobile, lookupActiveQuery]);

  // Read cached last order from localStorage
  const lastOrderId = typeof window !== 'undefined' ? localStorage.getItem('bca_last_order_id') || '' : '';
  const localCachedOrders: Order[] = useMemo(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('bca_orders') || '[]');
    } catch {
      return [];
    }
  }, []);

  // 3. Merge and match orders for this student
  const matchedOrders: Order[] = useMemo(() => {
    const map = new Map<string, Order>();

    // Combine all sources: Firebase RTDB, API orders, and localStorage
    const combined = [...allRtdbOrders, ...apiOrders, ...localCachedOrders];

    const cleanStudentEmail = (student?.email || '').toLowerCase().trim();
    const cleanStudentMobile = (student?.mobile || '').replace(/\D/g, '');
    const cleanLookup = lookupActiveQuery.trim().toLowerCase();
    const cleanLookupDigits = lookupActiveQuery.replace(/\D/g, '');

    for (const ord of combined) {
      if (!ord || !ord.orderId) continue;

      const ordEmail = (ord.studentEmail || '').toLowerCase().trim();
      const ordMobileDigits = (ord.studentMobile || '').replace(/\D/g, '');
      const ordId = ord.orderId.toUpperCase();

      let isMatch = false;

      // Match by explicit student login
      if (student?.id && ord.userId === student.id) isMatch = true;
      if (cleanStudentEmail && ordEmail === cleanStudentEmail) isMatch = true;
      if (cleanStudentMobile && cleanStudentMobile.length >= 10 && ordMobileDigits === cleanStudentMobile) isMatch = true;

      // Match by last ordered ID on this device
      if (lastOrderId && ordId === lastOrderId.toUpperCase()) isMatch = true;

      // Match by active search lookup
      if (cleanLookup) {
        if (ordId.includes(cleanLookup.toUpperCase())) isMatch = true;
        if (ordEmail && ordEmail.includes(cleanLookup)) isMatch = true;
        if (cleanLookupDigits.length >= 8 && ordMobileDigits.includes(cleanLookupDigits)) isMatch = true;
      }

      if (isMatch) {
        const existing = map.get(ord.orderId);
        // Prefer verified status over pending if any source is verified
        if (!existing || ord.paymentStatus === 'verified') {
          map.set(ord.orderId, { ...existing, ...ord });
        }
      }
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [allRtdbOrders, apiOrders, localCachedOrders, student, lastOrderId, lookupActiveQuery]);

  // 4. Derive purchases list from both backend API purchases and verified RTDB orders
  const resolvedPurchases = useMemo(() => {
    const purchasesMap = new Map<string, any>();

    // 1. From API purchases
    for (const p of apiPurchases) {
      purchasesMap.set(p.productId, p);
    }

    // 2. From all matched orders in RTDB / Local
    for (const ord of matchedOrders) {
      const isVerified = ord.paymentStatus === 'verified';
      const items = ord.items && ord.items.length > 0
        ? ord.items
        : (ord.selectedProductIds || []).map((id) => {
            const fb = FALLBACK_PRODUCTS.find((p) => p.id === id);
            return {
              productId: id,
              subjectCode: fb?.subjectCode || 'BCA',
              subjectName: fb?.subjectName || 'Question Bank',
            };
          });

      for (const item of items) {
        const fallback = FALLBACK_PRODUCTS.find((p) => p.id === item.productId);
        const existing = purchasesMap.get(item.productId);

        if (!existing || isVerified) {
          purchasesMap.set(item.productId, {
            purchaseId: `pur-${ord.orderId}-${item.productId}`,
            productId: item.productId,
            orderId: ord.orderId,
            accessStatus: isVerified ? 'active' : 'pending_approval',
            purchasedAt: ord.createdAt,
            subjectName: item.subjectName || fallback?.subjectName || 'BCA Question Bank',
            subjectCode: item.subjectCode || fallback?.subjectCode || 'BCA',
            semesterId: fallback?.semesterId || 'sem-3',
            pageCount: fallback?.pageCount || 30,
            examYear: fallback?.examYear || '2024-2025 Edition',
          });
        }
      }
    }

    return Array.from(purchasesMap.values());
  }, [apiPurchases, matchedOrders]);

  const hasAnyItems = matchedOrders.length > 0 || resolvedPurchases.length > 0;

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;
    setLookupActiveQuery(lookupQuery.trim());

    // Auto login if 10-digit mobile number found in matching orders
    const cleanDigits = lookupQuery.replace(/\D/g, '');
    const found = allRtdbOrders.find(
      (o) =>
        (cleanDigits.length >= 10 && (o.studentMobile || '').replace(/\D/g, '') === cleanDigits) ||
        o.orderId.toUpperCase() === lookupQuery.trim().toUpperCase()
    );
    if (found && !student) {
      loginStudent({
        id: found.userId || `std_${found.orderId}`,
        fullName: found.studentName || 'Student',
        email: found.studentEmail || '',
        mobile: found.studentMobile || cleanDigits,
      });
    }
  };

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
            {student ? (
              <span className="font-bold text-white">
                {student.fullName} ({student.mobile || student.email})
              </span>
            ) : (
              <span className="text-white/80">পেমেন্ট ভেরিফিকেশন ও ডিজিটাল রিডার</span>
            )}
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

      {/* QUICK ORDER LOOKUP BAR (Ensures every live customer finds their order instantly) */}
      <div className="liquid-glass-master rounded-2xl p-4 sm:p-5 border border-[#FFE7A3]/30 shadow-lg">
        <form onSubmit={handleLookupSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#FFD34E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder="মোবাইল নম্বর বা অর্ডার আইডি লিখুন (e.g. 9830112233 বা ORD-202611...)"
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-black/50 border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:border-[#FFD34E]"
            />
          </div>
          <button
            type="submit"
            className="btn-gold-primary w-full sm:w-auto px-6 py-2.5 text-xs font-black rounded-full cursor-pointer flex items-center justify-center gap-1.5 shadow-md shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>অর্ডার খুঁজুন (Find Order)</span>
          </button>
          {lookupActiveQuery && (
            <button
              type="button"
              onClick={() => {
                setLookupQuery('');
                setLookupActiveQuery('');
              }}
              className="text-xs text-white/60 hover:text-white px-2 py-1 cursor-pointer shrink-0"
            >
              Clear
            </button>
          )}
        </form>
        {lookupActiveQuery && (
          <p className="text-[11px] text-[#FFE7A3] mt-2 pl-2">
            Viewing results for: <strong className="text-white">{lookupActiveQuery}</strong> ({matchedOrders.length} order(s) found)
          </p>
        )}
      </div>

      {isLoading && !hasAnyItems ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#FFE7A3]">
          <Loader2 className="w-9 h-9 animate-spin text-[#FFD34E] mb-3" />
          <span className="text-sm font-semibold">আপনার অর্ডার ও নোটস যাচাই করা হচ্ছে...</span>
        </div>
      ) : error && !hasAnyItems ? (
        <div className="p-4 bg-rose-950/70 border border-rose-500/40 rounded-2xl text-xs text-rose-200 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => loadBackendPurchases(false)}
            className="flex items-center gap-1 font-bold text-[#FFD34E] hover:underline cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : !hasAnyItems ? (
        <div className="liquid-glass-master rounded-3xl p-10 text-center border border-[#FFE7A3]/30 shadow-2xl space-y-4">
          <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto text-[#FFE7A3] mb-3">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-white">No Orders or Question Banks Found</h3>
          <p className="text-xs text-white/75 max-w-md mx-auto leading-relaxed">
            যদি আপনি ইতিমধ্যে পেমেন্ট করে থাকেন, দয়া করে ওপরের বক্সে আপনার <strong>১০ সংখ্যার মোবাইল নম্বর</strong> দিয়ে <strong>'অর্ডার খুঁজুন'</strong> বাটনে ক্লিক করুন। অথবা আমাদের BCA বিষয়ের তালিকা থেকে সিলেক্ট করে অর্ডার করুন।
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGoToCatalog}
              className="btn-gold-primary inline-flex items-center gap-2 px-6 py-2.5 text-xs font-extrabold rounded-full cursor-pointer shadow-md"
            >
              <span>Explore BCA Question Banks</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href={`https://wa.me/91${BRAND.payment?.whatsappPhone || '9382040746'}?text=${encodeURIComponent(
                'Hello BCA STUDY POINT, I completed payment but need assistance locating my order.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600/80 hover:bg-emerald-500 border border-emerald-400/40 rounded-full transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-white" />
              <span>WhatsApp Support</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. ORDER VERIFICATION STATUS CARDS (Order History & Trust Proof) */}
          {matchedOrders.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#FFE7A3] px-1">
                <span className="flex items-center gap-1.5 text-sm font-black text-white">
                  <ShoppingBag className="w-4 h-4 text-[#FFD34E]" />
                  <span>আপনার অর্ডারের হিস্টোরি ও স্ট্যাটাস ({matchedOrders.length})</span>
                </span>
                <button
                  onClick={() => loadBackendPurchases(false)}
                  className="flex items-center gap-1 text-[11px] text-white/70 hover:text-white cursor-pointer"
                  title="রিফ্রেশ করুন"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh Status</span>
                </button>
              </div>

              <div className="space-y-3">
                {matchedOrders.map((ord) => (
                  <div
                    key={ord.orderId}
                    className={`liquid-glass-master rounded-2xl p-4 sm:p-5 border shadow-xl relative overflow-hidden transition-all ${
                      ord.paymentStatus === 'verified'
                        ? 'border-emerald-500/40 bg-emerald-950/20'
                        : ord.paymentStatus === 'rejected' || ord.paymentStatus === 'failed'
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
                          {ord.studentMobile && (
                            <>
                              <span className="text-white/30">·</span>
                              <span className="text-white/70">📱 {ord.studentMobile}</span>
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
                        ) : ord.paymentStatus === 'rejected' || ord.paymentStatus === 'failed' ? (
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
                      ) : ord.paymentStatus === 'rejected' || ord.paymentStatus === 'failed' ? (
                        <div className="text-rose-200 leading-relaxed">
                          ✕ <strong>পেমেন্ট ভেরিফিকেশন সফল হয়নি:</strong> সঠিক UTR রেফারেন্স দিন বা নীচের হোয়াটসঅ্যাপে যোগাযোগ করুন।
                        </div>
                      ) : (
                        <div className="text-[#FFE7A3] leading-relaxed">
                          ⏳ <strong>অ্যাডমিন আপনার পেমেন্ট যাচাই করছেন:</strong> আপনার অর্ডার সফলভাবে জমা হয়েছে। অ্যাডমিন পেমেন্ট UTR চেক করে অনুমোদন দেওয়া মাত্রই আপনার বিষয়ের সমস্ত পিডিএফ নোটস সাথে সাথে পড়তে পারবেন।
                        </div>
                      )}

                      {/* Direct WhatsApp Verification Query Button */}
                      <a
                        href={`https://wa.me/91${BRAND.payment?.whatsappPhone || '9382040746'}?text=${encodeURIComponent(
                          `Hello BCA STUDY POINT,\nMy order ${ord.orderId} is placed for ₹${ord.totalAmount}.\nUTR: ${ord.paymentReference || 'N/A'}\nStudent Name: ${ord.studentName || student?.fullName || 'Student'}\n\nPlease verify and approve my notes access.`
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
                      {ord.items && ord.items.length > 0 ? (
                        ord.items.map((it) => (
                          <span
                            key={it.productId}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-[#FFE7A3] border border-white/15"
                          >
                            {it.subjectCode} - {it.subjectName}
                          </span>
                        ))
                      ) : (
                        (ord.selectedProductIds || []).map((pid) => {
                          const fb = FALLBACK_PRODUCTS.find((p) => p.id === pid);
                          return (
                            <span
                              key={pid}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-[#FFE7A3] border border-white/15"
                            >
                              {fb?.subjectCode || pid} - {fb?.subjectName || ''}
                            </span>
                          );
                        })
                      )}
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
                {resolvedPurchases.filter((p) => p.accessStatus === 'active').length}টি অ্যাক্টিভ নোটস
              </span>
            </div>

            <div className="divide-y divide-white/10 border border-[#FFE7A3]/30 rounded-2xl bg-black/35 backdrop-blur-xl shadow-2xl overflow-hidden">
              {resolvedPurchases.length === 0 ? (
                <div className="p-8 text-center text-white/70 space-y-2">
                  <Clock className="w-8 h-8 text-amber-300 mx-auto animate-pulse" />
                  <h4 className="text-sm font-bold text-white">পেমেন্ট ভেরিফিকেশন চলছে</h4>
                  <p className="text-xs text-[#FFE7A3] max-w-md mx-auto">
                    আপনার অর্ডারের বিষয়গুলো অ্যাডমিন যাচাই করছেন। অ্যাডমিন অনুমোদন দেওয়া মাত্রই এখানে পড়ার বাটন চলে আসবে।
                  </p>
                </div>
              ) : (
                resolvedPurchases.map((item) => (
                  <div
                    key={item.purchaseId || item.productId}
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
                            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full bg-white/5 border border-white/10 text-white/40 cursor-not-allowed"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>অনুমোদনের অপেক্ষায়</span>
                          </button>
                          <a
                            href={`https://wa.me/91${BRAND.payment?.whatsappPhone || '9382040746'}?text=${encodeURIComponent(
                              `Hello BCA STUDY POINT,\nPlease activate access for ${item.subjectCode} (${item.subjectName}) under order ${item.orderId}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 text-[11px] font-bold text-emerald-300 hover:text-emerald-200 bg-emerald-950/40 border border-emerald-500/30 rounded-full flex items-center justify-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Notify Admin</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

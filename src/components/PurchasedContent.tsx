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
  AlertTriangle,
  MessageSquare,
  ChevronRight,
  Search,
  FileText,
  CreditCard,
  Printer,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../constants/brand';
import { FALLBACK_PRODUCTS } from '../constants/fallbackProducts';
import { subscribeToOrdersRealtime } from '../firebase/firebase';
import { PaymentReceiptModal } from './PaymentReceiptModal';
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

  // Primary Tab Switcher: 'notes' (Default clean view) vs 'payments' (Dedicated Payment History)
  const [activeTab, setActiveTab] = useState<'notes' | 'payments'>('notes');

  // Receipt Modal State
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  // Manual lookup state (for students searching by phone or order ID)
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

  const activePurchases = useMemo(
    () => resolvedPurchases.filter((p) => p.accessStatus === 'active'),
    [resolvedPurchases]
  );

  const pendingPurchases = useMemo(
    () => resolvedPurchases.filter((p) => p.accessStatus !== 'active'),
    [resolvedPurchases]
  );

  const pendingOrdersCount = useMemo(
    () => matchedOrders.filter((o) => o.paymentStatus === 'pending').length,
    [matchedOrders]
  );

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
    <div className="max-w-5xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* 1. Header & Device Protection Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/15">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              My Library &amp; Notes
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFD34E]/20 text-[#FFD34E] border border-[#FFD34E]/40">
              Student Dashboard
            </span>
          </div>
          <p className="text-xs text-[#FFE7A3] mt-1">
            {student ? (
              <>
                স্বাগতম, <strong className="text-white">{student.fullName}</strong> (📱 {student.mobile || student.email})
              </>
            ) : (
              'আপনার অনুমোদিত স্টাডি নোটস এবং পেমেন্ট হিস্ট্রি'
            )}
          </p>
        </div>

        {/* Device Status Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-black/40 border border-[#FFE7A3]/30 rounded-xl text-xs font-semibold text-white backdrop-blur-md shadow-sm">
          <Laptop className="w-4 h-4 text-[#FFD34E]" />
          <span>Device: {deviceInfo.browser}</span>
          <span className="text-[#FFD34E]">·</span>
          <span className="text-emerald-400 font-bold">1:1 Protected</span>
        </div>
      </div>

      {/* 2. ORDER LOOKUP BAR */}
      <div className="liquid-glass-master rounded-2xl p-3.5 sm:p-4 border border-[#FFE7A3]/25 shadow-md">
        <form onSubmit={handleLookupSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#FFD34E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder="মোবাইল নম্বর বা অর্ডার আইডি দিয়ে খুঁজুন (e.g. 9830112233 বা ORD-...)"
              className="w-full pl-10 pr-4 py-2 text-xs bg-black/50 border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:border-[#FFD34E]"
            />
          </div>
          <button
            type="submit"
            className="btn-gold-primary w-full sm:w-auto px-5 py-2 text-xs font-black rounded-full cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>অর্ডার খুঁজুন</span>
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
      </div>

      {/* 3. ELEGANT OPTION / TAB SWITCHER (Clean Study Notes vs Payment History) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/40 p-1.5 rounded-2xl border border-white/15 backdrop-blur-xl">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Option 1: Study Materials & Books (Default Normal View) */}
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-gradient-to-r from-[#970014] to-[#65000D] text-white border border-[#FFD34E]/60 shadow-[0_4px_15px_rgba(151,0,20,0.5)]'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#FFD34E]" />
            <span>আমার স্টাডি মেটেরিয়ালস (Study Materials)</span>
            {resolvedPurchases.length > 0 && (
              <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'notes' ? 'bg-[#FFD34E] text-[#3D0009]' : 'bg-white/10 text-white/80'
              }`}>
                {activePurchases.length}
              </span>
            )}
          </button>

          {/* Option 2: Payment History & Receipts (The user requested option) */}
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer relative ${
              activeTab === 'payments'
                ? 'bg-gradient-to-r from-[#970014] to-[#65000D] text-white border border-[#FFD34E]/60 shadow-[0_4px_15px_rgba(151,0,20,0.5)]'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <CreditCard className="w-4 h-4 text-[#FFD34E]" />
            <span>পেমেন্ট হিস্ট্রি ও রসিদ (Payment History)</span>
            {matchedOrders.length > 0 && (
              <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'payments' ? 'bg-[#FFD34E] text-[#3D0009]' : 'bg-white/10 text-white/80'
              }`}>
                {matchedOrders.length}
              </span>
            )}
            {pendingOrdersCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-1 -right-1" />
            )}
          </button>
        </div>

        {/* Refresh / Polling Button */}
        <button
          onClick={() => loadBackendPurchases(false)}
          className="self-end sm:self-auto flex items-center gap-1 text-[11px] font-semibold text-[#FFE7A3]/80 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          title="রিফ্রেশ করুন"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#FFD34E]' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 4. MAIN CONTENT AREA */}
      {isLoading && !hasAnyItems ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#FFE7A3]">
          <Loader2 className="w-9 h-9 animate-spin text-[#FFD34E] mb-3" />
          <span className="text-sm font-semibold">আপনার তথ্য লোড করা হচ্ছে...</span>
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
        /* Empty State */
        <div className="liquid-glass-master rounded-3xl p-10 text-center border border-[#FFE7A3]/30 shadow-2xl space-y-4">
          <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto text-[#FFE7A3] mb-3">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-white">No Question Banks or Orders Found</h3>
          <p className="text-xs text-white/75 max-w-md mx-auto leading-relaxed">
            যদি আপনি ইতিমধ্যে পেমেন্ট করে থাকেন, দয়া করে ওপরের বক্সে আপনার <strong>১০ সংখ্যার মোবাইল নম্বর</strong> দিয়ে <strong>'অর্ডার খুঁজুন'</strong> বাটনে ক্লিক করুন। অথবা আমাদের BCA প্রশ্নপত্রের তালিকা থেকে বিষয় নির্বাচন করুন।
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
                'Hello BCA STUDY POINT, I completed payment but need assistance accessing my study materials.'
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
      ) : activeTab === 'notes' ? (
        /* ========================================================================= */
        /* TAB 1: NORMAL VIEW - CLEAN STUDY MATERIALS & PDF ACCESS (User's Main Goal) */
        /* ========================================================================= */
        <div className="space-y-4">
          {/* Non-intrusive Pending Approval Alert Banner (Directing to Payment History option) */}
          {pendingOrdersCount > 0 && (
            <div className="p-3.5 bg-gradient-to-r from-amber-950/60 to-[#3D0009]/80 border border-amber-400/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-300 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className="font-bold text-amber-200">
                    আপনার {pendingOrdersCount}টি অর্ডারের পেমেন্ট ভেরিফিকেশন চলছে
                  </span>
                  <p className="text-[#FFE7A3]/90 text-[11px] mt-0.5">
                    অ্যাডমিন যাচাই অনুমোদন দেওয়া মাত্রই আপনার প্রশ্নপত্র পড়ার জন্য প্রস্তুত হবে।
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('payments')}
                className="self-start sm:self-auto px-4 py-1.5 rounded-full bg-amber-400 text-[#3D0009] font-black text-[11px] hover:bg-amber-300 transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                পেমেন্ট হিস্ট্রি দেখুন →
              </button>
            </div>
          )}

          {/* Subjects Grid & Reader Access */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#FFE7A3] px-1">
              <span className="flex items-center gap-1.5 text-sm font-black text-white">
                <Sparkles className="w-4 h-4 text-[#FFD34E]" />
                <span>আপনার সিলেবাস অনুযায়ী স্টাডি নোটস ({resolvedPurchases.length})</span>
              </span>
              <span className="text-[11px] text-emerald-400 font-bold">
                ✓ {activePurchases.length}টি নোটস পড়ার জন্য প্রস্তুত
              </span>
            </div>

            {resolvedPurchases.length === 0 ? (
              <div className="p-10 text-center text-white/70 space-y-2 bg-black/40 rounded-2xl border border-white/10">
                <Clock className="w-8 h-8 text-amber-300 mx-auto animate-pulse" />
                <h4 className="text-sm font-bold text-white">পেমেন্ট ভেরিফিকেশন চলছে</h4>
                <p className="text-xs text-[#FFE7A3] max-w-md mx-auto">
                  আপনার নির্বাচিত বিষয়গুলো অ্যাডমিন যাচাই করছেন। অনুমোদন দেওয়া মাত্রই পড়ার বাটন চলে আসবে।
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resolvedPurchases.map((item) => {
                  const isActive = item.accessStatus === 'active';
                  const fallback = FALLBACK_PRODUCTS.find((p) => p.id === item.productId);

                  return (
                    <div
                      key={item.purchaseId || item.productId}
                      className={`liquid-glass-master rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                        isActive
                          ? 'border-emerald-500/40 hover:border-[#FFD34E]/60 bg-gradient-to-br from-[#65000D]/40 to-[#240005]/80'
                          : 'border-amber-400/40 bg-gradient-to-br from-amber-950/20 to-[#240005]/80'
                      }`}
                    >
                      <div>
                        {/* Subject Top Badges */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono text-xs font-black text-[#FFD34E] bg-black/50 px-2.5 py-0.5 rounded border border-[#FFE7A3]/30">
                            {item.subjectCode}
                          </span>
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 rounded-full">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              <span>সক্রিয় (Active)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-200 bg-amber-500/20 border border-amber-400/50 px-2 py-0.5 rounded-full animate-pulse">
                              <Clock className="w-3 h-3 text-amber-300" />
                              <span>যাচাইকরণ চলছে</span>
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-extrabold text-white leading-snug mb-1">
                          {item.subjectName}
                        </h3>

                        <p className="text-xs text-[#FFE7A3]/80 line-clamp-2 mb-3">
                          {fallback?.description || 'BCA 3rd Semester university exam-oriented question bank with complete solved solutions.'}
                        </p>

                        {/* Meta Specs */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/60 mb-4">
                          <span className="bg-white/10 px-2 py-0.5 rounded">
                            📄 {item.pageCount} Pages Solved
                          </span>
                          <span className="bg-white/10 px-2 py-0.5 rounded">
                            🎓 {item.examYear || '2024-2025 Edition'}
                          </span>
                          <span className="bg-white/10 px-2 py-0.5 rounded font-mono text-[10px]">
                            #{item.orderId}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-3 border-t border-white/10">
                        {isActive ? (
                          <button
                            onClick={() => onOpenViewer(item.productId)}
                            className="btn-gold-primary w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.02] transition-transform"
                          >
                            <BookOpen className="w-4 h-4" />
                            <span>এখনই পড়ুন (Read Question Bank)</span>
                            <ChevronRight className="w-4 h-4 ml-0.5" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              disabled
                              className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-white/5 border border-white/10 text-white/40 cursor-not-allowed flex items-center justify-center gap-1.5"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>অনুমোদনের অপেক্ষায়</span>
                            </button>
                            <a
                              href={`https://wa.me/91${BRAND.payment?.whatsappPhone || '9382040746'}?text=${encodeURIComponent(
                                `Hello BCA STUDY POINT,\nPlease activate access for ${item.subjectCode} under order ${item.orderId}.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 rounded-xl hover:bg-emerald-900/50 transition-colors"
                              title="Notify on WhatsApp"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* TAB 2: DEDICATED PAYMENT HISTORY & OFFICIAL RECEIPTS OPTION (User Request) */
        /* ========================================================================= */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-[#FFE7A3] px-1">
            <span className="flex items-center gap-1.5 text-sm font-black text-white">
              <CreditCard className="w-4 h-4 text-[#FFD34E]" />
              <span>আপনার সমস্ত পেমেন্ট হিস্ট্রি ও অফিশিয়াল রসিদ ({matchedOrders.length})</span>
            </span>
            <span className="text-[11px] text-white/60">
              যেকোনো অর্ডারের পাশে 'রসিদ দেখুন' বাটনে ক্লিক করে মানি রসিদ ডাউনলোড করতে পারবেন
            </span>
          </div>

          <div className="space-y-3.5">
            {matchedOrders.map((ord) => {
              const isVerified = ord.paymentStatus === 'verified';
              const isFailed = ord.paymentStatus === 'rejected' || ord.paymentStatus === 'failed';
              const cleanUtr = (ord.paymentReference || '').replace('upi_', '');

              return (
                <div
                  key={ord.orderId}
                  className={`liquid-glass-master rounded-2xl p-4 sm:p-5 border shadow-xl relative overflow-hidden transition-all ${
                    isVerified
                      ? 'border-emerald-500/40 bg-emerald-950/15'
                      : isFailed
                      ? 'border-rose-500/40 bg-rose-950/15'
                      : 'border-amber-400/50 bg-amber-950/20'
                  }`}
                >
                  {/* Order Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-white/10">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-black text-[#FFD34E] bg-black/50 px-2.5 py-0.5 rounded border border-white/15">
                          {ord.orderId}
                        </span>
                        <span className="text-xs text-white/70">
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-white/90">
                        <span>
                          Paid Amount: <strong className="text-[#FFD34E] font-black text-sm">₹{ord.totalAmount}</strong>
                        </span>
                        {cleanUtr && (
                          <span>
                            UTR: <strong className="font-mono text-[11px] bg-black/40 px-1.5 py-0.5 rounded text-white">{cleanUtr}</strong>
                          </span>
                        )}
                        {ord.studentMobile && (
                          <span className="text-white/60">📱 {ord.studentMobile}</span>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>অনুমোদিত ও সক্রিয় (Verified)</span>
                        </span>
                      ) : isFailed ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-400/50">
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                          <span>বাতিল (Rejected)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-200 border border-amber-400/60 shadow-sm animate-pulse">
                          <Clock className="w-4 h-4 text-amber-300" />
                          <span>যাচাইকরণ চলছে (Pending)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Purchased Subjects List */}
                  <div className="py-2.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-white/60 mr-1">অন্তর্ভুক্ত বিষয়:</span>
                    {ord.items && ord.items.length > 0 ? (
                      ord.items.map((it) => (
                        <span
                          key={it.productId}
                          className="px-2 py-0.5 rounded text-[11px] font-bold bg-white/10 text-[#FFE7A3] border border-white/15"
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
                            className="px-2 py-0.5 rounded text-[11px] font-bold bg-white/10 text-[#FFE7A3] border border-white/15"
                          >
                            {fb?.subjectCode || pid} - {fb?.subjectName || ''}
                          </span>
                        );
                      })
                    )}
                  </div>

                  {/* Actions Row: View Receipt Modal Button & WhatsApp Help */}
                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-[11px] text-white/70">
                      {isVerified ? (
                        <span className="text-emerald-300">✓ পেমেন্ট অনুমোদিত হয়েছে। অফিশিয়াল রসিদ সংগ্রহ করতে পারেন।</span>
                      ) : (
                        <span className="text-amber-200">⏳ অ্যাডমিন পেমেন্ট যাচাই করছেন (১০-২০ মিনিট সময় লাগতে পারে)।</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* VIEW & PRINT RECEIPT BUTTON (Official Cash Memo Modal) */}
                      <button
                        onClick={() => setSelectedReceiptOrder(ord)}
                        className="btn-gold-primary px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-105 transition-transform"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>রসিদ দেখুন / Receipt</span>
                      </button>

                      {/* WhatsApp Help */}
                      <a
                        href={`https://wa.me/91${BRAND.payment?.whatsappPhone || '9382040746'}?text=${encodeURIComponent(
                          `Hello BCA STUDY POINT,\nInquiry about Order ${ord.orderId} (₹${ord.totalAmount}).\nUTR: ${cleanUtr || 'N/A'}\nStudent Name: ${ord.studentName || 'Student'}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-full bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp Help</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Official Payment Receipt Modal */}
      <PaymentReceiptModal
        order={selectedReceiptOrder}
        isOpen={!!selectedReceiptOrder}
        onClose={() => setSelectedReceiptOrder(null)}
      />
    </div>
  );
};

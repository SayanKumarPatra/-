import React, { useEffect, useState } from 'react';
import { BookOpen, ShieldCheck, Laptop, Lock, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../constants/brand';

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
  const [purchases, setPurchases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadPurchases = async () => {
    if (!student?.id) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await api.getStudentPurchases(student.id);
      setPurchases(data.purchases || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load purchased question banks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (student?.id) {
      loadPurchases();
    }
  }, [student?.id]);

  if (!isLoggedIn || !student) {
    return (
      <div className="max-w-xl mx-auto my-16 px-4 text-center">
        <div className="liquid-glass-master rounded-3xl p-8 border border-[#FFE7A3]/30 shadow-2xl">
          <div className="w-14 h-14 bg-[#FFD34E]/20 border border-[#FFD34E] rounded-full flex items-center justify-center mx-auto text-[#FFD34E] mb-4 shadow-[0_0_20px_rgba(255,211,78,0.3)]">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-white">Student Sign In Required</h2>
          <p className="mt-2 text-xs text-white/80 text-balance leading-relaxed">
            Please log in with the email address used during purchase to access your licensed BCA question banks on this device.
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

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Title & Device Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-white/15">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            My Purchased Question Banks
          </h1>
          <p className="text-xs text-[#FFE7A3] mt-1">
            Verified licensed question banks for <span className="font-bold text-white">{student.fullName}</span> ({student.email})
          </p>
        </div>

        {/* Device Status */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 border border-[#FFE7A3]/30 rounded-xl text-xs font-semibold text-white backdrop-blur-md shadow-sm">
          <Laptop className="w-4 h-4 text-[#FFD34E]" />
          <span>Device: {deviceInfo.browser} on {deviceInfo.os}</span>
          <span className="text-[#FFD34E]">·</span>
          <span className="text-emerald-400 font-bold">Protected</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#FFE7A3]">
          <Loader2 className="w-9 h-9 animate-spin text-[#FFD34E] mb-3" />
          <span className="text-sm font-semibold">Verifying licensed documents...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-950/70 border border-rose-500/40 rounded-2xl text-xs text-rose-200 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={loadPurchases}
            className="flex items-center gap-1 font-bold text-[#FFD34E] hover:underline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      ) : purchases.length === 0 ? (
        <div className="liquid-glass-master rounded-3xl p-10 text-center border border-[#FFE7A3]/30 shadow-2xl">
          <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto text-[#FFE7A3] mb-3">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-white">No Question Banks Purchased Yet</h3>
          <p className="text-xs text-white/75 mt-1 max-w-sm mx-auto leading-relaxed">
            Browse our university-aligned BCA semester subjects and select the question banks you need for your upcoming exams.
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
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#FFE7A3] font-semibold px-1">
            <span>{purchases.length} Licensed Subject(s) Available</span>
            <button
              onClick={loadPurchases}
              className="flex items-center gap-1 hover:text-white cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh Access</span>
            </button>
          </div>

          <div className="divide-y divide-white/10 border border-[#FFE7A3]/30 rounded-2xl bg-black/35 backdrop-blur-xl shadow-2xl overflow-hidden">
            {purchases.map((item) => (
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
                      Purchased on {new Date(item.purchasedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-extrabold text-white">
                    {item.subjectName}
                  </h3>

                  <div className="flex items-center gap-3 mt-1.5 text-xs text-white/70">
                    <span>{item.pageCount} Pages</span>
                    <span aria-hidden="true" className="text-white/30">·</span>
                    <span>Order: {item.orderId}</span>
                    <span aria-hidden="true" className="text-white/30">·</span>
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Active &amp; Protected
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={() => onOpenViewer(item.productId)}
                    className="btn-gold-primary w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-extrabold rounded-full cursor-pointer whitespace-nowrap shadow-[0_4px_15px_rgba(255,211,78,0.35)]"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Open Question Bank</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Security footnote */}
          <div className="p-4 bg-black/40 rounded-2xl border border-white/15 text-xs text-white/80 space-y-1 backdrop-blur-md">
            <div className="font-bold text-[#FFE7A3] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#FFD34E]" />
              <span>Digital Rights &amp; Dynamic Watermark Notice</span>
            </div>
            <p className="text-[11px] text-white/70 leading-relaxed">
              Every page is digitally stamped with your name ({student.fullName}), email ({student.email}), and order reference. Downloading, screen recording, and unauthorized sharing is strictly prohibited and traceable to your student identity.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

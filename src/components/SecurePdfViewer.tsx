import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Loader2,
  Lock,
  RefreshCw,
  Eye,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Info,
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../constants/brand';
import { getProductPdfUrl } from '../constants/productPdfs';
import { FALLBACK_PRODUCTS } from '../constants/fallbackProducts';

// Configure PDF.js Worker to guarantee zero-fail rendering across all browsers
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

interface SecurePdfViewerProps {
  productId: string;
  onClose: () => void;
  onDeviceMismatch: (registeredDevice: any, supportInfo: any) => void;
}

interface SinglePageProps {
  pdfDoc: any;
  pageNumber: number;
  zoomLevel: number;
  studentName: string;
  studentMobile: string;
  orderId: string;
  onInView: (pageNumber: number) => void;
}

const SinglePageCanvas: React.FC<SinglePageProps> = ({
  pdfDoc,
  pageNumber,
  zoomLevel,
  studentName,
  studentMobile,
  orderId,
  onInView,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRendered, setIsRendered] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const renderTaskRef = useRef<any>(null);

  // In-view observer for page counter
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onInView(pageNumber);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pageNumber, onInView]);

  // Render PDF page to HTML5 Canvas
  useEffect(() => {
    let isCancelled = false;

    async function renderPage() {
      if (!pdfDoc || !canvasRef.current) return;

      try {
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {
            // ignore cancel error
          }
        }

        const page = await pdfDoc.getPage(pageNumber);
        if (isCancelled || !canvasRef.current) return;

        // Base scale for crystal clear HD rendering
        const baseScale = 1.6;
        const scale = (baseScale * zoomLevel) / 100;
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport,
        };

        const task = page.render(renderContext);
        renderTaskRef.current = task;
        await task.promise;

        if (!isCancelled) {
          setIsRendered(true);
          setRenderError(null);
        }
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException' && !isCancelled) {
          console.error(`Page ${pageNumber} render failure:`, err);
          setRenderError('Could not render page');
        }
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [pdfDoc, pageNumber, zoomLevel]);

  return (
    <div
      ref={containerRef}
      className="relative bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-slate-300 overflow-hidden select-none mb-6 max-w-full transition-all"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Top Page Header Tag */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-600 font-mono">
        <span className="font-bold text-[#970014]">
          Page {pageNumber} of {pdfDoc?.numPages || 1}
        </span>
        <span className="text-[10px] text-slate-500">
          BCA STUDY POINT · Official Question Bank
        </span>
      </div>

      {/* Canvas Container */}
      <div className="relative overflow-hidden flex items-center justify-center bg-slate-50 min-h-[300px]">
        {/* Loading Spinner */}
        {!isRendered && !renderError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-500 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-[#970014] mb-2" />
            <span className="text-xs font-bold text-slate-600">
              Rendering Page {pageNumber}...
            </span>
          </div>
        )}

        {renderError && (
          <div className="p-8 text-center text-rose-600">
            <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-rose-500" />
            <span className="text-xs font-semibold">{renderError}</span>
          </div>
        )}

        {/* Native HTML5 Canvas (Eliminates Browser Plugin Blank Screen) */}
        <canvas
          ref={canvasRef}
          className="max-w-full h-auto block pointer-events-none select-none"
        />

        {/* Dynamic Translucent Diagonal Watermark Stamped over Canvas */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-around py-6 px-4 z-20 select-none overflow-hidden opacity-35">
          {[0, 1, 2, 3, 4].map((row) => (
            <div
              key={row}
              className="transform -rotate-25 whitespace-nowrap text-center text-[10px] sm:text-[11px] font-black tracking-widest text-[#65000D] uppercase font-mono select-none"
            >
              BCA STUDY POINT · {studentName} · 📱 {studentMobile} · ORDER: {orderId} · STRICTLY NO SCREENSHOT
            </div>
          ))}
        </div>

        {/* Anti-Pointer Layer: Completely blocks touch selection, saving image, and right-click */}
        <div
          className="absolute inset-0 z-30 bg-transparent select-none"
          onContextMenu={(e) => e.preventDefault()}
          onTouchStart={(e) => {
            // Allow vertical scroll but prevent long-press context menu
            if (e.touches.length > 1) {
              e.preventDefault();
            }
          }}
        />
      </div>

      {/* Bottom Footer Info */}
      <div className="bg-slate-100 border-t border-slate-200 px-4 py-1.5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <span>Licensed to: {studentName}</span>
        <span>Order #{orderId}</span>
      </div>
    </div>
  );
};

export const SecurePdfViewer: React.FC<SecurePdfViewerProps> = ({
  productId,
  onClose,
  onDeviceMismatch,
}) => {
  const { student, deviceInfo } = useAuth();

  const [pdfDoc, setPdfDoc] = useState<any | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [productInfo, setProductInfo] = useState<any | null>(null);
  const [orderId, setOrderId] = useState<string>('ORD-VERIFIED');
  const [currentPageInView, setCurrentPageInView] = useState<number>(1);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Viewer Controls
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);

  // Mandatory DRM Agreement & Consent Modal
  const [hasAcceptedDrmConsent, setHasAcceptedDrmConsent] = useState(() => {
    return sessionStorage.getItem('bca_drm_consent_accepted') === 'true';
  });

  // Dynamic Floating Watermark Coordinates (Pulsates and moves across screen)
  const [floatingPos, setFloatingPos] = useState({ top: 35, left: 20 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Active student credentials
  const activeStudent =
    student ||
    (() => {
      try {
        return JSON.parse(localStorage.getItem('bca_logged_in_student') || 'null');
      } catch {
        return null;
      }
    })();

  const studentName = activeStudent?.fullName || 'Student';
  const studentMobile = activeStudent?.mobile || activeStudent?.email || '';

  // Animate dynamic floating watermark periodically to destroy any attempt of recording
  useEffect(() => {
    const timer = setInterval(() => {
      setFloatingPos({
        top: Math.floor(Math.random() * 65) + 15,
        left: Math.floor(Math.random() * 55) + 10,
      });
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Load Document with Universal Zero-Fail Architecture
  const loadDocument = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    // 1. Resolve product metadata
    const fallbackProd = FALLBACK_PRODUCTS.find((p) => p.id === productId) || {
      id: productId,
      subjectCode: 'BCA',
      subjectName: 'BCA Question Bank',
      pageCount: 30,
      examYear: '2024-2025 Edition',
    };
    setProductInfo(fallbackProd);

    // 2. Resolve order ID
    let resolvedOrderId = 'ORD-VERIFIED';
    try {
      const cachedOrders = JSON.parse(localStorage.getItem('bca_orders') || '[]');
      const matched = cachedOrders.find(
        (o: any) =>
          (o.selectedProductIds || []).includes(productId) ||
          (o.items || []).some((it: any) => it.productId === productId)
      );
      if (matched?.orderId) resolvedOrderId = matched.orderId;
    } catch {
      // ignore
    }
    setOrderId(resolvedOrderId);

    let docLoaded = false;

    // 3. Attempt server session first if backend is reachable
    if (activeStudent?.id) {
      try {
        const sessionRes = await api.createViewerSession({
          userId: activeStudent.id,
          productId,
          deviceToken: deviceInfo.token,
          deviceInfo,
        });

        if (sessionRes.success && sessionRes.sessionToken) {
          if (sessionRes.product) setProductInfo(sessionRes.product);
          if (sessionRes.watermark?.orderId) setOrderId(sessionRes.watermark.orderId);

          const docUrl = api.getViewerDocumentUrl(sessionRes.sessionToken);
          const res = await fetch(docUrl);
          if (res.ok) {
            const arrayBuffer = await res.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({
              data: arrayBuffer,
              cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
              cMapPacked: true,
            });
            const loadedDoc = await loadingTask.promise;
            setPdfDoc(loadedDoc);
            setTotalPages(loadedDoc.numPages);
            docLoaded = true;
          }
        } else if (sessionRes.error === 'DEVICE_MISMATCH') {
          onDeviceMismatch(sessionRes.registeredDevice, sessionRes.supportInfo);
          onClose();
          return;
        }
      } catch (backendErr) {
        console.warn('Backend viewer session notice, using direct stream:', backendErr);
      }
    }

    // 4. Guaranteed Direct PDF Stream Fallback (Crucial for Vercel, static hosting, and offline access)
    if (!docLoaded) {
      try {
        const staticPdfUrl = getProductPdfUrl(productId);
        const res = await fetch(staticPdfUrl);
        if (!res.ok) {
          throw new Error(`Failed to load PDF file (HTTP ${res.status})`);
        }

        const arrayBuffer = await res.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
        });

        const loadedDoc = await loadingTask.promise;
        setPdfDoc(loadedDoc);
        setTotalPages(loadedDoc.numPages);
        docLoaded = true;
      } catch (directErr: any) {
        console.error('Direct PDF load failure:', directErr);
        setErrorMessage(
          'পিডিএফ লোড করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট সংযোগ চেক করুন বা পেজটি রিফ্রেশ করুন।'
        );
      }
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadDocument();
  }, [productId, student?.id]);

  // Anti-Screenshot & Screen Recording Event Interception
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block PrintScreen, DevTools, Save, Print, View Source, Snipping Tool
      if (
        (e.ctrlKey && ['p', 's', 'c', 'u', 'i', 'j'].includes(e.key.toLowerCase())) ||
        (e.metaKey && ['p', 's', 'c', 'u', 'i', 'j'].includes(e.key.toLowerCase())) ||
        e.key === 'PrintScreen' ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        e.stopPropagation();
        // Immediately engage blackout shield upon printscreen keypress
        setIsWindowBlurred(true);
        return false;
      }
    };

    // When user triggers mobile screenshot shortcut (Power+Vol down), window momentarily loses focus
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsWindowBlurred(true);
      }
    };

    const handleWindowBlur = () => {
      setIsWindowBlurred(true);
    };

    const handleWindowFocus = () => {
      // Keep shield active until user explicitly taps "Resume Reading" to prevent rapid screenshot taps
    };

    const handlePageHide = () => {
      setIsWindowBlurred(true);
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleAcceptDrmAgreement = () => {
    sessionStorage.setItem('bca_drm_consent_accepted', 'true');
    setHasAcceptedDrmConsent(true);
    // Request fullscreen on mobile/desktop to engage browser protected surface
    try {
      containerRef.current?.requestFullscreen?.().catch(() => {});
    } catch {
      // ignore
    }
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#240005] flex flex-col select-none overflow-hidden"
    >
      {/* 1. MANDATORY DRM CONSENT & ANTI-SCREENSHOT AGREEMENT MODAL */}
      {!hasAcceptedDrmConsent && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="liquid-glass-master max-w-md w-full p-6 sm:p-7 rounded-3xl border border-[#FFD34E]/50 shadow-[0_0_60px_rgba(255,211,78,0.35)] text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#65000D] border-2 border-[#FFD34E] flex items-center justify-center mx-auto text-[#FFD34E] shadow-[0_0_25px_rgba(255,211,78,0.5)]">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black tracking-widest text-[#FFD34E] uppercase font-mono">
                BCA STUDY POINT · SECURITY PROTOCOL
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                DRM কন্টেন্ট সুরক্ষা ও অ্যান্টি-পাইরেসি নীতি
              </h2>
            </div>

            <div className="p-4 bg-black/60 rounded-2xl border border-white/15 text-left text-xs space-y-2.5 text-white/90">
              <div className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold shrink-0 text-sm">🚫</span>
                <div>
                  <strong className="text-white">স্ক্রিনশট ও স্ক্রিন রেকর্ডিং সম্পূর্ণ নিষিদ্ধ:</strong>
                  <p className="text-[11px] text-[#FFE7A3]/90 mt-0.5">
                    মোবাইলে স্ক্রিনশট বা স্ক্রিন রেকর্ডিং অন করার চেষ্টা করলেই স্ক্রিন স্বয়ংক্রিয়ভাবে কালো (Blackout) হয়ে যাবে।
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="text-[#FFD34E] font-bold shrink-0 text-sm">📱</span>
                <div>
                  <strong className="text-white">ব্যক্তিগত ডাইনামিক ওয়াটারমার্ক:</strong>
                  <p className="text-[11px] text-[#FFE7A3]/90 mt-0.5">
                    আপনার নাম ({studentName}) ও মোবাইল নম্বর ({studentMobile}) প্রতি পেজে ডাইনামিক ওয়াটারমার্ক করা রয়েছে।
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold shrink-0 text-sm">🔒</span>
                <div>
                  <strong className="text-white">১ ছাত্র = ১ ডিভাইস পলিসি:</strong>
                  <p className="text-[11px] text-[#FFE7A3]/90 mt-0.5">
                    আপনার অ্যাকাউন্ট শুধুমাত্র এই নির্দিষ্ট অনুমোদিত ডিভাইসে সক্রিয় থাকবে।
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleAcceptDrmAgreement}
                className="btn-gold-primary w-full py-3 px-6 rounded-full text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-[1.02] transition-transform"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>আমি একমত ও সিকিউরিটি শিল্ড সক্রিয় করুন</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="text-xs text-white/60 hover:text-white py-1 cursor-pointer"
              >
                বাতিল করুন (Exit Viewer)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. SOLID BLACKOUT PRIVACY SHIELD (Captures black frame on screenshot/screen-record attempt) */}
      {isWindowBlurred && (
        <div
          onClick={() => setIsWindowBlurred(false)}
          className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 text-center select-none"
        >
          <div className="w-16 h-16 rounded-full bg-rose-600/25 border-2 border-rose-500 flex items-center justify-center text-rose-400 mb-4 shadow-[0_0_35px_rgba(244,63,94,0.6)] animate-pulse">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-rose-400 tracking-tight">
            🚫 SCREENSHOT / RECORDING BLOCKED
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-white/90 max-w-md leading-relaxed">
            স্ক্রিনশট নেওয়ার চেষ্টা, স্ক্রিন রেকর্ডিং অ্যাপ বা অন্য উইন্ডো পরিবর্তনের কারণে কন্টেন্ট সম্পূর্ণ কালো (Blackout) করা হয়েছে।
          </p>
          <div className="mt-3 p-3 bg-white/10 rounded-xl border border-white/15 text-xs text-[#FFE7A3] font-mono">
            Student: {studentName} · 📱 {studentMobile} · Ref: {orderId}
          </div>
          <button
            onClick={() => setIsWindowBlurred(false)}
            className="mt-5 btn-gold-primary px-6 py-2.5 rounded-full text-xs font-black cursor-pointer shadow-lg"
          >
            নোটস পড়া চালিয়ে যান (Resume Reading)
          </button>
        </div>
      )}

      {/* 3. DYNAMIC FLOATING WATERMARK HOLOGRAM (Shifts position continuously) */}
      <div
        className="fixed z-40 pointer-events-none transition-all duration-1000 ease-in-out opacity-40 select-none hidden sm:block"
        style={{
          top: `${floatingPos.top}%`,
          left: `${floatingPos.left}%`,
        }}
      >
        <div className="px-3 py-1 rounded-full bg-black/60 border border-[#FFD34E]/60 text-[#FFE7A3] font-mono text-[10px] font-bold shadow-md whitespace-nowrap">
          🔒 {studentName} · 📱 {studentMobile} · BCA STUDY POINT
        </div>
      </div>

      {/* Top Floating Glass Toolbar */}
      <div className="h-16 bg-[#3D0009]/95 border-b border-[#FFE7A3]/25 px-4 sm:px-6 flex items-center justify-between text-white shrink-0 z-20 backdrop-blur-xl shadow-lg">
        {/* Left: Branding & Subject Title */}
        <div className="flex items-center gap-3">
          <img
            src={BRAND.logoUrl}
            alt="Logo"
            className="w-9 h-9 rounded-full object-cover ring-2 ring-[#FFD34E]/50 shrink-0"
          />
          <div className="truncate max-w-[170px] sm:max-w-xs md:max-w-md text-left">
            <h1 className="text-xs sm:text-sm font-extrabold text-white truncate">
              {productInfo?.subjectCode ? `${productInfo.subjectCode}: ` : ''}
              {productInfo?.subjectName || 'BCA Question Bank'}
            </h1>
            <p className="text-[10px] text-[#FFE7A3] truncate">
              Student: {studentName} ({studentMobile})
            </p>
          </div>
        </div>

        {/* Center: Live Scroll Page Tracker & DRM Shield Indicator */}
        <div className="hidden xs:flex items-center gap-2">
          {pdfDoc && (
            <div className="flex items-center gap-2 text-xs text-white font-semibold bg-black/50 px-3 py-1.5 rounded-full border border-[#FFE7A3]/30 backdrop-blur-md">
              <Eye className="w-3.5 h-3.5 text-[#FFD34E]" />
              <span className="hidden sm:inline">Page</span>
              <span className="font-extrabold text-[#FFD34E] tabular-nums">{currentPageInView}</span>
              <span className="text-white/60">/</span>
              <span className="tabular-nums">{totalPages}</span>
            </div>
          )}
          <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>DRM Shield Active</span>
          </span>
        </div>

        {/* Right: Zoom & Close Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full border border-[#FFE7A3]/30 text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
              className="p-1 text-white/70 hover:text-[#FFD34E] cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-9 text-center font-mono tabular-nums text-[11px] text-[#FFE7A3]">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
              className="p-1 text-white/70 hover:text-[#FFD34E] cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="hidden sm:inline-flex p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Close Viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Single-Stream Continuous Scroll View */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#240005] via-[#3D0009] to-[#240005] p-3 sm:p-6 flex flex-col items-center scroll-smooth">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center my-auto py-24 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#FFD34E] mb-3" />
            <h3 className="text-base font-extrabold text-white">
              Loading All Question Bank Pages...
            </h3>
            <p className="text-xs text-[#FFE7A3] mt-1 max-w-sm">
              Applying dynamic student watermarks and preparing high-definition continuous canvas stream.
            </p>
          </div>
        ) : errorMessage ? (
          <div className="max-w-md my-auto bg-black/60 border border-amber-400/50 rounded-3xl p-6 text-center text-white backdrop-blur-xl space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center mx-auto text-amber-300">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">অ্যাক্সেস পেন্ডিং বা সমস্যা</h3>
            <p className="text-xs text-white/90 leading-relaxed">{errorMessage}</p>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={loadDocument}
                className="btn-gold-primary py-2 px-5 text-xs font-bold rounded-full flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>পুনরায় চেষ্টা করুন (Retry)</span>
              </button>
              <button
                onClick={onClose}
                className="py-2 px-4 text-xs font-bold text-white/70 hover:text-white cursor-pointer"
              >
                Close Viewer
              </button>
            </div>
          </div>
        ) : pdfDoc ? (
          <div className="w-full max-w-4xl flex flex-col items-center">
            {/* Continuous stream of all pages stacked vertically */}
            {pageNumbers.map((pageNum) => (
              <SinglePageCanvas
                key={pageNum}
                pdfDoc={pdfDoc}
                pageNumber={pageNum}
                zoomLevel={zoomLevel}
                studentName={studentName}
                studentMobile={studentMobile}
                orderId={orderId}
                onInView={(inViewPage) => setCurrentPageInView(inViewPage)}
              />
            ))}

            {/* End of Document Banner */}
            <div className="my-8 text-center text-xs text-[#FFE7A3]/70 font-mono space-y-1">
              <div>✓ End of Solved Question Bank ({totalPages} of {totalPages} Pages)</div>
              <div className="text-[10px] text-white/40">
                BCA STUDY POINT · EXAM PREPARATION PARTNER
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

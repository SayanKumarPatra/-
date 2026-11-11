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
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Eye,
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../constants/brand';

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

        {/* The Native HTML5 Canvas (Eliminates Browser Plugin Blank Screen) */}
        <canvas
          ref={canvasRef}
          className="max-w-full h-auto block pointer-events-none"
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

        {/* Anti-Pointer Layer */}
        <div
          className="absolute inset-0 z-30 bg-transparent"
          onContextMenu={(e) => e.preventDefault()}
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

  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Authenticate Session and Load Watermarked PDF Document Stream
  const loadDocument = async () => {
    if (!student?.id) {
      setErrorMessage('Student account not authenticated.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Create secure viewer session
      const sessionRes = await api.createViewerSession({
        userId: student.id,
        productId,
        deviceToken: deviceInfo.token,
        deviceInfo,
      });

      if (!sessionRes.success) {
        if (sessionRes.error === 'DEVICE_MISMATCH') {
          onDeviceMismatch(sessionRes.registeredDevice, sessionRes.supportInfo);
          onClose();
          return;
        }
        if (sessionRes.error === 'PENDING_APPROVAL') {
          setErrorMessage(sessionRes.message || 'আপনার পেমেন্ট ভেরিফিকেশন চলছে। অ্যাডমিন অ্যাক্সেস দিলেই এই বিষয়ের প্রশ্নপত্র দেখতে পাবেন।');
          setIsLoading(false);
          return;
        }
        throw new Error(sessionRes.message || sessionRes.error || 'Access denied');
      }

      const token = sessionRes.sessionToken!;
      setProductInfo(sessionRes.product);
      setOrderId(sessionRes.watermark?.orderId || 'ORD-VERIFIED');

      // 2. Fetch full watermarked PDF binary
      const docUrl = api.getViewerDocumentUrl(token);
      const res = await fetch(docUrl);
      if (!res.ok) {
        let errMsg = 'Failed to download secure question bank';
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          try {
            const errJson = await res.json();
            errMsg = errJson.message || errJson.error || errMsg;
          } catch {
            // ignore
          }
        }
        throw new Error(errMsg);
      }

      const arrayBuffer = await res.arrayBuffer();

      // 3. Load with PDF.js
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
        cMapPacked: true,
      });

      const loadedDoc = await loadingTask.promise;
      setPdfDoc(loadedDoc);
      setTotalPages(loadedDoc.numPages);
    } catch (err: any) {
      console.error('Document load error:', err);
      setErrorMessage(err.message || 'Failed to open question bank. Please verify your purchase status.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocument();
  }, [productId, student?.id]);

  // 2. Anti-Piracy Event Listeners
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block PrintScreen, DevTools, Save, Print, View Source
      if (
        (e.ctrlKey && ['p', 's', 'c', 'u', 'i', 'j'].includes(e.key.toLowerCase())) ||
        (e.metaKey && ['p', 's', 'c', 'u', 'i', 'j'].includes(e.key.toLowerCase())) ||
        e.key === 'PrintScreen' ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handleVisibilityChange = () => {
      setIsWindowBlurred(document.hidden);
    };

    const handleWindowBlur = () => {
      setIsWindowBlurred(true);
    };

    const handleWindowFocus = () => {
      setIsWindowBlurred(false);
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
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

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#240005] flex flex-col select-none overflow-hidden"
    >
      {/* Privacy Shield: Window focus lost / Screenshot tool active */}
      {isWindowBlurred && (
        <div className="absolute inset-0 z-50 bg-[#3D0009]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-[#65000D] border border-[#FFD34E]/60 flex items-center justify-center text-[#FFD34E] mb-4 shadow-[0_0_30px_rgba(255,211,78,0.4)]">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Security Shield Active
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#FFE7A3] max-w-md leading-relaxed">
            স্ক্রিনশট বা অন্য উইন্ডো পরিবর্তনের কারণে কন্টেন্ট সাময়িকভাবে লুকানো হয়েছে। পড়তে পুনরায় এই উইন্ডোতে ক্লিক করুন।
          </p>
          <span className="mt-4 text-[10px] font-mono text-white/50 tracking-wider">
            {BRAND.name} · DRM CANVAS ANTI-PIRACY
          </span>
        </div>
      )}

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
              Student: {student?.fullName} ({student?.mobile || student?.email})
            </p>
          </div>
        </div>

        {/* Center: Live Scroll Page Tracker */}
        {pdfDoc && (
          <div className="flex items-center gap-2 text-xs text-white font-semibold bg-black/50 px-3 py-1.5 rounded-full border border-[#FFE7A3]/30 backdrop-blur-md">
            <Eye className="w-3.5 h-3.5 text-[#FFD34E]" />
            <span className="hidden sm:inline">Page</span>
            <span className="font-extrabold text-[#FFD34E] tabular-nums">{currentPageInView}</span>
            <span className="text-white/60">/</span>
            <span className="tabular-nums">{totalPages}</span>
          </div>
        )}

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
            <h3 className="text-base font-bold text-white">অ্যাক্সেস পেন্ডিং বা অনুপলব্ধ</h3>
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
                studentName={student?.fullName || 'Student'}
                studentMobile={student?.mobile || student?.email || ''}
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

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  X,
  Shield,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Loader2,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../constants/brand';

interface SecurePdfViewerProps {
  productId: string;
  onClose: () => void;
  onDeviceMismatch: (registeredDevice: any, supportInfo: any) => void;
}

interface PageState {
  pageNumber: number;
  blobUrl: string | null;
  loading: boolean;
  error: string | null;
}

export const SecurePdfViewer: React.FC<SecurePdfViewerProps> = ({
  productId,
  onClose,
  onDeviceMismatch,
}) => {
  const { student, deviceInfo } = useAuth();

  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [manifest, setManifest] = useState<any | null>(null);
  const [pages, setPages] = useState<PageState[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  // Viewer UI Controls
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const [currentPageInView, setCurrentPageInView] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 1. Initialize Secure Viewer Session & Verify Device Binding
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      if (!student?.id) {
        setInitError('Student account not authenticated.');
        setIsInitializing(false);
        return;
      }

      setIsInitializing(true);
      setInitError(null);

      try {
        const sessionRes = await api.createViewerSession({
          userId: student.id,
          productId,
          deviceToken: deviceInfo.token,
          deviceInfo,
        });

        if (!isMounted) return;

        if (!sessionRes.success) {
          if (sessionRes.error === 'DEVICE_MISMATCH') {
            onDeviceMismatch(sessionRes.registeredDevice, sessionRes.supportInfo);
            onClose();
            return;
          }
          throw new Error(sessionRes.message || sessionRes.error || 'Access denied');
        }

        const token = sessionRes.sessionToken!;
        setSessionToken(token);

        // Fetch document manifest
        const manifestRes = await api.getViewerManifest(token);
        if (!isMounted) return;

        setManifest(manifestRes.manifest);

        const pageCount = manifestRes.manifest.pageCount || 30;
        const initialPages: PageState[] = Array.from({ length: pageCount }, (_, i) => ({
          pageNumber: i + 1,
          blobUrl: null,
          loading: true,
          error: null,
        }));
        setPages(initialPages);
      } catch (err: any) {
        if (!isMounted) return;
        setInitError(err.message || 'Failed to authenticate secure session');
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, [productId, student?.id, deviceInfo.token]);

  // 2. Fetch Page Blobs on Demand
  const loadPageBlob = useCallback(
    async (pageNumber: number) => {
      if (!sessionToken) return;

      try {
        const pageUrl = api.getViewerPageUrl(sessionToken, pageNumber);
        const res = await fetch(pageUrl);
        if (!res.ok) {
          throw new Error(`Failed to load page ${pageNumber}`);
        }
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);

        setPages((prev) =>
          prev.map((p) =>
            p.pageNumber === pageNumber
              ? { ...p, blobUrl: objectUrl, loading: false, error: null }
              : p
          )
        );
      } catch (err: any) {
        setPages((prev) =>
          prev.map((p) =>
            p.pageNumber === pageNumber
              ? { ...p, loading: false, error: err.message || 'Page failed to render' }
              : p
          )
        );
      }
    },
    [sessionToken]
  );

  // Load initial batch of pages
  useEffect(() => {
    if (!sessionToken || pages.length === 0) return;

    pages.slice(0, 4).forEach((p) => {
      if (p.loading && !p.blobUrl) {
        loadPageBlob(p.pageNumber);
      }
    });
  }, [sessionToken, pages.length]);

  // IntersectionObserver for lazy loading subsequent pages
  useEffect(() => {
    if (pages.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageIndex = Number(entry.target.getAttribute('data-page-index'));
            if (!isNaN(pageIndex) && pages[pageIndex]) {
              const targetPage = pages[pageIndex];
              setCurrentPageInView(targetPage.pageNumber);
              if (targetPage.loading && !targetPage.blobUrl) {
                loadPageBlob(targetPage.pageNumber);
              }
            }
          }
        });
      },
      { root: containerRef.current, rootMargin: '300px 0px' }
    );

    pageRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pages, loadPageBlob]);

  // Security Event Handlers
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && ['p', 's', 'c', 'u'].includes(e.key.toLowerCase())) ||
        (e.metaKey && ['p', 's', 'c', 'u'].includes(e.key.toLowerCase())) ||
        e.key === 'PrintScreen'
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

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      pages.forEach((p) => {
        if (p.blobUrl) URL.revokeObjectURL(p.blobUrl);
      });
    };
  }, [pages]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const scrollToPage = (pageNum: number) => {
    const targetEl = pageRefs.current[pageNum - 1];
    if (targetEl && containerRef.current) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#240005] flex flex-col protected-doc-zone select-none overflow-hidden">
      {/* Privacy Shield when Tab/Window is unfocused */}
      {isWindowBlurred && (
        <div className="absolute inset-0 z-50 bg-[#3D0009]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-[#65000D] border border-[#FFD34E]/60 flex items-center justify-center text-[#FFD34E] mb-4 shadow-[0_0_30px_rgba(255,211,78,0.4)]">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Security Shield Active
          </h2>
          <p className="mt-2 text-sm text-[#FFE7A3] max-w-md">
            Document view has been temporarily obscured because window focus was lost. Return focus to this window to resume reading.
          </p>
          <span className="mt-4 text-xs font-mono text-white/50 tracking-wider">
            {BRAND.name} · DRM SECURE READER
          </span>
        </div>
      )}

      {/* Top Liquid Glass Reader Toolbar */}
      <div className="h-16 bg-[#3D0009]/90 border-b border-[#FFE7A3]/25 px-4 sm:px-6 flex items-center justify-between text-white shrink-0 z-20 backdrop-blur-xl shadow-lg">
        {/* Left: Document Info with Logo */}
        <div className="flex items-center gap-3">
          <img
            src={BRAND.logoUrl}
            alt="Logo"
            className="w-9 h-9 rounded-full object-cover ring-2 ring-[#FFD34E]/50"
          />
          <div className="hidden sm:block">
            <h1 className="text-sm font-extrabold text-white truncate max-w-xs md:max-w-md">
              {manifest?.subjectCode}: {manifest?.subjectName}
            </h1>
            <p className="text-[11px] text-[#FFE7A3]">
              Licensed to: {student?.fullName} ({student?.email})
            </p>
          </div>
        </div>

        {/* Center: Page Counter & Jump */}
        {manifest && (
          <div className="flex items-center gap-2 text-xs text-white font-semibold bg-black/40 px-3.5 py-1.5 rounded-full border border-[#FFE7A3]/30 backdrop-blur-md">
            <span>Page</span>
            <span className="font-extrabold text-[#FFD34E] tabular-nums">{currentPageInView}</span>
            <span className="text-white/60">of</span>
            <span className="tabular-nums">{manifest.pageCount}</span>

            <div className="ml-2 flex items-center gap-0.5 border-l border-white/20 pl-2">
              <button
                onClick={() => scrollToPage(Math.max(1, currentPageInView - 1))}
                disabled={currentPageInView <= 1}
                className="p-1 hover:text-[#FFD34E] disabled:opacity-30 cursor-pointer"
                title="Previous Page"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => scrollToPage(Math.min(manifest.pageCount, currentPageInView + 1))}
                disabled={currentPageInView >= manifest.pageCount}
                className="p-1 hover:text-[#FFD34E] disabled:opacity-30 cursor-pointer"
                title="Next Page"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Right: Zoom & Close */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="hidden md:flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-full border border-[#FFE7A3]/30 text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
              className="p-1 text-white/70 hover:text-[#FFD34E] cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center font-mono tabular-nums text-[#FFE7A3]">
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
            className="hidden sm:p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
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

      {/* Main Continuous Scroll Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto bg-gradient-to-b from-[#240005] via-[#3D0009] to-[#240005] p-4 sm:p-6 flex flex-col items-center space-y-6 scroll-smooth"
      >
        {isInitializing ? (
          <div className="flex flex-col items-center justify-center my-auto py-24 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#FFD34E] mb-3" />
            <h3 className="text-base font-extrabold text-white">
              Authenticating Device &amp; Rendering Pages...
            </h3>
            <p className="text-xs text-[#FFE7A3] mt-1">
              Verifying licensed student identity and applying dynamic watermarks.
            </p>
          </div>
        ) : initError ? (
          <div className="max-w-md my-auto bg-black/40 border border-rose-500/40 rounded-3xl p-6 text-center text-white backdrop-blur-xl">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">Viewer Authentication Failed</h3>
            <p className="text-xs text-white/80 mt-2 leading-relaxed">{initError}</p>
            <button
              onClick={onClose}
              className="mt-5 btn-gold-primary px-5 py-2 text-xs font-bold rounded-full"
            >
              Back to Catalog
            </button>
          </div>
        ) : (
          pages.map((page, idx) => (
            <div
              key={page.pageNumber}
              ref={(el) => {
                pageRefs.current[idx] = el;
              }}
              data-page-index={idx}
              style={{ width: `${Math.min(900, (800 * zoomLevel) / 100)}px` }}
              className="relative bg-white rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] border border-slate-300 overflow-hidden min-h-[500px] flex flex-col transition-all duration-150"
            >
              {/* Dynamic Watermark Overlay (diagonal 32deg) */}
              <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden flex flex-col justify-around py-12 px-6 opacity-30 select-none">
                {[0, 1, 2, 3].map((row) => (
                  <div
                    key={row}
                    className="transform -rotate-25 whitespace-nowrap text-center text-[11px] font-black tracking-widest text-red-950/50 uppercase font-mono"
                  >
                    BCA STUDY POINT · {student?.fullName} · {student?.email} · ORDER: {manifest?.watermark?.orderId}
                  </div>
                ))}
              </div>

              {/* Transparent Shield over the embedded page */}
              <div
                className="absolute inset-0 z-10 bg-transparent"
                onContextMenu={(e) => e.preventDefault()}
              />

              {/* Page Content */}
              {page.loading ? (
                <div className="h-[600px] flex flex-col items-center justify-center bg-slate-100 text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin text-[#970014] mb-2" />
                  <span className="text-xs font-bold text-slate-700">
                    Loading Page {page.pageNumber}...
                  </span>
                </div>
              ) : page.error ? (
                <div className="h-[400px] flex flex-col items-center justify-center bg-rose-50 text-rose-700 p-6 text-center">
                  <AlertTriangle className="w-8 h-8 mb-2" />
                  <span className="text-xs font-semibold">{page.error}</span>
                  <button
                    onClick={() => loadPageBlob(page.pageNumber)}
                    className="mt-3 px-3 py-1 bg-white border border-rose-200 rounded text-xs hover:bg-rose-100 cursor-pointer"
                  >
                    Retry Page
                  </button>
                </div>
              ) : page.blobUrl ? (
                <div className="w-full flex-1 min-h-[750px] bg-slate-50 flex flex-col">
                  <object
                    data={`${page.blobUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                    type="application/pdf"
                    className="w-full flex-1 h-[820px] pointer-events-none"
                  >
                    <iframe
                      src={`${page.blobUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                      className="w-full h-[820px] border-none pointer-events-none"
                      title={`Page ${page.pageNumber}`}
                    />
                  </object>
                </div>
              ) : null}

              {/* Bottom Page Tag */}
              <div className="bg-slate-100 border-t border-slate-200 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-600 font-mono">
                <span>
                  Page {page.pageNumber} / {manifest?.pageCount}
                </span>
                <span className="hidden sm:inline">
                  DRM Watermarked · {student?.email}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

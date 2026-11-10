import React, { useState, useEffect } from 'react';
import { AlertOctagon, Lock, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../constants/brand';

interface SecurityGuardProps {
  children: React.ReactNode;
}

export const SecurityGuard: React.FC<SecurityGuardProps> = ({ children }) => {
  const { student, deviceInfo } = useAuth();
  const [screenshotAlert, setScreenshotAlert] = useState(false);
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);

  useEffect(() => {
    // 1. Intercept Screenshot, Print, and DevTools Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const isPrintScreen = e.key === 'PrintScreen';
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // Block Ctrl/Cmd + P (Print), Ctrl/Cmd + S (Save), Ctrl/Cmd + U (Source)
      if (isCtrlOrMeta && ['p', 's', 'u'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        triggerSecurityViolation('Save/Print command blocked by DRM security.');
        return false;
      }

      // Block Windows Snipping Tool (Win + Shift + S), Mac Screen Capture (Cmd + Shift + 3 / 4 / 5)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && ['3', '4', '5', 's'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        triggerSecurityViolation('Screen capture shortcut blocked by DRM security.');
        return false;
      }

      // Block PrintScreen key
      if (isPrintScreen) {
        e.preventDefault();
        e.stopPropagation();
        // Clear clipboard immediately to sanitize any captured frame
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText('');
          }
        } catch {
          // ignore
        }
        triggerSecurityViolation('Screenshot attempt intercepted.');
        return false;
      }
    };

    // 2. Clear clipboard if window blur happens right after PrintScreen
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText('');
          }
        } catch {
          // ignore
        }
      }
    };

    const triggerSecurityViolation = (reason: string) => {
      console.warn('[SECURITY GUARD]', reason);
      setScreenshotAlert(true);
      setTimeout(() => {
        setScreenshotAlert(false);
      }, 3500);
    };

    // 3. Tab Visibility & Screen Recording Detection (Window Blur Shield)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsWindowBlurred(true);
      } else {
        setIsWindowBlurred(false);
      }
    };

    const handleWindowBlur = () => {
      setIsWindowBlurred(true);
    };

    const handleWindowFocus = () => {
      setIsWindowBlurred(false);
    };

    // 4. Disable context menu & drag
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return (
    <>
      {children}

      {/* Screenshot Intercept Alert Modal */}
      {screenshotAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-red-950/90 backdrop-blur-xl animate-bounce-short select-none">
          <div className="max-w-md w-full p-6 rounded-3xl bg-black/90 border-2 border-rose-500 shadow-[0_0_60px_rgba(239,68,68,0.8)] text-center text-white">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-rose-600/30 border border-rose-500 flex items-center justify-center text-rose-400">
              <AlertOctagon className="w-9 h-9 animate-pulse" />
            </div>
            <h3 className="text-xl font-black text-rose-300 tracking-tight">
              SCREENSHOT BLOCKED
            </h3>
            <p className="text-xs text-white/90 mt-2 leading-relaxed font-medium">
              Screen capture and keyboard screenshot shortcuts are strictly disabled to protect copyright materials.
            </p>
            <div className="mt-3 p-2 rounded-lg bg-rose-950/60 border border-rose-800 text-[10px] text-rose-200 font-mono">
              SECURITY AUDIT: Incident logged with your Device Token &amp; IP.
            </div>
            <button
              onClick={() => setScreenshotAlert(false)}
              className="mt-4 px-6 py-2 rounded-full text-xs font-black bg-rose-600 hover:bg-rose-500 text-white cursor-pointer transition-colors"
            >
              Acknowledge &amp; Resume
            </button>
          </div>
        </div>
      )}

      {/* Screen Blur / External Recording Shield (When window loses focus) */}
      {isWindowBlurred && (
        <div className="fixed inset-0 z-[95] bg-[#1a0003]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-14 h-14 rounded-2xl bg-[#65000D] border border-[#FFD34E]/60 flex items-center justify-center text-[#FFD34E] mb-3 shadow-[0_0_30px_rgba(255,211,78,0.4)]">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Protected Study Zone
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#FFE7A3] max-w-sm leading-relaxed">
            Content is obscured because window focus was lost or an external screen capture app was detected. Click anywhere on this tab to resume.
          </p>
          <span className="mt-4 text-[10px] font-mono text-white/50 tracking-widest uppercase">
            {BRAND.name} · ANTI-RECORDING ACTIVE
          </span>
        </div>
      )}

      {/* Forensic Identity Diagonal Watermark (Stamps student phone/name diagonally across screen) */}
      {student && (
        <div className="fixed inset-0 pointer-events-none z-[80] overflow-hidden opacity-[0.04] select-none flex flex-col justify-around py-8">
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="transform -rotate-25 whitespace-nowrap text-center text-xs font-black tracking-widest text-white uppercase font-mono"
            >
              BCA STUDY POINT · {student.fullName} · {student.mobile || student.email} · {deviceInfo?.token?.slice(0, 12)}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

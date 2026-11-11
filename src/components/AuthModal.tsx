import React, { useState } from 'react';
import { X, Lock, Mail, Phone, User, ArrowLeft, ShieldAlert, Smartphone, Clock, Globe, Copy, Check, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../constants/brand';

import { api } from '../services/api';
import { auth, googleProvider } from '../firebase/firebase';
import { signInWithPopup } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultIsRegister?: boolean;
  onSuccess?: () => void;
  isPage?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultIsRegister = false,
  onSuccess,
  isPage = false,
}) => {
  const { loginStudent, deviceInfo } = useAuth();
  const [isRegister, setIsRegister] = useState(defaultIsRegister);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [error, setError] = useState('');
  const [blockedActiveDevice, setBlockedActiveDevice] = useState<any>(null);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError('');
    setBlockedActiveDevice(null);
    setUnauthorizedDomain(null);
    setIsLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        const cleanMobile = res.user.phoneNumber?.replace(/\D/g, '') || '';
        const userEmail = res.user.email || `${res.user.uid}@student.bcastudypoint.com`;
        const userName = res.user.displayName || userEmail.split('@')[0] || 'BCA Student';

        // Verify and bind on server with 1-device policy
        const loginRes = await api.googleLogin({
          email: userEmail,
          fullName: userName,
          googleUid: res.user.uid,
          photoUrl: res.user.photoURL || undefined,
          deviceInfo,
        });

        loginStudent({
          id: loginRes.student.id,
          email: loginRes.student.email,
          fullName: loginRes.student.fullName,
          mobile: loginRes.student.mobile || cleanMobile,
          collegeName: loginRes.student.collegeName,
        });

        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      console.warn('Google sign in note:', err);
      // If server rejected because another device is actively logged in
      if (err.errorCode === 'DEVICE_ALREADY_ACTIVE' || err.activeDevice) {
        await auth.signOut().catch(() => {});
        setBlockedActiveDevice(err.activeDevice || true);
        setError(err.message || 'আপনার অ্যাকাউন্টটি ইতিমধ্যে অন্য একটি ডিভাইসে সক্রিয় রয়েছে।');
      } else if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'bcastudypoint.vercel.app';
        setUnauthorizedDomain(currentHost);
        setError(`Google Sign-in চালু করতে Firebase Console-এ ডোমেইনটি যুক্ত করতে হবে।`);
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Google Sign-In বাতিল হয়েছে। প্রয়োজনে নীচের ফর্মের সাহায্যে লগইন করুন।');
      } else {
        setError(err.message || 'Google Sign-in সম্পন্ন করা যায়নি। আপনি নাম ও মোবাইল দিয়ে লগইন করতে পারেন।');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBlockedActiveDevice(null);

    const cleanMobile = mobile.replace(/\D/g, '');

    if (isRegister) {
      if (!fullName.trim() || fullName.trim().length < 2) {
        setError('দয়া করে আপনার সম্পূর্ণ নাম লিখুন।');
        return;
      }
      if (cleanMobile.length < 10) {
        setError('দয়া করে একটি সঠিক ১০ সংখ্যার মোবাইল নম্বর লিখুন।');
        return;
      }

      setIsLoading(true);
      try {
        const cleanEmail = email.trim();
        const effectiveEmail = cleanEmail || `${cleanMobile}@student.bcastudypoint.com`;

        const regRes = await api.studentRegister({
          fullName: fullName.trim(),
          email: effectiveEmail,
          mobile: cleanMobile,
          collegeName: collegeName.trim() || undefined,
          deviceInfo,
        });

        loginStudent({
          id: regRes.student.id,
          fullName: regRes.student.fullName,
          email: regRes.student.email,
          mobile: regRes.student.mobile,
          collegeName: regRes.student.collegeName,
        });

        if (onSuccess) onSuccess();
        onClose();
      } catch (err: any) {
        setError(err.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে। অন্য মোবাইল নম্বর দিয়ে চেষ্টা করুন।');
      } finally {
        setIsLoading(false);
      }
    } else {
      // SIGN IN MODE: Verify existing registered student & enforce single device
      const identifier = email.trim();
      if (!identifier) {
        setError('দয়া করে আপনার রেজিস্টার্ড ইমেইল বা ১০ সংখ্যার মোবাইল নম্বর লিখুন।');
        return;
      }

      setIsLoading(true);
      try {
        const loginRes = await api.studentLogin(identifier, deviceInfo);

        loginStudent({
          id: loginRes.student.id,
          fullName: loginRes.student.fullName,
          email: loginRes.student.email,
          mobile: loginRes.student.mobile,
          collegeName: loginRes.student.collegeName,
        });

        if (onSuccess) onSuccess();
        onClose();
      } catch (err: any) {
        if (err.errorCode === 'DEVICE_ALREADY_ACTIVE' || err.activeDevice) {
          setBlockedActiveDevice(err.activeDevice || true);
          setError(err.message || 'আপনার অ্যাকাউন্টটি ইতিমধ্যে অন্য একটি ডিভাইসে সক্রিয় রয়েছে।');
        } else {
          setError(err.message || 'এই ইমেইল বা মোবাইল নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি। দয়া করে প্রথমে "Register" করুন।');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div
      className={
        isPage
          ? 'min-h-[85vh] flex flex-col items-center justify-center p-4 py-8'
          : 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto'
      }
    >
      {isPage && (
        <div className="w-full max-w-sm mb-4">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs text-[#FFE7A3] hover:text-white px-3.5 py-1.5 rounded-full bg-black/40 border border-[#FFE7A3]/30 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Website</span>
          </button>
        </div>
      )}
      <div className="liquid-glass-master rounded-3xl max-w-sm w-full p-6 sm:p-7 border border-[#FFE7A3]/30 shadow-[0_25px_60px_rgba(0,0,0,0.85)] relative my-auto">
        {/* Top Rim Specular Line */}
        <div className="absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FFD34E]/60 to-transparent pointer-events-none" />

        {!isPage && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Logo & Title */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-3">
            <img
              src={BRAND.logoUrl}
              alt="Official Logo"
              className="w-16 h-16 rounded-full object-cover mx-auto ring-2 ring-[#FFD34E] shadow-[0_0_20px_rgba(255,211,78,0.4)]"
            />
            <div className="absolute inset-0 rounded-full ring-1 ring-white/40 pointer-events-none" />
          </div>

          <h2 className="text-xl font-extrabold text-white tracking-tight">
            {isRegister ? 'Student Registration' : 'Student Sign In'}
          </h2>
          <p className="text-xs text-[#FFE7A3] mt-0.5">
            Access your purchased BCA question banks
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-black/40 p-1 rounded-xl text-xs font-bold mb-5 border border-white/10">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              !isRegister
                ? 'btn-gold-primary shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              isRegister
                ? 'btn-gold-primary shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Google 1-Click Sign-In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full mb-3.5 py-2.5 px-3 bg-white text-gray-900 rounded-full font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{isLoading ? 'Connecting Google...' : 'Continue with Google'}</span>
        </button>

        {/* Guided instructions if domain is unauthorized in Firebase */}
        {unauthorizedDomain && (
          <div className="mb-4 p-3.5 bg-amber-950/90 border border-amber-500/70 rounded-2xl text-left text-xs text-amber-100 shadow-[0_10px_25px_rgba(0,0,0,0.6)] space-y-2.5">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Google Sign-in ডোমেইন অনুমোদন</span>
              </div>
              <button
                type="button"
                onClick={() => setUnauthorizedDomain(null)}
                className="text-white/40 hover:text-white p-0.5"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-white/90 leading-relaxed">
              Google Auth পলিসি অনুযায়ী আপনার লাইভ সাইটের ডোমেইনটি Firebase Console-এ যোগ করতে হবে:
            </p>

            <div className="bg-black/60 p-2 rounded-xl border border-white/10 flex items-center justify-between gap-2">
              <div className="truncate">
                <span className="text-[9px] text-white/50 block">যোগ করার ডোমেইন:</span>
                <code className="text-xs text-[#FFD34E] font-mono font-bold">{unauthorizedDomain}</code>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(unauthorizedDomain);
                  setCopiedDomain(true);
                  setTimeout(() => setCopiedDomain(false), 2500);
                }}
                className="px-2.5 py-1 bg-white/15 hover:bg-white/25 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
              >
                {copiedDomain ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedDomain ? 'কপি হয়েছে' : 'Copy'}</span>
              </button>
            </div>

            <div className="text-[10px] text-white/80 space-y-1">
              <p className="font-bold text-amber-300">১ মিনিটে কীভাবে ডোমেইন যোগ করবেন:</p>
              <p>১. নীচের বাটনে ক্লিক করে Firebase Authentication Settings খুলুন।</p>
              <p>২. <strong>Authorized domains</strong> সেকশনে গিয়ে <strong>Add domain</strong> চাপুন।</p>
              <p>৩. কপি করা <code>{unauthorizedDomain}</code> পেস্ট করে <strong>Save</strong> করুন।</p>
            </div>

            <div className="pt-1 flex items-center gap-2">
              <a
                href="https://console.firebase.google.com/project/bcastudypoint-cdfdf/authentication/settings"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-[#FFD34E] text-black font-extrabold text-xs rounded-xl shadow-md hover:bg-[#FFE7A3] transition-colors"
              >
                <span>Firebase Console সেটিংস খুলুন</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-[10px] text-[#FFE7A3]/90 text-center pt-1 border-t border-white/10">
              💡 কোনো ডোমেইন সেটিংস ছাড়াও সরাসরি নীচের মোবাইল নম্বর দিয়ে অবিলম্বে লগইন/রেজিস্টার করতে পারবেন।
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 mb-3.5">
          <div className="flex-1 h-px bg-white/15" />
          <span className="text-[10px] text-white/50 uppercase font-bold">
            {isRegister ? 'Or with Name & Mobile' : 'Or with Email / Mobile'}
          </span>
          <div className="flex-1 h-px bg-white/15" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && !unauthorizedDomain && (
            <div className="p-3.5 bg-rose-950/90 border border-rose-500/60 rounded-xl text-xs text-rose-200 text-left space-y-2 shadow-lg">
              {blockedActiveDevice ? (
                <div>
                  <div className="flex items-center gap-2 text-amber-300 font-bold mb-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-sm">অন্য ডিভাইসে সক্রিয় রয়েছে!</span>
                  </div>
                  <p className="text-xs text-white/95 leading-relaxed">
                    আপনার এই অ্যাকাউন্টে ইতিমধ্যেই অন্য একটি ডিভাইসে লগইন রয়েছে। নিরাপত্তা নিশ্চিত করতে একসাথে কেবল <strong>১টি ডিভাইসে</strong> অ্যাক্সেস অনুমোদিত।
                  </p>

                  {typeof blockedActiveDevice === 'object' && blockedActiveDevice.os && (
                    <div className="mt-2.5 p-2 bg-black/50 border border-white/10 rounded-lg text-[11px] text-white/80 space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-200 font-semibold">
                        <Smartphone className="w-3.5 h-3.5 text-amber-300" />
                        <span>বর্তমানে সক্রিয় ডিভাইস: {blockedActiveDevice.os} ({blockedActiveDevice.browser || 'Browser'})</span>
                      </div>
                      {blockedActiveDevice.lastSeenAt && (
                        <div className="flex items-center gap-1.5 text-white/60 text-[10px]">
                          <Clock className="w-3 h-3 text-white/40" />
                          <span>সর্বশেষ সক্রিয়: {new Date(blockedActiveDevice.lastSeenAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-2.5 pt-2 border-t border-rose-500/30 text-[11px] text-[#FFE7A3]">
                    <p className="font-semibold text-amber-300">কীভাবে এই ডিভাইসে লগইন করবেন?</p>
                    <p className="text-white/80 mt-0.5">
                      ১. আপনার আগের ফোন বা কম্পিউটার থেকে <strong>Logout</strong> বাটনে ক্লিক করুন।<br/>
                      ২. এরপর এখানে আবার লগইন করলে সাথে সাথে খুলে যাবে।
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <p>{error}</p>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegister(true);
                        setError('');
                        const clean = email.trim();
                        if (/^\d{10}$/.test(clean)) {
                          setMobile(clean);
                          setEmail('');
                        }
                      }}
                      className="mt-2 text-xs font-bold text-[#FFD34E] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>👉 এখানে ক্লিক করে ১ মিনিটে অ্যাকাউন্ট রেজিস্টার করুন</span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-white mb-1">
                Full Name <span className="text-[#FFD34E]">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-white/50 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#FFD34E]"
                />
              </div>
            </div>
          )}

          {isRegister ? (
            <div>
              <label className="block text-xs font-bold text-white mb-1">
                Mobile / WhatsApp Number <span className="text-[#FFD34E]">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-white/50 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="9876543210"
                  maxLength={10}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#FFD34E]"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-white mb-1">
                Registered Email or 10-Digit Mobile
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-white/50 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@gmail.com or 9876543210"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#FFD34E]"
                />
              </div>
            </div>
          )}

          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  Email Address <span className="text-white/40 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-white/50 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@gmail.com (Optional)"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#FFD34E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  College Name <span className="text-white/40">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="e.g. Guru Gobind Singh IPU"
                  className="w-full px-3 py-2 text-xs bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#FFD34E]"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn-gold-primary w-full py-2.5 px-4 text-xs font-extrabold rounded-full cursor-pointer shadow-[0_6px_20px_rgba(255,211,78,0.35)] mt-3"
          >
            {isRegister ? 'Create Account & Continue' : 'Sign In Now'}
          </button>
        </form>

        <p className="text-[10px] text-[#FFE7A3]/70 text-center mt-4">
          One device binding policy automatically attaches to this active device.
        </p>
      </div>
    </div>
  );
};

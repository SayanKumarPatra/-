import React, { useState } from 'react';
import { X, Lock, Mail, Phone, User } from 'lucide-react';
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
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultIsRegister = false,
  onSuccess,
}) => {
  const { loginStudent } = useAuth();
  const [isRegister, setIsRegister] = useState(defaultIsRegister);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        // Register or retrieve user in server db
        const cleanMobile = res.user.phoneNumber?.replace(/\D/g, '') || '';
        const userEmail = res.user.email || `${res.user.uid}@student.bcastudypoint.com`;
        const userName = res.user.displayName || userEmail.split('@')[0] || 'BCA Student';

        loginStudent({
          id: res.user.uid,
          email: userEmail,
          fullName: userName,
          mobile: cleanMobile,
        });

        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      console.warn('Google sign in note:', err);
      if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        setError('Google Sign-in ডোমেইন ফায়ারবেসে কনফিগার করা নেই। আপনি সরাসরি নীচের মোবাইল নম্বর বা ইমেইল দিয়ে রেজিস্টার করতে পারেন।');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Google Sign-In বাতিল হয়েছে। প্রয়োজনে নীচের ফর্মের সাহায্যে রেজিস্টার করুন।');
      } else {
        setError(err.message || 'Google Sign-in সম্পন্ন করা যায়নি। আপনি নাম ও মোবাইল দিয়ে রেজিস্টার করতে পারেন।');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
      // SIGN IN MODE: Must verify existing registered student
      const identifier = email.trim();
      if (!identifier) {
        setError('দয়া করে আপনার রেজিস্টার্ড ইমেইল বা ১০ সংখ্যার মোবাইল নম্বর লিখুন।');
        return;
      }

      setIsLoading(true);
      try {
        const loginRes = await api.studentLogin(identifier);

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
        setError(err.message || 'এই ইমেইল বা মোবাইল নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি। দয়া করে প্রথমে "Register" করুন।');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="liquid-glass-master rounded-3xl max-w-sm w-full p-6 sm:p-7 border border-[#FFE7A3]/30 shadow-[0_25px_60px_rgba(0,0,0,0.85)] relative">
        {/* Top Rim Specular Line */}
        <div className="absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FFD34E]/60 to-transparent pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

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

        <div className="flex items-center gap-2 mb-3.5">
          <div className="flex-1 h-px bg-white/15" />
          <span className="text-[10px] text-white/50 uppercase font-bold">
            {isRegister ? 'Or with Name & Mobile' : 'Or with Email / Mobile'}
          </span>
          <div className="flex-1 h-px bg-white/15" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="p-2.5 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-200">
              {error}
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

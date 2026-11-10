import React, { useState } from 'react';
import { X, Lock, Mail, Phone, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../constants/brand';

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }

    if (isRegister) {
      if (!fullName.trim() || fullName.trim().length < 2) {
        setError('Please enter your full name.');
        return;
      }
      const cleanMobile = mobile.replace(/\D/g, '');
      if (cleanMobile.length < 10) {
        setError('Please enter a valid 10-digit mobile number.');
        return;
      }
    }

    loginStudent({
      email: email.trim().toLowerCase(),
      fullName: fullName.trim() || email.split('@')[0],
      mobile: mobile.replace(/\D/g, ''),
      collegeName: collegeName.trim() || undefined,
    });

    if (onSuccess) onSuccess();
    onClose();
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="p-2.5 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-200">
              {error}
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-white mb-1">
                Full Name
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

          <div>
            <label className="block text-xs font-bold text-white mb-1">
              Registered Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-white/50 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@gmail.com"
                className="w-full pl-9 pr-3 py-2 text-xs bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#FFD34E]"
              />
            </div>
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  Mobile Number
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

import React from 'react';
import { ShieldAlert, Laptop, Mail, HelpCircle } from 'lucide-react';
import { BRAND } from '../constants/brand';

interface DeviceLockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  registeredDevice: any;
  supportInfo: any;
}

export const DeviceLockedModal: React.FC<DeviceLockedModalProps> = ({
  isOpen,
  onClose,
  registeredDevice,
  supportInfo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="liquid-glass-master rounded-3xl max-w-md w-full border border-[#FFE7A3]/30 shadow-[0_25px_60px_rgba(0,0,0,0.85)] p-6 sm:p-7 text-center relative">
        {/* Top Rim Specular Line */}
        <div className="absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FFD34E]/60 to-transparent pointer-events-none" />

        <div className="w-16 h-16 rounded-full bg-[#FFD34E]/20 border border-[#FFD34E] flex items-center justify-center mx-auto text-[#FFD34E] mb-4 shadow-[0_0_20px_rgba(255,211,78,0.3)]">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-extrabold text-white tracking-tight">
          Account Bound to Another Device
        </h2>

        <p className="mt-2 text-xs text-white/80 leading-relaxed text-balance">
          Under {BRAND.name} security policy (<strong>1 Student Account = 1 Registered Device</strong>), your purchased question banks are locked to your primary registered device to prevent unauthorized distribution.
        </p>

        {/* Registered Device Details */}
        <div className="mt-5 p-4 bg-black/35 border border-white/15 rounded-2xl text-left text-xs space-y-2">
          <div className="flex items-center gap-2 text-[#FFE7A3] font-bold mb-1 pb-1 border-b border-white/10">
            <Laptop className="w-4 h-4 text-[#FFD34E]" />
            <span>Currently Registered Device</span>
          </div>

          <div className="flex justify-between">
            <span className="text-white/60">Device / OS:</span>
            <span className="font-semibold text-white">
              {registeredDevice?.os || 'Registered Computer'}
            </span>
          </div>

          {registeredDevice?.registeredAt && (
            <div className="flex justify-between">
              <span className="text-white/60">First Activated:</span>
              <span className="font-mono text-[#FFE7A3]">
                {new Date(registeredDevice.registeredAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}

          {registeredDevice?.lastSeenAt && (
            <div className="flex justify-between">
              <span className="text-white/60">Last Seen:</span>
              <span className="font-mono text-[#FFE7A3]">
                {new Date(registeredDevice.lastSeenAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}
        </div>

        {/* Support & Admin Reset Instructions */}
        <div className="mt-5 p-3.5 bg-[#65000D]/50 border border-[#FFE7A3]/25 rounded-2xl text-left text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-[#FFE7A3]">
            <HelpCircle className="w-4 h-4 text-[#FFD34E]" />
            <span>Changed your phone or computer?</span>
          </div>
          <p className="text-[11px] text-white/80 leading-relaxed">
            Students cannot independently transfer accounts between devices. Please contact the administrator with your registered email to request an authorized device reset.
          </p>
          <div className="pt-1 flex items-center gap-1.5 text-[#FFD34E] font-mono text-[11px]">
            <Mail className="w-3.5 h-3.5 text-[#FFD34E]" />
            <span>{supportInfo?.adminEmail || 'admin@bcastudypoint.com'}</span>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-colors cursor-pointer"
          >
            I Understand &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useRef } from 'react';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Share2,
  FileText,
  Calendar,
  User,
  Phone,
  Mail,
  CreditCard,
  Building,
} from 'lucide-react';
import { BRAND } from '../constants/brand';
import { FALLBACK_PRODUCTS } from '../constants/fallbackProducts';
import type { Order } from '../types';

interface PaymentReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  // Resolve items if missing or empty
  const items = order.items && order.items.length > 0
    ? order.items
    : (order.selectedProductIds || []).map((id) => {
        const fb = FALLBACK_PRODUCTS.find((p) => p.id === id);
        return {
          productId: id,
          subjectCode: fb?.subjectCode || 'BCA',
          subjectName: fb?.subjectName || 'Question Bank',
          price: fb?.price || Math.round(order.totalAmount / (order.selectedProductIds.length || 1)),
        };
      });

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const receiptNumber = `RCPT-${order.orderId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const cleanUtr = (order.paymentReference || '').replace('upi_', '');

  const isVerified = order.paymentStatus === 'verified';

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*BCA STUDY POINT - Official Payment Receipt*\n\n` +
      `Receipt No: ${receiptNumber}\n` +
      `Order ID: ${order.orderId}\n` +
      `Student: ${order.studentName}\n` +
      `Mobile: ${order.studentMobile}\n` +
      `Amount Paid: ₹${order.totalAmount}\n` +
      `Status: ${isVerified ? 'VERIFIED & ACTIVE' : 'PENDING VERIFICATION'}\n` +
      `UTR / Ref: ${cleanUtr || 'N/A'}\n` +
      `Date: ${formattedDate}\n\n` +
      `Thank you for choosing BCA STUDY POINT!`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl my-auto bg-[#1e0206] text-white rounded-3xl border border-[#FFE7A3]/30 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Top Control Bar */}
        <div className="p-3 sm:px-6 sm:py-3.5 bg-[#3D0009] border-b border-white/10 flex items-center justify-between gap-2 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#FFD34E]" />
            <span className="text-xs sm:text-sm font-black text-white">
              Official Payment Receipt (মানি রসিদ)
            </span>
            <span className="font-mono text-[11px] text-[#FFE7A3] bg-black/40 px-2 py-0.5 rounded border border-white/10">
              {receiptNumber}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handlePrint}
              className="btn-gold-primary px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Print Receipt / Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / Save PDF</span>
              <span className="sm:hidden">Print</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
              title="Share on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div
          ref={receiptRef}
          className="p-5 sm:p-8 overflow-y-auto space-y-6 text-slate-800 bg-white print:p-6 print:m-0 print:text-black print:bg-white"
          id="printable-receipt"
        >
          {/* Receipt Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b-2 border-slate-200">
            <div className="flex items-center gap-3.5">
              <img
                src={BRAND.logoUrl}
                alt="Logo"
                className="w-14 h-14 rounded-full object-cover ring-2 ring-[#970014] shadow-md"
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#970014] tracking-tight leading-none">
                  BCA STUDY POINT
                </h1>
                <p className="text-xs font-bold text-slate-600 mt-1">
                  Your Exam Preparation Partner · bcastudypoint.com
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  Official University Question Bank &amp; Solved Notes Portal
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono text-xs text-slate-600 space-y-0.5">
              <div className="font-extrabold text-[#970014] text-sm uppercase tracking-wide">
                Fee &amp; Payment Receipt
              </div>
              <div><strong className="text-slate-800">Receipt No:</strong> {receiptNumber}</div>
              <div><strong className="text-slate-800">Order Ref:</strong> {order.orderId}</div>
              <div><strong className="text-slate-800">Date:</strong> {formattedDate} ({formattedTime})</div>
            </div>
          </div>

          {/* Student & Payment Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            {/* Student Details */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#970014] uppercase tracking-wider block">
                Billed To (Student Information):
              </span>
              <div className="flex items-center gap-2 text-slate-800">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-extrabold text-sm text-slate-900">{order.studentName}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>📱 {order.studentMobile || 'N/A'}</span>
              </div>
              {order.studentEmail && (
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{order.studentEmail}</span>
                </div>
              )}
              {order.collegeName && (
                <div className="flex items-center gap-2 text-slate-700">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{order.collegeName}</span>
                </div>
              )}
            </div>

            {/* Payment Details */}
            <div className="space-y-1.5 sm:border-l sm:border-slate-200 sm:pl-4">
              <span className="text-[11px] font-bold text-[#970014] uppercase tracking-wider block">
                Payment &amp; Transaction Details:
              </span>
              <div className="flex items-center gap-2 text-slate-800">
                <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-semibold">Method: BharatPe UPI Direct</span>
              </div>
              {cleanUtr && (
                <div className="font-mono text-slate-700">
                  <span>UTR / Bank Ref: </span>
                  <span className="font-bold bg-slate-200/80 px-1.5 py-0.5 rounded text-[11px] text-slate-900">
                    {cleanUtr}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-slate-600">Verification Status:</span>
                {isVerified ? (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full text-[10px]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    PAID &amp; VERIFIED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full text-[10px]">
                    <Clock className="w-3 h-3 text-amber-600" />
                    PENDING APPROVAL
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500">
                UPI ID: {BRAND.payment?.upiId || 'BHARATPE2D0I0H4R5P81095@unitype'}
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-[#65000D] text-white">
                <tr>
                  <th className="py-2.5 px-3 font-bold w-10 text-center">#</th>
                  <th className="py-2.5 px-3 font-bold w-24">Subject Code</th>
                  <th className="py-2.5 px-3 font-bold">Paper / Question Bank Name</th>
                  <th className="py-2.5 px-3 font-bold text-right w-24">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, idx) => (
                  <tr key={item.productId || idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#970014]">{item.subjectCode}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      <div>{item.subjectName}</div>
                      <div className="text-[10px] text-slate-500">
                        BCA 3rd Semester · Solved University Exam Guide
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-right text-slate-900">
                      ₹{item.price}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-semibold text-slate-700">
                <tr>
                  <td colSpan={3} className="py-2 px-3 text-right">Subtotal:</td>
                  <td className="py-2 px-3 text-right font-mono font-bold">₹{order.totalAmount}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="py-1 px-3 text-right text-[11px] text-slate-500">
                    Digital Portal Access &amp; Device Binding Fee:
                  </td>
                  <td className="py-1 px-3 text-right font-mono text-[11px] text-emerald-600 font-bold">
                    FREE (₹0)
                  </td>
                </tr>
                <tr className="bg-slate-100 text-slate-900 font-black text-sm">
                  <td colSpan={3} className="py-2.5 px-3 text-right text-[#970014]">
                    Total Paid Amount:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-base text-[#970014]">
                    ₹{order.totalAmount}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Official Seal & Signature Section */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-t border-slate-200">
            {/* Official Stamp */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-600/80 flex flex-col items-center justify-center text-center p-1 text-emerald-700 select-none">
                <ShieldCheck className="w-5 h-5 text-emerald-600 mb-0.5" />
                <span className="text-[8px] font-black uppercase tracking-tighter leading-none">
                  BCA STUDY POINT
                </span>
                <span className="text-[7px] font-bold text-emerald-800 uppercase tracking-tighter">
                  VERIFIED
                </span>
              </div>
              <div className="text-[11px] text-slate-500 leading-tight">
                <span className="font-bold text-slate-700 block">Digitally Verified Document</span>
                This is a computer-generated official receipt issued by BCA STUDY POINT. No physical signature is required.
              </div>
            </div>

            {/* Helpline contact */}
            <div className="text-left sm:text-right text-[11px] text-slate-600 space-y-0.5 font-mono">
              <div className="font-bold text-slate-800">Support Helpline</div>
              <div>WhatsApp: +91 {BRAND.payment?.whatsappPhone || '9382040746'}</div>
              <div>Phone: +91 {BRAND.payment?.primaryPhone || '8145775413'}</div>
              <div>Email: support@bcastudypoint.com</div>
            </div>
          </div>
        </div>

        {/* Footer info in Modal */}
        <div className="p-3 bg-[#240005] border-t border-white/10 text-center text-[11px] text-[#FFE7A3]/70 print:hidden">
          <span>
            রসিদটি সেভ করতে ওপরের <strong>'Print / Save PDF'</strong> বাটনে ক্লিক করে <strong>'Save as PDF'</strong> সিলেক্ট করুন।
          </span>
        </div>
      </div>
    </div>
  );
};

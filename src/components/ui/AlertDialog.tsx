import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X, Trash2, LogOut, RotateCcw } from 'lucide-react';

export type AlertType = 'success' | 'danger' | 'warning' | 'info';

interface AlertDialogProps {
  isOpen: boolean;
  type?: AlertType;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  type = 'info',
  title,
  description,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger': return <AlertTriangle className="w-6 h-6 text-red-600" />;
      case 'success': return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
      case 'warning': return <RotateCcw className="w-6 h-6 text-amber-600" />;
      default: return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getThemeColor = () => {
    switch (type) {
      case 'danger': return 'bg-red-50 text-red-900 border-red-100';
      case 'success': return 'bg-emerald-50 text-emerald-900 border-emerald-100';
      case 'warning': return 'bg-amber-50 text-amber-900 border-amber-100';
      default: return 'bg-blue-50 text-blue-900 border-blue-100';
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'danger': return 'bg-red-600 hover:bg-red-700 shadow-red-200';
      case 'success': return 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200';
      case 'warning': return 'bg-amber-600 hover:bg-amber-700 shadow-amber-200';
      default: return 'bg-blue-600 hover:bg-blue-700 shadow-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with Blur */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onCancel}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 border border-white/50">
        <div className="p-6">
          <div className="flex gap-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border ${getThemeColor()}`}>
              {getIcon()}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
           {type !== 'success' && (
              <button
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-white hover:text-slate-800 border border-transparent hover:border-slate-200 transition-all"
              >
                {cancelLabel}
              </button>
           )}
          <button
            onClick={onConfirm}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all transform active:scale-95 flex items-center gap-2 ${getButtonColor()}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
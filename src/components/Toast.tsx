import React from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div id="toast-wrapper" className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          let Icon = Info;
          let bgColor = 'bg-white border-zinc-200';
          let textColor = 'text-zinc-800';
          let iconColor = 'text-emerald-600';

          if (toast.type === 'success') {
            Icon = CheckCircle;
            bgColor = 'bg-emerald-50 border-emerald-200';
            textColor = 'text-emerald-900';
            iconColor = 'text-emerald-600';
          } else if (toast.type === 'error') {
            Icon = AlertCircle;
            bgColor = 'bg-rose-50 border-rose-200';
            textColor = 'text-rose-900';
            iconColor = 'text-rose-600';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg ${bgColor} ${textColor}`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${iconColor} mt-0.5`} />
              <div className="flex-1 text-sm font-medium leading-tight">
                {toast.message}
              </div>
              <button
                id={`close-toast-${toast.id}`}
                onClick={() => removeToast(toast.id)}
                className="text-zinc-400 hover:text-zinc-600 rounded-lg p-0.5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

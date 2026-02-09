'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type, duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  const colors = {
    success: 'border-[#00FF66] bg-[#00FF66]/10',
    error: 'border-[#FF0055] bg-[#FF0055]/10',
    warning: 'border-[#FFB800] bg-[#FFB800]/10',
    info: 'border-[#7C3AED] bg-[#7C3AED]/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`fixed top-4 right-4 z-50 max-w-md ${colors[type]} border-2 rounded-sm p-4 shadow-lg`}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{icons[type]}</div>
        <div className="flex-1">
          <p className="text-white text-sm whitespace-pre-line">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-[#A0A0A0] hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
}

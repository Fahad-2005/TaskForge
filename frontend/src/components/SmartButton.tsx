import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Check, AlertCircle, Loader2 } from 'lucide-react';

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

export function SmartButton() {
  const [state, setState] = useState<ButtonState>('idle');

  const handleClick = async () => {
    if (state !== 'idle') return;

    setState('loading');

    // Simulate async API operation with a 20% intentional failure rate
    setTimeout(() => {
      const isSuccess = Math.random() > 0.2;
      if (isSuccess) {
        setState('success');
        setTimeout(() => setState('idle'), 2000); // Return to idle after 2s
      } else {
        setState('error');
        setTimeout(() => setState('idle'), 2500);
      }
    }, 1800);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-[#0B0F19] rounded-2xl border border-slate-800 my-4">
      <motion.button
        onClick={handleClick}
        disabled={state === 'loading'}
        focus-visible="outline-none"
        className={`relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-colors focus-visible:ring-2 focus-visible:ring-[#38BDF8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F19] ${
          state === 'error'
            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            : state === 'success'
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            : 'bg-[#38BDF8] text-[#0B0F19] hover:bg-[#38BDF8]/90'
        }`}
        whileHover={state === 'idle' ? { scale: 1.03 } : {}}
        whileTap={state === 'idle' ? { scale: 0.97 } : {}}
        animate={
          state === 'error'
            ? { x: [0, -6, 6, -4, 4, 0] } // Shake keyframes for error
            : { x: 0 }
        }
        transition={{
          duration: state === 'error' ? 0.4 : 0.2,
          ease: 'easeInOut',
        }}
      >
        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.span
              key="idle"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <span>Send Message</span>
              <Send className="w-4 h-4" />
            </motion.span>
          )}

          {state === 'loading' && (
            <motion.span
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 text-slate-900 font-semibold"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Thinking...</span>
            </motion.span>
          )}

          {state === 'success' && (
            <motion.span
              key="success"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Task Created</span>
            </motion.span>
          )}

          {state === 'error' && (
            <motion.span
              key="error"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>Failed — Click to Retry</span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

'use client';

import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export function Loader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-white to-[#ffeef3]"
    >
      <div className="relative w-20 h-20">
        <motion.div
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <Heart className="w-full h-full text-primary/50" />
        </motion.div>
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1.5 }}
        >
          <Heart className="w-full h-full text-primary" fill="currentColor" />
        </motion.div>
      </div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
        className="mt-6 text-lg font-quote text-muted-foreground"
      >
        Hold on… something beautiful is on its way. 💗
      </motion.p>
    </motion.div>
  );
}

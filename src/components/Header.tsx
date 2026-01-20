import { motion } from 'framer-motion';
import { QrCode, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="relative py-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <QrCode className="h-10 w-10 text-primary md:h-12 md:w-12" />
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight gradient-text md:text-5xl">
            Smart QR Generator
          </h1>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            <Sparkles className="h-6 w-6 text-accent md:h-8 md:w-8" />
          </motion.div>
        </div>
        <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto px-4">
          Create beautiful, customizable QR codes with logos, borders & multiple styles
        </p>
      </motion.div>

      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -top-1/2 right-1/4 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      </div>
    </header>
  );
}

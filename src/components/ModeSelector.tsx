import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { QRMode } from '@/lib/qr-types';
import { 
  Globe, 
  MessageCircle, 
  Type, 
  Wifi, 
  User, 
  Mail 
} from 'lucide-react';

const modes: { value: QRMode; label: string; icon: React.ElementType }[] = [
  { value: 'url', label: 'URL', icon: Globe },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { value: 'text', label: 'Text', icon: Type },
  { value: 'wifi', label: 'WiFi', icon: Wifi },
  { value: 'vcard', label: 'vCard', icon: User },
  { value: 'email', label: 'Email', icon: Mail },
];

interface ModeSelectorProps {
  value: QRMode;
  onChange: (mode: QRMode) => void;
}

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = value === mode.value;
        
        return (
          <motion.button
            key={mode.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(mode.value)}
            className={cn(
              'relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200',
              isActive
                ? 'border-primary bg-primary/10 text-primary shadow-glow'
                : 'border-border bg-secondary/30 text-muted-foreground hover:border-primary/50 hover:bg-secondary/50'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{mode.label}</span>
            {isActive && (
              <motion.div
                layoutId="modeIndicator"
                className="absolute inset-0 rounded-xl border-2 border-primary"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

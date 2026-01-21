import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, Sparkles } from 'lucide-react';
import { Label } from '@/components/ui/label';

export interface ColorPreset {
  id: string;
  name: string;
  fg: string;
  bg: string;
  isGradient?: boolean;
  gradientColors?: string[];
}

export const COLOR_PRESETS: ColorPreset[] = [
  { id: 'classic', name: 'Classic', fg: '#000000', bg: '#ffffff' },
  { id: 'midnight', name: 'Midnight', fg: '#1a1a2e', bg: '#eaeaea' },
  { id: 'ocean', name: 'Ocean', fg: '#0077b6', bg: '#caf0f8' },
  { id: 'forest', name: 'Forest', fg: '#1b4332', bg: '#d8f3dc' },
  { id: 'sunset', name: 'Sunset', fg: '#9d4edd', bg: '#ffecd2' },
  { id: 'berry', name: 'Berry', fg: '#7b2cbf', bg: '#e0aaff' },
  { id: 'coral', name: 'Coral', fg: '#d62828', bg: '#ffeae0' },
  { id: 'gold', name: 'Gold', fg: '#9a6700', bg: '#fff8e0' },
  { id: 'mint', name: 'Mint', fg: '#087f5b', bg: '#c3fae8' },
  { id: 'lavender', name: 'Lavender', fg: '#5f3dc4', bg: '#e5dbff' },
  { id: 'slate', name: 'Slate', fg: '#334155', bg: '#f1f5f9' },
  { id: 'rose', name: 'Rose', fg: '#be185d', bg: '#fce7f3' },
];

export const GRADIENT_PRESETS: ColorPreset[] = [
  { 
    id: 'gradient-blue', 
    name: 'Blue Wave', 
    fg: '#0ea5e9', 
    bg: '#ffffff',
    isGradient: true,
    gradientColors: ['#0ea5e9', '#6366f1']
  },
  { 
    id: 'gradient-purple', 
    name: 'Purple Dream', 
    fg: '#8b5cf6', 
    bg: '#ffffff',
    isGradient: true,
    gradientColors: ['#8b5cf6', '#ec4899']
  },
  { 
    id: 'gradient-green', 
    name: 'Green Fresh', 
    fg: '#10b981', 
    bg: '#ffffff',
    isGradient: true,
    gradientColors: ['#10b981', '#06b6d4']
  },
  { 
    id: 'gradient-orange', 
    name: 'Sunset Glow', 
    fg: '#f97316', 
    bg: '#ffffff',
    isGradient: true,
    gradientColors: ['#f97316', '#ef4444']
  },
  { 
    id: 'gradient-pink', 
    name: 'Pink Blush', 
    fg: '#ec4899', 
    bg: '#ffffff',
    isGradient: true,
    gradientColors: ['#ec4899', '#f43f5e']
  },
  { 
    id: 'gradient-teal', 
    name: 'Teal Ocean', 
    fg: '#14b8a6', 
    bg: '#ffffff',
    isGradient: true,
    gradientColors: ['#14b8a6', '#0891b2']
  },
];

interface ColorPresetsProps {
  selectedPreset: string | null;
  onSelectPreset: (preset: ColorPreset) => void;
}

export const ColorPresets = forwardRef<HTMLDivElement, ColorPresetsProps>(
  function ColorPresets({ selectedPreset, onSelectPreset }, ref) {
  return (
    <div className="space-y-4">
      {/* Solid Colors */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Solid Colors</Label>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {COLOR_PRESETS.map((preset) => (
            <motion.button
              key={preset.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectPreset(preset)}
              className={cn(
                'relative aspect-square rounded-xl border-2 transition-all overflow-hidden',
                selectedPreset === preset.id
                  ? 'border-primary shadow-glow ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50'
              )}
              title={preset.name}
            >
              <div 
                className="absolute inset-1 rounded-lg"
                style={{ backgroundColor: preset.bg }}
              >
                <div 
                  className="absolute inset-2 rounded"
                  style={{ backgroundColor: preset.fg }}
                />
              </div>
              {selectedPreset === preset.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-primary/20"
                >
                  <Check className="h-4 w-4 text-primary" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Gradients */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          Gradient Colors
        </Label>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {GRADIENT_PRESETS.map((preset) => (
            <motion.button
              key={preset.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectPreset(preset)}
              className={cn(
                'relative aspect-square rounded-xl border-2 transition-all overflow-hidden',
                selectedPreset === preset.id
                  ? 'border-primary shadow-glow ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50'
              )}
              title={preset.name}
            >
              <div 
                className="absolute inset-1 rounded-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${preset.gradientColors?.[0]}, ${preset.gradientColors?.[1]})`
                }}
              />
              {selectedPreset === preset.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-white/30"
                >
                  <Check className="h-4 w-4 text-white" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Gradients apply to QR foreground color
        </p>
      </div>
    </div>
  );
});

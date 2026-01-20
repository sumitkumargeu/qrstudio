import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DesignOption {
  value: string;
  label: string;
  icon: string;
}

interface DesignSelectorProps {
  options: DesignOption[];
  value: string;
  onChange: (value: string) => void;
  columns?: number;
}

export function DesignSelector({
  options,
  value,
  onChange,
  columns = 3,
}: DesignSelectorProps) {
  return (
    <div
      className={cn(
        'grid gap-2',
        columns === 3 && 'grid-cols-3',
        columns === 4 && 'grid-cols-4',
        columns === 5 && 'grid-cols-5',
        columns === 6 && 'grid-cols-6'
      )}
    >
      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <motion.button
            key={option.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200',
              isActive
                ? 'border-primary bg-primary/10 text-primary shadow-glow'
                : 'border-border bg-secondary/30 text-muted-foreground hover:border-primary/50 hover:bg-secondary/50'
            )}
          >
            <span className="text-lg">{option.icon}</span>
            <span className="text-xs font-medium text-center leading-tight">
              {option.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

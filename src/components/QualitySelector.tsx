import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles } from 'lucide-react';

export type QRQuality = 'standard' | 'high' | 'ultra' | '4k';

export interface QualityOption {
  value: QRQuality;
  label: string;
  size: number;
  description: string;
}

export const QUALITY_OPTIONS: QualityOption[] = [
  { value: 'standard', label: 'Standard', size: 512, description: '512×512 px' },
  { value: 'high', label: 'High', size: 1024, description: '1024×1024 px (HD)' },
  { value: 'ultra', label: 'Ultra', size: 2048, description: '2048×2048 px (2K)' },
  { value: '4k', label: '4K UHD', size: 4096, description: '4096×4096 px (4K)' },
];

interface QualitySelectorProps {
  value: QRQuality;
  onChange: (value: QRQuality) => void;
  className?: string;
}

export function QualitySelector({ value, onChange, className }: QualitySelectorProps) {
  const selectedOption = QUALITY_OPTIONS.find(o => o.value === value);
  
  return (
    <div className={cn('space-y-2', className)}>
      <Label className="flex items-center gap-2 text-sm font-medium">
        <Sparkles className="h-4 w-4 text-primary" />
        Download Quality
      </Label>
      <Select value={value} onValueChange={(v) => onChange(v as QRQuality)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select quality" />
        </SelectTrigger>
        <SelectContent>
          {QUALITY_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedOption && (
        <p className="text-xs text-muted-foreground">
          Output: {selectedOption.size} × {selectedOption.size} pixels
          {selectedOption.value === '4k' && ' • Ultra high quality for print'}
        </p>
      )}
    </div>
  );
}

export function getQualitySize(quality: QRQuality): number {
  return QUALITY_OPTIONS.find(o => o.value === quality)?.size || 1024;
}

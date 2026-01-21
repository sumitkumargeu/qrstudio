import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Printer, Grid3X3, Maximize2, FileText, RotateCw, Ruler } from 'lucide-react';
import { toast } from 'sonner';

interface PrintDialogProps {
  qrDataUrl: string | null;
  qrContent: string;
}

type PaperSize = 'a4' | 'a5' | 'letter' | 'legal' | 'custom';
type Orientation = 'portrait' | 'landscape';

const PAPER_SIZES: Record<PaperSize, { width: number; height: number; label: string }> = {
  a4: { width: 210, height: 297, label: 'A4 (210×297mm)' },
  a5: { width: 148, height: 210, label: 'A5 (148×210mm)' },
  letter: { width: 216, height: 279, label: 'Letter (8.5×11")' },
  legal: { width: 216, height: 356, label: 'Legal (8.5×14")' },
  custom: { width: 210, height: 297, label: 'Custom' },
};

const QR_SIZE_PRESETS = [
  { value: 25, label: '25mm (1")', description: 'Small - Business cards' },
  { value: 40, label: '40mm (1.5")', description: 'Medium - Product labels' },
  { value: 60, label: '60mm (2.4")', description: 'Standard - Posters' },
  { value: 80, label: '80mm (3.1")', description: 'Large - Flyers' },
  { value: 100, label: '100mm (4")', description: 'Extra Large - Signage' },
  { value: 150, label: '150mm (6")', description: 'Jumbo - Banners' },
];

export function PrintDialog({ qrDataUrl, qrContent }: PrintDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [qrSize, setQrSize] = useState(60);
  const [copies, setCopies] = useState(1);
  const [layout, setLayout] = useState<'single' | 'grid' | 'fill'>('single');
  const [paperSize, setPaperSize] = useState<PaperSize>('a4');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [showLabel, setShowLabel] = useState(true);
  const [customLabel, setCustomLabel] = useState('');
  const [margin, setMargin] = useState(10);
  const [gridCols, setGridCols] = useState(3);

  const getPaperDimensions = () => {
    const base = PAPER_SIZES[paperSize];
    if (orientation === 'landscape') {
      return { width: base.height, height: base.width };
    }
    return { width: base.width, height: base.height };
  };

  const calculateGridLayout = () => {
    const paper = getPaperDimensions();
    const usableWidth = paper.width - (margin * 2);
    const usableHeight = paper.height - (margin * 2);
    
    const cols = layout === 'fill' 
      ? Math.floor(usableWidth / (qrSize + 5))
      : gridCols;
    const rows = Math.floor(usableHeight / (qrSize + (showLabel ? 15 : 5)));
    
    return { cols: Math.max(1, cols), rows: Math.max(1, rows), maxItems: cols * rows };
  };

  const handlePrint = () => {
    if (!qrDataUrl) {
      toast.error('No QR code to print');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print');
      return;
    }

    const paper = getPaperDimensions();
    const gridLayout = calculateGridLayout();
    const actualCopies = layout === 'fill' ? gridLayout.maxItems : copies;
    const actualCols = layout === 'single' ? 1 : layout === 'fill' ? gridLayout.cols : gridCols;
    const label = customLabel || (qrContent.length > 40 ? qrContent.slice(0, 40) + '...' : qrContent);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Code</title>
          <style>
            @page {
              size: ${paper.width}mm ${paper.height}mm;
              margin: ${margin}mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              justify-content: center;
              align-items: flex-start;
              min-height: 100vh;
            }
            .container {
              display: grid;
              grid-template-columns: repeat(${actualCols}, 1fr);
              gap: 8px;
              justify-items: center;
              align-items: start;
              width: 100%;
              padding: ${margin}mm;
            }
            .qr-item {
              display: flex;
              flex-direction: column;
              align-items: center;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .qr-item img {
              width: ${qrSize}mm;
              height: ${qrSize}mm;
              object-fit: contain;
            }
            .qr-label {
              margin-top: 4px;
              font-size: ${Math.max(8, qrSize / 10)}px;
              color: #333;
              text-align: center;
              max-width: ${qrSize}mm;
              word-break: break-all;
              line-height: 1.2;
            }
            @media print {
              body { 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${Array(actualCopies).fill(null).map(() => `
              <div class="qr-item">
                <img src="${qrDataUrl}" alt="QR Code" />
                ${showLabel ? `<div class="qr-label">${label}</div>` : ''}
              </div>
            `).join('')}
          </div>
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              }, 500);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
    toast.success('Opening print dialog...');
  };

  const gridLayout = calculateGridLayout();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          disabled={!qrDataUrl}
          className="gap-2"
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-primary" />
            Print QR Code
          </DialogTitle>
          <DialogDescription>
            Configure print settings for your QR code
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* QR Preview */}
          {qrDataUrl && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex justify-center"
            >
              <img 
                src={qrDataUrl} 
                alt="QR Code Preview" 
                className="w-24 h-24 rounded-lg border shadow-sm bg-white p-1"
              />
            </motion.div>
          )}

          {/* Paper Size */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Paper Size
            </Label>
            <Select value={paperSize} onValueChange={(v) => setPaperSize(v as PaperSize)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PAPER_SIZES).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Orientation */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <RotateCw className="h-4 w-4" />
              Orientation
            </Label>
            <div className="flex gap-2">
              <Button
                variant={orientation === 'portrait' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setOrientation('portrait')}
                className="flex-1"
              >
                Portrait
              </Button>
              <Button
                variant={orientation === 'landscape' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setOrientation('landscape')}
                className="flex-1"
              >
                Landscape
              </Button>
            </div>
          </div>

          {/* QR Size with Presets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Maximize2 className="h-4 w-4" />
                QR Code Size
              </Label>
              <span className="text-sm font-medium">{qrSize}mm</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {QR_SIZE_PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  variant={qrSize === preset.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setQrSize(preset.value)}
                  className="text-xs h-7"
                  title={preset.description}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <Slider
              value={[qrSize]}
              onValueChange={(v) => setQrSize(v[0])}
              min={15}
              max={200}
              step={5}
            />
          </div>

          {/* Layout */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              Layout
            </Label>
            <Select value={layout} onValueChange={(v) => setLayout(v as typeof layout)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single (Centered)</SelectItem>
                <SelectItem value="grid">Grid (Custom columns)</SelectItem>
                <SelectItem value="fill">Fill Page (Auto fit)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Grid Columns (only for grid layout) */}
          {layout === 'grid' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Columns</Label>
                <span className="text-sm text-muted-foreground">{gridCols}</span>
              </div>
              <Slider
                value={[gridCols]}
                onValueChange={(v) => setGridCols(v[0])}
                min={1}
                max={6}
                step={1}
              />
            </div>
          )}

          {/* Copies (not for fill layout) */}
          {layout !== 'fill' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Number of Copies</Label>
                <span className="text-sm text-muted-foreground">{copies}</span>
              </div>
              <Slider
                value={[copies]}
                onValueChange={(v) => setCopies(v[0])}
                min={1}
                max={24}
                step={1}
              />
            </div>
          )}

          {/* Fill info */}
          {layout === 'fill' && (
            <div className="p-3 rounded-lg bg-secondary/50 text-sm">
              <p className="font-medium">Auto-fill: {gridLayout.maxItems} QR codes</p>
              <p className="text-muted-foreground text-xs mt-1">
                {gridLayout.cols} columns × {gridLayout.rows} rows
              </p>
            </div>
          )}

          {/* Margin */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Page Margin
              </Label>
              <span className="text-sm text-muted-foreground">{margin}mm</span>
            </div>
            <Slider
              value={[margin]}
              onValueChange={(v) => setMargin(v[0])}
              min={0}
              max={30}
              step={5}
            />
          </div>

          {/* Label Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Show Label</Label>
              <Switch checked={showLabel} onCheckedChange={setShowLabel} />
            </div>
            {showLabel && (
              <Input
                placeholder="Custom label (leave empty for auto)"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
              />
            )}
          </div>

          {/* Print Button */}
          <Button 
            onClick={handlePrint}
            className="w-full gradient-primary text-white"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print {layout === 'fill' ? gridLayout.maxItems : copies} {(layout === 'fill' ? gridLayout.maxItems : copies) > 1 ? 'Copies' : 'Copy'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

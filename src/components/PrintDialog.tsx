import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
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
import { Printer, Grid3X3, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';

interface PrintDialogProps {
  qrDataUrl: string | null;
  qrContent: string;
}

export function PrintDialog({ qrDataUrl, qrContent }: PrintDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [qrSize, setQrSize] = useState(150); // mm
  const [copies, setCopies] = useState(1);
  const [layout, setLayout] = useState<'single' | 'grid'>('single');
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!qrDataUrl) {
      toast.error('No QR code to print');
      return;
    }

    // Create print window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print');
      return;
    }

    const qrImages = Array(copies).fill(qrDataUrl);
    const gridCols = layout === 'grid' ? Math.min(copies, 3) : 1;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Code</title>
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              margin: 0;
              padding: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .container {
              display: grid;
              grid-template-columns: repeat(${gridCols}, 1fr);
              gap: 20px;
              justify-items: center;
            }
            .qr-item {
              display: flex;
              flex-direction: column;
              align-items: center;
              page-break-inside: avoid;
            }
            .qr-item img {
              width: ${qrSize}px;
              height: ${qrSize}px;
              object-fit: contain;
            }
            .qr-label {
              margin-top: 10px;
              font-size: 10px;
              color: #666;
              text-align: center;
              max-width: ${qrSize}px;
              word-break: break-all;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${qrImages.map(() => `
              <div class="qr-item">
                <img src="${qrDataUrl}" alt="QR Code" />
                <div class="qr-label">${qrContent.length > 50 ? qrContent.slice(0, 50) + '...' : qrContent}</div>
              </div>
            `).join('')}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
    toast.success('Opening print dialog...');
  };

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
      <DialogContent className="sm:max-w-md">
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
            <div className="flex justify-center">
              <img 
                src={qrDataUrl} 
                alt="QR Code Preview" 
                className="w-32 h-32 rounded-lg border shadow-sm"
              />
            </div>
          )}

          {/* Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Maximize2 className="h-4 w-4" />
                QR Code Size
              </Label>
              <span className="text-sm text-muted-foreground">{qrSize}px</span>
            </div>
            <Slider
              value={[qrSize]}
              onValueChange={(v) => setQrSize(v[0])}
              min={50}
              max={300}
              step={10}
            />
          </div>

          {/* Copies */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Number of Copies</Label>
              <span className="text-sm text-muted-foreground">{copies}</span>
            </div>
            <Slider
              value={[copies]}
              onValueChange={(v) => setCopies(v[0])}
              min={1}
              max={12}
              step={1}
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
                <SelectItem value="single">Single Column</SelectItem>
                <SelectItem value="grid">Grid (up to 3 columns)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Print Button */}
          <Button 
            onClick={handlePrint}
            className="w-full gradient-primary text-white"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print {copies > 1 ? `${copies} Copies` : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

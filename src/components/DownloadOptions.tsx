import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Download, FileImage, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { QualitySelector, type QRQuality, QUALITY_OPTIONS } from './QualitySelector';

export type ImageFormat = 'png' | 'jpeg' | 'webp' | 'svg';

interface DownloadOptionsProps {
  qrDataUrl: string | null;
  qrContent: string;
  onDownload: (filename: string, quality: QRQuality, format: ImageFormat) => void;
  defaultFilename?: string;
}

export function DownloadOptions({ 
  qrDataUrl, 
  qrContent, 
  onDownload,
  defaultFilename = 'qr-code'
}: DownloadOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filename, setFilename] = useState(defaultFilename);
  const [quality, setQuality] = useState<QRQuality>('high');
  const [format, setFormat] = useState<ImageFormat>('png');

  const handleDownload = () => {
    if (!qrDataUrl) {
      toast.error('No QR code to download');
      return;
    }

    const sanitizedFilename = filename
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '') || 'qr-code';

    onDownload(sanitizedFilename, quality, format);
    setIsOpen(false);
    toast.success(`Downloaded ${sanitizedFilename}.${format}`);
  };

  const getFilenameFromContent = () => {
    if (!qrContent) return 'qr-code';
    
    // Extract meaningful name from content
    if (qrContent.startsWith('http')) {
      try {
        const url = new URL(qrContent);
        return url.hostname.replace(/\./g, '-').substring(0, 30);
      } catch {
        return 'qr-url';
      }
    }
    
    if (qrContent.startsWith('WIFI:')) {
      const ssidMatch = qrContent.match(/S:([^;]*)/);
      return ssidMatch ? `wifi-${ssidMatch[1].substring(0, 20)}` : 'qr-wifi';
    }
    
    if (qrContent.startsWith('mailto:')) {
      return 'qr-email';
    }
    
    if (qrContent.startsWith('https://wa.me/')) {
      return 'qr-whatsapp';
    }
    
    if (qrContent.startsWith('BEGIN:VCARD')) {
      const nameMatch = qrContent.match(/FN:([^\n]*)/);
      return nameMatch ? `vcard-${nameMatch[1].substring(0, 20)}` : 'qr-vcard';
    }
    
    return `qr-${qrContent.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          disabled={!qrDataUrl}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            Download Options
          </DialogTitle>
          <DialogDescription>
            Customize your QR code download settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Preview */}
          {qrDataUrl && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex justify-center"
            >
              <img 
                src={qrDataUrl} 
                alt="QR Code Preview" 
                className="w-32 h-32 rounded-lg border shadow-sm bg-white p-2"
              />
            </motion.div>
          )}

          {/* Filename */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileImage className="h-4 w-4" />
              Filename
            </Label>
            <div className="flex gap-2">
              <Input
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="Enter filename"
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilename(getFilenameFromContent())}
                className="whitespace-nowrap"
              >
                Auto
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Final: {filename || 'qr-code'}.{format}
            </p>
          </div>

          {/* Quality */}
          <QualitySelector value={quality} onChange={setQuality} />

          {/* Format */}
          <div className="space-y-2">
            <Label>Image Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as ImageFormat)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG (Recommended)</SelectItem>
                <SelectItem value="jpeg">JPEG (Smaller size)</SelectItem>
                <SelectItem value="webp">WebP (Modern format)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Download Button */}
          <Button 
            onClick={handleDownload}
            className="w-full gradient-primary text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Download {quality.toUpperCase()} Quality
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

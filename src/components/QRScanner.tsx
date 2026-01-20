import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Upload, 
  ScanLine, 
  RefreshCw, 
  Copy, 
  Check,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onContentExtracted: (content: string) => void;
}

export function QRScanner({ onContentExtracted }: QRScannerProps) {
  const [extractedContent, setExtractedContent] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setError('');
    setExtractedContent('');

    try {
      const html5QrCode = new Html5Qrcode('qr-reader-element');
      
      const result = await html5QrCode.scanFile(file, true);
      setExtractedContent(result);
      toast.success('QR code scanned successfully!');
      
      await html5QrCode.clear();
    } catch (err) {
      console.error('QR scan error:', err);
      setError('Could not read QR code from image. Please try a clearer image.');
      toast.error('Failed to scan QR code');
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCopy = async () => {
    if (!extractedContent) return;
    
    try {
      await navigator.clipboard.writeText(extractedContent);
      setCopied(true);
      toast.success('Content copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleRecreate = () => {
    if (!extractedContent) return;
    onContentExtracted(extractedContent);
    toast.success('Content loaded! Customize and generate your QR.');
  };

  const handleReset = () => {
    setExtractedContent('');
    setError('');
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ScanLine className="h-5 w-5 text-primary" />
          QR Code Scanner
        </CardTitle>
        <CardDescription>
          Upload a QR code image to extract its content and recreate with custom styling
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hidden QR reader element */}
        <div id="qr-reader-element" className="hidden" />
        
        {/* Upload Area */}
        <label
          className={`flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
            isScanning
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-secondary/30'
          }`}
        >
          {isScanning ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <RefreshCw className="h-10 w-10 text-primary" />
              </motion.div>
              <span className="text-sm font-medium">Scanning...</span>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground" />
              <div className="text-center">
                <span className="text-sm font-medium">Upload QR Code Image</span>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, or any image with a QR code
                </p>
              </div>
            </>
          )}
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isScanning}
          />
        </label>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}

        {/* Extracted Content */}
        {extractedContent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <Label className="text-sm font-medium">Extracted Content</Label>
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <p className="text-sm font-mono break-all">{extractedContent}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleCopy}
                className="flex-1 gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Content
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleRecreate}
                className="flex-1 gap-2 gradient-primary text-white"
              >
                Recreate QR
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={handleReset}
              className="w-full text-muted-foreground"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Scan Another
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

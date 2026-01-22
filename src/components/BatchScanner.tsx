import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  ScanLine, 
  RefreshCw, 
  Copy, 
  AlertCircle,
  ArrowRight,
  Trash2,
  FileImage,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Html5Qrcode } from 'html5-qrcode';

interface ScannedItem {
  id: string;
  filename: string;
  content: string;
  status: 'pending' | 'scanning' | 'done' | 'error';
  error?: string;
}

interface BatchScannerProps {
  onContentsExtracted: (contents: string[]) => void;
}

export function BatchScanner({ onContentsExtracted }: BatchScannerProps) {
  const [items, setItems] = useState<ScannedItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: ScannedItem[] = Array.from(files).map((file, index) => ({
      id: `scan-${Date.now()}-${index}`,
      filename: file.name,
      content: '',
      status: 'pending' as const,
    }));

    setItems(newItems);
    toast.success(`${files.length} images ready to scan`);

    // Auto-start scanning
    await scanAllFiles(Array.from(files), newItems);
  };

  const scanAllFiles = async (files: File[], itemsList: ScannedItem[]) => {
    setIsScanning(true);
    setProgress(0);

    const updatedItems = [...itemsList];
    const html5QrCode = new Html5Qrcode('batch-qr-reader-element');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      updatedItems[i] = { ...updatedItems[i], status: 'scanning' };
      setItems([...updatedItems]);

      try {
        const result = await html5QrCode.scanFile(file, true);
        updatedItems[i] = {
          ...updatedItems[i],
          status: 'done',
          content: result,
        };
      } catch (err) {
        console.error('Scan error:', err);
        updatedItems[i] = {
          ...updatedItems[i],
          status: 'error',
          error: 'Could not read QR code',
        };
      }

      setItems([...updatedItems]);
      setProgress(((i + 1) / files.length) * 100);
    }

    await html5QrCode.clear();
    setIsScanning(false);

    const successCount = updatedItems.filter(i => i.status === 'done').length;
    toast.success(`Scanned ${successCount} of ${files.length} QR codes`);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRecreateAll = () => {
    const contents = items
      .filter(i => i.status === 'done' && i.content)
      .map(i => i.content);
    
    if (contents.length === 0) {
      toast.error('No QR codes scanned successfully');
      return;
    }

    onContentsExtracted(contents);
    toast.success(`${contents.length} QR codes loaded to batch generator!`);
  };

  const handleCopyAll = async () => {
    const contents = items
      .filter(i => i.status === 'done' && i.content)
      .map(i => i.content)
      .join('\n');
    
    if (!contents) {
      toast.error('Nothing to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(contents);
      toast.success('All contents copied!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const clearAll = () => {
    setItems([]);
    setProgress(0);
  };

  const doneCount = items.filter(i => i.status === 'done').length;
  const errorCount = items.filter(i => i.status === 'error').length;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ScanLine className="h-5 w-5 text-primary" />
          Batch QR Scanner
        </CardTitle>
        <CardDescription>
          Upload multiple QR code images to scan and recreate them all at once
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hidden QR reader element */}
        <div id="batch-qr-reader-element" className="hidden" />

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
              <span className="text-sm font-medium">Scanning {items.length} images...</span>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground" />
              <div className="text-center">
                <span className="text-sm font-medium">Upload Multiple QR Images</span>
                <p className="text-xs text-muted-foreground mt-1">
                  Select multiple PNG, JPG, or image files with QR codes
                </p>
              </div>
            </>
          )}
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesUpload}
            className="hidden"
            disabled={isScanning}
          />
        </label>

        {/* Progress */}
        {isScanning && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              Scanning... {Math.round(progress)}%
            </p>
          </div>
        )}

        {/* Results Summary */}
        {items.length > 0 && !isScanning && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">{items.length} images</span>
              {doneCount > 0 && (
                <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" /> {doneCount} scanned
                </span>
              )}
              {errorCount > 0 && (
                <span className="text-sm text-destructive flex items-center gap-1">
                  <XCircle className="h-4 w-4" /> {errorCount} failed
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Scanned Items List */}
        {items.length > 0 && (
          <div className="max-h-64 overflow-y-auto space-y-2 scrollbar-thin">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30"
                >
                  {item.status === 'pending' && (
                    <FileImage className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  {item.status === 'scanning' && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <RefreshCw className="h-4 w-4 text-primary flex-shrink-0" />
                    </motion.div>
                  )}
                  {item.status === 'done' && (
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  )}
                  {item.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.filename}</p>
                    {item.status === 'done' && (
                      <p className="text-xs text-muted-foreground truncate">{item.content}</p>
                    )}
                    {item.status === 'error' && (
                      <p className="text-xs text-destructive">{item.error}</p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Actions */}
        {doneCount > 0 && !isScanning && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleCopyAll}
              className="flex-1 gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy All Contents
            </Button>
            
            <Button
              onClick={handleRecreateAll}
              className="flex-1 gap-2 gradient-primary text-white"
            >
              Recreate All in Batch
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Layers, 
  Download, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  Trash2,
  FileArchive,
  Settings2,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { generateQRCanvas, generateQRContent, applyDesignStyle, addLogoToCanvas, addBorderToCanvas } from '@/lib/qr-utils';
import type { QRMode, QRDesignStyle, LogoItem, LogoShape, LogoLayout } from '@/lib/qr-types';
import { QualitySelector, type QRQuality, getQualitySize } from './QualitySelector';
import JSZip from 'jszip';

interface BatchItem {
  id: string;
  mode: QRMode;
  content: string;
  filename: string;
  data: Record<string, string>;
  status: 'pending' | 'generating' | 'done' | 'error';
  dataUrl?: string;
  error?: string;
}

interface BatchGeneratorProps {
  designStyle: QRDesignStyle;
  fgColor: string;
  bgColor: string;
  enableLogo?: boolean;
  logo?: LogoItem | null;
  logoShape?: LogoShape;
  logoLayout?: LogoLayout;
  logoSize?: number;
  enableBorder?: boolean;
  borderWidth?: number;
  borderColor?: string;
}

export function BatchGenerator({ 
  designStyle, 
  fgColor, 
  bgColor,
  enableLogo = false,
  logo = null,
  logoShape = 'circle',
  logoLayout = 'center',
  logoSize = 15,
  enableBorder = false,
  borderWidth = 20,
  borderColor = '#000000',
}: BatchGeneratorProps) {
  const [inputText, setInputText] = useState('');
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [batchMode, setBatchMode] = useState<QRMode>('url');
  const [quality, setQuality] = useState<QRQuality>('high');
  const [zipName, setZipName] = useState('qr-codes-batch');

  const parseInput = () => {
    const lines = inputText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) {
      toast.error('Please enter at least one item');
      return;
    }

    if (lines.length > 100) {
      toast.error('Maximum 100 items allowed per batch');
      return;
    }

    const newItems: BatchItem[] = lines.map((line, index) => {
      const data = parseLineData(line, batchMode);
      const filename = generateFilename(line, batchMode, index);
      
      return {
        id: `batch-${Date.now()}-${index}`,
        mode: batchMode,
        content: line,
        filename,
        data,
        status: 'pending' as const,
      };
    });

    setItems(newItems);
    toast.success(`${newItems.length} items ready to generate`);
  };

  const parseLineData = (line: string, mode: QRMode): Record<string, string> => {
    switch (mode) {
      case 'url':
        return { url: line };
      case 'text':
        return { text: line };
      case 'whatsapp': {
        // Format: +91 1234567890 | Message
        const parts = line.split('|').map(p => p.trim());
        const phonePart = parts[0].replace(/[^0-9+]/g, '');
        const countryCode = phonePart.startsWith('+') ? phonePart.slice(1, 3) : '91';
        const phone = phonePart.replace(/^\+?\d{2}/, '');
        return { 
          phone, 
          countryCode, 
          message: parts[1] || 'Hello' 
        };
      }
      case 'email': {
        // Format: email@example.com | Subject | Body
        const parts = line.split('|').map(p => p.trim());
        return { 
          email: parts[0], 
          subject: parts[1] || '', 
          body: parts[2] || '' 
        };
      }
      case 'wifi': {
        // Format: SSID | Password | WPA/WEP/nopass
        const parts = line.split('|').map(p => p.trim());
        return { 
          ssid: parts[0], 
          password: parts[1] || '', 
          authType: parts[2] || 'WPA' 
        };
      }
      case 'vcard': {
        // Format: FirstName LastName | Phone | Email | Company
        const parts = line.split('|').map(p => p.trim());
        const nameParts = (parts[0] || '').split(' ');
        return {
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          phone: parts[1] || '',
          email: parts[2] || '',
          company: parts[3] || '',
        };
      }
      default:
        return { text: line };
    }
  };

  const generateFilename = (line: string, mode: QRMode, index: number): string => {
    const prefix = mode === 'url' ? 'url' : mode;
    let name = line.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
    
    if (mode === 'url') {
      try {
        const url = line.startsWith('http') ? line : `https://${line}`;
        name = new URL(url).hostname.replace(/\./g, '-');
      } catch {
        // Keep the default name
      }
    }
    
    return `${prefix}-${index + 1}-${name}`;
  };

  const addSingleItem = () => {
    const newItem: BatchItem = {
      id: `batch-${Date.now()}`,
      mode: batchMode,
      content: '',
      filename: `${batchMode}-${items.length + 1}`,
      data: {},
      status: 'pending',
    };
    setItems([...items, newItem]);
  };

  const updateItemFilename = (id: string, filename: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, filename } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const generateBatch = async () => {
    if (items.length === 0) {
      toast.error('Please add items first');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    const updatedItems = [...items];
    const size = getQualitySize(quality);

    for (let i = 0; i < updatedItems.length; i++) {
      const item = updatedItems[i];
      
      updatedItems[i] = { ...item, status: 'generating' };
      setItems([...updatedItems]);

      try {
        const content = generateQRContent(item.mode, item.data);
        
        if (!content || content.length < 1) {
          throw new Error('Invalid content');
        }

        let canvas = await generateQRCanvas(content, {
          fgColor,
          bgColor,
          size,
        });

        // Apply design style
        canvas = applyDesignStyle(canvas, designStyle, fgColor, bgColor);

        // Add logo if enabled
        if (enableLogo && logo) {
          canvas = await addLogoToCanvas(canvas, logo, {
            shape: logoShape,
            layout: logoLayout,
            size: logoSize,
            bgColor,
          });
        }

        // Add border if enabled
        if (enableBorder) {
          canvas = addBorderToCanvas(canvas, borderWidth, borderColor);
        }

        updatedItems[i] = {
          ...item,
          status: 'done',
          dataUrl: canvas.toDataURL('image/png'),
        };
      } catch (error) {
        console.error('Batch generation error:', error);
        updatedItems[i] = { 
          ...item, 
          status: 'error',
          error: error instanceof Error ? error.message : 'Failed to generate'
        };
      }

      setItems([...updatedItems]);
      setProgress(((i + 1) / updatedItems.length) * 100);
      
      await new Promise(r => setTimeout(r, 50));
    }

    setIsGenerating(false);
    
    const successCount = updatedItems.filter(i => i.status === 'done').length;
    toast.success(`Generated ${successCount} of ${updatedItems.length} QR codes`);
  };

  const downloadAll = async () => {
    const successItems = items.filter(i => i.status === 'done' && i.dataUrl);
    
    if (successItems.length === 0) {
      toast.error('No QR codes to download');
      return;
    }

    if (successItems.length === 1) {
      const link = document.createElement('a');
      link.download = `${successItems[0].filename}.png`;
      link.href = successItems[0].dataUrl!;
      link.click();
      toast.success('Downloaded!');
      return;
    }

    try {
      const zip = new JSZip();
      
      successItems.forEach((item) => {
        const base64 = item.dataUrl!.split(',')[1];
        zip.file(`${item.filename}.png`, base64, { base64: true });
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      const sanitizedZipName = zipName.replace(/[^a-zA-Z0-9-_]/g, '_') || 'qr-codes-batch';
      link.download = `${sanitizedZipName}.zip`;
      link.href = URL.createObjectURL(blob);
      link.click();
      
      toast.success(`Downloaded ${successItems.length} QR codes as ZIP`);
    } catch (error) {
      console.error('ZIP error:', error);
      toast.error('Failed to create ZIP file');
    }
  };

  const clearAll = () => {
    setItems([]);
    setInputText('');
    setProgress(0);
  };

  const doneCount = items.filter(i => i.status === 'done').length;
  const errorCount = items.filter(i => i.status === 'error').length;

  const getPlaceholder = () => {
    switch (batchMode) {
      case 'url':
        return `https://example.com\nhttps://google.com\nexample.org`;
      case 'whatsapp':
        return `+91 9876543210 | Hello\n+1 1234567890 | Hi there`;
      case 'email':
        return `john@example.com | Subject | Body\njane@example.com | Hello`;
      case 'wifi':
        return `MyNetwork | password123 | WPA\nGuestWiFi | guest | WEP`;
      case 'vcard':
        return `John Doe | +1234567890 | john@example.com | Company\nJane Smith | +0987654321 | jane@example.com`;
      default:
        return `Item 1\nItem 2\nItem 3`;
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Layers className="h-5 w-5 text-primary" />
          Batch Generator
        </CardTitle>
        <CardDescription>
          Generate multiple QR codes at once with custom settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Batch Mode Selection */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            QR Code Type
          </Label>
          <Select value={batchMode} onValueChange={(v) => setBatchMode(v as QRMode)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="url">🔗 URL / Website</SelectItem>
              <SelectItem value="text">📝 Plain Text</SelectItem>
              <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
              <SelectItem value="email">📧 Email</SelectItem>
              <SelectItem value="wifi">📶 WiFi</SelectItem>
              <SelectItem value="vcard">👤 vCard / Contact</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <Label>Batch Input (one per line)</Label>
          <Textarea
            placeholder={getPlaceholder()}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={5}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {batchMode === 'whatsapp' && 'Format: +CountryCode Phone | Message'}
            {batchMode === 'email' && 'Format: email@example.com | Subject | Body'}
            {batchMode === 'wifi' && 'Format: SSID | Password | WPA/WEP/nopass'}
            {batchMode === 'vcard' && 'Format: FirstName LastName | Phone | Email | Company'}
            {(batchMode === 'url' || batchMode === 'text') && 'One URL or text per line'}
          </p>
        </div>

        {/* Quality & Zip Name */}
        <div className="grid grid-cols-2 gap-4">
          <QualitySelector value={quality} onChange={setQuality} />
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileArchive className="h-4 w-4" />
              ZIP Filename
            </Label>
            <Input
              value={zipName}
              onChange={(e) => setZipName(e.target.value)}
              placeholder="qr-codes-batch"
            />
          </div>
        </div>

        {/* Parse Button */}
        <div className="flex gap-2">
          <Button
            onClick={parseInput}
            variant="outline"
            className="flex-1"
            disabled={isGenerating || !inputText.trim()}
          >
            Parse Input
          </Button>
          <Button
            onClick={addSingleItem}
            variant="outline"
            size="icon"
            disabled={isGenerating}
          >
            <Plus className="h-4 w-4" />
          </Button>
          {items.length > 0 && (
            <Button
              onClick={clearAll}
              variant="ghost"
              size="icon"
              disabled={isGenerating}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Items List */}
        {items.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {items.length} items
              </span>
              <div className="flex gap-2 text-sm">
                {doneCount > 0 && (
                  <span className="text-success">{doneCount} ✓</span>
                )}
                {errorCount > 0 && (
                  <span className="text-destructive">{errorCount} ✗</span>
                )}
              </div>
            </div>

            {/* Progress */}
            {isGenerating && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  Generating... {Math.round(progress)}%
                </p>
              </div>
            )}

            {/* Items Preview */}
            <div className="max-h-60 overflow-y-auto space-y-2 scrollbar-thin">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50"
                  >
                    {item.status === 'pending' && (
                      <div className="w-4 h-4 rounded-full border-2 border-muted-foreground flex-shrink-0" />
                    )}
                    {item.status === 'generating' && (
                      <Loader2 className="w-4 h-4 animate-spin text-primary flex-shrink-0" />
                    )}
                    {item.status === 'done' && (
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    )}
                    {item.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <Input
                        value={item.filename}
                        onChange={(e) => updateItemFilename(item.id, e.target.value)}
                        className="h-7 text-xs font-mono"
                        placeholder="filename"
                      />
                    </div>
                    
                    <span className="truncate text-xs text-muted-foreground max-w-[100px]" title={item.content}>
                      {item.content.substring(0, 20)}...
                    </span>
                    
                    {item.dataUrl && (
                      <img 
                        src={item.dataUrl} 
                        alt="QR" 
                        className="w-8 h-8 rounded border flex-shrink-0"
                      />
                    )}
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={generateBatch}
                disabled={isGenerating || items.length === 0}
                className="flex-1 gradient-primary text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Layers className="h-4 w-4 mr-2" />
                    Generate All ({quality.toUpperCase()})
                  </>
                )}
              </Button>
              <Button
                onClick={downloadAll}
                disabled={doneCount === 0}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Download ZIP
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Layers, 
  Download, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { generateQRCanvas, generateQRContent } from '@/lib/qr-utils';
import type { QRDesignStyle } from '@/lib/qr-types';
import JSZip from 'jszip';

interface BatchItem {
  id: string;
  content: string;
  status: 'pending' | 'generating' | 'done' | 'error';
  dataUrl?: string;
}

interface BatchGeneratorProps {
  designStyle: QRDesignStyle;
  fgColor: string;
  bgColor: string;
}

export function BatchGenerator({ designStyle, fgColor, bgColor }: BatchGeneratorProps) {
  const [inputText, setInputText] = useState('');
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const parseInput = () => {
    const lines = inputText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) {
      toast.error('Please enter at least one URL or text');
      return;
    }

    if (lines.length > 50) {
      toast.error('Maximum 50 items allowed per batch');
      return;
    }

    const newItems: BatchItem[] = lines.map((line, index) => ({
      id: `batch-${Date.now()}-${index}`,
      content: line,
      status: 'pending' as const,
    }));

    setItems(newItems);
    toast.success(`${newItems.length} items ready to generate`);
  };

  const generateBatch = async () => {
    if (items.length === 0) {
      toast.error('Please add items first');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    const updatedItems = [...items];

    for (let i = 0; i < updatedItems.length; i++) {
      const item = updatedItems[i];
      
      // Update status to generating
      updatedItems[i] = { ...item, status: 'generating' };
      setItems([...updatedItems]);

      try {
        // Determine content type and generate
        let content = item.content;
        if (!content.startsWith('http://') && !content.startsWith('https://') && content.includes('.')) {
          content = 'https://' + content;
        }

        const canvas = await generateQRCanvas(content, {
          fgColor,
          bgColor,
          size: 512,
        });

        updatedItems[i] = {
          ...item,
          status: 'done',
          dataUrl: canvas.toDataURL('image/png'),
        };
      } catch (error) {
        console.error('Batch generation error:', error);
        updatedItems[i] = { ...item, status: 'error' };
      }

      setItems([...updatedItems]);
      setProgress(((i + 1) / updatedItems.length) * 100);
      
      // Small delay to prevent UI freeze
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
      // Single download
      const link = document.createElement('a');
      link.download = `qr-code-${Date.now()}.png`;
      link.href = successItems[0].dataUrl!;
      link.click();
      toast.success('Downloaded!');
      return;
    }

    // Multiple - create ZIP
    try {
      const zip = new JSZip();
      
      successItems.forEach((item, index) => {
        const base64 = item.dataUrl!.split(',')[1];
        const filename = `qr-${index + 1}-${item.content.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        zip.file(filename, base64, { base64: true });
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.download = `qr-codes-batch-${Date.now()}.zip`;
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

  return (
    <Card className="glass-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Layers className="h-5 w-5 text-primary" />
          Batch Generator
        </CardTitle>
        <CardDescription>
          Generate multiple QR codes at once. Enter one URL or text per line.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input */}
        <div className="space-y-2">
          <Label>URLs or Text (one per line)</Label>
          <Textarea
            placeholder={`https://example.com\nhttps://google.com\nHello World\n...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={5}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Maximum 50 items per batch
          </p>
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
              {doneCount > 0 && (
                <span className="text-sm text-success">
                  {doneCount} completed
                </span>
              )}
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
            <div className="max-h-40 overflow-y-auto space-y-1 scrollbar-thin">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 text-sm"
                  >
                    {item.status === 'pending' && (
                      <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                    )}
                    {item.status === 'generating' && (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    )}
                    {item.status === 'done' && (
                      <CheckCircle className="w-4 h-4 text-success" />
                    )}
                    {item.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    )}
                    <span className="truncate flex-1 font-mono text-xs">
                      {item.content}
                    </span>
                    {item.dataUrl && (
                      <img 
                        src={item.dataUrl} 
                        alt="QR" 
                        className="w-8 h-8 rounded border"
                      />
                    )}
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
                    Generate All
                  </>
                )}
              </Button>
              <Button
                onClick={downloadAll}
                disabled={doneCount === 0}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

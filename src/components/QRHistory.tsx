import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { QRHistoryItem, QRDesignStyle } from '@/lib/qr-types';
import { History, Trash2, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateQRCanvas, applyDesignStyle } from '@/lib/qr-utils';

interface QRHistoryProps {
  history: QRHistoryItem[];
  onLoadHistory: (item: QRHistoryItem) => void;
  onClearHistory: () => void;
}

// Generate a small preview thumbnail for display
async function generateThumbnail(
  content: string,
  design: QRDesignStyle,
  fgColor: string,
  bgColor: string
): Promise<string> {
  try {
    let canvas = await generateQRCanvas(content, {
      size: 150,
      fgColor,
      bgColor,
    });
    canvas = applyDesignStyle(canvas, design, fgColor, bgColor);
    return canvas.toDataURL('image/png');
  } catch {
    return '';
  }
}

export function QRHistory({ history, onLoadHistory, onClearHistory }: QRHistoryProps) {
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  // Generate thumbnails for history items
  const generateThumbnails = useCallback(async () => {
    const newThumbnails: Record<string, string> = {};
    const toLoad = history.filter(item => !thumbnails[item.id] && !loadingIds.has(item.id));
    
    if (toLoad.length === 0) return;
    
    setLoadingIds(prev => new Set([...prev, ...toLoad.map(i => i.id)]));
    
    for (const item of toLoad) {
      const thumb = await generateThumbnail(
        item.content,
        item.design,
        item.colors.fg,
        item.colors.bg
      );
      newThumbnails[item.id] = thumb;
    }
    
    setThumbnails(prev => ({ ...prev, ...newThumbnails }));
    setLoadingIds(prev => {
      const next = new Set(prev);
      toLoad.forEach(i => next.delete(i.id));
      return next;
    });
  }, [history, thumbnails, loadingIds]);

  useEffect(() => {
    generateThumbnails();
  }, [history]);

  if (history.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="py-12 text-center">
          <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No QR codes generated yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Generate your first QR code to see it here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5 text-primary" />
          History
          <span className="text-xs font-normal text-muted-foreground ml-1">
            (settings saved)
          </span>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearHistory}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto scrollbar-thin">
          <AnimatePresence>
            {history.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onLoadHistory(item)}
                className="group flex flex-col items-center p-3 rounded-xl border-2 border-border bg-card hover:border-primary/50 hover:shadow-md transition-all"
              >
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-white mb-2 flex items-center justify-center">
                  {thumbnails[item.id] ? (
                    <img
                      src={thumbnails[item.id]}
                      alt="QR Code"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <RefreshCw className="h-6 w-6 text-muted-foreground" />
                    </motion.div>
                  )}
                </div>
                <div className="w-full text-left space-y-1">
                  <span className="text-xs font-semibold text-primary uppercase">
                    {item.type}
                  </span>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.preview}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{item.timestamp}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}

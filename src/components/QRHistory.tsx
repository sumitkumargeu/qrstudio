import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { QRHistoryItem } from '@/lib/qr-types';
import { History, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QRHistoryProps {
  history: QRHistoryItem[];
  onLoadHistory: (item: QRHistoryItem) => void;
  onClearHistory: () => void;
}

export function QRHistory({ history, onLoadHistory, onClearHistory }: QRHistoryProps) {
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
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-white mb-2">
                  <img
                    src={item.dataUrl}
                    alt="QR Code"
                    className="w-full h-full object-contain"
                  />
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

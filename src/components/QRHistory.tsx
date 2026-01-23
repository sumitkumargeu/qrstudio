import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { QRHistoryItem } from '@/lib/qr-types';
import { History, Trash2, Clock, RefreshCw, ChevronDown, ChevronUp, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface QRHistoryProps {
  history: QRHistoryItem[];
  onLoadHistory: (item: QRHistoryItem) => void;
  onClearHistory: () => void;
  maxHistory: number;
  onMaxHistoryChange: (value: number) => void;
}

export function QRHistory({ 
  history, 
  onLoadHistory, 
  onClearHistory,
  maxHistory,
  onMaxHistoryChange,
}: QRHistoryProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

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
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5 text-primary" />
            History
            <Badge variant="secondary" className="ml-1">
              {history.length} / {maxHistory}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="text-muted-foreground"
            >
              <Settings2 className="h-4 w-4 mr-1" />
              Settings
              {settingsOpen ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearHistory}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>
        </div>
        
        {/* Settings Panel */}
        <AnimatePresence>
          {settingsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-3 border-t border-border mt-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Max History Items</Label>
                    <span className="text-sm font-medium text-primary">{maxHistory}</span>
                  </div>
                  <Slider
                    value={[maxHistory]}
                    onValueChange={(v) => onMaxHistoryChange(v[0])}
                    min={0}
                    max={50}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Set to 0 to disable history. Current: {history.length} items stored.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin">
          <AnimatePresence>
            {history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.03 }}
                className="group"
              >
                <button
                  onClick={() => onLoadHistory(item)}
                  className="w-full p-4 rounded-xl border-2 border-border bg-card hover:border-primary/50 hover:bg-secondary/30 transition-all text-left"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs font-semibold uppercase">
                          {item.type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {item.design}
                        </Badge>
                        {item.hasBorder && (
                          <Badge variant="secondary" className="text-xs">
                            Border
                          </Badge>
                        )}
                        {item.logoId && (
                          <Badge variant="secondary" className="text-xs">
                            Logo
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-foreground font-medium mt-2 truncate">
                        {item.preview}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.timestamp}
                        </span>
                        <span className="flex items-center gap-1">
                          <div 
                            className="w-3 h-3 rounded border border-border" 
                            style={{ backgroundColor: item.colors.fg }}
                          />
                          <div 
                            className="w-3 h-3 rounded border border-border" 
                            style={{ backgroundColor: item.colors.bg }}
                          />
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-primary"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Recreate
                      </Button>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}

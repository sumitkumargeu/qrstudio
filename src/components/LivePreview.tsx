import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { VerificationStatus, QRDesignStyle, LogoItem, LogoShape, LogoLayout, QRMode } from '@/lib/qr-types';
import { generateQRCanvas, generateQRContent, applyDesignStyle, addLogoToCanvas, addBorderToCanvas } from '@/lib/qr-utils';
import { CheckCircle, AlertTriangle, XCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';

interface LivePreviewProps {
  // Form data for generating content
  mode: QRMode;
  formData: Record<string, string>;
  // Design options
  designStyle: QRDesignStyle;
  fgColor: string;
  bgColor: string;
  enableLogo: boolean;
  logo: LogoItem | null;
  logoShape: LogoShape;
  logoLayout: LogoLayout;
  logoSize: number;
  enableBorder: boolean;
  borderWidth: number;
  borderColor: string;
  // Status
  verificationStatus: VerificationStatus;
  verificationMessage: string;
  // Callbacks
  onCanvasReady: (canvas: HTMLCanvasElement | null) => void;
  onContentChange: (content: string) => void;
}

export function LivePreview({
  mode,
  formData,
  designStyle,
  fgColor,
  bgColor,
  enableLogo,
  logo,
  logoShape,
  logoLayout,
  logoSize,
  enableBorder,
  borderWidth,
  borderColor,
  verificationStatus,
  verificationMessage,
  onCanvasReady,
  onContentChange,
}: LivePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasQR, setHasQR] = useState(false);
  const [livePreviewEnabled, setLivePreviewEnabled] = useState(true);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Generate content from form data
  const content = useMemo(() => {
    try {
      return generateQRContent(mode, formData);
    } catch {
      return '';
    }
  }, [mode, formData]);

  // Check if content is valid for QR generation
  const isContentValid = useMemo(() => {
    if (!content || content.length < 3) return false;
    
    switch (mode) {
      case 'url':
        return formData.url?.trim().length >= 3;
      case 'whatsapp':
        return formData.phone?.replace(/\D/g, '').length >= 7;
      case 'text':
        return formData.text?.trim().length > 0;
      case 'wifi':
        return formData.ssid?.trim().length > 0;
      case 'vcard':
        return (formData.firstName?.trim().length > 0) || (formData.lastName?.trim().length > 0);
      case 'email':
        return formData.email?.includes('@');
      default:
        return content.length > 0;
    }
  }, [mode, formData, content]);

  // Notify parent of content changes
  useEffect(() => {
    onContentChange(content);
  }, [content, onContentChange]);

  useEffect(() => {
    if (!livePreviewEnabled || !isContentValid) {
      setHasQR(false);
      onCanvasReady(null);
      return;
    }

    // Debounce the generation
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setIsGenerating(true);
      
      try {
        // Generate base QR canvas
        let canvas = await generateQRCanvas(content, {
          fgColor,
          bgColor,
          size: 400, // Preview size
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
          canvas = addBorderToCanvas(canvas, Math.floor(borderWidth / 2), borderColor);
        }

        // Display on visible canvas
        const displayCanvas = canvasRef.current;
        if (displayCanvas) {
          const ctx = displayCanvas.getContext('2d');
          displayCanvas.width = canvas.width;
          displayCanvas.height = canvas.height;
          ctx?.drawImage(canvas, 0, 0);
        }

        setHasQR(true);
        onCanvasReady(canvas);
      } catch (error) {
        console.error('Live preview error:', error);
        setHasQR(false);
        onCanvasReady(null);
      } finally {
        setIsGenerating(false);
      }
    }, 250); // Faster debounce for more responsive feel

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [
    content, isContentValid, designStyle, fgColor, bgColor,
    enableLogo, logo, logoShape, logoLayout, logoSize,
    enableBorder, borderWidth, borderColor, livePreviewEnabled, onCanvasReady
  ]);

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Live Preview Toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLivePreviewEnabled(!livePreviewEnabled)}
          className={cn(
            'gap-2 text-xs',
            livePreviewEnabled ? 'text-success' : 'text-muted-foreground'
          )}
        >
          {livePreviewEnabled ? (
            <>
              <Eye className="h-3 w-3" />
              Live Preview ON
            </>
          ) : (
            <>
              <EyeOff className="h-3 w-3" />
              Live Preview OFF
            </>
          )}
        </Button>
      </div>

      {/* Verification Badge */}
      <AnimatePresence>
        {verificationStatus !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
              verificationStatus === 'verifying' && 'bg-primary/10 text-primary',
              verificationStatus === 'verified' && 'bg-success/10 text-success',
              verificationStatus === 'warning' && 'bg-warning/10 text-warning',
              verificationStatus === 'error' && 'bg-destructive/10 text-destructive'
            )}
          >
            {verificationStatus === 'verifying' && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {verificationStatus === 'verified' && (
              <CheckCircle className="h-4 w-4" />
            )}
            {verificationStatus === 'warning' && (
              <AlertTriangle className="h-4 w-4" />
            )}
            {verificationStatus === 'error' && (
              <XCircle className="h-4 w-4" />
            )}
            <span>{verificationMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Canvas Container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          'relative rounded-2xl bg-white p-5 shadow-xl transition-all duration-300',
          enableBorder && 'ring-4 ring-foreground ring-offset-2 ring-offset-background',
          hasQR && 'shadow-glow'
        )}
        style={{
          boxShadow: hasQR
            ? '0 20px 60px -15px rgba(0, 0, 0, 0.15)'
            : undefined,
        }}
      >
        {/* Generating Overlay */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 rounded-2xl"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </motion.div>
          )}
        </AnimatePresence>

        {!hasQR ? (
          <div className="w-56 h-56 md:w-64 md:h-64 flex flex-col items-center justify-center text-muted-foreground space-y-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl"
            >
              📱
            </motion.div>
            <p className="text-sm text-center">
              {livePreviewEnabled 
                ? 'Start typing to see live preview'
                : 'Click Generate to create QR'
              }
            </p>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="w-56 h-56 md:w-64 md:h-64 rounded-lg"
            style={{ imageRendering: 'crisp-edges' }}
          />
        )}
      </motion.div>
    </div>
  );
}

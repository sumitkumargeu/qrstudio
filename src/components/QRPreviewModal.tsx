import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useCallback, useState } from 'react';
import { generateQRCanvas, applyDesignStyle, addLogoToCanvas, addBorderToCanvas, copyCanvasToClipboard, shareCanvas } from '@/lib/qr-utils';
import type { QRDesignStyle, LogoItem, LogoShape, LogoLayout } from '@/lib/qr-types';
import { toast } from 'sonner';

interface QRPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
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
}

export function QRPreviewModal({
  isOpen,
  onClose,
  content,
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
}: QRPreviewModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);

  // Generate high quality QR for modal
  const generateHQPreview = useCallback(async () => {
    if (!content || !isOpen) return;

    try {
      let canvas = await generateQRCanvas(content, {
        size: 1024,
        fgColor,
        bgColor,
      });

      canvas = applyDesignStyle(canvas, designStyle, fgColor, bgColor);

      if (enableLogo && logo) {
        canvas = await addLogoToCanvas(canvas, logo, {
          shape: logoShape,
          layout: logoLayout,
          size: logoSize,
          bgColor,
        });
      }

      if (enableBorder) {
        canvas = addBorderToCanvas(canvas, borderWidth, borderColor);
      }

      setCanvasRef(canvas);
      setQrDataUrl(canvas.toDataURL('image/png'));
    } catch (error) {
      console.error('Error generating HQ preview:', error);
    }
  }, [content, isOpen, fgColor, bgColor, designStyle, enableLogo, logo, logoShape, logoLayout, logoSize, enableBorder, borderWidth, borderColor]);

  useEffect(() => {
    generateHQPreview();
  }, [generateHQPreview]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `qr-code-hq.png`;
    link.href = qrDataUrl;
    link.click();
    toast.success('Downloaded!');
  };

  const handleCopy = async () => {
    if (!canvasRef) return;
    const success = await copyCanvasToClipboard(canvasRef);
    if (success) {
      toast.success('Copied to clipboard!');
    } else {
      toast.error('Failed to copy');
    }
  };

  const handleShare = async () => {
    if (!canvasRef) return;
    const success = await shareCanvas(canvasRef);
    if (!success) {
      handleDownload();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute -top-12 right-0 text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>

            {/* QR Preview */}
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code Preview"
                  className="max-w-[70vw] max-h-[60vh] object-contain"
                  style={{ imageRendering: 'crisp-edges' }}
                />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button
                variant="secondary"
                onClick={handleCopy}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              <Button
                variant="secondary"
                onClick={handleShare}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>

            {/* Content Preview */}
            {content && (
              <p className="text-white/70 text-sm text-center max-w-md truncate">
                {content}
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

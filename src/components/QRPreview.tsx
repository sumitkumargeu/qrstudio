import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { VerificationStatus } from '@/lib/qr-types';
import { CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';

interface QRPreviewProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  hasQR: boolean;
  hasBorder: boolean;
  verificationStatus: VerificationStatus;
  verificationMessage: string;
}

export function QRPreview({
  canvasRef,
  hasQR,
  hasBorder,
  verificationStatus,
  verificationMessage,
}: QRPreviewProps) {
  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Verification Badge */}
      {verificationStatus !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
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

      {/* QR Canvas Container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          'relative rounded-2xl bg-white p-5 shadow-xl transition-all duration-300',
          hasBorder && 'ring-4 ring-foreground ring-offset-2 ring-offset-background',
          hasQR && 'shadow-glow'
        )}
        style={{
          boxShadow: hasQR
            ? '0 20px 60px -15px rgba(0, 0, 0, 0.15)'
            : undefined,
        }}
      >
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
              Your QR code will appear here
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

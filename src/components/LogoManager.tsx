import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Upload, 
  X, 
  Download, 
  Image as ImageIcon,
  Check,
  Loader2
} from 'lucide-react';
import type { LogoItem } from '@/lib/qr-types';
import { PRESET_LOGOS } from '@/lib/qr-types';
import { fetchFavicon } from '@/lib/qr-utils';
import { toast } from 'sonner';

interface LogoManagerProps {
  selectedLogo: LogoItem | null;
  onLogoChange: (logo: LogoItem | null) => void;
  urlValue?: string;
}

export function LogoManager({ selectedLogo, onLogoChange, urlValue }: LogoManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [customLogos, setCustomLogos] = useState<LogoItem[]>([]);
  const [fetchStatus, setFetchStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const allLogos = [...PRESET_LOGOS, ...customLogos];

  const handleFetchFavicon = async () => {
    if (!urlValue || urlValue.length < 3) {
      toast.error('Please enter a valid URL first');
      return;
    }

    setFetchStatus('loading');
    setIsLoading(true);

    try {
      const faviconData = await fetchFavicon(urlValue);
      
      if (faviconData) {
        const hostname = new URL(
          urlValue.startsWith('http') ? urlValue : `https://${urlValue}`
        ).hostname;

        const newLogo: LogoItem = {
          id: `favicon-${Date.now()}`,
          name: hostname,
          type: 'auto',
          data: faviconData,
          source: urlValue,
        };

        setCustomLogos((prev) => [newLogo, ...prev]);
        onLogoChange(newLogo);
        setFetchStatus('success');
        toast.success('Favicon fetched successfully!');
      } else {
        setFetchStatus('error');
        toast.error('Could not fetch favicon. Try uploading manually.');
      }
    } catch {
      setFetchStatus('error');
      toast.error('Failed to fetch favicon');
    } finally {
      setIsLoading(false);
      setTimeout(() => setFetchStatus('idle'), 3000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      
      const img = new Image();
      img.onload = () => {
        // Resize if needed
        const maxSize = 512;
        let { width, height } = img;
        
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          const newLogo: LogoItem = {
            id: `custom-${Date.now()}`,
            name: file.name.replace(/\.[^/.]+$/, '').substring(0, 15),
            type: 'custom',
            data: canvas.toDataURL('image/png'),
          };

          setCustomLogos((prev) => [newLogo, ...prev]);
          onLogoChange(newLogo);
          toast.success('Logo uploaded successfully!');
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  const handleRemoveLogo = (logoId: string) => {
    setCustomLogos((prev) => prev.filter((l) => l.id !== logoId));
    if (selectedLogo?.id === logoId) {
      onLogoChange(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Fetch Favicon Button */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Auto-Fetch Logo from URL</Label>
        <Button
          variant="outline"
          onClick={handleFetchFavicon}
          disabled={isLoading}
          className={cn(
            'w-full gap-2 transition-all',
            fetchStatus === 'success' && 'border-success text-success',
            fetchStatus === 'error' && 'border-destructive text-destructive'
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Fetching...
            </>
          ) : fetchStatus === 'success' ? (
            <>
              <Check className="h-4 w-4" />
              Fetched!
            </>
          ) : fetchStatus === 'error' ? (
            <>
              <X className="h-4 w-4" />
              Failed - Try uploading
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Fetch Favicon from URL
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          Automatically fetches the website's favicon/logo
        </p>
      </div>

      {/* Divider */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-card px-3 text-sm text-muted-foreground">OR</span>
        </div>
      </div>

      {/* Upload Custom Logo */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Upload Custom Logo</Label>
        <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-all">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Click to upload</span>
          <span className="text-xs text-muted-foreground">PNG, JPG, SVG up to 5MB</span>
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Logo Gallery */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Logo Gallery</Label>
          {selectedLogo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLogoChange(null)}
              className="h-auto py-1 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear Selection
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto scrollbar-thin p-1">
          <AnimatePresence>
            {allLogos.map((logo) => (
              <motion.button
                key={logo.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onLogoChange(selectedLogo?.id === logo.id ? null : logo)}
                className={cn(
                  'relative aspect-square p-2 rounded-lg border-2 transition-all bg-white',
                  selectedLogo?.id === logo.id
                    ? 'border-primary shadow-glow'
                    : 'border-border hover:border-primary/50'
                )}
              >
                {logo.type === 'preset' ? (
                  <img
                    src={logo.data}
                    alt={logo.name}
                    className="w-full h-full object-contain"
                    style={{ filter: 'brightness(0)' }}
                  />
                ) : (
                  <img
                    src={logo.data}
                    alt={logo.name}
                    className="w-full h-full object-contain rounded"
                  />
                )}

                {/* Auto badge */}
                {logo.type === 'auto' && (
                  <span className="absolute -top-1 -right-1 text-[8px] font-bold px-1.5 py-0.5 rounded bg-accent text-accent-foreground">
                    AUTO
                  </span>
                )}

                {/* Remove button for custom logos */}
                {logo.type !== 'preset' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveLogo(logo.id);
                    }}
                    className="absolute -top-1 -left-1 p-0.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}

                {/* Selection indicator */}
                {selectedLogo?.id === logo.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 p-0.5 rounded-full bg-primary"
                  >
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </AnimatePresence>

          {allLogos.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-8 text-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No logos yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

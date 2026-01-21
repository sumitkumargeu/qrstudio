import QRCode from 'qrcode';
import type { 
  QRMode, 
  QRDesignStyle, 
  LogoItem, 
  LogoShape, 
  LogoLayout,
  WifiAuthType,
  VCardData 
} from './qr-types';

// Generate QR content based on mode
export function generateQRContent(
  mode: QRMode,
  data: Record<string, string>
): string {
  switch (mode) {
    case 'url': {
      let url = data.url?.trim() || '';
      if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      return url;
    }
    case 'whatsapp': {
      const phone = data.phone?.replace(/\D/g, '') || '';
      const countryCode = data.countryCode || '91';
      const message = data.message ? encodeURIComponent(data.message) : '';
      return `https://wa.me/${countryCode}${phone}${message ? `?text=${message}` : ''}`;
    }
    case 'text':
      return data.text || '';
    case 'wifi': {
      const ssid = data.ssid || '';
      const password = data.password || '';
      const authType: WifiAuthType = (data.authType as WifiAuthType) || 'WPA';
      const hidden = data.hidden === 'true' ? 'H:true' : '';
      return `WIFI:T:${authType};S:${ssid};P:${password};${hidden};`;
    }
    case 'vcard': {
      const vcard: VCardData = {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        email: data.email || '',
        company: data.company,
        title: data.title,
        website: data.website,
        address: data.address,
      };
      return generateVCardString(vcard);
    }
    case 'email': {
      const email = data.email || '';
      const subject = data.subject ? encodeURIComponent(data.subject) : '';
      const body = data.body ? encodeURIComponent(data.body) : '';
      const params = [];
      if (subject) params.push(`subject=${subject}`);
      if (body) params.push(`body=${body}`);
      return `mailto:${email}${params.length ? '?' + params.join('&') : ''}`;
    }
    default:
      return '';
  }
}

// Generate vCard string
function generateVCardString(data: VCardData): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${data.lastName};${data.firstName};;;`,
    `FN:${data.firstName} ${data.lastName}`,
  ];

  if (data.phone) lines.push(`TEL:${data.phone}`);
  if (data.email) lines.push(`EMAIL:${data.email}`);
  if (data.company) lines.push(`ORG:${data.company}`);
  if (data.title) lines.push(`TITLE:${data.title}`);
  if (data.website) lines.push(`URL:${data.website}`);
  if (data.address) lines.push(`ADR:;;${data.address};;;;`);

  lines.push('END:VCARD');
  return lines.join('\n');
}

// Generate QR code as canvas
export async function generateQRCanvas(
  content: string,
  options: {
    size?: number;
    fgColor?: string;
    bgColor?: string;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  } = {}
): Promise<HTMLCanvasElement> {
  const {
    size = 800,
    fgColor = '#000000',
    bgColor = '#ffffff',
    errorCorrectionLevel = 'H',
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  await QRCode.toCanvas(canvas, content, {
    width: size,
    margin: 2,
    color: {
      dark: fgColor,
      light: bgColor,
    },
    errorCorrectionLevel,
  });

  return canvas;
}

// Apply design style to QR canvas
export function applyDesignStyle(
  canvas: HTMLCanvasElement,
  style: QRDesignStyle,
  fgColor: string,
  bgColor: string
): HTMLCanvasElement {
  if (style === 'square') return canvas;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const newCanvas = document.createElement('canvas');
  newCanvas.width = canvas.width;
  newCanvas.height = canvas.height;
  const newCtx = newCanvas.getContext('2d');
  if (!newCtx) return canvas;

  // Fill background
  newCtx.fillStyle = bgColor;
  newCtx.fillRect(0, 0, newCanvas.width, newCanvas.height);

  // Detect module size
  const moduleSize = Math.floor(canvas.width / 37); // Approximate

  newCtx.fillStyle = fgColor;

  for (let y = 0; y < canvas.height; y += moduleSize) {
    for (let x = 0; x < canvas.width; x += moduleSize) {
      const pixelIndex = (y * canvas.width + x) * 4;
      const isDark = imageData.data[pixelIndex] < 128;

      if (isDark) {
        drawStyledModule(newCtx, x, y, moduleSize, style);
      }
    }
  }

  return newCanvas;
}

// Draw styled module
function drawStyledModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  style: QRDesignStyle
): void {
  const padding = size * 0.1;
  const actualSize = size - padding * 2;

  switch (style) {
    case 'rounded': {
      const radius = actualSize / 4;
      ctx.beginPath();
      ctx.roundRect(x + padding, y + padding, actualSize, actualSize, radius);
      ctx.fill();
      break;
    }
    case 'dots': {
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, actualSize / 2.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'classy': {
      ctx.fillRect(x + padding, y + padding, actualSize, actualSize);
      break;
    }
    case 'classy-rounded': {
      const radius = actualSize / 3;
      ctx.beginPath();
      ctx.roundRect(x + padding, y + padding, actualSize, actualSize, radius);
      ctx.fill();
      break;
    }
    case 'extra-rounded': {
      const radius = actualSize / 2;
      ctx.beginPath();
      ctx.roundRect(x + padding, y + padding, actualSize, actualSize, radius);
      ctx.fill();
      break;
    }
    case 'diamond': {
      ctx.beginPath();
      ctx.moveTo(x + size / 2, y + padding);
      ctx.lineTo(x + size - padding, y + size / 2);
      ctx.lineTo(x + size / 2, y + size - padding);
      ctx.lineTo(x + padding, y + size / 2);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'star': {
      drawStar(ctx, x + size / 2, y + size / 2, actualSize / 2, 4);
      break;
    }
    case 'fluid': {
      const radius = actualSize / 2.5;
      ctx.beginPath();
      ctx.roundRect(x + padding, y + padding, actualSize, actualSize, radius);
      ctx.fill();
      break;
    }
    default:
      ctx.fillRect(x, y, size, size);
  }
}

// Draw star shape
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  points: number
): void {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? radius : radius * 0.5;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.fill();
}

// Add logo to QR canvas
export async function addLogoToCanvas(
  canvas: HTMLCanvasElement,
  logo: LogoItem,
  options: {
    shape: LogoShape;
    layout: LogoLayout;
    size: number;
    bgColor: string;
  }
): Promise<HTMLCanvasElement> {
  const { shape, layout, size, bgColor } = options;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Load logo image
  const logoImg = await loadImage(logo.data);
  if (!logoImg) return canvas;

  const logoSize = canvas.width * (size / 100);
  const position = calculateLogoPosition(canvas, layout, logoSize);

  // Draw background padding
  const padding = logoSize * 0.15;
  ctx.fillStyle = bgColor;

  if (shape === 'circle') {
    ctx.beginPath();
    ctx.arc(
      position.x + logoSize / 2,
      position.y + logoSize / 2,
      logoSize / 2 + padding,
      0,
      Math.PI * 2
    );
    ctx.fill();
  } else if (shape === 'rounded') {
    const radius = logoSize / 6;
    ctx.beginPath();
    ctx.roundRect(
      position.x - padding,
      position.y - padding,
      logoSize + padding * 2,
      logoSize + padding * 2,
      radius
    );
    ctx.fill();
  } else {
    ctx.fillRect(
      position.x - padding,
      position.y - padding,
      logoSize + padding * 2,
      logoSize + padding * 2
    );
  }

  // Draw logo with clipping
  ctx.save();
  if (shape === 'circle') {
    ctx.beginPath();
    ctx.arc(
      position.x + logoSize / 2,
      position.y + logoSize / 2,
      logoSize / 2,
      0,
      Math.PI * 2
    );
    ctx.clip();
  } else if (shape === 'rounded') {
    const radius = logoSize / 6;
    ctx.beginPath();
    ctx.roundRect(position.x, position.y, logoSize, logoSize, radius);
    ctx.clip();
  }

  ctx.drawImage(logoImg, position.x, position.y, logoSize, logoSize);
  ctx.restore();

  return canvas;
}

// Calculate logo position based on layout
function calculateLogoPosition(
  canvas: HTMLCanvasElement,
  layout: LogoLayout,
  logoSize: number
): { x: number; y: number } {
  const margin = canvas.width * 0.08;

  switch (layout) {
    case 'center':
      return {
        x: (canvas.width - logoSize) / 2,
        y: (canvas.height - logoSize) / 2,
      };
    case 'bottom-right':
      return {
        x: canvas.width - logoSize - margin,
        y: canvas.height - logoSize - margin,
      };
    case 'bottom-left':
      return {
        x: margin,
        y: canvas.height - logoSize - margin,
      };
    case 'top-right':
      return {
        x: canvas.width - logoSize - margin,
        y: margin,
      };
    case 'top-left':
      return {
        x: margin,
        y: margin,
      };
    case 'watermark':
      return {
        x: (canvas.width - logoSize) / 2,
        y: canvas.height - logoSize - margin * 2,
      };
    default:
      return {
        x: (canvas.width - logoSize) / 2,
        y: (canvas.height - logoSize) / 2,
      };
  }
}

// Load image from URL or data
async function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
    // Timeout after 5 seconds
    setTimeout(() => resolve(null), 5000);
  });
}

// Add border to canvas
export function addBorderToCanvas(
  canvas: HTMLCanvasElement,
  borderWidth: number,
  borderColor: string
): HTMLCanvasElement {
  const newCanvas = document.createElement('canvas');
  const totalBorder = borderWidth * 2;
  newCanvas.width = canvas.width + totalBorder;
  newCanvas.height = canvas.height + totalBorder;

  const ctx = newCanvas.getContext('2d');
  if (!ctx) return canvas;

  // Fill border
  ctx.fillStyle = borderColor;
  ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);

  // Draw original canvas
  ctx.drawImage(canvas, borderWidth, borderWidth);

  return newCanvas;
}

// Fetch favicon from URL with improved reliability
export async function fetchFavicon(url: string): Promise<string | null> {
  try {
    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    const urlObj = new URL(normalizedUrl);
    const domain = urlObj.hostname;

    // Multiple favicon sources with priority
    const sources = [
      // High-res favicon APIs (most reliable)
      `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
      `https://icons.duckduckgo.com/ip3/${domain}.ico`,
      `https://logo.clearbit.com/${domain}`,
      `https://api.faviconkit.com/${domain}/256`,
      // Direct favicon paths
      `${urlObj.origin}/apple-touch-icon.png`,
      `${urlObj.origin}/apple-touch-icon-precomposed.png`,
      `${urlObj.origin}/favicon-32x32.png`,
      `${urlObj.origin}/favicon.ico`,
    ];

    for (const src of sources) {
      try {
        const result = await loadFaviconImage(src);
        if (result) {
          return result;
        }
      } catch {
        continue;
      }
    }
    return null;
  } catch (error) {
    console.error('Favicon fetch error:', error);
    return null;
  }
}

// Helper function to load and convert favicon to base64
async function loadFaviconImage(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    const timeout = setTimeout(() => {
      img.src = '';
      resolve(null);
    }, 5000);

    img.onload = () => {
      clearTimeout(timeout);
      
      // Skip very small images (likely placeholder)
      if (img.width < 16 || img.height < 16) {
        resolve(null);
        return;
      }

      try {
        const canvas = document.createElement('canvas');
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // Calculate scaling to fit and center
          const scale = Math.min(size / img.width, size / img.height);
          const width = img.width * scale;
          const height = img.height * scale;
          const x = (size - width) / 2;
          const y = (size - height) / 2;
          
          // Fill with white background for transparent images
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, size, size);
          
          ctx.drawImage(img, x, y, width, height);
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve(null);
        }
      } catch {
        resolve(null);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve(null);
    };

    img.src = src;
  });
}

// Validate URL
export function isValidUrl(url: string): boolean {
  try {
    const urlToTest = url.startsWith('http') ? url : `https://${url}`;
    new URL(urlToTest);
    return url.length >= 3;
  } catch {
    return false;
  }
}

// Download canvas as image
export function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename: string = 'qr-code'
): void {
  const link = document.createElement('a');
  link.download = `${filename}-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// Copy canvas to clipboard
export async function copyCanvasToClipboard(
  canvas: HTMLCanvasElement
): Promise<boolean> {
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve(false);
        return;
      }

      try {
        if (navigator.clipboard && navigator.clipboard.write) {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          resolve(true);
        } else {
          resolve(false);
        }
      } catch {
        resolve(false);
      }
    });
  });
}

// Share canvas
export async function shareCanvas(canvas: HTMLCanvasElement): Promise<boolean> {
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve(false);
        return;
      }

      try {
        const file = new File([blob], 'qr-code.png', { type: 'image/png' });
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'QR Code',
            text: 'Check out this QR code!',
          });
          resolve(true);
        } else {
          resolve(false);
        }
      } catch {
        resolve(false);
      }
    });
  });
}

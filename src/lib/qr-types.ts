// QR Code Mode Types
export type QRMode = 'url' | 'whatsapp' | 'text' | 'wifi' | 'vcard' | 'email';

// QR Design Styles
export type QRDesignStyle = 
  | 'square' 
  | 'rounded' 
  | 'dots' 
  | 'classy' 
  | 'classy-rounded'
  | 'extra-rounded'
  | 'diamond'
  | 'star'
  | 'fluid';

// Logo Shape Types
export type LogoShape = 'square' | 'rounded' | 'circle';

// Logo Layout Types
export type LogoLayout = 
  | 'center' 
  | 'bottom-right' 
  | 'bottom-left'
  | 'top-right'
  | 'top-left'
  | 'watermark';

// Verification Status
export type VerificationStatus = 'idle' | 'verifying' | 'verified' | 'warning' | 'error';

// Logo Item
export interface LogoItem {
  id: string;
  name: string;
  type: 'preset' | 'custom' | 'auto';
  data: string; // base64 or URL
  source?: string;
}

// QR History Item
export interface QRHistoryItem {
  id: string;
  type: QRMode;
  content: string;
  preview: string;
  timestamp: string;
  dataUrl: string;
  design: QRDesignStyle;
  colors: {
    fg: string;
    bg: string;
  };
  hasBorder?: boolean;
}

// Country Code
export interface CountryCode {
  code: string;
  name: string;
  dial: string;
}

// WiFi Auth Types
export type WifiAuthType = 'WPA' | 'WEP' | 'nopass';

// vCard Data
export interface VCardData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company?: string;
  title?: string;
  website?: string;
  address?: string;
}

// QR Generator Options
export interface QRGeneratorOptions {
  mode: QRMode;
  content: string;
  design: QRDesignStyle;
  fgColor: string;
  bgColor: string;
  logo?: LogoItem | null;
  logoShape: LogoShape;
  logoLayout: LogoLayout;
  logoSize: number;
  hasBorder: boolean;
  borderWidth: number;
  borderColor: string;
}

// Preset Logos
export const PRESET_LOGOS: LogoItem[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    type: 'preset',
    data: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/whatsapp.svg',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    type: 'preset',
    data: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    type: 'preset',
    data: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    type: 'preset',
    data: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg',
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    type: 'preset',
    data: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/x.svg',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    type: 'preset',
    data: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/youtube.svg',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    type: 'preset',
    data: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tiktok.svg',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    type: 'preset',
    data: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/telegram.svg',
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    type: 'preset',
    data: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/snapchat.svg',
  },
  {
    id: 'discord',
    name: 'Discord',
    type: 'preset',
    data: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/discord.svg',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    type: 'preset',
    data: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/spotify.svg',
  },
  {
    id: 'github',
    name: 'GitHub',
    type: 'preset',
    data: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg',
  },
];

// Design Style Options
export const DESIGN_STYLES: { value: QRDesignStyle; label: string; icon: string }[] = [
  { value: 'square', label: 'Square', icon: '⬛' },
  { value: 'rounded', label: 'Rounded', icon: '🔲' },
  { value: 'dots', label: 'Dots', icon: '⚪' },
  { value: 'classy', label: 'Classy', icon: '💎' },
  { value: 'classy-rounded', label: 'Classy Round', icon: '✨' },
  { value: 'extra-rounded', label: 'Extra Round', icon: '🔵' },
  { value: 'diamond', label: 'Diamond', icon: '♦️' },
  { value: 'star', label: 'Star', icon: '⭐' },
  { value: 'fluid', label: 'Fluid', icon: '💧' },
];

// Logo Shape Options
export const LOGO_SHAPES: { value: LogoShape; label: string; icon: string }[] = [
  { value: 'square', label: 'Square', icon: '⬜' },
  { value: 'rounded', label: 'Rounded', icon: '🔳' },
  { value: 'circle', label: 'Circle', icon: '⭕' },
];

// Logo Layout Options
export const LOGO_LAYOUTS: { value: LogoLayout; label: string; icon: string }[] = [
  { value: 'center', label: 'Center', icon: '⊙' },
  { value: 'bottom-right', label: 'Bottom Right', icon: '↘' },
  { value: 'bottom-left', label: 'Bottom Left', icon: '↙' },
  { value: 'top-right', label: 'Top Right', icon: '↗' },
  { value: 'top-left', label: 'Top Left', icon: '↖' },
  { value: 'watermark', label: 'Watermark', icon: '💧' },
];

// Common Country Codes
export const COUNTRY_CODES: CountryCode[] = [
  { code: 'IN', name: 'India', dial: '91' },
  { code: 'US', name: 'United States', dial: '1' },
  { code: 'GB', name: 'United Kingdom', dial: '44' },
  { code: 'CA', name: 'Canada', dial: '1' },
  { code: 'AU', name: 'Australia', dial: '61' },
  { code: 'DE', name: 'Germany', dial: '49' },
  { code: 'FR', name: 'France', dial: '33' },
  { code: 'JP', name: 'Japan', dial: '81' },
  { code: 'CN', name: 'China', dial: '86' },
  { code: 'BR', name: 'Brazil', dial: '55' },
  { code: 'AE', name: 'UAE', dial: '971' },
  { code: 'SG', name: 'Singapore', dial: '65' },
  { code: 'MY', name: 'Malaysia', dial: '60' },
  { code: 'ID', name: 'Indonesia', dial: '62' },
  { code: 'PH', name: 'Philippines', dial: '63' },
  { code: 'TH', name: 'Thailand', dial: '66' },
  { code: 'VN', name: 'Vietnam', dial: '84' },
  { code: 'KR', name: 'South Korea', dial: '82' },
  { code: 'IT', name: 'Italy', dial: '39' },
  { code: 'ES', name: 'Spain', dial: '34' },
  { code: 'NL', name: 'Netherlands', dial: '31' },
  { code: 'BE', name: 'Belgium', dial: '32' },
  { code: 'CH', name: 'Switzerland', dial: '41' },
  { code: 'AT', name: 'Austria', dial: '43' },
  { code: 'PL', name: 'Poland', dial: '48' },
  { code: 'RU', name: 'Russia', dial: '7' },
  { code: 'ZA', name: 'South Africa', dial: '27' },
  { code: 'NG', name: 'Nigeria', dial: '234' },
  { code: 'EG', name: 'Egypt', dial: '20' },
  { code: 'SA', name: 'Saudi Arabia', dial: '966' },
  { code: 'PK', name: 'Pakistan', dial: '92' },
  { code: 'BD', name: 'Bangladesh', dial: '880' },
  { code: 'MX', name: 'Mexico', dial: '52' },
  { code: 'AR', name: 'Argentina', dial: '54' },
  { code: 'CO', name: 'Colombia', dial: '57' },
  { code: 'CL', name: 'Chile', dial: '56' },
  { code: 'PE', name: 'Peru', dial: '51' },
  { code: 'NZ', name: 'New Zealand', dial: '64' },
  { code: 'IE', name: 'Ireland', dial: '353' },
  { code: 'SE', name: 'Sweden', dial: '46' },
  { code: 'NO', name: 'Norway', dial: '47' },
  { code: 'DK', name: 'Denmark', dial: '45' },
  { code: 'FI', name: 'Finland', dial: '358' },
  { code: 'PT', name: 'Portugal', dial: '351' },
  { code: 'GR', name: 'Greece', dial: '30' },
  { code: 'TR', name: 'Turkey', dial: '90' },
  { code: 'IL', name: 'Israel', dial: '972' },
  { code: 'HK', name: 'Hong Kong', dial: '852' },
  { code: 'TW', name: 'Taiwan', dial: '886' },
];

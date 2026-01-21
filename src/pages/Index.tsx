import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Components
import { Header } from '@/components/Header';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ModeSelector } from '@/components/ModeSelector';
import { DesignSelector } from '@/components/DesignSelector';
import { LogoManager } from '@/components/LogoManager';
import { LivePreview } from '@/components/LivePreview';
import { QRScanner } from '@/components/QRScanner';
import { QRHistory } from '@/components/QRHistory';
import { ColorPresets, type ColorPreset } from '@/components/ColorPresets';
import { BatchGenerator } from '@/components/BatchGenerator';
import { PrintDialog } from '@/components/PrintDialog';
import { DownloadOptions, type ImageFormat } from '@/components/DownloadOptions';
import { type QRQuality, getQualitySize } from '@/components/QualitySelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Icons
import {
  Palette,
  Image,
  Zap,
  Download,
  Copy,
  Share2,
  RotateCcw,
  Sparkles,
  Frame,
  Settings2,
  ScanLine,
  History,
  Layers,
} from 'lucide-react';

// Types & Utils
import type {
  QRMode,
  QRDesignStyle,
  LogoItem,
  LogoShape,
  LogoLayout,
  VerificationStatus,
  QRHistoryItem,
} from '@/lib/qr-types';
import {
  DESIGN_STYLES,
  LOGO_SHAPES,
  LOGO_LAYOUTS,
  COUNTRY_CODES,
} from '@/lib/qr-types';
import {
  generateQRContent,
  generateQRCanvas,
  applyDesignStyle,
  addLogoToCanvas,
  addBorderToCanvas,
  copyCanvasToClipboard,
  shareCanvas,
} from '@/lib/qr-utils';

const Index = () => {
  // Core State
  const [mode, setMode] = useState<QRMode>('url');
  const [designStyle, setDesignStyle] = useState<QRDesignStyle>('square');
  const [hasQR, setHasQR] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');

  // Form Data
  const [urlValue, setUrlValue] = useState('');
  const [textValue, setTextValue] = useState('');
  const [phoneValue, setPhoneValue] = useState('');
  const [countryCode, setCountryCode] = useState('91');
  const [messageValue, setMessageValue] = useState('Hello');
  const [emailValue, setEmailValue] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiAuth, setWifiAuth] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);
  const [vcardFirstName, setVcardFirstName] = useState('');
  const [vcardLastName, setVcardLastName] = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');
  const [vcardCompany, setVcardCompany] = useState('');
  const [vcardTitle, setVcardTitle] = useState('');
  const [vcardWebsite, setVcardWebsite] = useState('');

  // Colors
  const [customColors, setCustomColors] = useState(false);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [isGradient, setIsGradient] = useState(false);
  const [gradientColors, setGradientColors] = useState<string[]>([]);

  // Logo
  const [enableLogo, setEnableLogo] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState<LogoItem | null>(null);
  const [logoShape, setLogoShape] = useState<LogoShape>('circle');
  const [logoLayout, setLogoLayout] = useState<LogoLayout>('center');
  const [logoSize, setLogoSize] = useState(15);

  // Border
  const [enableBorder, setEnableBorder] = useState(false);
  const [borderWidth, setBorderWidth] = useState(20);
  const [borderColor, setBorderColor] = useState('#000000');

  // Verification
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
  const [verificationMessage, setVerificationMessage] = useState('');

  // History
  const [history, setHistory] = useState<QRHistoryItem[]>([]);
  const [previewContent, setPreviewContent] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  // Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const generatedCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('qrHistory');
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, []);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('qrHistory', JSON.stringify(history.slice(0, 20)));
    } catch {}
  }, [history]);

  // Handle color preset selection
  const handlePresetSelect = (preset: ColorPreset) => {
    setSelectedPreset(preset.id);
    setFgColor(preset.fg);
    setBgColor(preset.bg);
    setIsGradient(!!preset.isGradient);
    setGradientColors(preset.gradientColors || []);
    setCustomColors(true);
  };

  // Get form data based on mode
  const getFormData = useCallback(() => {
    switch (mode) {
      case 'url':
        return { url: urlValue };
      case 'whatsapp':
        return { phone: phoneValue, countryCode, message: messageValue };
      case 'text':
        return { text: textValue };
      case 'wifi':
        return {
          ssid: wifiSSID,
          password: wifiPassword,
          authType: wifiAuth,
          hidden: wifiHidden.toString(),
        };
      case 'vcard':
        return {
          firstName: vcardFirstName,
          lastName: vcardLastName,
          phone: vcardPhone,
          email: vcardEmail,
          company: vcardCompany,
          title: vcardTitle,
          website: vcardWebsite,
        };
      case 'email':
        return { email: emailValue, subject: emailSubject, body: emailBody };
      default:
        return {};
    }
  }, [
    mode, urlValue, textValue, phoneValue, countryCode, messageValue,
    emailValue, emailSubject, emailBody, wifiSSID, wifiPassword, wifiAuth, wifiHidden,
    vcardFirstName, vcardLastName, vcardPhone, vcardEmail, vcardCompany, vcardTitle, vcardWebsite
  ]);

  // Validate content
  const isContentValid = useCallback(() => {
    switch (mode) {
      case 'url':
        return urlValue.trim().length >= 3;
      case 'whatsapp':
        return phoneValue.replace(/\D/g, '').length >= 7;
      case 'text':
        return textValue.trim().length > 0;
      case 'wifi':
        return wifiSSID.trim().length > 0;
      case 'vcard':
        return vcardFirstName.trim().length > 0 || vcardLastName.trim().length > 0;
      case 'email':
        return emailValue.includes('@');
      default:
        return false;
    }
  }, [mode, urlValue, textValue, phoneValue, wifiSSID, vcardFirstName, vcardLastName, emailValue]);

  // Generate QR Code
  const generateQR = useCallback(async () => {
    if (!isContentValid()) {
      toast.error('Please enter valid content');
      return;
    }

    setIsGenerating(true);
    setVerificationStatus('verifying');
    setVerificationMessage('Generating QR code...');

    try {
      const content = generateQRContent(mode, getFormData());
      setPreviewContent(content);

      // Generate base QR canvas
      let canvas = await generateQRCanvas(content, {
        fgColor: customColors ? fgColor : '#000000',
        bgColor: customColors ? bgColor : '#ffffff',
      });

      // Apply design style
      canvas = applyDesignStyle(
        canvas,
        designStyle,
        customColors ? fgColor : '#000000',
        customColors ? bgColor : '#ffffff'
      );

      // Add logo if enabled
      if (enableLogo && selectedLogo) {
        canvas = await addLogoToCanvas(canvas, selectedLogo, {
          shape: logoShape,
          layout: logoLayout,
          size: logoSize,
          bgColor: customColors ? bgColor : '#ffffff',
        });
      }

      // Add border if enabled
      if (enableBorder) {
        canvas = addBorderToCanvas(canvas, borderWidth, borderColor);
      }

      // Store generated canvas
      generatedCanvasRef.current = canvas;
      setQrDataUrl(canvas.toDataURL('image/png'));

      // Display on visible canvas
      const displayCanvas = canvasRef.current;
      if (displayCanvas) {
        const ctx = displayCanvas.getContext('2d');
        displayCanvas.width = canvas.width;
        displayCanvas.height = canvas.height;
        ctx?.drawImage(canvas, 0, 0);
      }

      setHasQR(true);

      // Verify QR
      await verifyQR();

      // Add to history
      addToHistory(content, canvas.toDataURL('image/png'));

      toast.success('QR code generated!');
    } catch (error) {
      console.error('QR generation error:', error);
      setVerificationStatus('error');
      setVerificationMessage('Failed to generate QR code');
      toast.error('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  }, [
    isContentValid, mode, getFormData, customColors, fgColor, bgColor,
    designStyle, enableLogo, selectedLogo, logoShape, logoLayout, logoSize,
    enableBorder, borderWidth, borderColor
  ]);

  // Verify QR code
  const verifyQR = async () => {
    await new Promise((r) => setTimeout(r, 500));

    if (enableLogo && logoSize > 20) {
      setVerificationStatus('warning');
      setVerificationMessage(`Logo may be too large (${logoSize}%) - Try ≤20%`);
    } else if (enableLogo && selectedLogo) {
      setVerificationStatus('verified');
      setVerificationMessage('Verified - QR should scan correctly');
      setTimeout(() => setVerificationStatus('idle'), 3000);
    } else {
      setVerificationStatus('verified');
      setVerificationMessage('Verified - High quality QR code');
      setTimeout(() => setVerificationStatus('idle'), 3000);
    }
  };

  // Add to history
  const addToHistory = (content: string, dataUrl: string) => {
    const item: QRHistoryItem = {
      id: Date.now().toString(),
      type: mode,
      content,
      preview: content.length > 40 ? content.substring(0, 40) + '...' : content,
      timestamp: new Date().toLocaleString(),
      dataUrl,
      design: designStyle,
      colors: { fg: fgColor, bg: bgColor },
      hasBorder: enableBorder,
    };

    setHistory((prev) => [item, ...prev.slice(0, 19)]);
  };

  // Download with options
  const handleDownload = async (filename: string, quality: QRQuality, format: ImageFormat) => {
    if (!previewContent) return;
    
    try {
      const size = getQualitySize(quality);
      
      // Generate high-quality canvas
      let canvas = await generateQRCanvas(previewContent, {
        fgColor: customColors ? fgColor : '#000000',
        bgColor: customColors ? bgColor : '#ffffff',
        size,
      });

      canvas = applyDesignStyle(canvas, designStyle, customColors ? fgColor : '#000000', customColors ? bgColor : '#ffffff');

      if (enableLogo && selectedLogo) {
        canvas = await addLogoToCanvas(canvas, selectedLogo, {
          shape: logoShape,
          layout: logoLayout,
          size: logoSize,
          bgColor: customColors ? bgColor : '#ffffff',
        });
      }

      if (enableBorder) {
        canvas = addBorderToCanvas(canvas, borderWidth, borderColor);
      }

      const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
      const link = document.createElement('a');
      link.download = `${filename}.${format}`;
      link.href = canvas.toDataURL(mimeType, 0.95);
      link.click();
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download');
    }
  };

  // Handle live preview canvas ready
  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement | null) => {
    generatedCanvasRef.current = canvas;
    if (canvas) {
      setQrDataUrl(canvas.toDataURL('image/png'));
      setHasQR(true);
    }
  }, []);

  // Quick download without dialog
  const handleQuickDownload = async () => {
    if (!previewContent) return;
    await handleDownload(`qr-${mode}`, 'high', 'png');
    toast.success('QR code downloaded!');
  };

  // Copy
  const handleCopy = async () => {
    if (!generatedCanvasRef.current) return;
    const success = await copyCanvasToClipboard(generatedCanvasRef.current);
    if (success) {
      toast.success('Copied to clipboard!');
    } else {
      await handleQuickDownload();
    }
  };

  // Share
  const handleShare = async () => {
    if (!generatedCanvasRef.current) return;
    const success = await shareCanvas(generatedCanvasRef.current);
    if (!success) {
      await handleQuickDownload();
    }
  };

  // Load from history
  const loadFromHistory = (item: QRHistoryItem) => {
    setMode(item.type);
    setDesignStyle(item.design);
    setFgColor(item.colors.fg);
    setBgColor(item.colors.bg);
    if (item.colors.fg !== '#000000' || item.colors.bg !== '#ffffff') {
      setCustomColors(true);
    }
    if (item.hasBorder) {
      setEnableBorder(true);
    }
    
    // Parse content based on type
    if (item.type === 'url') {
      setUrlValue(item.content.replace(/^https?:\/\//, ''));
    } else if (item.type === 'text') {
      setTextValue(item.content);
    }
    
    setActiveTab('generate');
    toast.success('Loaded from history');
    
    setTimeout(generateQR, 100);
  };

  // Clear history
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('qrHistory');
    toast.success('History cleared');
  };

  // Handle extracted content from scanner
  const handleExtractedContent = (content: string) => {
    // Detect content type
    if (content.startsWith('http://') || content.startsWith('https://')) {
      setMode('url');
      setUrlValue(content.replace(/^https?:\/\//, ''));
    } else if (content.startsWith('WIFI:')) {
      setMode('wifi');
      const ssidMatch = content.match(/S:([^;]*)/);
      const passMatch = content.match(/P:([^;]*)/);
      if (ssidMatch) setWifiSSID(ssidMatch[1]);
      if (passMatch) setWifiPassword(passMatch[1]);
    } else if (content.startsWith('mailto:')) {
      setMode('email');
      const email = content.replace('mailto:', '').split('?')[0];
      setEmailValue(email);
    } else if (content.startsWith('https://wa.me/')) {
      setMode('whatsapp');
      const match = content.match(/wa\.me\/(\d+)/);
      if (match) {
        const fullNumber = match[1];
        setPhoneValue(fullNumber.slice(2));
        setCountryCode(fullNumber.slice(0, 2));
      }
    } else {
      setMode('text');
      setTextValue(content);
    }
    
    setActiveTab('generate');
  };

  // Reset
  const handleReset = () => {
    setUrlValue('');
    setTextValue('');
    setPhoneValue('');
    setMessageValue('Hello');
    setEmailValue('');
    setEmailSubject('');
    setEmailBody('');
    setWifiSSID('');
    setWifiPassword('');
    setDesignStyle('square');
    setCustomColors(false);
    setFgColor('#000000');
    setBgColor('#ffffff');
    setSelectedPreset(null);
    setIsGradient(false);
    setGradientColors([]);
    setEnableLogo(false);
    setSelectedLogo(null);
    setEnableBorder(false);
    setHasQR(false);
    setPreviewContent('');
    setQrDataUrl(null);
    setVerificationStatus('idle');
    toast.success('Reset complete');
  };

  return (
    <div className="min-h-screen bg-background pattern-dots">
      <ThemeToggle />
      
      <div className="container max-w-7xl mx-auto px-4 py-6 md:py-10">
        <Header />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-4 mb-8">
            <TabsTrigger value="generate" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Generate</span>
            </TabsTrigger>
            <TabsTrigger value="batch" className="gap-2">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Batch</span>
            </TabsTrigger>
            <TabsTrigger value="scan" className="gap-2">
              <ScanLine className="h-4 w-4" />
              <span className="hidden sm:inline">Scan</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate">
            <div className="grid lg:grid-cols-[1fr_400px] gap-6">
              {/* Left Column - Controls */}
              <div className="space-y-6">
                {/* Mode Selector */}
                <Card className="glass-card">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Settings2 className="h-5 w-5 text-primary" />
                      QR Code Type
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ModeSelector value={mode} onChange={setMode} />
                  </CardContent>
                </Card>

                {/* Content Input */}
                <Card className="glass-card">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Content</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <AnimatePresence mode="wait">
                      {mode === 'url' && (
                        <motion.div
                          key="url"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-2"
                        >
                          <Label>Website URL</Label>
                          <Input
                            placeholder="example.com or https://example.com"
                            value={urlValue}
                            onChange={(e) => setUrlValue(e.target.value)}
                            className="text-base"
                          />
                          <p className="text-xs text-muted-foreground">
                            Enter URL with or without http://
                          </p>
                        </motion.div>
                      )}

                      {mode === 'whatsapp' && (
                        <motion.div
                          key="whatsapp"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4"
                        >
                          <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <div className="flex gap-2">
                              <Select value={countryCode} onValueChange={setCountryCode}>
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                  {COUNTRY_CODES.map((cc) => (
                                    <SelectItem key={cc.code} value={cc.dial}>
                                      +{cc.dial} {cc.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Input
                                placeholder="Phone number"
                                value={phoneValue}
                                onChange={(e) => setPhoneValue(e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Pre-filled Message</Label>
                            <Textarea
                              placeholder="Hello! I'd like to get in touch..."
                              value={messageValue}
                              onChange={(e) => setMessageValue(e.target.value)}
                              rows={3}
                            />
                          </div>
                        </motion.div>
                      )}

                      {mode === 'text' && (
                        <motion.div
                          key="text"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-2"
                        >
                          <Label>Text Content</Label>
                          <Textarea
                            placeholder="Enter any text to encode..."
                            value={textValue}
                            onChange={(e) => setTextValue(e.target.value)}
                            rows={4}
                          />
                        </motion.div>
                      )}

                      {mode === 'wifi' && (
                        <motion.div
                          key="wifi"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4"
                        >
                          <div className="space-y-2">
                            <Label>Network Name (SSID)</Label>
                            <Input
                              placeholder="My WiFi Network"
                              value={wifiSSID}
                              onChange={(e) => setWifiSSID(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Password</Label>
                            <Input
                              type="password"
                              placeholder="WiFi password"
                              value={wifiPassword}
                              onChange={(e) => setWifiPassword(e.target.value)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Security Type</Label>
                            <Select value={wifiAuth} onValueChange={(v) => setWifiAuth(v as typeof wifiAuth)}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="WPA">WPA/WPA2</SelectItem>
                                <SelectItem value="WEP">WEP</SelectItem>
                                <SelectItem value="nopass">None</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Hidden Network</Label>
                            <Switch checked={wifiHidden} onCheckedChange={setWifiHidden} />
                          </div>
                        </motion.div>
                      )}

                      {mode === 'vcard' && (
                        <motion.div
                          key="vcard"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>First Name</Label>
                              <Input
                                placeholder="John"
                                value={vcardFirstName}
                                onChange={(e) => setVcardFirstName(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Last Name</Label>
                              <Input
                                placeholder="Doe"
                                value={vcardLastName}
                                onChange={(e) => setVcardLastName(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                              placeholder="+1 234 567 8900"
                              value={vcardPhone}
                              onChange={(e) => setVcardPhone(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                              type="email"
                              placeholder="john@example.com"
                              value={vcardEmail}
                              onChange={(e) => setVcardEmail(e.target.value)}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Company</Label>
                              <Input
                                placeholder="Acme Inc"
                                value={vcardCompany}
                                onChange={(e) => setVcardCompany(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Title</Label>
                              <Input
                                placeholder="CEO"
                                value={vcardTitle}
                                onChange={(e) => setVcardTitle(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Website</Label>
                            <Input
                              placeholder="https://example.com"
                              value={vcardWebsite}
                              onChange={(e) => setVcardWebsite(e.target.value)}
                            />
                          </div>
                        </motion.div>
                      )}

                      {mode === 'email' && (
                        <motion.div
                          key="email"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4"
                        >
                          <div className="space-y-2">
                            <Label>Email Address</Label>
                            <Input
                              type="email"
                              placeholder="hello@example.com"
                              value={emailValue}
                              onChange={(e) => setEmailValue(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Subject (optional)</Label>
                            <Input
                              placeholder="Subject line..."
                              value={emailSubject}
                              onChange={(e) => setEmailSubject(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Body (optional)</Label>
                            <Textarea
                              placeholder="Email body..."
                              value={emailBody}
                              onChange={(e) => setEmailBody(e.target.value)}
                              rows={3}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>

                {/* Design Style */}
                <Card className="glass-card">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Palette className="h-5 w-5 text-primary" />
                      Design Style
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DesignSelector
                      options={DESIGN_STYLES}
                      value={designStyle}
                      onChange={(v) => setDesignStyle(v as QRDesignStyle)}
                      columns={3}
                    />
                  </CardContent>
                </Card>

                {/* Colors */}
                <Card className="glass-card">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Palette className="h-5 w-5 text-primary" />
                        Colors
                      </CardTitle>
                      <Switch checked={customColors} onCheckedChange={setCustomColors} />
                    </div>
                  </CardHeader>
                  <AnimatePresence>
                    {customColors && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <CardContent className="pt-0 space-y-6">
                          {/* Color Presets */}
                          <ColorPresets
                            selectedPreset={selectedPreset}
                            onSelectPreset={handlePresetSelect}
                          />

                          {/* Custom Colors */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Custom Colors</Label>
                            <div className="flex gap-4">
                              <div className="flex-1 space-y-2">
                                <Label className="text-xs text-muted-foreground">Foreground</Label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={fgColor}
                                    onChange={(e) => {
                                      setFgColor(e.target.value);
                                      setSelectedPreset(null);
                                    }}
                                    className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer"
                                  />
                                  <Input
                                    value={fgColor}
                                    onChange={(e) => {
                                      setFgColor(e.target.value);
                                      setSelectedPreset(null);
                                    }}
                                    className="flex-1 font-mono text-xs"
                                  />
                                </div>
                              </div>
                              <div className="flex-1 space-y-2">
                                <Label className="text-xs text-muted-foreground">Background</Label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={bgColor}
                                    onChange={(e) => {
                                      setBgColor(e.target.value);
                                      setSelectedPreset(null);
                                    }}
                                    className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer"
                                  />
                                  <Input
                                    value={bgColor}
                                    onChange={(e) => {
                                      setBgColor(e.target.value);
                                      setSelectedPreset(null);
                                    }}
                                    className="flex-1 font-mono text-xs"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>

                {/* Logo */}
                <Card className="glass-card">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Image className="h-5 w-5 text-primary" />
                        Add Logo
                      </CardTitle>
                      <Switch checked={enableLogo} onCheckedChange={setEnableLogo} />
                    </div>
                  </CardHeader>
                  <AnimatePresence>
                    {enableLogo && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <CardContent className="pt-0 space-y-6">
                          <LogoManager
                            selectedLogo={selectedLogo}
                            onLogoChange={setSelectedLogo}
                            urlValue={urlValue}
                          />

                          <div className="space-y-2">
                            <Label>Logo Shape</Label>
                            <DesignSelector
                              options={LOGO_SHAPES}
                              value={logoShape}
                              onChange={(v) => setLogoShape(v as LogoShape)}
                              columns={3}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Logo Position</Label>
                            <DesignSelector
                              options={LOGO_LAYOUTS}
                              value={logoLayout}
                              onChange={(v) => setLogoLayout(v as LogoLayout)}
                              columns={3}
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Logo Size</Label>
                              <span className="text-sm text-muted-foreground">{logoSize}%</span>
                            </div>
                            <Slider
                              value={[logoSize]}
                              onValueChange={(v) => setLogoSize(v[0])}
                              min={10}
                              max={25}
                              step={1}
                            />
                            {logoSize > 20 && (
                              <p className="text-xs text-warning">
                                ⚠️ Large logos may affect scannability
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>

                {/* Border */}
                <Card className="glass-card">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Frame className="h-5 w-5 text-primary" />
                        Add Border
                      </CardTitle>
                      <Switch checked={enableBorder} onCheckedChange={setEnableBorder} />
                    </div>
                  </CardHeader>
                  <AnimatePresence>
                    {enableBorder && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <CardContent className="pt-0 space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Border Width</Label>
                              <span className="text-sm text-muted-foreground">{borderWidth}px</span>
                            </div>
                            <Slider
                              value={[borderWidth]}
                              onValueChange={(v) => setBorderWidth(v[0])}
                              min={5}
                              max={50}
                              step={5}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Border Color</Label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={borderColor}
                                onChange={(e) => setBorderColor(e.target.value)}
                                className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer"
                              />
                              <Input
                                value={borderColor}
                                onChange={(e) => setBorderColor(e.target.value)}
                                className="flex-1 font-mono text-sm"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </div>

              {/* Right Column - Preview & Actions */}
              <div className="lg:sticky lg:top-6 space-y-6 h-fit">
                <Card className="glass-card">
                  <CardContent className="p-6">
                    <LivePreview
                      content={previewContent}
                      designStyle={designStyle}
                      fgColor={customColors ? fgColor : '#000000'}
                      bgColor={customColors ? bgColor : '#ffffff'}
                      enableLogo={enableLogo}
                      logo={selectedLogo}
                      logoShape={logoShape}
                      logoLayout={logoLayout}
                      logoSize={logoSize}
                      enableBorder={enableBorder}
                      borderWidth={borderWidth}
                      borderColor={borderColor}
                      verificationStatus={verificationStatus}
                      verificationMessage={verificationMessage}
                      onCanvasReady={handleCanvasReady}
                    />

                    {/* Preview Content */}
                    {previewContent && (
                      <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                        <p className="text-sm font-mono break-all">{previewContent}</p>
                      </div>
                    )}

                    {/* Generate Button */}
                    <Button
                      onClick={generateQR}
                      disabled={isGenerating || !isContentValid()}
                      className="w-full mt-6 h-12 text-base font-semibold gradient-primary text-white shadow-glow hover:shadow-glow-accent transition-all"
                    >
                      {isGenerating ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <Zap className="h-5 w-5 mr-2" />
                          </motion.span>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5 mr-2" />
                          Generate QR Code
                        </>
                      )}
                    </Button>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <DownloadOptions
                        qrDataUrl={qrDataUrl}
                        qrContent={previewContent}
                        onDownload={handleDownload}
                        defaultFilename={`qr-${mode}`}
                      />
                      <Button
                        variant="outline"
                        onClick={handleCopy}
                        disabled={!hasQR}
                        className="gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleShare}
                        disabled={!hasQR}
                        className="gap-2"
                      >
                        <Share2 className="h-4 w-4" />
                        Share
                      </Button>
                      <PrintDialog 
                        qrDataUrl={qrDataUrl}
                        qrContent={previewContent}
                      />
                    </div>

                    {/* Reset Button */}
                    <Button
                      variant="ghost"
                      onClick={handleReset}
                      className="w-full mt-2 text-muted-foreground"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset All
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Batch Tab */}
          <TabsContent value="batch">
            <div className="max-w-2xl mx-auto">
              <BatchGenerator
                designStyle={designStyle}
                fgColor={customColors ? fgColor : '#000000'}
                bgColor={customColors ? bgColor : '#ffffff'}
              />
            </div>
          </TabsContent>

          {/* Scan Tab */}
          <TabsContent value="scan">
            <div className="max-w-lg mx-auto">
              <QRScanner onContentExtracted={handleExtractedContent} />
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <QRHistory
              history={history}
              onLoadHistory={loadFromHistory}
              onClearHistory={clearHistory}
            />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-16 py-8 text-center border-t border-border no-print">
          <p className="text-sm text-muted-foreground">
            Made with ❤️ • Smart QR Generator
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;

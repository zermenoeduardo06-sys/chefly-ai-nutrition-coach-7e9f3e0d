import { useRef, useState } from 'react';
import { Camera as CameraIcon, Upload, Scan, Sparkles, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Card3D } from '@/components/ui/card-3d';
import mascotLime from '@/assets/mascot-lime.png';

interface ScannerCameraProps {
  onImageCapture: (base64: string) => void;
  isAnalyzing: boolean;
  previewImage: string | null;
}

// Scanning frame overlay component with 3D styling
function ScanningFrame({ isAnalyzing }: { isAnalyzing: boolean }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Corner brackets with glow */}
      <div className="absolute inset-4">
        {/* Top Left */}
        <motion.div 
          className="absolute top-0 left-0 w-14 h-14"
          animate={isAnalyzing ? { opacity: [0.5, 1, 0.5] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-primary to-transparent rounded-full shadow-[0_0_8px_hsl(var(--primary))]" />
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary via-primary to-transparent rounded-full shadow-[0_0_8px_hsl(var(--primary))]" />
        </motion.div>
        
        {/* Top Right */}
        <motion.div 
          className="absolute top-0 right-0 w-14 h-14"
          animate={isAnalyzing ? { opacity: [0.5, 1, 0.5] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        >
          <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-l from-primary via-primary to-transparent rounded-full shadow-[0_0_8px_hsl(var(--primary))]" />
          <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-primary via-primary to-transparent rounded-full shadow-[0_0_8px_hsl(var(--primary))]" />
        </motion.div>
        
        {/* Bottom Left */}
        <motion.div 
          className="absolute bottom-0 left-0 w-14 h-14"
          animate={isAnalyzing ? { opacity: [0.5, 1, 0.5] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
        >
          <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-primary to-transparent rounded-full shadow-[0_0_8px_hsl(var(--primary))]" />
          <div className="absolute bottom-0 left-0 w-1.5 h-full bg-gradient-to-t from-primary via-primary to-transparent rounded-full shadow-[0_0_8px_hsl(var(--primary))]" />
        </motion.div>
        
        {/* Bottom Right */}
        <motion.div 
          className="absolute bottom-0 right-0 w-14 h-14"
          animate={isAnalyzing ? { opacity: [0.5, 1, 0.5] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
        >
          <div className="absolute bottom-0 right-0 w-full h-1.5 bg-gradient-to-l from-primary via-primary to-transparent rounded-full shadow-[0_0_8px_hsl(var(--primary))]" />
          <div className="absolute bottom-0 right-0 w-1.5 h-full bg-gradient-to-t from-primary via-primary to-transparent rounded-full shadow-[0_0_8px_hsl(var(--primary))]" />
        </motion.div>
      </div>

      {/* Scanning line animation when analyzing */}
      {isAnalyzing && (
        <motion.div
          className="absolute left-4 right-4 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full shadow-[0_0_20px_hsl(var(--primary)),0_0_40px_hsl(var(--primary)/0.5)]"
          initial={{ top: "15%" }}
          animate={{ top: ["15%", "85%", "15%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Center crosshair */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div 
          className="relative"
          animate={isAnalyzing ? { scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] } : { opacity: 0.3 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-10 h-0.5 bg-primary/60 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" />
          <div className="w-0.5 h-10 bg-primary/60 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" />
          <div className="w-4 h-4 border-2 border-primary/60 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </motion.div>
      </div>
    </div>
  );
}

export function ScannerCamera({ onImageCapture, isAnalyzing, previewImage }: ScannerCameraProps) {
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const isNative = Capacitor.isNativePlatform();

  const t = {
    takePhoto: language === 'es' ? 'Cámara' : 'Camera',
    uploadImage: language === 'es' ? 'Galería' : 'Gallery',
    analyzing: language === 'es' ? 'Analizando tu comida...' : 'Analyzing your food...',
    instructions: language === 'es' 
      ? 'Toma o sube una foto de tu comida'
      : 'Take or upload a photo of your food',
    aiPowered: language === 'es' ? 'IA Avanzada' : 'Advanced AI',
  };

  // Native camera capture using Capacitor Camera plugin
  const captureWithNativeCamera = async (source: CameraSource) => {
    if (isCapturing) return;
    
    setIsCapturing(true);
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: source,
        width: 800,
        height: 800,
        correctOrientation: true,
      });

      if (image.dataUrl) {
        onImageCapture(image.dataUrl);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes('cancelled') && !errorMessage.includes('User cancelled')) {
        console.error('Camera error:', error);
      }
    } finally {
      setIsCapturing(false);
    }
  };

  // Web fallback using file input
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      onImageCapture(base64);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleCameraClick = () => {
    if (isNative) {
      captureWithNativeCamera(CameraSource.Camera);
    } else {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const base64 = ev.target?.result as string;
            onImageCapture(base64);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  };

  const handleGalleryClick = () => {
    if (isNative) {
      captureWithNativeCamera(CameraSource.Photos);
    } else {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {previewImage ? (
          <motion.div 
            key="preview"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
          >
            <Card3D variant="elevated" hover={false} className="overflow-hidden p-0">
              <div className="relative">
                <img 
                  src={previewImage} 
                  alt="Food preview" 
                  className="w-full h-72 object-cover"
                />
                
                {/* Scanning frame overlay */}
                <ScanningFrame isAnalyzing={isAnalyzing} />
                
                {isAnalyzing && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 flex items-center justify-center backdrop-blur-[2px]"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <motion.div 
                        className="relative z-10"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <div className="h-24 w-24 rounded-full border-4 border-white/20 border-t-primary shadow-[0_0_30px_hsl(var(--primary)/0.5)]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div
                            animate={{ scale: [1, 1.15, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <Scan className="h-10 w-10 text-white drop-shadow-lg" />
                          </motion.div>
                        </div>
                      </motion.div>
                      <span className="text-white font-bold text-lg relative z-10 drop-shadow-lg">{t.analyzing}</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </Card3D>
          </motion.div>
        ) : (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card3D variant="glass" className="p-8 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 opacity-10">
                <ChefHat className="h-20 w-20 text-primary" />
              </div>
              <div className="absolute bottom-4 left-4 opacity-10">
                <Sparkles className="h-14 w-14 text-primary" />
              </div>
              
              <div className="relative text-center">
                {/* Floating Mascot */}
                <motion.div 
                  className="w-28 h-28 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center mb-6 shadow-[0_6px_0_hsl(var(--primary)/0.2),0_10px_20px_rgba(0,0,0,0.1)]"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  whileHover={{ scale: 1.05, rotate: 3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img src={mascotLime} alt="Chefly" className="h-20 w-20 object-contain" />
                </motion.div>

                <h3 className="text-lg font-bold mb-2 text-foreground">{t.instructions}</h3>
                <p className="text-muted-foreground text-sm mb-8">
                  {language === 'es' 
                    ? 'Nuestra IA analizará los nutrientes automáticamente' 
                    : 'Our AI will analyze the nutrients automatically'}
                </p>
                
                <div className="flex gap-3 justify-center">
                  {/* Hidden file input for web gallery fallback */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {/* Camera Button - 3D Style */}
                  <Button
                    onClick={handleCameraClick}
                    disabled={isCapturing}
                    size="lg"
                    className="gap-2 rounded-2xl px-6 h-14 text-base font-bold shadow-[0_4px_0_hsl(var(--primary)/0.4),0_8px_16px_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-[0_2px_0_hsl(var(--primary)/0.4)] transition-all bg-primary hover:bg-primary/90"
                  >
                    <CameraIcon className="h-5 w-5" />
                    {t.takePhoto}
                  </Button>
                  
                  {/* Gallery Button - 3D Style */}
                  <Button
                    onClick={handleGalleryClick}
                    disabled={isCapturing}
                    variant="outline"
                    size="lg"
                    className="gap-2 rounded-2xl px-6 h-14 text-base font-bold shadow-[0_4px_0_hsl(var(--border)),0_8px_16px_rgba(0,0,0,0.08)] active:translate-y-1 active:shadow-[0_2px_0_hsl(var(--border))] transition-all border-2"
                  >
                    <Upload className="h-5 w-5" />
                    {t.uploadImage}
                  </Button>
                </div>
              </div>
            </Card3D>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

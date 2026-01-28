import { useRef, useState } from 'react';
import { Camera as CameraIcon, Upload, Scan, Sparkles, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import mascotLime from '@/assets/mascot-lime.png';

interface ScannerCameraProps {
  onImageCapture: (base64: string) => void;
  isAnalyzing: boolean;
  previewImage: string | null;
}

// Scanning frame overlay component
function ScanningFrame({ isAnalyzing }: { isAnalyzing: boolean }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Corner brackets */}
      <div className="absolute inset-4">
        {/* Top Left */}
        <motion.div 
          className="absolute top-0 left-0 w-12 h-12"
          animate={isAnalyzing ? { opacity: [0.5, 1, 0.5] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary to-transparent rounded-full" />
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary via-primary to-transparent rounded-full" />
        </motion.div>
        
        {/* Top Right */}
        <motion.div 
          className="absolute top-0 right-0 w-12 h-12"
          animate={isAnalyzing ? { opacity: [0.5, 1, 0.5] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        >
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-primary via-primary to-transparent rounded-full" />
          <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-primary via-primary to-transparent rounded-full" />
        </motion.div>
        
        {/* Bottom Left */}
        <motion.div 
          className="absolute bottom-0 left-0 w-12 h-12"
          animate={isAnalyzing ? { opacity: [0.5, 1, 0.5] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
        >
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary to-transparent rounded-full" />
          <div className="absolute bottom-0 left-0 w-1 h-full bg-gradient-to-t from-primary via-primary to-transparent rounded-full" />
        </motion.div>
        
        {/* Bottom Right */}
        <motion.div 
          className="absolute bottom-0 right-0 w-12 h-12"
          animate={isAnalyzing ? { opacity: [0.5, 1, 0.5] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
        >
          <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-primary via-primary to-transparent rounded-full" />
          <div className="absolute bottom-0 right-0 w-1 h-full bg-gradient-to-t from-primary via-primary to-transparent rounded-full" />
        </motion.div>
      </div>

      {/* Scanning line animation when analyzing */}
      {isAnalyzing && (
        <motion.div
          className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-lg shadow-primary/50"
          initial={{ top: "15%" }}
          animate={{ top: ["15%", "85%", "15%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Subtle grid overlay */}
      <div 
        className="absolute inset-8 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Center crosshair */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div 
          className="relative"
          animate={isAnalyzing ? { scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] } : { opacity: 0.3 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-8 h-0.5 bg-primary/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          <div className="w-0.5 h-8 bg-primary/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          <div className="w-3 h-3 border border-primary/50 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
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
      // User cancelled or permission denied - don't show error
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
    
    // Reset input so same file can be selected again
    event.target.value = '';
  };

  const handleCameraClick = () => {
    if (isNative) {
      captureWithNativeCamera(CameraSource.Camera);
    } else {
      // For web, we'll use a file input with capture
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
            className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-border/50"
          >
            <img 
              src={previewImage} 
              alt="Food preview" 
              className="w-full h-64 object-cover"
            />
            
            {/* Scanning frame overlay */}
            <ScanningFrame isAnalyzing={isAnalyzing} />
            
            {isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20 flex items-center justify-center"
              >
                <div className="flex flex-col items-center gap-4">
                  <motion.div 
                    className="relative z-10"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="h-20 w-20 rounded-full border-[3px] border-white/20 border-t-primary" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Scan className="h-8 w-8 text-white" />
                      </motion.div>
                    </div>
                  </motion.div>
                  <span className="text-white font-semibold text-lg relative z-10 drop-shadow-lg">{t.analyzing}</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative overflow-hidden bg-gradient-to-br from-muted/50 to-muted/30 rounded-3xl p-10 border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors"
          >
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 opacity-10">
              <ChefHat className="h-24 w-24 text-primary" />
            </div>
            <div className="absolute bottom-4 left-4 opacity-10">
              <Sparkles className="h-16 w-16 text-primary" />
            </div>
            
            <div className="relative text-center">
              <motion.div 
                className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center mb-6 shadow-inner"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <img src={mascotLime} alt="Chefly" className="h-16 w-16 object-contain" />
              </motion.div>

              <p className="text-muted-foreground mb-6 text-lg">{t.instructions}</p>
              
              <div className="flex gap-3 justify-center">
                {/* Hidden file input for web gallery fallback */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <Button
                  onClick={handleCameraClick}
                  disabled={isCapturing}
                  size="lg"
                  className="gap-2 rounded-2xl px-6 h-14 text-base font-semibold shadow-lg"
                >
                  <CameraIcon className="h-5 w-5" />
                  {t.takePhoto}
                </Button>
                
                <Button
                  onClick={handleGalleryClick}
                  disabled={isCapturing}
                  variant="outline"
                  size="lg"
                  className="gap-2 rounded-2xl px-6 h-14 text-base font-semibold"
                >
                  <Upload className="h-5 w-5" />
                  {t.uploadImage}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

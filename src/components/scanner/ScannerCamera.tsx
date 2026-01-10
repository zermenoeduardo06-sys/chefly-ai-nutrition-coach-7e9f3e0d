import { useState, useRef } from 'react';
import { Camera, Upload, Loader2, Scan, Sparkles, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import mascotLime from '@/assets/mascot-lime.png';

interface ScannerCameraProps {
  onImageCapture: (base64: string) => void;
  isAnalyzing: boolean;
  previewImage: string | null;
}

export function ScannerCamera({ onImageCapture, isAnalyzing, previewImage }: ScannerCameraProps) {
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const t = {
    takePhoto: language === 'es' ? 'Cámara' : 'Camera',
    uploadImage: language === 'es' ? 'Galería' : 'Gallery',
    analyzing: language === 'es' ? 'Analizando tu comida...' : 'Analyzing your food...',
    instructions: language === 'es' 
      ? 'Toma o sube una foto de tu comida'
      : 'Take or upload a photo of your food',
    aiPowered: language === 'es' ? 'IA Avanzada' : 'Advanced AI',
  };

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
            {isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/40 backdrop-blur-sm flex items-center justify-center"
              >
                <div className="flex flex-col items-center gap-4">
                  {/* Scanning line animation */}
                  <div className="relative w-full h-full absolute inset-0">
                    <motion.div
                      className="absolute left-4 right-4 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full shadow-lg shadow-primary/50"
                      initial={{ top: "10%" }}
                      animate={{ top: ["10%", "90%", "10%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                  
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
                  <span className="text-white font-semibold text-lg relative z-10">{t.analyzing}</span>
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
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <Button
                  onClick={() => cameraInputRef.current?.click()}
                  size="lg"
                  className="gap-2 rounded-2xl px-6 h-14 text-base font-semibold shadow-lg"
                >
                  <Camera className="h-5 w-5" />
                  {t.takePhoto}
                </Button>
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
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

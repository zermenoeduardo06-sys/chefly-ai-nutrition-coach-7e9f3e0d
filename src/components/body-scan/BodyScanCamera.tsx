import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Camera, X, RotateCcw, Check, AlertCircle, SwitchCamera, Loader2 } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { cn } from "@/lib/utils";

interface BodyScanCameraProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
  scanType: 'front' | 'side';
  onChangeScanType: (type: 'front' | 'side') => void;
  isAnalyzing?: boolean;
}

export function BodyScanCamera({
  onCapture,
  onClose,
  scanType,
  onChangeScanType,
  isAnalyzing = false,
}: BodyScanCameraProps) {
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const isNative = Capacitor.isNativePlatform();

  const texts = {
    es: {
      front: 'Frontal',
      side: 'Lateral',
      instructions: scanType === 'front' 
        ? 'Colócate de frente a la cámara con los brazos relajados'
        : 'Colócate de lado con los brazos relajados',
      tips: [
        'Buena iluminación',
        'Ropa ajustada',
        'Postura natural',
      ],
      capture: 'Capturar',
      retake: 'Repetir',
      analyze: 'Analizar',
      analyzing: 'Analizando...',
      switchCamera: 'Cambiar cámara',
      permissionError: 'No se pudo acceder a la cámara. Verifica los permisos.',
      disclaimer: 'Esta es una estimación visual educativa, no un diagnóstico médico.',
    },
    en: {
      front: 'Front',
      side: 'Side',
      instructions: scanType === 'front'
        ? 'Stand facing the camera with arms relaxed'
        : 'Stand sideways with arms relaxed',
      tips: [
        'Good lighting',
        'Fitted clothing',
        'Natural posture',
      ],
      capture: 'Capture',
      retake: 'Retake',
      analyze: 'Analyze',
      analyzing: 'Analyzing...',
      switchCamera: 'Switch camera',
      permissionError: 'Could not access camera. Please check permissions.',
      disclaimer: 'This is an educational visual estimate, not a medical diagnosis.',
    },
  };
  const t = texts[language];

  const startCamera = useCallback(async () => {
    try {
      setIsStarting(true);
      setError(null);
      
      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1080 },
          height: { ideal: 1920 },
        },
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      
      setIsStarting(false);
    } catch (err) {
      console.error('Camera error:', err);
      setError(t.permissionError);
      setIsStarting(false);
    }
  }, [facingMode, stream, t.permissionError]);

  // Start camera on mount
  useState(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  });

  const switchCamera = async () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    await startCamera();
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Mirror if using front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    
    ctx.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </Button>
          
          {/* Scan type toggle */}
          <div className="flex bg-white/20 rounded-full p-1">
            <button
              onClick={() => onChangeScanType('front')}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                scanType === 'front' ? "bg-white text-black" : "text-white"
              )}
            >
              {t.front}
            </button>
            <button
              onClick={() => onChangeScanType('side')}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                scanType === 'side' ? "bg-white text-black" : "text-white"
              )}
            >
              {t.side}
            </button>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={switchCamera}
            className="text-white hover:bg-white/20"
          >
            <SwitchCamera className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Camera View / Captured Image */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {capturedImage ? (
            <motion.img
              key="captured"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              src={capturedImage}
              alt="Captured"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <motion.div
              key="video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={cn(
                  "absolute inset-0 w-full h-full object-cover",
                  facingMode === 'user' && "scale-x-[-1]"
                )}
              />
              
              {/* Body silhouette guide */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 0.5, scale: 1 }}
                  className="relative"
                >
                  {/* Simple silhouette using CSS */}
                  <div className={cn(
                    "w-40 h-80 border-2 border-dashed border-white/50 rounded-full",
                    scanType === 'side' && "w-24"
                  )} />
                  {/* Head */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-16 h-16 border-2 border-dashed border-white/50 rounded-full" />
                </motion.div>
              </div>
              
              {/* Loading overlay */}
              {isStarting && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center p-6">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-white">{error}</p>
              <Button onClick={startCamera} className="mt-4">
                {language === 'es' ? 'Reintentar' : 'Retry'}
              </Button>
            </div>
          </div>
        )}
        
        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 pb-safe bg-gradient-to-t from-black/80 to-transparent">
        {/* Instructions */}
        {!capturedImage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4"
          >
            <p className="text-white text-sm mb-2">{t.instructions}</p>
            <div className="flex justify-center gap-3">
              {t.tips.map((tip, i) => (
                <span key={i} className="text-xs text-white/70 bg-white/10 px-2 py-1 rounded-full">
                  {tip}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-4">
          {capturedImage ? (
            <>
              <Button
                variant="outline"
                size="lg"
                onClick={retakePhoto}
                disabled={isAnalyzing}
                className="border-white text-white hover:bg-white/20"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                {t.retake}
              </Button>
              <Button
                size="lg"
                onClick={confirmPhoto}
                disabled={isAnalyzing}
                className="bg-primary hover:bg-primary-hover"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {t.analyzing}
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    {t.analyze}
                  </>
                )}
              </Button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={capturePhoto}
              disabled={isStarting || !!error}
              className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg disabled:opacity-50"
            >
              <Camera className="h-8 w-8 text-black" />
            </motion.button>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-white/50 text-center mt-4">
          {t.disclaimer}
        </p>
      </div>
    </motion.div>
  );
}

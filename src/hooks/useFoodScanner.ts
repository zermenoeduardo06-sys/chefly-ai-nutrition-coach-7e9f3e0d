import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

export interface FoodAnalysisResult {
  success: boolean;
  dish_name?: string;
  foods_identified?: string[];
  portion_estimate?: string;
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
  confidence?: 'high' | 'medium' | 'low';
  notes?: string;
  error?: string;
}

// Compress image to reduce size before sending to API
async function compressImage(base64: string, maxWidth = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      
      // Scale down if needed
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to JPEG with compression
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = base64;
  });
}

export function useFoodScanner() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const { language } = useLanguage();
  const { toast } = useToast();

  const analyzeFood = async (imageBase64: string): Promise<FoodAnalysisResult | null> => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      // Compress image before sending
      const compressedImage = await compressImage(imageBase64);
      
      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: { 
          imageBase64: compressedImage,
          language 
        }
      });

      if (error) {
        console.error('Error calling analyze-food:', error);
        toast({
          title: language === 'es' ? 'Error' : 'Error',
          description: language === 'es' 
            ? 'No se pudo analizar la imagen. Intenta de nuevo.'
            : 'Could not analyze the image. Please try again.',
          variant: 'destructive'
        });
        return null;
      }

      if (data.error) {
        if (data.code === 'BUDGET_LIMIT') {
          toast({
            title: language === 'es' ? 'Límite de IA alcanzado' : 'AI Limit Reached',
            description: language === 'es'
              ? 'Has alcanzado tu límite mensual de uso de IA. El límite se reinicia el 1 de cada mes.'
              : "You've reached your monthly AI usage limit. The limit resets on the 1st of each month.",
            variant: 'destructive'
          });
        } else if (data.code === 'RATE_LIMIT') {
          toast({
            title: language === 'es' ? 'Límite alcanzado' : 'Rate limit reached',
            description: language === 'es'
              ? 'Has alcanzado el límite de análisis. Intenta más tarde.'
              : 'You have reached the analysis limit. Try again later.',
            variant: 'destructive'
          });
        } else if (data.code === 'CREDITS_EXHAUSTED') {
          toast({
            title: language === 'es' ? 'Créditos agotados' : 'Credits exhausted',
            description: language === 'es'
              ? 'Los créditos de IA se han agotado.'
              : 'AI credits have been exhausted.',
            variant: 'destructive'
          });
        } else {
          toast({
            title: language === 'es' ? 'Error' : 'Error',
            description: data.error,
            variant: 'destructive'
          });
        }
        return null;
      }

      setResult(data);
      return data;

    } catch (err) {
      console.error('Food scanner error:', err);
      toast({
        title: language === 'es' ? 'Error' : 'Error',
        description: language === 'es'
          ? 'Ocurrió un error al analizar la comida.'
          : 'An error occurred while analyzing the food.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearResult = () => {
    setResult(null);
  };

  return {
    analyzeFood,
    isAnalyzing,
    result,
    clearResult
  };
}

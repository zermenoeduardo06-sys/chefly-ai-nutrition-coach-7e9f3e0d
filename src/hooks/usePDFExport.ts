import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export function usePDFExport() {
  const { toast } = useToast();
  const { language } = useLanguage();

  const exportPDF = async (doc: jsPDF, fileName: string) => {
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      try {
        // Convert PDF to base64
        const pdfBase64 = doc.output('datauristring').split(',')[1];
        
        // Save to temporary file
        const result = await Filesystem.writeFile({
          path: fileName,
          data: pdfBase64,
          directory: Directory.Cache,
        });

        // Share the file
        await Share.share({
          title: fileName.replace('.pdf', ''),
          url: result.uri,
          dialogTitle: language === 'es' ? 'Compartir PDF' : 'Share PDF',
        });

        toast({
          title: language === 'es' ? '¡Listo!' : 'Done!',
          description: language === 'es' ? 'PDF listo para compartir' : 'PDF ready to share',
        });
      } catch (error: any) {
        // User cancelled share dialog - not an error
        if (error?.message?.includes('cancel') || error?.message?.includes('dismiss')) {
          return;
        }
        console.error('Error sharing PDF:', error);
        toast({
          variant: 'destructive',
          title: language === 'es' ? 'Error' : 'Error',
          description: language === 'es' ? 'No se pudo compartir el PDF' : 'Could not share PDF',
        });
      }
    } else {
      // Web fallback - download directly
      doc.save(fileName);
      toast({
        title: language === 'es' ? '¡Descargado!' : 'Downloaded!',
        description: language === 'es' ? 'PDF descargado correctamente' : 'PDF downloaded successfully',
      });
    }
  };

  return { exportPDF };
}

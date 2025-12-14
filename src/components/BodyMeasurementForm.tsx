import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const formSchema = z.object({
  measurement_date: z.string(),
  weight: z.string().optional(),
  neck: z.string().optional(),
  chest: z.string().optional(),
  waist: z.string().optional(),
  hips: z.string().optional(),
  arms: z.string().optional(),
  thighs: z.string().optional(),
  notes: z.string().optional(),
});

interface BodyMeasurementFormProps {
  userId: string;
  onSuccess: () => void;
}

export const BodyMeasurementForm = ({ userId, onSuccess }: BodyMeasurementFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      measurement_date: new Date().toISOString().split('T')[0],
      weight: "",
      neck: "",
      chest: "",
      waist: "",
      hips: "",
      arms: "",
      thighs: "",
      notes: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const measurementData: any = {
        user_id: userId,
        measurement_date: values.measurement_date,
      };

      if (values.weight) measurementData.weight = parseFloat(values.weight);
      if (values.neck) measurementData.neck = parseFloat(values.neck);
      if (values.chest) measurementData.chest = parseFloat(values.chest);
      if (values.waist) measurementData.waist = parseFloat(values.waist);
      if (values.hips) measurementData.hips = parseFloat(values.hips);
      if (values.arms) measurementData.arms = parseFloat(values.arms);
      if (values.thighs) measurementData.thighs = parseFloat(values.thighs);
      if (values.notes) measurementData.notes = values.notes;

      const { error } = await supabase
        .from("body_measurements")
        .upsert(measurementData, {
          onConflict: "user_id,measurement_date",
        });

      if (error) throw error;

      toast.success(t('bodyMeasurements.saveSuccess'));
      form.reset({
        measurement_date: new Date().toISOString().split('T')[0],
        weight: "",
        neck: "",
        chest: "",
        waist: "",
        hips: "",
        arms: "",
        thighs: "",
        notes: "",
      });
      onSuccess();
    } catch (error: any) {
      toast.error(t('bodyMeasurements.saveError') + ": " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="measurement_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('bodyMeasurements.date')}</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('bodyMeasurements.weight')}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="70.5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="neck"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('bodyMeasurements.neck')}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="35.0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="chest"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('bodyMeasurements.chest')}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="95.0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="waist"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('bodyMeasurements.waist')}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="80.0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hips"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('bodyMeasurements.hips')}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="95.0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="arms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('bodyMeasurements.arms')}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="30.0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="thighs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('bodyMeasurements.thighs')}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="55.0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('bodyMeasurements.notes')}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={t('bodyMeasurements.notesPlaceholder')}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('bodyMeasurements.save')}
        </Button>
      </form>
    </Form>
  );
};

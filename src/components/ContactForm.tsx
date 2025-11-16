import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

export const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { t } = useLanguage();

  const contactSchema = z.object({
    name: z.string()
      .trim()
      .min(1, { message: t("contact.validation.nameRequired") })
      .max(100, { message: t("contact.validation.nameMax") }),
    email: z.string()
      .trim()
      .email({ message: t("contact.validation.emailInvalid") })
      .max(255, { message: t("contact.validation.emailMax") }),
    subject: z.string()
      .trim()
      .min(1, { message: t("contact.validation.subjectRequired") })
      .max(200, { message: t("contact.validation.subjectMax") }),
    message: z.string()
      .trim()
      .min(10, { message: t("contact.validation.messageMin") })
      .max(2000, { message: t("contact.validation.messageMax") })
  });

  type ContactFormData = z.infer<typeof contactSchema>;

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: ""
    }
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      // Simulate sending (backend integration pending)
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsSuccess(true);
      toast.success(t("contact.form.success"), {
        description: t("contact.form.successDesc")
      });
      
      form.reset();
      
      // Reset success state after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      toast.error(t("contact.form.error"), {
        description: t("contact.form.errorDesc")
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border/50 shadow-xl bg-gradient-to-br from-card to-card/80 backdrop-blur-sm max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t("contact.form.title")}</CardTitle>
        <CardDescription>
          {t("contact.form.subtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">{t("contact.form.success")}</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              {t("contact.form.successDesc")}
            </p>
            <Button onClick={() => setIsSuccess(false)} variant="outline">
              {t("contact.form.sendAnother")}
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre completo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Tu nombre" 
                          {...field}
                          maxLength={100}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="tu@email.com" 
                          {...field}
                          maxLength={255}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asunto</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="¿De qué se trata tu mensaje?" 
                        {...field}
                        maxLength={200}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensaje</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Escribe tu mensaje aquí..."
                        className="min-h-[150px] resize-none"
                        {...field}
                        maxLength={2000}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <div className="flex items-center justify-between">
                      <FormMessage />
                      <span className="text-xs text-muted-foreground">
                        {field.value.length}/2000
                      </span>
                    </div>
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full gap-2"
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar mensaje
                  </>
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  language?: "es" | "en";
}

const emailTemplates = {
  es: {
    adminSubjectPrefix: "[Contacto Chefly]",
    adminTitle: "Nuevo mensaje de contacto",
    adminName: "Nombre",
    adminEmail: "Email",
    adminSubject: "Asunto",
    adminMessage: "Mensaje",
    adminFooter: "Este mensaje fue enviado desde el formulario de contacto de Chefly.AI",
    userSubject: "¡Recibimos tu mensaje! - Chefly.AI",
    userGreeting: "¡Hola",
    userThanks: "Gracias por contactarnos. Hemos recibido tu mensaje y te responderemos lo antes posible.",
    userMessageLabel: "Tu mensaje:",
    userExplore: "Mientras tanto, puedes explorar nuestros planes de nutrición personalizados en nuestra plataforma.",
    userSignature: "— El equipo de Chefly.AI"
  },
  en: {
    adminSubjectPrefix: "[Contact Chefly]",
    adminTitle: "New contact message",
    adminName: "Name",
    adminEmail: "Email",
    adminSubject: "Subject",
    adminMessage: "Message",
    adminFooter: "This message was sent from the Chefly.AI contact form",
    userSubject: "We received your message! - Chefly.AI",
    userGreeting: "Hello",
    userThanks: "Thank you for contacting us. We have received your message and will get back to you as soon as possible.",
    userMessageLabel: "Your message:",
    userExplore: "In the meantime, you can explore our personalized nutrition plans on our platform.",
    userSignature: "— The Chefly.AI Team"
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message, language = "es" }: ContactEmailRequest = await req.json();

    if (!name || !email || !subject || !message) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (name.length > 100 || email.length > 255 || subject.length > 200 || message.length > 2000) {
      console.error("Field length exceeded");
      return new Response(
        JSON.stringify({ error: "Field length exceeded" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const t = emailTemplates[language] || emailTemplates.es;

    console.log(`Processing contact form from: ${email}, subject: ${subject}, language: ${language}`);

    const adminEmailResponse = await resend.emails.send({
      from: "Chefly.AI <contacto@cheflyai.com>",
      to: ["chefly.ai.mx@gmail.com"],
      subject: `${t.adminSubjectPrefix} ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22c55e;">${t.adminTitle}</h2>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>${t.adminName}:</strong> ${name}</p>
            <p><strong>${t.adminEmail}:</strong> ${email}</p>
            <p><strong>${t.adminSubject}:</strong> ${subject}</p>
          </div>
          <div style="background: #fff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="margin-top: 0;">${t.adminMessage}:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
            ${t.adminFooter}
          </p>
        </div>
      `,
    });

    console.log("Admin email sent:", adminEmailResponse);

    const userEmailResponse = await resend.emails.send({
      from: "Chefly.AI <contacto@cheflyai.com>",
      to: [email],
      subject: t.userSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22c55e;">${t.userGreeting} ${name}!</h2>
          <p>${t.userThanks}</p>
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
            <p style="margin: 0;"><strong>${t.userMessageLabel}</strong></p>
            <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${message}</p>
          </div>
          <p>${t.userExplore}</p>
          <p style="color: #6b7280;">${t.userSignature}</p>
        </div>
      `,
    });

    console.log("User confirmation email sent:", userEmailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Emails sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

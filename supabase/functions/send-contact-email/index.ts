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
    userThanks: "Gracias por contactarnos. Hemos recibido tu mensaje y nuestro equipo te responderá lo antes posible.",
    userMessageLabel: "Tu mensaje:",
    userExplore: "Mientras tanto, puedes seguir explorando tus planes de nutrición personalizados en la app.",
    userSignature: "El equipo de Chefly.AI",
    userTagline: "Tu coach de nutrición con IA"
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
    userThanks: "Thank you for contacting us. We have received your message and our team will get back to you as soon as possible.",
    userMessageLabel: "Your message:",
    userExplore: "In the meantime, you can continue exploring your personalized nutrition plans in the app.",
    userSignature: "The Chefly.AI Team",
    userTagline: "Your AI nutrition coach"
  }
};

const generateUserEmailHTML = (name: string, message: string, t: typeof emailTemplates.es) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chefly.AI</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
              <!-- Text-based Logo for email compatibility -->
              <div style="display: inline-block; background: rgba(255,255,255,0.15); border-radius: 16px; padding: 12px 24px; margin-bottom: 16px;">
                <span style="font-size: 32px; margin-right: 8px;">🍳</span>
                <span style="color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -1px;">Chefly.AI</span>
              </div>
              <h1 style="color: #ffffff; font-size: 26px; font-weight: 700; margin: 16px 0 0 0; letter-spacing: -0.5px;">
                ${t.userGreeting} ${name}! 👋
              </h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 12px 0 0 0;">
                ${t.userTagline}
              </p>
            </td>
          </tr>
              <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 12px 0 0 0;">
                ${t.userTagline}
              </p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px 30px;">
              
              <!-- Thank you message -->
              <p style="color: #374151; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0;">
                ${t.userThanks}
              </p>
              
              <!-- Message Box -->
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border-left: 4px solid #22c55e; border-radius: 0 12px 12px 0; padding: 24px; margin: 24px 0;">
                <p style="color: #166534; font-size: 14px; font-weight: 600; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                  📝 ${t.userMessageLabel}
                </p>
                <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">
                  ${message}
                </p>
              </div>
              
              <!-- Explore CTA -->
              <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 24px 0;">
                ${t.userExplore}
              </p>
              
              <!-- Button -->
              <table role="presentation" style="width: 100%; margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://cheflyai.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 12px; box-shadow: 0 4px 14px rgba(34, 197, 94, 0.4);">
                      Ir a la App 🚀
                    </a>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; border-radius: 0 0 16px 16px; padding: 32px 30px; text-align: center;">
              <p style="color: #d1d5db; font-size: 14px; margin: 0 0 8px 0; font-weight: 500;">
                ${t.userSignature}
              </p>
              <p style="color: #9ca3af; font-size: 13px; margin: 0;">
                © ${new Date().getFullYear()} Chefly.AI - Todos los derechos reservados
              </p>
              
              <!-- Social Links -->
              <div style="margin-top: 20px;">
                <a href="https://cheflyai.com" style="display: inline-block; margin: 0 8px; color: #9ca3af; text-decoration: none; font-size: 13px;">
                  🌐 cheflyai.com
                </a>
              </div>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const generateAdminEmailHTML = (name: string, email: string, subject: string, message: string, t: typeof emailTemplates.es) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 12px 12px 0 0; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">
                📬 ${t.adminTitle}
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="background-color: #ffffff; padding: 30px;">
              
              <!-- Contact Info Grid -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 16px; background-color: #f8fafc; border-radius: 8px; margin-bottom: 8px;">
                    <span style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">${t.adminName}</span>
                    <p style="color: #1e293b; font-size: 16px; font-weight: 500; margin: 4px 0 0 0;">${name}</p>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #f8fafc; border-radius: 8px;">
                    <span style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">${t.adminEmail}</span>
                    <p style="color: #1e293b; font-size: 16px; font-weight: 500; margin: 4px 0 0 0;">
                      <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a>
                    </p>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #f8fafc; border-radius: 8px;">
                    <span style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">${t.adminSubject}</span>
                    <p style="color: #1e293b; font-size: 16px; font-weight: 500; margin: 4px 0 0 0;">${subject}</p>
                  </td>
                </tr>
              </table>
              
              <!-- Message -->
              <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
                <p style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; margin: 0 0 12px 0;">${t.adminMessage}</p>
                <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
              
              <!-- Reply Button -->
              <table role="presentation" style="width: 100%; margin-top: 24px;">
                <tr>
                  <td align="center">
                    <a href="mailto:${email}?subject=Re: ${subject}" style="display: inline-block; background: #3b82f6; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 8px;">
                      Responder →
                    </a>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-radius: 0 0 12px 12px; padding: 20px; text-align: center;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                ${t.adminFooter}
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

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
      html: generateAdminEmailHTML(name, email, subject, message, t),
    });

    console.log("Admin email sent:", adminEmailResponse);

    const userEmailResponse = await resend.emails.send({
      from: "Chefly.AI <contacto@cheflyai.com>",
      to: [email],
      subject: t.userSubject,
      html: generateUserEmailHTML(name, message, t),
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

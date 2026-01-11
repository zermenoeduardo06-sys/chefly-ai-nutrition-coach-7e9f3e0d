import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { ContactForm } from "@/components/ContactForm";
import { useLanguage } from "@/contexts/LanguageContext";

const Contact = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-background border-b border-border"
      >
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="h-6 w-6 text-muted-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">
            {language === "es" ? "Contáctanos" : "Contact Us"}
          </h1>
          <div className="w-10" />
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-4 pt-6"
      >
        <ContactForm />
      </motion.div>
    </div>
  );
};

export default Contact;

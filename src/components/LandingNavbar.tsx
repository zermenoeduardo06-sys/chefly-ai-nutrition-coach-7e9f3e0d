import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const navSections = [
  { id: "how-it-works", labelKey: "nav.howItWorks" },
  { id: "features", labelKey: "nav.features" },
  { id: "pricing", labelKey: "nav.pricing" },
  { id: "testimonials", labelKey: "nav.testimonials" },
];

export const LandingNavbar = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { scrollY } = useScroll();
  const [activeSection, setActiveSection] = useState<string>("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Transform values based on scroll
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["hsl(var(--background) / 0.3)", "hsl(var(--background) / 0.85)"]
  );
  const backdropBlur = useTransform(scrollY, [0, 100], ["blur(8px)", "blur(20px)"]);
  const borderOpacity = useTransform(scrollY, [0, 100], [0, 0.5]);
  const shadowOpacity = useTransform(scrollY, [0, 100], [0, 0.1]);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = navSections.map((s) => document.getElementById(s.id));
      const scrollPosition = window.scrollY + 150;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(navSections[i].id);
          return;
        }
      }
      setActiveSection("");
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
    setIsMenuOpen(false);
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.nav
        className="border-b transition-colors duration-300"
        style={{
          backgroundColor: backgroundColor as any,
          backdropFilter: backdropBlur as any,
          WebkitBackdropFilter: backdropBlur as any,
          borderColor: `hsl(var(--border) / ${borderOpacity.get()})`,
          boxShadow: `0 4px 30px hsl(var(--foreground) / ${shadowOpacity.get()})`,
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo */}
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-2xl md:text-3xl font-brand font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Chefly.AI
          </motion.button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navSections.map((section) => (
              <motion.button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-full ${
                  activeSection === section.id
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t(section.labelKey)}
                {activeSection === section.id && (
                  <motion.div
                    layoutId="activeSection"
                    className="absolute inset-0 bg-primary/10 rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4">
            <div className="hidden sm:block">
              <LanguageToggle />
            </div>
            
            {/* Coming Soon badge */}
            <div className="hidden sm:flex items-center">
              <div className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
                <span className="text-xs font-medium text-primary">
                  📱 {t("common.comingSoon")}
                </span>
              </div>
            </div>

            {/* Mobile menu button */}
            <motion.button
              className="md:hidden p-1.5 text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileTap={{ scale: 0.9 }}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile menu */}
        <motion.div
          initial={false}
          animate={{
            height: isMenuOpen ? "auto" : 0,
            opacity: isMenuOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden border-t border-border/30"
        >
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navSections.map((section) => (
              <motion.button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
                whileTap={{ scale: 0.98 }}
              >
                {t(section.labelKey)}
              </motion.button>
            ))}
            <div className="pt-2 flex items-center gap-2">
              <LanguageToggle />
            </div>
          </div>
        </motion.div>
      </motion.nav>
    </motion.header>
  );
};

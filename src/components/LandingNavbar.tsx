import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
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
  const [activeSection, setActiveSection] = useState<string>("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
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

    window.addEventListener("scroll", handleScroll, { passive: true });
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
    <header className="fixed top-0 left-0 right-0 z-50 animate-fade-in">
      <nav
        className={`border-b transition-all duration-300 ${
          isScrolled 
            ? "bg-background/85 backdrop-blur-xl border-border/50 shadow-lg" 
            : "bg-background/30 backdrop-blur-sm border-transparent"
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-2xl md:text-3xl font-brand font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          >
            Chefly.AI
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navSections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-full hover:scale-105 active:scale-95 ${
                  activeSection === section.id
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t(section.labelKey)}
              </button>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4">
            <div className="hidden sm:block">
              <LanguageToggle />
            </div>
            
            <div className="hidden sm:block">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/auth")}
                className="bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80"
              >
                {t("nav.login")}
              </Button>
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-primary to-primary-hover shadow-lg shadow-primary/25 text-xs sm:text-sm px-3 sm:px-4"
            >
              <span className="hidden sm:inline">{t("hero.cta")}</span>
              <span className="sm:hidden">Empezar</span>
            </Button>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-1.5 text-foreground active:scale-90 transition-transform"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden border-t border-border/30 transition-all duration-300 ${
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navSections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {t(section.labelKey)}
              </button>
            ))}
            <div className="pt-2 flex items-center gap-2">
              <LanguageToggle />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

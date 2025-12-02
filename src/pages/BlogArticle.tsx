import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { Clock, ArrowLeft, Calendar, User, Share2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useEffect } from "react";
import { toast } from "sonner";

const BlogArticle = () => {
  const navigate = useNavigate();
  const { articleId } = useParams();
  const { t, language, getArray } = useLanguage();

  // Article data - in a real app, this would come from a database
  const articles: Record<string, any> = {
    "meal-planning-weight-loss": {
      title: t("blog.article1.title"),
      content: getArray("blog.article1.content"),
      tags: getArray("blog.article1.tags"),
      readTime: t("blog.article1.readTime"),
      date: t("blog.article1.date"),
      author: t("blog.article1.author"),
    },
  };

  const article = articles[articleId || ""];

  useEffect(() => {
    if (!article) return;

    // Add JSON-LD structured data for SEO
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": article.title,
      "author": {
        "@type": "Person",
        "name": article.author
      },
      "datePublished": article.date,
      "image": "https://chefly.ai/og-image.jpg",
      "publisher": {
        "@type": "Organization",
        "name": "Chefly.AI",
        "logo": {
          "@type": "ImageObject",
          "url": "https://chefly.ai/logo.png"
        }
      }
    });
    document.head.appendChild(script);

    // Update meta tags
    document.title = `${article.title} | Chefly.AI Blog`;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", article.content[0].substring(0, 160));
    }

    return () => {
      document.head.removeChild(script);
      document.title = "Chefly.AI - Planificación Nutricional con IA";
    };
  }, [article]);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Artículo no encontrado</h1>
          <Button onClick={() => navigate("/blog")}>Volver al blog</Button>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(language === "es" ? "Enlace copiado al portapapeles" : "Link copied to clipboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/blog")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>{t("blog.backToBlog")}</span>
          </Button>
          <LanguageToggle />
        </div>
      </nav>

      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{article.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{article.readTime}</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            {t("blog.shareArticle")}
          </Button>
        </header>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          {article.content.map((paragraph: string, index: number) => {
            if (paragraph.startsWith("## ")) {
              return (
                <h2 key={index} id={`section-${index}`} className="text-3xl font-bold mt-8 mb-4 scroll-mt-16">
                  {paragraph.replace("## ", "")}
                </h2>
              );
            } else if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
              return (
                <h3 key={index} className="text-xl font-semibold mt-6 mb-3">
                  {paragraph.replace(/\*\*/g, "")}
                </h3>
              );
            } else {
              return (
                <p key={index} className="mb-4 text-lg leading-relaxed text-foreground/90">
                  {paragraph.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
                    if (part.startsWith("**") && part.endsWith("**")) {
                      return (
                        <strong key={i} className="font-semibold text-foreground">
                          {part.replace(/\*\*/g, "")}
                        </strong>
                      );
                    }
                    return part;
                  })}
                </p>
              );
            }
          })}
        </div>

        <div className="mt-12 p-8 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-3">
              {language === "es" ? "¿Listo para transformar tu alimentación?" : "Ready to transform your nutrition?"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              {language === "es" 
                ? "Únete a miles de usuarios que ya están alcanzando sus metas de salud con Chefly.AI. Comienza hoy con 4 días gratis." 
                : "Join thousands of users who are already achieving their health goals with Chefly.AI. Start today with 4 days free."}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="gap-2"
              >
                {language === "es" ? "Comenzar Gratis" : "Start Free"}
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/")}
              >
                {language === "es" ? "Conocer más" : "Learn more"}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex justify-between items-center">
          <Button
            onClick={() => navigate("/blog")}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("blog.backToBlog")}
          </Button>
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
          >
            {language === "es" ? "Ir al inicio" : "Go to home"}
          </Button>
        </div>
      </article>

      <footer className="border-t mt-16 py-8 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground">&copy; 2025 Chefly.AI. {language === "es" ? "Todos los derechos reservados" : "All rights reserved"}.</p>
            <div className="flex gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                {language === "es" ? "Inicio" : "Home"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/pricing")}>
                {language === "es" ? "Precios" : "Pricing"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/blog")}>
                Blog
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogArticle;

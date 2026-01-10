import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Utensils } from "lucide-react";

interface MealImageWithSkeletonProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  containerClassName?: string;
}

export function MealImageWithSkeleton({ 
  src, 
  alt, 
  className = "",
  containerClassName = ""
}: MealImageWithSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Handle null/undefined src
  const hasValidSrc = src && src.trim() !== '';

  return (
    <div className={`relative w-full h-full ${containerClassName}`}>
      {/* Skeleton loader */}
      {isLoading && !hasError && hasValidSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Skeleton className="w-full h-full absolute inset-0" />
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <Utensils className="w-5 h-5 text-primary/50" />
            </div>
          </div>
        </div>
      )}
      
      {/* Error/No image fallback */}
      {(hasError || !hasValidSrc) && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Utensils className="w-6 h-6 text-primary/40" />
            </div>
          </div>
        </div>
      )}
      
      {/* Actual image */}
      {hasValidSrc && (
        <img
          src={src}
          alt={alt}
          loading="eager"
          className={`absolute inset-0 w-full h-full object-cover ${className} ${isLoading || hasError ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      )}
    </div>
  );
}

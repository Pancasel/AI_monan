import { useEffect, useState } from "react";
import { IMAGE_FALLBACK } from "../lib/restaurantUi";

interface ImgWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImgWithFallback({ src, alt, className }: ImgWithFallbackProps) {
  const [url, setUrl] = useState(src);

  useEffect(() => {
    setUrl(src);
  }, [src]);

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setUrl(IMAGE_FALLBACK)}
    />
  );
}

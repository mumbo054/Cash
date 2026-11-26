import * as React from 'react';

export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  avifSrc?: string;
  webpSrc?: string;
  alt: string;
  aboveFold?: boolean;
}

/**
 * Serves AVIF and WebP formats with graceful fallback and lazy-loads images below the fold
 * with explicit dimensions to avoid layout shift.
 */
export function OptimizedImage({
  src,
  avifSrc,
  webpSrc,
  alt,
  aboveFold = false,
  loading,
  decoding,
  ...imgProps
}: OptimizedImageProps) {
  return (
    <picture>
      {avifSrc && <source srcSet={avifSrc} type="image/avif" />}
      {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
      <img
        src={src}
        alt={alt}
        loading={loading ?? (aboveFold ? 'eager' : 'lazy')}
        decoding={decoding ?? 'async'}
        {...imgProps}
      />
    </picture>
  );
}

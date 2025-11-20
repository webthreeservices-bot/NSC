/**
 * Image Optimization Utilities
 * Provides utilities for optimizing images
 */

/**
 * Image configuration for Next.js
 */
export const imageConfig = {
  domains: [
    'localhost',
    'nscbotplatform.com',
    // Add any CDN domains here
  ],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  formats: ['image/webp', 'image/avif'],
  minimumCacheTTL: 60,
}

/**
 * Get optimized image props
 */
export function getOptimizedImageProps(
  src: string,
  width: number,
  height: number,
  priority: boolean = false
) {
  return {
    src,
    width,
    height,
    quality: 85, // Balance between quality and file size
    priority,
    placeholder: 'blur' as const,
    loading: priority ? ('eager' as const) : ('lazy' as const),
  }
}

/**
 * Image blur data URL generator
 */
export function generateBlurDataURL(width: number = 10, height: number = 10): string {
  return `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#e5e7eb"/>
    </svg>`
  ).toString('base64')}`
}

/**
 * Responsive image sizes
 */
export const responsiveImageSizes = {
  avatar: {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  },
  thumbnail: {
    sm: 128,
    md: 192,
    lg: 256,
    xl: 384,
  },
  card: {
    sm: 320,
    md: 480,
    lg: 640,
    xl: 800,
  },
  hero: {
    sm: 640,
    md: 1024,
    lg: 1280,
    xl: 1920,
  },
}

/**
 * Get responsive sizes attribute
 */
export function getResponsiveSizes(breakpoints: {
  mobile?: string
  tablet?: string
  desktop?: string
}): string {
  const sizes: string[] = []

  if (breakpoints.mobile) sizes.push(`(max-width: 640px) ${breakpoints.mobile}`)
  if (breakpoints.tablet) sizes.push(`(max-width: 1024px) ${breakpoints.tablet}`)
  if (breakpoints.desktop) sizes.push(breakpoints.desktop)

  return sizes.join(', ')
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, as: 'image' = 'image') {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = as
    link.href = src
    document.head.appendChild(link)
  }
}

/**
 * Lazy load images with Intersection Observer
 */
export function lazyLoadImage(
  element: HTMLImageElement,
  src: string,
  placeholder?: string
): void {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            img.src = src
            observer.unobserve(img)
          }
        })
      },
      { rootMargin: '50px' }
    )

    if (placeholder) {
      element.src = placeholder
    }
    observer.observe(element)
  } else {
    // Fallback for browsers without Intersection Observer
    element.src = src
  }
}

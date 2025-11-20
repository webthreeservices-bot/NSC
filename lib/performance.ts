/**
 * Performance Monitoring Utilities
 * Track and optimize application performance
 */

/**
 * Performance metrics interface
 */
interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  metadata?: Record<string, any>
}

/**
 * Performance observer class
 */
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private observers: PerformanceObserver[] = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.initObservers()
    }
  }

  /**
   * Initialize performance observers
   */
  private initObservers() {
    try {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        this.recordMetric('LCP', lastEntry.renderTime || lastEntry.loadTime)
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.push(lcpObserver)

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          this.recordMetric('FID', entry.processingStart - entry.startTime)
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })
      this.observers.push(fidObserver)

      // Cumulative Layout Shift (CLS)
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            this.recordMetric('CLS', clsValue)
          }
        })
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
      this.observers.push(clsObserver)

      // Time to First Byte (TTFB)
      const navigationEntry = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming
      if (navigationEntry) {
        this.recordMetric('TTFB', navigationEntry.responseStart - navigationEntry.requestStart)
      }
    } catch (error) {
      console.error('[Performance] Error initializing observers:', error)
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    }

    this.metrics.push(metric)

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}:`, value.toFixed(2), 'ms', metadata || '')
    }

    // Send to analytics (optional)
    this.sendToAnalytics(metric)
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return this.metrics
  }

  /**
   * Get metric by name
   */
  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.find((m) => m.name === name)
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics = []
  }

  /**
   * Send metrics to analytics
   */
  private sendToAnalytics(metric: PerformanceMetric) {
    // Implement your analytics integration here
    // Example: Google Analytics, Mixpanel, etc.

    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', 'performance_metric', {
        metric_name: metric.name,
        metric_value: metric.value,
        ...metric.metadata,
      })
    }
  }

  /**
   * Cleanup observers
   */
  cleanup() {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers = []
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null

/**
 * Get performance monitor instance
 */
export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor()
  }
  return performanceMonitor
}

/**
 * Measure function execution time
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const start = performance.now()
  try {
    const result = await fn()
    const duration = performance.now() - start
    getPerformanceMonitor().recordMetric(name, duration, metadata)
    return result
  } catch (error) {
    const duration = performance.now() - start
    getPerformanceMonitor().recordMetric(name, duration, { ...metadata, error: true })
    throw error
  }
}

/**
 * Measure synchronous function execution time
 */
export function measure<T>(
  name: string,
  fn: () => T,
  metadata?: Record<string, any>
): T {
  const start = performance.now()
  try {
    const result = fn()
    const duration = performance.now() - start
    getPerformanceMonitor().recordMetric(name, duration, metadata)
    return result
  } catch (error) {
    const duration = performance.now() - start
    getPerformanceMonitor().recordMetric(name, duration, { ...metadata, error: true })
    throw error
  }
}

/**
 * Mark a performance point
 */
export function mark(name: string) {
  if (typeof window !== 'undefined') {
    performance.mark(name)
  }
}

/**
 * Measure between two marks
 */
export function measureBetween(name: string, startMark: string, endMark: string) {
  if (typeof window !== 'undefined') {
    try {
      performance.measure(name, startMark, endMark)
      const measure = performance.getEntriesByName(name)[0]
      getPerformanceMonitor().recordMetric(name, measure.duration)
    } catch (error) {
      console.error('[Performance] Error measuring between marks:', error)
    }
  }
}

/**
 * Get Core Web Vitals summary
 */
export function getCoreWebVitals() {
  const monitor = getPerformanceMonitor()
  return {
    LCP: monitor.getMetric('LCP'),
    FID: monitor.getMetric('FID'),
    CLS: monitor.getMetric('CLS'),
    TTFB: monitor.getMetric('TTFB'),
  }
}

/**
 * Report Web Vitals (for Next.js)
 */
export function reportWebVitals(metric: any) {
  const { id, name, label, value } = metric

  getPerformanceMonitor().recordMetric(name, value, {
    id,
    label,
  })

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${name}:`, value, { id, label })
  }
}

/**
 * Resource timing analysis
 */
export function analyzeResourceTiming() {
  if (typeof window === 'undefined') return []

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]

  return resources.map((resource) => ({
    name: resource.name,
    type: resource.initiatorType,
    duration: resource.duration,
    size: resource.transferSize,
    cached: resource.transferSize === 0,
  }))
}

/**
 * Get slow resources (over 1 second)
 */
export function getSlowResources(threshold: number = 1000) {
  return analyzeResourceTiming().filter((r) => r.duration > threshold)
}

/**
 * Bundle size analyzer helper
 */
export function logBundleSize(component: string, size: number) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Bundle Size] ${component}: ${(size / 1024).toFixed(2)} KB`)
  }
}

/**
 * Memory usage monitoring
 */
export function getMemoryUsage() {
  if (typeof window !== 'undefined' && (performance as any).memory) {
    const memory = (performance as any).memory
    return {
      used: (memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
      total: (memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
      limit: (memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
    }
  }
  return null
}

/**
 * Performance budget checker
 */
export interface PerformanceBudget {
  LCP?: number // ms
  FID?: number // ms
  CLS?: number // score
  TTFB?: number // ms
  bundleSize?: number // KB
}

export function checkPerformanceBudget(budget: PerformanceBudget): {
  passed: boolean
  violations: string[]
} {
  const vitals = getCoreWebVitals()
  const violations: string[] = []

  if (budget.LCP && vitals.LCP && vitals.LCP.value > budget.LCP) {
    violations.push(`LCP: ${vitals.LCP.value.toFixed(0)}ms exceeds budget of ${budget.LCP}ms`)
  }

  if (budget.FID && vitals.FID && vitals.FID.value > budget.FID) {
    violations.push(`FID: ${vitals.FID.value.toFixed(0)}ms exceeds budget of ${budget.FID}ms`)
  }

  if (budget.CLS && vitals.CLS && vitals.CLS.value > budget.CLS) {
    violations.push(`CLS: ${vitals.CLS.value.toFixed(3)} exceeds budget of ${budget.CLS}`)
  }

  if (budget.TTFB && vitals.TTFB && vitals.TTFB.value > budget.TTFB) {
    violations.push(`TTFB: ${vitals.TTFB.value.toFixed(0)}ms exceeds budget of ${budget.TTFB}ms`)
  }

  return {
    passed: violations.length === 0,
    violations,
  }
}

export default {
  getMonitor: getPerformanceMonitor,
  measureAsync,
  measure,
  mark,
  measureBetween,
  getCoreWebVitals,
  reportWebVitals,
  analyzeResourceTiming,
  getSlowResources,
  getMemoryUsage,
  checkPerformanceBudget,
}

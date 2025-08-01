/**
 * Performance monitoring utility for tracking render performance
 * Helps identify performance bottlenecks in production
 */
import React from 'react';

export class PerformanceMonitor {
  private static measurements = new Map<string, number[]>();

  static startMeasurement(name: string): string {
    const measurementId = `${name}-${Date.now()}-${Math.random()}`;
    if (typeof performance !== 'undefined') {
      performance.mark(`${measurementId}-start`);
    }
    return measurementId;
  }

  static endMeasurement(measurementId: string, name: string) {
    if (typeof performance === 'undefined') return;
    
    try {
      performance.mark(`${measurementId}-end`);
      performance.measure(measurementId, `${measurementId}-start`, `${measurementId}-end`);
      
      const measure = performance.getEntriesByName(measurementId)[0];
      if (measure) {
        const duration = measure.duration;
        
        if (!this.measurements.has(name)) {
          this.measurements.set(name, []);
        }
        this.measurements.get(name)!.push(duration);
        
        // Log slow operations
        if (duration > 100) {
          console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
        }
        
        // Clean up
        performance.clearMarks(`${measurementId}-start`);
        performance.clearMarks(`${measurementId}-end`);
        performance.clearMeasures(measurementId);
      }
    } catch (error) {
      console.error('Performance measurement error:', error);
    }
  }

  static getReport(): Record<string, { average: number; count: number; max: number }> {
    const report: Record<string, { average: number; count: number; max: number }> = {};
    
    for (const [name, measurements] of this.measurements.entries()) {
      report[name] = {
        average: measurements.reduce((sum, time) => sum + time, 0) / measurements.length,
        count: measurements.length,
        max: Math.max(...measurements)
      };
    }
    
    return report;
  }
}
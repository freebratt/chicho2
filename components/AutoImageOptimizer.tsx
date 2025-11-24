'use client';

import { useEffect, useState } from 'react';
import { optimizeAllNavodImages, ImageOptimizationReport, initializeAutoOptimization } from '@/lib/image-auto-optimizer';
import { loadNavody } from '@/lib/storage';

interface AutoImageOptimizerProps {
  enableGlobalOptimization?: boolean;
  showReport?: boolean;
}

/**
 * AutoImageOptimizer Component
 * 
 * Automaticky optimalizuje všetky obrázky v aplikácii pri načítaní.
 * Zabezpečuje, že všetky existujúce aj nové obrázky sú optimalizované
 * pre najlepšie zobrazenie textu.
 */
const AutoImageOptimizer: React.FC<AutoImageOptimizerProps> = ({
  enableGlobalOptimization = true,
  showReport = false
}) => {
  const [optimizationReport, setOptimizationReport] = useState<ImageOptimizationReport | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const runOptimization = async () => {
      if (isInitialized) return;
      
      console.log('🔄 AutoImageOptimizer: Starting automatic optimization');
      setIsOptimizing(true);
      
      try {
        // Optimize all navod images
        const navody = loadNavody();
        const report = await optimizeAllNavodImages(navody);
        setOptimizationReport(report);
        
        // Initialize global optimization if enabled
        if (enableGlobalOptimization) {
          await initializeAutoOptimization();
        }
        
        console.log('✅ AutoImageOptimizer: Optimization complete', report);
        
      } catch (error) {
        console.error('❌ AutoImageOptimizer: Optimization failed', error);
      } finally {
        setIsOptimizing(false);
        setIsInitialized(true);
      }
    };

    // Run optimization after a short delay to ensure DOM is ready
    const timer = setTimeout(runOptimization, 1000);
    
    return () => clearTimeout(timer);
  }, [enableGlobalOptimization, isInitialized]);

  // Don't render anything if report is not requested
  if (!showReport) {
    return null;
  }

  // Show loading state
  if (isOptimizing) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span className="text-sm font-medium">Optimalizujem obrázky...</span>
        </div>
      </div>
    );
  }

  // Show optimization report
  if (optimizationReport && optimizationReport.totalImages > 0) {
    const successRate = Math.round((optimizationReport.optimizedImages / optimizationReport.totalImages) * 100);
    
    return (
      <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
        <div className="flex items-center space-x-2">
          <span className="text-lg">✅</span>
          <div className="text-sm">
            <div className="font-medium">Obrázky optimalizované!</div>
            <div className="text-xs opacity-90">
              {optimizationReport.optimizedImages}/{optimizationReport.totalImages} ({successRate}%)
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AutoImageOptimizer;
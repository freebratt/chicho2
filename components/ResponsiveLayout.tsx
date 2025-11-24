'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import MobileNavigation from './MobileNavigation';
import { FilterState } from '@/lib/types';

interface ResponsiveLayoutProps {
  children: ReactNode;
  onFilterChange: (filters: FilterState) => void;
  currentFilters: FilterState;
}

export default function ResponsiveLayout({ 
  children, 
  onFilterChange, 
  currentFilters 
}: ResponsiveLayoutProps) {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNavigation 
          onFilterChange={onFilterChange} 
          currentFilters={currentFilters} 
        />
      </div>

      {/* Desktop Layout */}
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar 
            onFilterChange={onFilterChange} 
            currentFilters={currentFilters} 
          />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}

'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import NavodCard from '@/components/NavodCard';
import ProtectedPage from '@/components/ProtectedPage';
import { FilterState, VyrobnyNavod } from '@/lib/types';
import { initializeStorage, loadNavody } from '@/lib/storage';
import { advancedSearch } from '@/lib/search';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

function NavodyContent() {
  const searchParams = useSearchParams();
  const [navody, setNavody] = useState<VyrobnyNavod[]>([]);
  const { user } = useAuth();

  // Initialize localStorage and load data
  useEffect(() => {
    initializeStorage();
    const loadedNavody = loadNavody();
    setNavody(loadedNavody);
    console.log('Loaded navody count:', loadedNavody.length);
  }, []);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    typPrace: [],
    produkt: []
  });

  // Set initial filters from search params after component mounts
  useEffect(() => {
    const initialFilters = {
      search: searchParams.get('search') || '',
      typPrace: searchParams.get('typ') ? [searchParams.get('typ')!] : [],
      produkt: searchParams.get('produkt') ? [searchParams.get('produkt')!] : []
    };
    setFilters(initialFilters);
    console.log('Initial filters from URL:', initialFilters);
  }, [searchParams]);

  console.log('NavodyContent - Current filters:', filters);
  console.log('NavodyContent - Available navody:', navody.length);

  const handleFilterChange = (newFilters: FilterState) => {
    console.log('Filter change in NavodyContent:', newFilters);
    setFilters(newFilters);
  };

  // Filter navody based on current filters
  const filteredNavody = (() => {
    let result = [...navody];

    // Apply search with advanced algorithm
    if (filters.search) {
      result = advancedSearch(result, filters.search);
      console.log('🔍 Advanced search results:', result.length, 'out of', navody.length);
    }

    // Apply type filter
    if (filters.typPrace.length > 0) {
      result = result.filter(navod =>
        filters.typPrace.some(typ => navod.typPrace.includes(typ))
      );
    }

    // Apply product filter
    if (filters.produkt.length > 0) {
      // Special case: "ostatne" excludes the main categories
      if (filters.produkt.includes('ostatne')) {
        result = result.filter(navod =>
          !navod.produkt.includes('okno') &&
          !navod.produkt.includes('dvere') &&
          !navod.produkt.includes('HS portál')
        );
      } else {
        result = result.filter(navod =>
          filters.produkt.some(produkt => navod.produkt.includes(produkt))
        );
      }
    }

    return result;
  })();

  console.log('NavodyContent - Filtered navody:', filteredNavody.length);

  return (
    <ResponsiveLayout onFilterChange={handleFilterChange} currentFilters={filters}>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="font-orbitron text-2xl sm:text-3xl font-bold text-chicho-red">
                Výrobné návody
              </h1>
              {user?.uroven === 'admin' && (
                <Link href="/admin#navody-section">
                  <Button
                    variant="outline"
                    className="text-chicho-red border-chicho-red hover:bg-chicho-red hover:text-white"
                  >
                    <Plus size={16} className="mr-2" />
                    Pridať nový návod
                  </Button>
                </Link>
              )}
            </div>
            <p className="text-gray-600 font-inter text-sm sm:text-base">
              {filteredNavody.length} {filteredNavody.length === 1 ? 'návod' :
                filteredNavody.length < 5 ? 'návody' : 'návodov'}
              {filters.search && ` pre "${filters.search}"`}
              {filters.typPrace.length > 0 && ` • ${filters.typPrace.join(', ')}`}
              {filters.produkt.length > 0 && ` • ${filters.produkt.join(', ')}`}
            </p>
          </div>

          {/* Návody Grid */}
          {filteredNavody.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {filteredNavody.map((navod) => (
                <NavodCard key={navod.id} navod={navod} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 lg:py-12">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 lg:w-12 lg:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-russo text-lg lg:text-xl text-gray-700 mb-2">Žiadne návody</h3>
                <p className="text-gray-500 font-inter text-sm lg:text-base">
                  {filters.search || filters.typPrace.length > 0 || filters.produkt.length > 0
                    ? 'Žiadne návody nevyhovujú zadaným filtrom.'
                    : 'Zatiaľ neboli vytvorené žiadne návody.'
                  }
                </p>
                {(filters.search || filters.typPrace.length > 0 || filters.produkt.length > 0) && (
                  <button
                    onClick={() => setFilters({ search: '', typPrace: [], produkt: [] })}
                    className="mt-4 text-chicho-red hover:text-red-700 font-medium font-inter text-sm"
                  >
                    Vymazať všetky filtre
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
}

function NavodyLoading() {
  return (
    <div className="flex h-screen bg-gray-50 items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-chicho-red mx-auto mb-4"></div>
        <p className="text-gray-600 font-inter">Načítavam návody...</p>
      </div>
    </div>
  );
}

export default function NavodyPage() {
  return (
    <ProtectedPage>
      <Suspense fallback={<NavodyLoading />}>
        <NavodyContent />
      </Suspense>
    </ProtectedPage>
  );
}


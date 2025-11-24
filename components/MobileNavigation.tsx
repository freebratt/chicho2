'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  Book, 
  GraduationCap, 
  Settings, 
  Search, 
  Filter, 
  LogOut, 
  User, 
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from 'lucide-react';
import ChichoLogo from './ChichoLogo';
import MultiSelect from './MultiSelect';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FilterState } from '@/lib/types';
import { getAllAvailableTags } from '@/lib/storage';
import { useAuth } from '@/components/AuthProvider';
import { useFeedbackNotifications } from '@/hooks/use-feedback-notifications';

interface MobileNavigationProps {
  onFilterChange: (filters: FilterState) => void;
  currentFilters: FilterState;
}

export default function MobileNavigation({ onFilterChange, currentFilters }: MobileNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { newFeedbackCount, markNotificationsAsSeen } = useFeedbackNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState(currentFilters.search);
  const [availableTags, setAvailableTags] = useState<{ typPrace: string[], produkt: string[] }>({
    typPrace: [],
    produkt: []
  });

  const showSearch = pathname !== '/admin';

  // Load available tags from existing navody
  useEffect(() => {
    const tags = getAllAvailableTags();
    setAvailableTags(tags);
  }, []);

  const navigationItems = [
    { href: '/', icon: Home, label: 'Domov' },
    { href: '/navody', icon: Book, label: 'Návody' },
    { href: '/skolenia', icon: GraduationCap, label: 'Školenia' },
    ...(user?.uroven === 'admin' ? [{ href: '/admin', icon: Settings, label: 'Správa' }] : [])
  ];

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onFilterChange({
      ...currentFilters,
      search: value
    });
  };

  const toggleFilter = (type: 'typPrace' | 'produkt', values: string[]) => {
    onFilterChange({
      ...currentFilters,
      [type]: values
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    onFilterChange({
      typPrace: [],
      produkt: [],
      search: ''
    });
  };

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsMenuOpen(false);
  };

  const typyPraceOptions = availableTags.typPrace.map(tag => ({
    value: tag,
    label: tag
  }));

  const produktyOptions = availableTags.produkt.map(tag => ({
    value: tag,
    label: tag
  }));

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChichoLogo size="sm" />
            {user?.uroven === 'admin' && (
              <Link
                href="/admin#pripomienky-section"
                onClick={(e) => {
                  e.preventDefault();
                  markNotificationsAsSeen();
                  router.push('/admin');
                  setTimeout(() => {
                    const el = document.getElementById('pripomienky-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
                className="relative"
                aria-label="Schránka pripomienok"
                title="Schránka pripomienok"
              >
                <MessageSquare size={18} className="text-orange-600" />
                {newFeedbackCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                    {newFeedbackCount}
                  </span>
                )}
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {user && (
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-chicho-red text-white rounded-full flex items-center justify-center">
                  <User size={12} />
                </div>
                <span className="text-sm font-medium text-gray-900 font-inter">
                  {user.meno}
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-80 bg-white transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <ChichoLogo size="lg" />
            <p className="text-sm text-gray-600 mt-2 font-inter">Výrobný a školiaci portál</p>
          </div>

          {/* Navigation */}
          <nav className="px-4 py-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-chicho-red text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-inter font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Search */}
          {showSearch && (
            <div className="px-4 pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Hľadať návody..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 font-inter"
                />
              </div>
            </div>
          )}

          {/* Filters */}
          {showSearch && (
            <div className="flex-1 px-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-russo text-lg text-chicho-red">Filtre</h3>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="text-xs"
                  >
                    Vyčistiť
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                    className="p-1"
                  >
                    {isFiltersExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </Button>
                </div>
              </div>

              {isFiltersExpanded && (
                <>
                  {/* Typ práce */}
                  <div className="mb-6">
                    <h4 className="font-inter font-semibold text-sm text-gray-700 mb-3">Typ práce</h4>
                    <MultiSelect
                      options={typyPraceOptions}
                      selected={currentFilters.typPrace}
                      onChange={(selected) => toggleFilter('typPrace', selected)}
                      placeholder="Vyberte typy práce..."
                    />
                  </div>

                  {/* Produkt */}
                  <div className="mb-6">
                    <h4 className="font-inter font-semibold text-sm text-gray-700 mb-3">Produkt</h4>
                    <MultiSelect
                      options={produktyOptions}
                      selected={currentFilters.produkt}
                      onChange={(selected) => toggleFilter('produkt', selected)}
                      placeholder="Vyberte produkty..."
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-4 border-t border-gray-200 space-y-3">
            {/* User Info & Logout */}
            {user && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-chicho-red text-white rounded-full flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 font-inter">
                      {user.meno}
                    </p>
                    <p className="text-xs text-gray-500 font-inter">
                      {user.uroven === 'admin' ? 'Administrátor' : 'Pracovník'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-chicho-red hover:bg-red-50 p-2"
                  title="Odhlásiť sa"
                >
                  <LogOut size={16} />
                </Button>
              </div>
            )}
            
            {/* Copyright */}
            <p className="text-xs text-gray-500 font-inter">© 2025 CHICHO s.r.o.</p>
          </div>
        </div>
      </div>
    </>
  );
}
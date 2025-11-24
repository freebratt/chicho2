'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Book, GraduationCap, Settings, Search, Filter, LogOut, User, Clock, Shield, MessageSquare } from 'lucide-react';
import ChichoLogo from './ChichoLogo';
import MultiSelect from './MultiSelect';
import FeedbackNotification from './FeedbackNotification';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FilterState } from '@/lib/types';
import { getAllAvailableTags } from '@/lib/storage';
import { useAuth } from '@/components/AuthProvider';
import { getAuthData } from '@/lib/auth';
import { useFeedbackNotifications } from '@/hooks/use-feedback-notifications';

interface SidebarProps {
  onFilterChange: (filters: FilterState) => void;
  currentFilters: FilterState;
}

export default function Sidebar({ onFilterChange, currentFilters }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState(currentFilters.search);
  const [availableTags, setAvailableTags] = useState<{ typPrace: string[], produkt: string[] }>({
    typPrace: [],
    produkt: []
  });
  const [authData, setAuthData] = useState<any>(null);
  
  // Use feedback notifications hook
  const { newFeedbackCount, totalUnresolvedCount, markNotificationsAsSeen } = useFeedbackNotifications();

  // Determine if search should be visible based on current route
  const showSearch = pathname !== '/admin';

  // Load available tags from existing navody
  useEffect(() => {
    const tags = getAllAvailableTags();
    setAvailableTags(tags);
  }, []);

  // Load auth data to show login type
  useEffect(() => {
    if (user) {
      const data = getAuthData();
      setAuthData(data);
      console.log('Auth data loaded:', data);
    }
  }, [user]);

  console.log('Sidebar rendered with filters:', currentFilters);
  console.log('Available tags:', availableTags);
  console.log('Show search:', showSearch, 'for pathname:', pathname);

  const navigationItems = [
    { href: '/', icon: Home, label: 'Domov' },
    { href: '/navody', icon: Book, label: 'Návody' },
    { href: '/skolenia', icon: GraduationCap, label: 'Školenia' },
    // Show feedback inbox only for admin users
    ...(user?.uroven === 'admin' ? [{ 
      href: '/admin#pripomienky-section', 
      icon: MessageSquare, 
      label: 'Schránka pripomienok',
      count: totalUnresolvedCount
    }] : []),
    // Show admin section only for admin users
    ...(user?.uroven === 'admin' ? [{ href: '/admin', icon: Settings, label: 'Správa' }] : [])
  ] as Array<{
    href: string;
    icon: any;
    label: string;
    count?: number;
  }>;

  const handleSearchChange = (value: string) => {
    console.log('Search term changed:', value);
    setSearchTerm(value);
    onFilterChange({
      ...currentFilters,
      search: value
    });
  };

  const toggleFilter = (type: 'typPrace' | 'produkt', values: string[]) => {
    console.log('Updating filter:', type, values);
    onFilterChange({
      ...currentFilters,
      [type]: values
    });
  };

  const clearFilters = () => {
    console.log('Clearing all filters');
    setSearchTerm('');
    onFilterChange({
      typPrace: [],
      produkt: [],
      search: ''
    });
  };

  const handleLogout = () => {
    console.log('User logging out from sidebar');
    logout();
    router.push('/');
  };

  const typyPrace = availableTags.typPrace;
  const produkty = availableTags.produkt;

  const typyPraceOptions = availableTags.typPrace.map(tag => ({
    value: tag,
    label: tag
  }));

  const produktyOptions = availableTags.produkt.map(tag => ({
    value: tag,
    label: tag
  }));

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-screen flex flex-col" data-macaly="main-sidebar">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <ChichoLogo size="lg" />
          {user?.uroven === 'admin' && (
            <Link
              href="/admin#pripomienky-section"
              onClick={(e) => {
                e.preventDefault();
                // Mark as seen and navigate to feedback section
                markNotificationsAsSeen();
                router.push('/admin');
                setTimeout(() => {
                  const el = document.getElementById('pripomienky-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
              aria-label="Schránka pripomienok"
              title="Schránka pripomienok"
              className="relative"
            >
              <Button variant="ghost" size="sm" className="p-2">
                <MessageSquare size={18} className="text-orange-600" />
              </Button>
              {newFeedbackCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs leading-none px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {newFeedbackCount}
                </span>
              )}
            </Link>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-2 font-inter">Výrobný a školiaci portál</p>
      </div>

      {/* Navigation */}
      <nav className="px-4 py-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href.includes('#') && pathname === '/admin');
          
          const handleClick = (e: React.MouseEvent) => {
            if (item.href.includes('#pripomienky-section')) {
              e.preventDefault();
              // Mark notifications as seen when clicking on feedback inbox
              markNotificationsAsSeen();
              router.push('/admin');
              // Scroll to feedback section after navigation
              setTimeout(() => {
                const element = document.getElementById('pripomienky-section');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 100);
            }
          };
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleClick}
              className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-chicho-red text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon size={20} />
                <span className="font-inter font-medium">{item.label}</span>
              </div>
              {/* Show count badge for feedback inbox */}
              {item.count !== undefined && item.count > 0 && (
                <Badge 
                  variant="secondary" 
                  className={`ml-2 text-xs ${
                    isActive 
                      ? 'bg-white text-chicho-red' 
                      : 'bg-chicho-red text-white'
                  }`}
                >
                  {item.count}
                </Badge>
              )}
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
      <div className="flex-1 px-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-russo text-lg text-chicho-red">Filtre</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-xs"
          >
            Vyčistiť
          </Button>
        </div>

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
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-200 space-y-3">
        {/* User Info */}
        {user && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-chicho-red text-white rounded-full flex items-center justify-center">
                  <User size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 font-inter truncate">
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
            
            {/* Login Type Indicator */}
            {authData && (
              <div className="flex items-center space-x-2 px-2 py-1 bg-gray-50 rounded-md">
                {authData.storageType === 'localStorage' ? (
                  <>
                    <Shield size={12} className="text-green-600" />
                    <span className="text-xs text-green-700 font-inter">Ostať prihlásený</span>
                  </>
                ) : (
                  <>
                    <Clock size={12} className="text-blue-600" />
                    <span className="text-xs text-blue-700 font-inter">Relácia</span>
                  </>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Copyright */}
        <p className="text-xs text-gray-500 font-inter">© 2025 <span className="chicho-text">CHICHO</span> s.r.o.</p>
      </div>
    </div>
  );
}





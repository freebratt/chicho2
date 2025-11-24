'use client';

import { ArrowLeft, BookOpen, Users, Clock, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Sidebar from '@/components/Sidebar';
import ProtectedPage from '@/components/ProtectedPage';
import { FilterState } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { skolenia, pozicie } from '@/lib/data';
import { Skolenie } from '@/lib/types';
import { GraduationCap, Trophy, Star } from 'lucide-react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';

interface SkolenieCardProps {
  skolenie: Skolenie;
}

function SkolenieCard({ skolenie }: SkolenieCardProps) {
  console.log('Rendering SkolenieCard for:', skolenie.nazov);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('sk-SK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Mock progress data
  const mockProgress = Math.floor(Math.random() * 100);
  const isCompleted = mockProgress === 100;

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200" 
      data-macaly={`skolenie-card-${skolenie.id}`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-russo text-lg text-chicho-dark mb-2" data-macaly={`skolenie-nazov-${skolenie.id}`}>
              {skolenie.nazov}
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {skolenie.pozicia.map((poz) => (
                <Badge 
                  key={poz}
                  variant="outline" 
                  className="border-blue-300 text-blue-700 bg-blue-50"
                >
                  {poz}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isCompleted && (
              <div className="flex items-center space-x-1 text-green-600">
                <Trophy size={16} />
                <span className="text-xs font-semibold">Dokončené</span>
              </div>
            )}
            {skolenie.bodovania && (
              <div className="flex items-center space-x-1 text-yellow-600">
                <Star size={16} />
                <span className="text-sm font-semibold">{skolenie.bodovania}b</span>
              </div>
            )}
          </div>
        </div>

        {/* Material Preview */}
        <div className="mb-4">
          <p className="text-gray-600 text-sm font-inter line-clamp-3">
            {skolenie.material.split('\n')[0] || 'Školiaci materiál'}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-inter text-gray-600">Pokrok</span>
            <span className="text-sm font-semibold text-chicho-red">{mockProgress}%</span>
          </div>
          <Progress value={mockProgress} className="h-2" />
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <Clock size={14} />
            <span>Vytvorené {formatDate(skolenie.vytvorene)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users size={14} />
            <span>12 zamestnancov</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button 
            className="bg-chicho-red hover:bg-red-700 text-white font-inter"
            size="sm"
          >
            <BookOpen size={16} className="mr-2" />
            {isCompleted ? 'Zopakovať' : 'Pokračovať'}
          </Button>
          
          {skolenie.test && (
            <Button variant="outline" size="sm">
              Spustiť test
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SkoleniaPage() {
  console.log('SkoleniaPage rendered');
  
  const [filters, setFilters] = useState<FilterState>({
    typPrace: [],
    produkt: [],
    search: ''
  });

  const handleFilterChange = (newFilters: FilterState) => {
    console.log('Filter changed on skolenia page:', newFilters);
    setFilters(newFilters);
  };

  // Filter školenia based on search
  const filteredSkolenia = skolenia.filter(skolenie => {
    const matchesSearch = !filters.search || 
      skolenie.nazov.toLowerCase().includes(filters.search.toLowerCase()) ||
      skolenie.material.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesSearch;
  });

  // Mock statistics
  const stats = {
    total: skolenia.length,
    completed: Math.floor(skolenia.length * 0.7),
    inProgress: Math.floor(skolenia.length * 0.2),
    notStarted: Math.floor(skolenia.length * 0.1)
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onFilterChange={handleFilterChange} currentFilters={filters} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8" data-macaly="skolenia-header">
            {/* Hero Section */}
            <div 
              className="relative rounded-2xl overflow-hidden mb-6 p-8 text-white"
              style={{
                backgroundImage: 'linear-gradient(rgba(194, 0, 0, 0.85), rgba(194, 0, 0, 0.7)), url("https://images.pexels.com/photos/3862627/pexels-photo-3862627.jpeg?auto=compress&cs=tinysrgb&h=650&w=940")',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <h1 className="font-orbitron text-3xl font-bold mb-2">
                Školenia a vzdelávanie
              </h1>
              <p className="text-lg font-inter opacity-90">
                Školiace materiály, testy a sledovanie pokroku zamestnancov
              </p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-russo text-sm text-gray-600">Celkom školení</h3>
                <GraduationCap size={20} className="text-chicho-red" />
              </div>
              <p className="text-2xl font-bold text-chicho-dark">{stats.total}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-russo text-sm text-gray-600">Dokončené</h3>
                <Trophy size={20} className="text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-russo text-sm text-gray-600">Prebieha</h3>
                <Clock size={20} className="text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-russo text-sm text-gray-600">Nezačaté</h3>
                <BookOpen size={20} className="text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-400">{stats.notStarted}</p>
            </div>
          </div>

          {/* Školenia Grid */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-russo text-2xl text-chicho-red">
                Dostupné školenia ({filteredSkolenia.length})
              </h2>
              <Button className="bg-chicho-red hover:bg-red-700 text-white">
                Pridať nové školenie
              </Button>
            </div>

            {filteredSkolenia.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSkolenia.map((skolenie) => (
                  <SkolenieCard key={skolenie.id} skolenie={skolenie} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                <GraduationCap size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="font-russo text-xl text-gray-600 mb-2">Žiadne školenia nenájdené</h3>
                <p className="text-gray-500 font-inter">
                  Skúste zmeniť hľadaný výraz alebo vytvorte nové školenie
                </p>
              </div>
            )}
          </div>

          {/* Pozície Overview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-russo text-xl text-chicho-red mb-6">Pozície a ich školenia</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pozicie.map((pozicia) => (
                <div key={pozicia.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-russo text-lg text-chicho-dark mb-2">{pozicia.nazov}</h4>
                  <p className="text-gray-600 font-inter text-sm mb-4">{pozicia.popis}</p>
                  
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Potrebné školenia:</p>
                    <div className="flex flex-wrap gap-2">
                      {pozicia.potrebneSkoleinia.map((skolenieId) => {
                        const skolenie = skolenia.find(s => s.id === skolenieId);
                        return skolenie ? (
                          <Badge key={skolenie.id} variant="secondary" className="text-xs">
                            {skolenie.nazov}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">8 zamestnancov</span>
                    <Button variant="outline" size="sm">
                      Detail pozície
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
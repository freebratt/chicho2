'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import LoginForm from '@/components/LoginForm';

interface ProtectedPageProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedPage({ children, requireAdmin = false }: ProtectedPageProps) {
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Small delay to allow auth state to initialize
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-chicho-red"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  if (requireAdmin && user?.uroven !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="font-orbitron text-2xl font-bold text-chicho-red mb-4">
            Nedostatočné oprávnenia
          </h1>
          <p className="font-inter text-gray-600">
            Táto stránka je dostupná len pre administrátorov.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
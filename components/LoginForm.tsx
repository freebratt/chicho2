

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { login } from '@/lib/auth';
import { useAuth } from '@/components/AuthProvider';
import ChichoLogo from '@/components/ChichoLogo';
import { useRouter } from 'next/navigation';
import { loadUzivatelia, initializeStorage } from '@/lib/storage';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login: authLogin } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log('Login attempt:', formData.email, 'Remember me:', formData.rememberMe);

    try {
      const result = await login(formData.email, formData.password, formData.rememberMe);
      
      if (result.success && result.user) {
        authLogin(result.user);
        
        // Redirect based on user role
        if (result.user.uroven === 'admin') {
          console.log('Redirecting admin to /admin');
          router.push('/admin');
        } else {
          console.log('Redirecting worker to /navody');
          router.push('/navody');
        }
      } else {
        setError(result.error || 'Prihlásenie zlyhalo');
      }
    } catch (err) {
      setError('Chyba servera. Skúste to znova.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(''); // Clear error when user starts typing
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      rememberMe: checked
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <ChichoLogo size="lg" />
          </div>
          <h1 className="font-orbitron text-3xl font-bold text-chicho-red mb-2">
            Prihlásenie
          </h1>
          <p className="font-inter text-gray-600">
            Interný portál pre výrobné návody a školenia
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="font-russo text-xl text-center text-chicho-dark">
              Vstup do portálu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800 font-inter">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="font-inter font-semibold">
                  E-mailová adresa
                </Label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="jan@chicho.tech"
                    className="pl-10 font-inter"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-inter font-semibold">
                  Heslo
                </Label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="pl-10 pr-10 font-inter"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <Label 
                  htmlFor="rememberMe" 
                  className="font-inter text-sm text-gray-700 cursor-pointer"
                >
                  Ostať prihlásený
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-chicho-red hover:bg-red-700 text-white font-inter font-semibold py-3"
                disabled={isLoading}
              >
                {isLoading ? 'Prihlasuje sa...' : 'Prihlásiť sa'}
              </Button>
            </form>

            {/* Footer */}
            <div className="text-center">
              <p className="text-sm text-gray-500 font-inter">
                © 2025 <span className="chicho-text">CHICHO</span> s.r.o. - Všetky práva vyhradené
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



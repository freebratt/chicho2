'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAuthData, getCurrentUser, hasRememberMe } from '@/lib/auth';
import { useAuth } from '@/components/AuthProvider';

export default function AuthDebug() {
  const [authData, setAuthData] = useState<any>(null);
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const { user, isAuthenticated } = useAuth();

  const refreshData = () => {
    const data = getAuthData();
    const currentUser = getCurrentUser();
    const rememberMe = hasRememberMe();
    
    setAuthData(data);
    setStorageInfo({
      localStorage: localStorage.getItem('chicho_current_user'),
      sessionStorage: sessionStorage.getItem('chicho_current_user'),
      hasRememberMe: rememberMe,
      currentUser: currentUser,
      timestamp: new Date().toISOString()
    });
  };

  useEffect(() => {
    refreshData();
  }, [user, isAuthenticated]);

  const clearStorage = () => {
    localStorage.removeItem('chicho_current_user');
    sessionStorage.removeItem('chicho_current_user');
    refreshData();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Auth Debug Info</span>
          <div className="space-x-2">
            <Button onClick={refreshData} size="sm" variant="outline">
              Refresh
            </Button>
            <Button onClick={clearStorage} size="sm" variant="destructive">
              Clear Storage
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Auth State */}
        <div>
          <h4 className="font-semibold mb-2">Current Auth State:</h4>
          <div className="flex gap-2 mb-2">
            <Badge variant={isAuthenticated ? "default" : "secondary"}>
              {isAuthenticated ? "Authenticated" : "Not Authenticated"}
            </Badge>
            {authData?.storageType && (
              <Badge variant={authData.storageType === 'localStorage' ? "default" : "outline"}>
                {authData.storageType === 'localStorage' ? "Persistent" : "Session"}
              </Badge>
            )}
          </div>
          {user && (
            <p className="text-sm text-gray-600">
              User: {user.email} ({user.uroven})
            </p>
          )}
        </div>

        {/* Auth Data */}
        {authData && (
          <div>
            <h4 className="font-semibold mb-2">Auth Data:</h4>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
              {JSON.stringify(authData, null, 2)}
            </pre>
          </div>
        )}

        {/* Storage Info */}
        {storageInfo && (
          <div>
            <h4 className="font-semibold mb-2">Storage Info:</h4>
            <div className="space-y-2">
              <div>
                <strong>localStorage:</strong> 
                <span className={storageInfo.localStorage ? "text-green-600" : "text-gray-500"}>
                  {storageInfo.localStorage ? " ✓ Present" : " ✗ Empty"}
                </span>
              </div>
              <div>
                <strong>sessionStorage:</strong> 
                <span className={storageInfo.sessionStorage ? "text-blue-600" : "text-gray-500"}>
                  {storageInfo.sessionStorage ? " ✓ Present" : " ✗ Empty"}
                </span>
              </div>
              <div>
                <strong>Remember Me:</strong> 
                <span className={storageInfo.hasRememberMe ? "text-green-600" : "text-gray-500"}>
                  {storageInfo.hasRememberMe ? " ✓ Enabled" : " ✗ Disabled"}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500">
          Last updated: {storageInfo?.timestamp}
        </div>
      </CardContent>
    </Card>
  );
}
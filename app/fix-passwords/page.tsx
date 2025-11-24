'use client';

import { useState } from 'react';

// Simple hash function (same as in auth.ts)
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
}

export default function FixPasswordsPage() {
  const [status, setStatus] = useState<string>('');
  
  const fixPasswords = () => {
    try {
      console.log('🔄 Starting password fix...');
      setStatus('Fixing passwords...');
      
      // Get users from localStorage
      const usersString = localStorage.getItem('chicho_uzivatelia');
      if (!usersString) {
        console.log('❌ No users found in localStorage');
        setStatus('❌ No users found in localStorage');
        return;
      }
      
      const users = JSON.parse(usersString);
      console.log('📊 Found users:', users.length);
      
      // Update all passwords to use proper hash
      const newPassword = 'Chicho123';
      const newPasswordHash = simpleHash(newPassword);
      console.log('🔒 New password hash:', newPasswordHash);
      
      users.forEach((user: any) => {
        const oldHash = user.hesloHash;
        user.hesloHash = newPasswordHash;
        console.log(`🔄 Updated ${user.email}: ${oldHash} -> ${newPasswordHash}`);
      });
      
      // Save back to localStorage
      localStorage.setItem('chicho_uzivatelia', JSON.stringify(users));
      console.log('✅ Password fix complete!');
      setStatus(`✅ Fixed passwords for ${users.length} users!`);
      
    } catch (error) {
      console.error('❌ Error fixing passwords:', error);
      setStatus('❌ Error fixing passwords: ' + error);
    }
  };
  
  const clearStorage = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('chicho_')) {
        localStorage.removeItem(key);
        console.log('🗑️ Removed:', key);
      }
    });
    setStatus('🗑️ Storage cleared');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Password Fix Utility</h1>
        
        <div className="space-y-4">
          <button
            onClick={fixPasswords}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Fix All User Passwords
          </button>
          
          <button
            onClick={clearStorage}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            Clear All Storage
          </button>
          
          {status && (
            <div className="p-3 bg-gray-100 rounded text-sm">
              {status}
            </div>
          )}
          
          <div className="text-xs text-gray-500">
            This will set all user passwords to: <code>Chicho123</code>
          </div>
        </div>
      </div>
    </div>
  );
}
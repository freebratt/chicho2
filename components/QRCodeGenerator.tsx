'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useAuth } from '@/components/AuthProvider';
import { recordUserActivity } from '@/lib/storage';

interface QRCodeGeneratorProps {
  url: string;
  size?: number;
  navodId?: string; // Optional navod ID for activity tracking
  navodNazov?: string; // Optional navod name for activity tracking
}

// Utility function for generating QR code data URL (used in PDF export)
export async function generateQRCodeDataUrl(url: string, size: number = 200): Promise<string> {
  try {
    const qrUrl = await QRCode.toDataURL(url, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrUrl;
  } catch (error) {
    console.error('Error generating QR code data URL:', error);
    throw error;
  }
}

export default function QRCodeGenerator({ url, size = 256, navodId, navodNazov }: QRCodeGeneratorProps) {
  const { user } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateQR = async () => {
      try {
        console.log('Generating QR code for URL:', url);
        const qrUrl = await QRCode.toDataURL(url, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(qrUrl);
        setLoading(false);
        
        // Record QR generation activity
        if (user && navodId && navodNazov) {
          recordUserActivity(
            user.id, 
            'qr-generovanie', 
            `Generovanie QR kódu: ${navodNazov}`, 
            navodId
          );
          console.log('QR generation activity recorded for user:', user.meno);
        }
      } catch (error) {
        console.error('Error generating QR code:', error);
        setLoading(false);
      }
    };

    if (url) {
      generateQR();
    }
  }, [url, size, user, navodId, navodNazov]);

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg"
        style={{ width: size, height: size }}
      >
        <div className="text-gray-500 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto mb-2"></div>
          <p className="text-sm">Generujem QR kód...</p>
        </div>
      </div>
    );
  }

  if (!qrCodeUrl) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg"
        style={{ width: size, height: size }}
      >
        <p className="text-gray-500 text-sm text-center">
          Chyba pri generovaní<br />QR kódu
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <img 
        src={qrCodeUrl} 
        alt="QR kód" 
        className="rounded-lg border border-gray-200"
        style={{ width: size, height: size }}
      />
      <div className="text-center">
        <p className="text-sm text-gray-600 font-inter mb-2">
          QR kód pre rýchly prístup na mobilnom zariadení
        </p>
        <div className="text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded max-w-xs break-all">
          {url}
        </div>
      </div>
    </div>
  );
}


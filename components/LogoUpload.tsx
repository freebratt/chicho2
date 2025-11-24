'use client';

import { useState } from 'react';
import { Upload, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { showNotification } from '@/lib/storage';

export default function LogoUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const generateUploadUrl = useMutation(api.logo.generateUploadUrl);
  const saveLogo = useMutation(api.logo.saveLogo);

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      setUploadSuccess(false);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Súbor musí byť obrázok');
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Súbor je príliš veľký (max 5MB)');
      }
      
      console.log('Starting logo upload:', file.name, file.type, file.size);
      
      // Step 1: Get upload URL from Convex
      const uploadUrl = await generateUploadUrl();
      console.log('Got upload URL:', uploadUrl);
      
      // Step 2: Upload file directly to Convex storage using POST
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST", // CRITICAL: Must be POST, not PUT
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }
      
      // Step 3: Get the storage ID from response
      const { storageId } = await uploadResponse.json();
      console.log('Got storage ID:', storageId);
      
      if (!storageId) {
        throw new Error("No storage ID returned from upload");
      }
      
      // Step 4: Save metadata to database
      await saveLogo({
        storageId,
        filename: file.name,
        contentType: file.type,
        size: file.size,
      });
      
      console.log('Logo uploaded successfully:', storageId);
      setUploadSuccess(true);
      showNotification('✅ Logo bolo úspešne nahraté!', 'success');
      
      // Refresh page after 2 seconds to show new logo
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Upload error:', error);
      showNotification(`❌ Chyba pri nahrávaní: ${error instanceof Error ? error.message : 'Neznáma chyba'}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    await handleFileUpload(file);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="font-russo text-chicho-red flex items-center gap-2">
          <Upload size={20} />
          Nahrať nové logo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="logo-upload" className="font-inter font-semibold text-sm">
            Vyberte obrázok loga
          </Label>
          <Input
            id="logo-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="mt-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Podporované formáty: PNG, JPG, SVG (max 5MB)
          </p>
        </div>
        
        {uploading && (
          <div className="flex items-center gap-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Nahráva sa...</span>
          </div>
        )}
        
        {uploadSuccess && (
          <div className="flex items-center gap-2 text-green-600">
            <Check size={16} />
            <span className="text-sm">Logo úspešne nahraté!</span>
          </div>
        )}
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-800">
              <p className="font-semibold mb-1">Dôležité informácie:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Nové logo sa automaticky zobrazí vo všetkých častiach aplikácie</li>
                <li>Staré logo bude nahradené</li>
                <li>Odporúčané rozmery: minimálne 200x200px</li>
                <li>Logo sa automaticky prispôsobí rôznym veľkostiam</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
'use client';

import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VyrobnyNavod, Pripomienka } from '@/lib/types';
import { useAuth } from '@/components/AuthProvider';
import { loadPripomienky, savePripomienky, generateId, showNotification } from '@/lib/storage';

interface FeedbackFormProps {
  navod: VyrobnyNavod;
}

export default function FeedbackForm({ navod }: FeedbackFormProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [sprava, setSprava] = useState('');
  const [cisloKroku, setCisloKroku] = useState<string>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      showNotification('❌ Musíte byť prihlásený pre odoslanie pripomienky!', 'error');
      return;
    }

    if (!sprava.trim()) {
      showNotification('❌ Pripomienka nemôže byť prázdna!', 'error');
      return;
    }

    setIsSubmitting(true);
    console.log('Sending feedback:', {
      navodId: navod.id,
      uzivatelId: user.id,
      sprava: sprava.trim(),
      cisloKroku: cisloKroku && cisloKroku !== 'general' ? parseInt(cisloKroku) : undefined
    });

    try {
      // Create new pripomienka object
      const newPripomienka: Pripomienka = {
        id: generateId('pripomienka'),
        navodId: navod.id,
        uzivatelId: user.id,
        sprava: sprava.trim(),
        cisloKroku: cisloKroku && cisloKroku !== 'general' ? parseInt(cisloKroku) : undefined,
        stav: 'nevybavena',
        vytvorena: new Date()
      };

      // Load current pripomienky and add new one
      const currentPripomienky = loadPripomienky();
      const updatedPripomienky = [newPripomienka, ...currentPripomienky];

      // Save to localStorage
      if (savePripomienky(updatedPripomienky)) {
        showNotification('✅ Pripomienka bola úspešne odoslaná administrátorom!', 'success');
        console.log('Feedback saved successfully:', newPripomienka);
        
        // Trigger storage event to notify other components about the new feedback
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'chicho_pripomienky',
          newValue: JSON.stringify(updatedPripomienky),
          storageArea: localStorage
        }));
        
        // Reset form
        setSprava('');
        setCisloKroku('general');
        setIsOpen(false);
      } else {
        showNotification('❌ Chyba pri ukladaní pripomienky!', 'error');
      }
    } catch (error) {
      console.error('Error saving feedback:', error);
      showNotification('❌ Neočakávaná chyba pri odosielaní pripomienky!', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only show for workers (not admin)
  if (!user || user.uroven === 'admin') {
    return null;
  }

  return (
    <Card className="mt-8 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="font-russo text-chicho-red flex items-center gap-2">
          <MessageSquare size={20} />
          Pripomienky k návodu
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 font-inter text-sm mb-4">
          Máte pripomienku alebo návrh na zlepšenie tohto návodu? Dajte nám vedieť!
        </p>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
              <MessageSquare size={16} className="mr-2" />
              Odoslať pripomienku
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-russo text-chicho-red">
                Pripomienka k návodu
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-inter text-sm text-gray-700">
                  <strong>Návod:</strong> {navod.nazov}
                </p>
                {user && (
                  <p className="font-inter text-xs text-gray-600 mt-1">
                    <strong>Od:</strong> {user.meno}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="krok" className="font-inter font-semibold">
                  Týka sa konkrétneho kroku? (voliteľné)
                </Label>
                <Select value={cisloKroku} onValueChange={setCisloKroku}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Vyberte krok..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Všeobecná pripomienka</SelectItem>
                    {navod.postupPrace.map((krok) => (
                      <SelectItem key={krok.id} value={krok.cislo.toString()}>
                        Krok {krok.cislo}: {krok.popis.substring(0, 50)}
                        {krok.popis.length > 50 ? '...' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="sprava" className="font-inter font-semibold">
                  Vaša pripomienka *
                </Label>
                <Textarea
                  id="sprava"
                  value={sprava}
                  onChange={(e) => setSprava(e.target.value)}
                  placeholder="Napíšte svoju pripomienku alebo návrh na zlepšenie...&#10;&#10;Príklady:&#10;• Krok 3 nie je dostatočne jasný&#10;• Chýba informácia o bezpečnosti&#10;• Odporúčam pridať obrázok k tomuto kroku"
                  rows={5}
                  className="mt-1"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pripomienka bude odoslaná administrátorom na preskúmanie
                </p>
              </div>
              
              <div className="flex items-center justify-end space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  Zrušiť
                </Button>
                <Button 
                  onClick={handleSubmit}
                  className="bg-chicho-red hover:bg-red-700 text-white"
                  disabled={!sprava.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>🔄 Odosielam...</>
                  ) : (
                    <>
                      <Send size={16} className="mr-2" />
                      Odoslať pripomienku
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}



























'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, QrCode, Play, ExternalLink, MessageSquare, CheckCircle, AlertTriangle, Calendar, Edit3, Send, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VyrobnyNavod, Tag, Pripomienka } from '@/lib/types';
import QRCodeGenerator, { generateQRCodeDataUrl } from '@/components/QRCodeGenerator';
import ProtectedPage from '@/components/ProtectedPage';
import FeedbackForm from '@/components/FeedbackForm';
import { useAuth } from '@/components/AuthProvider';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { use } from 'react';
import { initializeStorage, loadNavody, loadTagy, recordNavodVisit, recordUserActivity, loadPripomienky, savePripomienky, generateId, showNotification } from '@/lib/storage';
import ImageGallery from '@/components/ImageGallery';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function NavodDetail({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  console.log('NavodDetail component loaded for slug:', resolvedParams.slug);
  const router = useRouter();
  const { user } = useAuth();

  const [navody, setNavody] = useState<VyrobnyNavod[]>([]);
  const [tagy, setTagy] = useState<Tag[]>([]);
  const [navod, setNavod] = useState<VyrobnyNavod | null>(null);

  // Fetch attachments from Convex if navod has attachments
  const attachments = useQuery(
    api.attachments.getAttachmentsByNavodId,
    navod?.id ? { navodId: navod.id } : "skip"
  );

  // Debug attachments
  useEffect(() => {
    console.log('🔍 Attachments query result:', attachments);
    console.log('🔍 Navod ID for attachments query:', navod?.id);
  }, [attachments, navod?.id]);

  // Feedback form state
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackStep, setFeedbackStep] = useState<string>('general');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    initializeStorage();
    const loadedNavody = loadNavody();
    const loadedTagy = loadTagy();

    setNavody(loadedNavody);
    setTagy(loadedTagy);

    // Find the specific navod by slug
    const foundNavod = loadedNavody.find(n => n.slug === resolvedParams.slug);
    setNavod(foundNavod || null);

    console.log('Loaded navody:', loadedNavody.length);
    console.log('Found navod:', foundNavod?.nazov || 'Not found');

    // Record visit if navod found and user authenticated
    if (foundNavod && user) {
      recordNavodVisit(
        foundNavod.id,
        user.id,
        user.meno,
        user.email,
        foundNavod.nazov
      );
      console.log('Visit recorded for navod:', foundNavod.nazov, 'by user:', user.meno);
    }
  }, [resolvedParams.slug, user]);

  if (!navod) {
    return (
      <ProtectedPage>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="font-orbitron text-2xl font-bold text-chicho-red mb-4">
              Návod nenájdený
            </h1>
            <p className="font-inter text-gray-600 mb-4">
              Požadovaný návod sa nenašiel alebo bol odstránený.
            </p>
            <Button onClick={() => router.push('/navody')} variant="outline">
              Späť na návody
            </Button>
          </div>
        </div>
      </ProtectedPage>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('sk-SK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const handleTagClick = (tagNazov: string, tagTyp: 'typ-prace' | 'produkt') => {
    console.log('Tag clicked:', tagNazov, tagTyp);
    if (tagTyp === 'typ-prace') {
      router.push(`/navody?typ=${encodeURIComponent(tagNazov)}`);
    } else {
      router.push(`/navody?produkt=${encodeURIComponent(tagNazov)}`);
    }
  };

  const getTagColor = (tagNazov: string) => {
    const tag = tagy.find(t => t.nazov === tagNazov);
    return tag ? tag.farba : '#3B82F6';
  };

  const exportToPDF = async () => {
    console.log('Starting PDF export for:', navod.nazov);

    let loadingAlert: HTMLElement | null = null;

    try {
      // Show loading state
      loadingAlert = document.createElement('div');
      loadingAlert.innerHTML = '🔄 Generujem PDF...';
      loadingAlert.style.cssText = 'position:fixed;top:20px;right:20px;background:#dc2626;color:white;padding:12px 20px;border-radius:8px;z-index:1000;font-family:Inter,sans-serif;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.15);';
      document.body.appendChild(loadingAlert);

      // Small delay to ensure loading state is visible
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('Creating HTML content for PDF...');

      // Get logo HTML - using the static logo
      const logoHtml = `<img src="https://assets.macaly-user-data.dev/cdn-cgi/image/format=webp,width=2000,height=2000,fit=scale-down,quality=90,anim=true/jbuldz11rm382jinidkd81ad/kj34r1pvqkohnjr9zf3y8i94/mK-FLn6hbjtwTjmeeCSYb/logo.png" alt="CHICHO Logo" style="width: 160px; height: 160px; object-fit: contain;">`;

      // Generate QR code data URL for the current guide
      const qrCodeDataUrl = await generateQRCodeDataUrl(
        `${typeof window !== 'undefined' ? window.location.origin : ''}/navody/${navod.slug}`,
        200
      );

      // Generate QR codes for attachments
      const attachmentQRCodes = attachments && attachments.length > 0
        ? await Promise.all(
          attachments.map(async (att) => {
            try {
              return {
                filename: att.filename,
                url: att.url,
                qrDataUrl: await generateQRCodeDataUrl(att.url || '', 60)
              };
            } catch (error) {
              console.error('Error generating QR for attachment:', att.filename, error);
              return null;
            }
          })
        ).then(results => results.filter(r => r !== null))
        : [];

      // Create a hidden div with the content to be converted to PDF
      const pdfContent = document.createElement('div');
      pdfContent.style.cssText = `
        position: fixed;
        top: -9999px;
        left: 0;
        width: 794px;
        background: white;
        padding: 20px;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        color: #000;
        line-height: 1.3;
      `;

      // Add content with two-column layout for safety warnings and errors
      pdfContent.innerHTML = `
        <div style="margin-bottom: 20px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
            <div style="display: flex; align-items: center;">
              ${logoHtml}
              <div style="margin-left: 20px;">
                <div style="color: #666; font-size: 11px; margin-bottom: 15px;">Interný výrobný a školiaci portál</div>
                <div style="color: #000; font-size: 16px; font-weight: bold; margin-bottom: 8px;">${navod.nazov}</div>
                <div style="font-size: 9px; color: #666; line-height: 1.3;">
                  <div><strong>Typ práce:</strong> ${navod.typPrace.join(', ')}</div>
                  <div><strong>Produkt:</strong> ${navod.produkt.join(', ')}</div>
                  <div><strong>Aktualizované:</strong> ${formatDate(navod.aktualizovane)}</div>
                  <div><strong>Počet krokov:</strong> ${navod.postupPrace.length}</div>
                </div>
              </div>
            </div>
            <div style="text-align: center; margin-left: 20px;">
              <img src="${qrCodeDataUrl}" alt="QR Code" style="width: 120px; height: 120px; border: 2px solid #dc2626; border-radius: 8px; padding: 4px; background: white;">
              <div style="font-size: 7px; color: #666; margin-top: 4px; max-width: 120px;">Naskenujte pre rýchly prístup</div>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 20px;">
          <!-- Left Column: Main Content -->
          <div style="flex: 2;">
            ${navod.potrebneNaradie.length > 0 ? `
            <div style="margin-bottom: 20px;">
              <div style="color: #000; font-size: 14px; font-weight: bold; margin-bottom: 10px;">Potrebné náradie a materiál</div>
              ${navod.potrebneNaradie.map(item =>
        `<div style="margin-bottom: 4px; padding-left: 12px; font-size: 10px;">• ${item.popis}</div>`
      ).join('')}
            </div>
            ` : ''}

            <div style="margin-bottom: 20px;">
              <div style="color: #000; font-size: 14px; font-weight: bold; margin-bottom: 10px;">Postup práce</div>
              ${navod.postupPrace.map(krok =>
        `<div style="margin-bottom: 8px; padding: 6px 0; border-bottom: 1px solid #ddd;">
                  <span style="font-weight: bold; color: #000; font-size: 11px;">${krok.cislo}.</span> 
                  <span style="font-size: 10px;">${krok.popis}</span>
                </div>`
      ).join('')}
            </div>
          </div>

          <!-- Right Column: Safety Warnings and Common Errors -->
          <div style="flex: 1;">
            ${navod.naCoSiDatPozor.length > 0 ? `
            <div style="margin-bottom: 20px;">
              <div style="color: #000; font-size: 14px; font-weight: bold; margin-bottom: 10px;">⚠️ Na čo si dať pozor</div>
              ${navod.naCoSiDatPozor.map(item =>
        `<div style="margin-bottom: 6px; padding-left: 12px; color: #000; font-size: 9px; border-left: 2px solid #000; padding-left: 8px;">• ${item.popis}</div>`
      ).join('')}
            </div>
            ` : ''}

            ${navod.casteChyby.length > 0 ? `
            <div style="margin-bottom: 20px;">
              <div style="color: #000; font-size: 14px; font-weight: bold; margin-bottom: 10px;">❌ Časté chyby</div>
              ${navod.casteChyby.map(item =>
        `<div style="margin-bottom: 6px; padding-left: 12px; color: #000; font-size: 9px; border-left: 2px solid #000; padding-left: 8px;">• ${item.popis}</div>`
      ).join('')}
            </div>
            ` : ''}
          </div>
        </div>

        <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; text-align: center;">
          ${attachmentQRCodes.length > 0 ? `
          <div style="margin-bottom: 20px;">
            <div style="color: #000; font-size: 10px; font-weight: bold; margin-bottom: 8px; text-align: left;">📎 Prílohy - Naskenujte QR kód</div>
            <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: flex-start;">
              ${attachmentQRCodes.map(att => `
                <div style="text-align: center; padding: 6px; border: 1px solid #dc2626; border-radius: 6px; background: #fff; min-width: 70px;">
                  <img src="${att.qrDataUrl}" alt="QR ${att.filename}" style="width: 60px; height: 60px; margin-bottom: 4px;">
                  <div style="font-size: 6px; color: #dc2626; font-weight: bold; word-wrap: break-word; max-width: 60px;">${att.filename}</div>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}
          <div style="color: #666; font-size: 8px;">CHICHO.tech - Interný portál pre výrobné návody</div>
        </div>
      `;

      document.body.appendChild(pdfContent);

      console.log('Converting HTML to canvas...');

      // Convert HTML to canvas with high quality
      const canvas = await html2canvas(pdfContent, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: Math.max(1123, pdfContent.scrollHeight + 80)
      });

      console.log('Creating PDF from canvas...');

      // Create PDF and add the canvas as image
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is too long
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Clean up the temporary element
      document.body.removeChild(pdfContent);

      console.log('Saving PDF file...');

      // Generate filename
      const filename = `${navod.slug}-navod.pdf`;

      // Force download
      pdf.save(filename);

      console.log('PDF download triggered successfully:', filename);

      // Record PDF export activity
      if (user) {
        recordUserActivity(user.id, 'export-pdf', `Export PDF: ${navod.nazov}`, navod.id);
      }

      // Remove loading alert
      if (loadingAlert) {
        document.body.removeChild(loadingAlert);
        loadingAlert = null;
      }

      // Show success message
      const successAlert = document.createElement('div');
      successAlert.innerHTML = `✅ PDF "${filename}" úspešne stiahnuté!`;
      successAlert.style.cssText = 'position:fixed;top:20px;right:20px;background:#16a34a;color:white;padding:12px 20px;border-radius:8px;z-index:1000;font-family:Inter,sans-serif;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.15);max-width:300px;';
      document.body.appendChild(successAlert);

      // Auto-hide success message
      setTimeout(() => {
        if (document.body.contains(successAlert)) {
          document.body.removeChild(successAlert);
        }
      }, 4000);

    } catch (error) {
      console.error('Error exporting PDF:', error);

      // Remove loading alert if still present
      if (loadingAlert && document.body.contains(loadingAlert)) {
        document.body.removeChild(loadingAlert);
      }

      // Show detailed error message
      const errorAlert = document.createElement('div');
      errorAlert.innerHTML = `❌ Chyba pri exporte PDF!<br><small style="opacity:0.8;">Skúste to znovu alebo kontaktujte správcu.</small>`;
      errorAlert.style.cssText = 'position:fixed;top:20px;right:20px;background:#dc2626;color:white;padding:12px 20px;border-radius:8px;z-index:1000;font-family:Inter,sans-serif;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.15);max-width:300px;line-height:1.4;';
      document.body.appendChild(errorAlert);

      // Auto-hide error message
      setTimeout(() => {
        if (document.body.contains(errorAlert)) {
          document.body.removeChild(errorAlert);
        }
      }, 6000);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!user) {
      showNotification('❌ Musíte byť prihlásený pre odoslanie pripomienky!', 'error');
      return;
    }

    if (!feedbackMessage.trim()) {
      showNotification('❌ Pripomienka nemôže byť prázdna!', 'error');
      return;
    }

    setIsSubmittingFeedback(true);
    console.log('Sending feedback:', {
      navodId: navod!.id,
      uzivatelId: user.id,
      sprava: feedbackMessage.trim(),
      cisloKroku: feedbackStep && feedbackStep !== 'general' ? parseInt(feedbackStep) : undefined
    });

    try {
      // Create new pripomienka object
      const newPripomienka: Pripomienka = {
        id: generateId('pripomienka'),
        navodId: navod!.id,
        uzivatelId: user.id,
        sprava: feedbackMessage.trim(),
        cisloKroku: feedbackStep && feedbackStep !== 'general' ? parseInt(feedbackStep) : undefined,
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

        // Reset form
        setFeedbackMessage('');
        setFeedbackStep('general');
        setIsFeedbackOpen(false);
      } else {
        showNotification('❌ Chyba pri ukladaní pripomienky!', 'error');
      }
    } catch (error) {
      console.error('Error saving feedback:', error);
      showNotification('❌ Neočakávaná chyba pri odosielaní pripomienky!', 'error');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <Button
              variant="ghost"
              onClick={() => router.push('/navody')}
              className="text-gray-600 hover:text-chicho-red h-8 px-2 self-start"
            >
              <ArrowLeft size={16} className="mr-1" />
              Späť na návody
            </Button>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              {/* Admin Edit Button - Only visible for admins */}
              {user?.uroven === 'admin' && (
                <Button
                  onClick={() => router.push(`/admin?editNavod=${navod.id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 text-sm w-full sm:w-auto"
                  title="Upraviť návod (Admin)"
                >
                  <Edit3 size={14} className="mr-1" />
                  Upraviť
                </Button>
              )}

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Button
                  onClick={exportToPDF}
                  className="bg-chicho-red hover:bg-red-700 text-white h-8 px-3 text-sm flex-1 sm:flex-none"
                >
                  <Download size={14} className="mr-1" />
                  <span className="hidden sm:inline">Stiahnuť </span>PDF
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-chicho-red text-chicho-red hover:bg-chicho-red hover:text-white h-8 px-3 text-sm flex-1 sm:flex-none">
                      <QrCode size={14} className="mr-1" />
                      QR<span className="hidden sm:inline"> kód</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-md">
                    <DialogHeader>
                      <DialogTitle className="font-russo text-chicho-red">QR kód pre návod</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center py-6">
                      <QRCodeGenerator
                        url={`${typeof window !== 'undefined' ? window.location.origin : ''}/navody/${navod.slug}`}
                        size={200}
                        navodId={navod.id}
                        navodNazov={navod.nazov}
                      />
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                      Naskenujte QR kód pre rýchly prístup k návodu na mobilnom zariadení
                    </p>
                  </DialogContent>
                </Dialog>

                {/* Príloha download button - shown if attachment exists */}
                {attachments && attachments.length > 0 && (
                  <div className="flex items-center space-x-1">
                    {attachments.map((attachment) => (
                      <Button
                        key={attachment._id}
                        onClick={() => {
                          if (attachment.url) {
                            // Create a temporary link and trigger download
                            const link = document.createElement('a');
                            link.href = attachment.url;
                            link.download = attachment.filename || 'priloha';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        }}
                        variant="outline"
                        className="border-chicho-red text-chicho-red hover:bg-chicho-red hover:text-white h-8 px-2 text-xs flex-1 sm:flex-none truncate max-w-[120px]"
                        title={`Stiahnuť: ${attachment.filename}`}
                      >
                        <FileText size={14} className="mr-1 flex-shrink-0" />
                        <span className="truncate">{attachment.filename.split('.')[0].substring(0, 12)}</span>
                      </Button>
                    ))}
                  </div>
                )}

                {/* Pripomienka na úpravu - Show only for workers */}
                {user && user.uroven !== 'admin' && (
                  <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100 h-8 px-3 text-sm flex-1 sm:flex-none">
                        <MessageSquare size={14} className="mr-1" />
                        <span className="hidden sm:inline">Pripomienka</span>
                        <span className="sm:hidden">💬</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-md">
                      <DialogHeader>
                        <DialogTitle className="font-russo text-chicho-red">
                          Pripomienka na úpravu návodu
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-inter text-sm text-gray-700">
                            <strong>Návod:</strong> {navod.nazov}
                          </p>
                          <p className="font-inter text-xs text-gray-600 mt-1">
                            <strong>Od:</strong> {user.meno}
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="feedback-step-header" className="font-inter font-semibold">
                            Týka sa konkrétneho kroku? (voliteľné)
                          </Label>
                          <Select value={feedbackStep} onValueChange={setFeedbackStep}>
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
                          <Label htmlFor="feedback-message-header" className="font-inter font-semibold">
                            Vaša pripomienka *
                          </Label>
                          <Textarea
                            id="feedback-message-header"
                            value={feedbackMessage}
                            onChange={(e) => setFeedbackMessage(e.target.value)}
                            placeholder="Napíšte svoju pripomienku alebo návrh na zlepšenie...&#10;&#10;Príklady:&#10;• Krok 3 nie je dostatočne jasný&#10;• Chýba informácia o bezpečnosti&#10;• Odporúčam pridať obrázok k tomuto kroku"
                            rows={5}
                            className="mt-1"
                            disabled={isSubmittingFeedback}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Pripomienka bude odoslaná administrátorom na preskúmanie
                          </p>
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setIsFeedbackOpen(false)}
                            disabled={isSubmittingFeedback}
                          >
                            Zrušiť
                          </Button>
                          <Button
                            onClick={handleFeedbackSubmit}
                            className="bg-chicho-red hover:bg-red-700 text-white"
                            disabled={!feedbackMessage.trim() || isSubmittingFeedback}
                          >
                            {isSubmittingFeedback ? (
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
                )}
              </div>
            </div>
          </div>

          <h1 className="font-orbitron text-xl sm:text-2xl font-bold text-chicho-dark mb-2" data-macaly="navod-title">
            {navod.nazov}
          </h1>

          <div className="flex items-center text-xs text-gray-600 mb-3">
            <Calendar size={14} className="mr-1" />
            Aktualizované: {formatDate(navod.aktualizovane)}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {navod.typPrace.map((typ) => (
              <Badge
                key={typ}
                variant="outline"
                className="cursor-pointer hover:scale-105 transition-transform font-inter text-chicho-dark border-chicho-red hover:bg-chicho-red hover:text-white text-xs px-2 py-1"
                onClick={() => handleTagClick(typ, 'typ-prace')}
              >
                {typ}
              </Badge>
            ))}
            {navod.produkt.map((produkt) => (
              <Badge
                key={produkt}
                variant="outline"
                className="cursor-pointer hover:scale-105 transition-transform font-inter text-chicho-dark border-chicho-red hover:bg-chicho-red hover:text-white text-xs px-2 py-1"
                onClick={() => handleTagClick(produkt, 'produkt')}
              >
                {produkt}
              </Badge>
            ))}
          </div>

          {/* Content */}
          <div className="max-w-6xl mx-auto px-0">

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-4 lg:space-y-6">
                {/* Potrebné náradie */}
                {navod.potrebneNaradie.length > 0 && (
                  <Card className="border border-gray-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-russo text-chicho-red flex items-center text-base">
                        <CheckCircle size={16} className="mr-2" />
                        Potrebné náradie
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {navod.potrebneNaradie.map((naradie) => (
                          <div key={naradie.id} className="flex items-start space-x-2 py-1">
                            <div className="w-1.5 h-1.5 bg-chicho-red rounded-full mt-1.5 flex-shrink-0"></div>
                            <span className="font-inter text-chicho-dark text-sm leading-tight">{naradie.popis}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Postup práce */}
                <Card className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-russo text-chicho-red flex items-center text-base">
                      <CheckCircle size={16} className="mr-2" />
                      Postup práce
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {navod.postupPrace.map((krok) => (
                        <div key={krok.id} className="flex items-start space-x-3 p-2 border border-gray-200 rounded-md bg-gray-50/50">
                          <div className="flex-shrink-0 w-6 h-6 bg-chicho-red text-white rounded-full flex items-center justify-center font-russo font-bold text-xs">
                            {krok.cislo}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-inter text-chicho-dark text-sm leading-tight">{krok.popis}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Na čo si dať pozor */}
                {navod.naCoSiDatPozor.length > 0 && (
                  <Card className="border border-amber-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-russo text-amber-600 flex items-center text-base">
                        <AlertTriangle size={16} className="mr-2" />
                        Na čo si dať pozor
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {navod.naCoSiDatPozor.map((pozor) => (
                          <Alert key={pozor.id} className="border-amber-200 bg-amber-50 py-2">
                            <AlertTriangle size={14} className="text-amber-600" />
                            <AlertDescription className="font-inter text-amber-800 text-sm leading-tight">
                              {pozor.popis}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-4 lg:space-y-6">
                {/* Časté chyby */}
                {navod.casteChyby.length > 0 && (
                  <Card className="border-red-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-russo text-red-600 text-base">Časté chyby</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {navod.casteChyby.map((chyba) => (
                          <div key={chyba.id} className="p-2 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-xs font-inter text-red-800 leading-tight">{chyba.popis}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Rýchle akcie */}
                <Card className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-russo text-chicho-red text-base">Rýchle akcie</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <Button
                      onClick={exportToPDF}
                      className="w-full bg-chicho-red hover:bg-red-700 text-white h-8 text-sm"
                    >
                      <Download size={14} className="mr-2" />
                      Exportovať PDF
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full h-8 text-sm">
                          <QrCode size={14} className="mr-2" />
                          Zobraziť QR kód
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[95vw] max-w-md">
                        <DialogHeader>
                          <DialogTitle className="font-russo text-chicho-red">QR kód pre návod</DialogTitle>
                        </DialogHeader>
                        <div className="flex items-center justify-center py-6">
                          <QRCodeGenerator
                            url={`${typeof window !== 'undefined' ? window.location.origin : ''}/navody/${navod.slug}`}
                            size={200}
                            navodId={navod.id}
                            navodNazov={navod.nazov}
                          />
                        </div>
                        <p className="text-sm text-gray-600 text-center">
                          Naskenujte QR kód pre rýchly prístup k návodu na mobilnom zariadení
                        </p>
                      </DialogContent>
                    </Dialog>

                    {/* Príloha download buttons */}
                    {attachments && attachments.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600 font-inter font-semibold">Prílohy ({attachments.length})</p>
                        {attachments.map((attachment) => (
                          <Button
                            key={attachment._id}
                            onClick={() => {
                              if (attachment.url) {
                                const link = document.createElement('a');
                                link.href = attachment.url;
                                link.download = attachment.filename || 'priloha';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }
                            }}
                            variant="outline"
                            className="w-full h-8 text-sm border-chicho-red text-chicho-red hover:bg-chicho-red hover:text-white justify-start"
                            title={attachment.filename}
                          >
                            <FileText size={14} className="mr-2 flex-shrink-0" />
                            <span className="truncate">{attachment.filename}</span>
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Pripomienka na úpravu - Show only for workers */}
                    {user && user.uroven !== 'admin' && (
                      <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full h-8 text-sm border-orange-300 text-orange-700 hover:bg-orange-100">
                            <MessageSquare size={14} className="mr-2" />
                            Pripomienka na úpravu
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[95vw] max-w-md">
                          <DialogHeader>
                            <DialogTitle className="font-russo text-chicho-red">
                              Pripomienka na úpravu návodu
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="font-inter text-sm text-gray-700">
                                <strong>Návod:</strong> {navod.nazov}
                              </p>
                              <p className="font-inter text-xs text-gray-600 mt-1">
                                <strong>Od:</strong> {user.meno}
                              </p>
                            </div>

                            <div>
                              <Label htmlFor="feedback-step" className="font-inter font-semibold">
                                Týka sa konkrétneho kroku? (voliteľné)
                              </Label>
                              <Select value={feedbackStep} onValueChange={setFeedbackStep}>
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
                              <Label htmlFor="feedback-message" className="font-inter font-semibold">
                                Vaša pripomienka *
                              </Label>
                              <Textarea
                                id="feedback-message"
                                value={feedbackMessage}
                                onChange={(e) => setFeedbackMessage(e.target.value)}
                                placeholder="Napíšte svoju pripomienku alebo návrh na zlepšenie...&#10;&#10;Príklady:&#10;• Krok 3 nie je dostatočne jasný&#10;• Chýba informácia o bezpečnosti&#10;• Odporúčam pridať obrázok k tomuto kroku"
                                rows={5}
                                className="mt-1"
                                disabled={isSubmittingFeedback}
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Pripomienka bude odoslaná administrátorom na preskúmanie
                              </p>
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-4">
                              <Button
                                variant="outline"
                                onClick={() => setIsFeedbackOpen(false)}
                                disabled={isSubmittingFeedback}
                              >
                                Zrušiť
                              </Button>
                              <Button
                                onClick={handleFeedbackSubmit}
                                className="bg-chicho-red hover:bg-red-700 text-white"
                                disabled={!feedbackMessage.trim() || isSubmittingFeedback}
                              >
                                {isSubmittingFeedback ? (
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
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Export buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button
                onClick={exportToPDF}
                className="flex-1 bg-chicho-red hover:bg-red-700 text-white"
              >
                <Download className="mr-2" size={18} />
                Export do PDF
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 border-chicho-red text-chicho-red hover:bg-chicho-red hover:text-white"
                  >
                    <QrCode className="mr-2" size={18} />
                    Zobraziť QR kód
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-russo text-chicho-red">QR kód pre návod</DialogTitle>
                  </DialogHeader>
                  <div className="flex items-center justify-center py-6">
                    <QRCodeGenerator
                      url={`${typeof window !== 'undefined' ? window.location.origin : ''}/navody/${navod.slug}`}
                      size={256}
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    Naskenujte QR kód pre rýchly prístup k návodu na mobilnom zariadení
                  </p>
                </DialogContent>
              </Dialog>
            </div>

            {/* Fotky k návodu */}
            {navod.obrazky && navod.obrazky.length > 0 && (
              <div className="mt-6 lg:mt-8">
                <h2 className="font-russo text-lg text-chicho-red mb-3 lg:mb-4 flex items-center">
                  Fotky k návodu
                </h2>
                <ImageGallery
                  images={navod.obrazky}
                  navodNazov={navod.nazov}
                />
              </div>
            )}

            {/* Video Section */}
            {navod.videoUrl && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-russo text-chicho-red">
                    <Play size={20} />
                    Video návod
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href={navod.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline font-inter"
                  >
                    <ExternalLink size={16} />
                    Otvoriť video
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Attachment Section */}
            {attachments && attachments.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-russo text-chicho-red">
                    <FileText size={20} />
                    Prílohy ({attachments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {attachments.map((attachment) => (
                      <div key={attachment._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="text-chicho-red flex-shrink-0" size={32} />
                          <div>
                            <p className="font-inter font-semibold text-sm">{attachment.filename}</p>
                            <p className="text-xs text-gray-500">
                              {(attachment.size / 1024).toFixed(0)} KB • {attachment.contentType}
                            </p>
                          </div>
                        </div>
                        <a
                          href={attachment.url ?? undefined}
                          download={attachment.filename}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button className="bg-chicho-red hover:bg-red-700 text-white">
                            <Download size={16} className="mr-2" />
                            Stiahnuť
                          </Button>
                        </a>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Feedback Form Component */}
            <div className="lg:hidden">
              <FeedbackForm navod={navod} />
            </div>
          </div>
        </main>
      </div>
    </ProtectedPage>
  );
}





























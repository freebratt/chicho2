'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, Eye, Download, QrCode, FileText } from 'lucide-react';
import { VyrobnyNavod } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import { tagy } from '@/lib/data';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface NavodCardProps {
  navod: VyrobnyNavod;
}

export default function NavodCard({ navod }: NavodCardProps) {
  console.log('Rendering NavodCard for:', navod.nazov);
  const router = useRouter();
  
  // Fetch attachments to check if they exist (multiple attachments support)
  const attachments = useQuery(
    api.attachments.getAttachmentsByNavodId,
    { navodId: navod.id }
  );
  
  const getTagColor = (tagNazov: string) => {
    const tag = tagy.find(t => t.nazov === tagNazov);
    return tag ? tag.farba : '#3B82F6';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('sk-SK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
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
      
      // Create a hidden div with the content to be converted to PDF
      const pdfContent = document.createElement('div');
      pdfContent.style.cssText = `
        position: fixed;
        top: -9999px;
        left: 0;
        width: 794px;
        background: white;
        padding: 15px;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        color: #000;
        line-height: 1.2;
      `;

      // Check if we have safety warnings or common errors
      const hasExtendedContent = navod.naCoSiDatPozor.length > 0 || navod.casteChyby.length > 0;

      // Add content with QR code in header and two-column layout
      pdfContent.innerHTML = `
        <!-- Header with Logo and QR Code -->
        <div style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
            <div style="display: flex; align-items: center;">
              ${logoHtml}
              <div style="margin-left: 15px;">
                <div style="color: #666; font-size: 10px; margin-bottom: 12px;">Interný výrobný a školiaci portál</div>
                <div style="color: #000; font-size: 16px; font-weight: bold; margin-bottom: 8px;">${navod.nazov}</div>
                <div style="font-size: 9px; color: #666; line-height: 1.3;">
                  <div><strong>Typ práce:</strong> ${navod.typPrace.join(', ')}</div>
                  <div><strong>Produkt:</strong> ${navod.produkt.join(', ')}</div>
                  <div><strong>Aktualizované:</strong> ${formatDate(navod.aktualizovane)}</div>
                  <div><strong>Počet krokov:</strong> ${navod.postupPrace.length}</div>
                </div>
              </div>
            </div>
            <div style="text-align: center; margin-left: 15px;">
              <div id="qr-code-container" style="width: 70px; height: 70px; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; background: #f9f9f9;">
                <div style="font-size: 8px; color: #666;">QR kód</div>
              </div>
              <div style="font-size: 8px; color: #666; margin-top: 3px; text-align: center;">Rýchly prístup</div>
            </div>
          </div>
        </div>

        <!-- Main Content with Two Columns -->
        <div style="display: flex; gap: 15px;">
          <!-- Left Column: Steps and Tools -->
          <div style="flex: 2;">
            <div style="color: #000; font-size: 14px; font-weight: bold; margin-bottom: 10px;">Postup práce</div>
            ${navod.postupPrace.map(krok => 
              `<div style="margin-bottom: 6px; padding: 5px 8px; border-left: 3px solid #000; background: #f8f8f8; font-size: 10px;">
                <span style="font-weight: bold; color: #000;">${krok.cislo}.</span> ${krok.popis}
              </div>`
            ).join('')}

            ${navod.potrebneNaradie.length > 0 ? `
            <div style="margin-top: 15px;">
              <div style="color: #000; font-size: 12px; font-weight: bold; margin-bottom: 8px;">Potrebné náradie</div>
              ${navod.potrebneNaradie.map(item => 
                `<div style="margin-bottom: 3px; font-size: 9px; padding-left: 8px;">• ${item.popis}</div>`
              ).join('')}
            </div>
            ` : ''}
          </div>

          <!-- Right Column: Safety Warnings and Common Errors -->
          <div style="flex: 1;">
            ${navod.naCoSiDatPozor.length > 0 ? `
            <div style="margin-bottom: 15px;">
              <div style="color: #000; font-size: 12px; font-weight: bold; margin-bottom: 8px;">⚠️ Na čo si dať pozor</div>
              ${navod.naCoSiDatPozor.map(item => 
                `<div style="margin-bottom: 6px; font-size: 9px; color: #000; padding: 6px 8px; background: #f0f0f0; border-radius: 4px; border-left: 3px solid #000;">
                  • ${item.popis}
                </div>`
              ).join('')}
            </div>
            ` : ''}

            ${navod.casteChyby.length > 0 ? `
            <div style="margin-bottom: 15px;">
              <div style="color: #000; font-size: 12px; font-weight: bold; margin-bottom: 8px;">❌ Časté chyby</div>
              ${navod.casteChyby.map(item => 
                `<div style="margin-bottom: 6px; font-size: 9px; color: #000; padding: 6px 8px; background: #f0f0f0; border-radius: 4px; border-left: 3px solid #000;">
                  • ${item.popis}
                </div>`
              ).join('')}
            </div>
            ` : ''}
          </div>
        </div>

        <div style="margin-top: 25px; padding-top: 12px; border-top: 1px solid #e5e7eb; text-align: center;">
          <div style="color: #999; font-size: 8px;">CHICHO.tech - Interný portál pre výrobné návody a školenia</div>
        </div>
      `;

      document.body.appendChild(pdfContent);

      // Generate QR code and insert it
      const QRCode = (await import('qrcode')).default;
      const qrCodeUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/navody/${navod.slug}`;
      
      // Generate QR code data URL for the current guide
      const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
        width: 70,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Replace QR code placeholder with actual QR code
      const qrContainer = pdfContent.querySelector('#qr-code-container');
      if (qrContainer) {
        qrContainer.innerHTML = `<img src="${qrCodeDataUrl}" style="width: 70px; height: 70px;" alt="QR kód">`;
      }

      console.log('Converting HTML to canvas...');
      
      // Convert HTML to canvas with optimized settings
      const canvas = await html2canvas(pdfContent, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: Math.min(1123 * (hasExtendedContent ? 2 : 1), pdfContent.scrollHeight + 40)
      });

      console.log('Creating PDF from canvas...');
      
      // Create PDF with optimized page handling
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      if (imgHeight <= pageHeight) {
        // Single page
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      } else {
        // Multiple pages - split intelligently
        const pageCount = Math.ceil(imgHeight / pageHeight);
        for (let i = 0; i < pageCount; i++) {
          if (i > 0) pdf.addPage();
          const yOffset = -(pageHeight * i);
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, yOffset, imgWidth, imgHeight);
        }
      }

      // Clean up the temporary element
      document.body.removeChild(pdfContent);

      console.log('Saving PDF file...');
      
      // Generate filename
      const filename = `${navod.slug}-navod.pdf`;
      
      // Force download
      pdf.save(filename);
      
      console.log('PDF download triggered successfully:', filename);
      
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

  const handleTagClick = (tagNazov: string, tagTyp: 'typ-prace' | 'produkt') => {
    console.log('Tag clicked:', tagNazov, tagTyp);
    if (tagTyp === 'typ-prace') {
      router.push(`/navody?typ=${encodeURIComponent(tagNazov)}`);
    } else {
      router.push(`/navody?produkt=${encodeURIComponent(tagNazov)}`);
    }
  };

  const searchText = `${navod.nazov} ${navod.typPrace.join(' ')} ${navod.produkt.join(' ')} ${navod.postupPrace.map(k => k.popis).join(' ')}`.toLowerCase();

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200" 
      data-macaly={`navod-card-${navod.id}`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="mb-3">
          <h3 className="font-russo text-base text-chicho-dark mb-2 leading-tight" data-macaly={`navod-title-${navod.id}`}>
            {navod.nazov}
          </h3>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {navod.typPrace.map((typ) => (
              <Badge 
                key={typ}
                variant="outline"
                className="cursor-pointer hover:scale-105 transition-transform font-inter text-xs px-2 py-0.5"
                style={{ borderColor: getTagColor(typ), color: getTagColor(typ) }}
                onClick={() => handleTagClick(typ, 'typ-prace')}
              >
                {typ}
              </Badge>
            ))}
            {navod.produkt.map((produkt) => (
              <Badge 
                key={produkt}
                variant="outline"
                className="cursor-pointer hover:scale-105 transition-transform font-inter text-xs px-2 py-0.5"
                style={{ borderColor: getTagColor(produkt), color: getTagColor(produkt) }}
                onClick={() => handleTagClick(produkt, 'produkt')}
              >
                {produkt}
              </Badge>
            ))}
          </div>
        </div>

        {/* Preview krokov */}
        <div className="mb-3">
          <p className="text-gray-600 text-xs font-inter line-clamp-2 leading-relaxed">
            {navod.postupPrace.length > 0 ? navod.postupPrace[0].popis : 'Bez popisu'}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center space-x-1">
            <Clock size={12} />
            <span>{formatDate(navod.aktualizovane)}</span>
          </div>
          <div className="text-xs text-chicho-red font-medium">
            {navod.postupPrace.length} krokov
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link 
            href={`/navody/${navod.slug}`}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-chicho-red text-white rounded-md hover:bg-red-700 transition-colors font-inter font-medium text-sm"
          >
            <Eye size={14} />
            <span>Zobraziť</span>
          </Link>
          
          <div className="flex items-center space-x-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="p-1.5 h-7 w-7"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                exportToPDF();
              }}
              title="Exportovať PDF"
            >
              <Download size={12} />
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="p-1.5 h-7 w-7"
                  onClick={(e) => {
                    console.log('QR button clicked for:', navod.nazov);
                    e.stopPropagation(); // Prevent card navigation
                    // Don't preventDefault to allow dialog to open
                  }}
                  title="Zobraziť QR kód"
                >
                  <QrCode size={12} />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-russo text-chicho-red">QR kód pre návod</DialogTitle>
                </DialogHeader>
                <div className="flex items-center justify-center py-6">
                  <QRCodeGenerator 
                    url={`${typeof window !== 'undefined' ? window.location.origin : ''}/navody/${navod.slug}`}
                    size={200}
                  />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Naskenujte QR kód pre rýchly prístup k návodu na mobilnom zariadení
                </p>
              </DialogContent>
            </Dialog>
            {attachments && attachments.length > 0 && (
              <div className="flex items-center space-x-1">
                {attachments.map((attachment) => (
                  <Button 
                    key={attachment._id}
                    variant="outline" 
                    size="sm" 
                    className="p-1.5 h-7 w-7 text-chicho-red border-chicho-red hover:bg-chicho-red hover:text-white"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (attachment?.url) {
                        // Create a temporary link and trigger download
                        const link = document.createElement('a');
                        link.href = attachment.url;
                        link.download = attachment.filename || 'priloha';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    }}
                    title={`Stiahnuť: ${attachment.filename}`}
                  >
                    <FileText size={12} />
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}















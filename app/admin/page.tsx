'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import {
  Plus, BookOpen, Users, Settings, AlertTriangle, Edit3, Trash2, Eye,
  Upload, X, Hash, Filter, MessageSquare, CheckCircle, ChevronDown, Activity, Clock, User, Image, FileText, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import ProtectedPage from '@/components/ProtectedPage';
import AuthDebug from '@/components/AuthDebug';
import LogoUpload from '@/components/LogoUpload';
import { useFeedbackNotifications } from '@/hooks/use-feedback-notifications';
import Link from 'next/link';
import {
  generateId,
  generateSlug,
  showNotification
} from '@/lib/storage';
import { VyrobnyNavod, Tag, NavodObrazok, FilterState, Uzivatel, Pripomienka } from '@/lib/types';
import { hashPassword } from '@/lib/auth';
import OptimizedImage from '@/components/OptimizedImage';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

// Simple hash function for client-side password hashing (NOT for production use)  
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
}

export default function AdminPage() {
  // Convex queries
  const navodiesData = useQuery(api.navody.getAllNavody);
  const tagsData = useQuery(api.tags.getAllTags);
  const usersData = useQuery(api.users.getAllUsers);
  const feedbackData = useQuery(api.feedback.getAllFeedback);
  const visitStatsData = useQuery(api.navody.getAllVisitsWithStats);

  // Convex mutations for attachments
  const generateUploadUrl = useMutation(api.attachments.generateUploadUrl);
  const saveAttachment = useMutation(api.attachments.saveAttachment);
  const deleteAttachmentByNavodId = useMutation(api.attachments.deleteAttachmentByNavodId);
  const deleteAllAttachmentsByNavodId = useMutation(api.attachments.deleteAllAttachmentsByNavodId);

  // Convex mutations for CRUD operations
  const createNavodMutation = useMutation(api.navody.createNavod);
  const updateNavodMutation = useMutation(api.navody.updateNavod);
  const deleteNavodMutation = useMutation(api.navody.deleteNavod);
  const createTagMutation = useMutation(api.tags.createTag);
  const deleteTagMutation = useMutation(api.tags.deleteTag);
  const createUserMutation = useMutation(api.users.createUser);
  const updateUserMutation = useMutation(api.users.updateUser);
  const deleteUserMutation = useMutation(api.users.deleteUser);
  const resolveFeedbackMutation = useMutation(api.feedback.resolveFeedback);
  const deleteFeedbackMutation = useMutation(api.feedback.deleteFeedback);

  const [filters, setFilters] = useState<FilterState>({
    typPrace: [],
    produkt: [],
    search: ''
  });

  // Convert Convex data to local state
  const [currentNavody, setCurrentNavody] = useState<VyrobnyNavod[]>([]);
  const [currentTagy, setCurrentTagy] = useState<Tag[]>([]);
  const [currentUzivatelia, setCurrentUzivatelia] = useState<Uzivatel[]>([]);
  const [currentPripomienky, setCurrentPripomienky] = useState<Pripomienka[]>([]);
  const [visitStats, setVisitStats] = useState<any[]>([]);
  const [showAllNavody, setShowAllNavody] = useState(false);
  const [showAllTypPraceTags, setShowAllTypPraceTags] = useState(false);
  const [showAllProduktTags, setShowAllProduktTags] = useState(false);
  const [showAllVisitStats, setShowAllVisitStats] = useState(false);

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Update local state when Convex data changes
  useEffect(() => {
    if (navodiesData) {
      setCurrentNavody(navodiesData as any);
    }
  }, [navodiesData]);

  useEffect(() => {
    if (tagsData) {
      setCurrentTagy(tagsData.map(tag => ({
        id: tag.id as any,
        nazov: tag.name,
        typ: tag.typ as 'typ-prace' | 'produkt',
        farba: tag.color || '#3B82F6'
      })));
    }
  }, [tagsData]);

  useEffect(() => {
    if (usersData) {
      setCurrentUzivatelia(usersData.map(user => ({
        id: user.id as any,
        meno: user.name,
        email: user.email,
        hesloHash: '',
        uroven: user.role,
        vytvoreny: user.createdAt,
        historiaAktivit: [],
        celkoveNavstevy: user.totalVisits
      })));
    }
  }, [usersData]);

  useEffect(() => {
    if (feedbackData) {
      setCurrentPripomienky(feedbackData.map(fb => ({
        id: fb.id as any,
        navodId: fb.navodId as any,
        uzivatelId: fb.userId as any,
        uzivatelMeno: fb.userName,
        uzivatelEmail: fb.userEmail,
        sprava: fb.sprava,
        cisloKroku: fb.cisloKroku,
        stav: fb.stav,
        vytvorena: fb.createdAt,
        vybavena: fb.resolvedAt
      })));
    }
  }, [feedbackData]);

  // Update visit stats when Convex data changes
  useEffect(() => {
    if (visitStatsData) {
      setVisitStats(visitStatsData);
    }
  }, [visitStatsData]);

  // Check for URL parameters to auto-open edit dialog
  useEffect(() => {
    if (typeof window !== 'undefined' && currentNavody.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const editNavodId = urlParams.get('editNavod');

      if (editNavodId) {
        const navodToEdit = currentNavody.find(n => n.id === editNavodId);
        if (navodToEdit) {
          console.log('Auto-opening edit dialog for navod:', navodToEdit.nazov);
          handleEditNavod(navodToEdit);
          // Clean up URL without refreshing page
          window.history.replaceState({}, document.title, '/admin');
        }
      }
    }
  }, [currentNavody]);

  const [showNewNavodDialog, setShowNewNavodDialog] = useState(false);
  const [showEditNavodDialog, setShowEditNavodDialog] = useState(false);
  const [showNewTagDialog, setShowNewTagDialog] = useState(false);
  const [editingNavod, setEditingNavod] = useState<VyrobnyNavod | null>(null);

  // Query to fetch attachments for the currently editing navod
  const editingNavodAttachments = useQuery(
    api.attachments.getAttachmentsByNavodId,
    editingNavod?.id ? { navodId: editingNavod.id } : "skip"
  );

  // Load attachments from Convex when editing a navod
  useEffect(() => {
    if (editingNavod && editingNavodAttachments) {
      console.log('📎 Loading attachments from Convex for editing navod:', editingNavod.id, editingNavodAttachments);
      const attachmentsForState = editingNavodAttachments.map(att => ({
        id: att.storageId,
        filename: att.filename
      }));
      setCurrentAttachments(attachmentsForState);
      console.log('✅ Loaded attachments:', attachmentsForState.length);
    }
  }, [editingNavod, editingNavodAttachments]);

  const [newNavodData, setNewNavodData] = useState({
    nazov: '',
    typPrace: [] as string[],
    produkt: [] as string[],
    potrebneNaradie: [] as Array<{ id: string; popis: string }>,
    postupPrace: [] as Array<{ id: string; cislo: number; popis: string }>,
    naCoSiDatPozor: [] as Array<{ id: string; popis: string }>,
    casteChyby: [] as Array<{ id: string; popis: string }>,
    videoUrl: ''
  });
  const [uploadedImages, setUploadedImages] = useState<NavodObrazok[]>([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [currentAttachments, setCurrentAttachments] = useState<Array<{
    id: string;
    filename: string;
  }>>([]);
  const [newTagData, setNewTagData] = useState({
    nazov: '',
    typ: 'typ-prace' as 'typ-prace' | 'produkt',
    farba: '#3B82F6'
  });

  // State for tag deletion
  const [showDeleteTagDialog, setShowDeleteTagDialog] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<any>(null);

  const [feedbackFilter, setFeedbackFilter] = useState<'vsetky' | 'nevybavene' | 'vybavene'>('nevybavene');
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<Uzivatel | null>(null);
  const [showUserActivityDialog, setShowUserActivityDialog] = useState(false);
  const [selectedUserForActivity, setSelectedUserForActivity] = useState<Uzivatel | null>(null);
  const [showLogoUploadDialog, setShowLogoUploadDialog] = useState(false);
  const [newUserData, setNewUserData] = useState({
    meno: '',
    email: '',
    heslo: '',
    uroven: 'pracovnik' as 'admin' | 'pracovnik'
  });

  // Collapsible sections state
  const [collapsedSections, setCollapsedSections] = useState<{
    kroky: boolean;
    naradie: boolean;
    pozor: boolean;
    chyby: boolean;
  }>({
    kroky: false,
    naradie: false,
    pozor: false,
    chyby: false
  });

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const [stats, setStats] = useState({
    navody: 0,
    skolenia: 5,
    pozicie: 8,
    chyby: 12,
    uzivatelia: 0,
    pripomienky: 0
  });

  // Update stats when data changes
  useEffect(() => {
    setStats({
      navody: currentNavody?.length || 0,
      skolenia: 5,
      pozicie: 8,
      chyby: 12,
      uzivatelia: currentUzivatelia?.length || 0,
      pripomienky: (currentPripomienky?.filter(p => p.stav === 'nevybavena') || []).length
    });
  }, [currentNavody, currentUzivatelia, currentPripomienky]);

  const filteredPripomienky = (currentPripomienky || []).filter(p => {
    if (feedbackFilter === 'nevybavene') return p.stav === 'nevybavena';
    if (feedbackFilter === 'vybavene') return p.stav === 'vybavena';
    return true; // vsetky
  });

  const handleFilterChange = (newFilters: FilterState) => {
    console.log('Filter changed on admin page:', newFilters);
    setFilters(newFilters);
  };

  const handleCreateNavod = async () => {
    console.log('Creating nový návod:', newNavodData, 'Images:', uploadedImages);

    if (!newNavodData.nazov.trim()) {
      showNotification('❌ Názov návodu je povinný!', 'error');
      return;
    }

    if (newNavodData.postupPrace.length === 0) {
      showNotification('❌ Pridajte aspoň jeden krok postupu!', 'error');
      return;
    }

    try {
      const slug = generateSlug(newNavodData.nazov);

      // Create navod in Convex
      const navodId = await createNavodMutation({
        nazov: newNavodData.nazov,
        slug: slug,
        typPrace: newNavodData.typPrace,
        produkt: newNavodData.produkt,
        potrebneNaradie: newNavodData.potrebneNaradie.map(n => ({ popis: n.popis })),
        postupPrace: newNavodData.postupPrace.map(k => ({ cislo: k.cislo, popis: k.popis })),
        naCoSiDatPozor: newNavodData.naCoSiDatPozor.map(p => ({ popis: p.popis })),
        casteChyby: newNavodData.casteChyby.map(ch => ({ popis: ch.popis })),
        obrazky: uploadedImages.map(o => ({ url: o.url, cisloKroku: o.cisloKroku, popis: o.popis })),
        videoUrl: newNavodData.videoUrl || undefined,
      });

      // Save attachment metadata to Convex for each attachment
      if (currentAttachments.length > 0) {
        for (const attachment of currentAttachments) {
          await saveAttachment({
            storageId: attachment.id as Id<'_storage'>,
            filename: attachment.filename,
            contentType: 'application/octet-stream',
            size: 0,
            navodId: slug
          });
        }
      }

      // Reset form
      setNewNavodData({
        nazov: '',
        typPrace: [] as string[],
        produkt: [] as string[],
        potrebneNaradie: [] as Array<{ id: string; popis: string }>,
        postupPrace: [] as Array<{ id: string; cislo: number; popis: string }>,
        naCoSiDatPozor: [] as Array<{ id: string; popis: string }>,
        casteChyby: [] as Array<{ id: string; popis: string }>,
        videoUrl: ''
      });
      setUploadedImages([]);
      setCurrentAttachments([]);
      setShowNewNavodDialog(false);

      showNotification(`✅ Návod "${newNavodData.nazov}" bol úspešne vytvorený!`, 'success');
      console.log('New návod created successfully:', navodId);
    } catch (error) {
      console.error('Error creating navod:', error);
      showNotification('❌ Neočakávaná chyba pri vytváraní návodu!', 'error');
    }
  };

  const handleEditNavod = async (navod: VyrobnyNavod) => {
    console.log('Editing návod:', navod.id);
    setEditingNavod(navod);
    setNewNavodData({
      nazov: navod.nazov,
      typPrace: navod.typPrace,
      produkt: navod.produkt,
      potrebneNaradie: navod.potrebneNaradie,
      postupPrace: navod.postupPrace,
      naCoSiDatPozor: navod.naCoSiDatPozor,
      casteChyby: navod.casteChyby,
      videoUrl: navod.videoUrl || ''
    });
    // Load existing images if they exist
    setUploadedImages(navod.obrazky || []);

    // Load existing attachments from Convex database
    console.log('🔍 Loading attachments from Convex for navod:', navod.id);
    try {
      // We need to use the Convex client to fetch attachments
      // Since we can't use useQuery in a callback, we'll set to empty and let useEffect handle it
      setCurrentAttachments([]);
    } catch (error) {
      console.error('❌ Error loading attachments:', error);
      setCurrentAttachments([]);
    }

    setShowEditNavodDialog(true);
  };

  const handleSaveEditNavod = async () => {
    console.log('Saving edited návod:', editingNavod?.id, newNavodData);

    if (!editingNavod) return;

    if (!newNavodData.nazov.trim()) {
      showNotification('❌ Názov návodu je povinný!', 'error');
      return;
    }

    if (newNavodData.postupPrace.length === 0) {
      showNotification('❌ Pridajte aspoň jeden krok postupu!', 'error');
      return;
    }

    try {
      const slug = generateSlug(newNavodData.nazov);

      // Update navod in Convex
      await updateNavodMutation({
        navodId: editingNavod.id as Id<'navody'>,
        nazov: newNavodData.nazov,
        slug: slug,
        typPrace: newNavodData.typPrace,
        produkt: newNavodData.produkt,
        potrebneNaradie: newNavodData.potrebneNaradie.map(n => ({ popis: n.popis })),
        postupPrace: newNavodData.postupPrace.map(k => ({ cislo: k.cislo, popis: k.popis })),
        naCoSiDatPozor: newNavodData.naCoSiDatPozor.map(p => ({ popis: p.popis })),
        casteChyby: newNavodData.casteChyby.map(ch => ({ popis: ch.popis })),
        obrazky: uploadedImages.map(o => ({ url: o.url, cisloKroku: o.cisloKroku, popis: o.popis })),
        videoUrl: newNavodData.videoUrl || undefined,
      });

      // Delete all old attachments from Convex
      console.log('🗑️ Deleting all old attachments for navod:', editingNavod.id);
      try {
        const deleteResult = await deleteAllAttachmentsByNavodId({ navodId: editingNavod.id });
        console.log('✅ Deleted old attachments:', deleteResult);
      } catch (error) {
        console.error('❌ Error deleting old attachments:', error);
      }

      // Save all current attachments
      if (currentAttachments.length > 0) {
        console.log('💾 Saving', currentAttachments.length, 'new attachments');
        for (const attachment of currentAttachments) {
          try {
            await saveAttachment({
              storageId: attachment.id as Id<'_storage'>,
              filename: attachment.filename,
              contentType: 'application/octet-stream',
              size: 0,
              navodId: editingNavod.id
            });
            console.log('✅ Attachment saved:', attachment.filename);
          } catch (error) {
            console.error('❌ Error saving attachment:', attachment.filename, error);
          }
        }
      }

      // Reset form
      setShowEditNavodDialog(false);
      setEditingNavod(null);
      setCurrentAttachments([]);
      setNewNavodData({
        nazov: '',
        typPrace: [] as string[],
        produkt: [] as string[],
        potrebneNaradie: [] as Array<{ id: string; popis: string }>,
        postupPrace: [] as Array<{ id: string; cislo: number; popis: string }>,
        naCoSiDatPozor: [] as Array<{ id: string; popis: string }>,
        casteChyby: [] as Array<{ id: string; popis: string }>,
        videoUrl: ''
      });
      setUploadedImages([]);

      const imageCount = uploadedImages.length;
      let message = `✅ Návod "${newNavodData.nazov}" bol úspešne upravený!`;
      if (imageCount > 0) {
        message += ` (Uložených ${imageCount} obrázkov)`;
      }

      showNotification(message, 'success');
      console.log('Návod updated successfully');
    } catch (error) {
      console.error('Error updating navod:', error);
      showNotification('❌ Neočakávaná chyba pri ukladaní zmien!', 'error');
    }
  };

  const handleDeleteNavod = async (navod: VyrobnyNavod) => {
    console.log('🗑️ Delete navod button clicked for:', navod.nazov, navod.id);

    if (!confirm(`Naozaj chcete odstrániť návod "${navod.nazov}"?\n\nTáto akcia je nevratná!`)) {
      console.log('❌ User cancelled deletion');
      return;
    }

    console.log('✅ User confirmed deletion, proceeding...');

    try {
      await deleteNavodMutation({ navodId: navod.id as Id<'navody'> });
      console.log('✅ Návod deleted successfully:', navod.id);
      showNotification(`✅ Návod "${navod.nazov}" bol úspešne odstránený!`, 'success');
    } catch (error) {
      console.error('❌ Error deleting navod:', error);
      showNotification('❌ Neočakávaná chyba pri odstraňovaní návodu!', 'error');
    }
  };

  const handleCreateTag = async () => {
    console.log('Creating new tag:', newTagData);

    if (!newTagData.nazov.trim()) {
      showNotification('❌ Názov tagu je povinný!', 'error');
      return;
    }

    // Check if tag already exists
    if ((currentTagy || []).some((tag: any) => tag.nazov.toLowerCase() === newTagData.nazov.toLowerCase())) {
      showNotification('❌ Tag s týmto názvom už existuje!', 'error');
      return;
    }

    try {
      await createTagMutation({
        nazov: newTagData.nazov,
        typ: newTagData.typ,
        farba: newTagData.farba
      });

      // Reset form
      setNewTagData({ nazov: '', typ: 'typ-prace', farba: '#3B82F6' });
      setShowNewTagDialog(false);

      showNotification(`✅ Tag "${newTagData.nazov}" bol úspešne vytvorený!`, 'success');
      console.log('New tag created successfully');
    } catch (error) {
      console.error('Error creating tag:', error);
      showNotification('❌ Neočakávaná chyba pri vytváraní tagu!', 'error');
    }
  };

  const handleCreateUser = async () => {
    console.log('Creating user:', newUserData);

    if (!newUserData.meno.trim() || !newUserData.email.trim() || !newUserData.heslo.trim()) {
      showNotification('❌ Všetky polia sú povinné!', 'error');
      return;
    }

    // Check if user already exists
    if ((currentUzivatelia || []).some(u => u.email.toLowerCase() === newUserData.email.toLowerCase())) {
      showNotification('❌ Používateľ s týmto emailom už existuje!', 'error');
      return;
    }

    try {
      await createUserMutation({
        meno: newUserData.meno,
        email: newUserData.email,
        hesloHash: hashPassword(newUserData.heslo),
        uroven: newUserData.uroven,
      });

      // Reset form
      setNewUserData({
        meno: '',
        email: '',
        heslo: '',
        uroven: 'pracovnik'
      });
      setShowNewUserDialog(false);

      showNotification(`✅ Používateľ "${newUserData.meno}" bol úspešne vytvorený!`, 'success');
      console.log('New user created successfully');
    } catch (error) {
      console.error('Error creating user:', error);
      showNotification('❌ Neočakávaná chyba pri vytváraní používateľa!', 'error');
    }
  };

  const handleEditUser = (uzivatel: Uzivatel) => {
    console.log('Editing user:', uzivatel.id);
    setEditingUser(uzivatel);
    setNewUserData({
      meno: uzivatel.meno,
      email: uzivatel.email,
      heslo: '', // Empty password field for security
      uroven: uzivatel.uroven
    });
    setShowEditUserDialog(true);
  };

  const handleSaveEditUser = async () => {
    console.log('Saving edited user:', editingUser?.id, newUserData);

    if (!editingUser) return;

    if (!newUserData.meno.trim() || !newUserData.email.trim()) {
      showNotification('❌ Meno a email sú povinné!', 'error');
      return;
    }

    // Check if email is already used by another user
    if ((currentUzivatelia || []).some(u => u.id !== editingUser.id && u.email.toLowerCase() === newUserData.email.toLowerCase())) {
      showNotification('❌ Email už používa iný používateľ!', 'error');
      return;
    }

    try {
      await updateUserMutation({
        userId: editingUser.id as Id<'users'>,
        meno: newUserData.meno,
        email: newUserData.email,
        uroven: newUserData.uroven,
        hesloHash: newUserData.heslo.trim() ? hashPassword(newUserData.heslo) : undefined,
      });

      // Reset form
      setShowEditUserDialog(false);
      setEditingUser(null);
      setNewUserData({
        meno: '',
        email: '',
        heslo: '',
        uroven: 'pracovnik'
      });

      showNotification(`✅ Používateľ "${newUserData.meno}" bol úspešne upravený!`, 'success');
      console.log('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification('❌ Neočakávaná chyba pri ukladaní zmien!', 'error');
    }
  };

  const handleDeleteUser = async (uzivatel: Uzivatel) => {
    if (uzivatel.uroven === 'admin') {
      showNotification('❌ Nemôžete odstrániť administrátora!', 'error');
      return;
    }

    if (!confirm(`Naozaj chcete odstrániť používateľa "${uzivatel.meno}"?\n\nTáto akcia je nevratná!`)) {
      return;
    }

    console.log('Deleting user:', uzivatel.id);

    try {
      await deleteUserMutation({ userId: uzivatel.id as Id<'users'> });
      showNotification(`✅ Používateľ "${uzivatel.meno}" bol úspešne odstránený!`, 'success');
      console.log('User deleted successfully:', uzivatel.id);
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('❌ Neočakávaná chyba pri odstraňovaní používateľa!', 'error');
    }
  };

  const handleViewUserActivity = (uzivatel: Uzivatel) => {
    console.log('Viewing activity for user:', uzivatel.id);
    setSelectedUserForActivity(uzivatel);
    setShowUserActivityDialog(true);
  };

  const handleMarkFeedbackDone = async (pripomienkaId: string) => {
    console.log('Marking feedback as done:', pripomienkaId);

    try {
      await resolveFeedbackMutation({ feedbackId: pripomienkaId as Id<'pripomienky'> });
      showNotification('✅ Pripomienka označená ako vybavená!', 'success');
      console.log('Feedback marked as done:', pripomienkaId);
    } catch (error) {
      console.error('Error marking feedback as done:', error);
      showNotification('❌ Neočakávaná chyba pri označovaní pripomienky!', 'error');
    }
  };

  const handleTogglePripomienka = async (pripomienka: Pripomienka) => {
    console.log('Toggling pripomienka status:', pripomienka.id);

    try {
      if (pripomienka.stav === 'nevybavena') {
        await resolveFeedbackMutation({ feedbackId: pripomienka.id as Id<'pripomienky'> });
        showNotification('✅ Pripomienka bola označená ako vybavená!', 'success');
      } else {
        // If we need to unresolve, we'd need a new mutation
        showNotification('ℹ️ Pripomienka je už vybavená', 'info');
      }
    } catch (error) {
      console.error('Error toggling pripomienka:', error);
      showNotification('❌ Chyba pri zmene stavu pripomienky!', 'error');
    }
  };

  const aiAssistDraft = () => {
    console.log('AI assist for drafting steps');
    const kroky = [
      { id: generateId('krok'), cislo: 1, popis: 'Pripravte si potrebné náradie a materiály' },
      { id: generateId('krok'), cislo: 2, popis: 'Skontrolujte bezpečnostné opatrenia' },
      { id: generateId('krok'), cislo: 3, popis: 'Postupujte podľaa technických výkresov' },
      { id: generateId('krok'), cislo: 4, popis: 'Vykonajte kontrolu kvality' },
      { id: generateId('krok'), cislo: 5, popis: 'Zdokumentujte výsledok' }
    ];
    setNewNavodData(prev => ({
      ...prev,
      postupPrace: kroky
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage: NavodObrazok = {
            id: generateId('img'),
            url: e.target?.result as string,
            cisloKroku: 1,
            popis: file.name
          };
          setUploadedImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (imageId: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleUpdateImageStep = (imageId: string, cisloKroku: number) => {
    console.log('Updating image step:', imageId, 'to step:', cisloKroku);
    setUploadedImages(prev => {
      const updated = prev.map(img =>
        img.id === imageId ? { ...img, cisloKroku } : img
      );
      console.log('Updated uploadedImages:', updated);
      return updated;
    });
  };

  const handleUpdateImageDescription = (imageId: string, popis: string) => {
    console.log('Updating image description:', imageId, 'to:', popis);
    setUploadedImages(prev => {
      const updated = prev.map(img =>
        img.id === imageId ? { ...img, popis } : img
      );
      console.log('Updated uploadedImages descriptions:', updated);
      return updated;
    });
  };

  // Attachment upload handler
  const handleAttachmentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingAttachment(true);

      // Upload each file
      const uploadedFiles: Array<{ id: string; filename: string }> = [];

      for (const file of Array.from(files)) {
        // Step 1: Get upload URL from Convex
        const uploadUrl = await generateUploadUrl();

        // Step 2: Upload file to Convex storage using POST
        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
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

        if (!storageId) {
          throw new Error("No storage ID returned from upload");
        }

        uploadedFiles.push({
          id: storageId,
          filename: file.name
        });
      }

      // Step 4: Add to current attachments
      setCurrentAttachments(prev => [...prev, ...uploadedFiles]);

      showNotification(`✅ ${uploadedFiles.length} príloha/prílohy boli nahrané!`, 'success');
      console.log('Attachments uploaded successfully:', uploadedFiles);

    } catch (error) {
      console.error('Upload error:', error);
      showNotification('❌ Chyba pri nahrávaní príloh!', 'error');
    } finally {
      setUploadingAttachment(false);
    }
  };

  // Remove attachment handler
  const handleRemoveAttachment = async (attachmentId: string) => {
    try {
      // Remove from state
      setCurrentAttachments(prev => prev.filter(a => a.id !== attachmentId));
      showNotification('✅ Príloha bola odstránená!', 'success');
    } catch (error) {
      console.error('Error removing attachment:', error);
      showNotification('❌ Chyba pri odstraňovaní prílohy!', 'error');
    }
  };

  const handleAddStep = () => {
    const nextNumber = newNavodData.postupPrace.length + 1;
    const newStep = {
      id: generateId('krok'),
      cislo: nextNumber,
      popis: ''
    };
    setNewNavodData(prev => ({
      ...prev,
      postupPrace: [...prev.postupPrace, newStep]
    }));
  };

  const handleRemoveStep = (stepId: string) => {
    const updatedSteps = newNavodData.postupPrace
      .filter(krok => krok.id !== stepId)
      .map((krok, index) => ({
        ...krok,
        cislo: index + 1
      }));

    setNewNavodData(prev => ({
      ...prev,
      postupPrace: updatedSteps
    }));
  };

  const handleUpdateStepDescription = (stepId: string, popis: string) => {
    setNewNavodData(prev => ({
      ...prev,
      postupPrace: prev.postupPrace.map(krok =>
        krok.id === stepId ? { ...krok, popis } : krok
      )
    }));
  };

  // Helper functions for managing list items
  const handleAddListItem = (section: 'potrebneNaradie' | 'naCoSiDatPozor' | 'casteChyby') => {
    const newItem = {
      id: generateId(`${section}_item`),
      popis: ''
    };
    setNewNavodData(prev => ({
      ...prev,
      [section]: [...prev[section], newItem]
    }));
  };

  const handleUpdateListItem = (section: 'potrebneNaradie' | 'naCoSiDatPozor' | 'casteChyby', itemId: string, popis: string) => {
    setNewNavodData(prev => ({
      ...prev,
      [section]: prev[section].map(item =>
        item.id === itemId ? { ...item, popis } : item
      )
    }));
  };

  const handleRemoveListItem = (section: 'potrebneNaradie' | 'naCoSiDatPozor' | 'casteChyby', itemId: string) => {
    setNewNavodData(prev => ({
      ...prev,
      [section]: prev[section].filter(item => item.id !== itemId)
    }));
  };

  const handleDeleteTag = (tag: any) => {
    console.log('Setting tag for deletion:', tag);
    setTagToDelete(tag);
    setShowDeleteTagDialog(true);
  };

  const handleConfirmDeleteTag = async () => {
    if (!tagToDelete) return;

    console.log('Attempting to delete tag:', tagToDelete.nazov, tagToDelete.id);

    // Count how many guides use this tag
    const affectedGuides = (currentNavody || []).filter(navod =>
      (tagToDelete.typ === 'typ-prace' && navod.typPrace.includes(tagToDelete.nazov)) ||
      (tagToDelete.typ === 'produkt' && navod.produkt.includes(tagToDelete.nazov))
    );

    const confirmMessage = `⚠️ POZOR: Odstraňovanie tagu\n\n` +
      `Tag: "${tagToDelete.nazov}" (${tagToDelete.typ === 'typ-prace' ? 'Typ práce' : 'Produkt'})\n` +
      `Ovplyvnené návody: ${affectedGuides.length}\n` +
      `${affectedGuides.length > 0 ? `Návody: ${affectedGuides.map(n => n.nazov).slice(0, 3).join(', ')}${affectedGuides.length > 3 ? '...' : ''}\n` : ''}\n` +
      `Tag bude odstránený zo VŠETKÝCH návodov!\n` +
      `Táto akcia je NEVRATNÁ!\n\n` +
      `Naozaj chcete pokračovať?`;

    if (!confirm(confirmMessage)) {
      console.log('❌ User cancelled tag deletion');
      setShowDeleteTagDialog(false);
      setTagToDelete(null);
      return;
    }

    console.log('✅ User confirmed tag deletion, proceeding...');

    try {
      await deleteTagMutation({ tagId: tagToDelete.id as Id<'tags'> });

      setShowDeleteTagDialog(false);
      setTagToDelete(null);

      showNotification(`✅ Tag "${tagToDelete.nazov}" bol odstránený zo všetkých návodov!`, 'success');
      console.log('✅ Tag deleted successfully:', tagToDelete.nazov);
    } catch (error: any) {
      console.error('❌ Error deleting tag:', error);
      if (error.message?.includes('použitý')) {
        showNotification('❌ Tag je použitý v návodoch a nemôže byť odstránený!', 'error');
      } else {
        showNotification('❌ Chyba pri odstraňovaní tagu!', 'error');
      }
      setShowDeleteTagDialog(false);
      setTagToDelete(null);
    }
  };

  // Feedback notifications
  const { newFeedbackCount, markNotificationsAsSeen } = useFeedbackNotifications();

  return (
    <ProtectedPage requireAdmin={true}>
      <ResponsiveLayout onFilterChange={handleFilterChange} currentFilters={filters}>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 lg:mb-8 gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="font-orbitron text-2xl sm:text-3xl font-bold text-chicho-red">
                    Administrácia
                  </h1>
                  <p className="text-gray-600 font-inter text-sm lg:text-base">
                    Správa obsahu portálu - návody, školenia, pozície a chyby
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Dashboard */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 mb-6">
            <div
              className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => scrollToSection('navody-section')}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-russo text-xs lg:text-sm text-gray-600">Návody</h3>
                <BookOpen size={16} className="text-chicho-red lg:w-5 lg:h-5" />
              </div>
              <p className="text-xl lg:text-2xl font-bold text-chicho-dark">{stats.navody}</p>
              <p className="text-xs text-gray-500 mt-1">Výrobné návody</p>
            </div>

            <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-russo text-sm text-gray-600">Školenia</h3>
                <Users size={20} className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{stats.skolenia}</p>
              <p className="text-xs text-gray-500 mt-1">Aktívne kurzy</p>
            </div>

            <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-russo text-sm text-gray-600">pozície</h3>
                <Settings size={20} className="text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.pozicie}</p>
              <p className="text-xs text-gray-500 mt-1">Pracovné pozície</p>
            </div>

            <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-russo text-sm text-gray-600">Chyby</h3>
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">{stats.chyby}</p>
              <p className="text-xs text-gray-500 mt-1">Evidované problémy</p>
            </div>

            <div
              className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => scrollToSection('uzivatelia-section')}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-russo text-sm text-gray-600">Používatelia</h3>
                <Users size={20} className="text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">{stats.uzivatelia}</p>
              <p className="text-xs text-gray-500 mt-1">Registrovaní</p>
            </div>

            <div
              className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => scrollToSection('pripomienky-section')}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-russo text-sm text-gray-600">Pripomienky</h3>
                <MessageSquare size={20} className="text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-orange-600">{stats.pripomienky}</p>
              <p className="text-xs text-gray-500 mt-1">Nevybavené</p>
            </div>
          </div>

          {/* Content Management Sections */}
          <div className="space-y-6">
            {/* Top Row - 2 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Návody Management */}
              <section id="navody-section" className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-russo text-lg text-chicho-red">Správa návodov ({currentNavody?.length || 0})</h2>
                  <div className="flex items-center gap-2">
                    <Dialog open={showNewNavodDialog} onOpenChange={setShowNewNavodDialog}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-chicho-red border-chicho-red hover:bg-chicho-red hover:text-white"
                        >
                          <Plus size={16} className="mr-2" />
                          Pridať nový návod
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="font-russo text-chicho-red">Vytvoriť nový návod</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                          {/* Basic Info */}
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="navod-nazov" className="font-inter font-semibold">Názov návvodu *</Label>
                              <Input
                                id="navod-nazov"
                                value={newNavodData.nazov}
                                onChange={(e) => setNewNavodData(prev => ({ ...prev, nazov: e.target.value }))}
                                placeholder="napr. Montáž okna do murovanej steny"
                                className="mt-1"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="font-inter font-semibold">Typ práce</Label>
                                <div className="mt-2 space-y-2">
                                  {(currentTagy || [])
                                    .filter(tag => tag.typ === 'typ-prace')
                                    .map(tag => (
                                      <label key={tag.id} className="flex items-center space-x-2">
                                        <input
                                          type="checkbox"
                                          checked={newNavodData.typPrace.includes(tag.nazov)}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              setNewNavodData(prev => ({
                                                ...prev,
                                                typPrace: [...prev.typPrace, tag.nazov]
                                              }));
                                            } else {
                                              setNewNavodData(prev => ({
                                                ...prev,
                                                typPrace: prev.typPrace.filter(t => t !== tag.nazov)
                                              }));
                                            }
                                          }}
                                          className="rounded border-gray-300"
                                        />
                                        <span className="text-sm font-inter" style={{ color: tag.farba }}>
                                          {tag.nazov}
                                        </span>
                                      </label>
                                    ))}
                                </div>
                              </div>

                              <div>
                                <Label className="font-inter font-semibold">Produkt</Label>
                                <div className="mt-2 space-y-2">
                                  {(currentTagy || [])
                                    .filter(tag => tag.typ === 'produkt')
                                    .map(tag => (
                                      <label key={tag.id} className="flex items-center space-x-2">
                                        <input
                                          type="checkbox"
                                          checked={newNavodData.produkt.includes(tag.nazov)}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              setNewNavodData(prev => ({
                                                ...prev,
                                                produkt: [...prev.produkt, tag.nazov]
                                              }));
                                            } else {
                                              setNewNavodData(prev => ({
                                                ...prev,
                                                produkt: prev.produkt.filter(p => p !== tag.nazov)
                                              }));
                                            }
                                          }}
                                          className="rounded border-gray-300"
                                        />
                                        <span className="text-sm font-inter" style={{ color: tag.farba }}>
                                          {tag.nazov}
                                        </span>
                                      </label>
                                    ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Steps Section */}
                          <div className="border-t pt-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <h3 className="font-russo text-lg text-chicho-dark">Postup práce *</h3>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleSection('kroky')}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  <ChevronDown
                                    size={16}
                                    className={`transform transition-transform ${collapsedSections.kroky ? 'rotate-180' : ''}`}
                                  />
                                </Button>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={aiAssistDraft}
                                  className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
                                >
                                  ✨ AI návrh
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={handleAddStep}
                                >
                                  <Plus size={16} className="mr-1" />
                                  Pridať krok
                                </Button>
                              </div>
                            </div>

                            {!collapsedSections.kroky && (
                              <div className="space-y-3">
                                {newNavodData.postupPrace.map((krok, index) => (
                                  <div key={krok.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                                    <div className="w-8 h-8 bg-chicho-red text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                      {krok.cislo}
                                    </div>
                                    <div className="flex-1">
                                      <Textarea
                                        value={krok.popis}
                                        onChange={(e) => handleUpdateStepDescription(krok.id, e.target.value)}
                                        placeholder={`Opíšte ${krok.cislo}. krok postupu...`}
                                        className="min-h-[60px] resize-none"
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveStep(krok.id)}
                                      className="text-red-600 hover:text-red-700 flex-shrink-0"
                                    >
                                      <Trash2 size={16} />
                                    </Button>
                                  </div>
                                ))}
                                {newNavodData.postupPrace.length === 0 && (
                                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                    <p className="text-gray-500 font-inter">Zatiaľ žiadne kroky. Pridajte prvý krok postupu.</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Tools Section */}
                          <div className="border-t pt-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <h3 className="font-russo text-lg text-chicho-dark">Potrebné náradie</h3>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleSection('naradie')}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  <ChevronDown
                                    size={16}
                                    className={`transform transition-transform ${collapsedSections.naradie ? 'rotate-180' : ''}`}
                                  />
                                </Button>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddListItem('potrebneNaradie')}
                              >
                                <Plus size={16} className="mr-1" />
                                Pridať náradie
                              </Button>
                            </div>

                            {!collapsedSections.naradie && (
                              <div className="space-y-2">
                                {newNavodData.potrebneNaradie.map((item) => (
                                  <div key={item.id} className="flex items-center gap-3">
                                    <Input
                                      value={item.popis}
                                      onChange={(e) => handleUpdateListItem('potrebneNaradie', item.id, e.target.value)}
                                      placeholder="napr. vŕtačka, skrutkovač..."
                                      className="flex-1"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveListItem('potrebneNaradie', item.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 size={16} />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Safety Section */}
                          <div className="border-t pt-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <h3 className="font-russo text-lg text-chicho-dark">Na čo si dať pozor</h3>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleSection('pozor')}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  <ChevronDown
                                    size={16}
                                    className={`transform transition-transform ${collapsedSections.pozor ? 'rotate-180' : ''}`}
                                  />
                                </Button>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddListItem('naCoSiDatPozor')}
                              >
                                <Plus size={16} className="mr-1" />
                                Pridať upozornenie
                              </Button>
                            </div>

                            {!collapsedSections.pozor && (
                              <div className="space-y-2">
                                {newNavodData.naCoSiDatPozor.map((item) => (
                                  <div key={item.id} className="flex items-center gap-3">
                                    <Input
                                      value={item.popis}
                                      onChange={(e) => handleUpdateListItem('naCoSiDatPozor', item.id, e.target.value)}
                                      placeholder="napr. pozor na elektrické vedenie..."
                                      className="flex-1"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveListItem('naCoSiDatPozor', item.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 size={16} />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Common Errors Section */}
                          <div className="border-t pt-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <h3 className="font-russo text-lg text-chicho-dark">Časté chyby</h3>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleSection('chyby')}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  <ChevronDown
                                    size={16}
                                    className={`transform transition-transform ${collapsedSections.chyby ? 'rotate-180' : ''}`}
                                  />
                                </Button>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddListItem('casteChyby')}
                              >
                                <Plus size={16} className="mr-1" />
                                Pridať chybu
                              </Button>
                            </div>

                            {!collapsedSections.chyby && (
                              <div className="space-y-2">
                                {newNavodData.casteChyby.map((item) => (
                                  <div key={item.id} className="flex items-center gap-3">
                                    <Input
                                      value={item.popis}
                                      onChange={(e) => handleUpdateListItem('casteChyby', item.id, e.target.value)}
                                      placeholder="napr. nesprávne umiestnenie..."
                                      className="flex-1"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveListItem('casteChyby', item.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 size={16} />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Images Section */}
                          <div className="border-t pt-6">
                            <h3 className="font-russo text-lg text-chicho-dark mb-4">Obrázky</h3>

                            <div className="mb-4">
                              <Label htmlFor="image-upload" className="font-inter font-semibold">Nahrať obrázky</Label>
                              <Input
                                id="image-upload"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="mt-1"
                              />
                            </div>

                            {uploadedImages.length > 0 && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {uploadedImages.map((image) => (
                                  <div key={image.id} className="border border-gray-200 rounded-lg p-3">
                                    {/* Optimized Image Display */}
                                    <div className="relative mb-3">
                                      <OptimizedImage
                                        src={image.url}
                                        alt={image.popis}
                                        showOptimizationIndicator={true}
                                        containerClassName="rounded overflow-hidden"
                                        onLoad={(dimensions) => {
                                          console.log('Admin image optimized:', {
                                            id: image.id,
                                            dimensions,
                                            description: image.popis
                                          });
                                        }}
                                      />
                                    </div>

                                    {/* Enhanced text area with guaranteed visibility */}
                                    <div className="space-y-2 bg-gray-50 rounded-lg p-3">
                                      <Input
                                        value={image.popis}
                                        onChange={(e) => handleUpdateImageDescription(image.id, e.target.value)}
                                        placeholder="Popis obrázka..."
                                        className="text-sm bg-white"
                                      />
                                      <div className="flex items-center justify-between">
                                        <Select
                                          value={image.cisloKroku.toString()}
                                          onValueChange={(value) => handleUpdateImageStep(image.id, parseInt(value))}
                                        >
                                          <SelectTrigger className="w-32 bg-white">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="0">Všeobecný</SelectItem>
                                            {newNavodData.postupPrace.map((krok) => (
                                              <SelectItem key={krok.id} value={krok.cislo.toString()}>
                                                Krok {krok.cislo}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleRemoveImage(image.id)}
                                          className="text-red-600 hover:text-red-700"
                                        >
                                          <Trash2 size={16} />
                                        </Button>
                                      </div>

                                      {/* Text visibility guarantee indicator */}
                                      <div className="text-xs text-green-600 flex items-center gap-1">
                                        <span>✅</span>
                                        <span>Text je vždy viditeľný pod obrázkom</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Video URL */}
                          <div className="border-t pt-6">
                            <div>
                              <Label htmlFor="video-url" className="font-inter font-semibold">Video URL (voliteľné)</Label>
                              <Input
                                id="video-url"
                                value={newNavodData.videoUrl}
                                onChange={(e) => setNewNavodData(prev => ({ ...prev, videoUrl: e.target.value }))}
                                placeholder="https://youtube.com/watch?v=..."
                                className="mt-1"
                              />
                            </div>
                          </div>

                          {/* Attachment Section */}
                          <div className="border-t pt-6">
                            <h3 className="font-russo text-lg text-chicho-dark mb-4">Prílohy (voliteľné)</h3>

                            {currentAttachments.length > 0 && (
                              <div className="space-y-2 mb-4">
                                {currentAttachments.map((attachment) => (
                                  <div key={attachment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                                    <div className="flex items-center gap-3">
                                      <FileText className="text-chicho-red" size={24} />
                                      <div>
                                        <p className="font-inter font-semibold text-sm">{attachment.filename}</p>
                                        <p className="text-xs text-gray-500">Príloha je nahratá</p>
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveAttachment(attachment.id)}
                                      className="text-red-600 hover:text-red-700"
                                      disabled={uploadingAttachment}
                                    >
                                      <Trash2 size={16} />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div>
                              <Label htmlFor="attachment-upload" className="font-inter font-semibold">
                                Nahrať prílohy (PDF, výkres, dokument...)
                              </Label>
                              <Input
                                id="attachment-upload"
                                type="file"
                                multiple
                                onChange={handleAttachmentUpload}
                                className="mt-1"
                                disabled={uploadingAttachment}
                                accept=".pdf,.doc,.docx,.dwg,.dxf,.jpg,.jpeg,.png"
                              />
                              {uploadingAttachment && (
                                <p className="text-sm text-blue-600 mt-2">Nahrávam prílohy...</p>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                            <Button variant="outline" onClick={() => setShowNewNavodDialog(false)}>
                              Zrušiť
                            </Button>
                            <Button
                              onClick={handleCreateNavod}
                              className="bg-chicho-red hover:bg-red-700 text-white"
                              disabled={!newNavodData.nazov || newNavodData.postupPrace.length === 0}
                            >
                              Vytvoriť návod
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllNavody(!showAllNavody)}
                    >
                      {showAllNavody ? 'Zobraziť menej' : 'Zobraziť všetky'}
                    </Button>
                  </div>
                </div>

                {/* Edit Navod Dialog */}
                <Dialog open={showEditNavodDialog} onOpenChange={setShowEditNavodDialog}>
                  <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="font-russo text-chicho-red">
                        Upraviť návod: {editingNavod?.nazov}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      {/* Basic Info */}
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="edit-navod-nazov" className="font-inter font-semibold">Názov návodu *</Label>
                          <Input
                            id="edit-navod-nazov"
                            value={newNavodData.nazov}
                            onChange={(e) => setNewNavodData(prev => ({ ...prev, nazov: e.target.value }))}
                            placeholder="napr. Montáž okna do murovanej steny"
                            className="mt-1"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="font-inter font-semibold">Typ práce</Label>
                            <div className="mt-2 space-y-2">
                              {(currentTagy || [])
                                .filter(tag => tag.typ === 'typ-prace')
                                .map(tag => (
                                  <label key={tag.id} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={newNavodData.typPrace.includes(tag.nazov)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setNewNavodData(prev => ({
                                            ...prev,
                                            typPrace: [...prev.typPrace, tag.nazov]
                                          }));
                                        } else {
                                          setNewNavodData(prev => ({
                                            ...prev,
                                            typPrace: prev.typPrace.filter(t => t !== tag.nazov)
                                          }));
                                        }
                                      }}
                                      className="rounded border-gray-300"
                                    />
                                    <span className="text-sm font-inter" style={{ color: tag.farba }}>
                                      {tag.nazov}
                                    </span>
                                  </label>
                                ))}
                            </div>
                          </div>

                          <div>
                            <Label className="font-inter font-semibold">Produkt</Label>
                            <div className="mt-2 space-y-2">
                              {(currentTagy || [])
                                .filter(tag => tag.typ === 'produkt')
                                .map(tag => (
                                  <label key={tag.id} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={newNavodData.produkt.includes(tag.nazov)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setNewNavodData(prev => ({
                                            ...prev,
                                            produkt: [...prev.produkt, tag.nazov]
                                          }));
                                        } else {
                                          setNewNavodData(prev => ({
                                            ...prev,
                                            produkt: prev.produkt.filter(p => p !== tag.nazov)
                                          }));
                                        }
                                      }}
                                      className="rounded border-gray-300"
                                    />
                                    <span className="text-sm font-inter" style={{ color: tag.farba }}>
                                      {tag.nazov}
                                    </span>
                                  </label>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Steps Section */}
                      <div className="border-t pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <h3 className="font-russo text-lg text-chicho-dark">Postup práce *</h3>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleSection('kroky')}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <ChevronDown
                                size={16}
                                className={`transform transition-transform ${collapsedSections.kroky ? 'rotate-180' : ''}`}
                              />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={aiAssistDraft}
                              className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
                            >
                              ✨ AI návrh
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleAddStep}
                            >
                              <Plus size={16} className="mr-1" />
                              Pridať krok
                            </Button>
                          </div>
                        </div>

                        {!collapsedSections.kroky && (
                          <div className="space-y-3">
                            {newNavodData.postupPrace.map((krok, index) => (
                              <div key={krok.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                                <div className="w-8 h-8 bg-chicho-red text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                  {krok.cislo}
                                </div>
                                <div className="flex-1">
                                  <Textarea
                                    value={krok.popis}
                                    onChange={(e) => handleUpdateStepDescription(krok.id, e.target.value)}
                                    placeholder={`Opíšte ${krok.cislo}. krok postupu...`}
                                    className="min-h-[60px] resize-none"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveStep(krok.id)}
                                  className="text-red-600 hover:text-red-700 flex-shrink-0"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            ))}
                            {newNavodData.postupPrace.length === 0 && (
                              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                <p className="text-gray-500 font-inter">Zatiaľ žiadne kroky. Pridajte prvý krok postupu.</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Tools Section */}
                      <div className="border-t pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <h3 className="font-russo text-lg text-chicho-dark">Potrebné náradie</h3>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleSection('naradie')}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <ChevronDown
                                size={16}
                                className={`transform transition-transform ${collapsedSections.naradie ? 'rotate-180' : ''}`}
                              />
                            </Button>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddListItem('potrebneNaradie')}
                          >
                            <Plus size={16} className="mr-1" />
                            Pridať náradie
                          </Button>
                        </div>

                        {!collapsedSections.naradie && (
                          <div className="space-y-2">
                            {newNavodData.potrebneNaradie.map((item) => (
                              <div key={item.id} className="flex items-center gap-3">
                                <Input
                                  value={item.popis}
                                  onChange={(e) => handleUpdateListItem('potrebneNaradie', item.id, e.target.value)}
                                  placeholder="napr. vŕtačka, skrutkovač..."
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveListItem('potrebneNaradie', item.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Safety Section */}
                      <div className="border-t pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <h3 className="font-russo text-lg text-chicho-dark">Na čo si dať pozor</h3>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleSection('pozor')}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <ChevronDown
                                size={16}
                                className={`transform transition-transform ${collapsedSections.pozor ? 'rotate-180' : ''}`}
                              />
                            </Button>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddListItem('naCoSiDatPozor')}
                          >
                            <Plus size={16} className="mr-1" />
                            Pridať upozornenie
                          </Button>
                        </div>

                        {!collapsedSections.pozor && (
                          <div className="space-y-2">
                            {newNavodData.naCoSiDatPozor.map((item) => (
                              <div key={item.id} className="flex items-center gap-3">
                                <Input
                                  value={item.popis}
                                  onChange={(e) => handleUpdateListItem('naCoSiDatPozor', item.id, e.target.value)}
                                  placeholder="napr. pozor na elektrické vedenie..."
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveListItem('naCoSiDatPozor', item.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Common Errors Section */}
                      <div className="border-t pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <h3 className="font-russo text-lg text-chicho-dark">Časté chyby</h3>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleSection('chyby')}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <ChevronDown
                                size={16}
                                className={`transform transition-transform ${collapsedSections.chyby ? 'rotate-180' : ''}`}
                              />
                            </Button>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddListItem('casteChyby')}
                          >
                            <Plus size={16} className="mr-1" />
                            Pridať chybu
                          </Button>
                        </div>

                        {!collapsedSections.chyby && (
                          <div className="space-y-2">
                            {newNavodData.casteChyby.map((item) => (
                              <div key={item.id} className="flex items-center gap-3">
                                <Input
                                  value={item.popis}
                                  onChange={(e) => handleUpdateListItem('casteChyby', item.id, e.target.value)}
                                  placeholder="napr. nesprávne umiestnenie..."
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveListItem('casteChyby', item.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Images Section */}
                      <div className="border-t pt-6">
                        <h3 className="font-russo text-lg text-chicho-dark mb-4">Obrázky</h3>

                        <div className="mb-4">
                          <Label htmlFor="edit-image-upload" className="font-inter font-semibold">Nahrať obrázky</Label>
                          <Input
                            id="edit-image-upload"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="mt-1"
                          />
                        </div>

                        {uploadedImages.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {uploadedImages.map((image) => (
                              <div key={image.id} className="border border-gray-200 rounded-lg p-3">
                                {/* Optimized Image Display for Edit Dialog */}
                                <div className="relative mb-3">
                                  <OptimizedImage
                                    src={image.url}
                                    alt={image.popis}
                                    showOptimizationIndicator={true}
                                    containerClassName="rounded overflow-hidden"
                                    onLoad={(dimensions) => {
                                      console.log('Edit dialog image optimized:', {
                                        id: image.id,
                                        dimensions,
                                        description: image.popis
                                      });
                                    }}
                                  />
                                </div>

                                {/* Enhanced text area with guaranteed visibility */}
                                <div className="space-y-2 bg-gray-50 rounded-lg p-3">
                                  <Input
                                    value={image.popis}
                                    onChange={(e) => handleUpdateImageDescription(image.id, e.target.value)}
                                    placeholder="Popis obrázka..."
                                    className="text-sm bg-white"
                                  />
                                  <div className="flex items-center justify-between">
                                    <Select
                                      value={image.cisloKroku.toString()}
                                      onValueChange={(value) => handleUpdateImageStep(image.id, parseInt(value))}
                                    >
                                      <SelectTrigger className="w-32 bg-white">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="0">Všeobecný</SelectItem>
                                        {newNavodData.postupPrace.map((krok) => (
                                          <SelectItem key={krok.id} value={krok.cislo.toString()}>
                                            Krok {krok.cislo}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveImage(image.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 size={16} />
                                    </Button>
                                  </div>

                                  {/* Text visibility guarantee indicator */}
                                  <div className="text-xs text-green-600 flex items-center gap-1">
                                    <span>✅</span>
                                    <span>Text je vždy viditeľný pod obrázkom</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Video URL */}
                      <div className="border-t pt-6">
                        <div>
                          <Label htmlFor="edit-video-url" className="font-inter font-semibold">Video URL (voliteľné)</Label>
                          <Input
                            id="edit-video-url"
                            value={newNavodData.videoUrl}
                            onChange={(e) => setNewNavodData(prev => ({ ...prev, videoUrl: e.target.value }))}
                            placeholder="https://youtube.com/watch?v=..."
                            className="mt-1"
                          />
                        </div>
                      </div>

                      {/* Attachment Section */}
                      <div className="border-t pt-6">
                        <h3 className="font-russo text-lg text-chicho-dark mb-4">Prílohy (voliteľné)</h3>

                        {currentAttachments.length > 0 && (
                          <div className="space-y-2 mb-4">
                            {currentAttachments.map((attachment) => (
                              <div key={attachment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                                <div className="flex items-center gap-3">
                                  <FileText className="text-chicho-red" size={24} />
                                  <div>
                                    <p className="font-inter font-semibold text-sm">{attachment.filename}</p>
                                    <p className="text-xs text-gray-500">Príloha je nahratá</p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveAttachment(attachment.id)}
                                  className="text-red-600 hover:text-red-700"
                                  disabled={uploadingAttachment}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div>
                          <Label htmlFor="edit-attachment-upload" className="font-inter font-semibold">
                            Nahrať prílohy (PDF, výkres, dokument...)
                          </Label>
                          <Input
                            id="edit-attachment-upload"
                            type="file"
                            multiple
                            onChange={handleAttachmentUpload}
                            className="mt-1"
                            disabled={uploadingAttachment}
                            accept=".pdf,.doc,.docx,.dwg,.dxf,.jpg,.jpeg,.png"
                          />
                          {uploadingAttachment && (
                            <p className="text-sm text-blue-600 mt-2">Nahrávam prílohy...</p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                        <Button variant="outline" onClick={() => setShowEditNavodDialog(false)}>
                          Zrušiť
                        </Button>
                        <Button
                          onClick={handleSaveEditNavod}
                          className="bg-chicho-red hover:bg-red-700 text-white"
                          disabled={!newNavodData.nazov || newNavodData.postupPrace.length === 0}
                        >
                          Uložiť zmeny
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Návody List */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {(currentNavody || []).length > 0 ? (
                    (currentNavody || [])
                      .slice(0, showAllNavody ? undefined : 3)
                      .map((navod) => (
                        <div key={navod.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-inter font-semibold text-chicho-dark text-sm">{navod.nazov}</h4>
                            <p className="text-xs text-gray-600">
                              {navod.typPrace.join(', ')} • {navod.produkt.join(', ')}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Aktualizované: {new Date(navod.aktualizovane).toLocaleDateString('sk-SK')}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Link href={`/navody/${navod.slug}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Zobraziť návod"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Eye size={14} />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditNavod(navod)}
                              title="Upraviť návod"
                            >
                              <Edit3 size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteNavod(navod)}
                              title="Odstrániť návod"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-6">
                      <BookOpen size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500 font-inter text-sm">Zatiaľ žiadne návody.</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Tags Management */}
              <section id="tagy-section" className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-russo text-lg text-chicho-red">Správa tagov ({currentTagy?.length || 0})</h2>
                  <Dialog open={showNewTagDialog} onOpenChange={setShowNewTagDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Hash size={16} className="mr-2" />
                        Nový tag
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="font-russo text-chicho-red">Vytvoriť nový tag</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="tag-nazov" className="font-inter font-semibold">Názov</Label>
                          <Input
                            id="tag-nazov"
                            value={newTagData.nazov}
                            onChange={(e) => setNewTagData(prev => ({ ...prev, nazov: e.target.value }))}
                            placeholder="napr. zváračka"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="tag-typ" className="font-inter font-semibold">Typ</Label>
                          <Select
                            value={newTagData.typ}
                            onValueChange={(value: 'typ-prace' | 'produkt') => setNewTagData(prev => ({ ...prev, typ: value }))}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="typ-prace">Typ práce</SelectItem>
                              <SelectItem value="produkt">Produkt</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="tag-farba" className="font-inter font-semibold">Farba</Label>
                          <div className="flex items-center gap-3 mt-1">
                            <Input
                              id="tag-farba"
                              type="color"
                              value={newTagData.farba}
                              onChange={(e) => setNewTagData(prev => ({ ...prev, farba: e.target.value }))}
                              className="w-16 h-10 p-1 border border-gray-300 rounded cursor-pointer"
                            />
                            <Input
                              value={newTagData.farba}
                              onChange={(e) => setNewTagData(prev => ({ ...prev, farba: e.target.value }))}
                              placeholder="#3B82F6"
                              className="flex-1"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-4">
                          <Button variant="outline" onClick={() => setShowNewTagDialog(false)}>
                            Zrušiť
                          </Button>
                          <Button
                            onClick={handleCreateTag}
                            className="bg-chicho-red hover:bg-red-700 text-white"
                            disabled={!newTagData.nazov}
                          >
                            Vytvoriť tag
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {/* Typ práce tags */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-russo text-sm text-gray-700">Typ práce ({(currentTagy || []).filter(tag => tag.typ === 'typ-prace').length})</h3>
                        {(currentTagy || []).filter(tag => tag.typ === 'typ-prace').length > 5 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAllTypPraceTags(!showAllTypPraceTags)}
                            className="text-xs text-chicho-red hover:text-red-700"
                          >
                            {showAllTypPraceTags ? 'Menej' : `+${(currentTagy || []).filter(tag => tag.typ === 'typ-prace').length - 5}`}
                          </Button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(currentTagy || [])
                          .filter(tag => tag.typ === 'typ-prace')
                          .slice(0, showAllTypPraceTags ? undefined : 5)
                          .map(tag => (
                            <div key={tag.id} className="relative group flex items-center">
                              <Badge
                                variant="outline"
                                className="font-inter pr-8"
                                style={{ borderColor: tag.farba, color: tag.farba }}
                              >
                                {tag.nazov}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTag(tag)}
                                className="absolute right-1 h-5 w-5 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full border border-red-200 hover:border-red-300"
                                title={`Odstrániť tag "${tag.nazov}"`}
                              >
                                <X size={10} />
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Produkt tags */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-russo text-sm text-gray-700">Produkt ({(currentTagy || []).filter(tag => tag.typ === 'produkt').length})</h3>
                        {(currentTagy || []).filter(tag => tag.typ === 'produkt').length > 5 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAllProduktTags(!showAllProduktTags)}
                            className="text-xs text-chicho-red hover:text-red-700"
                          >
                            {showAllProduktTags ? 'Menej' : `+${(currentTagy || []).filter(tag => tag.typ === 'produkt').length - 5}`}
                          </Button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(currentTagy || [])
                          .filter(tag => tag.typ === 'produkt')
                          .slice(0, showAllProduktTags ? undefined : 5)
                          .map(tag => (
                            <div key={tag.id} className="relative group flex items-center">
                              <Badge
                                variant="outline"
                                className="font-inter pr-8"
                                style={{ borderColor: tag.farba, color: tag.farba }}
                              >
                                {tag.nazov}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTag(tag)}
                                className="absolute right-1 h-5 w-5 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full border border-red-200 hover:border-red-300"
                                title={`Odstrániť tag "${tag.nazov}"`}
                              >
                                <X size={10} />
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tag Delete Confirmation Dialog */}
                <Dialog open={showDeleteTagDialog} onOpenChange={setShowDeleteTagDialog}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="font-russo text-chicho-red">Odstrániť tag</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="mb-4">
                        <p className="font-inter text-chicho-dark mb-2">
                          Naozaj chcete odstrániť tag <span className="font-bold">"{tagToDelete?.nazov}"</span>?
                        </p>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                          <div className="flex items-start space-x-2">
                            <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-800">
                              <p className="font-semibold mb-1">Upozornenie:</p>
                              <p>Tag bude odstránený zo všetkých návodov, ktoré ho používajú. Táto akcia je nevratná.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-3">
                        <Button variant="outline" onClick={() => setShowDeleteTagDialog(false)}>
                          Zrušiť
                        </Button>
                        <Button
                          onClick={handleConfirmDeleteTag}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Vymazať
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </section>
            </div>

            {/* Visit Analytics Section - Compact */}
            <section id="analyticka-section" className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-russo text-lg text-chicho-red">
                  Analytika návštev
                  {(visitStats || []).length > 0 && (
                    <span className="text-sm text-gray-500 ml-2">({(visitStats || []).reduce((sum, stat) => sum + stat.pocetNavstev, 0)} celkom)</span>
                  )}
                </h2>
                <div className="flex items-center gap-2">
                  {(visitStats || []).length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllVisitStats(!showAllVisitStats)}
                      className="text-xs text-chicho-red hover:text-red-700"
                    >
                      {showAllVisitStats ? 'Menej' : `+${(visitStats || []).length - 2}`}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setShowAllVisitStats(!showAllVisitStats)}>
                    <Activity size={16} className="mr-2" />
                    {showAllVisitStats ? 'Menej' : 'Viac'}
                  </Button>
                </div>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {(visitStats || []).length > 0 ? (
                  (visitStats || [])
                    .sort((a, b) => b.pocetNavstev - a.pocetNavstev)
                    .slice(0, showAllVisitStats ? undefined : 2)
                    .map((stat) => (
                      <div key={stat.navod.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-inter font-semibold text-chicho-dark text-sm">
                              {stat.navod.nazov}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <span className="font-medium">{stat.pocetNavstev} návštev</span>
                              <span>•</span>
                              <span>{(stat.navstevy || []).length > 0 ? `Posledná: ${new Date((stat.navstevy || [])[0]?.cas).toLocaleDateString('sk-SK')}` : 'Žiadne návštevy'}</span>
                            </div>
                          </div>
                          <Link href={`/navody/${stat.navod.slug}`}>
                            <Button variant="ghost" size="sm" title="Zobraziť návod">
                              <Eye size={14} />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-6">
                    <Activity size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500 font-inter text-sm">Zatiaľ žiadne návštevy návodov.</p>
                  </div>
                )}
              </div>
            </section>

            {/* User Management Section */}
            <section id="uzivatelia-section" className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-russo text-lg text-chicho-red">Správa používateľov ({(currentUzivatelia || []).length})</h2>
                <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Users size={16} className="mr-2" />
                      Nový používateľ
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="font-russo text-chicho-red">Vytvoriť nového používateľa</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="user-meno" className="font-inter font-semibold">Meno</Label>
                        <Input
                          id="user-meno"
                          value={newUserData.meno}
                          onChange={(e) => setNewUserData(prev => ({ ...prev, meno: e.target.value }))}
                          placeholder="Jan Novák"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="user-email" className="font-inter font-semibold">Email</Label>
                        <Input
                          id="user-email"
                          type="email"
                          value={newUserData.email}
                          onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="jan.novak@chicho.tech"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="user-heslo" className="font-inter font-semibold">Heslo</Label>
                        <Input
                          id="user-heslo"
                          type="password"
                          value={newUserData.heslo}
                          onChange={(e) => setNewUserData(prev => ({ ...prev, heslo: e.target.value }))}
                          placeholder="********"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="user-uroven" className="font-inter font-semibold">Úroveň</Label>
                        <Select
                          value={newUserData.uroven}
                          onValueChange={(value: 'admin' | 'pracovnik') => setNewUserData(prev => ({ ...prev, uroven: value }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pracovnik">Pracovník</SelectItem>
                            <SelectItem value="admin">Administrátor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-end space-x-3 pt-4">
                        <Button variant="outline" onClick={() => setShowNewUserDialog(false)}>
                          Zrušiť
                        </Button>
                        <Button
                          onClick={handleCreateUser}
                          className="bg-chicho-red hover:bg-red-700 text-white"
                          disabled={!newUserData.meno || !newUserData.email || !newUserData.heslo}
                        >
                          Vytvoriť používateľa
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {(currentUzivatelia || []).length > 0 ? (
                  (currentUzivatelia || []).map((uzivatel) => (
                    <div key={uzivatel.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-inter font-semibold text-chicho-dark text-sm">{uzivatel.meno}</h4>
                        <p className="text-xs text-gray-600">
                          {uzivatel.email} • {uzivatel.uroven === 'admin' ? 'Administrátor' : 'Pracovník'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {uzivatel.celkoveNavstevy || 0} návštev • {(uzivatel.historiaAktivit || []).length} aktivít
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewUserActivity(uzivatel)}
                          title="Zobraziť aktivitu používateľa"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Activity size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(uzivatel)}
                          title="Upraviť používateľa"
                        >
                          <Edit3 size={14} />
                        </Button>
                        {uzivatel.uroven !== 'admin' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteUser(uzivatel)}
                            title="Odstrániť používateľa"
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Users size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500 font-inter text-sm">Žiadni registrovaní používatelia.</p>
                  </div>
                )}
              </div>

              {/* Edit User Dialog */}
              <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-russo text-chicho-red">Upraviť používateľa</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="edit-user-meno" className="font-inter font-semibold">Meno</Label>
                      <Input
                        id="edit-user-meno"
                        value={newUserData.meno}
                        onChange={(e) => setNewUserData(prev => ({ ...prev, meno: e.target.value }))}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-user-email" className="font-inter font-semibold">Email</Label>
                      <Input
                        id="edit-user-email"
                        type="email"
                        value={newUserData.email}
                        onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-user-heslo" className="font-inter font-semibold">Nové heslo (voliteľné)</Label>
                      <Input
                        id="edit-user-heslo"
                        type="password"
                        value={newUserData.heslo}
                        onChange={(e) => setNewUserData(prev => ({ ...prev, heslo: e.target.value }))}
                        placeholder="Nechajte prázdne ak nechcete zmenenť"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-user-uroven" className="font-inter font-semibold">Úroveň</Label>
                      <Select
                        value={newUserData.uroven}
                        onValueChange={(value: 'admin' | 'pracovnik') => setNewUserData(prev => ({ ...prev, uroven: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pracovnik">Pracovník</SelectItem>
                          <SelectItem value="admin">Administrátor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-4">
                      <Button variant="outline" onClick={() => setShowEditUserDialog(false)}>
                        Zrušiť
                      </Button>
                      <Button
                        onClick={handleSaveEditUser}
                        className="bg-chicho-red hover:bg-red-700 text-white"
                        disabled={!newUserData.meno || !newUserData.email}
                      >
                        Uložiť zmeny
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* View User Activity Dialog */}
              <Dialog open={showUserActivityDialog} onOpenChange={setShowUserActivityDialog}>
                <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-russo text-chicho-red">
                      História aktivity - {selectedUserForActivity?.meno}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    {selectedUserForActivity && (
                      <>
                        {/* User Summary */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-chicho-red text-white rounded-full flex items-center justify-center">
                              <User size={20} />
                            </div>
                            <div>
                              <h3 className="font-inter font-semibold text-chicho-dark">
                                {selectedUserForActivity.meno}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {selectedUserForActivity.email} • {selectedUserForActivity.uroven === 'admin' ? 'Administrátor' : 'Pracovník'}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-2xl font-bold text-chicho-red">
                                {selectedUserForActivity.celkoveNavstevy}
                              </p>
                              <p className="text-xs text-gray-600"> Celkové návštevy</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-blue-600">
                                {(selectedUserForActivity.historiaAktivit || []).length}
                              </p>
                              <p className="text-xs text-gray-600"> Aktivít spolu</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-green-600">
                                {selectedUserForActivity.poslednePohlasenie ?
                                  new Date(selectedUserForActivity.poslednePohlasenie).toLocaleDateString('sk-SK') :
                                  'Nikdy'
                                }
                              </p>
                              <p className="text-xs text-gray-600">Posledné prihlásenie</p>
                            </div>
                          </div>
                        </div>

                        {/* Activity Timeline */}
                        <div>
                          <h4 className="font-inter font-semibold text-sm text-gray-700 mb-3 flex items-center">
                            <Clock size={16} className="mr-2" />
                            Posledných 20 aktivít
                          </h4>

                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {(selectedUserForActivity.historiaAktivit || [])
                              .sort((a, b) => new Date(b.cas).getTime() - new Date(a.cas).getTime())
                              .slice(0, 20)
                              .map((aktivita) => (
                                <div key={aktivita.id} className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${aktivita.typ === 'prihlasenie' ? 'bg-green-500' :
                                      aktivita.typ === 'navsteva-navodu' ? 'bg-blue-500' :
                                        aktivita.typ === 'export-pdf' ? 'bg-purple-500' :
                                          aktivita.typ === 'qr-generovanie' ? 'bg-orange-500' :
                                            aktivita.typ === 'vytvorenie-pripomienky' ? 'bg-yellow-500' :
                                              'bg-gray-500'
                                    }`}>
                                    {aktivita.typ === 'prihlasenie' ? '🔐' :
                                      aktivita.typ === 'navsteva-navodu' ? '👁️' :
                                        aktivita.typ === 'export-pdf' ? '📄' :
                                          aktivita.typ === 'qr-generovanie' ? '📱' :
                                            aktivita.typ === 'vytvorenie-pripomienky' ? '💬' :
                                              '📋'
                                    }
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-inter text-sm text-chicho-dark font-medium">
                                      {aktivita.popis}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {new Date(aktivita.cas).toLocaleString('sk-SK')}
                                    </p>
                                  </div>
                                </div>
                              ))}

                            {(selectedUserForActivity.historiaAktivit || []).length === 0 && (
                              <div className="text-center py-6">
                                <Clock size={32} className="mx-auto text-gray-400 mb-2" />
                                <p className="text-gray-500 font-inter text-sm">
                                  Zatiaľ žiadna aktivita zaznamenaná.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </section>

            {/* Feedback Management */}
            <section id="pripomienky-section" className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-russo text-lg text-chicho-red">
                  Schránka pripomienok ({(currentPripomienky || []).filter(p => p.stav === 'nevybavena').length})
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant={feedbackFilter === 'nevybavene' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFeedbackFilter('nevybavene')}
                    className={feedbackFilter === 'nevybavene' ? 'bg-chicho-red hover:bg-red-700' : ''}
                  >
                    Nevybavené
                  </Button>
                  <Button
                    variant={feedbackFilter === 'vybavene' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFeedbackFilter('vybavene')}
                    className={feedbackFilter === 'vybavene' ? 'bg-chicho-red hover:bg-red-700' : ''}
                  >
                    Vybavené
                  </Button>
                  <Button
                    variant={feedbackFilter === 'vsetky' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFeedbackFilter('vsetky')}
                    className={feedbackFilter === 'vsetky' ? 'bg-chicho-red hover:bg-red-700' : ''}
                  >
                    Všetky
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {filteredPripomienky.length > 0 ? (
                  filteredPripomienky.map((pripomienka) => {
                    const uzivatel = (currentUzivatelia || []).find(u => u.id === pripomienka.uzivatelId);
                    const navod = (currentNavody || []).find(n => n.id === pripomienka.navodId);

                    return (
                      <div key={pripomienka.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={pripomienka.stav === 'vybavena' ? 'default' : 'destructive'}>
                                {pripomienka.stav === 'vybavena' ? 'Vybavené' : 'Nevybavené'}
                              </Badge>
                              {pripomienka.cisloKroku && (
                                <Badge variant="outline">
                                  Krok {pripomienka.cisloKroku}
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-inter font-semibold text-chicho-dark">
                              Pripomienka k návodu: {navod?.nazov || 'Neznámy návod'}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              Od: {uzivatel?.meno || 'Neznámy používateľ'} • {pripomienka.vytvorena.toLocaleDateString('sk-SK')}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {navod && (
                              <Link href={`/navody/${navod.slug}`}>
                                <Button variant="ghost" size="sm" title="Zobraziť návod">
                                  <Eye size={16} />
                                </Button>
                              </Link>
                            )}
                            {pripomienka.stav === 'nevybavena' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkFeedbackDone(pripomienka.id)}
                                className="text-green-600 hover:text-green-700"
                                title="Označiť ako vybavené"
                              >
                                <CheckCircle size={16} />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="font-inter text-sm text-gray-700">"{pripomienka.sprava}"</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare size={48} className="mx-auto text-gray-400 mb-3" />
                    <h3 className="font-russo text-lg text-gray-600 mb-2">Žiadne pripomienky</h3>
                    <p className="text-gray-500 font-inter">
                      {feedbackFilter === 'nevybavene' && 'Všetky pripomienky sú vybavené!'}
                      {feedbackFilter === 'vybavene' && 'Zatiaľ žiadne vybavené pripomienky.'}
                      {feedbackFilter === 'vsetky' && 'Zatiaľ žiadne pripomienky od používateľov.'}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Bottom Row - 2 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <section className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-5">
                <h2 className="font-russo text-lg text-chicho-red mb-4">Rýchle akcie</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                    <Plus size={20} className="mb-1" />
                    <span className="text-sm">Nové školenie</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                    <Users size={20} className="mb-1" />
                    <span className="text-sm">Pridať pozíciu</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                    <AlertTriangle size={20} className="mb-1" />
                    <span className="text-sm">Nahlásiť chybu</span>
                  </Button>
                </div>
              </section>

              {/* System Info */}
              <section className="bg-gray-100 rounded-lg border border-gray-200 p-5">
                <h2 className="font-russo text-lg text-gray-700 mb-4">Systém</h2>

                <div className="space-y-4 text-sm font-inter">
                  <div>
                    <h4 className="font-semibold text-chicho-dark mb-2">Portál</h4>
                    <p className="text-gray-600 text-xs">Verzia: 1.0.0</p>
                    <p className="text-gray-600 text-xs">Aktualizácia: 29.07.2025</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-chicho-dark mb-2">Hosting</h4>
                    <p className="text-gray-600 text-xs">Server: Webglobe</p>
                    <p className="text-gray-600 text-xs">Doména: CHICHO.tech</p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Auth Debug Component for Testing */}
          <div className="p-4">
            <AuthDebug />
          </div>

          {/* Logo Upload Section - moved to bottom */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-russo text-lg text-chicho-red">Správa loga</h2>
                  <p className="text-gray-600 font-inter text-sm">
                    Nahrať nové logo aplikácie
                  </p>
                </div>
                <Dialog open={showLogoUploadDialog} onOpenChange={setShowLogoUploadDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="text-chicho-red border-chicho-red hover:bg-chicho-red hover:text-white">
                      <Image size={20} className="mr-2" />
                      Nahrať nové logo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="font-russo text-chicho-red">Správa loga</DialogTitle>
                    </DialogHeader>
                    <LogoUpload />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '#e5e7eb 1px solid', textAlign: 'center' }}>
          <div style={{ color: '#999', fontSize: 10 }}>CHICHO - Interný portál pre výrobné návody</div>
        </div>
      </ResponsiveLayout>
    </ProtectedPage>
  );
}














































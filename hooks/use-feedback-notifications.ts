'use client';

import { useState, useEffect } from 'react';
import { loadPripomienky } from '@/lib/storage';

const STORAGE_KEY = 'chicho_feedback_notifications';

interface FeedbackNotificationState {
  lastCheckedCount: number;
  lastCheckedTime: number;
}

export function useFeedbackNotifications() {
  const [newFeedbackCount, setNewFeedbackCount] = useState(0);
  const [totalUnresolvedCount, setTotalUnresolvedCount] = useState(0);

  // Load notification state from localStorage
  const loadNotificationState = (): FeedbackNotificationState => {
    if (typeof window === 'undefined') return { lastCheckedCount: 0, lastCheckedTime: 0 };
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading feedback notification state:', error);
    }
    
    return { lastCheckedCount: 0, lastCheckedTime: 0 };
  };

  // Save notification state to localStorage
  const saveNotificationState = (state: FeedbackNotificationState) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving feedback notification state:', error);
    }
  };

  // Check for new feedback
  const checkForNewFeedback = () => {
    const pripomienky = loadPripomienky();
    const unresolvedFeedback = pripomienky.filter(p => p.stav === 'nevybavena');
    const currentUnresolvedCount = unresolvedFeedback.length;
    
    setTotalUnresolvedCount(currentUnresolvedCount);
    
    const notificationState = loadNotificationState();
    const newCount = Math.max(0, currentUnresolvedCount - notificationState.lastCheckedCount);
    
    setNewFeedbackCount(newCount);
    
    console.log('Feedback check:', {
      currentUnresolvedCount,
      lastCheckedCount: notificationState.lastCheckedCount,
      newCount
    });
  };

  // Mark notifications as seen
  const markNotificationsAsSeen = () => {
    const pripomienky = loadPripomienky();
    const currentUnresolvedCount = pripomienky.filter(p => p.stav === 'nevybavena').length;
    
    const newState: FeedbackNotificationState = {
      lastCheckedCount: currentUnresolvedCount,
      lastCheckedTime: Date.now()
    };
    
    saveNotificationState(newState);
    setNewFeedbackCount(0);
    
    console.log('Notifications marked as seen:', newState);
  };

  // Initialize and set up periodic checking
  useEffect(() => {
    // Initial check
    checkForNewFeedback();
    
    // Set up periodic checking every 30 seconds
    const interval = setInterval(checkForNewFeedback, 30000);
    
    // Listen for storage changes (when feedback is added/updated)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chicho_pripomienky') {
        checkForNewFeedback();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    newFeedbackCount,
    totalUnresolvedCount,
    markNotificationsAsSeen,
    checkForNewFeedback
  };
}
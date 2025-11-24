'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface FeedbackNotificationProps {
  newFeedbackCount: number;
  onDismiss: () => void;
}

export default function FeedbackNotification({ newFeedbackCount, onDismiss }: FeedbackNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (newFeedbackCount > 0) {
      setIsVisible(true);
    }
  }, [newFeedbackCount]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  if (!isVisible || newFeedbackCount === 0) {
    return null;
  }

  return (
    <div className="bg-orange-500 text-white px-3 py-2 rounded-lg shadow-lg border border-orange-600 flex items-center space-x-2">
      <MessageSquare size={16} />
      <div>
        <p className="font-inter font-semibold text-xs">
          {newFeedbackCount === 1 ? 'Nová pripomienka' : `${newFeedbackCount} nových pripomienok`}
        </p>
        <Link 
          href="/admin#pripomienky-section" 
          onClick={handleDismiss}
          className="text-xs underline hover:no-underline"
        >
          Prejsť na schránku
        </Link>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        className="text-white hover:bg-orange-600 h-5 w-5 p-0 ml-2"
      >
        <X size={12} />
      </Button>
    </div>
  );
}
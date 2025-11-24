'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export default function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Vyberte možnosti...",
  className = ""
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleOption = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter(item => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const removeOption = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter(item => item !== value));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between h-auto min-h-[2.5rem] px-3 py-2"
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selected.length === 0 ? (
            <span className="text-gray-500 text-sm">{placeholder}</span>
          ) : (
            <>
              {selected.map((value) => (
                <Badge
                  key={value}
                  variant="secondary"
                  className="text-xs px-2 py-0 flex items-center gap-1"
                >
                  {value}
                  <X
                    size={12}
                    className="cursor-pointer hover:text-red-500"
                    onClick={(e) => removeOption(value, e)}
                  />
                </Badge>
              ))}
            </>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2">
          {selected.length > 0 && (
            <X
              size={14}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
              onClick={clearAll}
            />
          )}
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </Button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.length === 0 ? (
            <div className="p-3 text-sm text-gray-500 text-center">
              Žiadne možnosti k dispozícii
            </div>
          ) : (
            <div className="p-1">
              {options.map((option) => (
                <div
                  key={option.value}
                  className={`
                    flex items-center justify-between px-3 py-2 rounded cursor-pointer text-sm
                    hover:bg-gray-100 transition-colors
                    ${selected.includes(option.value) ? 'bg-chicho-red/10 text-chicho-red' : ''}
                  `}
                  onClick={() => toggleOption(option.value)}
                >
                  <span>{option.label}</span>
                  {selected.includes(option.value) && (
                    <Check size={16} className="text-chicho-red" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
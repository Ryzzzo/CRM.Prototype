import { useState, useEffect, useRef } from 'react';
import { Search, X, User, Building2, Mail, Phone } from 'lucide-react';
import { supabase, Contact } from '../lib/supabase';

interface GlobalSearchProps {
  onSelectContact: (contact: Contact) => void;
}

export default function GlobalSearch({ onSelectContact }: GlobalSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Contact[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      performSearch();
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async () => {
    const term = searchTerm.toLowerCase();

    const { data } = await supabase
      .from('contacts')
      .select('*')
      .or(`full_name.ilike.%${term}%,company.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%,notes.ilike.%${term}%`)
      .limit(8);

    if (data) {
      setResults(data);
      setIsOpen(data.length > 0);
      setSelectedIndex(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelectContact(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelectContact = (contact: Contact) => {
    onSelectContact(contact);
    setSearchTerm('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const highlightMatch = (text: string, term: string) => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-cyan-400 text-slate-900 font-bold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400" size={20} />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (searchTerm.length >= 2 && results.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder="Search contacts..."
          className="w-full pl-10 pr-10 py-2.5 bg-slate-800 border-2 border-cyan-500/40 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 transition-all text-cyan-100 placeholder-cyan-400"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 hover:text-cyan-300"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-slate-800 border-2 border-cyan-500/40 rounded-xl shadow-2xl shadow-cyan-500/20 z-50 max-h-96 overflow-y-auto custom-scrollbar">
          <div className="p-2">
            <div className="text-xs text-cyan-400 px-3 py-2 font-medium">
              {results.length} result{results.length !== 1 ? 's' : ''} found
            </div>
            {results.map((contact, index) => (
              <button
                key={contact.id}
                onClick={() => handleSelectContact(contact)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  index === selectedIndex
                    ? 'bg-cyan-500/20 border-2 border-cyan-500/60'
                    : 'border-2 border-transparent hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="text-white" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-cyan-100 mb-1">
                      {highlightMatch(contact.full_name, searchTerm)}
                    </div>
                    {contact.company && (
                      <div className="flex items-center gap-1.5 text-sm text-cyan-300 mb-1">
                        <Building2 size={14} />
                        <span>{highlightMatch(contact.company, searchTerm)}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs text-cyan-400">
                      {contact.email && (
                        <div className="flex items-center gap-1">
                          <Mail size={12} />
                          <span>{highlightMatch(contact.email, searchTerm)}</span>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-1">
                          <Phone size={12} />
                          <span>{highlightMatch(contact.phone, searchTerm)}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        contact.status === 'Lead' ? 'bg-cyan-500/20 text-cyan-400' :
                        contact.status === 'Contacted' ? 'bg-blue-500/20 text-blue-400' :
                        contact.status === 'Proposal' ? 'bg-purple-500/20 text-purple-400' :
                        contact.status === 'Closed Won' ? 'bg-green-500/20 text-green-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {contact.status}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="border-t border-cyan-500/20 px-4 py-2 bg-slate-900/50">
            <p className="text-xs text-cyan-500">
              Use <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-cyan-300">↑</kbd> <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-cyan-300">↓</kbd> to navigate, <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-cyan-300">Enter</kbd> to select, <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-cyan-300">Esc</kbd> to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

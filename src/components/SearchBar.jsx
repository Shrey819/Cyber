import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Loader2, 
  ArrowRight, 
  Shield, 
  Terminal, 
  Cloud, 
  Activity, 
  FileCheck,
  Tag,
  CornerDownLeft
} from 'lucide-react';
import { formatINR } from '../data/mockStoreData';

// Helper function to highlight matched substrings in text
function HighlightMatch({ text, query }) {
  if (!query || !text) return <span>{text}</span>;

  // Split query into terms
  const terms = query.trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return <span>{text}</span>;

  // Create escaped regex matching any term
  const escaped = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <span key={i} className="bg-cyan-500/30 text-cyan-300 font-bold px-0.5 rounded">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
}

// Map category to representative cybersecurity icon
function getCategoryIcon(categoryName = '') {
  const cat = categoryName.toLowerCase();
  if (cat.includes('cloud')) return <Cloud className="w-3.5 h-3.5 text-cyan-400" />;
  if (cat.includes('vapt') || cat.includes('penetration') || cat.includes('api')) return <Terminal className="w-3.5 h-3.5 text-amber-400" />;
  if (cat.includes('soc') || cat.includes('monitoring') || cat.includes('mdr')) return <Activity className="w-3.5 h-3.5 text-rose-400" />;
  if (cat.includes('compliance') || cat.includes('audit') || cat.includes('iso')) return <FileCheck className="w-3.5 h-3.5 text-emerald-400" />;
  return <Shield className="w-3.5 h-3.5 text-cyan-400" />;
}

export default function SearchBar({ onSelectProduct, onSubmitSearch, className = '' }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [totalCount, setTotalCount] = useState(0);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global keyboard shortcut: Ctrl+K or / focuses search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search query (300ms) with in-flight abort
  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setSuggestions([]);
      setTotalCount(0);
      setIsLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const url = `/api/products/search?q=${encodeURIComponent(trimmed)}&limit=8`;
        const res = await fetch(url, { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setSuggestions(data.products || []);
            setTotalCount(data.total || 0);
            setIsOpen(true);
            setActiveIndex(-1);
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Search request error:', err);
        }
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Handle keyboard navigation inside dropdown
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        handleProductClick(suggestions[activeIndex]);
      } else {
        handleSearchSubmit();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const handleProductClick = (product) => {
    setIsOpen(false);
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  const handleSearchSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsOpen(false);
    if (onSubmitSearch) {
      onSubmitSearch(trimmed);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setTotalCount(0);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input Container */}
      <div className="relative flex items-center">
        <div className="absolute left-3 sm:left-3.5 text-slate-500 pointer-events-none flex items-center">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-slate-400" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim() && suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search products, brands, categories..."
          className="w-full pl-9 sm:pl-10 pr-16 sm:pr-20 py-2 bg-[#090D16] hover:bg-[#0c121e] focus:bg-[#0b101c] border border-slate-800 focus:border-cyan-500/80 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 shadow-inner focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all font-sans"
          aria-label="Search cybersecurity products"
        />

        {/* Clear & Keyboard Hint */}
        <div className="absolute right-2.5 flex items-center gap-1.5">
          {query ? (
            <button
              onClick={clearSearch}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Clear search input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-slate-800 bg-slate-900/90 text-[10px] font-mono text-slate-500 select-none">
              Ctrl K
            </span>
          )}
        </div>
      </div>

      {/* Live Suggestions Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#090D16] border border-cyan-500/30 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50 backdrop-blur-xl animate-fadeIn">
          {/* Header Status Bar */}
          <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>
              {isLoading ? 'Scanning catalog...' : `${totalCount} match${totalCount === 1 ? '' : 'es'} found`}
            </span>
            <span className="text-[10px] text-slate-500 hidden sm:inline">
              ↑↓ Navigate • Enter to select • Esc to exit
            </span>
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {suggestions.length > 0 ? (
              suggestions.map((product, idx) => {
                const isActive = activeIndex === idx;

                return (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`p-3 sm:p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-cyan-950/40 text-cyan-200 border-l-2 border-cyan-400 pl-3 sm:pl-3.5' 
                        : 'hover:bg-slate-900/80 text-slate-300'
                    }`}
                  >
                    {/* Category Icon Badge */}
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                      {getCategoryIcon(product.categoryName)}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/70 text-cyan-400 border border-cyan-800/50">
                          <HighlightMatch text={product.categoryName} query={query} />
                        </span>
                        {product.brand && (
                          <span className="text-[10px] font-mono text-slate-400">
                            {product.brand}
                          </span>
                        )}
                        {product.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {product.badge}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                        <HighlightMatch text={product.name} query={query} />
                      </h4>

                      {product.tagline && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          <HighlightMatch text={product.tagline} query={query} />
                        </p>
                      )}
                    </div>

                    {/* Price and Action */}
                    <div className="text-right shrink-0">
                      <div className="text-xs sm:text-sm font-bold font-mono text-white">
                        {formatINR(product.price)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        /{product.billingCycle || 'mo'}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : !isLoading ? (
              <div className="p-6 text-center space-y-2">
                <Shield className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">
                  No security solutions found matching "{query}"
                </p>
                <p className="text-xs text-slate-500">
                  Try searching for keywords like <span className="text-cyan-400">VAPT</span>, <span className="text-cyan-400">Cloud</span>, <span className="text-cyan-400">SOC</span>, or <span className="text-cyan-400">Compliance</span>.
                </p>
              </div>
            ) : null}
          </div>

          {/* Bottom Action Footer: View Full Results Page */}
          {suggestions.length > 0 && (
            <button
              onClick={handleSearchSubmit}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-slate-900 to-[#0c121e] hover:from-cyan-950/80 hover:to-slate-900 text-xs font-semibold text-cyan-300 border-t border-slate-800 flex items-center justify-between transition-colors cursor-pointer group"
            >
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-cyan-400" />
                View all results on dedicated Search Page
              </span>
              <div className="flex items-center gap-1 text-slate-400 group-hover:text-cyan-300 transition-colors">
                <span className="text-[10px] font-mono">Press Enter</span>
                <CornerDownLeft className="w-3 h-3" />
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Shield, 
  ShoppingBag, 
  CheckCircle2, 
  Check, 
  ArrowRight, 
  Layers, 
  Loader2,
  X,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { formatINR } from '../data/mockStoreData';
import { useStore } from '../context/StoreContext';

export default function SearchResultsPage({ 
  searchQuery = '', 
  onSelectProduct, 
  setCurrentPage 
}) {
  const { cart, addToCart } = useStore();

  const [query, setQuery] = useState(searchQuery);
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Sorting state
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('relevance');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Category list
  const categoryFilters = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'VAPT', label: 'VAPT & Ethical Hacking' },
    { id: 'Cloud Security', label: 'Cloud & Kubernetes' },
    { id: 'Continuous Monitoring', label: 'SOC & Telemetry' },
    { id: 'Compliance & Audit', label: 'ISO / DPDP Compliance' }
  ];

  // Keep internal state in sync if parent passed new query
  useEffect(() => {
    setQuery(searchQuery);
    setPage(1);
  }, [searchQuery]);

  // Fetch search results from backend API
  const fetchResults = async (pageNum = 1, append = false) => {
    if (pageNum === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams({
        q: query || '',
        page: pageNum.toString(),
        limit: '6',
        sort: sortBy
      });

      if (selectedCategory !== 'ALL') {
        params.append('category', selectedCategory);
      }

      const res = await fetch(`/api/products/search?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setProducts(prev => append ? [...prev, ...(data.products || [])] : (data.products || []));
        setTotalCount(data.total || 0);
        setHasMore(Boolean(data.hasMore));
        setPage(pageNum);
      } else {
        throw new Error(data.error || 'Failed to search catalog');
      }
    } catch (err) {
      console.error('Search page error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchResults(1, false);
  }, [query, selectedCategory, sortBy]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchResults(page + 1, true);
    }
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    // Update hash URL to preserve query
    window.location.hash = query.trim() ? `#search?q=${encodeURIComponent(query.trim())}` : '#search';
    setPage(1);
    fetchResults(1, false);
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900/90 via-[#0B0F19] to-cyan-950/40 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-1">
              <Search className="w-3.5 h-3.5" />
              <span>Cybersecurity Catalog Search Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {query ? (
                <>
                  Results for <span className="text-cyan-300">"{query}"</span>
                </>
              ) : (
                'Enterprise Threat Defense Solutions'
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {isLoading ? (
                'Querying MongoDB products database...'
              ) : (
                `Identified ${totalCount} active enterprise ${totalCount === 1 ? 'solution' : 'solutions'} matching your criteria.`
              )}
            </p>
          </div>

          {/* Quick Refine Search Form */}
          <form onSubmit={handleManualSearch} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Refine search query..."
                className="w-full pl-9 pr-8 py-2 bg-[#080B11] border border-slate-800 focus:border-cyan-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    window.location.hash = '#search';
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="py-2 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shrink-0 cursor-pointer shadow-md shadow-cyan-500/20"
            >
              Search
            </button>
          </form>
        </div>

        {/* Filter and Sort Toolbar */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {categoryFilters.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    active
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Sort Selection */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" /> Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#080B11] border border-slate-800 rounded-lg text-xs text-slate-200 py-1.5 px-3 focus:outline-none focus:border-cyan-500 font-medium"
            >
              <option value="relevance">Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Results Grid or Empty State */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-sm font-mono text-slate-400">Loading matching cybersecurity defenses...</p>
        </div>
      ) : products.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((prod) => {
              const inCart = cart.some(item => item.product.id === prod.id);

              return (
                <div
                  key={prod.id}
                  className="bg-[#0B0F19] border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 shadow-xl group hover:shadow-[0_0_30px_rgba(0,240,255,0.1)]"
                >
                  <div>
                    {/* Header Category and Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-cyan-950/70 text-cyan-400 border border-cyan-800/60 font-semibold uppercase">
                        {prod.categoryName}
                      </span>
                      {prod.badge && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {prod.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                      {prod.name}
                    </h3>
                    {prod.brand && (
                      <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
                        Brand: {prod.brand}
                      </span>
                    )}

                    {prod.tagline && (
                      <p className="text-xs text-cyan-400/80 mt-1 font-medium">{prod.tagline}</p>
                    )}

                    <p className="text-xs text-slate-400 mt-2.5 leading-relaxed line-clamp-3">
                      {prod.description}
                    </p>

                    {/* Price and Seat Inclusions */}
                    <div className="my-5 py-3 border-y border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-black text-white font-mono">{formatINR(prod.price)}</span>
                        <span className="text-xs text-slate-500 ml-1">/ {prod.billingCycle}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block font-mono">CAPACITY</span>
                        <span className="text-xs font-semibold text-slate-300">
                          {prod.maxSeats} Team Seats • {prod.assetsIncluded || 15} Assets
                        </span>
                      </div>
                    </div>

                    {/* Features Preview */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider">
                        Key Inclusions:
                      </span>
                      {prod.features?.slice(0, 3).map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <Check className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                          <span className="leading-tight truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2">
                    <button
                      onClick={() => onSelectProduct && onSelectProduct(prod)}
                      className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-800 transition-colors cursor-pointer"
                    >
                      View Specs
                    </button>

                    <button
                      onClick={() => addToCart(prod)}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        inCart
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                      }`}
                    >
                      {inCart ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>In Cart</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Pagination */}
          {hasMore && (
            <div className="pt-6 text-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="py-3 px-8 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all shadow-lg shadow-cyan-950/50 cursor-pointer disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>Loading more products...</span>
                  </>
                ) : (
                  <>
                    <span>Load More Security Solutions ({products.length} of {totalCount})</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-12 text-center space-y-4 max-w-2xl mx-auto shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Shield className="w-7 h-7 text-cyan-400/60" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            No active security solutions found
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
            We couldn't locate any products matching <span className="text-cyan-300 font-semibold">"{query}"</span> in {selectedCategory === 'ALL' ? 'the entire catalog' : selectedCategory}.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setQuery('');
                setSelectedCategory('ALL');
              }}
              className="py-2.5 px-5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Reset Filters & Show All
            </button>

            <button
              onClick={() => setCurrentPage && setCurrentPage('services')}
              className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs border border-slate-800 transition-colors cursor-pointer"
            >
              Browse Complete Store
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

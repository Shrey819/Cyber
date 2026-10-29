import React, { useState } from 'react';
import { 
  Shield, 
  Terminal, 
  Cloud, 
  Activity, 
  FileCheck, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  ShoppingBag, 
  Check, 
  Search,
  Lock,
  Building2,
  Users
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../data/mockStoreData';

export default function ServicesPage({ setCurrentPage }) {
  const { categories, products, addToCart, cart } = useStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedNotice, setAddedNotice] = useState(null);

  // Active products only
  const activeProducts = products.filter(p => !p.isHidden);

  const filteredProducts = activeProducts.filter(prod => {
    const matchesCategory = selectedCategoryId === 'ALL' || prod.categoryId === selectedCategoryId;
    const matchesSearch = 
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedNotice(`Added "${product.name}" to cart!`);
    setTimeout(() => setAddedNotice(null), 3000);
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Toast Notice */}
      {addedNotice && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-cyan-950/90 border border-cyan-500/50 rounded-xl text-cyan-200 text-xs flex items-center gap-3 shadow-2xl backdrop-blur-md animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <div className="font-semibold">{addedNotice}</div>
          <button
            onClick={() => setCurrentPage('checkout')}
            className="ml-2 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs"
          >
            Go to Cart ({cart.length})
          </button>
        </div>
      )}

      {/* Clear, Simple & Professional Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <Shield className="w-3.5 h-3.5" />
          Security Products & Managed Services
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Choose Security Tools for Your Company
        </h1>

        <p className="text-sm text-slate-400 leading-relaxed">
          Select the security services your business needs. When your organization purchases a service, your primary admin receives Manager access to assign tools and seats to your internal developers and employees.
        </p>

        {/* Floating Cart Pill if items exist */}
        {cart.length > 0 && (
          <div className="pt-2">
            <button
              onClick={() => setCurrentPage('checkout')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart ({cart.length} item{cart.length > 1 ? 's' : ''}) - Proceed to Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Category Pills & Search Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <button
            onClick={() => setSelectedCategoryId('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategoryId === 'ALL'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Products ({activeProducts.length})
          </button>
          {categories.filter(c => c.isActive).map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategoryId === cat.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#0D121F] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((prod) => {
          const inCart = cart.some(item => item.product.id === prod.id);

          return (
            <div
              key={prod.id}
              className="bg-[#0B0F19] border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between transition-all shadow-xl"
            >
              <div>
                {/* Header Category and Tag */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 font-semibold">
                    {prod.categoryName}
                  </span>
                  {prod.badge && (
                    <span className="px-2.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {prod.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight">{prod.name}</h3>
                {prod.tagline && <p className="text-xs text-cyan-400/80 mt-1">{prod.tagline}</p>}
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{prod.description}</p>

                {/* Price and Seat Inclusions */}
                <div className="my-5 py-3 border-y border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-black text-white font-mono">{formatINR(prod.price)}</span>
                    <span className="text-xs text-slate-500 ml-1">/ {prod.billingCycle}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">CAPACITY</span>
                    <span className="text-xs font-semibold text-slate-200">
                      {prod.maxSeats} Team Seats • {prod.assetsIncluded || 10} Assets
                    </span>
                  </div>
                </div>

                {/* What's Included */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider">
                    Features Included:
                  </span>
                  {prod.features?.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <Check className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                      <span className="leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  onClick={() => handleAddToCart(prod)}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    inCart
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/10'
                  }`}
                >
                  {inCart ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>In Cart (+ Add)</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    handleAddToCart(prod);
                    setCurrentPage('checkout');
                  }}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl"
                >
                  Buy Now
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { ShoppingBag, Search, ShieldCheck, Leaf } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Navbar({ cartCount, onOpenCart, searchQuery, setSearchQuery }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg sm:text-xl text-slate-800 shrink-0">
            <span className="p-2 bg-emerald-100/80 text-emerald-700 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-emerald-600 fill-emerald-600/20" />
            </span>
            <span className="tracking-tight">
              Hydro<span className="text-emerald-600">Fresh</span>
            </span>
          </Link>

          {/* Search Bar - Desktop & Tablet */}
          <div className="flex-1 max-w-md relative hidden sm:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari sayur segar (misal: Pakcoy, Selada)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-full focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenCart}
              className="relative p-2.5 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/80 rounded-full transition active:scale-95"
              aria-label="Buka Keranjang Belanja"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-emerald-600 text-white text-[10px] font-bold min-w-20px h-20px px-1 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            <Link
              href="/admin/login"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-200 px-3 py-2 rounded-xl hover:border-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50 transition active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="hidden xs:inline">Portal</span> Admin
            </Link>
          </div>
        </div>

        {/* Search Bar - Mobile View */}
        <div className="pb-3 pt-1 sm:hidden">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari sayur segar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-full focus:outline-none focus:border-emerald-500 focus:bg-white transition"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
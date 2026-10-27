'use client';

import { Product } from '@/lib/types';
import { ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden hover:shadow-md hover:border-emerald-200 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Kontainer Gambar & Badge Stok */}
        <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500'}
            alt={product.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500';
            }}
            className="w-full h-48 object-cover rounded-t-xl"
          />
          <div className="absolute top-3 right-3 flex gap-1">
            {isOutOfStock ? (
              <span className="bg-red-500/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                Stok Habis
              </span>
            ) : isLowStock ? (
              <span className="bg-amber-500/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                Sisa {product.stock} {product.unit}
              </span>
            ) : (
              <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                Tersedia
              </span>
            )}
          </div>
        </div>

        {/* Info Detail Produk */}
        <div className="p-4">
          <span className="text-[11px] font-semibold tracking-wider text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-md inline-block mb-1">
            Hidroponik Organik
          </span>
          <h3 className="font-bold text-slate-800 text-base mb-2 line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="text-emerald-700 font-black text-lg">
              Rp {product.price.toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ {product.unit}</span>
          </div>
        </div>
      </div>

      {/* Tombol Aksi */}
      <div className="p-4 pt-0">
        <button
          disabled={isOutOfStock}
          onClick={() => onSelect(product)}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            isOutOfStock
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] shadow-sm hover:shadow-emerald-600/20'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          {isOutOfStock ? 'Stok Habis' : 'Pilih / Beli'}
        </button>
      </div>
    </div>
  );
}
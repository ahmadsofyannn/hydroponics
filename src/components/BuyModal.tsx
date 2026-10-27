'use client';

import { useState } from 'react';
import { Product, CartItem } from '@/lib/types';
import { X, ShoppingCart, Zap, CheckCircle2, MessageCircle, Phone, Mail, MapPin, User } from 'lucide-react';

interface BuyModalProps {
  product?: Product | null;
  cart?: CartItem[] | null;
  onClose: () => void;
  onAddToCart?: (product: Product, quantity: number) => void;
  onBuyDirect?: (orderData: {
    customer_name: string;
    customer_phone: string;
    shipping_address: string;
    items: { product_id: number; name: string; price: number; quantity: number; unit?: string }[];
    total_amount: number;
  }) => void;
  clearCart?: () => void;
}

export default function BuyModal({
  product,
  cart,
  onClose,
  onAddToCart,
  onBuyDirect,
  clearCart,
}: BuyModalProps) {
  const isCartMode = Boolean(cart && cart.length > 0);
  
  const [mode, setMode] = useState<'options' | 'direct' | 'cart-checkout'>(isCartMode ? 'cart-checkout' : 'options');
  const [quantity, setQuantity] = useState<number>(1);
  
  const [name, setName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  if (!product && !isCartMode) return null;

  const cleanWaDigits = whatsapp.replace(/\D/g, '');
  const cleanPhoneDigits = phone.replace(/\D/g, '');

  const isNameValid = name.trim().length > 0;
  const isAddressValid = address.trim().length > 0;

  const isWaValidFilled = cleanWaDigits.length >= 10 && cleanWaDigits.length <= 13;
  const isPhoneValidFilled = cleanPhoneDigits.length >= 10 && cleanPhoneDigits.length <= 13;
  const isEmailValidFilled = email.includes('@') && email.trim().length > 3;

  const hasAtLeastOneContact = 
    (whatsapp.trim() !== '' && isWaValidFilled) || 
    (phone.trim() !== '' && isPhoneValidFilled) || 
    (email.trim() !== '' && isEmailValidFilled);

  const isFormValid = isNameValid && isAddressValid && hasAtLeastOneContact;

  const getFormattedContact = () => {
    let contactInfo = '';
    if (whatsapp.trim()) {
      const finalWa = cleanWaDigits.startsWith('0') ? '62' + cleanWaDigits.slice(1) : cleanWaDigits;
      contactInfo = `WA: https://wa.me/${finalWa}`;
    }
    if (phone.trim()) {
      contactInfo += ` | Telp: ${phone.trim()}`;
    }
    if (email.trim()) {
      contactInfo += ` | Email: ${email.trim()}`;
    }
    return contactInfo || '-';
  };

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !product) return;
    setLoading(true);

    const formattedContact = getFormattedContact();
    const totalAmount = product.price * quantity;

    if (onBuyDirect) {
      onBuyDirect({
        customer_name: name,
        customer_phone: formattedContact,
        shipping_address: address,
        items: [{ product_id: product.id, name: product.name, price: product.price, quantity, unit: product.unit }],
        total_amount: totalAmount,
      });
    }

    if (clearCart) clearCart();
    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-300 animate-in fade-in zoom-in duration-200 my-8">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-100">
          <h3 className="font-extrabold text-slate-900 text-base tracking-tight flex items-center gap-2">
            Pilih Metode Pembelian
          </h3>
          <button onClick={onClose} className="text-slate-600 hover:text-black p-1 rounded-full transition">
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
            <CheckCircle2 className="w-16 h-16 text-emerald-700 animate-bounce" />
            <h4 className="font-bold text-xl text-slate-900">Pesanan Berhasil Dikirim!</h4>
            <p className="text-slate-700 text-sm font-medium">Data pesanan dan kontak Anda telah tercatat di sistem.</p>
          </div>
        ) : mode === 'options' && product ? (
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover rounded-lg shadow-sm border border-slate-200" />
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">{product.name}</h4>
                <p className="text-emerald-800 font-black text-sm">
                  Rp {product.price.toLocaleString('id-ID')} <span className="text-xs text-slate-700 font-semibold">/ {product.unit}</span>
                </p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">Stok tersedia: {product.stock} {product.unit}</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">Jumlah Pembelian</label>
              <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-xl border border-slate-300">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg bg-white border border-slate-300 flex items-center justify-center font-bold text-slate-900 hover:bg-slate-200 transition shadow-sm"
                >
                  -
                </button>
                <span className="flex-1 text-center font-black text-lg text-slate-900">{quantity} {product.unit}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 rounded-lg bg-white border border-slate-300 flex items-center justify-center font-bold text-slate-900 hover:bg-slate-200 transition shadow-sm"
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setMode('direct')}
                className="w-full py-3 bg-emerald-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-900 transition shadow-md active:scale-[0.99]"
              >
                <Zap className="w-4 h-4 fill-white" /> Beli Sekarang (Isi Form)
              </button>
              {onAddToCart && (
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(product, quantity);
                    onClose();
                  }}
                  className="w-full py-3 bg-white text-emerald-800 border-2 border-emerald-800 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-50 transition shadow-sm active:scale-[0.99]"
                >
                  <ShoppingCart className="w-4 h-4" /> Masukkan ke Keranjang
                </button>
              )}
            </div>
          </div>
        ) : product ? (
          <form onSubmit={handleDirectSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-black text-slate-900 text-sm uppercase tracking-wider">Formulir Identitas & Pengiriman</h4>
              <button type="button" onClick={() => setMode('options')} className="text-xs text-emerald-800 underline font-extrabold hover:text-emerald-950">
                Kembali
              </button>
            </div>

            <div className="bg-slate-100 border border-slate-300 p-3 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-600 uppercase">Produk Dipilih</p>
                <p className="text-xs font-black text-slate-900">{product.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Qty:</span>
                <div className="flex items-center border border-slate-400 rounded-lg bg-white px-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-2 py-0.5 text-xs font-black text-slate-900 hover:bg-slate-200 rounded"
                  >
                    -
                  </button>
                  <span className="px-2 text-xs font-black text-slate-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-2 py-0.5 text-xs font-black text-slate-900 hover:bg-slate-200 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Nama Lengkap <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap Anda"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-700 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Alamat Lengkap Pengiriman <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota..."
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-700 transition resize-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                No. WhatsApp Aktif <span className="text-red-600">(Wajib isi salah satu kontak)</span>
              </label>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 bg-slate-100 border border-slate-300 px-3 py-2.5 rounded-xl text-xs font-extrabold text-slate-800">
                  <MessageCircle className="w-4 h-4 text-emerald-700" /> +62
                </div>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="81234567890 (10-13 digit)"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-700 transition"
                />
              </div>
              <span className="text-[11px] font-semibold text-slate-500 mt-1 block">10-13 digit tanpa angka 0 di depan</span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-900">No. Telepon</label>
                <span className="text-[11px] font-medium text-slate-500">10-13 digit (Opsional)</span>
              </div>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="021xxxxxx / 10-13 digit"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-700 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-900">Alamat Email</label>
                <span className="text-[11px] font-medium text-slate-500">Wajib &apos;@&apos;</span>
              </div>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh@email.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-700 transition"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="w-full py-3.5 bg-emerald-800 text-white rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-emerald-900 transition shadow-md disabled:bg-slate-300 disabled:text-slate-500 active:scale-[0.99]"
              >
                <Zap className="w-4 h-4 fill-white" /> Konfirmasi & Pesan Sekarang <span className="text-lg leading-none">&rarr;</span>
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}
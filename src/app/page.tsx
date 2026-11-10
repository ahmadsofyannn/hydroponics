"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Product, CartItem } from "@/lib/types";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import BuyModal from "@/components/BuyModal";
import {
  ShoppingBag,
  X,
  CheckCircle2,
  ArrowRight,
  User,
  MapPin,
  MessageCircle,
  Trash2,
  Leaf,
} from "lucide-react";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartCheckout, setIsCartCheckout] = useState(false);

  // State Form Checkout Keranjang
  const [cartName, setCartName] = useState("");
  const [cartAddress, setCartAddress] = useState("");
  const [cartWhatsapp, setCartWhatsapp] = useState("");
  const [cartSuccess, setCartSuccess] = useState(false);
  const [isSubmittingCart, setIsSubmittingCart] = useState(false);

  const refreshProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });
    if (data) setProducts(data);
  };

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: true });
      if (data) setProducts(data);
    }
    loadData();
  }, []);

  const handleAddToCart = (product: Product, quantity: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const handleUpdateCartQuantity = (productId: number, delta: number) => {
    setCart(
      (prev) =>
        prev
          .map((item) => {
            if (item.id === productId) {
              const newQty = item.quantity + delta;
              return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
          })
          .filter(Boolean) as CartItem[],
    );
  };

  const handleRemoveCartItem = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleBuyDirect = async (orderData: {
    customer_name: string;
    customer_phone: string;
    shipping_address: string;
    items: {
      product_id: number;
      name: string;
      price: number;
      quantity: number;
    }[];
    total_amount: number;
  }) => {
    await supabase.from("orders").insert([orderData]);

    for (const item of orderData.items) {
      const currentProduct = products.find((p) => p.id === item.product_id);
      if (currentProduct) {
        const newStock = Math.max(0, currentProduct.stock - item.quantity);
        await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", item.product_id);
      }
    }
    refreshProducts();
  };

  const handleCartCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmittingCart(true);

    let formattedContact = "";
    const cleanWaDigits = cartWhatsapp.replace(/\D/g, "");
    if (cartWhatsapp.trim()) {
      const finalWa = cleanWaDigits.startsWith("0")
        ? "62" + cleanWaDigits.slice(1)
        : cleanWaDigits;
      formattedContact = `WA: https://wa.me/${finalWa}`;
    }

    const orderPayload = {
      customer_name: cartName,
      customer_phone: formattedContact || "-",
      shipping_address: cartAddress,
      items: cart.map((item) => ({
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total_amount: cartTotal,
    };

    await supabase.from("orders").insert([orderPayload]);

    for (const item of cart) {
      const currentProduct = products.find((p) => p.id === item.id);
      if (currentProduct) {
        const newStock = Math.max(0, currentProduct.stock - item.quantity);
        await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", item.id);
      }
    }

    setIsSubmittingCart(false);
    setCartSuccess(true);
    setTimeout(() => {
      setCart([]);
      setCartSuccess(false);
      setIsCartCheckout(false);
      setIsCartOpen(false);
      setCartName("");
      setCartAddress("");
      setCartWhatsapp("");
      refreshProducts();
    }, 2000);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const cleanWa = cartWhatsapp.replace(/\D/g, "");
  const isCartFormValid =
    cartName.trim().length > 0 &&
    cartAddress.trim().length > 0 &&
    cartWhatsapp.trim() !== "" &&
    cleanWa.length >= 10 &&
    cleanWa.length <= 13;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">
      <div>
        <Navbar
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          onOpenCart={() => setIsCartOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

       {/* Hero Section dengan Background Foto Lokal */}
{/* Hero Section Tajam Tanpa Blur */}
<header className="relative w-full h-80 sm:h-96 flex items-center justify-center text-center overflow-hidden shadow-md">
  {/* Gambar Background */}
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img
    src="/images/selada.png"
    alt="Kebun Selada Hydrofarm"
    className="absolute inset-0 w-full h-full object-cover"
  />

  {/* Overlay Gelap Transparan Tanpa Blur */}
  <div className="absolute inset-0 bg-black/40" />

  {/* Teks Tagline */}
  <div className="relative z-10 max-w-3xl px-4">
    <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg">
      Selada Segar, Renyah, & Langsung Panen dari Kebun Lokal
    </h1>
  </div>
</header>

        {/* Daftar Harga Sayuran */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-8 pb-3 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>🌱</span> Daftar Harga Sayuran
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Menampilkan {filteredProducts.length} produk
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-md mx-auto shadow-sm">
              <p className="text-slate-500 text-sm">
                Sayuran yang Anda cari belum tersedia.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={(prod) => setSelectedProduct(prod)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Footer Sesuai Data Mitra Baru */}
      <footer className="bg-slate-900 text-slate-200 pt-12 pb-8 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2.5 font-bold text-xl text-white mb-3">
              <span className="p-2 bg-emerald-800/80 text-emerald-300 rounded-xl flex items-center justify-center">
                <Leaf className="w-5 h-5" />
              </span>
              <span>
                Hydro<span className="text-emerald-400">farm</span>
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider mb-3">
                Kontak Kami
              </h3>
              <a
                href="https://wa.me/6282139423518"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300 bg-emerald-950 hover:bg-emerald-900 px-4 py-2.5 rounded-xl border border-emerald-800 transition shadow-sm"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>WhatsApp: +62 821-3942-3518</span>
              </a>
            </div>

            <div>
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider mb-2">
                Alamat Kebun
              </h3>
              <div className="flex items-start gap-2 text-xs text-slate-300">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  Perumahan Queen Gardenia, Blok Aster No.G-11, Karanganyar, Tegal
                  Besar, Kec. Kaliwates, Kabupaten Jember, Jawa Timur 68132
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Hydrofarm. All rights reserved.
        </div>
      </footer>

      {/* Modal Pembelian Langsung */}
      <BuyModal
        key={selectedProduct ? selectedProduct.id : "closed"}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyDirect={handleBuyDirect}
      />

      {/* Drawer Keranjang Belanja */}
      {isCartOpen && (
        <aside
          aria-label="Keranjang Belanja"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end"
        >
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-800" />
                  {isCartCheckout
                    ? "Formulir Identitas & Pengiriman"
                    : "Keranjang Belanja"}
                </h3>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCartCheckout(false);
                  }}
                  className="text-slate-600 hover:text-black p-1 rounded-full transition"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {cartSuccess ? (
                <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
                  <CheckCircle2 className="w-16 h-16 text-emerald-700 animate-bounce" />
                  <h4 className="font-bold text-xl text-slate-900">
                    Pesanan Berhasil!
                  </h4>
                  <p className="text-slate-700 text-sm font-medium">
                    Data pesanan Anda telah tersimpan di sistem.
                  </p>
                </div>
              ) : isCartCheckout ? (
                <form
                  id="cart-checkout-form"
                  onSubmit={handleCartCheckoutSubmit}
                  className="py-4 space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Nama Lengkap <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={cartName}
                        onChange={(e) => setCartName(e.target.value)}
                        placeholder="Masukkan nama lengkap Anda"
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-700 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Alamat Lengkap Pengiriman{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <textarea
                        required
                        rows={2}
                        value={cartAddress}
                        onChange={(e) => setCartAddress(e.target.value)}
                        placeholder="Nama jalan, nomor rumah, RT/RW, kecamatan, kota..."
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-700 transition resize-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      No. WhatsApp Aktif <span className="text-red-600">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1 bg-slate-100 border border-slate-300 px-3 py-2.5 rounded-xl text-xs font-extrabold text-slate-800">
                        <MessageCircle className="w-4 h-4 text-emerald-700" />{" "}
                        +62
                      </div>
                      <input
                        type="tel"
                        value={cartWhatsapp}
                        onChange={(e) => setCartWhatsapp(e.target.value)}
                        placeholder="82139423518"
                        className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-700 transition"
                      />
                    </div>
                  </div>
                </form>
              ) : (
                <div className="divide-y divide-slate-200 overflow-y-auto max-h-[50vh] my-4">
                  {cart.length === 0 ? (
                    <p className="text-center text-slate-500 font-medium py-12 text-sm">
                      Keranjang Anda masih kosong.
                    </p>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="py-4 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm">
                              {item.name}
                            </h4>
                            <p className="text-xs text-slate-500">
                              Rp {item.price.toLocaleString("id-ID")} /{" "}
                              {item.unit}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveCartItem(item.id)}
                            className="text-red-500 hover:text-red-700 p-1 transition"
                            title="Hapus item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <div className="flex items-center border border-slate-300 rounded-lg bg-slate-50 px-1">
                            <button
                              onClick={() =>
                                handleUpdateCartQuantity(item.id, -1)
                              }
                              className="px-2.5 py-1 text-xs font-black text-slate-700 hover:bg-slate-200 rounded"
                            >
                              -
                            </button>
                            <span className="px-3 text-xs font-bold text-slate-900">
                              {item.quantity} {item.unit}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateCartQuantity(item.id, 1)
                              }
                              className="px-2.5 py-1 text-xs font-black text-slate-700 hover:bg-slate-200 rounded"
                            >
                              +
                            </button>
                          </div>
                          <p className="font-black text-emerald-800 text-sm">
                            Rp{" "}
                            {(item.price * item.quantity).toLocaleString(
                              "id-ID",
                            )}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {!cartSuccess && (
              <div className="border-t border-slate-200 pt-4 mt-auto">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-black text-slate-900 text-sm">
                    Total Pembayaran:
                  </span>
                  <span className="font-black text-xl text-emerald-800">
                    Rp {cartTotal.toLocaleString("id-ID")}
                  </span>
                </div>

                {isCartCheckout ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCartCheckout(false)}
                      className="w-1/3 py-3 border border-slate-300 text-slate-800 rounded-xl font-bold text-sm hover:bg-slate-100 transition shadow-xs"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      form="cart-checkout-form"
                      disabled={isSubmittingCart || !isCartFormValid}
                      className="w-2/3 py-3 bg-emerald-800 text-white rounded-xl font-bold text-sm hover:bg-emerald-900 transition shadow-md disabled:bg-slate-300 disabled:text-slate-500"
                    >
                      {isSubmittingCart ? "Memproses..." : "Kirim Pesanan"}
                    </button>
                  </div>
                ) : (
                  <button
                    disabled={cart.length === 0}
                    onClick={() => setIsCartCheckout(true)}
                    className="w-full py-3 bg-emerald-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-900 transition shadow-md disabled:bg-slate-300 disabled:text-slate-500"
                  >
                    <span>Lanjut ke Formulir Checkout</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                )}
              </div>
            )}
          </div>
        </aside>
      )}
    </main>
  );
}
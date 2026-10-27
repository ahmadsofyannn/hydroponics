'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Order, Product } from '@/lib/types';
import { Package, ClipboardList, LogOut, Plus, Calendar, Users, UserPlus, Trash2, ExternalLink } from 'lucide-react';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [adminsList, setAdminsList] = useState<{ id: number; email: string }[]>([]);
  
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'admins'>('orders');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [manualMonthInput, setManualMonthInput] = useState<string>('');

  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newUnit, setNewUnit] = useState('pack');
  
  const [imageMode, setImageMode] = useState<'upload' | 'gdrive'>('upload');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [gdriveUrl, setGdriveUrl] = useState('');
  
  const [isAdding, setIsAdding] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);

  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');

  const router = useRouter();

  const refreshDashboardData = async () => {
    const { data: orderData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    const { data: productData } = await supabase.from('products').select('*').order('id', { ascending: true });
    const { data: adminData } = await supabase.from('admins').select('id, email').order('id', { ascending: true });
    
    if (orderData) setOrders(orderData);
    if (productData) setProducts(productData);
    if (adminData) setAdminsList(adminData);
  };

  useEffect(() => {
    const isAuth = localStorage.getItem('isAdminLoggedIn');
    if (!isAuth) {
      router.push('/admin/login');
      return;
    }

    async function loadInitialData() {
      const { data: orderData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      const { data: productData } = await supabase.from('products').select('*').order('id', { ascending: true });
      const { data: adminData } = await supabase.from('admins').select('id, email').order('id', { ascending: true });
      
      if (orderData) setOrders(orderData);
      if (productData) setProducts(productData);
      if (adminData) setAdminsList(adminData);
    }

    loadInitialData();
  }, [router]);

  const updateOrderStatus = async (orderId: number, newStatus: Order['status']) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    refreshDashboardData();
  };

  const updateStock = async (productId: number, newStock: number) => {
    await supabase.from('products').update({ stock: newStock }).eq('id', productId);
    refreshDashboardData();
  };

  const handleDeleteProduct = async (productId: number, productName: string) => {
    if (confirm(`Yakin ingin menghapus produk "${productName}" dari katalog?`)) {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) {
        alert('Gagal menghapus produk: ' + error.message);
      } else {
        alert('Produk berhasil dihapus!');
        refreshDashboardData();
      }
    }
  };

  const formatGoogleDriveUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://lh3.googleusercontent.com/d/${match[1]}`;
      }
    }
    return url;
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice || !newStock) return;

    setLoadingUpload(true);
    let finalImageUrl = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80';

    try {
      if (imageMode === 'upload' && imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-image')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('product-image')
          .getPublicUrl(filePath);

        finalImageUrl = urlData.publicUrl;
      } else if (imageMode === 'gdrive' && gdriveUrl.trim()) {
        finalImageUrl = formatGoogleDriveUrl(gdriveUrl.trim());
      }

      const { error: insertError } = await supabase.from('products').insert([
        {
          name: newName,
          price: Number(newPrice),
          stock: Number(newStock),
          unit: newUnit,
          image_url: finalImageUrl,
        },
      ]);

      if (insertError) throw insertError;

      setNewName('');
      setNewPrice('');
      setNewStock('');
      setImageFile(null);
      setGdriveUrl('');
      setIsAdding(false);
      refreshDashboardData();
      alert('Jenis sayuran baru berhasil ditambahkan!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan tidak dikenal';
      alert('Terjadi kesalahan saat menyimpan produk: ' + errorMessage);
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail || !newAdminPassword) return;

    const { error } = await supabase.from('admins').insert([
      { email: newAdminEmail, password: newAdminPassword }
    ]);

    if (error) {
      alert('Gagal menambah akun admin: ' + error.message);
    } else {
      alert('Akun admin baru berhasil ditambahkan ke database!');
      setNewAdminEmail('');
      setNewAdminPassword('');
      refreshDashboardData();
    }
  };

  const handleDeleteAdmin = async (id: number) => {
    if (adminsList.length <= 1) {
      alert('Minimal harus ada 1 akun admin yang tersisa!');
      return;
    }
    if (confirm('Yakin ingin menghapus akses akun admin ini?')) {
      const { error } = await supabase.from('admins').delete().eq('id', id);
      if (error) {
        alert('Gagal menghapus admin: ' + error.message);
      } else {
        refreshDashboardData();
      }
    }
  };

  const existingMonths = Array.from(
    new Set(
      orders
        .map((o) => (o.created_at ? o.created_at.slice(0, 7) : ''))
        .filter(Boolean)
    )
  );

  const availableMonths = Array.from(
    new Set([...existingMonths, manualMonthInput].filter(Boolean))
  ).sort().reverse();

  const filteredOrders = orders.filter((order) => {
    if (selectedMonth === 'all') return true;
    const orderMonth = order.created_at ? order.created_at.slice(0, 7) : ''; 
    return orderMonth === selectedMonth;
  });

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <nav className="bg-white border-b border-slate-300 px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
          <span>🌱</span> Admin Dashboard - HydroFresh
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              localStorage.removeItem('isAdminLoggedIn');
              localStorage.removeItem('adminEmail');
              router.push('/admin/login');
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-red-700 hover:bg-red-50 px-3.5 py-2 rounded-xl transition border border-red-200"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <h2 className="font-extrabold text-2xl text-slate-900">Ringkasan Statistik & Laporan</h2>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-300 shadow-sm">
              <span className="text-xs font-bold text-slate-700">Tambah Bulan:</span>
              <input
                type="month"
                value={manualMonthInput || ''}
                onChange={(e) => {
                  setManualMonthInput(e.target.value);
                  if (e.target.value) setSelectedMonth(e.target.value);
                }}
                className="text-xs font-extrabold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-300 shadow-sm">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold text-slate-700">Filter Bulan:</span>
              <select
                value={selectedMonth || 'all'}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-xs font-extrabold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Bulan (Keseluruhan)</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {new Date(m + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-300 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase">Total Pesanan Masuk</p>
              <h3 className="text-2xl font-black text-slate-900">{filteredOrders.length} Pesanan</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-300 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase">Estimasi Total Pendapatan</p>
              <h3 className="text-2xl font-black text-emerald-800">Rp {totalRevenue.toLocaleString('id-ID')}</h3>
            </div>
          </div>
        </section>

        <nav aria-label="Tab Navigasi Dashboard" className="flex flex-wrap gap-3 mb-6 border-b border-slate-300 pb-3">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-sm transition shadow-sm ${
              activeTab === 'orders' ? 'bg-emerald-800 text-white' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            Manajemen Pesanan
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-sm transition shadow-sm ${
              activeTab === 'inventory' ? 'bg-emerald-800 text-white' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            Kontrol Stok & Produk
          </button>
          <button
            onClick={() => setActiveTab('admins')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-sm transition shadow-sm ${
              activeTab === 'admins' ? 'bg-emerald-800 text-white' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            Manajemen Akun Admin
          </button>
        </nav>

        {activeTab === 'orders' ? (
          <section className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-300 font-extrabold text-slate-900 bg-slate-50 flex justify-between items-center">
              <span>Daftar Pesanan Pelanggan {selectedMonth === 'all' ? '(Keseluruhan)' : `(${new Date(selectedMonth + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })})`}</span>
              <span className="text-xs font-semibold text-slate-500">Menampilkan {filteredOrders.length} pesanan</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-900 border-b border-slate-300 font-black">
                  <tr>
                    <th className="p-4">Waktu & Pemesan</th>
                    <th className="p-4">Alamat Pengiriman</th>
                    <th className="p-4">Detail Items</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-600 font-semibold">Belum ada pesanan pada periode ini.</td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const isWaLink = order.customer_phone.startsWith('http');
                      const waHref = isWaLink 
                        ? order.customer_phone 
                        : `https://wa.me/${order.customer_phone.replace(/\D/g, '').replace(/^0/, '62')}`;

                      return (
                        <tr key={order.id} className="hover:bg-slate-50 transition">
                          <td className="p-4 align-top">
                            <p className="font-extrabold text-slate-900 text-base">{order.customer_name}</p>
                            <p className="text-xs font-semibold text-slate-600 mb-1.5">
                              {order.created_at ? new Date(order.created_at).toLocaleString('id-ID') : '-'}
                            </p>
                            <a
                              href={waHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg border border-emerald-300 transition shadow-sm"
                            >
                              <span>Chat WhatsApp</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </td>
                          <td className="p-4 align-top text-xs font-semibold text-slate-900 max-w-xs">{order.shipping_address}</td>
                          <td className="p-4 align-top text-xs">
                            {Array.isArray(order.items) && order.items.map((item, idx) => (
                              <div key={idx} className="text-slate-900 font-bold mb-0.5">
                                • {item.name} ({item.quantity}x)
                              </div>
                            ))}
                          </td>
                          <td className="p-4 align-top font-black text-emerald-800 text-base">
                            Rp {Number(order.total_amount).toLocaleString('id-ID')}
                          </td>
                          <td className="p-4 align-top">
                            <select
                              value={order.status || 'Belum'}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                              className="px-3.5 py-2 text-xs bg-white border border-slate-400 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-emerald-700 shadow-sm cursor-pointer"
                            >
                              <option value="Belum">Belum</option>
                              <option value="Diproses">Diproses</option>
                              <option value="Dikirim">Dikirim</option>
                              <option value="Selesai">Selesai</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ) : activeTab === 'inventory' ? (
          <section className="space-y-6">
            <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-300 shadow-sm">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Daftar Produk Sayuran</h3>
                <p className="text-xs font-semibold text-slate-600">Kelola stok atau tambahkan varian sayuran baru.</p>
              </div>
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-800 text-white text-xs font-bold rounded-xl hover:bg-emerald-900 transition shadow-sm"
              >
                <Plus className="w-4 h-4" /> {isAdding ? 'Tutup Form' : 'Tambah Jenis Sayuran'}
              </button>
            </div>

            {isAdding && (
              <form onSubmit={handleAddProduct} className="bg-white p-6 rounded-2xl border border-slate-300 shadow-md space-y-4 animate-in fade-in duration-200">
                <h3 className="font-black text-slate-900 text-sm border-b border-slate-200 pb-2 uppercase">Form Tambah Sayuran Baru</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">Nama Sayuran</label>
                    <input
                      type="text"
                      required
                      value={newName || ''}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Contoh: Selada Romaine"
                      className="w-full px-3.5 py-2 text-sm font-semibold border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-700 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">Harga (Rp)</label>
                    <input
                      type="number"
                      required
                      value={newPrice || ''}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="Contoh: 15000"
                      className="w-full px-3.5 py-2 text-sm font-semibold border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-700 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">Stok Awal</label>
                    <input
                      type="number"
                      required
                      value={newStock || ''}
                      onChange={(e) => setNewStock(e.target.value)}
                      placeholder="Contoh: 20"
                      className="w-full px-3.5 py-2 text-sm font-semibold border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-700 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">Satuan</label>
                    <select
                      value={newUnit || 'pack'}
                      onChange={(e) => setNewUnit(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm font-semibold border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-700 bg-white text-slate-900 cursor-pointer"
                    >
                      <option value="pack">pack</option>
                      <option value="ikat">ikat</option>
                      <option value="kg">kg</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 pt-2">
                    <label className="block text-xs font-bold text-slate-900 mb-2">Pilih Sumber Gambar Produk</label>
                    <div className="flex gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setImageMode('upload')}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                          imageMode === 'upload'
                            ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        📁 Upload dari Perangkat
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageMode('gdrive')}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                          imageMode === 'gdrive'
                            ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        🔗 Link Google Drive
                      </button>
                    </div>

                    <div className={imageMode === 'upload' ? 'block' : 'hidden'}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setImageFile(e.target.files[0]);
                          }
                        }}
                        className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 border border-slate-300 rounded-xl cursor-pointer"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">Format: JPG, PNG, WEBP</span>
                    </div>

                    <div className={imageMode === 'gdrive' ? 'block' : 'hidden'}>
                      <input
                        type="url"
                        value={gdriveUrl || ''}
                        onChange={(e) => setGdriveUrl(e.target.value)}
                        placeholder="Tempel link share Google Drive di sini..."
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-700 text-slate-900"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        Pastikan akses Google Drive diatur ke <b>&quot;Anyone with the link&quot;</b> (Publik).
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingUpload}
                  className="w-full py-3 bg-emerald-800 text-white rounded-xl font-extrabold text-sm hover:bg-emerald-900 transition shadow-md disabled:bg-slate-300"
                >
                  {loadingUpload ? 'Mengunggah & Menyimpan...' : 'Simpan Sayuran Baru'}
                </button>
              </form>
            )}

            <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-300 font-extrabold text-slate-900 bg-slate-50">Manajemen Stok & Harga Sayuran</div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-900 border-b border-slate-300 font-black">
                    <tr>
                      <th className="p-4">Nama Sayuran</th>
                      <th className="p-4">Harga</th>
                      <th className="p-4">Stok Saat Ini</th>
                      <th className="p-4">Aksi (Update Stok & Hapus)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-extrabold text-slate-900">{product.name}</td>
                        <td className="p-4 text-emerald-800 font-black">Rp {product.price.toLocaleString('id-ID')} / {product.unit}</td>
                        <td className="p-4 font-bold">
                          <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${product.stock > 0 ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-red-100 text-red-900 border border-red-300'}`}>
                            {product.stock} {product.unit}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              defaultValue={product.stock}
                              id={`stock-${product.id}`}
                              className="w-20 px-3 py-2 text-xs font-bold border border-slate-400 rounded-xl focus:outline-none focus:border-emerald-700 text-slate-900"
                            />
                            <button
                              onClick={() => {
                                const inputEl = document.getElementById(`stock-${product.id}`) as HTMLInputElement;
                                if (inputEl) {
                                  updateStock(product.id, Number(inputEl.value));
                                }
                              }}
                              className="px-3.5 py-2 bg-emerald-800 text-white text-xs font-bold rounded-xl hover:bg-emerald-900 transition shadow-sm"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              className="p-2 bg-red-600 text-white hover:bg-red-700 rounded-xl transition shadow-sm"
                              title="Hapus Produk"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : (
          <section className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-300 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Tambah Akun Admin Baru</h3>
                  <p className="text-xs font-semibold text-slate-600">Buat kredensial login baru untuk admin lain agar dapat mengakses dashboard.</p>
                </div>
              </div>

              <form onSubmit={handleAddAdmin} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">Email Admin Baru</label>
                  <input
                    type="email"
                    required
                    value={newAdminEmail || ''}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="adminbaru@hidroponik.com"
                    className="w-full px-3.5 py-2 text-sm font-semibold border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-700 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={newAdminPassword || ''}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 text-sm font-semibold border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-700 text-slate-900"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 bg-emerald-800 text-white rounded-xl font-extrabold text-sm hover:bg-emerald-900 transition shadow-md"
                >
                  Tambah Akun Admin
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-300 font-extrabold text-slate-900 bg-slate-50 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-800" /> Daftar Akun Admin Aktif
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-900 border-b border-slate-300 font-black">
                    <tr>
                      <th className="p-4">ID</th>
                      <th className="p-4">Email Admin</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {adminsList.map((adm) => (
                      <tr key={adm.id} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-bold text-slate-700">#{adm.id}</td>
                        <td className="p-4 font-black text-slate-900">{adm.email}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteAdmin(adm.id)}
                            className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition border border-red-200 shadow-sm"
                            title="Hapus Akses Admin"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
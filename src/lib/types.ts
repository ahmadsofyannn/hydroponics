export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  unit: string;
  image_url: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  items: OrderItem[];
  total_amount: number;
  status: 'Belum' | 'Diproses' | 'Dikirim' | 'Selesai';
  created_at: string;
}
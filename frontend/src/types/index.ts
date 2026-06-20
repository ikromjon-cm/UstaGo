export interface User {
  id: string;
  phone: string;
  full_name: string;
  avatar: string | null;
  role: 'customer' | 'master' | 'company' | 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'banned';
  bio: string;
  lang: 'uz' | 'ru' | 'en';
  is_phone_verified: boolean;
  is_identity_verified: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  title_uz: string;
  title_ru: string;
  title_en: string;
  icon: string | null;
  image: string | null;
  parent: string | null;
  children: Category[];
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  service_count: number;
}

export interface MasterProfile {
  id: string;
  user: User;
  categories: string[];
  rating: number;
  rating_count: number;
  completed_jobs: number;
  cancelled_jobs: number;
  response_time: number;
  completion_rate: number;
  is_online: boolean;
  is_available: boolean;
  is_verified: boolean;
  price_per_hour: number;
  min_order_price: number;
  max_distance: number;
  latitude: number;
  longitude: number;
  distance?: number;
  description: string;
  experience: number;
}

export interface Order {
  id: string;
  customer: string;
  customer_detail: User;
  master: string | null;
  master_detail: MasterProfile | null;
  category: string;
  title: string;
  description: string;
  status: 'pending' | 'looking_master' | 'offered' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  urgency: 'low' | 'normal' | 'high' | 'emergency';
  budget: number;
  final_price: number;
  latitude: number;
  longitude: number;
  address: string;
  preferred_date: string;
  preferred_time: string;
  is_paid: boolean;
  is_rated: boolean;
  offers: OrderOffer[];
  images: OrderImage[];
  created_at: string;
  updated_at: string;
}

export interface OrderOffer {
  id: string;
  order: string;
  master: string;
  master_detail: MasterProfile;
  price: number;
  description: string;
  estimated_duration: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  created_at: string;
}

export interface OrderImage {
  id: string;
  image: string;
  is_before: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  order: string;
  customer: string;
  master: string;
  amount: number;
  status: 'pending' | 'processing' | 'held' | 'completed' | 'refunded' | 'failed';
  method: 'payme' | 'click' | 'uzum' | 'visa' | 'mastercard' | 'cash' | 'wallet';
  created_at: string;
}

export interface Review {
  id: string;
  order: string;
  reviewer: string;
  reviewer_detail: User;
  target_user: string;
  rating: number;
  quality: number;
  speed: number;
  communication: number;
  professionalism: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  participants_detail: User[];
  order: string | null;
  last_message: Message | null;
  unread_count: number;
  updated_at: string;
}

export interface Message {
  id: string;
  room: string;
  sender: string;
  sender_detail: User;
  message_type: 'text' | 'image' | 'file' | 'voice' | 'location';
  content: string;
  file: string | null;
  image: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  type: 'order' | 'payment' | 'chat' | 'promo' | 'system';
  title: string;
  body: string;
  data: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export interface Wallet {
  id: string;
  balance: number;
  hold_balance: number;
  total_earned: number;
  total_withdrawn: number;
}

export interface Transaction {
  id: string;
  wallet: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'commission' | 'bonus';
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  net_amount: number;
  description: string;
  created_at: string;
}

export interface AIAnalysis {
  category: string;
  category_id: string;
  price_estimate: { min: number; max: number };
  confidence: number;
  nearby_masters: number;
  analysis_id: string;
}

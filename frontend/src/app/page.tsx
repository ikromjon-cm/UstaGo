"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import toast from "react-hot-toast";
import { categoriesAPI, mastersAPI, ordersAPI } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { MasterCard } from "@/components/ui/MasterCard";
import { OrderCard } from "@/components/ui/OrderCard";
import { SearchBar } from "@/components/ui/SearchBar";
import { CardSkeleton } from "@/components/ui/Skeleton";
import {
  Shield,
  Zap,
  Star,
  Users,
  TrendingUp,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

interface Category {
  id: string; title_uz: string; icon: string | null; is_featured: boolean;
}

interface Master {
  id: string; user: { full_name: string; avatar: string | null }; rating: number; completed_jobs: number;
}

interface Order {
  id: string; title: string; status: string; budget: string; created_at: string;
}

const stats = [
  { icon: Users, value: "10K+", label: "Active Masters" },
  { icon: Star, value: "50K+", label: "Completed Orders" },
  { icon: Shield, value: "98%", label: "Satisfied Clients" },
  { icon: TrendingUp, value: "24/7", label: "Customer Support" },
];

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [masters, setMasters] = useState<Master[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [catRes, masRes] = await Promise.all([
          categoriesAPI.getFeatured(),
          mastersAPI.getNearby({ lat: 41.2995, lng: 69.2401, radius: 50 }),
        ]);
        setCategories(catRes.data);
        setMasters(masRes.data.results || masRes.data);
      } catch { toast.error("Yuklashda xatolik"); }
      if (isAuthenticated) {
        try {
          const ordRes = await ordersAPI.getMyOrders();
          setOrders(ordRes.data.results || ordRes.data);
        } catch { toast.error("Yuklashda xatolik"); }
      }
      setLoading(false);
    }
    load();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="page-container py-16 space-y-8">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="skeleton h-12 w-64 mx-auto animate-pulse" />
            <div className="skeleton h-6 w-96 mx-auto animate-pulse" />
            <div className="skeleton h-12 w-full max-w-md mx-auto animate-pulse rounded-[16px]" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <CardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 dark:from-gray-900 dark:via-primary-950 dark:to-gray-900">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
          <div className="absolute top-0 -left-40 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
          <div className="relative page-container py-20 md:py-32">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-8 backdrop-blur-sm border border-white/10 animate-fade-in">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Uzbekistan&apos;s #1 Service Marketplace</span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6 animate-slide-up">
                Find Trusted
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500"> Professionals </span>
                Near You
              </h1>
              <p className="text-lg md:text-xl text-blue-100/80 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                Connect with verified masters for home repairs, cleaning, electrical work, and more. Quality service, guaranteed.
              </p>
              <div className="max-w-xl mx-auto animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <SearchBar />
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-8 animate-slide-up" style={{ animationDelay: "0.3s" }}>
                {!isAuthenticated && (
                  <>
                    <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:shadow-lg hover:shadow-white/20 transition-all duration-200 hover:-translate-y-0.5">
                      Get Started Free
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link href="/register?role=master" className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200">
                      Become a Master
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="relative page-container pb-12 -mt-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {stats.map((stat, i) => (
                <div key={i} className="text-center p-4 md:p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300" style={{ animationDelay: `${0.4 + i * 0.1}s` }}>
                  <stat.icon className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-blue-100/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="page-container py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Popular Categories</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Find the right professional for your needs</p>
            </div>
            <Link href="/categories" className="hidden sm:inline-flex items-center gap-1 text-primary font-medium hover:text-primary-700 transition-colors">
              Browse All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
            {categories.map((cat, i) => (
              <div key={cat.id} style={{ animationDelay: `${i * 0.05}s` }}>
                <CategoryCard {...cat} />
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-b from-transparent via-primary-50/30 to-transparent dark:via-primary-950/20 py-16">
          <div className="page-container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Top Masters</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Highly rated professionals ready to help</p>
              </div>
              <Link href="/masters" className="hidden sm:inline-flex items-center gap-1 text-primary font-medium hover:text-primary-700 transition-colors">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {masters.slice(0, 6).map((master, i) => (
                <div key={master.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <MasterCard {...master} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {isAuthenticated && orders.length > 0 && (
          <section className="page-container py-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Recent Orders</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Track your active requests</p>
              </div>
              <Link href="/orders" className="hidden sm:inline-flex items-center gap-1 text-primary font-medium hover:text-primary-700 transition-colors">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {orders.slice(0, 3).map((order, i) => (
                <div key={order.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <OrderCard {...order} />
                </div>
              ))}
            </div>
          </section>
        )}

        {!isAuthenticated && (
          <section className="page-container py-20">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-700 dark:from-primary-900 dark:to-gray-900 p-8 md:p-16 text-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl" />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
                <p className="text-blue-100/80 text-lg mb-8 max-w-xl mx-auto">Join thousands of satisfied customers and professional masters across Uzbekistan.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-bold rounded-xl hover:shadow-lg hover:shadow-white/20 transition-all duration-200 hover:-translate-y-0.5 text-lg">
                    Create Account <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link href="/masters" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200 text-lg">
                    Browse Services
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

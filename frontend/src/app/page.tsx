"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { categoriesAPI, mastersAPI, ordersAPI } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { MasterCard } from "@/components/ui/MasterCard";
import { OrderCard } from "@/components/ui/OrderCard";
import { SearchBar } from "@/components/ui/SearchBar";

interface Category {
  id: string; title_uz: string; icon: string | null; is_featured: boolean;
}

interface Master {
  id: string; user: { full_name: string; avatar: string | null }; rating: number; completed_jobs: number;
}

interface Order {
  id: string; title: string; status: string; budget: string; created_at: string;
}

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
      } catch (e) { console.error(e); }
      if (isAuthenticated) {
        try {
          const ordRes = await ordersAPI.getMyOrders();
          setOrders(ordRes.data.results || ordRes.data);
        } catch (e) {}
      }
      setLoading(false);
    }
    load();
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="page-container pb-20">
        <section className="py-6">
          <SearchBar />
        </section>
        <section className="py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Categories</h2>
            <Link href="/categories" className="text-primary text-sm font-medium">View all</Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} {...cat} />
            ))}
          </div>
        </section>
        <section className="py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Nearby Masters</h2>
            <Link href="/masters" className="text-primary text-sm font-medium">View all</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {masters.slice(0, 6).map((master) => (
              <MasterCard key={master.id} {...master} />
            ))}
          </div>
        </section>
        {isAuthenticated && orders.length > 0 && (
          <section className="py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Recent Orders</h2>
              <Link href="/orders" className="text-primary text-sm font-medium">View all</Link>
            </div>
            <div className="space-y-3">
              {orders.slice(0, 3).map((order) => (
                <OrderCard key={order.id} {...order} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

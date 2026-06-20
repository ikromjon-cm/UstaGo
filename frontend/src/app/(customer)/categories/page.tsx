"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { categoriesAPI } from "@/lib/api";
import { Wrench, Zap, Hammer, PaintBucket, Droplets, Sofa, Tv, Smartphone, Search } from "lucide-react";

const iconMap: Record<string, any> = {
  santexnik: Droplets, elektrik: Zap, svarchik: Hammer, quruvchi: PaintBucket,
  konditsioner: Wrench, mebel: Sofa, tv: Tv, kompyuter: Smartphone,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    categoriesAPI.getAll().then(res => {
      setCategories(res.data.results || res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = categories.filter(c =>
    c.title_uz?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <Header />
      <main className="page-container py-6">
        <h1 className="text-2xl font-bold mb-4">All Services</h1>
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input className="input pl-12" placeholder="Search services..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-28" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filtered.map(cat => {
              const Icon = iconMap[cat.title_uz?.toLowerCase()] || Wrench;
              return (
                <Link key={cat.id} href={`/orders/create?category=${cat.id}`}
                  className="card-hover p-5 flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/30 rounded-[14px] flex items-center justify-center">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <span className="font-medium text-sm">{cat.title_uz}</span>
                  {cat.services_count > 0 && (
                    <span className="text-xs text-gray-400">{cat.services_count} services</span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

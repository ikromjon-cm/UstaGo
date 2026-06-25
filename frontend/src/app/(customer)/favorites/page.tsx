"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { MasterCard } from "@/components/ui/MasterCard";
import toast from "react-hot-toast";
import { mastersAPI } from "@/lib/api";
import { Heart } from "lucide-react";
import { ListSkeleton } from "@/components/ui/Skeleton";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mastersAPI.getFavorites().then(res => setFavorites(res.data.results || res.data)).catch(() => toast.error("Yuklashda xatolik"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="page-container py-6">
        <h1 className="text-2xl font-bold mb-6">Favorite Masters</h1>
        {loading ? (
          <ListSkeleton count={3} />
        ) : favorites.length === 0 ? (
          <div className="card p-12 text-center">
            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400">No favorites yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((fav: any) => (
              <MasterCard key={fav.id} {...fav.master_detail} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

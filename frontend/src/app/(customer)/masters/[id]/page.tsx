"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Star,
  CheckCircle,
  MessageCircle,
  Phone,
  ChevronLeft,
  Heart,
  Clock,
  Briefcase,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { mastersAPI, reviewsAPI, chatAPI } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import toast from "react-hot-toast";

export default function MasterDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [master, setMaster] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const [masterRes, reviewsRes, favoritesRes] = await Promise.all([
          mastersAPI.getById(id as string),
          reviewsAPI.getForMaster(id as string),
          isAuthenticated
            ? mastersAPI.getFavorites().catch(() => null)
            : Promise.resolve(null),
        ]);

        if (!mounted) return;

        const masterData = masterRes.data;
        setMaster(masterData);
        setReviews(reviewsRes.data.results || reviewsRes.data || []);

        if (favoritesRes) {
          const favorites =
            favoritesRes.data.results || favoritesRes.data || [];
          const existing = favorites.find(
            (fav: any) =>
              String(fav.master) === String(masterData.id) ||
              String(fav.master_detail?.id) === String(masterData.id),
          );
          setIsFavorite(Boolean(existing));
          setFavoriteId(existing?.id || null);
        } else {
          setIsFavorite(false);
          setFavoriteId(null);
        }
      } catch {
        if (mounted) toast.error("Yuklashda xatolik");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [id, isAuthenticated]);

  const handleChat = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    try {
      const res = await chatAPI.getOrCreate(master.user.id);
      router.push(`/chat/${res.data.id}`);
    } catch {
      toast.error("Error starting chat");
    }
  };

  const handleCall = () => {
    const phone = master?.user?.phone;
    if (!phone) {
      toast.error("Phone number is not available");
      return;
    }
    window.location.href = `tel:${phone}`;
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!master || favoriteLoading) return;

    setFavoriteLoading(true);
    try {
      if (isFavorite && favoriteId) {
        await mastersAPI.removeFavorite(favoriteId);
        setIsFavorite(false);
        setFavoriteId(null);
        toast.success("Removed from favorites");
      } else {
        const res = await mastersAPI.addFavorite(master.id);
        setIsFavorite(true);
        setFavoriteId(res.data?.id || null);
        toast.success("Added to favorites");
      }
    } catch {
      toast.error("Failed to update favorites");
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen">
        <Header />
        <main className="page-container py-6">
          <div className="skeleton h-96" />
        </main>
      </div>
    );
  if (!master)
    return (
      <div className="min-h-screen">
        <Header />
        <main className="page-container py-6">
          <p>Master not found</p>
        </main>
      </div>
    );

  return (
    <div className="min-h-screen">
      <Header />
      <main className="page-container py-6 max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 mb-4"
        >
          <ChevronLeft size={20} /> Back
        </button>

        <div className="card p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-[18px] bg-gradient-to-br from-primary to-primary-400 flex items-center justify-center text-white text-3xl font-bold">
              {master.user?.full_name?.charAt(0) || "U"}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{master.user?.full_name}</h1>
                {master.is_verified && (
                  <CheckCircle size={22} className="text-primary" />
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Star
                    size={16}
                    className="text-warning"
                    fill="currentColor"
                  />{" "}
                  {master.rating} ({master.rating_count})
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase size={16} /> {master.completed_jobs} jobs
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={16} /> {master.response_time || "<1"} min
                </span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleChat}
                  className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
                >
                  <MessageCircle size={16} /> Chat
                </button>
                <button
                  onClick={handleCall}
                  className="btn-secondary flex items-center gap-2 text-sm px-4 py-2"
                >
                  <Phone size={16} /> Call
                </button>
                <button
                  onClick={handleFavoriteToggle}
                  disabled={favoriteLoading}
                  className={`btn-ghost p-2 ${isFavorite ? "text-danger" : ""}`}
                  aria-label={
                    isFavorite ? "Remove from favorites" : "Add to favorites"
                  }
                >
                  <Heart
                    size={20}
                    fill={isFavorite ? "currentColor" : "none"}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {master.description && (
          <div className="card p-6 mb-4">
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {master.description}
            </p>
          </div>
        )}

        <div className="card p-6 mb-4">
          <h3 className="font-semibold mb-3">Portfolio</h3>
          {master.portfolio_items?.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {master.portfolio_items.map((item: any) => (
                <div
                  key={item.id}
                  className="aspect-square rounded-[12px] bg-gray-100 dark:bg-dark-50"
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No portfolio items yet</p>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Reviews ({reviews.length})</h3>
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-400">No reviews yet</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <div
                  key={review.id}
                  className="border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-dark-50 flex items-center justify-center text-xs font-bold">
                      {review.reviewer_detail?.full_name?.charAt(0) || "U"}
                    </div>
                    <span className="font-medium text-sm">
                      {review.reviewer_detail?.full_name}
                    </span>
                    <div className="flex items-center gap-0.5 ml-auto">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < review.rating ? "text-warning" : "text-gray-200"
                          }
                          fill={i < review.rating ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {review.comment}
                    </p>
                  )}
                  {review.response && (
                    <div className="mt-2 pl-3 border-l-2 border-primary/30 bg-primary-50/50 dark:bg-primary-900/10 rounded-r-[8px] p-2">
                      <p className="text-xs font-medium text-primary mb-0.5">
                        Master's response
                      </p>
                      <p className="text-xs text-gray-500">{review.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

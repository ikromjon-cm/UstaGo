"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { MasterCard } from "@/components/ui/MasterCard";
import toast from "react-hot-toast";
import { mastersAPI } from "@/lib/api";
import { MapPin, Filter, Search } from "lucide-react";
import { ListSkeleton } from "@/components/ui/Skeleton";

export default function MastersPage() {
  const [masters, setMasters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [availabilityFilter, setAvailabilityFilter] = useState<
    "all" | "online" | "verified"
  >("all");
  const [sortBy, setSortBy] = useState<"distance" | "rating">("distance");

  useEffect(() => {
    mastersAPI
      .getNearby({ lat: 41.2995, lng: 69.2401 })
      .then((res) => {
        setMasters(res.data.results || res.data);
      })
      .catch(() => toast.error("Yuklashda xatolik"))
      .finally(() => setLoading(false));
  }, []);

  const filteredMasters = useMemo(() => {
    const q = search.toLowerCase();

    const searched = masters.filter((m) =>
      m.user?.full_name?.toLowerCase().includes(q),
    );

    const filtered = searched.filter((m) => {
      if (availabilityFilter === "online") return Boolean(m.is_online);
      if (availabilityFilter === "verified") return Boolean(m.is_verified);
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "rating")
        return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      return (
        (Number(a.distance) || Number.MAX_SAFE_INTEGER) -
        (Number(b.distance) || Number.MAX_SAFE_INTEGER)
      );
    });
  }, [masters, search, availabilityFilter, sortBy]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="page-container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Masters</h1>
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="btn-ghost p-2"
          >
            <Filter size={20} />
          </button>
        </div>
        {showFilters && (
          <div className="card p-4 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Availability
                </label>
                <select
                  className="input"
                  value={availabilityFilter}
                  onChange={(e) =>
                    setAvailabilityFilter(
                      e.target.value as "all" | "online" | "verified",
                    )
                  }
                >
                  <option value="all">All</option>
                  <option value="online">Online now</option>
                  <option value="verified">Verified only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Sort by
                </label>
                <select
                  className="input"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "distance" | "rating")
                  }
                >
                  <option value="distance">Nearest first</option>
                  <option value="rating">Highest rating</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="relative mb-6">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            className="input pl-12"
            placeholder="Search masters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {loading ? (
          <ListSkeleton count={4} />
        ) : (
          <div className="space-y-3">
            {masters
              .filter((m) =>
                m.user?.full_name?.toLowerCase().includes(search.toLowerCase()),
              )
              .map((master) => (
                <MasterCard key={master.id} {...master} />
              ))}
          </div>
        )}
      </main>
    </div>
  );
}

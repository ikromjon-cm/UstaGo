"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    mastersAPI.getNearby({ lat: 41.2995, lng: 69.2401 }).then(res => {
      setMasters(res.data.results || res.data);
    }).catch(() => toast.error("Yuklashda xatolik")).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="page-container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Masters</h1>
          <button className="btn-ghost p-2"><Filter size={20} /></button>
        </div>
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input className="input pl-12" placeholder="Search masters..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {loading ? (
          <ListSkeleton count={4} />
        ) : (
          <div className="space-y-3">
            {masters.filter(m => m.user?.full_name?.toLowerCase().includes(search.toLowerCase())).map(master => (
              <MasterCard key={master.id} {...master} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

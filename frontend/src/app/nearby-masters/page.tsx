"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Navigation, Star, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { mastersAPI } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { ListSkeleton } from "@/components/ui/Skeleton";

export default function NearbyMastersPage() {
  const router = useRouter();
  const [masters, setMasters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mastersAPI.getNearby({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          .then(res => setMasters(res.data.results || res.data))
          .catch(() => toast.error("Yuklashda xatolik"))
          .finally(() => setLoading(false));
      },
      () => {
        mastersAPI.getNearby({ lat: 41.2995, lng: 69.2401 })
          .then(res => setMasters(res.data.results || res.data))
          .catch(() => toast.error("Yuklashda xatolik"))
          .finally(() => setLoading(false));
      }
    );
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="page-container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Yaqin ustalar</h1>
            <p className="text-sm text-gray-500">{masters.length} ta usta topildi</p>
          </div>
          <button onClick={() => router.push('/masters')} className="btn-secondary text-sm px-4 py-2">
            List view
          </button>
        </div>

        <div className="card h-[400px] mb-6 bg-gray-100 dark:bg-dark-50 flex items-center justify-center">
          <div className="text-center">
            <MapPin size={48} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">Xarita integratsiyasi talab qilinadi</p>
            <p className="text-xs text-gray-400">Google Maps API key sozlangandan so'ng ishlaydi</p>
          </div>
        </div>

        {loading ? (
          <ListSkeleton count={4} />
        ) : (
          <div className="space-y-3">
            {masters.map((m: any) => (
              <div key={m.id} onClick={() => router.push(`/masters/${m.id}`)}
                className="card p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-[12px] bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary font-bold">
                  {m.user?.full_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{m.user?.full_name}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Star size={14} className="text-yellow-500" />{m.rating}</span>
                    <span>{m.completed_jobs} jobs</span>
                    {m.distance && <span className="flex items-center gap-1"><Navigation size={14} />{m.distance.toFixed(1)} km</span>}
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

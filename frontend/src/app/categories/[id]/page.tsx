"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Clock, Star } from "lucide-react";
import toast from "react-hot-toast";
import { categoriesAPI, mastersAPI } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { MasterCard } from "@/components/ui/MasterCard";

export default function CategoryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [category, setCategory] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [masters, setMasters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [catRes, servRes, masRes] = await Promise.all([
          categoriesAPI.getAll().then(r => r.data.find((c: any) => c.id === id)),
          categoriesAPI.getServices(id as string),
          mastersAPI.getNearby({ lat: 41.2995, lng: 69.2401, category: id as string }),
        ]);
        setCategory(catRes);
        setServices(servRes.data.results || servRes.data);
        setMasters(masRes.data.results || masRes.data);
      } catch { toast.error("Yuklashda xatolik"); }
      setLoading(false);
    }
    load();
  }, [id]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="page-container py-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 mb-4">
          <ChevronLeft size={20} /> Back
        </button>
        <h1 className="text-2xl font-bold mb-2">{category?.title_uz || "Category"}</h1>
        <p className="text-gray-500 mb-6">{category?.description || `${masters.length} ta usta mavjud`}</p>

        {services.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Xizmatlar</h2>
            <div className="grid grid-cols-2 gap-3">
              {services.map((s: any) => (
                <div key={s.id} className="card p-4 hover:shadow-md transition-all">
                  <p className="font-medium">{s.title_uz}</p>
                  {s.price_from && <p className="text-sm text-gray-500">{s.price_from.toLocaleString()} UZS dan</p>}
                  {s.duration_minutes && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <Clock size={12} /> {s.duration_minutes} min
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-lg font-semibold mb-3">Ustalar ({masters.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {masters.map((m: any) => <MasterCard key={m.id} {...m} />)}
          </div>
        </section>
      </main>
    </div>
  );
}

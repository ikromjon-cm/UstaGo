"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, ChevronLeft, Send } from "lucide-react";
import { ordersAPI, reviewsAPI } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import toast from "react-hot-toast";

const categories = ["Sifat", "Tezlik", "Muloqot", "Professionalizm"];

export default function CreateReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [ratings, setRatings] = useState({ quality: 5, speed: 5, communication: 5, professionalism: 5 });
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    ordersAPI.getById(id as string).then(r => setOrder(r.data)).catch(() => {});
  }, [id]);

  const overall = Object.values(ratings).reduce((a, b) => a + b, 0) / 4;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("order_id", id as string);
      formData.append("rating", String(Math.round(overall)));
      formData.append("quality", String(ratings.quality));
      formData.append("speed", String(ratings.speed));
      formData.append("communication", String(ratings.communication));
      formData.append("professionalism", String(ratings.professionalism));
      formData.append("comment", comment);
      await reviewsAPI.create(formData);
      toast.success("Sharh qoldirilgan!");
      router.push(`/orders/${id}`);
    } catch { toast.error("Xatolik yuz berdi"); } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="page-container py-6 max-w-lg mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 mb-4">
          <ChevronLeft size={20} /> Back
        </button>

        <h1 className="text-2xl font-bold mb-6">Sharh qoldirish</h1>

        <div className="text-center mb-6">
          <div className="text-5xl mb-2">
            {overall >= 4.5 ? "🌟" : overall >= 3.5 ? "👍" : overall >= 2.5 ? "😐" : "👎"}
          </div>
          <div className="flex justify-center gap-1 mb-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star key={star} size={28}
                className={star <= Math.round(overall) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500">{overall.toFixed(1)} / 5</p>
        </div>

        <div className="card p-6 space-y-4 mb-6">
          {categories.map((cat, i) => {
            const key = ["quality", "speed", "communication", "professionalism"][i] as keyof typeof ratings;
            return (
              <div key={cat}>
                <p className="text-sm font-medium mb-2">{cat}</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setRatings(r => ({ ...r, [key]: star }))}>
                      <Star size={22} className={star <= ratings[key] ? "text-yellow-500 fill-yellow-500" : "text-gray-300"} />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <textarea className="input min-h-[100px] mb-6" placeholder="Sharhingizni yozing..." value={comment} onChange={e => setComment(e.target.value)} />

        <button onClick={handleSubmit} className="btn-primary w-full flex items-center justify-center gap-2" disabled={submitting}>
          <Send size={18} /> {submitting ? "Yuborilmoqda..." : "Sharhni yuborish"}
        </button>
      </main>
    </div>
  );
}

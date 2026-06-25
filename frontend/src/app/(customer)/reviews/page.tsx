"use client";

import { useEffect, useState } from "react";
import { Star, ThumbsUp, MessageSquare, Send } from "lucide-react";
import { reviewsAPI } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/Button";
import { ListSkeleton } from "@/components/ui/Skeleton";
import toast from "react-hot-toast";

export default function ReviewsPage() {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondText, setRespondText] = useState<Record<string, string>>({});
  const [responding, setResponding] = useState<Record<string, boolean>>({});

  useEffect(() => {
    reviewsAPI.getMyReviews().then(r => setReviews(r.data.results || r.data)).catch(() => toast.error("Yuklashda xatolik"))
      .finally(() => setLoading(false));
  }, []);

  const handleRespond = async (reviewId: string) => {
    const text = respondText[reviewId]?.trim();
    if (!text) return;
    setResponding(s => ({ ...s, [reviewId]: true }));
    try {
      await reviewsAPI.respond(reviewId, text);
      toast.success("Response submitted");
      setReviews(rs => rs.map(r => r.id === reviewId ? { ...r, response: text, responded_at: new Date().toISOString() } : r));
      setRespondText(s => ({ ...s, [reviewId]: "" }));
    } catch {
      toast.error("Failed to submit response");
    } finally {
      setResponding(s => ({ ...s, [reviewId]: false }));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reviews</h1>

      {loading ? (
        <ListSkeleton count={4} />
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r: any) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary font-bold text-sm">
                    {r.reviewer_detail?.full_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{r.reviewer_detail?.full_name}</p>
                    <div className="flex items-center gap-1">
                      {Array.from({length: 5}).map((_, i) => (
                        <Star key={i} size={14} className={i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                      ))}
                      <span className="text-xs text-gray-500 ml-2">{r.quality}/{r.speed}/{r.communication}/{r.professionalism}</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              {r.comment && <p className="text-sm text-gray-600 dark:text-gray-400">{r.comment}</p>}

              {r.response && (
                <div className="mt-3 pl-4 border-l-2 border-primary/30 bg-primary-50/50 dark:bg-primary-900/10 rounded-r-[8px] p-3">
                  <p className="text-xs font-medium text-primary mb-1">Your response</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{r.response}</p>
                </div>
              )}

              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                {!r.response && (
                  <div className="flex-1 flex gap-2">
                    <input
                      className="input flex-1 text-sm"
                      placeholder="Write a response..."
                      value={respondText[r.id] || ""}
                      onChange={e => setRespondText(s => ({ ...s, [r.id]: e.target.value }))}
                    />
                    <Button size="sm" icon={<Send size={14} />} onClick={() => handleRespond(r.id)} loading={responding[r.id]}>
                      Reply
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

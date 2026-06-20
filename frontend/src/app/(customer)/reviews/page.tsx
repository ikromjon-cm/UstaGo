"use client";

import { useEffect, useState } from "react";
import { Star, ThumbsUp, MessageSquare } from "lucide-react";
import { reviewsAPI } from "@/lib/api";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewsAPI.getMyReviews().then(r => setReviews(r.data.results || r.data)).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reviews</h1>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="animate-pulse card p-4"><div className="h-4 w-3/4 skeleton" /></div>)}
        </div>
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
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary"><ThumbsUp size={14} /> Helpful</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

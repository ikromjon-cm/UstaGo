"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Calendar, Clock, DollarSign, MessageCircle, Phone, Star, ChevronLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { ordersAPI, paymentsAPI, reviewsAPI, chatAPI } from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.getById(id as string).then(res => setOrder(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleAcceptOffer = async (offerId: string) => {
    try {
      await ordersAPI.acceptOffer(id as string, offerId);
      toast.success("Offer accepted!");
      ordersAPI.getById(id as string).then(res => setOrder(res.data));
    } catch (e: any) { toast.error(e.response?.data?.message || "Error"); }
  };

  const handleConfirmCompletion = async () => {
    try {
      await ordersAPI.confirmCompletion(id as string);
      toast.success("Order completed!");
      ordersAPI.getById(id as string).then(res => setOrder(res.data));
    } catch (e: any) { toast.error(e.response?.data?.message || "Error"); }
  };

  const handleCancel = async () => {
    try {
      await ordersAPI.cancel(id as string);
      toast.success("Order cancelled");
      router.push("/orders");
    } catch (e: any) { toast.error(e.response?.data?.message || "Error"); }
  };

  if (loading) return <div className="min-h-screen"><Header /><main className="page-container py-6"><div className="skeleton h-96" /></main></div>;
  if (!order) return <div className="min-h-screen"><Header /><main className="page-container py-6"><p>Order not found</p></main></div>;

  const statusLabels: Record<string, string> = {
    pending: "Pending", looking_master: "Looking for Master", offered: "Offer Received",
    accepted: "Accepted", in_progress: "In Progress", completed: "Completed", cancelled: "Cancelled",
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="page-container py-6 max-w-3xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 mb-4">
          <ChevronLeft size={20} /> Back
        </button>

        <div className="card p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{order.title}</h1>
              <p className="text-gray-500 mt-1">{order.description}</p>
            </div>
            <span className={`badge-${order.status === 'completed' ? 'success' : order.status === 'cancelled' ? 'danger' : 'primary'}`}>
              {statusLabels[order.status] || order.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-dark-50 rounded-[12px]">
            <div className="flex items-center gap-2 text-sm"><MapPin size={16} className="text-gray-400" />{order.address}</div>
            <div className="flex items-center gap-2 text-sm"><DollarSign size={16} className="text-gray-400" />{Number(order.budget || order.final_price || 0).toLocaleString()} UZS</div>
            {order.preferred_date && <div className="flex items-center gap-2 text-sm"><Calendar size={16} className="text-gray-400" />{order.preferred_date}</div>}
            {order.preferred_time && <div className="flex items-center gap-2 text-sm"><Clock size={16} className="text-gray-400" />{order.preferred_time}</div>}
          </div>
        </div>

        {order.master && (
          <div className="card p-6 mb-4">
            <h3 className="font-semibold mb-3">Your Master</h3>
            <Link href={`/masters/${order.master.id}`} className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[14px] bg-gradient-to-br from-primary to-primary-400 flex items-center justify-center text-white font-bold text-xl">
                {order.master_detail?.user?.full_name?.charAt(0) || "U"}
              </div>
              <div>
                <p className="font-semibold">{order.master_detail?.user?.full_name || "Master"}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Star size={14} className="text-warning" /> {order.master_detail?.rating || "5.0"}
                  <span>•</span>
                  <span>{order.master_detail?.completed_jobs || 0} jobs</span>
                </div>
              </div>
            </Link>
            <div className="flex gap-2 mt-4">
              <button className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm">
                <MessageCircle size={16} /> Chat
              </button>
              <button className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm">
                <Phone size={16} /> Call
              </button>
            </div>
          </div>
        )}

        {order.offers?.length > 0 && !order.master && (
          <div className="card p-6 mb-4">
            <h3 className="font-semibold mb-4">Offers ({order.offers.length})</h3>
            <div className="space-y-3">
              {order.offers.map((offer: any) => (
                <div key={offer.id} className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-800 rounded-[12px]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[10px] bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary font-bold">
                      {offer.master_detail?.user?.full_name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{offer.master_detail?.user?.full_name || "Master"}</p>
                      <p className="text-xs text-gray-500">{offer.estimated_duration} min</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{Number(offer.price).toLocaleString()} UZS</p>
                    <button onClick={() => handleAcceptOffer(offer.id)} className="text-sm text-primary font-medium">Accept</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {order.status === "in_progress" && (
          <button onClick={handleConfirmCompletion} className="btn-primary w-full">Confirm Completion</button>
        )}

        {["pending", "looking_master", "offered", "accepted"].includes(order.status) && (
          <button onClick={handleCancel} className="btn-ghost w-full text-danger mt-2">Cancel Order</button>
        )}
      </main>
    </div>
  );
}

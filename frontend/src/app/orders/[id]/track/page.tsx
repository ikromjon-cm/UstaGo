"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, CheckCircle, Circle, ChevronLeft, Phone, MessageCircle } from "lucide-react";
import { ordersAPI } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { useWebSocket } from "@/hooks/useWebSocket";

const statusSteps = [
  { key: "pending", label: "Buyurtma yaratildi" },
  { key: "looking_master", label: "Usta qidirilmoqda" },
  { key: "accepted", label: "Usta topildi" },
  { key: "in_progress", label: "Ish bajarilmoqda" },
  { key: "completed", label: "Ish tugatildi" },
];

const statusOrder = statusSteps.map((s) => s.key);

export default function OrderTrackingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [masterLocation, setMasterLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { send } = useWebSocket(`orders/${id}/track`, (data) => {
    if (data.type === "location_update" && data.latitude && data.longitude) {
      setMasterLocation({ lat: data.latitude, lng: data.longitude });
    }
    if (data.type === "status_update" && data.status) {
      setOrder((prev: any) => prev ? { ...prev, status: data.status } : prev);
    }
  });

  useEffect(() => {
    ordersAPI.getById(id as string).then((r) => setOrder(r.data)).catch(() => {});
  }, [id]);

  const currentIdx = statusOrder.indexOf(order?.status || "pending");

  return (
    <div className="min-h-screen">
      <Header />
      <main className="page-container py-6 max-w-lg mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 mb-4">
          <ChevronLeft size={20} /> Back
        </button>

        <h1 className="text-2xl font-bold mb-2">{order?.title || "Buyurtma"}</h1>
        <div className={`badge-${order?.status === "completed" ? "success" : order?.status === "in_progress" || order?.status === "accepted" ? "primary" : "warning"} mb-6`}>
          {order?.status?.replace(/_/g, " ")}
        </div>

        <div className="card p-6 mb-6">
          <div className="h-[200px] bg-gray-100 dark:bg-dark-50 rounded-[12px] flex items-center justify-center mb-4">
            {masterLocation ? (
              <div className="text-center">
                <MapPin size={32} className="text-primary mx-auto mb-2" />
                <p className="text-sm text-gray-500">Usta joylashuvi kuzatilmoqda</p>
                <div className="mt-2 p-2 bg-primary/10 rounded-[8px] text-xs font-mono">
                  {masterLocation.lat.toFixed(6)}, {masterLocation.lng.toFixed(6)}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <MapPin size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {order?.status === "in_progress" ? "Usta joylashuvi yuklanmoqda..." : "Xarita yuklanmoqda..."}
                </p>
              </div>
            )}
          </div>

          {order?.address && (
            <div className="flex items-start gap-3 text-sm">
              <MapPin size={16} className="text-primary mt-0.5" />
              <span className="text-gray-600 dark:text-gray-400">{order.address}</span>
            </div>
          )}
        </div>

        <div className="card p-6 mb-6">
          <h3 className="font-semibold mb-4">Buyurtma holati</h3>
          <div className="space-y-4">
            {statusSteps.map((step, i) => {
              const isCompleted = i <= currentIdx;
              const isCurrent = i === currentIdx;
              return (
                <div key={step.key} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isCompleted ? <CheckCircle size={20} className="text-primary" /> : <Circle size={20} className="text-gray-300" />}
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${isCompleted ? "text-gray-900 dark:text-gray-100" : "text-gray-400"}`}>{step.label}</p>
                    {isCurrent && order?.updated_at && (
                      <p className="text-xs text-gray-400">{new Date(order.updated_at).toLocaleTimeString()}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {order?.master && (
          <div className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary font-bold">
                {order.master_detail?.user?.full_name?.charAt(0) || "U"}
              </div>
              <div>
                <p className="font-medium text-sm">Usta</p>
                <p className="text-xs text-gray-500">{order.master_detail?.user?.full_name}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => router.push(`/chat/${order.chat_room}`)} className="btn-ghost p-2"><MessageCircle size={18} /></button>
              <button onClick={() => router.push(`/calls/${order.chat_room}`)} className="btn-ghost p-2"><Phone size={18} /></button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

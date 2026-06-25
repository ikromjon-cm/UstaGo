"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { MapPin, CheckCircle, Circle, ChevronLeft, Phone, MessageCircle, Navigation, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { ordersAPI } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { useWebSocket } from "@/hooks/useWebSocket";

const LiveMap = dynamic(() => import("@/components/ui/MapPicker").then(m => {
  const Picker = m.MapPicker;
  const LiveMapInner = ({ center }: { center: [number, number] }) => (
    <div className="rounded-[16px] overflow-hidden border border-gray-200 dark:border-gray-700 h-[250px]">
      <Picker center={center} onLocationChange={() => {}} height="250px" />
    </div>
  );
  LiveMapInner.displayName = "LiveMapInner";
  return LiveMapInner;
}), { ssr: false, loading: () => <div className="h-[250px] skeleton rounded-[16px]" /> });

const statusSteps = [
  { key: "pending", label: "Buyurtma yaratildi" },
  { key: "looking_master", label: "Usta qidirilmoqda" },
  { key: "accepted", label: "Usta topildi" },
  { key: "in_progress", label: "Ish bajarilmoqda" },
  { key: "completed", label: "Ish tugatildi" },
];

const statusOrder = statusSteps.map(s => s.key);

export default function OrderTrackingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [masterLocation, setMasterLocation] = useState<[number, number] | null>(null);
  const [eta, setEta] = useState<string | null>(null);

  useWebSocket(`orders/${id}/track`, (data) => {
    if (data.type === "location_update" && data.latitude && data.longitude) {
      setMasterLocation([data.latitude, data.longitude]);
    }
    if (data.type === "status_update" && data.status) {
      setOrder((prev: any) => prev ? { ...prev, status: data.status } : prev);
    }
    if (data.type === "eta_update" && data.eta) {
      setEta(data.eta);
    }
  });

  useEffect(() => {
    ordersAPI.getById(id as string).then(r => setOrder(r.data)).catch(() => toast.error("Yuklashda xatolik"));
  }, [id]);

  useEffect(() => {
    if (!order?.latitude || !order?.longitude) return;
    setMasterLocation([Number(order.latitude), Number(order.longitude)]);
  }, [order?.latitude, order?.longitude]);

  const currentIdx = statusOrder.indexOf(order?.status || "pending");

  return (
    <div className="min-h-screen">
      <Header />
      <main className="page-container py-6 max-w-lg mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4 transition-colors">
          <ChevronLeft size={20} /> Back
        </button>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">{order?.title || "Buyurtma"}</h1>
            <p className={`badge-${order?.status === "completed" ? "success" : order?.status === "in_progress" || order?.status === "accepted" ? "primary" : "warning"}`}>
              {order?.status?.replace(/_/g, " ")}
            </p>
          </div>
          {eta && (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-[12px]">
              <Clock size={16} />
              <span>{eta}</span>
            </div>
          )}
        </div>

        <div className="card overflow-hidden mb-6">
          {masterLocation ? (
            <LiveMap center={masterLocation} />
          ) : (
            <div className="h-[250px] bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center">
              <Navigation size={32} className="text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">
                {order?.status === "in_progress" ? "Loading master location..." : "Waiting for updates..."}
              </p>
              {order?.address && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                  <MapPin size={12} /> {order.address}
                </div>
              )}
            </div>
          )}
        </div>

        {order?.master && (
          <div className="card p-4 flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-[12px] bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                {order.master_detail?.user?.full_name?.charAt(0) || "U"}
              </div>
              <div>
                <p className="font-medium text-sm">{order.master_detail?.user?.full_name || "Usta"}</p>
                <p className="text-xs text-gray-500">Rating: {order.master_detail?.rating || "—"}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" icon={<MessageCircle size={16} />} onClick={() => router.push(`/chat/${order.chat_room}`)} />
              <Button variant="ghost" size="sm" icon={<Phone size={16} />} onClick={() => router.push(`/calls/${order.chat_room}`)} />
            </div>
          </div>
        )}

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Order Status</h3>
          <div className="space-y-4">
            {statusSteps.map((step, i) => {
              const isCompleted = i <= currentIdx;
              const isCurrent = i === currentIdx;
              return (
                <div key={step.key} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isCompleted ? (
                      <CheckCircle size={20} className="text-blue-600" />
                    ) : (
                      <Circle size={20} className="text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${isCompleted ? "text-gray-900 dark:text-gray-100" : "text-gray-400"}`}>
                      {step.label}
                    </p>
                    {isCurrent && order?.updated_at && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.updated_at).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

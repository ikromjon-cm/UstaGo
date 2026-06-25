"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Header } from "@/components/layout/Header";
import toast from "react-hot-toast";
import { notificationsAPI } from "@/lib/api";
import { ListSkeleton } from "@/components/ui/Skeleton";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsAPI.getNotifications().then(res => {
      setNotifications(res.data.results || res.data);
    }).catch(() => toast.error("Yuklashda xatolik")).finally(() => setLoading(false));
  }, []);

  const markAllRead = () => {
    notificationsAPI.markAllRead().then(() => {
      setNotifications(n => n.map(not => ({ ...not, is_read: true })));
    }).catch(() => toast.error("Yuklashda xatolik"));
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="page-container py-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>
          <button onClick={markAllRead} className="btn-ghost text-sm flex items-center gap-1">
            <CheckCheck size={16} /> Mark all read
          </button>
        </div>
        {loading ? (
          <ListSkeleton count={5} />
        ) : notifications.length === 0 ? (
          <div className="card p-12 text-center">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400">No notifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n: any) => (
              <div key={n.id} className={`card p-4 flex items-start gap-3 ${!n.is_read ? 'border-l-4 border-l-primary' : ''}`}>
                <div className="flex-1">
                  <p className="font-medium text-sm">{n.title}</p>
                  <p className="text-sm text-gray-500">{n.body}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import toast from "react-hot-toast";
import { chatAPI } from "@/lib/api";
import { ListSkeleton } from "@/components/ui/Skeleton";

export default function ChatListPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chatAPI.getRooms().then(res => setRooms(res.data.results || res.data)).catch(() => toast.error("Yuklashda xatolik"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="page-container py-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        {loading ? (
          <ListSkeleton count={5} />
        ) : rooms.length === 0 ? (
          <div className="card p-12 text-center">
            <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400">No conversations yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rooms.map((room: any) => (
              <Link key={room.id} href={`/chat/${room.id}`} className="card-hover p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary font-bold">
                  {room.participants_detail?.find((p: any) => p.id !== room.user_id)?.full_name?.charAt(0) || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {room.participants_detail?.find((p: any) => p.id !== room.user_id)?.full_name || "User"}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{room.last_message?.content || "No messages"}</p>
                </div>
                <div className="text-right">
                  {room.unread_count > 0 && (
                    <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">{room.unread_count}</span>
                  )}
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

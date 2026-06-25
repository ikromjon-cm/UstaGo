"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Send, ChevronLeft, Paperclip, Phone } from "lucide-react";
import { Header } from "@/components/layout/Header";
import toast from "react-hot-toast";
import { chatAPI } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { ListSkeleton } from "@/components/ui/Skeleton";

export default function ChatDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleWsMessage = useCallback((data: any) => {
    if (data.type === "chat_message") {
      setMessages(prev => {
        if (prev.some(m => m.id === data.message.id)) return prev;
        return [...prev, data.message];
      });
    } else if (data.type === "user_online") {
      setOtherUser((prev: any) => ({ ...prev, is_online: true }));
    } else if (data.type === "user_offline") {
      setOtherUser((prev: any) => ({ ...prev, is_online: false }));
    }
  }, []);

  const { send: wsSend } = useWebSocket(
    id ? `chat/${id}` : null,
    handleWsMessage,
  );

  useEffect(() => {
    Promise.all([
      chatAPI.getMessages(id as string).then(res => {
        setMessages(res.data.results || res.data || []);
      }).catch(() => toast.error("Yuklashda xatolik")),
      chatAPI.getRoom(id as string).then(res => {
        const room = res.data;
        const other = room.participants_detail?.find((p: any) => p.id !== user?.id);
        setOtherUser(other || null);
      }).catch(() => toast.error("Yuklashda xatolik")),
    ]).finally(() => setLoading(false));
  }, [id, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      content: input,
      sender: user?.id,
      message_type: "text",
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setInput("");
    wsSend({ type: "message", content: input, message_type: "text" });
    try {
      const res = await chatAPI.sendMessage(id as string, { content: input, message_type: "text" });
      setMessages(prev => prev.map(m => m.id === tempId ? res.data : m));
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="btn-ghost p-1"><ChevronLeft size={20} /></button>
        <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary font-bold">
          {otherUser?.full_name?.charAt(0) || "U"}
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{otherUser?.full_name || "User"}</p>
          <p className={`text-xs ${otherUser?.is_online ? "text-green-500" : "text-gray-400"}`}>
            {otherUser?.is_online ? "Online" : "Offline"}
          </p>
        </div>
        <button className="btn-ghost p-2"><Phone size={20} /></button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <ListSkeleton count={6} />
        ) : messages.map((msg: any) => (
          <div key={msg.id} className={`flex ${msg.sender === user?.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] p-3 rounded-[16px] ${
              msg.sender === user?.id
                ? 'bg-primary text-white rounded-br-[4px]'
                : 'bg-gray-100 dark:bg-dark-50 rounded-bl-[4px]'
            }`}>
              <p className="text-sm">{msg.content}</p>
              <p className={`text-[10px] mt-1 ${msg.sender === user?.id ? 'text-white/70' : 'text-gray-400'}`}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {!loading && <div className="border-t border-gray-100 dark:border-gray-800 p-4">
        <div className="flex items-center gap-2">
          <button className="btn-ghost p-2"><Paperclip size={20} /></button>
          <input
            className="input flex-1"
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} disabled={sending || !input.trim()} className="btn-primary p-3">
            <Send size={20} />
          </button>
        </div>
      </div>}
    </div>
  );
}

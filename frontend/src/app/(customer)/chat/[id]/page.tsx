"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Send, ChevronLeft, Paperclip, Phone, User } from "lucide-react";
import { chatAPI } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function ChatDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const { send: wsSend } = useWebSocket(`chat/${id}`, (data) => {
    switch (data.type) {
      case "new_message":
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message_id)) return prev;
          return [...prev, {
            id: data.message_id, sender: data.sender_id,
            content: data.content, message_type: data.message_type,
            image: data.image, file: data.file,
            created_at: data.created_at,
            sender_detail: { full_name: data.sender_name, avatar: data.sender_avatar },
          }];
        });
        break;
      case "message_read":
        setMessages((prev) => prev.map((m) => m.id === data.message_id ? { ...m, is_read: true } : m));
        break;
      case "typing":
        setTypingUsers((prev) => {
          const next = new Set(prev);
          data.is_typing ? next.add(data.user_id) : next.delete(data.user_id);
          return next;
        });
        break;
      case "user_online":
        setOnlineUsers((prev) => new Set(prev).add(data.user_id));
        break;
      case "user_offline":
        setOnlineUsers((prev) => { const next = new Set(prev); next.delete(data.user_id); return next; });
        break;
    }
  });

  useEffect(() => {
    chatAPI.getMessages(id as string).then((res) => {
      setMessages(res.data.results || res.data);
    }).catch(() => {});
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    wsSend({ type: "message", content: input, message_type: "text" });
    try {
      const res = await chatAPI.sendMessage(id as string, { content: input, message_type: "text" });
      setMessages((prev) => {
        if (prev.some((m) => m.id === res.data.id)) return prev;
        return [...prev, res.data];
      });
    } catch {}
    setInput("");
    setSending(false);
  };

  const handleTyping = (val: string) => {
    setInput(val);
    wsSend({ type: "typing", is_typing: val.length > 0 });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => wsSend({ type: "typing", is_typing: false }), 2000);
  };

  const otherParticipant = messages.find((m) => m.sender !== user?.id);
  const otherName = otherParticipant?.sender_detail?.full_name || "User";
  const otherId = otherParticipant?.sender;
  const isOnline = otherId ? onlineUsers.has(otherId) : false;
  const isTyping = otherId ? typingUsers.has(otherId) : false;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="btn-ghost p-1"><ChevronLeft size={20} /></button>
        <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary font-bold">
          {otherName.charAt(0)}
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{otherName}</p>
          <p className={`text-xs ${isOnline ? "text-green-500" : "text-gray-400"}`}>
            {isTyping ? "Yozmoqda..." : isOnline ? "Online" : "Offline"}
          </p>
        </div>
        <button onClick={() => router.push(`/calls/${id}`)} className="btn-ghost p-2"><Phone size={20} /></button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === user?.id ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] p-3 rounded-[16px] ${msg.sender === user?.id ? "bg-primary text-white rounded-br-[4px]" : "bg-gray-100 dark:bg-dark-50 rounded-bl-[4px]"}`}>
              {msg.image && <img src={msg.image} alt="" className="rounded-[8px] mb-2 max-w-[200px]" />}
              {msg.content && <p className="text-sm">{msg.content}</p>}
              {msg.file && <a href={msg.file} className="text-xs underline">File</a>}
              <p className={`text-[10px] mt-1 ${msg.sender === user?.id ? "text-white/70" : "text-gray-400"}`}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800 p-4">
        <div className="flex items-center gap-2">
          <button className="btn-ghost p-2"><Paperclip size={20} /></button>
          <input className="input flex-1" placeholder="Xabar yozing..." value={input}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()} />
          <button onClick={handleSend} disabled={sending || !input.trim()} className="btn-primary p-3">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

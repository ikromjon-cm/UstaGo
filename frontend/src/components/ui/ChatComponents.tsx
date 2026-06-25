"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Image, Paperclip, Check, CheckCheck } from "lucide-react";

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  is_read?: boolean;
  is_delivered?: boolean;
  message_type?: string;
}

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function ChatBubble({ message, isOwn }: ChatBubbleProps) {
  const time = new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`
          max-w-[75%] px-4 py-2.5 rounded-[16px] text-sm leading-relaxed
          ${isOwn
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md"
          }
        `}
      >
        {!isOwn && (
          <p className="text-xs font-medium mb-0.5 opacity-70">{message.sender_name}</p>
        )}
        <p>{message.content}</p>
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
          <span className={`text-[10px] ${isOwn ? "text-blue-200" : "text-gray-400"}`}>{time}</span>
          {isOwn && (
            message.is_read
              ? <CheckCheck size={12} className="text-blue-300" />
              : message.is_delivered
                ? <CheckCheck size={12} className="text-blue-200" />
                : <Check size={12} className="text-blue-200" />
          )}
        </div>
      </div>
    </div>
  );
}

interface ChatInputProps {
  onSend: (text: string) => void;
  onAttach?: () => void;
  placeholder?: string;
}

export function ChatInput({ onSend, onAttach, placeholder = "Type a message..." }: ChatInputProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50">
      {onAttach && (
        <button type="button" onClick={onAttach} className="p-2 rounded-[10px] hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors">
          <Paperclip size={20} />
        </button>
      )}
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-gray-100 dark:bg-gray-700 border-0 rounded-[12px] px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        disabled={!text.trim()}
        className="p-2.5 rounded-[12px] bg-blue-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
      >
        <Send size={18} />
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { Bell, Send } from "lucide-react";
import { notificationsAPI } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import toast from "react-hot-toast";

export default function AdminNotificationsPage() {
  const [showSend, setShowSend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", type: "system" });

  const handleSend = async () => {
    if (!form.title || !form.body) {
      toast.error("Title and body are required");
      return;
    }
    setLoading(true);
    try {
      await notificationsAPI.sendToAll(form);
      toast.success("Notification sent to all users");
      setShowSend(false);
      setForm({ title: "", body: "", type: "system" });
    } catch {
      toast.error("Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button icon={<Send size={16} />} onClick={() => setShowSend(true)}>
          Send Notification
        </Button>
      </header>
      <main className="p-6">
        <EmptyState
          icon={<Bell size={28} />}
          title="No notifications sent yet"
          description="Send push notifications to all users from here"
          action={{ label: "Send Notification", onClick: () => setShowSend(true) }}
        />
      </main>

      <Modal open={showSend} onClose={() => setShowSend(false)} title="Send Notification" size="lg">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Notification title" />
          <Textarea label="Body" rows={4} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Notification body text..." />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type</label>
            <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="system">System</option>
              <option value="promo">Promotion</option>
              <option value="order">Order</option>
            </select>
          </div>
          <Button onClick={handleSend} loading={loading} className="w-full" icon={<Send size={16} />}>
            Send to All Users
          </Button>
        </div>
      </Modal>
    </div>
  );
}

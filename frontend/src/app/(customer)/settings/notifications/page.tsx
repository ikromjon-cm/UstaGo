"use client";

import { useState } from "react";
import { Bell, Mail, MessageSquare, Megaphone } from "lucide-react";

export default function NotificationPreferencesPage() {
  const [prefs, setPrefs] = useState({
    push_orders: true,
    push_chat: true,
    push_payments: true,
    push_promo: false,
    email_orders: true,
    email_payments: true,
    email_promo: false,
    sms_orders: false,
    sms_otp: true,
  });

  const toggle = (key: keyof typeof prefs) => setPrefs(prev => ({ ...prev, [key]: !prev[key] }));

  const Switch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
    </label>
  );

  const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-4">
        <Icon size={20} className="text-primary" />
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );

  const Row = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Notification Preferences</h1>
      <div className="space-y-4">
        <Section icon={Bell} title="Push Notifications">
          <Row label="Order updates" checked={prefs.push_orders} onChange={() => toggle("push_orders")} />
          <Row label="Chat messages" checked={prefs.push_chat} onChange={() => toggle("push_chat")} />
          <Row label="Payment confirmations" checked={prefs.push_payments} onChange={() => toggle("push_payments")} />
          <Row label="Promotions & offers" checked={prefs.push_promo} onChange={() => toggle("push_promo")} />
        </Section>
        <Section icon={Mail} title="Email Notifications">
          <Row label="Order updates" checked={prefs.email_orders} onChange={() => toggle("email_orders")} />
          <Row label="Payment receipts" checked={prefs.email_payments} onChange={() => toggle("email_payments")} />
          <Row label="Promotions" checked={prefs.email_promo} onChange={() => toggle("email_promo")} />
        </Section>
        <Section icon={MessageSquare} title="SMS Notifications">
          <Row label="Order updates" checked={prefs.sms_orders} onChange={() => toggle("sms_orders")} />
          <Row label="OTP verification" checked={prefs.sms_otp} onChange={() => toggle("sms_otp")} />
        </Section>
      </div>
    </div>
  );
}

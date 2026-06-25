"use client";

import { useState, FormEvent } from "react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Iltimos, barcha maydonlarni to'ldiring");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/v1/contact/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Xabaringiz yuborildi!");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      toast.error("Xabar yuborilmadi. Iltimos qayta urinib ko'ring.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-semibold mb-2">Phone</h3>
            <p className="text-gray-500">+998 71 200 00 00</p>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold mb-2">Email</h3>
            <p className="text-gray-500">support@ustago.uz</p>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold mb-2">Address</h3>
            <p className="text-gray-500">Tashkent, Uzbekistan<br />Amir Temur Avenue, 100</p>
          </div>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Send us a message</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input className="input" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
            <input className="input" type="email" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} required />
            <textarea className="input min-h-[120px]" placeholder="Your message" value={message} onChange={e => setMessage(e.target.value)} required />
            <button className="btn-primary w-full" disabled={sending}>{sending ? "Sending..." : "Send Message"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

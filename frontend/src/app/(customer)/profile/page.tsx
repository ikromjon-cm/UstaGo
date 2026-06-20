"use client";

import { useState } from "react";
import { Camera, Save } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { authAPI } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({ full_name: user?.full_name || "", bio: user?.bio || "", lang: user?.lang || "uz" });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await authAPI.updateProfile(form);
      setUser(res.data);
      toast.success("Profile updated");
    } catch (e: any) { toast.error("Error updating profile"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="page-container py-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        <div className="card p-6 mb-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-400 flex items-center justify-center text-white text-3xl font-bold">
                {user?.full_name?.charAt(0) || "U"}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
                <Camera size={16} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">{user?.phone}</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input className="input" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea className="input min-h-[100px]" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell us about yourself..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Language</label>
              <select className="input" value={form.lang} onChange={e => setForm(f => ({ ...f, lang: e.target.value }))}>
                <option value="uz">O'zbek</option>
                <option value="ru">Русский</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>
        <button onClick={handleSave} className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
          <Save size={18} /> {loading ? "Saving..." : "Save Changes"}
        </button>
      </main>
    </div>
  );
}

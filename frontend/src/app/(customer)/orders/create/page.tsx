"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, MapPin, Clock, AlertTriangle, Send } from "lucide-react";
import { ordersAPI, categoriesAPI, aiAPI } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import toast from "react-hot-toast";

export default function CreateOrderPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [form, setForm] = useState({
    title: "", description: "", category: "", urgency: "normal",
    budget: "", latitude: "41.2995", longitude: "69.2401",
    address: "", preferred_date: "", preferred_time: "",
  });
  const [images, setImages] = useState<File[]>([]);

  const handleAnalyze = async () => {
    if (!form.title && !form.description) {
      toast.error("Please describe what you need");
      return;
    }
    setLoading(true);
    try {
      const text = `${form.title} ${form.description}`;
      const res = await aiAPI.analyze(text);
      setAiResult(res.data);
      if (res.data.category_id) setForm(f => ({ ...f, category: res.data.category_id }));
      setStep(2);
    } catch (e) {
      toast.error("AI analysis failed, please select manually");
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      images.forEach(img => formData.append("images", img));
      const res = await ordersAPI.create(formData);
      toast.success("Order created!");
      router.push(`/orders/${res.data.id}`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="page-container py-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? "bg-primary text-white" : "bg-gray-200"}`}>1</div>
          <div className="h-0.5 flex-1 bg-gray-200"><div className="h-full bg-primary transition-all" style={{ width: step >= 2 ? "100%" : "0%" }} /></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? "bg-primary text-white" : "bg-gray-200"}`}>2</div>
          <div className="h-0.5 flex-1 bg-gray-200"><div className="h-full bg-primary transition-all" style={{ width: step >= 3 ? "100%" : "0%" }} /></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? "bg-primary text-white" : "bg-gray-200"}`}>3</div>
        </div>

        {step === 1 && (
          <div className="card p-6 space-y-4">
            <h2 className="text-xl font-bold">What do you need?</h2>
            <input className="input" placeholder="Title (e.g., Fix leaking pipe)" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <textarea className="input min-h-[120px]" placeholder="Describe your problem in detail..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <div>
              <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={e => setImages(Array.from(e.target.files || []))} />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary flex items-center gap-2">
                <Camera size={18} /> {images.length > 0 ? `${images.length} photos added` : "Add photos"}
              </button>
            </div>
            <button onClick={handleAnalyze} className="btn-primary w-full" disabled={loading}>
              {loading ? "AI is analyzing..." : "Continue with AI"}
            </button>
            {aiResult && (
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-[12px] p-4">
                <p className="text-sm font-medium">AI Detected: {aiResult.category}</p>
                <p className="text-sm">Estimated cost: {aiResult.price_estimate?.min?.toLocaleString()} - {aiResult.price_estimate?.max?.toLocaleString()} UZS</p>
                <p className="text-sm">{aiResult.nearby_masters} masters nearby</p>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="card p-6 space-y-4">
            <h2 className="text-xl font-bold">Location & Schedule</h2>
            <input className="input" placeholder="Your address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            <input className="input" placeholder="Apartment / floor" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Preferred Date</label>
                <input type="date" className="input" value={form.preferred_date} onChange={e => setForm(f => ({ ...f, preferred_date: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm mb-1">Preferred Time</label>
                <input type="time" className="input" value={form.preferred_time} onChange={e => setForm(f => ({ ...f, preferred_time: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Urgency</label>
              <select className="input" value={form.urgency} onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))}>
                <option value="low">Low - Within a week</option>
                <option value="normal">Normal - Within 2-3 days</option>
                <option value="high">High - Tomorrow</option>
                <option value="emergency">Emergency - Right now!</option>
              </select>
            </div>
            <button onClick={() => setStep(3)} className="btn-primary w-full">Continue</button>
          </div>
        )}

        {step === 3 && (
          <div className="card p-6 space-y-4">
            <h2 className="text-xl font-bold">Budget & Submit</h2>
            <div>
              <label className="block text-sm mb-1">Your budget (UZS)</label>
              <input type="number" className="input" placeholder="e.g., 200000" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
            </div>
            <div className="bg-warning/10 rounded-[12px] p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600 dark:text-gray-400">You won't be charged until you accept a master's offer</p>
            </div>
            <button onClick={handleSubmit} className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
              <Send size={18} /> {loading ? "Creating..." : "Submit Order"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

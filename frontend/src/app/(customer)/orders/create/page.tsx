"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Camera, MapPin, Clock, AlertTriangle, Send, Sparkles, ArrowLeft, Navigation } from "lucide-react";
import dynamic from "next/dynamic";
import { ordersAPI, aiAPI } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { OrderWizard } from "@/components/ui/OrderWizard";
import toast from "react-hot-toast";

const MapPicker = dynamic(() => import("@/components/ui/MapPicker").then(m => m.MapPicker), {
  ssr: false,
  loading: () => <div className="h-[300px] skeleton rounded-[16px]" />,
});

const steps = [
  { id: 1, label: "Describe" },
  { id: 2, label: "Location" },
  { id: 3, label: "Submit" },
];

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
    } catch {
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

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => setForm(f => ({ ...f, latitude: String(pos.coords.latitude), longitude: String(pos.coords.longitude) })),
      () => toast.error("Could not get location")
    );
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="page-container py-6 max-w-2xl mx-auto">
        <OrderWizard steps={steps} currentStep={step}>
          {step === 1 && (
            <div className="card p-6 space-y-5 animate-in">
              <div>
                <h2 className="text-xl font-bold mb-1">What do you need?</h2>
                <p className="text-sm text-gray-500">Describe your problem and AI will help categorize it</p>
              </div>
              <Input label="Title" placeholder="e.g., Fix leaking pipe" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <Textarea label="Description" placeholder="Describe your problem in detail..." rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <div>
                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={e => setImages(Array.from(e.target.files || []))} />
                <Button type="button" variant="secondary" icon={<Camera size={18} />} onClick={() => fileInputRef.current?.click()}>
                  {images.length > 0 ? `${images.length} photos added` : "Add photos"}
                </Button>
              </div>
              {aiResult && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-[16px] p-5 space-y-2 border border-blue-100 dark:border-blue-800/30">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-medium">
                    <Sparkles size={18} /> AI Analysis
                  </div>
                  <p className="text-sm">Category: <strong>{aiResult.category}</strong></p>
                  <p className="text-sm">Estimated: {Number(aiResult.price_estimate?.min).toLocaleString()} - {Number(aiResult.price_estimate?.max).toLocaleString()} UZS</p>
                  <p className="text-sm">{aiResult.nearby_masters} masters available nearby</p>
                </div>
              )}
              <Button onClick={handleAnalyze} loading={loading} className="w-full">
                {loading ? "AI is analyzing..." : "Continue with AI"}
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in">
              <div className="card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Location & Schedule</h2>
                  <Button variant="ghost" size="sm" icon={<Navigation size={16} />} onClick={handleGetLocation}>
                    Use my location
                  </Button>
                </div>
                <Input label="Address" placeholder="Your address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Preferred Date" type="date" value={form.preferred_date} onChange={e => setForm(f => ({ ...f, preferred_date: e.target.value }))} />
                  <Input label="Preferred Time" type="time" value={form.preferred_time} onChange={e => setForm(f => ({ ...f, preferred_time: e.target.value }))} />
                </div>
                <Select label="Urgency" value={form.urgency} onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))}>
                  <option value="low">Low - Within a week</option>
                  <option value="normal">Normal - Within 2-3 days</option>
                  <option value="high">High - Tomorrow</option>
                  <option value="emergency">Emergency - Right now!</option>
                </Select>
              </div>
              <div className="card p-6">
                <MapPicker
                  center={[Number(form.latitude), Number(form.longitude)]}
                  onLocationChange={(lat, lng) => setForm(f => ({ ...f, latitude: String(lat), longitude: String(lng) }))}
                />
              </div>
              <Button onClick={() => setStep(3)} className="w-full">Continue</Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-in">
              <div className="card p-6 space-y-4">
                <h2 className="text-xl font-bold">Budget & Submit</h2>
                <Input label="Your budget (UZS)" type="number" placeholder="e.g., 200000" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-[16px] p-4 flex items-start gap-3 border border-amber-200 dark:border-amber-800/30">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700 dark:text-amber-300">You won't be charged until you accept a master's offer</p>
                </div>
              </div>
              <div className="card p-6">
                <h3 className="font-semibold mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Title</span><span>{form.title || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Address</span><span>{form.address || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Urgency</span><span className="capitalize">{form.urgency}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Budget</span><span>{form.budget ? Number(form.budget).toLocaleString() + " UZS" : "—"}</span></div>
                </div>
              </div>
              <Button onClick={handleSubmit} loading={loading} icon={<Send size={18} />} className="w-full" size="lg">
                {loading ? "Creating..." : "Submit Order"}
              </Button>
            </div>
          )}
        </OrderWizard>
      </main>
    </div>
  );
}

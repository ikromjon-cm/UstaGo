"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Wrench, MapPin, MessageCircle, Shield } from "lucide-react";

const slides = [
  { icon: Wrench, title: "Professional ustalarni toping", desc: "Santexnik, elektrik, quruvchi va boshqa 50+ xizmat turlari" },
  { icon: MapPin, title: "Yaqin atrofdagi ustalar", desc: "Joylashuvingiz bo'yicha eng yaqin va ishonchli ustalarni toping" },
  { icon: MessageCircle, title: "Bepul chat va qo'ng'iroq", desc: "Ustalar bilan bevosita bog'laning, narxni kelishing" },
  { icon: Shield, title: "Xavfsiz to'lov", desc: "Ish tugagandan so'ng to'lovni amalga oshiring" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const slide = slides[step];

  return (
    <div className="min-h-screen bg-white dark:bg-dark flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-24 h-24 bg-primary/10 rounded-[24px] flex items-center justify-center mb-8">
          <slide.icon className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-3">{slide.title}</h1>
        <p className="text-gray-500 text-center max-w-sm">{slide.desc}</p>
      </div>
      <div className="p-6 space-y-6">
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? 'w-8 bg-primary' : 'bg-gray-300'}`} />
          ))}
        </div>
        <div className="flex gap-3">
          {step < slides.length - 1 ? (
            <>
              <button onClick={() => router.push('/login')} className="btn-secondary flex-1">Skip</button>
              <button onClick={() => setStep(s => s + 1)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                Next <ChevronRight size={18} />
              </button>
            </>
          ) : (
            <button onClick={() => router.push('/register')} className="btn-primary flex-1">
              Let's Start
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

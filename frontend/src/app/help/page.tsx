"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, MessageCircle, Phone, Mail, FileText, Search, HelpCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";

const faqs = [
  { q: "Qanday qilib buyurtma berish mumkin?", a: "Bosh sahifadagi 'Buyurtma berish' tugmasini bosing, xizmat turini tanlang va ma'lumotlarni to'ldiring. AI yordamchi so'rovingizni tahlil qiladi va eng mos ustalarni topadi." },
  { q: "To'lov qanday amalga oshiriladi?", a: "Ish tugagandan so'ng to'lovni naqd, Payme, Click, Uzum Bank yoki karta orqali amalga oshirishingiz mumkin. Platforma barcha to'lovlarni xavfsiz saqlaydi." },
  { q: "Ustani qanday topish mumkin?", a: "Xizmat turini tanlang, joylashuvingizni belgilang va tizim eng yaqin, eng yaxshi reytingga ega ustalarni taklif qiladi." },
  { q: "Buyurtmamni bekor qila olamanmi?", a: "Ha, usta ish boshlashgunga qadar buyurtmani bekor qilishingiz mumkin. Ish boshlangandan so'ng, ustangiz bilan kelishib oling." },
  { q: "Usta sifatiga qanday ishonch bor?", a: "Barcha ustalar identifikatsiyadan o'tadi, portfolio va sharhlar mavjud. Foydalanuvchilarning reytingi va fikr-mulohazalari asosida eng ishonchli ustalarni topishingiz mumkin." },
  { q: "Agar muammo yuz bersa nima qilish keram?", a: "Platformadagi chat orqali ustangiz bilan bog'laning. Agar nizo yuz bersa, administratorlarimiz yordam beradi." },
  { q: "Qanday qilib usta bo'lish mumkin?", a: "Ro'yxatdan o'tishda 'Usta' rolini tanlang, profilingizni to'ldiring va hujjatlaringizni tasdiqlang. Administrator tekshiruvdan o'tkazgach, buyurtmalarni qabul qilishingiz mumkin." },
  { q: "Pulni qanday yechib olish mumkin?", a: "Daromadlaringizni hamyoningizda ko'rishingiz mumkin. Minimal 50,000 so'mdan boshlab Payme, Click yoki bank kartasiga yechib oling." },
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const filtered = faqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen">
      <Header />
      <main className="page-container py-6 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <HelpCircle size={48} className="text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Yordam markazi</h1>
          <p className="text-gray-500">Savollaringiz bormi? Biz yordam beramiz</p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input className="input pl-12" placeholder="Savolni qidirish..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="space-y-2 mb-8">
          {filtered.map((faq, i) => (
            <div key={i} className="card overflow-hidden">
              <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full p-4 flex items-center justify-between text-left">
                <span className="font-medium">{faq.q}</span>
                {openIndex === i ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
              </button>
              {openIndex === i && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-4">Biz bilan bog'lanish</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a href="tel:+998711234567" className="flex items-center gap-3 p-3 rounded-[12px] hover:bg-gray-50 dark:hover:bg-dark-50 transition-all">
              <div className="w-10 h-10 rounded-[10px] bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary"><Phone size={20} /></div>
              <div><p className="text-sm font-medium">Telefon</p><p className="text-xs text-gray-500">+998 71 123-45-67</p></div>
            </a>
            <a href="mailto:support@ustago.uz" className="flex items-center gap-3 p-3 rounded-[12px] hover:bg-gray-50 dark:hover:bg-dark-50 transition-all">
              <div className="w-10 h-10 rounded-[10px] bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600"><Mail size={20} /></div>
              <div><p className="text-sm font-medium">Email</p><p className="text-xs text-gray-500">support@ustago.uz</p></div>
            </a>
            <button className="flex items-center gap-3 p-3 rounded-[12px] hover:bg-gray-50 dark:hover:bg-dark-50 transition-all">
              <div className="w-10 h-10 rounded-[10px] bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600"><MessageCircle size={20} /></div>
              <div><p className="text-sm font-medium text-left">Live chat</p><p className="text-xs text-gray-500 text-left">24/7 AI yordamchi</p></div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

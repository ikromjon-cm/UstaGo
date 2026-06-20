import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | UstaGo",
};

const faqs = [
  { q: "How do I find a master?", a: "Browse categories, describe your task, and masters will send you offers. You can compare prices and reviews before choosing." },
  { q: "How does payment work?", a: "UstaGo uses an escrow system. Your payment is held securely until the job is completed to your satisfaction." },
  { q: "Are masters verified?", a: "All masters go through identity verification. Many have certificates, licenses, and customer reviews to help you choose." },
  { q: "What if I'm not satisfied?", a: "You can dispute the order within 24 hours. Our support team will review and help resolve any issues." },
  { q: "How long does it take to find a master?", a: "Most customers receive offers within 15-30 minutes. Urgent jobs are prioritized." },
  { q: "Can I cancel an order?", a: "You can cancel before a master accepts your order. After acceptance, contact support for cancellation." },
  { q: "What areas do you cover?", a: "We currently operate in Tashkent, with plans to expand to other major cities in Uzbekistan." },
  { q: "How do I become a master?", a: "Register as a master, complete your profile with documents and portfolio, and start receiving orders." },
];

export default function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details key={i} className="card p-4 group">
            <summary className="font-medium cursor-pointer list-none flex items-center justify-between">
              {faq.q}
              <span className="transform group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-3 text-gray-500 text-sm">{faq.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

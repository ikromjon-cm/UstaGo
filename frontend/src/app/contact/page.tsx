import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | UstaGo",
};

export default function ContactPage() {
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
          <form className="space-y-4">
            <input className="input" placeholder="Your name" />
            <input className="input" type="email" placeholder="Your email" />
            <textarea className="input min-h-[120px]" placeholder="Your message" />
            <button className="btn-primary w-full">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
}

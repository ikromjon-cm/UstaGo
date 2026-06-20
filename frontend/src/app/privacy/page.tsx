import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | UstaGo",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose dark:prose-invert max-w-none space-y-4 text-gray-600 dark:text-gray-300">
        <p>Last updated: June 2025</p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">1. Information We Collect</h2>
        <p>We collect information you provide when creating an account, including your name, phone number, and address. We also collect usage data to improve our services.</p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">2. How We Use Your Information</h2>
        <p>Your information is used to provide and improve our services, process transactions, send notifications, and ensure platform security.</p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">3. Data Protection</h2>
        <p>We implement industry-standard security measures to protect your personal data. All payments are processed through encrypted channels.</p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">4. Contact</h2>
        <p>For privacy-related inquiries, contact us at privacy@ustago.uz</p>
      </div>
    </div>
  );
}

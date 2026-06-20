import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | UstaGo",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="prose dark:prose-invert max-w-none space-y-4 text-gray-600 dark:text-gray-300">
        <p>Last updated: June 2025</p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">1. Acceptance of Terms</h2>
        <p>By using UstaGo, you agree to these terms. If you do not agree, do not use our services.</p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">2. User Accounts</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information when creating an account.</p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">3. Services</h2>
        <p>UstaGo connects customers with service providers. We are not a party to service agreements between customers and masters.</p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">4. Payments</h2>
        <p>All payments are processed through our escrow system. Funds are released to masters only after job completion confirmation.</p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">5. Disputes</h2>
        <p>In case of disputes, UstaGo will mediate. We reserve the right to make final decisions based on available evidence.</p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">6. Prohibited Conduct</h2>
        <p>Users may not engage in fraudulent activities, abuse the platform, or violate applicable laws.</p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">7. Limitation of Liability</h2>
        <p>UstaGo is not liable for damages arising from service delivery. Our maximum liability is limited to the transaction amount.</p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">8. Contact</h2>
        <p>For questions about these terms, contact legal@ustago.uz</p>
      </div>
    </div>
  );
}

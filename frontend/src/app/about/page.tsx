import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | UstaGo",
  description: "UstaGo is Uzbekistan's leading service marketplace connecting customers with trusted professionals.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">About UstaGo</h1>
      <div className="prose dark:prose-invert max-w-none space-y-4">
        <p className="text-lg text-gray-600 dark:text-gray-300">
          UstaGo is Uzbekistan's premier service marketplace platform. We connect customers with verified, trusted
          masters for home services, repairs, cleaning, and more.
        </p>
        <p>
          Founded with a mission to make quality services accessible to everyone, UstaGo has grown to serve
          thousands of customers across Tashkent and beyond. Our platform handles everything from finding the
          right master to secure payments and reviews.
        </p>
        <h2 className="text-xl font-semibold mt-8">Our Mission</h2>
        <p>
          To create a trusted ecosystem where customers find reliable masters and professionals build
          sustainable businesses.
        </p>
        <h2 className="text-xl font-semibold mt-8">Why Choose UstaGo?</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Verified masters with background checks</li>
          <li>Secure escrow payment system</li>
          <li>Transparent pricing with no hidden fees</li>
          <li>Real customer reviews and ratings</li>
          <li>24/7 customer support</li>
          <li>AI-powered matching for faster results</li>
        </ul>
      </div>
    </div>
  );
}

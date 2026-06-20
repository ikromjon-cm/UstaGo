import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Offline | UstaGo",
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark">
      <div className="text-center">
        <div className="w-20 h-20 rounded-[20px] bg-gray-200 dark:bg-dark-50 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl font-bold text-gray-400">!</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">You are offline</h1>
        <p className="text-gray-500 mb-8">Please check your internet connection</p>
        <Link href="/" className="btn-primary px-8 py-3 rounded-[12px]">
          Try Again
        </Link>
      </div>
    </div>
  );
}

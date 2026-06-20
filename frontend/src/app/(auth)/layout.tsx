import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UstaGo - Authentication",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-950 via-dark to-dark p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">UstaGo</h1>
          <p className="text-gray-400 mt-1">Service Marketplace</p>
        </div>
        {children}
      </div>
    </div>
  );
}

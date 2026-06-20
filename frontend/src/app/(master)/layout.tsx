"use client";

import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Header } from "@/components/layout/Header";

export default function MasterLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'master') {
      router.replace('/');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

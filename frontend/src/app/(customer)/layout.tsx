import { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/ui/BottomNav";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 lg:pb-0">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      <BottomNav />
    </div>
  );
}

import { ReactNode } from "react";
import { Header } from "@/components/layout/Header";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

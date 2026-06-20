"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <form onSubmit={e => { e.preventDefault(); if (query) router.push(`/masters?q=${query}`); }}
      className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      <input
        className="input pl-12 pr-4 h-14 text-base bg-white dark:bg-dark-50 shadow-sm"
        placeholder="Search for any service..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
    </form>
  );
}

"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <form
      onSubmit={e => { e.preventDefault(); if (query.trim()) router.push(`/masters?q=${query}`); }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-[16px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
      <div className="relative flex items-center bg-white/95 dark:bg-dark-50/95 backdrop-blur-md rounded-[16px] border-2 border-gray-200 dark:border-gray-700 group-focus-within:border-primary/50 group-focus-within:shadow-lg group-focus-within:shadow-primary/10 transition-all duration-300">
        <Search className="ml-4 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
        <input
          className="flex-1 px-3 py-4 bg-transparent border-none focus:outline-none text-base placeholder:text-gray-400"
          placeholder="Search for a service, master, or category..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} className="mr-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors">
            <X size={16} className="text-gray-400" />
          </button>
        )}
        <button type="submit" className="mr-2 px-5 py-2.5 bg-gradient-to-br from-primary to-primary-600 text-white font-semibold rounded-[12px] hover:shadow-md hover:shadow-primary/25 active:scale-[0.97] transition-all duration-200 text-sm">
          Search
        </button>
      </div>
    </form>
  );
}

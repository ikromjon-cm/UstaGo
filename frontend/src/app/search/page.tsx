"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { MasterCard } from "@/components/ui/MasterCard";

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      setLoading(true);
      fetch(`/api/v1/masters/?search=${query}`)
        .then(r => r.json())
        .then(data => setResults(data.results || []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Search Results</h1>
        {query && <p className="text-gray-500 mt-1">Results for &quot;{query}&quot;</p>}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse card p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-[14px] skeleton" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-48 skeleton" />
                  <div className="h-3 w-32 skeleton" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16">
          <Search size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No results found</h2>
          <p className="text-gray-500">Try adjusting your search or browse categories</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((master: any) => (
            <MasterCard key={master.id} {...master} />
          ))}
        </div>
      )}
    </div>
  );
}

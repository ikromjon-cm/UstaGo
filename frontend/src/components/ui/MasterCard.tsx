"use client";

import Link from "next/link";
import { Star, MapPin, CheckCircle, Wifi } from "lucide-react";

interface Props {
  id: string;
  user: { full_name: string; avatar: string | null };
  rating: number;
  completed_jobs: number;
  distance?: number;
  is_online?: boolean;
  is_verified?: boolean;
  price_per_hour?: string;
}

export function MasterCard({ id, user, rating, completed_jobs, distance, is_online, is_verified, price_per_hour }: Props) {
  return (
    <Link href={`/masters/${id}`} className="group block">
      <div className="card-hover p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 via-primary-50/0 to-primary-50/50 dark:from-primary-950/0 dark:via-primary-950/0 dark:to-primary-950/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative flex items-start gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-[16px] bg-gradient-to-br from-primary via-primary-500 to-primary-400 flex items-center justify-center text-white font-bold text-xl shadow-sm shadow-primary/20 group-hover:shadow-md group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-105">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            {is_online && (
              <div className="absolute -bottom-1 -right-1">
                <div className="w-5 h-5 bg-success rounded-full border-[3px] border-white dark:border-dark flex items-center justify-center">
                  <Wifi size={8} className="text-white" />
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{user.full_name}</h3>
              {is_verified && (
                <CheckCircle size={16} className="text-primary shrink-0" fill="#2563EB" color="white" />
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
              <span className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-md text-xs font-medium">
                <Star size={12} fill="currentColor" /> {typeof rating === 'number' ? rating.toFixed(1) : rating}
              </span>
              <span className="text-gray-400">|</span>
              <span>{completed_jobs} jobs done</span>
              {distance && (
                <>
                  <span className="text-gray-400">|</span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-gray-400" /> {distance} km
                  </span>
                </>
              )}
            </div>
            {price_per_hour && (
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-primary font-bold text-sm">{Number(price_per_hour).toLocaleString()} UZS</span>
                <span className="text-gray-400 text-xs">/ hour</span>
              </div>
            )}
          </div>
          <div className="shrink-0 self-center">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-dark-50 flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 group-hover:text-primary transition-all duration-200">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 group-hover:text-primary transition-colors"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

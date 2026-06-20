"use client";

import Link from "next/link";
import { Star, MapPin, CheckCircle } from "lucide-react";

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
    <Link href={`/masters/${id}`} className="card-hover p-4 flex items-start gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-[14px] bg-gradient-to-br from-primary to-primary-400 flex items-center justify-center text-white font-bold text-lg">
          {user.full_name.charAt(0)}
        </div>
        {is_online && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-2 border-white dark:border-dark" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold truncate">{user.full_name}</h3>
          {is_verified && <CheckCircle size={16} className="text-primary shrink-0" />}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Star size={14} className="text-warning" fill="currentColor" />
            {rating}
          </span>
          <span>{completed_jobs} jobs</span>
          {distance && (
            <span className="flex items-center gap-1">
              <MapPin size={14} /> {distance} km
            </span>
          )}
        </div>
        {price_per_hour && (
          <p className="text-primary font-semibold text-sm mt-1">{price_per_hour} UZS/hr</p>
        )}
      </div>
    </Link>
  );
}

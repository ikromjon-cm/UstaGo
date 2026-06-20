export function CardSkeleton() {
  return (
    <div className="card p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-[14px] skeleton" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-24 skeleton" />
          <div className="h-3 w-16 skeleton" />
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
          <div className="w-10 h-10 rounded-[10px] skeleton" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-3/4 skeleton" />
            <div className="h-3 w-1/2 skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="flex gap-4 p-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex-1 h-4 skeleton" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-t border-gray-100 dark:border-gray-800">
          {[1, 2, 3, 4, 5].map(j => (
            <div key={j} className="flex-1 h-4 skeleton" style={{ width: `${60 + Math.random() * 30}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full skeleton" />
        <div className="space-y-2">
          <div className="h-5 w-40 skeleton" />
          <div className="h-4 w-24 skeleton" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full skeleton" />
        <div className="h-4 w-3/4 skeleton" />
        <div className="h-4 w-1/2 skeleton" />
      </div>
    </div>
  );
}

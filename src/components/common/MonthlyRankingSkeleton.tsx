export default function MonthlyRankingSkeleton() {
  return (
    <div className="rounded-lg border border-tm-copper/30 dark:border-white/10 overflow-hidden bg-white/60 dark:bg-tm-haze/40 animate-pulse">
      {/* Header */}
      <div className="bg-tm-copper/10 dark:bg-white/5 px-4 py-3 border-b border-tm-copper/20 dark:border-white/10">
        <div className="h-4 bg-tm-copper/20 dark:bg-white/10 rounded w-24 mb-2"></div>
        <div className="h-3 bg-tm-copper/15 dark:bg-white/8 rounded w-16"></div>
      </div>

      {/* Player rows */}
      <div className="divide-y divide-tm-copper/10 dark:divide-white/5">
        {[...Array(5)].map((_, idx) => (
          <div key={idx} className="px-4 py-2.5">
            <div className="flex items-center gap-3 mb-2">
              {/* Position badge */}
              <div className="flex h-6 w-6 rounded-full bg-tm-copper/20 dark:bg-white/10"></div>

              {/* Color dot */}
              <div className="w-2.5 h-2.5 rounded-full bg-tm-copper/15 dark:bg-white/8"></div>

              {/* Name */}
              <div className="flex-1">
                <div className="h-4 bg-tm-copper/20 dark:bg-white/10 rounded" style={{ width: `${60 + Math.random() * 40}%` }}></div>
              </div>

              {/* Rating */}
              <div className="h-4 bg-tm-copper/20 dark:bg-white/10 rounded w-12"></div>
            </div>

            {/* Stats line */}
            <div className="flex items-center gap-4 ml-9">
              <div className="h-3 bg-tm-copper/15 dark:bg-white/8 rounded w-20"></div>
              <div className="h-3 bg-tm-copper/15 dark:bg-white/8 rounded w-24"></div>
              <div className="h-3 bg-tm-copper/15 dark:bg-white/8 rounded w-10"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

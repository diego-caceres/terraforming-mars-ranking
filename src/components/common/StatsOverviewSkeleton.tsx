export default function StatsOverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[...Array(4)].map((_, idx) => (
        <div key={idx} className="tm-card">
          <div className="p-6">
            {/* Icon */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-tm-copper/20 dark:bg-white/10"></div>
              <div className="w-6 h-6 rounded-full bg-tm-copper/15 dark:bg-white/8"></div>
            </div>

            {/* Value */}
            <div className="h-8 bg-tm-copper/25 dark:bg-white/15 rounded w-20 mb-2"></div>

            {/* Label */}
            <div className="h-4 bg-tm-copper/15 dark:bg-white/8 rounded w-32"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

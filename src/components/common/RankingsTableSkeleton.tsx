export default function RankingsTableSkeleton() {
  return (
    <div className="tm-card overflow-hidden animate-pulse">
      {/* Header */}
      <div className="tm-card-header px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-3 bg-tm-copper/20 dark:bg-white/10 rounded w-32 mb-2"></div>
            <div className="h-6 bg-tm-copper/25 dark:bg-white/15 rounded w-48"></div>
          </div>
          <div className="h-9 bg-tm-copper/20 dark:bg-white/10 rounded w-36"></div>
        </div>

        {/* Sort buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="h-8 bg-tm-copper/15 dark:bg-white/8 rounded-full w-24"></div>
          ))}
        </div>

        {/* View mode toggle */}
        <div className="mt-4 border-t border-tm-copper/20 pt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2 flex-wrap">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="h-10 bg-tm-copper/15 dark:bg-white/8 rounded-full w-40"></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white/60 dark:bg-transparent">
        <table className="w-full">
          <thead className="bg-tm-copper/10 dark:bg-white/5">
            <tr>
              <th className="px-6 py-3">
                <div className="h-3 bg-tm-copper/20 dark:bg-white/10 rounded w-16"></div>
              </th>
              <th className="px-6 py-3">
                <div className="h-3 bg-tm-copper/20 dark:bg-white/10 rounded w-20"></div>
              </th>
              <th className="px-6 py-3">
                <div className="h-3 bg-tm-copper/20 dark:bg-white/10 rounded w-16"></div>
              </th>
              <th className="px-6 py-3">
                <div className="h-3 bg-tm-copper/20 dark:bg-white/10 rounded w-12"></div>
              </th>
              <th className="px-6 py-3">
                <div className="h-3 bg-tm-copper/20 dark:bg-white/10 rounded w-20"></div>
              </th>
              <th className="px-6 py-3">
                <div className="h-3 bg-tm-copper/20 dark:bg-white/10 rounded w-24"></div>
              </th>
              <th className="px-6 py-3">
                <div className="h-3 bg-tm-copper/20 dark:bg-white/10 rounded w-24"></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tm-copper/20 dark:divide-white/10 bg-white/70 dark:bg-transparent">
            {[...Array(10)].map((_, idx) => (
              <tr key={idx}>
                {/* Position */}
                <td className="px-6 py-4">
                  <div className="flex h-8 w-8 rounded-full bg-tm-copper/20 dark:bg-white/10"></div>
                </td>
                {/* Player name */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-tm-copper/15 dark:bg-white/8"></div>
                    <div className="h-4 bg-tm-copper/20 dark:bg-white/10 rounded" style={{ width: `${80 + Math.random() * 60}px` }}></div>
                    {idx < 3 && (
                      <div className="h-5 bg-tm-copper/15 dark:bg-white/8 rounded-full w-12"></div>
                    )}
                  </div>
                </td>
                {/* Rating */}
                <td className="px-6 py-4">
                  <div className="h-4 bg-tm-copper/20 dark:bg-white/10 rounded w-12"></div>
                </td>
                {/* Peak */}
                <td className="px-6 py-4">
                  <div className="h-4 bg-tm-copper/15 dark:bg-white/8 rounded w-12"></div>
                </td>
                {/* Games */}
                <td className="px-6 py-4">
                  <div className="h-4 bg-tm-copper/15 dark:bg-white/8 rounded w-8"></div>
                </td>
                {/* Win Rate */}
                <td className="px-6 py-4">
                  <div className="h-4 bg-tm-copper/15 dark:bg-white/8 rounded w-12"></div>
                </td>
                {/* Last Change */}
                <td className="px-6 py-4">
                  <div className="h-4 bg-tm-copper/15 dark:bg-white/8 rounded w-10"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

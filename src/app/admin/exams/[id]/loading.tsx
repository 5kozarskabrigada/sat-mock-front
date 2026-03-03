export default function Loading() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Breadcrumb / Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      {/* Stats Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white overflow-hidden shadow-sm ring-1 ring-gray-200 rounded-xl px-6 py-5">
            <div className="h-4 w-20 bg-gray-200 rounded mb-3"></div>
            <div className="h-6 w-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>

      {/* Questions section skeleton */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="h-6 w-36 bg-gray-200 rounded"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

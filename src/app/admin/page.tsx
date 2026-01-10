
export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Students */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Total Students</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">--</dd>
          </div>
        </div>
        
        {/* Card 2: Exams */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Active Exams</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">--</dd>
          </div>
        </div>
      </div>
    </div>
  )
}


'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/')
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Students', href: '/admin/students' },
    { name: 'Exams', href: '/admin/exams' },
  ]

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <span className="text-xl font-bold text-indigo-600">SAT Admin</span>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md group ${
                isActive(item.href) && item.href !== '/admin' || (item.href === '/admin' && pathname === '/admin')
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 truncate w-48" title={email}>
                {email}
              </p>
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

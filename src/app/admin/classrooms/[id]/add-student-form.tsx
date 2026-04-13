'use client'

import { useRef, useState } from 'react'
import { addStudentToClassroom, searchStudents } from '../actions'

export default function AddStudentToClassroomForm({ classroomId, onAdded }: { classroomId: string, onAdded?: () => void }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedStudent(null)
    setError(null)
    setSuccess(null)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (value.length > 0) {
      debounceRef.current = setTimeout(async () => {
        const results = await searchStudents(value)
        setSuggestions(results)
        setShowSuggestions(true)
      }, 300)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const selectStudent = (student: any) => {
    setQuery(student.username)
    setSelectedStudent(student)
    setShowSuggestions(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedStudent) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    const result = await addStudentToClassroom(classroomId, selectedStudent.id)
    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setQuery('')
    setSelectedStudent(null)
    setSuggestions([])
    setSuccess('Student added successfully!')
    onAdded?.()
  }

  return (
    <div className="bg-white shadow sm:rounded-lg border border-gray-200 mb-6 relative overflow-visible">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-xl leading-6 font-bold text-gray-900 mb-6">Add Student to Classroom</h3>
        <form onSubmit={handleSubmit} className="flex gap-6 items-end">
          <div className="flex-1 relative">
            <label htmlFor="username" className="block text-base font-bold text-gray-700 mb-2">
              Search Student
            </label>
            <div className="mt-1 relative">
              <input
                type="text"
                name="username"
                id="username"
                value={query}
                onChange={handleSearch}
                onFocus={() => query.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                autoComplete="off"
                required
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg p-4 border text-black h-14.5"
                placeholder="Type username or name..."
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-10 mt-2 max-h-80 w-full overflow-auto rounded-lg bg-white py-2 text-lg shadow-2xl ring-1 ring-black ring-opacity-10 focus:outline-none">
                  {suggestions.map((student: any) => (
                    <li
                      key={student.id}
                      onClick={() => selectStudent(student)}
                      className="relative cursor-pointer select-none py-4 pl-4 pr-9 hover:bg-indigo-600 hover:text-white text-gray-900 border-b border-gray-100 last:border-0"
                    >
                      <span className="block truncate font-bold text-lg">{student.username}</span>
                      <span className="block truncate text-sm opacity-70 mt-1">
                        {student.first_name} {student.last_name}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {selectedStudent && (
              <p className="mt-2 text-sm text-green-600 font-medium">Selected: {selectedStudent.first_name} {selectedStudent.last_name}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !selectedStudent}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-6 text-lg font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 h-14.5"
          >
            {loading ? 'Adding...' : 'Add Student'}
          </button>
        </form>
        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
        {success && <div className="mt-2 text-sm text-green-600">{success}</div>}
      </div>
    </div>
  )
}

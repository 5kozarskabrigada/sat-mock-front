
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { addStudentToClassroom, searchStudents } from '../actions'
import { useState, useEffect, useRef } from 'react'

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
    >
      {pending ? 'Adding...' : 'Add Student'}
    </button>
  )
}

export default function AddStudentToClassroomForm({ classroomId }: { classroomId: string }) {
  const addStudentWithId = addStudentToClassroom.bind(null, classroomId)
  const [state, formAction] = useFormState(addStudentWithId, null)
  
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (state?.success) {
      setQuery('')
      setSelectedStudent(null)
    }
  }, [state])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedStudent(null) // Reset selection on edit
    
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

  return (
    <div className="bg-white shadow sm:rounded-lg border border-gray-200 mb-6 relative overflow-visible">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add Student to Classroom</h3>
        <form action={formAction} className="flex gap-4 items-end">
          <div className="flex-1 relative">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
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
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
                autoComplete="off"
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black"
                placeholder="Type username or name..."
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {suggestions.map((student) => (
                    <li
                      key={student.id}
                      onClick={() => selectStudent(student)}
                      className="relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white text-gray-900"
                    >
                      <span className="block truncate font-medium">{student.username}</span>
                      <span className="block truncate text-xs opacity-70">
                         {student.first_name} {student.last_name}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {selectedStudent && (
                 <p className="mt-1 text-xs text-green-600">Selected: {selectedStudent.first_name} {selectedStudent.last_name}</p>
            )}
          </div>
          <SubmitButton disabled={!selectedStudent} />
        </form>
        {state?.error && (
             <div className="mt-2 text-sm text-red-600">{state.error}</div>
        )}
        {state?.success && (
             <div className="mt-2 text-sm text-green-600">Student added successfully!</div>
        )}
      </div>
    </div>
  )
}

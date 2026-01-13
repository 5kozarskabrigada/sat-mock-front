
'use client'

import { Fragment, useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Link from 'next/link'

interface ValidationData {
    isValid: boolean
    current: {
        rwM1: number
        rwM2: number
        mathM1: number
        mathM2: number
    }
    required: {
        rwM1: number
        rwM2: number
        mathM1: number
        mathM2: number
    }
}

interface ActivationErrorModalProps {
  isOpen: boolean
  onClose: () => void
  validation: ValidationData | null
  examId?: string
  context: 'list' | 'details'
}

export default function ActivationErrorModal({
  isOpen,
  onClose,
  validation,
  examId,
  context
}: ActivationErrorModalProps) {
  const cancelButtonRef = useRef(null)

  if (!validation) return null

  const isListContext = context === 'list'
  
  // Calculate totals for summary message
  const totalRequired = validation.required.rwM1 + validation.required.rwM2 + validation.required.mathM1 + validation.required.mathM2
  const totalCurrent = validation.current.rwM1 + validation.current.rwM2 + validation.current.mathM1 + validation.current.mathM2

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" initialFocus={cancelButtonRef} onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                        {isListContext 
                            ? "Cannot activate this exam - insufficient questions available" 
                            : "Activation blocked - question requirements not met"}
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 mb-4">
                          This exam requires {totalRequired} questions but only has {totalCurrent} available.
                        </p>
                        
                        {/* Detailed Breakdown */}
                        <div className="bg-gray-50 rounded-md p-3 text-sm space-y-2">
                            <h4 className="font-medium text-gray-700 text-xs uppercase tracking-wide mb-2">Requirements Status</h4>
                            
                            {/* Reading & Writing */}
                            <div className="flex justify-between items-center py-1 border-b border-gray-200">
                                <span className="text-gray-600">Reading & Writing (M1)</span>
                                <span className={`font-mono font-medium ${validation.current.rwM1 === validation.required.rwM1 ? 'text-green-600' : 'text-red-600'}`}>
                                    {validation.current.rwM1} / {validation.required.rwM1}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-gray-200">
                                <span className="text-gray-600">Reading & Writing (M2)</span>
                                <span className={`font-mono font-medium ${validation.current.rwM2 === validation.required.rwM2 ? 'text-green-600' : 'text-red-600'}`}>
                                    {validation.current.rwM2} / {validation.required.rwM2}
                                </span>
                            </div>

                            {/* Math */}
                            <div className="flex justify-between items-center py-1 border-b border-gray-200">
                                <span className="text-gray-600">Math (M1)</span>
                                <span className={`font-mono font-medium ${validation.current.mathM1 === validation.required.mathM1 ? 'text-green-600' : 'text-red-600'}`}>
                                    {validation.current.mathM1} / {validation.required.mathM1}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-gray-600">Math (M2)</span>
                                <span className={`font-mono font-medium ${validation.current.mathM2 === validation.required.mathM2 ? 'text-green-600' : 'text-red-600'}`}>
                                    {validation.current.mathM2} / {validation.required.mathM2}
                                </span>
                            </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
                  {!isListContext && examId && (
                      <Link
                        href={`/admin/exams/${examId}`}
                        onClick={onClose} // Just close modal, navigation happens
                        className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:w-auto"
                      >
                        Add Questions
                      </Link>
                  )}
                  {isListContext && examId && (
                      <Link
                        href={`/admin/exams/${examId}`}
                        onClick={onClose}
                        className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:w-auto"
                      >
                        Manage Questions
                      </Link>
                  )}
                  <button
                    type="button"
                    className={`mt-3 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset sm:mt-0 sm:w-auto ${isListContext ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-white text-gray-900 ring-gray-300 hover:bg-gray-50'}`}
                    onClick={onClose}
                    ref={cancelButtonRef}
                  >
                    {isListContext ? 'OK' : 'Cancel'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

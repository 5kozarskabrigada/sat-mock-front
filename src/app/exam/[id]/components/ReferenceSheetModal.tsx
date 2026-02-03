
'use client'

import FloatingWindow from '@/components/ui/floating-window'

interface ReferenceSheetModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ReferenceSheetModal({ isOpen, onClose }: ReferenceSheetModalProps) {
  return (
    <FloatingWindow
      id="math_reference_sheet"
      title="Mathematics Reference Sheet"
      isOpen={isOpen}
      onClose={onClose}
      minWidth={300}
      minHeight={200}
      defaultWidth={850}
      defaultHeight={650}
    >
      <div className="bg-white overflow-auto h-full select-none flex flex-col">
        <div className="flex-1 flex items-start justify-center p-4">
            <img 
                src="/images/reference-sheet.png" 
                alt="Mathematics Reference Sheet" 
                className="max-w-full h-auto object-contain shadow-sm border border-gray-100 rounded"
                draggable={false}
            />
        </div>
      </div>
    </FloatingWindow>
  )
}

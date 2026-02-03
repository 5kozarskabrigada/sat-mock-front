
'use client'

import { useState } from 'react'
import FloatingWindow from '@/components/ui/floating-window'

interface ReferenceSheetModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ReferenceSheetModal({ isOpen, onClose }: ReferenceSheetModalProps) {
  const [imageError, setImageError] = useState(false)

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
            {!imageError ? (
                <img 
                    src="https://learn.crimsonreview.com/wp-content/uploads/sites/2/2024/01/image-1024x595.png" 
                    alt="Mathematics Reference Sheet" 
                    className="max-w-full h-auto object-contain shadow-sm border border-gray-100 rounded"
                    draggable={false}
                    onError={() => setImageError(true)}
                />
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 max-w-md">
                        <p className="font-bold mb-2">Image Not Found</p>
                        <p className="text-sm">
                            Failed to load the reference sheet image from the external source.<br/>
                            <code className="bg-red-100 px-1 rounded text-[10px] break-all">https://learn.crimsonreview.com/wp-content/uploads/sites/2/2024/01/image-1024x595.png</code>
                        </p>
                    </div>
                    <p className="text-gray-400 text-xs italic">
                        Tip: If you just added the file, you might need to refresh the page or restart the dev server.
                    </p>
                </div>
            )}
        </div>
      </div>
    </FloatingWindow>
  )
}

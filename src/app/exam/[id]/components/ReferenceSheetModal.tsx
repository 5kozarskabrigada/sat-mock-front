
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
      defaultWidth={800}
      defaultHeight={600}
    >
      <div className="p-6 bg-white overflow-y-auto h-full select-none">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {/* Circle */}
            <div className="flex flex-col items-center">
                <div className="w-24 h-24 border-2 border-black rounded-full relative mb-2">
                    <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-black rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute top-1/2 left-1/2 w-12 h-px bg-black -translate-y-1/2"></div>
                    <span className="absolute top-1/2 left-3/4 -translate-y-full text-xs italic">r</span>
                </div>
                <div className="text-center">
                    <p className="text-sm font-serif italic">A = πr²</p>
                    <p className="text-sm font-serif italic">C = 2πr</p>
                </div>
            </div>

            {/* Rectangle */}
            <div className="flex flex-col items-center">
                <div className="w-32 h-20 border-2 border-black relative mb-2">
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full text-xs italic">l</span>
                    <span className="absolute top-1/2 right-0 translate-x-full -translate-y-1/2 text-xs italic pr-1">w</span>
                </div>
                <div className="text-center">
                    <p className="text-sm font-serif italic">A = lw</p>
                </div>
            </div>

            {/* Triangle */}
            <div className="flex flex-col items-center">
                <div className="w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[60px] border-b-black relative mb-2">
                    <div className="absolute top-0 left-0 w-px h-[60px] bg-black border-dashed"></div>
                    <span className="absolute top-1/2 left-0 -translate-x-full text-xs italic">h</span>
                    <span className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-full text-xs italic">b</span>
                </div>
                <div className="text-center">
                    <p className="text-sm font-serif italic">A = ½bh</p>
                </div>
            </div>

            {/* Right Triangle (Pythagorean) */}
            <div className="flex flex-col items-center">
                <div className="w-24 h-32 border-l-2 border-b-2 border-black relative mb-2">
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-t-2 border-r-2 border-black"></div>
                    <span className="absolute top-1/2 left-0 -translate-x-full text-xs italic">b</span>
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full text-xs italic">a</span>
                    <span className="absolute top-1/2 left-1/2 translate-x-1/2 -translate-y-1/2 text-xs italic">c</span>
                </div>
                <div className="text-center">
                    <p className="text-sm font-serif italic">c² = a² + b²</p>
                </div>
            </div>

            {/* Special Right Triangle 30-60-90 */}
            <div className="flex flex-col items-center">
                <div className="w-20 h-32 border-l-2 border-b-2 border-black relative mb-2">
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-t-2 border-r-2 border-black"></div>
                    <span className="absolute top-4 left-2 text-[10px] font-bold">30°</span>
                    <span className="absolute bottom-2 right-4 text-[10px] font-bold">60°</span>
                    <span className="absolute top-1/2 left-0 -translate-x-full text-xs italic">x√3</span>
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full text-xs italic">x</span>
                    <span className="absolute top-1/2 left-1/2 translate-x-1/2 -translate-y-1/2 text-xs italic">2x</span>
                </div>
                <div className="text-center">
                    <p className="text-xs font-serif">Special Right Triangles</p>
                </div>
            </div>

            {/* Special Right Triangle 45-45-90 */}
            <div className="flex flex-col items-center">
                <div className="w-24 h-24 border-l-2 border-b-2 border-black relative mb-2">
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-t-2 border-r-2 border-black"></div>
                    <span className="absolute top-4 left-2 text-[10px] font-bold">45°</span>
                    <span className="absolute bottom-2 right-4 text-[10px] font-bold">45°</span>
                    <span className="absolute top-1/2 left-0 -translate-x-full text-xs italic">s</span>
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full text-xs italic">s</span>
                    <span className="absolute top-1/2 left-1/2 translate-x-1/2 -translate-y-1/2 text-xs italic">s√2</span>
                </div>
                <div className="text-center">
                    <p className="text-xs font-serif">Special Right Triangles</p>
                </div>
            </div>

            {/* Rectangular Prism */}
            <div className="flex flex-col items-center">
                <div className="w-32 h-20 border-2 border-black relative mb-2">
                    {/* Simplified 3D look */}
                    <div className="absolute -top-3 left-3 w-32 h-20 border-2 border-black border-dashed"></div>
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full text-xs italic">l</span>
                    <span className="absolute top-1/2 right-0 translate-x-full -translate-y-1/2 text-xs italic">w</span>
                    <span className="absolute bottom-1/2 left-0 -translate-x-full text-xs italic">h</span>
                </div>
                <div className="text-center mt-4">
                    <p className="text-sm font-serif italic">V = lwh</p>
                </div>
            </div>

            {/* Cylinder */}
            <div className="flex flex-col items-center">
                <div className="w-24 h-32 border-x-2 border-black rounded-[40px/20px] relative mb-2">
                    <div className="absolute top-0 left-0 w-full h-10 border-2 border-black rounded-full"></div>
                    <div className="absolute bottom-0 left-0 w-full h-10 border-b-2 border-black rounded-full"></div>
                    <div className="absolute top-5 left-1/2 w-10 h-px bg-black"></div>
                    <span className="absolute top-5 left-3/4 text-xs italic">r</span>
                    <span className="absolute top-1/2 left-0 -translate-x-full text-xs italic">h</span>
                </div>
                <div className="text-center">
                    <p className="text-sm font-serif italic">V = πr²h</p>
                </div>
            </div>

            {/* Sphere */}
            <div className="flex flex-col items-center">
                <div className="w-24 h-24 border-2 border-black rounded-full relative mb-2">
                    <div className="absolute top-1/2 left-0 w-full h-8 border-t border-black border-dashed rounded-[100%/100%]"></div>
                    <div className="absolute top-1/2 left-1/2 w-10 h-px bg-black"></div>
                    <span className="absolute top-1/2 left-3/4 text-xs italic">r</span>
                </div>
                <div className="text-center">
                    <p className="text-sm font-serif italic">V = 4/3 πr³</p>
                </div>
            </div>
        </div>

        {/* Text Info */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-sm space-y-2 text-gray-700">
            <p>The number of degrees of arc in a circle is 360.</p>
            <p>The number of radians of arc in a circle is 2π.</p>
            <p>The sum of the measures in degrees of the angles of a triangle is 180.</p>
        </div>
      </div>
    </FloatingWindow>
  )
}

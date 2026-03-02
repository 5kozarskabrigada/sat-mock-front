'use client'

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useState } from 'react'

export default function DownloadBreakdownButton({ studentName, examTitle }: { studentName: string, examTitle: string }) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    const questionBreakdown = document.getElementById('question-breakdown')
    
    if (!questionBreakdown) return

    setIsGenerating(true)
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      const canvas = await html2canvas(questionBreakdown, {
        scale: 2,
        useCORS: true,
        logging: false
      })

      const imgData = canvas.toDataURL('image/png')
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      
      // Calculate dimensions to fit page width
      const imgFitWidth = pdfWidth
      const imgFitHeight = (imgHeight * pdfWidth) / imgWidth
      
      // If content is taller than one page, we need multiple pages
      let heightLeft = imgFitHeight
      let position = 0
      
      // Add first chunk
      pdf.addImage(imgData, 'PNG', 0, position, imgFitWidth, imgFitHeight)
      heightLeft -= pdfHeight
      
      // Add additional pages if needed
      while (heightLeft > 0) {
        position -= pdfHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgFitWidth, imgFitHeight)
        heightLeft -= pdfHeight
      }
      
      pdf.save(`${studentName} - ${examTitle} Question Breakdown.pdf`)
    } catch (error) {
      console.error('Failed to generate PDF', error)
      alert('Failed to generate PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="inline-flex items-center px-3 py-1.5 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
    >
      {isGenerating ? (
        <>
          <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generating...
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </>
      )}
    </button>
  )
}

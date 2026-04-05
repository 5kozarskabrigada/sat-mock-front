
'use client'

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useState } from 'react'

export default function DownloadReportButton({ studentName, examTitle }: { studentName: string, examTitle: string }) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    const resultsPage = document.getElementById('submission-results-pdf')
    
    if (!resultsPage) return

    setIsGenerating(true)
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      const canvas = await html2canvas(resultsPage, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f9fafb'
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
      
      pdf.save(`${studentName} - ${examTitle} Submission Results.pdf`)
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
      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
    >
      {isGenerating ? 'Generating PDF...' : 'Download Full PDF'}
    </button>
  )
}

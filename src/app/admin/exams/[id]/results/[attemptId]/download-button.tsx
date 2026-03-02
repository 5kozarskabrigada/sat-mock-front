
'use client'

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useState } from 'react'

export default function DownloadReportButton({ studentName, examTitle }: { studentName: string, examTitle: string }) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    const scoreReport = document.getElementById('score-report')
    const questionBreakdown = document.getElementById('question-breakdown')
    
    if (!scoreReport) return

    setIsGenerating(true)
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      // Helper function to add element to PDF with multi-page support
      const addElementToPdf = async (element: HTMLElement, startNewPage: boolean = false) => {
        if (startNewPage) {
          pdf.addPage()
        }
        
        const canvas = await html2canvas(element, {
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
      }
      
      // Add score report (first section)
      await addElementToPdf(scoreReport, false)
      
      // Add question breakdown (second section) on a new page
      if (questionBreakdown) {
        await addElementToPdf(questionBreakdown, true)
      }
      
      pdf.save(`${studentName} - ${examTitle} Report.pdf`)
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
      {isGenerating ? 'Generating PDF...' : 'Download Report'}
    </button>
  )
}


'use client'

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useRef, useState } from 'react'

export default function DownloadReportButton({ studentName, examTitle }: { studentName: string, examTitle: string }) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    const element = document.getElementById('score-report')
    if (!element) return

    setIsGenerating(true)
    try {
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      
      // Calculate height to fit width
      const imgFitWidth = pdfWidth
      const imgFitHeight = (imgHeight * pdfWidth) / imgWidth

      pdf.addImage(imgData, 'PNG', 0, 0, imgFitWidth, imgFitHeight)
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

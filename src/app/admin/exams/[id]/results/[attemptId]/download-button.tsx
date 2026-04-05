
'use client'

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useState } from 'react'

const UNSUPPORTED_COLOR_FUNCTION = /\b(?:oklch|oklab|lab|lch|color)\(/i
const COLOR_STYLE_PROPERTIES = [
  'color',
  'background-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'outline-color',
  'text-decoration-color',
  'caret-color',
  'column-rule-color',
  'fill',
  'stroke',
  '-webkit-text-fill-color',
  '-webkit-text-stroke-color',
] as const

function resolveColorValue(value: string): string | null {
  if (!value || value === 'none' || value === 'transparent') {
    return value
  }

  const temp = document.createElement('span')
  temp.style.color = value
  temp.style.position = 'fixed'
  temp.style.pointerEvents = 'none'
  temp.style.opacity = '0'
  document.body.appendChild(temp)

  const resolvedColor = window.getComputedStyle(temp).color
  temp.remove()

  return resolvedColor || null
}

function sanitizeCloneStyles(sourceRoot: HTMLElement, clonedDocument: Document) {
  const clonedRoot = clonedDocument.getElementById('submission-results-pdf')

  if (!clonedRoot) {
    return
  }

  const sourceElements = [sourceRoot, ...Array.from(sourceRoot.querySelectorAll('*'))]
  const clonedElements = [clonedRoot, ...Array.from(clonedRoot.querySelectorAll('*'))]

  sourceElements.forEach((sourceElement, index) => {
    const clonedElement = clonedElements[index]

    if (!(clonedElement instanceof HTMLElement || clonedElement instanceof SVGElement)) {
      return
    }

    const computedStyle = window.getComputedStyle(sourceElement)

    COLOR_STYLE_PROPERTIES.forEach((property) => {
      const value = computedStyle.getPropertyValue(property)

      if (!UNSUPPORTED_COLOR_FUNCTION.test(value)) {
        return
      }

      const resolvedColor = resolveColorValue(value)

      if (resolvedColor) {
        clonedElement.style.setProperty(property, resolvedColor)
      }
    })

    if (UNSUPPORTED_COLOR_FUNCTION.test(computedStyle.boxShadow)) {
      clonedElement.style.boxShadow = 'none'
    }

    if (UNSUPPORTED_COLOR_FUNCTION.test(computedStyle.textShadow)) {
      clonedElement.style.textShadow = 'none'
    }

    if (UNSUPPORTED_COLOR_FUNCTION.test(computedStyle.backgroundImage)) {
      clonedElement.style.backgroundImage = 'none'
    }
  })
}

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
        backgroundColor: '#f9fafb',
        onclone: (clonedDocument) => {
          sanitizeCloneStyles(resultsPage, clonedDocument)
        }
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

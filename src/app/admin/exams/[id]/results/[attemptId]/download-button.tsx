
'use client'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useState } from 'react'

export type PdfDomainStat = {
  name: string
  percentage: number
}

export type PdfModuleSummary = {
  label: string
  correct: number
  total: number
}

export type PdfBreakdownQuestion = {
  number: number
  domain: string
  correctAnswer: string
  studentAnswer: string
  result: 'Correct' | 'Incorrect' | 'Skipped'
}

export type PdfBreakdownSection = {
  label: string
  correct: number
  total: number
  questions: PdfBreakdownQuestion[]
}

type DownloadReportButtonProps = {
  studentName: string
  username: string
  examTitle: string
  completedDate: string
  totalScore: number
  rwScore: number
  mathScore: number
  rwCorrect: number
  rwTotal: number
  mathCorrect: number
  mathTotal: number
  overallCorrect: number
  overallTotal: number
  violations: number
  readingWritingDomains: PdfDomainStat[]
  mathDomains: PdfDomainStat[]
  moduleSummaries: PdfModuleSummary[]
  breakdownSections: PdfBreakdownSection[]
}

const PAGE_MARGIN = 16
const DARK = [17, 24, 39] as const
const MUTED = [107, 114, 128] as const
const BORDER = [229, 231, 235] as const
const PANEL = [249, 250, 251] as const
const WHITE = [255, 255, 255] as const
const LIGHT_TEXT = [156, 163, 175] as const
const BLUE = [37, 99, 235] as const
const GREEN = [22, 163, 74] as const
const AMBER = [217, 119, 6] as const
const RED = [220, 38, 38] as const
const LIGHT_GREEN = [220, 252, 231] as const
const LIGHT_AMBER = [254, 243, 199] as const
const LIGHT_RED = [254, 226, 226] as const
const REPORT_LOGO_PATH = '/images/submission-report-logo.png'

type PdfLogoAsset = {
  dataUrl: string
  format: 'JPEG' | 'PNG'
}

async function loadPdfLogoAsset(url: string): Promise<PdfLogoAsset | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      return null
    }

    const blob = await response.blob()
    const format = blob.type.includes('png') ? 'PNG' : 'JPEG'

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result ?? ''))
      reader.onerror = () => reject(new Error('Failed to read logo image'))
      reader.readAsDataURL(blob)
    })

    if (!dataUrl) {
      return null
    }

    return { dataUrl, format }
  } catch {
    return null
  }
}

function drawContainedLogo(
  pdf: jsPDF,
  logoAsset: PdfLogoAsset,
  x: number,
  y: number,
  boxWidth: number,
  boxHeight: number,
) {
  const imageProps = pdf.getImageProperties(logoAsset.dataUrl)
  const widthRatio = boxWidth / imageProps.width
  const heightRatio = boxHeight / imageProps.height
  const scale = Math.min(widthRatio, heightRatio)
  const renderWidth = imageProps.width * scale
  const renderHeight = imageProps.height * scale
  const renderX = x + (boxWidth - renderWidth) / 2
  const renderY = y + (boxHeight - renderHeight) / 2

  pdf.setFillColor(...WHITE)
  pdf.roundedRect(x, y, boxWidth, boxHeight, 4, 4, 'F')
  pdf.addImage(logoAsset.dataUrl, logoAsset.format, renderX, renderY, renderWidth, renderHeight)
}

function getScoreBarWidth(score: number) {
  return Math.max(0, Math.min(100, (score - 200) / 6))
}

function getDomainAccent(percentage: number): readonly [number, number, number] {
  if (percentage >= 70) {
    return GREEN
  }

  if (percentage >= 40) {
    return AMBER
  }

  return RED
}

function drawReportCover(
  pdf: jsPDF,
  examTitle: string,
  totalScore: number,
  studentName: string,
  username: string,
  completedDate: string,
  logoAsset: PdfLogoAsset | null,
) {
  const pageWidth = pdf.internal.pageSize.getWidth()
  const coverHeight = 68
  const studentNameLines = pdf.splitTextToSize(studentName, pageWidth - PAGE_MARGIN * 2 - 46)
  const usernameLine = `@${username}`

  pdf.setFillColor(...DARK)
  pdf.roundedRect(PAGE_MARGIN, PAGE_MARGIN, pageWidth - PAGE_MARGIN * 2, coverHeight, 4, 4, 'F')

  if (logoAsset) {
    drawContainedLogo(pdf, logoAsset, PAGE_MARGIN + 8, PAGE_MARGIN + 8, 18, 18)
  }

  pdf.setTextColor(...WHITE)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(20)
  pdf.text('SAT Score Report', PAGE_MARGIN + 32, PAGE_MARGIN + 15)

  pdf.setTextColor(...LIGHT_TEXT)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(11)
  pdf.text(examTitle, PAGE_MARGIN + 32, PAGE_MARGIN + 24)

  pdf.setTextColor(...WHITE)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(28)
  pdf.text(`${totalScore}`, pageWidth - PAGE_MARGIN - 8, PAGE_MARGIN + 18, { align: 'right' })

  pdf.setTextColor(...LIGHT_TEXT)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  pdf.text('TOTAL SCORE', pageWidth - PAGE_MARGIN - 8, PAGE_MARGIN + 27, { align: 'right' })

  pdf.setDrawColor(55, 65, 81)
  pdf.line(PAGE_MARGIN + 8, PAGE_MARGIN + 36, pageWidth - PAGE_MARGIN - 8, PAGE_MARGIN + 36)

  pdf.setTextColor(...LIGHT_TEXT)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  pdf.text('STUDENT', PAGE_MARGIN + 8, PAGE_MARGIN + 46)
  pdf.text('DATE', pageWidth - PAGE_MARGIN - 8, PAGE_MARGIN + 46, { align: 'right' })

  pdf.setTextColor(...WHITE)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(13)
  pdf.text(studentNameLines, PAGE_MARGIN + 8, PAGE_MARGIN + 52)
  pdf.text(completedDate, pageWidth - PAGE_MARGIN - 8, PAGE_MARGIN + 52, { align: 'right' })

  pdf.setTextColor(...LIGHT_TEXT)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.text(usernameLine, PAGE_MARGIN + 8, PAGE_MARGIN + 60)

  return PAGE_MARGIN + coverHeight + 12
}

function drawScoreSectionCard(
  pdf: jsPDF,
  x: number,
  y: number,
  width: number,
  title: string,
  score: number,
  domains: PdfDomainStat[],
) {
  const height = 102

  pdf.setFillColor(...PANEL)
  pdf.setDrawColor(...BORDER)
  pdf.roundedRect(x, y, width, height, 4, 4, 'FD')

  pdf.setTextColor(...DARK)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(13)
  pdf.text(title, x + 8, y + 12)
  pdf.text(`${score}`, x + width - 8, y + 12, { align: 'right' })

  const progressY = y + 22
  const progressWidth = width - 16
  pdf.setFillColor(...BORDER)
  pdf.roundedRect(x + 8, progressY, progressWidth, 2.8, 1.4, 1.4, 'F')

  pdf.setFillColor(...DARK)
  pdf.roundedRect(x + 8, progressY, (progressWidth * getScoreBarWidth(score)) / 100, 2.8, 1.4, 1.4, 'F')

  pdf.setTextColor(...MUTED)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  pdf.text('200-800', x + width - 8, progressY + 7, { align: 'right' })

  pdf.setFont('helvetica', 'bold')
  pdf.text('KNOWLEDGE AND SKILLS', x + 8, progressY + 13)

  let rowY = progressY + 20
  domains.forEach((domain) => {
    const labelWidth = width - 52
    const wrappedLabel = pdf.splitTextToSize(domain.name, labelWidth)

    pdf.setTextColor(...DARK)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8.5)
    pdf.text(wrappedLabel, x + 8, rowY)

    const meterX = x + width - 34
    const meterY = rowY - 2
    const meterWidth = 18
    pdf.setFillColor(...BORDER)
    pdf.roundedRect(meterX, meterY, meterWidth, 2.2, 1.1, 1.1, 'F')
    pdf.setFillColor(...getDomainAccent(domain.percentage))
    pdf.roundedRect(meterX, meterY, (meterWidth * domain.percentage) / 100, 2.2, 1.1, 1.1, 'F')

    pdf.setTextColor(...MUTED)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8)
    pdf.text(`${domain.percentage}%`, x + width - 8, rowY, { align: 'right' })

    rowY += Math.max(6, wrappedLabel.length * 4)
  })
}

function drawSummaryMetricCard(
  pdf: jsPDF,
  x: number,
  y: number,
  width: number,
  title: string,
  value: string,
  subtitle: string,
  accent: readonly [number, number, number],
  background: readonly [number, number, number],
) {
  pdf.setFillColor(...background)
  pdf.setDrawColor(...BORDER)
  pdf.roundedRect(x, y, width, 29, 3, 3, 'FD')

  pdf.setTextColor(...MUTED)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  pdf.text(title.toUpperCase(), x + 5, y + 8)

  pdf.setTextColor(...accent)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(16)
  pdf.text(value, x + 5, y + 18)

  pdf.setTextColor(...MUTED)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7.5)
  pdf.text(subtitle, x + 5, y + 25)
}

function drawModuleCard(pdf: jsPDF, x: number, y: number, width: number, summary: PdfModuleSummary) {
  pdf.setFillColor(...WHITE)
  pdf.setDrawColor(...BORDER)
  pdf.roundedRect(x, y, width, 24, 3, 3, 'FD')

  pdf.setTextColor(...MUTED)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  pdf.text(summary.label, x + 5, y + 8)

  pdf.setTextColor(...DARK)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(14)
  pdf.text(`${summary.correct}/${summary.total}`, x + 5, y + 18)
}

function addPageHeader(pdf: jsPDF, title: string, subtitle: string, logoAsset: PdfLogoAsset | null) {
  const pageWidth = pdf.internal.pageSize.getWidth()

  pdf.setFillColor(...DARK)
  pdf.rect(0, 0, pageWidth, 30, 'F')

  pdf.setTextColor(255, 255, 255)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  pdf.text(title, PAGE_MARGIN, 13)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  pdf.text(subtitle, PAGE_MARGIN, 21)

  if (logoAsset) {
    drawContainedLogo(pdf, logoAsset, pageWidth - PAGE_MARGIN - 16, 7, 12, 12)
  }

  return 40
}

function drawStatCard(
  pdf: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
  value: string,
  subtitle: string,
  accent: readonly [number, number, number],
) {
  pdf.setFillColor(...PANEL)
  pdf.setDrawColor(...BORDER)
  pdf.roundedRect(x, y, width, height, 3, 3, 'FD')

  pdf.setFillColor(...accent)
  pdf.roundedRect(x, y, 4, height, 3, 3, 'F')

  pdf.setTextColor(...MUTED)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  pdf.text(title.toUpperCase(), x + 8, y + 10)

  pdf.setTextColor(...DARK)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  pdf.text(value, x + 8, y + 22)

  pdf.setTextColor(...MUTED)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.text(subtitle, x + 8, y + 30)
}

function addSectionHeading(pdf: jsPDF, title: string, y: number) {
  pdf.setTextColor(...DARK)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(13)
  pdf.text(title, PAGE_MARGIN, y)

  pdf.setDrawColor(...BORDER)
  pdf.line(PAGE_MARGIN, y + 3, pdf.internal.pageSize.getWidth() - PAGE_MARGIN, y + 3)

  return y + 10
}

function addPageNumbers(pdf: jsPDF) {
  const pageCount = pdf.getNumberOfPages()
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    pdf.setPage(pageNumber)
    pdf.setTextColor(...MUTED)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.text(`Page ${pageNumber} of ${pageCount}`, pageWidth - PAGE_MARGIN, pageHeight - 8, { align: 'right' })
  }
}

function addDomainTable(pdf: jsPDF, title: string, startY: number, rows: PdfDomainStat[]) {
  autoTable(pdf, {
    startY,
    head: [[title, 'Mastery']],
    body: rows.map((row: any) => [row.name, `${row.percentage}%`]),
    theme: 'grid',
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    headStyles: {
      fillColor: [...DARK],
      textColor: 255,
      fontSize: 10,
      halign: 'left',
    },
    styles: {
      fontSize: 10,
      cellPadding: 4,
      lineColor: [...BORDER],
      lineWidth: 0.1,
    },
    columnStyles: {
      1: { halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
  })

  return (pdf as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? startY
}

export default function DownloadReportButton({
  studentName,
  username,
  examTitle,
  completedDate,
  totalScore,
  rwScore,
  mathScore,
  rwCorrect,
  rwTotal,
  mathCorrect,
  mathTotal,
  overallCorrect,
  overallTotal,
  violations,
  readingWritingDomains,
  mathDomains,
  moduleSummaries,
  breakdownSections,
}: DownloadReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    setIsGenerating(true)
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const contentWidth = pdfWidth - PAGE_MARGIN * 2
      const logoAsset = await loadPdfLogoAsset(REPORT_LOGO_PATH)

      let cursorY = drawReportCover(pdf, examTitle, totalScore, studentName, username, completedDate, logoAsset)

      const sectionGap = 6
      const sectionCardWidth = (contentWidth - sectionGap) / 2
      drawScoreSectionCard(pdf, PAGE_MARGIN, cursorY, sectionCardWidth, 'Reading and Writing', rwScore, readingWritingDomains)
      drawScoreSectionCard(pdf, PAGE_MARGIN + sectionCardWidth + sectionGap, cursorY, sectionCardWidth, 'Math', mathScore, mathDomains)

      pdf.addPage()
      pdf.setFillColor(...WHITE)
      pdf.setDrawColor(...BORDER)
      pdf.roundedRect(PAGE_MARGIN, PAGE_MARGIN, contentWidth, 88, 4, 4, 'FD')

      pdf.setFillColor(...PANEL)
      pdf.roundedRect(PAGE_MARGIN, PAGE_MARGIN, contentWidth, 16, 4, 4, 'F')

      pdf.setTextColor(...MUTED)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(10)
      pdf.text('TEACHER SUMMARY', PAGE_MARGIN + 8, PAGE_MARGIN + 10)

      if (logoAsset) {
        pdf.addImage(logoAsset.dataUrl, logoAsset.format, pdfWidth - PAGE_MARGIN - 34, PAGE_MARGIN + 3, 34, 11)
      }

      const teacherCardGap = 4
      const teacherCardWidth = (contentWidth - teacherCardGap * 3) / 4
      const teacherCardY = PAGE_MARGIN + 22
      drawSummaryMetricCard(pdf, PAGE_MARGIN, teacherCardY, teacherCardWidth, 'Reading & Writing', `${rwCorrect}/${rwTotal}`, 'questions correct', DARK, PANEL)
      drawSummaryMetricCard(pdf, PAGE_MARGIN + teacherCardWidth + teacherCardGap, teacherCardY, teacherCardWidth, 'Math', `${mathCorrect}/${mathTotal}`, 'questions correct', DARK, PANEL)
      drawSummaryMetricCard(pdf, PAGE_MARGIN + (teacherCardWidth + teacherCardGap) * 2, teacherCardY, teacherCardWidth, 'Overall', `${overallCorrect}/${overallTotal}`, 'total correct', DARK, PANEL)
      drawSummaryMetricCard(
        pdf,
        PAGE_MARGIN + (teacherCardWidth + teacherCardGap) * 3,
        teacherCardY,
        teacherCardWidth,
        'Security',
        violations > 0 ? `${violations}` : 'Clean',
        violations > 0 ? 'violations detected' : 'no violations',
        violations > 0 ? RED : GREEN,
        violations > 0 ? LIGHT_RED : LIGHT_GREEN,
      )

      pdf.setDrawColor(...BORDER)
      pdf.line(PAGE_MARGIN + 8, PAGE_MARGIN + 58, PAGE_MARGIN + contentWidth - 8, PAGE_MARGIN + 58)

      pdf.setTextColor(...MUTED)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(9)
      pdf.text('MODULE BREAKDOWN', PAGE_MARGIN + 8, PAGE_MARGIN + 66)

      const moduleGap = 4
      const moduleWidth = (contentWidth - moduleGap * 3) / 4
      moduleSummaries.forEach((summary, index) => {
        drawModuleCard(pdf, PAGE_MARGIN + (moduleWidth + moduleGap) * index, PAGE_MARGIN + 70, moduleWidth, summary)
      })

      breakdownSections.forEach((section) => {
        pdf.addPage()
        const startY = addPageHeader(pdf, section.label, `${section.correct}/${section.total} correct`, logoAsset)

        autoTable(pdf, {
          startY,
          head: [['#', 'Domain', 'Correct Answer', 'Student Answer', 'Result']],
          body: section.questions.map((question: any) => [
            `${question.number}`,
            question.domain,
            question.correctAnswer,
            question.studentAnswer,
            question.result,
          ]),
          theme: 'grid',
          margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
          headStyles: {
            fillColor: [...DARK],
            textColor: 255,
            fontSize: 9,
            halign: 'left',
          },
          styles: {
            fontSize: 9,
            cellPadding: 3,
            overflow: 'linebreak',
            lineColor: [...BORDER],
            lineWidth: 0.1,
            valign: 'middle',
          },
          alternateRowStyles: {
            fillColor: [250, 250, 250],
          },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 66 },
            2: { cellWidth: 30, halign: 'center', fontStyle: 'bold' },
            3: { cellWidth: 34, halign: 'center' },
            4: { cellWidth: 26, halign: 'center', fontStyle: 'bold' },
          },
          didParseCell: (hookData) => {
            if (hookData.section !== 'body' || hookData.column.index !== 4) {
              return
            }

            const result = String(hookData.cell.raw)

            if (result === 'Correct') {
              hookData.cell.styles.textColor = [...GREEN]
            } else if (result === 'Incorrect') {
              hookData.cell.styles.textColor = [...RED]
            } else {
              hookData.cell.styles.textColor = [...MUTED]
            }
          },
        })
      })

      addPageNumbers(pdf)
      
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

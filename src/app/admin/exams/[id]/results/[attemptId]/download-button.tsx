
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
const BLUE = [37, 99, 235] as const
const GREEN = [22, 163, 74] as const
const AMBER = [217, 119, 6] as const
const RED = [220, 38, 38] as const

function addPageHeader(pdf: jsPDF, title: string, subtitle: string) {
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
    body: rows.map((row) => [row.name, `${row.percentage}%`]),
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

      let cursorY = addPageHeader(pdf, 'SAT Score Report', examTitle)

      pdf.setTextColor(...MUTED)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(9)
      pdf.text('STUDENT', PAGE_MARGIN, cursorY)
      pdf.text('DATE', pdfWidth - PAGE_MARGIN, cursorY, { align: 'right' })

      cursorY += 7
      pdf.setTextColor(...DARK)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(16)
      pdf.text(studentName, PAGE_MARGIN, cursorY)
      pdf.text(completedDate, pdfWidth - PAGE_MARGIN, cursorY, { align: 'right' })

      cursorY += 6
      pdf.setTextColor(...MUTED)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)
      pdf.text(`@${username}`, PAGE_MARGIN, cursorY)

      cursorY += 12
      const cardGap = 6
      const summaryCardWidth = (contentWidth - cardGap * 2) / 3
      drawStatCard(pdf, PAGE_MARGIN, cursorY, summaryCardWidth, 34, 'Total Score', `${totalScore}`, 'Combined SAT score', BLUE)
      drawStatCard(pdf, PAGE_MARGIN + summaryCardWidth + cardGap, cursorY, summaryCardWidth, 34, 'Reading & Writing', `${rwScore}`, `${rwCorrect}/${rwTotal} correct`, GREEN)
      drawStatCard(pdf, PAGE_MARGIN + (summaryCardWidth + cardGap) * 2, cursorY, summaryCardWidth, 34, 'Math', `${mathScore}`, `${mathCorrect}/${mathTotal} correct`, AMBER)

      cursorY += 46
      cursorY = addSectionHeading(pdf, 'Performance Overview', cursorY)
      const overviewCardWidth = (contentWidth - 6) / 2
      drawStatCard(pdf, PAGE_MARGIN, cursorY, overviewCardWidth, 28, 'Overall Accuracy', `${overallCorrect}/${overallTotal}`, 'Total correct answers', BLUE)
      drawStatCard(
        pdf,
        PAGE_MARGIN + overviewCardWidth + 6,
        cursorY,
        overviewCardWidth,
        28,
        'Security',
        violations > 0 ? `${violations}` : 'Clean',
        violations > 0 ? 'Violations detected' : 'No violations',
        violations > 0 ? RED : GREEN,
      )

      pdf.addPage()
      cursorY = addPageHeader(pdf, 'Score Sections', `${studentName} · ${examTitle}`)

      const sectionCardWidth = (contentWidth - 6) / 2
      drawStatCard(pdf, PAGE_MARGIN, cursorY, sectionCardWidth, 38, 'Reading & Writing', `${rwScore}`, `${rwCorrect}/${rwTotal} questions correct`, GREEN)
      drawStatCard(pdf, PAGE_MARGIN + sectionCardWidth + 6, cursorY, sectionCardWidth, 38, 'Math', `${mathScore}`, `${mathCorrect}/${mathTotal} questions correct`, AMBER)

      let tableY = cursorY + 50
      tableY = addDomainTable(pdf, 'Reading & Writing Domains', tableY, readingWritingDomains)
      tableY += 10
      addDomainTable(pdf, 'Math Domains', tableY, mathDomains)

      pdf.addPage()
      cursorY = addPageHeader(pdf, 'Teacher Summary', `${studentName} · ${examTitle}`)

      const teacherCardGap = 4
      const teacherCardWidth = (contentWidth - teacherCardGap * 3) / 4
      drawStatCard(pdf, PAGE_MARGIN, cursorY, teacherCardWidth, 30, 'Reading & Writing', `${rwCorrect}/${rwTotal}`, 'Questions correct', GREEN)
      drawStatCard(pdf, PAGE_MARGIN + teacherCardWidth + teacherCardGap, cursorY, teacherCardWidth, 30, 'Math', `${mathCorrect}/${mathTotal}`, 'Questions correct', AMBER)
      drawStatCard(pdf, PAGE_MARGIN + (teacherCardWidth + teacherCardGap) * 2, cursorY, teacherCardWidth, 30, 'Overall', `${overallCorrect}/${overallTotal}`, 'Total correct', BLUE)
      drawStatCard(
        pdf,
        PAGE_MARGIN + (teacherCardWidth + teacherCardGap) * 3,
        cursorY,
        teacherCardWidth,
        30,
        'Security',
        violations > 0 ? `${violations}` : 'Clean',
        violations > 0 ? 'Violations detected' : 'No violations',
        violations > 0 ? RED : GREEN,
      )

      autoTable(pdf, {
        startY: cursorY + 42,
        head: [['Module', 'Correct', 'Total', 'Accuracy']],
        body: moduleSummaries.map((summary) => [
          summary.label,
          `${summary.correct}`,
          `${summary.total}`,
          `${Math.round((summary.correct / Math.max(summary.total, 1)) * 100)}%`,
        ]),
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
          1: { halign: 'right' },
          2: { halign: 'right' },
          3: { halign: 'right', fontStyle: 'bold' },
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
      })

      breakdownSections.forEach((section) => {
        pdf.addPage()
        const startY = addPageHeader(pdf, section.label, `${section.correct}/${section.total} correct`)

        autoTable(pdf, {
          startY,
          head: [['#', 'Domain', 'Correct Answer', 'Student Answer', 'Result']],
          body: section.questions.map((question) => [
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

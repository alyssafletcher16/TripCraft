import mammoth from 'mammoth'
import pdfParse from 'pdf-parse'
import xlsx from 'xlsx'

export async function extractText(buffer: Buffer, filename: string): Promise<string> {
  const ext = filename.split('.').pop()?.toLowerCase()

  if (ext === 'pdf') {
    const data = await pdfParse(buffer)
    return data.text
  }

  if (ext === 'docx') {
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }

  if (ext === 'xlsx' || ext === 'xls') {
    const workbook = xlsx.read(buffer)
    return workbook.SheetNames.map(name => {
      const sheet = workbook.Sheets[name]
      return `Sheet: ${name}\n` + xlsx.utils.sheet_to_csv(sheet)
    }).join('\n\n')
  }

  // txt, csv, plain text exports from Google Docs/Sheets
  return buffer.toString('utf-8')
}

import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfjsWorker;

const MAX_PDF_BYTES = 5 * 1024 * 1024;

export async function extractTextFromPdf(file: File): Promise<string> {
  if (file.type !== 'application/pdf') {
    throw new Error('Solo se aceptan archivos PDF.');
  }

  if (file.size > MAX_PDF_BYTES) {
    throw new Error('El PDF no puede superar 5 MB.');
  }

  const buffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: buffer }).promise;

  const chunks: string[] = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    chunks.push(pageText);
  }

  const text = chunks.join('\n').trim();
  if (!text) {
    throw new Error(
      'No pudimos leer texto en este PDF. Usa un CV exportado desde Word o Google Docs (no una foto escaneada).',
    );
  }

  return text;
}

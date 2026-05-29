import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfjsWorker;

const MAX_CV_BYTES = 5 * 1024 * 1024;

function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

function isTxtFile(file: File): boolean {
  return file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt');
}

async function readPdfText(file: File): Promise<string> {
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

async function readTxtText(file: File): Promise<string> {
  const text = (await file.text()).trim();
  if (!text) {
    throw new Error('El archivo de texto está vacío.');
  }
  return text;
}

export async function extractTextFromCvFile(file: File): Promise<string> {
  if (file.size > MAX_CV_BYTES) {
    throw new Error('El archivo no puede superar 5 MB.');
  }

  if (isTxtFile(file)) {
    return readTxtText(file);
  }

  if (isPdfFile(file)) {
    return readPdfText(file);
  }

  throw new Error('Solo se aceptan archivos PDF o TXT.');
}

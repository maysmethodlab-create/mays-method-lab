import 'server-only';

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB per spec

export type ExtractInput = {
  filename: string;
  buffer: Buffer;
};

export type ExtractOutput = {
  filename: string;
  text: string;
  size: number;
};

export async function extractText({ filename, buffer }: ExtractInput): Promise<ExtractOutput> {
  if (buffer.length > MAX_BYTES) {
    throw new Error(`${filename} is larger than 10MB. Please upload a smaller file.`);
  }

  const lower = filename.toLowerCase();
  let text = '';

  if (lower.endsWith('.docx')) {
    const mammoth = (await import('mammoth')) as typeof import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else if (lower.endsWith('.pdf')) {
    // pdf-parse is CommonJS; we marked it as a webpack external in next.config.js.
    const pdfParseModule = (await import('pdf-parse')) as unknown as {
      default: (data: Buffer) => Promise<{ text: string }>;
    };
    const pdf = pdfParseModule.default || (pdfParseModule as unknown as (data: Buffer) => Promise<{ text: string }>);
    const result = await pdf(buffer);
    text = result.text;
  } else if (lower.endsWith('.txt') || lower.endsWith('.md')) {
    text = buffer.toString('utf8');
  } else {
    throw new Error(
      `${filename}: unsupported file type. Upload a .docx, .pdf, .txt, or .md file.`,
    );
  }

  // Normalize whitespace
  text = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

  if (!text) {
    throw new Error(`${filename}: no text could be extracted.`);
  }

  return { filename, text, size: buffer.length };
}

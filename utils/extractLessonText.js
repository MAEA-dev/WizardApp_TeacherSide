import { File } from 'expo-file-system';
import {
  extractText as extractPdfText,
  isAvailable as isPdfExtractorAvailable,
} from 'expo-pdf-text-extract';
import { strFromU8, unzipSync } from 'fflate';

const decodeXmlEntities = (value) =>
  value.replace(
    /&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi,
    (entity, code) => {
      const normalizedCode = code.toLowerCase();
      if (normalizedCode === 'amp') return '&';
      if (normalizedCode === 'lt') return '<';
      if (normalizedCode === 'gt') return '>';
      if (normalizedCode === 'quot') return '"';
      if (normalizedCode === 'apos') return "'";

      const numericCode = normalizedCode[1] === 'x'
        ? Number.parseInt(normalizedCode.slice(2), 16)
        : Number.parseInt(normalizedCode.slice(1), 10);

      return numericCode <= 0x10ffff ? String.fromCodePoint(numericCode) : entity;
    }
  );

const extractDocxText = async (file) => {
  let documentXml;
  try {
    const entries = unzipSync(await file.bytes());
    documentXml = entries['word/document.xml'];
  } catch {
    throw new Error('Unable to read the DOCX file. It may be damaged or password-protected.');
  }

  if (!documentXml) {
    throw new Error('The selected DOCX file does not contain a readable document.');
  }

  return decodeXmlEntities(
    strFromU8(documentXml)
      .replace(/<w:tab\b[^>]*\/>/g, '\t')
      .replace(/<w:br\b[^>]*\/>/g, '\n')
      .replace(/<\/w:p>/g, '\n')
      .replace(/<[^>]+>/g, '')
  );
};

export default async function extractLessonText(selectedFile) {
  const fileName = String(selectedFile?.name || '').toLowerCase();
  const file = new File(selectedFile.uri);

  if (fileName.endsWith('.txt')) {
    return file.text();
  }

  if (fileName.endsWith('.docx')) {
    return extractDocxText(file);
  }

  if (fileName.endsWith('.pdf')) {
    if (!isPdfExtractorAvailable()) {
      throw new Error('PDF extraction requires an installed Expo development build.');
    }

    return extractPdfText(selectedFile.uri);
  }

  throw new Error('Unsupported file type. Choose a PDF, DOCX, or TXT file.');
}

import { PDFDocument, StandardFonts } from 'pdf-lib';
import fs from 'fs/promises';

export async function renderLetter(templatePath: string, data: Record<string,string>): Promise<Uint8Array> {
  let template = await fs.readFile(templatePath, 'utf8');
  Object.entries(data).forEach(([k,v]) => {
    template = template.replace(new RegExp(`{{${k}}}`, 'g'), v);
  });
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const lines = template.split('\n');
  lines.forEach((line, idx) => {
    page.drawText(line, { x: 50, y: page.getHeight() - 50 - idx * (fontSize + 2), size: fontSize, font });
  });
  return await pdfDoc.save();
}

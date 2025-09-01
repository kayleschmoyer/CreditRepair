import React from "react";
import { renderToBuffer } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import * as templates from '../../templates';
import type { LetterData } from '../../templates';

export type Bureau = 'equifax' | 'experian' | 'transunion';

export interface RenderData extends Omit<LetterData, 'bureau' | 'qrDataUrl'> {}

const cache = new Map<string, Buffer>();

const templatesMap: Record<Bureau, React.FC<Omit<LetterData, 'bureau'>>> = {
  equifax: templates.equifax,
  experian: templates.experian,
  transunion: templates.transunion,
};

/**
 * Render a letter for a specific credit bureau and return it as a PDF buffer.
 * Results are cached based on the bureau and data to avoid re-rendering.
 *
 * @param bureau Target credit bureau for the letter.
 * @param data   Letter contents excluding bureau info and QR code.
 * @returns      PDF buffer of the rendered letter.
 */
export async function renderLetter(
  bureau: Bureau,
  data: RenderData,
): Promise<Buffer> {
  const key = JSON.stringify({ bureau, data });
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }
  const Template = templatesMap[bureau];
  const qrDataUrl = await QRCode.toDataURL(data.detailUrl);
  const element = <Template {...data} qrDataUrl={qrDataUrl} />;
  const buffer = await renderToBuffer(element);
  cache.set(key, buffer);
  return buffer;
}

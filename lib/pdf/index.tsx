import React from "react";
import { renderToBuffer } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import * as templates from '../../templates';
import type { LetterData } from '../../templates';

export type Bureau = 'equifax' | 'experian' | 'transunion';

export interface RenderData extends Omit<LetterData, 'bureau' | 'qrDataUrl'> {}

const cache = new Map<string, Buffer>();

export async function renderLetter(bureau: Bureau, data: RenderData): Promise<Buffer> {
  const key = JSON.stringify({ bureau, data });
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }
  const Template = (templates as Record<string, any>)[bureau];
  const qrDataUrl = await QRCode.toDataURL(data.detailUrl);
  const element = <Template {...data} qrDataUrl={qrDataUrl} />;
  const buffer = await renderToBuffer(element);
  cache.set(key, buffer);
  return buffer;
}

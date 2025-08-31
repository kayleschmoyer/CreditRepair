import { z } from 'zod';

export const profileSchema = z.object({
  display_name: z.string().min(1),
  address_line1: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(2),
  postal_code: z.string().min(5),
});

export const reportUploadSchema = z.object({
  file: z.instanceof(File),
});

export const disputeSchema = z.object({
  items: z.array(z.object({ tradelineId: z.string(), reason: z.string() })),
});

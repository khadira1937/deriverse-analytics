import { z } from 'zod';

export const NormalizedSideSchema = z.enum(['long', 'short']);
export type NormalizedSide = z.infer<typeof NormalizedSideSchema>;

export const NormalizedOrderTypeSchema = z.enum(['limit', 'market', 'ioc', 'post_only', 'unknown']);
export type NormalizedOrderType = z.infer<typeof NormalizedOrderTypeSchema>;

export const NormalizedTradeSchema = z.object({
  id: z.string(),
  ts: z.date(),
  symbol: z.string(),
  side: NormalizedSideSchema,
  orderType: NormalizedOrderTypeSchema,
  // price/size may be unknown for some sources; keep nullable
  entryPrice: z.number().nullable(),
  exitPrice: z.number().nullable(),
  size: z.number().nullable(),
  pnlUsd: z.number(),

  // Fees
  feesUsd: z.number(),
  // Optional fee breakdown (useful for analytics even when data comes from mock/CSV)
  feeMakerUsd: z.number().optional(),
  feeTakerUsd: z.number().optional(),
  feeFundingUsd: z.number().optional(),

  durationSec: z.number().nullable(),
  tags: z.array(z.string()).default([]),
  notes: z.string().default(''),
});

export type NormalizedTrade = z.infer<typeof NormalizedTradeSchema>;

export function toUnixMs(d: Date): number {
  return d.getTime();
}

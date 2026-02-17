import { z } from 'zod';

export const TradeAnnotationSchema = z.object({
  tags: z.array(z.string()).default([]),
  notes: z.string().default(''),
  setupType: z.string().default(''),
  mistakeType: z.string().default(''),
  reviewed: z.boolean().default(false),
  updatedAt: z.number().optional(),
});
export type TradeAnnotation = z.infer<typeof TradeAnnotationSchema>;

export type TradeAnnotationsMap = Record<string, TradeAnnotation>;

const LS_KEY = 'derivision.tradeAnnotations.v1';

export function loadTradeAnnotations(): TradeAnnotationsMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const out: TradeAnnotationsMap = {};
    for (const [k, v] of Object.entries(parsed)) {
      const res = TradeAnnotationSchema.safeParse(v);
      if (res.success) out[k] = res.data;
    }
    return out;
  } catch {
    return {};
  }
}

export function saveTradeAnnotations(map: TradeAnnotationsMap) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(map));
  } catch {}
}

export function upsertTradeAnnotation(tradeId: string, ann: TradeAnnotation) {
  const map = loadTradeAnnotations();
  map[tradeId] = { ...ann, updatedAt: Date.now() };
  saveTradeAnnotations(map);
  return map;
}

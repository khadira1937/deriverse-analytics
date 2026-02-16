import { NextResponse } from 'next/server';

// Server-only: use Deriverse SDK + Solana RPC
import { Engine } from '@deriverse/kit';
import { address, createSolanaRpc } from '@solana/kit';

type CacheEntry = { at: number; body: any };

declare global {
  // eslint-disable-next-line no-var
  var __derivision_onchain_cache__: Map<string, CacheEntry> | undefined;
  // eslint-disable-next-line no-var
  var __derivision_engine_cache__: Map<string, Engine> | undefined;
}

const memCache = globalThis.__derivision_onchain_cache__ ?? new Map<string, CacheEntry>();
globalThis.__derivision_onchain_cache__ = memCache;

const engineCache = globalThis.__derivision_engine_cache__ ?? new Map<string, Engine>();
globalThis.__derivision_engine_cache__ = engineCache;

function cacheKey(envKey: string, trader: string, limit: number) {
  return `${envKey}::${trader}::${limit}`;
}

function getEnv() {
  const rpcUrl = process.env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com';
  const programId = process.env.DERIVERSE_PROGRAM_ID;
  const version = Number(process.env.DERIVERSE_VERSION ?? '6');

  if (!programId) {
    throw new Error('Missing DERIVERSE_PROGRAM_ID in environment');
  }

  return { rpcUrl, programId, version };
}

async function getEngine(rpcUrl: string, programId: string, version: number) {
  const envKey = `${rpcUrl}::${programId}::${version}`;
  const cached = engineCache.get(envKey);
  if (cached) return { envKey, engine: cached };

  const rpc = createSolanaRpc(rpcUrl);
  const engine = new Engine(rpc as any, {
    programId: address(programId),
    version,
    commitment: 'confirmed',
    uiNumbers: true,
  });

  const ok = await engine.initialize();
  if (!ok) throw new Error('Deriverse engine initialization failed');

  engineCache.set(envKey, engine);
  return { envKey, engine };
}

function toIsoFromBlockTime(bt: bigint | null | undefined): Date {
  if (!bt) return new Date();
  return new Date(Number(bt) * 1000);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const trader = url.searchParams.get('trader') ?? '';
    const limit = Math.min(Number(url.searchParams.get('limit') ?? '200') || 200, 500);

    if (!trader) {
      return NextResponse.json({ ok: false, error: 'Missing trader address' }, { status: 400 });
    }

    const { rpcUrl, programId, version } = getEnv();
    const { envKey, engine } = await getEngine(rpcUrl, programId, version);

    const key = cacheKey(envKey, trader, limit);
    const cached = memCache.get(key);
    if (cached && Date.now() - cached.at < 30_000) {
      return NextResponse.json(cached.body);
    }

    // set signer (read-only) to derive client accounts
    await engine.setSigner(address(trader));

    // check client exists
    const okClient = await (engine as any).checkClient();
    if (!okClient) {
      const body = {
        ok: false,
        error: 'Client account not found for this address on Deriverse (devnet).',
      };
      memCache.set(key, { at: Date.now(), body });
      return NextResponse.json(body, { status: 404 });
    }

    const clientPrimaryAccount = (engine as any).clientPrimaryAccount as string | undefined;
    if (!clientPrimaryAccount) {
      return NextResponse.json({ ok: false, error: 'Failed to derive client account.' }, { status: 500 });
    }

    const rpc = createSolanaRpc(rpcUrl);

    // Fetch recent tx signatures involving the client primary account
    const sigInfos = await rpc.getSignaturesForAddress(address(clientPrimaryAccount), { limit }).send();

    // Decode logs into fill events
    const orderToInstr = new Map<number, number>();
    const orderToOrderType = new Map<number, string>();

    const trades: any[] = [];

    // Rate-limit: fetch a small batch at a time
    const concurrency = 4;
    for (let i = 0; i < sigInfos.length; i += concurrency) {
      const batch = sigInfos.slice(i, i + concurrency);
      const txs = await Promise.all(
        batch.map(async (s) => {
          try {
            return await rpc
              .getTransaction(s.signature, { encoding: 'json', maxSupportedTransactionVersion: 0 })
              .send();
          } catch {
            return null;
          }
        }),
      );

      for (const tx of txs) {
        if (!tx?.meta?.logMessages?.length) continue;

        const decoded = engine.logsDecode(tx.meta.logMessages);
        if (!decoded?.length) continue;

        const ts = toIsoFromBlockTime(tx.blockTime);

        // First pass: capture order placement metadata
        for (const msg of decoded as any[]) {
          if (typeof msg?.tag !== 'number') continue;
          // SpotPlaceOrderReportModel / PerpPlaceOrderReportModel
          if (msg.tag === 10 || msg.tag === 18) {
            // common: orderId + instrId + orderType + ioc
            const orderId = Number(msg.orderId);
            const instrId = Number(msg.instrId);
            if (Number.isFinite(orderId) && Number.isFinite(instrId)) {
              orderToInstr.set(orderId, instrId);
              const ot = msg.orderType;
              const ioc = msg.ioc;
              const orderTypeStr = ioc === 1 ? 'ioc' : ot === 0 ? 'limit' : ot === 1 ? 'market' : 'unknown';
              orderToOrderType.set(orderId, orderTypeStr);
            }
          }
        }

        // Second pass: capture fills + fees
        let feesTotal = 0;
        for (const msg of decoded as any[]) {
          if (msg?.tag === 15 || msg?.tag === 23) {
            // SpotFeesReportModel / PerpFeesReportModel
            if (typeof msg.fees === 'number') feesTotal += msg.fees;
          }
        }

        for (const msg of decoded as any[]) {
          if (typeof msg?.tag !== 'number') continue;

          // SpotFillOrderReportModel(11) / PerpFillOrderReportModel(19)
          if (msg.tag === 11 || msg.tag === 19) {
            const orderId = Number(msg.orderId);
            const instrId = orderToInstr.get(orderId);
            const orderType = orderToOrderType.get(orderId) ?? 'unknown';

            const sideNum = Number(msg.side);
            const side = sideNum === 0 ? 'long' : 'short';

            // qty/perps
            const size = msg.tag === 11 ? Number(msg.qty) : Number(msg.perps);
            const price = Number(msg.price);

            // Symbol is best-effort (SDK does not provide tickers)
            const symbol = instrId != null ? `INSTR-${instrId}` : 'UNKNOWN';

            // PnL is not directly available from logs alone without position reconstruction.
            // We return 0 for now; Phase C metrics still work for volume/fees/trade counts.
            trades.push({
              id: `onchain-${tx.slot}-${orderId}-${msg.tag}`,
              ts: ts.toISOString(),
              symbol,
              side,
              orderType,
              entryPrice: null,
              exitPrice: null,
              size: Number.isFinite(size) ? size : null,
              pnlUsd: 0,
              feesUsd: feesTotal,
              durationSec: null,
              tags: [],
              notes: `Decoded from Deriverse transaction logs (${msg.tag === 11 ? 'spot' : 'perp'} fill)`,
            });

            // approximate volume by price*size when available
            void price;
          }
        }
      }
    }

    const body = { ok: true, trades };
    memCache.set(key, { at: Date.now(), body });
    return NextResponse.json(body);
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Failed to fetch on-chain Deriverse data' },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";

const DEFAULT_SETTINGS = {
  defaultGoldRate: "14000",
  defaultDiamondRate: "60000",
  defaultWastagePct: "8.0",
  defaultColorStoneRate: "200",
  defaultCertRate: "700"
};

export async function GET() {
  const rawUrl = process.env.OMDIAMONDS_REDIS_URL;
  if (!rawUrl) {
    return NextResponse.json({ ...DEFAULT_SETTINGS, warning: "Missing OMDIAMONDS_REDIS_URL" });
  }

  // 🔑 SAFE SERVERLESS CONFIGURATION
  const client = new Redis(rawUrl, {
    tls: { rejectUnauthorized: false },
    connectTimeout: 3000,
    maxRetriesPerRequest: null,       // 🚀 FIX: Must be set to null when enableReadyCheck is false or handling retryStrategy
    enableOfflineQueue: false,        // 🚀 FIX: Drops commands instantly if the socket isn't ready, preventing queue accumulation
    retryStrategy() {
      return null;                    // 🚀 FIX: Tells the driver "Do not retry, fail instantly so we can start fresh"
    }
  });

  try {
    const rawData = await client.get("om_diamonds_settings");
    await client.quit();

    if (!rawData) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }
    
    return NextResponse.json(JSON.parse(rawData));
  } catch (err) {
    try { client.disconnect(); } catch {}
    return NextResponse.json({
      ...DEFAULT_SETTINGS,
      warning: err instanceof Error ? err.message : "Database fallback activated"
    });
  }
}

export async function POST(request: NextRequest) {
  const rawUrl = process.env.OMDIAMONDS_REDIS_URL;
  if (!rawUrl) {
    return NextResponse.json({ error: "Missing database environment variable" }, { status: 500 });
  }

  // 🔑 SAFE SERVERLESS CONFIGURATION
  const client = new Redis(rawUrl, {
    tls: { rejectUnauthorized: false },
    connectTimeout: 3000,
    maxRetriesPerRequest: null,       // 🚀 FIX: Must be set to null when enableReadyCheck is false or handling retryStrategy
    enableOfflineQueue: false,        // 🚀 FIX: Drops commands instantly if the socket isn't ready
    retryStrategy() {
      return null;                    // 🚀 FIX: Tells the driver "Do not retry"
    }
  });

  try {
    const body = await request.json();
    await client.set("om_diamonds_settings", JSON.stringify(body));
    await client.quit();
    
    return NextResponse.json({ success: true });
  } catch (err) {
    try { client.disconnect(); } catch {}
    const errorMessage = err instanceof Error ? err.message : "Unknown database save error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

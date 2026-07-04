import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";

const DEFAULT_SETTINGS = {
  defaultGoldRate: "14000",
  defaultDiamondRate: "60000",
  defaultWastagePct: "8.0",
  defaultColorStoneRate: "200",
  defaultCertRate: "700",
  defaultLaborRate: "500" // 🔑 ADDED: Added default global labor rate fallback
};

const connectSafely = async (client: Redis): Promise<void> => {
  if (client.status === "ready") return;
  
  return new Promise((resolve, reject) => {
    client.once("ready", resolve);
    client.once("error", reject);
    setTimeout(() => reject(new Error("Redis connection handshake timed out")), 4000);
  });
};

// Helper function to build the client with correct TLS settings based on the protocol
const createRedisClient = (rawUrl: string) => {
  // 🔑 FIX: If the string uses standard "redis://", DO NOT pass the tls block. Only pass it for "rediss://"
  const isSecure = rawUrl.startsWith("rediss://");

  return new Redis(rawUrl, {
    ...(isSecure ? { tls: { rejectUnauthorized: false } } : {}),
    connectTimeout: 4000,
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    retryStrategy() { return null; }
  });
};

export async function GET() {
  const rawUrl = process.env.OMDIAMONDS_REDIS_URL;
  if (!rawUrl) {
    return NextResponse.json({ ...DEFAULT_SETTINGS, warning: "Missing OMDIAMONDS_REDIS_URL" });
  }

  const client = createRedisClient(rawUrl);

  try {
    await connectSafely(client);
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

  const client = createRedisClient(rawUrl);

  try {
    const body = await request.json();

    await connectSafely(client);
    await client.set("om_diamonds_settings", JSON.stringify(body));
    await client.quit();
    
    return NextResponse.json({ success: true });
  } catch (err) {
    try { client.disconnect(); } catch {}
    const errorMessage = err instanceof Error ? err.message : "Unknown database save error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

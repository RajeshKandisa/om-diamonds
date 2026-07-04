import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";

// Cache the connection instance globally so serverless environments don't open new sockets on every click
let cachedClient: Redis | null = null;

const getRedisClient = () => {
  if (cachedClient) return cachedClient;

  const rawUrl = process.env.OMDIAMONDS_REDIS_URL;
  if (!rawUrl) return null;

  // Use standard TCP connection rules with a strict network drop boundary
  cachedClient = new Redis(rawUrl, {
    tls: { rejectUnauthorized: false },
    connectTimeout: 5000,           // Give up after 5 seconds instead of hanging
    maxRetriesPerRequest: 1,       // 🚀 CRITICAL: Prevents hitting the 20-retry loop error if the network drops
    retryStrategy(times) {
      // If a request fails, wait 50ms and try just once more before returning a safe fallback
      return times <= 1 ? 50 : null;
    }
  });

  // Gracefully log connection issues to your Vercel logs instead of crashing the process
  cachedClient.on("error", (err) => {
    console.error("Redis socket error captured:", err.message);
  });

  return cachedClient;
};

export async function GET() {
  try {
    const client = getRedisClient();
    if (!client) {
      throw new Error("Missing environment variable: OMDIAMONDS_REDIS_URL");
    }

    const rawData = await client.get("om_diamonds_settings");
    
    if (!rawData) {
      return NextResponse.json({
        defaultGoldRate: "14000",
        defaultDiamondRate: "60000",
        defaultWastagePct: "8.0",
        defaultColorStoneRate: "200",
        defaultCertRate: "700"
      });
    }
    
    return NextResponse.json(JSON.parse(rawData));
  } catch (err) {
    // If the database is sleeping or failing to connect, fall back to safe default numbers 
    // so your website doesn't show a blank screen or error out for shoppers.
    return NextResponse.json({
      defaultGoldRate: "14000",
      defaultDiamondRate: "60000",
      defaultWastagePct: "8.0",
      defaultColorStoneRate: "200",
      defaultCertRate: "700",
      warning: err instanceof Error ? err.message : "Database fallback activated"
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = getRedisClient();
    if (!client) {
      throw new Error("Missing environment variable: OMDIAMONDS_REDIS_URL");
    }

    const body = await request.json();
    await client.set("om_diamonds_settings", JSON.stringify(body));
    
    return NextResponse.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown database synchronization error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

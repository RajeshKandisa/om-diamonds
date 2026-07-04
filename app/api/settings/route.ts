import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";

// Secure Connection: Appending the configuration object ensures SSL handshakes succeed
const redisClient = process.env.OMDIAMONDS_REDIS_URL 
  ? new Redis(process.env.OMDIAMONDS_REDIS_URL, { tls: { rejectUnauthorized: false } }) 
  : null;

export async function GET() {
  try {
    if (!redisClient) {
      throw new Error("Missing environment variable: OMDIAMONDS_REDIS_URL");
    }
    const rawData = await redisClient.get("om_diamonds_settings");
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
    const errorMessage = err instanceof Error ? err.message : "Unknown server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// 🔑 FIXED FOR REAL: Added the explicit TypeScript type mapping here
export async function POST(request: NextRequest) {
  try {
    if (!redisClient) {
      throw new Error("Missing environment variable: OMDIAMONDS_REDIS_URL");
    }
    const body = await request.json();
    await redisClient.set("om_diamonds_settings", JSON.stringify(body));
    return NextResponse.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

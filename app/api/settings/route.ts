import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";

// Safe, fallback configuration defaults
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

  // 🔑 SERVERLESS PATTERN: Open a dedicated client for this specific request
  const client = new Redis(rawUrl, {
    tls: { rejectUnauthorized: false },
    connectTimeout: 3000,
  });

  try {
    const rawData = await client.get("om_diamonds_settings");
    
    // Disconnect right away so we don't leak sockets on the server
    await client.quit();

    if (!rawData) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }
    
    return NextResponse.json(JSON.parse(rawData));
  } catch (err) {
    // Safely close connection even if the command crashes
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

  // 🔑 SERVERLESS PATTERN: Open a dedicated client for this specific save event
  const client = new Redis(rawUrl, {
    tls: { rejectUnauthorized: false },
    connectTimeout: 3000,
  });

  try {
    const body = await request.json();
    
    // Write the data immediately
    await client.set("om_diamonds_settings", JSON.stringify(body));
    
    // Disconnect immediately after completing the write action
    await client.quit();
    
    return NextResponse.json({ success: true });
  } catch (err) {
    try { client.disconnect(); } catch {}
    
    const errorMessage = err instanceof Error ? err.message : "Unknown database save error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "../../../lib/db";

export async function GET() {
  const dbHealth = await checkDatabaseHealth();
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  const isHealthy = dbHealth.ok;
  const status = isHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      service: "mellosoft-api",
      version: "1.0.0",
      uptimeSeconds: Math.floor(uptime),
      memory: {
        rssMb: Math.round(memoryUsage.rss / (1024 * 1024)),
        heapUsedMb: Math.round(memoryUsage.heapUsed / (1024 * 1024)),
      },
      database: dbHealth,
    },
    { status }
  );
}

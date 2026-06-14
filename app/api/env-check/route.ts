import { NextResponse } from "next/server"
import { features } from "@/config/env"

// Temporary diagnostic route. Returns only booleans — never exposes secret values.
export async function GET() {
  return NextResponse.json({
    region: !!process.env.AWS_REGION,
    key: !!process.env.AWS_ACCESS_KEY_ID,
    secret: !!process.env.AWS_SECRET_ACCESS_KEY,
    prefix: !!process.env.AWS_DYNAMODB_TABLE_PREFIX,
    databaseEnabled: features.database(),
  })
}

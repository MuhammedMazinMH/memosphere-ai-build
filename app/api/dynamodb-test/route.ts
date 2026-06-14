/**
 * Temporary diagnostic route — GET /api/dynamodb-test
 *
 * Performs a real Scan against the configured subjects table
 * (default: memosphere_subjects) and reports what comes back.
 *
 * Remove this file once DynamoDB connectivity is confirmed.
 */
import { NextResponse } from 'next/server'
import { scanAll, isDatabaseConnected } from '@/db/client'
import { tableName } from '@/db/tables'

export async function GET() {
  // Surface the resolved physical table name so it is visible in the response.
  const resolvedTable = tableName('subjects')

  // Short-circuit with a clear message when credentials are absent so the
  // caller does not have to wait for an AWS TCP timeout.
  if (!isDatabaseConnected()) {
    return NextResponse.json(
      {
        success: false,
        error:
          'DynamoDB is not connected. ' +
          'AWS_REGION, AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must all be set.',
        table: resolvedTable,
        credentialsPresent: {
          region: !!process.env.AWS_REGION,
          key: !!process.env.AWS_ACCESS_KEY_ID,
          secret: !!process.env.AWS_SECRET_ACCESS_KEY,
        },
      },
      { status: 503 },
    )
  }

  try {
    const items = await scanAll<Record<string, unknown>>('subjects')
    return NextResponse.json({
      success: true,
      table: resolvedTable,
      count: items.length,
      items,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const name    = error instanceof Error ? error.name    : 'UnknownError'
    console.error('[v0] dynamodb-test scan failed:', error)
    return NextResponse.json(
      {
        success: false,
        table: resolvedTable,
        error: message,
        errorType: name,
      },
      { status: 500 },
    )
  }
}

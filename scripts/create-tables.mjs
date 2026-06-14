/**
 * DynamoDB table provisioning for the settings/notifications features.
 *
 * Creates the two tables introduced for user settings (study goal, bio,
 * notification preferences) and the notification bell. Key schema mirrors
 * db/tables.ts exactly:
 *   - user_settings : partition key `userId` (String)
 *   - notifications : partition key `userId` (String) + sort key `id` (String)
 *
 * Physical names use AWS_DYNAMODB_TABLE_PREFIX (default `memosphere_`), so the
 * created tables match what the app reads/writes at runtime.
 *
 * Idempotent: tables that already exist are skipped. Uses on-demand
 * (PAY_PER_REQUEST) billing so there is nothing to capacity-plan.
 *
 * Usage (run where AWS credentials are available):
 *   CLERK-style inline:
 *     AWS_REGION=us-east-1 AWS_ACCESS_KEY_ID=... AWS_SECRET_ACCESS_KEY=... \
 *     AWS_DYNAMODB_TABLE_PREFIX=memosphere_ node scripts/create-tables.mjs
 *
 *   Or load a pulled env file first:
 *     node --env-file-if-exists=.env.local scripts/create-tables.mjs
 */
import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
  waitUntilTableExists,
} from '@aws-sdk/client-dynamodb'

function requireEnv(name) {
  const v = process.env[name]
  if (!v) {
    console.error(`Missing required environment variable: ${name}`)
    process.exit(1)
  }
  return v
}

const REGION = requireEnv('AWS_REGION')
const ACCESS_KEY_ID = requireEnv('AWS_ACCESS_KEY_ID')
const SECRET_ACCESS_KEY = requireEnv('AWS_SECRET_ACCESS_KEY')
const PREFIX = process.env.AWS_DYNAMODB_TABLE_PREFIX ?? 'memosphere_'

const client = new DynamoDBClient({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
})

/** Table definitions — must match db/tables.ts. */
const tables = [
  {
    base: 'user_settings',
    keySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
    attributes: [{ AttributeName: 'userId', AttributeType: 'S' }],
  },
  {
    base: 'notifications',
    keySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' },
      { AttributeName: 'id', KeyType: 'RANGE' },
    ],
    attributes: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'id', AttributeType: 'S' },
    ],
  },
]

async function exists(name) {
  try {
    await client.send(new DescribeTableCommand({ TableName: name }))
    return true
  } catch (err) {
    if (err?.name === 'ResourceNotFoundException') return false
    throw err
  }
}

async function main() {
  for (const t of tables) {
    const name = `${PREFIX}${t.base}`
    if (await exists(name)) {
      console.log(`[create-tables] ${name}: already exists (skipped)`)
      continue
    }
    console.log(`[create-tables] ${name}: creating...`)
    await client.send(
      new CreateTableCommand({
        TableName: name,
        BillingMode: 'PAY_PER_REQUEST',
        KeySchema: t.keySchema,
        AttributeDefinitions: t.attributes,
      }),
    )
    await waitUntilTableExists(
      { client, maxWaitTime: 120 },
      { TableName: name },
    )
    console.log(`[create-tables] ${name}: ACTIVE`)
  }
  console.log('[create-tables] Done.')
}

main().catch((err) => {
  console.error('[create-tables] Failed:', err)
  process.exit(1)
})

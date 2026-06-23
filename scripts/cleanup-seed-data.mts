/**
 * cleanup-seed-data.mts
 *
 * Removes only the rows that were inserted by `scripts/seed-dynamodb.ts` from
 * the seed dataset (`lib/mock-data.ts`). All three tables are handled:
 *
 *   - concepts             (pk: id)
 *   - knowledgeGraphNodes  (pk: id)
 *   - knowledgeGraphEdges  (pk: source, sk: target)
 *
 * Safety strategy:
 *   1. Scan each table and print BEFORE counts.
 *   2. Identify seed rows by their well-known IDs (hard-coded from
 *      lib/mock-data.ts graphConcepts / graphEdges).
 *   3. Only delete items whose key is in the seed set AND whose data is not
 *      modified (i.e. the item still has its original `label` value). This
 *      prevents accidental deletion if a user happened to create an item with
 *      the same id but different content.
 *   4. Print which rows are deleted, skip any that don't match.
 *   5. Print AFTER counts.
 *
 * Usage:
 *   set -a && source /vercel/share/.env.project && set +a \
 *     && npx tsx scripts/cleanup-seed-data.mts
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  ScanCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb'

// ---------------------------------------------------------------------------
// Exact seed identifiers from lib/mock-data.ts
// ---------------------------------------------------------------------------

/** All concept/node ids written by the seed script. */
const SEED_CONCEPT_IDS = new Set([
  'ml', 'stats', 'ai', 'ds',
  'regression', 'optimization',
  'gradient', 'neural', 'overfitting', 'svm', 'classification',
  'probability', 'bayes', 'hypothesis',
  'search', 'bayesnet',
  'trees', 'dp',
  'doc-gd', 'doc-ht', 'doc-as',
])

/** Seed concept labels indexed by id — used for safe-match verification. */
const SEED_CONCEPT_LABELS: Record<string, string> = {
  ml: 'Machine Learning', stats: 'Statistics',
  ai: 'Artificial Intelligence', ds: 'Data Structures',
  regression: 'Regression', optimization: 'Optimization',
  gradient: 'Gradient Descent', neural: 'Neural Networks',
  overfitting: 'Overfitting', svm: 'Support Vector Machines',
  classification: 'Classification', probability: 'Probability',
  bayes: 'Bayes Theorem', hypothesis: 'Hypothesis Testing',
  search: 'A* Search', bayesnet: 'Bayesian Networks',
  trees: 'Binary Trees', dp: 'Dynamic Programming',
  'doc-gd': 'Gradient Descent.pdf',
  'doc-ht': 'Hypothesis Testing.pdf',
  'doc-as': 'A* Search Notes',
}

/** All edges written by the seed script. Key: `${source}__${target}`. */
const SEED_EDGE_KEYS = new Set([
  'ml__gradient', 'ml__neural', 'ml__overfitting', 'ml__svm',
  'ml__classification', 'ml__optimization',
  'stats__regression', 'stats__probability', 'stats__bayes',
  'stats__hypothesis', 'ai__search', 'ai__bayesnet',
  'ds__trees', 'ds__dp',
  'regression__ml', 'regression__optimization',
  'optimization__gradient', 'optimization__neural',
  'gradient__neural', 'probability__bayes', 'bayes__bayesnet',
  'classification__svm', 'classification__neural',
  'probability__classification', 'regression__classification',
  'doc-gd__gradient', 'doc-ht__hypothesis', 'doc-as__search',
])

// ---------------------------------------------------------------------------
// AWS setup
// ---------------------------------------------------------------------------

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing required environment variable: ${name}`)
  return v
}

const region = requireEnv('AWS_REGION')
const prefix = process.env['AWS_DYNAMODB_TABLE_PREFIX'] ?? 'memosphere_'

const client = new DynamoDBClient({
  region,
  credentials: {
    accessKeyId: requireEnv('AWS_ACCESS_KEY_ID'),
    secretAccessKey: requireEnv('AWS_SECRET_ACCESS_KEY'),
  },
})

const doc = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
})

function tbl(base: string) {
  return `${prefix}${base}`
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function scanAll(tableName: string): Promise<Record<string, unknown>[]> {
  const items: Record<string, unknown>[] = []
  let lastKey: Record<string, unknown> | undefined
  do {
    const res = await doc.send(
      new ScanCommand({
        TableName: tableName,
        ExclusiveStartKey: lastKey,
      }),
    )
    items.push(...((res.Items ?? []) as Record<string, unknown>[]))
    lastKey = res.LastEvaluatedKey as Record<string, unknown> | undefined
  } while (lastKey)
  return items
}

async function deleteItem(
  tableName: string,
  key: Record<string, unknown>,
): Promise<void> {
  await doc.send(new DeleteCommand({ TableName: tableName, Key: key }))
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const conceptsTable = tbl('concepts')
  const nodesTable    = tbl('knowledge_graph_nodes')
  const edgesTable    = tbl('knowledge_graph_edges')

  // ---- BEFORE counts -------------------------------------------------------
  console.log('\n=== BEFORE COUNTS ===')
  const [conceptsBefore, nodesBefore, edgesBefore] = await Promise.all([
    scanAll(conceptsTable),
    scanAll(nodesTable),
    scanAll(edgesTable),
  ])
  console.log(`  ${conceptsTable}: ${conceptsBefore.length} items`)
  console.log(`  ${nodesTable}:    ${nodesBefore.length} items`)
  console.log(`  ${edgesTable}:    ${edgesBefore.length} items`)

  // ---- DELETE: concepts ----------------------------------------------------
  let deletedConcepts = 0
  const skippedConcepts: string[] = []

  for (const item of conceptsBefore) {
    const id = item['id'] as string | undefined
    if (!id || !SEED_CONCEPT_IDS.has(id)) continue
    // Safety check: only delete if label still matches the seed value.
    const expectedLabel = SEED_CONCEPT_LABELS[id]
    const actualLabel   = item['label'] as string | undefined
    if (actualLabel !== expectedLabel) {
      skippedConcepts.push(`${id} (label mismatch: "${actualLabel}" vs expected "${expectedLabel}")`)
      continue
    }
    await deleteItem(conceptsTable, { id })
    console.log(`  [DELETE] ${conceptsTable}  id="${id}"  label="${actualLabel}"`)
    deletedConcepts++
  }

  // ---- DELETE: knowledgeGraphNodes (same ids) --------------------------------
  let deletedNodes = 0
  const skippedNodes: string[] = []

  for (const item of nodesBefore) {
    const id = item['id'] as string | undefined
    if (!id || !SEED_CONCEPT_IDS.has(id)) continue
    const expectedLabel = SEED_CONCEPT_LABELS[id]
    const actualLabel   = item['label'] as string | undefined
    if (actualLabel !== expectedLabel) {
      skippedNodes.push(`${id} (label mismatch: "${actualLabel}" vs expected "${expectedLabel}")`)
      continue
    }
    await deleteItem(nodesTable, { id })
    console.log(`  [DELETE] ${nodesTable}  id="${id}"  label="${actualLabel}"`)
    deletedNodes++
  }

  // ---- DELETE: knowledgeGraphEdges ------------------------------------------
  let deletedEdges = 0
  const skippedEdges: string[] = []

  for (const item of edgesBefore) {
    const source = item['source'] as string | undefined
    const target = item['target'] as string | undefined
    if (!source || !target) continue
    const key = `${source}__${target}`
    if (!SEED_EDGE_KEYS.has(key)) continue
    // Safety check: both source and target must be known seed node ids.
    if (!SEED_CONCEPT_IDS.has(source) || !SEED_CONCEPT_IDS.has(target)) {
      skippedEdges.push(`${source} → ${target} (endpoint not a seed id)`)
      continue
    }
    await deleteItem(edgesTable, { source, target })
    console.log(`  [DELETE] ${edgesTable}  source="${source}"  target="${target}"`)
    deletedEdges++
  }

  // ---- AFTER counts ---------------------------------------------------------
  console.log('\n=== AFTER COUNTS ===')
  const [conceptsAfter, nodesAfter, edgesAfter] = await Promise.all([
    scanAll(conceptsTable),
    scanAll(nodesTable),
    scanAll(edgesTable),
  ])
  console.log(`  ${conceptsTable}: ${conceptsAfter.length} items`)
  console.log(`  ${nodesTable}:    ${nodesAfter.length} items`)
  console.log(`  ${edgesTable}:    ${edgesAfter.length} items`)

  // ---- Summary -------------------------------------------------------------
  console.log('\n=== SUMMARY ===')
  console.log(`  ${conceptsTable}`)
  console.log(`    Before: ${conceptsBefore.length}  Deleted: ${deletedConcepts}  After: ${conceptsAfter.length}`)
  if (skippedConcepts.length) console.log(`    Skipped (label mismatch): ${skippedConcepts.join(', ')}`)

  console.log(`  ${nodesTable}`)
  console.log(`    Before: ${nodesBefore.length}  Deleted: ${deletedNodes}  After: ${nodesAfter.length}`)
  if (skippedNodes.length) console.log(`    Skipped (label mismatch): ${skippedNodes.join(', ')}`)

  console.log(`  ${edgesTable}`)
  console.log(`    Before: ${edgesBefore.length}  Deleted: ${deletedEdges}  After: ${edgesAfter.length}`)
  if (skippedEdges.length) console.log(`    Skipped: ${skippedEdges.join(', ')}`)

  const totalDeleted = deletedConcepts + deletedNodes + deletedEdges
  console.log(`\n  Total rows deleted: ${totalDeleted}`)
  console.log('  Done.')
}

main().catch((err) => {
  console.error('[cleanup] Failed:', err)
  process.exit(1)
})

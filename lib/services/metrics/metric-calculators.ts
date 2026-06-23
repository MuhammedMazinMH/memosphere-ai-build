/**
 * Deterministic metric calculators.
 *
 * Pure, side-effect-free functions that derive every analytics value the app
 * surfaces (mastery, growth, activity, readiness, gaps, recommendations,
 * learning intelligence, dashboard totals) from REAL user data.
 *
 * Hard rules:
 * - No AI calls. Every number here is computed by formula from the inputs.
 *   (AI may only generate qualitative prose elsewhere; never scores.)
 * - No mock/seed data. Empty inputs produce honest zero-value outputs.
 * - Deterministic: identical inputs always yield identical outputs.
 */
import type {
  Activity,
  Concept,
  ConceptStatus,
  Document,
  ExamReadiness,
  GapStatus,
  GapTopic,
  KnowledgeGrowthPoint,
  LearningIntelligence,
  Recommendation,
  StudyActivityPoint,
} from '@/types'

/**
 * Minimal structural shape of a quiz attempt the calculators need. Both the
 * `@/types` `QuizAttempt` and the `quiz-repository` attempt record satisfy it,
 * so callers can pass either without coupling to a specific definition.
 */
export interface QuizAttemptLike {
  score: number
  total: number
}

/* -------------------------------------------------------------------------- */
/* Tunable thresholds (single source of truth for all derivations)            */
/* -------------------------------------------------------------------------- */

/** Mastery percentage at/above which a concept counts as "learned"/mastered. */
export const MASTERED_THRESHOLD = 75
/** Mastery percentage at/above which a concept counts as partially known. */
export const PARTIAL_THRESHOLD = 40

/** Fallback mastery implied by a concept's qualitative status. */
const STATUS_MASTERY: Record<ConceptStatus, number> = {
  core: 90,
  connected: 75,
  emerging: 45,
  weak: 20,
}

/* -------------------------------------------------------------------------- */
/* Small deterministic helpers                                                */
/* -------------------------------------------------------------------------- */

function clampPct(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, Math.round(n)))
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

/** Effective mastery for a concept: explicit value, else status-implied, else 0. */
export function conceptMastery(c: Concept): number {
  if (typeof c.mastery === 'number') return clampPct(c.mastery)
  if (c.status) return STATUS_MASTERY[c.status]
  return 0
}

/** `YYYY-MM` month key for an epoch-ms timestamp (UTC, stable). */
function monthKey(epochMs: number): string {
  const d = new Date(epochMs)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

/** Short month label (e.g. "Jan 2026") for a `YYYY-MM` key. */
function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1, 1))
  return d.toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}

function subjectOf(c: Concept): string {
  return c.subject ?? 'General'
}

/* -------------------------------------------------------------------------- */
/* Mastery                                                                    */
/* -------------------------------------------------------------------------- */

/** Average mastery (0-100) across all concepts; 0 when there are none. */
export function computeMastery(concepts: Concept[]): number {
  return clampPct(avg(concepts.map(conceptMastery)))
}

/* -------------------------------------------------------------------------- */
/* Knowledge growth (cumulative concepts & documents per month)               */
/* -------------------------------------------------------------------------- */

export function computeKnowledgeGrowth(
  concepts: Concept[],
  documents: Document[],
): KnowledgeGrowthPoint[] {
  // Concepts carry no timestamp; attribute them to the month of the document
  // that introduced them is not possible 1:1, so we bucket documents by their
  // real upload month and grow the concept line proportionally by month share.
  if (documents.length === 0) return []

  const docMonths = documents
    .map((d) => monthKey(d.uploadedAt))
    .sort((a, b) => a.localeCompare(b))

  const uniqueMonths = [...new Set(docMonths)]
  const docCountByMonth = new Map<string, number>()
  for (const m of docMonths) docCountByMonth.set(m, (docCountByMonth.get(m) ?? 0) + 1)

  const totalConcepts = concepts.length
  let cumulativeDocs = 0
  const totalDocs = documents.length

  return uniqueMonths.map((key) => {
    cumulativeDocs += docCountByMonth.get(key) ?? 0
    // Concept count grows in proportion to document coverage to date — fully
    // deterministic and reaches the true total at the latest month.
    const conceptsToDate =
      totalDocs === 0 ? 0 : Math.round((cumulativeDocs / totalDocs) * totalConcepts)
    return {
      month: monthLabel(key),
      concepts: conceptsToDate,
      documents: cumulativeDocs,
    }
  })
}

/* -------------------------------------------------------------------------- */
/* Study activity (minutes per day) + streak                                  */
/* -------------------------------------------------------------------------- */

/** Aggregates raw session points into one summed entry per day (order kept). */
export function computeStudyActivity(
  sessions: StudyActivityPoint[],
): StudyActivityPoint[] {
  if (sessions.length === 0) return []
  const order: string[] = []
  const byDay = new Map<string, number>()
  for (const s of sessions) {
    if (!byDay.has(s.day)) order.push(s.day)
    byDay.set(s.day, (byDay.get(s.day) ?? 0) + (s.minutes || 0))
  }
  return order.map((day) => ({ day, minutes: byDay.get(day) ?? 0 }))
}

/** Trailing consecutive days with any study minutes. */
export function computeStudyStreak(sessions: StudyActivityPoint[]): number {
  const activity = computeStudyActivity(sessions)
  let streak = 0
  for (let i = activity.length - 1; i >= 0; i--) {
    if ((activity[i].minutes || 0) > 0) streak++
    else break
  }
  return streak
}

/* -------------------------------------------------------------------------- */
/* Exam readiness (per subject)                                               */
/* -------------------------------------------------------------------------- */

/**
 * Per-subject readiness. Components:
 * - coverage:    share of the subject's concepts that are at least partial
 * - accuracy:    overall quiz accuracy (attempts lack subject linkage, so the
 *                global rate is applied uniformly — documented limitation)
 * - consistency: trailing study streak mapped onto 0-100 (7+ days = 100)
 * - confidence:  mean of the three components above
 */
export function computeExamReadiness(
  concepts: Concept[],
  quizAttempts: QuizAttemptLike[],
  sessions: StudyActivityPoint[],
): ExamReadiness[] {
  if (concepts.length === 0) return []

  const totalScore = quizAttempts.reduce((a, q) => a + (q.score || 0), 0)
  const totalQuestions = quizAttempts.reduce((a, q) => a + (q.total || 0), 0)
  const accuracy = totalQuestions === 0 ? 0 : clampPct((totalScore / totalQuestions) * 100)

  const streak = computeStudyStreak(sessions)
  const consistency = clampPct((Math.min(streak, 7) / 7) * 100)

  const bySubject = new Map<string, Concept[]>()
  for (const c of concepts) {
    const s = subjectOf(c)
    if (!bySubject.has(s)) bySubject.set(s, [])
    bySubject.get(s)!.push(c)
  }

  return [...bySubject.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([subject, list]) => {
      const covered = list.filter((c) => conceptMastery(c) >= PARTIAL_THRESHOLD).length
      const coverage = clampPct((covered / list.length) * 100)
      const confidence = clampPct(avg([coverage, accuracy, consistency]))
      return { subject, coverage, accuracy, consistency, confidence }
    })
}

/* -------------------------------------------------------------------------- */
/* Learning gaps (per concept)                                                */
/* -------------------------------------------------------------------------- */

function gapStatus(mastery: number): GapStatus {
  if (mastery >= MASTERED_THRESHOLD) return 'mastered'
  if (mastery >= PARTIAL_THRESHOLD) return 'partial'
  return 'missing'
}

export function computeLearningGaps(concepts: Concept[]): GapTopic[] {
  return concepts
    .filter((c) => c.group !== 'subject' && c.group !== 'document')
    .map((c) => {
      const mastery = conceptMastery(c)
      return {
        name: c.label,
        subject: subjectOf(c),
        status: gapStatus(mastery),
        progress: mastery,
      }
    })
    // Weakest first — most actionable gaps surface at the top.
    .sort((a, b) => a.progress - b.progress)
}

/* -------------------------------------------------------------------------- */
/* Recommendations (deterministic ranking; prose filled in elsewhere)         */
/* -------------------------------------------------------------------------- */

export function computeRecommendations(
  concepts: Concept[],
  quizAttempts: QuizAttemptLike[],
  sessions: StudyActivityPoint[],
): Recommendation {
  const empty: Recommendation = {
    nextTopic: { mastered: '', recommended: '', subject: '', reason: '', confidence: 0 },
    weakAreas: [],
    knowledgeGaps: [],
    studyPath: [],
    examReadiness: { current: 0, potential: 0, hoursNeeded: 0, examName: '' },
  }

  const learnable = concepts.filter(
    (c) => c.group !== 'subject' && c.group !== 'document',
  )
  if (learnable.length === 0) return empty

  const ranked = [...learnable].sort((a, b) => conceptMastery(a) - conceptMastery(b))
  const weakest = ranked[0]
  const strongest = ranked[ranked.length - 1]

  const weakAreas = ranked
    .filter((c) => conceptMastery(c) < MASTERED_THRESHOLD)
    .slice(0, 5)
    .map((c) => ({
      name: c.label,
      subject: subjectOf(c),
      confidence: conceptMastery(c),
    }))

  // Group missing concepts by subject for the knowledge-gaps list.
  const missingBySubject = new Map<string, string[]>()
  for (const c of ranked) {
    if (conceptMastery(c) < PARTIAL_THRESHOLD) {
      const s = subjectOf(c)
      if (!missingBySubject.has(s)) missingBySubject.set(s, [])
      missingBySubject.get(s)!.push(c.label)
    }
  }
  const knowledgeGaps = [...missingBySubject.entries()].map(([subject, missing]) => ({
    subject,
    missing,
  }))

  // Study path: weakest 4 concepts in ascending mastery order.
  const studyPath = ranked.slice(0, 4).map((c, i) => ({
    label: c.label,
    subject: subjectOf(c),
    status: (i === 0 ? 'current' : 'next') as 'current' | 'next',
  }))

  const readiness = computeExamReadiness(concepts, quizAttempts, sessions)
  const current = clampPct(avg(readiness.map((r) => r.confidence)))
  const potential = clampPct(Math.max(current, current + (100 - current) * 0.4))

  return {
    nextTopic: {
      mastered: strongest.label,
      recommended: weakest.label,
      subject: subjectOf(weakest),
      // Deterministic placeholder; AI Coach (Phase 7) may replace this prose.
      reason: `Lowest mastery (${conceptMastery(weakest)}%) — reinforcing it unlocks dependent topics.`,
      confidence: 100 - conceptMastery(weakest),
    },
    weakAreas,
    knowledgeGaps,
    studyPath,
    examReadiness: {
      current,
      potential,
      // ~1.5 study hours per remaining mastery point bucket, deterministic.
      hoursNeeded: Math.max(0, Math.round(((potential - current) / 10) * 1.5)),
      examName: '',
    },
  }
}

/* -------------------------------------------------------------------------- */
/* Learning intelligence                                                      */
/* -------------------------------------------------------------------------- */

export function computeLearningIntelligence(
  concepts: Concept[],
  sessions: StudyActivityPoint[],
  documents: Document[],
): LearningIntelligence {
  const learnable = concepts.filter(
    (c) => c.group !== 'subject' && c.group !== 'document',
  )

  const empty: LearningIntelligence = {
    mostStudied: { concept: '', subject: '', sessions: 0 },
    weakest: { concept: '', subject: '', mastery: 0 },
    fastestImproving: { subject: '', delta: 0 },
    consistency: 0,
    coverage: 0,
    aiConfidence: 0,
    weeklyInsights: [],
  }
  if (learnable.length === 0) return empty

  const ranked = [...learnable].sort((a, b) => conceptMastery(a) - conceptMastery(b))
  const weakest = ranked[0]
  // "Most studied" proxy: highest frequency, else highest mastery (deterministic).
  const mostStudied = [...learnable].sort(
    (a, b) => (b.frequency ?? conceptMastery(b)) - (a.frequency ?? conceptMastery(a)),
  )[0]

  const coverage = clampPct(
    (learnable.filter((c) => conceptMastery(c) >= PARTIAL_THRESHOLD).length /
      learnable.length) *
      100,
  )
  const streak = computeStudyStreak(sessions)
  const consistency = clampPct((Math.min(streak, 7) / 7) * 100)
  const aiConfidence = clampPct(avg([coverage, consistency, computeMastery(concepts)]))

  const insights: string[] = []
  insights.push(`${documents.length} document${documents.length === 1 ? '' : 's'} analyzed across ${new Set(learnable.map(subjectOf)).size} subject(s).`)
  insights.push(`${coverage}% of concepts are at least partially mastered.`)
  if (weakest) insights.push(`Focus area: ${weakest.label} (${conceptMastery(weakest)}% mastery).`)

  return {
    mostStudied: {
      concept: mostStudied?.label ?? '',
      subject: mostStudied ? subjectOf(mostStudied) : '',
      sessions: mostStudied?.frequency ?? 0,
    },
    weakest: {
      concept: weakest.label,
      subject: subjectOf(weakest),
      mastery: conceptMastery(weakest),
    },
    // No historical snapshots are persisted yet, so improvement delta is 0.
    fastestImproving: { subject: '', delta: 0 },
    consistency,
    coverage,
    aiConfidence,
    weeklyInsights: insights,
  }
}

/* -------------------------------------------------------------------------- */
/* Dashboard summary                                                          */
/* -------------------------------------------------------------------------- */

export interface DashboardMetrics {
  documents: number
  conceptsLearned: number
  studyStreak: number
  avgMastery: number
  subjects: number
  knowledgeGrowth: KnowledgeGrowthPoint[]
  studyActivity: StudyActivityPoint[]
  recentActivity: Activity[]
  learningIntelligence: LearningIntelligence
}

export function computeDashboardMetrics(input: {
  concepts: Concept[]
  documents: Document[]
  quizAttempts: QuizAttemptLike[]
  sessions: StudyActivityPoint[]
  recentActivity?: Activity[]
}): DashboardMetrics {
  const { concepts, documents, sessions, recentActivity = [] } = input

  const learnable = concepts.filter(
    (c) => c.group !== 'subject' && c.group !== 'document',
  )
  const conceptsLearned = learnable.filter(
    (c) => conceptMastery(c) >= MASTERED_THRESHOLD,
  ).length

  const subjects = new Set(
    documents.map((d) => d.subject).filter((s): s is string => Boolean(s)),
  ).size

  return {
    documents: documents.length,
    conceptsLearned,
    studyStreak: computeStudyStreak(sessions),
    avgMastery: computeMastery(concepts),
    subjects,
    knowledgeGrowth: computeKnowledgeGrowth(concepts, documents),
    studyActivity: computeStudyActivity(sessions),
    recentActivity,
    learningIntelligence: computeLearningIntelligence(concepts, sessions, documents),
  }
}

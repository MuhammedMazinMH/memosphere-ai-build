/**
 * Zod validation schemas.
 *
 * Production note:
 * - These schemas validate input at the API boundary (Route Handlers) and in
 *   server actions before any repository/service call. Keep them in sync with
 *   the domain models in types/index.ts.
 */
import { z } from 'zod'

export const fileTypeSchema = z.enum([
  'pdf',
  'note',
  'image',
  'presentation',
  'video',
])

/** Users */
export const userSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  email: z.string().email('A valid email is required'),
  plan: z.string().optional(),
  goal: z.string().max(240).optional(),
})
export type UserInput = z.infer<typeof userSchema>

/** Subjects */
export const subjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required').max(120),
  description: z.string().max(500).optional().default(''),
  color: z.string().optional(),
})
export type SubjectInput = z.infer<typeof subjectSchema>

/**
 * Documents (metadata only — bytes live in S3).
 *
 * Note: `userId`, `uploadedAt` and `s3Key` are derived server-side (from the
 * authenticated session and the S3 write) and are intentionally NOT accepted
 * from client input.
 */
export const documentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  type: fileTypeSchema,
  subjectId: z.string().min(1, 'A subject is required'),
  sizeBytes: z.number().int().positive().optional(),
  status: z
    .enum(['uploaded', 'processing', 'ready', 'failed'])
    .optional()
    .default('uploaded'),
})
export type DocumentInput = z.infer<typeof documentSchema>

/** File uploads */
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024 // 25MB
export const fileUploadSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  contentType: z.string().min(1, 'Content type is required'),
  size: z
    .number()
    .int()
    .positive()
    .max(MAX_UPLOAD_BYTES, 'File exceeds the 25MB limit'),
  subjectId: z.string().min(1, 'A subject is required'),
})
export type FileUploadInput = z.infer<typeof fileUploadSchema>

/** Summary requests */
export const summaryRequestSchema = z.object({
  documentId: z.string().min(1, 'A document is required'),
  length: z.enum(['short', 'medium', 'detailed']).default('medium'),
})
export type SummaryRequestInput = z.infer<typeof summaryRequestSchema>

/** Quiz requests */
export const quizRequestSchema = z.object({
  subjectId: z.string().min(1, 'A subject is required'),
  questionCount: z.number().int().min(1).max(50).default(10),
  difficulty: z
    .enum(['foundational', 'intermediate', 'advanced'])
    .default('intermediate'),
})
export type QuizRequestInput = z.infer<typeof quizRequestSchema>

/**
 * Helper that parses unknown input and returns a discriminated result so Route
 * Handlers can respond with 400 + field errors without throwing.
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
):
  | { success: true; data: T }
  | { success: false; errors: Record<string, string[]> } {
  const result = schema.safeParse(data)
  if (result.success) return { success: true, data: result.data }
  return {
    success: false,
    errors: result.error.flatten().fieldErrors as Record<string, string[]>,
  }
}

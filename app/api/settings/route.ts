/**
 * /api/settings — per-user settings (study goal, bio, notification prefs).
 *
 * All handlers are scoped to the authenticated Clerk user; a user can only
 * ever read or mutate their own settings. Persistence is DynamoDB via
 * settingsRepository. Profile/goal changes also emit a notification.
 */
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { settingsRepository } from '@/db/repositories/settings-repository'
import { notificationRepository } from '@/db/repositories/notification-repository'
import type { NotificationPreferences } from '@/lib/types/account'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const settings = await settingsRepository.get(userId)
  return NextResponse.json({ settings })
}

export async function PUT(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as {
    studyGoal?: string
    bio?: string
    notifications?: Partial<NotificationPreferences>
  }

  try {
    const current = await settingsRepository.get(userId)
    const goalChanged =
      typeof body.studyGoal === 'string' && body.studyGoal !== current.studyGoal

    let updated = current

    if (typeof body.studyGoal === 'string' || typeof body.bio === 'string') {
      updated = await settingsRepository.updateProfile(userId, {
        studyGoal:
          typeof body.studyGoal === 'string'
            ? body.studyGoal.trim().slice(0, 200)
            : undefined,
        bio:
          typeof body.bio === 'string'
            ? body.bio.trim().slice(0, 500)
            : undefined,
      })
    }

    if (body.notifications) {
      updated = await settingsRepository.updateNotifications(userId, {
        weekly: Boolean(body.notifications.weekly ?? updated.notifications.weekly),
        gaps: Boolean(body.notifications.gaps ?? updated.notifications.gaps),
        quiz: Boolean(body.notifications.quiz ?? updated.notifications.quiz),
        product: Boolean(
          body.notifications.product ?? updated.notifications.product,
        ),
      })
    }

    // Emit a notification when the study goal changes.
    if (goalChanged && body.studyGoal) {
      try {
        await notificationRepository.create({
          userId,
          title: 'Study goal updated',
          message: `Your study goal is now "${updated.studyGoal}".`,
          type: 'study_goal_updated',
        })
      } catch {
        // Non-critical — never fail the settings save because of a notification.
      }
    }

    return NextResponse.json({ settings: updated })
  } catch (error) {
    // TEMPORARY DIAGNOSTIC: surface the exact backend error to the client so the
    // user can read the precise DynamoDB exception (name, message, AWS status).
    const err = error as {
      name?: string
      message?: string
      $metadata?: { httpStatusCode?: number }
      __type?: string
    }
    const awsStatus = err?.$metadata?.httpStatusCode
    // AWS SDK v3 exposes the exception type on `name` (e.g. ResourceNotFoundException).
    const errorName = err?.name ?? err?.__type ?? 'Error'
    const errorMessage = err?.message ?? 'Unknown error'

    console.error('[api/settings] PUT failed for userId', userId, {
      name: errorName,
      message: errorMessage,
      awsStatus,
    })

    return NextResponse.json(
      {
        error: 'Could not save settings',
        name: errorName,
        message: errorMessage,
        awsStatus: awsStatus ?? null,
      },
      // Echo the AWS HTTP status when present, otherwise 500.
      { status: awsStatus ?? 500 },
    )
  }
}

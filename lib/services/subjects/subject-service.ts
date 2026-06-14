/**
 * Subject service.
 *
 * Application-facing API for subjects. Wraps the subject repository so UI/route
 * code never touches the data source directly. Reads are synchronous today
 * (mock data); once Aurora is connected these can become async without changing
 * the rendered output.
 */
import { subjectRepository } from '@/db/repositories/subject-repository'
import type { Subject } from '@/types'

export const subjectService = {
  getSubjects(): Subject[] {
    return subjectRepository.findAll()
  },
  getSubject(id: string): Subject | undefined {
    return subjectRepository.findById(id)
  },
  getSubjectCount(): number {
    return subjectRepository.count()
  },

  /**
   * Live read of all subjects from DynamoDB with graceful mock fallback.
   * On any DynamoDB error the error is logged and the synchronous mock data is
   * returned so the UI never breaks.
   */
  async listSubjects(): Promise<Subject[]> {
    try {
      return await subjectRepository.findAllFromDb()
    } catch (error) {
      console.error('[v0] subjectService.listSubjects DynamoDB error:', error)
      return subjectRepository.findAll()
    }
  },

  /** Live read of a single subject from DynamoDB with mock fallback. */
  async getSubjectById(id: string): Promise<Subject | undefined> {
    try {
      return await subjectRepository.findByIdFromDb(id)
    } catch (error) {
      console.error('[v0] subjectService.getSubjectById DynamoDB error:', error)
      return subjectRepository.findById(id)
    }
  },
}

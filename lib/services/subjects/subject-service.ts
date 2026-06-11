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
}

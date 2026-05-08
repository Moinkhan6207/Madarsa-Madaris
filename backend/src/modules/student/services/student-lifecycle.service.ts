import { StudentStatus } from '@prisma/client';
import { AppError } from '../../../common/errors/AppError';

export const ALLOWED_TRANSITIONS: Record<StudentStatus, StudentStatus[]> = {
  [StudentStatus.LEAD]: [StudentStatus.APPLIED],
  [StudentStatus.APPLIED]: [StudentStatus.UNDER_REVIEW, StudentStatus.DROPPED],
  [StudentStatus.UNDER_REVIEW]: [StudentStatus.ADMITTED, StudentStatus.DROPPED],
  [StudentStatus.ADMITTED]: [StudentStatus.ACTIVE, StudentStatus.DROPPED],
  [StudentStatus.ACTIVE]: [
    StudentStatus.PROMOTED,
    StudentStatus.TRANSFERRED,
    StudentStatus.DROPPED,
    StudentStatus.PASSED_OUT,
  ],
  [StudentStatus.PROMOTED]: [
    StudentStatus.ACTIVE,
    StudentStatus.TRANSFERRED,
    StudentStatus.DROPPED,
    StudentStatus.PASSED_OUT,
  ],
  [StudentStatus.TRANSFERRED]: [StudentStatus.ALUMNI],
  [StudentStatus.DROPPED]: [StudentStatus.ALUMNI],
  [StudentStatus.PASSED_OUT]: [StudentStatus.ALUMNI],
  [StudentStatus.ALUMNI]: [],
};

export class StudentLifecycleService {
  validateTransition(currentStatus: StudentStatus, targetStatus: StudentStatus): void {
    if (currentStatus === targetStatus) {
      throw new AppError(
        `Student is already in ${targetStatus} status`,
        400,
        'STUDENT_STATUS_UNCHANGED'
      );
    }

    const allowedTransitions = ALLOWED_TRANSITIONS[currentStatus] ?? [];
    if (!allowedTransitions.includes(targetStatus)) {
      throw new AppError(
        `Invalid student status transition from ${currentStatus} to ${targetStatus}`,
        400,
        'INVALID_STUDENT_STATUS_TRANSITION',
        true,
        {
          currentStatus,
          targetStatus,
          allowedTransitions,
        }
      );
    }
  }
}

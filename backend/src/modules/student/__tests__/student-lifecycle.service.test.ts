import { StudentStatus } from '@prisma/client';
import { StudentLifecycleService } from '../services/student-lifecycle.service';

describe('StudentLifecycleService', () => {
  const service = new StudentLifecycleService();

  it('allows valid lifecycle transitions', () => {
    expect(() =>
      service.validateTransition(StudentStatus.LEAD, StudentStatus.APPLIED)
    ).not.toThrow();
    expect(() =>
      service.validateTransition(StudentStatus.ACTIVE, StudentStatus.PROMOTED)
    ).not.toThrow();
    expect(() =>
      service.validateTransition(StudentStatus.PASSED_OUT, StudentStatus.ALUMNI)
    ).not.toThrow();
  });

  it('rejects invalid lifecycle transitions', () => {
    expect(() =>
      service.validateTransition(StudentStatus.LEAD, StudentStatus.ACTIVE)
    ).toThrow('Invalid student status transition');
    expect(() =>
      service.validateTransition(StudentStatus.PROMOTED, StudentStatus.LEAD)
    ).toThrow('Invalid student status transition');
  });

  it('rejects no-op transitions', () => {
    expect(() =>
      service.validateTransition(StudentStatus.ACTIVE, StudentStatus.ACTIVE)
    ).toThrow('already in ACTIVE status');
  });
});

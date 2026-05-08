import { z } from 'zod';
import {
  ChangeStudentStatusSchema,
  CreateGuardianSchema,
  CreateSponsorSchema,
  CreateStudentSchema,
  MapSponsorSchema,
  StudentListQuerySchema,
  UpdateGuardianSchema,
  UpdateStudentSchema,
} from '../dto/student.dto';

export const studentValidators = {
  list: StudentListQuerySchema,
  create: CreateStudentSchema,
  update: UpdateStudentSchema,
  changeStatus: ChangeStudentStatusSchema,
  createGuardian: CreateGuardianSchema,
  updateGuardian: UpdateGuardianSchema,
  createSponsor: CreateSponsorSchema,
  mapSponsor: MapSponsorSchema,
  idParam: z.object({
    id: z.string().uuid(),
  }),
  studentIdParam: z.object({
    id: z.string().uuid(),
  }),
  guardianIdParam: z.object({
    id: z.string().uuid(),
  }),
  sponsorIdParam: z.object({
    sponsorId: z.string().uuid(),
  }),
};

import { NextFunction, Request, Response } from 'express';
import { createdResponse, noContentResponse, paginatedResponse, successResponse } from '../../../common/utils/response';
import { prisma } from '../../../config/prisma.service';
import { StudentService } from '../services/student.service';
import { studentValidators } from '../validators/student.validator';

const studentService = new StudentService(prisma);

export class StudentController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const actorUserId = req.context!.userId;
      const payload = studentValidators.create.parse(req.body);
      const student = await studentService.createStudent(tenantId, actorUserId, payload);
      createdResponse(res, student);
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const query = studentValidators.list.parse(req.query);
      console.log('DEBUG: listStudents called from', req.headers['user-agent'], 'with tenantId:', tenantId, 'query:', query);
      const result = await studentService.listStudents(tenantId, query);
      paginatedResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const { id } = studentValidators.idParam.parse(req.params);
      const student = await studentService.getStudentById(tenantId, id);
      successResponse(res, student);
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const { id } = studentValidators.idParam.parse(req.params);
      const history = await studentService.getStudentHistory(tenantId, id);
      successResponse(res, history);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const actorUserId = req.context!.userId;
      const { id } = studentValidators.idParam.parse(req.params);
      const payload = studentValidators.update.parse(req.body);
      const student = await studentService.updateStudent(tenantId, actorUserId, id, payload);
      successResponse(res, student);
    } catch (error) {
      next(error);
    }
  }

  static async changeStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const actorUserId = req.context!.userId;
      const { id } = studentValidators.idParam.parse(req.params);
      const payload = studentValidators.changeStatus.parse(req.body);
      const student = await studentService.changeStudentStatus(tenantId, actorUserId, id, payload);
      successResponse(res, student);
    } catch (error) {
      next(error);
    }
  }

  static async softDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const actorUserId = req.context!.userId;
      const { id } = studentValidators.idParam.parse(req.params);
      await studentService.deleteStudent(tenantId, actorUserId, id);
      noContentResponse(res);
    } catch (error) {
      next(error);
    }
  }

  static async createGuardian(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const actorUserId = req.context!.userId;
      const { id } = studentValidators.studentIdParam.parse(req.params);
      const payload = studentValidators.createGuardian.parse(req.body);
      const guardian = await studentService.addGuardian(tenantId, actorUserId, id, payload);
      createdResponse(res, guardian);
    } catch (error) {
      next(error);
    }
  }

  static async updateGuardian(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const actorUserId = req.context!.userId;
      const { id } = studentValidators.guardianIdParam.parse(req.params);
      const payload = studentValidators.updateGuardian.parse(req.body);
      const guardian = await studentService.updateGuardian(tenantId, actorUserId, id, payload);
      successResponse(res, guardian);
    } catch (error) {
      next(error);
    }
  }

  static async deleteGuardian(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const actorUserId = req.context!.userId;
      const { id } = studentValidators.guardianIdParam.parse(req.params);
      await studentService.deleteGuardian(tenantId, actorUserId, id);
      noContentResponse(res);
    } catch (error) {
      next(error);
    }
  }

  static async createSponsor(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const actorUserId = req.context!.userId;
      const payload = studentValidators.createSponsor.parse(req.body);
      const sponsor = await studentService.createSponsor(tenantId, actorUserId, payload);
      createdResponse(res, sponsor);
    } catch (error) {
      next(error);
    }
  }

  static async listSponsors(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const sponsors = await studentService.listSponsors(tenantId);
      successResponse(res, sponsors);
    } catch (error) {
      next(error);
    }
  }

  static async mapSponsor(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const actorUserId = req.context!.userId;
      const { id } = studentValidators.studentIdParam.parse(req.params);
      const payload = studentValidators.mapSponsor.parse(req.body);
      const mapping = await studentService.mapSponsor(tenantId, actorUserId, id, payload);
      createdResponse(res, mapping);
    } catch (error) {
      next(error);
    }
  }

  static async unlinkSponsor(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const actorUserId = req.context!.userId;
      const { id, sponsorId } = studentValidators.studentIdParam
        .extend(studentValidators.sponsorIdParam.shape)
        .parse(req.params);
      await studentService.unlinkSponsor(tenantId, actorUserId, id, sponsorId);
      noContentResponse(res);
    } catch (error) {
      next(error);
    }
  }

  static async createDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const actorUserId = req.context!.userId;
      const { id } = studentValidators.studentIdParam.parse(req.params);
      const payload = studentValidators.createDocument.parse(req.body);
      const document = await studentService.addDocument(tenantId, actorUserId, id, payload);
      createdResponse(res, document);
    } catch (error) {
      next(error);
    }
  }

  static async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const actorUserId = req.context!.userId;
      const { id, documentId } = studentValidators.studentIdParam
        .extend(studentValidators.documentIdParam.shape)
        .parse(req.params);
      await studentService.deleteDocument(tenantId, actorUserId, id, documentId);
      noContentResponse(res);
    } catch (error) {
      next(error);
    }
  }
}

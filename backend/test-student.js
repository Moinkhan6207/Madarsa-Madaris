const { PrismaClient } = require('@prisma/client');
const { StudentRepository } = require('./src/modules/student/repositories/student.repository.ts');
// since it's ts, we can't run it directly without ts-node.

import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

let prisma;

try {
  prisma = new PrismaClient();
} catch (error) {
  console.warn('PrismaClient initialization notice:', error.message);
}

export default prisma;

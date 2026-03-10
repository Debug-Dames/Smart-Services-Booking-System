// src/prismaClient.js
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

// Named export
export const prisma = new PrismaClient();
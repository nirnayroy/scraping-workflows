import { PrismaClient } from "@/lib/generated/prisma"
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = new PrismaClient()
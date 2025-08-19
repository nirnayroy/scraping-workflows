"use server";

import { auth } from "@clerk/nextjs/server"
import { PrismaClient } from '@/lib/generated/prisma';

export async function getWorkflowsForUser() {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("User not authenticated");
    }

    const prisma = new PrismaClient();
    // Simulate fetching workflows from a database or an API
    return prisma.workflow.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "asc",
        },
    });
}
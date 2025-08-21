"use server";

import { PrismaClient } from '@/lib/generated/prisma';
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function DeleteWorkflow(id: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthenticated user");
    }
    const prisma = new PrismaClient();
    await prisma.workflow.delete({
        where: {
            id,
            userId,
        },
    });

    revalidatePath("/workflows");
}
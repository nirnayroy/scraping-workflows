"use server";

import { PrismaClient } from '@/lib/generated/prisma';
import {createWorkflowSchema, createWorkflowSchemaType } from "@/schema/worflow";
import { WorkflowStatus } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function CreateWorkflow(form: createWorkflowSchemaType
    ) {

        const {success, data} = createWorkflowSchema.safeParse(form);
        if (!success) {
            throw new Error("Invalid form data");
        }

        const { userId } = await auth();

        if (!userId) {
            throw new Error("User not authenticated");
        }
        const prisma = new PrismaClient();
        const result = await prisma.workflow.create({
            data: {
                userId,
                status: WorkflowStatus.DRAFT,
                definition: "TODO",
                ...data,
            },
        });

        if (!result) {
            throw new Error("Failed to create workflow");
        }

        redirect(`/workflow/editor/${result.id}`);
    }

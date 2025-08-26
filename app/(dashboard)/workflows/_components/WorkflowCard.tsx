"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Workflow } from "@/lib/generated/prisma";
import { cn } from "@/lib/utils";
import { WorkflowStatus } from "@/types/workflow";
import {
  FileTextIcon,
  MoreVerticalIcon,
  PlayIcon,
  ShuffleIcon,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import TooltipWrapper from "@/components/TooltipWrapper";
import DeleteWorkflowDialog from "./DeleteWorkflowDialog";
import WorkflowStatusIcon from "./WorkflowStatusIcon";
const statusColors = {
  [WorkflowStatus.DRAFT]: "bg-yellow-100 text-yellow-800",
  [WorkflowStatus.PENDING]: "bg-green-100 text-green-800",
  [WorkflowStatus.COMPLETE]: "bg-blue-100 text-blue-800",
};

function WorkflowCard({ workflow }: { workflow: Workflow }) {
  const isDraft = workflow.status === WorkflowStatus.DRAFT;
  return (
    <Card className="border border-separate shadow-sm rounded-md overflow-hidden hover:shadow-md dark:shadow-primary/30">
      <CardContent className="p-4 flex items-center justify-between h-[100px]">
        <div className="flex items-center justify-end space-x-3">
          <WorkflowStatusIcon key={workflow.id} workflow={workflow}/>
          <div>
            <h3 className="text-base font-bold text-muted-foreground flex items-center">
              <Link
                href={`/workflows/${workflow.id}`}
                className="flex items-center hover:underline"
              >
                {workflow.name}
              </Link>
              {isDraft && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  Complete
                </span>
              )}
            </h3>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href={`/workflows/${workflow.id}`}
            className={cn(
              buttonVariants({
                variant: "outline",
                size: "sm",
              }),
              "flex items-center gap-2"
            )}
          >
            <ShuffleIcon size={16} />
            Edit
          </Link>
          <WorkflowActions workflowName={workflow.name} workflowId = {workflow.id}/>
        </div>
      </CardContent>
    </Card>
  );
}

function WorkflowActions({workflowName, workflowId}: {workflowName: string, workflowId: string}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  return (
    <>
      <DeleteWorkflowDialog
              open={showDeleteDialog}
              setOpen={setShowDeleteDialog} workflowName={workflowName} workflowId={workflowId}/>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"outline"} size={"sm"}>
            <TooltipWrapper content={"More actions"}>
              <div className="flex items-center justify-center w-full h-full">
                <MoreVerticalIcon size={18} />
              </div>
            </TooltipWrapper>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive flex items-center gap-2"
            onSelect={() => {
              setShowDeleteDialog((prev) => !prev);
            }}
          >
            <TrashIcon size={16} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
export default WorkflowCard;

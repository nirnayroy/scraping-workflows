"use client";

import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Workflow } from '@/lib/generated/prisma';
import { cn } from '@/lib/utils';
import { WorkflowStatus } from '@/types/workflow';
import { FileTextIcon, MoreVerticalIcon, PlayIcon, ShuffleIcon, TrashIcon } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react'
import { DropdownMenu, DropdownMenuLabel, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import TooltipWrapper from '@/components/TooltipWrapper';
import DeleteWorkflowDialog from './DeleteWorkflowDialog';
const statusColors = {
    [WorkflowStatus.DRAFT]: 'bg-yellow-100 text-yellow-800',
    [WorkflowStatus.PUBLISHED]: 'bg-green-100 text-green-800',
}

function WorkflowCard({ workflow }: { workflow: Workflow }) {

    const isDraft = workflow.status === WorkflowStatus.DRAFT;
    return (
        <Card className="border border-separate shadow-sm rounded-lg overflow-hidden hover:shadow-md dark:shadow-primary/30">
            <CardContent className='p-4 flex items-center justify-between h-[100px]'>
            <div className='flex items-center justify-end space-x-3'>
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center",
                    statusColors[workflow.status as WorkflowStatus])}>
                    {isDraft ? (
                        <FileTextIcon className="h-5 w-5" />
                    ) : (
                        <PlayIcon className='h-5 w-5 text-white' />
                    )}
                </div>
                <div>
                    <h3 className="text-base font-bold text-muted-foreground flex items-center">
                        <Link
                            href={`/workflow/editor/${workflow.id}`} className="flex items-center hover:underline">
                            {workflow.name}
                        </Link>
                        {isDraft && (
                            <span className='ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full'>
                                Draft
                            </span>
                        )}
                    </h3>
                </div>
            </div>
            <div className='flex items-center space-x-2'>
            <Link href={`/workflow/editor/${workflow.id}`} 
            className={cn(buttonVariants({
                variant: "outline",
                size: "sm", 
            }),
            "flex items-center gap-2"
            )}>
                <ShuffleIcon size={16} />
                Edit
                        </Link>
                        <WorkflowActions />
            </div>
            </CardContent>,
        </Card>
    );
}

function WorkflowActions() {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
 return (
 <>
 <DeleteWorkflowDialog open={showDeleteDialog} setOpen={setShowDeleteDialog} />
 <DropdownMenu>
    <DropdownMenuTrigger asChild>

        <Button variant={"outline"} size={"sm"}>
            <TooltipWrapper content={"More actions"}>
                <div className='flex items-center justify-center w-full h-full'>
            <MoreVerticalIcon size={18} />
            </div>
            </TooltipWrapper>
        </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem className='text-destructive flex items-center gap-2'
    onSelect={() =>{
        setShowDeleteDialog((prev) => !prev);
    }}
    >
        <TrashIcon size={16} />
        Delete
    </DropdownMenuItem>
    </DropdownMenuContent>
 </DropdownMenu></>
 )
}
export default WorkflowCard
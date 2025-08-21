"use client";

import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query';
import { Delete } from 'lucide-react';
import { toast } from 'sonner';
import { DeleteWorkflow } from '@/actions/workflows/deleteWorkflow';

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  workflowName: string;
  workflowId: string;

}
function DeleteWorkflowDialog({ open, setOpen, workflowName, workflowId}: Props) {
  const [confirmText, setConfirmText] = useState("");
  const deleteMutation = useMutation({
    mutationFn: DeleteWorkflow,
    onSuccess: () => {
      toast.success("workflow deleted", { id: workflowId });
    },
    onError: () => {
      toast.error("Something went wrong", {id: workflowId});
    },
  })
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            
            <AlertDialogDescription>
              If you delete this workflow, it will be permanently removed from the system and cannot be recovered.
              <div className='flex flex-col py-4 gap-2'>
                <p>If you are sure, enter <b>{workflowName}</b></p>
                <Input 
                 value={confirmText}
                 onChange={(e) => setConfirmText(e.target.value)}/>
              </div>
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmText("")}>Cancel</AlertDialogCancel>
              <AlertDialogAction disabled={confirmText !== workflowName || deleteMutation.isPending} 
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90' 
              onClick={() => {
                toast.loading("Deleting workflow...", { id: workflowId });
                deleteMutation.mutate(workflowId);
              }}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteWorkflowDialog
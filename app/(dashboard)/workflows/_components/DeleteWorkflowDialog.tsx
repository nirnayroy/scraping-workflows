"use client";

import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import React from 'react'

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}
function DeleteWorkflowDialog({ open, setOpen}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            </AlertDialogHeader>
        </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteWorkflowDialog
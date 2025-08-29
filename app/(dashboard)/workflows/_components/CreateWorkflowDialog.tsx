"use client";

import React, { useCallback, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Layers2Icon, Loader2 } from "lucide-react";
import CustomDialogHeader from "@/components/CustomDialogHeader";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CreateWorkflow } from "@/actions/workflows/createWorkflow";
import { useMutation } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";

// --- Schema including the new fields ---
const positionSchema = z.object({
  ticker: z.string().min(1, "Ticker required"),
  quantity: z.number().min(1, "Quantity must be > 0"),
});

const createWorkflowSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(80).optional(),

  id: z.string().optional(), // typically generated backend side
  positions: z.array(positionSchema).min(1, "At least one position required"),
  cash: z.number().nonnegative(),

  preferences: z.object({
    risk_tolerance: z.enum(["low", "medium", "high"]),
    horizon_months: z.number().min(1),
    single_name_cap: z.number().min(0).max(1),
  }),

  constraints: z.object({
    max_positions: z.number().min(1),
    min_position_size: z.number().min(0),
  }),

  user_profile: z.object({
    currency: z.string().length(3, "Use ISO currency code"),
    allow_derivatives: z.boolean(),
  }),
});

export type createWorkflowSchemaType = z.infer<typeof createWorkflowSchema>;

function CreateWorkflowDialog({ triggerText }: { triggerText?: string }) {
  const [open, setOpen] = useState(false);

  const form = useForm<createWorkflowSchemaType>({
    resolver: zodResolver(createWorkflowSchema),
    defaultValues: {
      positions: [{ ticker: "", quantity: 0 }],
      preferences: {
        risk_tolerance: "medium",
        horizon_months: 12,
        single_name_cap: 0.1,
      },
      constraints: {
        max_positions: 10,
        min_position_size: 0.01,
      },
      user_profile: {
        currency: "USD",
        allow_derivatives: false,
      },
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: CreateWorkflow,
    onSuccess: () => {
      toast.success("Workflow created", { id: "create-workflow" });
    },
    onError: () => {
      toast.error("Failed to create workflow", { id: "create-workflow" });
    },
  });

  const onSubmit = useCallback(
    (values: createWorkflowSchemaType) => {
      toast.loading("Creating workflow...", { id: "create-workflow" });
      mutate(values);
    },
    [mutate]
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        form.reset();
        setOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button>{triggerText ?? "Create workflow"}</Button>
      </DialogTrigger>
      <DialogContent className="px-0">
        <CustomDialogHeader
          icon={Layers2Icon}
          title="Create workflow"
          subTitle="Create a new scraping workflow"
        />
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <Form {...form}>
            <form className="space-y-8 w-full" onSubmit={form.handleSubmit(onSubmit)}>
              {/* Basic */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workflow Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cash */}
              <FormField
                control={form.control}
                name="cash"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cash</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Preferences */}
              <h3 className="font-semibold">Preferences</h3>
              <FormField
                control={form.control}
                name="preferences.risk_tolerance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk Tolerance</FormLabel>
                    <FormControl>
                      <Input placeholder="low | medium | high" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferences.horizon_months"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horizon (months)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferences.single_name_cap"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Single Name Cap (0-1)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Constraints */}
              <h3 className="font-semibold">Constraints</h3>
              <FormField
                control={form.control}
                name="constraints.max_positions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Positions</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="constraints.min_position_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Position Size</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* User Profile */}
              <h3 className="font-semibold">User Profile</h3>
              <FormField
                control={form.control}
                name="user_profile.currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Input placeholder="USD" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="user_profile.allow_derivatives"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Allow Derivatives</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isPending}>
                {!isPending && "Proceed"}
                {isPending && <Loader2 className="animate-spin" />}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateWorkflowDialog;

"use client";

import { useState, useRef, useEffect } from "react";
import { FileTextIcon, PlayIcon, Loader2 } from "lucide-react";
import { Workflow } from "@/lib/generated/prisma";
import { cn } from "@/lib/utils";
import { WorkflowStatus } from "@/types/workflow";
import { useRouter } from "next/navigation"; // ✅ import router

type BackendState =
  | "draft"
  | "pending"
  | "queued"
  | "running"
  | "in_progress"
  | "complete"
  | "completed"
  | "success"
  | string;

const normalizeFromBackend = (state: BackendState): WorkflowStatus => {
  const s = state?.toString().toLowerCase();
  if (s === "complete" || s === "completed" || s === "success") {
    return WorkflowStatus.COMPLETE;
  }
  if (s === "pending" || s === "queued" || s === "running" || s === "in_progress") {
    return WorkflowStatus.PENDING;
  }
  if (s === "draft") return WorkflowStatus.DRAFT;
  return (state as unknown) as WorkflowStatus;
};

const normalizeFromProp = (state: string): WorkflowStatus => {
  const s = state?.toString().toLowerCase();
  if (s === "complete" || s === "completed") return WorkflowStatus.COMPLETE;
  if (s === "pending") return WorkflowStatus.PENDING;
  if (s === "draft") return WorkflowStatus.DRAFT;
  return (state as unknown) as WorkflowStatus;
};

export default function WorkflowStatusIcon({ workflow }: { workflow: Workflow }) {
  const router = useRouter(); // ✅ initialize router
  const [status, setStatus] = useState<WorkflowStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const clearPoll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startPolling = () => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/optimize/status/${workflow.id}`);
        const data = await res.json();
        const newStatus = normalizeFromBackend(data.state);
        if (!mountedRef.current) return;

        if (newStatus === WorkflowStatus.COMPLETE) {
          setStatus(WorkflowStatus.COMPLETE);
          setIsLoading(false);
          clearPoll();
        } else {
          setStatus(newStatus);
          setIsLoading(true);
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 2000);
  };

  useEffect(() => {
    mountedRef.current = true;
    const controller = new AbortController();

    const fetchInitial = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/optimize/status/${workflow.id}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        if (!mountedRef.current) return;

        const newStatus = normalizeFromBackend(data.state);
        setStatus(newStatus);

        if (newStatus === WorkflowStatus.PENDING) {
          setIsLoading(true);
          startPolling();
        } else {
          setIsLoading(false);
          clearPoll();
        }
      } catch (e) {
        if (!mountedRef.current) return;
        console.warn("Initial status fetch failed, using prop:", e);
        const fallback = normalizeFromProp(workflow.status);
        setStatus(fallback);
        setIsLoading(fallback === WorkflowStatus.PENDING);
        if (fallback === WorkflowStatus.PENDING) startPolling();
      }
    };

    setStatus(null);
    setIsLoading(true);
    clearPoll();
    fetchInitial();

    return () => {
      mountedRef.current = false;
      controller.abort();
      clearPoll();
    };
  }, [workflow.id]);

  const body = {
    id: workflow.id,
    positions: [
      { ticker: "AAPL", quantity: 10 },
      { ticker: "MSFT", quantity: 8 },
    ],
    cash: 500,
    preferences: {
      risk_tolerance: "medium",
      horizon_months: 24,
      single_name_cap: 0.2,
    },
    constraints: {
      max_positions: 25,
      min_position_size: 0.01,
    },
    user_profile: {
      currency: "USD",
      allow_derivatives: false,
    },
  };

  const handlePlayClick = async () => {
    try {
      setIsLoading(true);
      setStatus(WorkflowStatus.PENDING);
      startPolling();
      await fetch(`http://127.0.0.1:8000/optimize/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (err) {
      console.error("Error starting workflow:", err);
      setIsLoading(false);
      clearPoll();
    }
  };

  const currentStatus = status ?? normalizeFromProp(workflow.status);
  const showSpinner = isLoading || status === null;

  // ✅ Handle click when workflow is COMPLETE
  const handleFileTextClick = () => {
    router.push(`/workflows/${workflow.id}`);
  };

  return (
    <div
      className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center",
        currentStatus === WorkflowStatus.COMPLETE
          ? "bg-green-500"
          : showSpinner || currentStatus === WorkflowStatus.PENDING
          ? "bg-yellow-500"
          : "bg-blue-500",
        currentStatus === WorkflowStatus.DRAFT && !showSpinner
          ? "cursor-pointer"
          : currentStatus === WorkflowStatus.COMPLETE
          ? "cursor-pointer"
          : "cursor-default opacity-90"
      )}
      onClick={
        currentStatus === WorkflowStatus.DRAFT && !showSpinner
          ? handlePlayClick
          : currentStatus === WorkflowStatus.COMPLETE
          ? handleFileTextClick // ✅ redirect when complete
          : undefined
      }
      title={
        currentStatus === WorkflowStatus.COMPLETE
          ? "View Workflow"
          : currentStatus === WorkflowStatus.PENDING || showSpinner
          ? "Running…"
          : "Draft – click to run"
      }
    >
      {currentStatus === WorkflowStatus.COMPLETE ? (
        <FileTextIcon className="h-5 w-5 text-white" />
      ) : showSpinner || currentStatus === WorkflowStatus.PENDING ? (
        <Loader2 className="h-5 w-5 text-white animate-spin" />
      ) : (
        <PlayIcon className="h-5 w-5 text-white" />
      )}
    </div>
  );
}

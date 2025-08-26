import { useState, useRef, useEffect } from "react";
import { FileTextIcon, PlayIcon, Loader2 } from "lucide-react";
import { Workflow } from "@/lib/generated/prisma";
import { cn } from "@/lib/utils"; // your classnames helper
import { WorkflowStatus } from "@/types/workflow"; // adjust path to where you defined the enum

export default function WorkflowStatusIcon({ workflow }: { workflow: Workflow }) {
    const [status, setStatus] = useState<WorkflowStatus>(
        workflow.status as WorkflowStatus
      );
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // Poll backend for status updates
  useEffect(() => {
    if (!isLoading) return;


    intervalRef.current = setInterval(async () => {
        try {
          const res = await fetch(
            `http://127.0.0.1:8000/optimize/status/${workflow.id}`
          );
          const data = await res.json();
  
          if (data.state === "completed") {
            setStatus(WorkflowStatus.COMPLETE);
            setIsLoading(false);
  
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
        } catch (err) {
          console.error("Error fetching status:", err);
        }
      }, 2000);
  
      // cleanup when component unmounts or isLoading flips
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }, [isLoading, workflow.id]);
  const body = {
    "id": workflow.id,
    "positions": [
      {
        "ticker": "AAPL",
        "quantity": 10
      },
      {
        "ticker": "MSFT",
        "quantity": 8
      }
    ],
    "cash": 500,
    "preferences": {
      "risk_tolerance": "medium",
      "horizon_months": 24,
      "single_name_cap": 0.2
    },
    "constraints": {
      "max_positions": 25,
      "min_position_size": 0.01
    },
    "user_profile": {
      "currency": "USD",
      "allow_derivatives": false
    }
  };
  const handlePlayClick = async () => {
    try {
      setIsLoading(true);
      setStatus(WorkflowStatus.PENDING);
    

      // Trigger backend action
      await fetch(`http://127.0.0.1:8000/optimize/run`, { method: "POST" , 
        headers: {
            "Content-Type": "application/json", // ✅ very important
          }, body: JSON.stringify(body)});
    } catch (err) {
      console.error("Error starting workflow:", err);
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center cursor-pointer",
        status === WorkflowStatus.COMPLETE
          ? "bg-green-500"
          : status === WorkflowStatus.PENDING
          ? "bg-yellow-500"
          : "bg-blue-500"
      )}
      onClick={status === WorkflowStatus.DRAFT ? handlePlayClick : undefined}
    >
      {status === WorkflowStatus.COMPLETE ? (
        <FileTextIcon className="h-5 w-5 text-white" />
      ) : status === WorkflowStatus.PENDING || isLoading ? (
        <Loader2 className="h-5 w-5 text-white animate-spin" />
      ) : (
        <PlayIcon className="h-5 w-5 text-white" />
      )}
    </div>
  );
}

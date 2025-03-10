"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export function OpportunitiesNotification() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [hasShownNotification, setHasShownNotification] = useState(false);
  const isPendingSubmission = searchParams.get("pendingSubmission") === "true";
  const wasSubmissionPending = useSearchParams().get("wasSubmissionPending") === "true";
  
  useEffect(() => {
    // If we were in pending mode but now we're not, and we haven't shown the notification yet
    if (!isPendingSubmission && wasSubmissionPending && !hasShownNotification) {
      // Show a success notification
      toast({
        title: "Analysis Complete",
        description: "Your opportunity has been analyzed successfully.",
        variant: "default",
        duration: 5000,
      });
      
      // Mark that we've shown the notification
      setHasShownNotification(true);
    }
  }, [isPendingSubmission, wasSubmissionPending, hasShownNotification, toast]);
  
  // This component doesn't render anything
  return null;
} 
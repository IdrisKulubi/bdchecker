"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function OpportunitiesAutoRefresh() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isPendingSubmission = searchParams.get("pendingSubmission") === "true";
  
  useEffect(() => {
    // Only set up auto-refresh if we're in pending submission mode
    if (!isPendingSubmission) return;
    
    // Set up polling interval (every 3 seconds)
    const interval = setInterval(() => {
      // Refresh the page data without changing the URL
      router.refresh();
    }, 3000);
    
    // After 30 seconds (10 refreshes), remove the pendingSubmission parameter
    // and add wasSubmissionPending parameter for notification
    const timeout = setTimeout(() => {
      // Create new URLSearchParams without the pendingSubmission parameter
      const params = new URLSearchParams(searchParams);
      params.delete("pendingSubmission");
      params.set("wasSubmissionPending", "true");
      
      // Replace the URL with the updated parameters
      router.replace(`${pathname}?${params.toString()}`);
      
      // Clear the interval
      clearInterval(interval);
    }, 30000);
    
    // Clean up on unmount
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isPendingSubmission, router, pathname, searchParams]);
  
  // This component doesn't render anything
  return null;
} 
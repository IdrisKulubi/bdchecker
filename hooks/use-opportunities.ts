"use client";

import { useState } from "react";
import { 
  submitOpportunity, 
  getOpportunities, 
  getOpportunity, 
  reviewOpportunity 
} from "@/app/actions/opportunities";

interface UseOpportunitiesProps {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export function useOpportunities({ onSuccess, onError }: UseOpportunitiesProps = {}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Submit a new opportunity
  const submitNewOpportunity = async (
    title: string,
    description: string,
    timeline: string,
    submitterName: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await submitOpportunity({
        title,
        description,
        timeline,
        submitterName,
      });

      if (result.success) {
        onSuccess?.("Opportunity submitted successfully");
        return result;
      } else {
        setError(result.error || "Failed to submit opportunity");
        onError?.(result.error || "Failed to submit opportunity");
        return result;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all opportunities
  const fetchOpportunities = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getOpportunities();

      if (result.success) {
        return result;
      } else {
        setError(result.error || "Failed to fetch opportunities");
        onError?.(result.error || "Failed to fetch opportunities");
        return result;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch a single opportunity
  const fetchOpportunity = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getOpportunity(id);

      if (result.success) {
        return result;
      } else {
        setError(result.error || "Failed to fetch opportunity");
        onError?.(result.error || "Failed to fetch opportunity");
        return result;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Review an opportunity
  const reviewOpportunityAsManager = async (
    opportunityId: string,
    decision: "go" | "no_go",
    comment: string,
    managerName: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await reviewOpportunity({
        opportunityId,
        decision,
        comment,
        managerName,
      });

      if (result.success) {
        onSuccess?.("Opportunity reviewed successfully");
        return result;
      } else {
        setError(result.error || "Failed to review opportunity");
        onError?.(result.error || "Failed to review opportunity");
        return result;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    submitNewOpportunity,
    fetchOpportunities,
    fetchOpportunity,
    reviewOpportunityAsManager,
  };
} 
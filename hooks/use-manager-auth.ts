"use client";

import { useState, useEffect } from "react";
import { verifyManagerPasscode } from "@/lib/actions/settings";

interface UseManagerAuthProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useManagerAuth({ onSuccess, onError }: UseManagerAuthProps = {}) {
  const [isManager, setIsManager] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check if manager status is stored in localStorage on mount
  useEffect(() => {
    const storedIsManager = localStorage.getItem("isManager");
    if (storedIsManager === "true") {
      setIsManager(true);
    }
  }, []);

  // Function to verify manager passcode
  const verifyPasscode = async (passcode: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await verifyManagerPasscode(passcode);

      if (result.success) {
        setIsManager(true);
        localStorage.setItem("isManager", "true");
        onSuccess?.();
      } else {
        setError(result.error || "Invalid passcode");
        onError?.(result.error || "Invalid passcode");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to log out manager
  const logoutManager = () => {
    setIsManager(false);
    localStorage.removeItem("isManager");
  };

  return {
    isManager,
    isLoading,
    error,
    verifyPasscode,
    logoutManager,
  };
} 
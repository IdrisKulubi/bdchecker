"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useManagerAuth } from "@/hooks/use-manager-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ManagerAuthWrapperProps {
  children: React.ReactNode;
}

export default function ManagerAuthWrapper({ children }: ManagerAuthWrapperProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [passcode, setPasscode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const { isManager, verifyPasscode, error } = useManagerAuth({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Manager access granted",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    },
  });
  
  useEffect(() => {
    // Short delay to check auth status to prevent flash of content
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passcode) {
      toast({
        title: "Validation Error",
        description: "Please enter the manager passcode",
        variant: "destructive",
      });
      return;
    }
    
    await verifyPasscode(passcode);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isManager) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <Lock className="h-12 w-12 mx-auto text-primary" />
            <h1 className="text-2xl font-bold">Manager Access Required</h1>
            <p className="text-muted-foreground">
              Please enter the manager passcode to access this page.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passcode">Manager Passcode</Label>
              <Input
                id="passcode"
                type="password"
                placeholder="Enter passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                required
              />
              
              {error && (
                <div className="text-destructive text-sm">{error}</div>
              )}
            </div>
            
            <Button type="submit" className="w-full">
              Verify Passcode
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push("/")}
            >
              Back to Home
            </Button>
          </form>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
} 
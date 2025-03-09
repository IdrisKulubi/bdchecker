"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useManagerAuth } from "@/hooks/use-manager-auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogOut, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ManagerAuthButton() {
  const router = useRouter();
  const { toast } = useToast();
  const [passcode, setPasscode] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  
  const { isManager, isLoading, error, verifyPasscode, logoutManager } = useManagerAuth({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Manager access granted",
        variant: "default",
      });
      setIsOpen(false);
      router.push("/manager");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    },
  });
  
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
  
  const handleLogout = () => {
    logoutManager();
    toast({
      title: "Logged Out",
      description: "Manager access revoked",
      variant: "default",
    });
    router.push("/");
  };
  
  if (isManager) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 cursor-pointer bg-blue-500"
          onClick={() => router.push("/manager")}
        >
          <ShieldCheck className="h-4 w-4" />
          Manager View
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-blue-500 cursor-pointer" size="sm">
          Manager Access
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manager Authentication</DialogTitle>
          <DialogDescription>
            Enter the manager passcode to access the manager dashboard.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="passcode">Passcode</Label>
              <Input
                id="passcode"
                type="password"
                placeholder="Enter manager passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                disabled={isLoading}
                required
              />
              
              {error && (
                <div className="text-destructive text-sm">{error}</div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Access Manager Dashboard"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useManagerAuth } from "@/hooks/use-manager-auth";
import { useOpportunities } from "@/hooks/use-opportunities";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ManagerReviewFormProps {
  opportunityId: string;
}

export default function ManagerReviewForm({ opportunityId }: ManagerReviewFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { isManager, verifyPasscode } = useManagerAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [managerName, setManagerName] = useState("");
  const [decision, setDecision] = useState<"go" | "no_go">("go");
  const [comment, setComment] = useState("");
  
  const { reviewOpportunityAsManager, isLoading, error } = useOpportunities({
    onSuccess: (message) => {
      toast({
        title: "Success",
        description: message,
        variant: "default",
      });
      
      // Refresh the page
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    },
  });
  
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passcode) {
      toast({
        title: "Validation Error",
        description: "Please enter the manager passcode",
        variant: "destructive",
      });
      return;
    }
    
    const result = await verifyPasscode(passcode) as unknown as boolean;
    
    if (result) {
      setIsAuthDialogOpen(false);
    }
  };
  
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!managerName) {
      toast({
        title: "Validation Error",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }
    
    await reviewOpportunityAsManager(
      opportunityId,
      decision,
      comment,
      managerName
    );
  };
  
  if (!isManager) {
    return (
      <div>
        <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Lock className="h-4 w-4 mr-2" />
              Manager Access Required
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Manager Authentication</DialogTitle>
              <DialogDescription>
                Enter the manager passcode to review this opportunity.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAuthSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="auth-passcode">Passcode</Label>
                  <Input
                    id="auth-passcode"
                    type="password"
                    placeholder="Enter manager passcode"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit">
                  Verify Passcode
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleReviewSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="manager-name">Your Name</Label>
        <Input
          id="manager-name"
          placeholder="Enter your name"
          value={managerName}
          onChange={(e) => setManagerName(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label>Decision</Label>
        <RadioGroup
          value={decision}
          onValueChange={(value) => setDecision(value as "go" | "no_go")}
          className="flex space-x-4"
          disabled={isLoading}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="go" id="go" />
            <Label htmlFor="go" className="font-normal cursor-pointer">Go</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no_go" id="no_go" />
            <Label htmlFor="no_go" className="font-normal cursor-pointer">No Go</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="comment">Comments</Label>
        <Textarea
          id="comment"
          placeholder="Add your comments about this opportunity"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isLoading}
          rows={4}
        />
      </div>
      
      {error && (
        <div className="text-destructive text-sm">{error}</div>
      )}
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Review"
        )}
      </Button>
    </form>
  );
} 
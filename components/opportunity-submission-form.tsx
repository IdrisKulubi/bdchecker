"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOpportunities } from "@/hooks/use-opportunities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OpportunitySubmissionForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [submitterName, setSubmitterName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeline, setTimeline] = useState("");
  
  const { submitNewOpportunity, isLoading, error } = useOpportunities({
    onSuccess: (message) => {
      toast({
        title: "Success",
        description: message,
        variant: "default",
      });
      
      // Reset form
      setSubmitterName("");
      setTitle("");
      setDescription("");
      setTimeline("");
      
      // Redirect to opportunities page
      router.push("/opportunities");
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
    
    if (!submitterName || !title || !description || !timeline) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    await submitNewOpportunity(title, description, timeline, submitterName);
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="submitterName">Your Name</Label>
            <Input
              id="submitterName"
              placeholder="Enter your name"
              value={submitterName}
              onChange={(e) => setSubmitterName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Opportunity Title</Label>
            <Input
              id="title"
              placeholder="Enter opportunity title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the opportunity in detail"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              required
              rows={5}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="timeline">Timeline</Label>
            <Textarea
              id="timeline"
              placeholder="Describe the timeline for this opportunity"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              disabled={isLoading}
              required
              rows={3}
            />
          </div>
          
          {error && (
            <div className="text-destructive text-sm">{error}</div>
          )}
          
          <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/20 group cursor-pointer" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Submit Opportunity"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 
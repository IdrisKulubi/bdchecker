import { ModeToggle } from "@/components/theme/theme-toggle";
import { initializeSystemSettings } from "./actions/settings";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ManagerAuthButton from "@/components/manager-auth-button";
import OpportunitySubmissionForm from "@/components/opportunity-submission-form";

export default async function Home() {
  // Initialize system settings if they don't exist
  await initializeSystemSettings();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">AI-Powered Opportunity Analysis</h1>
        <div className="flex items-center gap-4">
          <ManagerAuthButton />
          <ModeToggle />
        </div>
      </header>
      
      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Submit New Opportunity</h2>
            <p className="text-muted-foreground mb-6">
              Fill out the form below to submit a new business opportunity for AI analysis.
              Our system will automatically evaluate your submission and provide a recommendation.
            </p>
            
            <OpportunitySubmissionForm />
          </div>
          
          <div className="bg-muted p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            
            <ol className="space-y-4 list-decimal list-inside">
              <li className="text-lg">
                <span className="font-medium">Submit an opportunity</span>
                <p className="text-muted-foreground mt-1 ml-6">
                  Provide details about the opportunity including title, description, and timeline.
                </p>
              </li>
              
              <li className="text-lg">
                <span className="font-medium">AI Analysis</span>
                <p className="text-muted-foreground mt-1 ml-6">
                  Our AI system analyzes the opportunity based on multiple criteria and provides a recommendation.
                </p>
              </li>
              
              <li className="text-lg">
                <span className="font-medium">Manager Review</span>
                <p className="text-muted-foreground mt-1 ml-6">
                  A manager reviews the AI recommendation and makes the final Go/No Go decision.
                </p>
              </li>
            </ol>
            
            <div className="mt-8 space-y-4">
              <Button asChild className="w-full">
                <Link href="/opportunities">
                  View All Opportunities
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard">
                  View Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="mt-16 text-center text-muted-foreground">
        <p>© 2025 AI-Powered Opportunity Analysis System</p>
      </footer>
    </div>
  );
}


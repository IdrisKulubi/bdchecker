import { ModeToggle } from "@/components/theme/theme-toggle";
import { initializeSystemSettings } from "../lib/actions/settings";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ManagerAuthButton from "@/components/manager-auth-button";
import OpportunitySubmissionForm from "@/components/opportunity-submission-form";
import { Sparkles, BarChart3, Brain, CheckCircle, ArrowRight, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

// Define metadata for better SEO
export const metadata = {
  title: "Internal Opportunity Analysis | BD Checker",
  description: "Internal tool for analyzing business opportunities with AI to make data-driven Go/No Go decisions",
};

export default async function Home() {
  // Initialize system settings if they don't exist
  await initializeSystemSettings();
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section with Animated Gradient Background */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 animate-gradient-x">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/20" />
        
        {/* Floating Elements Animation */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i}
              className={cn(
                "absolute rounded-full mix-blend-overlay opacity-20 animate-float",
                i % 2 === 0 ? "bg-purple-500" : "bg-blue-500",
                `w-${20 + i * 10} h-${20 + i * 10}`,
                `left-[${(i * 15) % 80}%] top-[${(i * 20) % 70}%]`,
                `animation-delay-${i * 1000}`
              )}
            />
          ))}
        </div>
        
        <div className="container mx-auto relative z-10">
          <header className="flex justify-between items-center py-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-400" />
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-300">
                BD Checker
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <ManagerAuthButton />
              <ModeToggle />
            </div>
          </header>
          
          <div className="py-20 flex flex-col items-center text-center">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-purple-500/10 text-white mb-4 border border-purple-500/20 backdrop-blur-sm">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              <span>Internal AI Tool</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-white  bg-gradient-to-r from-white to-purple-300">
              Internal Opportunity Analysis Tool
            </h1>
            
            <p className="text-xl text-white max-w-3xl mb-8">
              Make data-driven Go/No Go decisions with this AI system that analyzes business opportunities across multiple criteria.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/20 group">
                <Link href="/opportunities">
                  View Opportunities
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="border-purple-500/20 bg-white/5 backdrop-blur-sm hover:bg-white/10">
                <Link href="/dashboard">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
            <path 
              fill="hsl(var(--background))" 
              fillOpacity="1" 
              d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
            </path>
          </svg>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The AI-powered system streamlines the process of evaluating business opportunities, 
              providing data-driven insights to help make better decisions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Brain className="h-10 w-10 text-purple-500" />}
              title="AI Analysis"
              description="The advanced AI analyzes opportunities across multiple criteria including lead time, expertise alignment, and commercial viability."
              step={1}
            />
            
            <FeatureCard 
              icon={<Layers className="h-10 w-10 text-blue-500" />}
              title="Comprehensive Scoring"
              description="Each opportunity receives detailed scoring with explanations for each criterion to support the final recommendation."
              step={2}
            />
            
            <FeatureCard 
              icon={<CheckCircle className="h-10 w-10 text-green-500" />}
              title="Manager Review"
              description="Managers review AI recommendations and make the final Go/No Go decision with all the data they need."
              step={3}
            />
          </div>
        </div>
      </section>
      
      {/* Submission Section with Animated Background */}
      <section className="py-24 relative overflow-hidden">
        {/* Enhanced animated background with particles */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-purple-50/50 to-blue-50/50 dark:from-slate-900 dark:via-purple-950/50 dark:to-blue-950/50 animate-gradient-x">
          <div className="absolute inset-0 bg-grid-slate-200/20 dark:bg-grid-white/[0.05] bg-[size:20px_20px]" />
          
          {/* Enhanced animated particles with more variety */}
          {[...Array(30)].map((_, i) => (
            <div 
              key={i}
              className={cn(
                "absolute rounded-full mix-blend-overlay animate-float opacity-30 dark:opacity-40",
                i % 4 === 0 ? "bg-purple-400" : 
                i % 4 === 1 ? "bg-blue-400" : 
                i % 4 === 2 ? "bg-indigo-400" : "bg-violet-400",
                `w-${2 + (i % 10)} h-${2 + (i % 10)}`,
                `left-[${(i * 5) % 100}%] top-[${(i * 7) % 100}%]`,
                `animation-delay-${(i * 500) % 5000}`
              )}
              style={{
                animationDuration: `${6 + (i % 4)}s`,
                transform: `rotate(${i * 20}deg)`
              }}
            />
          ))}
          
          {/* Decorative gradient blobs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-purple-500/10 text-purple-600 dark:text-purple-300 mb-4 border border-purple-500/20 backdrop-blur-sm">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              <span>AI-Powered Analysis</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
              Submit Your Opportunity
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mt-4">
              Get instant AI insights on your business opportunities with detailed scoring and recommendations
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Form card - now spans 7 columns and has more visual impact */}
            <div className="lg:col-span-7 lg:order-2">
              <div className="relative group transform transition-all duration-500 hover:scale-[1.01] hover:-translate-y-1">
                {/* Enhanced animated glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-gradient-x"></div>
                
                {/* Floating decorative elements */}
                <div className="absolute -top-6 -right-6 w-12 h-12 rounded-full bg-purple-500/30 blur-xl animate-float"></div>
                <div className="absolute -bottom-8 -left-8 w-16 h-16 rounded-full bg-blue-500/30 blur-xl animate-float animation-delay-1000"></div>
                
                <div className="relative bg-white/90 dark:bg-slate-800/90 rounded-xl shadow-2xl p-8 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm overflow-hidden">
                  {/* Enhanced decorative elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
                  
                  {/* Decorative pattern */}
                  <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px] opacity-30"></div>
                  
                  {/* Enhanced form header with icon */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300">
                      <Sparkles className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">Submit New Opportunity</h3>
                      <p className="text-sm text-muted-foreground">Fill out the form below to get AI-powered insights on the IACL opportunities</p>
                    </div>
                  </div>
                  
                  {/* Form with enhanced styling */}
                  <div className="relative z-10">
                    <OpportunitySubmissionForm />
                  </div>
                  
                  {/* Success indicator */}
                  <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span>AI analysis typically completes in under 10 seconds</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Features section - now spans 5 columns */}
            <div className="lg:col-span-5 lg:order-1 flex flex-col justify-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">How It Works</h3>
                  <p className="text-muted-foreground">
                    Our AI system will analyze the IACL business opportunities across multiple dimensions to provide data-driven insights.
                  </p>
                </div>
                
                {/* Feature cards with improved styling */}
                <div className="space-y-8">
                  <div className="relative pl-14 group transform transition-all duration-300 hover:-translate-x-1">
                    <div className="absolute left-0 top-0 flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 text-white font-medium shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300">1</div>
                    <div className="absolute left-5 top-10 h-[calc(100%-10px)] w-0.5 bg-gradient-to-b from-purple-500 to-blue-500/5"></div>
                    <h4 className="font-semibold text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Detailed Criteria Analysis</h4>
                    <p className="text-muted-foreground mt-2">
                      Each opportunity is evaluated on 7 key criteria including lead time, project insight, and strategic value.
                    </p>
                  </div>
                  
                  <div className="relative pl-14 group transform transition-all duration-300 hover:-translate-x-1">
                    <div className="absolute left-0 top-0 flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 text-white font-medium shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300">2</div>
                    <div className="absolute left-5 top-10 h-[calc(100%-10px)] w-0.5 bg-gradient-to-b from-purple-500 to-blue-500/5"></div>
                    <h4 className="font-semibold text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Confidence Scoring</h4>
                    <p className="text-muted-foreground mt-2">
                      Get a confidence percentage along with the recommendation to understand the strength of the analysis.
                    </p>
                  </div>
                  
                  <div className="relative pl-14 group transform transition-all duration-300 hover:-translate-x-1">
                    <div className="absolute left-0 top-0 flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 text-white font-medium shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300">3</div>
                    <h4 className="font-semibold text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Actionable Insights</h4>
                    <p className="text-muted-foreground mt-2">
                      Receive specific strengths and weaknesses to help improve business opportunities and make informed decisions.
                    </p>
                  </div>
                </div>
                
                {/* Testimonial or stats card with enhanced styling */}
                
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">View the IACL Opportunities</h2>
          <p className="max-w-2xl mx-auto mb-8">
            View the IACL Opportunities and make data-driven decisions with the AI-powered system.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-slate-100">
              <Link href="/opportunities">
                View All Opportunities
              </Link>
            </Button>
            
            <Button asChild size="lg" variant="outline" className="border-white text-purple-600 hover:bg-white/20">
              <Link href="/dashboard">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-slate-400">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <span className="font-semibold">BD Checker</span>
            </div>
            
            <p className="text-sm">
              © 2025 Internal Opportunity Analysis System.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ 
  icon, 
  title, 
  description, 
  step 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  step: number;
}) {
  return (
    <div className="relative group">
      <div className="absolute -inset-px bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl opacity-30 group-hover:opacity-100 blur transition duration-500 group-hover:duration-200" />
      
      <div className="relative bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 h-full flex flex-col">
        <div className="absolute -top-4 -left-4 bg-gradient-to-r from-purple-500 to-blue-500 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {step}
        </div>
        
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground flex-grow">{description}</p>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface TimelineStep {
  id: string;
  label: string;
  time?: string;
}

interface TimelineStepperProps {
  steps: TimelineStep[];
  currentStep: number;
  className?: string;
}

export function TimelineStepper({ steps, currentStep, className }: TimelineStepperProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Progress Line */}
      <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-border" />
      <div 
        className="absolute left-[15px] top-0 w-0.5 bg-primary transition-all duration-500"
        style={{ height: `${(currentStep / (steps.length - 1)) * 100}%` }}
      />

      {/* Steps */}
      <div className="space-y-6">
        {steps.map((step, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div key={step.id} className="flex items-start gap-4">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10",
                "transition-all duration-300",
                isComplete ? "bg-primary" : isCurrent ? "bg-primary animate-pulse" : "bg-secondary border-2 border-border"
              )}>
                {isComplete ? (
                  <Check className="w-4 h-4 text-primary-foreground" />
                ) : (
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isCurrent ? "bg-primary-foreground" : "bg-muted-foreground"
                  )} />
                )}
              </div>
              <div className="flex-1 pt-1">
                <p className={cn(
                  "font-medium",
                  isComplete || isCurrent ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.label}
                </p>
                {step.time && (
                  <p className="text-sm text-muted-foreground">{step.time}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

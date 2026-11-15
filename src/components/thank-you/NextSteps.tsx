import type { ReactNode } from "react";
import { Card } from "@/components/ui/Layout";
import { cn } from "@/lib/cn";

/** A real sequence of next steps, so it is numbered (01, 02…). */

export type NextStep = {
  id: string;
  title: string;
  body: ReactNode;
  actions?: ReactNode;
};

export function NextSteps({ steps, className }: { steps: NextStep[]; className?: string }) {
  return (
    <ol className={cn("flex flex-col gap-4", className)}>
      {steps.map((step, index) => (
        <li key={step.id}>
          <Card className="grid gap-x-6 gap-y-3 p-6 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:p-8">
            <span aria-hidden="true" className="font-display text-[2.5rem] leading-none text-marigold-700">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="display-sm text-jamun-900">{step.title}</h3>
              <div className="mt-2 flex flex-col gap-3 text-ink">{step.body}</div>
              {step.actions ? <div className="mt-5 flex flex-wrap gap-3">{step.actions}</div> : null}
            </div>
          </Card>
        </li>
      ))}
    </ol>
  );
}

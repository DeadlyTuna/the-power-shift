import { Check, X } from "lucide-react";
import { Card } from "@/components/ui/Layout";
import { cn } from "@/lib/cn";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

/** "This is for you if" / "This isn't for you if", side by side on wider screens. */
export function FitColumns({
  forYou,
  notForYou,
  forTitle = "This is for you if",
  notForTitle = "This isn't for you if",
  className,
}: {
  forYou: string[];
  notForYou: string[];
  forTitle?: string;
  notForTitle?: string;
  className?: string;
}) {
  return (
    <Stagger stagger={0.14} className={cn("grid gap-5 md:grid-cols-[1.2fr_1fr]", className)}>
      <StaggerItem>
        <Card className="h-full p-7 sm:p-9">
          <h3 className="display-sm text-jamun-900">{forTitle}</h3>
          <ul className="mt-6 flex flex-col gap-4">
            {forYou.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-peacock-50 text-peacock-700">
                  <Check aria-hidden="true" className="size-4" strokeWidth={2.5} />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </StaggerItem>
      <StaggerItem className="h-full rounded-card border border-line p-7 sm:p-9">
        <h3 className="display-sm text-jamun-900">{notForTitle}</h3>
        <ul className="mt-6 flex flex-col gap-4">
          {notForYou.map((item) => (
            <li key={item} className="flex items-start gap-3 text-muted">
              <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-mist text-muted">
                <X aria-hidden="true" className="size-4" strokeWidth={2.5} />
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </StaggerItem>
    </Stagger>
  );
}

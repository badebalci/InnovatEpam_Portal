import type { IdeaStatus } from "../../types";

const REVIEW_STAGES: IdeaStatus[] = [
  "Submitted",
  "InitialReview",
  "TechnicalReview",
  "FinalReview",
  "Accepted",
];

const STAGE_LABELS: Record<string, string> = {
  Submitted: "Submitted",
  InitialReview: "Initial Review",
  TechnicalReview: "Technical Review",
  FinalReview: "Final Review",
  Accepted: "Accepted",
};

interface ReviewStepperProps {
  status: IdeaStatus;
}

export function ReviewStepper({ status }: ReviewStepperProps) {
  const isRejected = status === "Rejected";
  const currentIndex = REVIEW_STAGES.indexOf(status);

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Review Progress
      </h2>

      {isRejected ? (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">
            <span className="h-2 w-2 rounded-full bg-destructive" />
            Rejected
          </span>
        </div>
      ) : (
        <ol className="flex items-center gap-0">
          {REVIEW_STAGES.map((stage, i) => {
            const isCompleted = currentIndex > i;
            const isCurrent = currentIndex === i;
            const isLast = i === REVIEW_STAGES.length - 1;

            return (
              <li key={stage} className="flex items-center flex-1 min-w-0">
                {/* Step circle */}
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className={[
                      "flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                      isCompleted
                        ? "border-primary bg-primary text-primary-foreground"
                        : isCurrent
                          ? "border-primary bg-background text-primary"
                          : "border-muted bg-background text-muted-foreground",
                    ].join(" ")}
                  >
                    {isCompleted ? (
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </div>
                  <span
                    className={[
                      "mt-1 text-center text-[10px] leading-tight max-w-[60px]",
                      isCurrent
                        ? "font-semibold text-primary"
                        : isCompleted
                          ? "text-primary"
                          : "text-muted-foreground",
                    ].join(" ")}
                  >
                    {STAGE_LABELS[stage]}
                  </span>
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div
                    className={[
                      "h-0.5 flex-1 mx-1 mb-4 transition-colors",
                      isCompleted ? "bg-primary" : "bg-muted",
                    ].join(" ")}
                  />
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

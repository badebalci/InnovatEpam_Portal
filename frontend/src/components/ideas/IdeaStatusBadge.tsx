import { Badge } from "../ui/badge";
import type { IdeaStatus } from "../../types";

interface IdeaStatusBadgeProps {
  status: IdeaStatus;
}

const statusConfig: Record<
  IdeaStatus,
  {
    label: string;
    variant: "info" | "warning" | "success" | "destructive" | "secondary";
  }
> = {
  Draft: { label: "Draft", variant: "secondary" },
  Submitted: { label: "Submitted", variant: "info" },
  InitialReview: { label: "Initial Review", variant: "warning" },
  TechnicalReview: { label: "Technical Review", variant: "warning" },
  FinalReview: { label: "Final Review", variant: "warning" },
  Accepted: { label: "Accepted", variant: "success" },
  Rejected: { label: "Rejected", variant: "destructive" },
  UnderReview: { label: "Under Review", variant: "warning" },
};

export function IdeaStatusBadge({ status }: IdeaStatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, variant: "info" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

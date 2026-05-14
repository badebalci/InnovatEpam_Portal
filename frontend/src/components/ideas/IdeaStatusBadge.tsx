import { Badge } from "../ui/badge";
import type { IdeaStatus } from "../../types";

interface IdeaStatusBadgeProps {
  status: IdeaStatus;
}

const statusConfig: Record<
  IdeaStatus,
  { label: string; variant: "info" | "warning" | "success" | "destructive" }
> = {
  Submitted: { label: "Submitted", variant: "info" },
  UnderReview: { label: "Under Review", variant: "warning" },
  Accepted: { label: "Accepted", variant: "success" },
  Rejected: { label: "Rejected", variant: "destructive" },
};

export function IdeaStatusBadge({ status }: IdeaStatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, variant: "info" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

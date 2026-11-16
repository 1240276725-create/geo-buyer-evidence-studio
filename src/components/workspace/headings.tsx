import { Link } from "@tanstack/react-router";
import { ChevronRight, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

export function PageHeading({
  label,
  title,
  description,
  action,
}: {
  label: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{label}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

export function SectionHeading({
  title,
  subtitle,
  extra,
}: {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {extra}
    </div>
  );
}

export function NextStep({
  to,
  title,
  subtitle,
}: {
  to: "/" | "/research" | "/quotation" | "/proposal";
  title: string;
  subtitle: string;
}) {
  return (
    <div className="next-step no-print">
      <div className="next-icon">
        <Sparkles size={22} />
      </div>
      <div>
        <strong>{title}</strong>
        <p>{subtitle}</p>
      </div>
      <Button variant="outline" asChild>
        <Link to={to}>
          继续 <ChevronRight size={16} />
        </Link>
      </Button>
    </div>
  );
}

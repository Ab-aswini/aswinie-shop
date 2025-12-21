import { Shield, CheckCircle2, Award } from "lucide-react";

type TrustLevel = "bronze" | "silver" | "gold" | "verified";

interface TrustBadgeProps {
  level: TrustLevel;
  label?: string;
  size?: "sm" | "md";
}

const badgeConfig = {
  bronze: {
    icon: Shield,
    className: "trust-bronze",
    label: "Bronze",
  },
  silver: {
    icon: Shield,
    className: "trust-silver",
    label: "Silver",
  },
  gold: {
    icon: Award,
    className: "trust-gold",
    label: "Gold",
  },
  verified: {
    icon: CheckCircle2,
    className: "trust-verified",
    label: "Verified",
  },
};

export function TrustBadge({ level, label, size = "sm" }: TrustBadgeProps) {
  const config = badgeConfig[level];
  const Icon = config.icon;

  return (
    <span className={`trust-badge ${config.className}`}>
      <Icon className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
      <span>{label || config.label}</span>
    </span>
  );
}

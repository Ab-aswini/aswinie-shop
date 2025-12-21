import { Check } from "lucide-react";

interface BehaviourTagProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

export function BehaviourTag({ label, selected = false, onClick }: BehaviourTagProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`behaviour-tag ${selected ? "selected" : ""}`}
    >
      {selected && <Check className="w-3.5 h-3.5" />}
      <span>{label}</span>
    </button>
  );
}

export const behaviourTags = [
  "Respectful",
  "Calm",
  "Helpful",
  "Honest",
  "On-time",
  "Friendly",
  "Clear communication",
  "Patient",
];

import { cn } from "@/lib/cn";

type ChoiceCardProps = {
  name: string;
  value: string;
  label: string;
  description: string;
  id?: string;
  defaultChecked?: boolean;
  required?: boolean;
  invalid?: boolean;
  describedBy?: string;
};

/** A radio option as a selectable card: the whole card is the label, with a visible focus ring. */
export function ChoiceCard({ name, value, label, description, id, defaultChecked, required, invalid, describedBy }: ChoiceCardProps) {
  return (
    <label
      className={cn(
        "flex min-h-11 cursor-pointer items-start gap-3 rounded-card border p-4 transition-colors",
        "has-checked:border-ink has-checked:bg-surface",
        "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink",
        invalid ? "border-danger" : "border-line-strong hover:border-ink-soft",
      )}
    >
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        required={required}
        aria-describedby={describedBy}
        className="mt-0.5 size-4 shrink-0 accent-primary focus-visible:outline-none"
      />
      <span className="flex flex-col gap-1">
        <span className="text-small font-semibold">{label}</span>
        <span className="text-caption text-muted">{description}</span>
      </span>
    </label>
  );
}

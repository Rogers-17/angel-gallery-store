import { cn } from "@/lib/cn";

// CSS-only pickers: native radios styled through `has-checked:`. No JS required.

type ColorPickerProps = {
  name: string;
  colors: { name: string; swatch: string }[];
};

export function ColorPicker({ name, colors }: ColorPickerProps) {
  return (
    <fieldset>
      <legend className="text-small font-medium">Colour</legend>
      <div className="mt-3 flex flex-wrap gap-3">
        {colors.map((color, index) => (
          <label
            key={color.name}
            className="group flex cursor-pointer items-center gap-2 rounded-pill border border-line py-1 pr-3 pl-1 text-small transition-colors has-checked:border-ink has-focus-visible:outline-2 has-focus-visible:outline-accent"
          >
            <input type="radio" name={name} value={color.name} defaultChecked={index === 0} className="sr-only" />
            <span
              aria-hidden
              className="size-6 rounded-pill border border-ink/15"
              // Swatch colours are product data, not design tokens.
              style={{ backgroundColor: color.swatch }}
            />
            {color.name}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

type SizePickerProps = {
  name: string;
  sizes: string[];
};

export function SizePicker({ name, sizes }: SizePickerProps) {
  const single = sizes.length === 1;

  return (
    <fieldset>
      <div className="flex items-baseline justify-between">
        <legend className="text-small font-medium">Size</legend>
        {!single && <span className="text-small text-muted underline underline-offset-4">Size guide</span>}
      </div>
      <div className={cn("mt-3 grid gap-2", single ? "grid-cols-1" : "grid-cols-4 sm:grid-cols-5")}>
        {sizes.map((size, index) => (
          <label
            key={size}
            className="flex h-11 cursor-pointer items-center justify-center rounded-control border border-line text-small transition-colors hover:border-line-strong has-checked:border-ink has-checked:bg-ink has-checked:text-paper has-focus-visible:outline-2 has-focus-visible:outline-accent"
          >
            <input type="radio" name={name} value={size} defaultChecked={single || index === 2} className="sr-only" />
            {size}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

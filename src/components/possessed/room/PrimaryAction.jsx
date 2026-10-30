// Keeps the phase's main button (Ready / Rematch) in view while its panel is on screen.
export default function PrimaryAction({ children }) {
  return <div data-primary className="sticky bottom-0 z-10 -mx-1 rounded-xl bg-ink/95 px-1 py-1.5">{children}</div>;
}
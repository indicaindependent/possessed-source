export const HOUSE_LEVELS = ['restless', 'haunted', 'possessed'];
export const levelName = (level = 'haunted') => level.charAt(0).toUpperCase() + level.slice(1);

export default function HouseDifficulty({ value, onChange, disabled = false }) {
  return <fieldset disabled={disabled} className="min-w-0">
    <legend className="sr-only">House difficulty</legend>
    <div className="grid grid-cols-3 rounded-lg border border-border bg-background/60 p-1">
      {HOUSE_LEVELS.map((level) => <label key={level} className="relative cursor-pointer">
        <input className="peer sr-only" type="radio" name="house-difficulty" value={level} checked={value === level} onChange={() => onChange(level)} />
        <span className="block rounded-md px-1 py-2 text-center text-xs font-bold text-muted-foreground peer-checked:bg-accent peer-checked:text-accent-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-disabled:opacity-50">{levelName(level)}</span>
      </label>)}
    </div>
  </fieldset>;
}
// Shown when the clipboard is blocked: the text, preselected, so a long-press copies it.
export default function CopyFallback({ text }) {
  return (
    <input readOnly value={text} aria-label="Copy this text" onFocus={(e) => e.target.select()} autoFocus
      className="mt-2 h-11 w-full rounded-lg border border-parchment/30 bg-ink px-2 text-sm text-parchment" />
  );
}
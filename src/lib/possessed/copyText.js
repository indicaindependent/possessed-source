// Resolves true when copied; false when the browser blocks the clipboard (show a fallback field).
export default async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
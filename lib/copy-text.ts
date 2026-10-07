/**
 * Copy `text` to the clipboard, working on more devices than the Clipboard
 * API alone: when `navigator.clipboard` is undefined (non-secure contexts,
 * older WebViews) or its writeText rejects, fall back to a hidden textarea
 * plus document.execCommand("copy"). Resolves true when a copy succeeded.
 */
export async function copyText(
  text: string,
  nav: { clipboard?: { writeText(t: string): Promise<void> } } | undefined =
    typeof navigator === "undefined" ? undefined : navigator,
  doc: Document | undefined = typeof document === "undefined" ? undefined : document,
): Promise<boolean> {
  if (nav?.clipboard?.writeText) {
    try {
      await nav.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to the execCommand fallback
    }
  }
  return execCommandCopy(text, doc);
}

export function execCommandCopy(text: string, doc: Document | undefined): boolean {
  if (!doc?.body || typeof doc.execCommand !== "function") return false;
  const textarea = doc.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.setAttribute("aria-hidden", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  doc.body.appendChild(textarea);
  try {
    textarea.select();
    return doc.execCommand("copy");
  } catch {
    return false;
  } finally {
    doc.body.removeChild(textarea);
  }
}

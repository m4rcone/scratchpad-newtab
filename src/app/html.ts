/**
 * Escaping for the chrome around the editor — rail rows, search results — where
 * a draft's own text is interpolated into markup we build by hand.
 *
 * The markdown itself no longer passes through here: ByteMD parses it and
 * sanitises the result with `hast-util-sanitize`, so the preview is the only
 * place a draft becomes rich HTML, and it is ByteMD that decides what survives.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

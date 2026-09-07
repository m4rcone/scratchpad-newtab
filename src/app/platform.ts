/**
 * The two facts the UI adapts to: which modifier key the OS uses, and whether
 * there is a keyboard at all. Both are read once; neither changes mid-session.
 */

const nav = typeof navigator === 'undefined' ? null : navigator;
const platform =
  (nav as { userAgentData?: { platform?: string } } | null)?.userAgentData?.platform ??
  nav?.platform ??
  '';

export const isMac = /mac|iphone|ipad|ipod/i.test(platform);

/** Coarse pointer and no hover: a phone or tablet, where shortcuts mean nothing. */
export const isTouch =
  typeof matchMedia === 'function' &&
  matchMedia('(pointer: coarse) and (hover: none)').matches;

/** `shortcut('K')` reads ⌘K on a Mac and Ctrl+K elsewhere. */
export function shortcut(key: string, shift = false): string {
  return isMac ? `⌘${shift ? '⇧' : ''}${key}` : `Ctrl+${shift ? 'Shift+' : ''}${key}`;
}

/**
 * The platform's command modifier, and only it: Ctrl on a Mac is not ⌘, and on
 * Windows AltGr reports as Ctrl+Alt, so any Alt rules the chord out.
 */
export function isMod(event: KeyboardEvent): boolean {
  if (event.altKey) return false;
  return isMac ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey;
}

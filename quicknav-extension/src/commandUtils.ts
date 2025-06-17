// commandUtils.ts

// Normalize URLs (prepend https:// if missing)
export function normalizeUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

// Open a URL in a new tab
export async function openUrl(url: string): Promise<void> {
  chrome.tabs.create({ url });
}

// Execute a multi-shortcut command
export async function executeMultiShortcut(
  shortcuts: Record<string, string>,
  input: string
): Promise<void> {
  const tokens = input.trim().split(/\s+/);
  for (const token of tokens) {
    const target = shortcuts[token];
    if (target) {
      await openUrl(normalizeUrl(target));
    }
  }
}

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

chrome.omnibox.onInputEntered.addListener(async (text) => {
  chrome.storage.sync.get('shortcuts', async (data) => {
    const shortcuts = data.shortcuts || {};
    // Check if input contains multiple tokens (space-separated)
    if (text.includes(' ')) {
      await executeMultiShortcut(shortcuts, text);
    } else {
      const url = shortcuts[text];
      if (url) {
        await chrome.tabs.create({ url: normalizeUrl(url) });
      } else {
        await chrome.tabs.create({ url: `https://www.google.com/search?q=${encodeURIComponent(text)}` });
      }
    }
  });
});

chrome.omnibox.onInputEntered.addListener(async (text) => {
  chrome.storage.sync.get(['shortcuts', 'groups'], async (data) => {
    const shortcuts = data.shortcuts || {};
    const groups = data.groups || {};

    // Group trigger (e.g., ":work")
    if (text.startsWith(':')) {
      const groupKey = text.trim();
      const group = groups[groupKey];
      if (group && Array.isArray(group)) {
        for (const shortcutKey of group) {
          const url = shortcuts[shortcutKey];
          if (url) {
            const normalizedUrl = url.startsWith('http://') || url.startsWith('https://') 
              ? url 
              : 'https://' + url;
            await chrome.tabs.create({ url: normalizedUrl });
          }
        }
        return;
      }
    }

    // Multiple shortcuts (e.g., "gh nn cf")
    if (text.includes(' ')) {
      const tokens = text.trim().split(/\s+/);
      for (const token of tokens) {
        const target = shortcuts[token];
        if (target) {
          const url = target.startsWith('http://') || target.startsWith('https://') 
            ? target 
            : 'https://' + target;
          await chrome.tabs.create({ url });
        } else {
          await chrome.tabs.create({ url: `https://www.google.com/search?q=${encodeURIComponent(token)}` });
        }
      }
    } else {
      // Single shortcut (e.g., "gh")
      const url = shortcuts[text];
      if (url) {
        const normalizedUrl = url.startsWith('http://') || url.startsWith('https://') 
          ? url 
          : 'https://' + url;
        await chrome.tabs.create({ url: normalizedUrl });
      } else {
        await chrome.tabs.create({ url: `https://www.google.com/search?q=${encodeURIComponent(text)}` });
      }
    }
  });
});

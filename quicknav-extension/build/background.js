chrome.omnibox.onInputEntered.addListener(async (text) => {
  chrome.storage.sync.get('shortcuts', (data) => {
    const shortcuts = data.shortcuts || {};
    const url = shortcuts[text];
    if (url) chrome.tabs.create({ url });
    else chrome.tabs.create({ url: `https://www.google.com/search?q=${text}` });
  });
});
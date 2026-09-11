async function findOrCreateChatGPTTab() {
  const patterns = ["https://chatgpt.com/*", "https://chat.openai.com/*"];
  const existing = await chrome.tabs.query({ url: patterns });

  if (existing.length > 0) {
    const tab = existing[0];
    await chrome.tabs.update(tab.id, {
      active: true,
      url: "https://chatgpt.com/?hints=picture_v2",
    });
    await chrome.windows.update(tab.windowId, { focused: true });
    return tab.id;
  }

  const tab = await chrome.tabs.create({
    url: "https://chatgpt.com/?hints=picture_v2",
    active: true,
  });
  return tab.id;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendToContent(tabId, payload, attempts = 12) {
  let lastError = null;
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await chrome.tabs.sendMessage(tabId, payload);
      if (response?.ok) return response;
      lastError = response?.error || "Falha no content script";
    } catch (err) {
      lastError = err?.message || String(err);
      // Garante que o content script está injetado (útil após navegação)
      try {
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ["content.js"],
        });
      } catch {
        // ignore
      }
    }
    await wait(700);
  }
  return { ok: false, error: lastError || "ChatGPT não respondeu a tempo." };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "APPLY_TO_CHATGPT") return;

  (async () => {
    try {
      const tabId = await findOrCreateChatGPTTab();
      // Espera o Create image montar de verdade
      await wait(2800);
      const result = await sendToContent(tabId, {
        type: "RUN_EDIT",
        prompt: message.prompt,
        imageBase64: message.imageBase64,
        mimeType: message.mimeType,
        fileName: message.fileName,
      });
      sendResponse(result);
    } catch (err) {
      sendResponse({
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  })();

  return true;
});

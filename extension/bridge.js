/**
 * Bridge: o site ChatImage (localhost) fala com a extensão via postMessage.
 */
(() => {
  window.postMessage({ source: "chatimage-extension", type: "CHATIMAGE_READY" }, "*");

  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || data.source !== "chatimage-page") return;

    if (data.type === "CHATIMAGE_PING") {
      window.postMessage(
        { source: "chatimage-extension", type: "CHATIMAGE_PONG" },
        "*",
      );
      return;
    }

    if (data.type === "CHATIMAGE_APPLY") {
      chrome.runtime.sendMessage(
        {
          type: "APPLY_TO_CHATGPT",
          prompt: data.prompt,
          imageBase64: data.imageBase64,
          mimeType: data.mimeType || "image/png",
          fileName: data.fileName || "photo.png",
        },
        (response) => {
          const err = chrome.runtime.lastError;
          window.postMessage(
            {
              source: "chatimage-extension",
              type: "CHATIMAGE_APPLY_RESULT",
              ok: !err && !!response?.ok,
              error: err?.message || response?.error || null,
            },
            "*",
          );
        },
      );
    }
  });
})();

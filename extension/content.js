function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function base64ToFile(base64, mimeType, fileName) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], fileName, { type: mimeType });
}

function visible(el) {
  if (!el) return false;
  const style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function findComposer() {
  const selectors = [
    "#prompt-textarea",
    "div[contenteditable='true']#prompt-textarea",
    "div.ProseMirror[contenteditable='true']",
    "div[contenteditable='true'][data-placeholder]",
    "textarea[name='prompt-textarea']",
    "textarea#prompt-textarea",
    "form div[contenteditable='true']",
    "div[contenteditable='true']",
  ];
  for (const sel of selectors) {
    const nodes = [...document.querySelectorAll(sel)].filter(visible);
    if (nodes.length) return nodes[nodes.length - 1];
  }
  return null;
}

function findFileInputs() {
  return [...document.querySelectorAll('input[type="file"]')];
}

function findSendButton() {
  const selectors = [
    'button[data-testid="send-button"]',
    'button[aria-label*="Send" i]',
    'button[aria-label*="Enviar" i]',
  ];
  for (const sel of selectors) {
    const btn = document.querySelector(sel);
    if (btn && visible(btn)) return btn;
  }

  const form = findComposer()?.closest("form");
  if (form) {
    const buttons = [...form.querySelectorAll("button")].filter(visible);
    const send = buttons.find((btn) => {
      const label = `${btn.getAttribute("aria-label") || ""}`.toLowerCase();
      return label.includes("send") || label.includes("enviar");
    });
    if (send) return send;
    // último botão do form costuma ser o send
    if (buttons.length) return buttons[buttons.length - 1];
  }
  return null;
}

function hasAttachedImage() {
  const checks = [
    ...document.querySelectorAll(
      'img[alt*="Uploaded" i], img[alt*="attachment" i], img[alt*="image" i], [data-testid*="file"], [data-testid*="upload"], [data-testid*="attachment"]',
    ),
    ...document.querySelectorAll("form img, [class*='attachment'] img, [class*='thumbnail'] img"),
  ];

  return checks.some((el) => {
    if (!visible(el)) return false;
    if (el.tagName === "IMG") {
      const src = el.getAttribute("src") || "";
      // ignora avatares minúsculos / ícones
      const rect = el.getBoundingClientRect();
      return rect.width >= 36 && rect.height >= 36 && !src.includes("avatar");
    }
    return true;
  });
}

async function waitForAttachment(timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (hasAttachedImage()) return true;
    await wait(250);
  }
  return hasAttachedImage();
}

function dispatchDrop(target, file) {
  const dt = new DataTransfer();
  dt.items.add(file);
  for (const type of ["dragenter", "dragover", "drop"]) {
    target.dispatchEvent(
      new DragEvent(type, {
        bubbles: true,
        cancelable: true,
        dataTransfer: dt,
      }),
    );
  }
}

function dispatchPaste(target, file) {
  const dt = new DataTransfer();
  dt.items.add(file);
  target.dispatchEvent(
    new ClipboardEvent("paste", {
      bubbles: true,
      cancelable: true,
      clipboardData: dt,
    }),
  );
}

function assignFilesToInput(input, file) {
  const dt = new DataTransfer();
  dt.items.add(file);
  try {
    input.files = dt.files;
  } catch {
    // alguns browsers são mais restritivos
  }

  // Força React a ver a mudança
  try {
    const proto = window.HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(proto, "files");
    if (descriptor?.set) descriptor.set.call(input, dt.files);
  } catch {
    // ignore
  }

  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

async function openUploadUi() {
  const plusCandidates = [...document.querySelectorAll("button")].filter((btn) => {
    if (!visible(btn)) return false;
    const label = `${btn.getAttribute("aria-label") || ""} ${btn.title || ""}`.toLowerCase();
    return (
      label.includes("attach") ||
      label.includes("upload") ||
      label.includes("anex") ||
      label.includes("add photos") ||
      label.includes("adicionar") ||
      label === " +" ||
      label.includes("plus")
    );
  });

  const plus =
    plusCandidates[0] ||
    [...document.querySelectorAll("button")].find((btn) => {
      if (!visible(btn)) return false;
      const text = (btn.textContent || "").trim();
      return text === "+" || text === "＋";
    });

  if (plus) {
    plus.click();
    await wait(450);
  }

  const menuItem = [...document.querySelectorAll("button, div, [role='menuitem']")].find(
    (el) => {
      if (!visible(el)) return false;
      const t = (el.textContent || "").toLowerCase();
      return (
        t.includes("upload") ||
        t.includes("from computer") ||
        t.includes("from device") ||
        t.includes("add photos") ||
        t.includes("add photo") ||
        t.includes("carregar") ||
        t.includes("dispositivo") ||
        t.includes("fotos") ||
        t.includes("imagem")
      );
    },
  );
  if (menuItem) {
    menuItem.click();
    await wait(450);
  }
}

async function attachFile(file) {
  // Estratégia 1: inputs file já existentes
  let inputs = findFileInputs();
  for (const input of inputs) {
    assignFilesToInput(input, file);
    if (await waitForAttachment(2500)) return;
  }

  // Estratégia 2: abrir UI de upload e tentar de novo
  await openUploadUi();
  inputs = findFileInputs();
  for (const input of inputs) {
    assignFilesToInput(input, file);
    if (await waitForAttachment(3500)) return;
  }

  // Estratégia 3: drag-and-drop no composer / form
  const composer = findComposer();
  const dropTarget =
    composer?.closest("form") ||
    composer?.parentElement ||
    document.querySelector("main") ||
    document.body;

  dispatchDrop(dropTarget, file);
  if (await waitForAttachment(3500)) return;

  if (composer) {
    composer.focus();
    dispatchPaste(composer, file);
    if (await waitForAttachment(3500)) return;
  }

  throw new Error(
    "Não consegui anexar a imagem. Deixe o Create image aberto e tente de novo.",
  );
}

async function setComposerText(text) {
  const composer = findComposer();
  if (!composer) throw new Error("Não achei a caixa de texto do ChatGPT.");

  composer.focus();
  await wait(100);

  if (composer.tagName === "TEXTAREA" || composer.tagName === "INPUT") {
    const proto = window.HTMLTextAreaElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
    descriptor?.set?.call(composer, text);
    composer.dispatchEvent(new Event("input", { bubbles: true }));
    composer.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }

  // NÃO usar selectAll no composer inteiro depois do anexo —
  // isso pode limpar a imagem. Insere só no final do texto.
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(composer);
  range.collapse(false);
  selection?.removeAllRanges();
  selection?.addRange(range);

  const ok = document.execCommand("insertText", false, text);
  if (!ok || !(composer.textContent || "").includes(text.slice(0, 20))) {
    // fallback: preenche sem selectAll global
    const p = document.createElement("p");
    p.textContent = text;
    composer.appendChild(p);
    composer.dispatchEvent(new InputEvent("input", { bubbles: true, data: text }));
  } else {
    composer.dispatchEvent(new InputEvent("input", { bubbles: true, data: text }));
  }
}

async function clickSend() {
  await wait(300);
  for (let i = 0; i < 10; i++) {
    const send = findSendButton();
    if (send && !send.disabled) {
      send.click();
      return;
    }
    await wait(300);
  }
  // fallback Enter
  const composer = findComposer();
  if (composer) {
    composer.focus();
    composer.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        bubbles: true,
      }),
    );
    return;
  }
  throw new Error("Não achei o botão de enviar.");
}

async function runEdit(payload) {
  const { prompt, imageBase64, mimeType, fileName } = payload;
  if (!imageBase64 || !prompt) throw new Error("Foto ou prompt ausente.");

  for (let i = 0; i < 25; i++) {
    if (findComposer()) break;
    await wait(400);
  }
  if (!findComposer()) {
    throw new Error("ChatGPT ainda não carregou a caixa de mensagem.");
  }

  const file = base64ToFile(
    imageBase64,
    mimeType || "image/png",
    fileName || "photo.png",
  );

  // 1) anexa a imagem e ESPERA a miniatura
  await attachFile(file);
  const attached = await waitForAttachment(8000);
  if (!attached) {
    throw new Error("A imagem não apareceu no chat (anexo falhou).");
  }

  // 2) só então escreve o prompt (sem apagar o anexo)
  await setComposerText(prompt);
  await wait(400);

  // 3) confirma de novo que o anexo ainda está lá
  if (!hasAttachedImage()) {
    // tenta reanexar se o texto limpou
    await attachFile(file);
    if (!(await waitForAttachment(5000))) {
      throw new Error("O prompt sobrescreveu a imagem. Tente de novo.");
    }
  }

  await clickSend();
  return { ok: true };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "RUN_EDIT") return;

  runEdit(message)
    .then(() => sendResponse({ ok: true }))
    .catch((err) =>
      sendResponse({
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      }),
    );

  return true;
});

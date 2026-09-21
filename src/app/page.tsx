"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_FAVORITE_CODES,
  EFFECTS_BY_CODE,
  FAVORITES_STORAGE_KEY,
  SUBJECTS,
  SUBJECT_STORAGE_KEY,
  getCategoriesForSubject,
  type Effect,
  type PeopleMarker,
  type RemovePeopleMode,
  type SubjectId,
  buildEditPrompt,
} from "@/lib/effects";
import { downloadBlob, stripImageMetadata } from "@/lib/stripMetadata";
import {
  readImageMetadata,
  type ImageMetaReport,
} from "@/lib/readMetadata";

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const comma = result.indexOf(",");
      resolve({
        base64: comma >= 0 ? result.slice(comma + 1) : result,
        mimeType: file.type || "image/png",
      });
    };
    reader.onerror = () => reject(new Error("Falha ao ler a imagem."));
    reader.readAsDataURL(file);
  });
}

function askExtension(payload: Record<string, unknown>, timeoutMs = 90000) {
  return new Promise<{ ok: boolean; error?: string | null }>((resolve) => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window) return;
      const data = event.data;
      if (!data || data.source !== "chatimage-extension") return;
      if (data.type !== "CHATIMAGE_APPLY_RESULT") return;
      window.removeEventListener("message", onMessage);
      resolve({ ok: !!data.ok, error: data.error || null });
    };

    window.addEventListener("message", onMessage);
    window.postMessage({ source: "chatimage-page", ...payload }, "*");

    window.setTimeout(() => {
      window.removeEventListener("message", onMessage);
      resolve({
        ok: false,
        error: "A extensão não respondeu. Confira se está instalada e ativa.",
      });
    }, timeoutMs);
  });
}

export default function HomePage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const catsRef = useRef<HTMLDivElement>(null);
  const dragScroll = useRef<{
    pointerId: number | null;
    startX: number;
    scrollLeft: number;
    dragging: boolean;
  }>({ pointerId: null, startX: 0, scrollLeft: 0, dragging: false });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [subject, setSubject] = useState<SubjectId>("person");
  const [activeCategory, setActiveCategory] = useState("favorites");
  const [favoriteCodes, setFavoriteCodes] = useState<string[]>(DEFAULT_FAVORITE_CODES);
  const [favoritesReady, setFavoritesReady] = useState(false);
  const [subjectReady, setSubjectReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [extensionReady, setExtensionReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [removePeopleMode, setRemovePeopleMode] =
    useState<RemovePeopleMode>("auto");
  const [peopleMarkers, setPeopleMarkers] = useState<PeopleMarker[]>([]);
  const [metaReport, setMetaReport] = useState<ImageMetaReport | null>(null);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaExpanded, setMetaExpanded] = useState(false);
  const removingPeople =
    selected.includes("/removepeople") || selected.includes("/removepeoplebg");
  const markingPeople = removingPeople && removePeopleMode === "marked";

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (!removingPeople) {
      setPeopleMarkers([]);
      setRemovePeopleMode("auto");
    }
  }, [removingPeople]);

  useEffect(() => {
    setPeopleMarkers([]);
  }, [file]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window) return;
      const data = event.data;
      if (!data || data.source !== "chatimage-extension") return;
      if (data.type === "CHATIMAGE_READY" || data.type === "CHATIMAGE_PONG") {
        setExtensionReady(true);
      }
    };

    window.addEventListener("message", onMessage);
    window.postMessage({ source: "chatimage-page", type: "CHATIMAGE_PING" }, "*");
    const t1 = window.setTimeout(() => {
      window.postMessage({ source: "chatimage-page", type: "CHATIMAGE_PING" }, "*");
    }, 800);

    return () => {
      window.removeEventListener("message", onMessage);
      window.clearTimeout(t1);
    };
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
          setFavoriteCodes(
            parsed.map((c: string) =>
              c === "/removepeoplebg" ? "/removepeople" : c,
            ),
          );
        }
      }
      const savedSubject = localStorage.getItem(SUBJECT_STORAGE_KEY);
      if (savedSubject && SUBJECTS.some((s) => s.id === savedSubject)) {
        setSubject(savedSubject as SubjectId);
      }
    } catch {
      // ignore
    } finally {
      setFavoritesReady(true);
      setSubjectReady(true);
    }
  }, []);

  useEffect(() => {
    if (!favoritesReady) return;
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteCodes));
    } catch {
      // ignore
    }
  }, [favoriteCodes, favoritesReady]);

  useEffect(() => {
    if (!subjectReady) return;
    try {
      localStorage.setItem(SUBJECT_STORAGE_KEY, subject);
    } catch {
      // ignore
    }
  }, [subject, subjectReady]);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!file) {
      setMetaReport(null);
      setMetaLoading(false);
      setMetaExpanded(false);
      return;
    }
    let cancelled = false;
    setMetaLoading(true);
    setMetaExpanded(false);
    setMetaReport(null);
    void readImageMetadata(file)
      .then((report) => {
        if (!cancelled) setMetaReport(report);
      })
      .catch(() => {
        if (!cancelled) setMetaReport(null);
      })
      .finally(() => {
        if (!cancelled) setMetaLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [file]);

  const prompt = useMemo(
    () =>
      buildEditPrompt(selected, note, subject, {
        removePeopleMode,
        removePeopleMarkers: peopleMarkers,
      }),
    [selected, note, subject, removePeopleMode, peopleMarkers],
  );

  const categories = useMemo(() => {
    const scoped = getCategoriesForSubject(subject);
    const visibleCodes = new Set(scoped.flatMap((c) => c.effects.map((e) => e.code)));
    const favoriteEffects = favoriteCodes
      .map((code) => EFFECTS_BY_CODE[code])
      .filter((ef): ef is Effect => Boolean(ef) && visibleCodes.has(ef.code));
    return [
      { id: "favorites", title: "Favoritos", effects: favoriteEffects },
      ...scoped,
    ];
  }, [favoriteCodes, subject]);

  useEffect(() => {
    if (!categories.some((c) => c.id === activeCategory)) {
      setActiveCategory("favorites");
    }
  }, [categories, activeCategory]);

  const category =
    categories.find((c) => c.id === activeCategory) ?? categories[0];

  function onSubjectChange(id: SubjectId) {
    setSubject(id);
    setActiveCategory("favorites");
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 4500);
  }

  function toggleCode(code: string) {
    const normalized = code === "/removepeoplebg" ? "/removepeople" : code;
    setSelected((prev) => {
      const cleaned = prev.map((c) =>
        c === "/removepeoplebg" ? "/removepeople" : c,
      );
      return cleaned.includes(normalized)
        ? cleaned.filter((c) => c !== normalized)
        : [...cleaned, normalized];
    });
  }

  function toggleFavorite(code: string) {
    setFavoriteCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped?.type.startsWith("image/")) setFile(dropped);
  }

  function takeImageFromClipboard(
    items: DataTransferItemList | null | undefined,
  ) {
    if (!items) return false;
    for (const item of Array.from(items)) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const pasted = item.getAsFile();
        if (pasted) {
          const ext = pasted.type.split("/")[1] || "png";
          setFile(
            new File([pasted], pasted.name || `colar.${ext}`, {
              type: pasted.type,
            }),
          );
          return true;
        }
      }
    }
    return false;
  }

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (takeImageFromClipboard(e.clipboardData?.items)) {
        e.preventDefault();
        showToast("Imagem colada.");
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  function onPreviewClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!markingPeople) return;
    const wrap = e.currentTarget;
    const rect = wrap.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (x < 0 || x > 100 || y < 0 || y > 100) return;

    const near = peopleMarkers.find((m) => {
      const dx = m.x - x;
      const dy = m.y - y;
      return Math.hypot(dx, dy) < 4;
    });
    if (near) {
      setPeopleMarkers((prev) => prev.filter((m) => m.id !== near.id));
      return;
    }

    setPeopleMarkers((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${prev.length}`,
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
      },
    ]);
  }

  async function applyAutomatic() {
    if (!file) {
      showToast("Envie uma foto primeiro.");
      return;
    }
    if (selected.length === 0) {
      showToast("Escolha pelo menos um efeito.");
      return;
    }
    if (!extensionReady) {
      showToast("Instale a extensão ChatImage (pasta /extension).");
      return;
    }

    setBusy(true);
    try {
      const { base64, mimeType } = await fileToBase64(file);
      const result = await askExtension({
        type: "CHATIMAGE_APPLY",
        prompt,
        imageBase64: base64,
        mimeType,
        fileName: file.name || "photo.png",
      });

      if (!result.ok) {
        throw new Error(result.error || "Falha ao enviar para o ChatGPT.");
      }

      showToast("Enviado ao ChatGPT com foto e efeitos.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao aplicar.");
    } finally {
      setBusy(false);
    }
  }

  async function copyPromptToClipboard() {
    try {
      await navigator.clipboard.writeText(prompt);
      return true;
    } catch {
      try {
        const area = document.createElement("textarea");
        area.value = prompt;
        area.style.position = "fixed";
        area.style.left = "-9999px";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
        return true;
      } catch {
        return false;
      }
    }
  }

  function isAppleMobile() {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent || "";
    if (/iPhone|iPad|iPod/i.test(ua)) return true;
    return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  }

  /** Abre o app nativo; evita chatgpt.com no Safari */
  function openChatGPTApp() {
    try {
      const a = document.createElement("a");
      a.href = "chatgpt://";
      a.rel = "noopener";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      window.location.href = "chatgpt://";
    }
  }

  async function sendToChatGPT() {
    if (!file) {
      showToast("Envie uma foto primeiro.");
      return;
    }
    if (selected.length === 0) {
      showToast("Escolha pelo menos um efeito.");
      return;
    }

    setBusy(true);
    try {
      const shareFile = new File([file], file.name || "chatimage.jpg", {
        type: file.type || "image/jpeg",
      });

      const canShareFile =
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [shareFile] });

      // iPhone: folha de compartilhar → toque no APP ChatGPT, não Safari
      if (canNativeShare && canShareFile) {
        try {
          await navigator.share({
            files: [shareFile],
            text: prompt,
            title: "ChatImage → ChatGPT",
          });
          showToast("Na lista, toque no app ChatGPT (não no Safari).");
          return;
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") return;
          try {
            await navigator.share({ files: [shareFile] });
            await copyPromptToClipboard();
            showToast("Foto ok. Prompt copiado — cole no app ChatGPT.");
            return;
          } catch (err2) {
            if (err2 instanceof Error && err2.name === "AbortError") return;
          }
        }
      }

      if (canNativeShare && isAppleMobile()) {
        try {
          await navigator.share({ text: prompt, title: "ChatImage → ChatGPT" });
          showToast("Prompt compartilhado. Anexe a foto no app.");
          return;
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") return;
        }
      }

      const copied = await copyPromptToClipboard();
      if (!copied) {
        throw new Error("Não foi possível copiar o prompt.");
      }

      try {
        if (typeof ClipboardItem !== "undefined") {
          await navigator.clipboard.write([
            new ClipboardItem({
              [shareFile.type]: shareFile,
              "text/plain": new Blob([prompt], { type: "text/plain" }),
            }),
          ]);
        }
      } catch {
        // texto já copiado
      }

      openChatGPTApp();
      showToast(
        isAppleMobile()
          ? "Prompt copiado. Abrindo o app ChatGPT…"
          : "Prompt copiado. Abrindo o app ChatGPT (se instalado)…",
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao enviar.");
    } finally {
      setBusy(false);
    }
  }

  async function copyPromptOnly() {
    if (selected.length === 0) {
      showToast("Escolha pelo menos um efeito.");
      return;
    }
    const ok = await copyPromptToClipboard();
    showToast(ok ? "Prompt copiado." : "Não foi possível copiar.");
  }

  /** Regrava pixels e baixa sem EXIF/XMP/C2PA (útil pós-ChatGPT → Instagram). */
  async function downloadWithoutMetadata() {
    if (!file) {
      showToast("Envie uma foto primeiro.");
      return;
    }
    setBusy(true);
    try {
      const { blob, fileName } = await stripImageMetadata(file);
      downloadBlob(blob, fileName);
      showToast("Baixada sem metadados — pronta pro Instagram.");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Erro ao limpar metadados.",
      );
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    const el = catsRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta === 0 || el.scrollWidth <= el.clientWidth) return;
      el.scrollLeft += delta;
      e.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [categories.length, subject]);

  function onCatsPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const el = catsRef.current;
    if (!el) return;
    dragScroll.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
      dragging: false,
    };
  }

  function onCatsPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = catsRef.current;
    const state = dragScroll.current;
    if (!el || state.pointerId !== e.pointerId) return;

    const delta = e.clientX - state.startX;

    if (!state.dragging) {
      if (Math.abs(delta) < 8) return;
      state.dragging = true;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      el.classList.add("is-dragging");
    }

    el.scrollLeft = state.scrollLeft - delta;
    e.preventDefault();
  }

  function endCatsDrag(e: React.PointerEvent<HTMLDivElement>) {
    const el = catsRef.current;
    const state = dragScroll.current;
    if (!el || state.pointerId !== e.pointerId) return;

    if (state.dragging) {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      el.classList.remove("is-dragging");
    }

    window.setTimeout(() => {
      dragScroll.current = {
        pointerId: null,
        startX: 0,
        scrollLeft: 0,
        dragging: false,
      };
    }, 0);
  }

  function scrollCats(dir: -1 | 1) {
    const el = catsRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(160, el.clientWidth * 0.55), behavior: "smooth" });
  }

  function onCategoryClick(id: string) {
    if (dragScroll.current.dragging) return;
    setActiveCategory(id);
  }

  function EffectItem({ effect }: { effect: Effect }) {
    const active = selected.includes(effect.code);
    const isFavorite = favoriteCodes.includes(effect.code);
    return (
      <div className={`effect-item ${active ? "is-active" : ""}`}>
        <button
          type="button"
          onClick={() => toggleCode(effect.code)}
          title={effect.description}
          className="min-w-0 flex-1 py-0.5 text-left"
        >
          <span className="block text-[15px] font-semibold leading-snug">
            {effect.label}
          </span>
          <span
            className={`mt-1 block text-[12px] leading-snug ${
              active ? "text-[var(--accent)]" : "text-[var(--ink-dim)]"
            }`}
          >
            {effect.description}
          </span>
        </button>
        <button
          type="button"
          aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          title={isFavorite ? "Remover dos favoritos" : "Favoritar"}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(effect.code);
          }}
          className={`fav-btn ${isFavorite ? "is-on" : ""}`}
        >
          {isFavorite ? "★" : "☆"}
        </button>
      </div>
    );
  }

  return (
    <main className="relative z-10 flex w-full flex-col px-4 py-4 sm:px-6 lg:h-dvh lg:overflow-hidden lg:px-8">
      <header className="mb-4 flex shrink-0 items-center justify-between gap-4">
        <h1 className="font-brand text-[26px] font-extrabold tracking-tight sm:text-[32px]">
          ChatImage
        </h1>

        <div className="flex items-center gap-3">
          {!extensionReady && (
            <span className="hidden text-[13px] text-[var(--warn)] lg:inline">
              Extensão no Chrome, ou compartilhe no iPhone
            </span>
          )}
          <div
            className="hidden items-center gap-2 rounded-md px-3 py-1.5 text-[13px] font-semibold lg:inline-flex"
            style={{
              background: extensionReady
                ? "var(--accent-soft)"
                : "var(--danger-soft)",
              color: extensionReady ? "var(--accent)" : "var(--warn)",
            }}
          >
            {extensionReady ? <span className="dot-live" /> : null}
            {extensionReady ? "Extensão ok" : "Extensão offline"}
          </div>
        </div>
      </header>

      <div className="grid flex-1 gap-4 lg:min-h-0 lg:grid-cols-[38%_62%] lg:gap-5">
        {/* Studio */}
        <section className="flex flex-col gap-3 lg:min-h-0">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => {
              if (!preview) inputRef.current?.click();
            }}
            className={`drop-zone relative h-[42vw] min-h-[180px] max-h-[260px] overflow-hidden rounded-xl lg:h-auto lg:max-h-none lg:min-h-0 lg:flex-1 ${
              dragging ? "is-dragging" : ""
            } ${preview ? "" : "cursor-pointer"} ${
              markingPeople ? "is-marking" : ""
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setFile(f);
              }}
            />
            {preview ? (
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div
                  className={`relative inline-block max-h-full max-w-full ${
                    markingPeople ? "cursor-crosshair" : ""
                  }`}
                  onClick={onPreviewClick}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Prévia"
                    className="block max-h-full max-w-full object-contain"
                    draggable={false}
                  />
                  {peopleMarkers.map((m, i) => (
                    <button
                      key={m.id}
                      type="button"
                      className="people-pin"
                      style={{ left: `${m.x}%`, top: `${m.y}%` }}
                      title="Clique para desmarcar"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPeopleMarkers((prev) =>
                          prev.filter((p) => p.id !== m.id),
                        );
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-1.5 px-4 text-center">
                <p className="font-brand text-xl font-bold sm:text-2xl">
                  Toque ou cole a foto
                </p>
                <p className="text-[13px] text-[var(--ink-dim)]">
                  PNG · JPG · WEBP · Ctrl+V
                </p>
              </div>
            )}
          </div>

          {removingPeople ? (
            <div className="people-panel shrink-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-semibold text-[var(--ink)]">
                  Remover pessoas
                </span>
                <button
                  type="button"
                  className={`subject-tab ${removePeopleMode === "auto" ? "is-active" : ""}`}
                  onClick={() => {
                    setRemovePeopleMode("auto");
                    setPeopleMarkers([]);
                  }}
                >
                  Fora de foco
                </button>
                <button
                  type="button"
                  className={`subject-tab ${removePeopleMode === "marked" ? "is-active" : ""}`}
                  onClick={() => setRemovePeopleMode("marked")}
                >
                  Marcar na foto
                </button>
                {removePeopleMode === "marked" && peopleMarkers.length > 0 ? (
                  <button
                    type="button"
                    className="text-[13px] font-semibold text-[var(--ink-dim)] hover:text-[var(--ink)]"
                    onClick={() => setPeopleMarkers([])}
                  >
                    Limpar marcas
                  </button>
                ) : null}
              </div>
              <p className="mt-2 text-[13px] text-[var(--ink-dim)]">
                {removePeopleMode === "auto"
                  ? "Sem seleção: remove só quem está fora de foco / no fundo."
                  : peopleMarkers.length === 0
                    ? "Toque nas pessoas que quer remover."
                    : `${peopleMarkers.length} marcada${peopleMarkers.length === 1 ? "" : "s"} para remover.`}
              </p>
            </div>
          ) : null}

          {file ? (
            <div className="meta-panel shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-[13px] font-bold tracking-wide text-[var(--ink)]">
                  Metadados
                </h3>
                {metaReport?.hasAiSignals ? (
                  <span className="meta-badge meta-badge-warn">
                    Possível rótulo de IA
                  </span>
                ) : metaReport && !metaLoading ? (
                  <span className="meta-badge">Sem sinal óbvio de IA</span>
                ) : null}
              </div>

              {metaLoading ? (
                <p className="mt-2 text-[13px] text-[var(--ink-dim)]">
                  Lendo metadados…
                </p>
              ) : metaReport ? (
                <>
                  <dl className="meta-grid mt-2">
                    <div>
                      <dt>Arquivo</dt>
                      <dd title={metaReport.fileName}>{metaReport.fileName}</dd>
                    </div>
                    <div>
                      <dt>Tipo</dt>
                      <dd>{metaReport.mimeType}</dd>
                    </div>
                    <div>
                      <dt>Tamanho</dt>
                      <dd>{metaReport.fileSize}</dd>
                    </div>
                    <div>
                      <dt>Dimensões</dt>
                      <dd>
                        {metaReport.width && metaReport.height
                          ? `${metaReport.width} × ${metaReport.height}`
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt>EXIF</dt>
                      <dd>{metaReport.hasExif ? "Sim" : "Não"}</dd>
                    </div>
                    <div>
                      <dt>XMP / IPTC</dt>
                      <dd>
                        {metaReport.hasXmp || metaReport.hasIptc
                          ? [
                              metaReport.hasXmp ? "XMP" : null,
                              metaReport.hasIptc ? "IPTC" : null,
                            ]
                              .filter(Boolean)
                              .join(" · ")
                          : "Não"}
                      </dd>
                    </div>
                  </dl>

                  {metaReport.aiHints.length > 0 ? (
                    <ul className="meta-hints mt-2">
                      {metaReport.aiHints.map((hint) => (
                        <li key={hint}>{hint}</li>
                      ))}
                    </ul>
                  ) : null}

                  {metaReport.fields.length > 0 ? (
                    <>
                      <button
                        type="button"
                        className="mt-2 text-[13px] font-semibold text-[var(--accent)] hover:opacity-90"
                        onClick={() => setMetaExpanded((v) => !v)}
                      >
                        {metaExpanded
                          ? "Ocultar campos"
                          : `Ver ${metaReport.fields.length} campos`}
                      </button>
                      {metaExpanded ? (
                        <div className="meta-fields mt-2">
                          {metaReport.fields.map((f) => (
                            <div
                              key={`${f.key}-${f.value.slice(0, 24)}`}
                              className={f.highlight ? "is-warn" : undefined}
                            >
                              <span className="meta-key">{f.key}</span>
                              <span className="meta-val" title={f.value}>
                                {f.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <p className="mt-2 text-[13px] text-[var(--ink-dim)]">
                      Nenhum campo EXIF/XMP/IPTC legível neste arquivo.
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-2 text-[13px] text-[var(--ink-dim)]">
                  Não foi possível ler os metadados.
                </p>
              )}
            </div>
          ) : null}

          <div className="flex shrink-0 flex-col gap-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={!file || selected.length === 0 || busy}
                onClick={() => {
                  if (extensionReady) void applyAutomatic();
                  else void sendToChatGPT();
                }}
                className="btn-main min-w-0 flex-1"
              >
                {busy
                  ? extensionReady
                    ? "Enviando…"
                    : "Preparando…"
                  : extensionReady
                    ? "Aplicar no ChatGPT"
                    : canNativeShare
                      ? "Enviar pro ChatGPT"
                      : "Copiar e abrir app"}
              </button>
              <span className="shrink-0 text-[13px] text-[var(--ink-dim)]">
                {selected.length} efeito{selected.length === 1 ? "" : "s"}
              </span>
            </div>
            {file ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="font-semibold text-[var(--ink-dim)] hover:text-[var(--ink)]"
                >
                  Trocar foto
                </button>
                <span className="text-[var(--line)]">·</span>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="font-semibold text-[var(--ink-dim)] hover:text-[var(--ink)]"
                >
                  Remover
                </button>
                <span className="text-[var(--line)]">·</span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void downloadWithoutMetadata()}
                  title="Remove EXIF, XMP e rótulo de IA (C2PA) para postar no Instagram"
                  className="font-semibold text-[var(--accent)] hover:opacity-90 disabled:opacity-40"
                >
                  Baixar sem metadados
                </button>
                {!extensionReady ? (
                  <>
                    <span className="text-[var(--line)]">·</span>
                    <button
                      type="button"
                      disabled={selected.length === 0 || busy}
                      onClick={copyPromptOnly}
                      className="font-semibold text-[var(--ink-dim)] hover:text-[var(--ink)] disabled:opacity-40"
                    >
                      Só copiar texto
                    </button>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>

          <input
            className="field shrink-0"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ajuste fino (opcional)"
          />
        </section>

        {/* Effects */}
        <aside className="flex min-w-0 flex-col rounded-xl border border-[var(--line)] bg-[var(--panel)] p-3 sm:p-4 lg:min-h-0">
          <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
            <h2 className="text-[16px] font-bold tracking-wide text-[var(--ink)]">
              Efeitos
            </h2>
            <button
              type="button"
              onClick={() => setSelected([])}
              className="text-[13px] font-semibold text-[var(--ink-dim)] hover:text-[var(--ink)]"
            >
              Limpar
            </button>
          </div>

          <div className="subject-row mb-2 shrink-0">
            {SUBJECTS.map((s) => (
              <button
                key={s.id}
                type="button"
                title={s.hint}
                onClick={() => onSubjectChange(s.id)}
                className={`subject-tab ${subject === s.id ? "is-active" : ""}`}
              >
                {s.title}
              </button>
            ))}
          </div>
          <p className="mb-3 shrink-0 text-[13px] text-[var(--ink-dim)]">
            {SUBJECTS.find((s) => s.id === subject)?.hint}
          </p>

          <div className="cats-nav">
            <button
              type="button"
              className="cats-arrow"
              aria-label="Categorias anteriores"
              onClick={() => scrollCats(-1)}
            >
              ‹
            </button>
            <div
              ref={catsRef}
              className="cats-scroll"
              onPointerDown={onCatsPointerDown}
              onPointerMove={onCatsPointerMove}
              onPointerUp={endCatsDrag}
              onPointerCancel={endCatsDrag}
            >
              {categories.map((cat) => {
                const count = cat.effects.filter((ef) =>
                  selected.includes(ef.code),
                ).length;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onCategoryClick(cat.id)}
                    className={`cat-tab ${activeCategory === cat.id ? "is-active" : ""}`}
                  >
                    {cat.title}
                    {count > 0 ? ` ${count}` : ""}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              className="cats-arrow"
              aria-label="Próximas categorias"
              onClick={() => scrollCats(1)}
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-1 content-start gap-2 overflow-visible sm:grid-cols-2 lg:min-h-0 lg:flex-1 lg:grid-cols-2 lg:overflow-y-auto xl:grid-cols-3">
            {category.effects.length === 0 ? (
              <p className="col-span-full px-1 py-6 text-center text-[14px] text-[var(--ink-dim)]">
                Nenhum favorito ainda. Toque na estrela de um efeito para
                adicionar.
              </p>
            ) : (
              category.effects.map((effect) => (
                <EffectItem key={effect.id} effect={effect} />
              ))
            )}
          </div>
        </aside>
      </div>

      {toast ? (
        <div className="toast-in fixed bottom-4 left-1/2 z-50 max-w-[90vw] -translate-x-1/2 rounded-lg bg-[var(--ink)] px-4 py-2.5 text-[14px] font-semibold text-[var(--bg)]">
          {toast}
        </div>
      ) : null}
    </main>
  );
}

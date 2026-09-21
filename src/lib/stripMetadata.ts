/** Regrava a imagem só com pixels — remove EXIF, XMP, IPTC e Content Credentials (C2PA). */

export type StripResult = {
  blob: Blob;
  fileName: string;
  mimeType: string;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Não foi possível carregar a imagem."));
    img.src = src;
  });
}

function preferPng(mimeType: string): boolean {
  return mimeType === "image/png" || mimeType === "image/webp";
}

function cleanFileName(name: string, ext: string): string {
  const base = (name || "foto").replace(/\.[^.]+$/, "") || "foto";
  const safe = base.replace(/[^\w\-à-úÀ-Ú]+/gi, "_").slice(0, 80);
  return `${safe}_sem_meta.${ext}`;
}

export async function stripImageMetadata(file: File): Promise<StripResult> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    if (!width || !height) {
      throw new Error("Imagem inválida ou sem dimensões.");
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas não disponível neste navegador.");

    ctx.drawImage(img, 0, 0, width, height);

    const asPng = preferPng(file.type);
    const mimeType = asPng ? "image/png" : "image/jpeg";
    const quality = asPng ? undefined : 0.92;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Falha ao exportar a imagem."))),
        mimeType,
        quality,
      );
    });

    return {
      blob,
      mimeType,
      fileName: cleanFileName(file.name, asPng ? "png" : "jpg"),
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

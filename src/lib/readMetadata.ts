import exifr from "exifr";

export type MetaField = {
  key: string;
  value: string;
  highlight?: boolean;
};

export type ImageMetaReport = {
  fileName: string;
  fileSize: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  hasExif: boolean;
  hasXmp: boolean;
  hasIptc: boolean;
  hasAiSignals: boolean;
  aiHints: string[];
  fields: MetaField[];
};

const AI_KEY_RE =
  /c2pa|contentcredentials|digitalsourcetype|ai.?generat|synthetic|trainedalgorithmic|opensource.?ai|chatgpt|dall.?e|midjourney|firefly|stable.?diffusion|generative/i;

const AI_VALUE_RE =
  /trainedAlgorithmicMedia|compositeWithTrainedAlgorithmicMedia|artificial|generated.?by.?ai|content.?credential|c2pa|chatgpt|dall-?e|midjourney|adobe.?firefly|stable.?diffusion/i;

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function stringifyValue(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") {
    const t = value.trim();
    return t ? t : null;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value instanceof Date) {
    return value.toLocaleString("pt-BR");
  }
  if (Array.isArray(value)) {
    const parts = value
      .map((v) => stringifyValue(v))
      .filter((v): v is string => Boolean(v));
    return parts.length ? parts.join(", ") : null;
  }
  if (typeof value === "object") {
    try {
      const json = JSON.stringify(value);
      if (!json || json === "{}" || json === "[]") return null;
      return json.length > 180 ? `${json.slice(0, 180)}…` : json;
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function flattenEntries(
  input: Record<string, unknown> | null | undefined,
  prefix = "",
): MetaField[] {
  if (!input) return [];
  const out: MetaField[] = [];
  for (const [rawKey, rawVal] of Object.entries(input)) {
    const key = prefix ? `${prefix}.${rawKey}` : rawKey;
    if (
      rawVal &&
      typeof rawVal === "object" &&
      !(rawVal instanceof Date) &&
      !Array.isArray(rawVal)
    ) {
      out.push(...flattenEntries(rawVal as Record<string, unknown>, key));
      continue;
    }
    const value = stringifyValue(rawVal);
    if (!value) continue;
    const highlight = AI_KEY_RE.test(key) || AI_VALUE_RE.test(value);
    out.push({ key, value, highlight });
  }
  return out;
}

async function scanBinarySignals(file: File): Promise<string[]> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  const max = Math.min(bytes.length, 2_000_000);
  let text = "";
  for (let i = 0; i < max; i++) {
    const b = bytes[i];
    text += b >= 32 && b < 127 ? String.fromCharCode(b) : " ";
  }
  const hints: string[] = [];
  const lower = text.toLowerCase();
  if (lower.includes("c2pa") || lower.includes("contentcredentials")) {
    hints.push("Content Credentials / C2PA detectado no arquivo");
  }
  if (lower.includes("digitalsourcetype")) {
    hints.push("Campo IPTC DigitalSourceType presente");
  }
  if (lower.includes("trainedalgorithmicmedia")) {
    hints.push("Marcado como mídia gerada por algoritmo treinado");
  }
  if (lower.includes("compositewithtrainedalgorithmicmedia")) {
    hints.push("Marcado como composição com mídia de IA");
  }
  return hints;
}

function dimensionsFromMeta(
  meta: Record<string, unknown> | undefined,
): { width: number | null; height: number | null } {
  const w =
    Number(meta?.ImageWidth ?? meta?.ExifImageWidth ?? meta?.PixelXDimension) ||
    null;
  const h =
    Number(
      meta?.ImageHeight ?? meta?.ExifImageHeight ?? meta?.PixelYDimension,
    ) || null;
  return {
    width: w && w > 0 ? w : null,
    height: h && h > 0 ? h : null,
  };
}

async function readPixelSize(
  file: File,
): Promise<{ width: number; height: number } | null> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("fail"));
      el.src = url;
    });
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    if (!width || !height) return null;
    return { width, height };
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function readImageMetadata(file: File): Promise<ImageMetaReport> {
  const [parsed, binaryHints, pixels] = await Promise.all([
    exifr
      .parse(file, {
        tiff: true,
        xmp: true,
        icc: false,
        iptc: true,
        jfif: true,
        ihdr: true,
        multiSegment: true,
        mergeOutput: true,
        translateKeys: true,
        translateValues: true,
        reviveValues: true,
      })
      .catch(() => null) as Promise<Record<string, unknown> | null>,
    scanBinarySignals(file),
    readPixelSize(file),
  ]);

  const fields = flattenEntries(parsed ?? undefined)
    .sort((a, b) => {
      if (a.highlight !== b.highlight) return a.highlight ? -1 : 1;
      return a.key.localeCompare(b.key);
    })
    .slice(0, 80);

  const fromMeta = dimensionsFromMeta(parsed ?? undefined);
  const width = pixels?.width ?? fromMeta.width;
  const height = pixels?.height ?? fromMeta.height;

  const aiHints = [...binaryHints];
  for (const f of fields) {
    if (!f.highlight) continue;
    const tip = `${f.key}: ${f.value}`;
    if (!aiHints.includes(tip)) aiHints.push(tip);
  }

  const hasExif = Boolean(
    parsed &&
      ("Make" in parsed ||
        "Model" in parsed ||
        "DateTimeOriginal" in parsed ||
        "Orientation" in parsed ||
        "ExifVersion" in parsed),
  );
  const hasXmp = Boolean(
    parsed &&
      Object.keys(parsed).some(
        (k) => /xmp|dc:|photoshop|aux|crs|Iptc4xmp/i.test(k),
      ),
  );
  const hasIptc = Boolean(
    parsed &&
      Object.keys(parsed).some((k) =>
        /iptc|Credit|Caption|Keywords|Byline|ObjectName/i.test(k),
      ),
  );

  return {
    fileName: file.name || "sem-nome",
    fileSize: formatBytes(file.size),
    mimeType: file.type || "desconhecido",
    width,
    height,
    hasExif,
    hasXmp,
    hasIptc,
    hasAiSignals: aiHints.length > 0,
    aiHints: aiHints.slice(0, 12),
    fields,
  };
}

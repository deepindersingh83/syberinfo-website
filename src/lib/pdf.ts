/**
 * Minimal, zero-dependency PDF writer — just enough to render a one-page
 * A4 tax invoice with text, lines and filled rectangles. We build the PDF by
 * hand (objects → xref → trailer) rather than pulling in a PDF library, to keep
 * the project dependency-free (same principle as the custom Resend adapter).
 *
 * Coordinates are PDF points (72 pt = 1 inch); origin is bottom-left. Helpers
 * here flip to a more natural top-left `y` for callers. Only the WinAnsi/ASCII
 * range and the standard Helvetica fonts are used, which every reader ships.
 */

const A4 = { w: 595.28, h: 841.89 };

type Op = string;

/** Escape a string for a PDF literal `( … )`. */
function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/[\r\n]+/g, " ");
}

/** Strip characters outside the byte range the standard fonts encode. */
function ascii(s: string): string {
  // Replace common typographic characters, then drop anything non-Latin-1.
  return String(s)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    // eslint-disable-next-line no-control-regex
    .replace(/[^\x00-\xFF]/g, "");
}

export class PdfPage {
  private ops: Op[] = [];
  readonly width = A4.w;
  readonly height = A4.h;

  private y(top: number): number {
    return this.height - top;
  }

  /** Draw text with `font` = "H" (Helvetica) or "HB" (Helvetica-Bold). */
  text(x: number, top: number, s: string, size = 10, font: "H" | "HB" = "H", color = "0"): this {
    this.ops.push(
      `${color} ${color} ${color} rg BT /${font} ${size} Tf 1 0 0 1 ${x.toFixed(2)} ${this.y(top).toFixed(
        2,
      )} Tm (${esc(ascii(s))}) Tj ET`,
    );
    return this;
  }

  /** Right-align text so it ends at `xRight`. */
  textRight(xRight: number, top: number, s: string, size = 10, font: "H" | "HB" = "H", color = "0"): this {
    const w = measure(ascii(s), size, font);
    return this.text(xRight - w, top, s, size, font, color);
  }

  line(x1: number, top1: number, x2: number, top2: number, width = 0.5, gray = "0"): this {
    this.ops.push(
      `${gray} ${gray} ${gray} RG ${width} w ${x1.toFixed(2)} ${this.y(top1).toFixed(2)} m ${x2.toFixed(
        2,
      )} ${this.y(top2).toFixed(2)} l S`,
    );
    return this;
  }

  rect(x: number, top: number, w: number, h: number, fill: [number, number, number]): this {
    this.ops.push(
      `${fill[0]} ${fill[1]} ${fill[2]} rg ${x.toFixed(2)} ${this.y(top + h).toFixed(2)} ${w.toFixed(
        2,
      )} ${h.toFixed(2)} re f`,
    );
    return this;
  }

  content(): string {
    return this.ops.join("\n");
  }
}

/** Approximate Helvetica text width in points (per-char widths / 1000 em). */
function measure(s: string, size: number, font: "H" | "HB"): number {
  const table = font === "HB" ? HELV_BOLD_W : HELV_W;
  let w = 0;
  for (const ch of s) w += table[ch.charCodeAt(0)] ?? 556;
  return (w * size) / 1000;
}

/** Assemble one or more pages into a PDF byte buffer. */
export function buildPdf(pages: PdfPage[]): Buffer {
  const objects: string[] = [];
  // 1 = Catalog, 2 = Pages, 3.. = fonts + page/content pairs.
  const fontHelv = objIndex(objects, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  const fontHelvB = objIndex(
    objects,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
  );

  const pageRefs: number[] = [];
  const pagesObjNo = objects.length + 1 + pages.length * 2 + 1; // reserve: content+page per page, then Pages, Catalog

  for (const p of pages) {
    const stream = p.content();
    const contentNo = objIndex(
      objects,
      `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`,
    );
    const pageNo = objIndex(
      objects,
      `<< /Type /Page /Parent ${pagesObjNo} 0 R /MediaBox [0 0 ${A4.w} ${A4.h}] ` +
        `/Resources << /Font << /H ${fontHelv} 0 R /HB ${fontHelvB} 0 R >> >> /Contents ${contentNo} 0 R >>`,
    );
    pageRefs.push(pageNo);
  }

  const kids = pageRefs.map((n) => `${n} 0 R`).join(" ");
  const pagesNo = objIndex(objects, `<< /Type /Pages /Kids [${kids}] /Count ${pageRefs.length} >>`);
  const catalogNo = objIndex(objects, `<< /Type /Catalog /Pages ${pagesNo} 0 R >>`);

  // Serialise with a cross-reference table.
  let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets[i] = Buffer.byteLength(pdf, "latin1");
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefStart = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) pdf += `${String(off).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogNo} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, "latin1");
}

function objIndex(objects: string[], body: string): number {
  objects.push(body);
  return objects.length; // 1-based object number
}

// Helvetica AFM advance widths (subset: printable ASCII 32–126). Values are the
// standard Adobe metrics in 1/1000 em; anything outside falls back to 556.
const HELV_W: Record<number, number> = buildWidths(
  "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584",
);
const HELV_BOLD_W: Record<number, number> = buildWidths(
  "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584",
);

function buildWidths(csv: string): Record<number, number> {
  const arr = csv.split(",").map(Number);
  const out: Record<number, number> = {};
  arr.forEach((w, i) => {
    if (w) out[i] = w;
  });
  return out;
}

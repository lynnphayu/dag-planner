export const VAR_REGEX = /\$(?:input|results?)\.[a-zA-Z0-9_-]+/g;

const CHIP_BASE =
  "display:inline-flex;align-items:center;border-radius:4px;padding:1px 6px;font-size:0.75rem;font-weight:500;cursor:default;user-select:none;white-space:nowrap;vertical-align:middle;line-height:1.5;margin:0 2px;";

export const CHIP_STYLE: Record<"input" | "result", string> = {
  input: `${CHIP_BASE}background-color:rgba(59,130,246,0.15);color:rgb(96,165,250);border:1px solid rgba(59,130,246,0.3);`,
  result: `${CHIP_BASE}background-color:rgba(139,92,246,0.15);color:rgb(167,139,250);border:1px solid rgba(139,92,246,0.3);`,
};

export function normalizeToString(val: unknown): string {
  if (val === undefined || val === null) return "";
  if (typeof val === "string") {
    if (val.length > 2 && val.startsWith('"') && val.endsWith('"')) {
      const inner = val.slice(1, -1);
      if (/^\$(?:input|results?)\.[a-zA-Z0-9_-]+$/.test(inner)) {
        return inner;
      }
    }
    return val;
  }
  try {
    return JSON.stringify(val, null, 2);
  } catch {
    return String(val);
  }
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}

export function buildInnerHTML(
  raw: string,
  resolveLabel: (ref: string) => string,
): string {
  if (!raw) return "";
  let html = "";
  let lastIndex = 0;
  VAR_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = VAR_REGEX.exec(raw)) !== null) {
    const matchStart = match.index;
    const matchEnd = VAR_REGEX.lastIndex;
    const prevChar = matchStart > 0 ? raw[matchStart - 1] : "";
    const nextChar = matchEnd < raw.length ? raw[matchEnd] : "";
    const isJsonQuoted = prevChar === '"' && nextChar === '"';

    const sliceEnd = isJsonQuoted ? matchStart - 1 : matchStart;
    if (sliceEnd > lastIndex) {
      html += escapeHtml(raw.slice(lastIndex, sliceEnd));
    }

    const ref = match[0];
    const group: "input" | "result" = ref.startsWith("$input.")
      ? "input"
      : "result";
    const label = resolveLabel(ref);
    html += `<span contenteditable="false" data-ref="${ref}" data-group="${group}" data-quoted="${isJsonQuoted}" style="${CHIP_STYLE[group]}">${escapeHtml(label)}</span>`;
    lastIndex = isJsonQuoted ? matchEnd + 1 : matchEnd;
  }

  if (lastIndex < raw.length) {
    html += escapeHtml(raw.slice(lastIndex));
  }

  return html;
}

export function readRawFromNode(container: Node): string {
  let raw = "";
  for (const child of container.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      raw += child.textContent ?? "";
    } else if (child instanceof HTMLElement) {
      if (child.dataset.ref) {
        raw +=
          child.dataset.quoted === "true"
            ? `"${child.dataset.ref}"`
            : child.dataset.ref;
      } else if (child.tagName === "BR") {
        raw += "\n";
      } else if (child.tagName === "DIV" || child.tagName === "P") {
        raw += "\n" + readRawFromNode(child);
      } else {
        raw += readRawFromNode(child);
      }
    }
  }
  return raw;
}

export function findTextNodeBeforeCursor(
  range: Range,
): { node: Text; offset: number } | null {
  if (range.startContainer.nodeType === Node.TEXT_NODE) {
    return { node: range.startContainer as Text, offset: range.startOffset };
  }
  const container = range.startContainer;
  for (let i = range.startOffset - 1; i >= 0; i--) {
    const child = container.childNodes[i];
    if (!child) continue;
    if (child.nodeType === Node.TEXT_NODE) {
      return { node: child as Text, offset: (child as Text).length };
    }
    if (!(child instanceof HTMLElement && child.dataset.ref)) break;
  }
  return null;
}

export function createChipElement(variable: {
  value: string;
  group: "input" | "result";
  label: string;
}): HTMLSpanElement {
  const chip = document.createElement("span");
  chip.contentEditable = "false";
  chip.dataset.ref = variable.value;
  chip.dataset.group = variable.group;
  chip.style.cssText = CHIP_STYLE[variable.group];
  chip.textContent = variable.label;
  return chip;
}

import remarkGfm from "remark-gfm";

const PATCHED = Symbol.for("remark-gfm-safe-patched");

function ensureArray(value) {
  return Array.isArray(value) ? value : value === undefined ? [] : [value];
}

function patchExitHandlers(extensions) {
  const queue = [...ensureArray(extensions)];

  while (queue.length) {
    const current = queue.shift();

    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }

    if (!current || typeof current !== "object") {
      continue;
    }

    const exit = current.exit;

    if (!exit || typeof exit !== "object") {
      continue;
    }

    const handler = exit.codeText;

    if (typeof handler !== "function" || handler[PATCHED]) {
      continue;
    }

    const wrapped = function patchedExitCodeText(token) {
      if (!this.data) {
        this.data = {};
      }

      return handler.call(this, token);
    };

    wrapped[PATCHED] = true;
    exit.codeText = wrapped;
  }
}

export default function remarkGfmSafe(options) {
  const result = remarkGfm.call(this, options);

  const data = this.data();
  patchExitHandlers(data.fromMarkdownExtensions);

  return result;
}

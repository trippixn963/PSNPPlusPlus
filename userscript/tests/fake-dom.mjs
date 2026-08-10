/**
 * PSNP++ - Test Helper: a fake DOM
 * ================================
 *
 * Not a test file (the runner's glob is `*.test.mjs`). A shared, deliberately
 * small stand-in for the handful of DOM APIs the chip and the panel actually
 * use, so both can be driven under `node --test` the way sync-cycle.mjs is
 * driven against fake storage and a fake server.
 *
 * It is a fake, not a shim: it models only what is used, and every element it
 * hands back records its own listeners so a test can DISPATCH a real gesture —
 * a pointerdown/move/up drag, a click on a button — instead of reaching into
 * the module's internals and asserting on state nothing ever exercised. Nine
 * data-loss bugs in this project were invisible to reading and only fell out of
 * executing the code; this exists so the widget can be executed too.
 *
 * Developer: Trippixn
 * Website:   https://trippixn.com
 * Discord:   discord.gg/syria
 */

class FakeNode {
  constructor(tag) {
    this.tagName = String(tag).toUpperCase();
    this.id = '';
    this.className = '';
    this.title = '';
    this.value = '';
    this.hidden = false;
    this.disabled = false;
    this.style = {};
    this.children = [];
    this.parent = null;
    this.attrs = new Map();
    this.listeners = new Map();
    this._text = '';
    // Overridable per test: the chip's clamp arithmetic reads it, and a node
    // that has never been laid out has no honest size to report.
    this.rect = null;
    this.offsetWidth = 0;
    this.offsetHeight = 0;
  }

  get textContent() {
    return this._text + this.children.map(child => child.textContent).join('');
  }

  set textContent(value) {
    this._text = value == null ? '' : String(value);
    for (const child of this.children) child.parent = null;
    this.children = [];
  }

  setAttribute(name, value) { this.attrs.set(name, String(value)); }
  getAttribute(name) { return this.attrs.has(name) ? this.attrs.get(name) : null; }

  appendChild(child) {
    child.parent = this;
    this.children.push(child);
    return child;
  }

  remove() {
    if (!this.parent) return;
    this.parent.children = this.parent.children.filter(node => node !== this);
    this.parent = null;
  }

  addEventListener(type, handler) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(handler);
  }

  /**
   * Real, not a stub. Its absence meant every `removeEventListener?.()` in the
   * source was optional-chained into a no-op here, so a handler that was never
   * unbound looked identical to one that was — and a chip rehosted into the
   * menu kept its old listeners with nothing able to notice.
   */
  removeEventListener(type, handler) {
    const handlers = this.listeners.get(type);
    if (!handlers) return;
    this.listeners.set(type, handlers.filter(fn => fn !== handler));
  }

  /** Fire every handler registered for `type`. Returns how many ran. */
  dispatch(type, event = {}) {
    const handlers = this.listeners.get(type) ?? [];
    for (const handler of handlers) handler(event);
    return handlers.length;
  }

  /** Is `node` this node or a descendant of it? Mirrors Node.contains. */
  contains(node) {
    if (node == null) return false;
    if (node === this) return true;
    return this.children.some(child => child.contains(node));
  }

  getBoundingClientRect() {
    return this.rect ?? { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
  }

  setPointerCapture() {}
  releasePointerCapture() {}
  focus() {}
}

/** Depth-first walk over a subtree, the node itself included. */
export function* walk(node) {
  if (!node) return;
  yield node;
  for (const child of node.children) yield* walk(child);
}

/** The first element carrying `data-psnppp="<name>"`, or null. */
export function find(root, name) {
  for (const node of walk(root)) {
    if (node.getAttribute('data-psnppp') === name) return node;
  }
  return null;
}

/** Every element carrying `data-psnppp="<name>"`, in document order. */
export function findAll(root, name) {
  const out = [];
  for (const node of walk(root)) {
    if (node.getAttribute('data-psnppp') === name) out.push(node);
  }
  return out;
}

/** True when the node is displayed — panel panes hide with both. */
export const isVisible = node => Boolean(node) && node.hidden !== true && node.style.display !== 'none';

export function installFakeDocument() {
  const created = [];
  const body = new FakeNode('body');
  const head = new FakeNode('head');
  const documentElement = new FakeNode('html');

  // The document carries listeners of its own now: closing the panel on an
  // outside click is the one thing that cannot be observed from inside our own
  // subtree, so it is the one listener this widget puts on the host document.
  const docListeners = new Map();

  globalThis.document = {
    body,
    head,
    documentElement,
    addEventListener(type, handler) {
      if (!docListeners.has(type)) docListeners.set(type, []);
      docListeners.get(type).push(handler);
    },
    removeEventListener(type, handler) {
      const handlers = docListeners.get(type);
      if (!handlers) return;
      docListeners.set(type, handlers.filter(fn => fn !== handler));
    },
    /** Fire every document handler of `type`, as a real click would. */
    dispatch(type, event = {}) {
      const handlers = docListeners.get(type) ?? [];
      for (const handler of handlers) handler(event);
      return handlers.length;
    },
    /** How many document listeners of `type` are installed — leak detection. */
    listenerCount(type) {
      return (docListeners.get(type) ?? []).length;
    },
    createElement(tag) {
      const node = new FakeNode(tag);
      created.push(node);
      return node;
    },
    // The panel's footer icons are real SVG, which needs the namespaced form.
    // Namespace ignored here: these tests assert structure and attributes, and
    // FakeNode is namespace-agnostic — what matters is that the call succeeds
    // and the node lands in the tree like any other.
    createElementNS(_namespace, tag) {
      return this.createElement(tag);
    }
  };

  return {
    body,
    head,
    created,
    /** The chip, once it has been appended. */
    get chip() { return body.children.find(node => node.id === 'psnppp-indicator') ?? null; },
    /** The settings panel, once it has been appended. */
    get panel() { return body.children.find(node => node.id === 'psnppp-panel') ?? null; }
  };
}

export function uninstallFakeDocument() {
  delete globalThis.document;
}

/**
 * A fake window.
 *
 * `prompt`, `alert` and `confirm` are present but RECORDED rather than
 * scripted: the point of the panel is that none of them is reached any more, so
 * a test that finds an entry in `prompts` has found a regression, not a result.
 */
export function installFakeWindow({ width = 1280, height = 800, localStorage = null } = {}) {
  const alerts = [];
  const prompts = [];
  const confirms = [];
  const resizeHandlers = [];
  let reloaded = false;

  globalThis.window = {
    innerWidth: width,
    innerHeight: height,
    localStorage,
    document: globalThis.document,
    addEventListener(type, handler) {
      if (type === 'resize') resizeHandlers.push(handler);
    },
    /**
     * Real, not a stub — the chip's destroy() has to be able to let go of a
     * listener installed on something that outlives it, and a missing method
     * here optional-chains into a no-op that looks exactly like success.
     */
    removeEventListener(type, handler) {
      if (type !== 'resize') return;
      const at = resizeHandlers.indexOf(handler);
      if (at !== -1) resizeHandlers.splice(at, 1);
    },
    alert: message => { alerts.push(message); },
    prompt: (message, initial) => { prompts.push({ message, initial }); return null; },
    confirm: message => { confirms.push(message); return false; },
    location: { reload: () => { reloaded = true; } }
  };

  return {
    alerts,
    prompts,
    confirms,
    wasReloaded: () => reloaded,
    /** How many resize listeners are currently installed. */
    resizeListenerCount: () => resizeHandlers.length,
    /** Change the viewport and fire the resize listeners, as a browser would. */
    resize(nextWidth, nextHeight) {
      globalThis.window.innerWidth = nextWidth;
      globalThis.window.innerHeight = nextHeight;
      for (const handler of resizeHandlers) handler();
    }
  };
}

export function uninstallFakeWindow() {
  delete globalThis.window;
}

/** A fake GM.* backed by a Map, matching the one the other suites install. */
export function installFakeGM() {
  const store = new Map();
  globalThis.GM = {
    async getValue(key, fallback) { return store.has(key) ? store.get(key) : fallback; },
    async setValue(key, value) { store.set(key, value); },
    async deleteValue(key) { store.delete(key); }
  };
  return store;
}

export function uninstallFakeGM() {
  delete globalThis.GM;
}

/** localStorage stand-in, same shape the other suites use. */
export function fakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: key => (key in data ? data[key] : null),
    setItem: (key, value) => { data[key] = String(value); },
    removeItem: key => { delete data[key]; }
  };
}

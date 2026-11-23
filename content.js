const DEFAULT_VIDEOS_PER_ROW = 4;
const DEFAULT_UI_RADIUS = 12;
const CACHE_KEY = "ytc-videos-per-row";
const SKIP_CLASS = "ytc-skip-intro";
const SKIP_ATTR = "data-ytc-skip-intro";
const NO_AI_CLASS = "ytc-no-ai";
const DISLIKE_COUNT_CLASS = "ytc-dislike-count";
const DISLIKE_ARIA_ATTR = "data-ytc-dislike-aria";
const DISLIKE_STYLE_ATTR = "data-ytc-dislike-style";
const DISLIKE_MESSAGE_TYPE = "ytc-get-dislikes";
const DISLIKE_HOST_SELECTOR = "segmented-like-dislike-button-view-model, ytd-segmented-like-dislike-button-renderer";
const SUBSCRIBE_RENDERER_SELECTOR = "ytd-subscribe-button-renderer, yt-subscribe-button-view-model";
const SUBSCRIBE_STATE_ATTR = "data-ytc-subscribed";
const DEFAULT_SUBSCRIBE_COLOR = "#cc0000";
const DEFAULT_SUBSCRIBED_COLOR = "#606060";
const NO_RADIUS_ATTR = "data-ytc-no-radius";
const NO_RADIUS_SELECTOR = [
  ".ytp-progress-bar-container",
  ".ytp-tooltip-progress-bar-pill",
  ".ytp-autonav-toggle",
  ".ytp-autonav-toggle-button-container",
  ".ytp-autonav-toggle-button",
  ".ytp-autonav-endscreen",
  ".ytThumbnailOverlayProgressBarHost",
  "yt-thumbnail-overlay-progress-bar",
  ".ytd-thumbnail-overlay-resume-playback-renderer"
].join(", ");
const SIDEBAR_KEY_ATTR = "data-ytc-sidebar-key";
const SIDEBAR_HIDDEN_CLASS = "ytc-sidebar-hidden";
const SIDEBAR_TREE_STORAGE_KEY = "sidebarTree";
const SUBSCRIPTIONS_SECTION_ATTR = "data-ytc-subscriptions-section";
const SUBSCRIPTION_NAME_ATTR = "data-ytc-subscription-name";
const SUBSCRIPTIONS_REDACTED_CLASS = "ytc-subscriptions-redacted";
const SUBSCRIPTION_HIDE_KEY = "subscriptions:hide-names";
let currentVideosPerRow = DEFAULT_VIDEOS_PER_ROW;
let currentUiRadius = DEFAULT_UI_RADIUS;
let currentHoverHighlights = true;
let currentFontFamily = "";
let noAISetting = false;
let introStyle = null;
let sidebarHiddenKeys = new Set();
let lastSidebarTreeJSON = "";
let addDislikesEnabled = false;
let dislikeVideoId = "";
let dislikeCount = null;
let pendingDislikeVideoId = "";
let dislikeRequestToken = 0;
let coloredSubscribeEnabled = false;
let subscribeButtonColor = DEFAULT_SUBSCRIBE_COLOR;
let subscribedButtonColor = DEFAULT_SUBSCRIBED_COLOR;

function injectCustomFonts(fonts) {
  const styleId = "ytc-custom-fonts";
  let style = document.getElementById(styleId);
  const rules = [];

  for (const font of Array.isArray(fonts) ? fonts : []) {
    if (!font || typeof font.id !== "string" || typeof font.dataUrl !== "string") continue;
    if (!font.dataUrl.startsWith("data:")) continue;
    const id = font.id.replace(/[^a-zA-Z0-9_-]/g, "");
    if (!id) continue;
    const format = ["woff2", "woff", "truetype", "opentype"].includes(font.format) ? font.format : "woff2";
    rules.push(`@font-face{font-family:"YTCustom-${id}";src:url("${font.dataUrl}") format("${format}");font-display:swap;}`);
  }

  if (!rules.length) {
    style?.remove();
    return;
  }
  if (!style) {
    style = document.createElement("style");
    style.id = styleId;
    (document.head || document.documentElement).appendChild(style);
  }
  const css = rules.join("\n");
  if (style.textContent !== css) style.textContent = css;
}

function applyFontFamily(value) {
  const font = typeof value === "string" ? value.trim() : "";
  const root = document.documentElement;

  currentFontFamily = font;
  if (!font) {
    delete root.dataset.ytcFont;
    root.style.removeProperty("--ytc-font");
    return;
  }
  root.style.setProperty("--ytc-font", font);
  root.dataset.ytcFont = "1";
}

function applyHoverHighlights(value) {
  currentHoverHighlights = Boolean(value);
  const root = document.documentElement;
  if (currentHoverHighlights || !isHomeFeed()) delete root.dataset.ytcHoverHighlights;
  else root.dataset.ytcHoverHighlights = "off";
}

function markNoRadiusElements() {
  for (const node of document.querySelectorAll(NO_RADIUS_SELECTOR)) {
    if (!node.hasAttribute(NO_RADIUS_ATTR)) node.setAttribute(NO_RADIUS_ATTR, "");
  }
}

function applyUiRadius(value) {
  const parsed = Math.round(Number(value));
  const radius = Number.isFinite(parsed) ? Math.min(30, Math.max(0, parsed)) : DEFAULT_UI_RADIUS;
  const root = document.documentElement;

  currentUiRadius = radius;
  markNoRadiusElements();
  root.style.setProperty("--ytc-ui-radius", `${radius}px`);
  if (isHomeFeed() || location.pathname === "/watch" || location.pathname.startsWith("/live/")) {
    root.dataset.ytcUiRadius = String(radius);
  } else {
    delete root.dataset.ytcUiRadius;
  }
}

const SEARCH_INPUT_SELECTOR = [
  "input.ytSearchboxComponentInput",
  "yt-searchbox input[type='text']",
  "ytd-searchbox input#search",
  "#search-input input",
  "input[name='search_query']"
].join(", ");

function syncSearchPlaceholder() {
  for (const input of document.querySelectorAll(SEARCH_INPUT_SELECTOR)) {
    if (!input.hasAttribute("data-ytc-original-placeholder")) {
      input.setAttribute("data-ytc-original-placeholder", input.getAttribute("placeholder") ?? "");
    }
    if (input.getAttribute("placeholder") !== "Search") {
      input.setAttribute("placeholder", "Search");
    }
  }
}

function restoreSearchPlaceholder() {
  for (const input of document.querySelectorAll("input[data-ytc-original-placeholder]")) {
    const original = input.getAttribute("data-ytc-original-placeholder");
    if (original === null) continue;
    input.setAttribute("placeholder", original);
    input.removeAttribute("data-ytc-original-placeholder");
  }
}

function applyNoAI(value) {
  noAISetting = Boolean(value);
  const marked = document.querySelectorAll(`.${NO_AI_CLASS}`);
  if (noAISetting) syncSearchPlaceholder();
  else restoreSearchPlaceholder();

  if (!noAISetting || !isHomeFeed()) {
    for (const node of marked) node.classList.remove(NO_AI_CLASS);
    return;
  }

  const candidates = document.querySelectorAll(
    'button, a[role="button"], [role="button"], ytd-button-renderer, yt-button-shape, tp-yt-paper-button, [class*="ask-youtube" i], [class*="askyoutube" i], [id*="ask-youtube" i], [id*="askyoutube" i]'
  );
  for (const node of candidates) {
    const label = `${node.getAttribute("aria-label") || ""} ${node.innerText || ""}`.replace(/\s+/g, " ").trim();
    const className = typeof node.className === "string" ? node.className : "";
    const matchesLabel = /^ask(?:\s+youtube)?$/i.test(label) || /\bask\s+youtube\b/i.test(label);
    const matchesClass = /ask-?youtube/i.test(`${node.id} ${className}`);
    if (!matchesLabel && !matchesClass) continue;

    const target = node.closest("button-view-model") ||
      node.closest("button, ytd-button-renderer, tp-yt-paper-button, a[role='button'], [role='button']") ||
      node;
    target.classList.add(NO_AI_CLASS);
  }
}

function getDislikeVideoId() {
  try {
    const url = new URL(location.href);
    if (url.pathname === "/watch") {
      const id = url.searchParams.get("v");
      if (id) return id;
      return document.querySelector("ytd-watch-flexy[video-id]")?.getAttribute("video-id") || "";
    }
    if (url.pathname.startsWith("/shorts/") || url.pathname.startsWith("/live/")) {
      return url.pathname.split("/")[2] || "";
    }
  } catch (error) {
    // Ignore malformed URLs.
  }
  return "";
}

function formatDislikeCompact(value) {
  const count = Math.round(Number(value));
  if (!Number.isFinite(count) || count < 0) return "";
  try {
    return new Intl.NumberFormat(navigator.language || "en", {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1
    }).format(count);
  } catch (error) {
    return String(count);
  }
}

function formatDislikeFull(value) {
  const count = Math.round(Number(value));
  if (!Number.isFinite(count) || count < 0) return "";
  try {
    return new Intl.NumberFormat(navigator.language || "en").format(count);
  } catch (error) {
    return String(count);
  }
}

function clearDislikeCounts() {
  for (const node of document.querySelectorAll(`.${DISLIKE_COUNT_CLASS}`)) node.remove();
  for (const button of document.querySelectorAll("button")) {
    if (button.hasAttribute(DISLIKE_STYLE_ATTR)) {
      const original = button.getAttribute(DISLIKE_STYLE_ATTR);
      if (original) button.setAttribute("style", original);
      else button.removeAttribute("style");
      button.removeAttribute(DISLIKE_STYLE_ATTR);
    }
    if (button.hasAttribute(DISLIKE_ARIA_ATTR)) {
      const original = button.getAttribute(DISLIKE_ARIA_ATTR);
      if (original !== null) button.setAttribute("aria-label", original);
      button.removeAttribute(DISLIKE_ARIA_ATTR);
    }
  }
}

function requestDislikeCount(videoId) {
  return new Promise((resolve) => {
    const runtime = globalThis.chrome?.runtime;
    if (!runtime?.sendMessage) {
      resolve(null);
      return;
    }

    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };
    const timer = setTimeout(() => finish(null), 10000);

    try {
      runtime.sendMessage({ type: DISLIKE_MESSAGE_TYPE, videoId }, (response) => {
        if (runtime.lastError) {
          finish(null);
          return;
        }
        const count = Number(response?.dislikes);
        finish(response?.ok && Number.isFinite(count) && count >= 0 ? count : null);
      });
    } catch (error) {
      finish(null);
    }
  });
}

function injectDislikeCounts(count) {
  const compact = formatDislikeCompact(count);
  const full = formatDislikeFull(count);
  if (!compact || !full) return;

  for (const host of document.querySelectorAll(DISLIKE_HOST_SELECTOR)) {
    for (const button of host.querySelectorAll("dislike-button-view-model button, ytd-toggle-button-renderer#dislike-button button")) {
      if (!button.hasAttribute(DISLIKE_STYLE_ATTR)) {
        button.setAttribute(DISLIKE_STYLE_ATTR, button.getAttribute("style") || "");
      }

      let label = button.querySelector(`.${DISLIKE_COUNT_CLASS}`);
      if (!label) {
        label = document.createElement("span");
        label.className = DISLIKE_COUNT_CLASS;
        label.setAttribute("aria-hidden", "true");
        const feedback = button.querySelector("yt-touch-feedback-shape");
        button.insertBefore(label, feedback || null);
      }
      if (label.textContent !== compact) label.textContent = compact;
      label.title = `${full} dislikes`;

      button.style.width = "auto";
      button.style.padding = "0 12px";
      button.style.gap = "0";
      button.style.justifyContent = "center";

      if (!button.hasAttribute(DISLIKE_ARIA_ATTR)) {
        button.setAttribute(DISLIKE_ARIA_ATTR, button.getAttribute("aria-label") || "");
      }
      const original = button.getAttribute(DISLIKE_ARIA_ATTR) || "Dislike this video";
      button.setAttribute("aria-label", `${original} — ${full} dislikes`);
    }
  }
}

function syncDislikes() {
  if (!addDislikesEnabled) {
    clearDislikeCounts();
    return;
  }

  const videoId = getDislikeVideoId();
  if (!videoId) {
    dislikeRequestToken += 1;
    dislikeVideoId = "";
    dislikeCount = null;
    pendingDislikeVideoId = "";
    clearDislikeCounts();
    return;
  }

  if (videoId !== dislikeVideoId) {
    dislikeRequestToken += 1;
    dislikeVideoId = videoId;
    dislikeCount = null;
    pendingDislikeVideoId = "";
    clearDislikeCounts();
  }

  if (dislikeCount !== null) {
    injectDislikeCounts(dislikeCount);
    return;
  }
  if (pendingDislikeVideoId === videoId) return;

  pendingDislikeVideoId = videoId;
  const token = ++dislikeRequestToken;
  requestDislikeCount(videoId).then((count) => {
    if (token !== dislikeRequestToken || !addDislikesEnabled || dislikeVideoId !== videoId) return;
    pendingDislikeVideoId = "";
    if (count === null) return;
    dislikeCount = count;
    injectDislikeCounts(count);
  });
}

function applyAddDislikes(value) {
  addDislikesEnabled = Boolean(value);
  if (!addDislikesEnabled) {
    dislikeRequestToken += 1;
    dislikeVideoId = "";
    dislikeCount = null;
    pendingDislikeVideoId = "";
    clearDislikeCounts();
    return;
  }
  syncDislikes();
}

function normalizeSubscribeColor(value, fallback) {
  const text = String(value || "").trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(text)) {
    return `#${text.split("").map((part) => part + part).join("")}`.toLowerCase();
  }
  if (/^[0-9a-f]{6}$/i.test(text)) return `#${text}`.toLowerCase();
  return fallback;
}

function readableSubscribeText(color) {
  const red = parseInt(color.slice(1, 3), 16);
  const green = parseInt(color.slice(3, 5), 16);
  const blue = parseInt(color.slice(5, 7), 16);
  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  return luminance > 140 ? "#0f0f0f" : "#ffffff";
}

function isSubscribeButtonSubscribed(renderer) {
  const subscribed = renderer.getAttribute("subscribed");
  if (subscribed !== null) return subscribed !== "false";

  const button = renderer.querySelector("button");
  if (button) {
    if (button.getAttribute("aria-pressed") === "true") return true;
    const aria = (button.getAttribute("aria-label") || "").toLowerCase();
    if (aria.includes("unsubscribe") || aria.includes("subscribed")) return true;
    const text = (button.innerText || "").trim().toLowerCase();
    if (text === "subscribed" || text === "unsubscribe") return true;
    if (text === "subscribe") return false;
    if (aria.includes("subscribe")) return false;
  }
  return false;
}

function syncSubscribeButtons() {
  for (const renderer of document.querySelectorAll(SUBSCRIBE_RENDERER_SELECTOR)) {
    const state = isSubscribeButtonSubscribed(renderer) ? "true" : "false";
    if (renderer.getAttribute(SUBSCRIBE_STATE_ATTR) !== state) {
      renderer.setAttribute(SUBSCRIBE_STATE_ATTR, state);
    }
  }
}

function applyColoredSubscribe(value, subscribeColor, subscribedColor) {
  coloredSubscribeEnabled = Boolean(value);
  subscribeButtonColor = normalizeSubscribeColor(subscribeColor, DEFAULT_SUBSCRIBE_COLOR);
  subscribedButtonColor = normalizeSubscribeColor(subscribedColor, DEFAULT_SUBSCRIBED_COLOR);

  const root = document.documentElement;
  root.style.setProperty("--ytc-subscribe-color", subscribeButtonColor);
  root.style.setProperty("--ytc-subscribe-text", readableSubscribeText(subscribeButtonColor));
  root.style.setProperty("--ytc-subscribed-color", subscribedButtonColor);
  root.style.setProperty("--ytc-subscribed-text", readableSubscribeText(subscribedButtonColor));

  if (coloredSubscribeEnabled) root.dataset.ytcColoredSubscribe = "1";
  else delete root.dataset.ytcColoredSubscribe;

  syncSubscribeButtons();
}

function normalizeSidebarText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function sidebarKeyText(value) {
  return normalizeSidebarText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
}

function markSidebarElement(element, key) {
  if (!element || !key) return;
  if (element.getAttribute(SIDEBAR_KEY_ATTR) !== key) {
    element.setAttribute(SIDEBAR_KEY_ATTR, key);
  }
}

function sidebarSectionTitle(section) {
  const directTitle = section.querySelector(":scope > #guide-section-title");
  if (directTitle) return normalizeSidebarText(directTitle.textContent);

  const headers = Array.from(section.querySelectorAll("#header"));
  const header = headers.find((candidate) =>
    candidate.closest("ytd-guide-section-renderer") === section &&
    !candidate.closest("ytd-guide-entry-renderer")
  );
  if (header) return normalizeSidebarText(header.textContent);

  return normalizeSidebarText(section.querySelector(":scope > h3")?.textContent);
}

function sidebarEntryTitle(entry) {
  const endpointTitle = entry.querySelector("a#endpoint[title]")?.getAttribute("title");
  const label = entry.querySelector(".title, #label, yt-formatted-string.title");
  return normalizeSidebarText(endpointTitle || label?.textContent || entry.getAttribute("aria-label") || entry.textContent);
}

function sidebarEntryHref(entry) {
  return entry.querySelector("a#endpoint[href], a[href]")?.getAttribute("href") || "";
}

function addSidebarItem(tree, item) {
  if (!item || !item.key) return;
  const existing = tree.find((candidate) => candidate.key === item.key);
  if (!existing) {
    tree.push(item);
    return;
  }
  const children = existing.children || [];
  for (const child of item.children || []) {
    if (!children.some((candidate) => candidate.key === child.key)) children.push(child);
  }
  existing.children = children;
}

function uniqueSidebarKey(usedKeys, base) {
  let key = base;
  let index = 2;
  while (usedKeys.has(key)) {
    key = `${base}~${index}`;
    index += 1;
  }
  usedKeys.add(key);
  return key;
}

function collectSidebarEntries(section, scope, usedKeys) {
  const entries = [];
  for (const entry of section.querySelectorAll("ytd-guide-entry-renderer")) {
    if (entry.closest("ytd-guide-section-renderer") !== section) continue;
    const title = sidebarEntryTitle(entry);
    if (!title || /^show (?:more|less)$/i.test(title)) continue;

    const href = sidebarEntryHref(entry);
    const key = uniqueSidebarKey(usedKeys, `entry:${scope}|${href || sidebarKeyText(title)}`);
    markSidebarElement(entry, key);
    entries.push({ key, title, children: [] });
  }
  return entries;
}

function markSubscriptionNames(section) {
  section.setAttribute(SUBSCRIPTIONS_SECTION_ATTR, "");
  for (const entry of section.querySelectorAll("ytd-guide-entry-renderer")) {
    if (entry.closest("ytd-guide-section-renderer") !== section) continue;
    const title = sidebarEntryTitle(entry);
    if (!title || /^show (?:more|less)$/i.test(title)) continue;
    const name = entry.querySelector(".title, #label, yt-formatted-string.title") || entry;
    if (!name.hasAttribute(SUBSCRIPTION_NAME_ATTR)) {
      name.setAttribute(SUBSCRIPTION_NAME_ATTR, "");
    }
  }
}

function findSidebarTreeItem(tree, predicate) {
  for (const item of tree) {
    if (predicate(item)) return item;
    for (const child of item.children || []) {
      if (predicate(child)) return child;
    }
  }
  return null;
}

function syncMiniGuide(tree, usedKeys) {
  const entries = document.querySelectorAll("ytd-mini-guide-renderer ytd-mini-guide-entry-renderer");
  if (!entries.length) return;

  const extra = [];
  for (const entry of entries) {
    const title = normalizeSidebarText(
      entry.querySelector(".title, #label")?.textContent || entry.getAttribute("aria-label") || entry.textContent
    );
    if (!title) continue;

    const lowerTitle = title.toLowerCase();
    let item = null;
    if (lowerTitle === "you") {
      item = findSidebarTreeItem(tree, (candidate) => candidate.key === "section:you");
    }
    if (!item && lowerTitle === "subscriptions") {
      item = findSidebarTreeItem(tree, (candidate) => candidate.key === "section:subscriptions");
    }
    if (!item) {
      item = findSidebarTreeItem(tree, (candidate) => candidate.title.toLowerCase() === lowerTitle);
    }

    const href = sidebarEntryHref(entry);
    const key = item?.key || (lowerTitle === "you" ? "section:you" :
      lowerTitle === "subscriptions" ? "section:subscriptions" :
        `entry:top|${href || sidebarKeyText(title)}`);

    markSidebarElement(entry, key);
    if (!item && !tree.length) {
      const keyBase = `entry:top|${href || sidebarKeyText(title)}`;
      const itemKey = lowerTitle === "you" ? "section:you" :
        lowerTitle === "subscriptions" ? "section:subscriptions" :
          uniqueSidebarKey(usedKeys, keyBase);
      markSidebarElement(entry, itemKey);
      extra.push({ key: itemKey, title, children: [] });
    }
  }

  if (!tree.length) {
    for (const item of extra) addSidebarItem(tree, item);
  }
}

function buildSidebarTree() {
  const tree = [];
  const usedKeys = new Set();
  const guide = document.querySelector("ytd-guide-renderer");

  if (guide) {
    const sections = Array.from(guide.querySelectorAll("ytd-guide-section-renderer"))
      .filter((section) => section.closest("ytd-guide-section-renderer") === section);

    for (const section of sections) {
      if (section.querySelector("#footer, #guide-links-primary, #guide-links-secondary, #copyright")) {
        continue;
      }

      const title = sidebarSectionTitle(section);
      if (title) {
        const key = uniqueSidebarKey(usedKeys, `section:${sidebarKeyText(title)}`);
        markSidebarElement(section, key);

        if (/^subscriptions$/i.test(title)) {
          markSubscriptionNames(section);
          addSidebarItem(tree, {
            key,
            title,
            children: [{
              key: SUBSCRIPTION_HIDE_KEY,
              title: "Hide Subscriptions",
              children: [],
              inverted: true
            }]
          });
        } else {
          section.removeAttribute(SUBSCRIPTIONS_SECTION_ATTR);
          addSidebarItem(tree, {
            key,
            title,
            children: collectSidebarEntries(section, key, usedKeys)
          });
        }
      } else {
        for (const entry of collectSidebarEntries(section, "top", usedKeys)) {
          addSidebarItem(tree, entry);
        }
      }
    }
  }

  syncMiniGuide(tree, usedKeys);
  return tree;
}

function applySidebarHidden() {
  for (const node of document.querySelectorAll(`[${SIDEBAR_KEY_ATTR}]`)) {
    const key = node.getAttribute(SIDEBAR_KEY_ATTR);
    node.classList.toggle(SIDEBAR_HIDDEN_CLASS, sidebarHiddenKeys.has(key));
  }

  const hideSubscriptions = sidebarHiddenKeys.has(SUBSCRIPTION_HIDE_KEY);
  for (const section of document.querySelectorAll(`[${SUBSCRIPTIONS_SECTION_ATTR}]`)) {
    section.classList.toggle(SUBSCRIPTIONS_REDACTED_CLASS, hideSubscriptions);
  }
}

function syncSidebar() {
  const tree = buildSidebarTree();
  applySidebarHidden();

  const json = JSON.stringify(tree);
  if (json === lastSidebarTreeJSON) return;
  lastSidebarTreeJSON = json;
  globalThis.chrome?.storage?.local?.set?.({ [SIDEBAR_TREE_STORAGE_KEY]: tree });
}

function purgeShorts() {
  if (!isHomeFeed()) return;
  const contents = document.querySelector("ytd-rich-grid-renderer > #contents");
  if (!contents) return;

  for (const shelf of contents.querySelectorAll("ytd-rich-shelf-renderer[is-shorts], ytd-reel-shelf-renderer")) {
    const section = shelf.closest("ytd-rich-section-renderer");
    if (section && section.parentElement === contents) section.remove();
    else shelf.remove();
  }

  for (const section of contents.querySelectorAll(":scope > ytd-rich-section-renderer")) {
    if (section.querySelector('ytm-shorts-lockup-view-model, ytm-shorts-lockup-view-model-v2, a[href^="/shorts/"]')) {
      section.remove();
    }
  }
}

function setIntroHideCount(count) {
  if (count <= 0) {
    introStyle?.remove();
    introStyle = null;
    return;
  }
  if (!introStyle) {
    introStyle = document.createElement("style");
    (document.head || document.documentElement).appendChild(introStyle);
  }
  const rule = `html[data-ytc-videos-per-row] ytd-rich-grid-renderer > #contents > :nth-child(-n+${count}) { display: none !important; }`;
  if (introStyle.textContent !== rule) introStyle.textContent = rule;
}

function markSkipped(node) {
  if (!node.classList.contains(SKIP_CLASS)) node.classList.add(SKIP_CLASS);
  if (!node.hasAttribute(SKIP_ATTR)) node.setAttribute(SKIP_ATTR, "");
}

function syncItemAttributes(count) {
  for (const item of document.querySelectorAll("ytd-rich-item-renderer[items-per-row]")) {
    if (item.closest("ytd-rich-shelf-renderer, ytd-reel-shelf-renderer, ytd-rich-section-renderer")) continue;
    if (item.getAttribute("items-per-row") !== String(count)) {
      item.setAttribute("items-per-row", String(count));
    }
  }
}

function isHomeFeed() {
  return location.pathname === "/" || Boolean(document.querySelector('ytd-browse[page-subtype="home"]'));
}

function skipBrokenIntro() {
  if (!isHomeFeed()) {
    setIntroHideCount(0);
    for (const node of document.querySelectorAll(`.${SKIP_CLASS}, [${SKIP_ATTR}]`)) {
      node.classList.remove(SKIP_CLASS);
      node.removeAttribute(SKIP_ATTR);
    }
    return;
  }

  const contents = document.querySelector("ytd-rich-grid-renderer > #contents");
  if (!contents) {
    setIntroHideCount(0);
    return;
  }

  // The Home feed starts with two native 3-card rows, each followed by a
  // Shorts/section renderer. That shape does not change with the selected
  // count, so find it directly instead of looking for a run of N cards.
  const children = Array.from(contents.children);
  let cursor = 0;
  let hideCount = 0;
  let rowsFound = 0;

  for (let row = 0; row < 2; row += 1) {
    let cards = 0;
    if (cursor < children.length && children[cursor].matches("ytd-rich-grid-row")) {
      cards = children[cursor].querySelectorAll("ytd-rich-item-renderer").length;
      cursor += 1;
    } else {
      while (cursor < children.length && children[cursor].matches("ytd-rich-item-renderer")) {
        cards += 1;
        cursor += 1;
      }
    }
    if (cards !== 3) break;

    let sections = 0;
    while (cursor < children.length && children[cursor].matches("ytd-rich-section-renderer")) {
      sections += 1;
      cursor += 1;
    }
    if (sections === 0) break;
    rowsFound += 1;
    hideCount = cursor;
  }

  if (rowsFound !== 2) {
    setIntroHideCount(0);
    return;
  }

  setIntroHideCount(hideCount);
  for (let index = 0; index < hideCount; index += 1) {
    markSkipped(children[index]);
  }
}

function applyVideosPerRow(value) {
  const parsed = Math.round(Number(value));
  const count = Number.isFinite(parsed) ? Math.min(8, Math.max(1, parsed)) : DEFAULT_VIDEOS_PER_ROW;
  const root = document.documentElement;

  currentVideosPerRow = count;
  root.dataset.ytcVideosPerRow = String(count);
  root.style.setProperty("--ytc-videos-per-row", String(count));
  syncItemAttributes(count);
  skipBrokenIntro();
  purgeShorts();
  try {
    localStorage.setItem(CACHE_KEY, String(count));
  } catch (error) {
    // localStorage can be unavailable on restricted pages.
  }
}

let syncTimer = 0;
function scheduleItemSync() {
  if (syncTimer) return;
  syncTimer = setTimeout(() => {
    syncTimer = 0;
    syncItemAttributes(currentVideosPerRow);
    skipBrokenIntro();
    purgeShorts();
    applyNoAI(noAISetting);
    markNoRadiusElements();
    syncSidebar();
    syncDislikes();
    syncSubscribeButtons();
  }, 300);
}

if (document.documentElement) {
  new MutationObserver(() => {
    skipBrokenIntro();
    scheduleItemSync();
  }).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["subscribed", "aria-pressed"]
  });
}

for (const delay of [500, 1500, 4000]) {
  setTimeout(scheduleItemSync, delay);
}

let cachedVideosPerRow = NaN;
try {
  cachedVideosPerRow = Number(localStorage.getItem(CACHE_KEY));
} catch (error) {
  // Ignore and fall back to the storage read below.
}
if (Number.isFinite(cachedVideosPerRow) && cachedVideosPerRow >= 1 && cachedVideosPerRow <= 8) {
  applyVideosPerRow(cachedVideosPerRow);
}

for (const eventName of ["focusin", "focusout"]) {
  document.addEventListener(eventName, () => {
    if (noAISetting) syncSearchPlaceholder();
  }, true);
}

for (const eventName of ["yt-navigate-finish", "yt-page-data-updated", "popstate"]) {
  window.addEventListener(eventName, () => {
    applyVideosPerRow(currentVideosPerRow);
    applyUiRadius(currentUiRadius);
    applyHoverHighlights(currentHoverHighlights);
    applyFontFamily(currentFontFamily);
    applyNoAI(noAISetting);
    syncSidebar();
    syncDislikes();
    syncSubscribeButtons();
  });
}

document.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target?.closest(SUBSCRIBE_RENDERER_SELECTOR)) return;
  setTimeout(syncSubscribeButtons, 100);
  setTimeout(syncSubscribeButtons, 700);
  setTimeout(syncSubscribeButtons, 1500);
}, true);

globalThis.chrome?.storage?.local?.get({ customFonts: [], sidebarHidden: [] }, (data) => {
  injectCustomFonts(data.customFonts);
  sidebarHiddenKeys = new Set(Array.isArray(data.sidebarHidden) ? data.sidebarHidden.filter((key) => typeof key === "string") : []);
  applySidebarHidden();
  syncSidebar();
});

chrome.storage.sync.get({ videosPerRow: DEFAULT_VIDEOS_PER_ROW, uiRadius: DEFAULT_UI_RADIUS, noAI: false, hoverHighlights: true, addDislikes: true, coloredSubscribe: true, subscribeColor: DEFAULT_SUBSCRIBE_COLOR, subscribedColor: DEFAULT_SUBSCRIBED_COLOR, fontFamily: "" }, (settings) => {
  applyVideosPerRow(settings.videosPerRow);
  applyUiRadius(settings.uiRadius);
  applyHoverHighlights(settings.hoverHighlights);
  applyFontFamily(settings.fontFamily);
  applyNoAI(settings.noAI);
  syncSidebar();
  applyAddDislikes(settings.addDislikes !== false);
  applyColoredSubscribe(settings.coloredSubscribe !== false, settings.subscribeColor, settings.subscribedColor);
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local") {
    if (changes.customFonts) injectCustomFonts(changes.customFonts.newValue);
    if (changes.sidebarHidden) {
      sidebarHiddenKeys = new Set(Array.isArray(changes.sidebarHidden.newValue) ? changes.sidebarHidden.newValue.filter((key) => typeof key === "string") : []);
      applySidebarHidden();
    }
    return;
  }
  if (area !== "sync") return;
  if (changes.videosPerRow) applyVideosPerRow(changes.videosPerRow.newValue);
  if (changes.uiRadius) applyUiRadius(changes.uiRadius.newValue);
  if (changes.hoverHighlights) applyHoverHighlights(changes.hoverHighlights.newValue);
  if (changes.fontFamily) applyFontFamily(changes.fontFamily.newValue);
  if (changes.noAI) applyNoAI(changes.noAI.newValue);
  if (changes.addDislikes) applyAddDislikes(changes.addDislikes.newValue);
  if (changes.coloredSubscribe || changes.subscribeColor || changes.subscribedColor) {
    applyColoredSubscribe(
      changes.coloredSubscribe ? changes.coloredSubscribe.newValue !== false : coloredSubscribeEnabled,
      changes.subscribeColor ? changes.subscribeColor.newValue : subscribeButtonColor,
      changes.subscribedColor ? changes.subscribedColor.newValue : subscribedButtonColor
    );
  }
});

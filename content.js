const DEFAULT_VIDEOS_PER_ROW = 4;
const DEFAULT_UI_RADIUS = 12;
const CACHE_KEY = "ytc-videos-per-row";
const SKIP_CLASS = "ytc-skip-intro";
const SKIP_ATTR = "data-ytc-skip-intro";
const NO_AI_CLASS = "ytc-no-ai";
const NO_AI_CANDIDATE_SELECTOR = 'button, a[role="button"], [role="button"], ytd-button-renderer, yt-button-shape, tp-yt-paper-button, [class*="ask-youtube" i], [class*="askyoutube" i], [id*="ask-youtube" i], [id*="askyoutube" i]';
const NO_AI_TARGET_SELECTOR = [
  "yt-video-description-youchat-section-view-model",
  "yt-button-view-model:has(.you-chat-entrypoint-button)",
  ".you-chat-entrypoint-button"
].join(", ");
const HASHTAG_HIDDEN_CLASS = "ytc-hashtag-hidden";
const HASHTAG_SCOPE_SELECTOR = [
  "ytd-watch-metadata",
  "ytd-reel-player-overlay-renderer",
  "yt-lockup-metadata-view-model",
  "ytd-reel-item-renderer",
  "yt-shorts-lockup-view-model-v2",
  "#title",
  "#video-title",
  "#description",
  "#description-inline-expander",
  "#description-text"
].join(", ");
const HASHTAG_TEXT_PATTERN = /(^|\s)#[\p{L}\p{N}\p{M}_]+/gu;
const DISLIKE_COUNT_CLASS = "ytc-dislike-count";
const DISLIKE_ARIA_ATTR = "data-ytc-dislike-aria";
const DISLIKE_STYLE_ATTR = "data-ytc-dislike-style";
const DISLIKE_MESSAGE_TYPE = "ytc-get-dislikes";
const DISLIKE_HOST_SELECTOR = "segmented-like-dislike-button-view-model, ytd-segmented-like-dislike-button-renderer";

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
const SIDEBAR_STATE_VERSION = 2;
const SUBSCRIPTIONS_SECTION_ATTR = "data-ytc-subscriptions-section";
const YOU_SECTION_ATTR = "data-ytc-you-section";
const SUBSCRIPTION_NAME_ATTR = "data-ytc-subscription-name";
const SUBSCRIPTIONS_REDACTED_CLASS = "ytc-subscriptions-redacted";
const SUBSCRIPTION_HIDE_KEY = "subscriptions:hide-names";
const GUIDE_TREE_TTL = 10 * 60 * 1000;
const GUIDE_FETCH_BACKOFF = 60 * 1000;


let currentVideosPerRow = DEFAULT_VIDEOS_PER_ROW;
let currentUiRadius = DEFAULT_UI_RADIUS;
let currentHoverHighlights = true;
let removeRecommendedEnabled = false;
let currentFontFamily = "";
let noAISetting = false;
let removeHashtagsEnabled = false;
let hashtagTextOriginals = new Map();
let introStyle = null;
let sidebarHiddenKeys = new Set();
let lastSidebarTreeJSON = "";
let guideTreeCache = null;
let guideTreeCacheTime = 0;
let guideFetchPending = false;
let guideFetchAttempt = 0;
let innertubeConfigCache = null;

let addDislikesEnabled = false;
let dislikeVideoId = "";
let dislikeCount = null;
let pendingDislikeVideoId = "";
let dislikeRequestToken = 0;

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
  if (currentHoverHighlights) delete root.dataset.ytcHoverHighlights;
  else root.dataset.ytcHoverHighlights = "off";
}

function applyRemoveRecommended(value) {
  const enabled = Boolean(value);
  const changed = enabled !== removeRecommendedEnabled;
  removeRecommendedEnabled = enabled;

  const root = document.documentElement;
  if (enabled) root.dataset.ytcNoRecommended = "1";
  else delete root.dataset.ytcNoRecommended;

  // The player only recomputes its video size on a resize.
  if (changed) window.dispatchEvent(new Event("resize"));
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

  if (!noAISetting) {
    for (const node of marked) node.classList.remove(NO_AI_CLASS);
    return;
  }

  // The watch page's Ask YouTube entry point and its description section.
  for (const node of document.querySelectorAll(NO_AI_TARGET_SELECTOR)) {
    const target = node.closest("yt-button-view-model") || node;
    target.classList.add(NO_AI_CLASS);
  }

  // Home scans the whole page; watch pages only need their metadata block,
  // which keeps the label scan off the comments.
  const scopes = isHomeFeed() ? [document] : Array.from(document.querySelectorAll("ytd-watch-metadata"));
  for (const scope of scopes) {
    for (const node of scope.querySelectorAll(NO_AI_CANDIDATE_SELECTOR)) {
      const ariaLabel = (node.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim();
      const text = (node.innerText || "").replace(/\s+/g, " ").trim();
      const className = typeof node.className === "string" ? node.className : "";
      const matchesLabel = [ariaLabel, text].some((value) =>
        Boolean(value) && (
          /^ask(?:\s+youtube)?$/i.test(value) ||
          /\bask\s+youtube\b/i.test(value) ||
          /\bask about (?:this|the) video\b/i.test(value)
        )
      );
      const matchesClass = /ask-?youtube/i.test(`${node.id} ${className}`);
      if (!matchesLabel && !matchesClass) continue;

      const target = node.closest("button-view-model") ||
        node.closest("button, ytd-button-renderer, tp-yt-paper-button, a[role='button'], [role='button']") ||
        node;
      target.classList.add(NO_AI_CLASS);
    }
  }
}

function stripHashtagsFromTextNode(node) {
  const record = hashtagTextOriginals.get(node);
  if (record && node.nodeValue === record.stripped) return;

  const original = node.nodeValue || "";
  if (original.indexOf("#") === -1) {
    if (record) hashtagTextOriginals.delete(node);
    return;
  }

  const stripped = original.replace(HASHTAG_TEXT_PATTERN, "$1").replace(/[ \t]{2,}/g, " ");
  if (stripped === original) {
    if (record) hashtagTextOriginals.delete(node);
    return;
  }

  hashtagTextOriginals.set(node, { original, stripped });
  if (node.nodeValue !== stripped) node.nodeValue = stripped;
}

function restoreHashtags() {
  for (const [node, record] of hashtagTextOriginals) {
    if (node.isConnected && node.nodeValue === record.stripped) node.nodeValue = record.original;
  }
  hashtagTextOriginals.clear();

  for (const anchor of document.querySelectorAll(`.${HASHTAG_HIDDEN_CLASS}`)) {
    anchor.classList.remove(HASHTAG_HIDDEN_CLASS);
  }
}

function stripHashtags() {
  if (hashtagTextOriginals.size > 500) {
    for (const node of hashtagTextOriginals.keys()) {
      if (!node.isConnected) hashtagTextOriginals.delete(node);
    }
  }

  for (const scope of document.querySelectorAll(HASHTAG_SCOPE_SELECTOR)) {
    for (const anchor of scope.querySelectorAll('a[href*="/hashtag/"]')) {
      anchor.classList.add(HASHTAG_HIDDEN_CLASS);
    }

    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || parent.closest('a[href*="/hashtag/"]')) continue;
      if (parent.closest("script, style, noscript")) continue;
      stripHashtagsFromTextNode(node);
    }
  }
}

function applyRemoveHashtags(value) {
  removeHashtagsEnabled = Boolean(value);
  if (!removeHashtagsEnabled) {
    restoreHashtags();
    return;
  }
  stripHashtags();
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
    !candidate.closest("ytd-guide-entry-renderer") &&
    !candidate.closest("ytd-guide-collapsible-section-entry-renderer")
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

function sidebarCollapsibleTitle(collapsible) {
  const header = collapsible.querySelector(":scope > #header");
  if (!header) return "";
  const entry = header.matches("ytd-guide-entry-renderer") ? header : header.querySelector("ytd-guide-entry-renderer");
  return sidebarEntryTitle(entry || header);
}

function collectCollapsibleEntries(collapsible, scope, usedKeys) {
  const entries = [];
  for (const entry of collapsible.querySelectorAll("ytd-guide-entry-renderer")) {
    if (entry.closest("ytd-guide-collapsible-section-entry-renderer") !== collapsible) continue;
    if (entry.closest("#header")) continue;
    const title = sidebarEntryTitle(entry);
    if (!title || /^show (?:more|less)$/i.test(title)) continue;

    const href = sidebarEntryHref(entry);
    const key = uniqueSidebarKey(usedKeys, `entry:${scope}|${href || sidebarKeyText(title)}`);
    markSidebarElement(entry, key);
    entries.push({ key, title, children: [] });
  }
  return entries;
}

function markCollapsibleSubscriptionNames(collapsible) {
  collapsible.setAttribute(SUBSCRIPTIONS_SECTION_ATTR, "");
  for (const entry of collapsible.querySelectorAll("ytd-guide-entry-renderer")) {
    if (entry.closest("ytd-guide-collapsible-section-entry-renderer") !== collapsible) continue;
    if (entry.closest("#header")) continue;
    const title = sidebarEntryTitle(entry);
    if (!title || /^show (?:more|less)$/i.test(title)) continue;
    if (!entry.hasAttribute(SUBSCRIPTION_NAME_ATTR)) {
      entry.setAttribute(SUBSCRIPTION_NAME_ATTR, "");
    }
  }
}

function markSubscriptionNames(section) {
  section.setAttribute(SUBSCRIPTIONS_SECTION_ATTR, "");
  for (const entry of section.querySelectorAll("ytd-guide-entry-renderer")) {
    if (entry.closest("ytd-guide-section-renderer") !== section) continue;
    const title = sidebarEntryTitle(entry);
    if (!title || /^show (?:more|less)$/i.test(title)) continue;
    if (!entry.hasAttribute(SUBSCRIPTION_NAME_ATTR)) {
      entry.setAttribute(SUBSCRIPTION_NAME_ATTR, "");
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
  const referenceTree = Array.isArray(guideTreeCache) && guideTreeCache.length ? guideTreeCache : tree;
  for (const entry of entries) {
    const title = normalizeSidebarText(
      entry.querySelector(".title, #label")?.textContent || entry.getAttribute("aria-label") || entry.textContent
    );
    if (!title) continue;

    const lowerTitle = title.toLowerCase();
    let item = null;
    if (lowerTitle === "you") {
      item = findSidebarTreeItem(referenceTree, (candidate) => candidate.key === "section:you");
    }
    if (!item && lowerTitle === "subscriptions") {
      item = findSidebarTreeItem(referenceTree, (candidate) => candidate.key === "section:subscriptions");
    }
    if (!item) {
      item = findSidebarTreeItem(referenceTree, (candidate) => candidate.title.toLowerCase() === lowerTitle);
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
        if (/^you$/i.test(title)) section.setAttribute(YOU_SECTION_ATTR, "");
        else section.removeAttribute(YOU_SECTION_ATTR);

        if (/^subscriptions$/i.test(title)) {
          markSubscriptionNames(section);
          addSidebarItem(tree, {
            key,
            title,
            children: [{
              key: SUBSCRIPTION_HIDE_KEY,
              title: "Redact subscriptions (weirdo)",
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
        for (const node of section.querySelectorAll("ytd-guide-entry-renderer, ytd-guide-collapsible-section-entry-renderer")) {
          if (node.closest("ytd-guide-section-renderer") !== section) continue;
          if (node.matches("ytd-guide-entry-renderer") && node.closest("ytd-guide-collapsible-section-entry-renderer")) continue;
          if (node.matches("ytd-guide-collapsible-section-entry-renderer") && node.closest("ytd-guide-collapsible-section-entry-renderer") !== node) continue;

          if (node.matches("ytd-guide-collapsible-section-entry-renderer")) {
            const title = sidebarCollapsibleTitle(node);
            if (!title) continue;
            const key = uniqueSidebarKey(usedKeys, `section:${sidebarKeyText(title)}`);
            markSidebarElement(node, key);
            if (/^you$/i.test(title)) node.setAttribute(YOU_SECTION_ATTR, "");
            else node.removeAttribute(YOU_SECTION_ATTR);
            if (/^subscriptions$/i.test(title)) {
              markCollapsibleSubscriptionNames(node);
              addSidebarItem(tree, {
                key,
                title,
                children: [{
                  key: SUBSCRIPTION_HIDE_KEY,
                  title: "Redact subscriptions (weirdo)",
                  children: [],
                  inverted: true
                }]
              });
            } else {
              addSidebarItem(tree, {
                key,
                title,
                children: collectCollapsibleEntries(node, key, usedKeys)
              });
            }
            continue;
          }

          const title = sidebarEntryTitle(node);
          if (!title || /^show (?:more|less)$/i.test(title)) continue;
          const href = sidebarEntryHref(node);
          const key = uniqueSidebarKey(usedKeys, `entry:top|${href || sidebarKeyText(title)}`);
          markSidebarElement(node, key);
          addSidebarItem(tree, { key, title, children: [] });
        }
      }
    }
  }

  syncMiniGuide(tree, usedKeys);
  return tree;
}

function guideDataTitle(payload) {
  const title = payload?.formattedTitle?.simpleText ||
    payload?.title?.simpleText ||
    (Array.isArray(payload?.title?.runs) ? payload.title.runs.map((run) => run.text || "").join("") : "");
  return normalizeSidebarText(title);
}

function guideDataHref(payload) {
  return payload?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url ||
    payload?.endpoint?.commandMetadata?.webCommandMetadata?.url || "";
}

function collectGuideDataEntries(section) {
  const entries = [];
  const add = (entry) => {
    if (!entry) return;
    const title = guideDataTitle(entry);
    if (!title || /^show (?:more|less)$/i.test(title)) return;
    entries.push({ title, href: guideDataHref(entry) });
  };

  for (const item of Array.isArray(section?.items) ? section.items : []) {
    if (item.guideEntryRenderer) {
      add(item.guideEntryRenderer);
    } else if (item.guideCollapsibleEntryRenderer) {
      for (const child of item.guideCollapsibleEntryRenderer.expandableItems || []) {
        add(child.guideEntryRenderer);
      }
    }
  }
  return entries;
}

function buildGuideTreeFromData(items) {
  const tree = [];
  const usedKeys = new Set();
  let seenTitled = false;

  for (const item of Array.isArray(items) ? items : []) {
    const section = item?.guideSectionRenderer;
    if (!section) continue;

    const title = guideDataTitle(section);
    // Untitled sections after the first titled one are the footer links.
    if (!title && seenTitled) continue;
    if (title) seenTitled = true;

    if (!title) {
      for (const entry of collectGuideDataEntries(section)) {
        const key = uniqueSidebarKey(usedKeys, `entry:top|${entry.href || sidebarKeyText(entry.title)}`);
        addSidebarItem(tree, { key, title: entry.title, children: [] });
      }
      continue;
    }

    const key = uniqueSidebarKey(usedKeys, `section:${sidebarKeyText(title)}`);
    if (/^subscriptions$/i.test(title)) {
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
      continue;
    }

    const children = [];
    for (const entry of collectGuideDataEntries(section)) {
      const childKey = uniqueSidebarKey(usedKeys, `entry:${key}|${entry.href || sidebarKeyText(entry.title)}`);
      children.push({ key: childKey, title: entry.title, children: [] });
    }
    addSidebarItem(tree, { key, title, children });
  }

  return tree;
}

function readInnertubeConfig() {
  if (innertubeConfigCache) return innertubeConfigCache;

  for (const script of document.querySelectorAll("script")) {
    const text = script.textContent || "";
    if (!text.includes('"INNERTUBE_API_KEY"')) continue;

    const marker = "ytcfg.set(";
    let start = text.indexOf(marker);
    while (start !== -1 && text[start + marker.length] !== "{") {
      start = text.indexOf(marker, start + marker.length);
    }
    if (start === -1) continue;

    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let index = start + marker.length; index < text.length; index += 1) {
      const char = text[index];
      if (inString) {
        if (escaped) escaped = false;
        else if (char === "\\") escaped = true;
        else if (char === '"') inString = false;
        continue;
      }
      if (char === '"') {
        inString = true;
        continue;
      }
      if (char === "{") depth += 1;
      else if (char === "}") {
        depth -= 1;
        if (depth === 0) {
          try {
            innertubeConfigCache = JSON.parse(text.slice(start + marker.length, index + 1));
            return innertubeConfigCache;
          } catch (error) {
            break;
          }
        }
      }
    }
  }
  return null;
}

function needsFullGuide() {
  if (location.pathname.startsWith("/embed/") || location.pathname.startsWith("/live_chat")) return false;
  const guide = document.querySelector("ytd-guide-renderer");
  if (!guide || guide.hidden || !guide.offsetParent) return true;
  const style = getComputedStyle(guide);
  if (style.display === "none" || style.visibility === "hidden") return true;
  const rect = guide.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return true;
  return !guide.querySelector("ytd-guide-entry-renderer, ytd-guide-collapsible-section-entry-renderer");
}

function fetchGuideTree() {
  if (guideFetchPending) return;
  if (Date.now() - guideTreeCacheTime < GUIDE_TREE_TTL) return;
  if (Date.now() - guideFetchAttempt < GUIDE_FETCH_BACKOFF) return;

  const config = readInnertubeConfig();
  if (!config?.INNERTUBE_API_KEY || !config?.INNERTUBE_CONTEXT) return;

  guideFetchPending = true;
  guideFetchAttempt = Date.now();

  fetch(`/youtubei/v1/guide?key=${encodeURIComponent(config.INNERTUBE_API_KEY)}&prettyPrint=false`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context: config.INNERTUBE_CONTEXT })
  })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      const tree = buildGuideTreeFromData(data?.items);
      if (!tree.length) return;
      guideTreeCache = tree;
      guideTreeCacheTime = Date.now();
      lastSidebarTreeJSON = "";
      syncSidebar();
    })
    .catch(() => {
      // Keep the DOM-derived tree when the guide request fails.
    })
    .finally(() => {
      guideFetchPending = false;
    });
}

function applySidebarHidden() {
  for (const node of document.querySelectorAll(`[${SIDEBAR_KEY_ATTR}]`)) {
    const key = node.getAttribute(SIDEBAR_KEY_ATTR);
    node.classList.toggle(SIDEBAR_HIDDEN_CLASS, sidebarHiddenKeys.has(key));
  }

  const hideSubscriptions = sidebarHiddenKeys.has(SUBSCRIPTION_HIDE_KEY);
  if (hideSubscriptions) {
    const guide = document.querySelector("ytd-guide-renderer");
    for (const entry of guide?.querySelectorAll("ytd-guide-entry-renderer") || []) {
      if (entry.closest(`[${YOU_SECTION_ATTR}]`)) continue;
      if (!entry.querySelector('a[href^="/@"], a[href^="/channel/"]')) continue;
      entry.setAttribute(SUBSCRIPTION_NAME_ATTR, "");
    }
  }
  document.documentElement.classList.toggle(SUBSCRIPTIONS_REDACTED_CLASS, hideSubscriptions);
}

function syncSidebar() {
  const domTree = buildSidebarTree();
  applySidebarHidden();

  const fullGuide = needsFullGuide();
  const useCachedGuide = Boolean(guideTreeCache) &&
    Date.now() - guideTreeCacheTime < GUIDE_TREE_TTL &&
    fullGuide;
  const tree = useCachedGuide ? guideTreeCache : domTree;

  if (!useCachedGuide && fullGuide) fetchGuideTree();

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
    applyRemoveHashtags(removeHashtagsEnabled);
  }, 300);
}

if (document.documentElement) {
  new MutationObserver(() => {
    skipBrokenIntro();
    scheduleItemSync();
  }).observe(document.documentElement, {
    childList: true,
    subtree: true
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
    applyRemoveHashtags(removeHashtagsEnabled);
    if (removeRecommendedEnabled) window.dispatchEvent(new Event("resize"));
  });
}


function loadLocalSettings() {
  globalThis.chrome?.storage?.local?.get({ customFonts: [], sidebarHidden: [], sidebarHiddenVersion: 0 }, (data) => {
    injectCustomFonts(data.customFonts);
    if ((Number(data.sidebarHiddenVersion) || 0) < SIDEBAR_STATE_VERSION) {
      sidebarHiddenKeys = new Set();
      globalThis.chrome?.storage?.local?.set?.({ sidebarHidden: [], sidebarHiddenVersion: SIDEBAR_STATE_VERSION });
    } else {
      sidebarHiddenKeys = new Set(Array.isArray(data.sidebarHidden) ? data.sidebarHidden.filter((key) => typeof key === "string") : []);
    }
    applySidebarHidden();
    syncSidebar();
  });
}

function applySyncSettings(settings) {
  applyVideosPerRow(settings.videosPerRow);
  applyUiRadius(settings.uiRadius);
  applyHoverHighlights(settings.hoverHighlights);
  applyFontFamily(settings.fontFamily);
  applyNoAI(settings.noAI);
  syncSidebar();
  applyAddDislikes(settings.addDislikes !== false);
  applyRemoveHashtags(settings.removeHashtags);
  applyRemoveRecommended(settings.removeRecommended);
}

function loadSyncSettings() {
  globalThis.chrome?.storage?.sync?.get({ videosPerRow: DEFAULT_VIDEOS_PER_ROW, uiRadius: DEFAULT_UI_RADIUS, noAI: false, hoverHighlights: true, addDislikes: true, fontFamily: "", removeHashtags: false, removeRecommended: false }, applySyncSettings);
}

loadLocalSettings();
loadSyncSettings();

// A page restored from bfcache, prerendered, or frozen can miss storage
// events. Re-read both areas whenever the page becomes visible again.
function reloadSettings() {
  loadSyncSettings();
  loadLocalSettings();
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") reloadSettings();
});
window.addEventListener("pageshow", reloadSettings);

// The popup pings this listener; a missed response means this content script
// belongs to a dead extension context and the popup refreshes the tab.
if (!globalThis.__ytcMessageListener) {
  globalThis.__ytcMessageListener = true;
  globalThis.chrome?.runtime?.onMessage?.addListener((message, sender, sendResponse) => {
    if (message?.type === "ytc-apply-sidebar") {
      const keys = Array.isArray(message.keys) ? message.keys.filter((key) => typeof key === "string") : [];
      sidebarHiddenKeys = new Set(keys);
      syncSidebar();
      sendResponse({ ok: true });
      return false;
    }
    if (message?.type !== "ytc-ping") return false;
    sendResponse({ ok: true });
    return false;
  });
}

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
  if (changes.removeHashtags) applyRemoveHashtags(changes.removeHashtags.newValue);
  if (changes.removeRecommended) applyRemoveRecommended(changes.removeRecommended.newValue);
  if (changes.addDislikes) applyAddDislikes(changes.addDislikes.newValue);
});

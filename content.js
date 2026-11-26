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
  ".ytp-spinner",
  ".ytp-spinner-container",
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
const HOME_COLOR_STYLE_ID = "ytc-home-colors";
const HOME_IMAGE_STYLE_ID = "ytc-home-bg-image";
const ASK_BUTTON_CLASS = "ytc-ask-button";
const ASK_BUTTON_SELECTOR = ".ytc-ask-button, .ytc-ask-button button";
const SEARCH_FIELD_SELECTOR = [
  "yt-searchbox textarea.ytSearchboxComponentInput",
  "yt-searchbox textarea.ytSearchboxComponentInputTextArea",
  "yt-searchbox textarea.yt-searchbox-input",
  "yt-searchbox textarea[name='search_query']",
  "yt-searchbox textarea",
  "yt-searchbox input.ytSearchboxComponentInput",
  "yt-searchbox input[type='text']",
  "ytd-searchbox input#search",
  "#search-input input",
  "input[name='search_query']"
].join(", ");
const SEARCH_BUTTON_SELECTOR = [
  "yt-searchbox button.ytSearchboxComponentSearchButton",
  "yt-searchbox button[aria-label='Search']",
  "yt-searchbox button-view-model button[aria-label='Search']"
].join(", ");
const CHIP_OPTION_SCOPE = "ytd-feed-filter-chip-bar-renderer yt-chip-cloud-chip-renderer:not([selected]):not(.iron-selected)";
const HOME_COLOR_RULES = {
  searchBar: [["yt-searchbox .ytSearchboxComponentInputBox", "background-color"]],
  "searchBar.text": [
    [SEARCH_FIELD_SELECTOR, "color"],
    [SEARCH_FIELD_SELECTOR, "-webkit-text-fill-color"],
    [SEARCH_FIELD_SELECTOR, "caret-color"],
    [`:is(${SEARCH_FIELD_SELECTOR})::placeholder`, "color"],
    [`:is(${SEARCH_FIELD_SELECTOR})::placeholder`, "-webkit-text-fill-color"]
  ],
  searchButton: [[SEARCH_BUTTON_SELECTOR, "background-color"]],
  "searchButton.decal": [[SEARCH_BUTTON_SELECTOR, "color"]],
  askButton: [[ASK_BUTTON_SELECTOR, "background-color"]],
  "askButton.text": [[ASK_BUTTON_SELECTOR, "color"]],
  micButton: [["#voice-search-button, #voice-search-button button", "background-color"]],
  "micButton.decal": [["#voice-search-button button", "color"]],
  filterBar: [["#chips-wrapper", "background-color"]],
  "filterBar.options": [[`${CHIP_OPTION_SCOPE} .ytChipShapeChip`, "background-color"]],
  "filterBar.options.text": [[`${CHIP_OPTION_SCOPE} .ytChipShapeText, ${CHIP_OPTION_SCOPE} .ytChipShapeChip`, "color"]],
  video: [["ytd-rich-item-renderer", "background-color"]],
  "video.title": [["ytd-rich-item-renderer .ytLockupMetadataViewModelTitle, ytd-rich-item-renderer #video-title", "color"]],
  "video.meta": [["ytd-rich-item-renderer .ytContentMetadataViewModelMetadataText, ytd-rich-item-renderer #metadata-line", "color"]],
  "video.length": [["ytd-rich-item-renderer .ytBadgeShapeThumbnailBadge", "background-color"]],
  "video.length.text": [["ytd-rich-item-renderer .ytBadgeShapeThumbnailBadge .ytBadgeShapeText", "color"]],
  pageBackground: [
    ["ytd-app", "background-color"],
    ["body", "background-color"],
    ["#frosted-glass", "background-color"]
  ],
  sidebar: [
    ["ytd-guide-renderer, ytd-mini-guide-renderer, #guide-content, #guide-inner-content", "background-color"]
  ]
};
const HOME_COLOR_SAMPLE_RULES = {
  searchBar: ["yt-searchbox .ytSearchboxComponentInputBox", "backgroundColor"],
  "searchBar.text": [SEARCH_FIELD_SELECTOR, "color"],
  searchButton: [SEARCH_BUTTON_SELECTOR, "backgroundColor"],
  "searchButton.decal": [SEARCH_BUTTON_SELECTOR, "color"],
  askButton: [ASK_BUTTON_SELECTOR, "backgroundColor"],
  "askButton.text": [ASK_BUTTON_SELECTOR, "color"],
  micButton: ["#voice-search-button", "backgroundColor"],
  "micButton.decal": ["#voice-search-button button", "color"],
  filterBar: ["#chips-wrapper", "backgroundColor"],
  "filterBar.options": [`${CHIP_OPTION_SCOPE} .ytChipShapeChip`, "backgroundColor"],
  "filterBar.options.text": [`${CHIP_OPTION_SCOPE} .ytChipShapeText`, "color"],
  video: ["ytd-rich-item-renderer :is(yt-lockup-view-model, ytd-video-renderer)", "backgroundColor"],
  "video.title": ["ytd-rich-item-renderer .ytLockupMetadataViewModelTitle, ytd-rich-item-renderer #video-title", "color"],
  "video.meta": ["ytd-rich-item-renderer .ytContentMetadataViewModelMetadataText, ytd-rich-item-renderer #metadata-line", "color"],
  "video.length": ["ytd-rich-item-renderer .ytBadgeShapeThumbnailBadge", "backgroundColor"],
  "video.length.text": ["ytd-rich-item-renderer .ytBadgeShapeThumbnailBadge .ytBadgeShapeText", "color"],
  pageBackground: ["ytd-app", "backgroundColor"],
  sidebar: ["ytd-guide-renderer, #guide-content, #guide-inner-content", "backgroundColor"]
};
// Static declarations applied alongside a color, used where a color alone is
// not enough (the masthead's frosted-glass layer must lose its blur).
const HOME_COLOR_STATIC_RULES = {
  pageBackground: [
    ["#frosted-glass", "backdrop-filter:none !important"],
    ["#frosted-glass", "-webkit-backdrop-filter:none !important"]
  ]
};
const SIDEBAR_KEY_ATTR = "data-ytc-sidebar-key";
const SIDEBAR_DISABLED_CLASS = "ytc-sidebar-disabled";
const SIDEBAR_TREE_STORAGE_KEY = "sidebarTree";
const GUIDE_TREE_TTL = 10 * 60 * 1000;
const GUIDE_FETCH_BACKOFF = 60 * 1000;

let currentVideosPerRow = DEFAULT_VIDEOS_PER_ROW;
let currentUiRadius = DEFAULT_UI_RADIUS;
let currentHomeColors = {};
let currentHomeBackgroundImage = "";
let currentHoverHighlights = true;
let removeRecommendedEnabled = false;
let currentFontFamily = "";
let noAISetting = false;
let removeHashtagsEnabled = false;
let hashtagTextOriginals = new Map();
let introStyle = null;
let sidebarDisabledKeys = new Set();
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

function normalizeHomeColor(value) {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : "";
}

function parseComputedColor(value) {
  const match = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([0-9.]+))?\s*\)$/.exec(value || "");
  if (!match) return null;
  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
    a: match[4] === undefined ? 1 : Number(match[4])
  };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b]
    .map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0"))
    .join("")}`;
}

function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16)
  };
}

function opaqueBackgroundHex(element) {
  let node = element;
  while (node && node.nodeType === 1) {
    const color = parseComputedColor(getComputedStyle(node).backgroundColor);
    if (color && color.a >= 1) return rgbToHex(color);
    node = node.parentElement || (node.parentNode && node.parentNode.host) || null;
  }
  return "";
}

// YouTube uses translucent fills (for example rgba(0, 0, 0, 0.05) on the
// microphone button). Flatten them onto the nearest opaque ancestor so each
// swatch starts at the color the element actually displays.
function sampledColorHex(element, property) {
  const color = parseComputedColor(getComputedStyle(element)[property]);
  if (!color) return "";
  if (color.a >= 1) return rgbToHex(color);
  const backdrop = opaqueBackgroundHex(color.a <= 0 ? element : element.parentElement) || "#ffffff";
  if (color.a <= 0) return backdrop;
  const base = hexToRgb(backdrop);
  return rgbToHex({
    r: color.r * color.a + base.r * (1 - color.a),
    g: color.g * color.a + base.g * (1 - color.a),
    b: color.b * color.a + base.b * (1 - color.a)
  });
}

function applyHomeColors(colors) {
  const map = colors && typeof colors === "object" ? colors : {};
  currentHomeColors = map;
  const root = document.documentElement;
  let css = "";

  for (const [key, value] of Object.entries(map)) {
    const color = normalizeHomeColor(value);
    const rules = HOME_COLOR_RULES[key];
    if (!color || !rules) continue;
    for (const [selector, declaration] of rules) {
      css += `html[data-ytc-home-colors] ${selector}{${declaration}:${color} !important}\n`;
    }
    for (const [selector, declaration] of HOME_COLOR_STATIC_RULES[key] || []) {
      css += `html[data-ytc-home-colors] ${selector}{${declaration}}\n`;
    }
  }

  let style = document.getElementById(HOME_COLOR_STYLE_ID);
  if (!css || !isHomeFeed()) {
    style?.remove();
    delete root.dataset.ytcHomeColors;
    return;
  }
  if (!style) {
    style = document.createElement("style");
    style.id = HOME_COLOR_STYLE_ID;
    (document.head || root).append(style);
  }
  if (style.textContent !== css) style.textContent = css;
  root.dataset.ytcHomeColors = "1";
}

// Cards on the same flex line already share a height, but lines differ (ads
// with call-to-action rows are taller). When the card color is set, measure
// the natural heights and pin every card to the tallest so the filled
// rectangles match without touching the text or media inside them.
function syncHomeVideoHeight() {
  const root = document.documentElement;
  if (!isHomeFeed() || !normalizeHomeColor(currentHomeColors.video)) {
    root.style.removeProperty("--ytc-video-card-height");
    return;
  }

  root.style.removeProperty("--ytc-video-card-height");
  let tallest = 0;
  for (const item of document.querySelectorAll("ytd-rich-grid-renderer > #contents > ytd-rich-item-renderer")) {
    const height = item.getBoundingClientRect().height;
    if (height > tallest) tallest = height;
  }
  if (tallest > 0) root.style.setProperty("--ytc-video-card-height", `${Math.ceil(tallest)}px`);
}

let videoHeightTimer = 0;
function scheduleHomeVideoHeight() {
  if (videoHeightTimer) return;
  videoHeightTimer = setTimeout(() => {
    videoHeightTimer = 0;
    syncHomeVideoHeight();
  }, 150);
}

function applyHomeBackgroundImage(value) {
  currentHomeBackgroundImage = typeof value === "string" ? value : "";
  const root = document.documentElement;
  let style = document.getElementById(HOME_IMAGE_STYLE_ID);

  if (!currentHomeBackgroundImage.startsWith("data:image/") || !isHomeFeed()) {
    style?.remove();
    delete root.dataset.ytcHomeBg;
    return;
  }

  if (!style) {
    style = document.createElement("style");
    style.id = HOME_IMAGE_STYLE_ID;
    (document.head || root).append(style);
  }
  const css = `html[data-ytc-home-bg] ytd-app{` +
    `background-image:url("${currentHomeBackgroundImage}") !important;` +
    "background-size:cover !important;background-position:center !important;" +
    "background-attachment:fixed !important;background-repeat:no-repeat !important}\n";
  if (style.textContent !== css) style.textContent = css;
  root.dataset.ytcHomeBg = "1";
}

function sampleHomeColors() {
  const style = document.getElementById(HOME_COLOR_STYLE_ID);
  const sheet = style && style.sheet;
  const wasDisabled = Boolean(sheet && sheet.disabled);
  if (sheet) sheet.disabled = true;

  const colors = {};
  for (const [key, [selector, property]] of Object.entries(HOME_COLOR_SAMPLE_RULES)) {
    const element = document.querySelector(selector);
    if (!element) continue;
    const hex = sampledColorHex(element, property);
    if (hex) colors[key] = hex;
  }

  if (sheet) sheet.disabled = wasDisabled;
  return colors;
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

function askButtonTarget(node) {
  if (!node) return null;
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
  if (!matchesLabel && !matchesClass) return null;

  return node.closest("button-view-model") ||
    node.closest("button, ytd-button-renderer, tp-yt-paper-button, a[role='button'], [role='button']") ||
    node;
}

// Tag the masthead Ask entry point so the Home color rules can target it even
// though YouTube exposes it through text/aria labels rather than a stable id.
function markAskButtons() {
  if (!isHomeFeed()) return;
  const masthead = document.querySelector("ytd-masthead");
  if (!masthead) return;
  for (const node of masthead.querySelectorAll(NO_AI_CANDIDATE_SELECTOR)) {
    const target = askButtonTarget(node);
    if (target) target.classList.add(ASK_BUTTON_CLASS);
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
      const target = askButtonTarget(node);
      if (target) target.classList.add(NO_AI_CLASS);
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

function isSubscriptionsTitle(value) {
  return /^subscriptions$/i.test(normalizeSidebarText(value));
}

function isChannelEntry(entry) {
  return /^\/(?:@|channel\/)/i.test(sidebarEntryHref(entry));
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
        const subscriptions = isSubscriptionsTitle(title);
        const key = subscriptions
          ? "section:subscriptions"
          : uniqueSidebarKey(usedKeys, `section:${sidebarKeyText(title)}`);
        usedKeys.add(key);
        markSidebarElement(section, key);
        if (subscriptions) {
          for (const entry of section.querySelectorAll("ytd-guide-entry-renderer")) {
            if (entry.closest("ytd-guide-section-renderer") !== section) continue;
            markSidebarElement(entry, key);
          }
          addSidebarItem(tree, { key, title: "Subscriptions", children: [] });
        } else {
          addSidebarItem(tree, {
            key,
            title,
            children: collectSidebarEntries(section, key, usedKeys)
          });
        }
      } else {
        const nodes = Array.from(section.querySelectorAll("ytd-guide-entry-renderer, ytd-guide-collapsible-section-entry-renderer"))
          .filter((node) => node.closest("ytd-guide-section-renderer") === section)
          .filter((node) => !(node.matches("ytd-guide-entry-renderer") && node.closest("ytd-guide-collapsible-section-entry-renderer")))
          .filter((node) => !(node.matches("ytd-guide-collapsible-section-entry-renderer") && node.closest("ytd-guide-collapsible-section-entry-renderer") !== node));
        const directEntries = nodes.filter((node) => {
          if (!node.matches("ytd-guide-entry-renderer")) return false;
          const title = sidebarEntryTitle(node);
          return title && !/^show (?:more|less)$/i.test(title);
        });
        const subscriptionsCollapsible = nodes.find((node) =>
          node.matches("ytd-guide-collapsible-section-entry-renderer") && isSubscriptionsTitle(sidebarCollapsibleTitle(node))
        );
        const directChannels = directEntries.filter(isChannelEntry);
        const subscriptionsContext = Boolean(subscriptionsCollapsible) ||
          (directEntries.length > 0 && directChannels.length === directEntries.length);

        if (subscriptionsContext) {
          const key = "section:subscriptions";
          usedKeys.add(key);
          if (subscriptionsCollapsible) markSidebarElement(subscriptionsCollapsible, key);
          for (const entry of directChannels) markSidebarElement(entry, key);
          addSidebarItem(tree, { key, title: "Subscriptions", children: [] });
        }

        for (const node of nodes) {
          if (subscriptionsContext && (node === subscriptionsCollapsible || directChannels.includes(node))) continue;
          if (node.matches("ytd-guide-collapsible-section-entry-renderer")) {
            const title = sidebarCollapsibleTitle(node);
            if (!title) continue;
            const key = uniqueSidebarKey(usedKeys, `section:${sidebarKeyText(title)}`);
            markSidebarElement(node, key);
            addSidebarItem(tree, {
              key,
              title,
              children: /^subscriptions$/i.test(title) ? [] : collectCollapsibleEntries(node, key, usedKeys)
            });
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

    const subscriptions = isSubscriptionsTitle(title);
    const key = subscriptions
      ? "section:subscriptions"
      : uniqueSidebarKey(usedKeys, `section:${sidebarKeyText(title)}`);
    usedKeys.add(key);
    if (subscriptions) {
      addSidebarItem(tree, { key, title: "Subscriptions", children: [] });
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

function applySidebarDisabled() {
  for (const node of document.querySelectorAll(`[${SIDEBAR_KEY_ATTR}]`)) {
    const key = node.getAttribute(SIDEBAR_KEY_ATTR);
    node.classList.toggle(SIDEBAR_DISABLED_CLASS, sidebarDisabledKeys.has(key));
  }
}

function syncSidebar() {
  const domTree = buildSidebarTree();
  applySidebarDisabled();

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
  scheduleHomeVideoHeight();
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
    markAskButtons();
    applyHomeColors(currentHomeColors);
    applyHomeBackgroundImage(currentHomeBackgroundImage);
    scheduleHomeVideoHeight();
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
    markAskButtons();
    applyHomeColors(currentHomeColors);
    applyHomeBackgroundImage(currentHomeBackgroundImage);
    scheduleHomeVideoHeight();
    syncSidebar();
    syncDislikes();
    applyRemoveHashtags(removeHashtagsEnabled);
    if (removeRecommendedEnabled) window.dispatchEvent(new Event("resize"));
  });
}


function loadLocalSettings() {
  globalThis.chrome?.storage?.local?.get({ customFonts: [], sidebarDisabled: [], homeBackgroundImage: "" }, (data) => {
    injectCustomFonts(data.customFonts);
    sidebarDisabledKeys = new Set(Array.isArray(data.sidebarDisabled) ? data.sidebarDisabled.filter((key) => typeof key === "string") : []);
    applyHomeBackgroundImage(data.homeBackgroundImage);
    syncSidebar();
  });
}

function applySyncSettings(settings) {
  applyVideosPerRow(settings.videosPerRow);
  applyUiRadius(settings.uiRadius);
  applyHoverHighlights(settings.hoverHighlights);
  applyFontFamily(settings.fontFamily);
  applyHomeColors(settings.homeColors);
  applyNoAI(settings.noAI);
  applyAddDislikes(settings.addDislikes !== false);
  applyRemoveHashtags(settings.removeHashtags);
  applyRemoveRecommended(settings.removeRecommended);
}

function loadSyncSettings() {
  globalThis.chrome?.storage?.sync?.get({ videosPerRow: DEFAULT_VIDEOS_PER_ROW, uiRadius: DEFAULT_UI_RADIUS, noAI: false, hoverHighlights: true, addDislikes: true, fontFamily: "", removeHashtags: false, removeRecommended: false, homeColors: {} }, applySyncSettings);
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
window.addEventListener("resize", scheduleHomeVideoHeight);

// The popup pings this listener; a missed response means this content script
// belongs to a dead extension context and the popup refreshes the tab.
if (!globalThis.__ytcMessageListener) {
  globalThis.__ytcMessageListener = true;
  globalThis.chrome?.runtime?.onMessage?.addListener((message, sender, sendResponse) => {
    if (message?.type === "ytc-sample-home-colors") {
      sendResponse({ colors: sampleHomeColors() });
      return false;
    }
    if (message?.type === "ytc-apply-sidebar") {
      const keys = Array.isArray(message.keys) ? message.keys.filter((key) => typeof key === "string") : [];
      sidebarDisabledKeys = new Set(keys);
      applySidebarDisabled();
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
    if (changes.sidebarDisabled) {
      sidebarDisabledKeys = new Set(Array.isArray(changes.sidebarDisabled.newValue) ? changes.sidebarDisabled.newValue.filter((key) => typeof key === "string") : []);
      applySidebarDisabled();
    }
    if (changes.homeBackgroundImage) applyHomeBackgroundImage(changes.homeBackgroundImage.newValue);
    return;
  }
  if (area !== "sync") return;
  if (changes.videosPerRow) applyVideosPerRow(changes.videosPerRow.newValue);
  if (changes.uiRadius) applyUiRadius(changes.uiRadius.newValue);
  if (changes.hoverHighlights) applyHoverHighlights(changes.hoverHighlights.newValue);
  if (changes.fontFamily) applyFontFamily(changes.fontFamily.newValue);
  if (changes.homeColors) {
    applyHomeColors(changes.homeColors.newValue);
    scheduleHomeVideoHeight();
  }
  if (changes.noAI) applyNoAI(changes.noAI.newValue);
  if (changes.removeHashtags) applyRemoveHashtags(changes.removeHashtags.newValue);
  if (changes.removeRecommended) applyRemoveRecommended(changes.removeRecommended.newValue);
  if (changes.addDislikes) applyAddDislikes(changes.addDislikes.newValue);
});

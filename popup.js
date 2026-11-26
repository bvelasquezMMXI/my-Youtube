const categoryTabs = Array.from(document.querySelectorAll(".sidebar [role=\"tab\"]"));
const subtabList = document.getElementById("subtabs");
const panel = document.getElementById("panel");
const panelEmpty = document.getElementById("panel-empty");
const videosPerRow = document.getElementById("videos-per-row");
const rowNumber = document.getElementById("videos-per-row-number");
const rowRange = document.getElementById("videos-per-row-range");
const cornerOption = document.getElementById("ui-corner-radii");
const cornerNumber = document.getElementById("ui-corner-radii-number");
const cornerRange = document.getElementById("ui-corner-radii-range");
const noAIOption = document.getElementById("no-ai");
const noAICheckbox = document.getElementById("no-ai-checkbox");
const hoverOption = document.getElementById("hover-highlights");
const hoverCheckbox = document.getElementById("hover-highlights-checkbox");
const fontOption = document.getElementById("font-family");
const fontSelect = document.getElementById("font-family-select");
const fontUpload = document.getElementById("font-upload");
const fontFile = document.getElementById("font-file");
const sidebarOptions = document.getElementById("sidebar-options");
const sidebarTree = document.getElementById("sidebar-tree");
const sidebarEmpty = document.getElementById("sidebar-empty");
const addDislikesOption = document.getElementById("add-dislikes");
const addDislikesCheckbox = document.getElementById("add-dislikes-checkbox");
const removeHashtagsOption = document.getElementById("remove-hashtags");
const removeHashtagsCheckbox = document.getElementById("remove-hashtags-checkbox");
const noRecommendedOption = document.getElementById("no-recommended");
const noRecommendedCheckbox = document.getElementById("no-recommended-checkbox");
const themePresetsPanel = document.getElementById("theme-presets");
const presetList = document.getElementById("preset-list");
const themeHomeColors = document.getElementById("theme-home-colors");
const themeHomeTree = document.getElementById("theme-home-tree");
const themeHomeReset = document.getElementById("theme-home-reset");
const themeBgImageButton = document.getElementById("theme-bg-image-button");
const themeBgImageRemove = document.getElementById("theme-bg-image-remove");
const themeBgImageFile = document.getElementById("theme-bg-image-file");
const themeBgImagePreview = document.getElementById("theme-bg-image-preview");

const homeColorSpec = [
  {
    key: "searchBar",
    label: "Search bar",
    fallback: "#ffffff",
    children: [{ key: "searchBar.text", label: "Text color", fallback: "#0f0f0f" }]
  },
  {
    key: "searchButton",
    label: "Search button",
    fallback: "#f8f8f8",
    children: [{ key: "searchButton.decal", label: "Decal color", fallback: "#0f0f0f" }]
  },
  {
    key: "askButton",
    label: "Ask YouTube button",
    fallback: "#ffffff",
    requiresAsk: true,
    children: [{ key: "askButton.text", label: "Text color", fallback: "#0f0f0f" }]
  },
  {
    key: "micButton",
    label: "Microphone button",
    fallback: "#f2f2f2",
    children: [{ key: "micButton.decal", label: "Microphone decal color", fallback: "#0f0f0f" }]
  },
  {
    key: "createButton",
    label: "Create button",
    fallback: "#f2f2f2",
    children: [{ key: "createButton.text", label: "Text color", fallback: "#0f0f0f" }]
  },
  {
    key: "notificationBell",
    label: "Notification bell",
    fallback: "#f2f2f2",
    children: [{ key: "notificationBell.icon", label: "Bell color", fallback: "#0f0f0f" }]
  },
  { key: "logoText", label: "YouTube logo text", fallback: "#0f0f0f" },
  {
    key: "filterBar",
    label: "Filter bar",
    fallback: "#ffffff",
    children: [
      {
        key: "filterBar.options",
        label: "Options",
        fallback: "#f2f2f2",
        children: [
          { key: "filterBar.options.text", label: "Text color", fallback: "#0f0f0f" },
          { key: "filterBar.options.selected", label: "Selected color", fallback: "#0f0f0f" },
          { key: "filterBar.options.selectedText", label: "Selected text color", fallback: "#f1f1f1" }
        ]
      }
    ]
  },
  {
    key: "video",
    label: "Video",
    fallback: "#ffffff",
    children: [
      { key: "video.title", label: "Title color", fallback: "#0f0f0f" },
      { key: "video.meta", label: "Stats/channel name text color", fallback: "#606060" },
      {
        key: "video.length",
        label: "Length badge color",
        fallback: "#000000",
        children: [{ key: "video.length.text", label: "Text color", fallback: "#ffffff" }]
      }
    ]
  },
  { key: "pageBackground", label: "Page background", fallback: "#ffffff" },
  {
    key: "sidebar",
    label: "Sidebar",
    fallback: "#ffffff",
    children: [
      { key: "sidebar.text", label: "Text color", fallback: "#0f0f0f" },
      { key: "sidebar.sectionTitle", label: "Section title color", fallback: "#0f0f0f" },
      { key: "sidebar.icon", label: "Icon color", fallback: "#0f0f0f" },
      { key: "sidebar.selected", label: "Selected item color", fallback: "#f2f2f2" },
      { key: "sidebar.divider", label: "Divider color", fallback: "#cccccc" }
    ]
  }
];

const themePresets = [
  {
    id: "midnight-black",
    name: "Midnight Black",
    colors: {
      pageBackground: "#050507",
      sidebar: "#0a1222",
      "sidebar.text": "#ffffff",
      "sidebar.sectionTitle": "#ffffff",
      "sidebar.icon": "#9fb4e0",
      "sidebar.selected": "#16264a",
      "sidebar.divider": "#1b2a49",
      searchBar: "#0d1730",
      "searchBar.text": "#ffffff",
      searchButton: "#101c3a",
      "searchButton.decal": "#ffffff",
      askButton: "#101c3a",
      "askButton.text": "#ffffff",
      micButton: "#101c3a",
      "micButton.decal": "#ffffff",
      createButton: "#101c3a",
      "createButton.text": "#ffffff",
      logoText: "#ffffff",
      notificationBell: "#101c3a",
      "notificationBell.icon": "#ffffff",
      filterBar: "#080d19",
      "filterBar.options": "#0d1730",
      "filterBar.options.text": "#ffffff",
      "filterBar.options.selected": "#1b3260",
      "filterBar.options.selectedText": "#ffffff",
      video: "#070b14",
      "video.title": "#ffffff",
      "video.meta": "#aebbd6",
      "video.length": "#0b1428",
      "video.length.text": "#ffffff"
    }
  }
];

const homeColorState = Object.create(null);
let homeColorSamples = Object.create(null);
let homeColorSamplesRequested = false;
let homeBackgroundImage = "";
let homeColorsDirty = false;

function normalizeHexColor(value) {
  const text = typeof value === "string" ? value.trim() : "";
  return /^#[0-9a-f]{6}$/i.test(text) ? text.toLowerCase() : "";
}

function parseHexInput(value) {
  const text = typeof value === "string" ? value.trim().replace(/^#/, "") : "";
  return /^[0-9a-f]{6}$/i.test(text) ? `#${text.toLowerCase()}` : "";
}

function homeColorValue(node) {
  return normalizeHexColor(homeColorState[node.key]) ||
    normalizeHexColor(homeColorSamples[node.key]) ||
    node.fallback;
}

function saveHomeColors() {
  homeColorsDirty = false;
  const colors = {};
  for (const [key, value] of Object.entries(homeColorState)) {
    const hex = normalizeHexColor(value);
    if (hex) colors[key] = hex;
  }
  saveSync({ homeColors: colors });
}

function flushHomeColors() {
  if (homeColorsDirty) saveHomeColors();
}

window.addEventListener("pagehide", flushHomeColors);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") flushHomeColors();
});

function renderHomeColors() {
  themeHomeTree.replaceChildren();
  themeHomeReset.disabled = Object.keys(homeColorState).length === 0;
  const addRow = (node, depth, isLast) => {
    if (node.requiresAsk && noAICheckbox.checked) return;

    const row = document.createElement("div");
    row.className = "color-row";
    if (depth) {
      row.classList.add("color-row-child");
      if (isLast) row.classList.add("color-row-last");
      row.style.paddingLeft = `${depth * 12}px`;
      row.style.setProperty("--ytc-color-line-left", `${(depth - 1) * 12 + 4}px`);
    }

    const label = document.createElement("span");
    label.className = "color-label";
    label.textContent = node.label;

    const initialColor = homeColorValue(node);
    const swatch = document.createElement("input");
    swatch.type = "color";
    swatch.className = "color-swatch";
    swatch.value = initialColor;
    swatch.title = `${node.label} color`;
    swatch.setAttribute("aria-label", `${node.label} color picker`);

    const hexInput = document.createElement("input");
    hexInput.type = "text";
    hexInput.className = "color-hex";
    hexInput.value = initialColor.toUpperCase();
    hexInput.maxLength = 7;
    hexInput.spellcheck = false;
    hexInput.autocomplete = "off";
    hexInput.title = `${node.label} hex color`;
    hexInput.setAttribute("aria-label", `${node.label} hex color`);

    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "color-reset";
    reset.textContent = "\u21ba";
    reset.title = `Restore YouTube's ${node.label} color`;
    reset.setAttribute("aria-label", `Restore YouTube's ${node.label} color`);
    reset.hidden = !normalizeHexColor(homeColorState[node.key]);

    let saveTimer = 0;
    const queueSave = () => {
      homeColorsDirty = true;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(saveHomeColors, 700);
    };
    const commitColor = (color) => {
      const normalized = normalizeHexColor(color);
      if (!normalized) return "";
      homeColorState[node.key] = normalized;
      reset.hidden = false;
      return normalized;
    };

    swatch.addEventListener("input", () => {
      const normalized = commitColor(swatch.value);
      if (normalized) hexInput.value = normalized.toUpperCase();
      queueSave();
    });

    swatch.addEventListener("change", () => {
      clearTimeout(saveTimer);
      const normalized = commitColor(swatch.value);
      if (normalized) hexInput.value = normalized.toUpperCase();
      saveHomeColors();
    });

    hexInput.addEventListener("input", () => {
      const normalized = commitColor(parseHexInput(hexInput.value));
      if (!normalized) return;
      swatch.value = normalized;
      queueSave();
    });

    hexInput.addEventListener("change", () => {
      clearTimeout(saveTimer);
      const normalized = commitColor(parseHexInput(hexInput.value));
      if (!normalized) {
        hexInput.value = swatch.value.toUpperCase();
        return;
      }
      hexInput.value = normalized.toUpperCase();
      swatch.value = normalized;
      saveHomeColors();
    });

    reset.addEventListener("click", () => {
      clearTimeout(saveTimer);
      delete homeColorState[node.key];
      const restored = normalizeHexColor(homeColorSamples[node.key]) || node.fallback;
      swatch.value = restored;
      hexInput.value = restored.toUpperCase();
      reset.hidden = true;
      saveHomeColors();
    });

    row.append(label, swatch, hexInput, reset);
    themeHomeTree.append(row);

    const children = (node.children || []).filter((child) =>
      !(child.requiresAsk && noAICheckbox.checked)
    );
    children.forEach((child, index) => addRow(child, depth + 1, index === children.length - 1));
  };

  for (const node of homeColorSpec) addRow(node, 0, false);
}

themeHomeReset.addEventListener("click", () => {
  if (!Object.keys(homeColorState).length) return;
  for (const key of Object.keys(homeColorState)) delete homeColorState[key];
  renderHomeColors();
  saveHomeColors();
});

function renderHomeBackgroundImage() {
  const set = typeof homeBackgroundImage === "string" && homeBackgroundImage.startsWith("data:image/");
  themeBgImageButton.textContent = set ? "Change image" : "Choose image";
  themeBgImageRemove.hidden = !set;
  themeBgImagePreview.hidden = !set;
  themeBgImagePreview.style.backgroundImage = set ? `url("${homeBackgroundImage}")` : "";
}

themeBgImageButton.addEventListener("click", () => themeBgImageFile.click());

themeBgImageFile.addEventListener("change", () => {
  const file = themeBgImageFile.files && themeBgImageFile.files[0];
  themeBgImageFile.value = "";
  if (!file || !/^image\//i.test(file.type)) return;

  const reader = new FileReader();
  reader.onerror = () => {
    themeBgImageButton.textContent = "Read error";
  };
  reader.onload = () => {
    const dataUrl = typeof reader.result === "string" ? reader.result : "";
    if (!dataUrl.startsWith("data:image/")) return;
    homeBackgroundImage = dataUrl;
    renderHomeBackgroundImage();
    localStore?.set({ homeBackgroundImage: dataUrl });
  };
  reader.readAsDataURL(file);
});

themeBgImageRemove.addEventListener("click", () => {
  homeBackgroundImage = "";
  renderHomeBackgroundImage();
  localStore?.set({ homeBackgroundImage: "" });
});

renderHomeBackgroundImage();

function applyPreset(preset) {
  for (const key of Object.keys(homeColorState)) delete homeColorState[key];
  for (const [key, value] of Object.entries(preset.colors)) {
    const hex = normalizeHexColor(value);
    if (hex) homeColorState[key] = hex;
  }
  renderHomeColors();
  saveHomeColors();
}

function renderPresets() {
  presetList.replaceChildren();

  for (const preset of themePresets) {
    const row = document.createElement("div");
    row.className = "preset-row";

    const name = document.createElement("span");
    name.className = "preset-name";
    name.textContent = preset.name;

    const swatches = document.createElement("span");
    swatches.className = "preset-swatches";
    for (const key of ["pageBackground", "sidebar", "filterBar.options.selected"]) {
      const swatch = document.createElement("span");
      swatch.className = "preset-swatch";
      swatch.style.backgroundColor = preset.colors[key] || "#000000";
      swatches.append(swatch);
    }

    const apply = document.createElement("button");
    apply.type = "button";
    apply.className = "preset-apply";
    apply.textContent = "Apply";
    apply.addEventListener("click", () => {
      applyPreset(preset);
      apply.textContent = "Applied";
      setTimeout(() => {
        apply.textContent = "Apply";
      }, 1200);
    });

    row.append(name, swatches, apply);
    presetList.append(row);
  }
}

function requestHomeColorSamples() {
  if (homeColorSamplesRequested) return;
  const tabs = globalThis.chrome?.tabs;
  if (!tabs?.query || !tabs?.sendMessage) return;

  tabs.query({}, (result) => {
    const candidates = (result || []).filter((tab) =>
      tab && typeof tab.id === "number" && !tab.discarded && typeof tab.url === "string" && /youtube\.com\//i.test(tab.url)
    );
    const isHome = (tab) => {
      try {
        return new URL(tab.url).pathname === "/";
      } catch (error) {
        return false;
      }
    };
    const tab = candidates.find(isHome) || candidates[0];
    if (!tab) return;

    tabs.sendMessage(tab.id, { type: "ytc-sample-home-colors" }, (response) => {
      void globalThis.chrome?.runtime?.lastError;
      const colors = response && response.colors;
      if (!colors || typeof colors !== "object") return;
      homeColorSamples = colors;
      homeColorSamplesRequested = true;
      renderHomeColors();
    });
  });
}

const syncStorage = globalThis.chrome?.storage?.sync;
const localStore = globalThis.chrome?.storage?.local;
let sidebarItems = [];
let sidebarDisabled = new Set();

let lastYouTubePing = 0;
let lastYouTubeReload = 0;

function ensureYouTubeTab() {
  const chromeApi = globalThis.chrome;
  const tabs = chromeApi?.tabs;
  if (!tabs?.query || !tabs?.sendMessage) return;

  const now = Date.now();
  if (now - lastYouTubePing < 2000) return;
  lastYouTubePing = now;

  tabs.query({ active: true, currentWindow: true }, (result) => {
    const tab = result && result[0];
    if (!tab || typeof tab.id !== "number" || typeof tab.url !== "string") return;
    if (!/^https?:\/\/(?:[^/]+\.)?youtube\.com\//i.test(tab.url)) return;

    tabs.sendMessage(tab.id, { type: "ytc-ping" }, (response) => {
      if (!chromeApi.runtime?.lastError && response?.ok) return;
      if (Date.now() - lastYouTubeReload < 5000) return;
      lastYouTubeReload = Date.now();
      tabs.reload(tab.id, () => {
        void chromeApi.runtime?.lastError;
      });
    });
  });
}

const sidebarTabReloads = new Map();

function pushSidebarState(keys) {
  const chromeApi = globalThis.chrome;
  const tabs = chromeApi?.tabs;
  if (!tabs?.query || !tabs?.sendMessage) return;

  tabs.query({ url: "*://*.youtube.com/*" }, (result) => {
    for (const tab of result || []) {
      if (!tab || typeof tab.id !== "number" || tab.discarded) continue;
      let settled = false;
      const reloadTab = () => {
        const now = Date.now();
        if (now - (sidebarTabReloads.get(tab.id) || 0) < 5000) return;
        sidebarTabReloads.set(tab.id, now);
        tabs.reload(tab.id, () => {
          void chromeApi.runtime?.lastError;
        });
      };
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        reloadTab();
      }, 1200);
      tabs.sendMessage(tab.id, { type: "ytc-apply-sidebar", keys }, (response) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (chromeApi.runtime?.lastError || !response?.ok) reloadTab();
      });
    }
  });
}

function saveSync(values) {
  ensureYouTubeTab();
  syncStorage?.set(values);
}

function clampRowValue(value) {
  const min = Number(rowRange.min);
  const max = Number(rowRange.max);
  return Math.min(max, Math.max(min, Math.round(value)));
}

function clampCornerValue(value) {
  const min = Number(cornerRange.min);
  const max = Number(cornerRange.max);
  return Math.min(max, Math.max(min, Math.round(value)));
}

function cacheAndReload(value) {
  const tabs = globalThis.chrome?.tabs;
  if (!tabs?.query || !tabs?.reload) return;

  tabs.query({ active: true, currentWindow: true }, (result) => {
    const tab = result && result[0];
    if (!tab || typeof tab.id !== "number" || typeof tab.url !== "string" || !tab.url.includes("youtube.com/")) return;

    const scripting = globalThis.chrome?.scripting;
    if (scripting?.executeScript) {
      scripting.executeScript({
        target: { tabId: tab.id },
        func: (key, count) => {
          try {
            localStorage.setItem(key, String(count));
          } catch (error) {
            // Ignore restricted pages; the content script still handles storage sync.
          }
        },
        args: ["ytc-videos-per-row", value]
      }, () => {
        void globalThis.chrome?.runtime?.lastError;
        tabs.reload(tab.id);
      });
    } else {
      setTimeout(() => tabs.reload(tab.id), 150);
    }
  });
}

function saveVideosPerRow() {
  if (!syncStorage) return;
  const value = Number(rowRange.value);
  syncStorage.set({ videosPerRow: value }, () => cacheAndReload(value));
}

function saveUiRadius() {
  saveSync({ uiRadius: Number(cornerRange.value) });
}

function customFontValue(font) {
  return `"YTCustom-${font.id}", sans-serif`;
}

function addCustomFontOption(font) {
  if (!font || typeof font.id !== "string") return;
  const value = customFontValue(font);
  if (Array.from(fontSelect.options).some((option) => option.value === value)) return;
  fontSelect.add(new Option(font.name || "Custom font", value));
}

function appendCustomFonts(fonts) {
  for (const font of Array.isArray(fonts) ? fonts : []) addCustomFontOption(font);
}

function renderSidebarTree() {
  sidebarTree.replaceChildren();
  if (!sidebarItems.length) {
    sidebarTree.hidden = true;
    sidebarEmpty.hidden = false;
    sidebarEmpty.textContent = "No sidebar items detected. Open a YouTube tab.";
    return;
  }

  sidebarTree.hidden = false;
  sidebarEmpty.hidden = true;

  const addRow = (item, depth, isLast) => {
    if (!item || typeof item.key !== "string" || !item.title) return;
    const row = document.createElement("label");
    row.className = depth ? "sidebar-row sidebar-row-child" : "sidebar-row";
    if (depth && isLast) row.classList.add("sidebar-row-last");
    if (depth) {
      row.style.paddingLeft = `${depth * 16}px`;
      row.style.setProperty("--ytc-line-left", `${(depth - 1) * 16 + 4}px`);
    }
    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = "option-check";
    input.checked = !sidebarDisabled.has(item.key);
    input.addEventListener("change", () => {
      if (input.checked) sidebarDisabled.delete(item.key);
      else sidebarDisabled.add(item.key);
      const keys = Array.from(sidebarDisabled);
      localStore?.set({ sidebarDisabled: keys });
      pushSidebarState(keys);
      renderSidebarTree();
    });
    const text = document.createElement("span");
    text.textContent = item.title;
    row.append(input, text);
    sidebarTree.append(row);

    if (!input.checked) return;

    const children = Array.isArray(item.children) ? item.children : [];
    children.forEach((child, index) => addRow(child, depth + 1, index === children.length - 1));
  };

  for (const item of sidebarItems) addRow(item, 0, false);
}

function applySettings(settings) {
  const value = clampRowValue(settings.videosPerRow);
  rowNumber.value = String(value);
  rowRange.value = String(value);
  const radius = clampCornerValue(settings.uiRadius);
  cornerNumber.value = String(radius);
  cornerRange.value = String(radius);
  noAICheckbox.checked = Boolean(settings.noAI);
  hoverCheckbox.checked = settings.hoverHighlights !== false;
  addDislikesCheckbox.checked = settings.addDislikes !== false;
  removeHashtagsCheckbox.checked = Boolean(settings.removeHashtags);
  noRecommendedCheckbox.checked = Boolean(settings.removeRecommended);
  fontSelect.value = settings.fontFamily || "";
  if (fontSelect.selectedIndex === -1) fontSelect.value = "";

  for (const key of Object.keys(homeColorState)) delete homeColorState[key];
  for (const [key, value] of Object.entries(settings.homeColors || {})) {
    const hex = normalizeHexColor(value);
    if (hex) homeColorState[key] = hex;
  }
  renderHomeColors();
}

const settingsDefaults = {
  videosPerRow: Number(rowRange.value),
  uiRadius: Number(cornerRange.value),
  noAI: false,
  hoverHighlights: true,
  addDislikes: true,
  removeHashtags: false,
  removeRecommended: false,
  fontFamily: "",
  homeColors: {}
};

renderSidebarTree();

if (localStore?.get) {
  localStore.get({ customFonts: [], sidebarTree: [], sidebarDisabled: [], homeBackgroundImage: "" }, (local) => {
    appendCustomFonts(local.customFonts);
    sidebarItems = Array.isArray(local.sidebarTree) ? local.sidebarTree : [];
    sidebarDisabled = new Set(Array.isArray(local.sidebarDisabled) ? local.sidebarDisabled.filter((key) => typeof key === "string") : []);
    homeBackgroundImage = typeof local.homeBackgroundImage === "string" ? local.homeBackgroundImage : "";
    renderSidebarTree();
    renderHomeBackgroundImage();
  });
}

syncStorage?.get(settingsDefaults, applySettings);

globalThis.chrome?.storage?.onChanged?.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes.sidebarTree) {
    sidebarItems = Array.isArray(changes.sidebarTree.newValue) ? changes.sidebarTree.newValue : [];
    renderSidebarTree();
  }
  if (changes.sidebarDisabled) {
    sidebarDisabled = new Set(Array.isArray(changes.sidebarDisabled.newValue) ? changes.sidebarDisabled.newValue.filter((key) => typeof key === "string") : []);
    renderSidebarTree();
  }
});

function resetUploadLabel() {
  fontUpload.textContent = "Upload";
}

fontUpload.addEventListener("click", () => fontFile.click());

fontFile.addEventListener("change", () => {
  const file = fontFile.files && fontFile.files[0];
  fontFile.value = "";
  if (!file) return;

  const extension = file.name.split(".").pop().toLowerCase();
  const formats = { woff2: "woff2", woff: "woff", ttf: "truetype", otf: "opentype" };
  const format = formats[extension];
  if (!format || !file.size) {
    fontUpload.textContent = "Bad file";
    setTimeout(resetUploadLabel, 1500);
    return;
  }
  if (!localStore?.get || !localStore?.set) {
    fontUpload.textContent = "Unavailable";
    setTimeout(resetUploadLabel, 1500);
    return;
  }

  const reader = new FileReader();
  reader.onerror = () => {
    fontUpload.textContent = "Read error";
    setTimeout(resetUploadLabel, 1500);
  };
  reader.onload = () => {
    const rawDataUrl = typeof reader.result === "string" ? reader.result : "";
    if (!rawDataUrl) {
      fontUpload.textContent = "Read error";
      setTimeout(resetUploadLabel, 1500);
      return;
    }

    const comma = rawDataUrl.indexOf(",");
    const mime = extension === "ttf" ? "font/ttf" : extension === "otf" ? "font/otf" : `font/${extension}`;
    const dataUrl = comma === -1 ? rawDataUrl : `data:${mime};base64,${rawDataUrl.slice(comma + 1)}`;
    const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const name = file.name.replace(/\.[^.]+$/, "").trim() || "Custom font";
    fontUpload.textContent = "Adding...";

    localStore.get({ customFonts: [] }, (local) => {
      const existing = Array.isArray(local.customFonts) ? local.customFonts : [];
      const customFonts = existing.concat({ id, name, dataUrl, format });
      localStore.set({ customFonts }, () => {
        if (globalThis.chrome?.runtime?.lastError) {
          fontUpload.textContent = "Too large";
          setTimeout(resetUploadLabel, 1500);
          return;
        }
        const font = { id, name, dataUrl, format };
        addCustomFontOption(font);
        fontSelect.value = customFontValue(font);
        saveSync({ fontFamily: customFontValue(font) });
        fontUpload.textContent = "Added";
        setTimeout(resetUploadLabel, 1200);
      });
    });
  };
  reader.readAsDataURL(file);
});

noAICheckbox.addEventListener("change", () => {
  saveSync({ noAI: noAICheckbox.checked });
  renderHomeColors();
});

hoverCheckbox.addEventListener("change", () => {
  saveSync({ hoverHighlights: hoverCheckbox.checked });
});

addDislikesCheckbox.addEventListener("change", () => {
  saveSync({ addDislikes: addDislikesCheckbox.checked });
});

removeHashtagsCheckbox.addEventListener("change", () => {
  saveSync({ removeHashtags: removeHashtagsCheckbox.checked });
});

noRecommendedCheckbox.addEventListener("change", () => {
  saveSync({ removeRecommended: noRecommendedCheckbox.checked });
});

fontSelect.addEventListener("change", () => {
  saveSync({ fontFamily: fontSelect.value });
});

cornerRange.addEventListener("input", () => {
  cornerNumber.value = cornerRange.value;
});

cornerRange.addEventListener("change", saveUiRadius);

cornerNumber.addEventListener("input", () => {
  if (cornerNumber.value === "") return;
  const value = Number(cornerNumber.value);
  if (!Number.isFinite(value)) return;
  cornerRange.value = String(clampCornerValue(value));
});

cornerNumber.addEventListener("change", () => {
  const parsed = cornerNumber.value === "" ? NaN : Number(cornerNumber.value);
  const value = Number.isFinite(parsed) ? clampCornerValue(parsed) : Number(cornerRange.value);
  cornerNumber.value = String(value);
  cornerRange.value = String(value);
  saveUiRadius();
});

rowRange.addEventListener("input", () => {
  rowNumber.value = rowRange.value;
});

rowRange.addEventListener("change", saveVideosPerRow);

rowNumber.addEventListener("input", () => {
  if (rowNumber.value === "") return;
  const value = Number(rowNumber.value);
  if (!Number.isFinite(value)) return;
  rowRange.value = String(clampRowValue(value));
});

rowNumber.addEventListener("change", () => {
  const parsed = rowNumber.value === "" ? NaN : Number(rowNumber.value);
  const value = Number.isFinite(parsed) ? clampRowValue(parsed) : Number(rowRange.value);
  rowNumber.value = String(value);
  rowRange.value = String(value);
  saveVideosPerRow();
});

function selectSubtab(tab) {
  for (const candidate of subtabList.querySelectorAll('[role="tab"]')) {
    const selected = candidate === tab;
    candidate.setAttribute("aria-selected", String(selected));
    candidate.tabIndex = selected ? 0 : -1;
  }
  panel.setAttribute("aria-labelledby", tab.id);
  panelEmpty.textContent = `No ${tab.textContent} settings yet.`;

  const onHome = tab.dataset.category === "tab-home";
  const onPlayer = tab.dataset.category === "tab-player";
  const onThemes = tab.dataset.category === "tab-themes";
  const hasMainOptions = onHome && tab.dataset.label === "Main";
  const hasSidebarOptions = onHome && tab.dataset.label === "Sidebar";
  const hasPlayerMainOptions = onPlayer && tab.dataset.label === "Main";
  const hasThemeHomeColors = onThemes && tab.dataset.label === "Home";
  const hasThemePresets = onThemes && tab.dataset.label === "Presets";
  videosPerRow.hidden = !hasMainOptions;
  cornerOption.hidden = !hasMainOptions;
  noAIOption.hidden = !hasMainOptions;
  hoverOption.hidden = !hasMainOptions;
  fontOption.hidden = !hasMainOptions;
  sidebarOptions.hidden = !hasSidebarOptions;
  addDislikesOption.hidden = !hasPlayerMainOptions;
  removeHashtagsOption.hidden = !hasPlayerMainOptions;
  noRecommendedOption.hidden = !hasPlayerMainOptions;
  themeHomeColors.hidden = !hasThemeHomeColors;
  themePresetsPanel.hidden = !hasThemePresets;
  panelEmpty.hidden = hasMainOptions || hasSidebarOptions || hasPlayerMainOptions || hasThemeHomeColors || hasThemePresets;
  if (hasSidebarOptions) renderSidebarTree();
  if (hasThemePresets) renderPresets();
  if (hasThemeHomeColors) {
    renderHomeColors();
    requestHomeColorSamples();
  }
}

function renderSubtabs(category) {
  const labels = (category.dataset.subtabs || "").split("|").filter(Boolean);
  subtabList.replaceChildren();

  if (!labels.length) {
    subtabList.hidden = true;
    for (const option of panel.querySelectorAll(":scope > .option, :scope > #sidebar-options")) {
      option.hidden = true;
    }
    panel.setAttribute("aria-labelledby", category.id);
    panelEmpty.textContent = `No ${category.textContent} settings yet.`;
    panelEmpty.hidden = false;
    return;
  }

  subtabList.hidden = false;
  subtabList.setAttribute("aria-label", `${category.textContent} options`);

  labels.forEach((label, index) => {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "subtab";
    tab.id = `subtab-${category.id}-${index}`;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", "panel");
    tab.setAttribute("aria-selected", String(index === 0));
    tab.tabIndex = index === 0 ? 0 : -1;
    tab.dataset.category = category.id;
    tab.dataset.label = label;
    tab.textContent = label;
    tab.addEventListener("click", () => selectSubtab(tab));
    subtabList.append(tab);
  });

  selectSubtab(subtabList.firstElementChild);
}

function selectCategory(category) {
  for (const candidate of categoryTabs) {
    const selected = candidate === category;
    candidate.setAttribute("aria-selected", String(selected));
    candidate.tabIndex = selected ? 0 : -1;
  }
  renderSubtabs(category);
}

function moveFocus(items, event) {
  const index = items.indexOf(document.activeElement);
  if (index === -1) return;

  let next;
  switch (event.key) {
    case "ArrowDown":
    case "ArrowRight":
      next = (index + 1) % items.length;
      break;
    case "ArrowUp":
    case "ArrowLeft":
      next = (index - 1 + items.length) % items.length;
      break;
    case "Home":
      next = 0;
      break;
    case "End":
      next = items.length - 1;
      break;
    default:
      return;
  }

  event.preventDefault();
  items[next].focus();
  items[next].click();
}

for (const tab of categoryTabs) {
  tab.addEventListener("click", () => selectCategory(tab));
}

document.querySelector(".sidebar").addEventListener("keydown", (event) => {
  moveFocus(categoryTabs, event);
});

subtabList.addEventListener("keydown", (event) => {
  moveFocus(Array.from(subtabList.querySelectorAll('[role="tab"]')), event);
});

selectCategory(categoryTabs[0]);



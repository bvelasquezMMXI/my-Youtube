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
const colorScopes = [
  {
    prefix: "home",
    label: "Home",
    option: document.getElementById("home-colors"),
    checkbox: document.getElementById("home-colors-checkbox"),
    suboptions: document.getElementById("home-color-options"),
    fields: [
      { key: "text", label: "Text", fallback: "#0f0f0f" },
      { key: "background", label: "Background", fallback: "#ffffff" },
      { key: "header", label: "Header", fallback: "#ffffff" },
      { key: "guide", label: "Guide", fallback: "#ffffff" },
      { key: "cards", label: "Cards", fallback: "#ffffff" },
      { key: "search", label: "Search bar", fallback: "#ffffff" },
      { key: "searchText", label: "Search bar text", fallback: "#0f0f0f" },
      { key: "categories", label: "Categories", fallback: "#ffffff" },
      { key: "categoryArrows", label: "Next/back buttons", fallback: "#ffffff" }
    ]
  },
  {
    prefix: "player",
    label: "Player",
    option: document.getElementById("player-colors"),
    checkbox: document.getElementById("player-colors-checkbox"),
    suboptions: document.getElementById("player-color-options"),
    fields: [
      { key: "text", label: "Text", fallback: "#0f0f0f" },
      { key: "background", label: "Background", fallback: "#ffffff" },
      { key: "header", label: "Header", fallback: "#ffffff" },
      { key: "guide", label: "Guide", fallback: "#ffffff" },
      { key: "recommended", label: "Recommended", fallback: "#ffffff" },
      { key: "details", label: "Video details", fallback: "#ffffff" },
      { key: "description", label: "Description", fallback: "#f2f2f2" },
      { key: "comments", label: "Comments", fallback: "#ffffff" },
      { key: "subscribe", label: "Subscribe (not subscribed)", fallback: "#cc0000" },
      { key: "subscribeText", label: "Subscribe text (not subscribed)", fallback: "#ffffff" },
      { key: "subscribed", label: "Subscribe (subscribed)", fallback: "#606060" },
      { key: "subscribedText", label: "Subscribe text (subscribed)", fallback: "#ffffff" }
    ]
  }
];
const themePresets = [
  {
    name: "Midnight Black",
    home: {
      text: "#f1f1f1",
      background: "#000000",
      header: "#000000",
      guide: "#000000",
      cards: "#0f0f0f",
      search: "#0f0f0f",
      searchText: "#f1f1f1",
      categories: "#0f0f0f",
      categoryArrows: "#0f0f0f"
    },
    player: {
      text: "#f1f1f1",
      background: "#000000",
      header: "#000000",
      guide: "#000000",
      recommended: "#0f0f0f",
      details: "#0f0f0f",
      description: "#0f0f0f",
      comments: "#0f0f0f",
      subscribe: "#f1f1f1",
      subscribeText: "#0f0f0f",
      subscribed: "#272727",
      subscribedText: "#f1f1f1"
    }
  }
];
const themeView = document.getElementById("theme-view");
const themePresetsContainer = document.getElementById("theme-presets");
const themeSaveButton = document.getElementById("theme-save");
const themeLoadButton = document.getElementById("theme-load");
const themeStatus = document.getElementById("theme-status");
let savedTheme = null;
let settingsReady = false;
const syncStorage = globalThis.chrome?.storage?.sync;
const localStore = globalThis.chrome?.storage?.local;
const legacyColorFallbacks = new Map();
for (const scope of colorScopes) {
  for (const field of scope.fields) legacyColorFallbacks.set(`${scope.prefix}:${field.key}`, field.fallback);
}
let sidebarItems = [];
let sidebarHidden = new Set();
const colorState = {};

function colorScopeDefaults(scope) {
  const defaults = { enabled: false };
  for (const field of scope.fields) defaults[field.key] = field.fallback;
  return defaults;
}

function buildColorControls() {
  for (const scope of colorScopes) {
    for (const field of scope.fields) {
      const id = `${scope.prefix}-${field.key}-color`;
      const row = document.createElement("div");
      row.className = "option option-color";

      const label = document.createElement("label");
      label.className = "option-label";
      label.htmlFor = `${id}-hex`;
      label.textContent = field.label;

      const hex = document.createElement("input");
      hex.className = "option-hex";
      hex.id = `${id}-hex`;
      hex.type = "text";
      hex.value = field.fallback;
      hex.maxLength = 7;
      hex.spellcheck = false;
      hex.setAttribute("aria-label", `${scope.label} ${field.label} color`);

      const picker = document.createElement("input");
      picker.className = "option-swatch";
      picker.id = `${id}-picker`;
      picker.type = "color";
      picker.value = field.fallback;
      picker.setAttribute("aria-label", `${scope.label} ${field.label} color picker`);

      row.append(label, hex, picker);
      scope.suboptions.append(row);
      field.hex = hex;
      field.picker = picker;
    }
  }
}

function renderThemePresets() {
  themePresetsContainer.replaceChildren();
  for (const preset of themePresets) {
    const card = document.createElement("div");
    card.className = "theme-preset";

    const name = document.createElement("div");
    name.className = "theme-preset-name";
    name.textContent = preset.name;

    const row = document.createElement("div");
    row.className = "theme-preset-row";

    const colors = document.createElement("div");
    colors.className = "theme-preset-colors";
    const entries = new Map();
    for (const scope of colorScopes) {
      const source = preset[scope.prefix];
      for (const field of scope.fields) {
        const color = normalizeHexColor(source[field.key]);
        if (!color) continue;
        if (!entries.has(color)) entries.set(color, []);
        const labels = entries.get(color);
        if (!labels.includes(field.label)) labels.push(field.label);
      }
    }
    for (const [color, labels] of entries) {
      const swatch = document.createElement("span");
      swatch.className = "theme-swatch";
      swatch.title = `${color} — ${labels.join(", ")}`;
      swatch.setAttribute("aria-label", swatch.title);
      const chip = document.createElement("span");
      chip.className = "theme-swatch-color";
      chip.style.backgroundColor = color;
      const hex = document.createElement("span");
      hex.className = "theme-swatch-hex";
      hex.textContent = color;
      swatch.append(chip, hex);
      colors.append(swatch);
    }

    const apply = document.createElement("button");
    apply.type = "button";
    apply.className = "theme-action theme-preset-apply";
    apply.textContent = "Apply";
    apply.disabled = !settingsReady;
    apply.addEventListener("click", () => {
      const theme = {};
      for (const scope of colorScopes) {
        theme[scope.prefix] = { enabled: true };
        for (const field of scope.fields) {
          theme[scope.prefix][field.key] = normalizeHexColor(preset[scope.prefix][field.key]) || field.fallback;
        }
      }
      applyTheme(theme);
      themeStatus.textContent = "Applied";
    });

    row.append(colors, apply);
    card.append(name, row);
    themePresetsContainer.append(card);
  }
}

function applyTheme(theme) {
  for (const scope of colorScopes) {
    const source = theme[scope.prefix];
    if (!source) continue;
    const state = { enabled: Boolean(source.enabled) };
    for (const field of scope.fields) {
      const color = normalizeHexColor(source[field.key]) || field.fallback;
      state[field.key] = color;
      setColorInputs(field.hex, field.picker, color, field.fallback);
    }
    colorState[scope.prefix] = state;
    scope.checkbox.checked = state.enabled;
    scope.checkbox.disabled = false;
  }
  saveSync({ homeColors: { ...colorState.home }, playerColors: { ...colorState.player } });
}

function currentTheme() {
  const theme = {};
  for (const scope of colorScopes) {
    const state = colorState[scope.prefix] || {};
    const copy = { enabled: Boolean(state.enabled) };
    for (const field of scope.fields) copy[field.key] = normalizeHexColor(state[field.key]) || field.fallback;
    theme[scope.prefix] = copy;
  }
  return theme;
}

function normalizeSavedTheme(value) {
  if (!value || typeof value !== "object") return null;
  const theme = {};
  for (const scope of colorScopes) {
    const source = value[scope.prefix];
    if (!source || typeof source !== "object") return null;
    const state = { enabled: Boolean(source.enabled) };
    for (const field of scope.fields) state[field.key] = normalizeHexColor(source[field.key]) || field.fallback;
    theme[scope.prefix] = state;
  }
  return theme;
}

function updateThemeButtons() {
  themeSaveButton.disabled = !settingsReady;
  themeLoadButton.disabled = !settingsReady || !savedTheme;
  for (const button of themePresetsContainer.querySelectorAll(".theme-preset-apply")) {
    button.disabled = !settingsReady;
  }
}

function bindScopeColor(scope, field) {
  const save = (color) => {
    colorState[scope.prefix][field.key] = color;
    saveSync({ [`${scope.prefix}Colors`]: { ...colorState[scope.prefix] } });
  };

  field.picker.addEventListener("input", () => {
    const color = normalizeHexColor(field.picker.value);
    if (!color) return;
    field.hex.value = color;
    save(color);
  });

  field.hex.addEventListener("input", () => {
    const color = normalizeHexColor(field.hex.value);
    if (!color) return;
    field.picker.value = color;
    save(color);
  });

  field.hex.addEventListener("change", () => {
    const color = normalizeHexColor(field.hex.value) || normalizeHexColor(field.picker.value) || field.fallback;
    field.hex.value = color;
    field.picker.value = color;
    save(color);
  });
}

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

function requestBaseColors(done) {
  const tabs = globalThis.chrome?.tabs;
  if (!tabs?.query || !tabs?.sendMessage) {
    done(null);
    return;
  }

  let settled = false;
  let timer = null;
  const finish = (colors) => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    done(colors);
  };
  timer = setTimeout(() => finish(null), 500);

  tabs.query({ url: "*://*.youtube.com/*" }, (result) => {
    const tab = result && (result.find((candidate) => candidate.active) || result[0]);
    if (!tab || typeof tab.id !== "number" || typeof tab.url !== "string" || !/^https?:\/\/(?:[^/]+\.)?youtube\.com\//i.test(tab.url)) {
      finish(null);
      return;
    }
    try {
      tabs.sendMessage(tab.id, { type: "ytc-base-colors" }, (response) => {
        void globalThis.chrome?.runtime?.lastError;
        finish(response?.colors || null);
      });
    } catch (error) {
      finish(null);
    }
  });
}

function applyBaseColorFallbacks(colors) {
  if (!colors) return;
  for (const scope of colorScopes) {
    const source = colors[scope.prefix];
    if (!source) continue;
    const complete = scope.fields.every((field) => (scope.prefix === "player" && field.key === "description") || normalizeHexColor(source[field.key]));
    if (!complete) continue;
    for (const field of scope.fields) {
      if (scope.prefix === "player" && field.key === "description") continue;
      field.fallback = normalizeHexColor(source[field.key]);
    }
  }
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
    const hidden = sidebarHidden.has(item.key);
    input.checked = item.inverted ? hidden : !hidden;
    input.addEventListener("change", () => {
      if (item.inverted) {
        if (input.checked) sidebarHidden.add(item.key);
        else sidebarHidden.delete(item.key);
      } else if (input.checked) {
        sidebarHidden.delete(item.key);
      } else {
        sidebarHidden.add(item.key);
      }
      ensureYouTubeTab();
      localStore?.set({ sidebarHidden: Array.from(sidebarHidden) });
      renderSidebarTree();
    });
    const text = document.createElement("span");
    text.textContent = item.title;
    row.append(input, text);
    sidebarTree.append(row);

    const showChildren = item.inverted ? true : input.checked;
    if (!showChildren) return;

    const children = Array.isArray(item.children) ? item.children : [];
    children.forEach((child, index) => addRow(child, depth + 1, index === children.length - 1));
  };

  for (const item of sidebarItems) addRow(item, 0, false);
}

function normalizeHexColor(value) {
  const text = String(value || "").trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(text)) {
    return `#${text.split("").map((part) => part + part).join("")}`.toLowerCase();
  }
  if (/^[0-9a-f]{6}$/i.test(text)) return `#${text}`.toLowerCase();
  return "";
}

function setColorInputs(hexInput, picker, value, fallback) {
  const color = normalizeHexColor(value) || fallback;
  hexInput.value = color;
  picker.value = color;
}

function updatePageColorVisibility() {
  for (const scope of colorScopes) {
    scope.suboptions.hidden = scope.option.hidden || !scope.checkbox.checked;
  }
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
  for (const scope of colorScopes) {
    const stored = settings[`${scope.prefix}Colors`] || {};
    const legacy = scope.fields.every((field) => {
      const value = normalizeHexColor(stored[field.key]);
      if (!value || value === legacyColorFallbacks.get(`${scope.prefix}:${field.key}`)) return true;
      return scope.prefix === "player" && field.key === "description" && (value === "#ffffff" || value === "#0f0f0f");
    });
    const state = { enabled: Boolean(stored.enabled) };
    for (const field of scope.fields) {
      const storedColor = normalizeHexColor(stored[field.key]);
      const migrate = scope.prefix === "player" && field.key === "description" && (storedColor === "#ffffff" || storedColor === "#0f0f0f");
      const color = (legacy || migrate) ? field.fallback : (storedColor || field.fallback);
      state[field.key] = color;
      setColorInputs(field.hex, field.picker, color, field.fallback);
    }
    colorState[scope.prefix] = state;
    scope.checkbox.checked = state.enabled;
    scope.checkbox.disabled = false;
  }
  savedTheme = normalizeSavedTheme(settings.savedTheme);
  settingsReady = true;
  updateThemeButtons();
  updatePageColorVisibility();
  fontSelect.value = settings.fontFamily || "";
  if (fontSelect.selectedIndex === -1) fontSelect.value = "";
}

const settingsDefaults = {
  videosPerRow: Number(rowRange.value),
  uiRadius: Number(cornerRange.value),
  noAI: false,
  hoverHighlights: true,
  addDislikes: true,
  removeHashtags: false,
  removeRecommended: false,
  homeColors: { enabled: false },
  playerColors: { enabled: false },
  savedTheme: null,
  fontFamily: ""
};

renderSidebarTree();
buildColorControls();
renderThemePresets();
for (const scope of colorScopes) {
  colorState[scope.prefix] = colorScopeDefaults(scope);
  scope.checkbox.disabled = true;
  scope.checkbox.addEventListener("change", () => {
    const state = colorState[scope.prefix];
    state.enabled = scope.checkbox.checked;
    for (const field of scope.fields) {
      const color = normalizeHexColor(state[field.key]) || normalizeHexColor(field.hex.value) || field.fallback;
      state[field.key] = color;
      setColorInputs(field.hex, field.picker, color, field.fallback);
    }
    saveSync({ [`${scope.prefix}Colors`]: { ...state } });
    updatePageColorVisibility();
  });
  for (const field of scope.fields) bindScopeColor(scope, field);
}

themeSaveButton.addEventListener("click", () => {
  if (!settingsReady || !syncStorage?.set) return;
  const theme = currentTheme();
  syncStorage.set({ savedTheme: theme }, () => {
    if (globalThis.chrome?.runtime?.lastError) {
      themeStatus.textContent = "Save failed";
      return;
    }
    savedTheme = theme;
    updateThemeButtons();
    themeStatus.textContent = "Saved";
  });
});

themeLoadButton.addEventListener("click", () => {
  if (!settingsReady || !savedTheme) return;
  applyTheme(savedTheme);
  themeStatus.textContent = "Loaded";
});

if (localStore?.get) {
  localStore.get({ customFonts: [], sidebarTree: [], sidebarHidden: [] }, (local) => {
    appendCustomFonts(local.customFonts);
    sidebarItems = Array.isArray(local.sidebarTree) ? local.sidebarTree : [];
    sidebarHidden = new Set(Array.isArray(local.sidebarHidden) ? local.sidebarHidden.filter((key) => typeof key === "string") : []);
    renderSidebarTree();
  });
}

requestBaseColors((colors) => {
  applyBaseColorFallbacks(colors);
  syncStorage?.get(settingsDefaults, applySettings);
});

globalThis.chrome?.storage?.onChanged?.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes.sidebarTree) {
    sidebarItems = Array.isArray(changes.sidebarTree.newValue) ? changes.sidebarTree.newValue : [];
    renderSidebarTree();
  }
  if (changes.sidebarHidden) {
    sidebarHidden = new Set(Array.isArray(changes.sidebarHidden.newValue) ? changes.sidebarHidden.newValue.filter((key) => typeof key === "string") : []);
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
  const hasMainOptions = onHome && tab.dataset.label === "Main";
  const hasSidebarOptions = onHome && tab.dataset.label === "Sidebar";
  const hasPlayerMainOptions = onPlayer && tab.dataset.label === "Main";
  const colorsVisible = {
    home: onHome && tab.dataset.label === "Colors",
    player: onPlayer && tab.dataset.label === "Colors"
  };
  videosPerRow.hidden = !hasMainOptions;
  cornerOption.hidden = !hasMainOptions;
  noAIOption.hidden = !hasMainOptions;
  hoverOption.hidden = !hasMainOptions;
  fontOption.hidden = !hasMainOptions;
  sidebarOptions.hidden = !hasSidebarOptions;
  addDislikesOption.hidden = !hasPlayerMainOptions;
  removeHashtagsOption.hidden = !hasPlayerMainOptions;
  noRecommendedOption.hidden = !hasPlayerMainOptions;
  for (const scope of colorScopes) scope.option.hidden = !colorsVisible[scope.prefix];
  updatePageColorVisibility();
  panelEmpty.hidden = hasMainOptions || hasSidebarOptions || hasPlayerMainOptions ||
    colorsVisible.home || colorsVisible.player;
}

function renderSubtabs(category) {
  const labels = (category.dataset.subtabs || "").split("|").filter(Boolean);
  subtabList.replaceChildren();

  if (!labels.length) {
    subtabList.hidden = true;
    for (const option of panel.querySelectorAll(":scope > .option, :scope > .color-suboptions, :scope > #sidebar-options")) {
      option.hidden = true;
    }
    panel.setAttribute("aria-labelledby", category.id);
    if (category.id === "tab-themes") {
      themeView.hidden = false;
      panelEmpty.hidden = true;
      return;
    }
    themeView.hidden = true;
    panelEmpty.textContent = `No ${category.textContent} settings yet.`;
    panelEmpty.hidden = false;
    return;
  }

  themeView.hidden = true;
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



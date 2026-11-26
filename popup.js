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
}

const settingsDefaults = {
  videosPerRow: Number(rowRange.value),
  uiRadius: Number(cornerRange.value),
  noAI: false,
  hoverHighlights: true,
  addDislikes: true,
  removeHashtags: false,
  removeRecommended: false,
  fontFamily: ""
};

renderSidebarTree();

if (localStore?.get) {
  localStore.get({ customFonts: [], sidebarTree: [], sidebarDisabled: [] }, (local) => {
    appendCustomFonts(local.customFonts);
    sidebarItems = Array.isArray(local.sidebarTree) ? local.sidebarTree : [];
    sidebarDisabled = new Set(Array.isArray(local.sidebarDisabled) ? local.sidebarDisabled.filter((key) => typeof key === "string") : []);
    renderSidebarTree();
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
  videosPerRow.hidden = !hasMainOptions;
  cornerOption.hidden = !hasMainOptions;
  noAIOption.hidden = !hasMainOptions;
  hoverOption.hidden = !hasMainOptions;
  fontOption.hidden = !hasMainOptions;
  sidebarOptions.hidden = !hasSidebarOptions;
  addDislikesOption.hidden = !hasPlayerMainOptions;
  removeHashtagsOption.hidden = !hasPlayerMainOptions;
  noRecommendedOption.hidden = !hasPlayerMainOptions;
  panelEmpty.hidden = hasMainOptions || hasSidebarOptions || hasPlayerMainOptions;
  if (hasSidebarOptions) renderSidebarTree();
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



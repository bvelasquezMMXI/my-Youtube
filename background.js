const DISLIKE_API = "https://returnyoutubedislikeapi.com/votes?videoId=";
const CACHE_TTL = 10 * 60 * 1000;
const cache = new Map();

function readCache(videoId) {
  const entry = cache.get(videoId);
  if (!entry || Date.now() - entry.time > CACHE_TTL) {
    cache.delete(videoId);
    return null;
  }
  return entry.dislikes;
}

function writeCache(videoId, dislikes) {
  if (cache.size >= 100) cache.clear();
  cache.set(videoId, { dislikes, time: Date.now() });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "ytc-get-dislikes" || typeof message.videoId !== "string") return false;
  const videoId = message.videoId;
  if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    sendResponse({ ok: false });
    return false;
  }

  const cached = readCache(videoId);
  if (cached !== null) {
    sendResponse({ ok: true, dislikes: cached });
    return false;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  fetch(`${DISLIKE_API}${encodeURIComponent(videoId)}`, {
    signal: controller.signal,
    cache: "no-store"
  })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      const dislikes = Number(data?.dislikes);
      if (!Number.isFinite(dislikes) || dislikes < 0) throw new Error("Invalid dislike count");
      writeCache(videoId, dislikes);
      sendResponse({ ok: true, dislikes });
    })
    .catch(() => {
      sendResponse({ ok: false });
    })
    .finally(() => {
      clearTimeout(timer);
    });

  return true;
});

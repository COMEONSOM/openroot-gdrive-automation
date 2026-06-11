console.log("File Rename Automation Started");

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusEl  = document.getElementById("status");
const spinnerEl = document.getElementById("spinner");

function setStatus(msg, type = "") {
  if (statusEl) {
    statusEl.innerText = msg;
    statusEl.className = type;          // "error" | "success" | ""
  }
}

function showSpinner(on) {
  if (spinnerEl) spinnerEl.classList.toggle("active", on);
}

// REQ 1–2: pattern guard — matches IMG_01072022_001.jpg / VID_02072022_003.mp4
const ALREADY_RENAMED = /^(IMG|VID)_\d{8}_\d{3}\.[a-zA-Z0-9]+$/;

function isAlreadyRenamed(filename) {
  return ALREADY_RENAMED.test(filename);
}

// REQ 3 — Priority 1: extract date from the filename itself
// Handles: IMG_20220701_..., 2022-07-01_photo, 20220701, photo_2022_07_01, etc.
const FILENAME_DATE_PATTERNS = [
  /(\d{4})[_\-]?(\d{2})[_\-]?(\d{2})/,   // YYYYMMDD or YYYY-MM-DD or YYYY_MM_DD
  /(\d{2})[_\-](\d{2})[_\-](\d{4})/,      // DD-MM-YYYY or DD_MM_YYYY
];

function extractDateFromFilename(name) {
  for (const pattern of FILENAME_DATE_PATTERNS) {
    const m = name.match(pattern);
    if (!m) continue;

    const first = parseInt(m[1], 10);
    if (first > 1900 && first < 2100) {
      const d = new Date(`${m[1]}-${m[2]}-${m[3]}`);
      if (!isNaN(d)) return d;
    } else {
      const d = new Date(`${m[3]}-${m[2]}-${m[1]}`);
      if (!isNaN(d)) return d;
    }
  }
  return null;
}

// REQ 3 — Priority-based date resolution
function resolveBestDate(file) {
  // P1: filename
  const fromName = extractDateFromFilename(file.name);
  if (fromName) return fromName;

  // P2: EXIF / media metadata
  const exif = file.imageMediaMetadata?.time;
  if (exif) {
    const d = new Date(exif);
    if (!isNaN(d)) return d;
  }

  // P3: Drive createdTime (always present)
  return new Date(file.createdTime);
}

// REQ 7: format date as DDMMYYYY
function formatDate(date) {
  return (
    String(date.getDate()).padStart(2, "0") +
    String(date.getMonth() + 1).padStart(2, "0") +
    date.getFullYear()
  );
}

// REQ 6: extract extension safely
function getExtension(filename) {
  const idx = filename.lastIndexOf(".");
  return idx > 0 ? filename.substring(idx) : "";
}

// ─── Main ─────────────────────────────────────────────────────────────────────

let renameHistory = [];   // REQ 8: supports future undo

showSpinner(true);
setStatus("Authenticating...");

// FIX: Removed clearAllCachedAuthTokens — it forced re-login every time
// and caused auth failures during CWS review. Now uses cached token if available.
chrome.identity.getAuthToken({ interactive: true }, async (token) => {

  if (chrome.runtime.lastError) {
    showSpinner(false);
    console.error("Auth error:", chrome.runtime.lastError.message);
    setStatus("Auth failed — " + chrome.runtime.lastError.message, "error");
    return;
  }

  try {

    // ── STEP 1: resolve folder ─────────────────────────────────────────────
    setStatus("Reading folder...");
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.url?.includes("folders/")) {
      showSpinner(false);
      setStatus("Open a Drive folder first", "error");
      return;
    }

    const folderId = tab.url.split("folders/")[1].split("?")[0];

    // ── STEP 2: fetch files (all pages) ────────────────────────────────────
    let files = [];
    let pageToken = null;

    do {
      const params = new URLSearchParams({
        q: `'${folderId}' in parents and trashed = false`,
        fields: "nextPageToken,files(id,name,mimeType,createdTime,imageMediaMetadata)",
        pageSize: 1000,
      });
      if (pageToken) params.set("pageToken", pageToken);

      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?${params}`,
        { headers: { Authorization: "Bearer " + token } }
      );

      if (!res.ok) throw new Error(`Drive API ${res.status}: ${await res.text()}`);
      const page = await res.json();
      files = files.concat(page.files ?? []);
      pageToken = page.nextPageToken ?? null;

    } while (pageToken);

    if (files.length === 0) {
      showSpinner(false);
      setStatus("No files found");
      return;
    }

    // ── STEP 3: separate already-renamed from candidates ────────────────────
    const candidates = files.filter(f => {
      if (!f.mimeType.startsWith("image/") && !f.mimeType.startsWith("video/")) return false;
      return !isAlreadyRenamed(f.name);
    });

    const skippedCount = files.length - candidates.length;
    console.log(`Total: ${files.length} | Already renamed (skipped): ${skippedCount} | To process: ${candidates.length}`);

    if (candidates.length === 0) {
      showSpinner(false);
      setStatus("All files already renamed ✓", "success");
      return;
    }

    // ── STEP 4: attach resolved date, then sort chronologically ────────────
    const annotated = candidates.map(file => ({
      ...file,
      _resolvedDate: resolveBestDate(file),
    }));

    annotated.sort((a, b) => a._resolvedDate - b._resolvedDate);

    // ── STEP 5: build new names ─────────────────────────────────────────────
    const counters = {};
    const renameQueue = [];

    for (const file of annotated) {
      const dateStr  = formatDate(file._resolvedDate);
      const isImage  = file.mimeType.startsWith("image/");
      const prefix   = isImage ? "IMG" : "VID";
      const ext      = getExtension(file.name);

      const counterKey = `${prefix}_${dateStr}`;
      counters[counterKey] = (counters[counterKey] ?? 0) + 1;

      const seq     = String(counters[counterKey]).padStart(3, "0");
      const newName = `${prefix}_${dateStr}_${seq}${ext}`;

      if (file.name === newName) continue;

      renameQueue.push({ id: file.id, oldName: file.name, newName });
    }

    console.table(renameQueue);
    setStatus(`Renaming ${renameQueue.length} file(s)…`);

    // ── STEP 6: PATCH each file ─────────────────────────────────────────────
    let failCount = 0;

    for (const item of renameQueue) {
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files/${item.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: item.newName }),
        }
      );

      if (!res.ok) {
        failCount++;
        console.warn(`Failed to rename "${item.oldName}": HTTP ${res.status}`);
        continue;
      }

      renameHistory.push({ id: item.id, oldName: item.oldName });
      console.log(`✓  ${item.oldName}  →  ${item.newName}`);
    }

    showSpinner(false);

    const doneMsg = failCount > 0
      ? `Done! ${renameQueue.length - failCount} renamed, ${failCount} failed, ${skippedCount} skipped.`
      : `Done! ${renameQueue.length} renamed, ${skippedCount} skipped.`;

    setStatus(doneMsg, "success");
    setTimeout(() => window.close(), 2500);

  } catch (err) {
    showSpinner(false);
    console.error("Unexpected error:", err);
    setStatus("Error — check console", "error");
  }

});
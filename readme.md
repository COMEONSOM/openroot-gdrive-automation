<div align="center">

  <h1>Openroot GDrive Automation System</h1>
  <p><strong>Intelligent Google Drive File Organizer and Renamer</strong></p>
  <p>Built by <a href="https://openroot.in/">Openroot Systems</a></p>

  <p>
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
    <img src="https://img.shields.io/badge/Chrome_Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Chrome Extension">
    <img src="https://img.shields.io/badge/Manifest_V3-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Manifest V3">
  </p>

  <p>
    <img src="https://img.shields.io/badge/Google_Drive_API_v3-34A853?style=for-the-badge&logo=googledrive&logoColor=white" alt="Google Drive API">
    <img src="https://img.shields.io/badge/OAuth_2.0-EA4335?style=for-the-badge&logo=google&logoColor=white" alt="OAuth 2.0">
  </p>

</div>

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Naming Convention](#naming-convention)
- [How It Works](#how-it-works)
- [Permissions](#permissions)
- [Installation](#installation)
- [Usage](#usage)
- [Security](#security)
- [Future Improvements](#future-improvements)

---

## Overview

**Openroot GDrive Automation System** is a lightweight Chrome Extension that intelligently organizes and renames Google Drive files using a smart, safe, and incremental naming system. It processes only newly added files, skips already renamed ones, and preserves file integrity throughout.

> **Product Name:** Openroot GDrive Automation System
> **Organization:** Openroot Systems
> **Type:** Chrome Extension (Manifest V3) with Google Drive API integration

This tool is designed for efficiency, safety, scalability, and real-world usage across personal and organizational Google Drive folders.

---

## Architecture

```
+--------------------------------------------------+
|        Chrome Extension (Manifest V3)            |  <- Popup UI + Background Logic
|                                                  |
|  +-------------+  +----------+  +------------+   |
|  | Popup UI    |  | OAuth    |  | Drive API  |   |
|  | (status)    |  | Handler  |  | Client     |   |
|  +-------------+  +----------+  +------------+   |
|         |               |             |          |
|  +------------------------------------------+    |
|  |         Core Renaming Engine             |    |
|  |                                          |    |
|  | 1. Fetch folder files                    |    |
|  | 2. Detect already renamed (skip)         |    |
|  | 3. Extract dates (EXIF / filename / API) |    |
|  | 4. Sort chronologically                  |    |
|  | 5. Apply naming convention               |    |
|  | 6. Rename via Drive API v3               |    |
|  +------------------------------------------+    |
+--------------------------------------------------+
                        |
                        v
+--------------------------------------------------+
|           Google Drive API v3                    |  <- files.list / files.update
|                                                  |
|  Your Google Drive Folder                        |
|  +-- IMG_01072022_001.jpg  (renamed)             |
|  +-- IMG_01072022_002.jpg  (renamed)             |
|  +-- VID_02072022_001.mp4  (renamed)             |
+--------------------------------------------------+
```

### Core Components

| Component | Role | Description |
|-----------|------|-------------|
| **Popup UI** | User Interface | Minimal popup with trigger button and real-time status updates |
| **OAuth Handler** | Authentication | Google OAuth 2.0 identity flow via Chrome `identity` API |
| **Drive API Client** | File Operations | Fetches file list and applies rename operations via Google Drive API v3 |
| **Renaming Engine** | Core Logic | Pattern detection, date extraction, chronological sorting, and safe renaming |
| **Undo System** | Safety Layer | Reverts renamed files back to their original names |

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Language | JavaScript (Vanilla) | All extension logic |
| Extension Platform | Chrome Extension Manifest V3 | Modern Chrome extension architecture |
| File Operations | Google Drive API v3 | Fetch and rename files within Google Drive |
| Authentication | Google OAuth 2.0 | Secure user identity and Drive access |
| UI | Extension Popup | Minimal status interface |

---

## Features

### Smart Incremental Renaming

- Only newly added files are renamed
- Previously renamed files are automatically detected and skipped
- Prevents unnecessary API calls and reprocessing

### Pattern Detection (Idempotent System)

- Detects files already following the naming convention
- Safe to run multiple times on the same folder without side effects

### Intelligent Date Extraction

Date is resolved using a priority-based fallback chain:

| Priority | Source | Condition |
|----------|--------|-----------|
| 1 | Date from filename | If parseable date exists in the original filename |
| 2 | Image EXIF metadata | If capture date is embedded in the file |
| 3 | Google Drive upload date | Fallback when no other date is available |

### File Type-Based Naming

| File Type | Prefix | Example |
|-----------|--------|---------|
| Images | `IMG_` | `IMG_01072022_001.jpg` |
| Videos | `VID_` | `VID_02072022_001.mp4` |

### Additional Features

- **Chronological sorting** — files ordered by actual capture time
- **Extension preservation** — file extensions are never modified
- **Undo system** — revert any renamed files back to their original names
- **Lightweight UI** — minimal popup with real-time status, no clutter

---

## Naming Convention

```
IMG_01072022_001.jpg
VID_02072022_001.mp4
```

| Segment | Meaning | Example |
|---------|---------|---------|
| `IMG` / `VID` | File type prefix | `IMG` for images, `VID` for videos |
| `DDMMYYYY` | Capture or upload date | `01072022` = 1 July 2022 |
| `XXX` | Sequence number | Resets per day per file type |
| `.ext` | Original extension | Always preserved unchanged |

---

## How It Works

1. Open a Google Drive folder in Chrome.
2. Click the extension icon in the toolbar.
3. The extension authenticates via Google OAuth 2.0.
4. It fetches all files from the current folder.
5. Already renamed files are detected and skipped.
6. Unprocessed files are sorted chronologically by date.
7. Each file is renamed following the `IMG_` / `VID_` convention.
8. Status updates are shown in the popup in real time.

---

## Permissions

| Permission | Purpose |
|------------|---------|
| `identity` | Google OAuth 2.0 authentication |
| `activeTab` | Read the current Google Drive folder URL from the active tab |
| Google Drive API | Fetch file metadata and rename files within your Drive |

---

## Installation

> This extension is currently available for local/development use only.

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer Mode** using the toggle in the top-right corner.
4. Click **Load Unpacked**.
5. Select the project folder.

The extension will appear in your Chrome toolbar.

---

## Usage

1. Open any Google Drive folder (`drive.google.com/drive/folders/...`).
2. Click the extension icon in the Chrome toolbar.
3. Wait for processing to complete.
4. Files will be renamed automatically following the naming convention.

> The extension works only inside Google Drive folder URLs. Running it on any other page has no effect.

---

## Security

| Property | Detail |
|----------|--------|
| **Authentication** | Official Google OAuth 2.0 — no custom auth server |
| **Data storage** | No data is stored externally or transmitted to third-party servers |
| **Scope** | All operations remain within your own Google Drive account |

---

## Future Improvements

- Select specific files to rename individually
- Custom naming rules and prefix configuration
- Duplicate file detection and flagging
- Folder auto-grouping by date
- Progress bar with per-file status display
- Chrome Web Store public release

---

<div align="center">

**Maintained by [Openroot Systems](https://openroot.in/)**

<p>
  <img src="https://img.shields.io/badge/Platform-Chrome_Extension-4285F4?style=flat-square&logo=googlechrome&logoColor=white" alt="Chrome">
  <img src="https://img.shields.io/badge/API-Google_Drive_v3-34A853?style=flat-square&logo=googledrive&logoColor=white" alt="Drive API">
  <img src="https://img.shields.io/badge/License-Proprietary-red?style=flat-square" alt="License">
</p>

</div>

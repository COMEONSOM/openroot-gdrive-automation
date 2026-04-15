# Openroot GDrive Automation System

A lightweight Chrome Extension that intelligently organizes and renames Google Drive files (images and videos) using a smart, safe, and incremental naming system.

---

## Overview

Openroot GDrive Automation System automates file organization inside Google Drive folders. It ensures consistent naming, avoids duplicate processing, preserves file integrity, and maintains chronological order.

This tool is designed for:
- Efficiency
- Safety
- Scalability
- Real-world usage

---

## Features

### 1. Smart Incremental Renaming
- Only newly added files are renamed
- Previously renamed files are automatically skipped

### 2. Pattern Detection (Idempotent System)
- Detects files already following the naming convention
- Prevents reprocessing and unnecessary API calls

### 3. Intelligent Date Extraction
Priority-based date detection:
1. Date from filename (if available)
2. Image metadata (EXIF)
3. Google Drive created/upload date (fallback)

### 4. Chronological Sorting
- Files are sorted by actual capture time
- Maintains correct sequence

### 5. File Type-Based Naming
- Images → `IMG_DDMMYYYY_XXX.ext`
- Videos → `VID_DDMMYYYY_XXX.ext`

### 6. Extension Preservation
- File extensions are never modified
- Prevents corruption and ensures compatibility

### 7. Undo System
- Allows reverting renamed files back to original names

### 8. Lightweight UI
- Minimal popup interface
- Real-time status updates
- No clutter

---

## Naming Convention
IMG_01072022_001.jpg
VID_02072022_001.mp4


Format:
- `IMG / VID` → File type
- `DDMMYYYY` → Date
- `XXX` → Sequence number

---

## How It Works

1. Open a Google Drive folder
2. Click the extension icon
3. The system:
   - Authenticates via Google OAuth
   - Fetches files from the current folder
   - Detects already renamed files
   - Processes only unmatched files
   - Renames them safely

---

## Tech Stack

- JavaScript (Vanilla)
- Chrome Extension (Manifest V3)
- Google Drive API
- Google OAuth 2.0

---

## Permissions

- `identity` → Google authentication
- `activeTab` → Access current tab
- `scripting` → Execute logic
- Google Drive API → File operations

---

## Installation (Local)

1. Clone or download this project
2. Open Chrome: chrome://extensions/
3. Enable **Developer Mode**
4. Click **Load Unpacked**
5. Select the project folder

---

## Usage

1. Open any Google Drive folder
2. Click the extension icon
3. Wait for processing
4. Files will be renamed automatically

---

## Notes

- Works only inside Drive folders
- Already renamed files are skipped
- File extensions are always preserved
- Best results with images having metadata

---

## Security

- Uses official Google OAuth
- No external data storage
- All operations stay within your Drive

---

## Future Improvements

- Select specific files
- Custom naming rules
- Duplicate detection
- Folder auto-grouping
- Progress indicators
- Chrome Web Store release

---

## Author

**Openroot Systems**  
Openroot GDrive Automation System
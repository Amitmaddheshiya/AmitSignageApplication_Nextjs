<<<<<<< HEAD
# Signage Next.js (Local Browser) — Updated Project with Persistence & Sequential Playback

## What's new in this updated package
- Uploaded media (images/videos) are now **persisted to IndexedDB** so the last uploaded content remains visible after page reload.
- Each grid shows **one media item at a time full-size**. If multiple items (<=5) are uploaded to a grid, they will **play sequentially (looping)**:
  - For videos: they play full-screen in the grid and when a video's playback ends, the next video starts.
  - For images: they display for the duration set in the side panel (Slide Duration) then switch to the next.
- The app still runs fully in the browser — no server required.

## How to run
1. npm install
2. npm run dev
3. Open http://localhost:3000 in a Chromium-based browser

## How to use
- Hover a grid and click **Upload** (or use the upload input) to select up to 5 files for that grid. Uploading replaces the previous files for that grid.
- The selected files are saved to your browser's IndexedDB and will persist across reloads.
- Right-click anywhere to open the customization panel. Change settings and click **Apply & Close** to save settings (also persisted).
- If you want the app to forget a grid's media, open the browser DevTools > Application > IndexedDB and remove entries for `signage-db`, or use the provided UI to replace with new uploads.

## Notes
- Large video files may consume browser storage and could be subject to quota limits. For heavy usage, a desktop packaged app is recommended (Electron).
=======
# AmitSignageApplication_Nextjs
yah application se ham signage par add dikha sakte hai cms web se content manage kar sakte hai 
>>>>>>> b4487bc0ad69b902abb6fca44eea6469c56e8711

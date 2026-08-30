# hvOS

A performance-obsessed interface overhaul for desktop YouTube on Firefox. `hvOS` strips YouTube of its heavy stock UI overhead and reconstructs the viewing experience with Apple TV-inspired minimalism, deep ambient mesh backdrops, an expanding focus search engine, and telemetry elimination for sub-second page loads.

Developed by [@hv33y](https://github.com/hv33y).

---

## What hvOS Does to YouTube

### YouTube Interface Reconstruction
* **Cinematic Ambient Aura:** Injects a deep, multi-layered mesh gradient behind the entire YouTube feed with subtle organic motion.
* **Apple TV Glass Masthead:** Replaces YouTube's static top bar with a translucent frosted-glass header featuring real-time scroll blur.
* **Windows 11 Expanding Search Pill:** A compact search pill that smoothly stretches into a focused search bar on click, dimming and blurring underlying video cards.
* **Strict 4-Column Card Grid:** Enforces a clean 4-column feed layout with 3D elevations, specular glass borders, and focused ambient glows on hover.
* **Streamlined Video Metadata:** Consolidates channel information and view counts into a single row while stripping upload timestamps.

### YouTube Clutter Stripping
* Removes the left sidebar drawer, mini-guide, and hamburger menu.
* Removes the "+ Create" button, notification bell, and voice search mic.
* Eliminates category chip bars, ghost headers, Shorts shelves, and suggested end-screen annotations.

### Firefox Turbo Engine
* Intercepts and drops YouTube background telemetry, analytics, and tracking requests (`/log_event`, `/api/stats/*`, `google-analytics.com`).
* Eliminates skeleton loading placeholders and background video hover decoders.
* Disables YouTube canvas cinematics to maintain smooth 60 FPS WebRender GPU composite performance.
* Blocks and cleans `?themeRefresh=1` reload loops.

---

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) on Firefox.
2. Open Tampermonkey and select **Create a new script...**
3. Paste the contents of [`hvos.user.js`](hvos.user.js) into the editor.
4. Save the script (`Ctrl + S`) and navigate to [YouTube](https://www.youtube.com).

---

## License
[MIT](LICENSE)

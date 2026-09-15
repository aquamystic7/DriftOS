DriftOS
Flow through your browser.

A lightweight, offline-first web operating system that runs entirely in your browser. No installs. No dependencies. Under 100KB.

Table of Contents
About

Features

Quick Start

Project Structure

Architecture

Roadmap

Development

Contributing

License

About
DriftOS is a web-based operating system that runs in the browser. It provides a desktop environment, window manager, file system, and applications — all built with vanilla JavaScript and CSS, with zero external dependencies.

It is designed for people who want a fast, private workspace that works offline and loads instantly.

Goals
Fast — under 100KB initial load

Simple — no frameworks, no bundlers, no build step

Private — no telemetry, no tracking, no servers

Offline-first — full functionality without an internet connection

Modular — every application lazy-loads on demand

Features
Core
Desktop Environment — wallpaper, icons, and right-click context menu

Window Manager — draggable, resizable, minimizable, and closable windows

Taskbar — running applications, clock, and system tray

Virtual File System — persistent storage using IndexedDB

Terminal — command-line interface for the OS

Text Editor — create and edit files directly

File Manager — browse and manage the virtual filesystem

Command Palette — universal launcher accessible with Ctrl+K

Unique
Flow Windows — windows animate into place with spring physics

Time-Travel Filesystem — undo any file change with versioned storage

WebRTC Sharing — send files peer-to-peer without a server

Live Code Widgets — run JavaScript snippets directly on the desktop

AI Shell Assistant — natural language converted to shell commands

Hybrid Tiling — snap windows like a tiling manager, drag to float

Sound-Reactive Themes — desktop visuals respond to microphone input

Quick Start
Run Locally
bash
git clone https://github.com/yourname/driftos.git
cd driftos
npx serve .
Then open http://localhost:3000 in your browser.

Any static server works:

bash
python -m http.server 8000
# or
php -S localhost:8000
Requirements
A modern browser (Chrome, Firefox, Safari, or Edge)

A static file server

That's it

Project Structure
text
driftos/
├── index.html              # Boot entry point
├── manifest.webmanifest    # PWA manifest
├── sw.js                   # Service worker for offline support
├── kernel.js               # Process manager and IPC
├── shell/
│   ├── desktop.js          # Desktop renderer
│   ├── window.js           # Window class with physics
│   ├── taskbar.js          # Taskbar widget
│   ├── dock.js             # Bottom dock
│   └── palette.js          # Command palette (Ctrl+K)
├── fs/
│   └── vfs.js              # Virtual filesystem (IndexedDB)
├── apps/
│   ├── files/              # File manager
│   ├── terminal/           # Shell
│   ├── editor/             # Text editor
│   └── settings/           # Preferences
├── styles/
│   ├── base.css            # Reset and base styles
│   ├── window.css          # Window styles
│   ├── themes.css          # Theme variables
│   └── drift.css           # Motion and physics
├── assets/
│   └── icons/              # SVG icons
├── LICENSE
└── README.md
Architecture
DriftOS is built as a layered system, from boot screen to applications.

text
┌─────────────────────────────────────┐
│         Boot Screen (wave)          │
├─────────────────────────────────────┤
│         Desktop Shell               │
├─────────────────────────────────────┤
│  Taskbar  │  Windows  │  Dock       │
├─────────────────────────────────────┤
│       Kernel (process manager)      │
├─────────────────────────────────────┤
│     Virtual File System (VFS)       │
├─────────────────────────────────────┤
│        Applications Layer           │
├─────────────────────────────────────┤
│     Service Worker (offline)        │
└─────────────────────────────────────┘
Tech Stack
Layer	Technology
Frontend	Vanilla JavaScript (ES Modules)
Styling	Pure CSS (variables, backdrop-filter)
Storage	IndexedDB, Cache API
Networking	WebRTC, Fetch API
Offline	Service Workers, PWA
Motion	Web Animations API, CSS transitions
Build	None — files are served directly
No frameworks. No bundlers. No build step.

Roadmap
Phase 1 — Foundation
☑ Project concept and naming
□ Boot screen with wave animation
□ Desktop shell
□ Window manager with drift physics
Phase 2 — Core Applications
□ Virtual File System
□ Terminal
□ File Manager
□ Text Editor
Phase 3 — Polish
□ Command Palette
□ Theme system
□ PWA and offline support
□ Settings application
Phase 4 — Unique Features
□ Time-travel filesystem
□ WebRTC peer-to-peer sharing
□ Live code widgets
□ AI shell assistant
□ Sound-reactive themes
Phase 5 — Ecosystem
□ Application SDK
□ Community themes
□ Curated app store
Development
Prerequisites
A modern browser

A static file server

A code editor

Running the Project
bash
npx serve .
Open the URL shown in your terminal. Changes to source files are reflected on refresh.

Code Style
Vanilla JavaScript only — no frameworks or transpilers

ES Modules for all imports and exports

CSS variables for theming

Semantic HTML with accessibility in mind

No minification required for development

Browser Support
DriftOS targets the latest versions of Chrome, Firefox, Safari, and Edge. It relies on IndexedDB, Service Workers, and ES Modules.

Contributing
Contributions are welcome. To get started:

Fork the repository

Create a branch (git checkout -b feature/your-feature)

Commit your changes (git commit -m "Add your feature")

Push to your branch (git push origin feature/your-feature)

Open a Pull Request

Good First Issues
Add a new theme

Improve documentation

Fix a bug

Build a small application

Write tests

Please keep pull requests focused and small. One feature or fix per PR.

License
MIT License. See LICENSE for details.

You are free to use, modify, and distribute this project, including for commercial purposes, as long as the license is included.

Credits
Built by the DriftOS community.

Inspired by the belief that the web can be fast, private, and beautiful again.

DriftOS — Flow through your browser.
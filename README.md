# Nitshift

A powerful multi-monitor brightness management application for Windows with native hardware control and intelligent scheduling.

## Features

### Dual Brightness Control
- **Native Mode** — Direct hardware control via DDC-CI protocol for zero-latency adjustments
- **Software Mode** — Overlay-based dimming for monitors without DDC-CI support
- Mix and match modes across different displays

### Multi-Monitor Management
- Individual brightness control per display
- Batch operations with multi-select
- Custom nicknames for easy identification
- Automatic detection of display changes

### Smart Scheduling
- **Time-based** — Set brightness levels for specific times of day
- **Solar-aware** — Automatic adjustments at sunrise, sunset, golden hour, and more
- Automatic location detection for solar calculations

### Presets & Modes
- Save and recall custom brightness configurations
- Quick switching between work, movie, and custom profiles
- Per-monitor or global preset application

### Unobtrusive Design
- Compact and expanded view modes
- System tray operation
- Windows startup integration

## Installation

Download the latest installer from [Releases](https://github.com/carlelieser/nitshift/releases).

### Development Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build application
npm run build

# Package installer
npm run make
```

## Requirements

- Windows 10/11
- For native brightness: Monitors with DDC-CI support (most modern displays)
- For software brightness: Any display

> **Note:** DDC-CI may need to be enabled in your monitor's OSD settings. Software mode works as a fallback for displays without DDC-CI support.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Desktop | Electron |
| UI | React + Material-UI |
| State | Redux Toolkit |
| Language | TypeScript |
| Build | Electron Vite |
| Brightness | [lumi-control](https://github.com/carlelieser/lumi-control) |

## Troubleshooting

**Native brightness not working?**
- Ensure DDC-CI is enabled in your monitor's settings menu
- Try using a different video cable (DisplayPort/HDMI recommended)
- Some laptop displays don't support DDC-CI — use software mode instead

**Multiple monitors not detected?**
- Disconnect and reconnect displays
- Restart the application after connecting new monitors

## License

MIT

# shot

Screenshots that paste into the right thing.

A lightweight take on [Screenshot for Chat](https://github.com/obra/ScreenshotForChat). Capture a region, window, or screen. The **image** goes to visual apps. The **temp path** goes to your coding agent. One command to install — no brew, no Swift, no Apple Silicon requirement.

**Page:** [obliviousodin.github.io/shot](https://obliviousodin.github.io/shot/)

## Install

```sh
curl -fsSL https://obliviousodin.github.io/shot/install.sh | sh
```

Drops `~/.local/bin/shot`. Add that directory to `PATH` if it is not already.

## Usage

```sh
shot        # drag a region (default)
shot -w     # click a window
shot -f     # full screen
shot -h     # help
```

After capture:

- Image-aware apps (Slack, Messages, Figma) receive the PNG
- Text-aware apps (terminals, Claude Code, agents) receive the file path
- The path is also printed to stdout

Files land in `$TMPDIR` as `shot-YYYYMMDD-HHMMSS.png`. Do not depend on them lasting an hour.

## Requirements

**macOS** — `screencapture` (built in). Dual clipboard via AppKit: PNG + path on the same pasteboard.

**Linux** — one capture backend and one clipboard tool:

| Role | Tools |
| --- | --- |
| Capture | `grim` + `slurp` (Wayland), `maim`, `gnome-screenshot`, `scrot`, or ImageMagick `import` |
| Clipboard | `wl-copy` (Wayland) or `xclip` / `xsel` (X11) |

On Linux the image goes to the clipboard and the path goes to the primary selection.

## Browser workspace

This repo also has an in-browser capture tool (paste, drop, or screen share) with the same smart clipboard. Open the [GitHub Page](https://obliviousodin.github.io/shot/) or run the app locally:

```sh
npm install
npm run dev
```

## License

MIT. Inspired by Jesse Vincent’s Screenshot for Chat.

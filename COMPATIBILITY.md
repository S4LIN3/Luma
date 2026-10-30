# Desktop Compatibility Matrix

This document outlines compatibility across Linux distributions, desktop environments, display servers, and system components for **Luma**.

---

## 1. Operating System Support Matrix

| Distribution | Version | Tier | Status | Notes |
|---|---|---|---|---|
| **Pop!_OS** | **24.04 LTS** | **Tier 1** | **Primary Target** | Native COSMIC desktop, full PipeWire & NetworkManager integration |
| **Ubuntu** | 24.04 LTS | Tier 1 | Supported | GNOME desktop default; full WebKitGTK 4.1 support |
| **Fedora** | 40 / 41 | Tier 2 | Supported | PipeWire default; require standard WebKitGTK devel packages |
| **Arch Linux** | Rolling | Tier 2 | Supported | Up-to-date Rust and Bun toolchains |
| **Debian** | 12 (Bookworm) | Tier 3 | Partial | May require newer Rust toolchain via rustup |

---

## 2. Desktop Environment Compatibility

| Desktop Environment | Wayland Support | X11 Support | Layer Shell Support | Tier |
|---|---|---|---|---|
| **COSMIC (Pop!_OS)** | ✅ Full | N/A (Wayland native) | ✅ `wlr-layer-shell` via `cosmic-comp` | **Tier 1 (Primary)** |
| **GNOME (46+)** | ✅ Full | ✅ Full | ⚠️ Requires extension or top-level window | Tier 1 |
| **KDE Plasma (6+)** | ✅ Full | ✅ Full | ✅ Layer shell support in KWin | Tier 2 |
| **Sway / Hyprland** | ✅ Full | ❌ (Wayland only) | ✅ Native `wlr-layer-shell` | Tier 2 |
| **XFCE / Cinnamon** | ❌ (X11 only) | ✅ Full | ⚠️ Uses standard X11 dock hints | Tier 3 |

---

## 3. Subsystem Compatibility Matrix

| Subsystem | Primary Implementation | Fallback Implementation | Status |
|---|---|---|---|
| **Audio** | PipeWire Native API | PulseAudio emulation socket (`pulse/native`) | ✅ Full |
| **Media (MPRIS)** | `org.mpris.MediaPlayer2` | Mock / Internal Player state | ✅ Full |
| **Network** | NetworkManager D-Bus | Sysfs net interface `/sys/class/net` | ✅ Full |
| **Bluetooth** | BlueZ D-Bus (`org.bluez`) | Sysfs `/sys/class/bluetooth` | ✅ Full |
| **Power / Battery**| UPower D-Bus (`org.freedesktop.UPower`)| Sysfs `/sys/class/power_supply` | ✅ Full |
| **Notifications** | FreeDesktop Notification Server | Internal Toast Notification Drawer | ✅ Full |
| **Monitors** | Wayland `wl_output` / XDG Portal | Tauri Monitor Enumeration | ✅ Full |

---

## 4. Known Platform Behaviors & Notes

1. **COSMIC Applets & Floating Panels**:
   - COSMIC uses `cosmic-comp`. Luma's animated notch is designed to float below the top panel or replace the top status bar according to user preference.
2. **Wayland Transparency**:
   - Translucent glassmorphism requires compositor support for alpha channel transparency and blur shaders (present in `cosmic-comp` and modern Wayland compositors).
3. **Sandboxed Environments**:
   - When running in sandboxed flatpaks or build environments without active D-Bus session sockets, Luma automatically falls back to sysfs and cached system defaults without failing.

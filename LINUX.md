# Linux Desktop Integration Guide

This guide details the integration requirements, protocols, desktop environments, and Linux subsystems utilized by **Luma**.

---

## 1. Target Environment: Pop!_OS 24.04 & COSMIC

Luma is engineered primarily for **Pop!_OS 24.04 LTS (Noble)** running the **COSMIC Desktop Environment**.

| Component | Target Specification |
|---|---|
| **Operating System** | Pop!_OS 24.04 LTS (Ubuntu 24.04 derivative) |
| **Compositor** | `cosmic-comp` (Wayland compositor built with Smithay) |
| **Display Protocol** | Wayland (`wayland-1`) |
| **Audio Subsystem** | PipeWire 1.0+ with WirePlumber session manager |
| **Network Daemon** | NetworkManager 1.46+ |
| **Bluetooth Daemon** | BlueZ 5.72+ |
| **Power Management**| UPower 1.90+ & Linux kernel `/sys/class/power_supply` |

---

## 2. Display Protocols: Wayland & X11

### 2.1. Wayland Considerations
Under Wayland, window management departs fundamentally from X11:
- **No Global Coordinates**: Applications cannot arbitrarily position themselves on screen using standard `xdg-shell` toplevels.
- **Layer Shell (`wlr-layer-shell-unstable-v1`)**: Used by compositors like `cosmic-comp`, Sway, and Hyprland for panels, docks, and desktop widgets. Allows surfaces to anchor to screen edges (Top for Notch, Bottom for Dock) and reserve desktop margins (exclusive zones).
- **Tauri 2 on Wayland**: Tauri uses GTK3 and WebKitGTK on Linux. In Phase 1, Luma launches with a modern translucent window configured with decorations and transparent backgrounds. In subsequent phases, native Wayland layer-shell protocol bindings can be leveraged directly for floating panels.

### 2.2. X11 Fallback
When running under X11 (`DISPLAY` set):
- Standard EWMH/NetWM hints (`_NET_WM_WINDOW_TYPE_DOCK`, `_NET_WM_STATE_ABOVE`, `_NET_WM_STRUT_PARTIAL`) allow docks and notches to claim exclusive screen area and sit permanently above normal windows.
- Luma detects whether Wayland or X11 is running at startup via `detect_platform()` and adapts its behavior accordingly.

---

## 3. Linux Subsystem Interfaces

### 3.1. D-Bus Session & System Bus
Luma connects to D-Bus for IPC with system daemons and other desktop applications:
- **Session Bus (`$DBUS_SESSION_BUS_ADDRESS` or `/run/user/<uid>/bus`)**:
  - MPRIS media player controls
  - Notification listeners
  - Screen / portal requests
- **System Bus (`/var/run/dbus/system_bus_socket`)**:
  - NetworkManager: Network configuration & wireless device queries
  - BlueZ: Bluetooth controller & peripheral state
  - UPower: Power supply, battery levels, and AC adapter status

### 3.2. Media Playback (MPRIS)
- **Interface**: `org.mpris.MediaPlayer2` and `org.mpris.MediaPlayer2.Player`
- **Discovery**: Enumerates names on the session bus matching `org.mpris.MediaPlayer2.*` (e.g., `org.mpris.MediaPlayer2.spotify`, `org.mpris.MediaPlayer2.firefox`).
- **Capabilities**:
  - Methods: `PlayPause`, `Next`, `Previous`, `Stop`, `Seek`
  - Properties: `PlaybackStatus` ("Playing", "Paused", "Stopped"), `Metadata` (`xesam:title`, `xesam:artist`, `xesam:album`, `mpris:artUrl`, `mpris:length`).

### 3.3. Audio Control (PipeWire / WirePlumber & pactl)
- **Primary Interface**: PipeWire CLI / WirePlumber session manager (`wpctl`).
- **Secondary Interface**: PulseAudio compatibility socket (`pactl` with JSON output formatting).
- **Capabilities**:
  - Sink and source enumeration with active default detection.
  - Volume retrieval and adjustment without elevated permissions (`wpctl get-volume @DEFAULT_AUDIO_SINK@`, `wpctl set-volume @DEFAULT_AUDIO_SINK@ <level>`).
  - Mute state toggling (`wpctl set-mute @DEFAULT_AUDIO_SINK@ toggle`).
  - Dynamic input/output audio endpoint switching (`wpctl set-default <id>`, `pactl set-default-sink <name>`).

### 3.4. Network Connectivity (NetworkManager)
- **Interface**: `org.freedesktop.NetworkManager` on the system bus & `nmcli`.
- **Capabilities**:
  - Wi-Fi radio status monitoring and toggling (`nmcli radio wifi [on|off]`).
  - Active connection inspection (SSID, signal strength %, IP address, interface).
  - Nearby access point discovery (`nmcli -t -f SSID,SIGNAL,SECURITY,ACTIVE dev wifi`).

### 3.5. Bluetooth (BlueZ)
- **Interface**: `org.bluez` on the system bus & `bluetoothctl`.
- **Capabilities**:
  - Controller state detection (`Powered`, `Discovering`, `Alias`).
  - Adapter power toggling (`bluetoothctl power [on|off]`).
  - Paired and connected peripheral enumeration with battery level detection.
  - Connect / disconnect peripheral handling (`bluetoothctl connect <mac>`, `bluetoothctl disconnect <mac>`).

### 3.6. Power & Battery (UPower & Sysfs)
- **Primary Interface**: `org.freedesktop.UPower` on the system bus & `upower -i <device>`.
- **Fallback Interface**: Direct Linux kernel sysfs scanning under `/sys/class/power_supply/BAT*/`:
  - `capacity`: percentage (0 - 100)
  - `status`: "Charging", "Discharging", "Full", "Not charging"
  - `energy_now` and `power_now`: Real-time remaining battery time calculation (`(energy_now / power_now) * 60`).
  - Kernel platform power profile detection (`/sys/firmware/acpi/platform_profile` or `powerprofilesctl`).

### 3.7. Screen Backlight & Brightness (systemd-logind D-Bus & Sysfs)
- **Primary Interface**: `org.freedesktop.login1.Session.SetBrightness` on the system bus (`org.freedesktop.login1 /org/freedesktop/login1/session/auto`).
- **Permissions**: Requires **NO** root / sudo privileges; systemd-logind grants the active graphical session user permission to adjust backlight devices.
- **Device Discovery**: Enumerates hardware backlight controllers under `/sys/class/backlight/*` (e.g., `intel_backlight`, `amdgpu_bl0`).
- **Fallback Interfaces**:
  - Direct sysfs write if user has write permissions (e.g. `video` group membership or udev rule).
  - `brightnessctl` command integration if installed.

### 3.8. Desktop Notifications
- **Interface**: `org.freedesktop.Notifications` on the session bus.
- **Capabilities**: Receive and display transient toast notifications or query notification history.

### 3.9. Monitor Management
- **Wayland**: Monitored via Wayland `wl_output` and `wlr-output-management-unstable-v1` or `xdg-desktop-portal` display properties.
- **Capabilities**: Query display dimensions, physical size, refresh rate, and scale factor for correct notch/dock placement.

---

## 4. Required Linux System Packages

On Pop!_OS 24.04 / Ubuntu 24.04, install the following packages for building and running Luma:

```bash
sudo apt update
sudo apt install -y \
  build-essential \
  pkg-config \
  libssl-dev \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

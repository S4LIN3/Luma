# Luma

> Your Desktop, In Motion. Minimal, fluid, and elegant Linux desktop application featuring an animated notch, customizable dock, system controls and productivity tools.

[![Platform](https://img.shields.io/badge/Platform-Linux%20%7C%20Pop!_OS%2024.04-orange)](https://system76.com/pop)
[![Desktop](https://img.shields.io/badge/Desktop-COSMIC%20Native-blue)](https://github.com/pop-os/cosmic-epoch)
[![Backend](https://img.shields.io/badge/Backend-Rust-red)](https://www.rust-lang.org/)
[![Framework](https://img.shields.io/badge/Framework-Tauri%202-brightgreen)](https://v2.tauri.app/)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-blue)](https://react.dev/)
[![Tooling](https://img.shields.io/badge/Package%20Manager-Bun-black)](https://bun.sh/)
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8)](https://tailwindcss.com/)

---

## 🌟 Overview

**Luma** is built from the ground up to bring modern, fluid desktop experiences to Linux. Designed with a primary focus on **Pop!_OS 24.04 LTS** and the **COSMIC Desktop Environment**, Luma seamlessly interfaces with native Linux subsystems (Wayland, PipeWire, NetworkManager, BlueZ, UPower, and FreeDesktop MPRIS).

### Key Architectural Pillars
- **Dynamic Animated Notch**: Floating top capsule that adapts dynamically to system state, active media playback, and incoming alerts.
- **Customizable Dock**: Floating dock with icon magnification, running app status indicators, and configurable orientation.
- **System Controls**: Native integration with MPRIS (Media), PipeWire (Audio), NetworkManager (Wi-Fi/Ethernet), BlueZ (Bluetooth), UPower (Battery), and FreeDesktop Notifications.
- **Multi-Monitor Management**: Per-monitor display geometry, scaling factor detection, and multi-display arrangement support.
- **Strict Separation of Concerns**: Modular Rust backend architecture separated into core, platform layers, and domain feature modules paired with a reactive TypeScript frontend.

---

## 🏗️ Project Architecture

```
Luma/
├── src/                          # Frontend Application (React + TypeScript + Tailwind)
│   ├── core/                     # Application Core (Services, Hooks, Domain Types)
│   ├── components/common/        # Reusable UI Primitives (Card, Button, Badge, Slider, Toggle)
│   ├── features/                 # Modular Feature Implementations
│   │   ├── notch/                # Animated Dynamic Notch & Capsule
│   │   ├── dock/                 # Floating Dock & App Launcher
│   │   ├── settings/             # User Preferences & Personalization
│   │   ├── media/                # MPRIS Media Player Integration
│   │   ├── audio/                # PipeWire / PulseAudio Volume & Sinks
│   │   ├── network/              # NetworkManager Wi-Fi & Ethernet
│   │   ├── bluetooth/            # BlueZ Adapter & Paired Devices
│   │   ├── battery/              # UPower & Sysfs Power Statistics
│   │   ├── notifications/        # FreeDesktop Notification Center
│   │   └── monitors/             # Multi-Display Management & Bounds
│   ├── App.tsx                   # Main Workspace Layout Shell
│   └── main.tsx                  # React Application Entrypoint
├── src-tauri/                    # Backend Application (Rust + Tauri 2)
│   ├── src/
│   │   ├── core/                 # Shared State, Configuration, Error Types, Events
│   │   ├── platform/             # OS & Display Detection (Linux, Wayland, COSMIC)
│   │   │   ├── linux/            # Subsystem Sockets, D-Bus, Sysfs Hooks
│   │   │   └── cosmic/           # COSMIC Desktop Epoch 1 Protocols
│   │   ├── features/             # Rust Feature Controllers & IPC Handlers
│   │   ├── lib.rs                # Tauri State & Command Registration
│   │   └── main.rs               # Binary Entrypoint
│   ├── capabilities/             # Tauri 2 Permission Sets
│   ├── tauri.conf.json           # Tauri 2 Application Manifest
│   └── Cargo.toml                # Rust Dependencies
├── ARCHITECTURE.md           # Full Architecture & IPC Contract
├── LINUX.md                  # Linux Desktop & Subsystem Details
├── COMPATIBILITY.md          # Desktop Environments & Display Server Matrix
├── BUILD.md                  # Development & Compilation Guide
└── package.json              # Frontend Manifest (Bun)
```

For complete architectural details, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 🚀 Quick Start

### Prerequisites
- **Pop!_OS 24.04 LTS** (or Ubuntu 24.04+ / modern Linux)
- **Rust & Cargo** (1.75+)
- **Bun** (1.0+)
- **System Libraries**: `libwebkit2gtk-4.1-dev`, `libgtk-3-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/salmanm/Luma.git
cd Luma

# Install frontend dependencies with Bun
bun install

# Run frontend tests
bun test

# Launch Luma in development mode
bun run tauri dev
```

For full build and packaging instructions, refer to [BUILD.md](BUILD.md).

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

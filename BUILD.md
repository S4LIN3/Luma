# Luma Build & Development Guide

This guide walks through configuring the build environment, developing, testing, and compiling **Luma** on Pop!_OS and compatible Linux distributions.

---

## 1. Prerequisites

### 1.1. Toolchains
Ensure you have the latest stable versions of Rust and Bun:

- **Rust & Cargo** (>= 1.75):
  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  rustup default stable
  ```
- **Bun** (>= 1.0):
  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```

### 1.2. Linux System Dependencies
On Pop!_OS 24.04 LTS (or Ubuntu 24.04 LTS):

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

---

## 2. Setting Up the Project

Clone and install dependencies:

```bash
git clone https://github.com/salmanm/Luma.git
cd Luma

# Install frontend dependencies using Bun
bun install
```

---

## 3. Development Workflow

### 3.1. Frontend Development Server (Browser / Fast Refresh)
To test the React UI, animations, and Tailwind styling in your browser with mock backend fallbacks:

```bash
bun run dev
```
Open [http://localhost:1420](http://localhost:1420) in your browser.

### 3.2. Full Desktop Application (Tauri 2 + Native Backend)
To compile the Rust backend and launch Luma as a native Wayland/X11 application:

```bash
bun run tauri dev
```

### 3.3. Rust Backend Checks
To quickly verify Rust compilation without launching the full GUI:

```bash
cd src-tauri
cargo check
cargo test
cd ..
```

---

## 4. Testing & Code Quality

### 4.1. Frontend Tests & Linting
```bash
# Run Vitest test suite
bun test

# Run TypeScript type check
bun run build

# Run ESLint
bun run lint
```

### 4.2. Backend Tests
```bash
# Run all Rust unit tests
cargo test --manifest-path src-tauri/Cargo.toml
```

---

## 5. Building for Production

To create an optimized binary and native Linux bundle:

```bash
bun run tauri build
```

The resulting deb package and binary will be generated in:
```
src-tauri/target/release/luma-desktop
src-tauri/target/release/bundle/deb/
```

---

## 6. Troubleshooting

- **`pkg-config` cannot find `webkit2gtk-4.1`**:
  Ensure `libwebkit2gtk-4.1-dev` is installed. Check with:
  ```bash
  pkg-config --modversion webkit2gtk-4.1
  ```
- **Wayland Window Decoration / Transparency Issues**:
  If running in a custom Wayland environment without an active compositor blur plugin, ensure transparency is handled by the window manager or toggle `blur_effects` in Luma settings.

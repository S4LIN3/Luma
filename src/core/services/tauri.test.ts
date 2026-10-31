import { describe, it, expect } from "vitest";
import { LumaApi, isTauriEnvironment } from "./tauri";

describe("LumaApi Service", () => {
  it("detects environment mode safely", () => {
    expect(typeof isTauriEnvironment()).toBe("boolean");
  });

  it("returns platform information", async () => {
    const info = await LumaApi.getPlatformInfo();
    expect(info).toBeDefined();
    expect(info.os_name).toContain("Pop!_OS");
  });

  it("handles notch mode toggle", async () => {
    const initial = await LumaApi.getNotchState();
    expect(initial.mode).toBe("Compact");

    const updated = await LumaApi.setNotchMode("Expanded");
    expect(updated.mode).toBe("Expanded");
  });

  it("handles dock configuration and application discovery", async () => {
    const dock = await LumaApi.getDockConfig();
    expect(dock.items.length).toBeGreaterThan(0);

    const apps = await LumaApi.discoverApplications();
    expect(Array.isArray(apps)).toBe(true);
    expect(apps.length).toBeGreaterThan(0);

    const pinned = await LumaApi.pinApplication("new-app.desktop");
    expect(pinned.items.some((i) => i.id === "new-app.desktop")).toBe(true);

    const unpinned = await LumaApi.unpinApplication("new-app.desktop");
    expect(unpinned.items.some((i) => i.id === "new-app.desktop")).toBe(false);

    const reordered = await LumaApi.reorderDockItems([dock.items[0].id]);
    expect(reordered.items.length).toBeGreaterThan(0);

    const updatedSettings = await LumaApi.updateDockSettings({ icon_size: 60, spacing: 10 });
    expect(updatedSettings.icon_size).toBe(60);
    expect(updatedSettings.spacing).toBe(10);
  });

  it("handles audio controls and volume adjustment", async () => {
    const audio = await LumaApi.getAudioStatus();
    expect(audio.volume).toBeGreaterThanOrEqual(0);
    expect(audio.available_sinks.length).toBeGreaterThan(0);

    const changed = await LumaApi.setVolume(75);
    expect(changed.volume).toBe(75);

    const muted = await LumaApi.toggleMute();
    expect(muted.is_muted).toBe(!audio.is_muted);
  });

  it("handles network status and wifi toggle", async () => {
    const net = await LumaApi.getNetworkStatus();
    expect(net.network_type).toBe("WiFi");
    expect(net.wifi_enabled).toBe(true);

    const toggled = await LumaApi.toggleWifi();
    expect(toggled.wifi_enabled).toBe(false);

    const scan = await LumaApi.scanWifiNetworks();
    expect(Array.isArray(scan)).toBe(true);
  });

  it("handles bluetooth status and toggle", async () => {
    const bt = await LumaApi.getBluetoothStatus();
    expect(bt.adapter_name).toBeDefined();

    const toggled = await LumaApi.toggleBluetooth();
    expect(toggled.is_enabled).toBe(!bt.is_enabled);
  });

  it("handles battery status and telemetry", async () => {
    const bat = await LumaApi.getBatteryStatus();
    expect(bat.percentage).toBeGreaterThanOrEqual(0);
    expect(bat.percentage).toBeLessThanOrEqual(100);
    expect(bat.is_present).toBe(true);
  });

  it("handles display brightness query and adjustment", async () => {
    const bright = await LumaApi.getBrightnessStatus();
    expect(bright.is_supported).toBe(true);
    expect(bright.percentage).toBeGreaterThanOrEqual(0);

    const updated = await LumaApi.setBrightness(60);
    expect(updated.percentage).toBe(60);
  });
});

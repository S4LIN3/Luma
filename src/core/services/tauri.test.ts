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

  it("handles dock configuration", async () => {
    const dock = await LumaApi.getDockConfig();
    expect(dock.items.length).toBeGreaterThan(0);
  });
});

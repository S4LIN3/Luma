import { invoke } from "@tauri-apps/api/core";
import {
  PlatformInfo,
  NotchState,
  NotchMode,
  DockConfig,
  DockPosition,
  UserSettings,
  MediaStatus,
  AudioStatus,
  NetworkStatus,
  BluetoothStatus,
  BatteryStatus,
  NotificationState,
  MonitorConfiguration,
  SurfaceType,
  SurfaceGeometry,
  SurfaceManagerStatus,
  VisualizerBands,
  BrightnessStatus,
  WifiAccessPoint,
  DiscoveredApp,
  DockSettingsUpdate,
} from "../types";

export const isTauriEnvironment = (): boolean => {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
};

// Mock fallbacks when running outside Tauri (e.g. Vite dev or tests)
const mockPlatformInfo: PlatformInfo = {
  os_name: "Pop!_OS 24.04 LTS",
  os_version: "24.04",
  kernel_version: "Linux 7.2.6-76070206-generic",
  display_server: "Wayland",
  desktop_environment: "COSMIC",
  is_cosmic: true,
  is_wayland: true,
};

const mockNotchState: NotchState = {
  mode: "Compact",
  geometry: {
    width: 220,
    height: 38,
    border_radius: 20,
    margin_top: 8,
    expanded_width: 440,
    expanded_height: 160,
  },
  is_visible: true,
  is_hovered: false,
  active_title: "Luma Desktop",
  active_subtitle: "Ready",
};

const mockDockConfig: DockConfig = {
  position: "Bottom",
  icon_size: 52,
  spacing: 8,
  autohide: false,
  magnification: true,
  magnification_scale: 1.25,
  separate_pinned_and_running: true,
  items: [
    {
      id: "com.system76.CosmicFiles.desktop",
      title: "COSMIC Files",
      icon: "com.system76.CosmicFiles",
      command: "cosmic-files",
      is_pinned: true,
      is_running: false,
      active_instances: 0,
    },
    {
      id: "brave-browser.desktop",
      title: "Brave Web Browser",
      icon: "brave-browser",
      command: "brave-browser",
      is_pinned: true,
      is_running: true,
      active_instances: 1,
    },
    {
      id: "com.system76.CosmicTerm.desktop",
      title: "COSMIC Terminal",
      icon: "com.system76.CosmicTerm",
      command: "cosmic-term",
      is_pinned: true,
      is_running: true,
      active_instances: 1,
    },
    {
      id: "com.system76.CosmicSettings.desktop",
      title: "COSMIC Settings",
      icon: "com.system76.CosmicSettings",
      command: "cosmic-settings",
      is_pinned: true,
      is_running: false,
      active_instances: 0,
    },
  ],
};

const mockSettings: UserSettings = {
  theme_mode: "dark",
  accent_color: "#6366f1",
  enable_notch: true,
  enable_dock: true,
  sound_effects: true,
  low_power_mode: false,
  blur_effects: true,
};

const mockMediaStatus: MediaStatus = {
  active_player: "Pop!_OS Player",
  playback_state: "Playing",
  current_track: {
    title: "Cosmic Resonance",
    artist: "Luma Ambient",
    album: "Pop Epoch",
    duration_seconds: 214,
    position_seconds: 78,
  },
  can_go_next: true,
  can_go_previous: true,
  can_play_pause: true,
};

const mockAudioStatus: AudioStatus = {
  volume: 80,
  is_muted: false,
  default_sink: {
    id: "alsa_output.pci-0000_00_1f.3.analog-stereo",
    name: "Built-in Audio Analog Stereo",
    description: "Built-in Audio Analog Stereo",
    is_default: true,
    is_sink: true,
    volume: 80,
    is_muted: false,
  },
  default_source: {
    id: "alsa_input.pci-0000_00_1f.3.analog-stereo",
    name: "Built-in Microphone",
    description: "Internal Audio Microphone",
    is_default: true,
    is_sink: false,
    volume: 50,
    is_muted: false,
  },
  available_sinks: [
    {
      id: "alsa_output.pci-0000_00_1f.3.analog-stereo",
      name: "Built-in Audio Analog Stereo",
      description: "Built-in Audio Analog Stereo",
      is_default: true,
      is_sink: true,
      volume: 80,
      is_muted: false,
    },
    {
      id: "bluez_output",
      name: "jlab jbuds lux anc",
      description: "Bluetooth Headphones",
      is_default: false,
      is_sink: true,
      volume: 85,
      is_muted: false,
    },
  ],
  available_sources: [
    {
      id: "alsa_input.pci-0000_00_1f.3.analog-stereo",
      name: "Built-in Microphone",
      description: "Internal Audio Microphone",
      is_default: true,
      is_sink: false,
      volume: 50,
      is_muted: false,
    },
  ],
  backend: "PipeWire",
};

const mockNetworkStatus: NetworkStatus = {
  network_type: "WiFi",
  is_connected: true,
  ssid: "keralavision(kcn)",
  signal_strength: 84,
  ip_address: "192.168.1.7",
  interface_name: "wlp0s20f3",
  wifi_enabled: true,
  available_networks: [
    { ssid: "keralavision(kcn)", signal_strength: 84, security: "WPA2", is_active: true },
    { ssid: "Shine broadband_EXT", signal_strength: 40, security: "WPA2", is_active: false },
  ],
};

const mockBluetoothStatus: BluetoothStatus = {
  is_enabled: true,
  is_scanning: false,
  adapter_name: "salman",
  devices: [
    {
      name: "jlab jbuds lux anc",
      address: "7B:88:11:11:B1:9E",
      is_connected: false,
      is_paired: true,
      battery_percentage: 85,
      icon: "audio-headset",
    },
    {
      name: "Airdopes Alpha",
      address: "A5:A1:F4:EF:74:4B",
      is_connected: false,
      is_paired: true,
      battery_percentage: null,
      icon: "audio-headset",
    },
  ],
};

const mockBrightnessStatus: BrightnessStatus = {
  percentage: 75,
  current_device: {
    name: "intel_backlight",
    current: 20000,
    max: 26666,
    percentage: 75,
    device_type: "raw",
    is_writable: false,
  },
  available_devices: [
    {
      name: "intel_backlight",
      current: 20000,
      max: 26666,
      percentage: 75,
      device_type: "raw",
      is_writable: false,
    },
  ],
  backend: "systemd-logind",
  is_supported: true,
};

const mockBatteryStatus: BatteryStatus = {
  percentage: 88,
  state: "Discharging",
  time_to_empty_minutes: 260,
  power_profile: "balanced",
  is_present: true,
};

const mockNotifications: NotificationState = {
  items: [
    {
      id: 1,
      app_name: "COSMIC Settings",
      summary: "System Update Available",
      body: "Pop!_OS 24.04 security patches are ready to install.",
      icon: "Sparkles",
      urgency: "Normal",
      timestamp: 1729000000,
    },
    {
      id: 2,
      app_name: "Calendar",
      summary: "Sprint Architecture Review",
      body: "Starting in 15 minutes in room Orbit.",
      icon: "Calendar",
      urgency: "Low",
      timestamp: 1729003600,
    },
  ],
  do_not_disturb: false,
};

const mockMonitors: MonitorConfiguration = {
  primary_monitor_id: "eDP-1",
  monitors: [
    {
      id: "eDP-1",
      name: "Built-in Display (eDP-1)",
      width: 2560,
      height: 1600,
      x: 0,
      y: 0,
      scale_factor: 1.25,
      refresh_rate_hz: 120,
      is_primary: true,
    },
    {
      id: "DP-2",
      name: "External 4K Monitor (DP-2)",
      width: 3840,
      height: 2160,
      x: 2560,
      y: 0,
      scale_factor: 1.5,
      refresh_rate_hz: 60,
      is_primary: false,
    },
  ],
};

export const LumaApi = {
  getPlatformInfo: async (): Promise<PlatformInfo> => {
    if (!isTauriEnvironment()) return mockPlatformInfo;
    return await invoke<PlatformInfo>("get_platform_info");
  },

  getNotchState: async (): Promise<NotchState> => {
    if (!isTauriEnvironment()) return mockNotchState;
    return await invoke<NotchState>("get_notch_state");
  },

  setNotchMode: async (mode: NotchMode): Promise<NotchState> => {
    if (!isTauriEnvironment()) return { ...mockNotchState, mode };
    return await invoke<NotchState>("set_notch_mode", { mode });
  },

  getDockConfig: async (): Promise<DockConfig> => {
    if (!isTauriEnvironment()) return mockDockConfig;
    return await invoke<DockConfig>("get_dock_config");
  },

  setDockPosition: async (position: DockPosition): Promise<DockConfig> => {
    if (!isTauriEnvironment()) return { ...mockDockConfig, position };
    return await invoke<DockConfig>("set_dock_position", { position });
  },

  discoverApplications: async (): Promise<DiscoveredApp[]> => {
    if (!isTauriEnvironment()) {
      return mockDockConfig.items.map((it) => ({
        id: it.id,
        name: it.title,
        icon_name: it.icon,
        icon_data_url: it.icon_data_url,
        exec: it.command || it.id,
        desktop_file: `/usr/share/applications/${it.id}`,
        categories: ["Utility"],
        keywords: [it.title],
        is_terminal: false,
        is_pinned: it.is_pinned,
        is_running: it.is_running,
        active_instances: it.active_instances,
      }));
    }
    return await invoke<DiscoveredApp[]>("discover_applications");
  },

  launchApplication: async (desktopId: string): Promise<void> => {
    if (!isTauriEnvironment()) {
      console.log(`[Mock] Launching application ${desktopId}`);
      return;
    }
    await invoke("launch_application", { desktopId });
  },

  pinApplication: async (desktopId: string, targetIndex?: number): Promise<DockConfig> => {
    if (!isTauriEnvironment()) {
      const exists = mockDockConfig.items.some((i) => i.id === desktopId);
      if (!exists) {
        mockDockConfig.items.push({
          id: desktopId,
          title: desktopId.replace(".desktop", ""),
          icon: "application-x-executable",
          is_pinned: true,
          is_running: false,
          active_instances: 0,
        });
      }
      return mockDockConfig;
    }
    return await invoke<DockConfig>("pin_application", { desktopId, targetIndex });
  },

  unpinApplication: async (desktopId: string): Promise<DockConfig> => {
    if (!isTauriEnvironment()) {
      mockDockConfig.items = mockDockConfig.items.filter((i) => i.id !== desktopId);
      return mockDockConfig;
    }
    return await invoke<DockConfig>("unpin_application", { desktopId });
  },

  reorderDockItems: async (orderedIds: string[]): Promise<DockConfig> => {
    if (!isTauriEnvironment()) {
      const itemMap = new Map(mockDockConfig.items.map((i) => [i.id, i]));
      mockDockConfig.items = orderedIds.map((id) => itemMap.get(id)!).filter(Boolean);
      return mockDockConfig;
    }
    return await invoke<DockConfig>("reorder_dock_items", { orderedIds });
  },

  updateDockSettings: async (settings: DockSettingsUpdate): Promise<DockConfig> => {
    if (!isTauriEnvironment()) {
      if (settings.position) mockDockConfig.position = settings.position;
      if (settings.icon_size) mockDockConfig.icon_size = settings.icon_size;
      if (settings.spacing) mockDockConfig.spacing = settings.spacing;
      if (settings.autohide !== undefined) mockDockConfig.autohide = settings.autohide;
      if (settings.magnification !== undefined) mockDockConfig.magnification = settings.magnification;
      if (settings.magnification_scale !== undefined) mockDockConfig.magnification_scale = settings.magnification_scale;
      if (settings.separate_pinned_and_running !== undefined) mockDockConfig.separate_pinned_and_running = settings.separate_pinned_and_running;
      return mockDockConfig;
    }
    return await invoke<DockConfig>("update_dock_settings", { settings });
  },

  getSettings: async (): Promise<UserSettings> => {
    if (!isTauriEnvironment()) return mockSettings;
    return await invoke<UserSettings>("get_settings");
  },

  updateSettings: async (settings: UserSettings): Promise<UserSettings> => {
    if (!isTauriEnvironment()) return settings;
    return await invoke<UserSettings>("update_settings", { settings });
  },

  getMediaStatus: async (): Promise<MediaStatus> => {
    if (!isTauriEnvironment()) return mockMediaStatus;
    return await invoke<MediaStatus>("get_media_status");
  },

  toggleMediaPlayPause: async (): Promise<MediaStatus> => {
    if (!isTauriEnvironment()) {
      return {
        ...mockMediaStatus,
        playback_state: mockMediaStatus.playback_state === "Playing" ? "Paused" : "Playing",
      };
    }
    return await invoke<MediaStatus>("media_play_pause");
  },

  getAudioStatus: async (): Promise<AudioStatus> => {
    if (!isTauriEnvironment()) return mockAudioStatus;
    return await invoke<AudioStatus>("get_audio_status");
  },

  setVolume: async (volume: number): Promise<AudioStatus> => {
    if (!isTauriEnvironment()) return { ...mockAudioStatus, volume };
    return await invoke<AudioStatus>("set_volume", { volume });
  },

  toggleMute: async (): Promise<AudioStatus> => {
    if (!isTauriEnvironment()) return { ...mockAudioStatus, is_muted: !mockAudioStatus.is_muted };
    return await invoke<AudioStatus>("toggle_mute");
  },

  setAudioDefaultEndpoint: async (endpointId: string, isSink: boolean): Promise<AudioStatus> => {
    if (!isTauriEnvironment()) return mockAudioStatus;
    return await invoke<AudioStatus>("set_audio_default_endpoint", {
      endpointId,
      isSink,
    });
  },

  toggleWifi: async (): Promise<NetworkStatus> => {
    if (!isTauriEnvironment()) return { ...mockNetworkStatus, wifi_enabled: !mockNetworkStatus.wifi_enabled };
    return await invoke<NetworkStatus>("toggle_wifi");
  },

  setWifiEnabled: async (enabled: boolean): Promise<NetworkStatus> => {
    if (!isTauriEnvironment()) return { ...mockNetworkStatus, wifi_enabled: enabled };
    return await invoke<NetworkStatus>("set_wifi_enabled", { enabled });
  },

  scanWifiNetworks: async (): Promise<WifiAccessPoint[]> => {
    if (!isTauriEnvironment()) return mockNetworkStatus.available_networks;
    return await invoke<WifiAccessPoint[]>("scan_wifi_networks");
  },

  setBluetoothEnabled: async (enabled: boolean): Promise<BluetoothStatus> => {
    if (!isTauriEnvironment()) return { ...mockBluetoothStatus, is_enabled: enabled };
    return await invoke<BluetoothStatus>("set_bluetooth_enabled", { enabled });
  },

  connectBluetoothDevice: async (address: string): Promise<BluetoothStatus> => {
    if (!isTauriEnvironment()) return mockBluetoothStatus;
    return await invoke<BluetoothStatus>("connect_bluetooth_device", { address });
  },

  disconnectBluetoothDevice: async (address: string): Promise<BluetoothStatus> => {
    if (!isTauriEnvironment()) return mockBluetoothStatus;
    return await invoke<BluetoothStatus>("disconnect_bluetooth_device", { address });
  },

  getBrightnessStatus: async (): Promise<BrightnessStatus> => {
    if (!isTauriEnvironment()) return mockBrightnessStatus;
    return await invoke<BrightnessStatus>("get_brightness_status");
  },

  setBrightness: async (percentage: number): Promise<BrightnessStatus> => {
    if (!isTauriEnvironment()) return { ...mockBrightnessStatus, percentage };
    return await invoke<BrightnessStatus>("set_brightness", { percentage });
  },

  getNetworkStatus: async (): Promise<NetworkStatus> => {
    if (!isTauriEnvironment()) return mockNetworkStatus;
    return await invoke<NetworkStatus>("get_network_status");
  },

  getBluetoothStatus: async (): Promise<BluetoothStatus> => {
    if (!isTauriEnvironment()) return mockBluetoothStatus;
    return await invoke<BluetoothStatus>("get_bluetooth_status");
  },

  toggleBluetooth: async (): Promise<BluetoothStatus> => {
    if (!isTauriEnvironment()) return { ...mockBluetoothStatus, is_enabled: !mockBluetoothStatus.is_enabled };
    return await invoke<BluetoothStatus>("toggle_bluetooth");
  },

  getBatteryStatus: async (): Promise<BatteryStatus> => {
    if (!isTauriEnvironment()) return mockBatteryStatus;
    return await invoke<BatteryStatus>("get_battery_status");
  },

  getNotifications: async (): Promise<NotificationState> => {
    if (!isTauriEnvironment()) return mockNotifications;
    return await invoke<NotificationState>("get_notifications");
  },

  dismissNotification: async (id: number): Promise<NotificationState> => {
    if (!isTauriEnvironment()) {
      return {
        ...mockNotifications,
        items: mockNotifications.items.filter((item) => item.id !== id),
      };
    }
    return await invoke<NotificationState>("dismiss_notification", { id });
  },

  clearNotifications: async (): Promise<NotificationState> => {
    if (!isTauriEnvironment()) return { ...mockNotifications, items: [] };
    return await invoke<NotificationState>("clear_notifications");
  },

  getMonitors: async (): Promise<MonitorConfiguration> => {
    if (!isTauriEnvironment()) return mockMonitors;
    return await invoke<MonitorConfiguration>("get_monitors");
  },

  getSurfaceStatus: async (): Promise<SurfaceManagerStatus> => {
    if (!isTauriEnvironment()) {
      return {
        active_surfaces: ["Notch", "Dock", "Settings"],
        primary_monitor_name: "eDP-1",
        primary_monitor_width: 2560,
        primary_monitor_height: 1600,
        scale_factor: 1.25,
        is_wayland: true,
      };
    }
    return await invoke<SurfaceManagerStatus>("get_surface_status");
  },

  getSurfaceGeometry: async (surface: SurfaceType): Promise<SurfaceGeometry> => {
    if (!isTauriEnvironment()) {
      return {
        surface_type: surface,
        width: surface === "Notch" ? 380 : surface === "Dock" ? 540 : 940,
        height: surface === "Notch" ? 48 : surface === "Dock" ? 76 : 680,
        x: 0,
        y: surface === "Notch" ? 8 : surface === "Dock" ? 996 : 200,
        scale_factor: 1.25,
        is_always_on_top: surface !== "Settings",
        is_transparent: surface !== "Settings",
        has_decorations: surface === "Settings",
      };
    }
    return await invoke<SurfaceGeometry>("get_surface_geometry", { surface });
  },

  resizeNotchSurface: async (width: number, height: number): Promise<void> => {
    if (!isTauriEnvironment()) return;
    await invoke("resize_notch_surface", { width, height });
  },

  mediaNext: async (): Promise<MediaStatus> => {
    if (!isTauriEnvironment()) return mockMediaStatus;
    return await invoke<MediaStatus>("media_next");
  },

  mediaPrevious: async (): Promise<MediaStatus> => {
    if (!isTauriEnvironment()) return mockMediaStatus;
    return await invoke<MediaStatus>("media_previous");
  },

  getVisualizerBands: async (): Promise<VisualizerBands> => {
    if (!isTauriEnvironment()) {
      const now = Date.now() / 1000;
      return {
        sub_bass: Math.min(1, Math.max(0.1, Math.sin(now * 3.2) * 0.35 + 0.65)),
        bass: Math.min(1, Math.max(0.1, Math.sin(now * 5.4 + 1.2) * 0.4 + 0.6)),
        midrange: Math.min(1, Math.max(0.1, Math.sin(now * 4.1 + 2.5) * 0.3 + 0.6)),
        upper_mid: Math.min(1, Math.max(0.1, Math.sin(now * 6.8 + 0.8) * 0.25 + 0.5)),
        treble: Math.min(1, Math.max(0.1, Math.sin(now * 8.2 + 3.1) * 0.2 + 0.4)),
        is_live_dsp: false,
      };
    }
    return await invoke<VisualizerBands>("get_visualizer_bands");
  },
};

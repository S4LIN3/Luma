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
  autohide: false,
  magnification: true,
  magnification_scale: 1.25,
  items: [
    { id: "terminal", title: "Cosmic Terminal", icon: "Terminal", is_pinned: true, is_running: true, active_instances: 1 },
    { id: "files", title: "Cosmic Files", icon: "Folder", is_pinned: true, is_running: false, active_instances: 0 },
    { id: "browser", title: "Web Browser", icon: "Globe", is_pinned: true, is_running: true, active_instances: 2 },
    { id: "settings", title: "Luma Settings", icon: "Settings", is_pinned: true, is_running: true, active_instances: 1 },
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
  volume: 68,
  is_muted: false,
  default_sink: { id: "alsa_output.pci", name: "Built-in Audio Analog Stereo", is_default: true },
  available_sinks: [
    { id: "alsa_output.pci", name: "Built-in Audio Analog Stereo", is_default: true },
    { id: "bluez_output", name: "Bluetooth Headphones", is_default: false },
  ],
  backend: "PipeWire",
};

const mockNetworkStatus: NetworkStatus = {
  network_type: "WiFi",
  is_connected: true,
  ssid: "Pop_Studio_5G",
  signal_strength: 84,
  ip_address: "192.168.1.145",
  interface_name: "wlan0",
};

const mockBluetoothStatus: BluetoothStatus = {
  is_enabled: true,
  is_scanning: false,
  adapter_name: "Pop!_OS Bluetooth Adapter",
  devices: [
    { name: "Wireless ANC Headphones", address: "00:1A:7D:DA:71:13", is_connected: true, battery_percentage: 85 },
    { name: "Cosmic Mouse", address: "E4:5F:01:22:98:A1", is_connected: true, battery_percentage: 92 },
  ],
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

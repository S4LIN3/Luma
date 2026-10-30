export type DisplayServer = "Wayland" | "X11" | "Unknown";
export type DesktopEnvironment = "COSMIC" | "GNOME" | "KDE" | "XFCE" | "Other";

export interface PlatformInfo {
  os_name: string;
  os_version: string;
  kernel_version: string;
  display_server: DisplayServer;
  desktop_environment: DesktopEnvironment;
  is_cosmic: boolean;
  is_wayland: boolean;
}

// Surface Integration (Phase 3)
export type SurfaceType = "Notch" | "Dock" | "Settings";

export interface SurfaceGeometry {
  surface_type: SurfaceType;
  width: number;
  height: number;
  x: number;
  y: number;
  scale_factor: number;
  is_always_on_top: boolean;
  is_transparent: boolean;
  has_decorations: boolean;
}

export interface SurfaceManagerStatus {
  active_surfaces: SurfaceType[];
  primary_monitor_name: string;
  primary_monitor_width: number;
  primary_monitor_height: number;
  scale_factor: number;
  is_wayland: boolean;
}

// Visualizer (Phase 5)
export interface VisualizerBands {
  sub_bass: number;
  bass: number;
  midrange: number;
  upper_mid: number;
  treble: number;
  is_live_dsp: boolean;
}

// Notch
export type NotchMode = "Compact" | "Expanded" | "Media" | "Notification" | "Minimal";

export interface NotchGeometry {
  width: number;
  height: number;
  border_radius: number;
  margin_top: number;
  expanded_width: number;
  expanded_height: number;
}

export interface NotchState {
  mode: NotchMode;
  geometry: NotchGeometry;
  is_visible: boolean;
  is_hovered: boolean;
  active_title: string | null;
  active_subtitle: string | null;
}

// Dock
export type DockPosition = "Bottom" | "Left" | "Right" | "Top";

export interface DockItem {
  id: string;
  title: string;
  icon: string;
  command?: string | null;
  is_pinned: boolean;
  is_running: boolean;
  active_instances: number;
}

export interface DockConfig {
  position: DockPosition;
  icon_size: number;
  autohide: boolean;
  magnification: boolean;
  magnification_scale: number;
  items: DockItem[];
}

// Settings
export interface UserSettings {
  theme_mode: string;
  accent_color: string;
  enable_notch: boolean;
  enable_dock: boolean;
  sound_effects: boolean;
  low_power_mode: boolean;
  blur_effects: boolean;
}

// Media
export type PlaybackState = "Playing" | "Paused" | "Stopped";

export interface TrackMetadata {
  title: string;
  artist: string;
  album: string;
  art_url?: string | null;
  duration_seconds: number;
  position_seconds: number;
}

export interface MediaStatus {
  active_player: string | null;
  playback_state: PlaybackState;
  current_track: TrackMetadata | null;
  can_go_next: boolean;
  can_go_previous: boolean;
  can_play_pause: boolean;
}

// Audio
export interface AudioEndpoint {
  id: string;
  name: string;
  is_default: boolean;
}

export interface AudioStatus {
  volume: number;
  is_muted: boolean;
  default_sink: AudioEndpoint;
  available_sinks: AudioEndpoint[];
  backend: string;
}

// Network
export type NetworkType = "WiFi" | "Ethernet" | "Disconnected";

export interface NetworkStatus {
  network_type: NetworkType;
  is_connected: boolean;
  ssid?: string | null;
  signal_strength: number;
  ip_address?: string | null;
  interface_name: string;
}

// Bluetooth
export interface BluetoothDevice {
  name: string;
  address: string;
  is_connected: boolean;
  battery_percentage?: number | null;
}

export interface BluetoothStatus {
  is_enabled: boolean;
  is_scanning: boolean;
  adapter_name: string;
  devices: BluetoothDevice[];
}

// Battery
export type BatteryState = "Charging" | "Discharging" | "Full" | "NotCharging" | "Unknown";

export interface BatteryStatus {
  percentage: number;
  state: BatteryState;
  time_to_empty_minutes?: number | null;
  time_to_full_minutes?: number | null;
  power_profile: string;
  is_present: boolean;
}

// Notifications
export type NotificationUrgency = "Low" | "Normal" | "Critical";

export interface NotificationItem {
  id: number;
  app_name: string;
  summary: string;
  body: string;
  icon: string;
  urgency: NotificationUrgency;
  timestamp: number;
}

export interface NotificationState {
  items: NotificationItem[];
  do_not_disturb: boolean;
}

// Monitors
export interface MonitorInfo {
  id: string;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  scale_factor: number;
  refresh_rate_hz: number;
  is_primary: boolean;
}

export interface MonitorConfiguration {
  primary_monitor_id: string;
  monitors: MonitorInfo[];
}

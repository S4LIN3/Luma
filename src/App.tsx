import { useState } from "react";
import { useLumaSystem } from "./core/hooks/useLumaSystem";
import { NotchIsland } from "./features/notch/NotchIsland";
import { Dock } from "./features/dock/Dock";
import { MediaWidget } from "./features/media/MediaWidget";
import { AudioWidget } from "./features/audio/AudioWidget";
import { NetworkWidget } from "./features/network/NetworkWidget";
import { BluetoothWidget } from "./features/bluetooth/BluetoothWidget";
import { BatteryWidget } from "./features/battery/BatteryWidget";
import { NotificationCenter } from "./features/notifications/NotificationCenter";
import { MonitorManager } from "./features/monitors/MonitorManager";
import { SettingsPanel } from "./features/settings/SettingsPanel";
import { Badge } from "./components/common/Badge";
import { Button } from "./components/ui/Button";
import { ThemeProvider } from "./design-system/ThemeContext";
import { LumaApi } from "./core/services/tauri";
import {
  Sparkles,
  LayoutGrid,
  Settings as SettingsIcon,
  RefreshCw,
  Cpu,
} from "lucide-react";

function AppContent() {
  const {
    platform,
    notch,
    dock,
    setDock,
    settings,
    setSettings,
    media,
    setMedia,
    audio,
    network,
    bluetooth,
    battery,
    brightness,
    setBrightness,
    handleToggleWifi,
    handleToggleBluetooth,
    handleVolumeChange,
    handleToggleMute,
    notifications,
    setNotifications,
    monitors,
    isLoading,
    refreshAll,
  } = useLumaSystem();

  const [activeTab, setActiveTab] = useState<"dashboard" | "settings">("dashboard");

  const handleMediaToggle = async () => {
    const updated = await LumaApi.toggleMediaPlayPause();
    setMedia(updated);
  };

  const handleDismissNotification = async (id: number) => {
    const updated = await LumaApi.dismissNotification(id);
    setNotifications(updated);
  };

  const handleClearNotifications = async () => {
    const updated = await LumaApi.clearNotifications();
    setNotifications(updated);
  };

  const handleUpdateSettings = async (newSettings: any) => {
    const updated = await LumaApi.updateSettings(newSettings);
    setSettings(updated);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between overflow-x-hidden">
      {/* Top Floating Animated Notch (Phase 4) */}
      {notch && settings?.enable_notch && (
        <header className="sticky top-0 z-50 pt-3 flex justify-center w-full pointer-events-auto">
          <NotchIsland
            notch={notch}
            media={media}
            audio={audio}
            network={network}
            bluetooth={bluetooth}
            battery={battery}
            brightness={brightness}
            notifications={notifications}
            onMediaToggle={handleMediaToggle}
            onVolumeChange={handleVolumeChange}
            onToggleMute={handleToggleMute}
            onToggleWifi={handleToggleWifi}
            onToggleBluetooth={handleToggleBluetooth}
            onBrightnessChange={setBrightness}
          />
        </header>
      )}

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* App Title & Quick Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Luma</h1>
                <Badge variant="primary">v0.1.0</Badge>
                {platform?.is_cosmic && <Badge variant="secondary">COSMIC Native</Badge>}
              </div>
              <p className="text-xs text-slate-400">
                Your Desktop, In Motion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === "dashboard" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("dashboard")}
            >
              <LayoutGrid className="w-4 h-4 mr-1.5" />
              Controls
            </Button>
            <Button
              variant={activeTab === "settings" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("settings")}
            >
              <SettingsIcon className="w-4 h-4 mr-1.5" />
              Settings
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={refreshAll}
              disabled={isLoading}
              title="Refresh system state"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Content based on Active Tab */}
        {activeTab === "dashboard" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Real Linux MPRIS Media Player (Phase 5) */}
            <MediaWidget media={media} onTogglePlayPause={handleMediaToggle} />

            {/* PipeWire / PulseAudio Volume Widget */}
            <AudioWidget
              audio={audio}
              onVolumeChange={handleVolumeChange}
              onToggleMute={handleToggleMute}
            />

            {/* Power & Battery Widget */}
            <BatteryWidget battery={battery} />

            {/* NetworkManager Widget */}
            <NetworkWidget network={network} />

            {/* BlueZ Bluetooth Widget */}
            <BluetoothWidget bluetooth={bluetooth} onToggle={handleToggleBluetooth} />

            {/* Monitor Management Widget */}
            <MonitorManager monitors={monitors} />

            {/* Notifications Drawer */}
            <div className="md:col-span-2 lg:col-span-3">
              <NotificationCenter
                notifications={notifications}
                onDismiss={handleDismissNotification}
                onClearAll={handleClearNotifications}
              />
            </div>
          </div>
        ) : (
          settings && (
            <SettingsPanel
              settings={settings}
              platform={platform}
              onUpdate={handleUpdateSettings}
            />
          )
        )}

        {/* System & Architecture Status Footer Card */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>
              {platform?.os_name || "Pop!_OS 24.04"} • {platform?.kernel_version || "Linux"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>Session: {platform?.display_server || "Wayland"}</span>
            <span>Desktop: {platform?.desktop_environment || "COSMIC"}</span>
          </div>
        </div>
      </main>

      {/* Floating Bottom Dock */}
      {dock && settings?.enable_dock && (
        <footer className="sticky bottom-0 z-40 pb-3 flex justify-center w-full pointer-events-auto">
          <Dock
            config={dock}
            onPositionChange={(pos) => {
              LumaApi.setDockPosition(pos).then(setDock);
            }}
            onConfigUpdate={setDock}
          />
        </footer>
      )}
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;

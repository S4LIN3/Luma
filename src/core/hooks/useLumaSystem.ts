import { useState, useEffect, useCallback } from "react";
import {
  PlatformInfo,
  NotchState,
  DockConfig,
  UserSettings,
  MediaStatus,
  AudioStatus,
  NetworkStatus,
  BluetoothStatus,
  BatteryStatus,
  NotificationState,
  MonitorConfiguration,
  BrightnessStatus,
} from "../types";
import { LumaApi } from "../services/tauri";

export function useLumaSystem() {
  const [platform, setPlatform] = useState<PlatformInfo | null>(null);
  const [notch, setNotch] = useState<NotchState | null>(null);
  const [dock, setDock] = useState<DockConfig | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [media, setMedia] = useState<MediaStatus | null>(null);
  const [audio, setAudio] = useState<AudioStatus | null>(null);
  const [network, setNetwork] = useState<NetworkStatus | null>(null);
  const [bluetooth, setBluetooth] = useState<BluetoothStatus | null>(null);
  const [battery, setBattery] = useState<BatteryStatus | null>(null);
  const [brightness, setBrightnessState] = useState<BrightnessStatus | null>(null);
  const [notifications, setNotifications] = useState<NotificationState | null>(null);
  const [monitors, setMonitors] = useState<MonitorConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAll = useCallback(async () => {
    try {
      const [
        pInfo,
        nState,
        dConfig,
        sSettings,
        mStatus,
        aStatus,
        netStatus,
        btStatus,
        bStatus,
        brightStatus,
        notifs,
        monConfig,
      ] = await Promise.all([
        LumaApi.getPlatformInfo(),
        LumaApi.getNotchState(),
        LumaApi.getDockConfig(),
        LumaApi.getSettings(),
        LumaApi.getMediaStatus(),
        LumaApi.getAudioStatus(),
        LumaApi.getNetworkStatus(),
        LumaApi.getBluetoothStatus(),
        LumaApi.getBatteryStatus(),
        LumaApi.getBrightnessStatus(),
        LumaApi.getNotifications(),
        LumaApi.getMonitors(),
      ]);

      setPlatform(pInfo);
      setNotch(nState);
      setDock(dConfig);
      setSettings(sSettings);
      setMedia(mStatus);
      setAudio(aStatus);
      setNetwork(netStatus);
      setBluetooth(btStatus);
      setBattery(bStatus);
      setBrightnessState(brightStatus);
      setNotifications(notifs);
      setMonitors(monConfig);
    } catch (err) {
      console.error("Failed to load Luma system metrics:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleVolumeChange = useCallback(async (vol: number) => {
    try {
      const updated = await LumaApi.setVolume(vol);
      setAudio(updated);
    } catch (e) {
      console.error("Failed to set volume:", e);
    }
  }, []);

  const handleToggleMute = useCallback(async () => {
    try {
      const updated = await LumaApi.toggleMute();
      setAudio(updated);
    } catch (e) {
      console.error("Failed to toggle mute:", e);
    }
  }, []);

  const handleToggleWifi = useCallback(async () => {
    try {
      const updated = await LumaApi.toggleWifi();
      setNetwork(updated);
    } catch (e) {
      console.error("Failed to toggle wifi:", e);
    }
  }, []);

  const handleToggleBluetooth = useCallback(async () => {
    try {
      const updated = await LumaApi.toggleBluetooth();
      setBluetooth(updated);
    } catch (e) {
      console.error("Failed to toggle bluetooth:", e);
    }
  }, []);

  const handleBrightnessChange = useCallback(async (percent: number) => {
    try {
      const updated = await LumaApi.setBrightness(percent);
      setBrightnessState(updated);
    } catch (e) {
      console.error("Failed to set brightness:", e);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return {
    platform,
    notch,
    setNotch,
    dock,
    setDock,
    settings,
    setSettings,
    media,
    setMedia,
    audio,
    setAudio,
    network,
    setNetwork,
    bluetooth,
    setBluetooth,
    battery,
    setBattery,
    brightness,
    setBrightness: handleBrightnessChange,
    handleVolumeChange,
    handleToggleMute,
    handleToggleWifi,
    handleToggleBluetooth,
    notifications,
    setNotifications,
    monitors,
    setMonitors,
    isLoading,
    refreshAll,
  };
}

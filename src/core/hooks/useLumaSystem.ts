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
      setNotifications(notifs);
      setMonitors(monConfig);
    } catch (err) {
      console.error("Failed to load Luma system metrics:", err);
    } finally {
      setIsLoading(false);
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
    notifications,
    setNotifications,
    monitors,
    setMonitors,
    isLoading,
    refreshAll,
  };
}

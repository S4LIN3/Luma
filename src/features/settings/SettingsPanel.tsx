import React from "react";
import { UserSettings, PlatformInfo } from "../../core/types";
import { SettingsSection, SettingsRow } from "../../components/ui/SettingsSection";
import { Toggle } from "../../components/ui/Toggle";
import { Dropdown } from "../../components/ui/Dropdown";
import { Badge } from "../../components/common/Badge";
import { useTheme } from "../../design-system/ThemeContext";
import { AccentName } from "../../design-system/tokens";
import {
  Sparkles,
  Sliders,
  Palette,
  Zap,
  Shield,
  Layers,
  Monitor,
  Info,
} from "lucide-react";

interface SettingsPanelProps {
  settings: UserSettings;
  platform: PlatformInfo | null;
  onUpdate: (updated: UserSettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  platform,
  onUpdate,
}) => {
  const { themeMode, setThemeMode, accent, setAccent } = useTheme();

  const themeOptions = [
    { value: "dark", label: "Dark Surface" },
    { value: "light", label: "Light Surface" },
    { value: "system", label: "Follow Desktop (COSMIC)" },
  ];

  const accentOptions = [
    { value: "indigo", label: "Luma Indigo" },
    { value: "violet", label: "Cosmic Violet" },
    { value: "emerald", label: "Emerald Oasis" },
    { value: "cyan", label: "Cyan Beam" },
    { value: "amber", label: "Solar Amber" },
    { value: "rose", label: "Neon Rose" },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full select-none animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Luma Settings</h2>
            <p className="text-xs text-slate-400">Your Desktop, In Motion</p>
          </div>
        </div>

        {platform && (
          <div className="flex items-center gap-2">
            <Badge variant="primary">{platform.desktop_environment}</Badge>
            <Badge variant="secondary">{platform.display_server}</Badge>
          </div>
        )}
      </div>

      {/* Appearance Section */}
      <SettingsSection
        title="Appearance & Theme"
        description="Configure desktop styling, colors and visual elegance"
      >
        <SettingsRow
          title="Color Theme"
          description="Select between deep dark space or clean light aesthetic"
          icon={<Palette className="w-4 h-4" />}
        >
          <div className="w-44">
            <Dropdown
              value={themeMode}
              options={themeOptions}
              onChange={(val) => {
                setThemeMode(val as any);
                onUpdate({ ...settings, theme_mode: val });
              }}
            />
          </div>
        </SettingsRow>

        <SettingsRow
          title="Accent Palette"
          description="Customized highlights across the notch, dock and buttons"
          icon={<Sparkles className="w-4 h-4" />}
        >
          <div className="w-44">
            <Dropdown
              value={accent}
              options={accentOptions}
              onChange={(val) => {
                setAccent(val as AccentName);
                onUpdate({ ...settings, accent_color: val });
              }}
            />
          </div>
        </SettingsRow>

        <SettingsRow
          title="Backdrop Glassmorphism"
          description="Enable hardware-accelerated background blur"
          icon={<Shield className="w-4 h-4" />}
          borderBottom={false}
        >
          <Toggle
            checked={settings.blur_effects}
            onChange={(val) => onUpdate({ ...settings, blur_effects: val })}
          />
        </SettingsRow>
      </SettingsSection>

      {/* Desktop Surface Integration (Phase 3) */}
      <SettingsSection
        title="Linux Desktop Surfaces"
        description="Independent Wayland / X11 surfaces for Notch and Dock"
      >
        <SettingsRow
          title="Enable Animated Notch"
          description="Interactive status capsule anchored to top screen edge"
          icon={<Layers className="w-4 h-4" />}
        >
          <Toggle
            checked={settings.enable_notch}
            onChange={(val) => onUpdate({ ...settings, enable_notch: val })}
          />
        </SettingsRow>

        <SettingsRow
          title="Enable Floating Dock"
          description="Customizable application launcher and window switch dock"
          icon={<Monitor className="w-4 h-4" />}
          borderBottom={false}
        >
          <Toggle
            checked={settings.enable_dock}
            onChange={(val) => onUpdate({ ...settings, enable_dock: val })}
          />
        </SettingsRow>
      </SettingsSection>

      {/* Performance & Power Profile */}
      <SettingsSection
        title="System & Efficiency"
        description="Control hardware polling rates and animation budget"
      >
        <SettingsRow
          title="Low Power Mode"
          description="Throttles visualizer polling and saves battery on mobile sessions"
          icon={<Zap className="w-4 h-4" />}
          borderBottom={false}
        >
          <Toggle
            checked={settings.low_power_mode}
            onChange={(val) => onUpdate({ ...settings, low_power_mode: val })}
          />
        </SettingsRow>
      </SettingsSection>

      {/* About Luma */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-indigo-400" />
          <div className="flex flex-col">
            <span className="font-semibold text-slate-200">Luma Desktop v0.1.0</span>
            <span>Pop!_OS 24.04 LTS (Noble) • Primary Desktop: COSMIC Wayland</span>
          </div>
        </div>
        <span className="font-mono text-[11px] text-slate-500">luma-desktop</span>
      </div>
    </div>
  );
};

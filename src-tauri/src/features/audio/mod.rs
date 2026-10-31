use serde::{Deserialize, Serialize};
use std::process::Command;
use std::sync::Mutex;
use crate::core::error::{LumaError, Result};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct AudioEndpoint {
    pub id: String,
    pub name: String,
    pub description: String,
    pub is_default: bool,
    pub is_sink: bool,
    pub volume: u32,
    pub is_muted: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioStatus {
    pub volume: u32, // 0 - 100
    pub is_muted: bool,
    pub default_sink: AudioEndpoint,
    pub default_source: Option<AudioEndpoint>,
    pub available_sinks: Vec<AudioEndpoint>,
    pub available_sources: Vec<AudioEndpoint>,
    pub backend: String, // "PipeWire" or "PulseAudio"
}

impl Default for AudioEndpoint {
    fn default() -> Self {
        Self {
            id: "alsa_output.pci-0000_00_1f.3.analog-stereo".to_string(),
            name: "Built-in Audio Analog Stereo".to_string(),
            description: "Built-in Audio Analog Stereo".to_string(),
            is_default: true,
            is_sink: true,
            volume: 80,
            is_muted: false,
        }
    }
}

impl Default for AudioStatus {
    fn default() -> Self {
        let default_sink = AudioEndpoint::default();
        let default_source = AudioEndpoint {
            id: "alsa_input.pci-0000_00_1f.3.analog-stereo".to_string(),
            name: "Built-in Microphone".to_string(),
            description: "Internal Audio Microphone".to_string(),
            is_default: true,
            is_sink: false,
            volume: 50,
            is_muted: false,
        };

        Self {
            volume: 80,
            is_muted: false,
            default_sink: default_sink.clone(),
            default_source: Some(default_source.clone()),
            available_sinks: vec![default_sink],
            available_sources: vec![default_source],
            backend: "PipeWire".to_string(),
        }
    }
}

pub struct AudioManager {
    status: Mutex<AudioStatus>,
}

impl AudioManager {
    pub fn new() -> Self {
        let manager = Self {
            status: Mutex::new(AudioStatus::default()),
        };
        // Attempt initial query
        let _ = manager.refresh();
        manager
    }

    /// Refresh status from actual system interfaces (PipeWire via wpctl/pactl)
    pub fn refresh(&self) -> Result<AudioStatus> {
        let (vol, muted) = query_current_volume_and_mute().unwrap_or((80, false));
        let (sinks, sources, def_sink_name, def_source_name) = query_endpoints();

        let mut status = self.status.lock().map_err(|e| LumaError::SubsystemUnavailable(e.to_string()))?;
        status.volume = vol;
        status.is_muted = muted;

        if !sinks.is_empty() {
            status.available_sinks = sinks.clone();
            if let Some(ds) = sinks.iter().find(|s| s.is_default || s.name == def_sink_name || s.id == def_sink_name).cloned() {
                status.default_sink = ds;
            } else if let Some(first) = sinks.first().cloned() {
                status.default_sink = first;
            }
        }

        if !sources.is_empty() {
            status.available_sources = sources.clone();
            if let Some(src) = sources.iter().find(|s| s.is_default || s.name == def_source_name || s.id == def_source_name).cloned() {
                status.default_source = Some(src);
            } else {
                status.default_source = sources.first().cloned();
            }
        }

        Ok(status.clone())
    }

    pub fn get_status(&self) -> Result<AudioStatus> {
        self.refresh()
    }

    pub fn set_volume(&self, volume: u32) -> Result<AudioStatus> {
        let clamped = volume.min(100);
        let res = set_system_volume(clamped);
        if res.is_err() {
            tracing::warn!("Failed to adjust volume via system backend: {:?}", res);
        }

        let mut status = self.status.lock().map_err(|e| LumaError::SubsystemUnavailable(e.to_string()))?;
        status.volume = clamped;
        status.is_muted = clamped == 0;
        status.default_sink.volume = clamped;
        Ok(status.clone())
    }

    pub fn toggle_mute(&self) -> Result<AudioStatus> {
        let res = toggle_system_mute();
        if res.is_err() {
            tracing::warn!("Failed to toggle mute via system backend: {:?}", res);
        }

        let mut status = self.status.lock().map_err(|e| LumaError::SubsystemUnavailable(e.to_string()))?;
        status.is_muted = !status.is_muted;
        status.default_sink.is_muted = status.is_muted;
        Ok(status.clone())
    }

    pub fn set_default_endpoint(&self, endpoint_id: &str, is_sink: bool) -> Result<AudioStatus> {
        let res = set_system_default_endpoint(endpoint_id, is_sink);
        if res.is_err() {
            tracing::warn!("Failed to set default endpoint {}: {:?}", endpoint_id, res);
        }
        self.refresh()
    }
}

impl Default for AudioManager {
    fn default() -> Self {
        Self::new()
    }
}

/// Query current volume and mute state via wpctl or pactl
fn query_current_volume_and_mute() -> Option<(u32, bool)> {
    // 1. Try wpctl (PipeWire native)
    if let Ok(output) = Command::new("wpctl").args(["get-volume", "@DEFAULT_AUDIO_SINK@"]).output() {
        if output.status.success() {
            let text = String::from_utf8_lossy(&output.stdout);
            return parse_wpctl_volume_output(&text);
        }
    }

    // 2. Try pactl fallback
    if let Ok(output) = Command::new("pactl").args(["get-sink-volume", "@DEFAULT_SINK@"]).output() {
        if output.status.success() {
            let text = String::from_utf8_lossy(&output.stdout);
            if let Some(vol) = parse_pactl_volume_output(&text) {
                let muted = Command::new("pactl")
                    .args(["get-sink-mute", "@DEFAULT_SINK@"])
                    .output()
                    .map(|out| String::from_utf8_lossy(&out.stdout).contains("yes"))
                    .unwrap_or(false);
                return Some((vol, muted));
            }
        }
    }

    None
}

/// Parse wpctl volume output: e.g. "Volume: 0.80" or "Volume: 0.80 [MUTED]"
pub fn parse_wpctl_volume_output(text: &str) -> Option<(u32, bool)> {
    let line = text.trim();
    if !line.starts_with("Volume:") {
        return None;
    }
    let parts: Vec<&str> = line.split_whitespace().collect();
    if parts.len() < 2 {
        return None;
    }
    let vol_float: f32 = parts[1].parse().ok()?;
    let volume = (vol_float * 100.0).round().clamp(0.0, 150.0) as u32;
    let is_muted = line.contains("[MUTED]");
    Some((volume, is_muted))
}

/// Parse pactl volume output
pub fn parse_pactl_volume_output(text: &str) -> Option<u32> {
    for part in text.split('/') {
        let trimmed = part.trim();
        if trimmed.ends_with('%') {
            if let Ok(vol) = trimmed.trim_end_matches('%').trim().parse::<u32>() {
                return Some(vol.min(100));
            }
        }
    }
    None
}

/// Query output and input devices via pactl JSON or wpctl
fn query_endpoints() -> (Vec<AudioEndpoint>, Vec<AudioEndpoint>, String, String) {
    let def_sink = Command::new("pactl")
        .args(["get-default-sink"])
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_default();

    let def_source = Command::new("pactl")
        .args(["get-default-source"])
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_default();

    let sinks = query_pactl_endpoints("sinks", true, &def_sink);
    let sources = query_pactl_endpoints("sources", false, &def_source);

    (sinks, sources, def_sink, def_source)
}

fn query_pactl_endpoints(device_type: &str, is_sink: bool, default_name: &str) -> Vec<AudioEndpoint> {
    let output = match Command::new("pactl").args(["-f", "json", "list", device_type]).output() {
        Ok(o) if o.status.success() => o,
        _ => return Vec::new(),
    };

    let text = String::from_utf8_lossy(&output.stdout);
    let json_val: serde_json::Value = match serde_json::from_str(&text) {
        Ok(v) => v,
        Err(_) => return Vec::new(),
    };

    let mut endpoints = Vec::new();
    if let Some(list) = json_val.as_array() {
        for item in list {
            let name = item.get("name").and_then(|n| n.as_str()).unwrap_or("").to_string();
            let desc = item.get("description").and_then(|d| d.as_str()).unwrap_or(&name).to_string();
            let index = item.get("index").and_then(|i| i.as_u64()).map(|i| i.to_string()).unwrap_or_else(|| name.clone());
            let is_default = name == default_name || index == default_name;
            let mute = item.get("mute").and_then(|m| m.as_bool()).unwrap_or(false);

            // Extract volume percent
            let mut volume = 80;
            if let Some(vol_obj) = item.get("volume") {
                if let Some(first_ch) = vol_obj.as_object().and_then(|o| o.values().next()) {
                    if let Some(vp) = first_ch.get("value_percent").and_then(|p| p.as_str()) {
                        if let Ok(v) = vp.trim_end_matches('%').parse::<u32>() {
                            volume = v;
                        }
                    }
                }
            }

            endpoints.push(AudioEndpoint {
                id: name.clone(),
                name: desc.clone(),
                description: desc,
                is_default,
                is_sink,
                volume,
                is_muted: mute,
            });
        }
    }
    endpoints
}

fn set_system_volume(volume: u32) -> Result<()> {
    let factor = (volume as f32) / 100.0;
    // Try wpctl first
    let res = Command::new("wpctl")
        .args(["set-volume", "@DEFAULT_AUDIO_SINK@", &format!("{:.2}", factor)])
        .output();

    if let Ok(out) = res {
        if out.status.success() {
            return Ok(());
        }
    }

    // Fallback to pactl
    let res_pactl = Command::new("pactl")
        .args(["set-sink-volume", "@DEFAULT_SINK@", &format!("{}%", volume)])
        .output();

    match res_pactl {
        Ok(out) if out.status.success() => Ok(()),
        Ok(out) => Err(LumaError::SubsystemUnavailable(String::from_utf8_lossy(&out.stderr).to_string())),
        Err(e) => Err(LumaError::Io(e.to_string())),
    }
}

fn toggle_system_mute() -> Result<()> {
    let res = Command::new("wpctl")
        .args(["set-mute", "@DEFAULT_AUDIO_SINK@", "toggle"])
        .output();

    if let Ok(out) = res {
        if out.status.success() {
            return Ok(());
        }
    }

    let res_pactl = Command::new("pactl")
        .args(["set-sink-mute", "@DEFAULT_SINK@", "toggle"])
        .output();

    match res_pactl {
        Ok(out) if out.status.success() => Ok(()),
        Ok(out) => Err(LumaError::SubsystemUnavailable(String::from_utf8_lossy(&out.stderr).to_string())),
        Err(e) => Err(LumaError::Io(e.to_string())),
    }
}

fn set_system_default_endpoint(endpoint_id: &str, is_sink: bool) -> Result<()> {
    let subcmd = if is_sink { "set-default-sink" } else { "set-default-source" };
    let res = Command::new("pactl").args([subcmd, endpoint_id]).output();

    match res {
        Ok(out) if out.status.success() => Ok(()),
        Ok(out) => {
            // Also try wpctl set-default if endpoint_id is numeric
            if let Ok(out_wp) = Command::new("wpctl").args(["set-default", endpoint_id]).output() {
                if out_wp.status.success() {
                    return Ok(());
                }
            }
            Err(LumaError::SubsystemUnavailable(String::from_utf8_lossy(&out.stderr).to_string()))
        }
        Err(e) => Err(LumaError::Io(e.to_string())),
    }
}

#[tauri::command]
pub fn get_audio_status(manager: tauri::State<AudioManager>) -> Result<AudioStatus> {
    manager.get_status()
}

#[tauri::command]
pub fn set_volume(volume: u32, manager: tauri::State<AudioManager>) -> Result<AudioStatus> {
    manager.set_volume(volume)
}

#[tauri::command]
pub fn toggle_mute(manager: tauri::State<AudioManager>) -> Result<AudioStatus> {
    manager.toggle_mute()
}

#[tauri::command]
pub fn set_audio_default_endpoint(
    endpoint_id: String,
    is_sink: bool,
    manager: tauri::State<AudioManager>,
) -> Result<AudioStatus> {
    manager.set_default_endpoint(&endpoint_id, is_sink)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_audio_volume_clamping() {
        let manager = AudioManager::new();
        let s = manager.set_volume(150).unwrap();
        assert_eq!(s.volume, 100);
    }

    #[test]
    fn test_audio_mute_toggle() {
        let manager = AudioManager::new();
        let initial = manager.get_status().unwrap();
        let updated = manager.toggle_mute().unwrap();
        assert_eq!(updated.is_muted, !initial.is_muted);
    }

    #[test]
    fn test_parse_wpctl_volume_output() {
        let sample = "Volume: 0.85";
        let (vol, muted) = parse_wpctl_volume_output(sample).unwrap();
        assert_eq!(vol, 85);
        assert!(!muted);

        let sample_muted = "Volume: 0.40 [MUTED]";
        let (vol2, muted2) = parse_wpctl_volume_output(sample_muted).unwrap();
        assert_eq!(vol2, 40);
        assert!(muted2);
    }

    #[test]
    fn test_parse_pactl_volume_output() {
        let sample = "front-left: 52429 /  80% / -5.81 dB,   front-right: 52429 /  80% / -5.81 dB";
        let vol = parse_pactl_volume_output(sample).unwrap();
        assert_eq!(vol, 80);
    }
}

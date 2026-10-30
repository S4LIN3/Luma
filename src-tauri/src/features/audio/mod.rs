use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use crate::core::error::{LumaError, Result};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioEndpoint {
    pub id: String,
    pub name: String,
    pub is_default: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioStatus {
    pub volume: u32, // 0 - 100
    pub is_muted: bool,
    pub default_sink: AudioEndpoint,
    pub available_sinks: Vec<AudioEndpoint>,
    pub backend: String, // "PipeWire" or "PulseAudio"
}

impl Default for AudioStatus {
    fn default() -> Self {
        let default_sink = AudioEndpoint {
            id: "alsa_output.pci.analog-stereo".to_string(),
            name: "Built-in Audio Analog Stereo".to_string(),
            is_default: true,
        };
        Self {
            volume: 68,
            is_muted: false,
            default_sink: default_sink.clone(),
            available_sinks: vec![
                default_sink,
                AudioEndpoint {
                    id: "bluez_output.headphones".to_string(),
                    name: "Bluetooth Headphones".to_string(),
                    is_default: false,
                },
            ],
            backend: "PipeWire".to_string(),
        }
    }
}

pub struct AudioManager {
    status: Mutex<AudioStatus>,
}

impl AudioManager {
    pub fn new() -> Self {
        Self {
            status: Mutex::new(AudioStatus::default()),
        }
    }

    pub fn get_status(&self) -> Result<AudioStatus> {
        let s = self.status.lock().map_err(|e| LumaError::SubsystemUnavailable(e.to_string()))?;
        Ok(s.clone())
    }

    pub fn set_volume(&self, volume: u32) -> Result<AudioStatus> {
        let mut s = self.status.lock().map_err(|e| LumaError::SubsystemUnavailable(e.to_string()))?;
        s.volume = volume.min(100);
        Ok(s.clone())
    }

    pub fn toggle_mute(&self) -> Result<AudioStatus> {
        let mut s = self.status.lock().map_err(|e| LumaError::SubsystemUnavailable(e.to_string()))?;
        s.is_muted = !s.is_muted;
        Ok(s.clone())
    }
}

impl Default for AudioManager {
    fn default() -> Self {
        Self::new()
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
        let s = manager.toggle_mute().unwrap();
        assert!(s.is_muted);
    }
}

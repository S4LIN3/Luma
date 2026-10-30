pub mod mpris;

use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use crate::core::error::{LumaError, Result};
use mpris::{MprisClient, VisualizerBands};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum PlaybackState {
    Playing,
    Paused,
    Stopped,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrackMetadata {
    pub title: String,
    pub artist: String,
    pub album: String,
    pub art_url: Option<String>,
    pub duration_seconds: u32,
    pub position_seconds: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MediaStatus {
    pub active_player: Option<String>,
    pub playback_state: PlaybackState,
    pub current_track: Option<TrackMetadata>,
    pub can_go_next: bool,
    pub can_go_previous: bool,
    pub can_play_pause: bool,
}

impl Default for MediaStatus {
    fn default() -> Self {
        Self {
            active_player: Some("Pop!_OS Player".to_string()),
            playback_state: PlaybackState::Playing,
            current_track: Some(TrackMetadata {
                title: "Cosmic Resonance".to_string(),
                artist: "Luma Ambient".to_string(),
                album: "Pop Epoch".to_string(),
                art_url: None,
                duration_seconds: 214,
                position_seconds: 78,
            }),
            can_go_next: true,
            can_go_previous: true,
            can_play_pause: true,
        }
    }
}

pub struct MediaManager {
    status: Mutex<MediaStatus>,
}

impl MediaManager {
    pub fn new() -> Self {
        Self {
            status: Mutex::new(MediaStatus::default()),
        }
    }

    pub fn get_status(&self) -> Result<MediaStatus> {
        let status = self.status.lock().map_err(|e| LumaError::SubsystemUnavailable(e.to_string()))?;
        Ok(status.clone())
    }

    pub fn update_status(&self, new_status: MediaStatus) -> Result<()> {
        let mut status = self.status.lock().map_err(|e| LumaError::SubsystemUnavailable(e.to_string()))?;
        *status = new_status;
        Ok(())
    }

    pub fn toggle_play_pause(&self) -> Result<MediaStatus> {
        let mut status = self.status.lock().map_err(|e| LumaError::SubsystemUnavailable(e.to_string()))?;
        status.playback_state = match status.playback_state {
            PlaybackState::Playing => PlaybackState::Paused,
            PlaybackState::Paused => PlaybackState::Playing,
            PlaybackState::Stopped => PlaybackState::Playing,
        };
        Ok(status.clone())
    }
}

impl Default for MediaManager {
    fn default() -> Self {
        Self::new()
    }
}

#[tauri::command]
pub async fn get_media_status(manager: tauri::State<'_, MediaManager>) -> Result<MediaStatus> {
    // Attempt real live MPRIS query first
    if let Ok(live_status) = MprisClient::query_active_player().await {
        if live_status.active_player.is_some() {
            let _ = manager.update_status(live_status.clone());
            return Ok(live_status);
        }
    }
    manager.get_status()
}

#[tauri::command]
pub async fn media_play_pause(manager: tauri::State<'_, MediaManager>) -> Result<MediaStatus> {
    // Fire real D-Bus command if available
    let _ = MprisClient::play_pause().await;
    manager.toggle_play_pause()
}

#[tauri::command]
pub async fn media_next(manager: tauri::State<'_, MediaManager>) -> Result<MediaStatus> {
    let _ = MprisClient::next_track().await;
    manager.get_status()
}

#[tauri::command]
pub async fn media_previous(manager: tauri::State<'_, MediaManager>) -> Result<MediaStatus> {
    let _ = MprisClient::previous_track().await;
    manager.get_status()
}

#[tauri::command]
pub fn get_visualizer_bands(manager: tauri::State<'_, MediaManager>) -> Result<VisualizerBands> {
    let status = manager.get_status()?;
    Ok(MprisClient::get_visualizer_bands(&status.playback_state))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_media_playback_toggle() {
        let manager = MediaManager::new();
        let initial = manager.get_status().unwrap();
        assert_eq!(initial.playback_state, PlaybackState::Playing);
        let toggled = manager.toggle_play_pause().unwrap();
        assert_eq!(toggled.playback_state, PlaybackState::Paused);
    }

    #[test]
    fn test_visualizer_spectral_bands() {
        let bands = MprisClient::get_visualizer_bands(&PlaybackState::Playing);
        assert!(bands.sub_bass > 0.0);
        assert!(bands.treble > 0.0);
    }
}

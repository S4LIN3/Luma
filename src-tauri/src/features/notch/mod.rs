use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use crate::core::error::{LumaError, Result};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum NotchMode {
    Compact,
    Expanded,
    Media,
    Notification,
    Minimal,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotchGeometry {
    pub width: u32,
    pub height: u32,
    pub border_radius: u32,
    pub margin_top: u32,
    pub expanded_width: u32,
    pub expanded_height: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotchState {
    pub mode: NotchMode,
    pub geometry: NotchGeometry,
    pub is_visible: bool,
    pub is_hovered: bool,
    pub active_title: Option<String>,
    pub active_subtitle: Option<String>,
}

impl Default for NotchGeometry {
    fn default() -> Self {
        Self {
            width: 220,
            height: 38,
            border_radius: 20,
            margin_top: 8,
            expanded_width: 440,
            expanded_height: 160,
        }
    }
}

impl Default for NotchState {
    fn default() -> Self {
        Self {
            mode: NotchMode::Compact,
            geometry: NotchGeometry::default(),
            is_visible: true,
            is_hovered: false,
            active_title: Some("Luma Desktop".to_string()),
            active_subtitle: Some("Ready".to_string()),
        }
    }
}

pub struct NotchManager {
    state: Mutex<NotchState>,
}

impl NotchManager {
    pub fn new() -> Self {
        Self {
            state: Mutex::new(NotchState::default()),
        }
    }

    pub fn get_state(&self) -> Result<NotchState> {
        let state = self.state.lock().map_err(|e| LumaError::Notch(e.to_string()))?;
        Ok(state.clone())
    }

    pub fn set_mode(&self, mode: NotchMode) -> Result<NotchState> {
        let mut state = self.state.lock().map_err(|e| LumaError::Notch(e.to_string()))?;
        state.mode = mode;
        Ok(state.clone())
    }
}

impl Default for NotchManager {
    fn default() -> Self {
        Self::new()
    }
}

#[tauri::command]
pub fn get_notch_state(manager: tauri::State<NotchManager>) -> Result<NotchState> {
    manager.get_state()
}

#[tauri::command]
pub fn set_notch_mode(mode: NotchMode, manager: tauri::State<NotchManager>) -> Result<NotchState> {
    manager.set_mode(mode)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_notch_initialization() {
        let manager = NotchManager::new();
        let state = manager.get_state().unwrap();
        assert_eq!(state.mode, NotchMode::Compact);
        assert_eq!(state.geometry.width, 220);
    }

    #[test]
    fn test_notch_mode_switch() {
        let manager = NotchManager::new();
        let updated = manager.set_mode(NotchMode::Media).unwrap();
        assert_eq!(updated.mode, NotchMode::Media);
    }
}

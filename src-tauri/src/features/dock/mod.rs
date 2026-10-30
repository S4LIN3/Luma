use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use crate::core::error::{LumaError, Result};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum DockPosition {
    Bottom,
    Left,
    Right,
    Top,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DockItem {
    pub id: String,
    pub title: String,
    pub icon: String, // icon name or path
    pub command: Option<String>,
    pub is_pinned: bool,
    pub is_running: bool,
    pub active_instances: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DockConfig {
    pub position: DockPosition,
    pub icon_size: u32,
    pub autohide: bool,
    pub magnification: bool,
    pub magnification_scale: f32,
    pub items: Vec<DockItem>,
}

impl Default for DockConfig {
    fn default() -> Self {
        Self {
            position: DockPosition::Bottom,
            icon_size: 52,
            autohide: false,
            magnification: true,
            magnification_scale: 1.25,
            items: vec![
                DockItem {
                    id: "terminal".to_string(),
                    title: "Cosmic Terminal".to_string(),
                    icon: "Terminal".to_string(),
                    command: Some("cosmic-term".to_string()),
                    is_pinned: true,
                    is_running: true,
                    active_instances: 1,
                },
                DockItem {
                    id: "files".to_string(),
                    title: "Cosmic Files".to_string(),
                    icon: "Folder".to_string(),
                    command: Some("cosmic-files".to_string()),
                    is_pinned: true,
                    is_running: false,
                    active_instances: 0,
                },
                DockItem {
                    id: "browser".to_string(),
                    title: "Web Browser".to_string(),
                    icon: "Globe".to_string(),
                    command: Some("firefox".to_string()),
                    is_pinned: true,
                    is_running: true,
                    active_instances: 2,
                },
                DockItem {
                    id: "settings".to_string(),
                    title: "Luma Settings".to_string(),
                    icon: "Settings".to_string(),
                    command: None,
                    is_pinned: true,
                    is_running: true,
                    active_instances: 1,
                },
            ],
        }
    }
}

pub struct DockManager {
    config: Mutex<DockConfig>,
}

impl DockManager {
    pub fn new() -> Self {
        Self {
            config: Mutex::new(DockConfig::default()),
        }
    }

    pub fn get_config(&self) -> Result<DockConfig> {
        let config = self.config.lock().map_err(|e| LumaError::Dock(e.to_string()))?;
        Ok(config.clone())
    }

    pub fn set_position(&self, position: DockPosition) -> Result<DockConfig> {
        let mut config = self.config.lock().map_err(|e| LumaError::Dock(e.to_string()))?;
        config.position = position;
        Ok(config.clone())
    }
}

impl Default for DockManager {
    fn default() -> Self {
        Self::new()
    }
}

#[tauri::command]
pub fn get_dock_config(manager: tauri::State<DockManager>) -> Result<DockConfig> {
    manager.get_config()
}

#[tauri::command]
pub fn set_dock_position(position: DockPosition, manager: tauri::State<DockManager>) -> Result<DockConfig> {
    manager.set_position(position)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_dock_initialization() {
        let manager = DockManager::new();
        let config = manager.get_config().unwrap();
        assert_eq!(config.position, DockPosition::Bottom);
        assert!(!config.items.is_empty());
    }

    #[test]
    fn test_dock_position_change() {
        let manager = DockManager::new();
        let updated = manager.set_position(DockPosition::Left).unwrap();
        assert_eq!(updated.position, DockPosition::Left);
    }
}

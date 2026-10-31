pub mod persistence;
pub mod xdg;

use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::sync::Mutex;
use crate::core::error::{LumaError, Result};
use persistence::{load_dock_config, save_dock_config, PersistentDockConfig};
use xdg::{discover_xdg_applications, launch_application_by_exec, DiscoveredApp};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum DockPosition {
    Bottom,
    Left,
    Right,
    Top,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct DockItem {
    pub id: String,
    pub title: String,
    pub icon: String,
    pub icon_data_url: Option<String>,
    pub command: Option<String>,
    pub desktop_file: Option<String>,
    pub is_pinned: bool,
    pub is_running: bool,
    pub active_instances: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DockConfig {
    pub position: DockPosition,
    pub icon_size: u32,
    pub spacing: u32,
    pub autohide: bool,
    pub magnification: bool,
    pub magnification_scale: f32,
    pub separate_pinned_and_running: bool,
    pub items: Vec<DockItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DockSettingsUpdate {
    pub position: Option<DockPosition>,
    pub icon_size: Option<u32>,
    pub spacing: Option<u32>,
    pub autohide: Option<bool>,
    pub magnification: Option<bool>,
    pub magnification_scale: Option<f32>,
    pub separate_pinned_and_running: Option<bool>,
}

pub struct DockManager {
    persistent: Mutex<PersistentDockConfig>,
}

impl DockManager {
    pub fn new() -> Self {
        let loaded = load_dock_config();
        Self {
            persistent: Mutex::new(loaded),
        }
    }

    /// Assemble full dock config with real discovered applications & running states
    pub fn get_config(&self) -> Result<DockConfig> {
        let p = self.persistent.lock().map_err(|e| LumaError::Dock(e.to_string()))?.clone();
        let all_apps = discover_xdg_applications();

        let mut dock_items = Vec::new();
        let mut included_ids = HashSet::new();

        // 1. First add pinned applications in user-configured order
        for pinned_id in &p.pinned_app_ids {
            if let Some(app) = all_apps.iter().find(|a| a.id == *pinned_id) {
                dock_items.push(DockItem {
                    id: app.id.clone(),
                    title: app.name.clone(),
                    icon: app.icon_name.clone(),
                    icon_data_url: app.icon_data_url.clone(),
                    command: Some(app.exec.clone()),
                    desktop_file: Some(app.desktop_file.clone()),
                    is_pinned: true,
                    is_running: app.is_running,
                    active_instances: app.active_instances,
                });
                included_ids.insert(app.id.clone());
            }
        }

        // 2. If separate_pinned_and_running or mixing: also add running apps that are not pinned
        for app in &all_apps {
            if app.is_running && !included_ids.contains(&app.id) {
                dock_items.push(DockItem {
                    id: app.id.clone(),
                    title: app.name.clone(),
                    icon: app.icon_name.clone(),
                    icon_data_url: app.icon_data_url.clone(),
                    command: Some(app.exec.clone()),
                    desktop_file: Some(app.desktop_file.clone()),
                    is_pinned: false,
                    is_running: true,
                    active_instances: app.active_instances,
                });
                included_ids.insert(app.id.clone());
            }
        }

        // If dock items is empty (e.g. fresh environment or test), seed with top discovered apps
        if dock_items.is_empty() {
            for app in all_apps.iter().take(5) {
                dock_items.push(DockItem {
                    id: app.id.clone(),
                    title: app.name.clone(),
                    icon: app.icon_name.clone(),
                    icon_data_url: app.icon_data_url.clone(),
                    command: Some(app.exec.clone()),
                    desktop_file: Some(app.desktop_file.clone()),
                    is_pinned: true,
                    is_running: app.is_running,
                    active_instances: app.active_instances,
                });
            }
        }

        Ok(DockConfig {
            position: p.position,
            icon_size: p.icon_size,
            spacing: p.spacing,
            autohide: p.autohide,
            magnification: p.magnification,
            magnification_scale: p.magnification_scale,
            separate_pinned_and_running: p.separate_pinned_and_running,
            items: dock_items,
        })
    }

    pub fn set_position(&self, position: DockPosition) -> Result<DockConfig> {
        {
            let mut p = self.persistent.lock().map_err(|e| LumaError::Dock(e.to_string()))?;
            p.position = position;
            let _ = save_dock_config(&p);
        }
        self.get_config()
    }

    pub fn pin_application(&self, desktop_id: &str, target_index: Option<usize>) -> Result<DockConfig> {
        {
            let mut p = self.persistent.lock().map_err(|e| LumaError::Dock(e.to_string()))?;
            if !p.pinned_app_ids.iter().any(|id| id == desktop_id) {
                if let Some(idx) = target_index {
                    let insert_pos = idx.min(p.pinned_app_ids.len());
                    p.pinned_app_ids.insert(insert_pos, desktop_id.to_string());
                } else {
                    p.pinned_app_ids.push(desktop_id.to_string());
                }
                let _ = save_dock_config(&p);
            }
        }
        self.get_config()
    }

    pub fn unpin_application(&self, desktop_id: &str) -> Result<DockConfig> {
        {
            let mut p = self.persistent.lock().map_err(|e| LumaError::Dock(e.to_string()))?;
            p.pinned_app_ids.retain(|id| id != desktop_id);
            let _ = save_dock_config(&p);
        }
        self.get_config()
    }

    pub fn reorder_items(&self, ordered_ids: Vec<String>) -> Result<DockConfig> {
        {
            let mut p = self.persistent.lock().map_err(|e| LumaError::Dock(e.to_string()))?;
            p.pinned_app_ids = ordered_ids;
            let _ = save_dock_config(&p);
        }
        self.get_config()
    }

    pub fn update_settings(&self, settings: DockSettingsUpdate) -> Result<DockConfig> {
        {
            let mut p = self.persistent.lock().map_err(|e| LumaError::Dock(e.to_string()))?;
            if let Some(pos) = settings.position {
                p.position = pos;
            }
            if let Some(sz) = settings.icon_size {
                p.icon_size = sz.clamp(32, 96);
            }
            if let Some(sp) = settings.spacing {
                p.spacing = sp.clamp(2, 24);
            }
            if let Some(ah) = settings.autohide {
                p.autohide = ah;
            }
            if let Some(mag) = settings.magnification {
                p.magnification = mag;
            }
            if let Some(scale) = settings.magnification_scale {
                p.magnification_scale = scale.clamp(1.0, 2.0);
            }
            if let Some(sep) = settings.separate_pinned_and_running {
                p.separate_pinned_and_running = sep;
            }
            let _ = save_dock_config(&p);
        }
        self.get_config()
    }

    pub fn launch_app(&self, desktop_id: &str) -> Result<()> {
        let all_apps = discover_xdg_applications();
        if let Some(app) = all_apps.iter().find(|a| a.id == desktop_id) {
            launch_application_by_exec(&app.exec, app.is_terminal)
                .map_err(|e| LumaError::Desktop(e))?;
            return Ok(());
        }
        Err(LumaError::NotFound(format!("Application '{}' not found", desktop_id)))
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

#[tauri::command]
pub fn discover_applications() -> Result<Vec<DiscoveredApp>> {
    Ok(discover_xdg_applications())
}

#[tauri::command]
pub fn launch_application(desktop_id: String, manager: tauri::State<DockManager>) -> Result<()> {
    manager.launch_app(&desktop_id)
}

#[tauri::command]
pub fn pin_application(
    desktop_id: String,
    target_index: Option<usize>,
    manager: tauri::State<DockManager>,
) -> Result<DockConfig> {
    manager.pin_application(&desktop_id, target_index)
}

#[tauri::command]
pub fn unpin_application(desktop_id: String, manager: tauri::State<DockManager>) -> Result<DockConfig> {
    manager.unpin_application(&desktop_id)
}

#[tauri::command]
pub fn reorder_dock_items(ordered_ids: Vec<String>, manager: tauri::State<DockManager>) -> Result<DockConfig> {
    manager.reorder_items(ordered_ids)
}

#[tauri::command]
pub fn update_dock_settings(
    settings: DockSettingsUpdate,
    manager: tauri::State<DockManager>,
) -> Result<DockConfig> {
    manager.update_settings(settings)
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

    #[test]
    fn test_dock_pin_and_unpin() {
        let manager = DockManager::new();
        let test_app = "test.desktop";
        let _config = manager.pin_application(test_app, None).unwrap();
        assert!(manager.persistent.lock().unwrap().pinned_app_ids.contains(&test_app.to_string()));

        let _unpinned = manager.unpin_application(test_app).unwrap();
        assert!(!manager.persistent.lock().unwrap().pinned_app_ids.contains(&test_app.to_string()));
    }

    #[test]
    fn test_dock_reorder() {
        let manager = DockManager::new();
        let new_order = vec!["app-b.desktop".to_string(), "app-a.desktop".to_string()];
        let _cfg = manager.reorder_items(new_order.clone()).unwrap();
        assert_eq!(manager.persistent.lock().unwrap().pinned_app_ids, new_order);
    }
}

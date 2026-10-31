use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use crate::features::dock::DockPosition;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PersistentDockConfig {
    pub position: DockPosition,
    pub icon_size: u32,
    pub spacing: u32,
    pub autohide: bool,
    pub magnification: bool,
    pub magnification_scale: f32,
    pub separate_pinned_and_running: bool,
    pub pinned_app_ids: Vec<String>,
}

impl Default for PersistentDockConfig {
    fn default() -> Self {
        Self {
            position: DockPosition::Bottom,
            icon_size: 52,
            spacing: 8,
            autohide: false,
            magnification: true,
            magnification_scale: 1.25,
            separate_pinned_and_running: true,
            pinned_app_ids: vec![
                "com.system76.CosmicFiles.desktop".to_string(),
                "brave-browser.desktop".to_string(),
                "com.system76.CosmicTerm.desktop".to_string(),
                "com.system76.CosmicEdit.desktop".to_string(),
                "com.system76.CosmicSettings.desktop".to_string(),
            ],
        }
    }
}

pub fn get_dock_config_path() -> PathBuf {
    if let Ok(config_home) = std::env::var("XDG_CONFIG_HOME") {
        PathBuf::from(config_home).join("luma/dock.json")
    } else if let Ok(home) = std::env::var("HOME") {
        PathBuf::from(home).join(".config/luma/dock.json")
    } else {
        PathBuf::from("/tmp/luma_dock.json")
    }
}

pub fn load_dock_config() -> PersistentDockConfig {
    let path = get_dock_config_path();
    if path.exists() {
        if let Ok(content) = fs::read_to_string(&path) {
            if let Ok(cfg) = serde_json::from_str::<PersistentDockConfig>(&content) {
                return cfg;
            }
        }
    }
    PersistentDockConfig::default()
}

pub fn save_dock_config(config: &PersistentDockConfig) -> Result<(), String> {
    let path = get_dock_config_path();
    if let Some(parent) = path.parent() {
        let _ = fs::create_dir_all(parent);
    }

    let json_text = serde_json::to_string_pretty(config).map_err(|e| e.to_string())?;
    fs::write(&path, json_text).map_err(|e| e.to_string())?;
    Ok(())
}

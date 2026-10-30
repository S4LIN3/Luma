use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use crate::core::error::{LumaError, Result};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserSettings {
    pub theme_mode: String, // "system" | "dark" | "light"
    pub accent_color: String,
    pub enable_notch: bool,
    pub enable_dock: bool,
    pub sound_effects: bool,
    pub low_power_mode: bool,
    pub blur_effects: bool,
}

impl Default for UserSettings {
    fn default() -> Self {
        Self {
            theme_mode: "dark".to_string(),
            accent_color: "#6366f1".to_string(),
            enable_notch: true,
            enable_dock: true,
            sound_effects: true,
            low_power_mode: false,
            blur_effects: true,
        }
    }
}

pub struct SettingsManager {
    settings: Mutex<UserSettings>,
}

impl SettingsManager {
    pub fn new() -> Self {
        Self {
            settings: Mutex::new(UserSettings::default()),
        }
    }

    pub fn get_settings(&self) -> Result<UserSettings> {
        let s = self.settings.lock().map_err(|e| LumaError::Config(e.to_string()))?;
        Ok(s.clone())
    }

    pub fn update_settings(&self, new_settings: UserSettings) -> Result<UserSettings> {
        let mut s = self.settings.lock().map_err(|e| LumaError::Config(e.to_string()))?;
        *s = new_settings;
        Ok(s.clone())
    }
}

impl Default for SettingsManager {
    fn default() -> Self {
        Self::new()
    }
}

#[tauri::command]
pub fn get_settings(manager: tauri::State<SettingsManager>) -> Result<UserSettings> {
    manager.get_settings()
}

#[tauri::command]
pub fn update_settings(settings: UserSettings, manager: tauri::State<SettingsManager>) -> Result<UserSettings> {
    manager.update_settings(settings)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_settings_flow() {
        let manager = SettingsManager::new();
        let s = manager.get_settings().unwrap();
        assert!(s.enable_notch);
        assert!(s.enable_dock);
    }
}

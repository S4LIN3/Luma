use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use crate::core::error::{LumaError, Result};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitorInfo {
    pub id: String,
    pub name: String,
    pub width: u32,
    pub height: u32,
    pub x: i32,
    pub y: i32,
    pub scale_factor: f64,
    pub refresh_rate_hz: f32,
    pub is_primary: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitorConfiguration {
    pub primary_monitor_id: String,
    pub monitors: Vec<MonitorInfo>,
}

impl Default for MonitorConfiguration {
    fn default() -> Self {
        Self {
            primary_monitor_id: "eDP-1".to_string(),
            monitors: vec![
                MonitorInfo {
                    id: "eDP-1".to_string(),
                    name: "Built-in Display (eDP-1)".to_string(),
                    width: 2560,
                    height: 1600,
                    x: 0,
                    y: 0,
                    scale_factor: 1.25,
                    refresh_rate_hz: 120.0,
                    is_primary: true,
                },
                MonitorInfo {
                    id: "DP-2".to_string(),
                    name: "External 4K Monitor (DP-2)".to_string(),
                    width: 3840,
                    height: 2160,
                    x: 2560,
                    y: 0,
                    scale_factor: 1.5,
                    refresh_rate_hz: 60.0,
                    is_primary: false,
                },
            ],
        }
    }
}

pub struct MonitorManager {
    config: Mutex<MonitorConfiguration>,
}

impl MonitorManager {
    pub fn new() -> Self {
        Self {
            config: Mutex::new(MonitorConfiguration::default()),
        }
    }

    pub fn get_configuration(&self) -> Result<MonitorConfiguration> {
        let c = self.config.lock().map_err(|e| LumaError::SubsystemUnavailable(e.to_string()))?;
        Ok(c.clone())
    }
}

impl Default for MonitorManager {
    fn default() -> Self {
        Self::new()
    }
}

#[tauri::command]
pub fn get_monitors(manager: tauri::State<MonitorManager>) -> Result<MonitorConfiguration> {
    manager.get_configuration()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_monitor_configuration() {
        let manager = MonitorManager::new();
        let config = manager.get_configuration().unwrap();
        assert!(!config.monitors.is_empty());
        assert_eq!(config.primary_monitor_id, "eDP-1");
    }
}

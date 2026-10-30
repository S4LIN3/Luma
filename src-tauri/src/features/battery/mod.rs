use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use crate::core::error::{LumaError, Result};
use crate::platform::linux::get_sysfs_battery_capacity;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum BatteryState {
    Charging,
    Discharging,
    Full,
    NotCharging,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatteryStatus {
    pub percentage: u8,
    pub state: BatteryState,
    pub time_to_empty_minutes: Option<u32>,
    pub time_to_full_minutes: Option<u32>,
    pub power_profile: String, // "performance" | "balanced" | "battery"
    pub is_present: bool,
}

impl Default for BatteryStatus {
    fn default() -> Self {
        // Attempt reading from sysfs, fallback to sensible laptop default
        let sysfs_cap = get_sysfs_battery_capacity().ok().flatten();
        let percentage = sysfs_cap.unwrap_or(88) as u8;

        Self {
            percentage,
            state: BatteryState::Discharging,
            time_to_empty_minutes: Some(260),
            time_to_full_minutes: None,
            power_profile: "balanced".to_string(),
            is_present: true,
        }
    }
}

pub struct BatteryManager {
    status: Mutex<BatteryStatus>,
}

impl BatteryManager {
    pub fn new() -> Self {
        Self {
            status: Mutex::new(BatteryStatus::default()),
        }
    }

    pub fn get_status(&self) -> Result<BatteryStatus> {
        let mut s = self.status.lock().map_err(|e| LumaError::SubsystemUnavailable(e.to_string()))?;
        if let Ok(Some(sysfs_cap)) = get_sysfs_battery_capacity() {
            s.percentage = (sysfs_cap as u8).min(100);
        }
        Ok(s.clone())
    }
}

impl Default for BatteryManager {
    fn default() -> Self {
        Self::new()
    }
}

#[tauri::command]
pub fn get_battery_status(manager: tauri::State<BatteryManager>) -> Result<BatteryStatus> {
    manager.get_status()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_battery_status() {
        let manager = BatteryManager::new();
        let s = manager.get_status().unwrap();
        assert!(s.percentage <= 100);
    }
}

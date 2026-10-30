use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use crate::core::error::{LumaError, Result};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BluetoothDevice {
    pub name: String,
    pub address: String,
    pub is_connected: bool,
    pub battery_percentage: Option<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BluetoothStatus {
    pub is_enabled: bool,
    pub is_scanning: bool,
    pub adapter_name: String,
    pub devices: Vec<BluetoothDevice>,
}

impl Default for BluetoothStatus {
    fn default() -> Self {
        Self {
            is_enabled: true,
            is_scanning: false,
            adapter_name: "Pop!_OS Bluetooth Adapter".to_string(),
            devices: vec![
                BluetoothDevice {
                    name: "Wireless ANC Headphones".to_string(),
                    address: "00:1A:7D:DA:71:13".to_string(),
                    is_connected: true,
                    battery_percentage: Some(85),
                },
                BluetoothDevice {
                    name: "Cosmic Mouse".to_string(),
                    address: "E4:5F:01:22:98:A1".to_string(),
                    is_connected: true,
                    battery_percentage: Some(92),
                },
            ],
        }
    }
}

pub struct BluetoothManager {
    status: Mutex<BluetoothStatus>,
}

impl BluetoothManager {
    pub fn new() -> Self {
        Self {
            status: Mutex::new(BluetoothStatus::default()),
        }
    }

    pub fn get_status(&self) -> Result<BluetoothStatus> {
        let s = self.status.lock().map_err(|e| LumaError::SubsystemUnavailable(e.to_string()))?;
        Ok(s.clone())
    }

    pub fn toggle_enabled(&self) -> Result<BluetoothStatus> {
        let mut s = self.status.lock().map_err(|e| LumaError::SubsystemUnavailable(e.to_string()))?;
        s.is_enabled = !s.is_enabled;
        Ok(s.clone())
    }
}

impl Default for BluetoothManager {
    fn default() -> Self {
        Self::new()
    }
}

#[tauri::command]
pub fn get_bluetooth_status(manager: tauri::State<BluetoothManager>) -> Result<BluetoothStatus> {
    manager.get_status()
}

#[tauri::command]
pub fn toggle_bluetooth(manager: tauri::State<BluetoothManager>) -> Result<BluetoothStatus> {
    manager.toggle_enabled()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bluetooth_toggle() {
        let manager = BluetoothManager::new();
        let s = manager.toggle_enabled().unwrap();
        assert!(!s.is_enabled);
    }
}

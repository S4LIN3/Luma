use serde::{Deserialize, Serialize};
use std::process::Command;
use std::sync::Mutex;
use crate::core::error::{LumaError, Result};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct BluetoothDevice {
    pub name: String,
    pub address: String,
    pub is_connected: bool,
    pub is_paired: bool,
    pub battery_percentage: Option<u8>,
    pub icon: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BluetoothStatus {
    pub is_enabled: bool,
    pub is_scanning: bool,
    pub adapter_name: String,
    pub devices: Vec<BluetoothDevice>,
}

impl Default for BluetoothDevice {
    fn default() -> Self {
        Self {
            name: "jlab jbuds lux anc".to_string(),
            address: "7B:88:11:11:B1:9E".to_string(),
            is_connected: false,
            is_paired: true,
            battery_percentage: Some(85),
            icon: "audio-headset".to_string(),
        }
    }
}

impl Default for BluetoothStatus {
    fn default() -> Self {
        Self {
            is_enabled: true,
            is_scanning: false,
            adapter_name: "Pop!_OS Bluetooth Adapter".to_string(),
            devices: vec![BluetoothDevice::default()],
        }
    }
}

pub struct BluetoothManager {
    status: Mutex<BluetoothStatus>,
}

impl BluetoothManager {
    pub fn new() -> Self {
        let manager = Self {
            status: Mutex::new(BluetoothStatus::default()),
        };
        let _ = manager.refresh();
        manager
    }

    pub fn refresh(&self) -> Result<BluetoothStatus> {
        let (enabled, scanning, adapter_name) = query_adapter_state();
        let devices = if enabled { query_devices() } else { Vec::new() };

        let mut status = self.status.lock().map_err(|e| LumaError::SubsystemUnavailable(e.to_string()))?;
        status.is_enabled = enabled;
        status.is_scanning = scanning;
        if !adapter_name.is_empty() {
            status.adapter_name = adapter_name;
        }
        status.devices = devices;

        Ok(status.clone())
    }

    pub fn get_status(&self) -> Result<BluetoothStatus> {
        self.refresh()
    }

    pub fn set_enabled(&self, enabled: bool) -> Result<BluetoothStatus> {
        let arg = if enabled { "on" } else { "off" };
        let res = Command::new("bluetoothctl").args(["power", arg]).output();

        if let Ok(out) = res {
            if !out.status.success() {
                let err_msg = String::from_utf8_lossy(&out.stderr);
                tracing::warn!("Failed to switch Bluetooth power: {}", err_msg);
            }
        }

        let mut status = self.status.lock().map_err(|e| LumaError::SubsystemUnavailable(e.to_string()))?;
        status.is_enabled = enabled;
        if !enabled {
            for d in &mut status.devices {
                d.is_connected = false;
            }
        }
        Ok(status.clone())
    }

    pub fn toggle_enabled(&self) -> Result<BluetoothStatus> {
        let curr = {
            let s = self.status.lock().map_err(|e| LumaError::SubsystemUnavailable(e.to_string()))?;
            s.is_enabled
        };
        self.set_enabled(!curr)
    }

    pub fn connect_device(&self, address: &str) -> Result<BluetoothStatus> {
        let _ = Command::new("bluetoothctl").args(["connect", address]).output();
        self.refresh()
    }

    pub fn disconnect_device(&self, address: &str) -> Result<BluetoothStatus> {
        let _ = Command::new("bluetoothctl").args(["disconnect", address]).output();
        self.refresh()
    }
}

impl Default for BluetoothManager {
    fn default() -> Self {
        Self::new()
    }
}

fn query_adapter_state() -> (bool, bool, String) {
    let output = Command::new("bluetoothctl").args(["show"]).output();
    if let Ok(out) = output {
        if out.status.success() {
            let text = String::from_utf8_lossy(&out.stdout);
            return parse_bluetoothctl_show(&text);
        }
    }
    (true, false, "Bluetooth Adapter".to_string())
}

pub fn parse_bluetoothctl_show(text: &str) -> (bool, bool, String) {
    let mut powered = false;
    let mut discovering = false;
    let mut name = String::new();

    for line in text.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("Powered:") {
            powered = trimmed.contains("yes");
        } else if trimmed.starts_with("Discovering:") {
            discovering = trimmed.contains("yes");
        } else if trimmed.starts_with("Alias:") || (name.is_empty() && trimmed.starts_with("Name:")) {
            let parts: Vec<&str> = trimmed.splitn(2, ':').collect();
            if parts.len() == 2 {
                name = parts[1].trim().to_string();
            }
        }
    }

    (powered, discovering, name)
}

fn query_devices() -> Vec<BluetoothDevice> {
    let output = Command::new("bluetoothctl").args(["devices", "Paired"]).output();
    let mut devices = Vec::new();

    if let Ok(out) = output {
        if out.status.success() {
            let text = String::from_utf8_lossy(&out.stdout);
            for line in text.lines() {
                // Line format: "Device 7B:88:11:11:B1:9E jlab jbuds lux anc"
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 3 && parts[0] == "Device" {
                    let addr = parts[1].to_string();
                    let name = parts[2..].join(" ");
                    let (connected, icon, battery) = query_device_info(&addr);

                    devices.push(BluetoothDevice {
                        name,
                        address: addr,
                        is_connected: connected,
                        is_paired: true,
                        battery_percentage: battery,
                        icon,
                    });
                }
            }
        }
    }

    devices
}

fn query_device_info(address: &str) -> (bool, String, Option<u8>) {
    let output = Command::new("bluetoothctl").args(["info", address]).output();
    if let Ok(out) = output {
        if out.status.success() {
            let text = String::from_utf8_lossy(&out.stdout);
            let mut connected = false;
            let mut icon = "bluetooth".to_string();
            let mut battery = None;

            for line in text.lines() {
                let trimmed = line.trim();
                if trimmed.starts_with("Connected:") {
                    connected = trimmed.contains("yes");
                } else if trimmed.starts_with("Icon:") {
                    icon = trimmed.trim_start_matches("Icon:").trim().to_string();
                } else if trimmed.starts_with("Battery Percentage:") {
                    if let Some(val_str) = trimmed.split('(').nth(1).and_then(|s| s.split(')').next()) {
                        battery = val_str.parse::<u8>().ok();
                    } else if let Some(val_str) = trimmed.split(':').nth(1) {
                        battery = val_str.trim().trim_end_matches('%').parse::<u8>().ok();
                    }
                }
            }
            return (connected, icon, battery);
        }
    }
    (false, "bluetooth".to_string(), None)
}

#[tauri::command]
pub fn get_bluetooth_status(manager: tauri::State<BluetoothManager>) -> Result<BluetoothStatus> {
    manager.get_status()
}

#[tauri::command]
pub fn toggle_bluetooth(manager: tauri::State<BluetoothManager>) -> Result<BluetoothStatus> {
    manager.toggle_enabled()
}

#[tauri::command]
pub fn set_bluetooth_enabled(enabled: bool, manager: tauri::State<BluetoothManager>) -> Result<BluetoothStatus> {
    manager.set_enabled(enabled)
}

#[tauri::command]
pub fn connect_bluetooth_device(address: String, manager: tauri::State<BluetoothManager>) -> Result<BluetoothStatus> {
    manager.connect_device(&address)
}

#[tauri::command]
pub fn disconnect_bluetooth_device(address: String, manager: tauri::State<BluetoothManager>) -> Result<BluetoothStatus> {
    manager.disconnect_device(&address)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bluetooth_toggle() {
        let manager = BluetoothManager::new();
        let initial = manager.get_status().unwrap();
        let s = manager.toggle_enabled().unwrap();
        assert_eq!(s.is_enabled, !initial.is_enabled);
    }

    #[test]
    fn test_parse_bluetoothctl_show() {
        let sample = "Controller AC:82:47:DA:85:26 (public)\n\tName: salman\n\tAlias: salman\n\tPowered: yes\n\tDiscovering: no\n";
        let (powered, discovering, name) = parse_bluetoothctl_show(sample);
        assert!(powered);
        assert!(!discovering);
        assert_eq!(name, "salman");
    }
}

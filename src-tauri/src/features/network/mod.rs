use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use crate::core::error::{LumaError, Result};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum NetworkType {
    WiFi,
    Ethernet,
    Disconnected,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkStatus {
    pub network_type: NetworkType,
    pub is_connected: bool,
    pub ssid: Option<String>,
    pub signal_strength: u8, // 0 - 100
    pub ip_address: Option<String>,
    pub interface_name: String,
}

impl Default for NetworkStatus {
    fn default() -> Self {
        Self {
            network_type: NetworkType::WiFi,
            is_connected: true,
            ssid: Some("Pop_Studio_5G".to_string()),
            signal_strength: 84,
            ip_address: Some("192.168.1.145".to_string()),
            interface_name: "wlan0".to_string(),
        }
    }
}

pub struct NetworkManager {
    status: Mutex<NetworkStatus>,
}

impl NetworkManager {
    pub fn new() -> Self {
        Self {
            status: Mutex::new(NetworkStatus::default()),
        }
    }

    pub fn get_status(&self) -> Result<NetworkStatus> {
        let s = self.status.lock().map_err(|e| LumaError::SubsystemUnavailable(e.to_string()))?;
        Ok(s.clone())
    }
}

impl Default for NetworkManager {
    fn default() -> Self {
        Self::new()
    }
}

#[tauri::command]
pub fn get_network_status(manager: tauri::State<NetworkManager>) -> Result<NetworkStatus> {
    manager.get_status()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_network_status() {
        let manager = NetworkManager::new();
        let s = manager.get_status().unwrap();
        assert!(s.is_connected);
        assert_eq!(s.network_type, NetworkType::WiFi);
    }
}

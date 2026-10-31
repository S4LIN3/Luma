use serde::{Deserialize, Serialize};
use std::process::Command;
use std::sync::Mutex;
use crate::core::error::{LumaError, Result};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum NetworkType {
    WiFi,
    Ethernet,
    Disconnected,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct WifiAccessPoint {
    pub ssid: String,
    pub signal_strength: u8,
    pub security: String,
    pub is_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkStatus {
    pub network_type: NetworkType,
    pub is_connected: bool,
    pub ssid: Option<String>,
    pub signal_strength: u8, // 0 - 100
    pub ip_address: Option<String>,
    pub interface_name: String,
    pub wifi_enabled: bool,
    pub available_networks: Vec<WifiAccessPoint>,
}

impl Default for NetworkStatus {
    fn default() -> Self {
        Self {
            network_type: NetworkType::WiFi,
            is_connected: true,
            ssid: Some("keralavision(kcn)".to_string()),
            signal_strength: 84,
            ip_address: Some("192.168.1.7".to_string()),
            interface_name: "wlp0s20f3".to_string(),
            wifi_enabled: true,
            available_networks: vec![
                WifiAccessPoint {
                    ssid: "keralavision(kcn)".to_string(),
                    signal_strength: 84,
                    security: "WPA2".to_string(),
                    is_active: true,
                },
            ],
        }
    }
}

pub struct NetworkManager {
    status: Mutex<NetworkStatus>,
}

impl NetworkManager {
    pub fn new() -> Self {
        let manager = Self {
            status: Mutex::new(NetworkStatus::default()),
        };
        let _ = manager.refresh();
        manager
    }

    pub fn refresh(&self) -> Result<NetworkStatus> {
        let (net_type, is_conn, ssid, iface) = query_active_connection();
        let wifi_enabled = query_wifi_radio_enabled();
        let ip = iface.as_ref().and_then(|i| query_interface_ip(i));
        let networks = query_available_wifi();
        let signal = networks.iter().find(|n| n.is_active).map(|n| n.signal_strength).unwrap_or(80);

        let mut status = self.status.lock().map_err(|e| LumaError::SubsystemUnavailable(e.to_string()))?;
        status.network_type = net_type;
        status.is_connected = is_conn;
        status.ssid = ssid;
        status.signal_strength = signal;
        status.ip_address = ip;
        if let Some(i) = iface {
            status.interface_name = i;
        }
        status.wifi_enabled = wifi_enabled;
        if !networks.is_empty() {
            status.available_networks = networks;
        }

        Ok(status.clone())
    }

    pub fn get_status(&self) -> Result<NetworkStatus> {
        self.refresh()
    }

    pub fn set_wifi_enabled(&self, enabled: bool) -> Result<NetworkStatus> {
        let arg = if enabled { "on" } else { "off" };
        let res = Command::new("nmcli").args(["radio", "wifi", arg]).output();

        if let Ok(out) = res {
            if !out.status.success() {
                let err_msg = String::from_utf8_lossy(&out.stderr);
                tracing::warn!("Failed to switch Wi-Fi radio: {}", err_msg);
            }
        }

        let mut status = self.status.lock().map_err(|e| LumaError::SubsystemUnavailable(e.to_string()))?;
        status.wifi_enabled = enabled;
        if !enabled && status.network_type == NetworkType::WiFi {
            status.is_connected = false;
            status.network_type = NetworkType::Disconnected;
        }
        Ok(status.clone())
    }

    pub fn toggle_wifi(&self) -> Result<NetworkStatus> {
        let curr = {
            let s = self.status.lock().map_err(|e| LumaError::SubsystemUnavailable(e.to_string()))?;
            s.wifi_enabled
        };
        self.set_wifi_enabled(!curr)
    }

    pub fn scan_wifi(&self) -> Result<Vec<WifiAccessPoint>> {
        let networks = query_available_wifi();
        if !networks.is_empty() {
            let mut status = self.status.lock().map_err(|e| LumaError::SubsystemUnavailable(e.to_string()))?;
            status.available_networks = networks.clone();
        }
        Ok(networks)
    }
}

impl Default for NetworkManager {
    fn default() -> Self {
        Self::new()
    }
}

fn query_wifi_radio_enabled() -> bool {
    let output = Command::new("nmcli").args(["radio", "wifi"]).output();
    if let Ok(out) = output {
        if out.status.success() {
            let text = String::from_utf8_lossy(&out.stdout).trim().to_lowercase();
            return text == "enabled";
        }
    }
    true
}

fn query_active_connection() -> (NetworkType, bool, Option<String>, Option<String>) {
    let output = Command::new("nmcli")
        .args(["-t", "-f", "TYPE,NAME,DEVICE,STATE", "c", "show", "--active"])
        .output();

    if let Ok(out) = output {
        if out.status.success() {
            let text = String::from_utf8_lossy(&out.stdout);
            for line in text.lines() {
                let parts: Vec<&str> = line.split(':').collect();
                if parts.len() >= 4 && parts[3] == "activated" {
                    let conn_type = parts[0];
                    let name = parts[1].to_string();
                    let device = parts[2].to_string();

                    if conn_type.contains("wireless") || conn_type.contains("wifi") {
                        return (NetworkType::WiFi, true, Some(name), Some(device));
                    } else if conn_type.contains("ethernet") {
                        return (NetworkType::Ethernet, true, Some(name), Some(device));
                    }
                }
            }
        }
    }

    (NetworkType::Disconnected, false, None, None)
}

fn query_interface_ip(interface: &str) -> Option<String> {
    let output = Command::new("nmcli")
        .args(["-g", "IP4.ADDRESS", "dev", "show", interface])
        .output()
        .ok()?;

    if output.status.success() {
        let text = String::from_utf8_lossy(&output.stdout);
        let first_line = text.lines().next()?.trim();
        if !first_line.is_empty() {
            // Strip subnet cidr if present (e.g. 192.168.1.7/24 -> 192.168.1.7)
            let ip = first_line.split('/').next().unwrap_or(first_line);
            return Some(ip.to_string());
        }
    }
    None
}

pub fn parse_nmcli_wifi_list(output_text: &str) -> Vec<WifiAccessPoint> {
    let mut ap_list = Vec::new();
    for line in output_text.lines() {
        let parts: Vec<&str> = line.split(':').collect();
        if parts.len() >= 4 {
            let ssid = parts[0].trim().to_string();
            if ssid.is_empty() || ssid == "--" {
                continue;
            }
            let signal = parts[1].trim().parse::<u8>().unwrap_or(50);
            let security = parts[2].trim().to_string();
            let is_active = parts[3].trim().eq_ignore_ascii_case("yes");

            // Avoid duplicates by SSID
            if !ap_list.iter().any(|item: &WifiAccessPoint| item.ssid == ssid) {
                ap_list.push(WifiAccessPoint {
                    ssid,
                    signal_strength: signal,
                    security,
                    is_active,
                });
            }
        }
    }
    ap_list
}

fn query_available_wifi() -> Vec<WifiAccessPoint> {
    let output = Command::new("nmcli")
        .args(["-t", "-f", "SSID,SIGNAL,SECURITY,ACTIVE", "dev", "wifi"])
        .output();

    if let Ok(out) = output {
        if out.status.success() {
            let text = String::from_utf8_lossy(&out.stdout);
            return parse_nmcli_wifi_list(&text);
        }
    }
    Vec::new()
}

#[tauri::command]
pub fn get_network_status(manager: tauri::State<NetworkManager>) -> Result<NetworkStatus> {
    manager.get_status()
}

#[tauri::command]
pub fn toggle_wifi(manager: tauri::State<NetworkManager>) -> Result<NetworkStatus> {
    manager.toggle_wifi()
}

#[tauri::command]
pub fn set_wifi_enabled(enabled: bool, manager: tauri::State<NetworkManager>) -> Result<NetworkStatus> {
    manager.set_wifi_enabled(enabled)
}

#[tauri::command]
pub fn scan_wifi_networks(manager: tauri::State<NetworkManager>) -> Result<Vec<WifiAccessPoint>> {
    manager.scan_wifi()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_network_status() {
        let manager = NetworkManager::new();
        let s = manager.get_status().unwrap();
        assert!(s.signal_strength <= 100);
    }

    #[test]
    fn test_parse_nmcli_wifi_list() {
        let sample = "keralavision(kcn):56:WPA1 WPA2:yes\nShine broadband_EXT:32:WPA2:no\n";
        let list = parse_nmcli_wifi_list(sample);
        assert_eq!(list.len(), 2);
        assert_eq!(list[0].ssid, "keralavision(kcn)");
        assert_eq!(list[0].signal_strength, 56);
        assert!(list[0].is_active);
        assert!(!list[1].is_active);
    }

    #[test]
    fn test_wifi_toggle() {
        let manager = NetworkManager::new();
        let initial = manager.get_status().unwrap();
        let toggled = manager.toggle_wifi().unwrap();
        assert_eq!(toggled.wifi_enabled, !initial.wifi_enabled);
    }
}

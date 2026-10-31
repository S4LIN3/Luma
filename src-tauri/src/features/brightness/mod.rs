use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use std::process::Command;
use std::sync::Mutex;
use crate::core::error::{LumaError, Result};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct BacklightDevice {
    pub name: String,
    pub current: u32,
    pub max: u32,
    pub percentage: u32,
    pub device_type: String,
    pub is_writable: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrightnessStatus {
    pub percentage: u32, // 0 - 100
    pub current_device: Option<BacklightDevice>,
    pub available_devices: Vec<BacklightDevice>,
    pub backend: String,
    pub is_supported: bool,
}

impl Default for BacklightDevice {
    fn default() -> Self {
        Self {
            name: "intel_backlight".to_string(),
            current: 20000,
            max: 26666,
            percentage: 75,
            device_type: "raw".to_string(),
            is_writable: false,
        }
    }
}

impl Default for BrightnessStatus {
    fn default() -> Self {
        let dev = BacklightDevice::default();
        Self {
            percentage: dev.percentage,
            current_device: Some(dev.clone()),
            available_devices: vec![dev],
            backend: "systemd-logind".to_string(),
            is_supported: true,
        }
    }
}

pub struct BrightnessManager {
    status: Mutex<BrightnessStatus>,
}

impl BrightnessManager {
    pub fn new() -> Self {
        let manager = Self {
            status: Mutex::new(BrightnessStatus::default()),
        };
        let _ = manager.refresh();
        manager
    }

    pub fn refresh(&self) -> Result<BrightnessStatus> {
        let devices = scan_backlight_devices();
        let is_supported = !devices.is_empty();
        let primary_device = devices.first().cloned();
        let percentage = primary_device.as_ref().map(|d| d.percentage).unwrap_or(75);

        let mut status = self.status.lock().map_err(|e| LumaError::SubsystemUnavailable(e.to_string()))?;
        status.percentage = percentage;
        status.is_supported = is_supported;
        status.current_device = primary_device;
        status.available_devices = devices;
        status.backend = if is_supported { "systemd-logind".to_string() } else { "none".to_string() };

        Ok(status.clone())
    }

    pub fn get_status(&self) -> Result<BrightnessStatus> {
        self.refresh()
    }

    pub fn set_brightness(&self, percentage: u32) -> Result<BrightnessStatus> {
        let clamped = percentage.clamp(1, 100);

        let current_dev = {
            let s = self.status.lock().map_err(|e| LumaError::SubsystemUnavailable(e.to_string()))?;
            s.current_device.clone()
        };

        if let Some(dev) = current_dev {
            set_device_brightness(&dev.name, dev.max, clamped)?;
        } else {
            return Err(LumaError::Brightness("No backlight device found on this system".to_string()));
        }

        self.refresh()
    }
}

impl Default for BrightnessManager {
    fn default() -> Self {
        Self::new()
    }
}

/// Scan /sys/class/backlight for physical display controllers
pub fn scan_backlight_devices() -> Vec<BacklightDevice> {
    let mut devices = Vec::new();
    let backlight_path = Path::new("/sys/class/backlight");
    if !backlight_path.exists() {
        return devices;
    }

    if let Ok(entries) = fs::read_dir(backlight_path) {
        for entry in entries.flatten() {
            let name = entry.file_name().to_string_lossy().to_string();
            let p = entry.path();

            let cur_str = fs::read_to_string(p.join("brightness")).unwrap_or_default();
            let max_str = fs::read_to_string(p.join("max_brightness")).unwrap_or_default();
            let type_str = fs::read_to_string(p.join("type")).unwrap_or_else(|_| "raw".to_string());

            if let (Ok(cur), Ok(max)) = (cur_str.trim().parse::<u32>(), max_str.trim().parse::<u32>()) {
                if max > 0 {
                    let percent = calculate_brightness_percentage(cur, max);
                    let is_writable = fs::OpenOptions::new().write(true).open(p.join("brightness")).is_ok();

                    devices.push(BacklightDevice {
                        name,
                        current: cur,
                        max,
                        percentage: percent,
                        device_type: type_str.trim().to_string(),
                        is_writable,
                    });
                }
            }
        }
    }

    devices
}

pub fn calculate_brightness_percentage(current: u32, max: u32) -> u32 {
    if max == 0 {
        return 0;
    }
    ((current as f64 / max as f64) * 100.0).round().clamp(0.0, 100.0) as u32
}

pub fn calculate_raw_brightness(percentage: u32, max: u32) -> u32 {
    let p = percentage.clamp(1, 100);
    ((p as f64 / 100.0) * max as f64).round().clamp(1.0, max as f64) as u32
}

/// Sets screen brightness safely without requiring sudo or privileged shell scripts
fn set_device_brightness(device_name: &str, max_val: u32, percentage: u32) -> Result<()> {
    let raw_val = calculate_raw_brightness(percentage, max_val);

    // 1. Primary Method: systemd-logind via session D-Bus
    // Method signature: org.freedesktop.login1.Session.SetBrightness(s subsystem, s name, u brightness)
    let logind_res = Command::new("busctl")
        .args([
            "call",
            "org.freedesktop.login1",
            "/org/freedesktop/login1/session/auto",
            "org.freedesktop.login1.Session",
            "SetBrightness",
            "ssu",
            "backlight",
            device_name,
            &raw_val.to_string(),
        ])
        .output();

    if let Ok(out) = logind_res {
        if out.status.success() {
            return Ok(());
        }
        let err_text = String::from_utf8_lossy(&out.stderr);
        tracing::debug!("systemd-logind brightness call returned: {}", err_text);
    }

    // 2. Direct sysfs write (if user has write permission via video group / udev)
    let sysfs_file = format!("/sys/class/backlight/{}/brightness", device_name);
    if let Ok(()) = fs::write(&sysfs_file, raw_val.to_string().as_bytes()) {
        return Ok(());
    }

    // 3. Fallback: brightnessctl if installed
    let bctl_res = Command::new("brightnessctl")
        .args(["-d", device_name, "s", &format!("{}%", percentage)])
        .output();

    if let Ok(out) = bctl_res {
        if out.status.success() {
            return Ok(());
        }
    }

    Err(LumaError::PermissionDenied(format!(
        "Unable to adjust display backlight for '{}'. Ensure session D-Bus is running or add user to 'video' group.",
        device_name
    )))
}

#[tauri::command]
pub fn get_brightness_status(manager: tauri::State<BrightnessManager>) -> Result<BrightnessStatus> {
    manager.get_status()
}

#[tauri::command]
pub fn set_brightness(percentage: u32, manager: tauri::State<BrightnessManager>) -> Result<BrightnessStatus> {
    manager.set_brightness(percentage)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_brightness_percentage_math() {
        assert_eq!(calculate_brightness_percentage(20000, 26666), 75);
        assert_eq!(calculate_brightness_percentage(0, 26666), 0);
        assert_eq!(calculate_brightness_percentage(26666, 26666), 100);
    }

    #[test]
    fn test_raw_brightness_conversion() {
        assert_eq!(calculate_raw_brightness(75, 26666), 20000);
        assert_eq!(calculate_raw_brightness(100, 26666), 26666);
        assert!(calculate_raw_brightness(1, 26666) >= 1);
    }

    #[test]
    fn test_brightness_manager_initialization() {
        let manager = BrightnessManager::new();
        let s = manager.get_status().unwrap();
        assert!(s.percentage <= 100);
    }
}

pub mod window_integration;

use serde::{Deserialize, Serialize};
use crate::core::error::Result;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LinuxSubsystemStatus {
    pub dbus_session_available: bool,
    pub dbus_system_available: bool,
    pub upower_present: bool,
    pub network_manager_present: bool,
    pub bluez_present: bool,
    pub pipewire_present: bool,
    pub xdg_desktop_portal_present: bool,
}

pub fn check_subsystems() -> LinuxSubsystemStatus {
    // In Linux environments, verify presence of runtime sockets / sysfs entries
    let uid = std::env::var("UID").unwrap_or_else(|_| "1000".to_string());
    let runtime_dir = std::env::var("XDG_RUNTIME_DIR").unwrap_or_else(|_| format!("/run/user/{}", uid));

    let dbus_session_available = std::env::var("DBUS_SESSION_BUS_ADDRESS").is_ok()
        || std::path::Path::new(&format!("{}/bus", runtime_dir)).exists();

    let dbus_system_available = std::path::Path::new("/var/run/dbus/system_bus_socket").exists()
        || std::path::Path::new("/run/dbus/system_bus_socket").exists();

    let pipewire_present = std::path::Path::new(&format!("{}/pipewire-0", runtime_dir)).exists()
        || std::path::Path::new(&format!("{}/pulse/native", runtime_dir)).exists();

    let upower_present = std::path::Path::new("/sys/class/power_supply").exists();
    let network_manager_present = std::path::Path::new("/sys/class/net").exists();
    let bluez_present = std::path::Path::new("/sys/class/bluetooth").exists();
    let xdg_desktop_portal_present = std::env::var("WAYLAND_DISPLAY").is_ok() || std::env::var("DISPLAY").is_ok();

    LinuxSubsystemStatus {
        dbus_session_available,
        dbus_system_available,
        upower_present,
        network_manager_present,
        bluez_present,
        pipewire_present,
        xdg_desktop_portal_present,
    }
}

pub fn get_sysfs_battery_capacity() -> Result<Option<u32>> {
    let power_supply_dir = std::path::Path::new("/sys/class/power_supply");
    if !power_supply_dir.exists() {
        return Ok(None);
    }

    if let Ok(entries) = std::fs::read_dir(power_supply_dir) {
        for entry in entries.flatten() {
            let file_name = entry.file_name().to_string_lossy().to_string();
            if file_name.starts_with("BAT") {
                let capacity_file = entry.path().join("capacity");
                if let Ok(content) = std::fs::read_to_string(capacity_file) {
                    if let Ok(cap) = content.trim().parse::<u32>() {
                        return Ok(Some(cap));
                    }
                }
            }
        }
    }

    Ok(None)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_check_subsystems() {
        let status = check_subsystems();
        // NetworkManager sysfs /sys/class/net or upower is checked safely
        println!("Subsystems: {:?}", status);
    }
}

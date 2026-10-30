pub mod cosmic;
pub mod linux;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum DisplayServer {
    Wayland,
    X11,
    Unknown,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum DesktopEnvironment {
    COSMIC,
    GNOME,
    KDE,
    XFCE,
    Other,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlatformInfo {
    pub os_name: String,
    pub os_version: String,
    pub kernel_version: String,
    pub display_server: DisplayServer,
    pub desktop_environment: DesktopEnvironment,
    pub is_cosmic: bool,
    pub is_wayland: bool,
}

pub fn detect_platform() -> PlatformInfo {
    let display_server = if std::env::var("WAYLAND_DISPLAY").is_ok()
        || std::env::var("XDG_SESSION_TYPE").map(|v| v.to_lowercase() == "wayland").unwrap_or(false)
    {
        DisplayServer::Wayland
    } else if std::env::var("DISPLAY").is_ok()
        || std::env::var("XDG_SESSION_TYPE").map(|v| v.to_lowercase() == "x11").unwrap_or(false)
    {
        DisplayServer::X11
    } else {
        DisplayServer::Unknown
    };

    let desktop_env_var = std::env::var("XDG_CURRENT_DESKTOP")
        .or_else(|_| std::env::var("DESKTOP_SESSION"))
        .unwrap_or_default()
        .to_uppercase();

    let desktop_environment = if desktop_env_var.contains("COSMIC") {
        DesktopEnvironment::COSMIC
    } else if desktop_env_var.contains("GNOME") {
        DesktopEnvironment::GNOME
    } else if desktop_env_var.contains("KDE") {
        DesktopEnvironment::KDE
    } else if desktop_env_var.contains("XFCE") {
        DesktopEnvironment::XFCE
    } else {
        DesktopEnvironment::Other
    };

    let os_release = std::fs::read_to_string("/etc/os-release").unwrap_or_default();
    let mut os_name = "Linux".to_string();
    let mut os_version = "".to_string();

    for line in os_release.lines() {
        if let Some(val) = line.strip_prefix("PRETTY_NAME=") {
            os_name = val.trim_matches('"').to_string();
        } else if let Some(val) = line.strip_prefix("VERSION_ID=") {
            os_version = val.trim_matches('"').to_string();
        }
    }

    let kernel_version = std::fs::read_to_string("/proc/version")
        .map(|v| {
            v.split_whitespace()
                .take(3)
                .collect::<Vec<_>>()
                .join(" ")
        })
        .unwrap_or_else(|_| "Unknown".to_string());

    let is_cosmic = desktop_environment == DesktopEnvironment::COSMIC;
    let is_wayland = display_server == DisplayServer::Wayland;

    PlatformInfo {
        os_name,
        os_version,
        kernel_version,
        display_server,
        desktop_environment,
        is_cosmic,
        is_wayland,
    }
}

#[tauri::command]
pub fn get_platform_info() -> PlatformInfo {
    detect_platform()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_platform_detection() {
        let platform = detect_platform();
        assert!(!platform.os_name.is_empty());
    }
}

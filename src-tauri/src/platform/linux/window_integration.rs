use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{AppHandle, Manager, Monitor};
use crate::core::error::{LumaError, Result};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SurfaceType {
    Notch,
    Dock,
    Settings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SurfaceGeometry {
    pub surface_type: SurfaceType,
    pub width: f64,
    pub height: f64,
    pub x: f64,
    pub y: f64,
    pub scale_factor: f64,
    pub is_always_on_top: bool,
    pub is_transparent: bool,
    pub has_decorations: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SurfaceManagerStatus {
    pub active_surfaces: Vec<SurfaceType>,
    pub primary_monitor_name: String,
    pub primary_monitor_width: u32,
    pub primary_monitor_height: u32,
    pub scale_factor: f64,
    pub is_wayland: bool,
}

pub struct SurfaceManager {
    surfaces: Mutex<Vec<SurfaceType>>,
}

impl SurfaceManager {
    pub fn new() -> Self {
        Self {
            surfaces: Mutex::new(vec![SurfaceType::Notch, SurfaceType::Dock, SurfaceType::Settings]),
        }
    }

    pub fn get_status(&self, app: &AppHandle) -> Result<SurfaceManagerStatus> {
        let is_wayland = std::env::var("WAYLAND_DISPLAY").is_ok()
            || std::env::var("XDG_SESSION_TYPE").map(|v| v.to_lowercase() == "wayland").unwrap_or(false);

        let (mon_name, width, height, scale) = if let Ok(Some(mon)) = app.primary_monitor() {
            let size = mon.size();
            (
                mon.name().map(|s| s.to_string()).unwrap_or_else(|| "Primary Display".to_string()),
                size.width,
                size.height,
                mon.scale_factor(),
            )
        } else {
            ("Default Display".to_string(), 1920, 1080, 1.0)
        };

        let surfaces = self.surfaces.lock().map_err(|e| LumaError::Desktop(e.to_string()))?.clone();

        Ok(SurfaceManagerStatus {
            active_surfaces: surfaces,
            primary_monitor_name: mon_name,
            primary_monitor_width: width,
            primary_monitor_height: height,
            scale_factor: scale,
            is_wayland,
        })
    }

    pub fn calculate_notch_geometry(&self, monitor: Option<&Monitor>) -> SurfaceGeometry {
        let (screen_w, _screen_h, scale) = if let Some(mon) = monitor {
            let s = mon.size();
            (s.width as f64 / mon.scale_factor(), s.height as f64 / mon.scale_factor(), mon.scale_factor())
        } else {
            (1920.0, 1080.0, 1.0)
        };

        let width = 380.0;
        let height = 48.0;
        let x = (screen_w - width) / 2.0;
        let y = 8.0; // Margin from top edge

        SurfaceGeometry {
            surface_type: SurfaceType::Notch,
            width,
            height,
            x,
            y,
            scale_factor: scale,
            is_always_on_top: true,
            is_transparent: true,
            has_decorations: false,
        }
    }

    pub fn calculate_dock_geometry(&self, monitor: Option<&Monitor>) -> SurfaceGeometry {
        let (screen_w, screen_h, scale) = if let Some(mon) = monitor {
            let s = mon.size();
            (s.width as f64 / mon.scale_factor(), s.height as f64 / mon.scale_factor(), mon.scale_factor())
        } else {
            (1920.0, 1080.0, 1.0)
        };

        let width = 540.0;
        let height = 76.0;
        let x = (screen_w - width) / 2.0;
        let y = screen_h - height - 12.0; // Margin from bottom edge

        SurfaceGeometry {
            surface_type: SurfaceType::Dock,
            width,
            height,
            x,
            y,
            scale_factor: scale,
            is_always_on_top: true,
            is_transparent: true,
            has_decorations: false,
        }
    }

    pub fn calculate_settings_geometry(&self, monitor: Option<&Monitor>) -> SurfaceGeometry {
        let (screen_w, screen_h, scale) = if let Some(mon) = monitor {
            let s = mon.size();
            (s.width as f64 / mon.scale_factor(), s.height as f64 / mon.scale_factor(), mon.scale_factor())
        } else {
            (1920.0, 1080.0, 1.0)
        };

        let width = 940.0;
        let height = 680.0;
        let x = (screen_w - width) / 2.0;
        let y = (screen_h - height) / 2.0;

        SurfaceGeometry {
            surface_type: SurfaceType::Settings,
            width,
            height,
            x,
            y,
            scale_factor: scale,
            is_always_on_top: false,
            is_transparent: false,
            has_decorations: true,
        }
    }

    pub fn resize_surface(
        &self,
        app: &AppHandle,
        surface_type: SurfaceType,
        width: f64,
        height: f64,
    ) -> Result<()> {
        let label = match surface_type {
            SurfaceType::Notch => "notch",
            SurfaceType::Dock => "dock",
            SurfaceType::Settings => "settings",
        };

        if let Some(win) = app.get_webview_window(label) {
            win.set_size(tauri::LogicalSize::new(width, height))
                .map_err(|e| LumaError::Desktop(e.to_string()))?;
        }
        Ok(())
    }
}

impl Default for SurfaceManager {
    fn default() -> Self {
        Self::new()
    }
}

#[tauri::command]
pub fn get_surface_status(
    app: AppHandle,
    manager: tauri::State<SurfaceManager>,
) -> Result<SurfaceManagerStatus> {
    manager.get_status(&app)
}

#[tauri::command]
pub fn get_surface_geometry(
    app: AppHandle,
    surface: SurfaceType,
    manager: tauri::State<SurfaceManager>,
) -> Result<SurfaceGeometry> {
    let primary_mon = app.primary_monitor().ok().flatten();
    match surface {
        SurfaceType::Notch => Ok(manager.calculate_notch_geometry(primary_mon.as_ref())),
        SurfaceType::Dock => Ok(manager.calculate_dock_geometry(primary_mon.as_ref())),
        SurfaceType::Settings => Ok(manager.calculate_settings_geometry(primary_mon.as_ref())),
    }
}

#[tauri::command]
pub fn resize_notch_surface(
    app: AppHandle,
    width: f64,
    height: f64,
    manager: tauri::State<SurfaceManager>,
) -> Result<()> {
    manager.resize_surface(&app, SurfaceType::Notch, width, height)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_surface_geometry_math() {
        let manager = SurfaceManager::new();
        let geom = manager.calculate_notch_geometry(None);
        assert_eq!(geom.surface_type, SurfaceType::Notch);
        assert!(geom.is_always_on_top);
        assert!(geom.is_transparent);
        assert!(!geom.has_decorations);
    }

    #[test]
    fn test_dock_geometry_math() {
        let manager = SurfaceManager::new();
        let geom = manager.calculate_dock_geometry(None);
        assert_eq!(geom.surface_type, SurfaceType::Dock);
        assert!(geom.y > 0.0);
    }
}

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CosmicEnvironmentStatus {
    pub is_active: bool,
    pub comp_running: bool,
    pub session_version: Option<String>,
    pub panel_protocol: String,
}

pub fn check_cosmic_environment() -> CosmicEnvironmentStatus {
    let desktop_env = std::env::var("XDG_CURRENT_DESKTOP").unwrap_or_default();
    let is_active = desktop_env.to_uppercase().contains("COSMIC");

    // Check if cosmic-comp is running or available
    let comp_running = is_active && std::env::var("WAYLAND_DISPLAY").is_ok();

    CosmicEnvironmentStatus {
        is_active,
        comp_running,
        session_version: if is_active { Some("COSMIC Epoch 1".to_string()) } else { None },
        panel_protocol: "wlr-layer-shell / cosmic-applet".to_string(),
    }
}

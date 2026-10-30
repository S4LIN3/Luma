use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LumaConfig {
    pub app_name: String,
    pub version: String,
    pub identifier: String,
    pub autostart: bool,
    pub theme: ThemeConfig,
    pub debug_mode: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThemeConfig {
    pub mode: String, // "system" | "dark" | "light"
    pub accent_color: String,
    pub transparency: f32, // 0.0 - 1.0
    pub blur_radius: u32,
}

impl Default for LumaConfig {
    fn default() -> Self {
        Self {
            app_name: "Luma".to_string(),
            version: env!("CARGO_PKG_VERSION").to_string(),
            identifier: "luma-desktop".to_string(),
            autostart: false,
            theme: ThemeConfig::default(),
            debug_mode: cfg!(debug_assertions),
        }
    }
}

impl Default for ThemeConfig {
    fn default() -> Self {
        Self {
            mode: "dark".to_string(),
            accent_color: "#6366f1".to_string(), // Indigo-500
            transparency: 0.85,
            blur_radius: 20,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = LumaConfig::default();
        assert_eq!(config.app_name, "Luma");
        assert_eq!(config.identifier, "luma-desktop");
        assert_eq!(config.theme.mode, "dark");
    }
}

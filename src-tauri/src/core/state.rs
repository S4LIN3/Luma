use std::sync::Mutex;
use crate::core::config::LumaConfig;

pub struct AppState {
    pub config: Mutex<LumaConfig>,
    pub initialized_at: std::time::Instant,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            config: Mutex::new(LumaConfig::default()),
            initialized_at: std::time::Instant::now(),
        }
    }
}

impl Default for AppState {
    fn default() -> Self {
        Self::new()
    }
}

use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use crate::core::error::{LumaError, Result};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum NotificationUrgency {
    Low,
    Normal,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationItem {
    pub id: u32,
    pub app_name: String,
    pub summary: String,
    pub body: String,
    pub icon: String,
    pub urgency: NotificationUrgency,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationState {
    pub items: Vec<NotificationItem>,
    pub do_not_disturb: bool,
}

impl Default for NotificationState {
    fn default() -> Self {
        Self {
            items: vec![
                NotificationItem {
                    id: 1,
                    app_name: "COSMIC Settings".to_string(),
                    summary: "System Update Available".to_string(),
                    body: "Pop!_OS 24.04 security patches are ready to install.".to_string(),
                    icon: "Sparkles".to_string(),
                    urgency: NotificationUrgency::Normal,
                    timestamp: 1729000000,
                },
                NotificationItem {
                    id: 2,
                    app_name: "Calendar".to_string(),
                    summary: "Sprint Architecture Review".to_string(),
                    body: "Starting in 15 minutes in room Orbit.".to_string(),
                    icon: "Calendar".to_string(),
                    urgency: NotificationUrgency::Low,
                    timestamp: 1729003600,
                },
            ],
            do_not_disturb: false,
        }
    }
}

pub struct NotificationManager {
    state: Mutex<NotificationState>,
}

impl NotificationManager {
    pub fn new() -> Self {
        Self {
            state: Mutex::new(NotificationState::default()),
        }
    }

    pub fn get_state(&self) -> Result<NotificationState> {
        let s = self.state.lock().map_err(|e| LumaError::SubsystemUnavailable(e.to_string()))?;
        Ok(s.clone())
    }

    pub fn dismiss(&self, id: u32) -> Result<NotificationState> {
        let mut s = self.state.lock().map_err(|e| LumaError::SubsystemUnavailable(e.to_string()))?;
        s.items.retain(|item| item.id != id);
        Ok(s.clone())
    }

    pub fn clear_all(&self) -> Result<NotificationState> {
        let mut s = self.state.lock().map_err(|e| LumaError::SubsystemUnavailable(e.to_string()))?;
        s.items.clear();
        Ok(s.clone())
    }
}

impl Default for NotificationManager {
    fn default() -> Self {
        Self::new()
    }
}

#[tauri::command]
pub fn get_notifications(manager: tauri::State<NotificationManager>) -> Result<NotificationState> {
    manager.get_state()
}

#[tauri::command]
pub fn dismiss_notification(id: u32, manager: tauri::State<NotificationManager>) -> Result<NotificationState> {
    manager.dismiss(id)
}

#[tauri::command]
pub fn clear_notifications(manager: tauri::State<NotificationManager>) -> Result<NotificationState> {
    manager.clear_all()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_notification_dismiss() {
        let manager = NotificationManager::new();
        let state = manager.dismiss(1).unwrap();
        assert_eq!(state.items.len(), 1);
        assert_eq!(state.items[0].id, 2);
    }
}

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "payload")]
pub enum LumaEvent {
    NotchStateChanged(serde_json::Value),
    DockConfigChanged(serde_json::Value),
    MediaTrackChanged(serde_json::Value),
    AudioVolumeChanged(serde_json::Value),
    NetworkStatusChanged(serde_json::Value),
    BluetoothStatusChanged(serde_json::Value),
    BatteryLevelChanged(serde_json::Value),
    NotificationReceived(serde_json::Value),
    MonitorConfigurationChanged(serde_json::Value),
}

pub const EVENT_NOTCH_UPDATE: &str = "luma://notch/update";
pub const EVENT_DOCK_UPDATE: &str = "luma://dock/update";
pub const EVENT_SYSTEM_UPDATE: &str = "luma://system/update";

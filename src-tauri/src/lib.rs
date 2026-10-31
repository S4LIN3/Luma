pub mod core;
pub mod features;
pub mod platform;

use core::state::AppState;
use features::audio::{self, AudioManager};
use features::battery::{self, BatteryManager};
use features::bluetooth::{self, BluetoothManager};
use features::brightness::{self, BrightnessManager};
use features::dock::{self, DockManager};
use features::media::{self, MediaManager};
use features::monitors::{self, MonitorManager};
use features::network::{self, NetworkManager};
use features::notch::{self, NotchManager};
use features::notifications::{self, NotificationManager};
use features::settings::{self, SettingsManager};
use platform::linux::window_integration::{self, SurfaceManager};

pub fn run() {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info")),
        )
        .init();

    tracing::info!("Initializing Luma Desktop on Linux...");

    tauri::Builder::default()
        .manage(AppState::new())
        .manage(NotchManager::new())
        .manage(DockManager::new())
        .manage(SettingsManager::new())
        .manage(MediaManager::new())
        .manage(AudioManager::new())
        .manage(NetworkManager::new())
        .manage(BluetoothManager::new())
        .manage(BrightnessManager::new())
        .manage(BatteryManager::new())
        .manage(NotificationManager::new())
        .manage(MonitorManager::new())
        .manage(SurfaceManager::new())
        .invoke_handler(tauri::generate_handler![
            platform::get_platform_info,
            window_integration::get_surface_status,
            window_integration::get_surface_geometry,
            window_integration::resize_notch_surface,
            notch::get_notch_state,
            notch::set_notch_mode,
            dock::get_dock_config,
            dock::set_dock_position,
            dock::discover_applications,
            dock::launch_application,
            dock::pin_application,
            dock::unpin_application,
            dock::reorder_dock_items,
            dock::update_dock_settings,
            settings::get_settings,
            settings::update_settings,
            media::get_media_status,
            media::media_play_pause,
            media::media_next,
            media::media_previous,
            media::get_visualizer_bands,
            audio::get_audio_status,
            audio::set_volume,
            audio::toggle_mute,
            audio::set_audio_default_endpoint,
            network::get_network_status,
            network::toggle_wifi,
            network::set_wifi_enabled,
            network::scan_wifi_networks,
            bluetooth::get_bluetooth_status,
            bluetooth::toggle_bluetooth,
            bluetooth::set_bluetooth_enabled,
            bluetooth::connect_bluetooth_device,
            bluetooth::disconnect_bluetooth_device,
            brightness::get_brightness_status,
            brightness::set_brightness,
            battery::get_battery_status,
            notifications::get_notifications,
            notifications::dismiss_notification,
            notifications::clear_notifications,
            monitors::get_monitors,
        ])
        .run(tauri::generate_context!())
        .expect("Failed to run Luma desktop application");
}

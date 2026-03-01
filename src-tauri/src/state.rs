use std::sync::Mutex;

/// État global de l'application, partagé entre toutes les commandes Tauri
pub struct AppState {
    pub config: Mutex<AppConfig>,
}

pub struct AppConfig {
    pub app_name: String,
    pub version: String,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            config: Mutex::new(AppConfig {
                app_name: "owl-boilerplate".to_string(),
                version: env!("CARGO_PKG_VERSION").to_string(),
            }),
        }
    }
}

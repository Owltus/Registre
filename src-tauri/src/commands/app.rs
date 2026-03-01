use serde::Serialize;
use tauri::State;

use crate::state::AppState;

#[derive(Serialize)]
pub struct AppInfo {
    pub name: String,
    pub version: String,
    pub os: String,
    pub arch: String,
}

/// Retourne les informations de base de l'application
#[tauri::command]
pub fn get_app_info(state: State<AppState>) -> AppInfo {
    let config = state.config.lock().unwrap();
    AppInfo {
        name: config.app_name.clone(),
        version: config.version.clone(),
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
    }
}

/// Retourne l'URL de connexion SQLite utilisée par le backend
#[tauri::command]
pub fn get_db_url(state: State<AppState>) -> String {
    state.db_url.clone()
}

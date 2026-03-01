use crate::error::AppError;

/// Lit le contenu d'un fichier texte
#[tauri::command]
pub async fn read_file(path: String) -> Result<String, AppError> {
    tokio::fs::read_to_string(&path)
        .await
        .map_err(|e| AppError::FileError(format!("{}: {}", path, e)))
}

/// Écrit du contenu dans un fichier texte
#[tauri::command]
pub async fn write_file(path: String, content: String) -> Result<(), AppError> {
    tokio::fs::write(&path, &content)
        .await
        .map_err(|e| AppError::FileError(format!("{}: {}", path, e)))
}

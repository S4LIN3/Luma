use serde::Serialize;
use thiserror::Error;

pub type Result<T> = std::result::Result<T, LumaError>;

#[derive(Error, Debug, Serialize)]
#[serde(tag = "type", content = "message")]
pub enum LumaError {
    #[error("Configuration error: {0}")]
    Config(String),

    #[error("Platform integration error: {0}")]
    Platform(String),

    #[error("Desktop environment error: {0}")]
    Desktop(String),

    #[error("DBus communication error: {0}")]
    DBus(String),

    #[error("Notch error: {0}")]
    Notch(String),

    #[error("Dock error: {0}")]
    Dock(String),

    #[error("Hardware/Subsystem not available: {0}")]
    SubsystemUnavailable(String),

    #[error("Entity not found: {0}")]
    NotFound(String),

    #[error("Internal I/O error: {0}")]
    Io(String),

    #[error("Serialization error: {0}")]
    Serialization(String),
}

impl From<std::io::Error> for LumaError {
    fn from(err: std::io::Error) -> Self {
        LumaError::Io(err.to_string())
    }
}

impl From<serde_json::Error> for LumaError {
    fn from(err: serde_json::Error) -> Self {
        LumaError::Serialization(err.to_string())
    }
}

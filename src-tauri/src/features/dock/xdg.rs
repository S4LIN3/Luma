use base64::Engine;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct DiscoveredApp {
    pub id: String, // e.g. "com.system76.CosmicFiles.desktop"
    pub name: String,
    pub generic_name: Option<String>,
    pub comment: Option<String>,
    pub icon_name: String,
    pub icon_data_url: Option<String>,
    pub exec: String,
    pub desktop_file: String,
    pub categories: Vec<String>,
    pub keywords: Vec<String>,
    pub is_terminal: bool,
    pub is_pinned: bool,
    pub is_running: bool,
    pub active_instances: u32,
}

/// Discover all valid applications according to XDG Desktop Entry Specification
pub fn discover_xdg_applications() -> Vec<DiscoveredApp> {
    let app_dirs = get_application_directories();
    let mut apps_by_id: HashMap<String, DiscoveredApp> = HashMap::new();
    let running_processes = detect_running_process_names();

    for dir in app_dirs {
        if !dir.exists() {
            continue;
        }

        if let Ok(entries) = fs::read_dir(&dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("desktop") {
                    let file_id = path.file_name().unwrap_or_default().to_string_lossy().to_string();

                    // Earlier directories in the search path take precedence
                    if apps_by_id.contains_key(&file_id) {
                        continue;
                    }

                    if let Some(app) = parse_desktop_file(&path, &file_id, &running_processes) {
                        apps_by_id.insert(file_id, app);
                    }
                }
            }
        }
    }

    let mut list: Vec<DiscoveredApp> = apps_by_id.into_values().collect();
    list.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    list
}

/// Returns list of standard XDG application directories
pub fn get_application_directories() -> Vec<PathBuf> {
    let mut dirs = Vec::new();

    // 1. User local directory ($HOME/.local/share/applications)
    if let Ok(home) = std::env::var("HOME") {
        dirs.push(PathBuf::from(&home).join(".local/share/applications"));
        dirs.push(PathBuf::from(&home).join(".local/share/flatpak/exports/share/applications"));
    }

    // 2. Flatpak system exports
    dirs.push(PathBuf::from("/var/lib/flatpak/exports/share/applications"));

    // 3. System directories (/usr/local/share/applications, /usr/share/applications)
    dirs.push(PathBuf::from("/usr/local/share/applications"));
    dirs.push(PathBuf::from("/usr/share/applications"));

    // 4. XDG_DATA_DIRS if defined
    if let Ok(xdg_data_dirs) = std::env::var("XDG_DATA_DIRS") {
        for part in xdg_data_dirs.split(':') {
            if !part.trim().is_empty() {
                let p = PathBuf::from(part.trim()).join("applications");
                if !dirs.contains(&p) {
                    dirs.push(p);
                }
            }
        }
    }

    dirs
}

/// Parse a single .desktop file
pub fn parse_desktop_file(
    path: &Path,
    file_id: &str,
    running_procs: &HashMap<String, u32>,
) -> Option<DiscoveredApp> {
    let content = fs::read_to_string(path).ok()?;
    let mut in_desktop_entry = false;

    let mut name = None;
    let mut generic_name = None;
    let mut comment = None;
    let mut icon = None;
    let mut exec = None;
    let mut no_display = false;
    let mut hidden = false;
    let mut app_type = None;
    let mut categories = Vec::new();
    let mut keywords = Vec::new();
    let mut is_terminal = false;

    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with('[') {
            in_desktop_entry = trimmed == "[Desktop Entry]";
            continue;
        }

        if !in_desktop_entry || trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }

        if let Some((k, v)) = trimmed.split_once('=') {
            let key = k.trim();
            let val = v.trim();

            match key {
                "Type" => app_type = Some(val.to_string()),
                "Name" if name.is_none() => name = Some(val.to_string()),
                "GenericName" if generic_name.is_none() => generic_name = Some(val.to_string()),
                "Comment" if comment.is_none() => comment = Some(val.to_string()),
                "Icon" if icon.is_none() => icon = Some(val.to_string()),
                "Exec" if exec.is_none() => exec = Some(val.to_string()),
                "NoDisplay" => no_display = val.eq_ignore_ascii_case("true"),
                "Hidden" => hidden = val.eq_ignore_ascii_case("true"),
                "Terminal" => is_terminal = val.eq_ignore_ascii_case("true"),
                "Categories" => {
                    categories = val.split(';').map(|s| s.trim().to_string()).filter(|s| !s.is_empty()).collect();
                }
                "Keywords" => {
                    keywords = val.split(';').map(|s| s.trim().to_string()).filter(|s| !s.is_empty()).collect();
                }
                _ => {}
            }
        }
    }

    // Must be Type=Application, not hidden, not NoDisplay
    if app_type.as_deref() != Some("Application") || no_display || hidden {
        return None;
    }

    let app_name = name?;
    let exec_cmd = exec?;
    let icon_name = icon.unwrap_or_else(|| "application-x-executable".to_string());
    let icon_url = resolve_icon_data_url(&icon_name);

    // Detect if running
    let binary_name = extract_binary_name(&exec_cmd);
    let active_instances = binary_name
        .as_ref()
        .and_then(|bin| {
            running_procs.get(bin).or_else(|| {
                // Also check without extension or prefix
                let short = bin.split('/').last().unwrap_or(bin);
                running_procs.get(short)
            })
        })
        .copied()
        .unwrap_or(0);

    let is_running = active_instances > 0;

    Some(DiscoveredApp {
        id: file_id.to_string(),
        name: app_name,
        generic_name,
        comment,
        icon_name,
        icon_data_url: icon_url,
        exec: exec_cmd,
        desktop_file: path.to_string_lossy().to_string(),
        categories,
        keywords,
        is_terminal,
        is_pinned: false,
        is_running,
        active_instances,
    })
}

/// Extract main binary name from Exec line, stripping field codes and options
pub fn extract_binary_name(exec_line: &str) -> Option<String> {
    let cleaned = clean_exec_command(exec_line);
    let first = cleaned.split_whitespace().next()?;
    let file_name = first.split('/').last().unwrap_or(first);
    Some(file_name.to_string())
}

/// Strips XDG Desktop Entry field codes (%f, %F, %u, %U, etc.)
pub fn clean_exec_command(exec_line: &str) -> String {
    let mut parts = Vec::new();
    for token in exec_line.split_whitespace() {
        if token.starts_with('%') {
            continue;
        }
        parts.push(token);
    }
    parts.join(" ")
}

/// Resolves an icon name to a base64 Data URL (SVG / PNG / XPM)
pub fn resolve_icon_data_url(icon_name: &str) -> Option<String> {
    let icon_path = resolve_icon_file_path(icon_name)?;
    let bytes = fs::read(&icon_path).ok()?;

    let mime = match icon_path.extension().and_then(|s| s.to_str()).unwrap_or("") {
        "svg" => "image/svg+xml",
        "png" => "image/png",
        "xpm" => "image/x-xpixmap",
        "jpg" | "jpeg" => "image/jpeg",
        "webp" => "image/webp",
        _ => "image/png",
    };

    let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
    Some(format!("data:{};base64,{}", mime, b64))
}

/// Find the actual icon file path on the filesystem
pub fn resolve_icon_file_path(icon_name: &str) -> Option<PathBuf> {
    let raw_path = Path::new(icon_name);
    if raw_path.is_absolute() && raw_path.exists() {
        return Some(raw_path.to_path_buf());
    }

    let mut search_roots = Vec::new();
    if let Ok(home) = std::env::var("HOME") {
        search_roots.push(PathBuf::from(&home).join(".local/share/icons"));
        search_roots.push(PathBuf::from(&home).join(".icons"));
        search_roots.push(PathBuf::from(&home).join(".local/share/flatpak/exports/share/icons"));
    }

    search_roots.push(PathBuf::from("/var/lib/flatpak/exports/share/icons"));
    search_roots.push(PathBuf::from("/usr/share/icons/Pop"));
    search_roots.push(PathBuf::from("/usr/share/icons/Cosmic"));
    search_roots.push(PathBuf::from("/usr/share/icons/hicolor"));
    search_roots.push(PathBuf::from("/usr/share/icons/Adwaita"));
    search_roots.push(PathBuf::from("/usr/share/pixmaps"));

    let extensions = [".svg", ".png", ".xpm"];
    let size_priorities = ["128x128", "256x256", "64x64", "48x48", "scalable", "32x32", "16x16"];

    for root in &search_roots {
        if !root.exists() {
            continue;
        }

        // Direct check under root (e.g. /usr/share/pixmaps/foo.png)
        for ext in &extensions {
            let candidate = root.join(format!("{}{}", icon_name, ext));
            if candidate.is_file() {
                return Some(candidate);
            }
        }

        // Check prioritized sizes under apps/
        for size in &size_priorities {
            for ext in &extensions {
                let candidate = root.join(size).join("apps").join(format!("{}{}", icon_name, ext));
                if candidate.is_file() {
                    return Some(candidate);
                }
                let candidate_at_size = root.join(format!("{}@2x", size)).join("apps").join(format!("{}{}", icon_name, ext));
                if candidate_at_size.is_file() {
                    return Some(candidate_at_size);
                }
            }
        }
    }

    None
}

/// Detect running process names by reading /proc
pub fn detect_running_process_names() -> HashMap<String, u32> {
    let mut procs = HashMap::new();
    let proc_dir = match fs::read_dir("/proc") {
        Ok(d) => d,
        Err(_) => return procs,
    };

    for entry in proc_dir.flatten() {
        let name = entry.file_name().to_string_lossy().to_string();
        if name.chars().all(|c| c.is_ascii_digit()) {
            let comm_path = entry.path().join("comm");
            if let Ok(comm) = fs::read_to_string(comm_path) {
                let proc_name = comm.trim().to_string();
                if !proc_name.is_empty() {
                    *procs.entry(proc_name).or_insert(0) += 1;
                }
            }
        }
    }

    procs
}

/// Launch an application using its XDG desktop entry command
pub fn launch_application_by_exec(exec_cmd: &str, is_terminal: bool) -> Result<(), String> {
    let clean = clean_exec_command(exec_cmd);
    let parts: Vec<&str> = clean.split_whitespace().collect();
    if parts.is_empty() {
        return Err("Empty Exec command".to_string());
    }

    let (bin, args) = if is_terminal {
        // Wrap with terminal if Terminal=true
        let term_bin = "cosmic-term";
        (term_bin, vec!["-e", parts[0]])
    } else {
        (parts[0], parts[1..].to_vec())
    };

    Command::new(bin)
        .args(args)
        .spawn()
        .map_err(|e| format!("Failed to spawn '{}': {}", bin, e))?;

    Ok(())
}

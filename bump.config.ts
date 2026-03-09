export default {
  commit: "build: release v%s",
  tag: "v%s",
  push: false,
  files: [
    "package.json",
    "src-tauri/tauri.conf.json",
    "src-tauri/Cargo.toml",
    "src-tauri/Cargo.lock",
  ],
}

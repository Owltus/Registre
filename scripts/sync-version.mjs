/**
 * Synchronise la version dans tauri.conf.json et Cargo.toml
 * après que bumpp ait mis à jour package.json.
 *
 * Usage : node scripts/sync-version.mjs <version>
 */
import { readFileSync, writeFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const version = process.argv[2]
if (!version) {
  console.error("Usage: node scripts/sync-version.mjs <version>")
  process.exit(1)
}

// tauri.conf.json
const tauriPath = resolve(__dirname, "../src-tauri/tauri.conf.json")
const tauriConf = JSON.parse(readFileSync(tauriPath, "utf-8"))
tauriConf.version = version
writeFileSync(tauriPath, JSON.stringify(tauriConf, null, 2) + "\n")
console.log(`  tauri.conf.json → ${version}`)

// Cargo.toml
const cargoPath = resolve(__dirname, "../src-tauri/Cargo.toml")
let cargo = readFileSync(cargoPath, "utf-8")
cargo = cargo.replace(/^version\s*=\s*"[^"]*"/m, `version = "${version}"`)
writeFileSync(cargoPath, cargo)
console.log(`  Cargo.toml      → ${version}`)

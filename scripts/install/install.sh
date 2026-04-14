#!/usr/bin/env bash
set -euo pipefail

log() {
  printf "[lexis-install] %s\n" "$*"
}

fail() {
  printf "[lexis-install] error: %s\n" "$*" >&2
  exit 1
}

has_cmd() {
  command -v "$1" >/dev/null 2>&1
}

require_cmd() {
  if ! has_cmd "$1"; then
    fail "missing required command: $1"
  fi
}

append_user_path_exports() {
  local line='export PATH="$HOME/.local/bin:$PATH"'
  local rc

  for rc in "$HOME/.profile" "$HOME/.bashrc" "$HOME/.zshrc"; do
    if [ ! -f "$rc" ]; then
      touch "$rc"
    fi

    if ! grep -Fq "$line" "$rc"; then
      printf "\n%s\n" "$line" >> "$rc"
    fi
  done
}

install_global_with_fallbacks() {
  local source="$1"

  if npm install -g "$source"; then
    return 0
  fi

  if [ "$(id -u)" -ne 0 ] && has_cmd sudo; then
    log "Global install needs elevated permissions. Retrying with sudo..."
    if sudo npm install -g "$source"; then
      return 0
    fi
  fi

  local user_prefix="$HOME/.local"
  log "Falling back to user-level npm prefix: $user_prefix"
  npm install -g --prefix "$user_prefix" "$source"
  export PATH="$user_prefix/bin:$PATH"
  append_user_path_exports
  return 0
}

is_valid_profile() {
  case "$1" in
    light|balanced|heavy)
      return 0
      ;;
  esac
  return 1
}

is_valid_hook_mode() {
  case "$1" in
    auto|lx)
      return 0
      ;;
  esac
  return 1
}

read_from_tty() {
  local prompt="$1"
  local value

  if [ -r /dev/tty ]; then
    printf "%s" "$prompt" > /dev/tty
    IFS= read -r value < /dev/tty || true
    printf "%s" "$value"
    return 0
  fi

  return 1
}

choose_profile() {
  local current="${LEXIS_PROFILE:-}"
  if is_valid_profile "$current"; then
    printf "%s" "$current"
    return 0
  fi

  local answer
  answer="$(read_from_tty "Model profile [light/balanced/heavy] (default: balanced): " || true)"
  answer="${answer:-balanced}"

  if ! is_valid_profile "$answer"; then
    log "Invalid profile '$answer'. Using balanced."
    answer="balanced"
  fi

  printf "%s" "$answer"
}

choose_hook_mode() {
  local current="${LEXIS_HOOK_MODE:-}"
  if is_valid_hook_mode "$current"; then
    printf "%s" "$current"
    return 0
  fi

  local answer
  answer="$(read_from_tty "Hook mode [auto/lx] (default: auto): " || true)"
  answer="${answer:-auto}"

  if ! is_valid_hook_mode "$answer"; then
    log "Invalid hook mode '$answer'. Using auto."
    answer="auto"
  fi

  printf "%s" "$answer"
}

resolve_install_source() {
  if [ -n "${LEXIS_INSTALL_SOURCE:-}" ]; then
    printf "%s" "$LEXIS_INSTALL_SOURCE"
    return 0
  fi

  local script_dir
  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  local repo_root
  repo_root="$(cd "$script_dir/../.." && pwd)"
  local local_pkg="$repo_root/lexis"

  if [ -f "$local_pkg/package.json" ]; then
    printf "%s" "$local_pkg"
    return 0
  fi

  printf "%s" "@hridyacodes/lexis"
}

main() {
  require_cmd node
  require_cmd npm

  local install_source
  install_source="$(resolve_install_source)"

  log "Installing Lexis from: $install_source"
  install_global_with_fallbacks "$install_source"

  if ! has_cmd lexis; then
    fail "'lexis' command not found after install"
  fi

  local profile
  profile="$(choose_profile)"

  local hook_mode
  hook_mode="$(choose_hook_mode)"

  log "Running setup (profile=$profile, hook-mode=$hook_mode)"
  lexis setup --profile "$profile" --hook-mode "$hook_mode" --enable-web-search --web-provider mcp

  log "Done. Open a new terminal and run: lx doctor"
}

main "$@"

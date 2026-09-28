# >>> lexis >>>
# Lexis auto mode: natural language routed via command_not_found_handler.
[[ -o interactive && -t 0 ]] || return 0
export LEXIS_SHELL=zsh

__lexis_run() {
  command -v lexis >/dev/null 2>&1 || return 127
  command lexis run --quiet "$*"
}

__lexis_command_shaped() {
  local head=$1 a
  shift
  case "$head" in
    man|help)
      for a in "$@"; do
        case "$a" in -*|*/*|*=*|[\~]*|\$*) return 0 ;; esac
        [[ -e "$a" ]] && return 0
        command -v "$a" >/dev/null 2>&1 && return 0
      done
      return 1 ;;
    what|why|how|when|where|which|who|whom|whose|is|are|was|were|am|can|could|should|would|will|do|does|did|please|hey|ok|okay|install|remove|delete|show|find|get|set|make|run|open|close|start|stop|tell|give|list|check|use|need|want|fix)
      for a in "$@"; do
        case "$a" in -*|*/*|*=*|[\~]*|\$*) return 0 ;; esac
        [[ -e "$a" ]] && return 0
      done
      return 1 ;;
    */*|*.sh|*.py|*.rb|*.js|*.pl|*.ps1|*.exe|*.bat|*.cmd|*=*) return 0 ;;
  esac
  command -v "$head" >/dev/null 2>&1 && return 0
  for a in "$@"; do case "$a" in -*) return 0 ;; esac; done
  return 1
}

__lexis_deactivate() {
  unset __LEXIS_CNF_ACTIVE 2>/dev/null
  __LEXIS_DISABLED=1
  print "Lexis paused for this terminal ('lx on' to resume)."
}

lx() {
  if [ "$#" -eq 0 ]; then command lexis --help; return $?; fi
  case "$1" in
    run|plan|explain|fix|setup|hooks|uninstall|config|web-search|doctor|model|history|update|help|--help|-h)
      command lexis "$@"
      return $?
      ;;
    off)
      __LEXIS_DISABLED=1
      print "Lexis paused for this terminal ('lx on' to resume)."
      return 0
      ;;
    on)
      unset __LEXIS_DISABLED
      print "Lexis active."
      return 0
      ;;
  esac
  __lexis_run "$*"
}

install() {
  if [ -n "${__LEXIS_DISABLED:-}" ]; then command install "$@"; return $?; fi
  if [ "$#" -eq 0 ] || [ "$#" -ge 2 ] || [ -e "$1" ]; then command install "$@"; return $?; fi
  case "$1" in -*) command install "$@"; return $?;; esac
  __lexis_run "install $*"
}

kill() {
  if [ -n "${__LEXIS_DISABLED:-}" ] || [ "$#" -eq 0 ]; then builtin kill "$@"; return $?; fi
  local a ok=1
  for a in "$@"; do case "$a" in -*|[0-9]*|%*) ;; *) ok=0 ;; esac; done
  if [ "$ok" -eq 1 ]; then builtin kill "$@"; return $?; fi
  __lexis_run "kill $*"
}

uninstall() {
  if [ "$#" -gt 0 ]; then print -u2 "uninstall: command not found"; return 127; fi
  command lexis uninstall --yes
  __lexis_deactivate
  return 0
}

# Preserve a pre-existing command_not_found_handler as __lexis_prev_cnf.
if (( ${+functions[command_not_found_handler]} )) && (( ! ${+functions[__lexis_prev_cnf]} )); then
  functions[__lexis_prev_cnf]="${functions[command_not_found_handler]}"
fi

command_not_found_handler() {
  if [[ -n "${__LEXIS_DISABLED:-}" || ! -t 0 || ! -t 1 ]] || __lexis_command_shaped "$@"; then
    if (( ${+functions[__lexis_prev_cnf]} )); then __lexis_prev_cnf "$@"; return $?; fi
    print -u2 "$1: command not found"
    return 127
  fi
  if [[ -n "${__LEXIS_CNF_ACTIVE:-}" ]]; then
    print -u2 "$1: command not found"
    return 127
  fi
  if ! command -v lexis >/dev/null 2>&1; then
    print -u2 "$1: command not found"
    return 127
  fi
  __LEXIS_CNF_ACTIVE=1
  __lexis_run "$*"
  local rc=$?
  unset __LEXIS_CNF_ACTIVE
  return $rc
}

__lexis_accept_line() {
  local buf="${BUFFER#"${BUFFER%%[![:space:]]*}"}"
  if [[ -n "${__LEXIS_DISABLED:-}" || -z "$buf" ]] || ! command -v lexis >/dev/null 2>&1; then
    zle .accept-line
    return
  fi
  local first="${buf%%[[:space:]]*}"
  case "$first" in
    [\/\~.\!\$\'\"\`#\{\(\*\?\[]*|*=*) zle .accept-line; return ;;
  esac
  if [[ "$buf" == *[\\\;\|\&\<\>\$\`\{\}\(\)]* || "$buf" == *$'\n'* ]]; then zle .accept-line; return; fi
  if __lexis_command_shaped ${(z)buf}; then zle .accept-line; return; fi
  print -s -- "$buf"
  BUFFER=""
  zle -I
  print
  __lexis_run "$buf" </dev/tty >/dev/tty
  zle -I
}
zle -N accept-line __lexis_accept_line
# <<< lexis <<<

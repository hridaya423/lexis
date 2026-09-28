# >>> lexis >>>
# Lexis lx mode: only 'lx <intent>' invokes Lexis.
[[ -o interactive ]] || return 0
export LEXIS_SHELL=zsh

lx() {
  if [ "$#" -eq 0 ]; then command lexis --help; return $?; fi
  case "$1" in
    run|plan|explain|setup|hooks|uninstall|config|web-search|doctor|model|history|update|help|--help|-h)
      command lexis "$@"
      return $?
      ;;
  esac
  command lexis run --quiet "$*"
}
# <<< lexis <<<

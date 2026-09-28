# >>> lexis >>>
# Lexis lx mode: only 'lx <intent>' invokes Lexis.
status is-interactive; or return
set -gx LEXIS_SHELL fish

function lx
  if test (count $argv) -eq 0
    lexis --help
    return $status
  end
  switch $argv[1]
    case run plan explain setup hooks uninstall config web-search doctor model history update help --help -h
      lexis $argv
      return $status
  end
  lexis run --quiet (string join " " -- $argv)
end
# <<< lexis <<<

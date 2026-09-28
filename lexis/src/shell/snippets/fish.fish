# >>> lexis >>>
# Lexis auto mode: natural language routed via fish_command_not_found.
status is-interactive; or return
isatty stdin; or return
set -gx LEXIS_SHELL fish

function __lexis_run
  if not command -sq lexis
    return 127
  end
  lexis run --quiet (string join " " -- $argv)
  return $status
end

function __lexis_command_shaped
  set -l head $argv[1]
  if contains -- $head man help
    for a in $argv[2..]
      if string match -qr '^[-/~=$]' -- $a; or test -e $a; or command -sq $a
        return 0
      end
    end
    return 1
  end
  if contains -- $head what why how when where which who whom whose is are was were am can could should would will do does did please hey ok okay install remove delete show find get set make run open close start stop tell give list check use need want fix
    for a in $argv[2..]
      if string match -qr '^[-/~=$]' -- $a; or test -e $a
        return 0
      end
    end
    return 1
  end
  if string match -qr '[/~=]|\.(sh|py|rb|js|pl|ps1|exe|bat|cmd)$' -- $head
    return 0
  end
  if command -sq $head
    return 0
  end
  for a in $argv[2..]
    if string match -qr '^-' -- $a
      return 0
    end
  end
  return 1
end

function __lexis_deactivate
  set -e __LEXIS_CNF_ACTIVE
  set -g __LEXIS_DISABLED 1
  printf "Lexis paused for this terminal ('lx on' to resume).\n"
end

function lx
  if test (count $argv) -eq 0
    lexis --help
    return $status
  end
  switch $argv[1]
    case run plan explain fix setup hooks uninstall config web-search doctor model history update help --help -h
      lexis $argv
      return $status
    case off
      set -g __LEXIS_DISABLED 1
      printf "Lexis paused for this terminal ('lx on' to resume).\n"
      return 0
    case on
      set -e __LEXIS_DISABLED
      printf "Lexis active.\n"
      return 0
  end
  __lexis_run $argv
end

function install
  if set -q __LEXIS_DISABLED
    command install $argv
    return $status
  end
  if test (count $argv) -eq 0; or test (count $argv) -ge 2; or test -e "$argv[1]"
    command install $argv
    return $status
  end
  if string match -qr '^-' -- $argv[1]
    command install $argv
    return $status
  end
  __lexis_run install $argv
end

function kill
  if set -q __LEXIS_DISABLED; or test (count $argv) -eq 0
    builtin kill $argv
    return $status
  end
  set ok 1
  for a in $argv
    if not string match -qr '^(--|-|-[A-Za-z0-9-]+|[0-9]+|%[0-9]+)$' -- $a
      set ok 0
    end
  end
  if test $ok -eq 1
    builtin kill $argv
    return $status
  end
  __lexis_run kill $argv
end

function uninstall
  if test (count $argv) -gt 0
    printf "uninstall: command not found\n" 1>&2
    return 127
  end
  lexis uninstall --yes
  __lexis_deactivate
  return 0
end

# Preserve a pre-existing fish_command_not_found as __lexis_prev_cnf.
if functions -q fish_command_not_found; and not functions -q __lexis_prev_cnf
  functions -c fish_command_not_found __lexis_prev_cnf
end

function fish_command_not_found
  if set -q __LEXIS_DISABLED; or not isatty stdin; or not isatty stdout; or __lexis_command_shaped $argv
    if functions -q __lexis_prev_cnf
      __lexis_prev_cnf $argv
      return $status
    end
    printf "%s: command not found\n" $argv[1] 1>&2
    return 127
  end
  if set -q __LEXIS_CNF_ACTIVE
    printf "%s: command not found\n" $argv[1] 1>&2
    return 127
  end
  if not command -sq lexis
    printf "%s: command not found\n" $argv[1] 1>&2
    return 127
  end
  set -g __LEXIS_CNF_ACTIVE 1
  __lexis_run $argv
  set rc $status
  set -e __LEXIS_CNF_ACTIVE
  return $rc
end
# <<< lexis <<<

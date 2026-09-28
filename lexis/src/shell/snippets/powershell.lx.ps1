# >>> lexis >>>
# Lexis lx mode: only 'lx <intent>' invokes Lexis.
$env:LEXIS_SHELL = 'powershell'

function lx {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$LexisArgs)
  if ($LexisArgs.Count -eq 0) { lexis --help; return }
  if (@('run','plan','explain','setup','hooks','uninstall','config','web-search','doctor','model','history','update','help','--help','-h') -contains $LexisArgs[0]) {
    lexis @LexisArgs
    return
  }
  lexis run --quiet ($LexisArgs -join ' ')
}
# <<< lexis <<<

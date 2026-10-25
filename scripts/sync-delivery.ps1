$ErrorActionPreference = 'Stop'
$sourceRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..')).TrimEnd('\')
$destinationRoot = [IO.Path]::GetFullPath('D:\boi').TrimEnd('\')
if ($sourceRoot -ne 'C:\Users\User\Downloads\boi' -or $destinationRoot -ne 'D:\boi') { throw 'Unexpected delivery path' }
$excludeDirectories = @('node_modules','.git','.wrangler','test-results','__pycache__','prompts')
$excludeFiles = @('AGENTS.md','README_START_HERE.md','PRODUCT_REQUIREMENTS.md','DESIGN_SYSTEM.md','ARCHITECTURE.md','DATABASE_AND_SECURITY.md','ACCEPTANCE_TESTS.md','CODEX_MASTER_PROMPT.md','.env','.dev.vars')
function Get-DeliveryFiles([string]$directory) {
  foreach ($entry in Get-ChildItem -LiteralPath $directory -Force) {
    if ($entry.PSIsContainer) { if ($entry.Name -notin $excludeDirectories) { Get-DeliveryFiles $entry.FullName } }
    elseif ($entry.Name -notin $excludeFiles -and -not $entry.Name.StartsWith('.env.')) { $entry }
    elseif ($entry.Name -eq '.env.example') { $entry }
  }
}
$files = @(Get-DeliveryFiles $sourceRoot)
$plan = foreach ($file in $files) {
  $relative = [IO.Path]::GetRelativePath($sourceRoot,$file.FullName)
  $target = [IO.Path]::GetFullPath((Join-Path $destinationRoot $relative))
  if (-not $target.StartsWith($destinationRoot + '\',[StringComparison]::OrdinalIgnoreCase)) { throw 'Path escapes destination' }
  $hash = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash
  if (Test-Path -LiteralPath $target) { if ((Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash -ne $hash) { throw "Refusing to overwrite different existing file: $relative" } }
  [pscustomobject]@{source=$file.FullName;target=$target;relative=$relative;sha256=$hash}
}
foreach ($item in $plan) {
  if (-not (Test-Path -LiteralPath $item.target)) {
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $item.target) | Out-Null
    Copy-Item -LiteralPath $item.source -Destination $item.target
  }
  if ((Get-FileHash -LiteralPath $item.target -Algorithm SHA256).Hash -ne $item.sha256) { throw 'Delivery checksum failed' }
}
$manifest = @{date='2026-10-25';source=$sourceRoot;destination=$destinationRoot;preserved='8 original documents and prompts untouched';files=@($plan | Select-Object relative,sha256)}
$manifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $destinationRoot 'docs\DELIVERY_MANIFEST.json') -Encoding utf8
Write-Output "Delivered and SHA256-verified $($plan.Count) files to D:\boi; original specifications preserved."

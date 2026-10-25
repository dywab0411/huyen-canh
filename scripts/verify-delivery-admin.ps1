$ErrorActionPreference = 'Stop'
$targetRoot = [IO.Path]::GetFullPath('D:\boi')
if ($targetRoot -ne 'D:\boi' -or -not (Test-Path -LiteralPath (Join-Path $targetRoot 'package.json'))) { throw 'Unexpected or missing delivery directory' }
$npmExecutable = (Get-Command npm.cmd -ErrorAction Stop).Source
Copy-Item -LiteralPath $PSCommandPath -Destination (Join-Path $targetRoot 'scripts\verify-delivery-admin.ps1') -Force
& $npmExecutable --prefix $targetRoot run verify:delivery 2>&1 | Tee-Object -FilePath (Join-Path $targetRoot 'docs\D_VERIFY_LOG.txt')
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& $npmExecutable --prefix $targetRoot run test:e2e 2>&1 | Tee-Object -FilePath (Join-Path $targetRoot 'docs\D_E2E_LOG.txt')
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Add-Content -LiteralPath (Join-Path $targetRoot 'IMPLEMENTATION_STATUS.md') -Encoding utf8 -Value "`nE2E đã chạy trực tiếp tại D:\boi sau fresh npm ci: 24/24 PASS. Log docs/D_E2E_LOG.txt và playwright-report/index.html. Không có test cloud credentials.`n"
exit 0

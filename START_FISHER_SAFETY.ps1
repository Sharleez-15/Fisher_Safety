$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

function Show-Info($message, $title = 'Fisher Safety') {
  [System.Windows.Forms.MessageBox]::Show($message, $title, 'OK', 'Information') | Out-Null
}
function Show-Error($message) {
  [System.Windows.Forms.MessageBox]::Show($message, 'Fisher Safety - Setup', 'OK', 'Error') | Out-Null
}

$node = Get-Command node.exe -ErrorAction SilentlyContinue
if (-not $node) {
  $choice = [System.Windows.Forms.MessageBox]::Show(
    "Node.js is needed once to run the weather connection.`n`nI will open the official download page. Install the LTS version, restart your computer if asked, then double-click START_FISHER_SAFETY again.",
    'Install one required component', 'OKCancel', 'Information')
  if ($choice -eq 'OK') { Start-Process 'https://nodejs.org/en/download' }
  exit 1
}

$envFile = Join-Path $PSScriptRoot '.env'
$apiKey = ''
if (Test-Path $envFile) {
  $line = Get-Content $envFile | Where-Object { $_ -match '^ACCUWEATHER_API_KEY=' } | Select-Object -First 1
  if ($line) { $apiKey = $line.Substring('ACCUWEATHER_API_KEY='.Length).Trim() }
}
if ([string]::IsNullOrWhiteSpace($apiKey) -or $apiKey -eq 'PASTE_YOUR_NEW_KEY_HERE') {
  $form = New-Object System.Windows.Forms.Form
  $form.Text = 'Connect AccuWeather'
  $form.Size = New-Object System.Drawing.Size(470,190)
  $form.StartPosition = 'CenterScreen'
  $form.FormBorderStyle = 'FixedDialog'
  $form.MaximizeBox = $false
  $form.MinimizeBox = $false
  $label = New-Object System.Windows.Forms.Label
  $label.Text = 'Paste your NEW AccuWeather API key below. It will be saved only on this computer.'
  $label.Location = New-Object System.Drawing.Point(16,15)
  $label.Size = New-Object System.Drawing.Size(425,42)
  $form.Controls.Add($label)
  $box = New-Object System.Windows.Forms.TextBox
  $box.Location = New-Object System.Drawing.Point(18,62)
  $box.Size = New-Object System.Drawing.Size(418,25)
  $box.UseSystemPasswordChar = $true
  $form.Controls.Add($box)
  $ok = New-Object System.Windows.Forms.Button
  $ok.Text = 'Save and continue'
  $ok.Location = New-Object System.Drawing.Point(240,103)
  $ok.Size = New-Object System.Drawing.Size(125,30)
  $ok.DialogResult = [System.Windows.Forms.DialogResult]::OK
  $form.Controls.Add($ok)
  $cancel = New-Object System.Windows.Forms.Button
  $cancel.Text = 'Cancel'
  $cancel.Location = New-Object System.Drawing.Point(370,103)
  $cancel.Size = New-Object System.Drawing.Size(66,30)
  $cancel.DialogResult = [System.Windows.Forms.DialogResult]::Cancel
  $form.Controls.Add($cancel)
  $form.AcceptButton = $ok
  $form.CancelButton = $cancel
  if ($form.ShowDialog() -ne [System.Windows.Forms.DialogResult]::OK -or [string]::IsNullOrWhiteSpace($box.Text)) {
    Show-Info 'Setup cancelled. No key was saved.'
    exit 1
  }
  $apiKey = $box.Text.Trim()
  Set-Content -Path $envFile -Value @("ACCUWEATHER_API_KEY=$apiKey", 'PORT=3000') -Encoding ASCII
}

if (-not (Test-Path (Join-Path $PSScriptRoot 'node_modules/express'))) {
  Show-Info 'First-time setup: installing the app components. This needs an internet connection and may take a minute.'
  Push-Location $PSScriptRoot
  try { & npm.cmd install --no-audit --no-fund; if ($LASTEXITCODE -ne 0) { throw 'Could not install the app components. Check your internet connection and try again.' } }
  finally { Pop-Location }
}

# Avoid opening a second copy if the app is already running.
try {
  $health = Invoke-RestMethod 'http://localhost:3000/api/health' -TimeoutSec 2
  if ($health.ok) {
    Start-Process 'http://localhost:3000'
    Show-Info 'Fisher Safety is already running. Your browser has been opened.'
    exit 0
  }
} catch { }

$serverCmd = 'cd /d "' + $PSScriptRoot + '" && node server.js'
Start-Process -FilePath $env:ComSpec -ArgumentList @('/k', $serverCmd) -WorkingDirectory $PSScriptRoot -WindowStyle Normal | Out-Null
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
  Start-Sleep -Seconds 1
  try {
    $health = Invoke-RestMethod 'http://localhost:3000/api/health' -TimeoutSec 2
    if ($health.ok) { $ready = $true; break }
  } catch { }
}
if (-not $ready) {
  Show-Error 'The weather server did not start. Keep the black server window open and check the message shown there. If port 3000 is already in use, close the other Fisher Safety window and try again.'
  exit 1
}
Start-Process 'http://localhost:3000'
Show-Info 'Fisher Safety is open in your browser. Keep the black server window open while using the app.'

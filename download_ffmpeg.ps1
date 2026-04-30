# FFmpeg Auto Download Script - Using BtbN builds

Write-Host "Starting FFmpeg download..." -ForegroundColor Green

# BtbN FFmpeg builds on GitHub - these are reliable and frequently updated
$downloadUrl = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"
$outputPath = "$env:TEMP\ffmpeg.zip"
$extractPath = "C:\ffmpeg"

Write-Host "Downloading FFmpeg from BtbN builds on GitHub..."
Write-Host "This may take a few minutes depending on your connection..." -ForegroundColor Gray

try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $outputPath -UseBasicParsing
    Write-Host "Download completed!" -ForegroundColor Green
} catch {
    Write-Host "Download failed: $_" -ForegroundColor Red
    Write-Host "`nAlternative: Please manually download from:" -ForegroundColor Yellow
    Write-Host "https://github.com/BtbN/FFmpeg-Builds/releases" -ForegroundColor Cyan
    Write-Host "Look for 'ffmpeg-master-latest-win64-gpl.zip'" -ForegroundColor Gray
    exit 1
}

if (Test-Path $extractPath) {
    Write-Host "Removing old FFmpeg directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $extractPath
}

New-Item -ItemType Directory -Path $extractPath -Force | Out-Null

Write-Host "Extracting FFmpeg..."
try {
    Expand-Archive -Path $outputPath -DestinationPath $extractPath -Force
    Write-Host "Extraction completed!" -ForegroundColor Green
} catch {
    Write-Host "Extraction failed: $_" -ForegroundColor Red
    exit 1
}

# Find the bin directory
$binPath = Get-ChildItem -Path $extractPath -Recurse -Directory | Where-Object { $_.Name -eq "bin" } | Select-Object -First 1

if ($binPath) {
    $ffmpegBinPath = $binPath.FullName
    Write-Host "FFmpeg bin directory: $ffmpegBinPath" -ForegroundColor Green
} else {
    Write-Host "Bin directory not found" -ForegroundColor Red
    exit 1
}

$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($currentPath -notlike "*$ffmpegBinPath*") {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$ffmpegBinPath", "User")
    Write-Host "Added to PATH: $ffmpegBinPath" -ForegroundColor Green
    Write-Host "Please close and reopen PowerShell window to use FFmpeg" -ForegroundColor Yellow
} else {
    Write-Host "FFmpeg is already in PATH" -ForegroundColor Green
}

Remove-Item $outputPath -Force -ErrorAction SilentlyContinue

Write-Host "`nVerifying installation..." -ForegroundColor Green
$ffmpegExe = Join-Path $ffmpegBinPath "ffmpeg.exe"
if (Test-Path $ffmpegExe) {
    & $ffmpegExe -version | Select-Object -First 1
    Write-Host "`nFFmpeg installation completed successfully!" -ForegroundColor Green
} else {
    Write-Host "FFmpeg executable not found" -ForegroundColor Red
    exit 1
}
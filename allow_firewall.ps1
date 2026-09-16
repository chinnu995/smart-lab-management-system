# Run this script in PowerShell as Administrator to allow Mobile Devices on Wi-Fi to reach Smart Lab System

New-NetFirewallRule -DisplayName "SmartLab Frontend (5173)" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 5173
New-NetFirewallRule -DisplayName "SmartLab Backend (5005)" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 5005

Write-Host "✅ Windows Firewall Rules created successfully! Mobile devices on Wi-Fi can now connect." -ForegroundColor Green

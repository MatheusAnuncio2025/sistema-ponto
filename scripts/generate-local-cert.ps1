$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$certDir = Join-Path $root "certs"
if (-not (Test-Path $certDir)) {
  New-Item -ItemType Directory -Path $certDir | Out-Null
}

$ips = Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -notlike "169.254.*" -and $_.IPAddress -notlike "127.*" } |
  Select-Object -ExpandProperty IPAddress

if (-not $ips -or $ips.Count -eq 0) {
  Write-Error "Nao foi possivel detectar o IP local."
}

$uniqueIps = $ips | Select-Object -Unique
$ipSan = ($uniqueIps | ForEach-Object { "IP:$($_)" }) -join ","
$san = "DNS:localhost,IP:127.0.0.1,$ipSan"

Write-Host "Gerando certificado local para: $san"
Write-Host "Pasta: $certDir"

$opensslCfg = @"
[req]
distinguished_name=req
x509_extensions=v3_req

[v3_req]
subjectAltName=$san
"@

Set-Content -Path (Join-Path $certDir "openssl.cnf") -Value $opensslCfg -Encoding Ascii

docker run --rm -v "${certDir}:/certs" alpine:3 /bin/sh -c 'apk add --no-cache openssl > /dev/null && openssl req -x509 -nodes -newkey rsa:2048 -days 365 -keyout /certs/localhost.key -out /certs/localhost.crt -subj "/CN=localhost" -config /certs/openssl.cnf'

Write-Host "OK. Certificados gerados em $certDir"

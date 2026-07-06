# Servidor Web Estático en PowerShell
# Permite servir los archivos de la app a cualquier computadora en la misma red de Wi-Fi / Ethernet.

$port = 8080
$localIP = [System.Net.IPAddress]::Any
$server = New-Object System.Net.Sockets.TcpListener($localIP, $port)

try {
    # Detectar la IP de la red Wi-Fi/LAN de forma dinámica (excluyendo autoconfiguración 169.254.*)
    $wifiIP = (Get-NetIPAddress | Where-Object { $_.InterfaceAlias -like "*Wi-Fi*" -and $_.AddressFamily -eq 'IPv4' -and $_.IPAddress -notlike "169.254.*" } | Select-Object -First 1).IPAddress
    if (-not $wifiIP) {
        $wifiIP = (Get-NetIPAddress | Where-Object { $_.AddressFamily -eq 'IPv4' -and $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "192.168.56.*" -and $_.IPAddress -notlike "192.168.184.*" -and $_.IPAddress -notlike "192.168.118.*" -and $_.IPAddress -notlike "169.254.*" } | Select-Object -First 1).IPAddress
    }
    if (-not $wifiIP) {
        $wifiIP = "172.24.6.141"
    }

    # Guardar la IP detectada en un archivo de configuración para que los celulares puedan localizar el servidor
    $ipJson = '{"ip":"' + $wifiIP + '"}'
    [System.IO.File]::WriteAllText((Join-Path $PSScriptRoot "server_ip.json"), $ipJson, [System.Text.Encoding]::UTF8)

    $server.Start()
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "      SERVIDOR WEB ACTIVO - LICENCIA INTERNA APP" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "-> Acceso local (en esta PC):" -ForegroundColor White
    Write-Host "   http://localhost:$port/" -ForegroundColor Cyan
    Write-Host "-> Acceso desde otra PC en la misma red LAN/Wi-Fi:" -ForegroundColor White
    Write-Host "   http://$($wifiIP):$port/" -ForegroundColor Yellow
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "Presiona Ctrl+C en esta ventana para detener el servidor." -ForegroundColor Yellow
    Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray

    while ($true) {
        $client = $server.AcceptTcpClient()
        try {
            $stream = $client.GetStream()
            $reader = New-Object System.IO.StreamReader($stream)
            
            # Leer cabecera de la petición HTTP
            $line = $reader.ReadLine()
            if ($null -eq $line) { 
                continue 
            }
            
            # Parsear la petición HTTP
            $parts = $line.Split(' ')
            if ($parts.Length -lt 2) {
                continue
            }
            
            $method = $parts[0]
            $rawUrl = $parts[1].Split('?')[0]
            
            # --- API /api/operators para Sincronizar en LAN ---
            if ($rawUrl -eq '/api/operators') {
                # Leer el Content-Length de las cabeceras si existiera
                $contentLength = 0
                while ($true) {
                    $hdrLine = $reader.ReadLine()
                    if ($null -eq $hdrLine -or $hdrLine.Trim() -eq "") {
                        break
                    }
                    if ($hdrLine -match "^Content-Length:\s*(\d+)") {
                        $contentLength = [int]$Matches[1]
                    }
                }
                
                if ($method -eq 'OPTIONS') {
                    $header = "HTTP/1.1 204 No Content`r`nConnection: close`r`nAccess-Control-Allow-Origin: *`r`nAccess-Control-Allow-Methods: GET, POST, OPTIONS`r`nAccess-Control-Allow-Headers: Content-Type`r`n`r`n"
                    $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                    $stream.Write($headerBytes, 0, $headerBytes.Length)
                    $stream.Flush()
                    continue
                }
                
                if ($method -eq 'POST' -or $method -eq 'PUT') {
                    $body = ""
                    if ($contentLength -gt 0) {
                        $charBuffer = New-Object char[] $contentLength
                        $totalRead = 0
                        while ($totalRead -lt $contentLength) {
                            $read = $reader.Read($charBuffer, $totalRead, ($contentLength - $totalRead))
                            if ($read -le 0) {
                                break
                            }
                            $totalRead += $read
                        }
                        $body = New-Object string ($charBuffer, 0, $totalRead)
                    }
                    
                    [System.IO.File]::WriteAllText((Join-Path $PSScriptRoot "operators.json"), $body, [System.Text.Encoding]::UTF8)
                    
                    # --- Auto-sincronización con GitHub en segundo plano ---
                    $gitPath = "C:\Users\nicol\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd\git.exe"
                    if (Test-Path $gitPath) {
                        Write-Host "[Auto-Sync] Iniciando envío de datos a GitHub..." -ForegroundColor Cyan
                        Start-Job -ScriptBlock {
                            param($gp, $root)
                            Set-Location $root
                            & $gp add .
                            & $gp commit -m "Auto-sync operators database from local server"
                            & $gp push origin main
                        } -ArgumentList $gitPath, $PSScriptRoot | Out-Null
                    }
                    
                    $resText = '{"status":"ok"}'
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($resText)
                    $header = "HTTP/1.1 200 OK`r`nContent-Type: application/json; charset=utf-8`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`nAccess-Control-Allow-Origin: *`r`n`r`n"
                    $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                    $stream.Write($headerBytes, 0, $headerBytes.Length)
                    $stream.Write($bytes, 0, $bytes.Length)
                    $stream.Flush()
                    continue
                }
                
                if ($method -eq 'GET') {
                    $dbPath = Join-Path $PSScriptRoot "operators.json"
                    if (Test-Path $dbPath -PathType Leaf) {
                        $bytes = [System.IO.File]::ReadAllBytes($dbPath)
                    } else {
                        $bytes = [System.Text.Encoding]::UTF8.GetBytes("[]")
                    }
                    
                    $header = "HTTP/1.1 200 OK`r`nContent-Type: application/json; charset=utf-8`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`nAccess-Control-Allow-Origin: *`r`n`r`n"
                    $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                    $stream.Write($headerBytes, 0, $headerBytes.Length)
                    $stream.Write($bytes, 0, $bytes.Length)
                    $stream.Flush()
                    continue
                }
            }
            
            if ($rawUrl -eq '/' -or $rawUrl -eq '') {
                $rawUrl = '/index.html'
            }
            
            # Decodificar caracteres especiales de la URL
            $urlDecoded = [System.Uri]::UnescapeDataString($rawUrl)
            $filePath = Join-Path $PSScriptRoot $urlDecoded.Replace('/', '\').TrimStart('\')
            
            if (Test-Path $filePath -PathType Leaf) {
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                
                # Obtener MIME Type según la extensión
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $contentType = "text/plain"
                if ($ext -eq ".html" -or $ext -eq ".htm") { $contentType = "text/html; charset=utf-8" }
                elseif ($ext -eq ".css") { $contentType = "text/css" }
                elseif ($ext -eq ".js") { $contentType = "application/javascript" }
                elseif ($ext -eq ".jpg" -or $ext -eq ".jpeg") { $contentType = "image/jpeg" }
                elseif ($ext -eq ".png") { $contentType = "image/png" }
                elseif ($ext -eq ".svg") { $contentType = "image/svg+xml" }
                elseif ($ext -eq ".xlsx") { $contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
                
                # Cabecera HTTP OK
                $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`nAccess-Control-Allow-Origin: *`r`n`r`n"
                $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                $stream.Write($headerBytes, 0, $headerBytes.Length)
                
                # Enviar el archivo
                $stream.Write($bytes, 0, $bytes.Length)
            } else {
                # Cabecera HTTP 404 Not Found
                $errText = "404 Not Found"
                $errBytes = [System.Text.Encoding]::UTF8.GetBytes($errText)
                $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain`r`nContent-Length: $($errBytes.Length)`r`nConnection: close`r`n`r`n"
                $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                $stream.Write($headerBytes, 0, $headerBytes.Length)
                $stream.Write($errBytes, 0, $errBytes.Length)
            }
            
            $stream.Flush()
        } catch {
            Write-Host "Aviso: Conexión interrumpida por el cliente o red local: $($_.Exception.Message)" -ForegroundColor Yellow
        } finally {
            if ($null -ne $client) { $client.Close() }
        }
    }
} catch {
    Write-Error $_
} finally {
    $server.Stop()
}

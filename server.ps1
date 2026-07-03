# Servidor Web Estático en PowerShell
# Permite servir los archivos de la app a cualquier computadora en la misma red de Wi-Fi / Ethernet.

$port = 8080
$localIP = [System.Net.IPAddress]::Any
$server = New-Object System.Net.Sockets.TcpListener($localIP, $port)

try {
    $server.Start()
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "      SERVIDOR WEB ACTIVO - LICENCIA INTERNA APP" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "-> Acceso local (en esta PC):" -ForegroundColor White
    Write-Host "   http://localhost:$port/" -ForegroundColor Cyan
    Write-Host "-> Acceso desde otra PC en la misma red LAN/Wi-Fi:" -ForegroundColor White
    Write-Host "   http://172.24.6.76:$port/" -ForegroundColor Yellow
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "Presiona Ctrl+C en esta ventana para detener el servidor." -ForegroundColor Yellow
    Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray

    while ($true) {
        $client = $server.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader($stream)
        
        # Leer cabecera de la petición HTTP
        $line = $reader.ReadLine()
        if ($null -eq $line) { 
            $client.Close()
            continue 
        }
        
        # Parsear la petición HTTP (ej: GET /index.html HTTP/1.1)
        $parts = $line.Split(' ')
        if ($parts.Length -lt 2) {
            $client.Close()
            continue
        }
        
        $method = $parts[0]
        $rawUrl = $parts[1].Split('?')[0]
        
        if ($rawUrl -eq '/' -or $rawUrl -eq '') {
            $rawUrl = '/index.html'
        }
        
        # Decodificar caracteres especiales de la URL (ej: %20 para espacios)
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
        $client.Close()
    }
} catch {
    Write-Error $_
} finally {
    $server.Stop()
}

@echo off
title Servidor Web - Licencia Interna

:: Verificar si el script tiene privilegios de Administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Solicitando privilegios de Administrador para abrir los puertos de red...
    powershell -Command "Start-Process -FilePath '%0' -Verb RunAs"
    exit /b
)

echo ==========================================================
echo   ABRIENDO PUERTO 8080 EN EL CORTAFUEGOS DE WINDOWS...
echo ==========================================================
:: Crear la regla del cortafuegos si no existe
powershell -Command "if (-not (Get-NetFirewallRule -DisplayName 'SLI Web Server' -ErrorAction SilentlyContinue)) { New-NetFirewallRule -DisplayName 'SLI Web Server' -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow -Profile Any }"

echo.
echo ==========================================================
echo   INICIANDO SERVIDOR Y ABRIENDO APLICACION SLI...
echo ==========================================================
echo.
:: Abrir la URL local en el navegador predeterminado
start http://localhost:8080/
:: Iniciar el servidor web de PowerShell
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
echo.
echo ==========================================================
echo   Servidor detenido.
echo ==========================================================
pause

@echo off
title Servidor Web - Licencia Interna
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

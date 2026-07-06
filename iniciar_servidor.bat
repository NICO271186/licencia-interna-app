@echo off
title Servidor Web - Licencia Interna
echo ==========================================================
echo   INICIANDO SERVIDOR WEB LOCAL (LAN)...
echo ==========================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
echo.
echo ==========================================================
echo   Servidor detenido.
echo ==========================================================
pause

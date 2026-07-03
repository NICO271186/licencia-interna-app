@echo off
title Sincronizar Licencia Interna App a GitHub
echo ==========================================================
echo   SINCRONIZANDO CAMBIOS A GITHUB...
echo ==========================================================
set "GIT_PATH=C:\Users\nicol\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd\git.exe"

if not exist "%GIT_PATH%" (
    echo [ERROR] No se pudo encontrar Git portable en tu sistema.
    pause
    exit /b
)

echo.
echo [1/3] Preparando archivos locales...
"%GIT_PATH%" add .

echo.
echo [2/3] Creando commit de actualizacion...
"%GIT_PATH%" commit -m "Actualizacion automatica desde script local"

echo.
echo [3/3] Subiendo cambios a GitHub (rama main)...
"%GIT_PATH%" push origin main

echo.
echo ==========================================================
echo   ¡PROYECTO SINCRONIZADO CON GITHUB!
echo ==========================================================
echo Los cambios ya estan en vivo en tu URL publica.
echo.
pause

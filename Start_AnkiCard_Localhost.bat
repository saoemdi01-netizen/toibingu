@echo off
title Khoi dong AnkiCard Localhost 3001
echo ===================================================
echo   KHOI DONG ANKICARD LOCALHOST (PORT 3001)
echo ===================================================
echo.

echo [1/3] Dang khoi dong Backend Server tai cong 5000...
start "AnkiCard Backend" /min cmd /k "cd /d %~dp0backend && node server.js"

echo.
echo [2/3] Dang khoi dong Frontend Server tai cong 3001...
start "AnkiCard Frontend" /min cmd /k "cd /d %~dp0frontend && node .\node_modules\vite\bin\vite.js --port 3001 --host"

echo.
echo [3/3] Dang mo trinh duyet tu dong...
timeout /t 3 /nobreak >nul
start http://localhost:3001

echo.
echo ===================================================
echo  DA KHOI DONG THANH CONG!
echo  Trinh duyet cua ban dang duoc mo den: http://localhost:3001
echo  (Cac cua so server da duoc thu nho xuong duoi Taskbar)
echo ===================================================
echo.
timeout /t 5 >nul
exit

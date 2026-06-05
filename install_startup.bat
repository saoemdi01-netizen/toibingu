@echo off
cd /d "%~dp0"

:: Create the VBScript that runs both frontend and backend invisibly and detaches them
(
echo Set WshShell = CreateObject^("WScript.Shell"^)
echo WshShell.Run "cmd /c cd /d ""%~dp0backend"" && start /b node server.js", 0, False
echo WshShell.Run "cmd /c cd /d ""%~dp0frontend"" && start /b node node_modules\vite\bin\vite.js --port 3001 --host", 0, False
) > "%TEMP%\AnkiCard-Autostart.vbs"

:: Copy it to Windows Startup folder
copy /y "%TEMP%\AnkiCard-Autostart.vbs" "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\AnkiCard-Autostart.vbs"

echo ==========================================================
echo [OK] AnkiCard Localhost 3001 đã đăng ký khởi động cùng máy!
echo Server backend (5000) và frontend (3001) sẽ chạy ngầm ẩn.
echo ==========================================================

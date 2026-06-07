@echo off
cd /d "%~dp0"

echo Starting server on port 1001...

python --version >nul 2>&1
if %errorlevel% == 0 (
    start "" /B python -m http.server 1001
) else (
    start "" /B npx http-server . -p 1001 --cors -c-1
)

timeout /t 2 /nobreak >nul

start "" "http://127.0.0.1:1001/app_buklod-tao/index.html"

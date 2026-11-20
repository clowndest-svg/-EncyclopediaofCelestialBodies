@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Please install Node.js 24 or newer.
  pause
  exit /b 1
)
if not exist "node_modules\fastify" call npm install
node --env-file-if-exists=.env server/launch.mjs
pause

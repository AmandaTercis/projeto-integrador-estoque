@echo off
REM Instala as dependencias (se faltar) e abre backend e frontend em duas janelas.
cd /d "%~dp0"
if not exist backend\node_modules (cd backend && call npm install && cd ..)
if not exist frontend\node_modules (cd frontend && call npm install && cd ..)
start "Backend - porta 3000" cmd /k "cd /d %~dp0backend && npm start"
start "Frontend - porta 5173" cmd /k "cd /d %~dp0frontend && npm start"
timeout /t 4 >nul
start http://localhost:5173

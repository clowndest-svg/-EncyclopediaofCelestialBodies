@echo off
cd /d "%~dp0"
if not exist "node_modules\fastify" call npm install
echo Open http://YOUR-COMPUTER-LAN-IP:8090 on your phone.
echo Keep the console open. Use only a trusted private network.
ipconfig
node --env-file-if-exists=.env server/launch.mjs --lan
pause

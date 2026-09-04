@echo off
echo NEUROEDULAB + GEMINI API
echo.
if not exist .env copy .env.example .env
echo Edita .env y coloca tu GEMINI_API_KEY antes de continuar.
echo.
pause
npm start

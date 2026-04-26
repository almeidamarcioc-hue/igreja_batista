@echo off
chcp 65001 >nul
echo ============================================
echo   Deploy Evolution API - Fly.io
echo ============================================
echo.

where flyctl >nul 2>nul
if %errorlevel% neq 0 (
    echo [1/5] Instalando flyctl...
    powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
    echo.
    echo IMPORTANTE: Feche e reabra este arquivo depois da instalacao.
    pause
    exit
)

echo [1/5] flyctl ja instalado.
echo.

echo [2/5] Fazendo login no Fly.io...
echo      (Vai abrir o navegador - crie a conta ou faca login)
flyctl auth login
echo.

echo [3/5] Criando o app...
flyctl apps create ibtm-whatsapp
echo.

echo [4/5] Criando volume de dados (sessao do WhatsApp)...
flyctl volumes create evolution_data --app ibtm-whatsapp --region gru --size 1
echo.

echo [5/5] Fazendo deploy...
flyctl deploy
echo.

echo ============================================
echo   CONCLUIDO!
echo ============================================
echo.
echo Sua URL e: https://ibtm-whatsapp.fly.dev
echo.
echo Proximo passo:
echo   1. Acesse o Vercel ^> Settings ^> Environment Variables
echo   2. Adicione: EVOLUTION_API_URL = https://ibtm-whatsapp.fly.dev
echo   3. Adicione: EVOLUTION_API_KEY = secretaria2024ibtm
echo   4. Adicione: EVOLUTION_INSTANCE = secretaria-ibtm
echo   5. Clique em Redeploy no Vercel
echo   6. Volte na tela de Configuracoes e escaneie o QR Code
echo.
pause

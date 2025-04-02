# Script para iniciar la aplicación correctamente

# Limpiar la caché de Next.js (puede resolver problemas de compilación)
Write-Host "Limpiando la caché de Next.js..." -ForegroundColor Yellow
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
}

# Instalar las dependencias necesarias
Write-Host "Instalando/verificando dependencias necesarias..." -ForegroundColor Yellow
npm install

# Iniciar el servidor de desarrollo
Write-Host "Iniciando el servidor de desarrollo..." -ForegroundColor Green
npm run dev

# Si el servidor falla, muestra un mensaje de ayuda
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nEl servidor no pudo iniciarse correctamente." -ForegroundColor Red
    Write-Host "Puedes acceder a Prisma Studio en http://localhost:5555 para ver los datos." -ForegroundColor Yellow
    Write-Host "Usa 'npx prisma studio' para iniciar Prisma Studio si no está corriendo." -ForegroundColor Yellow
} 
/**
 * Script para capturar screenshots reais de todas as telas do app
 * 
 * INSTRUÇÕES:
 * 1. Instale as dependências: npm install puppeteer
 * 2. Execute: node scripts/capture-screenshots.js
 * 
 * O script vai:
 * - Abrir um navegador headless
 * - Navegar para cada rota do app
 * - Capturar e salvar screenshots em src/assets/screenshots/
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// URL base do preview - ATUALIZE COM SUA URL
const BASE_URL = 'https://id-preview--c33f6293-54c9-4428-a060-19d53accf83b.lovable.app';

// Configuração de viewport mobile
const MOBILE_VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 2 };
const DESKTOP_VIEWPORT = { width: 1440, height: 900, deviceScaleFactor: 1 };

// Lista de todas as rotas para capturar
const routes = [
  // Auth & Onboarding
  { path: '/', name: 'splash', viewport: 'mobile' },
  { path: '/login', name: 'login', viewport: 'mobile' },
  { path: '/register', name: 'register', viewport: 'mobile' },
  { path: '/forgot-password', name: 'forgot-password', viewport: 'mobile' },
  { path: '/onboarding', name: 'onboarding', viewport: 'mobile' },
  { path: '/onboarding/client', name: 'onboarding-client', viewport: 'mobile' },
  { path: '/onboarding/pro', name: 'onboarding-pro', viewport: 'mobile' },
  
  // Client Module
  { path: '/client/home', name: 'client-home', viewport: 'mobile' },
  { path: '/client/service', name: 'client-service', viewport: 'mobile' },
  { path: '/client/schedule', name: 'client-schedule', viewport: 'mobile' },
  { path: '/client/location', name: 'client-location', viewport: 'mobile' },
  { path: '/client/matching', name: 'client-matching', viewport: 'mobile' },
  { path: '/client/offer', name: 'client-offer', viewport: 'mobile' },
  { path: '/client/checkout', name: 'client-checkout', viewport: 'mobile' },
  { path: '/client/order-tracking', name: 'order-tracking', viewport: 'mobile' },
  { path: '/client/rating', name: 'client-rating', viewport: 'mobile' },
  { path: '/client/orders', name: 'client-orders', viewport: 'mobile' },
  { path: '/client/profile', name: 'client-profile', viewport: 'mobile' },
  { path: '/client/support', name: 'client-support', viewport: 'mobile' },
  { path: '/client/subscription', name: 'client-subscription', viewport: 'mobile' },
  { path: '/client/referral', name: 'client-referral', viewport: 'mobile' },
  
  // Pro Module
  { path: '/pro/home', name: 'pro-home', viewport: 'mobile' },
  { path: '/pro/agenda', name: 'pro-agenda', viewport: 'mobile' },
  { path: '/pro/earnings', name: 'pro-earnings', viewport: 'mobile' },
  { path: '/pro/ranking', name: 'pro-ranking', viewport: 'mobile' },
  { path: '/pro/profile', name: 'pro-profile', viewport: 'mobile' },
  { path: '/pro/verification', name: 'pro-verification', viewport: 'mobile' },
  { path: '/pro/plan', name: 'pro-plan', viewport: 'mobile' },
  { path: '/pro/withdraw', name: 'pro-withdraw', viewport: 'mobile' },
  { path: '/pro/support', name: 'pro-support', viewport: 'mobile' },
  { path: '/pro/quality', name: 'pro-quality', viewport: 'mobile' },
  { path: '/pro/availability', name: 'pro-availability', viewport: 'mobile' },
  
  // Admin Module (Desktop)
  { path: '/admin/login', name: 'admin-login', viewport: 'desktop' },
  { path: '/admin/dashboard', name: 'admin-dashboard', viewport: 'desktop' },
  { path: '/admin/orders', name: 'admin-orders', viewport: 'desktop' },
  { path: '/admin/pros', name: 'admin-pros', viewport: 'desktop' },
  { path: '/admin/clients', name: 'admin-clients', viewport: 'desktop' },
  { path: '/admin/coupons', name: 'admin-coupons', viewport: 'desktop' },
  { path: '/admin/support', name: 'admin-support', viewport: 'desktop' },
  { path: '/admin/zones', name: 'admin-zones', viewport: 'desktop' },
  { path: '/admin/analytics', name: 'admin-analytics', viewport: 'desktop' },
  { path: '/admin/funnel', name: 'admin-funnel', viewport: 'desktop' },
  { path: '/admin/cohorts', name: 'admin-cohorts', viewport: 'desktop' },
  { path: '/admin/risk', name: 'admin-risk', viewport: 'desktop' },
  { path: '/admin/matching-debug', name: 'admin-matching-debug', viewport: 'desktop' },
  { path: '/admin/quotes', name: 'admin-quotes', viewport: 'desktop' },
  { path: '/admin/settings', name: 'admin-settings', viewport: 'desktop' },
  
  // Company Module
  { path: '/company/onboarding', name: 'company-onboarding', viewport: 'mobile' },
  { path: '/company/request-quote', name: 'company-quote', viewport: 'mobile' },
];

async function captureScreenshots() {
  console.log('🚀 Iniciando captura de screenshots...\n');
  
  // Criar diretório de screenshots se não existir
  const screenshotsDir = path.join(__dirname, '..', 'src', 'assets', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const route of routes) {
    const page = await browser.newPage();
    
    try {
      // Configurar viewport
      const viewport = route.viewport === 'desktop' ? DESKTOP_VIEWPORT : MOBILE_VIEWPORT;
      await page.setViewport(viewport);
      
      // Navegar para a rota
      const url = `${BASE_URL}${route.path}`;
      console.log(`📸 Capturando: ${route.name} (${route.path})`);
      
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // Aguardar um pouco para animações terminarem
      await page.waitForTimeout(1500);
      
      // Capturar screenshot
      const screenshotPath = path.join(screenshotsDir, `${route.name}.png`);
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: false // Captura apenas a viewport visível
      });
      
      console.log(`   ✅ Salvo: ${route.name}.png`);
      successCount++;
      
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
      errorCount++;
    } finally {
      await page.close();
    }
  }
  
  await browser.close();
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 RESUMO:`);
  console.log(`   ✅ Sucesso: ${successCount} screenshots`);
  console.log(`   ❌ Erros: ${errorCount}`);
  console.log(`   📁 Pasta: src/assets/screenshots/`);
  console.log('='.repeat(50));
}

// Executar
captureScreenshots().catch(console.error);

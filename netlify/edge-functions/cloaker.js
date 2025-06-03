// netlify/edge-functions/cloaker.js
// CLOAKER ATUALIZADO COM UTMIFY INTEGRADO

// === LISTAS DE DETECÇÃO EXISTENTES ===
const FACEBOOK_BOTS = [
  'facebookexternalhit', 'facebookcatalog', 'facebook', 'facebot', 
  'visionutils/0.2', 'meta-externalagent', 'meta-external-agent', 'whatsapp'
];

const SPY_TOOLS_BRASIL = [
  'adminer', 'adsparo', 'spy-ads', 'guru-killer', 'minea', 'poweradspy',
  'dropispy', 'adheart', 'bigspy', 'anstrex', 'adplexity', 'spyfu',
  'adbeat', 'socialadscout', 'foreplay', 'minerador', 'capturador',
  'extrator', 'coletador', 'chrome-extension', 'extension', 'addon',
  'plugin', 'spy', 'scraper', 'extractor', 'miner', 'crawler', 'bot'
];

const AI_CRAWLERS = [
  'gptbot', 'chatgpt', 'claudebot', 'claude-web', 'bingbot', 'googlebot',
  'applebot', 'anthropic', 'openai', 'google-extended', 'cohere-ai',
  'ai2bot', 'omgili', 'diffbot'
];

// === FILTROS MÓVEIS ===
const ALLOWED_MOBILE_PATTERNS = [
  'android.*mobile', 'android.*chrome.*mobile', 'android.*firefox.*mobile', 
  'android.*opera.*mobile', 'iphone.*mobile.*safari', 'iphone.*crios',
  'iphone.*fxios', 'iphone.*safari', 'mobile.*safari', 'mobile.*chrome', 'wv.*android'
];

const BLOCKED_DEVICES = [
  'windows nt', 'macintosh', 'linux.*x86', 'ubuntu', 'x11', 'ipad',
  'android.*tablet', 'kindle', 'smart-tv', 'smarttv', 'television',
  'tizen', 'webos', 'headlesschrome', 'phantomjs', 'selenium', 'puppeteer'
];

// === FUNÇÃO DE DETECÇÃO MÓVEL ===
const detectMobileDevice = (userAgent) => {
  const ua = userAgent.toLowerCase();
  
  const isBlocked = BLOCKED_DEVICES.some(pattern => new RegExp(pattern).test(ua));
  if (isBlocked) {
    return { isMobile: false, isAllowed: false, reason: 'Blocked device', deviceType: 'blocked' };
  }
  
  const isMobileAllowed = ALLOWED_MOBILE_PATTERNS.some(pattern => new RegExp(pattern).test(ua));
  if (isMobileAllowed) {
    if (ua.includes('android')) {
      return { isMobile: true, isAllowed: true, deviceType: 'android', reason: 'Android mobile' };
    } else if (ua.includes('iphone')) {
      return { isMobile: true, isAllowed: true, deviceType: 'iphone', reason: 'iPhone' };
    }
  }
  
  return { isMobile: false, isAllowed: false, deviceType: 'unknown', reason: 'Not allowed mobile' };
};

// === FUNÇÃO DE DETECÇÃO GEOGRÁFICA ===
const detectCountry = (request, context) => {
  const country = context.geo?.country?.code || '';
  const cfCountry = request.headers.get('cf-ipcountry') || '';
  const xCountry = request.headers.get('x-country-code') || '';
  
  const detectedCountry = country || cfCountry || xCountry;
  
  return {
    country: detectedCountry.toUpperCase(),
    isBrazil: detectedCountry.toUpperCase() === 'BR',
    reason: detectedCountry ? `Country: ${detectedCountry}` : 'Country not detected'
  };
};

// === FUNÇÃO DE DETECÇÃO DE BOTS ===
const detectBot = (userAgent) => {
  const ua = userAgent.toLowerCase();
  
  if (FACEBOOK_BOTS.some(bot => ua.includes(bot.toLowerCase()))) {
    return { isBot: true, type: 'facebook', reason: 'Facebook bot detected' };
  }
  
  if (SPY_TOOLS_BRASIL.some(tool => ua.includes(tool.toLowerCase()))) {
    return { isBot: true, type: 'spy_tool', reason: 'Ad spy tool detected' };
  }
  
  if (AI_CRAWLERS.some(bot => ua.includes(bot.toLowerCase()))) {
    return { isBot: true, type: 'ai_crawler', reason: 'AI crawler detected' };
  }
  
  return { isBot: false };
};

// === WHITE PAGE ===
const generateWhitePage = (reason, details = {}) => {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alimentação Saudável - Dicas e Receitas Naturais</title>
    <meta name="description" content="Descubra receitas naturais e dicas de alimentação saudável para uma vida melhor.">
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); min-height: 100vh;
        }
        .container { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; color: #2E7D32; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
        .recipe-card { background: white; margin: 15px 0; padding: 20px; border-radius: 8px; 
                      border-left: 4px solid #4CAF50; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .tip { background: linear-gradient(45deg, #4CAF50, #45a049); color: white; 
               padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 40px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌿 Alimentação Saudável</h1>
            <p>Receitas naturais para uma vida mais equilibrada</p>
        </div>
        
        <div class="content">
            <h2>🥗 Dicas de Nutrição Natural</h2>
            <p>Uma alimentação equilibrada é a base para uma vida saudável. Conheça os benefícios de ingredientes naturais:</p>
            
            <div class="recipe-card">
                <h3>🍋 Água com Limão</h3>
                <p><strong>Benefícios:</strong> Rica em vitamina C, estimula a digestão e fortalece a imunidade.</p>
                <p><strong>Como usar:</strong> Misture o suco de meio limão em um copo de água morna e consuma em jejum.</p>
            </div>
            
            <div class="recipe-card">
                <h3>🫚 Chá de Gengibre</h3>
                <p><strong>Benefícios:</strong> Propriedades anti-inflamatórias, melhora a digestão e acelera o metabolismo.</p>
                <p><strong>Como preparar:</strong> Ferva fatias de gengibre fresco por 10 minutos e beba morno.</p>
            </div>
            
            <div class="tip">
                <h3>💡 Dica Especial: Detox Matinal</h3>
                <p>Combine água morna + limão + gengibre para um poderoso detox natural!</p>
            </div>
            
            <h3>🏥 Importante</h3>
            <p>Estas são dicas gerais de alimentação saudável. Para orientações personalizadas, consulte sempre um nutricionista.</p>
        </div>
        
        <div class="footer">
            <p>✨ Cuide da sua saúde com ingredientes naturais ✨</p>
        </div>
    </div>
    
    <!-- Debug: ${reason} -->
</body>
</html>`;
};

// === PÁGINA INTERMEDIÁRIA COM UTMIFY ===
const generateTrackingPage = (targetUrl) => {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Carregando...</title>
    
    <!-- SCRIPT UTMs UTMIFY (PRIMEIRO) -->
    <script
      src="https://cdn.utmify.com.br/scripts/utms/latest.js"
      data-utmify-prevent-xcod-sck
      data-utmify-prevent-subids
      async
      defer
    ></script>
    
    <!-- PIXEL UTMIFY (SEGUNDO - contém Facebook) -->
    <script>
      window.pixelId = "682ec51f2cd50fbe5ef79f66";
      var a = document.createElement("script");
      a.setAttribute("async", "");
      a.setAttribute("defer", "");
      a.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel.js");
      document.head.appendChild(a);
    </script>
    
    <style>
        body {
            margin: 0; padding: 0; background: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            display: flex; align-items: center; justify-content: center; min-height: 100vh;
        }
        .loader-container {
            text-align: center; background: white; padding: 40px; border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1); max-width: 400px; width: 90%;
        }
        .spinner {
            width: 40px; height: 40px; margin: 0 auto 20px; border: 4px solid #e3e3e3;
            border-top: 4px solid #4CAF50; border-radius: 50%; animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .loading-text { color: #666; font-size: 16px; margin-bottom: 10px; }
        .sub-text { color: #999; font-size: 14px; }
        .progress-bar {
            width: 100%; height: 4px; background: #e3e3e3; border-radius: 2px; margin: 20px 0; overflow: hidden;
        }
        .progress-fill {
            height: 100%; background: linear-gradient(90deg, #4CAF50, #45a049); width: 0%;
            border-radius: 2px; animation: progress 3s ease-out forwards;
        }
        @keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }
    </style>
</head>
<body>
    <div class="loader-container">
        <div class="spinner"></div>
        <div class="loading-text">Carregando protocolo...</div>
        <div class="progress-bar">
            <div class="progress-fill"></div>
        </div>
        <div class="sub-text">Preparando sua experiência personalizada</div>
    </div>

    <script>
        // FUNÇÃO PARA PRESERVAR UTMs NO REDIRECT
        function preserveUTMsAndRedirect(targetUrl) {
            const currentParams = new URLSearchParams(window.location.search);
            const targetURL = new URL(targetUrl);
            
            // Preservar todos os parâmetros UTM existentes
            for (const [key, value] of currentParams.entries()) {
                if (key.startsWith('utm_') || key.includes('fbclid') || key.includes('gclid') || 
                    key.includes('sck') || key.includes('src') || key.includes('sub')) {
                    targetURL.searchParams.set(key, value);
                }
            }
            
            console.log('🎯 Redirecting to:', targetURL.toString());
            window.location.href = targetURL.toString();
        }
        
        // AGUARDAR EXECUÇÃO DOS SCRIPTS UTMIFY + REDIRECT
        let scriptsLoaded = 0;
        const totalScripts = 2; // UTMs + Pixel
        
        function checkScriptsAndRedirect() {
            // Verificar se scripts UTMify carregaram
            if (window.utmify || document.querySelector('script[src*="utmify"]')) {
                scriptsLoaded++;
            }
            
            // Aguardar mínimo 3 segundos para execução completa
            setTimeout(() => {
                preserveUTMsAndRedirect('${targetUrl}');
            }, 3000);
        }
        
        // Iniciar verificação após DOM pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', checkScriptsAndRedirect);
        } else {
            checkScriptsAndRedirect();
        }
        
        // Fallback: redirect após 5 segundos independente do status
        setTimeout(() => {
            preserveUTMsAndRedirect('${targetUrl}');
        }, 5000);
    </script>
</body>
</html>`;
};

// === FUNÇÃO PRINCIPAL ATUALIZADA ===
export default async (request, context) => {
  try {
    const userAgent = request.headers.get('user-agent') || '';
    const ip = context.ip || '';
    const url = new URL(request.url);
    
    // 1. DETECÇÃO DE BOTS (primeira prioridade)
    const botDetection = detectBot(userAgent);
    if (botDetection.isBot) {
      console.log(`🤖 Bot detectado: ${botDetection.type} - ${botDetection.reason}`);
      return new Response(generateWhitePage('bot_detected', botDetection), {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=3600' }
      });
    }
    
    // 2. DETECÇÃO DE PAÍS (segunda prioridade)
    const geoDetection = detectCountry(request, context);
    if (!geoDetection.isBrazil) {
      console.log(`🌍 País bloqueado: ${geoDetection.country} - IP: ${ip}`);
      return new Response(generateWhitePage('country_blocked', geoDetection), {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=3600' }
      });
    }
    
    // 3. DETECÇÃO DE DISPOSITIVO MÓVEL (terceira prioridade)
    const mobileDetection = detectMobileDevice(userAgent);
    if (!mobileDetection.isAllowed) {
      console.log(`📱 Dispositivo bloqueado: ${mobileDetection.deviceType} - ${mobileDetection.reason}`);
      return new Response(generateWhitePage('device_blocked', mobileDetection), {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=3600' }
      });
    }
    
    // 4. USUÁRIO VÁLIDO → PÁGINA INTERMEDIÁRIA COM UTMIFY
    const targetUrl = `https://test.protocolovital4f.online${url.pathname}${url.search}`;
    
    console.log(`✅ Usuário válido: ${mobileDetection.deviceType} - Brasil - IP: ${ip.substring(0, 10)}***`);
    console.log(`🎯 Executando UTMify + redirect para: ${targetUrl}`);
    
    // RETORNA PÁGINA INTERMEDIÁRIA COM SCRIPTS UTMIFY
    return new Response(generateTrackingPage(targetUrl), {
      status: 200,
      headers: { 
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-cache, no-store, must-revalidate',
        'expires': '0'
      }
    });
    
  } catch (error) {
    console.error('❌ Erro no cloaker:', error);
    
    // Failsafe: em caso de erro, redirect direto
    const targetUrl = `https://test.protocolovital4f.online${new URL(request.url).pathname}${new URL(request.url).search}`;
    return Response.redirect(targetUrl, 302);
  }
};

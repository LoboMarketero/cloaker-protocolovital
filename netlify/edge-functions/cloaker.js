// netlify/edge-functions/cloaker.js
// CLOAKER ATUALIZADO COM UTMIFY INTEGRADO + QUIZ WHITE

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

// === QUIZ WHITE PAGE (META FRIENDLY) ===
const generateWhiteQuiz = (reason, details = {}) => {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quiz de Bem-estar | Descubra seu Perfil de Hábitos Saudáveis</title>
    <meta name="description" content="Questionário sobre hábitos de bem-estar e estilo de vida equilibrado. Descubra dicas personalizadas para melhorar sua qualidade de vida.">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh; display: flex; align-items: center; justify-content: center;
            padding: 20px; color: #333;
        }
        .quiz-container {
            background: white; border-radius: 20px; padding: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1); max-width: 500px; width: 100%;
        }
        .quiz-header { text-align: center; margin-bottom: 30px; }
        .quiz-title { color: #4a5568; font-size: 24px; margin-bottom: 10px; font-weight: 600; }
        .quiz-subtitle { color: #718096; font-size: 16px; line-height: 1.5; }
        .progress-bar { background: #e2e8f0; height: 8px; border-radius: 4px; margin: 20px 0; overflow: hidden; }
        .progress-fill { background: linear-gradient(90deg, #48bb78, #38a169); height: 100%; width: 0%; 
                        transition: width 0.5s ease; border-radius: 4px; }
        .question { margin-bottom: 30px; }
        .question-text { font-size: 18px; margin-bottom: 20px; color: #2d3748; font-weight: 500; }
        .options { display: grid; gap: 12px; }
        .option { background: #f7fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 16px;
                 cursor: pointer; transition: all 0.3s ease; text-align: left; }
        .option:hover { border-color: #4299e1; background: #ebf8ff; }
        .option.selected { border-color: #48bb78; background: #f0fff4; }
        .option-text { font-size: 15px; color: #4a5568; }
        .next-btn { background: linear-gradient(135deg, #48bb78, #38a169); color: white; border: none;
                   border-radius: 12px; padding: 16px 32px; font-size: 16px; font-weight: 600;
                   cursor: pointer; width: 100%; margin-top: 20px; transition: transform 0.2s ease; }
        .next-btn:hover { transform: translateY(-2px); }
        .next-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .step-hidden { display: none; }
        .result-card { background: linear-gradient(135deg, #4299e1, #3182ce); color: white; 
                      border-radius: 16px; padding: 24px; text-align: center; margin-top: 20px; }
        .result-title { font-size: 20px; margin-bottom: 16px; font-weight: 600; }
        .result-text { font-size: 16px; line-height: 1.6; opacity: 0.9; }
        .whatsapp-form { background: #f0fff4; border-radius: 12px; padding: 20px; margin-top: 20px; }
        .whatsapp-title { color: #2f855a; font-size: 18px; margin-bottom: 16px; font-weight: 600; }
        .phone-input { width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px;
                      font-size: 16px; margin-bottom: 12px; }
        .phone-input:focus { outline: none; border-color: #48bb78; }
        .phone-error { color: #e53e3e; font-size: 14px; margin-top: 8px; display: none; }
        .submit-btn { background: #25d366; color: white; border: none; border-radius: 8px;
                     padding: 12px 24px; font-size: 16px; font-weight: 600; cursor: pointer; width: 100%; }
        .emoji { font-size: 24px; margin-bottom: 16px; }
    </style>
</head>
<body>
    <div class="quiz-container">
        <div class="quiz-header">
            <div class="emoji">🌱</div>
            <h1 class="quiz-title">Quiz de Bem-estar</h1>
            <p class="quiz-subtitle">Descubra seu perfil de hábitos saudáveis e receba dicas personalizadas para melhorar sua qualidade de vida</p>
        </div>
        
        <div class="progress-bar">
            <div class="progress-fill" id="progressBar"></div>
        </div>
        
        <!-- Pergunta 1 -->
        <div class="question step-1">
            <h3 class="question-text">Qual é a sua rotina matinal favorita?</h3>
            <div class="options">
                <div class="option" data-value="a">
                    <div class="option-text">☀️ Acordo cedo e faço alongamentos</div>
                </div>
                <div class="option" data-value="b">
                    <div class="option-text">☕ Tomo um café tranquilo lendo algo inspirador</div>
                </div>
                <div class="option" data-value="c">
                    <div class="option-text">🚿 Banho revigorante e música motivacional</div>
                </div>
                <div class="option" data-value="d">
                    <div class="option-text">🧘 Alguns minutos de respiração consciente</div>
                </div>
            </div>
            <button class="next-btn" disabled onclick="nextQuestion()">Próxima Pergunta</button>
        </div>
        
        <!-- Pergunta 2 -->
        <div class="question step-2 step-hidden">
            <h3 class="question-text">Como você prefere relaxar após um dia produtivo?</h3>
            <div class="options">
                <div class="option" data-value="a">
                    <div class="option-text">📚 Lendo um bom livro ou assistindo algo educativo</div>
                </div>
                <div class="option" data-value="b">
                    <div class="option-text">🛁 Um banho relaxante com aromas suaves</div>
                </div>
                <div class="option" data-value="c">
                    <div class="option-text">🚶 Caminhada ao ar livre ou jardim</div>
                </div>
                <div class="option" data-value="d">
                    <div class="option-text">🎵 Música tranquila e um chá reconfortante</div>
                </div>
            </div>
            <button class="next-btn" disabled onclick="nextQuestion()">Próxima Pergunta</button>
        </div>
        
        <!-- Pergunta 3 -->
        <div class="question step-3 step-hidden">
            <h3 class="question-text">Qual atividade física mais te motiva?</h3>
            <div class="options">
                <div class="option" data-value="a">
                    <div class="option-text">🤸 Yoga ou pilates para flexibilidade</div>
                </div>
                <div class="option" data-value="b">
                    <div class="option-text">🏃 Caminhadas ou corridas leves</div>
                </div>
                <div class="option" data-value="c">
                    <div class="option-text">💃 Dança ou atividades musicais</div>
                </div>
                <div class="option" data-value="d">
                    <div class="option-text">🏊 Natação ou atividades aquáticas</div>
                </div>
            </div>
            <button class="next-btn" disabled onclick="nextQuestion()">Próxima Pergunta</button>
        </div>
        
        <!-- Pergunta 4 -->
        <div class="question step-4 step-hidden">
            <h3 class="question-text">Qual é seu tipo de alimentação preferida?</h3>
            <div class="options">
                <div class="option" data-value="a">
                    <div class="option-text">🥗 Saladas coloridas e alimentos frescos</div>
                </div>
                <div class="option" data-value="b">
                    <div class="option-text">🍲 Pratos caseiros com temperos naturais</div>
                </div>
                <div class="option" data-value="c">
                    <div class="option-text">🥑 Alimentos nutritivos e funcionais</div>
                </div>
                <div class="option" data-value="d">
                    <div class="option-text">🍵 Bebidas naturais e lanches equilibrados</div>
                </div>
            </div>
            <button class="next-btn" disabled onclick="nextQuestion()">Próxima Pergunta</button>
        </div>
        
        <!-- Pergunta 5 -->
        <div class="question step-5 step-hidden">
            <h3 class="question-text">Como você organiza seu ambiente de trabalho?</h3>
            <div class="options">
                <div class="option" data-value="a">
                    <div class="option-text">🌿 Com plantas e elementos naturais</div>
                </div>
                <div class="option" data-value="b">
                    <div class="option-text">📝 Tudo organizado e funcional</div>
                </div>
                <div class="option" data-value="c">
                    <div class="option-text">💡 Iluminação adequada e espaço arejado</div>
                </div>
                <div class="option" data-value="d">
                    <div class="option-text">🖼️ Decoração inspiradora e motivacional</div>
                </div>
            </div>
            <button class="next-btn" disabled onclick="nextQuestion()">Próxima Pergunta</button>
        </div>
        
        <!-- Pergunta 6 -->
        <div class="question step-6 step-hidden">
            <h3 class="question-text">Qual é sua forma favorita de buscar conhecimento?</h3>
            <div class="options">
                <div class="option" data-value="a">
                    <div class="option-text">📖 Livros e artigos sobre desenvolvimento pessoal</div>
                </div>
                <div class="option" data-value="b">
                    <div class="option-text">🎧 Podcasts e audiobooks durante atividades</div>
                </div>
                <div class="option" data-value="c">
                    <div class="option-text">👥 Conversas com pessoas inspiradoras</div>
                </div>
                <div class="option" data-value="d">
                    <div class="option-text">💻 Cursos online e conteúdo educativo</div>
                </div>
            </div>
            <button class="next-btn" disabled onclick="nextQuestion()">Próxima Pergunta</button>
        </div>
        
        <!-- Pergunta 7 -->
        <div class="question step-7 step-hidden">
            <h3 class="question-text">Como você gosta de passar os finais de semana?</h3>
            <div class="options">
                <div class="option" data-value="a">
                    <div class="option-text">🏞️ Em contato com a natureza e ar puro</div>
                </div>
                <div class="option" data-value="b">
                    <div class="option-text">👨‍👩‍👧‍👦 Tempo de qualidade com família e amigos</div>
                </div>
                <div class="option" data-value="c">
                    <div class="option-text">🎨 Atividades criativas e hobbies pessoais</div>
                </div>
                <div class="option" data-value="d">
                    <div class="option-text">🧘 Momentos de reflexão e autocuidado</div>
                </div>
            </div>
            <button class="next-btn" disabled onclick="showResult()">Ver Resultado</button>
        </div>
        
        <!-- Resultado -->
        <div class="question step-result step-hidden">
            <div class="result-card">
                <div class="emoji">🌟</div>
                <h3 class="result-title">Seu Perfil: Pessoa Equilibrada</h3>
                <p class="result-text">Parabéns! Você demonstra ter bons hábitos de bem-estar e busca constantemente o equilíbrio em sua vida. Continue cultivando essas práticas saudáveis que contribuem para sua qualidade de vida.</p>
            </div>
            
            <div class="whatsapp-form">
                <h4 class="whatsapp-title">📱 Receba Dicas Personalizadas</h4>
                <p style="color: #4a5568; margin-bottom: 16px; font-size: 14px;">Deixe seu WhatsApp para receber dicas semanais de bem-estar baseadas no seu perfil:</p>
                <input type="tel" 
                       class="phone-input" 
                       id="phoneInput" 
                       placeholder="(11) 99999-9999" 
                       maxlength="15">
                <div class="phone-error" id="phoneError">
                    Por favor, insira um número de WhatsApp brasileiro válido (ex: 11999999999)
                </div>
                <button class="submit-btn" onclick="validateAndSubmit()">Receber Dicas de Bem-estar</button>
            </div>
        </div>
        
        <!-- Página de Confirmação -->
        <div class="question step-confirmation step-hidden">
            <div class="result-card" style="background: linear-gradient(135deg, #48bb78, #38a169);">
                <div class="emoji">✅</div>
                <h3 class="result-title">Cadastro Realizado com Sucesso!</h3>
                <p class="result-text">Obrigado por participar do nosso quiz de bem-estar. Suas respostas foram registradas e nossa equipe especializada entrará em contato em breve.</p>
            </div>
            
            <div style="background: #f0fff4; border-radius: 12px; padding: 24px; margin-top: 20px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 16px;">📱</div>
                <h4 style="color: #2f855a; font-size: 20px; margin-bottom: 16px; font-weight: 600;">Verifique seu WhatsApp</h4>
                <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    Dentro de <strong>24 horas</strong>, você receberá uma mensagem personalizada com suas dicas de bem-estar baseadas no perfil identificado no quiz.
                </p>
                <div style="background: white; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #48bb78;">
                    <p style="color: #2d3748; margin: 0; font-size: 14px;">
                        <strong>Importante:</strong> Certifique-se de que seu WhatsApp esteja ativo para receber nossa mensagem com conteúdo exclusivo sobre hábitos saudáveis.
                    </p>
                </div>
                <p style="color: #718096; font-size: 14px; margin-top: 20px;">
                    Caso não receba nossa mensagem em até 24 horas, verifique se o número informado está correto ou entre em contato conosco.
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="color: #718096; font-size: 14px; margin-bottom: 16px;">
                    Enquanto isso, continue cuidando do seu bem-estar! 🌱
                </p>
                <div style="display: flex; justify-content: space-around; margin-top: 20px;">
                    <div style="text-align: center;">
                        <div style="font-size: 24px; margin-bottom: 8px;">🧘</div>
                        <p style="font-size: 12px; color: #4a5568; margin: 0;">Pratique mindfulness</p>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; margin-bottom: 8px;">💧</div>
                        <p style="font-size: 12px; color: #4a5568; margin: 0;">Mantenha-se hidratado</p>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; margin-bottom: 8px;">🚶</div>
                        <p style="font-size: 12px; color: #4a5568; margin: 0;">Mova-se regularmente</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let currentStep = 1;
        let answers = {};
        
        // Adicionar listeners para as opções
        document.addEventListener('DOMContentLoaded', function() {
            const options = document.querySelectorAll('.option');
            options.forEach(option => {
                option.addEventListener('click', function() {
                    const parent = this.closest('.question');
                    parent.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                    
                    const btn = parent.querySelector('.next-btn');
                    btn.disabled = false;
                    
                    const questionNumber = parent.className.match(/step-(\\d+)/)[1];
                    answers[questionNumber] = this.dataset.value;
                });
            });
        });
        
        function nextQuestion() {
            document.querySelector('.step-' + currentStep).classList.add('step-hidden');
            currentStep++;
            document.querySelector('.step-' + currentStep).classList.remove('step-hidden');
            updateProgress();
        }
        
        function showResult() {
            document.querySelector('.step-' + currentStep).classList.add('step-hidden');
            document.querySelector('.step-result').classList.remove('step-hidden');
            updateProgress();
        }
        
        function updateProgress() {
            let progress;
            if (currentStep <= 7) {
                progress = (currentStep / 7) * 85; // 85% para las 7 preguntas
            } else {
                progress = 85; // Resultado = 85%
            }
            document.getElementById('progressBar').style.width = progress + '%';
        }
        
        function validateAndSubmit() {
            const phoneInput = document.getElementById('phoneInput');
            const phoneError = document.getElementById('phoneError');
            const phone = phoneInput.value.replace(/\\D/g, '');
            
            // Validação para número brasileiro (11 dígitos, começando com 11-99)
            const brazilianPhoneRegex = /^[1-9][1-9][9][0-9]{8}$/;
            
            if (!brazilianPhoneRegex.test(phone)) {
                phoneError.style.display = 'block';
                phoneInput.style.borderColor = '#e53e3e';
                return;
            }
            
            phoneError.style.display = 'none';
            phoneInput.style.borderColor = '#48bb78';
            
            // Simular sucesso
            alert('Obrigado! Em breve você receberá dicas personalizadas de bem-estar no seu WhatsApp.');
        }
        
        // Máscara para o telefone
        document.getElementById('phoneInput').addEventListener('input', function(e) {
            let x = e.target.value.replace(/\\D/g, '').match(/(\\d{0,2})(\\d{0,5})(\\d{0,4})/);
            e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
        });
    </script>
    
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
      return new Response(generateWhiteQuiz('bot_detected', botDetection), {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=3600' }
      });
    }
    
    // 2. DETECÇÃO DE PAÍS (segunda prioridade)
    const geoDetection = detectCountry(request, context);
    if (!geoDetection.isBrazil) {
      console.log(`🌍 País bloqueado: ${geoDetection.country} - IP: ${ip}`);
      return new Response(generateWhiteQuiz('country_blocked', geoDetection), {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=3600' }
      });
    }
    
    // 3. DETECÇÃO DE DISPOSITIVO MÓVEL (terceira prioridade)
    const mobileDetection = detectMobileDevice(userAgent);
    if (!mobileDetection.isAllowed) {
      console.log(`📱 Dispositivo bloqueado: ${mobileDetection.deviceType} - ${mobileDetection.reason}`);
      return new Response(generateWhiteQuiz('device_blocked', mobileDetection), {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=3600' }
      });
    }
    
    // 4. USUÁRIO VÁLIDO → PÁGINA INTERMEDIÁRIA COM UTMIFY
    const targetUrl = `https://teste.protocolovital4f.online${url.pathname}${url.search}`;
    
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
    const targetUrl = `https://teste.protocolovital4f.online${new URL(request.url).pathname}${new URL(request.url).search}`;
    return Response.redirect(targetUrl, 302);
  }
};

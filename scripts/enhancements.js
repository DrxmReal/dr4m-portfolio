/* ============================================
   ENHANCEMENTS JS
   - Music toggle button
   - Toast notifications
   - Discord RPC skeleton
   - Typing animation
   - Spotify Now Playing (via Lanyard)
   - GitHub stats
   - Konami code easter egg
   ============================================ */

(function () {
    "use strict";

    /* ===== 1. MUSIC TOGGLE BUTTON ===== */
    function initMusicToggle() {
        const bgMusic = document.getElementById("bg-music");
        if (!bgMusic) return;

        const btn = document.createElement("button");
        btn.id = "music-toggle-btn";
        btn.setAttribute("aria-label", "Toggle background music");
        btn.title = "Toggle music";
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
            <div class="music-equalizer">
                <span></span><span></span><span></span><span></span>
            </div>
        `;
        document.body.appendChild(btn);

        bgMusic.volume = 0.2;

        const syncPoppy = (on) => {
            const poppy = document.querySelector(".username .poppy");
            if (poppy) poppy.classList.toggle("music-on", on);
        };

        // Sync button + poppy icon from the audio element itself,
        // so both controls (this button and the poppy in script.js) stay in sync
        bgMusic.addEventListener("play", () => { btn.classList.add("playing"); syncPoppy(true); });
        bgMusic.addEventListener("pause", () => { btn.classList.remove("playing"); syncPoppy(false); });

        btn.addEventListener("click", () => {
            if (bgMusic.paused) {
                bgMusic.play()
                    .then(() => showToast("Music on", "success"))
                    .catch(() => showToast("Cant play music", "error"));
            } else {
                bgMusic.pause();
                showToast("Music off", "info");
            }
        });
    }

    /* ===== 2. TOAST NOTIFICATION ===== */
    function showToast(msg, type = "info") {
        let container = document.querySelector(".toast-container");
        if (!container) {
            container = document.createElement("div");
            container.className = "toast-container";
            container.style.cssText = "position:fixed;bottom:30px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none;";
            document.body.appendChild(container);
        }

        const icons = {
            success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#1ed760" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
            error: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#f23f43" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            info: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };

        const toast = document.createElement("div");
        toast.className = "toast";
        toast.innerHTML = `${icons[type] || icons.info}<span>${msg}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("toast-out");
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // Patch the copy-email button
    function patchCopyEmail() {
        const btn = document.getElementById("copy-email");
        if (!btn) return;
        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            navigator.clipboard.writeText("Tube83001@gmail.com").then(() => {
                showToast("Email copied!", "success");
                btn.textContent = "Copied!";
                setTimeout(() => (btn.textContent = "Copy"), 1500);
            }).catch(() => showToast("Copy failed", "error"));
        };
    }

    /* ===== 3. DISCORD RPC SKELETON ===== */
    function injectSkeleton() {
        const rpc = document.querySelector(".discord-rpc");
        if (!rpc) return;

        const sk = document.createElement("div");
        sk.className = "rpc-skeleton";
        sk.innerHTML = `
            <div class="sk-row">
                <div class="sk-avatar skeleton"></div>
                <div class="sk-text-group">
                    <div class="sk-line sk-line-medium skeleton"></div>
                    <div class="sk-line sk-line-short skeleton"></div>
                </div>
            </div>
            <div class="sk-row" style="margin-top:4px">
                <div class="sk-large-img skeleton"></div>
                <div class="sk-text-group">
                    <div class="sk-line sk-line-long skeleton"></div>
                    <div class="sk-line sk-line-medium skeleton"></div>
                    <div class="sk-line sk-line-short skeleton"></div>
                </div>
            </div>
        `;
        rpc.appendChild(sk);
        rpc.classList.add("loading");
    }

    /* Patch updateLanyard to remove skeleton khi co data */
    function patchLanyardSkeleton() {
        // Observer: khi display-name co text -> remove skeleton
        const nameEl = document.querySelector(".discord .display-name");
        if (nameEl) {
            const obs = new MutationObserver(() => {
                if (nameEl.textContent.trim()) {
                    const rpc = document.querySelector(".discord-rpc");
                    if (rpc) rpc.classList.remove("loading");
                    obs.disconnect();
                }
            });
            obs.observe(nameEl, { childList: true, characterData: true, subtree: true });
        }
    }

    /* Pendant (hat.png) fallback: onerror hides it (inline attr);
       re-show when Lanyard sets a valid Discord decoration src */
    function watchPendant() {
        const pendant = document.querySelector(".avatar-pendant");
        if (!pendant || typeof MutationObserver === "undefined") return;
        const obs = new MutationObserver(() => {
            if (pendant.src && !pendant.src.endsWith("hat.png")) {
                pendant.style.display = "";
                pendant.onerror = () => { pendant.style.display = "none"; };
            }
        });
        obs.observe(pendant, { attributes: true, attributeFilter: ["src"] });
    }

    /* ===== 4. TYPING ANIMATION (JS-based, robust for long text) ===== */
    function initTyping() {
        const lines = [
            document.getElementById("l1"),
            document.getElementById("l2"),
            document.getElementById("l3")
        ];

        // Store original HTML
        const originals = lines.map(l => l ? l.innerHTML : "");

        // Clear all lines initially
        lines.forEach(l => { if (l) l.innerHTML = ""; });

        let lineIdx = 0;
        let charIdx = 0;
        let caret = null;

        function typeNext() {
            if (lineIdx >= lines.length) {
                // All done, remove carets
                lines.forEach(l => {
                    if (l) {
                        // Remove any caret spans
                        const existing = l.querySelector(".typing-caret");
                        if (existing) existing.remove();
                    }
                });
                return;
            }

            const line = lines[lineIdx];
            if (!line) { lineIdx++; charIdx = 0; setTimeout(typeNext, 100); return; }

            const full = originals[lineIdx];
            // Split by code point so surrogate pairs (emoji like flags) stay intact
            const chars = Array.from(full);
            if (charIdx === 0) {
                // Start of new line - add caret
                caret = document.createElement("span");
                caret.className = "typing-caret";
                caret.style.cssText = "display:inline-block;width:2px;height:1.1em;background:rgba(255,255,255,0.7);margin-left:1px;animation:blinkCaret 0.75s step-end infinite;vertical-align:text-bottom;";
                line.appendChild(caret);
            }

            if (charIdx < chars.length) {
                // Insert char before caret
                const charNode = document.createTextNode(chars[charIdx]);
                line.insertBefore(charNode, caret);
                charIdx++;
                setTimeout(typeNext, 25 + Math.random() * 15);
            } else {
                // Line done
                lineIdx++;
                charIdx = 0;
                setTimeout(typeNext, 300);
            }
        }

        // Add blink caret CSS if not exists
        if (!document.getElementById("blink-caret-style")) {
            const style = document.createElement("style");
            style.id = "blink-caret-style";
            style.textContent = "@keyframes blinkCaret{from,to{opacity:1}50%{opacity:0}}";
            document.head.appendChild(style);
        }

        // Start typing after a delay
        setTimeout(typeNext, 500);
    }

    /* ===== 5. SPOTIFY NOW PLAYING (via Lanyard) ===== */
    function injectSpotifyWidget() {
        const bento = document.getElementById("bento");
        if (!bento) return;

        const widget = document.createElement("a");
        widget.className = "widget widget-social spotify-widget";
        widget.href = "https://open.spotify.com/user/31gkbaim4tvdlklf7apqpp3wd3dm";
        widget.target = "_blank";
        widget.rel = "noopener";
        widget.innerHTML = `
            <div class="spotify-content">
                <div class="spotify-album"></div>
                <div class="spotify-info">
                    <span class="spotify-title">Not playing</span>
                    <span class="spotify-artist">Spotify</span>
                    <div class="spotify-progress"><div class="spotify-progress-bar"></div></div>
                </div>
            </div>
        `;
        bento.appendChild(widget);
    }

    let spotifyTimer = null;
    function updateSpotify(activity) {
        const widget = document.querySelector(".spotify-widget");
        if (!widget) return;

        const album = widget.querySelector(".spotify-album");
        const title = widget.querySelector(".spotify-title");
        const artist = widget.querySelector(".spotify-artist");
        const bar = widget.querySelector(".spotify-progress-bar");

        if (!activity || activity.type !== 2 || !activity.name || activity.name.toLowerCase() !== "spotify") {
            clearInterval(spotifyTimer);
            title.textContent = "Not playing";
            artist.textContent = "Spotify";
            bar.style.width = "0%";
            album.style.backgroundImage = "";
            return;
        }

        title.textContent = activity.details || "Unknown";
        artist.textContent = activity.state || "";

        let img = activity.assets?.large_image;
        if (img) {
            if (img.startsWith("spotify:")) img = "https://i.scdn.co/image/" + img.slice(8);
            else if (img.startsWith("http")) {} // already URL
            album.style.backgroundImage = `url(${img})`;
        }

        if (activity.timestamps?.start) {
            clearInterval(spotifyTimer);
            const start = activity.timestamps.start;
            const end = activity.timestamps.end;
            if (end && end > start) {
                spotifyTimer = setInterval(() => {
                    const total = end - start;
                    const cur = Date.now() - start;
                    const pct = Math.max(0, Math.min(100, (cur / total) * 100));
                    bar.style.width = pct + "%";
                }, 1000);
            }
        }
    }

    /* Intercept Lanyard activities to update Spotify */
    function hookLanyard() {
        const orig = window.updateLanyard;
        if (typeof orig === "function") {
            window.updateLanyard = function (d) {
                orig.call(this, d);
                const activities = (d.activities || []).filter((a) => a.type !== 4);
                const spotify = activities.find((a) => a.type === 2);
                updateSpotify(spotify);
            };
        } else {
            // Try again shortly, hook may not be ready yet
            setTimeout(hookLanyard, 50);
        }
    }

    /* ===== 6. GITHUB STATS ===== */
    function injectGithubWidget() {
        const bento = document.getElementById("bento");
        if (!bento) return;

        const widget = document.createElement("a");
        widget.className = "widget widget-social github-widget";
        widget.href = "https://github.com/DrxmReal";
        widget.target = "_blank";
        widget.rel = "noreferrer noopener";
        widget.innerHTML = `
            <div class="gh-header">
                <img class="gh-avatar" loading="lazy" alt="GitHub avatar" src="https://avatars.githubusercontent.com/DrxmReal?v=4">
                <div>
                    <div class="gh-name">DrxmReal</div>
                    <div class="gh-login">@DrxmReal</div>
                </div>
            </div>
            <div class="gh-stats">
                <div class="gh-stat"><div class="gh-stat-num">-</div><div class="gh-stat-label">Repos</div></div>
                <div class="gh-stat"><div class="gh-stat-num">-</div><div class="gh-stat-label">Followers</div></div>
                <div class="gh-stat"><div class="gh-stat-num">-</div><div class="gh-stat-label">Following</div></div>
            </div>
        `;
        bento.appendChild(widget);

        fetch("https://api.github.com/users/DrxmReal")
            .then((r) => r.json())
            .then((data) => {
                if (data.message) return;
                const nums = widget.querySelectorAll(".gh-stat-num");
                if (nums[0]) nums[0].textContent = data.public_repos ?? "-";
                if (nums[1]) nums[1].textContent = data.followers ?? "-";
                if (nums[2]) nums[2].textContent = data.following ?? "-";
            })
            .catch(() => {});
    }

    /* ===== 7. KONAMI CODE EASTER EGG ===== */
    function initKonami() {
        const pattern = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
        let idx = 0;
        document.addEventListener("keydown", (e) => {
            const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            if (k === pattern[idx] || (k === "b" && pattern[idx] === "b") || (k === "a" && pattern[idx] === "a")) {
                idx++;
                if (idx === pattern.length) {
                    triggerEgg();
                    idx = 0;
                }
            } else {
                idx = (k === pattern[0]) ? 1 : 0;
            }
        });
    }

    function triggerEgg() {
        const alert = document.createElement("div");
        alert.className = "easter-egg-alert";
        alert.textContent = "✦ You found a secret! ✦";
        document.body.appendChild(alert);

        // Confetti effect
        for (let i = 0; i < 60; i++) {
            const c = document.createElement("div");
            const colors = ["#ff6bd5","#7850ff","#00d4ff","#1ed760","#ffd700"];
            c.style.cssText = `position:fixed;width:10px;height:10px;background:${colors[i%5]};top:-10px;left:${Math.random()*100}vw;z-index:10001;pointer-events:none;border-radius:2px;transition:transform 3s cubic-bezier(0.5,0,1,1),opacity 3s;`;
            document.body.appendChild(c);
            requestAnimationFrame(() => {
                c.style.transform = `translateY(${window.innerHeight + 50}px) rotate(${Math.random()*720}deg)`;
                c.style.opacity = "0";
            });
            setTimeout(() => c.remove(), 3000);
        }

        setTimeout(() => {
            alert.style.transition = "opacity 0.4s, transform 0.4s";
            alert.style.opacity = "0";
            alert.style.transform = "translate(-50%, -60%) scale(0.8)";
            setTimeout(() => alert.remove(), 400);
        }, 2500);

        showToast("Konami code unlocked!", "success");
    }

    /* ===== 8. CUSTOM CURSOR GLOW ===== */
    function initCursorGlow() {
        if (window.matchMedia("(pointer: coarse)").matches) return;

        // Gate CSS cursor:none behind this class so a JS failure never leaves the user cursorless
        document.documentElement.classList.add("has-cursor-glow");

        const glow = document.createElement("div");
        glow.className = "cursor-glow";
        const dot = document.createElement("div");
        dot.className = "cursor-dot";
        document.body.appendChild(glow);
        document.body.appendChild(dot);

        let gx = 0, gy = 0, dx = 0, dy = 0, tx = 0, ty = 0;

        window.addEventListener("mousemove", (e) => {
            tx = e.clientX;
            ty = e.clientY;
            dot.style.transform = `translate(${tx}px, ${ty}px)`;
        });

        window.addEventListener("mousedown", () => glow.classList.add("click"));
        window.addEventListener("mouseup", () => glow.classList.remove("click"));

        const hoverSel = "a, button, .widget, .follow, .item, [role='button']";
        document.addEventListener("mouseover", (e) => {
            if (e.target.closest(hoverSel)) glow.classList.add("hover");
        });
        document.addEventListener("mouseout", (e) => {
            if (e.target.closest(hoverSel)) glow.classList.remove("hover");
        });

        function loop() {
            gx += (tx - gx) * 0.18;
            gy += (ty - gy) * 0.18;
            glow.style.transform = `translate(${gx}px, ${gy}px)`;
            requestAnimationFrame(loop);
        }
        loop();

        document.addEventListener("mouseleave", () => {
            glow.style.opacity = "0";
            dot.style.opacity = "0";
        });
        document.addEventListener("mouseenter", () => {
            glow.style.opacity = "";
            dot.style.opacity = "";
        });
    }

    /* ===== 9. SCROLL REVEAL ===== */
    function initScrollReveal() {
        if (!("IntersectionObserver" in window)) {
            document.querySelectorAll(".widget").forEach(w => w.classList.add("revealed"));
            return;
        }

        // Only hide widgets when JS is confirmed running; otherwise all stay visible
        document.documentElement.classList.add("sr");

        const widgets = document.querySelectorAll(".bento > *");
        widgets.forEach((w, i) => {
            w.style.transitionDelay = (i * 60) + "ms";
        });

        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("revealed");
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

        widgets.forEach(w => obs.observe(w));
    }

    /* ===== 10. VISITOR COUNTER ===== */
    function injectVisitorCounter() {
        const bento = document.getElementById("bento");
        if (!bento) return;

        const counter = document.createElement("div");
        counter.className = "visitor-counter";
        counter.innerHTML = `
            <span class="vc-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
            </span>
            <span class="vc-number">-</span>
            <span class="vc-label">visitors</span>
        `;
        bento.appendChild(counter);

        const numEl = counter.querySelector(".vc-number");

        // counterapi.dev v1 is dead (410) and v2 needs an API key;
        // Abacus is a free drop-in replacement ({"value": N}, CORS *)
        fetch("https://abacus.jasoncameron.dev/hit/drxm-portfolio/visits")
            .then(r => r.json())
            .then(data => {
                const count = data?.value ?? null;
                if (count !== null) animateNumber(numEl, count);
                else numEl.textContent = "?";
            })
            .catch(() => {
                numEl.textContent = "?";
            });
    }

    function animateNumber(el, target) {
        const duration = 1400;
        const start = performance.now();
        const startVal = 0;

        function step(now) {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            const val = Math.floor(startVal + (target - startVal) * eased);
            el.textContent = val.toLocaleString();
            if (t < 1) requestAnimationFrame(step);
            else {
                el.classList.add("bump");
                setTimeout(() => el.classList.remove("bump"), 300);
            }
        }
        requestAnimationFrame(step);
    }

    /* ===== INIT ALL ===== */
    function init() {
        injectSkeleton();
        initMusicToggle();
        patchCopyEmail();
        initTyping();
        injectSpotifyWidget();
        injectGithubWidget();
        patchLanyardSkeleton();
        watchPendant();
        hookLanyard();
        initKonami();
        initCursorGlow();
        initScrollReveal();
        injectVisitorCounter();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

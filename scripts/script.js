document.querySelectorAll(".meta").forEach((meta)=>meta.setAttribute("translate","no"));const profile=document.getElementById("profile");const about=document.getElementById("about-me");const backToTopBtn=document.getElementById("back-to-top");const scrollToBentoBtn=document.getElementById("scroll-to-bento");const eatDiv=document.getElementById("eat");function debounce(fn,delay){let timeout;return(...args)=>{clearTimeout(timeout);timeout=setTimeout(()=>fn(...args),delay)}}
function updateAboutWidth(){if(profile&&about){about.style.width=profile.offsetWidth+"px"}}
window.addEventListener("load",updateAboutWidth);window.addEventListener("resize",debounce(updateAboutWidth,100));function toggleBackToTopButton(){if(!backToTopBtn)return;const show=window.scrollY>200;backToTopBtn.style.bottom=show?"24px":"-140px"}
window.addEventListener("scroll",debounce(toggleBackToTopButton,50));if(scrollToBentoBtn){window.addEventListener("scroll",debounce(()=>{scrollToBentoBtn.style.display=window.scrollY>100?"none":"block"},50));scrollToBentoBtn.addEventListener("click",()=>{const bentoElement=document.getElementById("wrapper");if(bentoElement)bentoElement.scrollIntoView({behavior:"smooth"})})}
if(backToTopBtn){backToTopBtn.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}))}
document.querySelectorAll(".mctooltip").forEach((item) => {
    const tooltip = item.querySelector(".tooltip");
    if (!tooltip) return;

    const tipLog = (entry) => {
        try {
            (window.__tipLog = window.__tipLog || []).push(entry);
            if (window.__tipLog.length > 25) window.__tipLog.shift();
        } catch (_) {}
    };

    const update = (event) => {
        // Re-parent the tooltip to <body> on first show. A position:fixed element
        // directly under <body> always anchors to the viewport and can never be
        // re-anchored by a transformed/filtered/sticky ancestor (click effects,
        // hover animations, music toggle, ...) which would fling it off-position.
        if (tooltip.parentElement !== document.body) {
            tooltip.classList.add("mc-floating");
            document.body.appendChild(tooltip);
        }

        if (tooltip.style.display === "none" || !tooltip.style.display) {
            tooltip.style.display = "block";
            tooltip.style.visibility = "hidden";
        }

        const tooltipRect = tooltip.getBoundingClientRect();
        let top = event.clientY - tooltipRect.height - 10;
        let left = event.clientX + 10;

        if (left + tooltipRect.width > window.innerWidth) {
            left = event.clientX - tooltipRect.width - 10;
        }
        if (top < 0) {
            top = event.clientY + 10;
        }

        tooltip.style.position = "fixed";
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        tooltip.style.visibility = "visible";
        tooltip.style.display = "block";

        tipLog({
            type: event.type,
            cx: Math.round(event.clientX), cy: Math.round(event.clientY),
            top: Math.round(top), left: Math.round(left),
            sy: Math.round(window.scrollY)
        });
    };

    item.addEventListener("mousemove", update);
    // Recompute after all other click handlers (e.g. music toggle) have settled
    item.addEventListener("click", (e) => setTimeout(() => update(e), 0));
    item.addEventListener("mouseleave", () => {
        tooltip.style.display = "none";
        tooltip.style.visibility = "";
        tipLog({ type: "mouseleave", sy: Math.round(window.scrollY) });
    });
});const bubbleTrigger=document.querySelector(".bubble-trigger");if(bubbleTrigger){bubbleTrigger.addEventListener("click",()=>{bubbleTrigger.classList.toggle("active")})}
const soundPath="../src/assets/sounds/nom-nom-nom.mp3";const audio=new Audio(soundPath);if(eatDiv){eatDiv.addEventListener("click",()=>{audio.currentTime=0;audio.play();eatDiv.classList.add("shake");setTimeout(()=>{eatDiv.classList.remove("shake");eatDiv.classList.add("hidden")},1600)})}

// Music Control Logic
const bgMusic = document.getElementById('bg-music');
const crossBtn = document.querySelector('.username .poppy');

if (crossBtn && bgMusic) {
    // Set initial volume to 20%
    bgMusic.volume = 0.2;
    
    crossBtn.style.cursor = 'pointer';
    
    crossBtn.addEventListener('click', (e) => {
        // Prevent default action if necessary
        e.preventDefault();
        e.stopPropagation();

        if (bgMusic.paused) {
            bgMusic.play().catch(error => {
                console.log("Audio play failed:", error);
            });
            crossBtn.classList.add("music-on");
        } else {
            bgMusic.pause();
            crossBtn.classList.remove("music-on");
        }
    });
}

// Hacker URL Effect
(function() {
    const hexChars = "0123456789ABCDEF";
    
    function generateRandomHex(length) {
        let result = "";
        for (let i = 0; i < length; i++) {
            result += hexChars[Math.floor(Math.random() * hexChars.length)];
        }
        return result;
    }

    setInterval(() => {
        try {
            const url = new URL(window.location.href);
            // Update a 'sys_trace' query parameter to look like a system process
            url.searchParams.set('sys_trace', '0x' + generateRandomHex(8));
            
            // Also optionally randomizing a hash part if user prefers that, but query param is safer for scroll.
            // Let's stick to query param as it looks like data being passed.
            
            window.history.replaceState(null, '', url.toString());
        } catch (e) {
            console.error("URL update failed", e);
        }
    }, 100);
})();

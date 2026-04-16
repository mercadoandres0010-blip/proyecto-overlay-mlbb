// Timer Logic
let intermissionTimerSeconds = 0;
let intermissionTimerActive = false;
let intermissionInterval = null;

function updateTimerDisplay(seconds) {
    const timerElement = document.getElementById('countdown');
    if (!timerElement) return;
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    timerElement.textContent = `${m}:${s}`;
}

// Sync with BroadcastChannel
const syncChannel = new BroadcastChannel('intermission_sync');
syncChannel.onmessage = (event) => {
    const data = event.data;
    if (data.type === 'timer_update') {
        intermissionTimerSeconds = data.seconds;
        updateTimerDisplay(intermissionTimerSeconds);
    } else if (data.type === 'timer_control') {
        if (data.action === 'start') {
            startLocalTimer();
        } else if (data.action === 'stop' || data.action === 'reset') {
            clearInterval(intermissionInterval);
            intermissionTimerActive = false;
        }
    } else if (data.type === 'full_sync') {
        updateAgenda(data.agenda);
        updateTicker(data.ticker);
        
        if (data.videoFile) {
            updateVideo(data.videoFile, true);
        } else {
            updateVideo(data.videoUrl, false);
        }

        if (data.topBannerFile) {
            const objectUrl = URL.createObjectURL(data.topBannerFile);
            updateTopBanner(objectUrl, true, data.topBannerFile.type);
        } else if (data.topBannerUrl) {
            updateTopBanner(data.topBannerUrl, false, null);
        }
    }
};

function startLocalTimer() {
    if (intermissionTimerActive) return;
    intermissionTimerActive = true;
    intermissionInterval = setInterval(() => {
        if (intermissionTimerSeconds > 0) {
            intermissionTimerSeconds--;
            updateTimerDisplay(intermissionTimerSeconds);
        } else {
            clearInterval(intermissionInterval);
            intermissionTimerActive = false;
        }
    }, 1000);
}

// Agenda & Ticker UI Updates
function updateAgenda(matches) {
    const list = document.getElementById('match-list');
    if (!list || !matches) return;

    list.innerHTML = matches.map((m, idx) => `
        <div class="match-card ${m.active ? 'active' : ''}" data-index="${idx}">
            <div class="match-info">${m.game || 'TOURNAMENT MATCH'}</div>
            <div class="teams-row">
                <div class="team">
                    <img src="${m.t1Logo || 'https://via.placeholder.com/60/333/fff?text=T1'}" class="team-logo">
                    <span class="team-abbr">${m.t1Name || 'T1'}</span>
                </div>
                <div class="score">${m.t1Score || 0}</div>
                <div class="vs-icon">VS</div>
                <div class="score">${m.t2Score || 0}</div>
                <div class="team">
                    <span class="team-abbr">${m.t2Name || 'T2'}</span>
                    <img src="${m.t2Logo || 'https://via.placeholder.com/60/333/fff?text=T2'}" class="team-logo">
                </div>
            </div>
            <div class="match-time">${m.time || '--:--'}</div>
        </div>
    `).join('');
}

function updateTicker(newsItems) {
    const wrap = document.getElementById('ticker-wrap');
    if (!wrap || !newsItems) return;

    // Duplicate for seamless loop
    const items = [...newsItems, ...newsItems];
    wrap.innerHTML = items.map(item => `
        <div class="ticker-item"><span>▶</span> ${item}</div>
    `).join('');
    
    // Adjust animation speed based on content length
    const totalLength = items.join('').length;
    wrap.style.animationDuration = `${Math.max(20, totalLength * 0.5)}s`;
}

let currentVideoObjectUrl = null;
function updateVideo(source, isFile) {
    const video = document.getElementById('sponsor-video');
    if (!video || !source) return;

    let targetSrc = source;
    if (isFile) {
        if (currentVideoObjectUrl) URL.revokeObjectURL(currentVideoObjectUrl);
        currentVideoObjectUrl = URL.createObjectURL(source);
        targetSrc = currentVideoObjectUrl;
    }

    if (video.src !== targetSrc) {
        video.src = targetSrc;
        video.load();
        video.play().catch(e => console.log("Autoplay blocked or video error:", e));
    }
}

let topBannerObjectURL = null;
function updateTopBanner(source, isFile, mimeType) {
    const img = document.getElementById('top-banner-img');
    const video = document.getElementById('top-banner-video');
    if (!img || !video || !source) return;

    if (isFile) {
        if (topBannerObjectURL) URL.revokeObjectURL(topBannerObjectURL);
        topBannerObjectURL = source;
    }

    // Detect type: if mimeType is provided use it directly, otherwise fall back to URL extension
    let isVideo;
    if (mimeType) {
        isVideo = mimeType.startsWith('video/');
    } else {
        isVideo = source.match(/\.(mp4|webm|mov|ogg)/i) && !source.startsWith('blob:');
    }
    
    if (isVideo) {
        img.style.display = 'none';
        video.style.display = 'block';
        if (video.src !== source) {
            video.src = source;
            video.load();
            video.play().catch(e => console.log("Banner video play error:", e));
        }
    } else {
        video.style.display = 'none';
        video.pause();
        img.style.display = 'block';
        img.src = source;
    }
}

// Init
window.onload = () => {
    // Initial Load from localStorage
    const saved = localStorage.getItem('intermissionState');
    if (saved) {
        const data = JSON.parse(saved);
        updateAgenda(data.agenda);
        updateTicker(data.ticker);
        
        // Initial load only supports URL as File objects aren't persistent in localStorage
        if (data.videoUrl) updateVideo(data.videoUrl, false);
        if (data.topBannerUrl) updateTopBanner(data.topBannerUrl, false);
        
        intermissionTimerSeconds = data.seconds || 0;
        updateTimerDisplay(intermissionTimerSeconds);
    }
};

// Auto-glimmer for active match
setInterval(() => {
    const active = document.querySelector('.match-card.active');
    if (active) {
        active.style.filter = 'brightness(1.5) drop-shadow(0 0 15px var(--orange-main))';
        setTimeout(() => active.style.filter = '', 500);
    }
}, 3000);

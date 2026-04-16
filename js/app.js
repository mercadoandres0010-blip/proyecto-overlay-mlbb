/**
 * MLBB OVERLAY STATE - Persistence logic
 */
const DEFAULT_STATE = {
    tournament: {
        logo: 'https://seeklogo.com/images/D/deportivo-amanecer-logo-0FD7A37E36-seeklogo.com.png',
        stage: 'KNOCKOUT',
        matchInfo: 'DAY 1 - MATCH 2'
    },
    teamLeft: {
        name: 'YG',
        logo: 'https://logos-download.com/wp-content/uploads/2024/02/9z_Team_Logo-700x590.png',
        abbr: 'YG',
        bans: [], 
        coach: 'MARVZ',
        players: [{ name: 'STITCH', hero: null }, { name: 'BLINK', hero: null }, { name: 'LINA', hero: null }, { name: 'HANN', hero: null }, { name: 'YING', hero: null }]
    },
    teamRight: {
        name: 'AURORA',
        logo: 'https://www.vector69.com/logos/onic-esports.png',
        abbr: 'AUR',
        bans: [], 
        coach: 'BADGALSEPH',
        players: [{ name: 'LUNAR', hero: null }, { name: 'SIGIBUM', hero: null }, { name: 'ROSA', hero: null }, { name: 'PAGU', hero: null }, { name: 'TIENZY', hero: null }]
    },
    sponsors: [
        'https://via.placeholder.com/120x30/fff/000?text=MOONTON',
        'https://via.placeholder.com/120x30/fff/000?text=REALME',
        'https://via.placeholder.com/120x30/fff/000?text=VISA',
        'https://via.placeholder.com/120x30/fff/000?text=FAIRRIE'
    ]
};

let overlayState = JSON.parse(localStorage.getItem('overlayPersistentState')) || DEFAULT_STATE;

function saveState() {
    localStorage.setItem('overlayPersistentState', JSON.stringify(overlayState));
}

function normalizeName(str) {
    return str.replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

function proxyImg(url) {
    if (!url || url.includes('placeholder') || url.startsWith('data:') || url.startsWith('assets/')) return url;
    if (url.startsWith('http')) return `https://wsrv.nl/?url=${encodeURIComponent(url)}`;
    return url;
}

function handleImgError(img) {
    img.onerror = null;
    img.src = 'https://via.placeholder.com/500x500/0a0b1e/ff8c00?text=ERROR';
}

function getHeroImageUrl(heroName) {
    if (!heroName) return '';
    const name = heroName.toUpperCase();
    let url = heroPhotos[name];
    if (!url) {
        for (const key in heroPhotos) {
            if (normalizeName(key) === normalizeName(heroName)) {
                url = heroPhotos[key];
                break;
            }
        }
    }
    return url ? proxyImg(url) : '';
}

function updateOverlay() {
    const tLogo = document.getElementById('tournament-logo');
    if(tLogo) tLogo.src = proxyImg(overlayState.tournament.logo);

    document.getElementById('match-info-top').textContent = overlayState.tournament.stage;
    document.getElementById('match-stage-title').textContent = overlayState.tournament.matchInfo;

    // Team Branding
    document.getElementById('coach-left').textContent = overlayState.teamLeft.coach;
    const lLogo = document.getElementById('team-logo-left');
    if(lLogo) lLogo.src = proxyImg(overlayState.teamLeft.logo);
    document.getElementById('team-name-left-abbr').textContent = overlayState.teamLeft.name.substring(0, 5).toUpperCase();

    document.getElementById('coach-right').textContent = overlayState.teamRight.coach;
    const rLogo = document.getElementById('team-logo-right');
    if(rLogo) rLogo.src = proxyImg(overlayState.teamRight.logo);
    document.getElementById('team-name-right-abbr').textContent = overlayState.teamRight.name.substring(0, 5).toUpperCase();

    // Full re-render — only on initial load or full state sync
    // These functions are now "non-destructive" for existing slots
    initBanSlots('bans-left', overlayState.teamLeft.bans);
    initBanSlots('bans-right', overlayState.teamRight.bans);
    initPickSlots('players-left', overlayState.teamLeft.players, 'left');
    initPickSlots('players-right', overlayState.teamRight.players, 'right');

    const spContainer = document.getElementById('sponsor-footer-container');
    if (spContainer && overlayState.sponsors) {
        const labels = ["POWERED BY", "OFFICIAL GAMING PHONE", "OFFICIAL PAYMENT PARTNER", "OFFICIAL TIMEKEEPER"];
        spContainer.innerHTML = overlayState.sponsors.map((url, i) => `
            <div class="sp-item">
                <span class="label">${labels[i] || 'SPONSOR'}</span>
                <img src="${proxyImg(url)}" onerror="this.style.display='none'">
            </div>
        `).join('');
    }
}

/**
 * INITIAL BUILD — called on load and on full state sync.
 * Builds all 5 ban slots WITHOUT animation (no CSS animation class).
 * Already-filled slots get their hero image; empty slots show a placeholder.
 */
function initBanSlots(containerId, bans) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = ''; // clear
    for (let i = 0; i < 5; i++) {
        const hero = bans[i];
        const slot = document.createElement('div');
        slot.className = hero ? 'ban-mini-slot no-anim' : 'ban-mini-slot empty';
        if (hero) {
            const img = document.createElement('img');
            img.src = getHeroImageUrl(hero);
            img.onerror = () => handleImgError(img);
            slot.appendChild(img);
        }
        container.appendChild(slot);
    }
}

/**
 * SURGICAL BAN — called only when a NEW ban is added.
 * Finds the first empty slot and fills it WITH animation.
 */
function applyBanToSlot(containerId, heroName) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const emptySlot = container.querySelector('.ban-mini-slot.empty');
    if (!emptySlot) return; // all 5 already filled

    // Replace empty slot with animated filled slot
    emptySlot.classList.remove('empty');
    // Remove no-anim if present so CSS animation fires
    emptySlot.classList.remove('no-anim');

    const img = document.createElement('img');
    img.src = getHeroImageUrl(heroName);
    img.onerror = () => handleImgError(img);
    emptySlot.appendChild(img);
}

/**
 * INITIAL BUILD for pick slots — no animations.
 */
function initPickSlots(containerId, players, teamPrefix) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = players.map((p, i) => {
        const hasHero = !!p.hero;
        const heroUrl = hasHero ? getHeroImageUrl(p.hero) : '';
        const teamLogo = teamPrefix === 'left' ? overlayState.teamLeft.logo : overlayState.teamRight.logo;
        return `
            <div class="pick-slot ${hasHero ? 'has-hero no-anim' : ''}" id="${teamPrefix}-p${i}">
                <img src="${proxyImg(teamLogo)}" class="bg-logo-pick">
                <img src="${heroUrl}" class="hero-splash">
                <div class="player-footer">
                    <span class="name">${p.name || `P${i+1}`}</span>
                </div>
            </div>
        `;
    }).join('');
}

function showBanner(text, color) {
    const banner = document.getElementById('hero-pick-banner');
    banner.textContent = text;
    banner.style.color = color || '#fff';
    banner.classList.remove('hiding');
    banner.classList.add('active');
}

function hideBanner() {
    const banner = document.getElementById('hero-pick-banner');
    banner.classList.remove('active');
    banner.classList.add('hiding');
    setTimeout(() => {
        banner.classList.remove('hiding');
        banner.style.color = '#fff';
    }, 500);
}

function pickHero(team, playerIndex, heroName) {
    const tObj = team === 'left' ? overlayState.teamLeft : overlayState.teamRight;
    const player = tObj.players[playerIndex];
    if (!player) return;

    const slot = document.getElementById(`${team}-p${playerIndex}`);
    if (!slot) return;

    // Phase 1: Picking pulse on THIS slot only + banner
    slot.classList.add('picking');
    showBanner(`PICKING: ${heroName}`, '#fff');

    // Phase 2: Lock hero — only update THIS slot, no full re-render
    setTimeout(() => {
        slot.classList.remove('picking');

        // Persist state
        player.hero = heroName;
        saveState();

        // Surgically update only this slot's hero image
        const splashImg = slot.querySelector('.hero-splash');
        if (splashImg) {
            splashImg.src = getHeroImageUrl(heroName);
        }
        // Trigger reveal animation by toggling has-hero
        // Force CSS animation to restart by removing then re-adding the class
        slot.classList.remove('has-hero', 'no-anim');
        void slot.offsetWidth; // reflow trigger
        slot.classList.add('has-hero');

        // Phase 3: Locked banner, then dismiss
        showBanner(`${heroName} LOCKED!`, var_m7_orange);
        setTimeout(() => hideBanner(), 2500);
    }, 2500);
}

// Expose CSS var value for JS usage
const var_m7_orange = '#ff8c00';
const var_m7_red = '#ff3c00';

function banHero(team, heroName) {
    const tObj = team === 'left' ? overlayState.teamLeft : overlayState.teamRight;
    const containerId = team === 'left' ? 'bans-left' : 'bans-right';

    // Phase 1: Show banning banner
    showBanner(`BANNING: ${heroName}`, var_m7_red);

    // Phase 2: Apply ban after delay — only update the new slot
    setTimeout(() => {
        if (!tObj.bans.includes(heroName)) {
            tObj.bans.push(heroName);
            saveState();
            // Surgically add only this new ban slot WITH animation
            applyBanToSlot(containerId, heroName);
        }

        // Phase 3: Dismissed banner
        showBanner(`${heroName} BANNED!`, var_m7_red);
        setTimeout(() => hideBanner(), 2000);
    }, 2000);
}


window.addEventListener('storage', (e) => {
    if (!e.newValue) return;
    const data = JSON.parse(e.newValue);
    if (e.key === 'draftUpdate') {
        if (data.type === 'PICK') pickHero(data.team, data.playerIndex, data.hero);
        if (data.type === 'BAN') banHero(data.team, data.hero);
    }
    if (['logoUpdate', 'coachUpdate', 'playerUpdate', 'sponsorsUpdate', 'overlayPersistentState'].includes(e.key)) {
        overlayState = JSON.parse(localStorage.getItem('overlayPersistentState')) || DEFAULT_STATE;
        updateOverlay();
    }
    if (e.key === 'timerUpdate') {
        const t = document.getElementById('draft-timer');
        if (t) t.textContent = data.val;
    }
});

const syncBC = new BroadcastChannel('draft_sync_bc');
syncBC.onmessage = (e) => {
    overlayState = JSON.parse(localStorage.getItem('overlayPersistentState')) || DEFAULT_STATE;
    updateOverlay();
};

window.onload = updateOverlay;

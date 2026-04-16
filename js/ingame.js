// MLBB M7-Style Ingame Overlay Controller
const state = {
    teamLeft: { name: "T1", logo: "", kills: 0, turrets: 0, lord: 0, turtle: 0, score: 0 },
    teamRight: { name: "T2", logo: "", kills: 0, turrets: 0, lord: 0, turtle: 0, score: 0 },
    gameTime: "00:00",
    ads: { label: "OFFICIAL PARTNER", logo: "" },
    tournamentLogo: "",
    sponsors: ["", "", "", ""]
};

function proxyImg(url) {
    if (!url || url.includes('placeholder') || url.startsWith('data:') || url.startsWith('assets/')) return url;
    if (url.startsWith('http')) {
        return `https://wsrv.nl/?url=${encodeURIComponent(url)}`;
    }
    return url;
}

let previousState = JSON.parse(JSON.stringify(state));

function updateUI() {
    // Update Teams Data
    updateTeamSide('left', state.teamLeft);
    updateTeamSide('right', state.teamRight);

    // Update Timer
    document.getElementById('game-time').innerText = state.gameTime;
    
    // Update Tournament Logo
    if (state.tournamentLogo) {
        const tLogo = document.getElementById('tourney-logo');
        if(tLogo) tLogo.src = proxyImg(state.tournamentLogo);
    }

    // Update Main Ads (Integrated)
    if (state.ads) {
        const adLabel = document.querySelector('.ads-label');
        const adLogo = document.getElementById('ads-logo');
        if(adLabel) adLabel.innerText = state.ads.label || "OFFICIAL PARTNER";
        if(adLogo && state.ads.logo) {
            adLogo.src = proxyImg(state.ads.logo);
            adLogo.style.opacity = '1';
        } else if(adLogo) {
            adLogo.style.opacity = '0';
        }
    }

    // Check for Objective Changes (for notifications)
    checkObjectives();
    
    // Save current state as previous for next comparison
    previousState = JSON.parse(JSON.stringify(state));
}

function updateTeamSide(side, data) {
    const nameEl = document.getElementById(`name-${side}`);
    const logoEl = document.getElementById(`logo-${side}`);
    
    if (nameEl) nameEl.innerText = data.name || (side === 'left' ? 'T1' : 'T2');
    if (logoEl && data.logo) logoEl.src = data.logo;

    // Scores (dots)
    const scoreContainer = document.getElementById(`score-${side}`);
    if (scoreContainer) {
        const dots = scoreContainer.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            if (index < (data.score || 0)) dot.classList.add('active');
            else dot.classList.remove('active');
        });
    }
    
    // Stats
    const lordEl = document.getElementById(`lord-${side}`);
    const turtleEl = document.getElementById(`turtle-${side}`);
    const turretEl = document.getElementById(`turrets-${side}`);
    
    if (lordEl) lordEl.innerText = data.lord || 0;
    if (turtleEl) turtleEl.innerText = data.turtle || 0;
    if (turretEl) turretEl.innerText = data.turrets || 0;
    
    // Kills with animation
    const killEl = document.getElementById(`kills-${side}`);
    if (killEl) {
        const oldKills = parseInt(killEl.innerText) || 0;
        const newKills = parseInt(data.kills) || 0;
        
        if (newKills > oldKills) {
            killEl.classList.remove('kills-pulse');
            void killEl.offsetWidth;
            killEl.classList.add('kills-pulse');
        }
        killEl.innerText = newKills;
    }
}

function checkObjectives() {
    // Usar los iconos de alta fidelidad (Nano Banano) para las notificaciones
    const lordIcon = 'assets/lord_icon.png';
    const turtleIcon = 'assets/turtle_icon.png';

    // Detect increment in Lord/Turtle counts to show the central notification
    if (state.teamLeft.lord > previousState.teamLeft.lord) {
        showNotification(state.teamLeft.name, state.teamLeft.logo, 'LORD', lordIcon);
    } else if (state.teamLeft.turtle > previousState.teamLeft.turtle) {
        showNotification(state.teamLeft.name, state.teamLeft.logo, 'TURTLE', turtleIcon);
    }

    if (state.teamRight.lord > previousState.teamRight.lord) {
        showNotification(state.teamRight.name, state.teamRight.logo, 'LORD', lordIcon);
    } else if (state.teamRight.turtle > previousState.teamRight.turtle) {
        showNotification(state.teamRight.name, state.teamRight.logo, 'TURTLE', turtleIcon);
    }
}

let notificationTimeout;
function showNotification(teamName, teamLogo, objective, iconUrl) {
    const container = document.getElementById('objective-notif');
    const teamEl = document.getElementById('notif-team');
    const teamLogoEl = document.getElementById('notif-team-logo');
    const actionEl = document.getElementById('notif-action');
    const iconEl = document.getElementById('notif-icon');

    if (!container || !teamEl || !actionEl || !iconEl) return;

    teamEl.innerText = teamName;
    if (teamLogoEl) {
        teamLogoEl.src = proxyImg(teamLogo);
        teamLogoEl.style.display = teamLogo ? 'block' : 'none';
        teamLogoEl.onerror = () => teamLogoEl.style.display = 'none';
    }
    
    // Traducción al Español
    const actionText = objective === 'LORD' ? 'HA DERROTADO AL LORD' : 'HA DERROTADO A LA TORTUGA';
    actionEl.innerText = actionText;
    
    // Asignar icono con fallback si falla
    iconEl.src = iconUrl;
    iconEl.onerror = () => {
        // Fallback a iconos locales o alternativos si falla One Esports
        if (objective === 'LORD') {
            iconEl.src = 'https://static.wikia.nocookie.net/mobile-legends/images/0/07/Lord_Icon.png';
        } else {
            iconEl.src = 'https://static.wikia.nocookie.net/mobile-legends/images/a/a2/Turtle_Icon.png';
        }
    };

    container.classList.add('active');
    
    clearTimeout(notificationTimeout);
    notificationTimeout = setTimeout(() => {
        container.classList.remove('active');
    }, 5000);
}

// Deep apply data and update UI
function applyUpdate(data) {
    if (!data) return;
    
    if (data.teamLeft) Object.assign(state.teamLeft, data.teamLeft);
    if (data.teamRight) Object.assign(state.teamRight, data.teamRight);
    if (data.ads) Object.assign(state.ads, data.ads);
    if (data.gameTime) state.gameTime = data.gameTime;
    if (data.tournamentLogo) state.tournamentLogo = data.tournamentLogo;
    if (data.sponsors) state.sponsors = [...data.sponsors];
    
    updateUI();
}

// Listen for updates from Admin Panel (using BroadcastChannel for better reliability)
const ingameChannel = new BroadcastChannel('ingame_sync');
ingameChannel.onmessage = (e) => {
    console.log("Broadcast received:", e.data);
    applyUpdate(e.data);
};

// Backup: Listen for updates via storage events
window.addEventListener('storage', (e) => {
    if (e.key === 'ingameUpdate' && e.newValue) {
        console.log("Storage event received:", e.key);
        applyUpdate(JSON.parse(e.newValue));
    }
});

// Initial Persistence sync
const persistent = localStorage.getItem('ingamePersistentState');
const draftPersistent = localStorage.getItem('overlayPersistentState');

if (persistent) {
    try {
        applyUpdate(JSON.parse(persistent));
    } catch(err) { console.error("Error loading persistent state:", err); }
}

// Fallback/Initial sync for Branding (Names/Logos) from the main Draft state
if (draftPersistent) {
    try {
        const ds = JSON.parse(draftPersistent);
        const brandingUpdate = {
            teamLeft: { name: ds.teamLeft?.name, logo: ds.teamLeft?.logo },
            teamRight: { name: ds.teamRight?.name, logo: ds.teamRight?.logo },
            tournamentLogo: ds.tournament?.logo
        };
        applyUpdate(brandingUpdate);
    } catch(err) { console.error("Error loading draft persistent state:", err); }
}

// After initial loads, set previousState to avoid notification spam on refresh
previousState = JSON.parse(JSON.stringify(state));

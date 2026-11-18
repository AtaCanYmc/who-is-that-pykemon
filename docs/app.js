/**
 * Who is That Pykemon? - Promotional Site Interactive Scripts
 * Lightweight vanilla JavaScript: interactive stage preview, Web Audio fanfare,
 * OS platform detection, and direct compiled desktop app download handling.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Stage Preview
  const previewCanvasContainer = document.getElementById('previewCanvasContainer');
  const rayburstBg = document.getElementById('rayburstBg');
  const characterSilhouette = document.getElementById('characterSilhouette');
  const nameInput = document.getElementById('nameInput');
  const themeSelect = document.getElementById('themeSelect');
  const fontSelect = document.getElementById('fontSelect');
  const togglePhaseBtn = document.getElementById('togglePhaseBtn');
  const togglePhaseText = document.getElementById('togglePhaseText');
  const stageBadge = document.getElementById('stageBadge');
  const badgeTitle = document.getElementById('badgeTitle');
  const stageTag = document.getElementById('stageTag');
  const playAudioBtn = document.getElementById('playAudioBtn');

  // DOM Elements - Terminal & Downloads
  const copyCodeBtn = document.getElementById('copyCodeBtn');
  const copyBtnText = document.getElementById('copyBtnText');
  const terminalCode = document.getElementById('terminalCode');
  const heroDownloadBtn = document.getElementById('heroDownloadBtn');
  const heroDownloadText = document.getElementById('heroDownloadText');
  const heroDownloadStatus = document.getElementById('heroDownloadStatus');
  const downloadsStatusMsg = document.getElementById('downloadsStatusMsg');

  // State
  let isRevealPhase = false;

  // Platform Definitions with direct release download URLs
  const platformConfig = {
    macos: {
      name: 'macOS',
      label: 'Download for macOS (.dmg) · 3.1 MB',
      href: 'downloads/Who_is_That_Pykemon.dmg',
      download: 'Who_is_That_Pykemon.dmg'
    },
    windows: {
      name: 'Windows',
      label: 'Download for Windows (.exe)',
      href: 'https://github.com/AtaCanYmc/who-is-that-pykemon/releases/latest/download/Who_is_That_Pykemon_1.5.0_x64-setup.exe',
      download: 'Who_is_That_Pykemon_1.5.0_x64-setup.exe'
    },
    linux: {
      name: 'Linux',
      label: 'Download for Linux (.AppImage)',
      href: 'https://github.com/AtaCanYmc/who-is-that-pykemon/releases/latest/download/who-is-that-pykemon_1.5.0_amd64.AppImage',
      download: 'who-is-that-pykemon_1.5.0_amd64.AppImage'
    }
  };

  // Detect User Operating System
  function detectPlatform() {
    const userAgent = (navigator.userAgent || '').toLowerCase();
    const platform = (navigator.platform || '').toLowerCase();
    if (platform.includes('mac') || userAgent.includes('macintosh') || userAgent.includes('mac os')) {
      return 'macos';
    }
    if (platform.includes('win') || userAgent.includes('windows')) {
      return 'windows';
    }
    if (platform.includes('linux') || userAgent.includes('linux')) {
      return 'linux';
    }
    return 'macos'; // default
  }

  const userPlatform = detectPlatform();

  function applyHeroConfig(config) {
    if (!heroDownloadBtn || !heroDownloadText) return;
    heroDownloadText.textContent = config.label;
    heroDownloadBtn.href = config.href;
    if (config.download) {
      heroDownloadBtn.setAttribute('download', config.download);
      heroDownloadBtn.removeAttribute('target');
      heroDownloadBtn.removeAttribute('rel');
    } else {
      heroDownloadBtn.removeAttribute('download');
      heroDownloadBtn.setAttribute('target', '_blank');
      heroDownloadBtn.setAttribute('rel', 'noopener noreferrer');
    }
  }

  function updatePlatformLinks(platform, url, filename, metaText) {
    const selectorPills = document.querySelectorAll(`.platform-pill-btn[data-platform="${platform}"]`);
    selectorPills.forEach((el) => {
      el.href = url;
      if (filename) el.setAttribute('download', filename);
    });

    const listLinks = document.querySelectorAll(`.platform-downloads-list a[data-platform="${platform}"]`);
    listLinks.forEach((el) => {
      el.href = url;
      if (filename) el.setAttribute('download', filename);
    });

    if (metaText) {
      const metaEl = document.querySelector(`.platform-meta[data-meta="${platform}"]`);
      if (metaEl) {
        metaEl.textContent = metaText;
      }
    }
  }

  // Initial Hero Download Button setup
  applyHeroConfig(platformConfig[userPlatform] || platformConfig.macos);

  // Fetch GitHub Releases API dynamically to populate live assets and sizes
  async function resolveLatestReleaseAssets() {
    try {
      const response = await fetch('https://api.github.com/repos/AtaCanYmc/who-is-that-pykemon/releases/latest');
      if (!response.ok) return;
      const release = await response.json();
      const assets = release.assets || [];
      if (!assets.length) return;

      const winAsset = assets.find((a) => a.name.endsWith('.exe') || a.name.endsWith('.msi'));
      if (winAsset) {
        const sizeMb = (winAsset.size / (1024 * 1024)).toFixed(1);
        platformConfig.windows.href = winAsset.browser_download_url;
        platformConfig.windows.download = winAsset.name;
        platformConfig.windows.label = `Download for Windows (.exe) · ${sizeMb} MB`;
        updatePlatformLinks('windows', winAsset.browser_download_url, winAsset.name, `64-bit Installer (.exe) · ${sizeMb} MB · Windows 10/11`);
      }

      const linuxAsset = assets.find((a) => a.name.endsWith('.AppImage') || a.name.endsWith('.deb'));
      if (linuxAsset) {
        const sizeMb = (linuxAsset.size / (1024 * 1024)).toFixed(1);
        platformConfig.linux.href = linuxAsset.browser_download_url;
        platformConfig.linux.download = linuxAsset.name;
        platformConfig.linux.label = `Download for Linux (.AppImage) · ${sizeMb} MB`;
        updatePlatformLinks('linux', linuxAsset.browser_download_url, linuxAsset.name, `Standalone (.AppImage) · ${sizeMb} MB · x86_64`);
      }

      const macAsset = assets.find((a) => a.name.endsWith('.dmg'));
      if (macAsset) {
        const sizeMb = (macAsset.size / (1024 * 1024)).toFixed(1);
        platformConfig.macos.href = macAsset.browser_download_url;
        platformConfig.macos.download = macAsset.name;
        platformConfig.macos.label = `Download for macOS (.dmg) · ${sizeMb} MB`;
        updatePlatformLinks('macos', macAsset.browser_download_url, macAsset.name, `Universal (.dmg) · ${sizeMb} MB · Apple Silicon & Intel`);
      }

      // Re-apply hero button for detected platform with dynamic sizes & URLs
      applyHeroConfig(platformConfig[userPlatform] || platformConfig.macos);
    } catch {
      // Gracefully maintain static direct download URLs
    }
  }

  resolveLatestReleaseAssets();

  // Themes Map
  const themes = {
    classic: {
      color1: '#0284c7',
      color2: '#38bdf8',
      badgeBorder: '#facc15',
      badgeBg: 'rgba(15, 23, 42, 0.85)'
    },
    gold: {
      color1: '#991b1b',
      color2: '#dc2626',
      badgeBorder: '#fbbf24',
      badgeBg: 'rgba(69, 10, 10, 0.85)'
    },
    neon: {
      color1: '#581c87',
      color2: '#7e22ce',
      badgeBorder: '#22d3ee',
      badgeBg: 'rgba(30, 10, 60, 0.85)'
    }
  };

  // Update Theme
  function applyTheme(themeKey) {
    const theme = themes[themeKey] || themes.classic;
    if (rayburstBg) {
      rayburstBg.style.background = `repeating-conic-gradient(from 0deg, ${theme.color1} 0deg 15deg, ${theme.color2} 15deg 30deg)`;
    }
    if (stageBadge) {
      stageBadge.style.borderColor = theme.badgeBorder;
      stageBadge.style.backgroundColor = theme.badgeBg;
    }
  }

  // Update Badge Title
  function updateBadgeText() {
    if (!nameInput || !badgeTitle) return;
    const rawVal = nameInput.value.trim().toUpperCase() || 'PYKEMON';
    badgeTitle.textContent = isRevealPhase ? `IT'S ${rawVal}!` : `???`;
  }

  // Update Font Style
  function updateFontStyle(fontKey) {
    if (!badgeTitle) return;
    if (fontKey === 'solid') {
      badgeTitle.style.fontFamily = "'Pokemon Solid', var(--font-sans)";
    } else if (fontKey === 'hollow') {
      badgeTitle.style.fontFamily = "'Pokemon Hollow', var(--font-sans)";
    } else {
      badgeTitle.style.fontFamily = "var(--font-sans)";
    }
  }

  // Toggle Reveal / Silhouette Phase
  function setPhase(reveal) {
    isRevealPhase = reveal;
    if (!characterSilhouette || !stageTag || !togglePhaseText) return;

    if (isRevealPhase) {
      characterSilhouette.classList.remove('is-silhouette');
      characterSilhouette.classList.add('is-reveal');
      stageTag.textContent = 'STAGE 2: CHARACTER REVEAL';
      togglePhaseText.textContent = 'Reset to Silhouette Stage';
      updateBadgeText();
      playChiptuneJingle();
    } else {
      characterSilhouette.classList.remove('is-reveal');
      characterSilhouette.classList.add('is-silhouette');
      stageTag.textContent = 'STAGE 1: SILHOUETTE TEASER';
      togglePhaseText.textContent = 'Trigger Reveal Stage';
      updateBadgeText();
    }
  }

  // Web Audio API Retro Chiptune Fanfare Synthesizer
  let audioCtx = null;
  function playChiptuneJingle() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!audioCtx) audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const now = audioCtx.currentTime;
      const notes = [
        { f: 523.25, d: 0.12 }, // C5
        { f: 659.25, d: 0.12 }, // E5
        { f: 783.99, d: 0.12 }, // G5
        { f: 1046.50, d: 0.28 } // C6
      ];

      let startTime = now;
      notes.forEach((note) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(note.f, startTime);

        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.d);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(startTime);
        osc.stop(startTime + note.d);

        startTime += note.d + 0.04;
      });
    } catch {
      // Audio autoplay restrictions or unsupported
    }
  }

  // Event Listeners - Stage Controls
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      nameInput.value = nameInput.value.toUpperCase();
      updateBadgeText();
    });
  }

  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      applyTheme(e.target.value);
    });
  }

  if (fontSelect) {
    fontSelect.addEventListener('change', (e) => {
      updateFontStyle(e.target.value);
    });
  }

  if (togglePhaseBtn) {
    togglePhaseBtn.addEventListener('click', () => {
      setPhase(!isRevealPhase);
    });
  }

  if (playAudioBtn) {
    playAudioBtn.addEventListener('click', () => {
      playChiptuneJingle();
    });
  }

  // Terminal Code Copy Button
  if (copyCodeBtn && terminalCode) {
    copyCodeBtn.addEventListener('click', async () => {
      try {
        const textToCopy = terminalCode.textContent;
        await navigator.clipboard.writeText(textToCopy);
        copyBtnText.textContent = 'Copied!';
        copyCodeBtn.classList.add('copied');
        setTimeout(() => {
          copyBtnText.textContent = 'Copy';
          copyCodeBtn.classList.remove('copied');
        }, 2000);
      } catch {
        copyBtnText.textContent = 'Failed';
      }
    });
  }

  // Initial Setup
  setPhase(false);
  if (themeSelect) applyTheme(themeSelect.value);
  if (fontSelect) updateFontStyle(fontSelect.value);
});

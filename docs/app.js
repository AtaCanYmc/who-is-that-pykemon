/**
 * Who is That Pykemon? — Promotional Site Interactive Scripts
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
  let cachedRelease = null;
  let isFetchingRelease = false;

  // Platform Definitions
  const platformConfig = {
    macos: {
      name: 'macOS',
      ext: '.dmg',
      label: 'Download for macOS (.dmg)',
      pattern: /\.(dmg|app\.tar\.gz)$/i,
      directUrl: 'https://github.com/AtaCanYmc/who-is-that-pykemon/releases/latest/download/Who-is-That-Pykemon.dmg'
    },
    windows: {
      name: 'Windows',
      ext: '.exe',
      label: 'Download for Windows (.exe)',
      pattern: /\.(exe|msi)$/i,
      directUrl: 'https://github.com/AtaCanYmc/who-is-that-pykemon/releases/latest/download/Who-is-That-Pykemon-setup.exe'
    },
    linux: {
      name: 'Linux',
      ext: '.AppImage',
      label: 'Download for Linux (.AppImage)',
      pattern: /\.(AppImage|deb)$/i,
      directUrl: 'https://github.com/AtaCanYmc/who-is-that-pykemon/releases/latest/download/Who-is-That-Pykemon.AppImage'
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
    return 'macos'; // fallback
  }

  const userPlatform = detectPlatform();

  // Initialize Hero Download Button Label
  if (heroDownloadText && platformConfig[userPlatform]) {
    heroDownloadText.textContent = platformConfig[userPlatform].label;
  }

  // Update Status Banner Helper
  function showStatus(message, isError = false) {
    [heroDownloadStatus, downloadsStatusMsg].forEach((el) => {
      if (!el) return;
      el.textContent = message;
      el.style.color = isError ? 'var(--color-brand-red)' : 'var(--color-brand-blue)';
      el.style.opacity = '1';
    });
  }

  // Fetch Latest GitHub Release Info
  async function getLatestRelease() {
    if (cachedRelease) return cachedRelease;
    if (isFetchingRelease) return null;
    isFetchingRelease = true;
    try {
      const res = await fetch('https://api.github.com/repos/AtaCanYmc/who-is-that-pykemon/releases/latest');
      if (!res.ok) {
        // If 404 (no releases published yet), try all releases list
        const allRes = await fetch('https://api.github.com/repos/AtaCanYmc/who-is-that-pykemon/releases');
        if (allRes.ok) {
          const list = await allRes.json();
          if (Array.isArray(list) && list.length > 0) {
            cachedRelease = list[0];
            return cachedRelease;
          }
        }
        return null;
      }
      cachedRelease = await res.json();
      return cachedRelease;
    } catch {
      return null;
    } finally {
      isFetchingRelease = false;
    }
  }

  // Direct Binary Download Trigger
  async function triggerDirectDownload(targetPlatformKey) {
    const targetKey = targetPlatformKey === 'auto' ? userPlatform : targetPlatformKey;
    const config = platformConfig[targetKey] || platformConfig.macos;

    showStatus(`Looking up latest release for ${config.name}...`);

    try {
      const release = await getLatestRelease();
      let downloadUrl = null;
      let filename = null;

      if (release && Array.isArray(release.assets) && release.assets.length > 0) {
        const matchingAsset = release.assets.find((asset) => config.pattern.test(asset.name));
        if (matchingAsset) {
          downloadUrl = matchingAsset.browser_download_url;
          filename = matchingAsset.name;
        }
      }

      // If release asset found, download directly
      if (downloadUrl) {
        showStatus(`Downloading ${filename || config.name}...`);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename || `Who-is-That-Pykemon${config.ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => showStatus(`Download started: ${filename}`), 1000);
      } else {
        // Fallback: direct to GitHub releases page where compiled assets are published
        showStatus(`Opening GitHub Releases for ${config.name} installer...`);
        window.open('https://github.com/AtaCanYmc/who-is-that-pykemon/releases', '_blank', 'noopener,noreferrer');
      }
    } catch {
      showStatus(`Opening GitHub Releases page...`);
      window.open('https://github.com/AtaCanYmc/who-is-that-pykemon/releases', '_blank', 'noopener,noreferrer');
    }
  }

  // Wire Download Buttons
  document.querySelectorAll('.direct-download-btn, .platform-pill-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const platformKey = btn.getAttribute('data-platform') || 'auto';
      triggerDirectDownload(platformKey);
    });
  });

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

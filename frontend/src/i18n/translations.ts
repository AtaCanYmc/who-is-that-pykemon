export type Language = 'tr' | 'en' | 'fr';

export interface Translations {
  engineReady: string;
  installApp: string;
  appTitle: string;
  pykemon: string;
  tagline: string;
  online: string;

  // Dropzone
  dropzoneTitle: string;
  dropzoneSub: string;
  changePhoto: string;
  cropAdjust: string;
  invalidFileError: string;

  // Name & Preview
  nameLabel: string;
  nameOptional: string;
  namePlaceholder: string;
  nameCharCount: string;
  livePreviewTitle: string;
  livePreviewBadge: string;
  livePreviewAnnounce: string;
  revealPrefix: string;

  // Themes
  themeSectionTitle: string;
  themeCount: string;
  selectedBadge: string;
  themeClassicTitle: string;
  themeClassicDesc: string;
  themeGoldTitle: string;
  themeGoldDesc: string;
  themeNeonTitle: string;
  themeNeonDesc: string;

  // Fonts
  fontAnime: string;
  fontArcade: string;
  fontModern: string;

  // Highlights
  highlightAi: string;
  highlightAiDesc: string;
  highlight1080p: string;
  highlight1080pDesc: string;
  highlightAudio: string;
  highlightAudioDesc: string;

  // Actions
  generateBtn: string;
  generatingBtn: string;
  shortcutTip: string;
  videoCompleted: string;
  videoSpecs: string;
  newVideoBtn: string;
  downloadBtn: string;
  shareBtn: string;
  shareAdvice: string;
  cameraBtn: string;

  // Progress
  progressRemovingBg: string;
  progressGeneratingSil: string;
  progressRenderingVideo: string;
  progressCompleted: string;
  progressTitle: string;
  progressDoneTitle: string;
  progressLabel: string;
  stepBg: string;
  stepSil: string;
  stepVideo: string;
  stepReady: string;

  // Cropper
  cropTitle: string;
  cropReset: string;
  cropApply: string;

  // Share
  shareTitle: string;
  shareText: string;
  shareNotSupported: string;
  footerText: string;
}

export const translations: Record<Language, Translations> = {
  tr: {
    engineReady: 'PYKEMON MOTORU HAZIR',
    installApp: 'Uygulamayı Kur',
    appTitle: 'Who is That',
    pykemon: 'Pykemon',
    tagline: 'Fotoğrafını yükle, anında klasik Pokémon geçiş meme videosunu 1080p kalitesinde üret!',
    online: 'ONLINE',

    dropzoneTitle: 'Fotoğraf Seç veya Sürükle',
    dropzoneSub: 'PNG, JPG, WEBP • Max 15 MB',
    changePhoto: 'Fotoğrafı Değiştir',
    cropAdjust: 'Kırp / Odakla',
    invalidFileError: 'Lütfen geçerli bir görsel dosyası seçin (PNG, JPG, WEBP).',

    nameLabel: 'Açılışta Söylenecek İsim / Metin',
    nameOptional: 'opsiyonel',
    namePlaceholder: 'Örn: Ahmet, Caner, Hoca, Pikachu...',
    nameCharCount: 'karakter',
    livePreviewTitle: 'Canlı Yazı & Stil Önizlemesi',
    livePreviewBadge: 'CANLI ÖNİZLEME',
    livePreviewAnnounce: 'AÇILIŞ ANINDA SÖYLENECEK METİN',
    revealPrefix: "IT'S",

    themeSectionTitle: 'Pokémon Şablon Teması',
    themeCount: '3 ŞABLON',
    selectedBadge: 'SEÇİLDİ',
    themeClassicTitle: 'Kanto Klasik',
    themeClassicDesc: 'Mavi & sarı anime geçişi',
    themeGoldTitle: 'Johto Altın',
    themeGoldDesc: 'Nostaljik altın & kızıl',
    themeNeonTitle: 'Cyber Neon',
    themeNeonDesc: 'Fütüristik neon elektrik',

    fontAnime: 'Anime Solid',
    fontArcade: '8-Bit Arcade',
    fontModern: 'Modern Pro',

    highlightAi: 'AI Background',
    highlightAiDesc: 'rembg U2Net',
    highlight1080p: '1080P Widescreen',
    highlight1080pDesc: '16:9 Format',
    highlightAudio: 'Ses Senkronu',
    highlightAudioDesc: 'Orijinal SFX',

    generateBtn: 'VİDEOYU OLUŞTUR',
    generatingBtn: 'OLUŞTURULUYOR...',
    shortcutTip: 'İpucu: Ctrl + Enter ile hızlı başlatabilirsiniz.',
    videoCompleted: 'VİDEO TAMAMLANDI!',
    videoSpecs: '1080P • 16:9 • MP4',
    newVideoBtn: 'Yeni Video',
    downloadBtn: 'İndir (MP4)',
    shareBtn: 'Paylaş',
    shareAdvice: 'Videoyu doğrudan indirebilir veya Instagram, Reels & TikTok\'ta paylaşabilirsiniz!',
    cameraBtn: 'Kamera',

    progressRemovingBg: 'Arka plan yapay zeka ile temizleniyor...',
    progressGeneratingSil: 'Tok siyah siluet oluşturuluyor...',
    progressRenderingVideo: 'Pokémon geçiş videosu render ediliyor...',
    progressCompleted: 'Video başarıyla üretildi!',
    progressTitle: 'WHO IS THAT PYKEMON?',
    progressDoneTitle: 'PYKEMON YAKALANDI!',
    progressLabel: 'İlerleme:',
    stepBg: 'Arka Plan',
    stepSil: 'Siluet',
    stepVideo: 'Video & Ses',
    stepReady: 'Hazır',

    cropTitle: 'Görseli Konumlandır & Yakınlaştır',
    cropReset: 'Sıfırla',
    cropApply: 'Onayla',

    shareTitle: "Who's That Pykemon?",
    shareText: "Who's that Pykemon? It's {name}!",
    shareNotSupported: 'Cihazınız doğrudan paylaşımı desteklemiyor. "İndir" butonunu kullanabilirsiniz.',
    footerText: 'Who is That Pykemon • Full Responsive Studio (Mobile & Desktop PWA)',
  },

  en: {
    engineReady: 'PYKEMON ENGINE READY',
    installApp: 'Install App',
    appTitle: 'Who is That',
    pykemon: 'Pykemon',
    tagline: 'Upload your photo and instantly generate an authentic "Who\'s that Pokémon?" reveal meme video in 1080p!',
    online: 'ONLINE',

    dropzoneTitle: 'Choose or Drag Photo',
    dropzoneSub: 'PNG, JPG, WEBP • Max 15 MB',
    changePhoto: 'Change Photo',
    cropAdjust: 'Crop / Center',
    invalidFileError: 'Please select a valid image file (PNG, JPG, WEBP).',

    nameLabel: 'Name / Text Announced on Reveal',
    nameOptional: 'optional',
    namePlaceholder: 'e.g. Alex, Ash, Pikachu, Boss...',
    nameCharCount: 'chars',
    livePreviewTitle: 'Live Text & Style Preview',
    livePreviewBadge: 'LIVE PREVIEW',
    livePreviewAnnounce: 'TEXT ANNOUNCED ON REVEAL',
    revealPrefix: "IT'S",

    themeSectionTitle: 'Pokémon Card Theme',
    themeCount: '3 THEMES',
    selectedBadge: 'SELECTED',
    themeClassicTitle: 'Kanto Classic',
    themeClassicDesc: '1997 blue & yellow TV transition',
    themeGoldTitle: 'Johto Gold',
    themeGoldDesc: 'Gen-2 gold & crimson palette',
    themeNeonTitle: 'Cyber Neon',
    themeNeonDesc: 'Futuristic synthwave electric glow',

    fontAnime: 'Anime Solid',
    fontArcade: '8-Bit Arcade',
    fontModern: 'Modern Pro',

    highlightAi: 'AI Matting',
    highlightAiDesc: 'rembg U2Net',
    highlight1080p: '1080P Widescreen',
    highlight1080pDesc: '16:9 Format',
    highlightAudio: 'Audio Sync',
    highlightAudioDesc: 'Original SFX',

    generateBtn: 'GENERATE VIDEO',
    generatingBtn: 'GENERATING...',
    shortcutTip: 'Tip: Press Ctrl + Enter to quickly start rendering.',
    videoCompleted: 'VIDEO READY!',
    videoSpecs: '1080P • 16:9 • MP4',
    newVideoBtn: 'New Video',
    downloadBtn: 'Download (MP4)',
    shareBtn: 'Share',
    shareAdvice: 'Download directly or share instantly to Instagram, Reels & TikTok!',
    cameraBtn: 'Camera',

    progressRemovingBg: 'Removing background with AI model...',
    progressGeneratingSil: 'Generating solid black silhouette...',
    progressRenderingVideo: 'Rendering reveal video & mixing audio...',
    progressCompleted: 'Video generated successfully!',
    progressTitle: 'WHO IS THAT PYKEMON?',
    progressDoneTitle: 'PYKEMON CAUGHT!',
    progressLabel: 'Progress:',
    stepBg: 'Background',
    stepSil: 'Silhouette',
    stepVideo: 'Video & Audio',
    stepReady: 'Ready',

    cropTitle: 'Position & Zoom Image',
    cropReset: 'Reset',
    cropApply: 'Apply',

    shareTitle: "Who's That Pykemon?",
    shareText: "Who's that Pykemon? It's {name}!",
    shareNotSupported: 'Your device does not support native sharing. Please use the "Download" button.',
    footerText: 'Who is That Pykemon • Full Responsive Studio (Mobile & Desktop PWA)',
  },

  fr: {
    engineReady: 'MOTEUR PYKEMON PRÊT',
    installApp: 'Installer',
    appTitle: 'Quel est ce',
    pykemon: 'Pykemon',
    tagline: 'Importez votre photo et créez instantanément votre vidéo mème "Quel est ce Pokémon ?" en 1080p !',
    online: 'EN LIGNE',

    dropzoneTitle: 'Choisir ou glisser une photo',
    dropzoneSub: 'PNG, JPG, WEBP • Max 15 Mo',
    changePhoto: 'Changer de photo',
    cropAdjust: 'Recadrer / Centrer',
    invalidFileError: 'Veuillez sélectionner un fichier image valide (PNG, JPG, WEBP).',

    nameLabel: 'Nom / Texte annoncé lors de la révélation',
    nameOptional: 'optionnel',
    namePlaceholder: 'Ex: Sacha, Pikachu, Pierre, Boss...',
    nameCharCount: 'caractères',
    livePreviewTitle: 'Aperçu du texte et du style',
    livePreviewBadge: 'APERÇU EN DIRECT',
    livePreviewAnnounce: 'TEXTE ANNONCÉ LORS DU REVEAL',
    revealPrefix: "C'EST",

    themeSectionTitle: 'Thème Pokémon',
    themeCount: '3 THÈMES',
    selectedBadge: 'SÉLECTIONNÉ',
    themeClassicTitle: 'Kanto Classique',
    themeClassicDesc: 'Transition anime bleu & jaune 1997',
    themeGoldTitle: 'Johto Or',
    themeGoldDesc: 'Palette rétro or & pourpre',
    themeNeonTitle: 'Cyber Néon',
    themeNeonDesc: 'Électrique synthwave futuriste',

    fontAnime: 'Anime Solid',
    fontArcade: '8-Bit Arcade',
    fontModern: 'Moderne Pro',

    highlightAi: 'Détourage IA',
    highlightAiDesc: 'rembg U2Net',
    highlight1080p: '1080P Grand Écran',
    highlight1080pDesc: 'Format 16:9',
    highlightAudio: 'Synchro Audio',
    highlightAudioDesc: 'SFX Originaux',

    generateBtn: 'CRÉER LA VIDÉO',
    generatingBtn: 'GÉNÉRATION...',
    shortcutTip: 'Astuce : Appuyez sur Ctrl + Entrée pour lancer rapidement.',
    videoCompleted: 'VIDÉO PRÊTE !',
    videoSpecs: '1080P • 16:9 • MP4',
    newVideoBtn: 'Nouvelle Vidéo',
    downloadBtn: 'Télécharger (MP4)',
    shareBtn: 'Partager',
    shareAdvice: 'Téléchargez directement ou partagez sur Instagram, Reels & TikTok !',
    cameraBtn: 'Caméra',

    progressRemovingBg: 'Suppression de l\'arrière-plan par IA...',
    progressGeneratingSil: 'Génération de la silhouette noire...',
    progressRenderingVideo: 'Rendu de la vidéo et mixage audio...',
    progressCompleted: 'Vidéo générée avec succès !',
    progressTitle: 'QUEL EST CE PYKEMON ?',
    progressDoneTitle: 'PYKEMON CAPTURÉ !',
    progressLabel: 'Progression :',
    stepBg: 'Arrière-plan',
    stepSil: 'Silhouette',
    stepVideo: 'Vidéo & Audio',
    stepReady: 'Prêt',

    cropTitle: 'Positionner et zoomer l\'image',
    cropReset: 'Réinitialiser',
    cropApply: 'Valider',

    shareTitle: 'Quel est ce Pykemon ?',
    shareText: "Quel est ce Pykemon ? C'est {name} !",
    shareNotSupported: 'Votre appareil ne prend pas en charge le partage direct. Utilisez le bouton Télécharger.',
    footerText: 'Who is That Pykemon • Studio réactif complet (PWA Mobile & Desktop)',
  },
};

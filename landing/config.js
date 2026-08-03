const SQUADRIX_YOUTUBE_EMBED_URL = 'https://www.youtube.com/embed/SgnuDZtraq4?si=XxWmTMOxvQ8eB2jY';
const SQUADRIX_WINDOWS_DOWNLOAD_URL = 'https://apps.microsoft.com/detail/9PKRRC8D2LCS';

const youtubeEmbed = document.getElementById('youtube-embed');
if (youtubeEmbed) youtubeEmbed.src = SQUADRIX_YOUTUBE_EMBED_URL;

const windowsDownload = document.getElementById('windows-download');
if (SQUADRIX_WINDOWS_DOWNLOAD_URL && windowsDownload) {
  windowsDownload.href = SQUADRIX_WINDOWS_DOWNLOAD_URL;
  windowsDownload.target = '_blank';
  windowsDownload.rel = 'noreferrer';
  windowsDownload.textContent = 'הורדה מ־Microsoft Store';
}

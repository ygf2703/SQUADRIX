// Replace this value with the YouTube video URL after publishing the demo.
const SQUADRIX_YOUTUBE_URL = '';

const youtubeLink = document.getElementById('youtube-link');
if (SQUADRIX_YOUTUBE_URL) {
  youtubeLink.href = SQUADRIX_YOUTUBE_URL;
  youtubeLink.querySelector('span:last-of-type').textContent = 'צפו בסרטון ההדגמה';
  youtubeLink.querySelector('small').remove();
} else {
  youtubeLink.addEventListener('click', (event) => event.preventDefault());
}

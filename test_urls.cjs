
const https = require('https');
const urls = [
  'https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/University_of_Malaya_coat_of_arms.svg/1200px-University_of_Malaya_coat_of_arms.svg.png',
  'https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/Universiti_Putra_Malaysia_logo.png/220px-Universiti_Putra_Malaysia_logo.png',
  'https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/Universiti_Sains_Malaysia_logo.svg/1200px-Universiti_Sains_Malaysia_logo.svg.png',
  'https://upload.wikimedia.org/wikipedia/en/thumb/c/cd/HELP_University_logo.png/220px-HELP_University_logo.png',
  'https://upload.wikimedia.org/wikipedia/en/thumb/9/90/Universiti_Teknologi_MARA_logo.svg/1200px-Universiti_Teknologi_MARA_logo.svg.png',
  'https://en.your-uni.com/assets/images/university/utm-university.webp',
  'https://en.your-uni.com/assets/images/university/upm-university.webp'
];

urls.forEach(url => {
  https.request(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
    console.log(url + ': ' + res.statusCode);
  }).on('error', err => {
    console.log(url + ': Error ' + err.message);
  }).end();
});


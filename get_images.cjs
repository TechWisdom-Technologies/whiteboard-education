const https = require('https');

https.get('https://en.your-uni.com/university/university/mmu-university', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const images = [...data.matchAll(/<img[^>]+src=['"]([^'"]+)['"]/gi)].map(m => m[1]);
    const iframes = [...data.matchAll(/<iframe[^>]+src=['"]([^'"]+)['"]/gi)].map(m => m[1]);
    console.log("Images:", images.filter(url => url.includes('mmu')));
    console.log("Iframes:", iframes);
  });
});

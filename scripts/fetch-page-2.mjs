import https from 'https';

https.get('https://en.your-uni.com/university-list?page=2', (res) => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    const allImgs = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)];
    for(let i=0; i<Math.min(20, allImgs.length); i++) {
      console.log('IMG: ' + allImgs[i][1]);
    }
  });
});

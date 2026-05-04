import https from 'https';

const slugs = [
  'cyberjaya-university',
  'help-university',
  'lincoln-university-college',
  'swinburne-university-of-technology-sarawak-campus',
  'university-of-wollongong-uow',
  '-newcastle-university-medicine-malaysia',
  'universiti-malaya-um',
  'kings-university-college',
  'binary-university',
  'tunku-abdul-rahman-university-of-management-and-technology-tar-umt',
  'upm-university'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => resolve(res.statusCode)).on('error', () => resolve(500));
  });
}

async function run() {
  for (const slug of slugs) {
    const webp = `https://en.your-uni.com/assets/images/university/${slug}.webp`;
    const png = `https://en.your-uni.com/assets/images/university/${slug}.png`;
    const jpg = `https://en.your-uni.com/assets/images/university/${slug}.jpg`;
    
    let status = await checkUrl(webp);
    if (status === 200) { console.log(slug, '-> webp'); continue; }
    
    status = await checkUrl(png);
    if (status === 200) { console.log(slug, '-> png'); continue; }
    
    status = await checkUrl(jpg);
    if (status === 200) { console.log(slug, '-> jpg'); continue; }
    
    // Try without university-
    const slug2 = slug.replace('-university', '');
    const webp2 = `https://en.your-uni.com/assets/images/university/${slug2}.webp`;
    status = await checkUrl(webp2);
    if (status === 200) { console.log(slug, '->', webp2); continue; }
    
    console.log(slug, '-> NOT FOUND');
  }
}

run();

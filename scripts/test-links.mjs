

async function run() {
  const r = await fetch('https://en.your-uni.com/university/taylor-university-malaysia/');
  const html = await r.text();
  const m = html.match(/href="(\/university\/taylor-university-malaysia\/[^"]+)"/g);
  const links = m ? [...new Set(m.map(x => x.replace('href="', '').replace('"', '')))] : [];
  
  console.log("Found links:", links.slice(0, 10));

  for (const link of links.slice(0, 10)) {
    const url = `https://en.your-uni.com${link}`;
    console.log(`\nFetching ${url}`);
    const r2 = await fetch(url);
    const html2 = await r2.text();
    const ovIdx = html2.indexOf('course-overview-section');
    if (ovIdx !== -1) {
      console.log('  FOUND course-overview-section!');
      const excerpt = html2.substring(ovIdx, ovIdx + 500).replace(/<[^>]+>/g, '');
      console.log('  Excerpt:', excerpt);
    } else {
      console.log('  NOT found.');
    }
  }
}
run();

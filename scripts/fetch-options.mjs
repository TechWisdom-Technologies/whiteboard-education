import https from 'https';

https.get('https://en.your-uni.com/university-list', (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    // Look for the "Search / Filter" section
    const sidebarMatch = html.match(/Search \/ Filter([\s\S]*?)<button/i);
    if (sidebarMatch) {
      const sidebarHtml = sidebarMatch[1];
      const selects = sidebarHtml.match(/<select[^>]*>([\s\S]*?)<\/select>/gi) || [];
      selects.forEach((select, index) => {
        console.log('\n--- Select ' + index + ' ---');
        const options = select.match(/<option[^>]*>([^<]+)<\/option>/gi) || [];
        options.forEach(opt => {
          console.log(opt.replace(/<[^>]+>/g, '').trim());
        });
      });
    } else {
      console.log('Sidebar not found');
    }
  });
});

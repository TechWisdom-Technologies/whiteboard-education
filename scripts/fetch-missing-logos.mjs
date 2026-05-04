import https from 'https';

const slugMappings = {
  'mmu-university': 'Multimedia University Malaysia (MMU)', 'ucsi-university': 'UCSI University Malaysia',
  'taylor-university-malaysia': 'Taylor\'s University Malaysia', 'apu-university': 'APU University Malaysia',
  'uniten-university': 'UNITEN University Malaysia', 'city-university': 'City University Malaysia',
  'cyberjaya-university': 'Cyberjaya University Malaysia (UoC)', 'mahsa-university': 'MAHSA University Malaysia',
  'utp-university': 'UTP University Malaysia', 'segi-university': 'SEGi University Malaysia',
  'limkokwing-university': 'Limkokwing University Malaysia', 'iukl-university': 'Infrastructure University Kuala Lumpur (IUKL)',
  'inti-university': 'INTI International University Malaysia', 'unikl-university': 'UniKL University Malaysia',
  'help-university': 'HELP University Malaysia', 'utar-university': 'Tunku Abdul Rahman University (UTAR)',
  'nottingham-university': 'Nottingham University Malaysia', 'monash-university': 'MONASH University Malaysia',
  'iumw-university': 'International University of Malaya-Wales (IUMW)', 'utm-university': 'UTM University Malaysia',
  'utem-university': 'UTeM University Malaysia', 'lincoln-university-college': 'Lincoln University College',
  'university-malaysia-of-computer-science-and-engineering-unimy': 'University Malaysia of Computer Science & Engineering (UNIMY)',
  'sunway-university': 'Sunway University', 'msu-university': 'Management and Science University (MSU)',
  'swinburne-university-of-technology-sarawak-campus': 'Swinburne University of Technology Sarawak Campus',
  'utm-space-university-malaysia': 'UTM SPACE University Malaysia', 'heriot-watt-university-malaysia-campus': 'Heriot-Watt University Malaysia Campus',
  'university-of-southampton': 'University of Southampton Malaysia', 'curtin-university-malaysia': 'Curtin University Malaysia',
  'xiamen-university-malaysia-campus': 'Xiamen University Malaysia Campus', 'international-medical-university': 'International Medical University (IMU)',
  'universiti-geomatika-malaysia': 'Universiti Geomatika Malaysia', 'nilai-university': 'NILAI University',
  'university-of-wollongong-uow': 'University of Wollongong (UOW) Malaysia', '-newcastle-university-medicine-malaysia': 'Newcastle University Medicine Malaysia (NUMed)',
  'universiti-malaya-um': 'Universiti Malaya (UM)', 'kings-university-college': 'Kings University College Malaysia',
  'binary-university': 'Binary University', 'tunku-abdul-rahman-university-of-management-and-technology-tar-umt': 'Tunku Abdul Rahman University of Management and Technology (TAR UMT)',
  'upm-university': 'Universiti Putra Malaysia (UPM)'
};

async function fetchPage(page) {
  return new Promise((resolve) => {
    https.get('https://en.your-uni.com/university-list?page=' + page, (res) => {
      let html = '';
      res.on('data', c => html += c);
      res.on('end', () => resolve(html));
    });
  });
}

async function run() {
  const map = {};
  for(let i=1; i<=4; i++) {
    const html = await fetchPage(i);
    const imgRegex = /<img[^>]+src=["'](https:\/\/en\.your-uni\.com\/assets\/images\/university\/([^"']+)\.webp[^"']*)["'][^>]*>/gi;
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
      const url = match[1];
      const slug = match[2];
      const dbName = slugMappings[slug];
      if (dbName) {
        map[dbName] = url;
      }
    }
  }
  console.log(JSON.stringify(map, null, 2));
}
run();

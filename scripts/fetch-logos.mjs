import https from 'https';

const DB_UNIVERSITY_NAMES = [
  "Multimedia University Malaysia (MMU)", "UCSI University Malaysia", "Taylor's University Malaysia",
  "APU University Malaysia", "UNITEN University Malaysia", "City University Malaysia",
  "Cyberjaya University Malaysia (UoC)", "MAHSA University Malaysia", "UTP University Malaysia",
  "SEGi University Malaysia", "Limkokwing University Malaysia", "Infrastructure University Kuala Lumpur (IUKL)",
  "INTI International University Malaysia", "UniKL University Malaysia", "HELP University Malaysia",
  "Tunku Abdul Rahman University (UTAR)", "Nottingham University Malaysia", "MONASH University Malaysia",
  "International University of Malaya-Wales (IUMW)", "UTM University Malaysia", "UTeM University Malaysia",
  "Lincoln University College", "University Malaysia of Computer Science & Engineering (UNIMY)",
  "Sunway University", "Management and Science University (MSU)", "Swinburne University of Technology Sarawak",
  "UTM SPACE University Malaysia", "Heriot-Watt University Malaysia Campus", "University of Southampton Malaysia",
  "Curtin University Malaysia", "Swinburne University of Technology Sarawak Campus", "Xiamen University Malaysia Campus",
  "International Medical University (IMU)", "Universiti Geomatika Malaysia", "NILAI University",
  "University of Wollongong (UOW) Malaysia", "Newcastle University Medicine Malaysia (NUMed)",
  "Universiti Malaya (UM)", "Kings University College Malaysia", "Binary University",
  "Tunku Abdul Rahman University of Management and Technology (TAR UMT)", "Universiti Putra Malaysia (UPM)"
];

const slugMappings = {
  "mmu-university": "Multimedia University Malaysia (MMU)", "ucsi-university": "UCSI University Malaysia",
  "taylor-university-malaysia": "Taylor's University Malaysia", "apu-university": "APU University Malaysia",
  "uniten-university": "UNITEN University Malaysia", "city-university": "City University Malaysia",
  "cyberjaya-university": "Cyberjaya University Malaysia (UoC)", "mahsa-university": "MAHSA University Malaysia",
  "utp-university": "UTP University Malaysia", "segi-university": "SEGi University Malaysia",
  "limkokwing-university": "Limkokwing University Malaysia", "iukl-university": "Infrastructure University Kuala Lumpur (IUKL)",
  "inti-university": "INTI International University Malaysia", "unikl-university": "UniKL University Malaysia",
  "help-university": "HELP University Malaysia", "utar-university": "Tunku Abdul Rahman University (UTAR)",
  "nottingham-university": "Nottingham University Malaysia", "monash-university": "MONASH University Malaysia",
  "iumw-university": "International University of Malaya-Wales (IUMW)", "utm-university": "UTM University Malaysia",
  "utem-university": "UTeM University Malaysia", "lincoln-university-college": "Lincoln University College",
  "university-malaysia-of-computer-science-and-engineering-unimy": "University Malaysia of Computer Science & Engineering (UNIMY)",
  "sunway-university": "Sunway University", "msu-university": "Management and Science University (MSU)",
  "swinburne-university-of-technology-sarawak-campus": "Swinburne University of Technology Sarawak Campus",
  "utm-space-university-malaysia": "UTM SPACE University Malaysia", "heriot-watt-university-malaysia-campus": "Heriot-Watt University Malaysia Campus",
  "university-of-southampton": "University of Southampton Malaysia", "curtin-university-malaysia": "Curtin University Malaysia",
  "xiamen-university-malaysia-campus": "Xiamen University Malaysia Campus", "international-medical-university": "International Medical University (IMU)",
  "universiti-geomatika-malaysia": "Universiti Geomatika Malaysia", "nilai-university": "NILAI University",
  "university-of-wollongong-uow": "University of Wollongong (UOW) Malaysia", "-newcastle-university-medicine-malaysia": "Newcastle University Medicine Malaysia (NUMed)",
  "universiti-malaya-um": "Universiti Malaya (UM)", "kings-university-college": "Kings University College Malaysia",
  "binary-university": "Binary University", "tunku-abdul-rahman-university-of-management-and-technology-tar-umt": "Tunku Abdul Rahman University of Management and Technology (TAR UMT)",
  "upm-university": "Universiti Putra Malaysia (UPM)"
};

https.get('https://en.your-uni.com/university-list', (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    const map = {};
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
    console.log(JSON.stringify(map, null, 2));
  });
});

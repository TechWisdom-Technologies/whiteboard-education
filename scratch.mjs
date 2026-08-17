import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
// Using the anon key which might not have permission to update if RLS is enabled, but let's try.
// If RLS prevents it, we'll output a precise SQL script matching the IDs exactly.
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const LOGOS = {
  "Multimedia University Malaysia (MMU)": "https://en.your-uni.com/assets/images/university/mmu-university.webp",
  "UCSI University Malaysia": "https://en.your-uni.com/assets/images/university/ucsi-university.webp",
  "Taylor's University Malaysia": "https://en.your-uni.com/assets/images/university/taylor-university-malaysia.webp",
  "APU University Malaysia": "https://en.your-uni.com/assets/images/university/apu-university.webp",
  "UNITEN University Malaysia": "https://en.your-uni.com/assets/images/university/uniten-university.webp",
  "City University Malaysia": "https://en.your-uni.com/assets/images/university/city-university.webp",
  "MAHSA University Malaysia": "https://en.your-uni.com/assets/images/university/mahsa-university.webp",
  "SEGi University Malaysia": "https://en.your-uni.com/assets/images/university/segi-university.webp",
  "INTI International University Malaysia": "https://en.your-uni.com/assets/images/university/inti-university.webp",
  "Sunway University": "https://en.your-uni.com/assets/images/university/sunway-university.webp",
  "HELP University Malaysia": "https://en.your-uni.com/assets/images/university/help-university.png",
  "MONASH University Malaysia": "https://en.your-uni.com/assets/images/university/monash-university.webp",
  "Nottingham University Malaysia": "https://en.your-uni.com/assets/images/university/nottingham-university.webp",
  "Universiti Putra Malaysia (UPM)": "https://en.your-uni.com/assets/images/university/upm-university.jpg",
  "UTM University Malaysia": "https://en.your-uni.com/assets/images/university/utm-university.webp",
  "Universiti Malaya (UM)": "https://en.your-uni.com/assets/images/university/universiti-malaya-um.png",
  "Swinburne University of Technology Sarawak": "https://en.your-uni.com/assets/images/university/swinburne-university-of-technology-malaysia.webp",
  "Tunku Abdul Rahman University of Management and Technology (TAR UMT)": "https://www.tarc.edu.my/images/tarumt-logo1.png?v=beyongEducation2",
};

const CAMPUS_IMAGES = {
  "Multimedia University Malaysia (MMU)": "https://en.your-uni.com/assets/images/accommodation/8/Mutiara_Ville_@_Cyberjaya_202405221211_2.jpg",
  "UCSI University Malaysia": "https://www.ucsiinternationalschool.edu.my/sh/wp-content/uploads/sites/6/2021/08/About-The-School.png",
  "Taylor's University Malaysia": "https://www.easyuni.com/media/institution/photo/2016/11/17/thumbs/Taylors_5116.jpg.1024x683_q85.webp",
  "APU University Malaysia": "https://www.easyuni.com/media/institution/photo/2017/12/19/thumbs/APU_new_campus_sky3_preview.jpeg.600x400_q85_crop-scale.webp",
  "UNITEN University Malaysia": "https://i.ytimg.com/vi/xlaFIc9-GDE/maxresdefault.jpg",
  "City University Malaysia": "https://backend.studyfans.com/storage/media/Universities/main_image/2744/ba09kUzoog7K4WWfq0aJeBIXTNSG9AQr2wRcqw52.webp",
  "Cyberjaya University Malaysia (UoC)": "https://upload.wikimedia.org/wikipedia/commons/0/0b/Campus6.png",
  "MAHSA University Malaysia": "https://edufair.fsi.com.my/img/sponsor/97/resize/04f3aa33dddbdf46fbb3aa392abfded4.png",
  "UTP University Malaysia": "https://themalaysiavoice.com/wp-content/uploads/2023/07/UTP_Solar_Rooftop-scaled.jpg",
  "SEGi University Malaysia": "https://edufair.fsi.com.my/img/sponsor/20/cover_1530346726.jpeg",
  "Limkokwing University Malaysia": "https://www.msb-my.com/campus_images/Limkokwing_University_Malaysia_Selangor/image_4.jpg",
  "Infrastructure University Kuala Lumpur (IUKL)": "https://www.easyuni.com/media/institution/photo/2018/09/06/thumbs/Hostel_and_Block_A.jpg.1200x800_q85.webp",
  "INTI International University Malaysia": "https://www.easyuni.com/media/institution/photo/2012/10/04/inti_Sarawak.jpg",
  "UniKL University Malaysia": "https://www.ryugaku.or.jp/malaysia/image/unikl_img65.jpg",
  "Tunku Abdul Rahman University (UTAR)": "https://edufair.fsi.com.my/img/sponsor/16/cover_1695083511.jpeg",
  "Nottingham University Malaysia": "https://www.nottingham.ac.uk/About/Images-Multimedia/UNM-Trent-Building.jpg",
  "MONASH University Malaysia": "https://apply.emga.com.my/wp-content/uploads/2023/09/MONASH_UNIVERSITY_MALAYSIA-1-scaled-1.jpg",
  "International University of Malaya-Wales (IUMW)": "https://keystoneacademic-res.cloudinary.com/image/upload/f_auto/q_auto/g_auto/w_650/dpr_2.0/element/17/177916_DJI_0021_V21.jpg",
  "UTM University Malaysia": "https://news.utm.my/wp-content/uploads/2024/06/Featured-Image-NewsHub-1536x865.png",
  "UTeM University Malaysia": "https://www.utem.edu.my/images/slider/cache/68de67d9ab091884fd4e0e5f98534698/mainPicUTeM.jpg",
  "Lincoln University College": "https://en.your-uni.com/assets/images/university/46/Lincoln%20University.webp",
  "Sunway University": "https://apply.emga.com.my/wp-content/uploads/2024/01/SUNWAY-1.jpg",
  "Management and Science University (MSU)": "https://www.msu.edu.my/theme-2023/assets/uploads/2023/03/11-1600x800.webp",
  "Swinburne University of Technology Sarawak": "https://www.swinburne.edu.my/wp-content/uploads/2024/07/DJI_0061-scaled.jpg",
  "UTM SPACE University Malaysia": "https://en.your-uni.com/assets/images/university/50/UTMSPACE.webp",
  "Heriot-Watt University Malaysia Campus": "http://fteducation-bd.com/wp-content/uploads/2018/05/Heriot-Watt-University-Malaysia-2.jpg",
  "University of Southampton Malaysia": "https://www.ncuk.ac.uk/wp-content/uploads/2020/12/University-of-Southampton-Malaysia-Image-Gallery-2.jpg",
  "Curtin University Malaysia": "https://s43414.pcdn.co/study/wp-content/uploads/sites/2/2023/03/DSC01319_1_1-scaled-1.jpg",
  "Swinburne University of Technology Sarawak Campus": "https://www.swinburne.edu.my/wp-content/uploads/2016/03/SWINBURNE.jpg",
  "Xiamen University Malaysia Campus": "https://www.etawau.com/edu/UniversitiesBranch/Xiamen/XiamenUniversity_01b.jpg",
  "International Medical University (IMU)": "https://www.worldwidecolleges.com/wp-content/uploads/classified-listing/2025/02/IMU-1.jpg",
  "Universiti Geomatika Malaysia": "https://i0.wp.com/www.geomatika.edu.my/wp-content/uploads/2023/07/campus-ugm-lores.jpg?fit=1000%2C617&ssl=1",
  "NILAI University": "https://www.nilai.edu.my/sites/default/files/slide-item/image/2007.png",
  "University of Wollongong (UOW) Malaysia": "https://pxl-uoweduau.terminalfour.net/prod01/channel_3/assets/live-migration/www/images/content/groups/public/web/media/documents/mm/uow253477.jpg",
  "Newcastle University Medicine Malaysia (NUMed)": "https://www.easyuni.com/media/institution/photo/2021/12/08/thumbs/1_Featured_Photo__Microsite-Header.jpg.1150x500_q85.webp",
  "Universiti Malaya (UM)": "https://www.studymalaysiainfo.com/wp-content/uploads/2016/11/UM.jpg",
  "Kings University College Malaysia": "https://tse1.mm.bing.net/th/id/OIP.686TBPmG_4tkMEFIJyzI3QHaES?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
  "Binary University": "https://oktamam.com/wp-content/uploads/2023/05/binary-1024x768.jpg",
  "Tunku Abdul Rahman University of Management and Technology (TAR UMT)": "https://edufair.fsi.com.my/img/sponsor/2/cover_1667892130.jpeg",
};

async function migrate() {
  const { data: dbUnis, error } = await supabase.from('universities').select('id, name')
  if (error) {
    console.error("Fetch error:", error)
    return
  }

  const allNames = new Set([...Object.keys(LOGOS), ...Object.keys(CAMPUS_IMAGES)])
  let sql = ''
  let count = 0;

  for (const hardcodedName of allNames) {
    // Find matching DB name (fuzzy match)
    const match = dbUnis.find(u => 
      u.name.toLowerCase() === hardcodedName.toLowerCase() || 
      u.name.toLowerCase().includes(hardcodedName.toLowerCase()) ||
      hardcodedName.toLowerCase().includes(u.name.toLowerCase())
    )

    if (match) {
      const logo = LOGOS[hardcodedName] || ''
      const hero = CAMPUS_IMAGES[hardcodedName] || ''
      
      if (logo && hero) {
        sql += `UPDATE universities SET logo_url = '${logo}', hero_image = '${hero}' WHERE id = '${match.id}';\n`
      } else if (logo) {
        sql += `UPDATE universities SET logo_url = '${logo}' WHERE id = '${match.id}';\n`
      } else if (hero) {
        sql += `UPDATE universities SET hero_image = '${hero}' WHERE id = '${match.id}';\n`
      }
      count++;
    } else {
      console.log("No match found for hardcoded name:", hardcodedName)
    }
  }

  const fs = await import('fs')
  fs.writeFileSync('C:/Users/user/.gemini/antigravity-ide/brain/3010ba93-25e5-4c7e-9ba1-1a6734e21b44/update_images_by_id.sql', sql)
  console.log(`Generated SQL for ${count} universities using their exact database IDs.`)
}

migrate()

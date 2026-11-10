-- ═══════════════════════════════════════════════════════════════════
-- Migration: 20260801000010_seed_remaining_partner_universities.sql
-- Description: Ensures the remaining 35 partner universities (Levels 2 to 6)
--              from UpdatedPartnerUniversityList.pdf exist in public.universities
-- ═══════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_country_id UUID;
BEGIN
  SELECT id INTO v_country_id FROM public.countries WHERE LOWER(name) = 'malaysia' LIMIT 1;
  IF v_country_id IS NULL THEN
    v_country_id := 'c0000000-0000-0000-0000-000000000001'::uuid;
  END IF;

  -- 8. Level 2: MAHSA University
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%mahsa%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'MAHSA University',
      'Bandar Saujana Putra, Selangor',
      v_country_id,
      'MAHSA University is committed to excellence in healthcare, medical, dentistry, pharmacy, nursing, business, and engineering education with a cutting-edge 48-acre campus.',
      'MAHSA University is committed to excellence in healthcare, medical, dentistry, pharmacy, nursing, business, and engineering education with a cutting-edge 48-acre campus.',
      'https://en.your-uni.com/assets/images/university/mahsa-university.webp',
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80'
    );
  END IF;

  -- 9. Level 2: University of Cyberjaya
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%university of cyberjaya%' OR LOWER(name) LIKE '%cyberjaya university%' OR LOWER(name) LIKE '%uoc%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'University of Cyberjaya',
      'Cyberjaya, Selangor',
      v_country_id,
      'University of Cyberjaya (UoC) is a top-tier healthcare and technology-focused institution offering premier medical, pharmacy, psychology, and computing degrees in Malaysia''s Silicon Valley.',
      'University of Cyberjaya (UoC) is a top-tier healthcare and technology-focused institution offering premier medical, pharmacy, psychology, and computing degrees in Malaysia''s Silicon Valley.',
      'https://en.your-uni.com/assets/images/university/cyberjaya-university.png',
      'https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1200&q=80'
    );
  END IF;

  -- 10. Level 2: Asia Pacific University of Technology & Innovation (APU)
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%asia pacific university%' OR LOWER(name) LIKE '%apu%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'Asia Pacific University of Technology & Innovation (APU)',
      'Kuala Lumpur',
      v_country_id,
      'Asia Pacific University of Technology & Innovation (APU) is Malaysia''s premier tech and digital innovation university, recognized globally for artificial intelligence, cybersecurity, and fintech education.',
      'Asia Pacific University of Technology & Innovation (APU) is Malaysia''s premier tech and digital innovation university, recognized globally for artificial intelligence, cybersecurity, and fintech education.',
      'https://en.your-uni.com/assets/images/university/apu-university.webp',
      'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80'
    );
  END IF;

  -- 11. Level 2: Taylor’s University
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%taylor''s%' OR LOWER(name) LIKE '%taylors%' OR LOWER(name) LIKE '%taylor%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'Taylor’s University',
      'Subang Jaya, Selangor',
      v_country_id,
      'Taylor''s University is ranked among the top private universities in Southeast Asia, celebrated for world-class hospitality, business, architecture, and innovative campus lakeside living.',
      'Taylor''s University is ranked among the top private universities in Southeast Asia, celebrated for world-class hospitality, business, architecture, and innovative campus lakeside living.',
      'https://en.your-uni.com/assets/images/university/taylor-university-malaysia.webp',
      'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1200&q=80'
    );
  END IF;

  -- 12. Level 2: Sunway University
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%sunway%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'Sunway University',
      'Subang Jaya, Selangor',
      v_country_id,
      'Sunway University is a leading non-profit Malaysian university renowned for high-impact research, global academic partnerships with Lancaster and Harvard, and modern facilities.',
      'Sunway University is a leading non-profit Malaysian university renowned for high-impact research, global academic partnerships with Lancaster and Harvard, and modern facilities.',
      'https://en.your-uni.com/assets/images/university/sunway-university.webp',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80'
    );
  END IF;

  -- 13. Level 2: Wollongong University Malaysia
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%wollongong%' OR LOWER(name) LIKE '%uow%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'Wollongong University Malaysia',
      'Glenmarie, Shah Alam',
      v_country_id,
      'UOW Malaysia, part of the University of Wollongong Australia global network, delivers globally accredited Australian business, game development, engineering, and computing degrees.',
      'UOW Malaysia, part of the University of Wollongong Australia global network, delivers globally accredited Australian business, game development, engineering, and computing degrees.',
      'https://en.your-uni.com/assets/images/university/university-of-wollongong-uow.png',
      'https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1200&q=80'
    );
  END IF;

  -- 14. Level 2: Swinburne University of Technology
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%swinburne%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'Swinburne University of Technology',
      'Kuching, Sarawak',
      v_country_id,
      'Swinburne University of Technology Sarawak Campus is the international branch campus of Swinburne Australia, granting identical Australian degrees in engineering, design, and business.',
      'Swinburne University of Technology Sarawak Campus is the international branch campus of Swinburne Australia, granting identical Australian degrees in engineering, design, and business.',
      'https://en.your-uni.com/assets/images/university/swinburne-university-of-technology-malaysia.webp',
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80'
    );
  END IF;

  -- 15. Level 3: KPJ Healthcare University
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%kpj healthcare%' OR LOWER(name) LIKE '%kpj%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'KPJ Healthcare University',
      'Nilai, Negeri Sembilan',
      v_country_id,
      'KPJ Healthcare University is a healthcare education leader supported by KPJ Healthcare Berhad''s hospital network, offering medical, nursing, and allied health training.',
      'KPJ Healthcare University is a healthcare education leader supported by KPJ Healthcare Berhad''s hospital network, offering medical, nursing, and allied health training.',
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=80'
    );
  END IF;

  -- 16. Level 3: BAC - Brickfields Asia College
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%brickfields%' OR LOWER(name) LIKE '%bac%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'BAC - Brickfields Asia College',
      'Kuala Lumpur',
      v_country_id,
      'Brickfields Asia College (BAC) is acclaimed as the nation''s premier law and business school, producing outstanding UK law degree results and career-ready professionals.',
      'Brickfields Asia College (BAC) is acclaimed as the nation''s premier law and business school, producing outstanding UK law degree results and career-ready professionals.',
      'https://images.unsplash.com/photo-1523050854058-8df90110c476?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80'
    );
  END IF;

  -- 17. Level 3: IACT College
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%iact%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'IACT College',
      'Petaling Jaya, Selangor',
      v_country_id,
      'IACT College is Malaysia''s premier creative communication specialist, founded by advertising industry leaders to provide hands-on media, design, broadcasting, and marketing degrees.',
      'IACT College is Malaysia''s premier creative communication specialist, founded by advertising industry leaders to provide hands-on media, design, broadcasting, and marketing degrees.',
      'https://images.unsplash.com/photo-1534644107580-3a4dbd494a95?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80'
    );
  END IF;

  -- 18. Level 3: Veritas University College
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%veritas%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'Veritas University College',
      'Petaling Jaya, Selangor',
      v_country_id,
      'Veritas University College offers forward-thinking degrees in law, business, education, and social sciences with strong international credit transfers and blended study formats.',
      'Veritas University College offers forward-thinking degrees in law, business, education, and social sciences with strong international credit transfers and blended study formats.',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1200&q=80'
    );
  END IF;

  -- 19. Level 3: UNIMY – University of Malaysia of Computer Science & Engineering
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%unimy%' OR LOWER(name) LIKE '%computer science & engineering%' OR LOWER(name) LIKE '%computer science and engineering%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'UNIMY – University of Malaysia of Computer Science & Engineering',
      'Cyberjaya, Selangor',
      v_country_id,
      'UNIMY is a premier ICT-specialist boutique university devoted to nurturing high-demand technology professionals in software engineering, cybersecurity, and data science.',
      'UNIMY is a premier ICT-specialist boutique university devoted to nurturing high-demand technology professionals in software engineering, cybersecurity, and data science.',
      'https://en.your-uni.com/assets/images/university/university-malaysia-of-computer-science-and-engineering-unimy.webp',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80'
    );
  END IF;

  -- 20. Level 3: Reliance College
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%reliance%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'Reliance College',
      'Kuala Lumpur',
      v_country_id,
      'Reliance College is a pioneer in tourism and hospitality management education in Malaysia, empowering students with direct international internships and real-world hospitality training.',
      'Reliance College is a pioneer in tourism and hospitality management education in Malaysia, empowering students with direct international internships and real-world hospitality training.',
      'https://images.unsplash.com/photo-1525921429624-479b6a26d84d?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1200&q=80'
    );
  END IF;

  -- 21. Level 3: Management & Science University (MSU)
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%msu%' OR LOWER(name) LIKE '%management & science%' OR LOWER(name) LIKE '%management and science%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'Management & Science University (MSU)',
      'Shah Alam, Selangor',
      v_country_id,
      'Management & Science University (MSU) is a QS-ranked global institution focused on high graduate employability, medicine, health sciences, business, and tech qualifications.',
      'Management & Science University (MSU) is a QS-ranked global institution focused on high graduate employability, medicine, health sciences, business, and tech qualifications.',
      'https://en.your-uni.com/assets/images/university/msu-university.webp',
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80'
    );
  END IF;

  -- 22. Level 4: UCSI University
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%ucsi%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'UCSI University',
      'Kuala Lumpur',
      v_country_id,
      'UCSI University is ranked among the top 1% of universities worldwide, celebrated for stellar music, engineering, pharmacy, business, and extensive global university linkages.',
      'UCSI University is ranked among the top 1% of universities worldwide, celebrated for stellar music, engineering, pharmacy, business, and extensive global university linkages.',
      'https://en.your-uni.com/assets/images/university/ucsi-university.webp',
      'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80'
    );
  END IF;

  -- 23. Level 4: Universiti Tunku Abdul Rahman (UTAR)
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%utar%' OR LOWER(name) LIKE '%tunku abdul rahman university (utar)%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'Universiti Tunku Abdul Rahman (UTAR)',
      'Kampar & Sungai Long',
      v_country_id,
      'Universiti Tunku Abdul Rahman (UTAR) is a premier non-profit Malaysian university renowned for academic excellence, affordable quality tuition, and high industry employability.',
      'Universiti Tunku Abdul Rahman (UTAR) is a premier non-profit Malaysian university renowned for academic excellence, affordable quality tuition, and high industry employability.',
      'https://en.your-uni.com/assets/images/university/utar-university.webp',
      'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1200&q=80'
    );
  END IF;

  -- 24. Level 4: Raffles University
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%raffles%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'Raffles University',
      'Iskandar Puteri, Johor',
      v_country_id,
      'Raffles University is a practice-oriented university in EduCity Iskandar offering premier international curricula in design, business, psychology, and artificial intelligence.',
      'Raffles University is a practice-oriented university in EduCity Iskandar offering premier international curricula in design, business, psychology, and artificial intelligence.',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80'
    );
  END IF;

  -- 25. Level 4: Universiti Sultan Zainal Abidin (UniSZA)
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%unisza%' OR LOWER(name) LIKE '%sultan zainal abidin%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'Universiti Sultan Zainal Abidin (UniSZA)',
      'Kuala Terengganu, Terengganu',
      v_country_id,
      'Universiti Sultan Zainal Abidin (UniSZA) is a distinguished public university in Terengganu offering comprehensive medical, Islamic contemporary studies, law, and business programmes.',
      'Universiti Sultan Zainal Abidin (UniSZA) is a distinguished public university in Terengganu offering comprehensive medical, Islamic contemporary studies, law, and business programmes.',
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80'
    );
  END IF;

  -- 26. Level 4: Universiti Teknologi Malaysia (UTM)
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%universiti teknologi malaysia%' OR LOWER(name) LIKE '%utm university%' OR LOWER(name) LIKE '%utm%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'Universiti Teknologi Malaysia (UTM)',
      'Skudai, Johor',
      v_country_id,
      'Universiti Teknologi Malaysia (UTM) is a premier Malaysian public research university and a regional technological powerhouse in engineering, science, and architectural innovation.',
      'Universiti Teknologi Malaysia (UTM) is a premier Malaysian public research university and a regional technological powerhouse in engineering, science, and architectural innovation.',
      'https://en.your-uni.com/assets/images/university/utm-university.webp',
      'https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1200&q=80'
    );
  END IF;

  -- 27. Level 4: Universiti Teknikal Malaysia Melaka (UTeM)
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%utem%' OR LOWER(name) LIKE '%teknikal malaysia melaka%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'Universiti Teknikal Malaysia Melaka (UTeM)',
      'Durian Tunggal, Melaka',
      v_country_id,
      'Universiti Teknikal Malaysia Melaka (UTeM) is the pioneer technical public university in Malaysia, pioneering advanced technical and vocational education and engineering.',
      'Universiti Teknikal Malaysia Melaka (UTeM) is the pioneer technical public university in Malaysia, pioneering advanced technical and vocational education and engineering.',
      'https://en.your-uni.com/assets/images/university/utem-university.webp',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80'
    );
  END IF;

  -- 28. Level 4: Universiti Teknologi PETRONAS (UTP)
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%utp%' OR LOWER(name) LIKE '%petronas%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'Universiti Teknologi PETRONAS (UTP)',
      'Seri Iskandar, Perak',
      v_country_id,
      'Universiti Teknologi PETRONAS (UTP) is a premier private university in Malaysia wholly owned by PETRONAS, globally ranked for engineering, energy transition, and computer science.',
      'Universiti Teknologi PETRONAS (UTP) is a premier private university in Malaysia wholly owned by PETRONAS, globally ranked for engineering, energy transition, and computer science.',
      'https://en.your-uni.com/assets/images/university/utp-university.webp',
      'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80'
    );
  END IF;

  -- 29. Level 5: HELP University
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%help university%' OR LOWER(name) LIKE '%help%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'HELP University',
      'Kuala Lumpur',
      v_country_id,
      'HELP University is renowned across Asia for premier psychology, business, law, education, and analytics education with dual degree options and prestigious international credit transfers.',
      'HELP University is renowned across Asia for premier psychology, business, law, education, and analytics education with dual degree options and prestigious international credit transfers.',
      'https://en.your-uni.com/assets/images/university/help-university.png',
      'https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1200&q=80'
    );
  END IF;

  -- 30. Level 5: Limkokwing University
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%limkokwing%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'Limkokwing University',
      'Cyberjaya, Selangor',
      v_country_id,
      'Limkokwing University of Creative Technology is an international creative hub known for cutting-edge design, multimedia, fashion, animation, and creative entrepreneurship.',
      'Limkokwing University of Creative Technology is an international creative hub known for cutting-edge design, multimedia, fashion, animation, and creative entrepreneurship.',
      'https://en.your-uni.com/assets/images/university/limkokwing-university.webp',
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80'
    );
  END IF;

  -- 31. Level 5: Kolej Space
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%kolej space%' OR LOWER(name) LIKE '%utm space%' OR LOWER(name) LIKE '%space%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'Kolej Space',
      'Kuala Lumpur',
      v_country_id,
      'Kolej Space provides professional diploma and degree pathways connected with leading technical institutions, delivering accessible executive and industry-aligned higher education.',
      'Kolej Space provides professional diploma and degree pathways connected with leading technical institutions, delivering accessible executive and industry-aligned higher education.',
      'https://en.your-uni.com/assets/images/university/utm-space-university-malaysia.webp',
      'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1200&q=80'
    );
  END IF;

  -- 32. Level 5: City University Malaysia
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%city university%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'City University Malaysia',
      'Petaling Jaya, Selangor',
      v_country_id,
      'City University Malaysia delivers quality, career-focused bachelor''s and postgraduate qualifications in business, design, information technology, and allied health sciences.',
      'City University Malaysia delivers quality, career-focused bachelor''s and postgraduate qualifications in business, design, information technology, and allied health sciences.',
      'https://en.your-uni.com/assets/images/university/city-university.webp',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80'
    );
  END IF;

  -- 33. Level 5: UNITAR International University
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%unitar%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'UNITAR International University',
      'Petaling Jaya, Selangor',
      v_country_id,
      'UNITAR International University is a premier digital-first Malaysian university offering highly accessible business, education, IT, and culinary arts programmes.',
      'UNITAR International University is a premier digital-first Malaysian university offering highly accessible business, education, IT, and culinary arts programmes.',
      'https://images.unsplash.com/photo-1523050854058-8df90110c476?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80'
    );
  END IF;

  -- 34. Level 5: NMUC (Netherlands Maritime University College) City Campus (Formerly known as NMIT)
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%nmuc%' OR LOWER(name) LIKE '%nmit%' OR LOWER(name) LIKE '%netherlands maritime%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'NMUC (Netherlands Maritime University College) City Campus (Formerly known as NMIT)',
      'Johor Bahru & KL',
      v_country_id,
      'NMUC specializes in maritime transport, port management, logistics, and shipping operations with direct European maritime academic partnerships.',
      'NMUC specializes in maritime transport, port management, logistics, and shipping operations with direct European maritime academic partnerships.',
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80'
    );
  END IF;

  -- 35. Level 5: IIMAT College - International Institute of Management and Technology
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%iimat%' OR LOWER(name) LIKE '%international institute of management and technology%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'IIMAT College - International Institute of Management and Technology',
      'Kuala Lumpur',
      v_country_id,
      'IIMAT College provides accredited diploma and degree pathways in business management, accounting, information technology, and vocational leadership.',
      'IIMAT College provides accredited diploma and degree pathways in business management, accounting, information technology, and vocational leadership.',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80'
    );
  END IF;

  -- 36. Level 6: Multimedia University
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%multimedia university%' OR LOWER(name) LIKE '%mmu%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'Multimedia University',
      'Cyberjaya, Selangor',
      v_country_id,
      'Multimedia University (MMU) is Malaysia''s first private university and premier incubator of digital creative talent, multimedia innovation, software engineering, and AI.',
      'Multimedia University (MMU) is Malaysia''s first private university and premier incubator of digital creative talent, multimedia innovation, software engineering, and AI.',
      'https://en.your-uni.com/assets/images/university/mmu-university.webp',
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80'
    );
  END IF;

  -- 37. Level 6: Universiti Malaya-Wales
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%malaya-wales%' OR LOWER(name) LIKE '%malaya wales%' OR LOWER(name) LIKE '%iumw%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'Universiti Malaya-Wales',
      'Kuala Lumpur',
      v_country_id,
      'International University of Malaya-Wales (IUMW) is a joint university established between University of Malaya (UM) and the University of Wales, UK, awarding dual-award qualifications.',
      'International University of Malaya-Wales (IUMW) is a joint university established between University of Malaya (UM) and the University of Wales, UK, awarding dual-award qualifications.',
      'https://en.your-uni.com/assets/images/university/iumw-university.webp',
      'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1200&q=80'
    );
  END IF;

  -- 38. Level 6: Kings University College
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%kings university%' OR LOWER(name) LIKE '%kings%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'Kings University College',
      'Kuala Lumpur',
      v_country_id,
      'Kings University College delivers market-responsive qualifications in business, technology, early childhood education, and logistics in metropolitan Kuala Lumpur.',
      'Kings University College delivers market-responsive qualifications in business, technology, early childhood education, and logistics in metropolitan Kuala Lumpur.',
      'https://en.your-uni.com/assets/images/university/kings-university-college.png',
      'https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1200&q=80'
    );
  END IF;

  -- 39. Level 6: YPC International College
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%ypc%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'YPC International College',
      'Kuala Lumpur',
      v_country_id,
      'YPC International College collaborates with Liverpool John Moores University (UK) to provide quality, cost-effective British undergraduate and postgraduate degrees.',
      'YPC International College collaborates with Liverpool John Moores University (UK) to provide quality, cost-effective British undergraduate and postgraduate degrees.',
      'https://images.unsplash.com/photo-1562774053-701939374585?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80'
    );
  END IF;

  -- 40. Level 6: Universiti Antarabangsa MAIWP (UniMAIWP)
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%unimaiwp%' OR LOWER(name) LIKE '%maiwp%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'Universiti Antarabangsa MAIWP (UniMAIWP)',
      'Batu Caves, Selangor',
      v_country_id,
      'UniMAIWP (formerly UUCMS) is an Islamic and allied health sciences university offering nursing, pharmacy, Islamic finance, and contemporary digital studies.',
      'UniMAIWP (formerly UUCMS) is an Islamic and allied health sciences university offering nursing, pharmacy, Islamic finance, and contemporary digital studies.',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80'
    );
  END IF;

  -- 41. Level 6: Spectrum International University College (SIUC)
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%spectrum%' OR LOWER(name) LIKE '%siuc%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'Spectrum International University College (SIUC)',
      'Petaling Jaya, Selangor',
      v_country_id,
      'SIUC delivers cutting-edge programs in business administration, computing, technology, and multimedia design for regional and international learners.',
      'SIUC delivers cutting-edge programs in business administration, computing, technology, and multimedia design for regional and international learners.',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80'
    );
  END IF;

  -- 42. Level 6: Kuala Lumpur University of Science and Technology (KLUST)
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%klust%' OR LOWER(name) LIKE '%kuala lumpur university of science%') THEN
    INSERT INTO public.universities (name, city, country_id, description, about_text, logo_url, hero_image)
    VALUES (
      'Kuala Lumpur University of Science and Technology (KLUST)',
      'Kuala Lumpur',
      v_country_id,
      'KLUST is an innovative technology-driven institution preparing future engineers, data analysts, and science innovators for Industry 4.0.',
      'KLUST is an innovative technology-driven institution preparing future engineers, data analysts, and science innovators for Industry 4.0.',
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80'
    );
  END IF;

END $$;

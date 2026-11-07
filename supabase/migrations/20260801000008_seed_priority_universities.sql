-- ═══════════════════════════════════════════════════════════════════
-- Migration: 20260801000008_seed_priority_universities.sql
-- Description: Ensures the 7 top priority universities exist in public.universities
--              with standard Malaysian institution metadata and logos.
-- ═══════════════════════════════════════════════════════════════════

-- 1. Ensure country_id for Malaysia exists
DO $$
DECLARE
  v_country_id UUID;
BEGIN
  SELECT id INTO v_country_id FROM public.countries WHERE LOWER(name) = 'malaysia' LIMIT 1;
  IF v_country_id IS NULL THEN
    v_country_id := 'c0000000-0000-0000-0000-000000000001'::uuid;
  END IF;

  -- 1. INTI International University
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%inti%') THEN
    INSERT INTO public.universities (name, city, country_id, description, logo_url)
    VALUES (
      'INTI International University',
      'Nilai, Negeri Sembilan, Malaysia',
      v_country_id,
      'INTI International University is one of Malaysia''s leading higher education institutions, acclaimed for career-ready graduates, world-class international degree pathways, and cutting-edge industry partnerships.',
      'https://en.your-uni.com/assets/images/university/inti-university.webp'
    );
  END IF;

  -- 2. SEGi University
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%segi%') THEN
    INSERT INTO public.universities (name, city, country_id, description, logo_url)
    VALUES (
      'SEGi University',
      'Kota Damansara, Selangor, Malaysia',
      v_country_id,
      'SEGi University is a premier Malaysian higher education institution offering quality, industry-driven programmes in Health Sciences, Engineering, Business, Accounting, and Technology.',
      'https://en.your-uni.com/assets/images/university/segi-university.webp'
    );
  END IF;

  -- 3. Lincoln University College
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%lincoln%') THEN
    INSERT INTO public.universities (name, city, country_id, description, logo_url)
    VALUES (
      'Lincoln University College',
      'Petaling Jaya, Selangor, Malaysia',
      v_country_id,
      'Lincoln University College is a globally recognized institution in Malaysia offering world-standard medical, nursing, business, and pharmacy degrees with robust clinical and practical training.',
      'https://en.your-uni.com/assets/images/university/lincoln-university-college.png'
    );
  END IF;

  -- 4. London School of Business and Finance Malaysia (LSBF)
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%london school of business%' OR LOWER(name) LIKE '%lsbf%') THEN
    INSERT INTO public.universities (name, city, country_id, description, logo_url)
    VALUES (
      'London School of Business and Finance Malaysia (LSBF)',
      'Kuala Lumpur, Malaysia',
      v_country_id,
      'London School of Business and Finance (LSBF) Malaysia provides British-standard business, finance, accounting, and executive leadership qualifications right in the commercial heart of Kuala Lumpur.',
      'https://en.your-uni.com/assets/images/university/lsbf-malaysia.png'
    );
  END IF;

  -- 5. Universiti Tun Abdul Razak (UNIRAZAK)
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%unirazak%' OR LOWER(name) LIKE '%tun abdul razak%') THEN
    INSERT INTO public.universities (name, city, country_id, description, logo_url)
    VALUES (
      'Universiti Tun Abdul Razak (UNIRAZAK)',
      'Kuala Lumpur, Malaysia',
      v_country_id,
      'Universiti Tun Abdul Razak (UNIRAZAK) is Malaysia''s pioneering boutique university known for AACSB-accredited business programmes, leadership education, government studies, and exceptional graduate employability.',
      'https://en.your-uni.com/assets/images/university/unirazak-university.png'
    );
  END IF;

  -- 6. Universiti Kuala Lumpur (UniKL)
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%unikl%') THEN
    INSERT INTO public.universities (name, city, country_id, description, logo_url)
    VALUES (
      'Universiti Kuala Lumpur (UniKL)',
      'Kuala Lumpur, Malaysia',
      v_country_id,
      'Universiti Kuala Lumpur (UniKL) is Malaysia''s leading technical university with 12 campuses offering specialized high-tech engineering, aviation, maritime, chemical, and information technology programmes.',
      'https://en.your-uni.com/assets/images/university/unikl-university.webp'
    );
  END IF;

  -- 7. Asia e University (AeU)
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE LOWER(name) LIKE '%asia e%' OR LOWER(name) LIKE '%aeu%') THEN
    INSERT INTO public.universities (name, city, country_id, description, logo_url)
    VALUES (
      'Asia e University (AeU)',
      'Subang Jaya, Selangor, Malaysia',
      v_country_id,
      'Asia e University (AeU) is an international university established under the 34-nation Asia Cooperation Dialogue (ACD), offering flexible, accredited blended and on-campus bachelor''s, master''s, and PhD degrees.',
      'https://en.your-uni.com/assets/images/university/aeu-university.png'
    );
  END IF;

END $$;


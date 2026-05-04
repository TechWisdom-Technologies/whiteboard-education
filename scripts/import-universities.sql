-- ================================================================
-- Whiteboard Education: University & Course Data Import
-- Run this in the Supabase SQL Editor at:
-- https://supabase.com/dashboard/project/vvfxsavdmlpgwwumnpqb/sql
--
-- This script:
-- 1. Deletes existing courses and universities (preserving other data)
-- 2. Inserts 42 universities from en.your-uni.com
-- 3. Courses will be added in separate SQL files (too many for one file)
-- ================================================================

-- Step 1: Clear all tables that reference universities
DELETE FROM public.scholarships;
DELETE FROM public.courses;

-- Step 2: Clear existing universities
DELETE FROM public.universities;

-- Step 3: Insert 42 universities
INSERT INTO public.universities (name, city, country_id, description, about_text, ranking) VALUES
('Multimedia University Malaysia (MMU)', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'Multimedia University Malaysia (MMU) offers 76 programs for international students in Malaysia.', 'Multimedia University Malaysia (MMU) is a premier educational institution located in Selangor, Malaysia. The university offers 76 programs spanning Foundation, Diploma, Bachelor''s, Master''s, and PhD levels, serving a diverse community of international students from around the world.', 1),
('UCSI University Malaysia', 'Kuala Lumpur', 'c0000000-0000-0000-0000-000000000001', 'UCSI University Malaysia offers 128 programs for international students in Malaysia.', 'UCSI University Malaysia is a premier educational institution located in Kuala Lumpur, Malaysia. The university offers 128 programs spanning Foundation, Diploma, Bachelor''s, Master''s, and PhD levels.', 2),
('Taylor''s University Malaysia', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'Taylor''s University Malaysia offers 130 programs for international students in Malaysia.', 'Taylor''s University Malaysia is a premier educational institution located in Selangor, Malaysia. The university offers 130 programs spanning Foundation, Diploma, Bachelor''s, Master''s, and PhD levels.', 3),
('APU University Malaysia', 'Kuala Lumpur', 'c0000000-0000-0000-0000-000000000001', 'APU University Malaysia offers 112 programs for international students in Malaysia.', 'APU University Malaysia is a premier educational institution located in Kuala Lumpur, Malaysia. The university offers 112 programs spanning Foundation, Diploma, Bachelor''s, Master''s, and PhD levels.', 4),
('UNITEN University Malaysia', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'UNITEN University Malaysia offers 75 programs for international students in Malaysia.', 'UNITEN University Malaysia is a premier educational institution located in Selangor, Malaysia. The university offers 75 programs.', 5),
('City University Malaysia', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'City University Malaysia offers 83 programs for international students in Malaysia.', 'City University Malaysia is a premier educational institution located in Selangor, Malaysia.', 6),
('Cyberjaya University Malaysia (UoC)', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'Cyberjaya University Malaysia (UoC) offers 52 programs for international students in Malaysia.', 'Cyberjaya University Malaysia (UoC) is located in Selangor, Malaysia.', 7),
('MAHSA University Malaysia', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'MAHSA University Malaysia offers 85 programs for international students in Malaysia.', 'MAHSA University Malaysia is located in Selangor, Malaysia.', 8),
('UTP University Malaysia', 'Perak', 'c0000000-0000-0000-0000-000000000001', 'UTP University Malaysia offers 52 programs for international students in Malaysia.', 'UTP University Malaysia is located in Perak, Malaysia.', 9),
('SEGi University Malaysia', 'Kuala Lumpur', 'c0000000-0000-0000-0000-000000000001', 'SEGi University Malaysia offers 126 programs for international students in Malaysia.', 'SEGi University Malaysia is located in Kuala Lumpur, Malaysia.', 10),
('Limkokwing University Malaysia', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'Limkokwing University Malaysia offers 8 programs for international students in Malaysia.', 'Limkokwing University Malaysia is located in Selangor, Malaysia.', 11),
('Infrastructure University Kuala Lumpur (IUKL)', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'Infrastructure University Kuala Lumpur (IUKL) offers 67 programs for international students in Malaysia.', 'Infrastructure University Kuala Lumpur (IUKL) is located in Selangor, Malaysia.', 12),
('INTI International University Malaysia', 'Kuala Lumpur', 'c0000000-0000-0000-0000-000000000001', 'INTI International University Malaysia offers 138 programs for international students in Malaysia.', 'INTI International University Malaysia is located in Kuala Lumpur, Malaysia.', 13),
('UniKL University Malaysia', 'Kuala Lumpur', 'c0000000-0000-0000-0000-000000000001', 'UniKL University Malaysia offers 164 programs for international students in Malaysia.', 'UniKL University Malaysia is located in Kuala Lumpur, Malaysia.', 14),
('HELP University Malaysia', 'Kuala Lumpur', 'c0000000-0000-0000-0000-000000000001', 'HELP University Malaysia offers 105 programs for international students in Malaysia.', 'HELP University Malaysia is located in Kuala Lumpur, Malaysia.', 15),
('Tunku Abdul Rahman University (UTAR)', 'Perak', 'c0000000-0000-0000-0000-000000000001', 'Tunku Abdul Rahman University (UTAR) offers 136 programs for international students in Malaysia.', 'Tunku Abdul Rahman University (UTAR) is located in Perak, Malaysia.', 16),
('Nottingham University Malaysia', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'Nottingham University Malaysia offers 94 programs for international students in Malaysia.', 'Nottingham University Malaysia is located in Selangor, Malaysia.', 17),
('MONASH University Malaysia', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'MONASH University Malaysia offers 120 programs for international students in Malaysia.', 'MONASH University Malaysia is located in Selangor, Malaysia.', 18),
('International University of Malaya-Wales (IUMW)', 'Kuala Lumpur', 'c0000000-0000-0000-0000-000000000001', 'International University of Malaya-Wales (IUMW) offers 24 programs for international students in Malaysia.', 'International University of Malaya-Wales (IUMW) is located in Kuala Lumpur, Malaysia.', 19),
('UTM University Malaysia', 'Johor', 'c0000000-0000-0000-0000-000000000001', 'UTM University Malaysia offers 254 programs for international students in Malaysia.', 'UTM University Malaysia is located in Johor, Malaysia.', 20),
('UTeM University Malaysia', 'Malacca', 'c0000000-0000-0000-0000-000000000001', 'UTeM University Malaysia offers 66 programs for international students in Malaysia.', 'UTeM University Malaysia is located in Malacca, Malaysia.', 21),
('Lincoln University College', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'Lincoln University College offers 173 programs for international students in Malaysia.', 'Lincoln University College is located in Selangor, Malaysia.', 22),
('University Malaysia of Computer Science & Engineering (UNIMY)', 'Kuala Lumpur', 'c0000000-0000-0000-0000-000000000001', 'University Malaysia of Computer Science & Engineering (UNIMY) offers 16 programs for international students.', 'University Malaysia of Computer Science & Engineering (UNIMY) is located in Kuala Lumpur, Malaysia.', 23),
('Sunway University', 'Kuala Lumpur', 'c0000000-0000-0000-0000-000000000001', 'Sunway University offers 123 programs for international students in Malaysia.', 'Sunway University is located in Kuala Lumpur, Malaysia.', 24),
('Management and Science University (MSU)', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'Management and Science University (MSU) offers 168 programs for international students in Malaysia.', 'Management and Science University (MSU) is located in Selangor, Malaysia.', 25),
('Swinburne University of Technology Sarawak', 'Sarawak', 'c0000000-0000-0000-0000-000000000001', 'Swinburne University of Technology Sarawak offers 76 programs for international students in Malaysia.', 'Swinburne University of Technology Sarawak is located in Sarawak, Malaysia.', 26),
('UTM SPACE University Malaysia', 'Johor', 'c0000000-0000-0000-0000-000000000001', 'UTM SPACE University Malaysia offers 35 programs for international students in Malaysia.', 'UTM SPACE University Malaysia is located in Johor, Malaysia.', 27),
('Heriot-Watt University Malaysia Campus', 'Putrajaya', 'c0000000-0000-0000-0000-000000000001', 'Heriot-Watt University Malaysia Campus offers 58 programs for international students in Malaysia.', 'Heriot-Watt University Malaysia Campus is located in Putrajaya, Malaysia.', 28),
('University of Southampton Malaysia', 'Johor', 'c0000000-0000-0000-0000-000000000001', 'University of Southampton Malaysia offers 18 programs for international students in Malaysia.', 'University of Southampton Malaysia is located in Johor, Malaysia.', 29),
('Curtin University Malaysia', 'Sarawak', 'c0000000-0000-0000-0000-000000000001', 'Curtin University Malaysia offers 36 programs for international students in Malaysia.', 'Curtin University Malaysia is located in Sarawak, Malaysia.', 30),
('Swinburne University of Technology Sarawak Campus', 'Sarawak', 'c0000000-0000-0000-0000-000000000001', 'Swinburne University of Technology Sarawak Campus offers 53 programs for international students.', 'Swinburne University of Technology Sarawak Campus is located in Sarawak, Malaysia.', 31),
('Xiamen University Malaysia Campus', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'Xiamen University Malaysia Campus offers 37 programs for international students in Malaysia.', 'Xiamen University Malaysia Campus is located in Selangor, Malaysia.', 32),
('International Medical University (IMU)', 'Kuala Lumpur', 'c0000000-0000-0000-0000-000000000001', 'International Medical University (IMU) offers 26 programs for international students in Malaysia.', 'International Medical University (IMU) is located in Kuala Lumpur, Malaysia.', 33),
('Universiti Geomatika Malaysia', 'Kuala Lumpur', 'c0000000-0000-0000-0000-000000000001', 'Universiti Geomatika Malaysia offers 30 programs for international students in Malaysia.', 'Universiti Geomatika Malaysia is located in Kuala Lumpur, Malaysia.', 34),
('NILAI University', 'Negeri Sembilan', 'c0000000-0000-0000-0000-000000000001', 'NILAI University offers 47 programs for international students in Malaysia.', 'NILAI University is located in Negeri Sembilan, Malaysia.', 35),
('University of Wollongong (UOW) Malaysia', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'University of Wollongong (UOW) Malaysia offers 89 programs for international students in Malaysia.', 'University of Wollongong (UOW) Malaysia is located in Selangor, Malaysia.', 36),
('Newcastle University Medicine Malaysia (NUMed)', 'Johor', 'c0000000-0000-0000-0000-000000000001', 'Newcastle University Medicine Malaysia (NUMed) offers 3 programs for international students.', 'Newcastle University Medicine Malaysia (NUMed) is located in Johor, Malaysia.', 37),
('Universiti Malaya (UM)', 'Kuala Lumpur', 'c0000000-0000-0000-0000-000000000001', 'Universiti Malaya (UM) offers 68 programs for international students in Malaysia.', 'Universiti Malaya (UM) is Malaysia''s oldest and highest-ranked university, located in Kuala Lumpur.', 38),
('Kings University College Malaysia', 'Kuala Lumpur', 'c0000000-0000-0000-0000-000000000001', 'Kings University College Malaysia offers 22 programs for international students in Malaysia.', 'Kings University College Malaysia is located in Kuala Lumpur, Malaysia.', 39),
('Binary University', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'Binary University offers 40 programs for international students in Malaysia.', 'Binary University is located in Selangor, Malaysia.', 40),
('Tunku Abdul Rahman University of Management and Technology (TAR UMT)', 'Kuala Lumpur', 'c0000000-0000-0000-0000-000000000001', 'Tunku Abdul Rahman University of Management and Technology (TAR UMT) offers 147 programs.', 'Tunku Abdul Rahman University of Management and Technology (TAR UMT) is located in Kuala Lumpur, Malaysia.', 41),
('Universiti Putra Malaysia (UPM)', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'Universiti Putra Malaysia (UPM) offers 748 programs for international students in Malaysia.', 'Universiti Putra Malaysia (UPM) is a leading research university in Selangor, Malaysia.', 42);

-- Verify
SELECT name, city, ranking FROM public.universities ORDER BY ranking;

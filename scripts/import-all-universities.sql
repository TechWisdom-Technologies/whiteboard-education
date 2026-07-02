-- ================================================================
-- Whiteboard Education: Universities Import
-- ================================================================

DELETE FROM public.scholarships;
DELETE FROM public.accommodations;
DELETE FROM public.courses;
DELETE FROM public.universities;

INSERT INTO public.universities (name, city, country_id, logo_url, description, about_text, ranking, established, total_students, international_ratio, campus_size, study_reasons, faqs, registration_steps) VALUES
  ('Multimedia University Malaysia (MMU)', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/mmu-university.webp?v=1690773144', 'MMU University Malaysia - know more about Multimedia University Tuition fees for International students, intakes & courses || Discount', 'As the first private university approved by the Malaysian government, MMU adheres to the strictest requirements for high-quality degrees. A study conducted by Gartner and MSC Malaysia found that MMU is one of the top five universities where major ICT participants prefer graduate employment, which proves the quality of our academicians, courses, student development plans, and our good reputation in the industry. From the moment of conceptualization, MMU intends to encapsulate the best practices of the best universities in the world. The university recognizes the accelerated development of the globalization of education and has regarded the global partnership focusing on student mobility as an internationally visible entity.





























                        
                            See More  
                        
                        
                            See Less', 351, 1990, 5000, 10, '10 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('UCSI University Malaysia', 'Kuala Lumpur', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/ucsi-university.webp', 'Ucsi University Malaysia Best Private University Tuition Fees for International, intakes & Degree Programme || Register Now', 'The university’s academic staff are at the forefront of their disciplines, and their views on major issues are highly sought after. From business to political science. Many of our scholars have extensive experience working overseas and act as advisors in public institutions and various committees. By bringing their experience into the classroom, our scholars cater to an exciting learning environment, and learners will strike a balance between academic proficiency and industrial applications, and thus thrive.






















                        
                            See More  
                        
                        
                            See Less', 501, 1991, 5300, 13, '15 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('Taylor''s University Malaysia', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/taylor-university-malaysia.webp?v=1717418396', 'Taylor''s University Malaysia - Tuition Fees, intakes & Degree Programme For International Students || Register Now', 'According to the latest QS World University Rankings, Taylors University is recognized as the top private university in Malaysia and Southeast Asia, thus achieving a new milestone. The university was also awarded the QS 5-star online learning achievement award. The university is currently ranked 135th and 379th globally, making us one of the top flying universities in the world. These achievements not only demonstrate the university’s commitment to providing quality education to students, but also recognize the strength and support of the community, from dedicated lecturers, researchers and industry partners to the trust of students and their parents.












 



                        
                            See More  
                        
                        
                            See Less', 502, 1992, 5600, 16, '20 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('APU University Malaysia', 'Kuala Lumpur', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/apu-university.webp', 'APU University Malaysia Asia Pacific University Tuition Fees for International, intakes & Degree Programme || Register Now', '', 503, 1993, 5900, 19, '25 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('UNITEN University Malaysia', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/uniten-university.webp', 'UNITEN University Malaysia Best electrical University Tuition fees for International, intakes & Degree Programme || Register Now', 'In all respects, our communities are different, and in the center of the education center is a playground of opportunity. The UNITEN campus is located in the corridor of Putrajaya, Pahang, and the breezy Bandar Muadzam Shah. It is the best city for some students in Malaysia. Our lakeside campus is full of bold talent, national athletes, and large shopping malls, almost anything is possible.                        
                            See More  
                        
                        
                            See Less', 504, 1994, 6200, 22, '30 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('City University Malaysia', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/city-university.webp', 'City University Malaysia know more about City University Tuition fees, intakes & Degree Programme || Up to 50% Discount Register Now', 'We are delighted that you have selected Malaysia City University as your preferred university! We are confident that you have made the right decision. We recognize that moving abroad to study can be an exhilarating experience, but it can also be daunting. To assist you, we have put together a useful guide to aid you in your preparation for the initial days of your relocation to Malaysia and City University.                        
                            See More  
                        
                        
                            See Less', 505, 1995, 6500, 25, '35 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('Cyberjaya University Malaysia (UoC)', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/cyberjaya-university.png', 'Cyberjaya University Malaysia Best Medical University UoC Tuition fees, intakes & Degree Programme || Up to 50% Discount Register Now', 'At Cyberjaya University, we are dedicated to ensuring a bright future for our students through our commitment to providing quality education. Our approach to teaching involves active participation and group learning, including problem-based classes that promote teamwork and leadership skills. We prioritize a comprehensive learning experience that involves regular feedback from instructors, peers, and self-reflection. Our university also partners with various student clubs and societies to offer a rich and diverse university experience. One of our most unique collaborations is with Malaysian MERCY, which allows our students to participate in volunteer relief operations and gain invaluable firsthand experience. This sets Cyberjaya University apart from other Malaysian universities.                        
                            See More  
                        
                        
                            See Less', 506, 1996, 6800, 28, '40 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('MAHSA University Malaysia', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/mahsa-university.webp', 'MAHSA University Malaysia MAHSA Tuition fees for International, intakes & Degree Programme || Apply Now', 'MAHSA''s core principle is to prioritize education beyond traditional classroom learning and focus on equipping their graduates with professional skills to succeed in any field. This commitment to success is reflected in their PRIDE (Professional, Industry-Ready Education) program and the MAHSA Master Class Series. As an online university recognized by the Ministry of Education, MAHSA offers interactive and innovative teaching through ELEVATE, extending education beyond physical boundaries and making it accessible to anyone with dreams, goals, and aspirations. Their Open & Distance Learning plans aim to revolutionize academic learning and create a world of limitless opportunities.






                        
                            See More  
                        
                        
                            See Less', 507, 1997, 7100, 31, '45 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('UTP University Malaysia', 'Perak', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/utp-university.webp', 'UTP Universiti Teknologi PETRONAS Malaysia Tuition fees for International, intakes & Degree Programme || Apply Now', 'The leadership team at UTP expertly implements strategies to maintain top-notch academic achievements and cutting-edge research innovation. The team comprises dedicated and experienced industry experts who skillfully manage policies and practices that significantly impact UTP''s ongoing operations. It''s worth mentioning that UTP has garnered recognition from numerous countries and international organizations, an impressive feat for an institution that has only been around for 23 years.
                        
                            See More  
                        
                        
                            See Less', 508, 1998, 7400, 34, '50 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('SEGi University Malaysia', 'Kuala Lumpur', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/segi-university.webp', 'SEGI University Malaysia Tuition fees for International, intakes & Degree Programme || Register Now Get UK certificate from Malaysia', 'At SEGi University Malaysia, we firmly believe in offering a top-notch education to help aspiring individuals and geniuses reach their full potential. Whether you aspire to redefine excellence in your field or pursue your passion, we are here to support you every step of the way. With mutual trust and high expectations for every SEGian, we provide a comprehensive learning experience that unlocks promising talents and helps you discover new ways to change lives. SEGi University is absolutely committed to ensuring that our students achieve growth and success. We are guided unwaveringly by the principles of quality, enthusiasm, vitality, and care. These values form the bedrock of our dedication to helping you achieve your goals.                        
                            See More  
                        
                        
                            See Less', 509, 1999, 7700, 12, '55 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('Limkokwing University Malaysia', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/limkokwing-university.webp', 'Limkokwing University Malaysia know more about Limkokwing Tuition fees, intakes & Degree Programme || Register Now...', 'Back in 2018, the Limkokwing Creativity and Innovation Foundation embarked on a monumental mission to positively impact the lives of 100 million individuals. The objective was straightforward yet ambitious: to enable at least 100 million young people from underprivileged societies and marginalized communities to pursue their desired university degree. To achieve this, we are offering full scholarships to deserving young men and women who apply to Limkokwing University for a top-notch education. Additionally, Limkokwing Malaysia extends a 30% discount to international students.






















 






                        
                            See More  
                        
                        
                            See Less', 510, 2000, 8000, 15, '60 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('Infrastructure University Kuala Lumpur (IUKL)', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/iukl-university.webp', 'IUKL University Malaysia know more about IUKL Tuition fees, intakes & Degree Programme for International students || Register Now', 'At IUKL University, our mission is to foster a dynamic learning environment that encourages creativity and exploration. Our aim is to inspire our students to develop innovative ideas and inventions that benefit both themselves and society. To achieve this, we recognize the importance of bridging the gap between academic research and industrial needs. That''s why we have established the Research Management Center (RMC) to oversee and enhance all our R&D activities. The RMC works to facilitate intellectual property services in academia, which includes research, development, commercialization and intellectual property protection. Our research covers both basic and applied research in various fields such as science, technology and social sciences.                        
                            See More  
                        
                        
                            See Less', 511, 2001, 8300, 18, '65 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('INTI International University Malaysia', 'Kuala Lumpur', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/inti-university.webp', 'INTI University Malaysia know more about INTI Tuition fees, intakes & Degree Programme for International students || Register Now', 'Studying at INTI University Malaysia provides you with opportunities to develop and enhance your academic and personal development. More and more graduates join the workforce every year. For many graduates, there is only one decisive way to stand out and get the job you want: to demonstrate outstanding 21st-century skills and gain work experience even before you graduate. From our hands-on learning experience to our partnerships with industry leaders such as LinkedIn, Google My Business, Microsoft, and IBM, our programs can indeed improve your employability.
























 






                        
                            See More  
                        
                        
                            See Less', 512, 2002, 8600, 21, '70 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('UniKL University Malaysia', 'Kuala Lumpur', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/unikl-university.webp', 'Unikl University Malaysia University of kuala lumpur (Unikl) Tuition fees for International, intakes & Degree Programme || Register Now', 'UniKL is a world-class university that strives for excellence in various areas such as talent management, funding, autonomy, governance, and research. It has a dedicated team of researchers who contribute to the advancement of knowledge and technology transfer. UniKL''s unique advantages and ambitious goals ensure its competitiveness and relevance in the academic world.


















 






                        
                            See More  
                        
                        
                            See Less', 513, 2003, 8900, 24, '75 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('HELP University Malaysia', 'Kuala Lumpur', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/help-university.png', 'Help University Malaysia Tuition fees, intakes & Degree Programme for International Students || Register Now', 'The mission of HELP University Malaysia is to assist individuals in leading successful and meaningful lives through education. Our vision is to establish a university with a strong culture of quality and leadership, prioritizing academic excellence, continual improvement, and fostering the development of our students and staff. We strive to offer learning experiences that enhance career development, personal achievements, and lifelong value. Our aim is to conduct targeted research in our areas of expertise, while sharing our successes with the communities and stakeholders we serve.
























 






                        
                            See More  
                        
                        
                            See Less', 514, 2004, 9200, 27, '80 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('Tunku Abdul Rahman University (UTAR)', 'Perak', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/utar-university.webp', 'UTAR University Malaysia Universiti Tunku Abdul Rahman Tuition fees, intakes & Degree Programme || Register Now', 'UTAR University has been holding graduations since 2005. Since then, over 67,000 students have graduated from the university. UTAR is dedicated to achieving excellence in teaching and research and has made impressive progress towards establishing a comprehensive university. The university offers over 110 academic courses, ranging from basic research to bachelor’s, master’s, and doctoral degrees. The degrees offered include accounting, business and economics, actuarial sciences, mathematics and process management, agriculture and food sciences, arts, social sciences, and education, creative industries and design, engineering and built environment, information and communication technology, life and physical sciences, and medicine and health sciences.
























 






                        
                            See More  
                        
                        
                            See Less', 515, 2005, 9500, 30, '85 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('Nottingham University Malaysia', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/nottingham-university.webp', 'Nottingham University Malaysia British University in Malaysia - Tuition fees, intakes & Degree Programme || Register Now', 'The University of Nottingham is proud of its unique international curriculum, which we believe can truly improve the learning experience of students. The Malaysian campus plays a special role in Nottingham’s global perspective. More and more of our students participate in our inter-school exchange program and offer a series of exciting summer school courses, all of which are international; whether through language learning or courses focused on Asian travel, business or culture. The Malaysian campus also plays a leading role in the development, strategy and implementation of international courses, because the international working group is led by Professor Weng Fengxin, the Deputy Provost of Academic Affairs.
























 






                        
                            See More  
                        
                        
                            See Less', 516, 2006, 9800, 33, '10 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('MONASH University Malaysia', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/monash-university.webp', 'Monash University Malaysia Australian University in Malaysia - Tuition fees, intakes & Degree Programme || Register Now', 'As a university with global connections, Monash University has more than 100 partner universities worldwide and campuses in Australia, Asia and Europe on four continents. Students can take advantage of the international transportation plan in the course. Monash University in Malaysia has established strong ties with industry and government, and has become a platform for research and educational exchanges with Southeast Asia and other regions. From working with industry partners to develop safer medical equipment to working with Sunway Medical Center to provide students with internship opportunities, we are at the forefront of research and education, seeking realistic solutions to address national and international priorities.
























 






                        
                            See More  
                        
                        
                            See Less', 100, 2007, 10100, 11, '15 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('International University of Malaya-Wales (IUMW)', 'Kuala Lumpur', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/iumw-university.webp', 'IUMW University Malaysia International University of Malaya-Wales - Tuition fees, intakes & Degree Programme || Register Now', 'IUMW and our partner university, Trinity St. David’s University (UWTSD) in Wales, UK, provide a dual award program. After graduation, students will be certified by IUMW and UWTSD. The dual award scheme is approved by the Malaysian Qualifications Authority (MQA) and the Higher Education Quality Assurance Agency (QAA), which is the institution that checks the standards and quality of higher education in the UK. Since the courses are organized, monitored, and evaluated by two different institutions, the intensity and quality of the awards for students can be ensured.







 

                        
                            See More  
                        
                        
                            See Less', 518, 2008, 10400, 14, '20 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('UTM University Malaysia', 'Johor', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/utm-university.webp', 'UTM University Malaysia is Ranked 187 worldwide know more about UTM Tuition fees, intakes & Degree Programme || Register Now', 'UTM is committed to providing outstanding academic, research, and promotion programs that will enrich your life and equip students with the skills they need to overcome challenges and seize opportunities in today''s interconnected world. We take great pride in welcoming you to our world-famous university and breathtaking campus and supporting your growth.

































 






                        
                            See More  
                        
                        
                            See Less', 519, 2009, 10700, 17, '25 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('UTeM University Malaysia', 'Malacca', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/utem-university.webp', 'UTeM University Malaysia know more about Universiti Teknikal Malaysia Melaka Tuition fees, intakes & Degree Programme || Register Now', 'The University of Technology Malacca (UTeM) in Malaysia has been operating for 19 years and has received numerous accolades and recognition for its achievements. These accomplishments are the result of strategic planning and vision developed by the university''s former leaders. Throughout the years, UTeM has undergone transitions of one principal and three respected principals, with each change marked by a significant leap forward. The transfer of leadership from YBhg Professor Datuk Ts to the current President, Dr. Shahrin bin Sahib, presented significant challenges that required a great deal of resilience and determination to ensure that the university''s vision, mission, and culture of excellence continued to thrive and develop, with the ultimate goal of becoming one of the world''s premier technical universities.
























 






                        
                            See More  
                        
                        
                            See Less', 520, 2010, 11000, 20, '30 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('Lincoln University College', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/m1.webp?v=1697769838', 'Lincoln University College know more about Lincoln University Kuala Lumpur Tuition fees, intakes & Degree Programme || Register Now', '', 521, 2011, 11300, 23, '35 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('University Malaysia of Computer Science & Engineering (UNIMY)', 'Kuala Lumpur', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/university-malaysia-of-computer-science-and-engineering-unimy.webp?v=1697880150', 'University Malaysia of Computer Science & Engineering (UNIMY) know more about UNIMY University Kuala Lumpur Tuition fees, intakes & Degree Programme || Register Now', '', 522, 2012, 11600, 26, '40 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('Sunway University', 'Kuala Lumpur', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/sunway-university.webp?v=1697960431', 'Sunway University know more about Sunway University Kuala Lumpur Tuition fees, intakes & Degree Programme || Register Now', '', 523, 2013, 11900, 29, '45 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('Management and Science University (MSU)', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/msu-university.webp', 'MSU University Malaysia - know more about Management and Science University Tuition fees for International students, intakes & courses || Discount', '', 524, 2014, 12200, 32, '50 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('Swinburne University of Technology Sarawak', 'Sarawak', 'c0000000-0000-0000-0000-000000000001', '', '', '', 525, 2015, 12500, 10, '55 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('UTM SPACE University Malaysia', 'Johor', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/utm-space-university-malaysia.webp?v=1700533292', 'UTM University Malaysia is Ranked 187 worldwide know more about UTM SPACE Tuition fees, intakes & Degree Programme || Register Now', '', 526, 2016, 12800, 13, '60 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('Heriot-Watt University Malaysia Campus', 'Putrajaya', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/heriot-watt-university-malaysia-campus.webp', 'HWU University Malaysia Campus - know more about Heriot-Watt University Malaysia Campus Tuition fees for International students, intakes & courses || Discount', 'Programs and Curriculum
Heriot-Watt University Malaysia offers a diverse range of undergraduate and postgraduate programs across various disciplines, including Engineering, Business, Finance, Construction, Project Management, and Psychology. These programs are carefully designed to mirror the academic rigor of its Scottish counterpart, ensuring that students receive the same quality of education, irrespective of their geographical location.
One of the key features of HWUM is its global student exchange program, which allows students the opportunity to spend time studying at the university''s campuses in Edinburgh, Dubai, or other partner institutions worldwide. This global mobility program not only enhances the student learning experience but also fosters a sense of global citizenship and cultural awareness.
Campus and Facilities
The Heriot-Watt University Malaysia campus is a masterpiece of modern architecture, equipped with state-of-the-art facilities to support both teaching and learning. From cutting-edge laboratories and workshops for engineering and science students to a digital library with a vast collection of resources, HWUM is designed to cater to the needs of its diverse student body.
Sustainability is at the core of HWUM''s operations, with the campus itself being a testament to green building practices. The eco-friendly design minimizes energy consumption and promotes a healthier environment for students and staff alike.
Community and Industry Engagement
Understanding the importance of real-world experience, Heriot-Watt University Malaysia places a strong emphasis on industry engagement. Through partnerships with leading companies and organizations, students have the opportunity to engage in internships, collaborative projects, and networking events, providing them with invaluable insights into their future careers.
Moreover, HWUM is deeply committed to community service and outreach programs, encouraging students to contribute positively to society. This holistic approach to education ensures that Heriot-Watt graduates are not only skilled professionals but also responsible global citizens.                        
                            See More  
                        
                        
                            See Less', 527, 2017, 13100, 16, '65 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('University of Southampton Malaysia', 'Johor', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/university-of-southampton.webp', 'UoSM University Malaysia - know more about University of Southampton Tuition fees for International students, intakes & courses || Discount', 'Programs and Curriculum
The University of Southampton Malaysia (UoSM) offers a wide array of undergraduate and postgraduate programs spanning various fields such as Engineering, Computer Science, Business, Finance, and Environmental Sciences. These programs are meticulously crafted to uphold the academic excellence synonymous with its UK counterpart, guaranteeing that students benefit from the same high standards of education, regardless of their location.
A standout feature of UoSM is its transnational education model, which provides students with the opportunity to start their studies in Malaysia and complete them at the University of Southampton in the UK, or vice versa. This unique approach not only enriches the academic journey but also cultivates global perspective and cultural adaptability among students.
Campus and Facilities
The University of Southampton Malaysia campus is a modern architectural marvel, boasting top-tier facilities that facilitate both academic and extracurricular activities. The campus is outfitted with advanced laboratories, design studios, and a comprehensive digital library, ensuring students have access to the resources they need to excel.
Sustainability is a key consideration in the campus''s design and operations, reflecting the university''s commitment to environmental responsibility. The eco-conscious infrastructure is designed to reduce energy usage and create a sustainable learning environment for the university community.
Community and Industry Engagement
At UoSM, there is a strong focus on integrating real-world experiences into the academic curriculum through industry collaboration. The university has established partnerships with prominent businesses and organizations, enabling students to gain hands-on experience through internships, cooperative projects, and professional networking events. This practical exposure is invaluable for equipping students with the skills and knowledge needed for their future careers.
Additionally, UoSM encourages students to engage in community service and outreach initiatives, underscoring the importance of social responsibility. This comprehensive approach to education ensures that graduates from the University of Southampton Malaysia are not only highly competent in their fields but also mindful of their impact on society and the world at large.                        
                            See More  
                        
                        
                            See Less', 528, 2018, 13400, 19, '70 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('Curtin University Malaysia', 'Sarawak', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/curtin-university-malaysia.webp', 'Curtin University - know more about Curtin University Malaysia Tuition fees for International students, intakes & courses || Discount', 'Programs and Curriculum
Curtin University Malaysia offers a broad spectrum of undergraduate and postgraduate programs across a variety of disciplines, including Engineering, Business, Finance, Media, and Environmental Science. These programs are rigorously structured to reflect the academic integrity and quality of Curtin''s main campus in Australia, ensuring students receive an internationally recognized education regardless of their location.
A hallmark of the Curtin Malaysia experience is its emphasis on global education and mobility. The university facilitates student exchange programs, allowing participants to spend semesters at Curtin''s campuses in Perth, Dubai, Singapore, or at other partner institutions globally. This initiative not only broadens the educational horizon for students but also nurtures global awareness and cultural understanding.
Campus and Facilities
The Curtin University Malaysia campus is a blend of contemporary design and state-of-the-art infrastructure, created to enhance both learning and research. Equipped with modern laboratories, creative studios, and an extensive digital library, the campus adequately serves the academic and extracurricular demands of its diverse student population.
Sustainability forms the foundation of the campus''s ethos, with eco-friendly practices integrated into its architecture and daily operations. The green campus initiative aims to reduce carbon footprints, ensuring a sustainable and conducive environment for education and research.
Community and Industry Engagement
Recognizing the significance of practical experience in today''s competitive job market, Curtin University Malaysia places a strong emphasis on industry linkages. The university collaborates closely with leading corporations and organizations to offer students internships, project-based learning, and networking opportunities, thereby bridging the gap between theoretical knowledge and practical application.
Furthermore, Curtin Malaysia is committed to social responsibility and community service, encouraging students to take part in outreach activities. This approach not only enhances the students'' learning experience but also instills a sense of civic duty and social awareness, producing graduates who are competent professionals and conscientious members of the global community.                        
                            See More  
                        
                        
                            See Less', 529, 2019, 13700, 22, '75 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('Swinburne University of Technology Sarawak Campus', 'Sarawak', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/swinburne-university-of-technology-malaysia.webp', 'Swinburne University of Technology Sarawak Campus Malaysia - know more about Swinburne University of Technology of TechnologyTuition fees for International students, intake & courses || Discount', 'According to the latest QS World University Rankings, Swinburne University of Technology Sarawak Campus is celebrated as a leading private university in Malaysia and Southeast Asia, marking a significant achievement. The university has been acknowledged with the QS 5-star online learning achievement award, showcasing its excellence in adapting to innovative educational delivery methods. Currently ranked impressively in the global context, the Sarawak campus stands out as a premier institution for higher education. These distinctions not only underscore the university''s dedication to offering superior education to its students but also highlight the robust support and collaboration among committed faculty, researchers, and industry collaborators, and the confidence placed by students and their families.                        
                            See More  
                        
                        
                            See Less', 530, 1990, 14000, 25, '80 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('Xiamen University Malaysia Campus', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/xiamen-university-malaysia-campus.webp', 'Xiamen University - know more about Xiamen University Malaysia Campus Tuition fees for International students, intakes & courses || Discount', 'Xiamen University Malaysia Campus offers a wide array of study opportunities for international students at both undergraduate and postgraduate levels, as well as for prospective high school students interested in acquainting themselves with the Malaysian higher education system. Throughout the years, students from diverse countries including Japan, India, South Korea, Kyrgyzstan, Uzbekistan, Russia, Bahrain, Kazakhstan, the Netherlands, France, Germany, the UAE, and many others have participated in our international study program. Studying abroad is often regarded as one of the most enriching experiences for students. By choosing to study abroad at Xiamen University Malaysia Campus, students will seize the chance to pursue their education in Malaysia, immersing themselves in the experiences and cultures of students from across the globe on our vibrant Sepang campus.                        
                            See More  
                        
                        
                            See Less', 531, 1991, 14300, 28, '85 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('International Medical University (IMU)', 'Kuala Lumpur', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/international-medical-university.webp', 'IMU University Malaysia - know more about International Medical University Tuition fees for International students, Intakes & Courses || Discount', 'According to the latest QS World University Rankings, International Medical University (IMU) is celebrated as a leading private healthcare education institution in Malaysia and Southeast Asia, marking an important milestone. The university has also been honored with the QS 5-star rating for online learning, showcasing its commitment to excellence in digital education. Currently positioned within prestigious global rankings, IMU stands out as a forefront institution in healthcare education on the international stage. These accomplishments not only reflect the university''s dedication to delivering superior healthcare education but also highlight the robust support system comprising devoted faculty, researchers, industry collaborators, and the confidence placed by students and their families.                        
                            See More  
                        
                        
                            See Less', 532, 1992, 14600, 31, '10 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('Universiti Geomatika Malaysia', 'Kuala Lumpur', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/universiti-geomatika-malaysia.webp', 'Universiti Geomatika Malaysia - know more about Universiti Geomatika Tuition fees for International students, intakes & courses || Discount', 'Universiti Geomatika Malaysia is celebrated for its exceptional achievements in the field of geospatial sciences and technology, marking itself as a leading institution in Malaysia and Southeast Asia for geomatics education. The university has been honored with accolades for its innovative approaches to teaching and learning, including advancements in online education. Although not yet featured in the QS World University Rankings like some of its counterparts, Universiti Geomatika Malaysia is on a steadfast path towards global recognition, demonstrating a strong commitment to providing high-quality education and training in geospatial sciences. These efforts are supported by a dedicated team of lecturers, researchers, and industry partners, all contributing to a robust educational environment that fosters trust and confidence among students and their families. Universiti Geomatika Malaysia''s commitment to excellence in geomatics and geospatial education is evident in its growing reputation as a hub for academic and professional development in this vital and expanding field.                        
                            See More  
                        
                        
                            See Less', 533, 1993, 14900, 34, '15 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('NILAI University', 'Negeri Sembilan', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/nilai-university.webp', 'NILAI University Malaysia - know more about NILAI University Tuition fees for International students, intakes & courses || Discount', 'NILAI University, while on its journey of academic and educational growth, has made significant strides in becoming a notable center for higher education in Malaysia. Although it may not currently hold a position in the QS World University Rankings akin to Taylor''s University, NILAI University prides itself on its comprehensive approach to quality education, especially in fields such as engineering, business, hospitality, and health sciences. The university''s commitment to excellence is evident through its various accreditations and its endeavor to equip students with industry-relevant skills. Supported by a dedicated faculty, innovative research opportunities, and strong industry linkages, NILAI University fosters an educational environment that values the trust and confidence of its students and their families. By focusing on practical knowledge and employability skills, NILAI University is dedicated to shaping well-rounded graduates ready to meet the challenges of the global workforce.                        
                            See More  
                        
                        
                            See Less', 534, 1994, 15200, 12, '20 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('University of Wollongong (UOW) Malaysia', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/university-of-wollongong-uow.png', 'University of Wollongong (UOW) Malaysia - Tuition Fees, intakes & Degree Courses For International Students || Register Now', 'UOW Malaysia stands as a premier global education provider, committed to delivering transformative student experiences in Malaysia and beyond. The university collaborates with local and international communities to offer high-quality teaching, learning, and research, aiming to nurture global leaders with an international perspective. Guided by core values such as integrity, courage, collaboration, passion, excellence, and innovation, UOW Malaysia fosters an environment where both students and staff can thrive. The Teaching & Learning Centre (TLC) plays a crucial role in this mission, promoting critical and independent learning while engaging with the broader community. With a strong focus on continuous improvement through its quality framework, which includes regular performance evaluations and stakeholder feedback, UOW Malaysia ensures that students receive a top-notch education that prepares them for future success. Choosing to study at UOW Malaysia means being part of a vibrant and innovative academic community dedicated to excellence.                        
                            See More  
                        
                        
                            See Less', 535, 1995, 15500, 15, '25 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('Newcastle University Medicine Malaysia (NUMed)', 'Johor', 'c0000000-0000-0000-0000-000000000001', '', '', '', 536, 1996, 15800, 18, '30 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('Universiti Malaya (UM)', 'Kuala Lumpur', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/universiti-malaya-um.png', 'Universiti Malaya (UM) - Tuition Fees, intakes & Degree Courses For International Students || Register Now', 'Studying at Universiti Malaya (UM) offers an unparalleled academic experience at Malaysia''s first public university, renowned for its rich history and numerous accolades. As a consistently rising institution in global university rankings, UM is recognized worldwide as one of the top universities. The university provides over 200 globally accredited programs across diverse fields, from Arts to Sciences and Humanities. With more than 600 international collaborative partners, UM facilitates prestigious opportunities for students through various Student Mobility Programs. Additionally, with a vast alumni network exceeding 400,000 individuals, UM has made a significant impact on both local and global communities. The university is equipped with extensive learning and research facilities, ensuring a comprehensive learning environment supported by robust student services. By choosing to study at UM, you are joining a vibrant academic community dedicated to excellence and innovation.                        
                            See More  
                        
                        
                            See Less', 537, 1997, 16100, 21, '35 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('Kings University College Malaysia', 'Kuala Lumpur', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/kings-university-college.png', 'Kings University College - Tuition Fees, intakes & Degree Courses For International Students || Register Now', 'Studying at Kings University College provides an opportunity to immerse oneself in a high-quality, personalized learning environment that is deeply integrated with industry needs. The college is committed to developing work-ready graduates through excellence in both learning and teaching, upholding core values of integrity, courage, and respect. Students learn to be honest and trustworthy, take responsibility, question the status quo, and value both themselves and others.
Located in the heart of Kuala Lumpur, next to the Sheraton Imperial Hotel, Kings University College offers a world-class education at an affordable price. Its holistic approach emphasizes employability, academic excellence, character development, and community service. The curriculum is designed to meet the highest international standards while also addressing the unique needs of Malaysia.
The globally benchmarked programs, developed with industry insights, include micro-credentials, internships, and job placements that position graduates for success in the job market. Founded in 2000, Kings University College boasts exceptional teaching staff who are experts in their fields, committed to providing an engaging learning experience with personalized support.
With strong industry partnerships, the college focuses on providing opportunities for students to gain valuable internships and hands-on experience. Education at Kings University College extends beyond academics; it involves nurturing well-rounded individuals equipped with the skills and values necessary for life. Students are encouraged to participate in various co-curricular activities, including sports, music, art, and community service.
Furthermore, Kings University College offers opportunities to pursue higher education abroad, partnering with leading universities worldwide. Graduates are encouraged to study at prestigious institutions in the UK, Australia, Switzerland, and other countries.
For those seeking an institution that delivers a world-class education in a supportive and nurturing environment, Kings University College Malaysia stands out as the ideal choice. Experience the difference it offers.                        
                            See More  
                        
                        
                            See Less', 538, 1998, 16400, 24, '40 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('Tunku Abdul Rahman University of Management and Technology (TAR UMT)', 'Kuala Lumpur', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/tunku-abdul-rahman-university-of-management-and-technology-tar-umt.png', 'Tunku Abdul Rahman University of Management and Technology (TAR UMT) - Tuition Fees, intakes & Degree Courses For International Students || Register Now', 'This institution offers a unique educational experience through several key features. The Dual Award program provides opportunities to earn degrees from prestigious universities in the UK and Switzerland. It proudly serves a diverse community of international students from around the globe, enhancing cultural exchange. Graduates enjoy high employability, making them attractive candidates in the job market.
Additionally, there is a route to overseas degrees in countries such as the UK, Australia, Switzerland, Korea, and Ireland. With six campuses across Malaysia, including Kuala Lumpur, Penang, Johor, Perak, Pahang, and Sabah, quality education is made accessible.
The institution offers over 200 academic programs, catering to a wide range of interests and career aspirations. Students benefit from maximum exemptions by professional bodies, streamlining their path to certification. Lastly, the academic team is highly qualified, with 75% holding at least postgraduate qualifications, ensuring that students receive top-notch instruction.                        
                            See More  
                        
                        
                            See Less', 539, 1999, 16700, 27, '45 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('Universiti Putra Malaysia (UPM)', 'Selangor', 'c0000000-0000-0000-0000-000000000001', 'https://en.your-uni.com/assets/images/university/upm-university.jpg', 'Universiti Putra Malaysia - know more about Universiti Putra Malaysia Tuition fees for International students, intakes & courses || Register Now', 'Choosing to study at Universiti Putra Malaysia (UPM) means joining a distinguished university renowned for its leadership in research and innovation.
Universiti Putra Malaysia (UPM) has numerous institutes, faculties, and schools, serving a multicultural student community. It offers an extensive variety of undergraduate and postgraduate programs across various fields, including medicine, science, engineering, business, and social science, in addition to its strong history in agriculture and forestry.                        
                            See More  
                        
                        
                            See Less', 540, 2000, 17000, 30, '50 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('International Islamic University Malaysia (IIUM)', 'Kuala Lumpur', 'c0000000-0000-0000-0000-000000000001', '', '', '', 541, 2001, 17300, 33, '55 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb),
  ('Universiti Sains Malaysia (USM)', 'Penang', 'c0000000-0000-0000-0000-000000000001', '', '', '', 542, 2002, 17600, 11, '60 acres', '[{"title":"World-Class Infrastructure","description":"State-of-the-art facilities and modern campus grounds."},{"title":"Career Opportunities","description":"Strong ties to industry with high graduate employability."}]'::jsonb, '[{"question":"Is IELTS required?","answer":"Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course."},{"question":"Are scholarships available?","answer":"Yes, merit-based tuition waivers are available for qualified students."}]'::jsonb, '[{"step":1,"title":"Choose Course","description":"Select your desired undergraduate or postgraduate program."},{"step":2,"title":"Submit Documents","description":"Provide passport pages, certificates, and academic transcripts."},{"step":3,"title":"Get Offer Letter","description":"Wait for university verification and receive your offer letter."}]'::jsonb);

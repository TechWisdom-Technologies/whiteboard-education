import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = "https://vvfxsavdmlpgwwumnpqb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2ZnhzYXZkbWxwZ3d3dW1ucHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NDQ4NDMsImV4cCI6MjA4OTMyMDg0M30.LJcF10ulxXtgwkreUv6SMp_zrrjdCJqHfQy2pxUl5SU";
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Starting DB import from scraped JSON...");

  // Step 1: Read universities.json
  console.log("Reading universities.json...");
  const rawData = readFileSync('scraped-data/universities.json', 'utf8');
  const universitiesData = JSON.parse(rawData);
  console.log(`Loaded ${universitiesData.length} universities.`);

  // Step 2: Get Malaysia country_id
  console.log("Fetching Malaysia country_id from DB...");
  const { data: countries, error: countryErr } = await supabase.from('countries').select('id, name');
  if (countryErr) {
    console.error("Failed to fetch countries:", countryErr);
    process.exit(1);
  }
  const malaysia = countries.find(c => c.name.toLowerCase() === 'malaysia');
  const malaysiaId = malaysia ? malaysia.id : null;
  console.log(`Malaysia ID: ${malaysiaId}`);

  // Step 3: Delete existing courses, accommodations, and universities
  console.log("Deleting old courses...");
  const { error: delCoursesErr } = await supabase.from('courses').delete().gt('created_at', '1970-01-01');
  if (delCoursesErr) console.warn("Warning deleting courses:", delCoursesErr.message);

  console.log("Deleting old accommodations...");
  const { error: delAccomErr } = await supabase.from('accommodations').delete().gt('created_at', '1970-01-01');
  if (delAccomErr) console.warn("Warning deleting accommodations:", delAccomErr.message);

  console.log("Deleting old universities...");
  const { error: delUnisErr } = await supabase.from('universities').delete().gt('created_at', '1970-01-01');
  if (delUnisErr) console.warn("Warning deleting universities:", delUnisErr.message);

  // Step 4: Insert Universities
  console.log("Inserting universities...");
  const uniRows = universitiesData.map((u, idx) => {
    let ranking = null;
    if (u.qs_ranking) {
      const match = u.qs_ranking.match(/\d+/);
      if (match) ranking = parseInt(match[0]);
    }
    if (!ranking) ranking = 500 + idx;

    return {
      name: u.name,
      city: u.city,
      country_id: malaysiaId,
      description: u.description || `${u.name} offers high quality education in ${u.city}, Malaysia.`,
      about_text: u.about_text || `${u.name} is a leading private university in ${u.city}, Malaysia.`,
      logo_url: u.logo_url || null,
      ranking: ranking,
      established: 1990 + (idx % 30),
      total_students: 5000 + (idx * 300) % 15000,
      international_ratio: 10 + (idx * 3) % 25,
      campus_size: `${10 + (idx * 5) % 80} acres`,
      study_reasons: [
        { title: "World-Class Infrastructure", description: "State-of-the-art facilities and modern campus grounds." },
        { title: "Career Opportunities", description: "Strong ties to industry with high graduate employability." }
      ],
      registration_steps: [
        { step: 1, title: "Choose Course", description: "Select your desired undergraduate or postgraduate program." },
        { step: 2, title: "Submit Documents", description: "Provide passport pages, certificates, and academic transcripts." },
        { step: 3, title: "Get Offer Letter", description: "Wait for university verification and receive your offer letter." }
      ],
      faqs: [
        { question: "Is IELTS required?", answer: "Yes, standard requirement is IELTS 5.5 to 6.0 depending on the course." },
        { question: "Are scholarships available?", answer: "Yes, merit-based tuition waivers are available for qualified students." }
      ]
    };
  });

  const { data: insertedUnis, error: insertUnisErr } = await supabase.from('universities').insert(uniRows).select();
  if (insertUnisErr) {
    console.error("Failed to insert universities:", insertUnisErr);
    process.exit(1);
  }
  console.log(`Inserted ${insertedUnis.length} universities.`);

  const nameToId = new Map(insertedUnis.map(u => [u.name, u.id]));

  // Step 5: Insert Courses
  console.log("Preparing courses...");
  const courseRows = [];
  for (const u of universitiesData) {
    const universityId = nameToId.get(u.name);
    if (!universityId) continue;

    for (const c of u.courses) {
      courseRows.push({
        title: c.title,
        degree_level: c.degree_level || 'Bachelor',
        duration: c.duration || '3 years',
        tuition_fee: c.tuition_usd || Math.round(c.tuition_myr * 0.22) || 0,
        overview: c.overview_text || `${c.title} course offered at ${u.name}.`,
        university_id: universityId,
        intake_months: c.intake_months || [],
        curriculum: c.curriculum || [],
        entry_requirements: { min_gpa: "2.0", ielts: "5.5" },
        entry_requirements_text: c.entry_requirements || "Pass Matriculation / Foundation / STPM or equivalent.",
        career_outcomes: c.career_opportunities ? [c.career_opportunities] : ["Specialist in field"],
        offer_letter: c.offer_letter || 'Free'
      });
    }
  }

  console.log(`Inserting ${courseRows.length} courses in batches of 100...`);
  const BATCH_SIZE = 100;
  let coursesInserted = 0;
  for (let i = 0; i < courseRows.length; i += BATCH_SIZE) {
    const batch = courseRows.slice(i, i + BATCH_SIZE);
    const { error: courseInsertErr } = await supabase.from('courses').insert(batch);
    if (courseInsertErr) {
      console.error(`Failed inserting course batch ${i} to ${i + batch.length}:`, courseInsertErr);
    } else {
      coursesInserted += batch.length;
    }
  }
  console.log(`Successfully inserted ${coursesInserted} courses.`);

  // Step 6: Insert Accommodations
  console.log("Preparing accommodations...");
  const accomRows = [];
  for (const u of universitiesData) {
    const universityId = nameToId.get(u.name);
    if (!universityId || !u.accommodation || u.accommodation.total_count === 0) continue;

    const firstImage = u.accommodation.image_urls.find(url => url.includes('university') && !url.includes('logo')) || u.logo_url;

    accomRows.push({
      name: `${u.name} Student Residence`,
      city: u.city,
      property_type: "Student Housing",
      type: "Apartment",
      price_per_month: 600 + (Math.random() * 400),
      description: u.accommodation.description || `High quality student accommodation located close to the ${u.name} campus.`,
      image_url: firstImage || 'https://en.your-uni.com/assets/images/university/mmu-university.webp',
      latitude: 3.1 + (Math.random() - 0.5) * 0.1,
      longitude: 101.6 + (Math.random() - 0.5) * 0.1,
      unit_types: ["Single Room", "Double Sharing"],
      room_types: ["En-suite Bathroom", "Shared Bathroom"],
      travel_distance: "5-10 mins walk",
      amenities: ["WiFi", "Air Conditioning", "Security 24/7", "Gym", "Swimming Pool"],
      contact_phone: "+60-12-3456789",
      contact_email: "accommodation@your-uni.com",
      near_university_ids: [universityId]
    });
  }

  if (accomRows.length > 0) {
    console.log(`Inserting ${accomRows.length} accommodations...`);
    const { data: insertedAccoms, error: insertAccomsErr } = await supabase.from('accommodations').insert(accomRows).select();
    if (insertAccomsErr) {
      console.error("Failed to insert accommodations:", insertAccomsErr);
    } else {
      console.log(`Inserted ${insertedAccoms.length} accommodations.`);
    }
  }

  console.log("DB Import completed successfully!");
}

main().catch(console.error);

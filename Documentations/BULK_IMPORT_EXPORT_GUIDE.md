# Bulk Import/Export Guide (Admin Panel)

## Overview

The admin panel now supports bulk data operations for all current CRUD modules:

- Universities
- Courses
- Countries
- Accommodations
- Scholarships
- Language Centers
- Blog Posts
- Events

Each module supports:

- Download Template Excel (`.xlsx`)
- Export to Excel (`.xlsx`)
- Import from Excel (`.xlsx`, `.xls`)
- Import from JSON (`.json`)

## How It Works

1. Open any supported admin page.
2. Use `Download Template` to get a clean template file with:
	- `Template` sheet: one sample row with all expected columns
	- `Column Guide` sheet: column name, label, type, and sample value
3. Use `Export Excel` to download current records if you want real data as reference.
4. Edit the template/exported file (or prepare a JSON file).
5. Use `Import Excel/JSON` to upload.

### Upsert behavior

- If a row includes `id`, import tries to update that existing record.
- If `id` is missing/empty, import creates a new record.

### Column mapping rules

- Import accepts either database keys (recommended) or field labels as column headers.
- For best results, always use the key names below.

### Type parsing rules

- `number` fields: converted to numbers.
- `tag_input` fields: comma/semicolon separated text or JSON array.
- `json_array` fields: JSON string array/object list or comma-separated values.
- `json_object` fields: JSON object string.
- `relation` fields: provide referenced record `id`.

## Common File Rules

- Excel: first row must be headers.
- JSON: root must be an array of objects.
- Optional system fields like `created_at` are not required.
- `id` is optional for new rows; required when updating specific rows.

---

## Universities

### Excel columns

`id, name, city, country_id, description, about_text, ranking, global_score, total_students, international_ratio, established, campus_size, logo_url, hero_image, latitude, longitude, study_reasons, registration_steps, faqs`

### JSON example

```json
[
	{
		"name": "Sunrise International University",
		"city": "Kuala Lumpur",
		"country_id": "b4f35f22-35b4-4f37-9e1c-97aa0d201111",
		"description": "Top research-focused private university.",
		"about_text": "Strong industry links and global faculty.",
		"ranking": 75,
		"global_score": 88,
		"total_students": 22000,
		"international_ratio": 35,
		"established": 1998,
		"campus_size": "120 acres",
		"logo_url": "https://example.com/logo.png",
		"hero_image": "https://example.com/hero.jpg",
		"latitude": 3.139,
		"longitude": 101.6869,
		"study_reasons": [
			{ "title": "Industry Network", "description": "Internship pipeline" }
		],
		"registration_steps": [
			{ "step": 1, "title": "Apply", "description": "Submit online form" }
		],
		"faqs": [
			{ "question": "Is IELTS required?", "answer": "Depends on program" }
		]
	}
]
```

---

## Courses

### Excel columns

`id, title, university_id, degree_level, tuition_fee, duration, overview, intake_months, entry_requirements, curriculum, career_outcomes`

### JSON example

```json
[
	{
		"title": "BSc Computer Science",
		"university_id": "9e83a8e7-7f95-423a-ad8b-b1e4f8db2222",
		"degree_level": "Bachelor",
		"tuition_fee": 12000,
		"duration": "3 years",
		"overview": "Foundation in computing, AI, and software engineering.",
		"intake_months": ["January", "May", "September"],
		"entry_requirements": {
			"min_gpa": "3.0",
			"ielts": "6.0",
			"documents": ["transcript", "passport"]
		},
		"curriculum": [
			{ "year": 1, "subjects": ["Programming", "Math"] }
		],
		"career_outcomes": ["Software Engineer", "Data Analyst"]
	}
]
```

---

## Countries

### Excel columns

`id, name, code, capital, currency, language, population, flag_icon, banner_image, about_text, post_study_work_rights, reasons_to_study, cost_of_living`

### JSON example

```json
[
	{
		"name": "Malaysia",
		"code": "MY",
		"capital": "Kuala Lumpur",
		"currency": "MYR",
		"language": "Malay, English",
		"population": "34000000",
		"flag_icon": "https://example.com/flags/my.svg",
		"banner_image": "https://example.com/banners/my.jpg",
		"about_text": "A leading destination for affordable quality education.",
		"post_study_work_rights": "Eligible graduates may apply through approved pathways.",
		"reasons_to_study": [
			{ "title": "Affordable", "description": "Lower tuition and living cost" }
		],
		"cost_of_living": {
			"rent": "$300",
			"food": "$150",
			"transport": "$50"
		}
	}
]
```

---

## Accommodations

### Excel columns

`id, name, city, property_type, type, price_per_month, description, image_url, latitude, longitude, unit_types, room_types, travel_distance, amenities, contact_phone, contact_email, near_university_ids`

### JSON example

```json
[
	{
		"name": "City Student Residence",
		"city": "Petaling Jaya",
		"property_type": "Student Housing",
		"type": "Apartment",
		"price_per_month": 900,
		"description": "Modern student-focused living near campuses.",
		"image_url": "https://example.com/accommodation.jpg",
		"latitude": 3.1073,
		"longitude": 101.6067,
		"unit_types": ["Single", "Double"],
		"room_types": ["En-suite", "Shared Bathroom"],
		"travel_distance": "10 min bus",
		"amenities": ["WiFi", "Gym", "Laundry"],
		"contact_phone": "+60-12-3456789",
		"contact_email": "stay@example.com",
		"near_university_ids": [
			"bd6dbf98-8bf5-4f0b-bfec-12f4f8c83333",
			"0e2ad2d4-1595-46d8-bf33-7ef4fe8a4444"
		]
	}
]
```

---

## Scholarships

### Excel columns

`id, name, university_id, coverage_amount, criteria`

### JSON example

```json
[
	{
		"name": "Academic Excellence Scholarship",
		"university_id": "57e0f77f-a668-4f70-ae2b-13c7c6f65555",
		"coverage_amount": "50% tuition waiver",
		"criteria": "Minimum GPA 3.5 and leadership profile."
	}
]
```

---

## Language Centers

### Excel columns

`id, name, institute, city, level, tuition_fee, duration, overview, intake_months, curriculum`

### JSON example

```json
[
	{
		"name": "IELTS Fast Track",
		"institute": "Global Language Institute",
		"city": "Kuala Lumpur",
		"level": "Intermediate",
		"tuition_fee": 3200,
		"duration": "6 months",
		"overview": "Intensive IELTS preparation with weekly mocks.",
		"intake_months": ["January", "April", "July", "October"],
		"curriculum": [
			{ "module": "Grammar", "hours": 40 },
			{ "module": "Speaking", "hours": 30 }
		]
	}
]
```

---

## Blog Posts

### Excel columns

`id, title, excerpt, content, author, category, date, read_time, image, cover_image`

### JSON example

```json
[
	{
		"title": "Top 10 Universities in Malaysia",
		"excerpt": "A quick guide to choosing the right campus.",
		"content": "## Why Malaysia\nStrong affordability and quality.",
		"author": "Admin Team",
		"category": "Universities",
		"date": "2026-03-19",
		"read_time": "6 min read",
		"image": "https://example.com/blog-thumb.jpg",
		"cover_image": "https://example.com/blog-cover.jpg"
	}
]
```

---

## Events

### Excel columns

`id, title, type, date, time, description, spots_left, university_ids`

### JSON example

```json
[
	{
		"title": "University Open Day 2026",
		"type": "Open Day",
		"date": "2026-04-15",
		"time": "10:00 AM",
		"description": "Meet faculty and admissions team in person.",
		"spots_left": 120,
		"university_ids": [
			"c0f4b81a-67eb-4769-8ea7-4e6cb2e96666",
			"309e8cdc-85e7-4db4-9fdd-bdf1287f7777"
		]
	}
]
```

---

## Quick Start for 50+ Rows

1. Click `Download Template` on the target module.
2. Duplicate/add rows in Excel up to 50, 100, or more.
3. Keep column headers unchanged.
4. For complex fields (`json_array` / `json_object`), keep valid JSON syntax.
5. Import the file from the same module page.

## Recommended Order for Relational Data

1. Import `Countries`
2. Import `Universities`
3. Import `Courses`, `Scholarships`, and `Events`
4. Import remaining independent modules (`Blogs`, `Language Centers`, `Accommodations`)

This order helps ensure relation IDs (like `country_id` and `university_id`) already exist.

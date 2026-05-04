# World Class Aid - Admin SOP

Version: March 18, 2026

## 1) Purpose

This SOP defines daily admin operations for managing partners, students, leads, and platform content safely and consistently.

## 2) Access Requirements

- Admin role assigned in user_roles
- Valid login credentials
- Access to /admin routes

## 3) Start-of-Day Checklist

1. Log in and open /admin.
2. Review Admin Notification Center for unread critical items.
3. Check pending partner approvals.
4. Check student cases in document_review and overdue stages.
5. Check new leads and assign follow-up status.

## 4) Partner Approval SOP

1. Open /admin/partners.
2. Sort/review pending registrations.
3. Open detail view and verify uploaded documents:
   - NID
   - Trade license (if provided)
   - Certificates (if provided)
4. Add admin notes.
5. Set default commission percentage if approving.
6. Choose action:
   - Approve and grant partner access
   - Reject with reason
7. Confirm status is updated and reflected in table.

Quality rule:
- Do not approve incomplete or suspicious identity/compliance submissions.

## 5) Student Case Management SOP

1. Open /admin/students.
2. Use filters by partner and status.
3. Open student detail.
4. Verify required documents.
5. Update status according to validated progression.
6. Add clear admin notes before saving.
7. Save changes and ensure partner notification is generated.

Recommended status flow:
- document_review -> documents_verified -> applied -> offer_received -> visa_processing -> visa_approved -> enrolled
- Use rejected only with clear reason in notes.

## 6) Lead Management SOP

1. Open /admin/leads.
2. Filter by status (new first).
3. Contact lead via email/phone links.
4. Update status after each interaction:
   - new
   - contacted
   - qualified
   - converted
   - lost
5. Add internal notes where applicable.

Response-time target:
- First response within business-defined SLA.

## 7) Content CRUD SOP

Applicable modules:
- countries
- universities
- courses
- accommodations
- scholarships
- language-centers
- blogs
- events

For each change:
1. Search existing item first.
2. Add or edit with complete fields.
3. Validate URLs, numbers, and JSON fields.
4. Save and recheck listing.
5. Delete only when confirmed unnecessary.

## 8) Notification SOP

Admin notifications:
- Mark items read only after action is taken.
- Use unread state for active work queue.
- Click-through to source page and complete action.

## 9) Data Quality SOP

Before end-of-day:
1. Verify no duplicate partner registrations.
2. Verify student records have minimum required fields.
3. Verify broken links/files are corrected.
4. Verify stale leads are reclassified.

## 10) Escalation Rules

Escalate to technical/product owner when:
- RLS errors block legitimate admin operations.
- Multiple users report access-denied unexpectedly.
- Document storage links fail repeatedly.
- Notification triggers are missing or delayed.

## 11) Security and Compliance Rules

- Never share admin credentials.
- Never expose service-role keys in client tools.
- Do not export personal data without authorization.
- Keep admin notes professional and factual.

## 12) Weekly Operations Review

Track weekly:
- Pending partner backlog
- Student stage cycle time
- Lead conversion percentages
- Content freshness and broken links

Document recurring bottlenecks and propose process improvements.

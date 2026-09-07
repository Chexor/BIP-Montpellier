# Accessible Medication Label Reader

## Concept

An accessibility-first tool that helps older adults read and understand medication labels. The user takes a photo of a medication package or pharmacy label. The tool extracts visible text, reads it aloud, highlights key instructions, and helps turn confirmed dose timing into reminders.

The product should be framed as a reading and organization assistant, not a medical advisor.

## Core Problem

Medication labels can be hard to use because of:

- Small print
- Low contrast packaging
- Similar-looking boxes
- Complex dose timing
- Multiple medications
- Language barriers
- Poor eyesight or dexterity
- Stress after a doctor visit or hospital discharge

For older adults and caregivers, the main risk is not only forgetting medication. It is also misunderstanding what the label says, mixing up packages, or missing important warnings.

## Target Users

- Older adults managing their own medication
- Informal caregivers helping a parent, partner, neighbor, or friend
- Pharmacists who want to support clearer medication use
- Home nurses doing medication checks

## Demo Flow

1. User opens the app and selects "Scan medication".
2. User uploads or photographs a sample medication label.
3. The app extracts visible text from the image.
4. The app shows a plain-language reading view:
   - medication name
   - dose instruction
   - timing
   - warnings
   - expiry date
   - pharmacy or doctor notes
5. The app asks the user to confirm uncertain text.
6. The app reads the instruction aloud.
7. The app creates a reminder schedule only after confirmation.
8. The app can generate a caregiver share summary.

## Safety Guardrails

- Never guess unclear label text.
- Always show OCR confidence or mark uncertain fields.
- Require confirmation before creating reminders.
- Do not suggest changing dose, timing, or medication.
- Use language such as "The label appears to say..." instead of "You should...".
- Add "Ask your pharmacist or doctor" prompts for unclear or conflicting instructions.
- Keep medical claims out of the pitch.

## Minimal Hackathon Prototype

### Must Have

- Elder profile
- Medication schedule
- Upload image
- OCR extraction
- Key-field detection
- Large-print reading view
- Manual correction
- Text-to-speech playback
- Reminder preview
- Local pharmacist contact path
- Emergency contacts
- Caregiver summary

### Nice to Have

- Multi-language display
- QR code for caregiver share
- Medication box comparison
- Expiry warning
- Duplicate medication warning based on exact name match
- Color-coded timing blocks
- Offline-friendly mode

### Avoid for First Demo

- Automatic medical advice
- Drug interaction checking
- Dose recommendations
- Real pharmacy integration
- Real patient records
- Claims of clinical accuracy

## User Interface Notes

- Use very large text and high contrast.
- Keep the main actions simple: scan, confirm, listen, remind, share.
- Display extracted label text beside the original image.
- Make uncertain words visually obvious.
- Add one-tap "Ask pharmacist" output with a prepared question.
- Include an accessibility mode with voice playback and simple navigation.

## Example Extracted Fields

- Medication name
- Strength
- Form
- Quantity
- Dose instruction
- Timing
- Route
- Prescriber
- Pharmacy
- Dispense date
- Expiry date
- Warnings
- Patient name

## Elder Profile

The profile should make the app personal without becoming a full medical record.

Useful fields:

- Name and preferred display name
- Age range
- Preferred language
- Reading preference: large text, audio, high contrast
- Known allergies
- Existing medication schedule
- Emergency contacts
- Preferred pharmacy
- Doctor or care team contact
- Caregiver contacts
- Medication notes, such as "uses pill organizer" or "needs help opening packaging"

Avoid storing unnecessary sensitive data for the hackathon prototype.

## Additional Feature Ideas

### Today View

A simple "What do I take today?" screen with morning, noon, evening, and bedtime blocks. Each item can show the medication image, name, instruction, and confirmation status.

### Confidence Status

Each medication gets a status:

- Confirmed
- Needs user confirmation
- Ask pharmacist
- Expired or check date
- Not in current schedule

### Package Photo Memory

Store a photo of the box or bottle beside the schedule. This helps the user match the reminder to the physical medication.

### Similar Package Warning

If two medications look similar or have similar names, show a warning in simple language: "These two boxes may be easy to mix up."

### New Medication Check-In

When a new package is scanned, ask:

- Is this replacing another medication?
- Did the pharmacist explain when to take it?
- Do you want to add it to today's schedule?
- Should a caregiver be notified?

### Refill and Low Supply Reminder

Let the user or caregiver enter how many pills are left. The app estimates when to call the pharmacy.

### Expiry and Disposal Prompt

If an expiry date is detected or entered, the app can remind the user to ask the pharmacy about safe disposal.

### Pharmacist Question Builder

If anything is unclear, the app prepares a short message or call script:

"Hello, I have a question about this medication label. The name appears to be X, but the dose instruction is unclear. Can you confirm when it should be taken?"

### Caregiver Notification

Send or copy a summary to a trusted contact when:

- a new medication is scanned
- a label is unclear
- a medication is expired
- a dose schedule changes
- the user asks for help

### Emergency Mode

One-tap emergency screen with:

- emergency contacts
- medication list
- allergies
- preferred pharmacy
- doctor contact
- large "call" buttons

### Doctor Visit Summary

Generate a compact summary:

- Current medications
- Unclear labels
- Recent changes
- Missed doses, if tracked
- Questions to ask

### Voice and Read-Aloud Mode

Read the medication explanation and schedule aloud. Use simple controls: play, pause, repeat.

### Multilingual Explanation

Show a plain-language explanation in the user's preferred language, while keeping original label text visible.

### Consent-Based Care Circle

The elder chooses who can see:

- medication schedule
- emergency contacts
- unclear scans
- adherence confirmations
- caregiver notes

### Printable Medication Card

Create a large-print card with:

- medication names
- photos
- timing icons
- allergies
- emergency contacts
- pharmacy contact

### Red Flag Prompts

Use non-diagnostic safety prompts:

- "This label is hard to read. Ask a pharmacist before changing how you take it."
- "This medication is not in your current schedule. Confirm before taking it."
- "This appears expired. Ask your pharmacist what to do."

## Data Strategy

For the hackathon, use synthetic or publicly safe sample labels. Avoid real patient information.

Possible sample inputs:

- Mock pharmacy sticker made by the team
- Public medication packaging image with no patient data
- Generated label image with realistic text
- Multilingual sample labels
- Blurry or low-contrast test image for uncertainty handling

## Differentiator

Most medication apps start from schedules. This idea starts from the physical reality older adults actually face: a small label on a box or bottle. The value is bridging printed instructions into accessible, confirmed, shareable routines.

## Competitive Reality

Medication scanning and digital medicine cabinet apps already exist. The broad idea is not unique if it is framed as "scan a label and create reminders."

Observed market patterns:

- Label scanning into medication reminders
- Refill countdowns
- Family or caregiver sharing
- Medicine cabinet inventory
- Expiry tracking
- Doctor-ready medication summaries
- On-device privacy claims
- AI medication Q&A

The stronger wedge is not scanning itself. The stronger wedge is "uncertainty-aware medication handoff": the app turns the messy physical cabinet into confirmed facts, unresolved questions, and safe next actions for the older adult, caregiver, or pharmacist.

## Sharper Product Wedge

### Working Name

MedCheck Handoff

### Naming Check

"MedLens" is not a clean available name. It is already used by healthcare-related products, including a counterfeit-medicine intelligence platform and clinical AI tools. For the hackathon, avoid using it as the public project name unless it is clearly treated as temporary.

"MedCompanion" is also not a clean available name. It is already used by healthcare navigation and AI health explanation products, including a trademark filing. Avoid it as the public project name.

"MedPilot" is also not a clean available name. It is already used by healthcare and home-care management products. Avoid it as the public project name.

"MedMate" is also not a clean available name. MedMate and MediMate are already used by telehealth, AI health assistant, medication reminder, care-circle, and medical-record products. Avoid it as the public project name.

### One-Sentence Description

Scan the medicine cabinet, separate confirmed medication facts from uncertainties, and create a safe handoff for family caregivers or pharmacists.

### Why This Is More Distinctive

- It treats OCR uncertainty as the main safety feature.
- It focuses on the transition from physical labels to human coordination.
- It helps with cabinet audits, not only daily reminders.
- It creates pharmacist questions instead of inventing medical answers.
- It can work as a one-time check after discharge, a pharmacy visit, or a caregiver visit.

### Demo Moment

The app scans three medication packages:

1. One is clear and becomes a confirmed routine.
2. One is expired and gets flagged for disposal or pharmacist review.
3. One has unclear instructions and becomes a prepared pharmacist question.

The final output is a large-print medication card and a caregiver handoff summary.

## Pitch

Older adults are often told to "follow the label", but the label may be small, unclear, multilingual, or physically difficult to read. Our tool turns medication labels into large-print, spoken, confirmed instructions and simple caregiver-ready reminders. It does not replace a pharmacist or doctor. It makes the written instruction easier to access and less likely to be misunderstood.

## Prototype Architecture

- Frontend: upload, image preview, extracted fields, correction form, reminder preview
- OCR: browser OCR, local OCR, or API depending on available time and connectivity
- Field parsing: rule-based extraction first
- Speech: browser text-to-speech
- Storage: local browser state for demo
- Export: copyable caregiver summary or downloadable PDF

## Open Questions

- Will the hackathon provide health datasets or partner APIs?
- Are we allowed to use cloud OCR?
- Should the demo focus on older adults, caregivers, pharmacists, or nurses?
- Should the main story be eyesight accessibility, medication safety, or caregiver coordination?
- Which languages matter for the Montpellier context?

## More Unique Angles

### Label-to-Care-Task Bridge

Scan a medication label and turn only confirmed information into a shared care task. If the scan is uncertain, the app creates a question for the pharmacist instead of guessing.

Why it is different: It connects the physical medication object to human coordination, instead of being only OCR or only reminders.

### Uncertainty-First Medication Reader

Design the entire product around what the app does not know. It highlights unclear words, asks the user to compare the box, and prepares a pharmacist question.

Why it is different: Many AI demos pretend confidence. This one makes uncertainty the safety feature.

### Medication Cabinet Reconciliation

The user scans every medication box at home. The app creates a cabinet inventory and flags practical issues: expired boxes, duplicate names, missing labels, unreadable instructions, or meds with no known schedule.

Why it is different: It solves the messy home reality before creating reminders.

### Same Box, Different Person Warning

For homes where two older adults live together, scan medication packages and assign each one to a person. The app warns when two packages look similar or have similar names.

Why it is different: It targets a specific, common household risk that generic medication apps rarely foreground.

### Caregiver Handoff From a Photo

A visiting caregiver takes a photo of the medication area and leaves a structured handoff: what was seen, what was confirmed, what is uncertain, and what needs follow-up.

Why it is different: It turns a quick real-world observation into a useful shared record.

### Pharmacy Counter Companion

At the pharmacy, the user scans the new label and the app generates three simple confirmation questions before leaving: when to take it, what changed, and what to watch for.

Why it is different: It catches confusion at the moment where clarification is easiest.

### Plain-Language Change Detector

Scan the old label and the new label. The app compares them and shows what appears to have changed: dose, timing, pill strength, expiry, or instructions.

Why it is different: Older adults often struggle with medication changes, not just medication reminders.

### Medication Story Timeline

Each scanned label becomes part of a timeline: started, changed, stopped, refill due, issue noticed, pharmacist contacted. The output is a concise doctor or caregiver summary.

Why it is different: It creates continuity across appointments and caregivers.

### Multi-Language Family Layer

The older adult sees large-print French. A family caregiver sees the same confirmed instructions in another language. Uncertain medical terms stay flagged and untranslated until confirmed.

Why it is different: Montpellier and international care networks make language a real coordination issue.

### Low-Tech Output Mode

After scanning, the app creates a printable medication card with large text, icons, morning/noon/evening blocks, and emergency contacts.

Why it is different: It does not assume the older adult will keep using an app.

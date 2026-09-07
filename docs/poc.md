# Proof of Concept - Medication Companion

## One-Line Pitch

An accessibility-first medication companion for older adults that scans a medication package, explains it in simple spoken language, and checks how it fits into the patient's saved medication schedule.

## Hackathon Theme Fit

The project fits the health and aging theme by addressing a common daily problem for older adults: medication confusion. Many elderly patients manage several medications at once, often with small-print labels, similar-looking packages, changing instructions, and reduced vision or confidence with digital tools.

The app is designed to support safer routines, clearer understanding, and easier caregiver involvement. It is not a diagnosis tool and does not replace a doctor or pharmacist.

## Target Users

- Older adults managing medication at home
- Family caregivers helping a parent, partner, neighbor, or friend
- Home nurses or informal care helpers checking medication routines
- Pharmacists who want patients to better understand label instructions

## Core Problem

Older adults may struggle to answer simple but important questions:

- What is this medication?
- Why do I take it?
- Is this already in my schedule?
- When is my next dose?
- Did I already take it today?
- Should I ask my caregiver or pharmacist for help?

Printed medication information is often too small, too technical, or too easy to confuse with another package. The proof of concept focuses on making this information readable, spoken, and connected to the patient's routine.

## Product Boundary

The app is a reading, scheduling, and care-coordination assistant.

It does:

- Read visible medication package or label information
- Match recognized medication names against the saved patient schedule
- Explain known schedule information in plain language
- Speak the explanation aloud
- Mark unclear or unknown results
- Encourage the patient to ask a caregiver, pharmacist, or doctor when needed

It does not:

- Diagnose conditions
- Recommend new medication
- Change dose or timing
- Check clinical drug interactions
- Replace professional medical advice
- Claim that OCR or image recognition is medically reliable

## Demo Scenario

Patient: Maria, 78 years old.

Maria has a saved medication schedule created by her daughter or caregiver. She finds a medication box at home and is unsure what it is and whether she needs to take it now.

Demo flow:

1. Maria opens the app.
2. The home screen shows large buttons: scan medicine, today's medicines, and call caregiver.
3. Maria scans or uploads a photo of the medication package.
4. The app extracts the visible text and identifies the medicine from a small demo medication database.
5. The app compares the medicine with Maria's saved schedule.
6. The app shows a simple explanation in large text.
7. The app reads the explanation aloud.
8. Maria can mark the dose as taken, repeat the audio, or ask her caregiver for help.

Example spoken output:

> Maria, this is Metformin 500 milligrams. It helps control your blood sugar. According to your schedule, you take it after breakfast and after dinner. You already took your morning dose today. Your next dose is after dinner. If this does not look right, please ask your caregiver or pharmacist.

## Minimum Viable PoC

### Must Have

- Patient profile
- Medication schedule
- Medication scan through camera or image upload
- OCR or mocked text extraction
- Medication matching against a small known medication list
- Large-print result screen
- Plain-language medication explanation
- Text-to-speech playback
- Friendly PillPal avatar with simple speaking and feedback states
- Clear fallback when medication is unknown
- Caregiver or pharmacist escalation message

### Nice To Have

- Dose taken / not taken tracking
- Medication package photo saved in the schedule
- Multi-language output
- High-contrast accessibility mode
- Emergency information screen
- Caregiver summary
- Expiry date warning
- Barcode scanning

### Out Of Scope For The Hackathon

- Real prescription database integration
- Real pharmacy account integration
- Clinical drug interaction checking
- Automatic dose recommendations
- Real patient authentication system
- Medical device certification

## Suggested Technical Architecture

### Frontend

- Mobile-first web app
- Large touch targets and high contrast
- Camera or image upload input
- Today's medication schedule view
- Scan result view
- Browser text-to-speech for spoken output
- Lightweight animated avatar area for the PillPal guide

Suggested stack:

- React with Vite or Next.js
- Simple CSS or Tailwind
- Browser Web Speech API for speech output
- Lottie, sprite sheets, or simple CSS animation for avatar states

### Backend

- Small API service for profile, schedule, scan result, and explanation generation
- Local demo data or SQLite/Supabase storage
- OCR service or mocked scan parser
- Optional AI call to rewrite known medication facts into simple spoken language

Suggested stack:

- Node/Express, Next.js API routes, or FastAPI
- SQLite, local JSON, localStorage, or Supabase for the demo

### Medication Recognition

Best hackathon approach:

1. Use 5-10 curated demo medications.
2. Scan or upload sample package images.
3. Extract text using OCR or use predefined demo scan outputs.
4. Fuzzy-match extracted text against the demo medication list.
5. Ask the user to confirm uncertain results before changing the schedule.

This keeps the demo reliable while still showing the intended product experience.

## Minimal Data Model

### Patient

```json
{
  "id": "patient_001",
  "name": "Maria",
  "age": 78,
  "preferredLanguage": "en",
  "caregiverName": "Sophie",
  "accessibility": {
    "largeText": true,
    "spokenOutput": true,
    "highContrast": true
  }
}
```

### Medication

```json
{
  "id": "med_001",
  "name": "Metformin",
  "strength": "500 mg",
  "form": "tablet",
  "purposeSimple": "Helps control blood sugar",
  "schedule": [
    {
      "time": "08:00",
      "label": "after breakfast"
    },
    {
      "time": "18:00",
      "label": "after dinner"
    }
  ],
  "instructions": "Take after food",
  "warningsSimple": "Ask your pharmacist if you are unsure about this medicine"
}
```

### Dose Log

```json
{
  "medicationId": "med_001",
  "takenAt": "2026-09-07T08:10:00",
  "status": "taken"
}
```

### Scan Result

```json
{
  "detectedText": "Metformin 500 mg tablets",
  "matchedMedicationId": "med_001",
  "confidence": "high",
  "needsConfirmation": false
}
```

## AI Use

The AI should only simplify and speak information already known to the app. It should not invent medical instructions.

Input to the AI should include:

- Patient name
- Detected medication
- Saved medication schedule
- Dose history for today
- Simple medication purpose from the demo database
- Safety instruction to avoid medical advice

Example prompt:

```text
Patient: Maria, 78
Detected medication: Metformin 500 mg
Known schedule: 08:00 after breakfast and 18:00 after dinner
Dose history today: morning dose taken at 08:10
Purpose: Helps control blood sugar
Instruction: Take after food

Generate a short spoken explanation for an elderly patient.
Use simple language.
Do not add medical advice beyond the provided facts.
Mention asking a caregiver or pharmacist if unsure.
```

## PillPal Avatar

The app includes a friendly avatar called PillPal. PillPal makes the experience warmer and more accessible, especially for patients who benefit from spoken guidance instead of dense text.

PillPal should feel like a calm companion, not a doctor or medical authority. The avatar helps the patient understand the saved schedule, draws attention to the next action, and clearly shows when the app is uncertain.

### Avatar Role

- Greet the patient in a simple, friendly way
- Read medication explanations aloud
- Show that the app is scanning or thinking
- Point attention to the next dose or next action
- Signal uncertainty when the scan is unclear
- Encourage asking a caregiver or pharmacist when needed

### Animation States

Minimum useful states for the hackathon:

- Idle: gentle breathing or blinking
- Speaking: simple mouth movement while the explanation is read aloud
- Scanning: attentive or thinking pose while the image is processed
- Success: positive confirmation when a medicine matches the schedule
- Uncertain: concerned or puzzled expression when the scan is unclear
- Help: gesture or expression that points the user toward caregiver or pharmacist support

### Avatar Safety Rules

- Do not dress PillPal like a doctor or pharmacist.
- Do not use symbols that imply medical authority or diagnosis.
- Do not make PillPal say that a medication is safe, correct, or recommended.
- Use wording such as "according to your schedule" and "please ask your caregiver or pharmacist if unsure."
- Keep serious warnings calm and clear, not playful.

### Technical Options

For the proof of concept, the avatar should be lightweight and reliable:

- Lottie animations for polished 2D states
- Sprite sheet with state changes
- Static character images with simple CSS movement
- Optional lip-sync approximation while speech is playing

The animation specialist can own the avatar design, emotional states, and exported animation assets. The app only needs to switch between named states based on the user flow.

## Safety Rules

- If the medication is not recognized, say: "I cannot identify this medicine safely."
- If the medication is not in the patient's schedule, say: "This medicine is not in your saved schedule."
- If the scan is unclear, ask the user or caregiver to confirm the text.
- Never create or change reminders without confirmation.
- Never tell the patient to take a medication unless it is based on the saved schedule.
- Use "according to your schedule" instead of direct medical advice.
- Always provide a path to caregiver, pharmacist, or doctor help.

## Main Screens

### Home

- Scan medicine
- Today's medicines
- Call caregiver
- Emergency information

### Patient Profile

- Name
- Preferred language
- Accessibility preferences
- Caregiver contact
- Pharmacy or doctor contact

### Medication Schedule

- Morning, noon, evening, and bedtime sections
- Medication name, dose, and instruction
- Taken / not taken status
- Package photo if available

### Scan Result

- Medication name
- Match status
- Simple explanation
- Read aloud button
- Mark as taken button
- Ask caregiver button
- Ask pharmacist prompt

## Demo Success Criteria

The proof of concept succeeds if the jury can see, in under three minutes:

- An elderly patient profile
- A saved medication schedule
- A scan or upload of a medication package
- A recognized medication result
- A simple spoken explanation
- A schedule match showing the next dose
- A clear warning or help path for uncertainty

## Recommended Build Order

1. Build the static patient profile and medication schedule.
2. Add the scan/upload screen.
3. Add mocked medication recognition for reliable demo images.
4. Add the scan result screen and schedule matching.
5. Add text-to-speech.
6. Add the PillPal avatar with idle, speaking, scanning, success, and uncertain states.
7. Add unknown or unclear medication fallback.
8. Polish accessibility: large text, contrast, simple navigation.
9. Prepare a scripted demo with one successful scan and one uncertain scan.

## Key Pitch Message

This app helps older adults understand medication packages in the moment they need help. It turns small, technical, confusing label information into clear spoken language connected to the patient's own schedule, while keeping caregivers and pharmacists in the loop when anything is uncertain.

# Team Workplan - PillPal PoC

## Goal

Build a reliable proof of concept for PillPal: a mobile-first medication companion for older adults that connects a patient's pillbox routine, saved medication schedule, package scanning, spoken explanations, and caregiver/pharmacist escalation.

The demo should prove one clear story:

> Maria opens PillPal, checks her pillbox for today, scans a medication package, hears a simple explanation, sees how it fits into her schedule, and gets clear help if something is uncertain.

## Team

- Software Developer 1: frontend app shell and accessible UI
- Software Developer 2: app logic, data, scan simulation, and integration
- Animation Specialist: PillPal avatar design and animation states
- Business Specialist: pitch, user story, value proposition, and demo narrative
- Junior AI Engineer: AI flow, prompt design, safety rules, scan interpretation, and spoken response examples

## Shared Product Decisions

- The app is a support tool, not a medical advisor.
- The pillbox is the main daily interface because it matches how many older adults manage medication.
- Package scanning helps answer: "What is this medicine and where does it fit in my pillbox schedule?"
- The hackathon demo uses curated demo data and mocked or controlled scan results first.
- Real OCR or barcode scanning is optional after the core demo works.
- PillPal is a friendly guide, not a doctor or pharmacist.

## Demo Scope

### Primary Demo Case

Maria has a pillbox schedule for the day.

Morning compartment:

- Metformin 500 mg
- Amlodipine 5 mg

Evening compartment:

- Metformin 500 mg

Maria scans a Metformin package. PillPal recognizes it, explains it simply, and says it is already part of her morning and evening pillbox schedule.

### Secondary Demo Case

Maria scans an unclear or unknown medicine. PillPal does not guess. It says the medicine cannot be identified safely and offers to ask a caregiver or pharmacist.

## Workstreams

## Software Developer 1 - Frontend And Accessibility

### Main Responsibility

Create the mobile-first app experience that the jury can click through smoothly.

### Deliverables

- Home screen
- Today pillbox screen
- Patient profile screen
- Scan/upload screen
- Scan result screen
- Caregiver/pharmacist help action
- Shared layout and styling
- Avatar display area integrated into screens

### Screen Requirements

Home:

- Large "Scan medicine" button
- Large "Today's pillbox" button
- "Call caregiver" or "Ask for help" action
- Clear PillPal greeting

Today pillbox:

- Morning, noon, evening, bedtime compartments
- Medication name, dose, and timing
- Taken / not taken status
- Read aloud button
- Large, high-contrast layout

Scan:

- Image upload or camera input
- "Use demo scan" fallback button
- Scanning state for PillPal

Result:

- Medication name
- Match status
- Simple explanation
- Next dose information
- Read aloud button
- Mark as taken button
- Ask caregiver/pharmacist action

### Acceptance Criteria

- The app is usable on a phone-sized screen.
- The core demo can be completed without typing.
- Text is large enough for an older adult demo persona.
- Buttons are easy to see and tap.
- The app has no dead-end screen during the demo.

## Software Developer 2 - Logic, Data, And Integration

### Main Responsibility

Make the app behavior credible and reliable using demo data.

### Deliverables

- Demo patient profile
- Demo medication database
- Pillbox schedule model
- Dose status logic
- Scan result matching logic
- Unknown/uncertain medication fallback
- Integration hooks for text-to-speech and avatar states

### Data To Prepare

Patient:

- Maria, 78
- Preferred language: English for first demo
- Caregiver: Sophie
- Accessibility: large text, spoken output, high contrast

Medications:

- Metformin 500 mg: helps control blood sugar, after breakfast and after dinner
- Amlodipine 5 mg: helps control blood pressure, once in the morning
- Vitamin D: supports bone health, once at bedtime
- Unknown sample medicine for fallback demo

Scan cases:

- Successful scan: Metformin 500 mg
- Recognized but not scheduled: Paracetamol 500 mg
- Unclear scan: low-confidence unreadable package
- Unknown scan: no database match

### Core Logic

- Match detected medication name to saved medication database.
- Check whether the matched medication appears in Maria's pillbox schedule.
- Identify whether the current dose is already marked as taken.
- Find the next scheduled dose.
- Return a status:
  - `scheduled`
  - `already_taken`
  - `recognized_not_scheduled`
  - `uncertain`
  - `unknown`

### Acceptance Criteria

- The successful demo case always works.
- The uncertain case never invents a medication.
- The result screen receives a clean status and explanation.
- Data can be edited quickly during the hackathon.

## Animation Specialist - PillPal Avatar

### Main Responsibility

Create a friendly avatar that makes the app feel warm, clear, and accessible.

### Deliverables

- PillPal character design
- Avatar style guide
- Exported avatar states
- Optional speaking animation
- Optional small transition animations

### Required Avatar States

- Idle: calm greeting or waiting state
- Scanning: attentive or thinking state
- Speaking: simple mouth movement or active expression
- Success: medicine matched or dose marked as taken
- Uncertain: scan unclear or medicine unknown
- Help: caregiver/pharmacist support moment

### Design Rules

- Friendly and calm.
- Not dressed as a doctor or pharmacist.
- No medical authority symbols.
- Clear expressions that work at small mobile size.
- Serious warnings should remain calm, not playful.

### Export Options

Preferred:

- Lottie JSON files

Acceptable:

- Sprite sheet
- Short transparent GIFs
- PNG state images with simple CSS movement

### Acceptance Criteria

- Developers can switch avatar states by name.
- Avatar works in the main app layout without covering important text.
- Speaking state can be shown while text-to-speech plays.
- Uncertain state clearly communicates caution.

## Business Specialist - Pitch And Story

### Main Responsibility

Make the problem, value, and demo story clear to the jury.

### Deliverables

- One-minute problem statement
- Three-minute pitch structure
- User persona: Maria and caregiver Sophie
- Value proposition
- Stakeholder map
- Safety and trust positioning
- Optional market or partnership slide
- Final demo script

### Pitch Points

- Medication confusion is a daily aging problem.
- Pillboxes are common, but they do not explain what is inside.
- Medication packages are hard to read and easy to mix up.
- PillPal connects the pillbox, package, schedule, and caregiver support.
- The app speaks in simple language.
- The app refuses to guess when uncertain.

### Acceptance Criteria

- The pitch explains the problem in plain language.
- The demo story fits in three minutes.
- The business framing does not overclaim medical accuracy.
- The safety boundary is easy to understand.

## Junior AI Engineer - AI Flow And Safety

### Main Responsibility

Own how the app turns scan results and schedule data into simple, safe spoken explanations.

### Deliverables

- Explanation templates
- AI prompt
- Safety rules
- Example outputs for each scan status
- Medication matching approach
- OCR/vision option assessment
- Test cases for hallucination and unsafe wording

### Explanation Cases

Scheduled medicine:

> Maria, this is Metformin 500 milligrams. It helps control your blood sugar. According to your schedule, it is in your morning and evening pillbox. You already took the morning dose today. Your next dose is after dinner.

Recognized but not scheduled:

> Maria, this looks like Paracetamol 500 milligrams. It is not in your saved pillbox schedule. Please ask Sophie, your caregiver, or your pharmacist before taking it.

Unclear scan:

> I cannot read this package clearly enough. Please scan it again in better light, or ask your caregiver or pharmacist to check it.

Unknown medicine:

> I cannot identify this medicine safely. Please do not rely on this scan. Ask your caregiver or pharmacist for help.

### AI Safety Rules

- Use only provided medication facts and saved schedule data.
- Never invent purpose, dose, timing, warnings, or interactions.
- Never say a medication is safe to take.
- Never tell the patient to take a medication unless the saved schedule supports it.
- Use "according to your schedule" for dose timing.
- Escalate unknown, unclear, or unscheduled medication cases.

### Technical Tasks

- Define structured input for the explanation generator.
- Define structured output for the result screen.
- Decide whether first version uses templates, AI, or AI with template fallback.
- Prepare a small medication facts file.
- Prepare sample scan text for successful and failed demo cases.
- Test generated text against safety rules.

### Acceptance Criteria

- Every scan status has a safe spoken response.
- The demo works without live AI if needed.
- AI output can be replaced by templates during the pitch if connectivity fails.
- The safety language is consistent across the app.

## Integration Plan

### Shared State Names

The app should use these simple avatar states:

- `idle`
- `scanning`
- `speaking`
- `success`
- `uncertain`
- `help`

The app should use these scan statuses:

- `scheduled`
- `already_taken`
- `recognized_not_scheduled`
- `uncertain`
- `unknown`

### Suggested File Structure

```text
src/
  components/
    AvatarPanel
    PillboxDay
    MedicationCard
    ScanResult
    BigButton
  data/
    patient.json
    medications.json
    scanExamples.json
  logic/
    matchMedication
    getNextDose
    buildExplanation
  screens/
    Home
    TodayPillbox
    ScanMedicine
    Result
  speech/
    speakText

assets/
  avatar/
    idle
    scanning
    speaking
    success
    uncertain
    help
  medication-samples/

submission/
  pitch.md
  demo-script.md
```

## Development Timeline

## Block 1 - Align And Stub

Goal: everyone can see the same demo shape.

- Frontend: create empty screens and navigation.
- Logic: create patient, medication, and scan sample data.
- Animation: sketch PillPal and decide export format.
- Business: write Maria/Sophie persona and problem statement.
- AI: write explanation cases and safety rules.

Exit criteria:

- Clicking through the app skeleton is possible.
- The team agrees on the primary and secondary demo cases.

## Block 2 - Core Demo Flow

Goal: successful scan demo works end to end.

- Frontend: implement Home, Today Pillbox, Scan, and Result screens.
- Logic: implement demo scan result and schedule matching.
- Animation: deliver first avatar state assets.
- Business: draft three-minute pitch.
- AI: connect template explanations or first AI prompt.

Exit criteria:

- User can open app, view pillbox, scan Metformin, and hear the explanation.

## Block 3 - Safety And Fallbacks

Goal: the app handles uncertainty well.

- Frontend: add unclear and unknown result states.
- Logic: add fallback scan cases.
- Animation: deliver uncertain and help avatar states.
- Business: add trust and safety explanation to pitch.
- AI: test all generated outputs against safety rules.

Exit criteria:

- Unknown or unclear scans do not produce unsafe advice.
- The app offers caregiver or pharmacist help.

## Block 4 - Polish And Pitch

Goal: make the demo feel finished.

- Frontend: improve spacing, contrast, and mobile layout.
- Logic: clean data and remove brittle demo behavior.
- Animation: refine timing and speaking state.
- Business: finalize slides or spoken pitch.
- AI: prepare backup scripted responses if live AI fails.

Exit criteria:

- Demo runs in under three minutes.
- Everyone knows their speaking role.
- There is a backup path if scan, AI, or audio fails.

## Final Demo Checklist

- App opens cleanly.
- Maria profile is visible.
- Today's pillbox is visible.
- Metformin scan succeeds.
- Spoken explanation works.
- PillPal changes state while scanning and speaking.
- Dose status or next dose is shown.
- Unknown scan fallback works.
- Caregiver/pharmacist help path is visible.
- Pitch explains safety limits clearly.

## Risks And Mitigations

- OCR fails during demo: use a "Use demo scan" button.
- AI call fails: use prepared template responses.
- Audio does not play: show large text and have a team member read it.
- Avatar export takes longer than expected: use PNG states first.
- Scope grows too large: protect the main demo flow and defer extras.
- Medical claims become risky: keep all language tied to the saved schedule and pharmacist/caregiver escalation.

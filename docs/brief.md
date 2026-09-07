# Hackathon Brief

## Challenge

- Name: Health & Aging Hackathon
- Organizer:
- Date:
- Location: Montpellier
- Team:

## Problem Statement

Older adults often manage multiple medications with instructions printed in small text on boxes, bottles, and pharmacy labels. These labels can be hard to read, easy to confuse, and difficult to turn into a reliable daily routine. The risk is not only forgetting medication, but misunderstanding unclear instructions, missing expiry dates, mixing up similar packages, or not knowing when to ask a pharmacist or caregiver for help.

Our primary idea is an accessibility-first medication companion for elderly users. The app helps an older adult or caregiver scan a medication package, read a simple explanation, confirm when it should be taken, connect unclear cases to a local pharmacist, and keep emergency contacts and medication information available when needed.

## Users and Stakeholders

- Primary user: Older adult managing medication at home
- Secondary users: Family caregivers, neighbors, home nurses
- Stakeholders: Pharmacists, doctors, emergency contacts, care organizations

## Constraints

- Time: Hackathon prototype scope
- Data: Use synthetic or public sample medication labels; avoid real patient data
- Tools: OCR, simple field extraction, accessible UI, text-to-speech
- Legal or privacy: Do not provide medical advice, diagnose, or recommend dose changes
- Technical: OCR uncertainty must be visible and manually confirmable

## Judging Criteria

- Impact:
- Feasibility:
- Technical quality:
- Design and usability:
- Presentation:

## Demo Target

In under three minutes, the jury should see an elderly-user profile, a medication scan, a large-print explanation, uncertainty handling, a medication schedule update, a local pharmacist contact option, and an emergency information screen.

Demo story:

1. An elderly user opens their profile and today's medication schedule.
2. They scan a new medication package or pharmacy label.
3. The app extracts visible label text and explains it in simple language.
4. The app clearly marks uncertain text and asks for confirmation.
5. The user adds the confirmed medication timing to the schedule.
6. If something is unclear, the app prepares a pharmacist question or contact action.
7. Emergency contacts and medication information are available from one screen.

## Primary Idea

### Working Name

MedCheck Handoff

Note: "MedLens" was considered, but it is already used by healthcare-related products. Keep it off the primary project name unless the team only needs a temporary internal label.

Note: "MedCompanion" was considered, but it is already used by healthcare navigation and AI health explanation products. Avoid it as the public project name.

Note: "MedPilot" was considered, but it is already used by healthcare and home-care management products. Avoid it as the public project name.

Note: "MedMate" was considered, but MedMate and MediMate are already used by telehealth, AI health assistant, medication reminder, care-circle, and medical-record products. Avoid it as the public project name.

### Short Description

A medication companion for older adults that turns confusing medication packages into clear, confirmed routines, with help from caregivers and pharmacists when needed.

### Core Features

- Elder profile with language, accessibility preferences, medication schedule, allergies, pharmacy, doctor, caregivers, and emergency contacts
- Medication package or label scanning
- Plain-language explanation of what the medication appears to be and what the label says
- Large-print and read-aloud mode
- Confirmation step before adding anything to the medication schedule
- Clear uncertainty status for unreadable or ambiguous label text
- Local pharmacist contact path when something is unclear
- Emergency screen with medication list, allergies, contacts, pharmacy, and doctor
- Caregiver summary for new medications, unclear labels, expired products, or requested help

### Product Boundary

The app supports reading, organization, accessibility, and care coordination. It does not replace doctors or pharmacists, does not recommend medication changes, and does not claim clinical accuracy.

## Open Questions

- What is the official hackathon challenge statement?
- Are local Montpellier pharmacy, emergency, or care-service datasets available?
- Which language should the main prototype use: English, French, Dutch, or multilingual?
- Is cloud OCR allowed, or should OCR be local/browser-based?
- Should the first demo prioritize the older adult, caregiver, or pharmacist workflow?

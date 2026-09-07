# Hackathon Brief

## Challenge

- Name: Health & Aging Hackathon
- Organizer:
- Date:
- Location: Montpellier
- Team:

## Problem Statement

Older adults often manage multiple medications with instructions printed in small text on boxes, bottles, and pharmacy labels. These labels can be hard to read, easy to confuse, and difficult to turn into a reliable daily routine. The risk is not only forgetting medication, but misunderstanding unclear instructions, missing expiry dates, mixing up similar packages, or not knowing when to ask a pharmacist or caregiver for help.

Our primary idea is PillPal, an accessibility-first medication companion for elderly users. The app helps an older adult or caregiver manage a pillbox routine, scan a medication package, hear a simple explanation, confirm how it fits into the saved schedule, and ask a caregiver or pharmacist for help when anything is unclear.

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

In under three minutes, the jury should see an elderly-user profile, a daily pillbox view, a medication scan, a large-print explanation, spoken output from the PillPal avatar, uncertainty handling, a schedule match, and a caregiver or pharmacist help path.

Demo story:

1. An elderly user opens today's pillbox view.
2. They see morning, noon, evening, and bedtime compartments.
3. They scan a medication package or pharmacy label.
4. The app identifies whether the medication is part of the saved pillbox schedule.
5. PillPal explains the result in simple spoken language.
6. If something is unclear, the app refuses to guess and prepares a caregiver or pharmacist help action.

## Primary Idea

### Working Name

PillPal

### Short Description

A friendly medication companion for older adults that connects the daily pillbox, medication package scanning, simple spoken explanations, and caregiver or pharmacist help.

### Core Features

- Elder profile with language, accessibility preferences, medication schedule, allergies, pharmacy, doctor, caregivers, and emergency contacts
- Daily pillbox view with morning, noon, evening, and bedtime compartments
- Medication package or label scanning
- Plain-language explanation of what the medication appears to be and how it fits into the saved pillbox schedule
- Large-print and read-aloud mode
- PillPal avatar with idle, scanning, speaking, success, uncertain, and help states
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

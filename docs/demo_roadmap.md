# Dosette — Hackathon Demo & Roadmap Gids

Dit document beschrijft de architectuur, het data-ecosysteem en het stap-voor-stap demonstratiescript voor de jury van het project **Dosette (Smart Pillbox & AI Companion)**.

---

## 1. Concept & Waardepropositie

- **Probleem**: Ouderen en chronisch zieken kampen met polyfarmacie (te veel doosjes door elkaar), onleesbare bijsluiters vol medisch jargon, vergeetachtigheid en angst voor gemiste of dubbele doses. Mantelzorgers hebben geen realtime inzicht in therapietrouw.
- **Oplossing**:
  1. **Smart Pillbox**: Fysiek apparaat met afzonderlijke compartimenten, sensoren, LED-indicatoren en automatische registratie.
  2. **AI Companion App**: Scan-functionaliteit (Vision / Barcode), automatische vertaling naar begrijpelijke taal zonder jargon, Text-to-Speech stemassistentie voor senioren en automatische koppeling aan het juiste compartiment.
  3. **Mantelzorgers Dashboard**: Realtime bevestiging bij tijdige inname (groen vinkje) en automatische waarschuwingsescalatie (SMS/Push/Alarm) bij vertraging (>30 min).

---

## 2. Applicatie Starten

### Webserver & Companion App (Browser)
```bash
npm run app
```
Open in je browser: **[http://localhost:3000](http://localhost:3000)**

### CLI Simulator (Terminal)
In een tweede terminalvenster kun je de hardware en gebeurtenissen simuleren:
```bash
# Apparaatstatus inspecteren
npm run cli status

# Medicijnverpakking scannen
npm run cli scan-pack 3400930000001

# Klepje openen (bevestigt inname + stelt mantelzorger gerust)
npm run cli open-compartment 1

# Compartiment vullen
npm run cli fill-compartment 2 med_001

# Noodalarm simuleren (>30 min vertraging)
npm run cli trigger-alert 3

# Data herstellen naar initiële hackathon status
npm run cli reset
```

---

## 3. Snelle Jury Demo Flow (Pitch in 90 Seconden)

Bovenaan de webapplicatie bevindt zich de **JURY PITCH DEMO FLOW** balk met 1-klik demonstratieknoppen:

### Stap 1: Medicijn Scannen (Vision / OCR)
- **Actie**: Klik op de knop **"1. Scan Doosje"** in de app of voer in de terminal in:
  ```bash
  npm run cli scan-pack 3400930000001
  ```
- **Jury Pitch**: *"Wanneer Jean Dupont of zijn dochter een nieuw doosje Dafalgan 1g in handen heeft, scant de AI Companion de verpakking."*

### Stap 2: AI Begrip & Stemassistentie
- **Actie**: Klik op **"2. AI Begrip & Voice"** (of druk op "Lees voor 🔊" in de kaart).
- **Jury Pitch**: *"In plaats van een 4 pagina's lange bijsluiter in lettergrootte 6, toont en spreekt de AI in één heldere zin: 'Dit is Dafalgan voor je hoofdpijn en koorts. Neem 1 tablet met een groot glas water.' Ideaal voor senioren met verminderd zicht."*

### Stap 3: Pillendoos Synchronisatie
- **Actie**: Klik op **"3. Pillendoos Sync"** of voer in:
  ```bash
  npm run cli fill-compartment 1 med_001
  ```
- **Jury Pitch**: *"De app berekent het ideale innameschema en geeft de fysieke pillendoos de instructie: 'Plaats in Vakje 1 (Ochtend - 08:00)'. De LED op de pillendoos bevestigt de vulling."*

### Stap 4: Inname & Mantelzorgers Zekerheid
- **Actie**: Klik op **"4. Inname & Mantelzorg"** of voer in:
  ```bash
  npm run cli open-compartment 1
  ```
- **Jury Pitch**: *"Om 08:07 opent Jean het ochtendklepje. De sensor detecteert de lediging, sluit het vakje af, en in het mantelzorgdashboard van zijn dochter verschijnt direct een groen vinkje met notificatie: 'Jean heeft Dafalgan 1g tijdig ingenomen om 08:07'."*

### Stap 5: Waarschuwing bij Gemiste Dosis (Bonus)
- **Actie**: Klik op **"🚨 Gemiste Dosis"** of voer in:
  ```bash
  npm run cli trigger-alert 3
  ```
- **Jury Pitch**: *"Vergeet Jean zijn avondmedicatie (Lipitor 20mg)? Na 30 minuten vertraging begint de hardware-LED rood te knipperen en ontvangt de mantelzorger direct een noodsignaal met optie tot direct bellen."*

---

## 4. Datastructuren

Alle gegevens worden lokaal en synchroon beheerd in:
- `data/medications.json`: Medicatiecatalogus, barcodes, kenmerken en AI-uitleg.
- `data/pillbox_status.json`: Hardwarestatus, batterijpercentage (88%), compartimenten, LED-toestanden.
- `data/schedule_and_logs.json`: Patiëntprofiel (Jean Dupont), mantelzorgcontact (+32470123456) en innamelogs.

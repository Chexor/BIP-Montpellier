# Dosette — Smart Pillbox & AI Companion Ecosystem

> Geavanceerd e-health platform dat een fysieke slimme pillendoos (Smart Pillbox) combineert met een toegankelijke AI Companion app voor ouderen, chronisch zieken en mantelzorgers.

---

- `docs/brief.md` - problem statement, constraints, stakeholders, judging criteria
- `docs/poc.md` - focused proof-of-concept scope, demo flow, architecture, and safety rules
- `docs/workplan.md` - team roles, deliverables, development blocks, and demo checklist
- `docs/tasks.md` - active backlog and day-by-day execution checklist
- `docs/decisions.md` - important choices, tradeoffs, and assumptions
- `docs/notes.md` - running notes from talks, mentors, teammates, and testing
- `src/` - application code, prototypes, notebooks, or scripts
- `assets/` - images, mockups, icons, slides, and other media
- `data/` - datasets, exports, samples, and cleaned inputs
- `submission/` - final pitch, demo notes, links, and hand-in files

### 1. Webserver & Companion App starten
```bash
npm run app
```
Open vervolgens in je browser: **[http://localhost:3000](http://localhost:3000)**

### 2. Hardware CLI Simulator (in een tweede terminal)
```bash
# Bekijk huidige status van de pillendoos, batterij en logs
npm run cli status

# Simuleer scannen van medicatiedoosje (Dafalgan 1g)
npm run cli scan-pack 3400930000001

# Simuleer klepje openen (bevestigt inname + stelt mantelzorger gerust)
npm run cli open-compartment 1

# Simuleer vullen van een vakje
npm run cli fill-compartment 2 med_001

# Simuleer gemiste dosis waarschuwing (>30 min te laat)
npm run cli trigger-alert 3

# Herstel alle data naar de initiële hackathon status
npm run cli reset
```

---

## 🌟 Belangrijkste Functies

1. **AI Companion App (Senioren & Patiënten)**:
   - **Vision & Barcode Scanner**: Herkent direct doosjes via camera of barcode.
   - **Begrijpelijke AI-Uitleg**: Vertaalt complexe bijsluiters naar één heldere zin zonder medisch jargon.
   - **Stemassistentie**: Volledige Text-to-Speech (TTS) spraakhulp voor slechtzienden.
   - **Seniorenmodus**: Schakelbaar hoog contrast en extra grote typografie.

2. **Smart Pillbox Hardware Simulator**:
   - 3 fysieke compartimenten (Ochtend 08:00, Middag 12:30, Avond 19:00).
   - LED-indicatoren (groen bij inname, knipperend rood bij vertraging/alarm).
   - Realtime sensordetectie van klepjes en pilinhoud.

3. **Mantelzorgers Dashboard**:
   - Realtime innamelogs met groene vinkjes (`✔ TIJDIG INGENOMEN`).
   - Automatische escalatie (SMS/Alarm) bij vertraging (>30 min).
   - Directe contactmogelijkheid met de patiënt of thuisverpleging.

4. **Realtime Data Synchronisatie**:
   - Alle acties in de CLI zijn direct live zichtbaar in de webapplicatie via Server-Sent Events (SSE).
   - Gedeelde lokale JSON-datastructuren in `data/`.

---

## 📂 Projectstructuur

- `src/cli/` - Node.js TypeScript CLI simulator voor hardware en events
- `src/server/` - Realtime HTTP & SSE API server
- `src/utils/` - Opslag-, notificatie- en databeheerfuncties
- `src/types/` - TypeScript interface definities
- `public/` - Web Companion App (HTML5, Vanilla CSS3, Javascript, Web Speech API)
- `data/` - Lokale JSON datastructuren (`medications.json`, `pillbox_status.json`, `schedule_and_logs.json`)
- `docs/demo_roadmap.md` - Volledig demonstratiescript en pitch flow voor de jury

---

## 🏆 Jury Pitch Demo Flow
Raadpleeg [docs/demo_roadmap.md](file:///c:/Users/boydo/Documents/BIPProject/docs/demo_roadmap.md) voor het 4-stappen demonstratiescript voor de jury.


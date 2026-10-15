# Veria: product context

High-level facts for writing copy and drawing diagrams. If something isn't here, don't claim it.

## The domain in one minute
- A **PSMF** (Pharmacovigilance System Master File) is a long regulatory document, legally required in the EU and UK, describing how a pharmaceutical company (the **MAH**, marketing authorisation holder) monitors the safety of its medicines.
- Structure: a cover, Sections 1–7 (prose: the QPPV, organisation, sources of safety data, computerised systems, processes, performance, quality system) and Annexes A–I (mostly tables: people, partners and contracts, systems, SOP lists, performance figures, audits and CAPAs, products, and Annex I, the logbook of changes).
- The **QPPV** (Qualified Person Responsible for Pharmacovigilance) is accountable for it and signs each version. An EU+UK PSMF has two QPPVs, and both sign.
- A regulator can ask for it at any time and must get a current, complete copy within **7 days**. Inspectors start from it. Common findings: out-of-date content, annexes not updated, a document that doesn't match how the system actually runs.
- Who keeps it: a **PV service provider** maintaining PSMFs for several MAHs, a freelance QPPV, or the MAH's own PV team.

## The problem
- The PSMF contains no original facts. Every fact belongs to someone else: Legal owns partners and contracts, HR the key people, Quality the SOPs, IT and vendors the systems, the PV team the figures.
- The same fact appears in several places (a new partner touches Section 2, Annex B and the logbook), so updates are often partial and the file quietly contradicts itself.
- Changes reach the maintainer late or never. Updating means emails, trackers, merging Word copies, hunting every mention, writing the logbook, and print-sign-scan. It's usually done as a periodic crunch, so the file drifts in between.

## What Veria does (the loop)
1. **Ask.** The PSMF is split into about 90 questions, each with one owner. A revision sends each owner one email with only their questions: "here is what the PSMF says now; is it still right?" Revisions run on a schedule (default every 4 months) or whenever someone starts one, for all questions or just a few.
2. **Answer.** Owners answer from any device, phone included. "No change" is one tap. Otherwise they edit the value, or paste or upload their own spreadsheet. Veria matches the columns, keeps every value exactly as written, and shows the difference before anything is sent. An owner can ask colleagues for input; it is combined into their answer, and a row two people changed is set aside, never silently overwritten.
3. **Check.** Fixed rules run first, then AI. Clean, routine updates go straight into the draft. Anything unclear waits for a person with the reason written down: totals that don't add up, versions going down, dates going backwards, figures for a month not yet over, deleted rows, half-filled rows, any change to key people.
4. **Update everywhere.** A fact is stored once and shown wherever it appears. When a fact changes, Veria finds every paragraph that still mentions the old value (a withdrawn SOP code, a renamed partner) and drafts new wording. A person accepts it.
5. **Sign.** The QPPV sees the whole draft as a redline against the last signed version, with the logbook already drafted, and signs with a fresh code (plus an authenticator app if the organisation requires it). The version is then frozen. Nothing can be signed while something the checks caught is still open. Unanswered questions don't block a version.
6. **Output.** One consistent document in a fixed structure, printed to PDF. It carries no Veria branding: it's the MAH's document.

Plus: **import.** An existing PSMF (Word, with Excel annexes and PDFs) is read in, its parts are mapped into the standard structure (AI proposes, a person confirms), and the whole file is checked for problems: sections that contradict each other, references to annexes that don't exist, template leftovers, overdue CAPAs, tables months behind. Anything not carried over is listed. Nothing disappears silently.

## Trust facts (true, usable)
- Hosted in the EU (Frankfurt).
- AI never writes the PSMF on its own. It sorts answers, drafts text and flags problems; people approve.
- Every change is recorded (who, when, old and new value) in an audit trail nobody can edit.
- Every signed version is kept exactly as signed, and the PSMF can be shown as it was on any past date.
- Access is by invitation only, with an email code for every sign-in (no passwords).
- The one real number: in the stored AI test run, **0 of 45** deliberately broken updates were applied without a person.

## Don't claim
- Connectors to other systems (safety database, HR, DocuSign…). Data from systems arrives as exports pasted or uploaded by people. The true line: "If it exports to a spreadsheet, it goes in."
- Automatic chasing, reminders or deadlines. Veria sends one email per revision.
- Reading PDFs or images. They are stored and attached, not read.
- Certification ("Part 11 / Annex 11 compliant"). The customer validates; Veria provides the controls and evidence.
- Time-saved percentages or customer metrics. There are no customers yet.

## Words to use
PSMF, QPPV, MAH, revision (a round of questions), question, answer, draft, version (major.minor, e.g. 4.3), logbook (Annex I), redline, sign. "PSMF team" is whoever maintains the file; "contributors" or "owners" are the people who answer.

## Fictional cast for examples (keep consistent)
- MAH: **Halvorsen Pharma A/S**, Hellerup, Denmark. PSMF number PSMF-HAL-001, current version 4.3.
- EU QPPV Anna Weber, UK QPPV Oliver Bennett, deputy EU QPPV Ingrid Solberg (formerly Lars Nygaard).
- Maren Dahl (Legal). Case-processing vendor: Nordlys Safety Services.
- Distributors: Medica Nord AS, Baltpharm UAB, and new: Nordvia AB (Sweden, Finland).
- SOP codes like SOP-PV-003 (the MAH's own) and VP-SOP-029 (the vendor's).

## Brand
- Name **Veria**. Logo: an outlined V in a rounded square, stroke in the text colour.
  `<svg viewBox="0 0 32 32"><rect x="1" y="1" width="30" height="30" rx="7.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 9l7 15 7-15" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`
- Brand blue `#0069a8` (`#00a6f4` on dark). Everything else is free to explore.

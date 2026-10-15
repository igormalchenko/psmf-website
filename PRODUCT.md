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

## Vision and direction (from the owner)
Not built yet. Use it as promise and direction, never as a working feature.

**The enemy is mistakes reaching the inspector.** Contradictions inside the document, facts missing from it, facts that are out of date: anything that slips through. A clean, ironed-out PSMF means you're not in trouble. Today professionals keep it clean by spending a lot of time on meaningless operational work.

**What each side gets:**
- MAH: you won't be in trouble for the document you hand over.
- QPPV (also accountable): far more visibility, far less manual work.
- Everyone on the MAH and QPPV side, as the product grows: less and less of the operational busywork.

**Where it's going: the PSMF keeps itself current.** Today Veria still depends on people answering questions and knowing their part. The engine behind it (store each fact once, check every change, update every mention, redline, sign) doesn't have to be fed by hand. The direction:
- Veria pulls changes straight from the systems where the facts already live. Some sources are shared by everyone (e.g. a new PSMF template or guidance published by the EMA, picked up right away instead of weeks later). Others are specific to each customer (their HR system, Legal's contract repository, the QMS); we set these connections up for each customer as a service.
- People at the MAH just do their jobs and keep their own records current. They never touch the PSMF. Systems don't forget: an intern hired and gone in two months is still recorded by the HR system even if a person would forget.
- When sources contradict each other, Veria tells the person who owns them straight away, by email, with no login needed. Example: "I've gathered everything for this cycle and the CVs don't match the org chart. Did one of them not get updated?" The QPPV doesn't chase anyone and doesn't have to see that back-and-forth, though all of it is in the audit trail.
- The only human step left: the QPPV reviews the changes and signs, or doesn't.
- Don't call it "removing the human factor". That sounds alien and off-putting. It's people doing their jobs, and the file following.

**Bigger than one document.** The PSMF is the first and most important piece of automating compliance in pharmacovigilance, not the whole product. Let the reader feel there's more coming, and above all that Veria is here for the long run: a buyer here won't choose a vendor that looks like it could pivot in two weeks. Steady and permanent, not a fast-moving maverick.

**Public direction statement: not decided yet.** Small wins (reading PDFs, automatic reminders) are too weak to announce as the direction. The ambitious line is still open; competitor research should help.

## Trust facts (true, usable)
- Hosted in the EU (Frankfurt).
- AI never writes the PSMF on its own. It sorts answers, drafts text and flags problems; people approve.
- Every change is recorded (who, when, old and new value) in an audit trail nobody can edit.
- Every signed version is kept exactly as signed, and the PSMF can be shown as it was on any past date.
- Access is by invitation only, with an email code for every sign-in (no passwords).
- The one real number: in the stored AI test run, **0 of 45** deliberately broken updates were applied without a person.
- The team has a background in pharmacovigilance, including years of QPPV work. Say it impersonally ("built by people who've done the job"). No names, no "co-founder", no bios.

## Trust: in progress (say as commitment, not as done)
- **EU GMP Annex 11 and FDA 21 CFR Part 11.** Close to compliant, aiming for full compliance and ready to be audited. This is the one worth showcasing: it's the industry's own standard for computerised systems. Built-in controls behind it: an audit trail stored append-only, so past entries can't be edited; frozen signed versions; signing with a fresh code.
- **EU AI Act.** Working toward full compliance. AI assists; it never decides for you.
- **GDPR.** Will be fully compliant, but it's table stakes. Mention it, don't boast.
- The trust section should be a real section that covers all of this and makes it land, not a single "hosted in Frankfurt" line.

## Don't claim (as working today)
- Connectors to other systems (safety database, HR, DocuSign…). Today data from systems arrives as exports pasted or uploaded by people. The true line: "If it exports to a spreadsheet, it goes in." Connecting to customers' systems is fine to present as where Veria is heading.
- Automatic chasing, reminders or deadlines. Veria sends one email per revision.
- Reading PDFs or images. They are stored and attached, not read.
- Finished compliance or certification ("Part 11 / Annex 11 compliant", "AI Act compliant"). Not done yet; see "Trust: in progress". The customer validates; Veria provides the controls and evidence.
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

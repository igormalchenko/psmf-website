# Veria: product context

High-level facts and direction for writing copy and drawing diagrams.

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
Promise and direction. Present the near-term parts as "coming soon".

**The enemy is mistakes reaching the inspector.** Contradictions inside the document, facts missing from it, facts that are out of date: anything that slips through. A clean, ironed-out PSMF means you're not in trouble. Today professionals keep it clean by spending a lot of time on meaningless operational work.

**What each side gets:**
- MAH: you won't be in trouble for the document you hand over.
- QPPV (also accountable): far more visibility, far less manual work.
- Everyone on the MAH and QPPV side, as the product grows: less and less of the operational busywork.

**You'll never miss a change in the rules.** Say this early on the page. When the EU side publishes a new PSMF template or guidance (EMA, EudraVigilance), it reaches your PSMF right away instead of weeks later. Keeping up is still their responsibility; Veria gives them every tool to do the job far better.

**Where it's going: the PSMF keeps itself current.** Today Veria still depends on people answering questions and knowing their part. The engine behind it (store each fact once, check every change, update every mention, redline, sign) doesn't have to be fed by hand. The direction:
- Veria pulls changes straight from the systems where the facts already live: the customer's HR system, Legal's contract repository, the QMS.
- People at the MAH just do their jobs and keep their own records current. They never touch the PSMF. Systems don't forget: an intern hired and gone in two months is still recorded by the HR system even if a person would forget.
- When sources contradict each other, Veria tells the person who owns them straight away, by email, with no login needed. Example: "I've gathered everything for this cycle and the CVs don't match the org chart. Did one of them not get updated?" The QPPV doesn't chase anyone and doesn't have to see that back-and-forth, though all of it is in the audit trail.
- The only human step left: the QPPV reviews the changes and signs, or doesn't.
- Don't call it "removing the human factor". That sounds alien and off-putting. It's people doing their jobs, and the file following.
- How it'll work (internal, not for the site yet): when a new customer joins, an engineer of ours learns how their systems work and connects them. It's part of onboarding, not an upsell or separate revenue. Leave it out of the copy until we talk about this second stage in detail.

**Bigger than one document.** The PSMF is the first and most important piece of automating compliance in pharmacovigilance, not the whole product. Let the reader feel there's more coming, and that Veria is here for the long run: a buyer here won't choose a vendor that looks like it could pivot in two weeks. Steady, not a fast-moving maverick. Keep it implicit; stressing it reads as overcompensating.

**Public direction statement: not decided yet.** Small wins (reading PDFs, automatic reminders) are too weak to announce as the direction. The ambitious line is still open; competitor research should help.

## Trust
The trust section should be a real section that covers all of this and makes it land, not a single "hosted in Frankfurt" line.

- **Built in full compliance with EU GMP Annex 11 and FDA 21 CFR Part 11, ready for your audit.** The one to showcase: it's the industry's own standard for computerised systems. Back it with a short list (or a visual) of the controls a compliance person cares about most: an audit trail stored append-only, so no past entry can be edited; every signed version frozen exactly as signed; signing with a fresh code, plus an authenticator app if required; access by invitation only.
- **EU AI Act.** Compliance coming. AI never writes the PSMF on its own. It sorts answers, drafts text and flags problems; people approve. AI helps; it never decides for you.
- **GDPR.** Mention it, don't boast. It's table stakes.
- Built in the EU: the team is in the EU.
- Hosted in the EU (Frankfurt).
- Every change is recorded (who, when, old and new value). The PSMF can be shown as it was on any past date.
- Access is by invitation only, with an email code for every sign-in (no passwords).
- In the stored AI test run, **0 of 45** deliberately broken updates were applied without a person.
- The team has been in pharmacovigilance for almost a decade, including years of QPPV work. Say it impersonally and lightly ("built by people who've done the job"). No names, no "co-founder", no bios.

## Not built yet (as of this writing; the owner may know better)
- Connectors to other systems. Today data arrives as exports people paste or upload: "If it exports to a spreadsheet, it goes in."
- Automatic chasing or reminders. Veria sends one email per revision.
- Reading PDFs or images. They are stored and attached, not read.
- There are no customers yet, so no customer metrics or time-saved figures.

## Words to use
PSMF, QPPV, MAH, revision (a round of questions), question, answer, draft, version (major.minor, e.g. 4.3), logbook (Annex I), redline, sign. "PSMF team" is whoever maintains the file; "contributors" or "owners" are the people who answer.

## Fictional cast for examples (keep consistent)
- MAH: **Halvorsen Pharma A/S**, Hellerup, Denmark. PSMF number PSMF-HAL-001, current version 4.3.
- EU QPPV Anna Weber, UK QPPV Oliver Bennett, deputy EU QPPV Ingrid Solberg (formerly Lars Nygaard).
- Maren Dahl (Legal). Case-processing vendor: Nordlys Safety Services.
- Distributors: Medica Nord AS, Baltpharm UAB, and new: Nordvia AB (Sweden, Finland).
- SOP codes like SOP-PV-003 (the MAH's own) and VP-SOP-029 (the vendor's).

### The story the homepage tells
One year of Halvorsen's PSMF, with a revision every four months. Keep new examples consistent with it.
- **4.0** in force from 14 October 2025.
- **4.1**, signed 9 February 2026: SOP-PV-011 went to version 5.0 (20 January, Annex E). The revision ran 1–9 February.
- **4.2**, signed 2 June 2026: the vendor upgraded its safety database from 8.2 to 8.4 (14 April, Section 4, Annex D). A new deputy EU QPPV, Ingrid Solberg, waited for approval in the revision.
- **4.3**, signed 8 October 2026 by Anna Weber and Oliver Bennett:
  - Nordvia AB added as a distributor (signed 15 July; Section 2.3, Annex B).
  - VP-SOP-031 withdrawn, replaced by VP-SOP-029 (Annex E, Section 5.3 wording).
  - Annex F figures to September.
  - CAPA-2026-014 (due 31 March) closed.
- 12 November 2026: the inspectorate asks for the PSMF; 4.3 is sent the same morning.
- Examples used once on the page and not part of the timeline: cases processed by Nordlys (not in-house), the logbook is Annex I (not "Annex J"), September totals 2 late + 47 on time = 49, a 15th product, the QPPV office moving from Hellerup to Copenhagen.

## Brand
- Name **Veria**. Logo: an outlined V in a rounded square, stroke in the text colour.
  `<svg viewBox="0 0 32 32"><rect x="1" y="1" width="30" height="30" rx="7.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 9l7 15 7-15" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`
- Brand blue `#0069a8` (`#00a6f4` on dark). Everything else is free to explore.

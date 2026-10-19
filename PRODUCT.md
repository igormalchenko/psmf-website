# Veria: product context

Facts about the product, where it's going, and the fictional cast the site's examples use. How to write and draw for the site is in `CLAUDE.md`. Where this file and the owner disagree, the owner is right: update this file. Items marked *(to confirm)* are waiting for the owner; they're listed in `TODO.md`.

## The domain in one minute
- A **PSMF** (Pharmacovigilance System Master File) is a long regulatory document, legally required in the EU and UK, describing how a pharmaceutical company (the **MAH**, marketing authorisation holder) monitors the safety of its medicines.
- Structure: a cover, a table of contents and a glossary of abbreviations near the front, Sections 1–7 (prose: the QPPV, organisation, sources of safety data, computerised systems, processes, performance, quality system) and Annexes A–I (mostly tables: people, partners and contracts, systems, SOP lists, performance figures, audits and CAPAs, products, and Annex I, the logbook of changes).
- The **QPPV** (Qualified Person Responsible for Pharmacovigilance) is accountable for it and signs each version. An EU+UK PSMF has two QPPVs, and both sign.
- A regulator can ask for it at any time and must get a current, complete copy within **7 days**. Inspectors start from it. Common findings: out-of-date content, annexes not updated, a document that doesn't match how the system actually runs.
- Who keeps it: a **PV service provider** maintaining PSMFs for several MAHs, a freelance QPPV, or the MAH's own PV team.

## Who the site is for
QPPVs, an MAH's head of PV, and PV service providers. "Your PSMF" speaks to all three: to each of them it's the file they're responsible for. That a provider can run many clients' PSMFs is said in the FAQ.

## The problem
- The PSMF contains no original facts. Every fact belongs to someone else: Legal owns partners and contracts, HR the key people, Quality the SOPs, IT and vendors the systems, the PV team the figures.
- The same fact appears in several places (a new partner touches Section 2, Annex B and the logbook), so updates are often partial and the file quietly contradicts itself.
- Changes reach the maintainer late or never. Updating means emails, trackers, merging Word copies, hunting every mention, writing the logbook, and print-sign-scan. It's usually done as a periodic crunch, so the file drifts in between.

## What Veria does (the loop)
1. **Ask.** The PSMF is split into about 90 questions, each with one owner. A revision sends each owner one email with only their questions: "here is what the PSMF says now; is it still right?" Revisions run on a schedule (default every 4 months, the industry norm; never an annual crunch) or whenever someone starts one, for all questions or just a few.
2. **Answer.** Owners answer from any device, phone included. "No change" is one tap. Otherwise they edit the value, or paste or upload their own spreadsheet. Veria matches the columns, keeps every value exactly as written, and shows the difference before anything is sent. An owner can ask colleagues for input; it is combined into their answer, and a row two people changed is set aside, never silently overwritten.
3. **Check.** Fixed rules run first, then AI. Clean, routine updates go straight into the draft. Anything unclear waits for a person with the reason written down: totals that don't add up, versions going down, dates going backwards, figures for a month not yet over, deleted rows, half-filled rows, any change to key people.
4. **Update everywhere.** A fact is stored once and shown wherever it appears. When a fact changes, Veria finds every paragraph that still mentions the old value (a withdrawn SOP code, a renamed partner) and drafts new wording. A person accepts it.
5. **Sign.** The QPPV sees the whole draft as a redline against the last signed version, with the logbook already drafted, and signs with a fresh code (plus an authenticator app if the organisation requires it). The version is then frozen. Nothing can be signed while something the checks caught is still open. Unanswered questions don't block a version.
6. **Whole sections written for you.** The glossary (abbreviations and their meanings, nothing else) and the logbook (Annex I) are generated end to end from the rest of the PSMF and kept in step with it. Where Veria is sure, it fills them in; where it isn't (is "AB" an abbreviation, or part of a company name?), it asks. People only review.
7. **Output.** One consistent document in a fixed structure, printed to PDF. It carries no Veria branding: it's the MAH's document.

Plus: **import.** An existing PSMF (Word, with Excel annexes and PDFs) is read in, its parts are mapped into the standard structure (AI proposes, a person confirms), and the whole file is checked for problems: sections that contradict each other, references to annexes that don't exist, template leftovers, overdue CAPAs, tables months behind. Anything not carried over is listed. Nothing disappears silently.

## Direction (from the owner)
**The enemy is mistakes reaching the inspector.** Contradictions inside the document, facts missing from it, facts that are out of date: anything that slips through. A clean, ironed-out PSMF means you're not in trouble. Today professionals keep it clean by spending a lot of time on meaningless operational work.

**What each side gets:**
- MAH: you won't be in trouble for the document you hand over.
- QPPV (also accountable): far more visibility, far less manual work. They review a PSMF that's essentially done.
- Everyone on the MAH and QPPV side, as the product grows: less and less of the operational busywork.

**Rule changes.** When the EU side publishes a new PSMF template or guidance (EMA, EudraVigilance), it reaches your PSMF right away instead of weeks later. Keeping up is still their responsibility; Veria gives them every tool to do the job far better.

**Facts straight from their sources.** Today Veria still depends on people answering questions. The engine behind it (store each fact once, check every change, update every mention, redline, sign) doesn't have to be fed by hand. The direction:
- Veria pulls changes straight from the systems where the facts already live: the customer's HR system, Legal's contract repository, the QMS.
- People at the MAH just do their jobs and keep their own records current. They never touch the PSMF. Systems don't forget: an intern hired and gone in two months is still recorded by the HR system even if a person would forget.
- When sources contradict each other, Veria tells the person who owns them straight away, by email, with no login needed. Example: "I've gathered everything for this cycle and the CVs don't match the org chart. Did one of them not get updated?" The QPPV doesn't chase anyone and doesn't have to see that back-and-forth, though all of it is in the audit trail.
- The only human step left: the QPPV reviews the changes and signs, or doesn't.
- Internal, not for the site: when a new customer joins, an engineer of ours learns how their systems work and connects them. It's part of onboarding, not an upsell or separate revenue.

**Bigger than one document.** The PSMF is the first and most important piece of automating compliance in pharmacovigilance, not the whole product. The reader should feel there's more coming, and that Veria is here for the long run: a buyer here won't choose a vendor that looks like it could pivot in two weeks. Steady, not a fast-moving maverick. Keep it implicit; stressing it reads as overcompensating.

## Trust facts
- **EU GMP Annex 11 and FDA 21 CFR Part 11.** Built in full compliance with both, ready for the customer's audit *(to confirm: how far validation goes)*. It's the claim compliance buyers care about most. The controls behind it: an audit trail stored append-only, so no past entry can be edited; every signed version frozen exactly as signed; signing with a fresh code, plus an authenticator app if required; access by invitation only.
- **AI.** AI never writes the PSMF on its own. It sorts answers, drafts text and flags problems; people approve. Any AI step can be undone *(to confirm)*. EU AI Act: compliance coming *(to confirm what can be said)*.
- **GDPR.** Compliant *(to confirm)*. Table stakes: mention it, don't boast.
- **Where data lives.** Hosted in the EU, in Frankfurt. AI requests go to Anthropic's API and are processed outside the EU *(to confirm)*. Never claim that data doesn't leave the EU.
- **Records.** Every change is recorded (who, when, old and new value). The PSMF can be shown as it was on any past date.
- **Access.** By invitation only, with an email code for every sign-in. No passwords.
- **EU Data Act.** Customers can leave on 2 months' notice and take all their data with them, free: every version, the audit trail, files, in machine-readable formats (the terms, section 15).
- **Also shown in "Built in the EU…"** (owner, 19 October 2026: all true by launch). Rules: GVP Module II (the PSMF as it was on any past date), Regulation 520/2012 (logbook and archive), eIDAS (signatures in Veria are legally binding EU e-signatures), ALCOA+ by design. Built: AES-256 at rest and TLS in transit, every signed version sealed with SHA-256, two-factor signing (emailed code plus authenticator app), every release tested against its requirements, daily encrypted backups.
- **The team.** In the EU. Almost a decade in pharmacovigilance, including years of QPPV work. Said impersonally and lightly ("people who've done the job"): no names, no "co-founder", no bios.

## Not built yet *(as of 15 October 2026; to confirm)*
- Connectors to other systems. Data arrives as exports people paste or upload: "If it exports to a spreadsheet, it goes in."
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
One year of Halvorsen's PSMF, with a revision every four months.
- **4.0** in force from 14 October 2025.
- **4.1**, signed 9 February 2026: SOP-PV-011 went to version 5.0 (20 January, Annex E). The revision ran 1–9 February.
- **4.2**, signed 2 June 2026: the vendor upgraded its safety database from 8.2 to 8.4 (14 April, Section 4, Annex D). A new deputy EU QPPV, Ingrid Solberg, waited for approval in the revision.
- **4.3**, signed 8 October 2026 by Anna Weber and Oliver Bennett:
  - Nordvia AB added as a distributor (signed 15 July; Section 2.3, Annex B).
  - VP-SOP-031 withdrawn, replaced by VP-SOP-029 (Annex E, Section 5.3 wording).
  - Annex F figures to September.
  - CAPA-2026-014 (due 31 March) closed.
- 12 November 2026: the inspectorate asks for the PSMF; 4.3 is sent the same morning.

### Examples on the page, by section
- `hero`: the page opens as signed 4.2 (distributors Medica Nord and Baltpharm, VP-SOP-031, Annex F figures to May). The three 4.3 changes arrive and are checked: Nordvia AB, VP-SOP-029, figures to September; the logbook counts them and the page becomes 4.3, ready to sign. Then Anna Weber, Ingrid Solberg, safety database 8.4 and the rest keep being checked again.
- `sources`: UK QPPV Oliver Bennett (HR system), Nordvia AB (contracts), safety database 8.4 (a spreadsheet), SOP-PV-003 version 3 (the quality system), Medica Nord AS unchanged (Maren Dahl).
- `everywhere`: VP-SOP-029 replacing 031; a 15th product; the QPPV office moving from Hellerup to Copenhagen.
- `logbook`: "Nordvia AB distributes in Sweden and Finland under an SDEA." SDEA (safety data exchange agreement) goes into the glossary, the 4.3 logbook entry writes itself, and Veria asks whether "AB" is an abbreviation (no, part of the name).
- `rules`: EMA publishes a new PSMF template at 09:00; by 09:02 Section 7 is rewritten, Annex B has a new column and a new annex is added.
- `catch`: Section 2 says cases are processed in-house, Annex B says Nordlys; September figures, 2 late + 47 on time isn't 50; CAPA-2026-014 past due.
- `ai`: SOP-PV-011 to 5.0 (accepted), removing a distributor (rejected), the logbook entry (accepted, then undone).
- `year`: the story above.

## Brand
- Name **Veria**. Logo: an outlined V in a rounded square, stroke in the text colour.
  `<svg viewBox="0 0 32 32"><rect x="1" y="1" width="30" height="30" rx="7.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 9l7 15 7-15" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`
- Brand blue `#0069a8` (`#00a6f4` on dark). EU blue `#003399` and gold `#ffcc00` stand for the regulator. Everything else is free to explore.

# To-dos

## Homepage: raised, not settled
The structure and promises are settled; from here the page is refined, not re-explored. Items marked (Claude) are Claude's.

- First screen ("Your PSMF, up to date every day"): the page in a shaft of light, in a dark room of drifting dust. It opens as signed 4.2; the three 4.3 changes fly in from their sources, are checked on the page and applied; then facts keep arriving and being checked. Debris turns to dust at the page's edge. Waiting for the owner's reaction. Judgement calls to confirm: the source labels (HR, Legal, Vendor, PV team), 4.2's Annex F "Figures to May", Annex I counting "3 new entries", a re-check every 3.5–6 seconds, and a phone showing four rows (EU QPPV and the three that change). (owner)
- "Never miss a change in the rules": the broadcast version (EMA sends, Veria listens and adapts the PSMF) is better than the three cards, but the owner isn't fully happy with it yet. (owner)
- "Change it once. It's right everywhere": does the job but is visually heavy. Raised before page thumbnails replaced the redline card; look again. (owner)
- "Built in the EU…" (compliance): much better, maybe bolder still. The content isn't there yet (see "0 of 45" below). (owner)
- "A year with Veria": unsure whether to stress signed versions. (owner)
- "Before you ask" (questions): content is weak and a bit odd; the design is fine. Low priority. (owner)
- "Never miss a change in the rules" and "Built in the EU…": the EU marks are our own drawings (blue disc, ring of twelve gold stars). There are no official logos for GDPR, the AI Act, Annex 11 or Part 11, and the EU and FDA emblems can't suggest endorsement. Check before launch. (Claude)
- Phone fit: "A year with Veria" has long empty stretches between cards. (Claude)
- Before launch: the "Book a demo" form doesn't send anywhere, and `robots.txt` blocks search engines from the whole site. (Claude)

## Legal pages: drafted 19 October 2026, to check
Privacy policy, Terms, Data processing agreement, Subprocessors and Legal notice are drafts by Claude, not reviewed by a lawyer. Have a Polish lawyer check them before launch, the terms and the DPA above all. (Claude)

- Hosting: the website is on GitHub Pages, but Vercel Web Analytics only runs on sites deployed to Vercel. Move the site to Vercel, or pick other analytics? The privacy policy names both hosts.
- Demo booking: the privacy policy names Calendly and Google Calendar. Update it once the choice is made.
- Contact: every page uses igor@coolstory.me. A veriapv.com address would look more trustworthy to buyers.
- For the lawyer: the EU Data Act lets a customer leave on 2 months' notice to switch provider. The terms keep the current term's fees payable and non-refundable when they do. Is that a lawful early-termination fee, or an obstacle to switching the Act forbids?
- For the lawyer: the liability exclusions (regulatory findings and fines, content the customer approved or signed, unavailability) and the cap at 12 months' fees. Polish law only forbids excluding liability for intentional damage, but check they hold.
- Still Claude's defaults: invoices due in 14 days, price changes 60 days before renewal, complaints answered in 14 days, data deleted 30 days after the export window (backups 30 more), trial data deleted 30 days after the trial.
- EU AI Act, Article 50(2): from 2 August 2026, providers of AI that generates text must mark it as AI-generated in a machine-readable way. Human review doesn't exempt it; "assistive editing" might. The app's drafted wording and logbook entries may be in scope. A product question, not for the terms. (Claude)
- Subprocessors: Vercel is listed as processing in the EU and the US. Which region do the app's functions run in? Resend processes in the US; it may offer an EU sending region worth switching to. Anthropic is listed under standard contractual clauses only, since its Data Privacy Framework certification couldn't be confirmed. Supabase's contracting entity is Supabase Pte. Ltd. (Singapore), per its DPA.
- "Anthropic does not use it to train its models": true under Anthropic's commercial API terms. Confirm Veria uses the API on those terms.
- VAT: the legal notice says exempt under Article 113. Buying services from abroad (Anthropic, Vercel) and selling to EU businesses usually needs VAT-UE registration even when exempt. Ask the accountant.

## Facts to confirm
On the page or in `PRODUCT.md`. The owner confirms or corrects; then fix the page or the file and remove the item.

**Product facts (`PRODUCT.md`)**
- "Not built yet", as of 15 October 2026: connectors to other systems, automatic reminders, reading PDFs and images, no customers yet. Still true? Anything built since?
- Annex 11 and Part 11: "built in full compliance, ready for your audit". How far does validation go, and what can the page say?
- AI and the EU AI Act: PRODUCT.md says "compliance coming"; the page's badge says "Human in charge" and nothing about compliance. What can be said?
- Where data lives: hosted in Frankfurt; AI requests go to Anthropic's API and are processed outside the EU (noted in an old draft, now deleted). Still the setup?
- "0 of 45": what did the stored AI test run cover, and should the page keep it? Today nobody understands the badge.

**On the page**
- The regulator's finding (after "Wherever a fact lives"): "In EMA's 2024 inspections, the PSMF was one of the three most common areas of findings." Source: EMA, *Annual report of the Pharmacovigilance Inspectors' Working Group for 2024* (EMA/INS/PhV/122716/2025), section 3.2. It covers only 10 CHMP-requested inspections; check the wording.
- "Built in the EU…": "GDPR · Compliant".
- "Wherever a fact lives, it reaches your draft": "Veria takes changes from the records your teams already keep", with a contract repository, an HR system and a quality system as sources. Connectors aren't built yet; shown as working under the no-split rule.
- "The last word is always yours": "You see every step, and can undo any of it." Does undo work for every AI step?
- "Before you ask": "What if someone doesn't answer? The version goes ahead. Their part stays as it was." PRODUCT.md only says unanswered questions don't block a version.
- "Before you ask": "We keep PSMFs for several MAHs. Each one runs with its own owners, revisions and signers." Not in PRODUCT.md.
- "Before you ask": "Does Veria replace our QPPV or PV provider? No. Whoever keeps your PSMF today keeps it in Veria." Positioning; confirm.

## Later
- The pages you'd expect on a site like this: feature drill-downs and so on. Not a concern right now.
- Competitor comparison pages: the industry-standard "Veria vs X" pages, with comparison tables.

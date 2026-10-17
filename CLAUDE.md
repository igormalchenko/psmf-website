# Veria marketing site

Marketing pages for Veria, a SaaS that keeps a pharmaceutical company's PSMF current. Drafts and experiments: static HTML, CSS and JS, no build step. Pages open straight from the file system.

## Rules
- Read `PRODUCT.md` when copy or a diagram needs product facts. It's the whole product context; don't go looking for more.
- Don't make up statistics. The owner fact-checks everything else.
- Promise and direction are encouraged. Make a bigger, vaguer promise, then back it up nearby with how Veria delivers it or why it can be trusted to. Copy that only states today's facts reads as if our hands are tied.
- Sell the value, not the machinery. One promise per page or section, said plainly.
- Nobody reads passages. Per section: a headline, at most one short line under it, and a visual (SVG, mockup, diagram) that does the explaining. Labels in visuals are a few words, not sentences. If it needs a paragraph, it needs a picture instead. v1–v6 are the reference for how little copy a section carries.
- Each section fits in one real viewport: assume about 700px of height on a laptop (browser bars, bookmarks bar, dock, fixed nav). No section should need scrolling through to see it whole.
- Copy: short, concrete, no marketing filler, nothing that reads as AI-written. No meta-commentary on the page itself.
- Libraries from cdnjs/jsdelivr with pinned versions (GSAP is the usual choice). Respect `prefers-reduced-motion`. Check phone width: no sideways scroll.
- Don't create `.md` files on your own initiative. Only when the owner explicitly asks for one.
- Ship every change straight to prod without asking: commit to `main` and push. No branches, no PRs. These are low-risk drafts.

## How we work
- Collaboratively. The owner leads with reactions, even vague ones ("trust still reads thin"). Turn them into small options they can judge in seconds: two or three headlines, a visual described in a sentence. Build only what's been agreed, one section or question per round. Say what you think, as one voice in the conversation, not as a finished proposal. Don't run ahead with plans, files or builds.
- In layers, top-down: narrative (which sections, in what order, one promise each, what's missing), then copy, then illustrations, then overall design, then polish. Don't polish a section whose promise may still change.
- Keep the process light. No per-section file splits, status trackers or lab pages unless the owner asks.
- Open threads and claims waiting for the owner's fact-check live in `TODO.md`. Add to it when something is raised and not settled; remove items once settled.

## The homepage
- The root page (`index.html`, `v9.css`, `v9.js`) is the one draft being refined. It was built as v9 on the page structure below. Earlier drafts are archived at `/v1/` to `/v8/` and listed at `/drafts/`.
- Don't create new vN folders: git is the history. Make a snapshot folder only when the owner asks to compare two versions side by side.
- Sections by id, which is how the owner refers to them: `hero`, `how`, `people`, `everywhere`, `catch`, `rules`, `year`, `stop`, `trust`, `faq`, `demo`. Each has a numbered block in `v9.css` and its own function in `v9.js`.
- The fictional story the page tells (versions, dates, which change went into which version) is in `PRODUCT.md` under the cast. Keep new examples consistent with it.
- Checking in the desktop app's browser pane: when the pane is hidden, timers, animation frames and IntersectionObserver are throttled. To see an animated end state, pause `gsap.globalTimeline` and step it with `.time()`, or add the end-state classes by hand. After moving files, reload with a query string (`?fresh=1`) to skip the cache.

## Page structure (agreed for the landing page)
Each screen answers a different question the reader has at that point. A promise is shown once.
1. **Hero:** the core promise and one visual.
2. **How it works:** one screen, the loop as numbered steps. Labels only, no examples.
3. **What powers it:** 3–4 screens, one differentiator each, each with its own example. Where Veria is going is woven into these screens. Never a separate "vision" or "where we're going" section.
4. **Life with Veria:** what changes for the reader (A year with Veria, What you stop doing).
5. **Trust:** one bold screen. State it, don't ask for it: built in the EU, hosted in the EU, made for EU rules, ready for any inspector.
6. **FAQ:** objections not answered anywhere else on the page, one line each.
7. **CTA.**

The summary names the steps; feature screens show depth. No example appears in both, and feature screens don't reuse each other's examples (same fictional cast, different facts).

## Taste (from the owner)
- Likes: grainy backgrounds, slow "breathing" motion, utilitarian craft that feels expensive, visuals that explain instead of decorate.
- Dislikes: walls of text, crypto-style frantic motion, generic SaaS tropes.

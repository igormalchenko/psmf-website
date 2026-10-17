# Veria marketing site

The marketing site for Veria, a SaaS that keeps a pharmaceutical company's PSMF current. Static HTML, CSS and JS, no build step; pages open straight from the file system. Served at veriapv.com.

## Where we are
The homepage's structure and promises are settled (17 October 2026). From here we refine and iterate on it rather than explore new directions, unless the owner asks for one. The hero's visual is the one open exploration.

## How we work
- The owner scrolls the page and reacts, often to several things at once. Turn the reactions into changes.
- A clear ask gets done, batches included, then shown. Don't ask permission for what was asked.
- An open question ("this feels off", "I don't know how") gets your honest read and one recommendation. Build it once the owner agrees, or draft it when they ask to see it.
- Don't settle structure, promises or claims the owner hasn't settled. Say what you'd change and why; they decide.
- Small, certain fixes (a broken layout, a typo, a clash with a rule below) need no discussion.
- `TODO.md` is the one open list: what was raised and not settled (say who raised it), and claims waiting for the owner's fact-check. Remove items once settled.
- Ship every change straight to prod without asking: commit to `main` and push. No branches, no PRs.
- Keep the process light: no status trackers, lab pages or per-section files. Don't create `.md` files unless the owner asks. Make a side-by-side snapshot folder only when the owner asks to compare two versions.

### When the owner asks you to get a feel for something first
This is how the `rules` rework went well on 17 October 2026, after a first attempt failed.
1. **Look before you ask.** Open the section in the browser, in its finished state, and say concretely what fails and why, in the owner's terms ("nothing happens", "the change itself is invisible"). Your read comes first.
2. **Ask open questions grounded in that read and in the owner's own words.** Each one should only make sense for this section. No multiple-choice menus: a form with ready-made answers decides the answer space before the owner has spoken. Don't re-ask what's already settled (in this file, `PRODUCT.md` or the conversation).
3. **Listen for the product truth.** The owner's answers carry the real story (what the feature prevents, what failure looks like today). Build the visual on that, not on the old visual.
4. **Say the concept in a few lines, then build it.** Name the judgement calls you made (a source you chose, illustrative numbers) so the owner can overrule them.
5. **Build in place, check at laptop and phone width, push, and report plainly**, including anything you couldn't verify. The old version stays in git.

The failed first attempt asked four generic questions ("what should they feel", "how loud", "main moment", "is the copy the problem") through a multiple-choice form, before looking at the section. They would have fit any section, and they re-opened settled copy.

## Sources
- `PRODUCT.md`: product facts, direction, the fictional cast, brand. Read it when copy or a visual needs a product fact. Where it and the owner disagree, the owner is right: update the file.
- `COMPETITORS.md`: read it only when the owner asks about competitors.
- Don't make up statistics. New factual claims go on the fact-check list in `TODO.md`.

## Copy
- One promise per section, said plainly. Sell the value, not the machinery.
- Promise big, then back it up nearby with how Veria delivers it. The page talks as if all of it works now: no today/next split, no "coming soon". `PRODUCT.md`'s "Not built yet" is for fact-checking, not for the copy.
- The PSMF is the output, never the actor. Copy never has it doing things ("keeps itself up to date", "follows"). Describe it ("Your PSMF, up to date every day"), or make the reader the one acting.
- Headlines speak to the reader and most open with the action ("Find it before the inspector does.", "Never miss a change in the rules."). No "You'll".
- No tactical details up front. "One short email" or "hosted in Frankfurt" are mechanics, not promises; if they appear at all, they go deep in the page (trust, FAQ).
- The direction is never "removing the human factor". It's people doing their jobs, and the file following.
- Nobody reads passages. Per section: a headline, at most one short line under it, and a visual that does the explaining. Labels in visuals are a few words. The current homepage is the reference for how little copy a section carries.
- Short, concrete, no marketing filler, nothing that reads as AI-written, no meta-commentary on the page itself.

## Visuals
- Each feature section has its own visual idea, in one shared design language: `sources` converge, `catch` scans, `everywhere` ripples, `logbook` compiles (whole sections written from the content), `ai` is a gate, `rules` is a broadcast (the regulator sends, Veria listens and adapts). Don't repeat a pattern across features (a redlined sentence, section-number labels, status chips, accept buttons): things that look 95% the same read as one feature.
- Each kind of thing looks like what it is, and the same everywhere: the regulator in EU blue and gold, a PSMF as a paper page, the Veria app as a white window with the logo. Different kinds of things never share a card design.
- Leave out meta info that changes nothing (document IDs, "draft of 4.3").
- Proof (a quote, a statistic) gets its own beat. It never competes with a feature's explanation on the same screen.
- Each section fits one real viewport: about 700px of height on a laptop. Check phone width (375px): no sideways scroll.
- Taste: slow "breathing" motion, utilitarian craft that feels expensive, visuals that explain instead of decorate. No walls of text, no frantic crypto-style motion, no generic SaaS tropes.
- Libraries from cdnjs or jsdelivr with pinned versions (GSAP is the usual choice). Respect `prefers-reduced-motion`.

## The homepage
- `index.html`, `site.css`, `site.js`. Each section has a numbered block in `site.css` and its own function in `site.js`. Class names are global: check a new one isn't already used (`.punch` once broke the year's 12 November card).
- Sections by id, which is how the owner refers to them, and the promise each one carries:
  - `hero`: your PSMF, up to date every day.
  - `stop`: what you stop doing. You review, you sign.
  - `how`: from every source to a version you sign, in four steps (facts come in, checked, placed everywhere, you sign). Labels only, no examples.
  - `sources` (step 1): wherever a fact lives, it reaches your draft.
  - `proof`: the regulator's own finding on PSMF inspections, on its own. It sets up `catch`.
  - `catch` (step 2): find it before the inspector does; nothing open gets signed.
  - `everywhere` (step 3): change it once, it's right everywhere.
  - `logbook` (step 3, a level up): never write the logbook again, or the glossary.
  - `ai` (step 4): the last word is always yours.
  - `rules`: never miss a change in the rules. Beyond the loop, so it comes after the four steps.
  - `year`: a year with Veria. Everything planned, nothing piles up.
  - `trust`: built in the EU, hosted in the EU, made for EU rules, ready for any inspector.
  - `faq`: objections not answered elsewhere, one line each.
  - `demo`: a promise only Veria can make, not an audit.
- The feature sections follow the four steps of `how`, in that order.
- A promise is shown once. Where Veria is going is woven into the feature sections, never a separate "vision" section.
- Examples come from the fictional cast and story in `PRODUCT.md`, which also lists what each section uses. Avoid repeating an example across feature sections.
- Old drafts live at `/v1/` to `/v7/`, listed at `/drafts/`. They're no longer a reference; git has every other version.
- Checking in the desktop app's browser pane: when the pane is hidden, timers, animation frames and IntersectionObserver are throttled. To see an animated end state, pause `gsap.globalTimeline` and step it with `.time()`, or add the end-state classes by hand. After changing CSS or JS, fetch it with `cache: 'reload'` and reload the page with a query string (`?fresh=1`).

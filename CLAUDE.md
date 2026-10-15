# Veria marketing site

Marketing pages for Veria, a SaaS that keeps a pharmaceutical company's PSMF current. Drafts and experiments: static HTML, CSS and JS, no build step. Pages open straight from the file system.

## Rules
- Read `PRODUCT.md` when copy or a diagram needs product facts. It's the whole product context; don't go looking for more.
- Never invent features, integrations or numbers. If `PRODUCT.md` doesn't support it, don't present it as working today. Fictional examples are fine; invented statistics are not.
- Promise and direction are allowed, and encouraged. Make a bigger, vaguer promise, then back it up nearby with how Veria delivers it or why it can be trusted to. Talk about where the product is heading (see "Vision and direction" in `PRODUCT.md`), framed as direction rather than as a shipped feature. Copy that only states today's facts reads as if our hands are tied.
- Sell the value, not the machinery. One promise per page or section, said plainly.
- Copy: short, concrete, no marketing filler, nothing that reads as AI-written. No meta-commentary on the page itself.
- Libraries from cdnjs/jsdelivr with pinned versions (GSAP is the usual choice). Respect `prefers-reduced-motion`. Check phone width: no sideways scroll.
- Don't create `.md` files on your own initiative. Only when the owner explicitly asks for one.
- Ship every change straight to prod without asking: commit to `main` and push. No branches, no PRs. These are low-risk drafts.

## Taste (from the owner)
- Likes: grainy backgrounds, slow "breathing" motion, utilitarian craft that feels expensive, visuals that explain instead of decorate.
- Dislikes: walls of text, crypto-style frantic motion, generic SaaS tropes.

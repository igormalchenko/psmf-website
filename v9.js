// Veria v9: v8 rebuilt on the agreed page structure (see CLAUDE.md).
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const SVG = "http://www.w3.org/2000/svg";
  const svgEl = (tag, attrs, parent) => {
    const n = document.createElementNS(SVG, tag);
    Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
    if (parent) parent.append(n);
    return n;
  };

  // Plays a timed sequence each time an element comes into view, and resets it
  // once it has left, so it plays again on the way back.
  function sequence(el, steps, reset, threshold = 0.4) {
    if (reduce) { steps.forEach(([, fn]) => fn()); return; }
    let tl = null;
    const io = new IntersectionObserver(([e]) => {
      if (e.intersectionRatio >= threshold && !tl) {
        tl = gsap.timeline();
        steps.forEach(([t, fn]) => tl.call(fn, null, t));
      } else if (!e.isIntersecting && tl) {
        tl.kill();
        tl = null;
        reset();
      }
    }, { threshold: [0, threshold] });
    io.observe(el);
  }

  // Runs a loop only while its element is on screen.
  function whileVisible(el, start, stop) {
    let on = false;
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !on) { on = true; start(); }
      else if (!e.isIntersecting && on) { on = false; stop(); }
    }, { threshold: 0.15 }).observe(el);
  }

  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    stars();
    nav();
    hero();
    chores();
    flow();
    sources();
    ownersMap();
    rules();
    catcher();
    ai();
    year();
    trust();
  });

  // ---------------------------------------------------------------------------
  // A ring of twelve gold stars, for anything that stands for the EU.
  // ---------------------------------------------------------------------------
  function stars() {
    $$("svg.stars").forEach((svg) => {
      const c = svg.viewBox.baseVal.width / 2, R = +svg.dataset.r, s = +svg.dataset.s;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2, x = c + R * Math.cos(a), y = c + R * Math.sin(a);
        const pts = [];
        for (let k = 0; k < 10; k++) {
          const r = k % 2 ? s * 0.4 : s, b = -Math.PI / 2 + (k * Math.PI) / 5;
          pts.push(`${(x + r * Math.cos(b)).toFixed(2)},${(y + r * Math.sin(b)).toFixed(2)}`);
        }
        svgEl("polygon", { points: pts.join(" ") }, svg);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Nav: solid once scrolled, light text over dark sections.
  // ---------------------------------------------------------------------------
  function nav() {
    const el = $("#nav");
    const darks = $$(".dark");
    const update = () => {
      el.classList.toggle("scrolled", scrollY > 8);
      const y = el.offsetHeight / 2;
      el.classList.toggle("on-dark", darks.some((d) => { const r = d.getBoundingClientRect(); return r.top <= y && r.bottom > y; }));
    };
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
  }

  // ---------------------------------------------------------------------------
  // 1. Hero: facts and file debris drift; the debris fades, the facts settle
  //    into their rows of the PSMF.
  // ---------------------------------------------------------------------------
  function hero() {
    const field = $("#field"), doc = $("#heroDoc"), status = $("#docStatus"), copy = $(".hero-copy");
    const done = () => {
      doc.classList.add("final");
      $$(".row", doc).forEach((r) => r.classList.add("in"));
      status.classList.add("done");
      status.querySelector("span").textContent = "Checked · ready to sign";
    };
    if (reduce) { done(); return; }

    const FACTS = [
      { k: "dist", src: "Legal", text: "New distributor: Nordvia AB" },
      { k: "deputy", src: "HR", text: "Deputy EU QPPV: Ingrid Solberg" },
      { k: "sop", src: "Vendor", text: "VP-SOP-029 replaces 031" },
      { k: "qppv", src: "PSMF team", text: "EU QPPV: Anna Weber" },
      { k: "figs", src: "PV team", text: "September figures" },
      { k: "db", src: "Vendor", text: "Safety database 8.4" },
    ];
    const NOISE = [
      ["XLSX", "Annex_B_v3_FINAL (2)"], ["Mail", "Re: Fwd: deputy QPPV?"], ["XLSX", "tracker_Q3"],
      ["PDF", "org_chart_old"], ["PDF", "PSMF_4.2_signed_scan"], ["Mail", "Who owns Annex D?"],
      ["DOCX", "PSMF_draft_AW_edits"], ["Mail", "Re: Re: figures?"], ["XLSX", "SOP list 2024"],
    ];
    // On a phone there's no room around the page: no debris, and the facts
    // come in from the edges of the screen.
    const small = innerWidth < 640;
    const noise = small ? [] : NOISE.slice(0, 7);

    const rowOf = (k) => $(`.row[data-k="${k}"]`, doc);
    const make = (cls, tag, text) => {
      const c = document.createElement("div");
      c.className = `chip ${cls}`;
      c.innerHTML = `<b>${tag}</b>${text}`;
      field.append(c);
      return c;
    };
    const facts = FACTS.map((f) => ({ ...f, el: make("fact", f.src, f.text) }));
    const debris = noise.map(([t, n]) => make("noise", t, n));

    // Scatter, keeping clear of the headline and of each other.
    const F = field.getBoundingClientRect();
    const rectOf = (el, pad) => { const r = el.getBoundingClientRect(); return { l: r.left - F.left - pad, t: r.top - F.top - pad, r: r.right - F.left + pad, b: r.bottom - F.top + pad }; };
    const keepOut = [rectOf(copy, 16), rectOf(doc, 8)];
    const placed = [];
    const hit = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
    // Chips may hang off the left and right edges, as if drifting in from outside.
    const place = (el, depth) => {
      const w = el.offsetWidth, h = el.offsetHeight;
      let best = null;
      for (let i = 0; i < 300; i++) {
        const x = rand(-w * 0.3, F.width - w * 0.7), y = rand(72, Math.max(73, F.height - h - 12));
        const box = { l: x - 12, t: y - 10, r: x + w + 12, b: y + h + 10 };
        if (keepOut.some((k) => hit(box, k))) continue;
        if (!best) best = { x, y };
        if (!placed.some((p) => hit(box, p))) { best = { x, y }; placed.push(box); break; }
      }
      if (!best) best = { x: rand(0, F.width - w), y: rand(F.height * 0.8, F.height - h) };
      gsap.set(el, { x: best.x, y: best.y, scale: 0.8 + 0.28 * depth, opacity: 0, rotation: rand(-4, 4), filter: depth < 0.4 ? `blur(${(0.4 - depth) * 4}px)` : "none" });
      gsap.to(el, { opacity: 0.35 + 0.65 * depth, duration: 1.2, delay: rand(0, 0.6) });
      return gsap.to(el, { x: best.x + rand(-18, 18), y: best.y + rand(-12, 12), rotation: rand(-3, 3), duration: rand(4.5, 7.5), ease: "sine.inOut", yoyo: true, repeat: -1 });
    };
    if (small) {
      facts.forEach((f, i) => {
        const r = rowOf(f.k).getBoundingClientRect();
        const left = i % 2 === 0, w = f.el.offsetWidth;
        gsap.set(f.el, { x: left ? -w * 0.7 : F.width - w * 0.3, y: r.top - F.top + rand(-90, 40), rotation: rand(-4, 4), opacity: 0 });
        f.drift = gsap.to(f.el, { y: "+=8", duration: 3, yoyo: true, repeat: -1, ease: "sine.inOut" });
      });
    } else facts.forEach((f) => { f.drift = place(f.el, rand(0.7, 1)); });
    debris.forEach((el) => { el.drift = place(el, rand(0.1, 0.6)); });

    const land = (row) => {
      row.classList.add("in", "lit");
      setTimeout(() => row.classList.remove("lit"), 900);
    };

    const tl = gsap.timeline({ delay: small ? 0.8 : 2.2 });
    debris.forEach((el, i) => tl.add(() => el.drift.kill(), 0).to(el, { opacity: 0, scale: 0.85, filter: "blur(6px)", duration: 1.4, ease: "power1.in" }, i * 0.12));
    facts.forEach((f, i) => {
      const t = 0.5 + i * 0.42;
      tl.add(() => {
        f.drift.kill();
        const Fr = field.getBoundingClientRect();
        const r = rowOf(f.k).querySelector("dd").getBoundingClientRect();
        const tx = r.left - Fr.left - 10, ty = r.top - Fr.top + r.height / 2 - f.el.offsetHeight / 2;
        gsap.to(f.el, { x: tx, duration: 1.15, ease: "power2.inOut" });
        gsap.to(f.el, { y: ty, duration: 1.15, ease: "power3.in" });
        gsap.to(f.el, { rotation: 0, scale: 0.92, opacity: 1, filter: "none", duration: 0.9 });
        gsap.to(f.el, { opacity: 0, scale: 0.86, duration: 0.35, delay: 1.1, onStart: () => land(rowOf(f.k)), onComplete: () => f.el.remove() });
      }, t);
    });
    tl.add(() => land(rowOf("log")), 0.5 + FACTS.length * 0.42 + 1.1);
    tl.add(() => {
      status.classList.add("done");
      status.querySelector("span").textContent = "Checked · ready to sign";
      debris.forEach((el) => el.remove());
      gsap.to(doc, { y: -6, duration: 4, ease: "sine.inOut", yoyo: true, repeat: -1 });
    }, "+=0.6");
  }

  // ---------------------------------------------------------------------------
  // 3. How it works: the four steps, one after another. Labels only.
  // ---------------------------------------------------------------------------
  function flow() {
    const list = $("#flowSteps"), steps = $$(".st", list), bar = $("#flowBar"), rail = bar.parentElement;
    const items = $$(".v-src .it", list), check = $(".v-check", list), place = $(".v-place", list), seal = $(".v-seal", list);
    const lineW = () => rail.offsetWidth;
    const activate = (i) => steps.forEach((s, j) => { s.classList.toggle("on", j === i); s.classList.toggle("done", j < i); });
    const fill = (f) => gsap.to(bar, { width: lineW() * f, duration: 1.2, ease: "power2.inOut" });
    sequence(list, [
      [0, () => {
        list.classList.add("run");
        activate(0);
        if (!reduce) gsap.from(items, { y: -50, opacity: 0, duration: 0.8, stagger: 0.14, ease: "back.out(1.6)", clearProps: "opacity,y" });
      }],
      [1.3, () => fill(0.25)],
      [1.7, () => { activate(1); check.classList.add("checked"); }],
      [3.0, () => fill(0.5)],
      [3.4, () => { activate(2); place.classList.add("placed"); }],
      [4.9, () => fill(0.75)],
      [5.3, () => { activate(3); seal.classList.add("stamped"); }],
      [6.5, () => { fill(1); list.classList.remove("run"); steps.forEach((s) => s.classList.remove("on", "done")); }],
    ], () => {
      list.classList.remove("run");
      steps.forEach((s) => s.classList.remove("on", "done"));
      check.classList.remove("checked");
      place.classList.remove("placed");
      seal.classList.remove("stamped");
      gsap.set(bar, { width: 0 });
    });
    if (reduce) gsap.set(bar, { width: "100%" });
  }

  // ---------------------------------------------------------------------------
  // 4. Sources: facts arrive from a contract system, the HR system, a
  //    spreadsheet and a person; each is checked and lands in its place.
  // ---------------------------------------------------------------------------
  function sources() {
    const feed = $("#feed"), rows = $$(".fd", feed);
    const steps = [];
    rows.forEach((r, i) => {
      steps.push([0.2 + i * 0.45, () => r.classList.add("in")]);
      steps.push([1.3 + i * 0.45, () => r.classList.add("ok")]);
    });
    sequence(feed, steps, () => rows.forEach((r) => r.classList.remove("in", "ok")), 0.3);
  }

  // ---------------------------------------------------------------------------
  // 5. Change it once: owners → the parts of the PSMF their answers appear in
  //    (from Veria's template: about 90 questions, each with one owner), and
  //    the sentence Veria redrafts.
  // ---------------------------------------------------------------------------
  function ownersMap() {
    const root = $("#map"), svg = $("#mapSvg");
    const PLACES = ["Cover", "Section 1", "Section 2", "Section 3", "Section 4", "Section 5", "Section 6", "Section 7",
      "Annex A", "Annex B", "Annex C", "Annex D", "Annex E", "Annex F", "Annex G", "Annex H", "Annex I"];
    const LOG = 16;
    // [owner, questions, {place: questions that land there}]
    const OWNERS = [
      ["Management", 2, { 2: 2 }],
      ["PSMF team", 17, { 0: 4, 1: 6, 2: 2, 3: 1, 5: 1, 7: 2, 8: 3 }],
      ["Legal", 3, { 2: 2, 9: 2 }],
      ["Regulatory", 10, { 0: 3, 1: 2, 2: 2, 5: 2, 13: 2, 15: 3 }],
      ["PV team", 20, { 3: 4, 5: 4, 6: 4, 8: 1, 9: 2, 10: 1, 13: 4 }],
      ["IT", 1, { 4: 1, 11: 1 }],
      ["Vendors", 24, { 3: 2, 4: 1, 5: 2, 6: 1, 7: 3, 9: 1, 11: 1, 12: 1, 13: 13 }],
      ["Quality", 13, { 3: 1, 7: 5, 12: 1, 14: 6 }],
    ];
    // Each example: where the fact lands, and the sentence Veria redrafts.
    const EXAMPLES = [
      { o: 6, ans: "VP-SOP-029 replaces 031", short: "VP-SOP-029", to: [12, 5], loc: "Section 5.3", text: ["Literature is searched weekly under ", "VP-SOP-031", "VP-SOP-029", "."] },
      { o: 3, ans: "+1 product", to: [15, 0, 2], loc: "Section 2.1", text: ["It holds marketing authorisations for ", "14", "15", " medicinal products."] },
      { o: 1, ans: "QPPV office: Copenhagen", short: "Copenhagen", to: [1, 2], loc: "Section 1.3", text: ["The EU QPPV works from the office in ", "Hellerup", "Copenhagen", "."] },
    ];
    const prose = $("#prose"), prLoc = $("#prLoc"), prP = $("#prP");

    let L = null, ex = 0, timer = 0, pinned = -1, running = false, tw = [];
    const g = {};
    const T = (t) => (tw.push(t), t);
    const killAll = () => { tw.forEach((t) => t.kill()); tw = []; };
    function build() {
      svg.innerHTML = "";
      const W = root.clientWidth, H = root.clientHeight;
      const narrow = W < 520;
      const ox = narrow ? 102 : Math.min(150, W * 0.2), px = narrow ? W - 76 : W - 128;
      svg.classList.toggle("narrow", narrow);
      const top = 12, bot = H - 12;
      const py = PLACES.map((_, i) => lerp(top, bot, i / (PLACES.length - 1)));
      const span = Math.min(bot - top, OWNERS.length * (narrow ? 46 : 50));
      const oy = OWNERS.map((_, i) => (top + bot) / 2 - span / 2 + (span * i) / (OWNERS.length - 1));
      const mid = (ox + px) / 2;
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      g.lines = svgEl("g", {}, svg);
      g.extra = svgEl("g", {}, svg);
      g.pulses = svgEl("g", {}, svg);
      const lines = [];
      OWNERS.forEach(([, , ps], o) => Object.entries(ps).forEach(([p, n]) => {
        p = +p;
        const d = `M${ox + 6} ${oy[o]}C${mid} ${oy[o]} ${mid} ${py[p]} ${px - 6} ${py[p]}`;
        lines.push({ o, p, el: svgEl("path", { d, class: "ln", "stroke-width": 1 + Math.min(n, 6) * 0.45 }, g.lines) });
      }));
      svgEl("rect", { x: px - 9, y: top - 10, width: 18, height: bot - top + 20, rx: 9, class: "spine" }, svg);
      const places = PLACES.map((name, p) => {
        const dot = svgEl("circle", { cx: px, cy: py[p], r: 4, class: "pl-dot" }, svg);
        const t = svgEl("text", { x: px + 16, y: py[p] + 4, class: "pl-lbl" }, svg);
        t.textContent = narrow ? name.replace("Section ", "Sect. ") : p === LOG ? "Annex I · logbook" : name;
        return { dot, t };
      });
      const owners = OWNERS.map(([name], o) => {
        const og = svgEl("g", { class: "owner", tabindex: 0, role: "button", "aria-label": `${name}: show where their answers appear` }, svg);
        svgEl("circle", { cx: ox, cy: oy[o], r: 6, class: "on-dot" }, og);
        const t = svgEl("text", { x: ox - 14, y: oy[o] + 5, "text-anchor": "end", class: "on-lbl" }, og);
        t.textContent = name;
        og.addEventListener("mouseenter", () => pin(o));
        og.addEventListener("focus", () => pin(o));
        og.addEventListener("click", () => pin(o));
        og.addEventListener("mouseleave", unpin);
        og.addEventListener("blur", unpin);
        return { g: og, t };
      });
      L = { W, H, ox, px, oy, py, mid, lines, places, owners, narrow };
    }

    function clear() {
      killAll();
      L.lines.forEach((l) => l.el.classList.remove("hi"));
      L.places.forEach((p) => { p.dot.classList.remove("hi"); p.t.classList.remove("hi"); });
      L.owners.forEach((o) => { o.g.classList.remove("hi"); o.t.classList.remove("hi"); });
      g.extra.innerHTML = "";
      g.pulses.innerHTML = "";
    }
    const lightPlace = (p) => { L.places[p].dot.classList.add("hi"); L.places[p].t.classList.add("hi"); };
    const lightOwner = (o) => { L.owners[o].g.classList.add("hi"); L.owners[o].t.classList.add("hi"); };

    function show(e) {
      clear();
      lightOwner(e.o);
      const paths = L.lines.filter((l) => l.o === e.o && e.to.includes(l.p));
      paths.forEach((l) => l.el.classList.add("hi"));
      // The answer, on its way; the logbook line Veria drafts from it.
      const ay = lerp(L.oy[e.o], e.to.reduce((s, p) => s + L.py[p], 0) / e.to.length, 0.5);
      const ag = svgEl("g", { class: "ans", opacity: 0 }, g.extra);
      const at = svgEl("text", { x: L.mid, y: ay + 4.5, "text-anchor": "middle" }, ag);
      at.textContent = L.narrow && e.short ? e.short : e.ans;
      const w = at.getComputedTextLength() + 22;
      ag.insertBefore(svgEl("rect", { x: L.mid - w / 2, y: ay - 13, width: w, height: 26, rx: 8 }), at);
      const logPath = svgEl("path", { d: `M${L.mid + w / 2} ${ay}C${L.px - 60} ${ay} ${L.px - 60} ${L.py[LOG]} ${L.px - 6} ${L.py[LOG]}`, class: "ln hi log", "stroke-width": 1.5, opacity: 0 }, g.extra);
      const [pre, was, now, post] = e.text;
      prose.classList.remove("red", "ok", "dim");
      prLoc.textContent = e.loc;
      prP.innerHTML = `${pre}<s>${was}</s> <ins>${now}</ins>${post}`;
      if (reduce) { ag.setAttribute("opacity", 1); logPath.setAttribute("opacity", 1); e.to.concat(LOG).forEach(lightPlace); prose.classList.add("red", "ok"); return; }
      T(gsap.delayedCall(1.7, () => prose.classList.add("red")));
      T(gsap.delayedCall(3.1, () => prose.classList.add("ok")));
      T(gsap.to(ag, { attr: { opacity: 1 }, duration: 0.5, delay: 0.3 }));
      paths.forEach((l, i) => {
        const p0 = l.el.getPointAtLength(0);
        const c = svgEl("circle", { r: 4, class: "pulse", cx: p0.x, cy: p0.y }, g.pulses);
        const len = l.el.getTotalLength();
        const st = { t: 0 };
        T(gsap.to(st, { t: 1, duration: 1.3, delay: 0.25 + i * 0.12, ease: "power1.inOut",
          onUpdate: () => { const pt = l.el.getPointAtLength(st.t * len); c.setAttribute("cx", pt.x); c.setAttribute("cy", pt.y); },
          onComplete: () => { lightPlace(l.p); T(gsap.to(c, { attr: { r: 0 }, duration: 0.3 })); } }));
      });
      T(gsap.to(logPath, { attr: { opacity: 1 }, duration: 0.5, delay: 1.5, onComplete: () => lightPlace(LOG) }));
    }
    function pin(o) {
      pinned = o;
      clearTimeout(timer);
      clear();
      lightOwner(o);
      const ps = Object.keys(OWNERS[o][2]).map(Number);
      L.lines.filter((l) => l.o === o).forEach((l) => l.el.classList.add("hi"));
      ps.forEach(lightPlace);
      prose.classList.add("dim");
    }
    function unpin() {
      if (pinned < 0) return;
      pinned = -1;
      clearTimeout(timer);
      timer = setTimeout(cycle, 1600);
    }
    function cycle() {
      if (!running || pinned >= 0) return;
      show(EXAMPLES[ex]);
      ex = (ex + 1) % EXAMPLES.length;
      if (!reduce) timer = setTimeout(cycle, 5600);
    }
    build();
    let rw = root.clientWidth;
    addEventListener("resize", () => { if (root.clientWidth !== rw) { rw = root.clientWidth; build(); if (running) { clearTimeout(timer); cycle(); } } });
    whileVisible(root, () => { running = true; cycle(); }, () => { running = false; clearTimeout(timer); killAll(); });
  }

  // ---------------------------------------------------------------------------
  // 7. A scan runs down the page; problems are marked, then fixed, asked or
  //    held. Signing stays locked until nothing is open.
  // ---------------------------------------------------------------------------
  function catcher() {
    const paper = $("#catchPaper"), lines = $$(".cl", paper), scan = $(".scanline", paper), state = $(".scan-state em", paper);
    const D = 2.4;
    const steps = [[0, () => {
      if (!reduce) gsap.fromTo(scan, { y: 30, opacity: 1 }, { y: paper.offsetHeight, duration: D, ease: "none", onComplete: () => gsap.to(scan, { opacity: 0, duration: 0.3 }) });
    }]];
    lines.forEach((l, i) => steps.push([D * ((l.offsetTop + l.offsetHeight * 0.6) / paper.offsetHeight), () => l.classList.add("marked")]));
    lines.forEach((l, i) => steps.push([D + 0.9 + i * 0.55, () => l.classList.add("resolved")]));
    const T0 = D + 0.9 + lines.length * 0.55 + 0.2;
    steps.push([T0, () => { paper.classList.add("checked"); state.textContent = "Checked"; }]);
    // The two open items get settled; only then does signing unlock.
    const open = lines.filter((l) => l.querySelector(".flag i"));
    const lockText = $(".lk .a", paper);
    open.forEach((l, i) => steps.push([T0 + 1.2 + i * 0.9, () => {
      l.classList.add("settled");
      const left = open.length - i - 1;
      if (left) lockText.textContent = `Signing locked · ${left} item${left === 1 ? "" : "s"} open`;
    }]));
    steps.push([T0 + 1.2 + open.length * 0.9 + 0.2, () => paper.classList.add("open")]);
    steps.push([T0 + 1.2 + open.length * 0.9 + 1.4, () => paper.classList.add("signed")]);
    sequence(paper, steps, () => {
      lines.forEach((l) => l.classList.remove("marked", "resolved", "settled"));
      paper.classList.remove("checked", "open", "signed");
      state.textContent = "Checking";
      lockText.textContent = "Signing locked · 2 items open";
      gsap.set(scan, { opacity: 0 });
    });
  }

  // ---------------------------------------------------------------------------
  // 6. EMA publishes; the draft shows what it touches; you review.
  // ---------------------------------------------------------------------------
  function rules() {
    const r = $("#rulesVis");
    sequence(r, [
      [0.2, () => r.classList.add("s1")],
      [1.0, () => r.classList.add("s2")],
      [1.7, () => r.classList.add("s3")],
      [2.8, () => r.classList.add("s4")],
    ], () => r.classList.remove("s1", "s2", "s3", "s4"));
  }

  // ---------------------------------------------------------------------------
  // 8. AI suggests; you accept or reject each one, and can undo any of them.
  // ---------------------------------------------------------------------------
  function ai() {
    const win = $("#aiWin"), rows = $$(".sg", win);
    const steps = [];
    rows.forEach((r, i) => {
      const t = 0.7 + i * 1.2, d = r.dataset.d;
      steps.push([t, () => r.classList.add(`press-${d}`)]);
      steps.push([t + 0.3, () => { r.classList.remove(`press-${d}`); r.classList.add("decided"); }]);
    });
    sequence(win, steps, () => rows.forEach((r) => r.classList.remove("decided", "press-yes", "press-no")));
  }

  // ---------------------------------------------------------------------------
  // 9. A year with Veria: scroll through the months; three revisions, one every
  //    four months, and nothing that turns into a project.
  // ---------------------------------------------------------------------------
  function year() {
    const MONTH_START = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
    const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const section = $("#year"), pin = $("#yearPin"), track = $("#track"), axis = $("#axis"), word = $("#monthWord");
    const tSigned = $("#tSigned");
    const DW = 9;
    const SEASON = ["#e5ebf1", "#e7ecf0", "#ebf0e9", "#ecf2e3", "#edf3e0", "#f3f1de", "#f6efdb", "#f6ebd8", "#f3e6d5", "#f0e0cf", "#e8e3dc", "#e3e8ee", "#e5ebf1"];
    const REVISIONS = [[31, 39], [151, 152], [273, 280]];
    const EVENTS = [
      { day: 19, date: "20 January", title: "Quality updates a procedure", text: "SOP-PV-011 goes to 5.0.", chip: "Annex E · logbook" },
      { day: 31, date: "1–9 February", title: "Revision one", text: "Owners confirm their part.", chip: "Version 4.1 signed", g: true, sign: 39, hi: true },
      { day: 103, date: "14 April", title: "The vendor upgrades its database", text: "Section 4 and Annex D follow." },
      { day: 151, date: "1–2 June", title: "Revision two", text: "A new deputy QPPV waits for you.", chip: "Version 4.2 signed", g: true, sign: 152, hi: true },
      { day: 195, date: "15 July", title: "A new distributor signs", text: "Section 2, Annex B and the logbook follow.", chip: "In the draft" },
      { day: 231, date: "August", title: "You're away", text: "Nothing piles up.", hi: true },
      { day: 273, date: "1–8 October", title: "Revision three", text: "Six vendor procedures go in on their own.", chip: "Version 4.3 signed", g: true, sign: 280, hi: true },
      { day: 315, date: "12 November", title: "The inspectorate asks for your PSMF.", text: "Seven days to respond. You send 4.3 that morning.", chip: "Sent 09:14", punch: true },
      { day: 350, date: "December", title: "Year end", text: "Three versions. Nothing to catch up on.", hi: true },
    ];
    track.style.width = axis.style.width = `${365 * DW}px`;
    MONTH_START.slice(0, 12).forEach((d, i) => {
      const m = document.createElement("div");
      m.className = "m";
      m.style.left = `${d * DW}px`;
      m.style.width = `${(MONTH_START[i + 1] - d) * DW}px`;
      m.textContent = MONTHS[i].slice(0, 3);
      axis.append(m);
    });
    for (let d = 7; d < 365; d += 7) { const w = document.createElement("div"); w.className = "w"; w.style.left = `${d * DW}px`; axis.append(w); }
    REVISIONS.forEach(([a, b]) => { const r = document.createElement("div"); r.className = "rev"; r.style.left = `${a * DW}px`; r.style.width = `${(b - a + 1) * DW}px`; axis.append(r); });
    const cards = EVENTS.map((e) => {
      const c = document.createElement("article");
      c.className = `ev${e.hi ? " hi" : ""}${e.punch ? " punch" : ""}`;
      c.style.left = `${e.day * DW}px`;
      c.innerHTML = `<div class="d">${e.date}</div><h3>${e.title}</h3><p>${e.text}</p>${e.chip ? `<span class="chip-s${e.g ? " g" : ""}">${e.chip}</span>` : ""}`;
      track.append(c);
      return c;
    });
    const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const mix = (a, b, t) => `rgb(${hex(a).map((v, i) => Math.round(lerp(v, hex(b)[i], t))).join(",")})`;
    let shown = -1, target = 0, cur = 0, raf = 0, signed = 0;
    function render() {
      const d = clamp(cur) * 364;
      const x = innerWidth / 2 - d * DW;
      track.style.transform = axis.style.transform = `translateX(${x}px)`;
      const m = MONTH_START.findIndex((s, i) => d >= s && d < MONTH_START[i + 1]);
      const k = (d - MONTH_START[m]) / (MONTH_START[m + 1] - MONTH_START[m]);
      pin.style.setProperty("--season", mix(SEASON[m], SEASON[m + 1], k));
      if (m !== shown) {
        shown = m;
        word.textContent = MONTHS[m];
        if (!reduce) gsap.fromTo(word, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", overwrite: true });
      }
      const live = EVENTS.map((e) => d >= e.day - 6 && d <= e.day + (e.hi ? 40 : 30));
      if (innerWidth < 640) { const last = live.lastIndexOf(true); live.fill(false); if (last >= 0) live[last] = true; }
      cards.forEach((c, i) => c.classList.toggle("on", live[i]));
      // On a phone only one card shows; keep it on screen.
      if (innerWidth < 640) cards.forEach((c, i) => {
        if (!live[i]) { c.style.translate = ""; return; }
        const left = x + EVENTS[i].day * DW - 18;
        c.style.translate = `${clamp(left, 16, innerWidth - 16 - c.offsetWidth) - left}px 0`;
      });
      const s = EVENTS.filter((e) => e.sign && e.sign <= d).length;
      if (s !== signed) {
        signed = s;
        tSigned.textContent = s;
        $("#tWord").textContent = s === 1 ? "version" : "versions";
        if (!reduce) gsap.fromTo(tSigned, { scale: 1.4 }, { scale: 1, duration: 0.6, ease: "back.out(3)" });
      }
    }
    const measure = () => {
      const r = section.getBoundingClientRect();
      target = clamp(-r.top / (r.height - innerHeight));
    };
    const step = () => {
      cur += (target - cur) * 0.12;
      if (reduce || Math.abs(target - cur) < 0.0003) cur = target;
      render();
      raf = cur !== target ? requestAnimationFrame(step) : 0;
    };
    const onScroll = () => { measure(); if (!raf) raf = requestAnimationFrame(step); };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    onScroll();
  }

  // ---------------------------------------------------------------------------
  // 2. The chores, struck off one by one; then what's left.
  // ---------------------------------------------------------------------------
  function chores() {
    const items = $$("#chores li"), punch = $("#punch");
    items.forEach((li) => {
      const s = svgEl("svg", { viewBox: "0 0 100 30", preserveAspectRatio: "none", "aria-hidden": "true" });
      const p = svgEl("path", { d: `M0 ${15 + rand(0, 4)} C 22 ${10 + rand(0, 8)}, 48 ${18 + rand(0, 6)}, 70 ${13 + rand(0, 4)} S 96 ${14 + rand(0, 6)}, 100 ${15 + rand(0, 3)}`, pathLength: 1 }, s);
      p.style.strokeDasharray = "1 2";
      p.style.strokeDashoffset = 1;
      li.querySelector("span").append(s);
    });
    const strike = (li) => { li.querySelector("path").style.transition = "stroke-dashoffset 0.55s ease"; li.querySelector("path").style.strokeDashoffset = 0; li.classList.add("done"); };
    const steps = items.map((li, i) => [0.25 + i * 0.4, () => strike(li)]);
    steps.push([0.25 + items.length * 0.4 + 0.3, () => punch.classList.add("in")]);
    sequence($("#chores"), steps, () => {
      items.forEach((li) => { const p = li.querySelector("path"); p.style.transition = "none"; p.style.strokeDashoffset = 1; li.classList.remove("done"); });
      punch.classList.remove("in");
    }, 0.5);
  }

  // ---------------------------------------------------------------------------
  // 10. Trust: the claims, one after another, then the marks.
  // ---------------------------------------------------------------------------
  function trust() {
    const g = $("#ringDots");
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      svgEl("circle", { cx: 200 + 170 * Math.cos(a), cy: 200 + 170 * Math.sin(a), r: 3 }, g);
    }
    const h = $("#trH"), badges = $("#badges");
    $$(".bd", badges).forEach((b, i) => { b.style.transitionDelay = `${i * 0.07}s`; });
    sequence(h.parentElement, [
      [0.1, () => h.classList.add("in")],
      [0.9, () => badges.classList.add("in")],
    ], () => { h.classList.remove("in"); badges.classList.remove("in"); }, 0.3);
  }
})();

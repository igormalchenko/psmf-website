// Veria v3, "Touch it": a page you play with.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!window.gsap) return;
  if (window.Draggable) gsap.registerPlugin(Draggable);
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const listText = (parts) => parts.length < 2 ? parts : parts.flatMap((p, i) => (i === 0 ? [p] : [i === parts.length - 1 ? " and " : ", ", p]));

  // Squishy buttons
  const jelly = (b) => {
    b.addEventListener("pointerdown", () => gsap.to(b, { scaleX: 1.08, scaleY: 0.88, duration: 0.12, ease: "power2.out" }));
    const up = () => gsap.to(b, { scaleX: 1, scaleY: 1, duration: 0.9, ease: "elastic.out(1.2, 0.32)" });
    b.addEventListener("pointerup", up);
    b.addEventListener("pointerleave", up);
  };
  $$(".jelly").forEach(jelly);

  // Spring back after a drag
  const springy = (target, opts = {}) => {
    if (!window.Draggable) return;
    Draggable.create(target, {
      type: "x,y", zIndexBoost: true, ...opts,
      onPress() { gsap.to(this.target, { scale: 1.04, duration: 0.2 }); },
      onRelease() { gsap.to(this.target, { x: 0, y: 0, scale: 1, duration: 1.1, ease: "elastic.out(1, 0.38)" }); },
    });
  };

  // ---------------------------------------------------------------------------
  // 1. Playground
  // ---------------------------------------------------------------------------
  const TERR = { "Medica Nord AS": "Norway, Denmark", "Baltpharm UAB": "Baltics", "Nordvia AB": "Sweden, Finland", "Kalmar Pharma": "Sweden", "Riga Med SIA": "Latvia" };
  const SDEA = { "Medica Nord AS": "SDEA-014", "Baltpharm UAB": "SDEA-017" };
  let sdeaNext = 22;
  let signed = ["Medica Nord AS", "Baltpharm UAB"];
  let added = [];
  const removed = new Set();
  let current = [4, 2];
  const next = () => [current[0], current[1] + 1];
  const vstr = (v) => `${v[0]}.${v[1]}`;
  let draftLog = [];
  let lastSigned = null;

  const list = $("#distList"), input = $("#addInput"), form = $("#addForm"), deck = $("#deck");
  const pages = { section: $("#pgSection"), annex: $("#pgAnnex"), log: $("#pgLog") };
  const anchors = { section: $("#prose"), annex: $("#tbl"), log: $("#log") };
  const bar = $("#barText"), led = $("#led"), signBtn = $("#signBtn");
  let touched = false;

  function renderList(fresh) {
    list.textContent = "";
    signed.forEach((n) => {
      const li = el("li", removed.has(n) ? "gone" : "");
      li.append(el("span", "nm", n));
      const x = el("button", "x", removed.has(n) ? "Undo" : "×");
      x.type = "button";
      x.setAttribute("aria-label", removed.has(n) ? `Keep ${n}` : `Remove ${n}`);
      x.addEventListener("click", () => (removed.has(n) ? undoRemove(n) : remove(n, li)));
      li.append(x);
      list.append(li);
    });
    added.forEach((n) => {
      const li = el("li", "fresh");
      li.append(el("span", "nm", n));
      const x = el("button", "x", "×");
      x.type = "button";
      x.setAttribute("aria-label", `Remove ${n}`);
      x.addEventListener("click", () => undoAdd(n));
      li.append(x);
      list.append(li);
      if (n === fresh) gsap.from(li, { height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0, marginBottom: 0, duration: 0.5, ease: "back.out(2)" });
    });
  }

  function names() {
    return [...signed.map((n) => [n, removed.has(n) ? "del" : ""]), ...added.map((n) => [n, "ins"])];
  }

  const render = {
    section() {
      const p = anchors.section;
      p.textContent = "Halvorsen Pharma distributes its products in the Nordic and Baltic markets through ";
      const parts = names().map(([n, c]) => (c ? el("span", c, n) : document.createTextNode(n)));
      listText(parts).forEach((x) => p.append(typeof x === "string" ? document.createTextNode(x) : x));
      p.append(document.createTextNode("."));
    },
    annex() {
      const t = anchors.annex;
      t.textContent = "";
      const head = el("div", "tr th");
      head.append(el("span", null, "Partner"), el("span", null, "SDEA"));
      t.append(head);
      names().forEach(([n, c]) => {
        const r = el("div", `tr ${c}`);
        r.append(el("span", null, n), el("span", null, SDEA[n] || "—"));
        t.append(r);
      });
    },
    log() {
      const l = anchors.log;
      l.textContent = "";
      const title = $("#logTitle");
      if (draftLog.length) {
        title.innerHTML = "";
        title.append(document.createTextNode(`Version ${vstr(next())} `), el("em", null, "draft"));
        draftLog.forEach(([cls, text]) => l.append(el("li", cls, text)));
      } else if (lastSigned) {
        title.textContent = `Version ${lastSigned.v} · signed`;
        lastSigned.lines.forEach((text) => l.append(el("li", null, text)));
      } else {
        title.innerHTML = "";
        title.append(document.createTextNode(`Version ${vstr(next())} `), el("em", null, "draft"));
        l.append(el("li", "empty", "Nothing changed yet."));
      }
    },
  };

  function rebuildLog() {
    draftLog = [
      ...added.map((n) => ["ins", `New distributor ${n}${TERR[n] ? `, ${TERR[n]}` : ""}.`]),
      ...[...removed].map((n) => ["del", `Distributor ${n} removed.`]),
    ];
  }

  function updateBar() {
    const n = added.length + removed.size;
    signBtn.textContent = `Sign version ${vstr(next())}`;
    if (n) {
      led.classList.add("wait");
      bar.textContent = `${n} change${n > 1 ? "s" : ""} · ${n * 3} places updated · 0 emails written`;
      signBtn.disabled = false;
      gsap.fromTo(signBtn, { scale: 1.08 }, { scale: 1, duration: 0.8, ease: "elastic.out(1.2, 0.4)" });
    } else {
      led.classList.remove("wait");
      bar.textContent = `Version ${vstr(current)} is in force. Nothing waiting.`;
      signBtn.disabled = true;
    }
  }

  function bump(key, label = "Updated") {
    const pg = pages[key];
    render[key]();
    gsap.set(pg, { zIndex: 8 });
    gsap.fromTo(pg, { scale: 1.06, y: -14 }, { scale: 1, y: 0, duration: 1, ease: "elastic.out(1, 0.38)", onComplete: () => gsap.set(pg, { zIndex: "" }) });
    const tag = pg.querySelector(".upd");
    tag.textContent = label;
    gsap.killTweensOf(tag);
    gsap.timeline().to(tag, { scale: 1, duration: 0.5, ease: "back.out(3)" }).to(tag, { scale: 0, duration: 0.3, delay: 1.6 });
    const fresh = pg.querySelectorAll(".ins, .del");
    if (fresh.length) gsap.fromTo(fresh[fresh.length - 1], { backgroundColor: "rgba(255,210,63,0.9)" }, { backgroundColor: "", duration: 1.2, clearProps: "backgroundColor" });
  }

  // A labelled chip flies from the edit to each place it lands.
  function fly(fromEl, text, kind) {
    const from = fromEl.getBoundingClientRect();
    ["section", "annex", "log"].forEach((key, i) => {
      const chip = el("div", `fly ${kind}`, kind === "add" ? `+ ${text}` : `− ${text}`);
      document.body.append(chip);
      const to = anchors[key].getBoundingClientRect();
      const x0 = from.left + 10, y0 = from.top, x1 = to.left + to.width * 0.35, y1 = to.top + Math.min(to.height, 40) / 2;
      const cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - 140 - i * 30;
      const o = { t: 0 };
      gsap.to(o, {
        t: 1, duration: 0.95, delay: i * 0.16, ease: "power2.inOut",
        onUpdate() {
          const t = o.t, u = 1 - t;
          const x = u * u * x0 + 2 * u * t * cx + t * t * x1, y = u * u * y0 + 2 * u * t * cy + t * t * y1;
          chip.style.transform = `translate(${x}px, ${y}px) rotate(${(1 - t) * (i - 1) * 12}deg) scale(${1 - 0.3 * t})`;
        },
        onComplete() {
          gsap.to(chip, { scale: 0, opacity: 0, duration: 0.25, onComplete: () => chip.remove() });
          bump(key);
        },
      });
    });
  }

  function unfreeze() {
    if (deck.classList.contains("frozen")) {
      deck.classList.remove("frozen");
      lastSigned = null;
    }
  }

  function addName(raw) {
    const n = raw.trim().replace(/\s+/g, " ").slice(0, 32);
    if (n.length < 2) return shake(input);
    const lower = n.toLowerCase();
    const inSigned = signed.find((s) => s.toLowerCase() === lower);
    if (inSigned && removed.has(inSigned)) return undoRemove(inSigned);
    if (inSigned || added.some((s) => s.toLowerCase() === lower)) return shake(input);
    unfreeze();
    added.push(n);
    SDEA[n] = SDEA[n] || `SDEA-0${sdeaNext++}`;
    rebuildLog();
    renderList(n);
    fly(input, n, "add");
    input.value = "";
    updateBar();
  }
  function remove(n, li) {
    unfreeze();
    removed.add(n);
    rebuildLog();
    fly(li, n, "rm");
    renderList();
    updateBar();
  }
  function undoRemove(n) {
    removed.delete(n);
    rebuildLog();
    renderList();
    ["section", "annex", "log"].forEach((k, i) => setTimeout(() => bump(k), i * 120));
    updateBar();
  }
  function undoAdd(n) {
    added = added.filter((a) => a !== n);
    rebuildLog();
    renderList();
    ["section", "annex", "log"].forEach((k, i) => setTimeout(() => bump(k), i * 120));
    updateBar();
  }
  function shake(node) {
    gsap.fromTo(node, { x: 0 }, { keyframes: { x: [0, -10, 9, -6, 4, 0] }, duration: 0.42, ease: "none" });
  }

  form.addEventListener("submit", (e) => { e.preventDefault(); touched = true; addName(input.value); });
  $$("#suggest button").forEach((b) => b.addEventListener("click", () => { touched = true; addName(b.textContent); }));
  $("#stage").addEventListener("pointerdown", () => { touched = true; });
  input.addEventListener("keydown", () => { touched = true; });

  // Signing
  const pad = $("#signpad"), slots = $$("#slots span"), go = $("#signGo");
  let code = "";
  const showCode = () => {
    slots.forEach((s, i) => { s.textContent = code[i] || ""; s.classList.toggle("on", i === code.length); });
    go.disabled = code.length !== 6;
  };
  const press = (k) => {
    if (k === "del") code = code.slice(0, -1);
    else if (/^\d$/.test(k) && code.length < 6) {
      code += k;
      gsap.fromTo(slots[code.length - 1], { scale: 1.25 }, { scale: 1, duration: 0.4, ease: "back.out(3)" });
    }
    showCode();
  };
  $$("#keys button").forEach((b) => b.addEventListener("click", () => {
    const k = b.dataset.k || b.textContent;
    if (k === "fill") {
      code = "";
      showCode();
      [..."482916"].forEach((d, i) => setTimeout(() => {
        const key = $$("#keys button").find((x) => x.textContent === d);
        key.classList.add("press");
        setTimeout(() => key.classList.remove("press"), 90);
        press(d);
      }, i * 110));
    } else press(k);
  }));
  function openPad() {
    code = "";
    showCode();
    $("#spTitle").textContent = `Sign version ${vstr(next())}`;
    pad.setAttribute("aria-hidden", "false");
    gsap.fromTo(pad, { autoAlpha: 0, y: 30, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: "elastic.out(1, 0.6)" });
    gsap.to($$(".page"), { filter: "blur(2px)", duration: 0.4 });
  }
  function closePad() {
    pad.setAttribute("aria-hidden", "true");
    gsap.to(pad, { autoAlpha: 0, y: -16, scale: 0.96, duration: 0.3, ease: "power2.in" });
    gsap.to($$(".page"), { filter: "blur(0px)", duration: 0.4, clearProps: "filter" });
  }
  signBtn.addEventListener("click", () => { touched = true; openPad(); });
  go.addEventListener("click", () => {
    if (code !== "482916") {
      shake($("#slots"));
      code = "";
      showCode();
      return;
    }
    closePad();
    const v = vstr(next());
    const lines = draftLog.map(([, t]) => t);
    signed = [...signed.filter((n) => !removed.has(n)), ...added];
    added = [];
    removed.clear();
    current = next();
    draftLog = [];
    lastSigned = { v, lines };
    const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    $("#stampDate").textContent = today;
    gsap.timeline()
      .fromTo("#stamp", { opacity: 0, scale: 2.8, rotate: -32, filter: "blur(8px)" }, { opacity: 0.95, scale: 1, rotate: -11, filter: "blur(0px)", duration: 0.26, ease: "power4.in" }, 0.25)
      .to(deck, { keyframes: { x: [0, -8, 7, -4, 2, 0], y: [0, 5, -4, 2, -1, 0] }, duration: 0.38, ease: "none" })
      .add(() => {
        deck.classList.add("frozen");
        renderList();
        ["section", "annex", "log"].forEach((k, i) => setTimeout(() => bump(k, "Signed"), i * 110));
        updateBar();
        bar.textContent = `Version ${v} signed. In force now.`;
      }, "<")
      .to("#stamp", { opacity: 0, scale: 0.9, duration: 0.8, ease: "power2.in" }, "+=2.2");
  });

  renderList();
  render.section();
  render.annex();
  render.log();
  updateBar();
  springy($$(".page"));
  springy("#qcard", { trigger: "#qcard .qcard-top" });

  // If nobody touches it, show what it does.
  if (!reduce) {
    setTimeout(() => {
      if (touched) return;
      const word = "Nordvia AB";
      [...word].forEach((ch, i) => setTimeout(() => { if (!touched) input.value += ch; }, i * 95));
      setTimeout(() => { if (!touched && input.value === word) addName(word); }, word.length * 95 + 450);
    }, 2600);
  }

  // ---------------------------------------------------------------------------
  // 2. Cards
  // ---------------------------------------------------------------------------
  const CARDS = [
    ["Legal", "#cfe0ff", "#2b63f0", "Are the distribution partners still correct?"],
    ["Quality", "#ffe9a6", "#c69300", "Is the SOP list in Annex E current?"],
    ["HR", "#c7f0dc", "#1fbf7a", "Is Ingrid Solberg still the deputy QPPV?"],
    ["Your vendor", "#e2d9ff", "#7a5cf0", "Is the safety database still version 8.4?"],
    ["Regulatory", "#ffd6c7", "#ff6a3d", "Are the products in Annex H complete?"],
  ];
  const cards = $("#cards");
  let answered = 0;
  const meter = () => {
    $("#meterFill").style.width = `${(answered / CARDS.length) * 100}%`;
    $("#meterText").textContent = answered === CARDS.length ? "All 5 answered. Nobody chased anyone." : `${answered} of ${CARDS.length} answered`;
  };
  CARDS.forEach(([who, soft, strong, q], i) => {
    const c = el("div", "c3");
    c.style.rotate = `${(i - 2) * 4}deg`;
    c.style.translate = `0 ${Math.abs(i - 2) * 14}px`;
    c.innerHTML = `<div class="inner"><div class="face front"><span class="chip" style="background:${soft}">${who}</span><p class="qq">${q}</p><div class="btns"><button type="button" class="nc">No change</button><button type="button" class="ch">Something changed</button></div></div><div class="face back" style="background:${strong}"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="rgba(255,255,255,0.2)"/><path d="M19 33l9 9 17-19" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg><b>Answered</b><span>${who}, back to work.</span></div></div>`;
    cards.append(c);
    c.querySelectorAll(".btns button").forEach((b) => {
      jelly(b);
      b.addEventListener("click", () => {
        if (c.classList.contains("done")) return;
        c.classList.add("done");
        answered++;
        meter();
        if (answered === CARDS.length) setTimeout(() => {
          $$(".c3").forEach((x, j) => setTimeout(() => x.classList.remove("done"), j * 120));
          answered = 0;
          setTimeout(meter, 700);
        }, 4200);
      });
    });
  });
  springy($$(".c3"));
  meter();

  // ---------------------------------------------------------------------------
  // 3. Dial
  // ---------------------------------------------------------------------------
  const H = [
    ["1.0", "4 Jun 2019", ["Medica Nord AS"], "Lars Nygaard", "7.1", "First version."],
    ["1.1", "18 Feb 2021", ["Medica Nord AS"], "Lars Nygaard", "7.3", "UK QPPV added. Safety database 7.3."],
    ["1.2", "11 Oct 2021", ["Medica Nord AS", "Baltpharm UAB"], "Lars Nygaard", "7.3", "New distributor Baltpharm UAB."],
    ["2.0", "30 Mar 2022", ["Medica Nord AS", "Baltpharm UAB"], "Lars Nygaard", "8.0", "Safety database upgraded to 8.0."],
    ["2.1", "5 Sep 2022", ["Medica Nord AS", "Baltpharm UAB", "Vesta Distribution"], "Lars Nygaard", "8.0", "New distributor Vesta Distribution."],
    ["2.2", "2 Feb 2023", ["Medica Nord AS", "Baltpharm UAB", "Vesta Distribution"], "Lars Nygaard", "8.0", "Annual revision."],
    ["3.0", "21 Jun 2023", ["Medica Nord AS", "Baltpharm UAB", "Vesta Distribution"], "Lars Nygaard", "8.2", "Safety database upgraded to 8.2."],
    ["3.1", "9 Jan 2024", ["Medica Nord AS", "Baltpharm UAB"], "Lars Nygaard", "8.2", "Distributor Vesta Distribution removed."],
    ["3.2", "14 May 2024", ["Medica Nord AS", "Baltpharm UAB"], "Lars Nygaard", "8.2", "Annual revision."],
    ["3.3", "7 Oct 2024", ["Medica Nord AS", "Baltpharm UAB"], "Lars Nygaard", "8.2", "Two audit findings closed."],
    ["4.0", "12 Mar 2025", ["Medica Nord AS", "Baltpharm UAB"], "Lars Nygaard", "8.2", "Annual revision. Six procedures updated."],
    ["4.1", "20 Nov 2025", ["Medica Nord AS", "Baltpharm UAB"], "Lars Nygaard", "8.4", "Safety database upgraded to 8.4."],
    ["4.2", "2 Jun 2026", ["Medica Nord AS", "Baltpharm UAB"], "Ingrid Solberg", "8.4", "Deputy EU QPPV changed."],
    ["4.3", "8 Oct 2026", ["Medica Nord AS", "Nordvia AB", "Baltpharm UAB"], "Ingrid Solberg", "8.4", "New distributor Nordvia AB."],
  ];
  const ARC = 270, A0 = -ARC / 2, STEP = ARC / (H.length - 1);
  const ticks = $("#ticks"), knob = $("#knob");
  const tickEls = H.map(([v], i) => {
    const t = el("div", "tick");
    t.style.transform = `rotate(${A0 + i * STEP}deg)`;
    const lab = el("b", null, v);
    lab.style.transform = `rotate(${-(A0 + i * STEP)}deg)`;
    t.append(el("i"), lab);
    lab.style.cursor = "pointer";
    lab.addEventListener("click", () => turnTo(i, true));
    ticks.append(t);
    return t;
  });
  let shown = -1;
  function showVersion(i) {
    if (i === shown) return;
    const prev = H[i - 1], [v, date, dist, dep, db, log] = H[i];
    shown = i;
    tickEls.forEach((t, j) => t.classList.toggle("on", j === i));
    $("#roV").textContent = v;
    $("#roRange").textContent = `In force ${date} → ${H[i + 1] ? H[i + 1][1] : "today"}`;
    const p = $("#roText");
    p.textContent = "Distributed by ";
    const gone = prev ? prev[2].filter((n) => !dist.includes(n)) : [];
    const parts = [...dist.map((n) => (prev && !prev[2].includes(n) ? el("span", "ins", n) : document.createTextNode(n))), ...gone.map((n) => el("span", "del", n))];
    listText(parts).forEach((x) => p.append(typeof x === "string" ? document.createTextNode(x) : x));
    p.append(document.createTextNode(". The deputy EU QPPV is "));
    p.append(prev && prev[3] !== dep ? el("span", "ins", dep) : document.createTextNode(dep));
    p.append(document.createTextNode(". Cases are processed in safety database version "));
    p.append(prev && prev[4] !== db ? el("span", "ins", db) : document.createTextNode(db));
    p.append(document.createTextNode("."));
    $("#roLog").textContent = log;
    $("#roSig").textContent = `Signed ${date} by Anna Weber, EU QPPV${i >= 1 ? " and Oliver Bennett, UK QPPV" : ""}`;
    gsap.fromTo("#roV", { y: 14, opacity: 0.2 }, { y: 0, opacity: 1, duration: 0.35, ease: "power3.out" });
  }
  const nearest = (rot) => Math.round(Math.min(Math.max((rot - A0) / STEP, 0), H.length - 1));
  function turnTo(i, animate) {
    const r = A0 + i * STEP;
    if (animate) gsap.to(knob, { rotation: r, duration: 0.9, ease: "elastic.out(1, 0.5)", onUpdate: () => showVersion(nearest(gsap.getProperty(knob, "rotation"))) });
    else gsap.set(knob, { rotation: r });
    showVersion(i);
  }
  if (window.Draggable) {
    Draggable.create(knob, {
      type: "rotation", bounds: { minRotation: A0, maxRotation: -A0 },
      onDrag() { showVersion(nearest(this.rotation)); },
      onRelease() { turnTo(nearest(this.rotation), true); },
    });
  }
  turnTo(H.length - 1, false);

  // ---------------------------------------------------------------------------
  // 4. Tiles lean toward the pointer
  // ---------------------------------------------------------------------------
  $$(".tile").forEach((t) => {
    t.addEventListener("pointermove", (e) => {
      const r = t.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      t.style.setProperty("--ry", `${(px - 0.5) * 16}deg`);
      t.style.setProperty("--rx", `${-(py - 0.5) * 16}deg`);
      t.style.setProperty("--gx", `${px * 100}%`);
      t.style.setProperty("--gy", `${py * 100}%`);
      t.style.setProperty("--go", 1);
    });
    t.addEventListener("pointerleave", () => { ["--ry", "--rx"].forEach((p) => t.style.setProperty(p, "0deg")); t.style.setProperty("--go", 0); });
  });

  // Things arrive as you reach them.
  const rise = (sel, from) => {
    const items = $$(sel);
    gsap.set(items, from);
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      gsap.to(e.target, { y: 0, rotate: 0, opacity: 1, duration: 1.1, delay: (items.indexOf(e.target) % 4) * 0.08, ease: "elastic.out(1, 0.6)" });
    }), { threshold: 0.2 });
    items.forEach((it) => io.observe(it));
  };
  if (!reduce) {
    rise(".tile", { y: 80, rotate: 4, opacity: 0 });
    rise(".sec-head, .dial-left, .readout", { y: 50, opacity: 0 });
  }
})();

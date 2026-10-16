// Veria v6: the PSMF update stops being a project.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const SVG = "http://www.w3.org/2000/svg";
  const svgEl = (tag, attrs, parent) => {
    const n = document.createElementNS(SVG, tag);
    Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
    if (parent) parent.append(n);
    return n;
  };
  const MONTH_START = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    ring();
    year();
    chores();
  });

  // ---------------------------------------------------------------------------
  // 1. The year as a ring. Once a year: the PSMF drifts for eleven months, then
  //    a long crunch. With Veria: the same work as small steps, the drift kept short.
  // ---------------------------------------------------------------------------
  function ring() {
    const C = 300, R = 210, TODAY = 288;
    const at = (d, r) => { const a = ((-90 + (d / 365) * 360) * Math.PI) / 180; return [C + r * Math.cos(a), C + r * Math.sin(a)]; };
    const months = $("#months"), drift = $("#drift"), crunch = $("#crunch"), dotsG = $("#dots"), signsG = $("#signs"), todayG = $("#today"), label = $("#crunchLabel");
    const cTop = $("#cTop"), cBig = $("#cBig"), cSub = $("#cSub"), toggle = $("#toggle");

    MONTH_START.slice(0, 12).forEach((d, i) => {
      const [x1, y1] = at(d, R - 7), [x2, y2] = at(d, R + 7);
      svgEl("line", { x1, y1, x2, y2, class: "tick" }, months);
      const [lx, ly] = at(d + 15, R + 34);
      const t = svgEl("text", { x: lx, y: ly + 4, "text-anchor": "middle", class: "mlabel" }, months);
      t.textContent = MONTHS[i].slice(0, 3).toUpperCase();
    });

    // How far the PSMF drifts from reality, day by day.
    const SIGN_NEW = [-84, 40, 153, 281];
    const oldDrift = (d) => (d <= 288 ? 52 * ((d + 31) / 319) : d <= 334 ? 52 * (1 - (d - 288) / 46) : 52 * ((d - 334) / 319));
    const newDrift = (d) => { const last = SIGN_NEW.filter((s) => s <= d).pop(); return Math.min(26, 0.17 * (d - last)); };
    const driftPath = (t) => {
      const outer = [], inner = [];
      for (let d = 0; d <= 365; d += 2) {
        const th = lerp(oldDrift(d), newDrift(d), t);
        outer.push(at(d, R - 3));
        inner.push(at(d, R - 3 - th));
      }
      return `M${outer.map((p) => p.join(" ")).join("L")}L${inner.reverse().map((p) => p.join(" ")).join("L")}Z`;
    };
    const arc = (d0, d1, r) => {
      const [x0, y0] = at(d0, r), [x1, y1] = at(d1, r);
      return `M${x0} ${y0}A${r} ${r} 0 ${d1 - d0 > 182 ? 1 : 0} 1 ${x1} ${y1}`;
    };
    crunch.setAttribute("d", arc(288, 334, R));
    const [lx, ly] = at(318, R - 104);
    label.setAttribute("x", lx);
    label.setAttribute("y", ly);
    label.innerHTML = '<tspan x="' + lx + '" dy="-8">The annual update</tspan><tspan x="' + lx + '" dy="16" style="font-weight:500;fill:#7a7f87">chase, merge, rewrite, sign</tspan>';

    // The same work, as dots: first piled into the crunch, then spread over the year.
    const targets = [];
    [[32, 40], [148, 156], [274, 281]].forEach(([a, b]) => { for (let i = 0; i < 16; i++) targets.push(a + Math.random() * (b - a)); });
    [20, 20, 21, 104, 104, 105].forEach((d) => targets.push(d));
    const dots = targets.map((dNew, i) => ({
      dOld: 288 + Math.random() * 46, rOld: R + (Math.random() - 0.5) * 16,
      dNew, rNew: R + (Math.random() - 0.5) * 22, delay: (i % 16) / 16 * 0.35 + Math.random() * 0.1,
      el: svgEl("circle", { r: 4, class: "dot" }, dotsG),
    }));
    const signs = [[40, "4.1"], [153, "4.2"], [281, "4.3"]].map(([d, v]) => {
      const g = svgEl("g", { class: "sig" }, signsG);
      const [x, y] = at(d, R);
      svgEl("circle", { cx: x, cy: y, r: 12 }, g);
      svgEl("path", { d: `M${x - 5} ${y}l3.5 3.5 6.5 -7` }, g);
      const [tx, ty] = at(d, R - 30);
      const t = svgEl("text", { x: tx, y: ty + 4, "text-anchor": "middle" }, g);
      t.textContent = v;
      g.style.transformOrigin = `${x}px ${y}px`;
      return g;
    });
    const [hx, hy] = at(TODAY, R + 12);
    svgEl("line", { x1: C, y1: C, x2: hx, y2: hy }, todayG);
    svgEl("circle", { cx: hx, cy: hy, r: 4.5 }, todayG);
    const [tlx, tly] = at(TODAY - 9, R + 22);
    const tt = svgEl("text", { x: tlx, y: tly, "text-anchor": "end" }, todayG);
    tt.textContent = "Today";
    todayG.setAttribute("class", "today");

    const st = { t: 0 };
    function render() {
      const t = st.t;
      drift.setAttribute("d", driftPath(ease(clamp(t * 1.15 - 0.1))));
      crunch.style.opacity = 1 - clamp(t * 4);
      label.style.opacity = 1 - clamp(t * 3);
      dots.forEach((p) => {
        const e = ease(clamp((t - p.delay) / 0.55));
        const d = lerp(p.dOld, p.dNew, e), r = lerp(p.rOld, p.rNew, e) - Math.sin(Math.PI * e) * 34;
        const [x, y] = at(d, r);
        p.el.setAttribute("cx", x);
        p.el.setAttribute("cy", y);
        p.el.style.opacity = t < 0.02 ? 0 : 0.85;
      });
      signs.forEach((g, i) => { const k = clamp((t - 0.82 - i * 0.05) / 0.12); g.style.opacity = k; g.style.transform = `scale(${0.4 + 0.6 * k})`; });
    }
    const words = (mode) => {
      const [a, b, c] = mode === "new"
        ? ["Last signed", "7 days ago", "version 4.3, after the October revision"]
        : ["Last brought up to date", "11 months ago", "in one long push"];
      gsap.to([cTop, cBig, cSub], { opacity: 0, duration: 0.25, onComplete() { cTop.textContent = a; cBig.textContent = b; cSub.textContent = c; gsap.to([cTop, cBig, cSub], { opacity: 1, duration: 0.4 }); } });
    };
    let mode = "old", auto = true, timer = 0;
    function setMode(m) {
      if (m === mode) return;
      mode = m;
      toggle.dataset.mode = m;
      $$("button", toggle).forEach((b) => b.setAttribute("aria-selected", String(b.dataset.mode === m)));
      gsap.to(st, { t: m === "new" ? 1 : 0, duration: reduce ? 0 : 2.6, ease: "power1.inOut", onUpdate: render });
      words(m);
    }
    $$("button", toggle).forEach((b) => b.addEventListener("click", () => { auto = false; clearTimeout(timer); setMode(b.dataset.mode); }));
    render();
    const cycle = () => { if (!auto) return; setMode(mode === "old" ? "new" : "old"); timer = setTimeout(cycle, mode === "new" ? 7000 : 4000); };
    timer = setTimeout(cycle, reduce ? 0 : 2200);
  }

  // ---------------------------------------------------------------------------
  // 2. A year with Veria: scroll through the months; the seasons change behind.
  // ---------------------------------------------------------------------------
  function year() {
    const section = $("#year"), pin = $("#yearPin"), track = $("#track"), axis = $("#axis"), word = $("#monthWord");
    const tSigned = $("#tSigned"), tProjects = $("#tProjects");
    const DW = 9;
    const SEASON = ["#e6ecf2", "#e8edf1", "#ecf1ea", "#edf3e4", "#eef4e1", "#f4f2df", "#f8f0dc", "#f8ecd9", "#f5e7d6", "#f2e1d0", "#e9e4dd", "#e4e9ef", "#e6ecf2"];
    const EVENTS = [
      { day: 20, date: "20 January", title: "A new distributor signs", text: "You send Legal one question. Their answer goes into the draft the same day.", chip: "Section 2 · Annex B · logbook" },
      { day: 32, date: "1–9 February", title: "The regular revision runs itself", text: "Questions go out to every owner on the 1st. Most tap No change; routine updates go straight in. On the 9th you sign.", chip: "Version 4.1 signed", g: true, sign: 40, hi: true },
      { day: 104, date: "14 April", title: "The vendor upgrades its database", text: "One question to the vendor. Section 4 and Annex D follow.", chip: "In the draft" },
      { day: 152, date: "1–2 June", title: "Revision two", text: "A new deputy QPPV waits for your approval. You approve it and sign the next morning.", chip: "Version 4.2 signed", g: true, sign: 153, hi: true },
      { day: 222, date: "August", title: "You're away", text: "Nothing is piling up while you are." },
      { day: 274, date: "1–8 October", title: "Revision three", text: "Six procedure updates from the vendor go in on their own. You sign on the 8th.", chip: "Version 4.3 signed", g: true, sign: 281, hi: true },
      { day: 314, date: "November", title: "Where the annual update used to start.<br><em>There isn't one.</em>", text: "No kick-off email, no tracker, no weeks of merging.", punch: true },
      { day: 354, date: "December", title: "Year end", text: "Three versions, each signed when it was right. Nothing to catch up on in January.", hi: true },
    ];
    track.style.width = `${365 * DW}px`;
    axis.style.width = `${365 * DW}px`;
    MONTH_START.slice(0, 12).forEach((d, i) => {
      const m = document.createElement("div");
      m.className = "m";
      m.style.left = `${d * DW}px`;
      m.style.width = `${(MONTH_START[i + 1] - d) * DW}px`;
      m.textContent = MONTHS[i].slice(0, 3);
      axis.append(m);
    });
    for (let d = 7; d < 365; d += 7) { const w = document.createElement("div"); w.className = "w"; w.style.left = `${d * DW}px`; axis.append(w); }
    const cards = EVENTS.map((e) => {
      const c = document.createElement("article");
      c.className = `ev${e.hi ? " hi" : ""}${e.punch ? " punch" : ""}`;
      c.style.left = `${e.day * DW}px`;
      c.innerHTML = `<div class="d">${e.date}</div><h3>${e.title}</h3><p>${e.text}</p>${e.chip ? `<span class="chip${e.g ? " g" : ""}">${e.chip}</span>` : ""}`;
      track.append(c);
      return c;
    });
    const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const mix = (a, b, t) => `rgb(${hex(a).map((v, i) => Math.round(lerp(v, hex(b)[i], t))).join(",")})`;
    let shown = -1, target = 0, cur = 0, raf = 0, signed = 0;
    function render() {
      const d = clamp(cur, 0, 1) * 364;
      const x = innerWidth / 2 - d * DW;
      track.style.transform = `translateX(${x}px)`;
      axis.style.transform = `translateX(${x}px)`;
      const m = MONTH_START.findIndex((s, i) => d >= s && d < MONTH_START[i + 1]);
      const k = (d - MONTH_START[m]) / (MONTH_START[m + 1] - MONTH_START[m]);
      pin.style.setProperty("--season", mix(SEASON[m], SEASON[m + 1], k));
      if (m !== shown) {
        shown = m;
        gsap.fromTo(word, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", overwrite: true });
        word.textContent = MONTHS[m];
      }
      const live = EVENTS.map((e) => d >= e.day - 6 && d <= e.day + (e.hi ? 40 : 30));
      if (innerWidth < 640) { const last = live.lastIndexOf(true); live.fill(false); if (last >= 0) live[last] = true; }
      cards.forEach((c, i) => c.classList.toggle("on", live[i]));
      const s = EVENTS.filter((e) => e.sign && e.sign <= d).length;
      if (s !== signed) { signed = s; tSigned.textContent = s; gsap.fromTo(tSigned, { scale: 1.4 }, { scale: 1, duration: 0.6, ease: "back.out(3)" }); }
      tProjects.parentElement.style.color = d >= 310 && d <= 345 ? "#2f8f5b" : "";
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
  // 3. The chores, struck off one by one.
  // ---------------------------------------------------------------------------
  function chores() {
    const items = $$("#chores li"), left = $("#left");
    items.forEach((li) => {
      const s = svgEl("svg", { viewBox: "0 0 100 30", preserveAspectRatio: "none" });
      const p = svgEl("path", { d: `M0 ${15 + Math.random() * 4} C 22 ${10 + Math.random() * 8}, 48 ${18 + Math.random() * 6}, 70 ${13 + Math.random() * 4} S 96 ${14 + Math.random() * 6}, 100 ${15 + Math.random() * 3}`, pathLength: 1 }, s);
      p.style.strokeDasharray = "1 2";
      p.style.strokeDashoffset = 1;
      li.querySelector("span").append(s);
    });
    const go = () => {
      items.forEach((li, i) => setTimeout(() => {
        gsap.to(li.querySelector("path"), { strokeDashoffset: 0, duration: 0.55, ease: "power2.inOut" });
        li.classList.add("done");
      }, reduce ? 0 : 250 + i * 420));
      setTimeout(() => left.classList.add("in"), reduce ? 0 : 250 + items.length * 420 + 200);
    };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); go(); } }, { threshold: 0.4 });
    io.observe($("#chores"));
  }
})();

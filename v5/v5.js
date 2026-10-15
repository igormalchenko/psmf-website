// Veria v5, "The press": messy sources in, one solid PSMF out.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  if (!window.gsap) return;
  if (window.Draggable) gsap.registerPlugin(Draggable);
  const onceInView = (el, fn, threshold = 0.35) => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); fn(); } }, { threshold });
    io.observe(el);
  };
  const relRect = (el, root) => {
    const a = el.getBoundingClientRect(), b = root.getBoundingClientRect();
    return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height };
  };

  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    headline();
    press();
    spreadsheet();
    sorting();
    merge();
    bigBook();
  });

  // ---------------------------------------------------------------------------
  // "Messy in." never quite sits still.
  // ---------------------------------------------------------------------------
  function headline() {
    const el = $(".h-in");
    const text = el.textContent;
    el.textContent = "";
    [...text].forEach((c) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = c === " " ? " " : c;
      el.append(s);
      if (reduce || c === " ") return;
      gsap.set(s, { rotation: gsap.utils.random(-7, 7), y: gsap.utils.random(-8, 8) });
      gsap.to(s, { rotation: gsap.utils.random(-7, 7), y: gsap.utils.random(-8, 8), duration: gsap.utils.random(1.6, 2.8), repeat: -1, yoyo: true, ease: "sine.inOut" });
    });
  }

  // ---------------------------------------------------------------------------
  // 1. The press: sources ride in crumpled, pass under the roller, come out as
  //    identical PSMF pages and land on the document, which gets thicker.
  // ---------------------------------------------------------------------------
  function press() {
    const line = $("#line"), roller = $("#roller"), bookWrap = $("#bookWrap"), book = $("#book"), defs = $("#filters");
    const cIn = $("#cIn"), cOut = $("#cOut");
    const bars = (n) => Array.from({ length: n }, (_, i) => `<div class="bar ${["", "m", "s"][i % 3]}"></div>`).join("");
    const rows = (n) => `<div class="trow h"><i></i><i></i><i></i></div>` + Array.from({ length: n }, () => `<div class="trow"><i></i><i></i><i></i></div>`).join("");
    const SOURCES = [
      {
        cls: "m-sheet", sec: "Annex E", title: "Vendor procedures", body: rows(8), pages: 4,
        html: `<div class="tb">procedure_index_export.xlsx</div><div class="gr">${[
          ["", "A", "B", "C", "D"], ["1", "SOP #", "Document title", "Rev.", "Owner"], ["2", "CASE PROC.", "", "", ""],
          ["3", "VP-SOP-012", "ICSR processing", "7.0", "K. Lind"], ["4", "VP-SOP-013", "Duplicate ch…", "1.10", "K. Lind"],
          ["5", "", "", "", ""], ["6", "VP-SOP-029", "Literature scr…", "3", "A. Berg"], ["7", "#REF!", "", "", ""],
          ["8", "VP-SOP-031", "(withdrawn?)", "2.0", "??"], ["9", "", "", "", ""], ["10", "", "", "", ""], ["11", "", "", "", ""],
        ].map((r, i) => r.map((c, j) => `<span class="${i === 0 || j === 0 ? "n" : i === 1 ? "h" : ""}">${c}</span>`).join("")).join("")}</div>`,
      },
      {
        cls: "m-doc", sec: "Section 5", title: "Pharmacovigilance processes", body: bars(13), pages: 9,
        html: `<div class="tb">PSMF v4.2 FINAL (2).docx</div><p>5.1 Cases are processed by <del>Medica Nord</del> <ins>Nordlys Safety Services</ins> according to VP-SOP-012.</p><p>Literature is screened <del>monthly</del> <ins>weekly</ins> under VP-SOP-031 <ins>029?</ins></p><p>Signals are reviewed at the safety committee [CHECK WITH ANNA].</p><p>See Annex J for the logbook.</p><div class="cmt">Is this still right? — L.N.</div>`,
      },
      {
        cls: "m-msg", sec: "Annex B.2", title: "Distribution partners", body: rows(5), pages: 2,
        html: `<div class="who"><b>MD</b>Maren Dahl · Legal</div><div class="bub">New one: Nordvia AB, Sweden and Finland. Contract signed 1 Sep.</div><div class="bub">SDEA attached.<br><span class="att">SDEA_Nordvia_signed.pdf</span></div><div class="bub me">Thanks, adding it.</div>`,
      },
      {
        cls: "m-pdf", sec: "Annex B", title: "Agreements on file", body: bars(6) + rows(3), pages: 3,
        html: `<div class="tb">SDEA_Nordvia_signed.pdf</div><h5>SAFETY DATA EXCHANGE AGREEMENT</h5><div class="ln"></div><div class="ln" style="width:80%"></div><div class="ln"></div><div class="ln" style="width:60%"></div><div class="ln"></div><div class="ln" style="width:75%"></div><div class="stamp">SIGNED<br>01.09.26</div><svg viewBox="0 0 80 30"><path d="M2 22c8-14 12-16 14-6s4 10 9-2 8-10 9 0 6 6 12-8 9 2 14 8 10-6 16-4" fill="none" stroke="#333" stroke-width="1.4"/></svg>`,
      },
      {
        cls: "m-csv", sec: "Annex F", title: "15-day reports to EMA", body: rows(9), pages: 2,
        html: `<div class="tb">ema_15day_export.csv</div>period;total;late;on_time\n2026-07;41;0;41\n2026-08;44;1;43\n2026-09;50;2;48\n;;;\n# exported by safety db 8.4\n# do not edit`,
      },
      {
        cls: "m-doc", sec: "Section 1", title: "The QPPV and back-up", body: bars(12), pages: 5,
        html: `<div class="tb">QPPV section (old template).docx</div><p>The EU QPPV is [Insert name]. The deputy is <del>Lars Nygaard</del> <ins>Ingrid Solberg</ins>.</p><p>24/7 number: [insert number]</p><p>In the QPPV's absence, cover is arranged per SOP-PV-002 <del>v3</del> <ins>v4.1</ins>.</p><div class="cmt">phone no. from HR?</div>`,
      },
    ];

    let rx = 0, bx = 0, running = false, sheets = [], nextSpawn = 0, spawned = 0, pagesOut = 0, sourcesIn = 0, last = performance.now();
    const SPEED = 150;
    const measure = () => {
      const rr = relRect(roller, line);
      rx = rr.x + rr.w / 2;
      const b = relRect(bookWrap, line);
      bx = b.x + b.w / 2;
    };
    measure();
    addEventListener("resize", measure);

    gsap.set(book, { rotationX: 10, rotationY: -36 });
    if (!reduce) gsap.to(book, { rotationY: -22, duration: 4.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
    const setDepth = () => { book.style.setProperty("--d", `${12 + 70 * (1 - Math.exp(-pagesOut / 40))}px`); };
    setDepth();

    function spawn(now) {
      const src = SOURCES[spawned % SOURCES.length];
      const id = `cr${spawned}`;
      defs.insertAdjacentHTML("beforeend", `<filter id="${id}" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency="0.028" numOctaves="2" seed="${spawned * 7 + 3}"/><feDisplacementMap in="SourceGraphic" scale="26" xChannelSelector="R" yChannelSelector="G"/></filter>`);
      const el = document.createElement("div");
      el.className = "sheet";
      el.innerHTML = `<div class="messy ${src.cls}" style="filter:url(#${id})">${src.html}</div><div class="clean"><div class="ch-top"><span>PSMF-HAL-001</span><span>Version 4.3</span></div><div class="ch-sec">${src.sec}</div><div class="ch-title">${src.title}</div>${src.body}</div>`;
      line.append(el);
      spawned++;
      sheets.push({
        el, src, t0: now, fid: id, disp: defs.lastElementChild.querySelector("feDisplacementMap"),
        messy: el.querySelector(".messy"), clean: el.querySelector(".clean"),
        rot: gsap.utils.random(-14, 14), y0: gsap.utils.random(-40, 40), sk: gsap.utils.random(-6, 6), counted: false, dropping: false,
      });
    }

    function frame(now) {
      if (!running) return;
      requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (now > nextSpawn) { nextSpawn = now + 1500; spawn(now); }
      sheets = sheets.filter((s) => {
        if (s.dropping) return true;
        s.x = (s.x ?? -240) + SPEED * dt;
        const x = s.x;
        const p = clamp((x + 105 - (rx - 150)) / 230);
        const e = ease(p);
        const rot = s.rot * (1 - e) + (p < 1 ? Math.sin(now / 600 + s.rot) * 1.5 * (1 - e) : 0);
        const y = s.y0 * (1 - e);
        s.el.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg) skewX(${s.sk * (1 - e)}deg)`;
        if (p > 0 && p < 1) s.disp.setAttribute("scale", String(26 * (1 - e)));
        const swap = clamp((p - 0.45) / 0.2);
        s.messy.style.opacity = 1 - swap;
        s.clean.style.opacity = swap;
        if (p >= 1 && s.messy.style.display !== "none") { s.messy.style.display = "none"; s.messy.style.filter = "none"; }
        if (!s.counted && p > 0.3) { s.counted = true; cIn.textContent = ++sourcesIn; }
        if (x + 105 >= bx - 150) {
          s.dropping = true;
          const b = relRect(bookWrap, line);
          gsap.to(s.el, {
            x: b.x, y: b.y + b.h / 2 - 140 - 30, rotation: 0, scale: 0.92, duration: 0.45, ease: "power2.in",
            onComplete() {
              gsap.to(s.el, { opacity: 0, duration: 0.15, onComplete: () => { s.el.remove(); $(`#${s.fid}`)?.remove(); } });
              pagesOut += s.src.pages;
              cOut.textContent = pagesOut;
              setDepth();
              gsap.fromTo(bookWrap, { y: -10 }, { y: 0, duration: 0.6, ease: "bounce.out" });
              s.done = true;
            },
          });
        }
        return true;
      });
      sheets = sheets.filter((s) => !s.done);
    }
    if (reduce) { pagesOut = 64; sourcesIn = 14; cIn.textContent = sourcesIn; cOut.textContent = pagesOut; setDepth(); return; }
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
      else if (!e.isIntersecting) running = false;
    }).observe(line);
  }

  // ---------------------------------------------------------------------------
  // 2. A vendor's spreadsheet, tidied into the PSMF's table, step by step.
  // ---------------------------------------------------------------------------
  function spreadsheet() {
    const grid = $("#grid"), steps = $$("#steps span"), trayList = $("#trayList"), name = $("#gridName");
    const RH = 38;
    const MESSY = [[0, 104], [104, 170], [274, 58], [332, 128], [460, 96], [556, 76]];
    const NO_OWNER = [[0, 104], [104, 170], [274, 58], [332, 0], [332, 96], [428, 76]];
    const CLEAN = [[0, 110], [110, 190], [300, 84], [384, 0], [474, 120], [384, 90]];
    const colsAt = (s) => (s < 3 ? MESSY : s < 4 ? NO_OWNER : CLEAN);
    const ORDER = [
      ["title", "hdr", "grp", "r12", "r13", "blank", "r29"],
      ["hdr", "grp", "r12", "r13", "blank", "r29"],
      ["hdr", "r12", "r13", "blank", "r29"],
      ["hdr", "r12", "r13", "r29"],
      ["hdr", "r12", "r13", "r29", "r31"],
    ];
    const orderAt = (s) => ORDER[s < 1 ? 0 : s < 6 ? 1 : s < 7 ? 2 : s < 9 ? 3 : 4];
    const DATA = {
      hdr: ["SOP #", "Document title", "Rev.", "Owner (internal)", "Eff. date", "Status"],
      r12: ["VP-SOP-012", "ICSR processing", "7.0", "K. Lind", "03/10/2026", "Active"],
      r13: ["VP-SOP-013", "Duplicate check", "1.10", "K. Lind", "03/10/2026", "Active"],
      blank: ["", "", "", "", "", ""],
      r29: ["VP-SOP-029", "Literature screening", "3.0", "A. Berg", "15/09/2026", "Active"],
      r31: ["VP-SOP-031", "Literature screening (old)", "2.0", "", "01/02/2024", "Active"],
    };
    const HDR_CLEAN = ["ID", "Title", "Version", "", "Effective date", "Status"];
    let cells = {};
    let timers = [];

    function build() {
      grid.textContent = "";
      grid.classList.remove("clean-mode");
      trayList.textContent = "";
      name.textContent = "procedure_index_export.xlsx";
      cells = {};
      const add = (id, text, cls) => {
        const c = document.createElement("div");
        c.className = `cell ${cls || ""}`;
        c.textContent = text;
        grid.append(c);
        cells[id] = c;
      };
      add("title", "Nordlys Safety Services · Procedure index · exported 3 Oct 2026", "ttl");
      add("grp", "CASE PROCESSING", "grp");
      Object.entries(DATA).forEach(([row, vals]) => vals.forEach((v, c) => {
        if (row !== "r12" && c === 5 && row !== "hdr" && row !== "r31") return;
        add(`${row}_${c}`, v, row === "hdr" ? "hd" : row === "blank" ? "blank" : c === 5 && row === "r12" ? "mrg" : "");
      }));
      add("r13_5", "Active", "");
      add("r29_5", "Active", "");
      steps.forEach((s) => s.classList.remove("on"));
    }

    function rectOf(id, s) {
      const order = orderAt(s), cols = colsAt(s);
      const full = cols.reduce((m, [x, w]) => Math.max(m, x + w), 0);
      const yOf = (row) => order.indexOf(row);
      if (id === "title" || id === "grp") {
        const r = yOf(id);
        return r < 0 ? { o: 0 } : { x: 0, y: r * RH, w: full, h: RH, o: 1 };
      }
      const [row, cs] = id.split("_"), c = +cs;
      const r = yOf(row);
      if (r < 0) return { o: 0, h: row === "blank" ? 0 : RH };
      const [x, w] = cols[c];
      if (w === 0) return { x, y: r * RH, w: 0, h: RH, o: 0 };
      if (row === "r12" && c === 5 && s < 5) {
        const last = yOf("r29");
        return { x, y: r * RH, w, h: (last - r + 1) * RH, o: 1 };
      }
      if ((row === "r13" || row === "r29") && c === 5 && s < 5) return { x, y: r * RH, w, h: RH, o: 0 };
      if (row === "r31" && s < 9) return { o: 0 };
      return { x, y: r * RH, w, h: RH, o: 1 };
    }

    function go(s, animate) {
      Object.keys(cells).forEach((id) => {
        const r = rectOf(id, s);
        const props = { opacity: r.o };
        if (r.x !== undefined) Object.assign(props, { left: r.x, top: r.y, width: r.w, height: r.h });
        if (animate) gsap.to(cells[id], { ...props, duration: 0.7, ease: "power3.inOut" });
        else gsap.set(cells[id], props);
      });
      grid.style.height = `${orderAt(s).length * RH + 4}px`;
      steps.forEach((el, i) => el.classList.toggle("on", i < s));
    }

    const tray = (text) => {
      const li = document.createElement("li");
      li.textContent = text;
      trayList.append(li);
      gsap.from(li, { x: -40, opacity: 0, duration: 0.5, ease: "back.out(2)" });
    };

    const SCRIPT = [
      () => { tray("Title row"); },
      () => { DATA.hdr.forEach((_, c) => { const el = cells[`hdr_${c}`]; if (HDR_CLEAN[c] && HDR_CLEAN[c] !== el.textContent) { gsap.fromTo(el, { color: "#0a6cc2" }, { color: "", duration: 1.2 }); el.textContent = HDR_CLEAN[c]; } }); },
      () => { tray("Owner (internal) column"); },
      () => {},
      () => { cells.r12_5.classList.remove("mrg"); },
      () => { tray("Group row “CASE PROCESSING”"); },
      () => { tray("1 blank row"); },
      () => { const n = document.createElement("span"); n.className = "note"; n.textContent = "not 1.1"; cells.r13_2.append(n); gsap.fromTo(cells.r13_2, { scale: 1.12 }, { scale: 1, duration: 0.6, ease: "back.out(3)" }); },
      () => {
        grid.classList.add("clean-mode");
        name.textContent = "Annex E · Vendor procedures · 1 updated · 1 new · 1 withdrawn";
        cells.r13_2.querySelector(".note")?.remove();
        cells.r12_2.innerHTML = `<span class="was">6.0</span>7.0`;
        cells.r12_2.classList.add("chg");
        ["r13_0", "r13_1", "r13_2", "r13_4", "r13_5"].forEach((id) => cells[id].classList.add("new"));
        ["r31_0", "r31_1", "r31_2", "r31_4", "r31_5"].forEach((id) => cells[id].classList.add("gone"));
      },
    ];

    function run() {
      timers.forEach(clearTimeout);
      timers = [];
      build();
      go(0, false);
      SCRIPT.forEach((fn, i) => timers.push(setTimeout(() => { go(i + 1, true); fn(); }, 900 + i * 1150)));
    }
    $("#sheetReplay").addEventListener("click", run);
    build();
    go(0, false);
    if (reduce) { SCRIPT.forEach((fn, i) => { go(i + 1, false); fn(); }); return; }
    onceInView($(".grid-box"), run, 0.5);
  }

  // ---------------------------------------------------------------------------
  // 3. Their chapters fly into the standard structure.
  // ---------------------------------------------------------------------------
  function sorting() {
    const stage = $("#sortStage"), slotsEl = $("#slots"), aside = $("#aside");
    const SLOTS = [["Cover", ""], ["Abbreviations", ""], ["Section 1", "The QPPV"], ["Section 2", "Organisation"], ["Section 3", "Safety data"], ["Section 4", "Systems"],
      ["Section 5", "Processes"], ["Section 6", "Performance"], ["Section 7", "Quality"], ["Annex A", "The QPPV"], ["Annex B", "Organisation"], ["Annex C", "Safety data"],
      ["Annex D", "Systems"], ["Annex E", "Procedures"], ["Annex F", "Performance"], ["Annex G", "Quality"], ["Annex H", "Products"], ["Annex I", "Logbook"]];
    const PARTS = [["How we handle cases", "Word", 6], ["Appendix 2 · Partners", "Excel", 10], ["Front page", "Word", 0], ["KPI workbook", "Excel", 14],
      ["Table of contents", "Word", -1], ["Our QPPV and back-up", "Word", 2], ["SOP index", "Excel", 13], ["Company structure", "Word", 3], ["Product list", "Excel", 16],
      ["Where reports come from", "Word", 4], ["Appendix 1 · CVs", "PDF", 9], ["IT landscape", "Word", 5], ["Glossary", "Word", 1], ["Audit log", "Excel", 15],
      ["Measuring compliance", "Word", 7], ["System list", "Excel", 12], ["Signature page", "Word", -1], ["QA, audits and training", "Word", 8],
      ["Studies and programmes", "Word", 11], ["Change history", "Word", 17]];
    const slots = SLOTS.map(([b, t]) => {
      const d = document.createElement("div");
      d.className = "slot";
      d.innerHTML = `<b>${b}</b><span>${t}</span><span class="from"></span>`;
      slotsEl.append(d);
      return d;
    });
    let parts = [], timers = [];
    function run() {
      timers.forEach(clearTimeout);
      timers = [];
      parts.forEach((p) => p.remove());
      $$("li", aside).forEach((l) => l.remove());
      slots.forEach((s) => { s.classList.remove("filled"); s.querySelector(".from").textContent = ""; });
      const W = stage.clientWidth;
      parts = PARTS.map(([n, k]) => {
        const p = document.createElement("div");
        p.className = "part";
        p.innerHTML = `${n}<small>${k}</small>`;
        stage.append(p);
        gsap.set(p, { x: gsap.utils.random(0, W - 180), y: gsap.utils.random(-130, -50), rotation: gsap.utils.random(-14, 14), opacity: 0 });
        return p;
      });
      gsap.to(parts, { opacity: 1, duration: 0.4, stagger: 0.03 });
      PARTS.forEach(([n, , target], i) => timers.push(setTimeout(() => {
        const p = parts[i];
        if (target < 0) {
          const li = document.createElement("li");
          li.className = "part";
          li.style.position = "static";
          li.style.marginBottom = "6px";
          li.innerHTML = p.innerHTML;
          const r = relRect(aside, stage);
          gsap.to(p, { x: r.x + 10, y: r.y + 30 + $$("li", aside).length * 44, rotation: 0, duration: 0.6, ease: "power3.inOut", onComplete: () => { aside.append(li); p.remove(); } });
          return;
        }
        const r = relRect(slots[target], stage);
        gsap.to(p, {
          x: r.x + 6, y: r.y + 36, rotation: 0, scale: 0.86, duration: 0.6, ease: "power3.inOut",
          onComplete() {
            slots[target].classList.add("filled");
            slots[target].querySelector(".from").textContent = `from “${n}”`;
            gsap.fromTo(slots[target], { scale: 1.06 }, { scale: 1, duration: 0.5, ease: "back.out(3)" });
            gsap.to(p, { opacity: 0, duration: 0.2, onComplete: () => p.remove() });
          },
        });
      }, 900 + i * 170)));
    }
    $("#sortReplay").addEventListener("click", run);
    if (reduce) {
      PARTS.forEach(([n, , t]) => { if (t >= 0) { slots[t].classList.add("filled"); slots[t].querySelector(".from").textContent = `from “${n}”`; } });
      return;
    }
    onceInView(slotsEl, run, 0.4);
  }

  // ---------------------------------------------------------------------------
  // 4. Three colleagues' lists become one answer; the clash is set aside.
  // ---------------------------------------------------------------------------
  function merge() {
    const stage = $("#mergeStage");
    const PEOPLE = [
      { who: "Maren · Legal", ini: "MD", color: "#c9d8ff", rows: [["Medica Nord AS", "Norway, Denmark", ""], ["Nordvia AB", "Sweden, Finland", "new"]] },
      { who: "Tobias · Norway office", ini: "TE", color: "#ffd6c7", rows: [["Medica Nord AS", "Norway, Denmark, Iceland", "chg"], ["Baltpharm UAB", "Lithuania", "chg"]] },
      { who: "Silje · Baltic office", ini: "SH", color: "#c7f0dc", rows: [["Baltpharm UAB", "Lithuania, Latvia, Estonia", "chg"], ["Riga Med SIA", "Latvia", "new"]] },
    ];
    // Which source row lands on which combined row; [-1] is the clash.
    const FINAL = [["Medica Nord AS", "Norway, Denmark, Iceland", 1], ["Nordvia AB", "Sweden, Finland", 0], ["Baltpharm UAB", "Lithuania", 1], ["Riga Med SIA", "Latvia", 2]];
    const FLY = [[0, 1, 1], [1, 0, 0], [1, 1, 2], [2, 1, 3], [2, 0, -1]];
    stage.innerHTML = PEOPLE.map((p, i) => `<div class="src" data-i="${i}"><div class="who"><i style="background:${p.color}">${p.ini}</i>${p.who}</div>${p.rows.map((r) => `<div class="row ${r[2]}"><span>${r[0]}</span><span>${r[1]}</span></div>`).join("")}</div>`).join("") +
      `<div class="combined"><h4>Distributors · Maren's answer <small>with Tobias and Silje</small></h4>${FINAL.map(([a, b, who]) => `<div class="row"><span><i class="dot" style="background:${PEOPLE[who].color}"></i>${a}</span><span>${b}</span></div>`).join("")}</div>` +
      `<div class="settle"><b>Settle by hand</b><p>Baltpharm UAB: Silje says Lithuania, Latvia, Estonia. Tobias already changed this row, so nothing was overwritten.</p></div>`;
    const srcs = $$(".src", stage), combinedRows = $$(".combined .row", stage), settle = $(".settle", stage), combined = $(".combined", stage);
    const place = () => {
      const W = stage.clientWidth;
      const narrow = W < 560;
      srcs.forEach((s, i) => {
        if (narrow) gsap.set(s, { left: 0, top: i * 120, width: "100%" });
        else gsap.set(s, { left: [0, (W - 230) / 2, W - 230][i], top: [0, 40, 0][i] });
      });
    };
    let timers = [];
    function run() {
      timers.forEach(clearTimeout);
      timers = [];
      $$(".fly", stage).forEach((f) => f.remove());
      place();
      gsap.set(combinedRows, { opacity: 0 });
      gsap.set(settle, { opacity: 0, x: 20 });
      gsap.fromTo(srcs, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: "back.out(1.6)" });
      gsap.fromTo(combined, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.5 });
      FLY.forEach(([pi, ri, target], k) => timers.push(setTimeout(() => {
        const from = $$(".row", srcs[pi])[ri];
        const a = relRect(from, stage);
        const clone = from.cloneNode(true);
        clone.classList.add("fly");
        Object.assign(clone.style, { position: "absolute", left: "0", top: "0", width: `${a.w}px`, margin: "0", zIndex: 5, boxShadow: "0 10px 24px -8px rgba(0,0,0,0.35)" });
        stage.append(clone);
        gsap.set(clone, { x: a.x, y: a.y });
        if (target >= 0) {
          const b = relRect(combinedRows[target], stage);
          gsap.to(clone, {
            x: b.x, y: b.y, width: b.w, duration: 0.8, ease: "power3.inOut",
            onComplete() { gsap.to(combinedRows[target], { opacity: 1, duration: 0.2 }); gsap.fromTo(combinedRows[target], { backgroundColor: "#fff1c2" }, { backgroundColor: "#f3f1eb", duration: 1 }); clone.remove(); },
          });
        } else {
          const b = relRect(combinedRows[2], stage), c = relRect(settle, stage);
          gsap.timeline()
            .to(clone, { x: b.x + 40, y: b.y - 6, duration: 0.6, ease: "power3.in" })
            .to(clone, { x: b.x + 70, y: b.y - 40, rotation: 6, duration: 0.25, ease: "power2.out", backgroundColor: "#ffe7b8" })
            .to(clone, { x: c.x, y: c.y - 46, rotation: 0, width: c.w, duration: 0.6, ease: "power3.inOut" })
            .to(settle, { opacity: 1, x: 0, duration: 0.4 }, "<0.3");
        }
      }, 1300 + k * 650)));
    }
    $("#mergeReplay").addEventListener("click", run);
    addEventListener("resize", place);
    place();
    if (reduce) { gsap.set(combinedRows, { opacity: 1 }); gsap.set(settle, { opacity: 1 }); return; }
    gsap.set([srcs, combined], { opacity: 0 });
    onceInView(stage, run, 0.35);
  }

  // ---------------------------------------------------------------------------
  // 5. The document itself: drag to turn it over in your hands.
  // ---------------------------------------------------------------------------
  function bigBook() {
    const stage = $("#objStage"), book = $("#bigBook");
    const rest = { rx: 8, ry: -28 };
    const st = { ...rest };
    const render = () => gsap.set(book, { rotationX: st.rx, rotationY: st.ry });
    render();
    let idle = reduce ? null : gsap.to(st, { ry: -18, duration: 3.5, yoyo: true, repeat: -1, ease: "sine.inOut", onUpdate: render });
    let sx = 0, sy = 0, base = null;
    stage.addEventListener("pointerdown", (e) => {
      idle?.pause();
      gsap.killTweensOf(st);
      sx = e.clientX; sy = e.clientY; base = { ...st };
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener("pointermove", (e) => {
      if (!base) return;
      st.ry = base.ry + (e.clientX - sx) * 0.45;
      st.rx = clamp(base.rx - (e.clientY - sy) * 0.25, -35, 45);
      render();
    });
    const up = () => {
      if (!base) return;
      base = null;
      gsap.to(st, {
        rx: rest.rx, ry: rest.ry + Math.round((st.ry - rest.ry) / 360) * 360, duration: 1.4, ease: "elastic.out(1, 0.45)", onUpdate: render,
        onComplete() { st.ry = rest.ry; if (!reduce) idle = gsap.to(st, { ry: -18, duration: 3.5, yoyo: true, repeat: -1, ease: "sine.inOut", onUpdate: render }); },
      });
    };
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", up);
  }
})();

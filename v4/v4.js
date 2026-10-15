// Veria v4, "Proofread": the mistakes, found and fixed.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!window.gsap) return;
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  const onceInView = (el, fn, threshold = 0.35) => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); fn(); } }, { threshold });
    io.observe(el);
  };

  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    hero();
    catalogue();
    rewrite();
    sieve();
    signoff();
  });

  // ---------------------------------------------------------------------------
  // 1. The check: a scan finds five problems, three fixes are drafted, two wait for you.
  // ---------------------------------------------------------------------------
  function hero() {
    const word = $("#sqWord");
    setTimeout(() => word.classList.add("on"), 200);

    const vbody = $(".vbody"), doc = $("#doc"), scan = $("#scan"), margin = $("#margin"), wires = $("#wires");
    const stat = $("#vstat"), text = $("#vtext"), apply = $("#applyBtn");
    const issues = $$(".iss", doc), notes = $$(".note", margin);
    const AMBER = [3, 4], FIX = [0, 1, 2];
    const original = issues.map((x) => x.innerHTML);
    const again = document.createElement("button");
    again.className = "again";
    again.type = "button";
    again.textContent = "Run the check again";
    $(".vbar").append(again);

    let pins = [], paths = [], found = 0, timers = [];
    const desktop = () => innerWidth > 900;
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));

    function place() {
      const b = vbody.getBoundingClientRect();
      wires.setAttribute("viewBox", `0 0 ${b.width} ${b.height}`);
      let prevBottom = 0;
      issues.forEach((iss, i) => {
        const r = iss.getBoundingClientRect();
        const y = r.top - b.top + r.height / 2;
        pins[i].style.top = `${y}px`;
        if (!desktop()) return;
        const n = notes[i];
        const top = Math.max(y - 22, prevBottom + 10);
        n.style.top = `${top}px`;
        prevBottom = top + n.offsetHeight;
        const x0 = r.right - b.left + 4, mx = margin.getBoundingClientRect().left - b.left + 16, y1 = top + 22;
        paths[i].setAttribute("d", `M${x0} ${y}C${x0 + 60} ${y} ${mx - 60} ${y1} ${mx} ${y1}`);
      });
      vbody.style.minHeight = desktop() ? `${Math.max(560, prevBottom + 24)}px` : "";
    }
    function build() {
      pins.forEach((p) => p.remove());
      wires.textContent = "";
      pins = issues.map((_, i) => {
        const p = document.createElement("span");
        p.className = AMBER.includes(i) ? "pinm amber" : "pinm";
        p.textContent = i + 1;
        doc.append(p);
        return p;
      });
      paths = issues.map((_, i) => {
        const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
        if (AMBER.includes(i)) p.setAttribute("class", "amber");
        p.style.opacity = 0;
        wires.append(p);
        return p;
      });
      notes.forEach((n, i) => { n.className = AMBER.includes(i) ? "note amber" : "note"; });
      place();
    }

    const texts = notes.map((n) => [...n.querySelectorAll(".kind, .act")].map((x) => x.textContent));
    function reset() {
      timers.forEach(clearTimeout);
      timers = [];
      found = 0;
      issues.forEach((x, i) => {
        x.innerHTML = original[i];
        x.className = i === 3 ? "iss row" : "iss";
      });
      $$(".dr.held", doc).forEach((r) => r.classList.remove("held"));
      notes.forEach((n, i) => {
        gsap.set(n, { opacity: 0, x: 24, scale: 1 });
        [...n.querySelectorAll(".kind, .act")].forEach((x, j) => { x.textContent = texts[i][j]; });
      });
      build();
      stat.className = "vstat";
      word.classList.remove("fixed");
      text.textContent = "Checking";
      apply.disabled = true;
      apply.textContent = "Apply 3 fixes";
      apply.classList.remove("pulse");
      apply.style.display = "";
      again.style.display = "none";
    }

    function hit(i) {
      const iss = issues[i];
      iss.classList.add("hit");
      if (AMBER.includes(i)) iss.classList.add("amber");
      gsap.to(pins[i], { scale: 1, duration: 0.45, ease: "back.out(3)" });
      gsap.to(notes[i], { opacity: 1, x: 0, duration: 0.6, ease: "power3.out", delay: 0.1 });
      gsap.to(paths[i], { opacity: 0.6, duration: 0.5, delay: 0.25 });
      found++;
      text.textContent = `${found} found`;
      stat.className = "vstat found";
    }

    function runScan() {
      const h = doc.offsetHeight;
      const ys = issues.map((iss) => iss.getBoundingClientRect().top - doc.getBoundingClientRect().top);
      const o = { y: -90 };
      gsap.set(scan, { opacity: 1 });
      gsap.to(o, {
        y: h, duration: reduce ? 0.01 : 2.8, ease: "none",
        onUpdate() {
          scan.style.transform = `translateY(${o.y}px)`;
          ys.forEach((y, i) => { if (!issues[i].classList.contains("hit") && y < o.y + 84) hit(i); });
        },
        onComplete() {
          gsap.to(scan, { opacity: 0, duration: 0.4 });
          issues.forEach((x, i) => { if (!x.classList.contains("hit")) hit(i); });
          text.textContent = "5 found · 3 fixes drafted · 2 need you";
          apply.disabled = false;
          apply.classList.add("pulse");
          later(() => { if (!apply.disabled) applyFixes(); }, 4200);
        },
      });
    }

    function fix(i, delay) {
      const iss = issues[i], oldText = iss.textContent, newText = iss.dataset.new;
      iss.textContent = "";
      const gone = document.createElement("span");
      gone.className = "gone";
      gone.textContent = oldText;
      const neu = document.createElement("span");
      neu.className = "neu";
      neu.textContent = ` ${newText}`;
      iss.append(gone, neu);
      gsap.timeline({ delay })
        .to(neu, { maxWidth: () => neu.scrollWidth + 2, duration: 0.6, ease: "power2.out" })
        .to(gone, { maxWidth: 0, opacity: 0, duration: 0.5, ease: "power2.inOut" }, "+=0.35")
        .add(() => {
          iss.classList.remove("hit");
          iss.classList.add("ok");
          iss.textContent = newText;
          pins[i].className = "pinm ok";
          pins[i].textContent = "✓";
          gsap.fromTo(pins[i], { scale: 1.5 }, { scale: 1, duration: 0.5, ease: "back.out(3)" });
          notes[i].classList.add("ok");
          notes[i].querySelector(".kind").textContent = "Fixed";
          notes[i].querySelector(".act.fix").textContent = "In every place it appears";
          paths[i].setAttribute("class", "ok");
          if (desktop()) place();
        });
    }

    function decide(i, accept) {
      const n = notes[i];
      if (n.classList.contains("decided")) return;
      if (accept) n.querySelector(".act.done").textContent = "Accepted as is, with your reason";
      n.classList.remove("asking");
      n.classList.add("decided", "ok");
      issues[i].classList.remove("hit", "amber");
      if (!accept && i === 3) issues[i].closest(".dr").classList.add("held");
      pins[i].className = "pinm ok";
      pins[i].textContent = "✓";
      paths[i].setAttribute("class", "ok");
      gsap.fromTo(n, { scale: 0.97 }, { scale: 1, duration: 0.5, ease: "back.out(3)" });
      if (desktop()) place();
      if (AMBER.every((j) => notes[j].classList.contains("decided"))) {
        stat.className = "vstat clear";
        word.classList.add("fixed");
        text.textContent = "Nothing open · ready to sign";
        gsap.fromTo(stat, { scale: 1.08 }, { scale: 1, duration: 0.6, ease: "back.out(3)" });
        apply.style.display = "none";
        again.style.display = "inline";
      }
    }

    function applyFixes() {
      apply.disabled = true;
      apply.classList.remove("pulse");
      apply.textContent = "Applying";
      FIX.forEach((i, k) => fix(i, k * 0.55));
      later(() => {
        text.textContent = "3 fixed · 2 need you";
        apply.textContent = "3 fixed";
        AMBER.forEach((i) => { notes[i].classList.add("asking"); if (desktop()) place(); });
        // If nobody decides, show what deciding looks like.
        later(() => AMBER.forEach((i, k) => later(() => {
          const b = notes[i].querySelector(".c-a");
          if (!notes[i].classList.contains("decided")) { gsap.fromTo(b, { scale: 0.92 }, { scale: 1, duration: 0.4 }); decide(i, false); }
        }, k * 700)), 3800);
      }, 2400);
    }

    apply.addEventListener("click", applyFixes);
    notes.forEach((n, i) => {
      const a = n.querySelector(".c-a"), b = n.querySelector(".c-b");
      if (a) a.addEventListener("click", () => decide(i, false));
      if (b) b.addEventListener("click", () => decide(i, true));
    });
    again.addEventListener("click", () => { reset(); runScan(); });
    addEventListener("resize", () => place());

    reset();
    later(runScan, reduce ? 0 : 1100);
  }

  // ---------------------------------------------------------------------------
  // 2. The catalogue: one switch flips every specimen to what Veria does with it.
  // ---------------------------------------------------------------------------
  function catalogue() {
    const sw = $("#switch"), specs = $$(".spec"), grid = $("#specs");
    const set = (on) => {
      sw.setAttribute("aria-checked", String(on));
      grid.classList.toggle("flipped", on);
      specs.forEach((s, i) => setTimeout(() => s.classList.toggle("after", on), i * 45));
    };
    sw.addEventListener("click", () => set(sw.getAttribute("aria-checked") !== "true"));
    onceInView(grid, () => {
      if (reduce) return;
      setTimeout(() => set(true), 600);
      setTimeout(() => { if (sw.dataset.touched !== "1") set(false); }, 4200);
    });
    sw.addEventListener("click", () => { sw.dataset.touched = "1"; });
  }

  // ---------------------------------------------------------------------------
  // 3. The rewrite: the suggestion writes itself; you accept it.
  // ---------------------------------------------------------------------------
  function rewrite() {
    const textEl = $("#rwText"), oldEl = $("#rwOld"), newEl = $("#rwNew"), why = $("#rwWhy"), accept = $("#rwAccept"), done = $("#rwDone");
    let timer = 0;
    const play = () => {
      clearTimeout(timer);
      textEl.classList.remove("accepted");
      accept.disabled = false;
      accept.textContent = "Accept";
      gsap.set(newEl, { maxWidth: 0 });
      gsap.set([why, done], { opacity: 0 });
      gsap.timeline()
        .fromTo(oldEl, { backgroundColor: "rgba(229,72,77,0.35)" }, { backgroundColor: "rgba(229,72,77,0.1)", duration: 0.9 }, 0.2)
        .to(why, { opacity: 1, duration: 0.5 }, 0.6)
        .to(newEl, { maxWidth: () => newEl.scrollWidth + 2, duration: 1.1, ease: `steps(${newEl.textContent.length})` }, 1.1);
      timer = setTimeout(acceptIt, 5200);
    };
    const acceptIt = () => {
      clearTimeout(timer);
      textEl.classList.add("accepted");
      gsap.fromTo(newEl, { backgroundColor: "rgba(18,146,79,0.25)" }, { backgroundColor: "rgba(18,146,79,0)", duration: 1.2 });
      gsap.to(done, { opacity: 1, duration: 0.5 });
      accept.disabled = true;
      accept.textContent = "Accepted";
    };
    accept.addEventListener("click", acceptIt);
    $(".rw-ghost").addEventListener("click", play);
    onceInView($(".rw-card"), play, 0.5);
  }

  // ---------------------------------------------------------------------------
  // 4. The sieve: clean updates fall through into the draft; wrong ones are held.
  // ---------------------------------------------------------------------------
  function sieve() {
    const canvas = $("#sieve"), ctx = canvas.getContext("2d");
    const GOOD = ["+ Nordvia AB", "SOP-PV-003 v8.0", "September figures", "No change", "Audit 2026-03 closed", "Database 8.4", "New SDEA-022", "No change", "Training complete", "PSUR submitted"];
    const BAD = ["2 + 47 ≠ 50", "date went backwards", "half-filled row", "October isn't over", "version went down", "rows removed", "deputy QPPV changed", "a note, not a value"];
    let W = 0, H = 0, dpr = 1, items = [], last = 0, running = false, flash = 0, glowL = 0, glowR = 0;
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
    };
    size();
    addEventListener("resize", size);
    const bar = () => H * 0.44;
    const binL = () => ({ x: W * 0.27, y: H - 56 }), binR = () => ({ x: W * 0.73, y: H - 56 });
    function spawn(now) {
      const bad = Math.random() < 0.3;
      const pool = bad ? BAD : GOOD;
      const label = pool[(Math.random() * pool.length) | 0];
      ctx.font = "500 12px 'IBM Plex Sans'";
      items.push({ bad, label, w: ctx.measureText(label).width + 20, x: W * (0.18 + Math.random() * 0.5), t0: now, caught: false });
    }
    const pill = (x, y, w, fill, stroke, color, label, a) => {
      ctx.globalAlpha = a;
      ctx.beginPath(); ctx.roundRect(x - w / 2, y - 12, w, 24, 12);
      ctx.fillStyle = fill; ctx.fill();
      ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = color; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(label, x, y + 0.5);
    };
    function frame(now) {
      if (!running) return;
      requestAnimationFrame(frame);
      if (now - last > 320) { last = now; spawn(now); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.font = "500 12px 'IBM Plex Sans'";
      const by = bar();

      // Bins
      [[binL(), "Into the draft", "18,146,79", glowL], [binR(), "Held for you, with the reason", "217,127,6", glowR]].forEach(([b, label, rgb, g]) => {
        ctx.globalAlpha = 1;
        const w = W * 0.38;
        ctx.fillStyle = `rgba(${rgb},${0.06 + 0.1 * g})`;
        ctx.beginPath(); ctx.roundRect(b.x - w / 2, b.y - 26, w, 70, 14); ctx.fill();
        ctx.fillStyle = `rgba(${rgb},1)`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.font = "600 13px 'IBM Plex Sans'";
        ctx.fillText(label, b.x, b.y + 22);
        ctx.font = "500 12px 'IBM Plex Sans'";
      });
      glowL *= 0.94; glowR *= 0.94;

      // The check
      ctx.globalAlpha = 1;
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, "rgba(0,105,168,0)"); grad.addColorStop(0.15, "rgba(0,105,168,0.9)"); grad.addColorStop(0.85, "rgba(0,105,168,0.9)"); grad.addColorStop(1, "rgba(0,105,168,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, by - 1.5, W, 3);
      ctx.fillStyle = `rgba(217,127,6,${0.25 * flash})`;
      ctx.fillRect(0, by - 6, W, 12);
      flash *= 0.9;
      ctx.fillStyle = "#0069a8";
      ctx.font = "600 12px 'IBM Plex Mono'";
      ctx.textAlign = "right";
      ctx.fillText("Rules first, then the AI", W - 16, by + 22);
      ctx.font = "500 12px 'IBM Plex Sans'";

      items = items.filter((it) => {
        const t = (now - it.t0) / 1000;
        const fall = by + 2;
        const tFall = (fall + 20) / 150;
        let x = it.x, y = -20 + t * 150, a = 1, fill = "#ffffff", stroke = "rgba(23,25,29,0.15)", color = "#24272d";
        if (t > tFall) {
          const u = Math.min(1, (t - tFall) / 1.3), e = u * u * (3 - 2 * u);
          const target = it.bad ? binR() : binL();
          if (it.bad) {
            if (!it.caught) { it.caught = true; flash = 1; }
            fill = "#fff6e8"; stroke = "rgba(217,127,6,0.6)"; color = "#8a5000";
            x = it.x + (target.x - it.x) * e;
            y = fall - Math.sin(Math.PI * Math.min(1, u * 1.6)) * 26 + (target.y - fall) * e;
          } else {
            fill = "#ecf8f1"; stroke = "rgba(18,146,79,0.5)"; color = "#0c6b3a";
            x = it.x + (target.x - it.x) * e;
            y = fall + (target.y - fall) * e;
          }
          if (u >= 1) { if (it.bad) glowR = 1; else glowL = 1; return false; }
          a = u > 0.85 ? (1 - u) / 0.15 : 1;
        }
        pill(x, y, it.w, fill, stroke, color, it.label, a);
        return true;
      });
      ctx.globalAlpha = 1;
    }
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running && !reduce) { running = true; requestAnimationFrame(frame); }
      else if (!e.isIntersecting) running = false;
    }).observe(canvas);
    if (reduce) { running = true; const now = performance.now(); for (let i = 0; i < 8; i++) { spawn(now - i * 600); } frame(now); running = false; }
  }

  // ---------------------------------------------------------------------------
  // 5. Sign-off: the checks tick; then the button wakes up.
  // ---------------------------------------------------------------------------
  function signoff() {
    const items = $$(".checks li"), btn = $("#signBig");
    onceInView($(".check-card"), () => {
      items.forEach((li, i) => setTimeout(() => li.classList.add("on"), 300 + i * 450));
      setTimeout(() => { btn.disabled = false; btn.classList.add("ready"); }, 300 + items.length * 450 + 200);
    }, 0.5);
    btn.addEventListener("click", () => {
      btn.textContent = "Signed · version 4.3 is in force";
      btn.style.background = "#12924f";
      gsap.fromTo(btn, { scale: 0.97 }, { scale: 1, duration: 0.6, ease: "back.out(3)" });
    });
  }
})();

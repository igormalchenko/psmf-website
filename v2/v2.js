// Veria, second landing page. Seven scenes, each in its own function.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const backOut = (t) => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const rng = (seed) => () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const gsapOk = !!(window.gsap && window.ScrollTrigger);
  if (gsapOk) gsap.registerPlugin(ScrollTrigger);

  // Smooth scrolling
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
    if (gsapOk) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      lenis.scrollTo(a.getAttribute("href"), { duration: 1.8 });
    }));
  }

  // 0 when a tall section's top meets the viewport top, 1 when its bottom meets the viewport bottom.
  const progressOf = (el) => {
    const r = el.getBoundingClientRect();
    return clamp(-r.top / (r.height - innerHeight));
  };
  const whileVisible = (el, start, stop) => new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(el);

  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener("pointermove", (e) => {
    mouse.x = (e.clientX / innerWidth - 0.5) * 2;
    mouse.y = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });

  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    hero();
    if (gsapOk) { seven(); stamp(); proof(); ready(); }
    orbit();
    tunnel();
  });

  // ---------------------------------------------------------------------------
  // 1. Scattered → whole. Facts and inbox clutter drift in 3D; scrolling blows
  // the clutter past the camera and lands the facts on one signed page.
  // ---------------------------------------------------------------------------
  function hero() {
    const section = $("#hero"), canvas = $("#cloud"), ctx = canvas.getContext("2d");
    const ha = $(".ha"), hb = $(".hb"), hbLines = $$(".hb .ln > span"), cue = $(".cue");
    const GROUPS = [
      ["Cover", ["PSMF-HAL-001", "Halvorsen Pharma A/S", "Hellerup, Denmark", "14 products"]],
      ["1  The QPPV", ["Anna Weber, EU QPPV", "Ingrid Solberg, deputy", "Oliver Bennett, UK QPPV"]],
      ["2  Organisation", ["Medica Nord AS", "Nordvia AB", "Baltpharm UAB", "Nordlys Safety Services", "Medinfo Partners"]],
      ["4  Systems", ["Safety database 8.4", "MedDRA 28.1", "Validated May 2026"]],
      ["5  Processes", ["SOP-PV-003 v7.0", "SOP-PV-011 v5.0", "VP-SOP-012", "VP-SOP-029", "Literature, weekly"]],
      ["6  Performance", ["15-day reports 98.9% on time", "90-day reports 99.4% on time", "PSUR 2026-04 submitted"]],
      ["7  Quality", ["Audit 2026-03 closed", "CAPA-2026-014", "Training 2026 complete"]],
      ["Annex B", ["SDEA-014", "SDEA-017", "SDEA-022"]],
      ["Annex I", ["4.3  New distributor Nordvia AB"]],
    ];
    const MESS = [
      "RE: RE: FW: distributor contract", "PSMF_v4.2_final_FINAL.docx", "PSMF_v4.2_final_FINAL (2).docx", "Annex E, use this one.xlsx",
      "Fwd: deputy QPPV CV", "did anyone update Annex B?", "who owns section 5??", "SOP index (draft).xlsx", "312 tracked changes",
      "47 comments", "printed, signed, scanned", "PSMF_tracker_2026.xlsx", "RE: quick question", "can you check before Friday",
      "Out of office until 3 Nov", "which version is current?", "Annex F figures Sept.csv", "copy of copy of Annex H.xlsx",
      "SDEA_Nordvia_signed.pdf", "Re: Re: Re: logbook?", "audit_report_CONFIDENTIAL.pdf", "minutes, safety committee.docx",
      "v4.1 vs v4.2 compare.docx", "Reminder: PSMF update due", "FYI new MedDRA version", "who changed the org chart?",
      "Annex C (old).docx", "QPPV_CV_2019.pdf", "pls ignore previous email", "where is the signed copy?", "Sent from my iPhone",
      "Reply all", "14 attachments", "PSMF_v4.0_signed_scan.pdf", "Annex D: IT to confirm", "tracker updated?",
      "Section 2: legal to check", "Re: distributor list", "Fw: SOP renumbering", "KPI_export.xlsx", "call me re: Annex G",
      "final-final-v3.docx", "Re: CAPA status?", "new partner in Finland??", "draft – do not circulate",
    ];
    const SP = 32;
    const sprite = (text, font, color, bg, padX) => {
      const c = document.createElement("canvas"), g = c.getContext("2d");
      g.font = font;
      const w = Math.ceil(g.measureText(text).width) + padX * 2, h = Math.round(SP * 1.45);
      c.width = w * 2; c.height = h * 2;
      g.scale(2, 2); g.font = font; g.textBaseline = "middle";
      if (bg) { g.fillStyle = bg; g.beginPath(); g.roundRect(0, 5, w, h - 10, 9); g.fill(); }
      g.fillStyle = color; g.fillText(text, padX, h / 2 + 1);
      return { c, w, h };
    };
    const r = rng(7);
    const items = [];
    GROUPS.forEach(([head, facts]) => {
      items.push({ kind: "head", text: head, page: sprite(head, `600 ${SP}px Geist`, "#121418", null, 0) });
      facts.forEach((f) => items.push({
        kind: "fact", text: f,
        cloud: sprite(f, `400 ${SP}px Geist`, r() < 0.3 ? "#9ad9ff" : "#eef2f7", null, 6),
        page: sprite(f, `500 ${SP}px Geist`, "#0d3350", "rgba(76,195,255,0.18)", 12),
      }));
    });
    MESS.forEach((m) => {
      const spr = sprite(m, `italic ${SP + 4}px "Instrument Serif"`, "#ffb4a3", null, 6);
      items.push({ kind: "mess", text: m, cloud: spr }, { kind: "mess", text: m, cloud: spr });
    });
    items.forEach((it) => {
      it.x = (r() * 2 - 1) * 1250; it.y = (r() * 2 - 1) * 700; it.z = r() * 1700 - 500;
      it.rot = (r() - 0.5) * 0.5; it.delay = r() * 0.3; it.arc = (r() - 0.5) * 240; it.spin = (r() - 0.5) * 0.6;
    });
    const dust = Array.from({ length: 720 }, () => ({ x: (r() * 2 - 1) * 1800, y: (r() * 2 - 1) * 1100, z: r() * 2800 - 400, s: 0.5 + r() * 1.4, tw: r() * 6 }));

    let W = 0, H = 0, dpr = 1, page = null;
    const layout = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      const mobile = W < 760;
      let pw = mobile ? Math.min(W * 0.84, 420) : Math.min(W * 0.34, 520);
      let ph = pw * 1.36;
      const maxH = mobile ? H * 0.58 : H * 0.8;
      if (ph > maxH) { ph = maxH; pw = ph / 1.36; }
      const cx = mobile ? W / 2 : W * 0.67, cy = mobile ? H * 0.64 : H * 0.5;
      page = { x: cx - pw / 2, y: cy - ph / 2, w: pw, h: ph, cx, cy };
      // Pack headings and fact chips onto the page, shrinking until they fit.
      const pad = pw * 0.08, top = page.y + pw * 0.2;
      for (let fs = pw / 34; fs > 4; fs *= 0.93) {
        const k = fs / SP, rowH = fs * 2.05, gap = fs * 0.5;
        let x = page.x + pad, y = top, ok = true;
        for (const it of items) {
          if (it.kind === "mess") continue;
          const w = it.page.w * k;
          if (it.kind === "head") { if (x > page.x + pad) y += rowH; x = page.x + pad; y += it === items[0] ? 0 : fs * 0.5; }
          else if (x + w > page.x + pw - pad) { x = page.x + pad; y += rowH; }
          it.sx = x + w / 2; it.sy = y + rowH / 2; it.sk = k;
          x += w + gap;
          if (it.kind === "head") { x = page.x + pad; y += rowH * 0.9; }
          if (y + rowH > page.y + ph - pad * 1.6) { ok = false; break; }
        }
        if (ok) { page.fs = fs; break; }
      }
    };
    layout();
    addEventListener("resize", layout);

    let p = 0, running = false, t0 = performance.now();
    const project = (x, y, z, yaw, pitch) => {
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      const x1 = x * cy - z * sy, z1 = x * sy + z * cy;
      const y1 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
      return [x1, y1, z2];
    };
    const draw = (spr, x, y, k, rot, a) => {
      if (a <= 0.003) return;
      ctx.globalAlpha = Math.min(1, a);
      ctx.setTransform(dpr * k * Math.cos(rot), dpr * k * Math.sin(rot), -dpr * k * Math.sin(rot), dpr * k * Math.cos(rot), dpr * x, dpr * y);
      ctx.drawImage(spr.c, -spr.w / 2, -spr.h / 2, spr.w, spr.h);
    };

    function frame(now) {
      if (!running) return;
      requestAnimationFrame(frame);
      const t = (now - t0) / 1000;
      const target = progressOf(section);
      p += (target - p) * 0.12;
      if (Math.abs(target - p) < 0.0005) p = target;
      mouse.sx += (mouse.x - mouse.sx) * 0.04;
      mouse.sy += (mouse.y - mouse.sy) * 0.04;
      const intro = reduce ? 1 : easeOut(clamp((now - t0) / 2600));
      const yaw = (reduce ? 0 : t * 0.045) + mouse.sx * 0.32, pitch = mouse.sy * 0.2;
      const paper = ease(clamp((p - 0.34) / 0.24));
      const cx = W / 2 + (page.cx - W / 2) * Math.min(1, p * 3), cy = H / 2 + (page.cy - H / 2) * Math.min(1, p * 3);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, W, H);

      // Light behind everything, brighter as the page forms.
      const g = ctx.createRadialGradient(page.cx, page.cy, 0, page.cx, page.cy, Math.max(W, H) * 0.6);
      g.addColorStop(0, `rgba(40,110,170,${0.18 + 0.32 * paper})`);
      g.addColorStop(0.45, `rgba(20,50,90,${0.08 + 0.12 * paper})`);
      g.addColorStop(1, "rgba(5,6,7,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // Dust
      for (const d of dust) {
        const [x, y, z] = project(d.x, d.y, d.z, yaw * 0.6, pitch * 0.6);
        const depth = z + 1100 + (1 - intro) * 2600 - p * 1100;
        if (depth < 40) continue;
        const s = 900 / depth;
        const a = clamp(1.1 - depth / 3400) * (0.35 + 0.35 * Math.sin(t * 1.3 + d.tw)) * intro * (1 - 0.5 * paper);
        if (a < 0.02) continue;
        ctx.globalAlpha = a;
        ctx.fillStyle = "#cfe6ff";
        ctx.fillRect(W / 2 + x * s, H / 2 + y * s, d.s * s, d.s * s);
      }

      // Cloud positions, far to near.
      const list = [];
      for (const it of items) {
        if (it.kind === "head") continue;
        const [x, y, z] = project(it.x, it.y, it.z, yaw, pitch);
        let depth = z + 1150 + (1 - intro) * 2600;
        if (it.kind === "mess") {
          const m = clamp((p - 0.03 - it.delay * 0.4) / 0.32);
          depth -= m * m * 2600;
          it.m = m;
        }
        it.depth = depth;
        it.X = x; it.Y = y;
        list.push(it);
      }
      list.sort((a, b) => b.depth - a.depth);

      // The page
      const wipe = page.y + page.h * paper;
      if (paper > 0.001) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.globalAlpha = 1;
        const pw = page.w, ph = page.h * paper, px = page.x, py = page.y;
        ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 80; ctx.shadowOffsetY = 30;
        ctx.fillStyle = "#f6f4ef";
        ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 6); ctx.fill();
        // The leading edge of the wipe glows.
        const eg = ctx.createLinearGradient(0, wipe - 40, 0, wipe);
        eg.addColorStop(0, "rgba(76,195,255,0)"); eg.addColorStop(1, `rgba(76,195,255,${0.55 * (1 - paper)})`);
        ctx.fillStyle = eg; ctx.fillRect(px, wipe - 40, pw, 40);
        ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
        ctx.fillStyle = "#7a808b";
        ctx.font = `400 ${page.w * 0.022}px Geist`;
        if (paper > 0.1) {
          ctx.fillText("PSMF-HAL-001", px + pw * 0.08, py + pw * 0.075);
          ctx.textAlign = "right"; ctx.fillText("Version 4.3", px + pw * 0.92, py + pw * 0.075); ctx.textAlign = "left";
        }
        ctx.fillStyle = "#121418";
        ctx.font = `italic ${page.w * 0.075}px "Instrument Serif"`;
        if (paper > 0.25) ctx.fillText("Pharmacovigilance System Master File", px + pw * 0.08, py + pw * 0.15, pw * 0.84);
      }

      for (const it of list) {
        const s = 900 / Math.max(it.depth, 1);
        const X = cx + it.X * s, Y = cy + it.Y * s;
        const fog = clamp(1.2 - it.depth / 3300, 0.06, 1) * intro;
        const rot = it.rot + (reduce ? 0 : Math.sin(t * 0.3 + it.spin * 9) * 0.05);
        if (it.kind === "mess") {
          if (it.depth < 60) continue;
          const a = fog * (1 - clamp((it.m - 0.55) / 0.45)) * (1 - clamp((240 - it.depth) / 180));
          draw(it.cloud, X, Y, s * 0.6, rot, a * 0.9);
          continue;
        }
        const e = ease(clamp((p - 0.1 - it.delay) / 0.42));
        if (it.depth < 60 && e === 0) continue;
        const x = lerp(X, it.sx, e), y = lerp(Y, it.sy, e) - Math.sin(Math.PI * e) * it.arc;
        const k = lerp(s * 0.6, it.sk, e), rr = lerp(rot, 0, e), a = lerp(fog, 1, e);
        const mix = clamp((e - 0.55) / 0.45) * (y < wipe ? 1 : 0);
        draw(it.cloud, x, y, k, rr, a * (1 - mix));
        draw(it.page, x, y, k, rr, a * mix);
      }

      // Headings settle onto the page last.
      const hA = clamp((p - 0.5) / 0.14) * paper;
      for (const it of items) if (it.kind === "head" && it.sy < wipe) draw(it.page, it.sx, it.sy, it.sk, 0, hA);

      // The seal, then a glint across the page.
      const sealP = clamp((p - 0.66) / 0.1);
      if (sealP > 0) {
        const sx = page.x + page.w * 0.8, sy = page.y + page.h * 0.86, R = page.w * 0.085 * backOut(sealP);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.globalAlpha = Math.min(1, sealP * 1.5);
        ctx.strokeStyle = "#0069a8"; ctx.lineWidth = page.w * 0.007;
        ctx.beginPath(); ctx.arc(sx, sy, R, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(sx, sy, R * 0.82, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = "#0069a8"; ctx.textAlign = "center";
        ctx.font = `600 ${page.w * 0.026}px Geist`; ctx.fillText("SIGNED", sx, sy - R * 0.05);
        ctx.font = `400 ${page.w * 0.019}px Geist`; ctx.fillText("8 Oct 2026", sx, sy + R * 0.32);
        ctx.textAlign = "left";
      }
      const glint = clamp((p - 0.74) / 0.16);
      if (glint > 0 && glint < 1) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.save();
        ctx.beginPath(); ctx.roundRect(page.x, page.y, page.w, page.h, 6); ctx.clip();
        const gx = page.x - page.w + glint * page.w * 3;
        const lg = ctx.createLinearGradient(gx - 120, 0, gx + 120, 0);
        lg.addColorStop(0, "rgba(255,255,255,0)"); lg.addColorStop(0.5, "rgba(255,255,255,0.55)"); lg.addColorStop(1, "rgba(255,255,255,0)");
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = "soft-light";
        ctx.fillStyle = lg; ctx.fillRect(page.x, page.y, page.w, page.h);
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      // Copy
      const out = clamp((p - 0.16) / 0.12);
      ha.style.opacity = 1 - out;
      ha.style.transform = `translateY(${-40 * out}px)`;
      ha.style.filter = `blur(${8 * out}px)`;
      const inP = clamp((p - 0.6) / 0.16);
      hb.style.opacity = inP > 0 ? 1 : 0;
      hbLines.forEach((l, i) => { l.style.transform = `translateY(${(1 - ease(clamp(inP * 1.3 - i * 0.3))) * 110}%)`; });
      cue.style.opacity = 1 - clamp(p / 0.05);
    }
    whileVisible(section, () => { if (!running) { running = true; requestAnimationFrame(frame); } }, () => { running = false; });
  }

  // ---------------------------------------------------------------------------
  // 2. Seven days: the request arrives; the days run out; the reply has gone.
  // ---------------------------------------------------------------------------
  function seven() {
    gsap.set("#mail", { x: 140, opacity: 0, rotate: 5 });
    gsap.set("#reply", { height: 0, opacity: 0 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: "#seven", start: "top top", end: "bottom bottom", scrub: 0.7 } });
    tl.to("#mail", { x: 0, opacity: 1, rotate: -1.5, duration: 1, ease: "power3.out" }, 0)
      .to("#odoCol", { yPercent: -87.5, duration: 4, ease: "power1.inOut" }, 0.8)
      .to("#odoCol", { filter: "blur(5px)", duration: 1.6, yoyo: true, repeat: 1, ease: "sine.inOut" }, 1.2)
      .to("#odoUnit", { "--strike": 1, duration: 0.5 }, 4.5)
      .to("#reply", { height: "auto", opacity: 1, duration: 1.2, ease: "power2.out" }, 4.3)
      .to("#sendBtn", { scale: 0.9, duration: 0.15, yoyo: true, repeat: 1 }, 5.7)
      .to("#sendBtn", { backgroundColor: "#0a7a4a", duration: 0.2 }, 5.9)
      .to("#sent", { opacity: 1, duration: 0.3 }, 6.0)
      .to(".odo", { opacity: 0, scale: 0.92, filter: "blur(14px)", duration: 0.8 }, 6.1)
      .fromTo("#sentBig", { opacity: 0, scale: 1.25, filter: "blur(24px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1, ease: "expo.out" }, 6.4)
      .to("#l1", { opacity: 0, y: -24, duration: 0.6 }, 6.2)
      .fromTo("#l2", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8 }, 6.6)
      .to({}, { duration: 1.6 });
  }

  // ---------------------------------------------------------------------------
  // 3. Orbit: the people who know, sending answers into the PSMF.
  // ---------------------------------------------------------------------------
  function orbit() {
    const root = $("#orbit"), core = $("#core"), ring = $(".core-ring");
    const PEOPLE = [
      ["LG", "Legal", "#ffd3a1"], ["QA", "Quality", "#b9f0d0"], ["HR", "HR", "#ffc2d1"], ["RA", "Regulatory affairs", "#c9d8ff"],
      ["IT", "IT", "#e3d1ff"], ["VN", "Your vendor", "#a8e6ff"], ["PV", "Pharmacovigilance", "#fff1a8"], ["CL", "Clinical", "#d6f5a3"],
    ];
    const MSGS = [["No change", true], ["+ Nordvia AB"], ["SOP-PV-003 v8.0"], ["New CV attached"], ["September figures"], ["No change", true],
      ["Audit closed"], ["SDEA-022 signed"], ["No change", true], ["Database 8.4"], ["CAPA closed"], ["No change", true], ["New product in Finland"]];
    const RINGS = [[280, 150, 0.11], [210, 112, -0.16], [140, 75, 0.24]];
    const people = PEOPLE.map(([ini, label, color], i) => {
      const el = document.createElement("div");
      el.className = "av";
      el.innerHTML = `<b style="background:${color}">${ini}</b>${label}`;
      root.appendChild(el);
      return { el, ring: i % 3, a: (i / PEOPLE.length) * Math.PI * 2 + i * 0.7, w: 0, h: 0 };
    });
    let running = false, last = performance.now(), nextMsg = 0, S = 1;
    const measure = () => { S = root.clientWidth / 600; people.forEach((p) => { p.w = p.el.offsetWidth; p.h = p.el.offsetHeight; }); };
    measure();
    addEventListener("resize", measure);
    const pos = (pp) => {
      const [rx, ry] = RINGS[pp.ring];
      return [300 * S + Math.cos(pp.a) * rx * S, 300 * S + Math.sin(pp.a) * ry * S, Math.sin(pp.a)];
    };
    function send(pp) {
      if (!gsapOk) return;
      const [x0, y0] = pos(pp);
      const [text, ok] = MSGS[(Math.random() * MSGS.length) | 0];
      const m = document.createElement("div");
      m.className = ok ? "msg ok" : "msg";
      m.textContent = text;
      root.appendChild(m);
      const mw = m.offsetWidth, mh = m.offsetHeight, cx = 300 * S, cy = 300 * S;
      const ctrl = [(x0 + cx) / 2, Math.min(y0, cy) - 90 * S];
      const o = { t: 0 };
      gsap.to(o, {
        t: 1, duration: 1.5, ease: "power2.inOut",
        onUpdate() {
          const t = o.t, u = 1 - t;
          const x = u * u * x0 + 2 * u * t * ctrl[0] + t * t * cx, y = u * u * y0 + 2 * u * t * ctrl[1] + t * t * cy;
          m.style.transform = `translate(${x - mw / 2}px, ${y - mh / 2 - 26}px) scale(${1 - 0.55 * t})`;
          m.style.opacity = t < 0.1 ? t * 10 : t > 0.85 ? (1 - t) / 0.15 : 1;
        },
        onComplete() {
          m.remove();
          gsap.fromTo(ring, { scale: 0.6, opacity: 0.9 }, { scale: 1.9, opacity: 0, duration: 1, ease: "power2.out" });
          gsap.fromTo(core, { scale: 1.08 }, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.4)" });
        },
      });
    }
    function frame(now) {
      if (!running) return;
      requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      people.forEach((pp) => {
        pp.a += RINGS[pp.ring][2] * dt;
        const [x, y, d] = pos(pp);
        const k = 0.78 + 0.27 * (d + 1) / 2;
        pp.el.style.transform = `translate(${x - pp.w / 2}px, ${y - pp.h / 2}px) scale(${k})`;
        pp.el.style.zIndex = d > 0 ? 70 : 20;
        pp.el.style.opacity = 0.45 + 0.55 * (d + 1) / 2;
      });
      if (now > nextMsg) { nextMsg = now + 850 + Math.random() * 700; send(people[(Math.random() * people.length) | 0]); }
    }
    if (reduce) { running = true; frame(performance.now()); running = false; return; }
    whileVisible(root, () => { if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); } }, () => { running = false; });
  }

  // ---------------------------------------------------------------------------
  // 4. Stamp: the changes, then the approval comes down hard.
  // ---------------------------------------------------------------------------
  function stamp() {
    const decode = (el, text, d = 1.1) => {
      const o = { p: 0 };
      gsap.to(o, {
        p: 1, duration: d, ease: "none",
        onUpdate() {
          const n = Math.floor(text.length * o.p);
          let s = text.slice(0, n);
          for (let i = n; i < Math.min(text.length, n + 6); i++) s += text[i] === " " ? " " : "0123456789abcdef"[(Math.random() * 16) | 0];
          el.textContent = s;
        },
      });
    };
    gsap.set(".changes li", { opacity: 0, y: 16 });
    ScrollTrigger.create({
      trigger: "#stamp", start: "top 30%", once: true,
      onEnter() {
        gsap.timeline()
          .to(".changes li", { opacity: 1, y: 0, stagger: 0.12, duration: 0.6, ease: "power2.out" })
          .fromTo("#stampMark", { opacity: 0, scale: 3, rotate: -34, filter: "blur(10px)" },
            { opacity: 0.94, scale: 1, rotate: -12, filter: "blur(0px)", duration: 0.26, ease: "power4.in" }, "+=0.45")
          .to("#sheet", { keyframes: { x: [0, -7, 6, -3, 2, 0], y: [0, 5, -3, 2, -1, 0], rotate: [1.2, 0.4, 1.8, 0.9, 1.3, 1.2] }, duration: 0.38, ease: "none" })
          .fromTo("#burst", { opacity: 0.8, scale: 1 }, { opacity: 0, scale: 44, duration: 1, ease: "power2.out" }, "<")
          .add(() => decode($("#hash"), "SHA-256 7f3a9c2e41d8b05f"), "<0.15");
      },
    });
  }

  // ---------------------------------------------------------------------------
  // 5. Tunnel: fly back through every signed version.
  // ---------------------------------------------------------------------------
  function tunnel() {
    const section = $("#tunnel"), world = $("#world"), readout = $("#readout");
    const V = [["4.3", "8 Oct 2026"], ["4.2", "2 Jun 2026"], ["4.1", "20 Nov 2025"], ["4.0", "12 Mar 2025"], ["3.3", "7 Oct 2024"],
      ["3.2", "14 May 2024"], ["3.1", "9 Jan 2024"], ["3.0", "21 Jun 2023"], ["2.2", "2 Feb 2023"], ["2.1", "5 Sep 2022"],
      ["2.0", "30 Mar 2022"], ["1.2", "11 Oct 2021"], ["1.1", "18 Feb 2021"], ["1.0", "4 Jun 2019"]];
    const r = rng(11), hex = () => Array.from({ length: 16 }, () => "0123456789abcdef"[(r() * 16) | 0]).join("");
    const SPACING = 620;
    const frames = V.map(([v, d], i) => {
      const el = document.createElement("div");
      el.className = "frame";
      el.innerHTML = `<div class="fv">${v}</div><div class="fd">Signed ${d}</div><i></i><i></i><i></i><i></i><i></i><i></i><i></i><div class="fs">SHA-256 ${hex()}</div>`;
      world.appendChild(el);
      const side = i % 2 ? 1 : -1;
      return { el, x: side > 0 ? 260 + (i % 3) * 40 : -170 - (i % 3) * 30, y: ((i * 7) % 3 - 1) * 70, ry: -side * 16, rz: side * 2 };
    });
    let shown = -1, p = 0, running = false;
    const setReadout = (i) => {
      if (i === shown) return;
      shown = i;
      const [v, d] = V[i];
      const next = i === 0 ? "in force from" : "in force from";
      readout.innerHTML = `<span class="v">${v}</span><span class="d">${next} ${d}</span>`;
      if (gsapOk) gsap.fromTo(readout.children, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power3.out" });
    };
    function frame() {
      if (!running) return;
      requestAnimationFrame(frame);
      const target = progressOf(section);
      p += (target - p) * 0.1;
      const cam = p * (V.length - 1) * SPACING;
      mouse.sx += (mouse.x - mouse.sx) * 0.04;
      world.style.transform = `rotateY(${mouse.sx * 4}deg) rotateX(${-mouse.sy * 3}deg)`;
      frames.forEach((f, i) => {
        const z = -i * SPACING + cam - 260;
        const fadeNear = 1 - clamp((z - 120) / 380);
        const fadeFar = clamp(1 + (z + 4200) / 1600);
        const o = clamp(fadeNear * fadeFar);
        f.el.style.opacity = o;
        f.el.style.visibility = o < 0.01 ? "hidden" : "visible";
        f.el.style.transform = `translate3d(${f.x}px, ${f.y}px, ${z}px) rotateY(${f.ry}deg) rotateZ(${f.rz}deg)`;
      });
      setReadout(Math.round(p * (V.length - 1)));
    }
    whileVisible(section, () => { if (!running) { running = true; requestAnimationFrame(frame); } }, () => { running = false; });
  }

  // ---------------------------------------------------------------------------
  // 6. Proof: giant lines sliding with the scroll, leaning into its speed.
  // ---------------------------------------------------------------------------
  function proof() {
    const rows = $$(".proof .row");
    const dirs = [-1, 1, -1], from = [0, -38, -6];
    const skew = rows.map((row) => gsap.quickTo(row, "skewX", { duration: 0.5, ease: "power3" }));
    ScrollTrigger.create({
      trigger: "#proof", start: "top bottom", end: "bottom top",
      onUpdate(self) {
        rows.forEach((row, i) => { row.style.translate = `${from[i] + dirs[i] * self.progress * 34}% 0`; });
        const v = clamp(self.getVelocity() / -260, -12, 12);
        skew.forEach((q, i) => q(v * (i === 1 ? -1 : 1)));
      },
    });
  }

  // ---------------------------------------------------------------------------
  // 7. Be ready.
  // ---------------------------------------------------------------------------
  function ready() {
    const word = $("#readyWord");
    const text = word.textContent;
    word.textContent = "";
    [...text].forEach((ch, i) => {
      const s = document.createElement("span");
      s.className = i >= 3 ? "ch serif" : "ch";
      s.textContent = ch === " " ? " " : ch;
      s.setAttribute("aria-hidden", "true");
      word.appendChild(s);
    });
    gsap.set(".ready-word .ch", { yPercent: 110, opacity: 0, rotateX: -70, filter: "blur(16px)" });
    ScrollTrigger.create({
      trigger: "#ready", start: "top 60%", once: true,
      onEnter: () => gsap.to(".ready-word .ch", { yPercent: 0, opacity: 1, rotateX: 0, filter: "blur(0px)", duration: 1.4, stagger: 0.06, ease: "expo.out" }),
    });
  }
})();

// Veria homepage.
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
    logbook();
    rules();
    proof();
    scanner();
    gate();
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
  // 1. Hero: the PSMF as a page in a shaft of light, in a dark room of drifting
  //    dust, with a real depth of field. Facts fly in from their sources, come
  //    into focus, turn dark as they cross onto the paper and become the page's
  //    own text. File debris drifts up to the page and turns to dust at its edge.
  // ---------------------------------------------------------------------------
  function hero() {
    const section = $("#hero"), back = $("#heroBack"), front = $("#heroFront");
    const paper = $("#heroPaper"), doc = $("#heroDoc"), status = $("#docStatus"), copy = $(".hero-copy");
    const bx = back.getContext("2d"), fx = front.getContext("2d");
    const shown = (el) => el.offsetParent !== null;
    const finish = () => {
      status.classList.add("done");
      status.querySelector("span").textContent = "Checked · ready to sign";
    };

    const SOURCES = { qppv: "HR", deputy: "HR", dist: "Legal", db: "Vendor", sop: "Vendor", figs: "PV team" };
    const DEBRIS = [
      "Annex_B_v3_FINAL (2).xlsx", "Re: Fwd: deputy QPPV?", "tracker_Q3.xlsx", "org_chart_old.pdf",
      "PSMF_4.2_signed_scan.pdf", "Who owns Annex D?", "PSMF_draft_AW_edits.docx", "Re: Re: figures?",
      "SOP list 2024.xlsx", "which version is current?", "copy of copy of Annex H.xlsx", "pls ignore previous email",
      "final-final-v3.docx", "Out of office until 3 Nov", "312 tracked changes", "where is the signed copy?",
      "Annex C (old).docx", "QPPV_CV_2019.pdf",
    ];

    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
    const pick = (a) => a[(Math.random() * a.length) | 0];

    // --- Sprites: text pre-rendered sharp and at four blur levels -------------
    const BLUR = [0, 1.5, 3.5, 7, 13];
    const measure = document.createElement("canvas").getContext("2d");
    function sprite(w, h, paint, color, sharpOnly) {
      const sharp = document.createElement("canvas");
      sharp.width = Math.ceil(w * 2); sharp.height = Math.ceil(h * 2);
      const g = sharp.getContext("2d");
      g.scale(2, 2);
      paint(g);
      const levels = [{ c: sharp, pad: 0 }];
      if (!sharpOnly) BLUR.slice(1).forEach((b) => {
        // Blur by casting the sprite's shadow from off-canvas: works in every browser.
        const res = b < 5 ? 1 : 0.5, pad = Math.ceil(b * 2.5);
        const c = document.createElement("canvas");
        c.width = Math.ceil((w + pad * 2) * res); c.height = Math.ceil((h + pad * 2) * res);
        const g2 = c.getContext("2d"), off = c.width + 40;
        g2.shadowColor = color; g2.shadowBlur = b * 2 * res; g2.shadowOffsetX = off;
        g2.drawImage(sharp, pad * res - off, pad * res, w * res, h * res);
        levels.push({ c, pad });
      });
      return { w, h, levels };
    }
    // Draws a sprite anchored at (ax, ay), blurred by B sprite px.
    function draw(g, s, ax, ay, x, y, k, rot, a, B) {
      if (a < 0.004 || k <= 0) return;
      const n = s.levels.length - 1;
      let i = 0;
      while (i < n && BLUR[i + 1] <= B) i++;
      const j = Math.min(i + 1, n), t = j === i ? 0 : clamp((B - BLUR[i]) / (BLUR[j] - BLUR[i]));
      if (B > BLUR[n]) a *= BLUR[n] / B;
      const c = Math.cos(rot) * k * dpr, sn = Math.sin(rot) * k * dpr;
      g.setTransform(c, sn, -sn, c, x * dpr, y * dpr);
      for (const [L, w] of j === i ? [[i, 1]] : [[i, 1 - t], [j, t]]) {
        if (w * a < 0.004) continue;
        const { c: img, pad } = s.levels[L];
        g.globalAlpha = Math.min(1, a * w);
        g.drawImage(img, -ax - pad, -ay - pad, s.w + pad * 2, s.h + pad * 2);
      }
    }

    const DF = 15;  // debris font size, sprite px
    const debris = DEBRIS.map((text) => {
      const font = `400 ${DF}px "Instrument Sans"`;
      measure.font = font;
      const w = Math.ceil(measure.measureText(text).width) + 4, h = Math.round(DF * 1.5);
      const spr = sprite(w, h, (g) => { g.font = font; g.fillStyle = "#aea596"; g.textBaseline = "middle"; g.fillText(text, 2, h / 2); }, "#aea596");
      return { spr, busy: false, pts: null };
    });
    // Points on a sprite's letters, for turning it into dust.
    function letterPoints(s, n) {
      const c = s.levels[0].c, { data, width, height } = c.getContext("2d").getImageData(0, 0, c.width, c.height);
      const pts = [];
      for (let y = 0; y < height; y += 2) for (let x = 0; x < width; x += 2) {
        if (data[(y * width + x) * 4 + 3] > 110) pts.push([x / 2 - s.w / 2, y / 2 - s.h / 2]);
      }
      for (let i = pts.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pts[i], pts[j]] = [pts[j], pts[i]]; }
      return pts.slice(0, n);
    }

    const VF = 24, LF = 11.5, LH = 21;  // fact value font, label font, label line (sprite px)
    const facts = $$(".row", doc).filter((r) => SOURCES[r.dataset.k]).map((row) => ({ row, v: $(".v", row), src: SOURCES[row.dataset.k], key: "" }));
    // A fact's value in the lines the page wraps it into, so it lands exactly on its text.
    function lettering(F) {
      const cs = getComputedStyle(F.v), size = parseFloat(cs.fontSize), lh = (parseFloat(cs.lineHeight) / size) * VF;
      measure.font = `400 ${size}px Newsreader`;
      const max = F.v.parentElement.clientWidth + 0.5, lines = [];
      let line = "";
      for (const word of F.v.textContent.split(" ")) {
        const next = line ? `${line} ${word}` : word;
        if (line && measure.measureText(next).width > max) { lines.push(line); line = word; } else line = next;
      }
      lines.push(line);
      if (lines.join("|") === F.key) return;
      F.key = lines.join("|");
      const vfont = `400 ${VF}px Newsreader`, lfont = `600 ${LF}px "Instrument Sans"`, label = F.src.toUpperCase();
      measure.font = vfont;
      const vw = Math.max(...lines.map((l) => measure.measureText(l).width));
      measure.font = lfont;
      const lw = measure.measureText(label).width + label.length * 1.6;
      const w = Math.ceil(Math.max(vw, lw)) + 6, h = Math.ceil(LH + lh * lines.length + 4);
      const paint = (withLabel, color) => (g) => {
        if (withLabel) {
          g.font = lfont; g.fillStyle = "#6cc9ff"; g.textBaseline = "top";
          if ("letterSpacing" in g) g.letterSpacing = "1.6px";
          g.fillText(label, 2, 2);
          if ("letterSpacing" in g) g.letterSpacing = "0px";
        }
        g.font = vfont; g.fillStyle = color; g.textBaseline = "middle";
        lines.forEach((l, i) => g.fillText(l, 2, LH + lh * (i + 0.5)));
      };
      F.lit = sprite(w, h, paint(true, "#f8f5ef"), "#e6ecf2");
      F.glow = sprite(w, h, paint(true, "#3fb4ff"), "#3fb4ff");
      F.ink = sprite(w, h, paint(false, "#15181d"), "#15181d", true);
      F.ax = 2; F.ay = LH + lh / 2;
    }

    // Soft discs for dust out of focus, lit and unlit.
    const disc = (r, g, b) => {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const x = c.getContext("2d"), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, `rgba(${r},${g},${b},1)`); gr.addColorStop(0.55, `rgba(${r},${g},${b},0.85)`);
      gr.addColorStop(0.8, `rgba(${r},${g},${b},0.35)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
      x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
      return c;
    };
    const DISC_W = disc(255, 230, 200), DISC_C = disc(150, 185, 220);

    // Smoke: a tileable cloud, seen only where the light is.
    const cloud = (() => {
      const n = 128, c = document.createElement("canvas");
      c.width = c.height = n;
      const g = c.getContext("2d"), img = g.createImageData(n, n);
      const octave = (cells) => {
        const v = Array.from({ length: cells * cells }, () => Math.random());
        return (x, y) => {
          const fx = (x / n) * cells, fy = (y / n) * cells, x0 = Math.floor(fx), y0 = Math.floor(fy);
          const tx = fx - x0, ty = fy - y0, sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
          const at = (i, j) => v[((j % cells) * cells) + (i % cells)];
          return lerp(lerp(at(x0, y0), at(x0 + 1, y0), sx), lerp(at(x0, y0 + 1), at(x0 + 1, y0 + 1), sx), sy);
        };
      };
      const o = [[octave(4), 0.55], [octave(8), 0.3], [octave(16), 0.15]];
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        const v = o.reduce((a, [fn, w]) => a + fn(x, y) * w, 0), i = (y * n + x) * 4;
        img.data[i] = 255; img.data[i + 1] = 228; img.data[i + 2] = 196; img.data[i + 3] = 255 * smooth(0.3, 0.8, v);
      }
      g.putImageData(img, 0, 0);
      return c;
    })();
    const smoke = document.createElement("canvas"), sm = smoke.getContext("2d");

    // --- Layout and the light --------------------------------------------------
    // World: x right, y down, z away from the camera. The page sits at z = f,
    // where one world unit is one screen pixel; the camera orbits around it.
    let W = 0, H = 0, dpr = 1, f = 1, VX = 0, VY = 0, small = false, fit = 1;
    let page = null, copyBox = null, S = null;
    const atmo = document.createElement("canvas"), shaft = document.createElement("canvas"), mask = document.createElement("canvas");
    const rel = (el) => {
      const s = section.getBoundingClientRect(), r = el.getBoundingClientRect();
      return { l: r.left - s.left, t: r.top - s.top, r: r.right - s.left, b: r.bottom - s.top, w: r.width, h: r.height };
    };
    // The shaft, in screen space at the page's depth: 0 to 1.
    function shaftAt(x, y) {
      const px = x - S.x0, py = y - S.y0;
      const t = (px * S.dx + py * S.dy) / S.len, d = px * S.dy - py * S.dx;
      const w = S.w0 + (S.w1 - S.w0) * t, e = (d * d) / (w * w);
      return Math.exp(-e * e) * smooth(-0.2, 0.5, t) * (1 - smooth(0.95, 1.55, t));
    }
    // Rays: brighter and darker streaks fanning out from the source.
    const raysAt = (x, y) => {
      const a = Math.atan2(x - S.x0, y - S.y0) * 40;
      const r = 0.45 * Math.sin(a * 0.71 + 1.1) + 0.3 * Math.sin(a * 1.93 + 4.2) + 0.25 * Math.sin(a * 4.37 + 2.6);
      return 0.72 + 0.28 * r * Math.abs(r);
    };
    const poolAt = (x, y) => {
      const dx = (x - page.cx) / (page.w * 0.95), dy = (y - page.cy) / (page.h * 0.8);
      return Math.exp(-(dx * dx + dy * dy));
    };
    const copyAt = (x, y, feather) => {
      const dx = Math.max(copyBox.l - x, 0, x - copyBox.r), dy = Math.max(copyBox.t - y, 0, y - copyBox.b);
      return 1 - smooth(0, feather, Math.hypot(dx, dy));
    };
    function bake() {
      const q = 0.25, w = Math.max(1, Math.ceil(W * q)), h = Math.max(1, Math.ceil(H * q)), R = Math.max(W, H);
      [atmo, shaft, mask, smoke].forEach((c) => { c.width = w; c.height = h; });
      const A = atmo.getContext("2d").createImageData(w, h), L = shaft.getContext("2d").createImageData(w, h), M = mask.getContext("2d").createImageData(w, h);
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const x = (i + 0.5) / q, y = (j + 0.5) / q, o = (j * w + i) * 4;
        const dx = (x - page.cx) / R, dy = (y - page.cy) / R, haze = Math.exp(-(dx * dx + dy * dy) * 6);
        const vx = x / W - 0.5, vy = y / H - 0.5, vig = 1 - Math.min(1, (vx * vx + vy * vy) * 1.5);
        const k = (0.5 + 0.5 * vig) * (1 - 0.45 * copyAt(x, y, 160));
        A.data[o] = (3 + 9 * haze) * k; A.data[o + 1] = (5 + 17 * haze) * k; A.data[o + 2] = (8 + 30 * haze) * k; A.data[o + 3] = 255;
        const s = 0.2 * shaftAt(x, y) * raysAt(x, y) + 0.07 * poolAt(x, y);
        L.data[o] = 255; L.data[o + 1] = 228; L.data[o + 2] = 196; L.data[o + 3] = Math.min(255, s * 255);
        M.data[o + 3] = 200 * copyAt(x, y, 70);
      }
      atmo.getContext("2d").putImageData(A, 0, 0);
      shaft.getContext("2d").putImageData(L, 0, 0);
      mask.getContext("2d").putImageData(M, 0, 0);
    }
    // The page turns with the camera and floats a little; on short screens it's
    // a little smaller, so the room around it stays.
    const pose = () => {
      paper.style.transform = `scale(${fit}) rotateY(${((small ? -3 : -7) + cam.x * 0.09).toFixed(2)}deg) rotateX(${(2.5 - cam.y * 0.08).toFixed(2)}deg) translate3d(0, ${(Math.sin(T * 0.42) * 4).toFixed(2)}px, 0)`;
      paper.style.setProperty("--sheen", `${(cam.x * 0.5).toFixed(1)}%`);
    };
    function layout() {
      W = section.clientWidth; H = section.clientHeight;
      dpr = Math.min(devicePixelRatio || 1, 2);
      small = W < 640;
      fit = small ? 1 : clamp((innerHeight - 190) / 620, 0.8, 1);
      pose();
      [back, front].forEach((c) => { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
      page = rel(doc);
      page.cx = (page.l + page.r) / 2; page.cy = (page.t + page.b) / 2;
      copyBox = rel(copy);
      VX = page.cx; VY = page.cy;
      f = Math.max(W, H) * 0.95;
      // The light falls from above, a little from the right.
      const x0 = small ? W * 1.05 : page.cx + W * 0.14, y0 = small ? page.t - H * 0.55 : -H * 0.45;
      const tx = page.cx, ty = page.t + page.h * 0.3, len = Math.hypot(tx - x0, ty - y0);
      S = { x0, y0, dx: (tx - x0) / len, dy: (ty - y0) / len, len, w0: page.w * 0.14, w1: page.w * 0.62 };
      bake();
    }

    // --- Dust ------------------------------------------------------------------
    const ZN = 0.16, ZF = 5.5;
    let dust = [];
    function seed(m, far) {
      const near = !far && Math.random() < 0.3;
      m.z = (far ? lerp(0.8, 1, Math.random()) * ZF : near ? lerp(0.6, 1.7, Math.random()) : ZN + (ZF - ZN) * Math.pow(Math.random(), 0.8)) * f;
      // A good share of it starts in the light, where it shows.
      const inLight = Math.random() < 0.4;
      for (let i = 0; i < 30; i++) {
        m.x = (lerp(-0.1, 1.1, Math.random()) * W - VX) * m.z / f;
        m.y = (lerp(-0.1, 1.1, Math.random()) * H - VY) * m.z / f;
        if (!inLight || shaftAt(VX + m.x, VY + m.y) > 0.35) break;
      }
      m.vx = rand(-3, 3); m.vy = rand(-3, 2); m.vz = rand(-6, 4);
      m.s = rand(0.6, 1.7); m.w = rand(0.4, 1.4); m.ph = rand(0, 6.3);
      m.age = far ? 0 : 1;
    }
    const lightAt = (x, y, z) => {
      const dz = (z - f) / (f * 0.45);
      return Math.min(1, shaftAt(VX + x, VY + y) * raysAt(VX + x, VY + y) * 1.2 + 0.5 * poolAt(VX + x, VY + y) * Math.exp(-dz * dz));
    };

    // --- Debris: drifts up to the page's edge and turns to dust, or drifts past --
    const flights = [], motes = [];
    // Debris starts far off, clear of the headline.
    const startPoint = () => (small ? [rand(-0.15, 1.15) * W, rand(copyBox.b, H + 80)] : [rand(copyBox.r + 60, W + 120), rand(-0.1, 1.1) * H]);
    function edgePoint(s) {
      const m = rand(12, 150), gap = page.l - copyBox.r;
      const room = page.t - s.h - 110;  // above the page, below the nav
      const sides = small ? ["l", "r", "b"] : ["r", "r", "b", "b"].concat(room > 20 ? ["t", "t"] : [], gap > s.w + 60 ? ["l"] : []);
      const side = pick(sides);
      if (side === "r") return [page.r + m + s.w / 2, rand(page.t + 20, page.b - 20)];
      if (side === "l") return [page.l - Math.min(m, gap - s.w - 40) - s.w / 2, rand(page.t + 20, page.b - 20)];
      const x = rand(page.l + s.w * 0.3, page.r - s.w * 0.3);
      return side === "t" ? [x, page.t - Math.min(m, room) - s.h / 2] : [x, page.b + m + s.h / 2];
    }
    function passPoint() {
      const r = Math.random();
      if (small) return r < 0.5 ? [rand(-0.6, 1.6) * W, H + rand(150, 400)] : [r < 0.75 ? -rand(200, 500) : W + rand(200, 500), rand(0.4, 1.3) * H];
      if (r < 0.5) return [W + rand(150, 500), rand(-0.3, 1.3) * H];
      return [rand(0.62, 1.2) * W, r < 0.75 ? -rand(150, 400) : H + rand(150, 400)];
    }
    const toWorld = ([x, y], z) => [(x - VX) * z / f, (y - VY) * z / f];
    const turning = () => flights.filter((fl) => fl.turn).length;
    function launch(d, p0 = 0, turn = turning() < (small ? 2 : 4) && Math.random() < 0.6) {
      const z0 = rand(3.2, 5.6) * f, z1 = turn ? rand(0.92, 1.4) * f : rand(0.24, 0.4) * f;
      const [x0, y0] = toWorld(startPoint(), z0), [x1, y1] = toWorld(turn ? edgePoint(d.spr) : passPoint(), z1);
      const fl = { d, turn, x0, y0, z0, x1, y1, z1, dur: turn ? rand(9, 13) : rand(12, 17), ph: rand(0, 6.3), r0: rand(-0.14, 0.14), r1: rand(-0.04, 0.04), state: "fly" };
      fl.t = p0 * fl.dur;
      d.busy = true;
      moveFlight(fl);
      flights.push(fl);
    }
    function moveFlight(fl) {
      const p = clamp(fl.t / fl.dur), u = fl.turn ? easeOut(p) : p;
      const settle = fl.turn ? 1 - smooth(0.75, 1, p) : 1;
      fl.z = lerp(fl.z0, fl.z1, u);
      fl.x = lerp(fl.x0, fl.x1, u) + Math.sin(T * 0.5 + fl.ph) * 10 * (fl.z / f) * settle;
      fl.y = lerp(fl.y0, fl.y1, u) + Math.cos(T * 0.37 + fl.ph) * 7 * (fl.z / f) * settle;
      fl.rot = lerp(fl.r0, fl.r1, u) + Math.sin(T * 0.3 + fl.ph) * 0.03 * settle;
      const fog = clamp((ZF * f - fl.z) / (1.4 * f));
      fl.a = 0.72 * fog * smooth(0, 0.12, p) * (fl.turn ? 1 : clamp((fl.z - fl.z1) / (0.2 * f)));
    }
    // The letters break up from the side nearest the page and drift away as dust.
    function dissolve(fl) {
      const s = fl.d.spr;
      fl.d.pts = fl.d.pts || letterPoints(s, small ? 160 : 240);
      const k = f / fl.z, sx = VX + (fl.x - cam.x) * k + cam.x, sy = VY + (fl.y - cam.y) * k + cam.y;
      let ux = sx - page.cx, uy = sy - page.cy;
      const ul = Math.hypot(ux, uy) || 1;
      ux /= ul; uy /= ul;
      const c = Math.cos(fl.rot), sn = Math.sin(fl.rot);
      fl.dir = Math.atan2(uy, ux) - fl.rot;
      const proj = fl.d.pts.map(([u, v]) => u * Math.cos(fl.dir) + v * Math.sin(fl.dir));
      fl.pmin = Math.min(...proj); fl.pmax = Math.max(...proj);
      fl.d.pts.forEach(([u, v], i) => {
        const at = (proj[i] - fl.pmin) / (fl.pmax - fl.pmin || 1);
        motes.push({
          x: sx + (u * c - v * sn) * k, y: sy + (u * sn + v * c) * k,
          vx: ux * rand(6, 26) + rand(-5, 5), vy: uy * rand(6, 26) + rand(-14, -1),
          delay: at * 0.9 + rand(0, 0.12), age: 0, life: rand(1.8, 3.4), a: fl.a, s: rand(0.8, 1.5),
        });
      });
      fl.state = "dust";
      fl.st = 0;
    }

    // --- Facts: fly in from their source and become the page's text -------------
    const landing = [];
    // They come out of the dark above, below or beside the page, swing round
    // its right edge and slide onto their row.
    function fly(F) {
      lettering(F);
      const target = rel(F.v), x0 = Math.max(page.l + page.w * 0.3, copyBox.r + 60);
      const bands = small ? [[W * 0.2, W + 60, page.b + 20, H + 120]] : [
        [x0, W - 40, 70, page.t - 50], [x0, W - 40, page.b + 50, H - 30],
      ].concat(W - page.r > 200 ? [[page.r + 80, W - 40, page.t, page.b]] : []).filter((b) => b[1] > b[0] && b[3] > b[2]);
      const [l, r, t, b] = bands.length ? pick(bands) : [W * 0.6, W, 0, H * 0.2];
      const s0 = [rand(l, r), rand(t, b)];
      const z0 = rand(2.6, 3.6) * f;
      const P0 = [...toWorld(s0, z0), z0];
      const side = Math.min(page.r + 70 + rand(0, 50), W - 30);
      const out = s0[1] < page.cy ? -1 : 1;
      const s1 = [lerp(s0[0], side, 0.6) + 60, lerp(s0[1], target.t, 0.45) + out * 50];
      const P1 = [...toWorld(s1, 1.8 * f), 1.8 * f];
      landing.push({ F, P0, P1, side, t: 0, dur: small ? 2.2 : 2.6, hold: 0, done: false });
    }
    const bez = (a, b, c, d, t) => { const u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d; };

    // --- Time, camera and the loop ---------------------------------------------
    let T = 0, last = 0, running = false;
    const cam = { x: 0, y: 0 }, mouse = { x: 0, y: 0, sx: 0, sy: 0 };
    addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      mouse.x = (e.clientX / innerWidth) * 2 - 1; mouse.y = (e.clientY / innerHeight) * 2 - 1;
    }, { passive: true });
    const queue = [];
    const at = (t, fn) => queue.push({ t, fn });
    function refresh() {
      const list = facts.filter((F) => shown(F.row) && !landing.some((l) => l.F === F));
      if (list.length) fly(pick(list));
      at(T + rand(7, 11), refresh);
    }

    function step(dt) {
      mouse.sx += (mouse.x - mouse.sx) * Math.min(1, dt * 2);
      mouse.sy += (mouse.y - mouse.sy) * Math.min(1, dt * 2);
      cam.x = Math.sin(T * 0.06) * 16 + mouse.sx * 34;
      cam.y = Math.cos(T * 0.045) * 9 + mouse.sy * 18;
      pose();

      for (let i = queue.length - 1; i >= 0; i--) if (queue[i].t <= T) { const q = queue.splice(i, 1)[0]; q.fn(); }

      for (const m of dust) {
        m.x += (m.vx + Math.sin(m.y * 0.003 + T * 0.12 + m.ph) * 5) * dt;
        m.y += (m.vy - 4) * dt;
        m.z += (m.vz - 10) * dt;
        m.age = Math.min(1, m.age + dt * 0.4);
        const k = f / m.z, sx = VX + m.x * k, sy = VY + m.y * k;
        if (m.z < ZN * f || sx < -0.2 * W || sx > 1.2 * W || sy < -0.2 * H || sy > 1.2 * H) seed(m, true);
      }

      for (let i = flights.length - 1; i >= 0; i--) {
        const fl = flights[i];
        if (fl.state === "fly") {
          fl.t += dt;
          moveFlight(fl);
          if (fl.t >= fl.dur) { if (fl.turn) dissolve(fl); else { flights.splice(i, 1); fl.d.busy = false; } }
        } else {
          fl.st += dt;
          if (fl.st > 1.4) { flights.splice(i, 1); fl.d.busy = false; }
        }
      }
      const want = small ? 5 : 10;
      if (flights.length < want && Math.random() < dt * 1.2) {
        const idle = debris.filter((d) => !d.busy);
        if (idle.length) launch(pick(idle));
      }
      for (let i = motes.length - 1; i >= 0; i--) {
        const p = motes[i];
        if (p.delay > 0) { p.delay -= dt; continue; }
        p.age += dt;
        if (p.age > p.life) { motes.splice(i, 1); continue; }
        const damp = Math.exp(-dt * 0.7);
        p.vx *= damp; p.vy = p.vy * damp - 3 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
      }

      for (let i = landing.length - 1; i >= 0; i--) {
        const l = landing[i];
        if (!l.done) {
          l.t += dt;
          if (l.t >= l.dur) {
            l.done = true;
            l.F.row.classList.add("in", "lit");
            setTimeout(() => l.F.row.classList.remove("lit"), 900);
          }
        } else if ((l.hold += dt) > 0.5) landing.splice(i, 1);
      }
    }

    function render() {
      const Wd = back.width, Hd = back.height;
      const intro = smooth(0, 3, T), zoff = f * 1.3 * (1 - easeOut(clamp(T / 5)));
      bx.setTransform(1, 0, 0, 1, 0, 0);
      bx.globalAlpha = 1; bx.globalCompositeOperation = "source-over";
      bx.drawImage(atmo, 0, 0, Wd, Hd);
      bx.globalCompositeOperation = "lighter";
      bx.globalAlpha = intro * (0.72 + 0.12 * Math.sin(T * 0.31));
      bx.drawImage(shaft, 0, 0, Wd, Hd);
      // Smoke drifting through the light: two layers of cloud, multiplied, masked by the shaft
      const pat = sm.createPattern(cloud, "repeat");
      sm.globalCompositeOperation = "copy";
      sm.setTransform(1.3, 0, 0, 1.3, -T * 2.2, T * 1.1);
      sm.fillStyle = pat; sm.fillRect(T * 2.2 / 1.3 - 10, -T * 1.1 / 1.3 - 10, smoke.width / 1.3 + 20, smoke.height / 1.3 + 20);
      sm.globalCompositeOperation = "destination-in";
      sm.setTransform(0.8, 0, 0, 0.8, T * 1.6 + 40, -T * 0.9);
      sm.fillRect(-T * 1.6 / 0.8 - 60, T * 0.9 / 0.8 - 10, smoke.width / 0.8 + 80, smoke.height / 0.8 + 20);
      sm.setTransform(1, 0, 0, 1, 0, 0);
      sm.drawImage(shaft, 0, 0);
      bx.globalAlpha = intro;
      bx.drawImage(smoke, 0, 0, Wd, Hd);
      bx.globalCompositeOperation = "source-over";
      fx.setTransform(1, 0, 0, 1, 0, 0);
      fx.clearRect(0, 0, Wd, Hd);

      // Dust, lit where it crosses the light
      for (const m of dust) {
        const z = m.z + zoff, k = f / z;
        const sx = VX + (m.x - cam.x) * k + cam.x, sy = VY + (m.y - cam.y) * k + cam.y;
        if (sx < -40 || sx > W + 40 || sy < -40 || sy > H + 40) continue;
        const L = lightAt(m.x, m.y, m.z);
        let a = intro * m.age * clamp((ZF * f - z) / (1.6 * f)) * (0.09 + 0.91 * L) * (0.6 + 0.4 * Math.sin(T * m.w + m.ph));
        if (a < 0.01) continue;
        const g = z < f ? fx : bx, size = m.s * k * (1 + 0.8 * L), blur = 4 * Math.abs(z - f) / z, r = Math.max(size, blur);
        if (r < 1.2) {
          const px = Math.max(size, 0.8);
          g.globalAlpha = Math.min(1, a * Math.min(1, size / 0.8 + 0.25));
          g.fillStyle = L > 0.3 ? "#ffe9cf" : "#a8c3dc";
          g.fillRect(sx * dpr, sy * dpr, px * dpr, px * dpr);
        } else {
          g.globalAlpha = Math.min(1, a * Math.min(1, 1.7 / r));
          g.drawImage(L > 0.3 ? DISC_W : DISC_C, (sx - r) * dpr, (sy - r) * dpr, r * 2 * dpr, r * 2 * dpr);
        }
      }

      // Debris, far to near
      flights.sort((a, b) => b.z - a.z);
      for (const fl of flights) {
        const s = fl.d.spr, k = f / fl.z;
        const sx = VX + (fl.x - cam.x) * k + cam.x, sy = VY + (fl.y - cam.y) * k + cam.y;
        const B = (10 * Math.abs(fl.z - f) / fl.z) / k;
        const g = fl.state === "fly" && fl.z < f * 0.995 ? fx : bx;
        if (fl.state === "fly") { draw(g, s, s.w / 2, s.h / 2, sx, sy, k, fl.rot, fl.a, B); continue; }
        // What's left of the word, behind the edge that's turning to dust
        const thr = lerp(fl.pmin, fl.pmax, clamp(fl.st / 0.95));
        bx.save();
        const c = Math.cos(fl.rot) * k * dpr, sn = Math.sin(fl.rot) * k * dpr;
        bx.setTransform(c, sn, -sn, c, sx * dpr, sy * dpr);
        bx.rotate(fl.dir);
        bx.beginPath(); bx.rect(thr, -s.w * 2, s.w * 4, s.w * 4); bx.clip();
        bx.rotate(-fl.dir);
        draw(bx, s, s.w / 2, s.h / 2, sx, sy, k, fl.rot, fl.a * (1 - smooth(0.6, 1.1, fl.st)), 0);
        bx.restore();
      }
      bx.setTransform(1, 0, 0, 1, 0, 0);
      bx.fillStyle = "#d9d0c2";
      for (const p of motes) {
        if (p.delay > 0) continue;
        const life = p.age / p.life;
        bx.globalAlpha = p.a * 0.9 * (1 - life * life) * smooth(0, 0.08, p.age);
        bx.fillRect(p.x * dpr, p.y * dpr, p.s * dpr, p.s * dpr);
      }

      // Nothing passes in front of the paper: dust there reads as holes in its text
      const pg = rel(doc);
      fx.setTransform(1, 0, 0, 1, 0, 0);
      fx.clearRect(pg.l * dpr, pg.t * dpr, pg.w * dpr, pg.h * dpr);

      // Facts: light over the dark, ink once they're on the paper
      for (const l of landing) {
        const F = l.F, sr = section.getBoundingClientRect(), tg = F.v.getClientRects()[0];
        const tx = tg.left - sr.left, ty = tg.top - sr.top + tg.height / 2;
        const P3 = [tx - VX, ty - VY, f], P2 = [l.side - VX, ty - VY + 6, 0.92 * f];
        const p = l.done ? 1 : easeIO(clamp(l.t / l.dur));
        const x = bez(l.P0[0], l.P1[0], P2[0], P3[0], p), y = bez(l.P0[1], l.P1[1], P2[1], P3[1], p), z = bez(l.P0[2], l.P1[2], P2[2], P3[2], p);
        const kz = f / z, rowScale = (parseFloat(getComputedStyle(F.v).fontSize) * fit) / VF;
        const k = kz * lerp(1, rowScale, smooth(0.55, 1, p));
        const sx = VX + (x - cam.x) * kz + cam.x, sy = VY + (y - cam.y) * kz + cam.y;
        const B = (10 * Math.abs(z - f) / z) / k, rot = (1 - p) * 0.06;
        const a = smooth(0, 0.15, p) * (l.done ? 1 - l.hold / 0.5 : 1);
        fx.save();
        fx.setTransform(1, 0, 0, 1, 0, 0);
        fx.beginPath(); fx.rect(0, 0, front.width, front.height); fx.rect(pg.l * dpr, pg.t * dpr, pg.w * dpr, pg.h * dpr);
        fx.clip("evenodd");
        fx.globalCompositeOperation = "lighter";
        draw(fx, F.glow, F.ax, F.ay, sx, sy, k, rot, a * 0.5, Math.max(B, 7));
        fx.globalCompositeOperation = "source-over";
        draw(fx, F.lit, F.ax, F.ay, sx, sy, k, rot, a, B);
        fx.restore();
        fx.save();
        fx.setTransform(1, 0, 0, 1, 0, 0);
        fx.beginPath(); fx.rect(pg.l * dpr, pg.t * dpr, pg.w * dpr, pg.h * dpr); fx.clip();
        draw(fx, F.ink, F.ax, F.ay, sx, sy, k, rot, a, 0);
        fx.restore();
      }

      // Keep the headline clear of anything passing in front of it
      fx.setTransform(1, 0, 0, 1, 0, 0);
      fx.globalAlpha = 1;
      fx.globalCompositeOperation = "destination-out";
      fx.drawImage(mask, 0, 0, Wd, Hd);
      fx.globalCompositeOperation = "source-over";
    }

    function frame(now) {
      if (!running) return;
      requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      T += dt;
      step(dt);
      render();
    }

    layout();
    dust = Array.from({ length: small ? 700 : 1500 }, () => { const m = {}; seed(m, false); return m; });
    let resizeTimer = 0;
    addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { layout(); if (!running) render(); }, 150); });

    // Debris already in the air when the page opens; one is about to reach the page.
    const first = debris.slice().sort(() => Math.random() - 0.5);
    first.slice(0, small ? 5 : 10).forEach((d, i) => launch(d, i === 0 ? 0.82 : rand(0, 0.8), i === 0 ? true : undefined));

    if (reduce) {
      $$(".row", doc).forEach((r) => r.classList.add("in"));
      finish();
      T = 10;
      render();
      return;
    }

    const list = facts.filter((F) => shown(F.row));
    list.forEach((F, i) => at(1.2 + i * 0.55, () => fly(F)));
    const end = 1.2 + (list.length - 1) * 0.55 + (small ? 2.2 : 2.6);
    at(end + 0.35, () => {
      const log = $('.row[data-k="log"]', doc);
      if (shown(log)) { log.classList.add("in", "lit"); setTimeout(() => log.classList.remove("lit"), 900); }
    });
    at(end + 0.9, finish);
    at(end + 7, refresh);

    whileVisible(section, () => { running = true; last = performance.now(); requestAnimationFrame(frame); }, () => { running = false; });
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
  // 4. Sources: five kinds of source, one draft. Each fact travels its spoke,
  //    is checked where it meets the draft, and fills its row.
  // ---------------------------------------------------------------------------
  function sources() {
    const hub = $("#hub"), svg = $("#hubLines"), srcs = $$(".hs", hub), doc = $(".hub-doc", hub), rows = $$(".hd-row", doc);
    let spokes = [], tw = [];
    function build() {
      svg.innerHTML = "";
      const H = hub.getBoundingClientRect(), D = doc.getBoundingClientRect();
      svg.setAttribute("viewBox", `0 0 ${H.width} ${H.height}`);
      const lines = svgEl("g", {}, svg);
      spokes = srcs.map((s) => {
        const i = +s.dataset.row, I = $(".ic", s).getBoundingClientRect(), R = $("dd", rows[i]).getBoundingClientRect();
        let x0, y0, x1, y1, d;
        if (I.bottom <= D.top) {
          // On a phone the sources sit in a row above the draft.
          x0 = I.left + I.width / 2 - H.left; y0 = I.bottom - H.top + 6;
          x1 = clamp(x0, D.left - H.left + 14, D.right - H.left - 14); y1 = D.top - H.top;
          const my = (y0 + y1) / 2;
          d = `M${x0} ${y0}C${x0} ${my} ${x1} ${my} ${x1} ${y1}`;
        } else {
          const left = I.right <= D.left;
          x0 = left ? I.right - H.left + 6 : I.left - H.left - 6; y0 = I.top + I.height / 2 - H.top;
          x1 = left ? D.left - H.left : D.right - H.left; y1 = R.top + R.height / 2 - H.top;
          const mx = (x0 + x1) / 2;
          d = `M${x0} ${y0}C${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`;
        }
        const path = svgEl("path", { d, class: "sp" }, lines);
        const gd = svgEl("circle", { cx: x1, cy: y1, r: 4.5, class: "gd" }, svg);
        return { s, i, path, gd };
      });
    }
    build();
    const steps = [];
    srcs.forEach((_, k) => {
      const t = 0.3 + k * 0.75;
      steps.push([t, () => {
        const sp = spokes[k];
        sp.s.classList.add("on");
        sp.path.classList.add("on");
        if (reduce) return;
        const len = sp.path.getTotalLength(), p0 = sp.path.getPointAtLength(0);
        const c = svgEl("circle", { r: 4, class: "pulse", cx: p0.x, cy: p0.y }, svg);
        const st = { t: 0 };
        tw.push(gsap.to(st, { t: 1, duration: 0.8, ease: "power1.inOut",
          onUpdate: () => { const pt = sp.path.getPointAtLength(st.t * len); c.setAttribute("cx", pt.x); c.setAttribute("cy", pt.y); },
          onComplete: () => c.remove() }));
      }]);
      steps.push([t + 0.85, () => { spokes[k].gd.classList.add("ok"); rows[spokes[k].i].classList.add("in", "lit"); }]);
      steps.push([t + 1.7, () => { const sp = spokes[k]; rows[sp.i].classList.remove("lit"); sp.s.classList.remove("on"); sp.path.classList.remove("on"); }]);
    });
    sequence(hub, steps, () => {
      tw.forEach((t) => t.kill());
      tw = [];
      $$(".pulse", svg).forEach((c) => c.remove());
      spokes.forEach((sp) => { sp.gd.classList.remove("ok"); sp.path.classList.remove("on"); sp.s.classList.remove("on"); });
      rows.forEach((r) => r.classList.remove("in", "lit"));
    }, 0.3);
    let rw = hub.clientWidth;
    addEventListener("resize", () => { if (hub.clientWidth !== rw) { rw = hub.clientWidth; build(); } });
  }

  // ---------------------------------------------------------------------------
  // 7. Change it once: owners → the parts of the PSMF their answers appear in
  //    (from Veria's template: about 90 questions, each with one owner), and
  //    the pages whose wording it rewrites.
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
    // Each example: who answers, and every place the fact lands.
    const EXAMPLES = [
      { o: 6, ans: "VP-SOP-029 replaces 031", short: "VP-SOP-029", to: [12, 5] },
      { o: 3, ans: "+1 product", to: [15, 0, 2] },
      { o: 1, ans: "QPPV office: Copenhagen", short: "Copenhagen", to: [1, 2] },
    ];
    // The pages whose wording gets rewritten; a line lights up on each.
    const pages = $$("#ewPages .ewp");
    const setPages = (ps) => pages.forEach((pg, k) => {
      pg.classList.remove("on", "lit");
      pg.classList.toggle("off", k >= ps.length);
      if (k >= ps.length) return;
      pg.dataset.p = ps[k];
      $("span", pg).textContent = ps[k] === LOG ? "Logbook" : PLACES[ps[k]];
      pg.classList.add("on");
    });
    const litPage = (p) => pages.forEach((pg) => { if (+pg.dataset.p === p) pg.classList.add("lit"); });

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
      setPages(e.to.concat(LOG));
      if (reduce) { ag.setAttribute("opacity", 1); logPath.setAttribute("opacity", 1); e.to.concat(LOG).forEach((p) => { lightPlace(p); litPage(p); }); return; }
      T(gsap.to(ag, { attr: { opacity: 1 }, duration: 0.5, delay: 0.3 }));
      paths.forEach((l, i) => {
        const p0 = l.el.getPointAtLength(0);
        const c = svgEl("circle", { r: 4, class: "pulse", cx: p0.x, cy: p0.y }, g.pulses);
        const len = l.el.getTotalLength();
        const st = { t: 0 };
        T(gsap.to(st, { t: 1, duration: 1.3, delay: 0.25 + i * 0.12, ease: "power1.inOut",
          onUpdate: () => { const pt = l.el.getPointAtLength(st.t * len); c.setAttribute("cx", pt.x); c.setAttribute("cy", pt.y); },
          onComplete: () => { lightPlace(l.p); litPage(l.p); T(gsap.to(c, { attr: { r: 0 }, duration: 0.3 })); } }));
      });
      T(gsap.to(logPath, { attr: { opacity: 1 }, duration: 0.5, delay: 1.5, onComplete: () => { lightPlace(LOG); litPage(LOG); } }));
    }
    function pin(o) {
      pinned = o;
      clearTimeout(timer);
      clear();
      lightOwner(o);
      const ps = Object.keys(OWNERS[o][2]).map(Number);
      L.lines.filter((l) => l.o === o).forEach((l) => l.el.classList.add("hi"));
      ps.forEach(lightPlace);
      pages.forEach((pg) => pg.classList.remove("on", "lit"));
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
    setPages(EXAMPLES[0].to.concat(LOG));
    let rw = root.clientWidth;
    addEventListener("resize", () => { if (root.clientWidth !== rw) { rw = root.clientWidth; build(); if (running) { clearTimeout(timer); cycle(); } } });
    whileVisible(root, () => { running = true; cycle(); }, () => { running = false; clearTimeout(timer); killAll(); });
  }

  // ---------------------------------------------------------------------------
  // 8. A sentence goes into the PSMF. The glossary gains SDEA in its place, the
  //    logbook writes its own entry, and the one token Veria isn't sure about
  //    ("AB") is asked about instead of guessed.
  // ---------------------------------------------------------------------------
  function logbook() {
    const c = $("#cmp");
    const steps = [[0.3, 1], [1.2, 2], [2.0, 3], [2.8, 4], [4.0, 5], [5.0, 6]].map(([t, n]) => [t, () => c.classList.add(`s${n}`)]);
    sequence(c, steps, () => c.classList.remove("s1", "s2", "s3", "s4", "s5", "s6"), 0.35);
  }

  // ---------------------------------------------------------------------------
  // 5. The regulator's finding, on its own screen.
  // ---------------------------------------------------------------------------
  function proof() {
    const b = $("#proof");
    sequence(b, [[0.2, () => b.classList.add("in")]], () => b.classList.remove("in"));
  }

  // ---------------------------------------------------------------------------
  // 6. The whole PSMF at a glance: a scan sweeps it, problems are pinned where
  //    they sit and resolved one by one; then signing unlocks.
  // ---------------------------------------------------------------------------
  function scanner() {
    const root = $("#scan"), spread = $(".spread", root), pages = $$(".pg", spread), beam = $(".beam", root), openN = $("#scanOpen");
    const bad = pages.filter((p) => p.classList.contains("bad"));
    const D = 2.2;
    let tw = [];
    const steps = [[0, () => {
      if (reduce) return;
      tw.push(gsap.fromTo(beam, { x: 0, opacity: 1 }, { x: spread.offsetWidth + 80, duration: D, ease: "none", onComplete: () => gsap.to(beam, { opacity: 0, duration: 0.2 }) }));
    }]];
    pages.forEach((p) => {
      const t = D * ((p.offsetLeft + p.offsetWidth / 2) / spread.offsetWidth);
      const isBad = bad.includes(p);
      steps.push([t, () => { p.classList.add("seen"); if (isBad) p.classList.add("found"); }]);
      steps.push([t + 0.45, () => p.classList.remove("seen")]);
    });
    const T0 = D + 0.8;
    bad.forEach((p, i) => steps.push([T0 + i * 0.9, () => {
      p.classList.add("fixed");
      const left = bad.length - i - 1;
      if (left) openN.textContent = left;
      else root.classList.add("open");
    }]));
    sequence(root, steps, () => {
      tw.forEach((t) => t.kill());
      tw = [];
      gsap.set(beam, { x: 0, opacity: 0 });
      pages.forEach((p) => p.classList.remove("seen", "found", "fixed"));
      root.classList.remove("open");
      openN.textContent = bad.length;
    });
  }

  // ---------------------------------------------------------------------------
  // 10. EMA publishes a new template: gold waves cross the screen. Veria, listening
  //    around your PSMF, catches them and the file reshapes: Section 7 rewritten,
  //    a new column in Annex B, a new annex. Then it's in your draft.
  // ---------------------------------------------------------------------------
  function rules() {
    const stage = $("#bcast"), svg = $("#waves"), mark = $(".ema-mark", stage), listener = $("#listener");
    const emTag = $("#emTag"), lsTag = $("#lsTag");
    const s7 = $(".fp.s7", stage), ab = $(".fp.ab", stage), nw = $(".fp.nw", stage);
    const changed = [s7, ab, nw];
    const reset = () => {
      changed.forEach((p) => p.classList.remove("lift", "done", "in"));
      [listener, emTag, lsTag].forEach((el) => el.classList.remove("hit", "on"));
      mark.classList.remove("pulse");
    };
    if (reduce) {
      changed.forEach((p) => p.classList.add("done", "in"));
      listener.classList.add("hit");
      emTag.classList.add("on");
      lsTag.classList.add("on");
      return;
    }
    let tl = null;
    const build = () => {
      const S = stage.getBoundingClientRect(), M = mark.getBoundingClientRect(), L = listener.getBoundingClientRect();
      const cx = M.left + M.width / 2 - S.left, cy = M.top + M.height / 2 - S.top, r0 = M.width / 2;
      const lx = L.left - S.left, ly = L.top - S.top, rx = L.right - S.left, ry = L.bottom - S.top;
      const near = Math.hypot(Math.max(lx - cx, 0, cx - rx), Math.max(ly - cy, 0, cy - ry));
      const far = Math.max(...[[lx, ly], [rx, ly], [lx, ry], [rx, ry]].map(([x, y]) => Math.hypot(x - cx, y - cy))) + 60;
      svg.innerHTML = "";
      svg.setAttribute("viewBox", `0 0 ${S.width} ${S.height}`);
      const D = 3.2, t0 = 0.6, hit = t0 + (D * (near - r0)) / (far - r0);
      tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5, onRepeat: reset });
      tl.call(() => { emTag.classList.add("on"); mark.classList.remove("pulse"); void mark.offsetWidth; mark.classList.add("pulse"); }, null, t0);
      [0, 0.45, 0.9].forEach((d) => {
        const c = svgEl("circle", { cx, cy, r: r0, class: "wv" }, svg);
        tl.fromTo(c, { attr: { r: r0 } }, { attr: { r: far }, duration: D, ease: "none" }, t0 + d)
          .fromTo(c, { opacity: 0.9 }, { opacity: 0, duration: D, ease: "power1.in", immediateRender: false }, t0 + d);
      });
      const lift = (p, at) => tl.call(() => p.classList.add("in", "lift", "done"), null, at).call(() => p.classList.remove("lift"), null, at + 0.7);
      tl.call(() => listener.classList.add("hit"), null, hit);
      lift(s7, hit + 0.5);
      lift(ab, hit + 1.2);
      lift(nw, hit + 1.9);
      tl.call(() => lsTag.classList.add("on"), null, hit + 2.9);
      tl.call(() => {}, null, hit + 7);
    };
    let running = false;
    const stop = () => { if (tl) tl.kill(); tl = null; reset(); svg.innerHTML = ""; };
    whileVisible(stage, () => { running = true; build(); }, () => { running = false; stop(); });
    let rw = stage.clientWidth;
    addEventListener("resize", () => { if (stage.clientWidth !== rw) { rw = stage.clientWidth; if (running) { stop(); build(); } } });
  }

  // ---------------------------------------------------------------------------
  // 9. AI suggests; every suggestion stops at you. What you accept reaches the
  //    PSMF, what you reject doesn't, and an accepted one can be pulled back out.
  // ---------------------------------------------------------------------------
  function gate() {
    const root = $("#gate"), toks = $$(".tok", root), mark = $("#gMark"), page = $("#gPage"), lines = $$("i", page);
    const node = $(".g-node", root), bar = $(".g-bar", root);
    const lands = [lines[1], null, lines[3]];
    if (reduce) { lines[1].classList.add("lit"); return; }
    let tl = null;
    const reset = () => {
      toks.forEach((t) => { t.classList.remove("yes", "no", "undo"); gsap.set(t, { opacity: 0 }); });
      lines.forEach((l) => l.classList.remove("lit"));
      mark.className = "g-mark";
    };
    const build = () => {
      const R = root.getBoundingClientRect();
      const cx = (el) => { const r = el.getBoundingClientRect(); return r.left + r.width / 2 - R.left; };
      const N = node.getBoundingClientRect();
      const y = N.top + N.height / 2 - R.top;
      const ax = cx(node), gx = cx(bar), px = cx(page);
      tl = gsap.timeline({ repeat: -1, repeatDelay: 1.4, onRepeat: reset });
      toks.forEach((t, i) => {
        const w = t.offsetWidth, top = y - t.offsetHeight / 2, d = t.dataset.d;
        tl.set(t, { x: ax - w / 2, y: top, opacity: 0, scale: 0.9 }, i * 2.6)
          .to(t, { opacity: 1, scale: 1, duration: 0.3 }, ">")
          .to(t, { x: gx - 14 - w, duration: 0.9, ease: "power2.inOut" }, ">")
          .call(() => { mark.className = `g-mark ${d}`; t.classList.add(d); }, null, "+=0.15");
        if (d === "yes") {
          tl.to(t, { x: px - w / 2, duration: 0.8, ease: "power2.in" }, "+=0.35")
            .to(t, { opacity: 0, scale: 0.6, duration: 0.25 }, "-=0.2")
            .call(() => { lands[i].classList.add("lit"); mark.className = "g-mark"; }, null, "-=0.1");
        } else {
          tl.to(t, { y: top + 46, opacity: 0, duration: 0.6, ease: "power2.in" }, "+=0.45")
            .call(() => { mark.className = "g-mark"; }, null, "<");
        }
      });
      // Undo: the last accepted change comes back out of the PSMF.
      const u = toks[2], uw = u.offsetWidth, ut = y - u.offsetHeight / 2;
      tl.call(() => { lines[3].classList.remove("lit"); u.classList.remove("yes"); u.classList.add("undo"); }, null, "+=0.8")
        .set(u, { x: px - uw / 2, y: ut, opacity: 0, scale: 0.6 }, "<")
        .to(u, { opacity: 1, scale: 1, duration: 0.3 }, ">")
        .to(u, { x: gx + 14, duration: 0.8, ease: "power2.inOut" }, ">")
        .call(() => { mark.className = "g-mark undo"; }, null, ">")
        .to(u, { opacity: 0, duration: 0.4 }, "+=0.7")
        .call(() => { mark.className = "g-mark"; }, null, ">");
    };
    let running = false;
    const stop = () => { if (tl) tl.kill(); tl = null; reset(); };
    whileVisible(root, () => { running = true; build(); }, () => { running = false; stop(); });
    let rw = root.clientWidth;
    addEventListener("resize", () => { if (root.clientWidth !== rw) { rw = root.clientWidth; if (running) { stop(); build(); } } });
  }

  // ---------------------------------------------------------------------------
  // 11. A year with Veria: scroll through the months; three revisions, one every
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
    const items = $$("#chores li"), line = $("#stopLine");
    items.forEach((li) => {
      const s = svgEl("svg", { viewBox: "0 0 100 30", preserveAspectRatio: "none", "aria-hidden": "true" });
      const p = svgEl("path", { d: `M0 ${15 + rand(0, 4)} C 22 ${10 + rand(0, 8)}, 48 ${18 + rand(0, 6)}, 70 ${13 + rand(0, 4)} S 96 ${14 + rand(0, 6)}, 100 ${15 + rand(0, 3)}`, pathLength: 1 }, s);
      p.style.strokeDasharray = "1 2";
      p.style.strokeDashoffset = 1;
      li.querySelector("span").append(s);
    });
    const strike = (li) => { li.querySelector("path").style.transition = "stroke-dashoffset 0.55s ease"; li.querySelector("path").style.strokeDashoffset = 0; li.classList.add("done"); };
    const steps = items.map((li, i) => [0.25 + i * 0.4, () => strike(li)]);
    steps.push([0.25 + items.length * 0.4 + 0.3, () => line.classList.add("in")]);
    sequence($("#chores"), steps, () => {
      items.forEach((li) => { const p = li.querySelector("path"); p.style.transition = "none"; p.style.strokeDashoffset = 1; li.classList.remove("done"); });
      line.classList.remove("in");
    }, 0.5);
  }

  // ---------------------------------------------------------------------------
  // 12. Trust: the claims, one after another, then the marks.
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

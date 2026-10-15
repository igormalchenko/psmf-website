// The map: owners → questions → places in the PSMF, drawn from the template.
// Idle, it replays real updates; on hover, it isolates what an owner, question
// or place touches. Mounted twice: once in the template's own terms, once in
// plain words (VOICES below).
(() => {
  const source = window.PSMF_MAP;
  if (!source) return;
  const list = (a) => (a.length < 2 ? a.join("") : `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`);
  const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

  const VOICES = {
    template: {
      owner: (o) => o,
      heads: (n) => ["Owner", `${n} questions`, "Where the answer appears"],
      held: "Waiting for approval",
      events: [
        { label: "Commercial partners", text: "Legal signs a new distributor. One answer updates Section 2 and Annex B, and drafts a logbook line." },
        { label: "Computerised systems (vendor)", text: "The vendor upgrades its safety database. Section 4 and Annex D change together." },
        { label: "Key persons", held: true, text: "A new deputy QPPV. Key persons always wait for a person to approve, then the cover and Section 1 follow." },
        { label: "Vendor procedures", flag: "Section 5", text: "The vendor withdraws a procedure. Annex E updates, and the Section 5 prose that still cites it is flagged for rewording." },
        { label: "MAH name", held: true, text: "A new company name. After approval it reaches the cover, Section 1 and Section 2." },
      ],
      ownerText: (o, n, ps) => `${o} owns ${plural(n, "question")}. Their answers appear in ${list(ps)}.`,
      placeText: (p, n, os) => `${p} is answered by ${plural(n, "question")} from ${list(os)}.`,
      questionText: (q, o, ps) => `${q}: owned by ${o}, appears in ${list(ps)}.`,
      idle: "Hover an owner, a question or a place to see what it touches.",
    },
    plain: {
      owner: (o) => ({
        "MAH management": "Management", "PSMF team": "Your PSMF team", "MAH IT": "IT", "Legal": "Legal",
        "MAH PV": "Pharmacovigilance", "Regulatory": "Regulatory affairs", "Clinical": "Clinical",
        "MAH Quality": "Quality", "Vendor": "Your vendors", "Vendor QA": "Your vendors", "Vendor IT": "Your vendors",
      })[o] || o,
      heads: () => ["The people who know", "Their answers", "Where it lands in your PSMF"],
      held: "You approve",
      events: [
        { label: "Commercial partners", text: "A new distributor. Legal says it once, and every page that mentions it follows." },
        { label: "Computerised systems (vendor)", text: "Your vendor upgrades its safety database. Section 4 and Annex D stay in step." },
        { label: "Key persons", held: true, text: "A new deputy QPPV. You approve it once, and the cover and Section 1 are right." },
        { label: "Vendor procedures", flag: "Section 5", text: "A procedure is retired. The paragraph that still mentions it is caught before an inspector catches it." },
        { label: "MAH name", held: true, text: "A new company name, in every place it is written." },
      ],
      ownerText: (o, n, ps) => `${o} keeps ${list(ps.map((p) => (p === "Cover" ? "the cover" : p)))} current.`,
      placeText: (p, n, os) => `${p === "Cover" ? "The cover" : p} stays current with answers from ${list(os.map((o) => (o.startsWith("Your") ? o.toLowerCase() : o)))}.`,
      questionText: (q, o) => `${q}, from ${o}.`,
      idle: "Point at anyone to see what they keep current.",
    },
  };

  document.querySelectorAll(".map[data-voice]").forEach((root) => mount(root, VOICES[root.dataset.voice]));

  function mount(root, voice) {
    const data = { places: source.places, questions: source.questions.map(([q, o, ps]) => [q, voice.owner(o), ps]) };
    const canvas = root.querySelector("canvas");
    const tip = root.querySelector(".map-tip");
    const caption = root.parentElement.querySelector(".map-caption");
    const ctx = canvas.getContext("2d");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const TITLES = ["", "", "QPPV", "Organisation", "Safety data", "Systems", "Processes", "Performance", "Quality",
      "QPPV", "Organisation", "Safety data", "Systems", "Procedures", "Performance", "Quality", "Products", "Logbook"];
    const LOGBOOK = data.places.indexOf("Annex I");
    const INK = "18,22,29", BLUE = "0,105,168", AMBER = "181,71,8";

    // Owners ordered by where their answers land, questions grouped under them.
    const byOwner = new Map();
    data.questions.forEach(([, owner], i) => {
      if (!byOwner.has(owner)) byOwner.set(owner, []);
      byOwner.get(owner).push(i);
    });
    const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
    const owners = [...byOwner.keys()].sort((a, b) =>
      mean(byOwner.get(a).map((i) => data.questions[i][2][0])) - mean(byOwner.get(b).map((i) => data.questions[i][2][0])));
    const order = owners.flatMap((o) => byOwner.get(o).sort((a, b) => data.questions[a][2][0] - data.questions[b][2][0]));

    const find = (label) => data.questions.findIndex((q) => q[0] === label);
    const EVENTS = voice.events
      .map((e) => ({ ...e, q: find(e.label), flag: e.flag ? [data.places.indexOf(e.flag)] : undefined }))
      .filter((e) => e.q >= 0);

    let W = 0, H = 0, L = {};
    const N = 28;
    const curve = (x0, y0, x1, y1) => {
      const pts = [];
      const cx = (x0 + x1) / 2;
      for (let i = 0; i <= N; i++) {
        const t = i / N, u = 1 - t;
        pts.push([u * u * u * x0 + 3 * u * u * t * cx + 3 * u * t * t * cx + t * t * t * x1,
                  u * u * u * y0 + 3 * u * u * t * y0 + 3 * u * t * t * y1 + t * t * t * y1]);
      }
      return pts;
    };
    const at = (pts, f) => {
      const x = Math.min(Math.max(f, 0), 1) * N, i = Math.min(Math.floor(x), N - 1), r = x - i;
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * r, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * r];
    };

    function layout() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = root.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const top = 64, bottom = H - 20, gap = 9;
      const xO = Math.max(150, W * 0.16), xQ = W * 0.5, xP = W - Math.max(170, W * 0.17);
      const step = (bottom - top - gap * (owners.length - 1)) / (order.length - 1);
      const qy = new Array(data.questions.length);
      let y = top, prev = null;
      for (const i of order) {
        const o = data.questions[i][1];
        if (prev && o !== prev) y += gap;
        qy[i] = y;
        y += step;
        prev = o;
      }
      const oy = new Map(owners.map((o) => [o, mean(byOwner.get(o).map((i) => qy[i]))]));
      // Keep owner labels at least 20px apart.
      owners.reduce((prevY, o) => {
        const y = Math.max(oy.get(o), prevY + 20);
        oy.set(o, y);
        return y;
      }, -Infinity);
      const py = data.places.map((_, k) => top + 6 + (k * (bottom - top - 12)) / (data.places.length - 1));
      const toOwner = data.questions.map(([, o], i) => curve(xO, oy.get(o), xQ, qy[i]));
      const toPlace = data.questions.map(([, , ps], i) => ps.map((k) => curve(xQ, qy[i], xP, py[k])));
      const toLog = data.questions.map((_, i) => curve(xQ, qy[i], xP, py[LOGBOOK]));
      L = { xO, xQ, xP, qy, oy, py, toOwner, toPlace, toLog, top };
    }

    // State
    let hover = null;          // { owners:Set, qs:Set, places:Set, flags:Set }
    let event = null;          // { e, t0 }
    let nextEvent = 0;
    let reveal = reduce ? 1 : 0, revealStart = null;
    let particles = [];
    let lastSpawn = 0;
    let visible = false;

    const focusOf = (sel) => {
      if (!sel) return null;
      const qs = new Set(sel.qs);
      const owners = new Set([...qs].map((i) => data.questions[i][1]));
      const places = new Set([...qs].flatMap((i) => data.questions[i][2]));
      return { qs, owners, places, flags: new Set(sel.flags || []), log: sel.log };
    };

    function setCaption(text) {
      if (caption.dataset.text === text) return;
      caption.dataset.text = text;
      caption.classList.remove("in");
      void caption.offsetWidth;
      caption.textContent = text;
      caption.classList.add("in");
    }

    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    function strokePath(pts, upto, color, width, dash) {
      ctx.beginPath();
      const n = Math.max(1, Math.round(upto * N));
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i <= n; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      if (upto < 1) { const p = at(pts, upto); ctx.lineTo(p[0], p[1]); }
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.setLineDash(dash || []);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    const dot = (x, y, r, color) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); };
    const glow = (x, y, a) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, 10);
      g.addColorStop(0, `rgba(${BLUE},${0.5 * a})`);
      g.addColorStop(1, `rgba(${BLUE},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(x - 10, y - 10, 20, 20);
      dot(x, y, 2.2, `rgba(${BLUE},${a})`);
    };

    function draw(now) {
      ctx.clearRect(0, 0, W, H);
      if (revealStart === null && visible) revealStart = now;
      if (!reduce && revealStart !== null) reveal = Math.min(1, (now - revealStart) / 1800);
      const r1 = ease(Math.min(1, reveal * 2)), r2 = ease(Math.max(0, reveal * 2 - 1));

      // Event phases: A owner→question, hold, B question→places, linger.
      let ev = null, pa = 0, pb = 0, holdP = 0;
      if (event) {
        const t = (now - event.t0) / 1000, e = event.e;
        const A = 0.9, HOLD = e.held ? 1.1 : 0, B = 1.1, LINGER = 2.4;
        pa = Math.min(1, t / A);
        holdP = HOLD ? Math.min(1, Math.max(0, (t - A) / HOLD)) : 1;
        pb = Math.min(1, Math.max(0, (t - A - HOLD) / B));
        if (t > A + HOLD + B + LINGER) { event = null; nextEvent = now + 700; }
        else ev = { e, sel: focusOf({ qs: [e.q], flags: e.flag, log: true }) };
      }
      const focus = hover || (ev && ev.sel);
      const dim = (on) => (focus ? (on ? 1 : 0.28) : 1);

      // Column heads
      ctx.font = "500 12px Geist, system-ui, sans-serif";
      ctx.fillStyle = `rgba(${INK},0.45)`;
      const heads = voice.heads(data.questions.length);
      ctx.textAlign = "right"; ctx.fillText(heads[0], L.xO - 14, 20);
      ctx.textAlign = "center"; ctx.fillText(heads[1], L.xQ, 20);
      ctx.textAlign = "left"; ctx.fillText(heads[2], L.xP + 14, 20);

      // Threads
      data.questions.forEach((q, i) => {
        const on = focus && focus.qs.has(i);
        const base = focus ? (on ? 0 : 0.035) : 0.11;
        if (!on) {
          strokePath(L.toOwner[i], r1, `rgba(${INK},${base})`, 1);
          L.toPlace[i].forEach((pts) => strokePath(pts, r2, `rgba(${INK},${base * 0.85})`, 1));
        }
      });
      if (focus) {
        focus.qs.forEach((i) => {
          const a = ev ? pa : 1, b = ev ? pb : 1;
          strokePath(L.toOwner[i], 1, `rgba(${BLUE},0.16)`, 1);
          strokePath(L.toOwner[i], a, `rgba(${BLUE},0.85)`, 1.4);
          L.toPlace[i].forEach((pts) => {
            strokePath(pts, 1, `rgba(${BLUE},0.16)`, 1);
            if (b > 0) strokePath(pts, b, `rgba(${BLUE},0.85)`, 1.4);
          });
          if (focus.log && !data.questions[i][2].includes(LOGBOOK) && b > 0) strokePath(L.toLog[i], b, `rgba(${BLUE},0.6)`, 1.2, [3, 4]);
          focus.flags.forEach((k) => {
            const pts = curve(L.xQ, L.qy[i], L.xP, L.py[k]);
            if (b > 0) strokePath(pts, b, `rgba(${AMBER},0.75)`, 1.2, [3, 4]);
          });
        });
      }

      // Ambient particles: answers travelling owner → question → place.
      if (!reduce && visible && reveal >= 1 && now - lastSpawn > 110) {
        lastSpawn = now;
        const i = (Math.random() * data.questions.length) | 0;
        const k = (Math.random() * L.toPlace[i].length) | 0;
        particles.push({ i, k, t0: now, d: 2600 + Math.random() * 1600 });
      }
      particles = particles.filter((p) => now - p.t0 < p.d);
      particles.forEach((p) => {
        const t = ease((now - p.t0) / p.d) * 2;
        const pos = t < 1 ? at(L.toOwner[p.i], t) : at(L.toPlace[p.i][p.k], t - 1);
        const fade = Math.sin(Math.PI * (t / 2));
        const on = !focus || focus.qs.has(p.i);
        dot(pos[0], pos[1], 1.8, `rgba(${BLUE},${(on ? 0.8 : 0.15) * fade})`);
      });

      // Event pulses
      if (ev) {
        const i = ev.e.q;
        if (pa < 1) glow(...at(L.toOwner[i], pa), 1);
        else if (pb === 0) {
          const [x, y] = [L.xQ, L.qy[i]];
          glow(x, y, 1);
          if (ev.e.held) {
            const rr = 6 + 5 * Math.sin(holdP * Math.PI);
            ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${BLUE},0.6)`; ctx.lineWidth = 1.2; ctx.stroke();
            ctx.font = "500 11.5px Geist, system-ui, sans-serif";
            ctx.fillStyle = `rgba(${BLUE},0.9)`; ctx.textAlign = "left";
            ctx.fillText(voice.held, x + 14, y - 10);
          }
        } else if (pb < 1) {
          L.toPlace[i].forEach((pts) => glow(...at(pts, pb), 1));
          if (!data.questions[i][2].includes(LOGBOOK)) glow(...at(L.toLog[i], pb), 0.8);
        }
      }

      // Question dots
      data.questions.forEach((_, i) => {
        const on = focus && focus.qs.has(i);
        const a = r1 * (focus ? (on ? 1 : 0.25) : 0.55);
        dot(L.xQ, L.qy[i], on ? 2.6 : 1.8, on ? `rgba(${BLUE},${a})` : `rgba(${INK},${a})`);
      });

      // Owners
      ctx.textAlign = "right";
      owners.forEach((o) => {
        const on = focus && focus.owners.has(o);
        const y = L.oy.get(o);
        ctx.font = `${on ? 600 : 500} 13px Geist, system-ui, sans-serif`;
        ctx.fillStyle = on ? `rgba(${BLUE},1)` : `rgba(${INK},${0.85 * dim(on) * r1})`;
        ctx.fillText(o, L.xO - 14, y + 4.5);
        dot(L.xO, y, on ? 3.4 : 2.6, on ? `rgba(${BLUE},1)` : `rgba(${INK},${0.7 * dim(on) * r1})`);
      });

      // Places
      ctx.textAlign = "left";
      data.places.forEach((p, k) => {
        const logOn = focus && focus.log && k === LOGBOOK && (!ev || pb > 0);
        const flagOn = focus && focus.flags.has(k) && (!ev || pb > 0);
        const on = focus && (focus.places.has(k) && (!ev || pb > 0)) || logOn;
        const y = L.py[k];
        const arrived = ev && pb >= 1;
        const color = flagOn ? `rgba(${AMBER},1)` : on ? `rgba(${BLUE},1)` : `rgba(${INK},${0.82 * dim(on || flagOn) * r2})`;
        dot(L.xP, y, on || flagOn ? 3.4 : 2.6, color);
        if ((on || flagOn) && arrived) {
          const t = Math.min(1, (now - event.t0 - (event.e.held ? 3100 : 2000)) / 900);
          if (t > 0 && t < 1) {
            ctx.beginPath(); ctx.arc(L.xP, y, 3 + 14 * t, 0, Math.PI * 2);
            ctx.strokeStyle = flagOn ? `rgba(${AMBER},${1 - t})` : `rgba(${BLUE},${1 - t})`;
            ctx.lineWidth = 1.4; ctx.stroke();
          }
        }
        ctx.font = `${on || flagOn ? 600 : 500} 13px Geist, system-ui, sans-serif`;
        ctx.fillStyle = color;
        ctx.fillText(p, L.xP + 14, y + 4.5);
        if (TITLES[k]) {
          const w = ctx.measureText(p).width;
          ctx.font = "400 12px Geist, system-ui, sans-serif";
          ctx.fillStyle = `rgba(${INK},${0.45 * dim(on || flagOn) * r2})`;
          ctx.fillText(TITLES[k], L.xP + 22 + w, y + 4.5);
        }
      });

      // Next scripted update
      if (!reduce && !hover && !event && visible && reveal >= 1 && now >= nextEvent) {
        const e = EVENTS[(draw.n = ((draw.n ?? -1) + 1) % EVENTS.length)];
        event = { e, t0: now };
        setCaption(e.text);
      }
    }

    function loop(now) {
      draw(now);
      if (visible) requestAnimationFrame(loop);
    }

    // Hover
    function pick(mx, my) {
      if (mx < L.xO + 24) {
        let best = null, d = 16;
        owners.forEach((o) => { const dd = Math.abs(L.oy.get(o) - my); if (dd < d) { d = dd; best = o; } });
        if (best) {
          const qs = byOwner.get(best);
          const ps = [...new Set(qs.flatMap((i) => data.questions[i][2]))].sort((a, b) => a - b).map((k) => data.places[k]);
          return { sel: { qs }, text: voice.ownerText(best, qs.length, ps) };
        }
      } else if (mx > L.xP - 24) {
        let best = -1, d = 14;
        L.py.forEach((y, k) => { const dd = Math.abs(y - my); if (dd < d) { d = dd; best = k; } });
        if (best >= 0) {
          const qs = data.questions.map((q, i) => (q[2].includes(best) ? i : -1)).filter((i) => i >= 0);
          const os = [...new Set(qs.map((i) => data.questions[i][1]))];
          return { sel: { qs }, text: voice.placeText(data.places[best], qs.length, os) };
        }
      } else if (Math.abs(mx - L.xQ) < 60) {
        let best = -1, d = 5;
        L.qy.forEach((y, i) => { const dd = Math.abs(y - my); if (dd < d) { d = dd; best = i; } });
        if (best >= 0) {
          const [label, owner, ps] = data.questions[best];
          return { sel: { qs: [best] }, tip: { label, owner, y: L.qy[best] }, text: voice.questionText(label, owner, ps.map((k) => data.places[k])) };
        }
      }
      return null;
    }
    canvas.addEventListener("mousemove", (e) => {
      const r = canvas.getBoundingClientRect();
      const hit = pick(e.clientX - r.left, e.clientY - r.top);
      hover = hit ? focusOf(hit.sel) : null;
      if (hit) { event = null; setCaption(hit.text); }
      canvas.style.cursor = hit ? "pointer" : "";
      if (hit && hit.tip) {
        tip.innerHTML = `<b>${hit.tip.label}</b><span>${hit.tip.owner}</span>`;
        tip.style.transform = `translate(${L.xQ + 16}px, ${hit.tip.y - 18}px)`;
        tip.classList.add("in");
      } else tip.classList.remove("in");
      if (reduce) draw(performance.now());
    });
    canvas.addEventListener("mouseleave", () => {
      hover = null;
      tip.classList.remove("in");
      nextEvent = performance.now() + 900;
      if (reduce) draw(performance.now());
    });

    const start = () => {
      layout();
      if (reduce) { setCaption(voice.idle); draw(performance.now()); }
      new IntersectionObserver(([e]) => {
        const was = visible;
        visible = e.isIntersecting && !reduce;
        if (visible && !was) requestAnimationFrame(loop);
      }, { threshold: 0.25 }).observe(root);
      new ResizeObserver(() => { layout(); if (!visible) draw(performance.now()); }).observe(root);
    };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(start);
  }
})();

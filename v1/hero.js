// The hero film: a camera over a desk of PSMF pages, with the app's UI on top.
// One GSAP timeline drives everything, so the chapters below can seek it.
(() => {
  const film = document.getElementById("film");
  if (!film) return;
  const desk = document.getElementById("desk");
  const ui = document.getElementById("ui");
  const W = 1160;

  // Scale the fixed 1160×660 stage to the column width. Phones get a larger,
  // centre-cropped stage instead of a miniature.
  const fit = () => {
    const w = film.clientWidth;
    const k = w >= 700 ? w / W : Math.min(0.62, w / 560);
    film.style.setProperty("--k", k);
    film.style.height = w >= 700 ? "" : `${660 * k}px`;
  };
  fit();
  new ResizeObserver(fit).observe(film);

  // Ghost pages around the six real ones: the rest of a 64-page file.
  const real = new Set(["1,1", "2,1", "3,1", "1,2", "2,2", "3,2"]);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 5; c++) {
      if (real.has(`${c},${r}`)) continue;
      const g = document.createElement("div");
      g.className = (c + r) % 3 === 0 ? "pg ghost t" : "pg ghost";
      g.style.left = `${c * 640}px`;
      g.style.top = `${r * 872}px`;
      desk.prepend(g);
    }
  }

  // Camera: a point on the desk (x, y) sits at the centre of the lens.
  const cam = { x: 1520, y: 1660, s: 0.5, rx: 40, rz: -20 };
  let lift = 0;
  const render = () => {
    desk.style.transform = `rotateX(${cam.rx + lift}deg) rotateZ(${cam.rz}deg) scale(${cam.s}) translate(${-cam.x}px, ${-cam.y}px)`;
  };
  render();

  // Scrolling away flattens the desk a little.
  addEventListener("scroll", () => {
    lift = -12 * Math.min(Math.max(scrollY / 700, 0), 1);
    render();
  }, { passive: true });

  if (!window.gsap) return;
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(build);

  function build() {
    const $ = (id) => document.getElementById(id);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const within = (el, root) => {
      let x = 0, y = 0, n = el;
      while (n && n !== root) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
      return { x, y, w: el.offsetWidth, h: el.offsetHeight };
    };
    const tip = (el, fx = 0.5, fy = 0.55) => {
      const p = within(el, ui);
      return { x: p.x + p.w * fx, y: p.y + p.h * fy };
    };
    const view = (el, o = {}) => {
      const p = within(el, desk);
      return { x: p.x + p.w / 2 + (o.dx || 0), y: (o.y ?? p.y + p.h / 2) + (o.dy || 0), s: o.s ?? 1.12, rx: o.rx ?? 18, rz: o.rz ?? -7 };
    };
    const ping = (x, y) => {
      const d = document.createElement("div");
      d.className = "ping";
      d.style.left = `${x}px`;
      d.style.top = `${y}px`;
      desk.appendChild(d);
      return d;
    };

    const answer = $("answer"), form = $("form"), status = $("status");
    const ansRow = $("ansRow"), why = $("why"), send = $("send");
    const checking = $("checking"), applied = $("applied"), okPath = $("okPath");
    const chips = [...answer.querySelectorAll(".chip")];
    const sign = $("sign"), box = $("box"), tick = $("tick"), signBtn = $("signBtn");
    const digits = [...sign.querySelectorAll(".code i")];
    const cursor = $("cursor"), ring = $("ring"), dip = $("dip"), sweep = $("sweep");
    const ins23 = $("ins23"), rowB2 = $("rowB2"), logRow = $("logRow"), hash = $("hash");
    const pages = [...desk.querySelectorAll(".pg:not(.ghost)")].sort((a, b) => a.offsetLeft - b.offsetLeft || a.offsetTop - b.offsetTop);
    const frosts = pages.map((p) => p.querySelector(".frost"));
    const foots = pages.map((p) => p.querySelector(".foot .h")).filter(Boolean);

    // Where the camera goes
    const OV_A = { x: 1480, y: 1640, s: 0.5, rx: 40, rz: -20 };
    const OV_B = { x: 1600, y: 1700, s: 0.53, rx: 38, rz: -17 };
    const OV_C = { x: 1560, y: 1660, s: 0.56, rx: 34, rz: -14 };
    const OV_D = { x: 1540, y: 1700, s: 0.5, rx: 38, rz: -18 };
    const V23 = view($("p23"));
    const VB2 = view($("tblB2"), { y: within(rowB2, desk).y + 6 });
    const VLOG = view($("tblLog"), { y: within(logRow, desk).y - 10, dx: 20 });
    const VSIG = view($("sigTbl"), { dy: -70, s: 1.02, rx: 16, rz: -6 });

    const i23 = within(ins23, desk), iB2 = within(rowB2, desk), iLog = within(logRow, desk);
    const pings = [ping(i23.x + 40, i23.y + 9), ping(iB2.x + 60, iB2.y + 12), ping(iLog.x + 140, iLog.y + 10)];

    const HASH = "Version 4.3 · SHA-256 7f3a9c2e41d8b05f";
    const hx = { p: 0 };
    const scramble = (p) => {
      const n = Math.floor(HASH.length * p);
      let out = HASH.slice(0, n);
      for (let i = n; i < Math.min(HASH.length, n + 5); i++) out += HASH[i] === " " ? " " : "0123456789abcdef"[(Math.random() * 16) | 0];
      return out;
    };
    const resetText = () => { hash.textContent = ""; };

    gsap.set(answer, { opacity: 0, y: 28, scale: 0.97 });
    gsap.set(sign, { opacity: 0, y: 20, scale: 0.97 });
    gsap.set(cursor, { opacity: 0, x: 470, y: 520 });
    gsap.set(sweep, { x: -1800, rotation: 20 });

    const tl = gsap.timeline({ repeat: -1, paused: true, onUpdate: frame, onRepeat: resetText });
    const T = { end: 28.2 };

    const click = (el, t) => {
      tl.to(cursor, { scale: 0.85, duration: 0.09, yoyo: true, repeat: 1, ease: "power1.inOut" }, t);
      tl.to(el, { scale: 0.965, duration: 0.09, yoyo: true, repeat: 1, ease: "power1.inOut" }, t);
      tl.fromTo(ring, { x: () => tip(el).x, y: () => tip(el).y, scale: 0.3, opacity: 0.6 },
        { scale: 1.7, opacity: 0, duration: 0.6, ease: "power2.out", immediateRender: false }, t);
    };
    const pulse = (el, t) => tl.fromTo(el, { scale: 0.3, opacity: 0.95 }, { scale: 3.4, opacity: 0, duration: 1.4, ease: "power2.out", immediateRender: false }, t);
    const light = (chip, t) => {
      tl.to(chip, { backgroundColor: "rgba(6,118,71,0.1)", borderColor: "rgba(6,118,71,0.35)", color: "#067647", duration: 0.4 }, t);
      tl.to(chip.querySelector("svg"), { width: 12, opacity: 1, duration: 0.35, ease: "power2.out" }, t);
    };
    const fly = (to, t, d = 1.7) => tl.to(cam, { ...to, duration: d, ease: "power3.inOut" }, t);

    tl.call(resetText, null, 0);
    tl.fromTo(dip, { opacity: 1 }, { opacity: 0, duration: 0.9, ease: "power1.out" }, 0);
    tl.fromTo(cam, { ...OV_A }, { ...OV_B, duration: 6.8, ease: "sine.inOut" }, 0);

    // Ask: Legal adds a row, gives a reason, sends.
    tl.to(answer, { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "expo.out" }, 0.5);
    tl.to(ansRow, { height: () => ansRow.scrollHeight, duration: 0.6, ease: "power3.out" }, 1.4);
    tl.fromTo(ansRow.firstElementChild, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }, 1.55);
    tl.to(why, { width: () => why.scrollWidth, duration: 1.1, ease: "steps(26)" }, 2.2);
    tl.to(cursor, { opacity: 1, duration: 0.3 }, 3.0);
    tl.to(cursor, { x: () => tip(send).x, y: () => tip(send).y, duration: 1.0, ease: "power2.inOut" }, 3.0);
    click(send, 4.1);
    tl.to(cursor, { x: "+=170", y: "+=50", opacity: 0, duration: 0.7, ease: "power2.in" }, 4.45);

    // Check: rules and AI judge it a clean addition.
    tl.to(form, { height: 0, opacity: 0, duration: 0.55, ease: "power3.inOut" }, 4.6);
    tl.to(status, { height: "auto", opacity: 1, duration: 0.55, ease: "power3.inOut" }, 4.7);
    tl.to(checking, { opacity: 0, duration: 0.3 }, 6.2);
    tl.fromTo(applied, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, 6.3);
    tl.fromTo(okPath, { strokeDashoffset: 14 }, { strokeDashoffset: 0, duration: 0.45, ease: "power2.out" }, 6.4);

    // Update: the camera visits every place the fact appears.
    fly(V23, 7.0, 1.8);
    tl.to(ins23, { maxWidth: () => ins23.scrollWidth, duration: 0.8, ease: "power2.inOut" }, 8.7);
    pulse(pings[0], 8.9);
    light(chips[0], 8.9);
    fly(VB2, 9.8, 1.5);
    tl.to(rowB2, { height: () => rowB2.scrollHeight, duration: 0.6, ease: "power3.out" }, 11.2);
    pulse(pings[1], 11.3);
    light(chips[1], 11.3);
    fly(VLOG, 12.0, 1.5);
    tl.to(logRow, { height: () => logRow.scrollHeight, duration: 0.6, ease: "power3.out" }, 13.4);
    pulse(pings[2], 13.5);
    light(chips[2], 13.5);
    fly(OV_C, 14.4, 1.8);
    tl.to(answer, { opacity: 0, y: 16, duration: 0.6, ease: "power2.in" }, 14.6);
    pings.forEach((p) => pulse(p, 15.7));

    // Sign: the QPPV signs; the version freezes.
    fly(VSIG, 16.4, 1.7);
    tl.to(sign, { opacity: 1, y: 0, scale: 1, duration: 1.0, ease: "expo.out" }, 17.0);
    tl.set(cursor, { x: 1010, y: 600 }, 17.6);
    tl.to(cursor, { opacity: 1, duration: 0.3 }, 17.7);
    tl.to(cursor, { x: () => tip(box).x, y: () => tip(box).y, duration: 0.8, ease: "power2.inOut" }, 17.7);
    click(box, 18.5);
    tl.to(box, { backgroundColor: "#0069a8", borderColor: "#0069a8", duration: 0.15 }, 18.55);
    tl.fromTo(tick, { strokeDashoffset: 11 }, { strokeDashoffset: 0, duration: 0.3, ease: "power2.out" }, 18.6);
    tl.fromTo(digits, { opacity: 0, y: 6, scale: 1.3 }, { opacity: 1, y: 0, scale: 1, duration: 0.28, stagger: 0.09, ease: "back.out(2.5)" }, 18.85);
    tl.to(cursor, { x: () => tip(signBtn).x, y: () => tip(signBtn).y, duration: 0.65, ease: "power2.inOut" }, 19.45);
    click(signBtn, 20.15);
    tl.to(sign, { opacity: 0, y: -10, scale: 0.97, duration: 0.45, ease: "power2.in" }, 20.4);
    tl.to(cursor, { x: "+=120", y: "+=80", opacity: 0, duration: 0.6, ease: "power2.in" }, 20.45);
    tl.fromTo($("sig1"), { opacity: 0, scale: 1.6, rotation: -5 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.55, ease: "back.out(2)" }, 20.75);
    tl.fromTo($("sig2"), { opacity: 0, scale: 1.6, rotation: -5 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.55, ease: "back.out(2)" }, 21.3);
    tl.to($("bDraft"), { opacity: 0, y: -6, duration: 0.3 }, 21.75);
    tl.fromTo($("bEff"), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, 21.85);
    tl.to(cam, { y: "+=170", duration: 1.1, ease: "power2.inOut" }, 21.5);
    tl.to(hx, { p: 1, duration: 1.0, ease: "none", onUpdate: () => { hash.textContent = scramble(hx.p); } }, 21.95);
    tl.to([$("ldA"), $("laA")], { opacity: 0, duration: 0.3 }, 21.9);
    tl.to([$("ldB"), $("laB")], { opacity: 1, duration: 0.4 }, 22.1);

    fly(OV_D, 22.8, 2.0);
    tl.fromTo(sweep, { x: -1800 }, { x: 3800, duration: 2.8, ease: "power1.inOut", immediateRender: false }, 23.3);
    tl.to(frosts, { opacity: 1, duration: 0.9, stagger: 0.22 }, 23.7);
    tl.to(foots, { opacity: 1, duration: 0.6, stagger: 0.22 }, 23.8);
    tl.to(cam, { x: "+=70", y: "-=40", duration: 3.4, ease: "sine.inOut" }, 24.8);
    tl.to(dip, { opacity: 1, duration: 0.8, ease: "power1.in" }, T.end - 0.8);


    // Chapters
    const buttons = [...document.querySelectorAll("#chapters button")];
    const starts = buttons.map((b) => parseFloat(b.dataset.at));
    const ranges = starts.map((s, i) => [i === 0 ? 0 : s, starts[i + 1] ?? T.end]);
    const bars = buttons.map((b) => b.querySelector("i"));
    function frame() {
      render();
      const t = tl.time();
      ranges.forEach(([a, b], i) => {
        const p = Math.min(Math.max((t - a) / (b - a), 0), 1);
        bars[i].style.width = `${p * 100}%`;
        buttons[i].classList.toggle("on", t >= a && t < b);
      });
    }
    buttons.forEach((b, i) => b.addEventListener("click", () => {
      resetText();
      tl.seek(starts[i]);
      if (!reduce) tl.play();
      frame();
    }));

    if (reduce) {
      pings.forEach((p) => p.remove());
      tl.seek(14.0);
      frame();
      return;
    }

    // Play only while the film is on screen.
    let started = false;
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { tl.play(); started = true; } else if (started) tl.pause();
    }, { threshold: 0.2 }).observe(film);
  }
})();

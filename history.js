// "What it said, on any date": scrolling moves through versions 4.0 → 4.3 of
// one paragraph. Each change is a redline first, then clean text once signed.
(() => {
  const track = document.getElementById("historyTrack");
  if (!track || !window.gsap) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const states = [...document.querySelectorAll("#histState > span")];
  const logs = [...document.querySelectorAll("#histLog > span")];
  const rail = [...document.querySelectorAll("#rail li")];
  const bar = document.querySelector("#rail .fill");

  const build = () => {
    const tl = gsap.timeline({ paused: true });
    gsap.set(states.slice(1), { opacity: 0, y: 8 });
    gsap.set(logs.slice(1), { opacity: 0, y: 8 });
    gsap.set(bar, { scaleX: 0 });
    document.querySelectorAll(".hx.del").forEach((el) => gsap.set(el, { maxWidth: el.scrollWidth + 2 }));

    const swap = (list, from, to, t) => {
      tl.to(list[from], { opacity: 0, y: -8, duration: 0.6, ease: "power2.in" }, t);
      tl.fromTo(list[to], { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, t + 0.4);
    };

    for (let v = 1; v <= 3; v++) {
      const t = 3 + (v - 1) * 10;
      const dels = [...document.querySelectorAll(`.hx.del[data-v="${v}"]`)];
      const adds = [...document.querySelectorAll(`.hx.add[data-v="${v}"]`)];

      // Draft: the redline appears.
      swap(states, 2 * v - 2, 2 * v - 1, t);
      dels.forEach((d) => {
        tl.to(d, { color: "#ff8a7a", duration: 0.8 }, t + 0.5);
        tl.fromTo(d.querySelector(".strike"), { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: "power2.inOut" }, t + 0.6);
      });
      adds.forEach((a) => {
        // A replacement sits a space after the struck text until the struck text goes.
        if (a.previousElementSibling?.classList.contains("del")) tl.to(a, { marginLeft: "0.26em", duration: 1.2, ease: "power2.inOut" }, t + 1.2);
        tl.to(a, { maxWidth: () => a.scrollWidth + 2, duration: 2.2, ease: "power2.inOut" }, t + 1.2);
        tl.fromTo(a, { backgroundColor: "rgba(52,211,153,0)", color: "#6ee7b7" }, { backgroundColor: "rgba(52,211,153,0.16)", duration: 0.8 }, t + 1.2);
      });
      swap(logs, v - 1, v, t + 2.6);

      // Signed: the redline resolves into the new text.
      dels.forEach((d) => tl.to(d, { maxWidth: 0, opacity: 0, duration: 1.8, ease: "power2.inOut" }, t + 6));
      adds.forEach((a) => {
        tl.to(a, { backgroundColor: "rgba(52,211,153,0)", color: "#e9edf3", duration: 1.6 }, t + 6.2);
        if (a.previousElementSibling?.classList.contains("del")) tl.to(a, { marginLeft: 0, duration: 1.8, ease: "power2.inOut" }, t + 6);
      });
      swap(states, 2 * v - 1, 2 * v, t + 6.2);
      tl.to(rail[v], { "--on": 1, duration: 0.6 }, t + 6.6);
      tl.to(bar, { scaleX: v / 3, duration: 6.6, ease: "none" }, t);
    }
    tl.to({}, { duration: 3 }, 30);
    return tl;
  };

  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    const tl = build();
    let target = 0, cur = 0, raf = 0;
    const measure = () => {
      const r = track.getBoundingClientRect();
      const total = track.offsetHeight - innerHeight;
      target = Math.min(1, Math.max(0, -r.top / total));
    };
    const step = () => {
      cur += (target - cur) * 0.1;
      if (reduce || Math.abs(target - cur) < 0.0004) cur = target;
      tl.progress(cur);
      raf = cur !== target ? requestAnimationFrame(step) : 0;
    };
    const onScroll = () => { measure(); if (!raf) raf = requestAnimationFrame(step); };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    onScroll();
  });
})();

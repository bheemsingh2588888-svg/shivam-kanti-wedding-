const C = window.WEDDING, T = window.I18N;
let lang = "en";
const bride = location.hash === "#bride";
const t = k => (T[lang][k] || T.en[k]);
const $ = s => document.querySelector(s);
const fmt = (iso, opts) => new Date(iso + "T00:00:00+05:30").toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { timeZone: C.timezone, ...opts });
const longDate = iso => fmt(iso, { day: "numeric", month: "long", year: "numeric" });
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const names = bride ? [C.couple.bride, C.couple.groom] : [C.couple.groom, C.couple.bride];

function buildNames(el) {
  // English: letter by letter. Hindi: word by word so matras stay intact.
  const parts = lang === "hi" ? names.join(" और ").split(" ") : [...names.join(" & ")];
  el.innerHTML = parts.map((p, i) => `<span style="--d:${(i * 0.06).toFixed(2)}s">${esc(p)}${lang === "hi" ? " " : ""}</span>`).join("");
}

function render() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el => el.textContent = t(el.dataset.i18n));
  $("#lang").textContent = lang === "en" ? "हिंदी" : "English";
  $("#openBtn").textContent = t("open");
  buildNames($("#heroNames"));
  buildNames($("#gateNames"));
  $("#heroDate").textContent = `${longDate("2026-11-16")} – ${longDate("2026-11-25")} · ${C.city}`;

  const [a, b] = bride ? [C.bride, C.groom] : [C.groom, C.bride];
  const sideName = bride ? C.couple.bride : C.couple.groom;
  $("#invite").innerHTML = `
    <p class="family">${t("inviteLead")}</p>
    <h2 class="names">${esc(C.couple.groom)} &amp; ${esc(C.couple.bride)}</h2>
    <p class="family">${esc(C.couple.groom)}, ${t("son")} ${esc(C.groom.father)}, ${esc(C.groom.address)}</p>
    <p class="family">${esc(C.couple.bride)}, ${t("daughter")} ${esc(C.bride.father)}, ${esc(C.bride.address)}</p>
    <p class="divider">◆ ◆ ◆</p>
    <p class="family">${t("awaiting")}</p>`;

  $("#timeline").innerHTML = C.events.map(e => {
    const dateTxt = `${fmt(e.date, { weekday: "long" })}, ${longDate(e.date)}`;
    const q = encodeURIComponent(`${C.city}, Barhariya, Siwan`);
    return `<li>
      <h3>${esc(e.name[lang])}</h3>
      <p class="meta">${esc(dateTxt)}</p>
      <p class="meta">${esc(e.time)}</p>
      <p class="meta">${esc(e.venue)}</p>
      <div class="links">
        <a href="https://www.google.com/maps/search/?api=1&query=${e.key === "reception" ? encodeURIComponent("Kiran Hotel, Mirganj") : q}" target="_blank" rel="noopener">${t("directions")}</a>
        <a href="#" data-ics="${e.key}">${t("calendar")}</a>
      </div>
    </li>`;
  }).join("") + `<li><h3>${lang === "hi" ? "फेरे" : "Pheras"}</h3><p class="meta">${t("pherasNote")}</p></li>`;

  $("#rsvpList").innerHTML = C.rsvp.map(n => `<li>${esc(n)}</li>`).join("");
  $("#phones").innerHTML = C.phones.map(p => `<a href="tel:+91${p}">+91 ${p}</a>`).join("<br>");
  $("#share").textContent = t("share");
  $("#copy").textContent = t("copy");
  $("#pdf").textContent = t("pdf");
}

// Countdown to Pheras
function tick() {
  const diff = new Date(C.pherasTarget) - Date.now();
  const el = $("#cd");
  if (diff <= 0) { el.innerHTML = `<p>${t("done")}</p>`; return; }
  const parts = { Days: 86400, Hours: 3600, Minutes: 60, Seconds: 1 };
  let s = Math.floor(diff / 1000);
  el.innerHTML = Object.entries(parts).map(([label, sec]) => {
    const v = Math.floor(s / sec); s -= v * sec;
    return `<div><b>${String(v).padStart(2, "0")}</b><small>${label}</small></div>`;
  }).join("");
}

// .ics download (all-day, since times are not yet final)
function icsFor(key) {
  const e = C.events.find(x => x.key === key);
  const d = e.date.replace(/-/g, ""), next = new Date(e.date + "T00:00:00Z");
  next.setUTCDate(next.getUTCDate() + 1);
  const end = next.toISOString().slice(0, 10).replace(/-/g, "");
  const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Wedding//EN", "BEGIN:VEVENT",
    `UID:${key}-${d}@wedding`, `DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${e.name.en} – ${C.couple.groom} & ${C.couple.bride}`, `LOCATION:${e.venue}`,
    `DESCRIPTION:${e.time}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: `${key}.ics` });
  a.click(); URL.revokeObjectURL(url);
}

function petals() {
  for (let i = 0; i < 36; i++) {
    const p = document.createElement("div");
    p.className = "petal" + (i % 3 === 0 ? " m" : "");
    p.style.left = Math.random() * 100 + "vw";
    p.style.setProperty("--x", (Math.random() * 120 - 60) + "px");
    p.style.animationDuration = (3 + Math.random() * 3) + "s";
    p.style.animationDelay = Math.random() * 1.2 + "s";
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 7000);
  }
}

const bgm = $("#bgm");
let playing = false;
function setMusic(on) {
  playing = on;
  $("#music").textContent = on ? "❚❚" : "♪";
  on ? bgm.play().catch(() => { playing = false; }) : bgm.pause();
}

function init() {
  $("#gateNames") && buildNames($("#gateNames"));
  render();
  tick(); setInterval(tick, 1000);
  const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle("in", e.isIntersecting)), { threshold: .15 });
  document.querySelectorAll("main section").forEach(s => io.observe(s));

  $("#openBtn").onclick = () => {
    $("#gate").classList.add("open");
    bgm.volume = 0.5; setMusic(true); petals();
    setTimeout(() => $("#gate").remove(), 1600);
  };
  $("#music").onclick = () => setMusic(!playing);
  document.addEventListener("visibilitychange", () => { if (document.hidden) bgm.pause(); else if (playing) bgm.play().catch(() => {}); });
  $("#lang").onclick = () => { lang = lang === "en" ? "hi" : "en"; render(); };
  $("#timeline").addEventListener("click", e => { const a = e.target.closest("[data-ics]"); if (a) { e.preventDefault(); icsFor(a.dataset.ics); } });
  $("#share").onclick = () => {
    const text = `${C.couple.groom} & ${C.couple.bride} – Shubh Vivah · ${C.city}`;
    if (navigator.share) navigator.share({ title: text, url: location.href }).catch(() => {});
    else window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + location.href)}`, "_blank");
  };
  $("#copy").onclick = () => navigator.clipboard?.writeText(location.href).then(() => { $("#copy").textContent = t("copied"); setTimeout(render, 1500); });
  $("#pdf").onclick = () => window.print();
}
init();

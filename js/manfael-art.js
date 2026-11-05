"use strict";
// ================= مَن الفاعل؟: the case, the city and the drawings =================
// An old Arab city drawn in ink on parchment (or, in «في البيت», the floor plan of a house), twelve suspects
// on sticky notes, and the lanterns that stand for the teams. The case generator lives here too: five true
// statements that leave exactly one suspect, a witness who repeats a feature, and (in the normal game) a liar
// whose statement points at a decoy. Everything here is pure: no room, no network.
const MFA = (() => {
  const INKC = "#3a2a1a", TEAL = "#1f6f78", TEAL_D = "#14484f", TILE = "#2a9d8f", GOLDC = "#e2b04a", COPPER = "#c27a3a", WALL = "#f1dfb6", WALL_D = "#dcc391", STONE = "#cdb88c", WOOD = "#8a5a2b", PALM = "#3f8f5a", WATER = "#8cc3c8";
  const sw = (w = 3) => `stroke="${INKC}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const shadow = (w = 150) => `<ellipse cx="0" cy="58" rx="${w / 2}" ry="9" fill="#5a3d1d" opacity=".18"/>`;
  const parapet = (x, y, w) => `<path d="M${x} ${y}h${w}" ${sw(3)}/>${Array.from({ length: Math.floor(w / 14) }, (_, k) => `<rect x="${x + 3 + k * 14}" y="${y - 7}" width="8" height="7" fill="${WALL_D}" ${sw(2)}/>`).join("")}`;
  const arch = (cx, by, w, h, fill = WOOD) => `<path d="M${cx - w / 2} ${by}V${by - h + w * 0.55}Q${cx - w / 2} ${by - h} ${cx} ${by - h - w * 0.15}Q${cx + w / 2} ${by - h} ${cx + w / 2} ${by - h + w * 0.55}V${by}Z" fill="${fill}" ${sw(2.5)}/>`;
  const mashr = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#a0703a" ${sw(2.5)}/>${Array.from({ length: 3 }, (_, i) => `<path d="M${x + (w / 4) * (i + 1)} ${y}v${h}" stroke="${INKC}" stroke-width="1.3"/>`).join("")}${Array.from({ length: 3 }, (_, i) => `<path d="M${x} ${y + (h / 4) * (i + 1)}h${w}" stroke="${INKC}" stroke-width="1.3"/>`).join("")}`;
  const fanous = (x, y, s = 1, glass = GOLDC) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -20v-4" stroke="${INKC}" stroke-width="1.6"/><circle cx="0" cy="-25" r="2.2" fill="none" stroke="${INKC}" stroke-width="1.4"/><path d="M-6 -14Q0 -22 6 -14Z" fill="${COPPER}" ${sw(1.4)}/><path d="M-7 -14h14l-2 4h-10z" fill="${COPPER}" ${sw(1.4)}/><path d="M-6 -10h12l-2 16h-8z" fill="${glass}" ${sw(1.4)}/><path d="M0 -10v16M-4 -10l-1 16M4 -10l1 16" stroke="${INKC}" stroke-width=".9" opacity=".7"/><path d="M-4 6h8l-4 6z" fill="${COPPER}" ${sw(1.4)}/></g>`;
  // each place is a small illustration centred on (0,0), about 180 wide and 130 tall
  const VIG = {
    tower: () => `${shadow(170)}
      <rect x="-74" y="-6" width="104" height="62" fill="${STONE}" ${sw(3)}/>${parapet(-74, -6, 104)}
      <path d="M-74 10h104M-74 26h104M-74 42h104M-56 -6v16M-30 -6v16M-4 -6v16M-44 10v16M-18 10v16M8 10v16M-56 26v16M-30 26v16M-4 26v16" stroke="#9c8660" stroke-width="1.5"/>
      ${arch(-22, 56, 26, 34, "#4a2e17")}
      <rect x="24" y="-44" width="48" height="100" rx="4" fill="${STONE}" ${sw(3)}/>${parapet(24, -44, 48)}
      <path d="M24 -20h48M24 6h48M24 32h48" stroke="#9c8660" stroke-width="1.5"/>${arch(48, -14, 12, 18, "#2a1c10")}${arch(48, 22, 12, 18, "#2a1c10")}
      <path d="M48 -51v-18" ${sw(2.5)}/><path d="M48 -69l14 5l-14 5z" fill="${TILE}" ${sw(2)}/>`,
    tea: () => `${shadow(170)}
      <rect x="-70" y="-10" width="140" height="66" fill="${WALL}" ${sw(3)}/>${parapet(-70, -10, 140)}
      ${arch(-38, 56, 30, 40)}${arch(0, 56, 30, 40, "#f6e3b4")}${arch(38, 56, 30, 40)}
      <path d="M-15 56V30M15 56V30" stroke="${INKC}" stroke-width="1.4" opacity=".6"/>
      <path d="M-74 -10 L-66 4 L66 4 L74 -10" fill="${TILE}" ${sw(2.5)}/><path d="M-52 -10v14M-34 -10v14M-16 -10v14M2 -10v14M20 -10v14M38 -10v14M56 -10v14" stroke="#fff" stroke-width="3" opacity=".45"/>
      <g transform="translate(0 -40)"><rect x="-34" y="-14" width="68" height="26" rx="5" fill="${COPPER}" ${sw(2.5)}/><g transform="translate(0 -2) scale(.85)" fill="${GOLDC}" ${sw(1.8)}><path d="M-6 -8h12l3 18h-18z"/><path d="M-6 -8q0 -6 6 -8q6 2 6 8"/><path d="M9 -2q10 -2 12 -12l3 2q-2 10 -12 16z"/><path d="M-9 0q-8 2 -8 10"/></g></g>
      <path d="M-14 -66q-6 -8 0 -16t0 -16M0 -68q-6 -8 0 -16t0 -14M14 -66q-6 -8 0 -16t0 -16" stroke="#fff" stroke-width="3" fill="none" opacity=".75" class="mf-steam"/>`,
    laundry: () => `${shadow(170)}
      <rect x="-34" y="-4" width="96" height="60" fill="${WALL}" ${sw(3)}/>${parapet(-34, -4, 96)}${arch(14, 56, 24, 36)}${mashr(-26, 10, 20, 18)}
      <path d="M-80 58V-6" ${sw(3.5)}/><path d="M-80 0Q-58 14 -34 4M-80 22Q-58 34 -34 26" fill="none" stroke="${INKC}" stroke-width="1.6"/>
      <path d="M-74 6h12v16h-4v-8h-4v8h-4z" fill="#9fd3ff" ${sw(1.6)}/><path d="M-58 9l7 1v12l-7-1z" fill="#ff9fb2" ${sw(1.6)}/><path d="M-48 8h10v10q-5 4-10 0z" fill="#ffe66d" ${sw(1.6)}/>
      <path d="M-74 28h10l-2 14h-6z" fill="#9be7a0" ${sw(1.6)}/><path d="M-58 31h12v8h-12z" fill="#fff" ${sw(1.6)}/>
      <g fill="#fff" stroke="#8cc3c8" stroke-width="1.5" class="mf-steam"><circle cx="40" cy="-30" r="6"/><circle cx="52" cy="-42" r="4"/><circle cx="30" cy="-46" r="3"/></g>
      <rect x="34" y="40" width="28" height="16" rx="3" fill="${WOOD}" ${sw(2)}/><path d="M36 40q12 -8 24 0" fill="#fff" stroke="#8cc3c8" stroke-width="2"/>`,
    market: () => `${shadow(190)}
      <path d="M-88 -30Q0 -52 88 -30" fill="none" stroke="${INKC}" stroke-width="1.6"/>${[-60, -30, 0, 30, 60].map((x, k) => fanous(x, -36 + Math.abs(x) * 0.12, 0.8, ["#e2b04a", "#2a9d8f", "#c0392b", "#e2b04a", "#2a9d8f"][k])).join("")}
      ${[-46, 46].map((x, k) => `<g transform="translate(${x} 0)"><rect x="-40" y="0" width="80" height="56" fill="${WALL}" ${sw(2.5)}/>${arch(0, 56, 60, 46, "#5a3a1c")}<path d="M-46 0 L-40 -16 H40 L46 0Z" fill="${k ? TILE : COPPER}" ${sw(2.5)}/><path d="M-28 -16v16M-12 -16v16M4 -16v16M20 -16v16M36 -16v16" stroke="#fff" stroke-width="5" opacity=".45"/>
        ${[-18, 0, 18].map((sx, j) => `<path d="M${sx - 8} 54 L${sx} ${36 + (j % 2) * 4} L${sx + 8} 54Z" fill="${["#d6402b", "#f2c12e", "#b5541f", "#9bc43a", "#e8892b", "#f2c12e"][(j + k * 3) % 6]}" ${sw(1.6)}/>`).join("")}<rect x="-26" y="50" width="52" height="6" fill="${WOOD}" ${sw(1.6)}/></g>`).join("")}`,
    bridge: () => `<path d="M-95 34Q0 50 95 34V66H-95Z" fill="${WATER}" opacity=".9"/><path d="M-80 48q10 -4 20 0M20 52q10 -4 20 0M-30 58q10 -4 20 0" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/>
      <path d="M-90 40Q0 -40 90 40L76 40Q0 -16 -76 40Z" fill="${STONE}" ${sw(3)}/><path d="M-40 40a40 34 0 0 1 80 0" fill="#5d8f95" ${sw(3)}/>
      <path d="M-86 22Q0 -52 86 22" fill="none" ${sw(3)}/><path d="M-78 -2Q0 -66 78 -2" fill="none" ${sw(3)}/>
      ${[-56, -28, 0, 28, 56].map((x) => `<path d="M${x} ${-((90 - Math.abs(x)) * 0.38) + 4}v-12" ${sw(3)}/>`).join("")}`,
    oven: () => `${shadow(170)}
      <rect x="-70" y="-6" width="140" height="62" fill="${WALL}" ${sw(3)}/>${parapet(-70, -6, 140)}
      <path d="M-60 56V24a24 24 0 0 1 48 0V56Z" fill="#b07a48" ${sw(3)}/><path d="M-50 56V34a14 14 0 0 1 28 0V56Z" fill="#2a1c10" ${sw(2.5)}/><path d="M-44 56q4 -12 8 -4q2 -10 6 -2q4 -8 6 6z" fill="#ff8a2a" class="mf-flame"/>
      <rect x="2" y="10" width="60" height="6" fill="${WOOD}" ${sw(2)}/>${[12, 30, 48].map((x) => `<ellipse cx="${x}" cy="8" rx="8" ry="4" fill="#e8b46a" ${sw(1.6)}/>`).join("")}
      <rect x="2" y="30" width="60" height="6" fill="${WOOD}" ${sw(2)}/>${[12, 30, 48].map((x) => `<ellipse cx="${x}" cy="28" rx="8" ry="4" fill="#d9a058" ${sw(1.6)}/>`).join("")}
      <rect x="-46" y="-40" width="12" height="34" fill="${STONE}" ${sw(2.5)}/><path d="M-40 -46q-8 -8 0 -16t0 -14" stroke="#9a8d7a" stroke-width="5" fill="none" opacity=".6" class="mf-steam"/>
      <g transform="translate(28 -26)"><rect x="-26" y="-12" width="52" height="22" rx="4" fill="${GOLDC}" ${sw(2.5)}/><ellipse cx="0" cy="-1" rx="15" ry="6" fill="#e8b46a" ${sw(1.8)}/><path d="M-6 -2h12M-4 1h8" stroke="${INKC}" stroke-width="1.2"/></g>`,
    lanterns: () => `${shadow(170)}
      <rect x="-66" y="-2" width="132" height="58" fill="${WALL}" ${sw(3)}/>${parapet(-66, -2, 132)}${arch(0, 56, 34, 42)}
      ${[[-50, 18], [-34, 32], [-50, 44], [34, 32], [50, 18], [50, 44], [-58, -36], [-30, -48], [30, -48], [58, -36], [0, -56]].map(([x, y], k) => fanous(x, y, k > 5 ? 1.05 : 0.95, ["#e2b04a", "#2a9d8f", "#c0392b", "#8b4fd8", "#2f6fe0", "#e8892b"][k % 6])).join("")}
      <path d="M-72 -26Q0 -78 72 -26" fill="none" stroke="${INKC}" stroke-width="1.6"/>`,
    cave: () => `${shadow(180)}
      <path d="M-92 58L-64 -20L-40 -6L-14 -62L18 -30L40 -58L70 -10L92 58Z" fill="#a39678" ${sw(3)}/><path d="M-64 -20L-56 0M-40 -6L-30 18M70 -10L60 14M18 -30L24 -10" stroke="#7d7258" stroke-width="2"/>
      <path d="M-34 58Q-36 4 0 -4Q36 4 34 58Z" fill="#2a1d14" ${sw(3)}/><ellipse cx="0" cy="36" rx="22" ry="20" fill="${GOLDC}" opacity=".35" class="mf-glow"/>
      <rect x="-3" y="34" width="6" height="16" fill="#fff6dc" ${sw(1.5)}/><path d="M0 26q5 4 0 8q-5 -4 0 -8z" fill="#ffb02e" class="mf-flame"/>
      <path d="M-80 58q20 -10 30 0M50 58q20 -12 32 0" fill="${PALM}" ${sw(2)}/>`,
    gate: () => `<ellipse cx="0" cy="44" rx="118" ry="22" fill="#5a3d1d" opacity=".16"/>
      <path d="M-104 20 L-74 2 H74 L104 20 L74 38 H-74Z" fill="${TILE}" ${sw(3)}/><path d="M-90 20 L-66 8 H66 L90 20 L66 32 H-66Z" fill="#8cc3c8" ${sw(2)}/>
      <path d="M-104 20v12L-74 50H74L104 32V20L74 38H-74Z" fill="${TEAL}" ${sw(3)}/>${[-60, -30, 0, 30, 60].map((x) => `<path d="M${x - 8} 44l8 -5l8 5l-8 5z" fill="${GOLDC}" ${sw(1.2)}/>`).join("")}
      <rect x="-8" y="-24" width="16" height="40" fill="${STONE}" ${sw(2.5)}/><path d="M-22 -24h44l-6 -8h-32z" fill="${STONE}" ${sw(2.5)}/>
      <g fill="none" stroke="#bfe6ea" stroke-width="4" stroke-linecap="round"><path d="M-4 -34q-20 -20 -40 40"/><path d="M4 -34q20 -20 40 40"/><path d="M0 -34v-14"/></g>`,
  };

  // ---------- the places: eight round the fountain square. A ticket (or a scanned card) opens any door ----------
  // Every witness knows one feature only, so picking a door is picking the feature you need next.
  const MAP = { W: 1350, H: 1000, cx: 675, cy: 470, rx: 470, ry: 318 };
  const CITY = [
    { n: "القلعة", role: "w", tr: "head", art: "tower", who: "حارس السور" },
    { n: "المقهى", role: "w", tr: "stache", art: "tea", who: "القهوجي" },
    { n: "المغسلة", role: "w", tr: "color", art: "laundry", who: "الغسّال" },
    { n: "السوق", role: "spy", art: "market", who: "المُخبِر" },
    { n: "الجسر الحجري", role: "w", tr: "scar", art: "bridge", who: "الصيّاد" },
    { n: "الفرن", role: "w", tr: "glasses", art: "oven", who: "الخبّاز" },
    { n: "محل الفوانيس", role: "scene", art: "lanterns", who: "صاحب المحل" },
    { n: "مغارة الحكيم", role: "sage", art: "cave", who: "الحكيم" },
  ].map((p, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 4; return { ...p, i, x: MAP.cx + MAP.rx * Math.cos(a), y: MAP.cy + MAP.ry * Math.sin(a) }; });
  const HOME = ["الدرج", "المجلس", "غرفة الغسيل", "المخزن", "الحوش", "المطبخ", "المدخل", "الملحق"];
  const SPOTS = ["تحت آخر درجة", "خلف المركى الكبير", "داخل سلة الغسيل", "فوق رف العلب", "عند حوض الزرع", "في درج الملاعق", "خلف باب المدخل", "تحت المخدة"];
  const placeName = (i, mode) => (mode === "house" ? HOME[i] : CITY[i].n);
  const whoOf = (i, mode) => { const p = CITY[i]; if (p.role === "sage") return "الحكيم"; if (p.role === "spy") return "المُخبِر"; return mode === "house" ? `بطاقة ${HOME[i]}` : p.who; };
  const isW = (i) => CITY[i].role === "w" || CITY[i].role === "scene";
  const roleOf = (i) => CITY[i].role;
  const SAGE = CITY.findIndex((p) => p.role === "sage"), SPY = CITY.findIndex((p) => p.role === "spy"), SHOP = CITY.findIndex((p) => p.role === "scene");
  const WITNESS = CITY.filter((p) => isW(p.i)).map((p) => p.i);
  const TRAITS = ["glasses", "stache", "scar", "head", "color"];
  const TRAIT_N = { glasses: "النظارة", stache: "الشنب", scar: "الجرح", head: "غطاء الرأس", color: "لون الورقة" };
  const SIZE = { glasses: 2, stache: 2, scar: 2, head: 3, color: 4 };
  const COLORS = [{ n: "صفراء", hex: "#ffe66d" }, { n: "وردية", hex: "#ff9fb2" }, { n: "زرقاء", hex: "#9fd3ff" }, { n: "خضراء", hex: "#9be7a0" }];
  const traitOf = (i, shopTr) => (CITY[i].role === "scene" ? shopTr : CITY[i].tr);
  // what a place knows, said on the map and on the phones
  function knows(i, c) {
    const p = CITY[i];
    if (p.role === "w") return `يعرف ${TRAIT_N[p.tr]}`;
    if (p.role === "scene") return `شاهد السرقة، يعرف ${TRAIT_N[c.shopTr] || "صفة"}`;
    if (p.role === "sage") return c.lie ? "يكشف الشاهد الكذّاب" : "يأكّد إن الكل صادق";
    return "يعرف وين يختبي اللص";
  }

  // ---------- the board ----------
  function boardSVG(c, id = "b", dots = null) {
    const lab = 27, { W, H, cx, cy } = MAP;
    let g = `<defs>
      <radialGradient id="${id}vig" cx=".5" cy=".5" r=".7"><stop offset=".55" stop-color="#f3e3c0" stop-opacity="0"/><stop offset="1" stop-color="#8a5a24" stop-opacity=".45"/></radialGradient>
      <pattern id="${id}cob" width="18" height="12" patternUnits="userSpaceOnUse"><rect width="18" height="12" fill="#dcc79a"/><path d="M0 6h18M9 0v6M0 12V6M18 12V6" stroke="#c3ab7a" stroke-width="1.4"/></pattern>
    </defs><rect width="${W}" height="${H}" fill="#f3e3c0"/>`;
    g += `<path d="M-10 250 L60 150 L120 200 L190 90 L260 170 L300 130 L360 220 L-10 260Z" fill="#d6c49c" opacity=".7"/>`;
    g += [[1120, 130], [1230, 160], [1180, 90]].map(([x, y], k) => `<g transform="translate(${x} ${y}) scale(${k === 2 ? 0.8 : 1})" fill="#cdb88c" opacity=".7"><rect x="-26" y="0" width="52" height="40"/><path d="M-22 0a22 22 0 0 1 44 0z"/></g>`).join("") + `<g transform="translate(1290 100)" fill="#cdb88c" opacity=".7"><rect x="-6" y="0" width="12" height="80"/><path d="M-9 0h18l-9 -18z"/></g>`;
    g += [[120, 560], [1240, 600], [1240, 320], [520, 300], [860, 660]].map(([x, y], k) => `<g transform="translate(${x} ${y}) scale(${k > 2 ? 0.6 : 1})" fill="none" stroke="#c9a970" stroke-width="3" opacity=".55"><path d="M-40 0a14 14 0 0 1 22 -12a18 18 0 0 1 34 4a12 12 0 0 1 18 8z"/></g>`).join("");
    g += `<path d="M-10 900 C 200 850 360 960 600 910 S 1000 830 1360 910 L1360 1010 L-10 1010Z" fill="${WATER}" opacity=".55"/><path d="M60 935q20 -6 40 0M300 950q20 -6 40 0M900 920q20 -6 40 0M1150 930q20 -6 40 0" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>`;
    g += [[1280, 380], [70, 400], [1280, 760], [420, 930], [960, 120], [380, 120]].map(([x, y]) => `<g transform="translate(${x} ${y})"><path d="M0 34 Q-3 10 2 -8" stroke="#7a5230" stroke-width="5" fill="none"/><g fill="${PALM}" opacity=".9"><path d="M2 -8q-18 -6 -30 6q14 -4 30 -2z"/><path d="M2 -8q18 -8 30 4q-14 -4 -30 0z"/><path d="M2 -8q-8 -16 -22 -18q12 6 20 20z"/><path d="M2 -8q8 -16 22 -16q-12 6 -20 18z"/></g></g>`).join("");
    for (const p of CITY) {
      const mx = (cx + p.x) / 2 + (p.y - cy) * 0.12, my = (cy + p.y) / 2 - (p.x - cx) * 0.12;
      const d = `M${cx} ${cy}Q${mx.toFixed(1)} ${my.toFixed(1)} ${p.x.toFixed(1)} ${(p.y + 30).toFixed(1)}`;
      g += `<path d="${d}" fill="none" stroke="#8a6c40" stroke-width="40" stroke-linecap="round" opacity=".2"/><path d="${d}" fill="none" stroke="url(#${id}cob)" stroke-width="32" stroke-linecap="round" opacity=".75"/>`;
    }
    g += `<g transform="translate(${cx} ${cy - 30}) scale(.68)">${VIG.gate()}</g>`;
    g += `<g transform="translate(${cx} ${cy + 50})"><rect x="${-lab * 2.3}" y="${-lab * 0.72}" width="${lab * 4.6}" height="${lab * 1.25}" rx="${lab * 0.25}" fill="${TEAL}" ${sw(2.5)}/><text y="${lab * 0.3}" text-anchor="middle" font-family="Lalezar, sans-serif" font-size="${lab}" fill="#ffc933">الساحة</text></g>`;
    for (const p of CITY) {
      const plain = isW(p.i);
      g += `<g class="mf-vig" data-place="${p.i}" transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(.92)">${VIG[p.art]()}</g>`;
      const ly = p.y + 64, tw = p.n.length * lab * 0.52 + 24;
      g += `<g transform="translate(${p.x.toFixed(1)} ${ly.toFixed(1)})"><rect x="${-tw / 2}" y="${-lab * 0.72}" width="${tw}" height="${lab * 1.25}" rx="${lab * 0.25}" fill="${plain ? "#fff8e6" : TEAL}" ${sw(2.5)}/><text y="${lab * 0.3}" text-anchor="middle" font-family="Lalezar, sans-serif" font-size="${lab}" fill="${plain ? INKC : "#fff8e6"}">${p.n}</text></g>`;
      g += `<text x="${p.x.toFixed(1)}" y="${(ly + 40).toFixed(1)}" stroke="#f3e3c0" stroke-width="7" paint-order="stroke" text-anchor="middle" font-family="IBM Plex Sans Arabic, sans-serif" font-weight="700" font-size="20" fill="${TEAL_D}">${knows(p.i, c)}</text>`;
      g += `<g class="mf-seen" data-seen="${p.i}" transform="translate(${p.x.toFixed(1)} ${(ly + 68).toFixed(1)})">${dots ? dots(p.i) : ""}</g>`;
    }
    g += `<rect width="${W}" height="${H}" fill="url(#${id}vig)" pointer-events="none"/><g class="mf-pawns"></g><g class="mf-pops"></g>`;
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="خريطة المدينة" style="direction:ltr">${g}</svg>`;
  }
  // the floor plan for «في البيت»: eight rooms round the living room, where the TV and the detectives are
  const ROOMS = [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [1, 2], [0, 2], [0, 1]].map(([c, r]) => ({ x: 60 + c * 420, y: 50 + r * 305, w: 390, h: 280 }));
  const roomAnchor = (i) => { const R = ROOMS[i]; return { x: R.x + 140, y: R.y + 190 }; };
  function houseSVG(c, dots = null) {
    const { W, H } = MAP;
    let g = `<rect width="${W}" height="${H}" fill="#efe0bd"/><rect x="40" y="30" width="${W - 80}" height="${H - 60}" rx="18" fill="#e3cfa2" ${sw(6)}/>`;
    ROOMS.forEach((R, i) => {
      const kn = knows(i, c).split("، ");
      g += `<g class="mf-room" data-room="${i}"><rect x="${R.x}" y="${R.y}" width="${R.w}" height="${R.h}" rx="12" fill="${isW(i) ? "#fbf1d9" : "#d8ece9"}" ${sw(4)}/>
        <path d="M${R.x + R.w / 2 - 40} ${R.y + (i < 3 ? R.h : 0)}h80" stroke="#e3cfa2" stroke-width="8"/>
        <g transform="translate(${R.x + R.w - 92} ${R.y + R.h / 2 + 10}) scale(.62)">${VIG[CITY[i].art]()}</g>
        <text x="${R.x + 140}" y="${R.y + 66}" text-anchor="middle" font-family="Lalezar, sans-serif" font-size="46" fill="${INKC}">${HOME[i]}</text>
        ${kn.map((l, k) => `<text x="${R.x + 140}" y="${R.y + 104 + k * 28}" text-anchor="middle" font-family="IBM Plex Sans Arabic, sans-serif" font-weight="700" font-size="23" fill="${TEAL_D}">${l}</text>`).join("")}
        <g class="mf-seen" data-seen="${i}" transform="translate(${R.x + 140} ${R.y + R.h - 28})">${dots ? dots(i) : ""}</g></g>`;
    });
    const S = { x: 480, y: 355, w: 390, h: 280 };
    g += `<rect x="${S.x}" y="${S.y}" width="${S.w}" height="${S.h}" rx="12" fill="#f6e7c4" ${sw(4)}/><rect x="${S.x + 115}" y="${S.y + 30}" width="160" height="92" rx="8" fill="#1b1622" ${sw(4)}/><path d="M${S.x + 175} ${S.y + 122}l-10 18h60l-10 -18" fill="#5a3d1d"/>
      <text x="${S.x + S.w / 2}" y="${S.y + 182}" text-anchor="middle" font-family="Lalezar, sans-serif" font-size="40" fill="${INKC}">الصالة</text>
      <text x="${S.x + S.w / 2}" y="${S.y + 214}" text-anchor="middle" font-family="IBM Plex Sans Arabic, sans-serif" font-weight="700" font-size="20" fill="${TEAL_D}">التلفزيون والمحققين</text>`;
    g += `<g class="mf-pawns"></g><g class="mf-pops"></g>`;
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="مخطط البيت" style="direction:ltr">${g}</svg>`;
  }
  // where a team's lantern stands: in the square (or the living room) until it visits somewhere
  function pawnXY(loc, k, n, mode) {
    const dx = (k - (n - 1) / 2) * (mode === "house" ? 40 : 34);
    if (mode === "house") { if (loc == null || loc < 0) return { x: 675 + dx, y: 600 }; const a = roomAnchor(loc); return { x: a.x + dx, y: a.y - 15 }; }
    if (loc == null || loc < 0) return { x: MAP.cx + dx, y: MAP.cy + 112 };
    const p = CITY[loc]; return { x: p.x + dx, y: p.y + 14 };
  }
  const popXY = (i, mode) => (mode === "house" ? roomAnchor(i) : CITY[i]);

  // a team's piece: a big Arab lantern with glass in the team's colour (bars over it while suspended)
  const pawnArt = (hx, jail) => `<g class="mf-pwn"><ellipse cx="0" cy="34" rx="18" ry="6" fill="#000" opacity=".22"/><circle cx="0" cy="-37" r="4" fill="none" stroke="${INKC}" stroke-width="2.5"/><path d="M-12 -24Q0 -38 12 -24Z" fill="${COPPER}" ${sw(2.5)}/><path d="M-15 -24h30l-4 6h-22z" fill="${COPPER}" ${sw(2.5)}/><path d="M-13 -18h26l-4 32h-18z" fill="${hx}" ${sw(2.5)}/><path d="M0 -18v32M-7 -18l-2 32M7 -18l2 32" stroke="${INKC}" stroke-width="1.6" opacity=".7"/><path d="M-5 -14q2 10 0 20" stroke="#fff" stroke-width="3" opacity=".4" fill="none"/><path d="M-9 14h18l-9 12z" fill="${COPPER}" ${sw(2.5)}/>${jail ? `<path d="M-18 -22v40M-6 -26v48M6 -26v48M18 -22v40" stroke="${INKC}" stroke-width="3.5"/>` : ""}</g>`;
  const lantern = (hx, cls = "mf-lan") => `<svg class="${cls}" viewBox="-24 -40 48 78" aria-hidden="true">${pawnArt(hx, false)}</svg>`;
  const vigSVG = (art, w = 18) => `<svg viewBox="-100 -100 200 170" style="width:${w}cqw;height:${w * 0.85}cqw;overflow:visible" aria-hidden="true">${VIG[art]()}</svg>`;
  const miniVig = (art, w = 46) => `<svg class="mf-mv" viewBox="-100 -100 200 170" style="width:${w}px;height:${Math.round(w * 0.85)}px;overflow:visible;flex:none" aria-hidden="true">${VIG[art]()}</svg>`;

  // ---------- faces: the suspects are sticky notes, like everyone in فسحة ----------
  const SCAR = '<path d="M58 53q9 3 15 13" stroke="#9b2a1c" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M63 53.5l-1.5 4.5M68 57l-2.5 3.5" stroke="#9b2a1c" stroke-width="2" stroke-linecap="round"/>';
  const TARBOUSH = '<path d="M30 30L33 4H67L70 30Z" fill="#b3261e" stroke="#6e1410" stroke-width="2.5" stroke-linejoin="round"/><path d="M33 4H67" stroke="#6e1410" stroke-width="3"/><path d="M50 4q14 2 18 18" stroke="#111" stroke-width="3" fill="none"/><circle cx="68" cy="23" r="3.4" fill="#111"/>';
  const TURBAN = '<path d="M12 33Q8 2 50 0Q92 2 88 33Q50 22 12 33Z" fill="#f4efe2" stroke="#9a8a66" stroke-width="2.5" stroke-linejoin="round"/><path d="M18 24Q50 6 82 24M14 30Q40 14 72 12" stroke="#c8b890" stroke-width="2.5" fill="none"/>';
  const ok = (v, n) => (Number.isInteger(v) && v >= 0 && v < n ? v : 0);
  function sFace(s, size, extra = "") {
    const head = s.head === 1 ? TARBOUSH : s.head === 2 ? TURBAN : "";
    const eyes = s.glasses ? HATS[4].s : EYES[ok(s.eye, EYES.length)].s;
    const mouth = s.stache ? MOUTHS[4].s : MOUTHS[[0, 2, 3, 1][ok(s.mouth, 4)]].s;
    const tilt = Math.max(-6, Math.min(6, Number(s.tilt) || 0));
    return `<svg class="av mf-face" viewBox="0 0 100 100" width="${size}" height="${size}" ${extra} aria-hidden="true"><g transform="rotate(${tilt} 50 50)"><path d="M12 12h76v64L74 90H12z" fill="${COLORS[ok(s.color, 4)].hex}"/><path d="M88 76L74 90V76z" fill="rgba(0,0,0,.2)"/><path d="M12 12h76v7H12z" fill="rgba(0,0,0,.07)"/>${eyes}${mouth}${s.scar ? SCAR : ""}${head}</g></svg>`;
  }
  const XMARK = '<svg class="mf-x" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M14 14L86 86M86 14L14 86" stroke="#e5484d" stroke-width="7" stroke-linecap="round" fill="none"/></svg>';
  const TICKET = '<svg class="mf-tk" viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 7h19v3.2a1.8 1.8 0 0 0 0 3.6V17h-19v-3.2a1.8 1.8 0 0 0 0-3.6z" fill="currentColor" stroke="#1b2a4a" stroke-width="1.6" stroke-linejoin="round"/><path d="M15.5 7.6v8.8" stroke="#1b2a4a" stroke-width="1.4" stroke-dasharray="1.6 1.6"/></svg>';
  const tickets = (n, cls = "") => Array.from({ length: Math.max(0, n) }, () => TICKET.replace('class="mf-tk"', `class="mf-tk ${cls}"`)).join("");
  const CHECK = '<svg class="mf-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const CROSS = '<svg class="mf-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/></svg>';
  const PIN = '<svg class="mf-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22c-5-7-7-10-7-13a7 7 0 0 1 14 0c0 3-2 6-7 13z" fill="#e5484d" stroke="#1b2a4a" stroke-width="2"/><circle cx="12" cy="9" r="2.6" fill="#fff6dc"/></svg>';

  // ---------- the statements ----------
  const fits = (s, st) => (st.pos ? s[st.t] === st.v : s[st.t] !== st.v);
  function say(st) {
    const { t, v, pos } = st;
    if (t === "glasses") return v ? ["كان لابس نظارة سوداء، أنا متأكد.", "بنظارة"] : ["ما كان لابس نظارة، شفت عيونه زين.", "بلا نظارة"];
    if (t === "stache") return v ? ["له شنب، شفته وهو يركض.", "بشنب"] : ["وجهه حليق، ما له شنب.", "بلا شنب"];
    if (t === "scar") return v ? ["في خدّه جرح قديم.", "بجرح"] : ["وجهه سليم، ما فيه جرح.", "بلا جرح"];
    if (t === "head") {
      if (pos) return [["كان راسه مكشوف.", "لابس طربوش أحمر.", "لابس عمامة بيضاء."][v], ["راسه مكشوف", "طربوش", "عمامة"][v]];
      return [["كان لابس شي على راسه، ما انتبهت وش هو.", "اللي أذكره إنه ما كان لابس طربوش.", "أكيد ما كان لابس عمامة."][v], ["على راسه شي", "مو طربوش", "مو عمامة"][v]];
    }
    const c = COLORS[v].n;
    return pos ? [`ورقته ${c}، لمعت تحت الفانوس.`, `ورقة ${c}`] : [`ورقته مو ${c}، هذا أكيد.`, `مو ${c}`];
  }
  const NAMES = ["أبو كريم", "سليم", "بدر", "عمر", "حمدي", "ناصر", "ياسين", "فيصل", "عبدالله", "مراد", "خالد", "طارق", "مصطفى", "رشيد", "يوسف", "سامي"];
  const CASES = [
    { t: "سرقة الفانوس الذهبي", d: "قبل الفجر اختفى الفانوس الذهبي من محل الفوانيس. اثنعش واحد كانوا في السوق تلك الليلة، وواحد منهم هو اللص.",
      h: "قبل الفجر اختفى الفانوس الذهبي من المدخل. اثنعش واحد كانوا في البيت تلك الليلة، وواحد منهم هو اللص، وهو للحين مختبي في وحدة من الغرف." },
    { t: "إبريق السلطان", d: "اختفى إبريق القهوة اللي ما يُقدَّم إلا للسلطان من المقهى في نص الحفلة. الشهود منتشرين في المدينة، وكل واحد شاف شي.",
      h: "إبريق القهوة اللي ما يطلع إلا للضيوف الكبار اختفى من المدخل في نص العزيمة. الشهود في كل غرفة، وكل واحد شاف شي." },
    { t: "صينية الكنافة المفقودة", d: "انطلبت صينية كنافة كبيرة لعرس الليلة، ووصل الصندوق فاضي. واحد أكلها كلها، وهو الحين مختبي في المدينة.",
      h: "صينية كنافة كبيرة وصلت للعزيمة وانحطت عند المدخل، وبعد دقايق الصندوق فاضي. واحد أكلها كلها، وهو الحين مختبي في وحدة من الغرف." },
  ];
  const R = (n) => Math.floor(Math.random() * n);
  const one = (a) => a[R(a.length)];
  const mix = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = R(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  // Five true statements (one per feature) that name exactly one suspect, and no three of them are enough.
  // محل الفوانيس repeats one feature; in the normal game one of those two lies, so that one other suspect looks guilty.
  function makeCase(lie = true) {
    for (let tries = 0; tries < 20000; tries++) {
      const pool = new Set(), sus = [];
      while (sus.length < 12) {
        const s = { glasses: R(2), stache: R(2), scar: R(2), head: R(3), color: R(4) };
        const k = TRAITS.map((t) => s[t]).join("");
        if (pool.has(k)) continue; pool.add(k); sus.push(s);
      }
      const C = R(12), cs = sus[C];
      const T = TRAITS.map((t) => {
        if (SIZE[t] > 2 && Math.random() < 0.35) { const other = mix([...Array(SIZE[t]).keys()].filter((v) => v !== cs[t]))[0]; return { t, v: other, pos: false }; }
        return { t, v: cs[t], pos: true };
      });
      if (sus.filter((s) => T.every((st) => fits(s, st))).length !== 1) continue;
      let easy = false;
      for (let a = 0; a < 5 && !easy; a++) for (let b = a + 1; b < 5 && !easy; b++) for (let c = b + 1; c < 5 && !easy; c++) if (sus.filter((s) => [T[a], T[b], T[c]].every((st) => fits(s, st))).length === 1) easy = true;
      if (easy || T.some((st) => sus.every((s) => fits(s, st)))) continue;
      let L = null, decoy = -1;
      if (lie) {
        for (const k of mix([0, 1, 2, 3, 4])) {
          const t = TRAITS[k], cands = [];
          for (let v = 0; v < SIZE[t]; v++) if (v !== cs[t]) cands.push({ t, v, pos: true });
          for (const cand of mix(cands)) {
            const rest = T.filter((x) => x.t !== t), D = sus.map((s, i) => i).filter((i) => i !== C && rest.every((st) => fits(sus[i], st)) && fits(sus[i], cand));
            const others = sus.map((s, i) => i).filter((i) => i !== C && !D.includes(i) && [...T, cand].filter((st) => !fits(sus[i], st)).length === 1);
            if (D.length === 1 && others.length === 0) { L = cand; decoy = D[0]; break; }
          }
          if (L) break;
        }
        if (!L) continue;
      }
      const names = mix(NAMES).slice(0, 12);
      sus.forEach((s, i) => Object.assign(s, { id: i, name: names[i], eye: R(6), mouth: R(4), tilt: one([-4, -2, 2, 4]) }));
      const W = {}, tOf = (t) => ({ ...T[TRAITS.indexOf(t)] });
      for (const p of CITY) if (p.role === "w") W[p.i] = tOf(p.tr);
      const shopTr = lie ? L.t : one(TRAITS);
      let liarAt = -1;
      W[SHOP] = tOf(shopTr);
      if (lie) { const own = CITY.find((p) => p.tr === shopTr).i; liarAt = Math.random() < 0.5 ? SHOP : own; W[liarAt] = { ...L }; }
      const hide = one(WITNESS.filter((i) => i !== liarAt));
      return { story: R(CASES.length), sus, thief: C, decoy, W, liarAt, hide, lie, shopTr };
    }
    return null;
  }

  // ---------- the animated explainer: plays on the TV while people join (and on a phone, on request) ----------
  const DEMO = (() => {
    const want = [[1, 1, 0, 1, 0], [0, 0, 0, 2, 1], [1, 0, 1, 0, 2], [0, 1, 0, 1, 3], [1, 1, 1, 2, 1], [0, 0, 1, 0, 0], [1, 0, 0, 1, 3], [0, 1, 1, 2, 2], [0, 0, 0, 1, 0], [1, 1, 0, 0, 2], [0, 1, 0, 2, 3], [1, 0, 1, 1, 1]];
    return { sus: want.map(([g, st, sc, h, c], i) => ({ glasses: g, stache: st, scar: sc, head: h, color: c, id: i, name: NAMES[i], eye: i % 6, mouth: i % 4, tilt: [-4, 2, -2, 4][i % 4] })), thief: 4 };
  })();
  const lanternBig = (hx = "#e2b04a", s = 1) => `<svg viewBox="-24 -40 48 78" style="width:${6 * s}cqw;height:${9.75 * s}cqw;overflow:visible" aria-hidden="true">${pawnArt(hx, false)}</svg>`;
  const faceCq = (s, w) => sFace(s, 100).replace('width="100" height="100"', `style="width:${w}cqw;height:${w}cqw"`);
  function fakeQR() {
    let s = "";
    const fixed = (x, y) => (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
    for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) if (!fixed(x, y) && (x * 7 + y * 13 + x * y) % 5 < 2) s += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    const eye = (x, y) => `<rect x="${x + 0.5}" y="${y + 0.5}" width="6" height="6" fill="none" stroke="#1b2a4a" stroke-width="1"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
    return `<svg viewBox="0 0 21 21" width="100%" height="100%" fill="#1b2a4a">${s}${eye(0, 0)}${eye(14, 0)}${eye(0, 14)}</svg>`;
  }
  const LIGHTS = `<svg class="mf-lights" viewBox="0 0 1000 90" preserveAspectRatio="none" aria-hidden="true"><path d="M0 10 Q250 70 500 20 T1000 14" fill="none" stroke="#0c2d33" stroke-width="2"/>${[60, 160, 270, 380, 500, 620, 730, 840, 940].map((x, k) => { const y = 10 + Math.sin((x / 1000) * Math.PI * 2) * 22 + 26; return `<g transform="translate(${x} ${y})"><g class="mf-sway" style="animation-duration:${2 + (k % 3) * 0.4}s">${fanous(0, 6, 1.5, ["#ffc933", "#2a9d8f", "#e5484d"][k % 3])}</g></g>`; }).join("")}</svg>`;
  function scenes(mode) {
    const wrong = mode === "house" ? "والاتهام الغلط يوقفكم دقيقتين." : "والاتهام الغلط يوقفكم جولتين بدون تذاكر.";
    const all = [
      { t: "القضية", d: 9500, say: "انسرق الفانوس الذهبي! واللص واحد من ١٢ مشتبه. مهمتكم تعرفون <b>مين هو</b>، و<b>وين يختبي</b>.",
        h: () => `<div class="ap" style="top:14cqw;left:50%;margin-left:-6cqw;animation:mfPop .5s both, mfVanish .6s 1.6s ease-in both">${lanternBig("#ffc933", 2)}</div>
          <div class="ap" style="top:18cqw;left:50%;margin-left:-11cqw;animation:mfPop .5s 2s both, mfVanish .4s 3.2s forwards"><span class="stamp" style="font-size:4.6cqw">انسرق!</span></div>
          <div class="af" style="top:12cqw;inset-inline:12cqw;animation-delay:3.4s"><div class="big-t">واحد من هالـ١٢ هو اللص</div><div class="sgrid">${DEMO.sus.map((s, k) => `<div class="s" style="animation-delay:${3.6 + k * 0.12}s">${sFace(s, 80)}</div>`).join("")}</div></div>` },
      { t: "الصفات", d: 10500, say: "المشتبهين يختلفون في <b>٥ صفات</b>. الشهود يوصفونها، وأنتم تشطبون اللي ما يطابق.",
        h: () => { const s = DEMO.sus[4]; const call = (txt, top, side, delay) => `<div class="callout ${side}" style="top:${top}cqw;${side === "r" ? "right:60cqw" : "left:60cqw"};animation-delay:${delay}s">${txt}</div>`;
          return `<div class="ap" style="top:9cqw;left:50%;margin-left:-11cqw;width:22cqw">${faceCq(s, 22)}</div>${call("غطاء الراس: طربوش، عمامة، أو لا شي", 11, "r", 1)}${call("نظارة؟", 17, "l", 2.2)}${call("جرح في الخد؟", 22, "l", 3.4)}${call("شنب؟", 27, "r", 4.6)}${call("لون الورقة", 32, "r", 5.8)}`; } },
      { only: "couch", t: "الجولة", d: 12500, say: "كل جولة <b>سؤال للكل</b>. الجواب الصح يعطيكم <b>تذكرة تحقيق</b>، وأسرع فريق يصيب ياخذ <b>تذكرتين</b>. والغلط: بدون تذكرة.",
        h: () => `<div class="mini" style="top:10cqw;right:4cqw;width:27cqw"><h4>١ سؤال للكل</h4><b style="font-size:1.4cqw">أي دولة عربية فيها الأهرامات؟</b><div class="o">العراق</div><div class="o g">مصر</div><div class="o">ليبيا</div></div>
          <div class="mini" style="top:10cqw;right:35cqw;width:27cqw;animation-delay:3s"><h4>٢ النتيجة</h4><div class="o g">صح: تذكرة</div><div class="o g" style="animation:mfPop .4s 4.4s both, mfOk .4s 4.6s both">الأسرع: تذكرتين</div><div class="o" style="animation:mfPop .4s 5.4s both">غلط: بدون تذكرة</div></div>
          <div class="mini" style="top:10cqw;right:66cqw;width:30cqw;animation-delay:6.4s"><h4>٣ اصرفوها</h4><div style="display:flex;align-items:center;justify-content:center;gap:1.4cqw;color:#ffc933"><span style="width:6cqw;height:6cqw;display:block;animation:mfPop .5s 7.2s both">${TICKET}</span><b style="font-family:Lalezar;font-size:3cqw;color:#1b2a4a">←</b>${vigSVG("tea", 10)}</div><b style="font-size:1.4cqw;text-align:center">تذكرة = زيارة مكان واحد، أي مكان تختارونه</b></div>` },
      { t: mode === "house" ? "وين تدوّرون؟" : "وين تروحون؟", d: 12000, say: mode === "house" ? "كل غرفة فيها <b>بطاقة شاهد</b>، وكل شاهد <b>يعرف صفة وحدة</b>. تبون الشنب؟ دوّروا في <b>المجلس</b>." : "ما فيه مشي ولا خانات. <b>كل مكان يعرف صفة وحدة</b>. تبون الشنب؟ روحوا <b>المقهى</b>. النظارة؟ <b>الفرن</b>.",
        h: () => `<div class="af" style="top:11cqw;inset-inline:3cqw;display:grid;grid-template-columns:repeat(5,1fr);gap:1cqw;animation:none">${CITY.filter((p) => p.role === "w").map((p, k) => `<div style="display:grid;justify-items:center;gap:.5cqw;animation:mfPop .5s ${0.3 + k * 0.6}s both">${vigSVG(p.art, 15)}<b class="pn">${placeName(p.i, mode)}</b><span class="pk">يعرف ${TRAIT_N[p.tr]}</span></div>`).join("")}</div>` },
      { t: "المراحل", d: 11000, say: "التحقيق <b>٣ مراحل</b>: اجمعوا الشهادات، بعد ٣ شهادات يفتح <b>الحكيم</b>، وبعده <b>المُخبِر</b>، وبعدها تقدرون تتّهمون.",
        h: () => `<div class="ap" style="top:12cqw;inset-inline:4cqw;display:grid;grid-template-columns:repeat(4,1fr);gap:2.4cqw;animation:none">${[["الشهود", "laundry", "٣ شهادات أو أكثر"], ["الحكيم", "cave", "يكشف الكذّاب"], ["المُخبِر", "market", "يعرف المخبأ"], ["الاتهام", "gate", "اللص ومكانه"]].map(([n, a, d], k) => `<div class="stg" style="animation:mfPop .5s ${0.4 + k * 1.5}s both"><span class="num">${AR(k + 1)}</span>${vigSVG(a, 13)}<b>${n}</b><span>${d}</span></div>`).join("")}</div>` },
      { t: "الشهود", d: 12000, say: "الشاهد يكلّم <b>جوالات فريقكم بس</b>. الفرق الثانية تشوف إنكم رحتم، بدون ما تعرف وش سمعتم. وكل شهادة تشطب لكم مشتبهين.",
        h: () => `<div class="ap" style="top:13cqw;right:6cqw">${vigSVG("oven", 22)}</div><div class="ap" style="top:24cqw;right:13cqw;animation-delay:.6s">${lanternBig("#2f6fe0", 0.7)}</div>
          <div class="xbub" style="top:8cqw;right:16cqw;animation-delay:1.6s">«كان لابس نظارة سوداء»</div>
          <div class="af" style="top:11cqw;left:4cqw;width:44cqw;animation-delay:2.6s"><div class="sgrid">${DEMO.sus.map((s, k) => `<div class="s ${s.glasses ? "" : "dim"}" style="animation-delay:${s.glasses ? 0 : 4 + k * 0.18}s, ${4 + k * 0.18}s">${sFace(s, 80)}${s.glasses ? "" : `<svg class="x" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M14 14L86 86M86 14L14 86" stroke="#e5484d" stroke-width="8" stroke-linecap="round" fill="none" style="animation-delay:${4 + k * 0.18}s"/></svg>`}</div>`).join("")}</div></div>` },
      { t: "الكذّاب والحكيم", d: 12500, say: `<b>${placeName(6, mode)}</b> يعرف نفس صفة مكان ثاني. إذا اختلفوا، <b>واحد منهم يكذب</b>، و<b>الحكيم</b> يقول لكم مين.`,
        h: () => `<div class="ap" style="top:15cqw;right:5cqw">${vigSVG("tea", 17)}</div><div class="xbub lie" style="top:9cqw;right:8cqw;animation-delay:.8s">«له شنب»</div>
          <div class="ap" style="top:15cqw;right:40cqw;animation-delay:1.4s">${vigSVG("lanterns", 17)}</div><div class="xbub" style="top:9cqw;right:42cqw;animation-delay:2s">«ما له شنب»</div>
          <div class="ap qm" style="top:15cqw;right:27cqw;animation-delay:3s">؟</div>
          <div class="ap" style="top:15cqw;left:5cqw;animation-delay:4.6s">${vigSVG("cave", 19)}</div><div class="xbub" style="top:8.5cqw;left:3cqw;animation-delay:5.6s">«شاهد ${placeName(1, mode)} يكذب»</div>
          <div class="ap" style="top:19cqw;right:7cqw;animation-delay:7.4s"><span class="stamp">كذّاب</span></div>` },
      { t: "المُخبِر", d: 9500, say: `بعد الحكيم يفتح <b>المُخبِر</b> ${mode === "house" ? "في المخزن" : "في السوق"}: يعرف <b>وين يختبي</b> اللص، وما يكذب أبد.`,
        h: () => `<div class="ap" style="top:14cqw;right:8cqw">${vigSVG("market", 24)}</div><div class="xbub" style="top:8cqw;right:14cqw;animation-delay:1.2s">«يختبي في ${placeName(5, mode)}. لا تقول إني قلت لك»</div>
          <div class="ap" style="top:14cqw;left:10cqw;animation-delay:3s">${vigSVG("oven", 24)}</div>
          <div class="ap" style="top:9cqw;left:20cqw;animation:mfPop .5s 3.8s both, mfBounce .6s 4.3s infinite alternate"><svg viewBox="0 0 40 52" style="width:4cqw" aria-hidden="true"><path d="M20 50C8 32 2 24 2 16a18 18 0 0 1 36 0c0 8-6 16-18 34z" fill="#e5484d" stroke="#1b2a4a" stroke-width="3"/><circle cx="20" cy="16" r="6" fill="#fff6dc"/></svg></div>` },
      { t: "الاتهام", d: 11000, say: `عرفتوه؟ أعلنوا <b>اللص ومكانه</b> من الجوال. أول فريق يصيب يفوز، ${wrong}`,
        h: () => `<div class="ap" style="top:13cqw;right:8cqw">${vigSVG("gate", 26)}</div>
          <div class="ap" style="top:9cqw;left:12cqw;animation-delay:1.4s"><div class="ocard"><span class="k">اتهام الفريق الأزرق</span>${faceCq(DEMO.sus[DEMO.thief], 10)}<b style="font-size:2cqw">${DEMO.sus[DEMO.thief].name}، في ${placeName(5, mode)}</b></div></div>
          <div class="ap" style="top:31cqw;left:14cqw;animation-delay:4s"><span class="stamp ok" style="font-size:3.2cqw">انحلّت القضية!</span></div>` },
      { only: "house", t: "في البيت", d: 12000, say: "الشهود <b>بطاقات مخبّاة</b> في غرف البيت. المحققين يحلّون ألغاز تكشف مكانها بالضبط، والراكضين يدوّرون <b>ويمسحونها</b>.",
        h: () => `<div class="ap" style="top:11cqw;inset-inline:6cqw;display:grid;grid-template-columns:repeat(4,1fr);gap:2cqw;animation:none">${[0, 1, 2, 5].map((i, k) => `<div class="pc" style="animation:mfPop .5s ${0.4 + k * 0.7}s both;transform:rotate(${(k - 1.5) * 3}deg)">${vigSVG(CITY[i].art, 12)}<b>${HOME[i]}</b><span>${SPOTS[i]}</span><span style="width:6cqw;height:6cqw;display:block">${fakeQR()}</span></div>`).join("")}</div>` },
    ];
    return all.filter((x) => !x.only || x.only === mode);
  }
  const story = (k, mode) => { const c = CASES[k] || CASES[0]; return { t: c.t, d: mode === "house" && c.h ? c.h : c.d }; };
  // Runs inside `el` (a 16:9 box with container-type: inline-size). The scene follows the clock, so a redraw
  // of the page lands on the same scene instead of starting over.
  function explainer(el, o) {
    const list = scenes(o.mode), total = list.reduce((a, x) => a + x.d, 0);
    const st = { k: -1, t0: o.t0 || Date.now(), timer: 0, paused: false, el };
    const at = () => { let t = (Date.now() - st.t0) % total, k = 0; while (t >= list[k].d) { t -= list[k].d; k++; } return { k, t }; };
    const draw = (k, off) => {
      const sc = list[k];
      el.innerHTML = `<div class="mfx">${LIGHTS}<div class="bar5">${list.map((x, i) => `<i class="${i < k ? "done" : i === k ? "on" : ""}"><b style="animation-duration:${sc.d}ms;animation-delay:-${off}ms"></b></i>`).join("")}</div>
        <div class="ttl"><span>${AR(k + 1)} من ${AR(list.length)}</span><b>${sc.t}</b></div><div class="sc">${sc.h()}</div><div class="say">${sc.say}</div>${o.corner || ""}</div>`;
      // jump into the scene's own animations where the clock says we are
      if (off > 300) el.querySelectorAll(".mfx *").forEach((x) => { const cs = getComputedStyle(x); if (cs.animationName && cs.animationName !== "none" && !x.closest(".bar5")) x.style.animationDelay = cs.animationDelay.split(",").map((d) => `${parseFloat(d) - off / 1000}s`).join(","); });
    };
    const tick = () => {
      if (!el.isConnected) return stop();
      if (st.paused) return;
      const { k, t } = at();
      if (k !== st.k) { st.k = k; draw(k, t); }
    };
    const stop = () => clearInterval(st.timer);
    st.timer = setInterval(tick, 250); tick();
    st.go = (d) => { const { k } = at(); const nk = (k + d + list.length) % list.length; st.t0 = Date.now() - list.slice(0, nk).reduce((a, x) => a + x.d, 0); st.k = -1; st.paused = false; tick(); };
    st.pause = (p) => { st.paused = p; el.querySelectorAll(".mfx *").forEach((x) => (x.style.animationPlayState = p ? "paused" : "")); if (!p) { st.t0 = Date.now() - (st.pausedAt || 0); st.k = -1; tick(); } else { const { k, t } = at(); st.pausedAt = list.slice(0, k).reduce((a, x) => a + x.d, 0) + t; } };
    st.stop = stop;
    return st;
  }

  // the game's card on the home page: the lantern with the question mark, in the game's own colour
  const CARD = '<svg viewBox="0 0 300 200" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" role="img" aria-label="مَن الفاعل؟"><defs><pattern id="c-mf" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="4.5" cy="4.5" r="1.6" fill="#000" opacity=".16"/></pattern></defs><rect width="300" height="200" fill="#14484f"/><rect width="300" height="200" fill="url(#c-mf)"/><circle cx="150" cy="100" r="86" fill="#fff6dc" opacity=".1"/><g transform="translate(88 38) scale(1.24)"><path d="M50 8v8" stroke="#fff6dc" stroke-width="3"/><circle cx="50" cy="6" r="4" fill="none" stroke="#fff6dc" stroke-width="3"/><path d="M34 30q16-18 32 0z" fill="#fff6dc"/><path d="M31 30h38l-6 44H37z" fill="#ffc933"/><path d="M31 30h38l-6 44H37z" fill="none" stroke="#fff6dc" stroke-width="4"/><text x="50" y="64" text-anchor="middle" font-family="Lalezar, sans-serif" font-size="30" fill="#14484f">؟</text><path d="M38 74h24l-12 14z" fill="#fff6dc"/></g><g transform="translate(244 30) rotate(8)"><rect x="-42" y="-16" width="84" height="32" rx="16" fill="#ffc933" stroke="#1b2a4a" stroke-width="3"/><text y="7" text-anchor="middle" font-family="Lalezar, sans-serif" font-size="18" fill="#1b2a4a">جديد</text></g></svg>';

  return { VIG, MAP, CITY, HOME, SPOTS, ROOMS, TRAITS, TRAIT_N, SIZE, COLORS, SAGE, SPY, SHOP, WITNESS, CASES, NAMES,
    placeName, story, whoOf, isW, roleOf, traitOf, knows, boardSVG, houseSVG, pawnXY, popXY, pawnArt, lantern, vigSVG, miniVig, sFace,
    XMARK, TICKET, tickets, CARD, CHECK, CROSS, PIN, fits, say, makeCase, explainer, fakeQR, fanous };
})();

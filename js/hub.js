"use strict";
  // ================= the yard =================
  const BELL = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 5c-7 0-11 5-11 12v7l-4 5h30l-4-5v-7C31 10 27 5 20 5z" fill="#1b2a4a"/><circle cx="20" cy="33" r="3.5" fill="#1b2a4a"/><path d="M12 12q2-4 6-5" stroke="#ffc933" stroke-width="2.5" stroke-linecap="round" fill="none"/></svg>';
  // what the cards say; the rules come from the games themselves (room.js)
  const GAMES = [
    { id: "khallast", line: "حرف، وخانات، وأول واحد يخلّص يوقّف الكل. وبعدها تصويت على الإجابات الغريبة.", tags: ["٢ إلى ٣٠ لاعب", "كتابة", "ضحك"], art: "notebook" },
    { id: "khat", line: "إكس أو على السبورة: كل مربع سؤال، وفريقك يصوّت على الجواب، والغلط يفتح فرصة سرقة.", tags: ["فريقين", "حتى ٣٠ لاعب", "أسئلة"], art: "chalk" },
    { id: "trabee", line: "حوش المدرسة بلاط: اختاروا بلاطة، جاوبوا صح ولوّنوها هي واللي حولها بطباشيركم. والغلط يروح للفريق الثاني.", tags: ["٢ إلى ٤ فرق", "حتى ٣٠ لاعب", "أسئلة"], art: "yard" },
    { id: "alqab", line: "كل واحد يتخبى ورا لقب سري، والأسئلة تفضحه. أسرع جواب صح يتهم: مين صاحب «ملك الأعذار»؟", tags: ["٤ إلى ٢٠ لاعب", "فردي أو ثنائيات", "تخمين"], art: "stage" },
    { id: "hisn", line: "لعبة السفن على ورق الكراسة: كل فريق يخبي قائده وجنوده، وكل جواب صح قذيفة على حصن الخصم. آخر حصن يصمد يفوز.", tags: ["٢ إلى ٥ فرق", "حتى ٣٠ لاعب", "تصويب"], art: "squared" },
    { id: "ghash", line: "اختبار جماعي وفي كل فصل غشاش معه ورقة الغش. يعرف الجواب ويبيكم تغلطون. كل ٣ أسئلة تفتيش: مين الغشاش؟", tags: ["٤ إلى ٣٠ لاعب", "فصل أو أكثر", "شك وأسئلة"], art: "cork" },
    { id: "kanz", line: "مطاردة كنز في المكان نفسه: فكّوا الشفرة، دوّروا البطاقة، امسحوها، وتنفتح الشفرة اللي بعدها. والخريطة على التلفزيون.", tags: ["٢ إلى ٤ فرق", "استراحة · مخيم · مدرسة · بيت", "حركة وشفرات"], art: "treasure" },
    { id: "foldit", line: "لعبة الدفتر القديمة: نقطة حبر في نصفك، تنطوي الورقة، وتنطبع على جنود خصمك.", tags: ["لاعبين", "والباقي يتفرجون", "مهارة"], art: "desk", solo: FOLD_IT },
  ];
  function art(g) {
    if (g.art === "notebook") return `<div class="gart notebook"><svg viewBox="0 0 220 150" width="220" height="150" aria-hidden="true"><circle cx="170" cy="60" r="36" fill="#fff" stroke="#c8232c" stroke-width="4"/><text x="170" y="78" text-anchor="middle" font-family="Lalezar, sans-serif" font-size="52" fill="#c8232c">م</text><text x="112" y="42" text-anchor="middle" font-family="IBM Plex Sans Arabic, sans-serif" font-size="15" font-weight="700" fill="#1c2433">حيوان:</text><text x="58" y="42" text-anchor="middle" font-family="IBM Plex Sans Arabic, sans-serif" font-size="17" font-weight="700" fill="#1d3fb8">ماعز</text><text x="112" y="84" text-anchor="middle" font-family="IBM Plex Sans Arabic, sans-serif" font-size="15" font-weight="700" fill="#1c2433">أكلة:</text><text x="58" y="84" text-anchor="middle" font-family="IBM Plex Sans Arabic, sans-serif" font-size="17" font-weight="700" fill="#1d3fb8">مندي</text><rect x="28" y="104" width="132" height="32" rx="10" fill="#c8232c" transform="rotate(-4 94 120)"/><text x="94" y="127" text-anchor="middle" font-family="Lalezar, sans-serif" font-size="22" fill="#fff" transform="rotate(-4 94 120)">خلّصت!</text></svg></div>`;
    if (g.art === "chalk") return `<div class="gart chalk"><svg viewBox="0 0 150 150" width="150" height="150" aria-hidden="true"><g stroke="#f3f1e6" stroke-width="4" stroke-linecap="round" opacity=".85"><path d="M52 12v126M98 12v126M12 52h126M12 98h126"/></g><g stroke="#9cc8ff" stroke-width="6" stroke-linecap="round"><path d="M22 22l20 20M42 22l-20 20M68 68l14 14M82 68l-14 14M112 112l18 18M130 112l-18 18"/></g><circle cx="120" cy="32" r="12" fill="none" stroke="#ffa3a3" stroke-width="6"/><circle cx="32" cy="120" r="12" fill="none" stroke="#ffa3a3" stroke-width="6"/><path d="M18 18l118 118" stroke="#ffe27a" stroke-width="3" stroke-dasharray="6 6" opacity=".8"/></svg></div>`;
    if (g.art === "squared") {
      // a fort on squared paper: pieces in blue pen, red-pen hits, pencil misses, and a wounded commander
      const cell = 24, ox = 50, oy = 14, put = { 6: "sol", 8: "gun", 12: "cmd", 13: "shd", 16: "sol", 19: "bmb", 22: "rdr" }, hit = [6, 12], miss = [0, 4, 10, 23];
      let g2 = "";
      for (let k = 0; k < 25; k++) { const x = ox + (k % 5) * cell, y = oy + Math.floor(k / 5) * cell;
        g2 += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="${put[k] ? "#e8eefb" : "#fff"}" stroke="#a9c4e2" stroke-width="1"/>`;
        if (put[k]) g2 += `<use href="#hz-${put[k]}" x="${x + 1}" y="${y + 1}" width="${cell - 2}" height="${cell - 2}" style="color:#1d3fb8"/>`;
        if (hit.includes(k)) g2 += `<path d="M${x + 4} ${y + 4}L${x + cell - 4} ${y + cell - 4}M${x + cell - 4} ${y + 4}L${x + 4} ${y + cell - 4}" stroke="#c8232c" stroke-width="3.4" stroke-linecap="round"/>`;
        if (miss.includes(k)) g2 += `<circle cx="${x + cell / 2}" cy="${y + cell / 2}" r="3" fill="#6b7280"/>`; }
      return `<div class="gart squared"><svg viewBox="0 0 220 150" width="250" height="170" aria-hidden="true"><rect x="${ox - 4}" y="${oy - 4}" width="${cell * 5 + 8}" height="${cell * 5 + 8}" rx="4" fill="#fff" stroke="#1d3fb8" stroke-width="2.5"/>${g2}
        <g transform="rotate(-8 200 40)"><rect x="170" y="22" width="50" height="22" rx="5" fill="#fff" stroke="#c8232c" stroke-width="2"/><text x="195" y="38" text-anchor="middle" font-family="Aref Ruqaa, Lalezar, serif" font-weight="700" font-size="13" fill="#c8232c">إصابة!</text></g>
        <path d="M14 120q14-30 34-42" stroke="#1b2a4a" stroke-width="2" stroke-dasharray="4 4" fill="none"/><circle cx="14" cy="122" r="5" fill="#1b2a4a"/>
      </svg></div>`;
    }
    if (g.art === "treasure") {
      // the card itself is an old treasure map: an island, a dotted route past team flags, the X with the chest, a compass and a scanned code card
      const palm = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 q2 -14 -2 -26" stroke="#7a4f22" stroke-width="3" fill="none" stroke-linecap="round"/><g fill="#3f8a3a"><path d="M-2 -26 q-12 -6 -20 2 q10 -2 20 -2z"/><path d="M-2 -26 q12 -8 20 0 q-10 -3 -20 0z"/><path d="M-2 -26 q-4 -12 -14 -14 q8 6 14 14z"/><path d="M-2 -26 q6 -12 16 -12 q-9 5 -16 12z"/></g></g>`;
      const flag = (x, y, c) => `<g transform="translate(${x} ${y})"><rect x="-1" y="-20" width="2" height="20" fill="#5a3a18"/><path d="M1 -20 h13 l-4 4.5 l4 4.5 h-13z" fill="${c}"/></g>`;
      return `<div class="gart treasure"><svg viewBox="0 0 320 190" width="320" height="190" aria-hidden="true">
        <path d="M58 104 C40 70 70 36 120 40 C150 20 205 24 236 44 C276 50 292 86 272 116 C262 150 214 166 168 156 C124 168 74 150 58 104Z" fill="none" stroke="#4f9db0" stroke-width="10" opacity=".25"/>
        <path d="M58 104 C40 70 70 36 120 40 C150 20 205 24 236 44 C276 50 292 86 272 116 C262 150 214 166 168 156 C124 168 74 150 58 104Z" fill="#f4e2b2" stroke="#4f9db0" stroke-width="2.5"/>
        <path d="M150 70 q20 -14 40 0 q-6 14 -20 12 q-14 2 -20 -12z" fill="#7fc3cf" stroke="#4f9db0" stroke-width="1.5"/>
        <path d="M92 70 l14 -16 l14 16z M108 72 l12 -12 l12 12z" fill="#b48a52" stroke="#7a5428" stroke-width="1.2"/>
        ${palm(196, 136, 0.9)}${palm(214, 128, 0.7)}${palm(86, 118, 0.8)}
        <path d="M78 132 C100 120 96 96 124 98 S150 124 176 112 S196 82 226 92" fill="none" stroke="#b3261e" stroke-width="2.6" stroke-dasharray="2 6" stroke-linecap="round"/>
        ${flag(124, 98, "#2f6fe0")}${flag(176, 112, "#1f9a5a")}${flag(160, 64, "#e0442f")}
        <g transform="translate(238 92)"><circle r="20" fill="#ffd36b" opacity=".35"/><path d="M-9 -9 L9 9 M9 -9 L-9 9" stroke="#b3261e" stroke-width="4.5" stroke-linecap="round"/></g>
        <g transform="translate(244 72)"><rect x="-13" y="-6" width="26" height="15" rx="2" fill="#8a5427" stroke="#4a2a10" stroke-width="1.2"/><path d="M-13 -6 q13 -12 26 0z" fill="#a8672f" stroke="#4a2a10" stroke-width="1.2"/><rect x="-13" y="-1" width="26" height="3" fill="#d4a330"/><rect x="-2.5" y="-3" width="5" height="7" rx="1" fill="#f2c94c" stroke="#4a2a10" stroke-width=".8"/></g>
        <g transform="translate(40 40)" stroke="#7a5428" stroke-width="1.2"><circle r="17" fill="#f4e2b2"/><path d="M0 -22 L4 0 L0 22 L-4 0Z" fill="#b3261e"/><path d="M-22 0 L0 -4 L22 0 L0 4Z" fill="#7a5428"/><text y="-25" text-anchor="middle" font-family="IBM Plex Sans Arabic, sans-serif" font-size="9" font-weight="700" fill="#7a5428" stroke="none">ش</text></g>
        <g transform="translate(286 150) rotate(10)"><rect x="-20" y="-26" width="40" height="50" rx="5" fill="#fff" stroke="#1b2a4a" stroke-width="2.5"/>${[[-14, -20], [4, -20], [-14, -2]].map(([x, y]) => `<rect x="${x + 1}" y="${y + 1}" width="8" height="8" fill="none" stroke="#1b2a4a" stroke-width="2"/><rect x="${x + 3.5}" y="${y + 3.5}" width="3" height="3" fill="#1b2a4a"/>`).join("")}${[[0, -18], [0, -12], [-4, -8], [2, -6], [6, -2], [10, 0], [0, 2], [6, 4], [12, -6]].map(([x, y]) => `<rect x="${x}" y="${y}" width="3" height="3" fill="#1b2a4a"/>`).join("")}<rect x="-13" y="12" width="26" height="6" rx="2" fill="#b3261e"/></g>
      </svg></div>`;
    }
    if (g.art === "cork") {
      // the vice principal's cork board: three suspects on polaroids, red string, and one circled in marker
      const av = (a, x, y, sz) => avatar(a, sz).replace("<svg ", `<svg x="${x}" y="${y}" `);
      const pol = (a, x, y, r) => `<g transform="rotate(${r} ${x + 24} ${y + 28})"><rect x="${x}" y="${y}" width="48" height="56" fill="#fff" filter="url(#ckSh)"/><rect x="${x + 4}" y="${y + 4}" width="40" height="40" fill="#e9e2d2"/>${av(a, x + 4, y + 4, 40)}</g>`;
      const pin = (x, y, c = "#c8232c") => `<circle cx="${x}" cy="${y}" r="4.5" fill="${c}"/><circle cx="${x - 1.4}" cy="${y - 1.4}" r="1.4" fill="#fff" opacity=".7"/>`;
      return `<div class="gart cork"><svg viewBox="0 0 220 150" width="250" height="170" aria-hidden="true"><defs><filter id="ckSh" x="-20%" y="-20%" width="150%" height="150%"><feDropShadow dx="1.5" dy="3" stdDeviation="2" flood-opacity=".35"/></filter></defs>
        ${pol({ c: 2, k: 12, r: -3 }, 18, 14, -6)}${pol({ c: 4, k: 27, r: 3 }, 86, 8, 4)}${pol({ c: 6, k: 41, r: -2 }, 154, 18, -3)}
        <g transform="rotate(-4 50 118)"><rect x="12" y="96" width="78" height="44" fill="#fff2a1" filter="url(#ckSh)"/><text x="51" y="124" text-anchor="middle" font-family="Aref Ruqaa, Lalezar, serif" font-weight="700" font-size="13" fill="#b3121c">مين الغشاش؟</text></g>
        <path d="M42 16L50 98M110 10L54 98M178 20L58 98" stroke="#b3121c" stroke-width="1.6" fill="none"/>
        ${pin(42, 16)}${pin(110, 10)}${pin(178, 20)}${pin(54, 98, "#1d3fb8")}
        <ellipse cx="110" cy="38" rx="31" ry="35" fill="none" stroke="#c8232c" stroke-width="3" transform="rotate(-8 110 38)"/>
        <g transform="rotate(8 170 118)"><rect x="128" y="104" width="78" height="26" rx="3" fill="none" stroke="#c8232c" stroke-width="2.5"/><text x="167" y="123" text-anchor="middle" font-family="Aref Ruqaa, Lalezar, serif" font-weight="700" font-size="15" fill="#c8232c">تفتيش!</text></g>
      </svg></div>`;
    }
    if (g.art === "stage") {
      // the school stage: velvet curtains, the spotlight, and a nickname sticker peeling off whoever is under it
      const av = avatar({ c: 3, k: 7, r: -2 }, 58).replace("<svg ", '<svg x="81" y="58" ');
      let pleats = ""; for (let x = 0; x < 50; x += 10) pleats += `<rect x="${x}" width="10" height="132" fill="url(#stCur)"/><rect x="${210 - x}" width="10" height="132" fill="url(#stCur)"/>`;
      let fringe = ""; for (let x = 0; x < 220; x += 14) fringe += `<path d="M${x} 16q7 9 14 0" fill="#6a0e19" stroke="#e0b04a" stroke-width="2"/>`;
      return `<div class="gart stage"><svg viewBox="0 0 220 150" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="stCur" x1="0" x2="1"><stop offset="0" stop-color="#4d0812"/><stop offset=".55" stop-color="#9a1a2b"/><stop offset="1" stop-color="#4d0812"/></linearGradient><linearGradient id="stLt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0c8" stop-opacity=".35"/><stop offset="1" stop-color="#fff0c8" stop-opacity=".08"/></linearGradient></defs>
        <rect width="220" height="150" fill="#2a0a10"/>
        <rect y="122" width="220" height="28" fill="#7a4a22"/><path d="M0 122h220M0 135h220M40 122v13M110 135v15M170 122v13" stroke="#5a3418" stroke-width="1.5"/>
        <path d="M84 14h52l34 112H50z" fill="url(#stLt)"/><ellipse cx="110" cy="124" rx="50" ry="8" fill="#fff0c8" opacity=".3"/>
        ${av}
        <g transform="rotate(-18 92 64)"><rect x="54" y="52" width="76" height="22" rx="5" fill="#fff"/><rect x="57" y="55" width="70" height="16" rx="3" fill="#8fc7ff"/><text x="92" y="67" text-anchor="middle" font-family="IBM Plex Sans Arabic, sans-serif" font-weight="700" font-size="10.5" fill="#1b2a4a">ملك الأعذار</text></g>
        ${pleats}${fringe}<rect width="220" height="16" fill="#6a0e19"/><path d="M0 16h220" stroke="#e0b04a" stroke-width="2"/>
        <g transform="rotate(-8 180 96)"><rect x="146" y="84" width="66" height="26" rx="4" fill="none" stroke="#ffd36b" stroke-width="2.5" stroke-dasharray="1.5 3.5" stroke-linecap="round"/><text x="179" y="103" text-anchor="middle" font-family="Aref Ruqaa, Lalezar, serif" font-weight="700" font-size="16" fill="#ffd36b">انكشف!</text></g>
      </svg></div>`;
    }
    if (g.art === "yard") {
      // a corner of the yard: chalked tiles in perspective, a cone, chalk sticks and the folded question note
      const C = ["#ff5a6e", "#3e8bff", "#2fbf71", "#ff9f1c"], own = ["..00.11", ".0001111", "2200.31", "22.3333", ".2..33."], ctr = { "1,2": 1, "3,0": 1, "3,4": 1 };
      let tiles = "";
      own.forEach((row, r) => [...row.padEnd(7, ".")].slice(0, 7).forEach((o, c) => {
        const x = 8 + c * 26, y = 6 + r * 26, f = o === "." ? "#d9d3c7" : C[+o];
        tiles += `<rect x="${x}" y="${y}" width="23" height="23" rx="3" fill="${f}"/>${o === "." ? "" : `<rect x="${x}" y="${y}" width="23" height="23" rx="3" fill="url(#yhatch)"/>`}${ctr[r + "," + c] ? `<circle cx="${x + 11.5}" cy="${y + 11.5}" r="6.5" fill="none" stroke="#fff" stroke-width="2.4"/>` : ""}`;
      }));
      return `<div class="gart yard"><svg viewBox="0 0 220 150" width="250" height="170" aria-hidden="true"><defs><pattern id="yhatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><path d="M0 0h4" stroke="#fff" stroke-opacity=".35" stroke-width="1"/></pattern></defs>
        <g transform="translate(14 8) skewX(-8) rotate(-4 95 70)"><rect x="2" y="0" width="190" height="138" rx="9" fill="#b3aa98"/><rect x="2" y="134" width="190" height="6" rx="3" fill="#1b2a4a" opacity=".18"/>${tiles}
          <g transform="translate(164 59)"><ellipse cx="11.5" cy="20" rx="12" ry="3" fill="#1b2a4a" opacity=".2"/><path d="M11.5 -2l7 20h-14z" fill="#ff7a1a"/><path d="M7.6 9h7.8l1.4 4h-10.6z" fill="#fff"/><rect x="1" y="17" width="21" height="4" rx="1.5" fill="#e0640c"/></g></g>
        <g transform="rotate(-18 40 128)"><rect x="18" y="122" width="34" height="9" rx="4.5" fill="#ff5a6e"/><rect x="18" y="122" width="34" height="3" rx="1.5" fill="#fff" opacity=".35"/></g>
        <g transform="rotate(8 70 136)"><rect x="52" y="131" width="28" height="9" rx="4.5" fill="#3e8bff"/><rect x="52" y="131" width="28" height="3" rx="1.5" fill="#fff" opacity=".35"/></g>
        <g transform="translate(6 -4) scale(.9) rotate(7 186 30)"><path d="M160 10h44v38h-36l-8-8z" fill="#fff" stroke="#1b2a4a" stroke-width="2.5" stroke-linejoin="round"/><path d="M160 40l8 0v8z" fill="#e8dcc0" stroke="#1b2a4a" stroke-width="2" stroke-linejoin="round"/><text x="183" y="38" text-anchor="middle" font-family="Lalezar, sans-serif" font-size="28" fill="#1b2a4a">؟</text></g>
      </svg></div>`;
    }
    // اطوِها: an open notebook on the desk under the lamp: red soldiers on one page, blue on the other,
    // a ballpoint blob on the blue page and its mirror print landing on a red soldier when the page folds
    const man = (x, y, c, hit) => `<g stroke="${c}" stroke-width="2.2" stroke-linecap="round" fill="none"${hit ? ' opacity=".55"' : ""}><circle cx="${x}" cy="${y}" r="4"/><path d="M${x} ${y + 4}v8M${x - 5} ${y + 7}h10M${x} ${y + 12}l-4 6M${x} ${y + 12}l4 6"/></g>`;
    const blot = (x, y, o) => `<g fill="#1d3fb8" opacity="${o}"><path d="M${x - 8} ${y}c-2-7 4-11 9-9 5-3 11 1 9 7 5 3 2 10-4 9-3 5-10 4-11-1-5 0-6-4-3-6z"/><circle cx="${x + 11}" cy="${y - 8}" r="2"/><circle cx="${x - 12}" cy="${y + 7}" r="1.5"/></g>`;
    const lines = (x0) => [44, 54, 64, 74, 84, 94, 104, 114].map((y) => `<path d="M${x0} ${y}h66"/>`).join("");
    return `<div class="gart desk"><svg viewBox="0 0 220 150" width="250" height="170" style="overflow:visible" aria-hidden="true">
      <defs><radialGradient id="dkLamp" cx=".78" cy=".08" r=".9"><stop offset="0" stop-color="#ffd678" stop-opacity=".42"/><stop offset=".55" stop-color="#ffd678" stop-opacity=".08"/><stop offset="1" stop-color="#ffd678" stop-opacity="0"/></radialGradient>
        <linearGradient id="dkSpine" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".5" stop-color="#000" stop-opacity=".16"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient></defs>
      
      <g transform="rotate(-4 110 82)">
        <rect x="40" y="36" width="140" height="94" rx="3" fill="#000" opacity=".35" transform="translate(4 5)"/>
        <rect x="40" y="34" width="70" height="94" rx="2" fill="#fbfbf5"/><rect x="110" y="34" width="70" height="94" rx="2" fill="#f4f4ec"/>
        <g stroke="#c7d7ea" stroke-width="1">${lines(42)}${lines(112)}</g><path d="M50 34v94M170 34v94" stroke="#e46b6b" stroke-width="1.2"/>
        <rect x="98" y="34" width="24" height="94" fill="url(#dkSpine)"/>
        <path d="M110 26v110" stroke="#ffc933" stroke-width="2.2" stroke-dasharray="6 5"/>
        ${man(66, 48, "#c8232c")}${man(84, 92, "#c8232c", true)}${man(134, 48, "#1d3fb8")}${man(160, 76, "#1d3fb8")}
        ${blot(136, 104, 1)}${blot(84, 104, .45)}
        <g stroke="#c8232c" stroke-width="2.6" stroke-linecap="round"><path d="M76 90l16 16M92 90l-16 16"/></g>
        <path d="M156 24q-46-30-92 0" stroke="#ffc933" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M70 17l-6 7 9 2" stroke="#ffc933" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <g transform="rotate(-28 176 128)"><rect x="140" y="124" width="62" height="8" rx="4" fill="#e9edf5"/><rect x="188" y="124" width="14" height="8" rx="3" fill="#1d3fb8"/><path d="M140 124l-9 4 9 4z" fill="#c9cfdb"/><circle cx="131" cy="128" r="1.4" fill="#1d3fb8"/></g>
      <g transform="translate(206 -6)"><path d="M-30 4l26 0 8 22h-42z" fill="#1f4d3a"/><path d="M-38 26h42" stroke="#ffe3a0" stroke-width="3" stroke-linecap="round"/><path d="M-17 4V-40" stroke="#1a120b" stroke-width="2.5"/></g>
    </svg></div>`;
  }
  function renderHub() {
    const crew = [me, ...[24, 35, 1, 17, 30].map((k, i) => ({ av: { c: (i * 3 + 1) % NOTES.length, e: i % EYES.length, m: (i + 1) % MOUTHS.length, h: 0, k, r: i % 2 ? 3 : -3 } }))];
    $("hub").innerHTML = `<div class="hub-in">
      <header class="hdr">
        <button type="button" class="logo" id="ringBell" aria-label="دق جرس الفسحة">${BELL}فسحة</button>
        <nav class="nav"><a href="#games">الألعاب</a><a href="#faq">الأسئلة</a></nav>
        <span class="row" style="gap:8px"><button type="button" class="sndbtn" data-sound aria-pressed="${soundOn}" aria-label="${soundOn ? "اكتم الصوت" : "شغّل الصوت"}">${speakerIcon(soundOn)}</button><button type="button" class="me-chip" id="meChip">${avatar(me.av, 30)}<span>${me.name ? esc(me.name) : "سوّ شخصيتك"}</span></button></span>
      </header>
      <section class="hero" id="top">
        <div>
          <p class="kick">ألعاب جماعية للجمعات</p>
          <h1>فسحة</h1>
          <p class="lead">دق الجرس! المضيف يفتح غرفة، والكل يدخل من جواله برمز. بدون تحميل ولا تسجيل، والتلفزيون اختياري.</p>
          <div class="hero-btns"><button type="button" class="hbtn bellbtn" id="heroBell">${BELL}دق الجرس</button><a class="hbtn" href="#games">اختاروا لعبة</a><button type="button" class="hbtn alt" id="heroMe">شخصيتك</button></div>
          ${(() => { const r = savedRoom(); return r ? `<div class="resume pop"><span>غرفتك <b dir="ltr">${esc(r.code)}</b> للحين مفتوحة</span><button type="button" class="hbtn" id="resumeBtn">رجّعها</button><button type="button" class="hbtn alt" id="dropRoom">قفلها</button></div>` : ""; })()}
          <form class="joinbox" id="joinForm"><input id="joinCode" maxlength="4" placeholder="رمز الغرفة" aria-label="رمز الغرفة" autocomplete="off" autocapitalize="characters"><button type="submit" class="hbtn">ادخل</button></form>
          <p style="margin-top:10px">${passActive() ? `<button type="button" class="passchip" data-pass="">✓ تذكرتك فعالة</button>` : `<button type="button" class="passnote" data-pass="" style="font-size:14px">عندك كود؟</button>`}</p>
        </div>
        <div class="crew" aria-hidden="true">${crew.map((p) => avatar(p.av, 74)).join("")}</div>
      </section>
      <section class="sec" id="games">
        <div class="sec-h"><i></i><h2>ألعابنا</h2></div>
        <div class="games">${GAMES.map((g) => `<article class="gcard">${art(g)}<div class="gbody"><h3>${ROOM_GAMES[g.id].name}</h3><p>${g.line}</p><div class="tags">${g.tags.map((t) => `<span>${t}</span>`).join("")}</div>
          <div class="gbtns"><button type="button" class="play" data-play="${g.id}">افتح غرفة</button><button type="button" class="info" data-info="${g.id}" aria-label="طريقة ${ROOM_GAMES[g.id].name}">؟</button></div>
          ${!canHost(g.id) ? `<button type="button" class="passnote" data-pass="${g.id}">خلصت جلستها المجانية · عندك كود؟</button>` : ""}
          ${g.solo ? `<a class="solo" href="${g.solo}">أو العبها على نفس الجوال، ولها لغز يومي</a>` : ""}</div></article>`).join("")}</div>
      </section>
      <section class="sec">
        <div class="sec-h"><i></i><h2>كيف تلعبون</h2></div>
        <div class="steps">
          <div class="step"><b>١</b><h3>المضيف يفتح غرفة</h3><p>يختار لعبة ويطلع له رمز من أربع حروف.</p></div>
          <div class="step"><b>٢</b><h3>الكل يدخل من جواله</h3><p>بالرمز أو الرابط، ويختار اسمه وشخصيته. بدون تطبيق ولا حساب.</p></div>
          <div class="step"><b>٣</b><h3>كل شي يطلع في الجوال</h3><p>الأسئلة والتصويت والنتائج عند كل واحد. وإذا عندكم تلفزيون يصير عرض إضافي.</p></div>
        </div>
      </section>
      <section class="sec" id="faq">
        <div class="sec-h"><i></i><h2>أسئلة</h2></div>
        <div class="faq">
          <details><summary>لازم أحمّل تطبيق؟</summary><p>لا. تدخلون من متصفح الجوال بالرمز، واللي يبي التطبيق يقدر ينزله.</p></details>
          <details><summary>نحتاج تلفزيون أو بروجكتر؟</summary><p>لا. كل شي يطلع في جوال كل لاعب: الأسئلة والتصويت والنتائج. التلفزيون عرض إضافي بس.</p></details>
          <details><summary>كم لاعب؟</summary><p>لين ٣٠ في الغرفة. «خط ثلاثة» يتقسمون فيها فريقين، و«ترابيع» لين أربع فرق، و«انكشف!» لين ٢٠ لاعب، و«حرب الكراريس» لين ٥ فرق، و«مين الغشاش؟» لين ٣٠ لاعب، و«الكنز» لين ٤ فرق، و«اطوِها!» يلعبها اثنين والباقي يتفرجون.</p></details>
          <details><summary>نقدر نغيّر اللعبة بدون ما نطلع؟</summary><p>إيه. المضيف يختار اللعبة من شاشة «وينكم!»، والكل يبقى في نفس الغرفة.</p></details>
          <details><summary>كم تكلف؟</summary><p>كل لعبة لها جلسة مجانية. بعدها يفتح المضيف كل الألعاب بكود، تاخذه من حسابنا في انستقرام <a href="https://instagram.com/fos7a.games" target="_blank" rel="noopener">@fos7a.games</a>. واللي يدخلون الغرفة يلعبون مجاناً دائماً.</p></details>
          <details><summary>وش تحفظون عني؟</summary><p>ولا شي على سيرفر. اسمك وشخصيتك في جوالك بس، واللعب يمر بين جوالات الغرفة ويروح. التفاصيل في <a href="privacy.html">صفحة الخصوصية</a>.</p></details>
        </div>
      </section>
      <footer class="foot"><span>فسحة · <a href="privacy.html">الخصوصية</a></span><span>ألعاب جماعية من جوالاتكم</span></footer>
    </div>`;
    if ($("resumeBtn")) { $("resumeBtn").onclick = () => { beep(700, 0.05); resumeRoom(); }; $("dropRoom").onclick = () => { const r = savedRoom(); forgetRoom(); if (r) { const n = openRoom(r.code, () => {}, (st) => { if (st === "SUBSCRIBED") { n.send({ t: "state", s: { phase: "closed" } }); setTimeout(() => n.close(), 400); } }); } renderHub(); }; }
    $("joinForm").onsubmit = (e) => { e.preventDefault(); const c = cleanCode($("joinCode").value); if (c.length === 4) { beep(700, 0.05); openJoin(c); } else $("joinCode").focus(); };
    $("ringBell").onclick = $("heroBell").onclick = () => { if (!soundOn) setSound(true); recess(); const b = $("hub"); b.classList.remove("ring"); void b.offsetWidth; b.classList.add("ring"); };
    document.querySelectorAll("[data-sound]").forEach((b) => (b.onclick = () => setSound(!soundOn)));
    $("meChip").onclick = $("heroMe").onclick = () => openProfile(() => { renderHub(); view("hub"); });
    document.querySelectorAll("[data-play]").forEach((b) => (b.onclick = () => { beep(700, 0.05); const id = b.dataset.play; if (!canHost(id)) return openPass(id, () => openGame(id)); openGame(id); }));
    document.querySelectorAll("[data-pass]").forEach((b) => (b.onclick = () => openPass(b.dataset.pass || null)));
    document.querySelectorAll("[data-info]").forEach((b) => (b.onclick = () => { const g = ROOM_GAMES[b.dataset.info]; $("modalCard").innerHTML = `<h3>${g.name}</h3><ol>${g.rules.map((r) => `<li>${r}</li>`).join("")}</ol><button type="button" class="pbtn" id="mClose">فهمت</button>`; $("modal").hidden = false; $("mClose").onclick = () => ($("modal").hidden = true); }));
  }
  $("modal").addEventListener("click", (e) => { if (e.target === $("modal")) $("modal").hidden = true; });

  // ================= your character =================
  let tab = "k", afterProfile = null;
  function openProfile(done) { afterProfile = done; view("profile"); drawProfile(); }
  function drawProfile() {
    const list = tab === "k" ? PEOPLE.map((x, i) => ({ i, a: { ...me.av, k: i }, n: x.land, t: `${x.name}: ${x.wear}` })) :
      tab === "c" ? NOTES.map((_, i) => ({ i, a: { ...me.av, c: i }, n: "" })) :
      tab === "e" ? EYES.map((x, i) => ({ i, a: { ...me.av, e: i, h: me.av.h === 4 ? 0 : me.av.h }, n: x.n })) :
      tab === "m" ? MOUTHS.map((x, i) => ({ i, a: { ...me.av, m: i }, n: x.n })) :
      [];
    $("profile").innerHTML = `<div class="prof">
      <div class="hdr" style="padding-block:4px"><span class="logo" style="font-size:28px">${BELL}فسحة</span></div>
      <div class="pcard">
        <h2 style="font-size:30px">شخصيتك</h2>
        <p style="font-size:14px;color:#3c4a6b">اختر شخصيتك من ٢٢ دولة عربية، وغيّر لون الورقة والوجه على كيفك. تطلع جنب اسمك في كل ألعاب فسحة.</p>
        <div class="builder" style="margin-top:12px">
          <div>${avatar(me.av, 110)}</div>
          <div class="field"><label for="nm">اسمك</label><input id="nm" value="${esc(me.name)}" maxlength="12" placeholder="مثلاً: ${PEOPLE[me.av.k]?.name || "مصعب"}" autocomplete="off"></div>
        </div>
      </div>
      <div>
        <div class="ptabs" role="tablist">${[["k", "الشخصية"], ["c", "لون الورقة"], ["e", "العيون"], ["m", "الفم"]].map(([k, n]) => `<button type="button" class="ptab" role="tab" data-tab="${k}" aria-selected="${tab === k}">${n}</button>`).join("")}</div>
        <div class="popts">${list.map((o) => `<button type="button" class="popt" data-set="${o.i}" aria-pressed="${me.av[tab] === o.i}" aria-label="${o.t || o.n || "لون " + (o.i + 1)}"${o.t ? ` title="${o.t}"` : ""}>${avatar(o.a, 52)}${o.n ? `<small>${o.n}</small>` : ""}</button>`).join("")}</div>
      </div>
      <button type="button" class="pbtn alt" id="shuffle">شخصية عشوائية</button>
      <button type="button" class="pbtn" id="saveMe">حفظ</button>
    </div>`;
    const nm = $("nm");
    nm.addEventListener("input", () => { me.name = nm.value.trim(); });
    $("profile").querySelectorAll(".ptab").forEach((b) => (b.onclick = () => { tab = b.dataset.tab; drawProfile(); }));
    $("profile").querySelectorAll(".popt").forEach((b) => (b.onclick = () => { me.av[tab] = +b.dataset.set; if (tab === "e" && me.av.h === 4) me.av.h = 0; if (tab === "k") me.av.h = 0; beep(700, 0.04); drawProfile(); }));
    $("shuffle").onclick = () => { me.av = { c: Math.floor(rnd(0, NOTES.length)), e: Math.floor(rnd(0, EYES.length)), m: Math.floor(rnd(0, MOUTHS.length)), h: 0, k: Math.floor(rnd(0, PEOPLE.length)), r: -3 }; beep(600, 0.05); drawProfile(); };
    $("saveMe").onclick = () => {
      if (isRude(nm.value)) { nm.value = ""; nm.placeholder = "اختر اسم ثاني 🙂"; nm.focus(); beep(200, 0.2, "sawtooth", 0.06); buzz([40, 30, 40]); return; }
      me.name = nm.value.trim() || "أنا"; saveProfile(); beep(880, 0.08); (afterProfile || (() => { renderHub(); view("hub"); }))(); };
  }


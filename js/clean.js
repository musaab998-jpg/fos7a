"use strict";
// ================= a simple filter for rude words in names and answers =================
// Words are matched whole (with the usual prefixes and suffixes), after smoothing out spelling tricks:
// diacritics, stretched letters, repeated letters, dotted/undotted forms, and 0/1/3/4/5/@/$ for letters.
// Animals that people use as insults (كلب، حمار…) stay allowed: they're real answers in «حيوان».

const RUDE_AR = [
  "كس", "كسمك", "كسامك", "كسختك", "كسخت", "كساختك", "كسها", "كسك", "زب", "زبر", "زبي", "زبك", "طيز", "طيزك", "طيزها",
  "نيك", "نيج", "انيك", "انيج", "ينيك", "ينيج", "تنيك", "نيكه", "نياك", "نياكه", "منيوك", "منيوج", "منيك", "متناك", "متناكه", "انتاك",
  "شرموط", "شرموطه", "شراميط", "قحبه", "قحاب", "قحبات", "عاهره", "عاهرات", "لوطي", "ديوث", "معرص", "قواد", "مومس",
  "سكس", "بورن", "خرا", "سحاقيه",
];
const RUDE_LAT = [
  "fuck", "fck", "fuk", "shit", "bitch", "biatch", "dick", "cock", "pussy", "cunt", "whore", "slut", "porn", "sex", "sexy", "nigga", "nigger",
  "asshole", "bastard", "kos", "kuss", "zeb", "zob", "sharmoot", "sharmoota", "manyak", "manyok", "neek", "tiz", "teez", "khara", "gahba", "qahba",
];
const RUDE_SUFFIX = ["", "ك", "ه", "ها", "هم", "كم", "ي", "ات", "ين", "ون", "ا"];
const RUDE_PREFIX = ["", "ال", "و", "يا", "ب", "ل", "وال", "بال", "يال"];
// two-letter words hide inside real ones (بكس، كسا، زبده), so they only match with a few endings
const SHORT_SUFFIX = ["", "ك", "ها", "كم", "هم"], SHORT_PREFIX = ["", "ال", "يا"];
const RUDE_ALWAYS = ["fuck", "shit", "bitch", "porn", "nigg", "شرموط", "منيوك", "متناك", "قحب"]; // bad anywhere in a word

const RUDE_OK = new Set(["نيكون", "نيكي", "نيكول", "زبين", "كسي"]); // real words and brands that look like the above
const deLeet = (s) => s.replace(/0/g, "o").replace(/1/g, "i").replace(/3/g, "e").replace(/4/g, "a").replace(/5/g, "s").replace(/@/g, "a").replace(/\$/g, "s").replace(/7/g, "t");
function rudeNorm(s) {
  return String(s || "").toLowerCase()
    .replace(/[ً-ٰٟـ]/g, "") // harakat and tatweel
    .replace(/[أإآٱ]/g, "ا").replace(/ة/g, "ه").replace(/[ىئ]/g, "ي").replace(/ؤ/g, "و").replace(/[ڤ]/g, "ف").replace(/[گ]/g, "ك").replace(/[چ]/g, "ج")
    .replace(/(.)\1+/g, "$1"); // شرمووووطه → شرموطه
}
const RUDE_SET_AR = new Set(RUDE_AR.map(rudeNorm)), RUDE_SET_LAT = new Set(RUDE_LAT.map(rudeNorm));
function rudeToken(t) {
  if (!t) return false;
  if (/[a-z0-9@$]/.test(t)) {
    const w = rudeNorm(deLeet(t)).replace(/[^a-z]/g, "");
    return RUDE_SET_LAT.has(w) || RUDE_ALWAYS.some((x) => /[a-z]/.test(x) && w.includes(x));
  }
  if (RUDE_OK.has(t)) return false;
  if (RUDE_ALWAYS.some((x) => !/[a-z]/.test(x) && t.includes(x))) return true;
  for (const p of RUDE_PREFIX) {
    if (!t.startsWith(p)) continue;
    const core = t.slice(p.length);
    for (const s of RUDE_SUFFIX) {
      if (!core.endsWith(s)) continue;
      const w = core.slice(0, core.length - s.length);
      if (RUDE_SET_AR.has(w) && (w.length > 2 || (SHORT_PREFIX.includes(p) && SHORT_SUFFIX.includes(s)))) return true;
    }
  }
  return false;
}
// true if the text has a rude word in it
function isRude(text) {
  const n = rudeNorm(text);
  const tokens = n.split(/[^\p{L}\p{N}@$]+/u).filter(Boolean);
  if (tokens.some(rudeToken)) return true;
  // letters spread out to sneak past: «ش ر م و ط», «f.u.c.k»
  const joined = tokens.join("");
  return tokens.length > 2 && tokens.every((t) => t.length <= 2) && rudeToken(joined);
}
// a name to show everyone: rude ones become «لاعب ٣»
const cleanName = (name, n) => (isRude(name) ? `لاعب ${AR(n || 1)}` : name);

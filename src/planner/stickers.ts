/**
 * Built-in sticker packs, drawn as SVG on a 100×100 canvas. The die-cut white
 * edge and shadow come from the `.planner-sticker` CSS filter, so uploaded
 * PNGs get the same look.
 */

const svg = (body: string, viewBox = '0 0 100 100') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

/** n petals (ellipses) arranged around a centre. */
const petals = (cx: number, cy: number, n: number, rx: number, ry: number, dist: number, fill: string, stroke: string, sw = 2.5, offset = 0) =>
  Array.from(
    { length: n },
    (_, i) =>
      `<ellipse cx="${cx}" cy="${cy - dist}" rx="${rx}" ry="${ry}" transform="rotate(${offset + (i * 360) / n} ${cx} ${cy})" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`
  ).join('');

/** Leaves along a stem from (x1,y1) to (x2,y2), alternating sides. */
const sprigLeaves = (x1: number, y1: number, x2: number, y2: number, count: number, len: number, fill: string, stroke: string) =>
  Array.from({ length: count }, (_, i) => {
    const t = (i + 1) / (count + 1);
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    const side = i % 2 === 0 ? -1 : 1;
    const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI + side * 50;
    return `<ellipse cx="${x + (len / 2) * Math.cos((angle * Math.PI) / 180)}" cy="${y + (len / 2) * Math.sin((angle * Math.PI) / 180)}" rx="${len / 2}" ry="${len / 5}" transform="rotate(${angle} ${x + (len / 2) * Math.cos((angle * Math.PI) / 180)} ${y + (len / 2) * Math.sin((angle * Math.PI) / 180)})" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
  }).join('');

// ---------------------------------------------------------------- Flowers
const F = { ink: '#1b1b1b', orange: '#FB8C47', peach: '#FDBA8C', cream: '#FFE3C7', lav: '#9B7FD1', lavDark: '#6E52A8', leaf: '#5E8C4A' };

const flowers = {
  bloom: svg(
    petals(50, 50, 5, 15, 21, 20, F.orange, F.ink, 3) +
      `<circle cx="50" cy="50" r="11" fill="${F.cream}" stroke="${F.ink}" stroke-width="3"/>` +
      `<circle cx="46" cy="47" r="1.8" fill="${F.ink}"/><circle cx="54" cy="48" r="1.8" fill="${F.ink}"/><circle cx="50" cy="55" r="1.8" fill="${F.ink}"/>`
  ),
  daisy: svg(
    petals(50, 50, 12, 6.5, 17, 22, '#ffffff', F.ink, 2.5) +
      `<circle cx="50" cy="50" r="12" fill="${F.orange}" stroke="${F.ink}" stroke-width="3"/>`
  ),
  tulip: svg(
    `<path d="M50 58 Q48 76 50 94" fill="none" stroke="${F.leaf}" stroke-width="4"/>` +
      `<path d="M50 88 Q30 82 28 62 Q44 68 50 82" fill="${F.leaf}" stroke="${F.ink}" stroke-width="2.5"/>` +
      `<path d="M32 36 Q32 14 40 12 L50 26 L60 12 Q68 14 68 36 Q68 60 50 60 Q32 60 32 36Z" fill="${F.orange}" stroke="${F.ink}" stroke-width="3"/>` +
      `<path d="M50 26 Q46 40 50 58" fill="none" stroke="${F.ink}" stroke-width="2"/>`
  ),
  lavender: svg(
    `<path d="M50 96 Q52 60 50 14" fill="none" stroke="${F.leaf}" stroke-width="3.5"/>` +
      `<path d="M50 84 Q36 76 34 62 Q46 66 50 78" fill="${F.leaf}" stroke="${F.ink}" stroke-width="2"/>` +
      Array.from({ length: 7 }, (_, i) => {
        const y = 18 + i * 8;
        return `<ellipse cx="${44}" cy="${y}" rx="5" ry="7" transform="rotate(-25 44 ${y})" fill="${i % 2 ? F.lav : F.lavDark}" stroke="${F.ink}" stroke-width="1.8"/>` +
          `<ellipse cx="${56}" cy="${y + 4}" rx="5" ry="7" transform="rotate(25 56 ${y + 4})" fill="${i % 2 ? F.lavDark : F.lav}" stroke="${F.ink}" stroke-width="1.8"/>`;
      }).join('')
  ),
  sprig: svg(
    `<path d="M20 90 Q45 60 80 12" fill="none" stroke="${F.orange}" stroke-width="3"/>` +
      sprigLeaves(20, 90, 80, 12, 6, 22, '#ffffff', F.orange)
  ),
  bouquet: svg(
    `<path d="M70 120 Q60 90 40 60" fill="none" stroke="${F.ink}" stroke-width="2.5"/>` +
      `<path d="M70 120 Q78 80 92 50" fill="none" stroke="${F.ink}" stroke-width="2.5"/>` +
      `<path d="M70 120 Q66 70 70 28" fill="none" stroke="${F.orange}" stroke-width="2.5"/>` +
      sprigLeaves(70, 120, 70, 28, 5, 18, '#ffffff', F.orange) +
      petals(40, 58, 5, 11, 15, 14, '#ffffff', F.orange, 2.5) +
      `<circle cx="40" cy="58" r="6" fill="${F.orange}" stroke="${F.ink}" stroke-width="2"/>` +
      petals(92, 50, 6, 9, 13, 12, '#ffffff', F.ink, 2.2, 15) +
      `<circle cx="92" cy="50" r="5" fill="${F.peach}" stroke="${F.ink}" stroke-width="2"/>` +
      petals(72, 92, 5, 10, 14, 13, F.peach, F.ink, 2.2, 30) +
      `<circle cx="72" cy="92" r="5" fill="${F.orange}" stroke="${F.ink}" stroke-width="2"/>`,
    '0 0 120 140'
  ),
  butterfly: svg(
    `<path d="M50 50 Q30 18 14 28 Q6 46 50 52Z" fill="${F.orange}" stroke="${F.ink}" stroke-width="3"/>` +
      `<path d="M50 50 Q70 18 86 28 Q94 46 50 52Z" fill="${F.orange}" stroke="${F.ink}" stroke-width="3"/>` +
      `<path d="M50 52 Q28 58 24 74 Q36 82 50 56Z" fill="${F.peach}" stroke="${F.ink}" stroke-width="3"/>` +
      `<path d="M50 52 Q72 58 76 74 Q64 82 50 56Z" fill="${F.peach}" stroke="${F.ink}" stroke-width="3"/>` +
      `<ellipse cx="50" cy="52" rx="3.5" ry="16" fill="${F.ink}"/>` +
      `<path d="M49 37 Q44 26 40 24 M51 37 Q56 26 60 24" fill="none" stroke="${F.ink}" stroke-width="2"/>` +
      `<circle cx="26" cy="34" r="3" fill="#ffffff"/><circle cx="74" cy="34" r="3" fill="#ffffff"/>`
  ),
  heart: svg(
    `<path d="M50 84 C20 64 12 46 18 32 C24 18 42 16 50 32 C58 16 76 18 82 32 C88 46 80 64 50 84Z" fill="${F.orange}" stroke="${F.ink}" stroke-width="3"/>` +
      `<path d="M28 34 Q30 28 36 27" fill="none" stroke="#ffffff" stroke-width="3.5"/>`
  ),
};

// ---------------------------------------------------------------- Cactus
const C = { ink: '#2D4A22', green: '#5BA84A', dark: '#3F7E35', lime: '#C6E15B', pot: '#E07A4F', potDark: '#B85A35', pink: '#F48FB1', sun: '#FFD54F' };

const pot = (y = 66) =>
  `<path d="M28 ${y} L72 ${y} L66 ${y + 28} L34 ${y + 28}Z" fill="${C.pot}" stroke="${C.ink}" stroke-width="3"/>` +
  `<rect x="24" y="${y - 6}" width="52" height="10" rx="3" fill="${C.potDark}" stroke="${C.ink}" stroke-width="3"/>`;

const prickles = (pts: [number, number][]) =>
  pts.map(([x, y]) => `<path d="M${x - 2} ${y} L${x + 2} ${y} M${x} ${y - 2} L${x} ${y + 2}" stroke="${C.ink}" stroke-width="1.5"/>`).join('');

const cactus = {
  saguaro: svg(
    `<path d="M40 62 L40 18 Q40 8 50 8 Q60 8 60 18 L60 62Z" fill="${C.green}" stroke="${C.ink}" stroke-width="3"/>` +
      `<path d="M40 44 L30 44 Q22 44 22 36 L22 26 Q22 20 27 20 Q32 20 32 26 L32 34 L40 34" fill="${C.green}" stroke="${C.ink}" stroke-width="3"/>` +
      `<path d="M60 38 L70 38 Q78 38 78 30 L78 22 Q78 16 73 16 Q68 16 68 22 L68 28 L60 28" fill="${C.green}" stroke="${C.ink}" stroke-width="3"/>` +
      `<path d="M50 14 L50 60" stroke="${C.dark}" stroke-width="2"/>` +
      prickles([[45, 22], [55, 30], [45, 40], [55, 50], [27, 28], [73, 24]]) +
      pot()
  ),
  barrel: svg(
    `<ellipse cx="50" cy="44" rx="22" ry="24" fill="${C.green}" stroke="${C.ink}" stroke-width="3"/>` +
      `<path d="M40 24 Q34 44 40 66 M50 20 L50 68 M60 24 Q66 44 60 66" fill="none" stroke="${C.dark}" stroke-width="2"/>` +
      petals(50, 20, 6, 5, 8, 7, C.pink, C.ink, 2) +
      `<circle cx="50" cy="20" r="3.5" fill="${C.sun}" stroke="${C.ink}" stroke-width="1.5"/>` +
      prickles([[34, 40], [45, 34], [55, 48], [66, 38], [44, 56], [58, 60]]) +
      pot()
  ),
  pear: svg(
    `<ellipse cx="50" cy="66" rx="16" ry="22" fill="${C.green}" stroke="${C.ink}" stroke-width="3"/>` +
      `<ellipse cx="34" cy="38" rx="12" ry="17" transform="rotate(-25 34 38)" fill="${C.lime}" stroke="${C.ink}" stroke-width="3"/>` +
      `<ellipse cx="66" cy="34" rx="12" ry="17" transform="rotate(20 66 34)" fill="${C.green}" stroke="${C.ink}" stroke-width="3"/>` +
      petals(30, 20, 5, 4, 6, 5, C.pink, C.ink, 1.8) +
      petals(70, 15, 5, 4, 6, 5, C.pink, C.ink, 1.8) +
      prickles([[45, 60], [55, 72], [48, 80], [32, 40], [38, 32], [64, 30], [70, 42]])
  ),
  rosette: svg(
    petals(50, 50, 8, 10, 20, 22, C.dark, C.ink, 2.5) +
      petals(50, 50, 8, 9, 16, 15, C.green, C.ink, 2.5, 22) +
      petals(50, 50, 6, 7, 11, 8, C.lime, C.ink, 2.2) +
      `<circle cx="50" cy="50" r="4" fill="${C.lime}" stroke="${C.ink}" stroke-width="2"/>`
  ),
  aloe: svg(
    `<path d="M50 66 Q46 30 50 6 Q56 34 52 66Z" fill="${C.green}" stroke="${C.ink}" stroke-width="2.5"/>` +
      `<path d="M46 66 Q30 40 16 26 Q40 34 50 64Z" fill="${C.dark}" stroke="${C.ink}" stroke-width="2.5"/>` +
      `<path d="M54 66 Q70 40 84 26 Q60 34 50 64Z" fill="${C.dark}" stroke="${C.ink}" stroke-width="2.5"/>` +
      `<path d="M44 66 Q34 52 22 48 Q38 50 48 64Z" fill="${C.lime}" stroke="${C.ink}" stroke-width="2.5"/>` +
      `<path d="M56 66 Q66 52 78 48 Q62 50 52 64Z" fill="${C.lime}" stroke="${C.ink}" stroke-width="2.5"/>` +
      pot()
  ),
  sun: svg(
    Array.from({ length: 12 }, (_, i) =>
      `<path d="M50 6 L55 20 L45 20Z" transform="rotate(${i * 30} 50 50)" fill="${C.lime}" stroke="${C.ink}" stroke-width="2"/>`
    ).join('') +
      `<circle cx="50" cy="50" r="24" fill="${C.sun}" stroke="${C.ink}" stroke-width="3"/>` +
      `<path d="M41 47 Q43 44 45 47 M55 47 Q57 44 59 47 M42 56 Q50 63 58 56" fill="none" stroke="${C.ink}" stroke-width="2.5"/>`
  ),
  bloom: svg(
    petals(50, 50, 6, 13, 20, 18, C.pink, C.ink, 3) +
      `<circle cx="50" cy="50" r="10" fill="${C.sun}" stroke="${C.ink}" stroke-width="3"/>`
  ),
  mini: svg(
    `<path d="M38 64 Q34 40 50 36 Q66 40 62 64Z" fill="${C.lime}" stroke="${C.ink}" stroke-width="3"/>` +
      `<path d="M50 38 L50 64" stroke="${C.green}" stroke-width="2"/>` +
      `<circle cx="44" cy="52" r="1.8" fill="${C.ink}"/><circle cx="56" cy="52" r="1.8" fill="${C.ink}"/>` +
      `<path d="M46 57 Q50 60 54 57" fill="none" stroke="${C.ink}" stroke-width="2"/>` +
      `<circle cx="40" cy="56" r="2.5" fill="${C.pink}"/><circle cx="60" cy="56" r="2.5" fill="${C.pink}"/>` +
      pot(66)
  ),
};

// ---------------------------------------------------------------- Fall
const A = { ink: '#4A2C17', brown: '#A0522D', rust: '#C9622B', mustard: '#E3A857', dark: '#6B3E22', red: '#B5442B', olive: '#7A8B3A', cream: '#FFF3DC' };

const fall = {
  maple: svg(
    `<path d="M50 6 L57 26 L72 18 L68 36 L88 34 L76 48 L90 58 L68 60 L72 76 L54 66 L52 90 L48 90 L46 66 L28 76 L32 60 L10 58 L24 48 L12 34 L32 36 L28 18 L43 26Z" fill="${A.rust}" stroke="${A.ink}" stroke-width="3"/>` +
      `<path d="M50 90 L50 30 M50 58 L30 44 M50 58 L70 44" fill="none" stroke="${A.ink}" stroke-width="2"/>`
  ),
  oak: svg(
    `<path d="M50 92 L50 80 Q36 82 34 72 Q22 72 26 60 Q14 56 24 46 Q14 38 28 32 Q24 18 40 20 Q42 8 50 8 Q58 8 60 20 Q76 18 72 32 Q86 38 76 46 Q86 56 74 60 Q78 72 66 72 Q64 82 50 80Z" fill="${A.mustard}" stroke="${A.ink}" stroke-width="3"/>` +
      `<path d="M50 88 L50 16 M50 40 L36 32 M50 40 L64 32 M50 58 L34 52 M50 58 L66 52" fill="none" stroke="${A.ink}" stroke-width="2"/>`
  ),
  acorn: svg(
    `<path d="M30 46 Q30 88 50 92 Q70 88 70 46Z" fill="${A.mustard}" stroke="${A.ink}" stroke-width="3"/>` +
      `<path d="M22 46 Q22 24 50 22 Q78 24 78 46Z" fill="${A.dark}" stroke="${A.ink}" stroke-width="3"/>` +
      `<path d="M32 34 L40 42 M44 28 L52 40 M58 28 L64 40 M68 34 L72 40" fill="none" stroke="${A.mustard}" stroke-width="2"/>` +
      `<path d="M50 22 Q52 12 60 10" fill="none" stroke="${A.ink}" stroke-width="3.5"/>` +
      `<path d="M38 56 Q38 74 48 82" fill="none" stroke="${A.cream}" stroke-width="3"/>`
  ),
  mushroom: svg(
    `<path d="M40 52 Q38 80 34 88 L66 88 Q62 80 60 52Z" fill="${A.cream}" stroke="${A.ink}" stroke-width="3"/>` +
      `<path d="M12 54 Q14 14 50 12 Q86 14 88 54Z" fill="${A.red}" stroke="${A.ink}" stroke-width="3"/>` +
      `<circle cx="34" cy="34" r="6" fill="${A.cream}"/><circle cx="58" cy="26" r="5" fill="${A.cream}"/><circle cx="70" cy="42" r="5" fill="${A.cream}"/><circle cx="46" cy="46" r="3.5" fill="${A.cream}"/>`
  ),
  pumpkin: svg(
    `<ellipse cx="34" cy="60" rx="20" ry="26" fill="${A.rust}" stroke="${A.ink}" stroke-width="3"/>` +
      `<ellipse cx="66" cy="60" rx="20" ry="26" fill="${A.rust}" stroke="${A.ink}" stroke-width="3"/>` +
      `<ellipse cx="50" cy="60" rx="18" ry="28" fill="#D9762F" stroke="${A.ink}" stroke-width="3"/>` +
      `<path d="M50 34 Q48 22 54 14" fill="none" stroke="${A.dark}" stroke-width="5"/>` +
      `<path d="M54 26 Q70 14 78 24 Q66 30 54 28Z" fill="${A.olive}" stroke="${A.ink}" stroke-width="2.5"/>`
  ),
  mug: svg(
    `<path d="M22 40 L70 40 L66 86 Q65 92 58 92 L34 92 Q27 92 26 86Z" fill="${A.brown}" stroke="${A.ink}" stroke-width="3"/>` +
      `<path d="M69 50 Q86 50 84 64 Q82 76 66 74" fill="none" stroke="${A.ink}" stroke-width="5"/>` +
      `<path d="M46 76 C38 70 36 64 40 60 C43 57 46 59 46 62 C46 59 49 57 52 60 C56 64 54 70 46 76Z" fill="${A.cream}"/>` +
      `<path d="M36 32 Q32 24 36 18 Q40 12 36 6 M50 32 Q46 24 50 18 Q54 12 50 6" fill="none" stroke="${A.ink}" stroke-width="2.5"/>`
  ),
  pinecone: svg(
    `<path d="M50 10 Q76 30 70 66 Q64 90 50 92 Q36 90 30 66 Q24 30 50 10Z" fill="${A.dark}" stroke="${A.ink}" stroke-width="3"/>` +
      [24, 38, 52, 66, 80].map((y, r) =>
        Array.from({ length: r % 2 ? 3 : 2 }, (_, i) => {
          const x = r % 2 ? 38 + i * 12 : 44 + i * 12;
          return `<path d="M${x - 6} ${y} Q${x} ${y + 9} ${x + 6} ${y}" fill="${A.mustard}" stroke="${A.ink}" stroke-width="2"/>`;
        }).join('')
      ).join('')
  ),
  apple: svg(
    `<path d="M50 30 Q30 18 20 36 Q10 62 30 82 Q40 92 50 86 Q60 92 70 82 Q90 62 80 36 Q70 18 50 30Z" fill="${A.red}" stroke="${A.ink}" stroke-width="3"/>` +
      `<path d="M50 30 Q48 18 52 8" fill="none" stroke="${A.ink}" stroke-width="4"/>` +
      `<path d="M53 18 Q66 6 76 14 Q66 24 53 20Z" fill="${A.olive}" stroke="${A.ink}" stroke-width="2.5"/>` +
      `<path d="M28 44 Q30 36 36 34" fill="none" stroke="${A.cream}" stroke-width="3.5"/>`
  ),
};

// ---------------------------------------------------------------- Pineapple
const P = { ink: '#5A3A00', yellow: '#F7C21A', light: '#FFE680', orange: '#F2711C', green: '#3FA34D', leaf: '#2E7D3A', pink: '#FF7AA2' };

const pineapple = {
  pineapple: svg(
    `<path d="M50 30 Q40 14 30 10 Q44 14 50 26 Q50 8 50 4 Q54 14 52 26 Q58 12 72 10 Q60 16 52 30Z" fill="${P.green}" stroke="${P.ink}" stroke-width="2.5"/>` +
      `<clipPath id="pb"><ellipse cx="50" cy="62" rx="24" ry="32"/></clipPath>` +
      `<ellipse cx="50" cy="62" rx="24" ry="32" fill="${P.yellow}"/>` +
      `<g clip-path="url(#pb)" stroke="${P.orange}" stroke-width="2">` +
      [-40, -24, -8, 8, 24, 40, 56].map((o) => `<path d="M${10 + o} 20 L${70 + o} 100 M${90 - o} 20 L${30 - o} 100"/>`).join('') +
      `</g>` +
      `<ellipse cx="50" cy="62" rx="24" ry="32" fill="none" stroke="${P.ink}" stroke-width="3"/>`
  ),
  slice: svg(
    `<path d="M10 40 A40 40 0 0 0 90 40Z" fill="${P.yellow}" stroke="${P.ink}" stroke-width="3"/>` +
      `<path d="M20 40 A30 30 0 0 0 80 40" fill="none" stroke="${P.light}" stroke-width="4"/>` +
      `<path d="M42 40 A8 8 0 0 0 58 40Z" fill="${P.light}" stroke="${P.ink}" stroke-width="2"/>` +
      `<path d="M50 48 L50 74 M44 46 L30 66 M56 46 L70 66" stroke="${P.orange}" stroke-width="2"/>` +
      `<path d="M10 40 L14 30 L90 30 L90 40Z" fill="${P.green}" stroke="${P.ink}" stroke-width="2.5"/>`
  ),
  sun: svg(
    Array.from({ length: 10 }, (_, i) =>
      `<path d="M50 4 L57 20 L43 20Z" transform="rotate(${i * 36} 50 50)" fill="${P.orange}" stroke="${P.ink}" stroke-width="2"/>`
    ).join('') +
      `<circle cx="50" cy="50" r="25" fill="${P.yellow}" stroke="${P.ink}" stroke-width="3"/>` +
      `<path d="M38 42 L46 42 M54 42 L62 42 M41 54 Q50 62 59 54" fill="none" stroke="${P.ink}" stroke-width="3"/>`
  ),
  hibiscus: svg(
    petals(50, 50, 5, 16, 22, 20, P.pink, P.ink, 3) +
      `<circle cx="50" cy="50" r="8" fill="#E04A7A" stroke="${P.ink}" stroke-width="2"/>` +
      `<path d="M50 50 Q60 34 72 26" fill="none" stroke="${P.yellow}" stroke-width="3"/>` +
      `<circle cx="72" cy="26" r="3.5" fill="${P.yellow}" stroke="${P.ink}" stroke-width="1.5"/>`
  ),
  palm: svg(
    `<path d="M14 90 Q50 60 88 14" fill="none" stroke="${P.leaf}" stroke-width="4"/>` +
      sprigLeaves(14, 90, 88, 14, 10, 26, P.green, P.ink)
  ),
  lemon: svg(
    `<path d="M14 54 Q20 26 50 24 Q80 26 86 54 Q80 82 50 84 Q20 82 14 54Z" fill="${P.yellow}" stroke="${P.ink}" stroke-width="3"/>` +
      `<path d="M50 24 Q56 10 70 8 Q66 22 54 26Z" fill="${P.green}" stroke="${P.ink}" stroke-width="2.5"/>` +
      `<path d="M28 46 Q32 38 40 36" fill="none" stroke="#ffffff" stroke-width="3.5"/>`
  ),
  orange: svg(
    `<circle cx="50" cy="50" r="38" fill="${P.orange}" stroke="${P.ink}" stroke-width="3"/>` +
      `<circle cx="50" cy="50" r="31" fill="#FFB067"/>` +
      Array.from({ length: 8 }, (_, i) =>
        `<path d="M50 50 L50 22" transform="rotate(${i * 45} 50 50)" stroke="#FFE2C2" stroke-width="3"/>`
      ).join('') +
      `<circle cx="50" cy="50" r="4" fill="#FFE2C2"/>`
  ),
  drink: svg(
    `<path d="M26 30 L74 30 L66 90 L34 90Z" fill="${P.light}" stroke="${P.ink}" stroke-width="3"/>` +
      `<path d="M30 50 L70 50 L66 90 L34 90Z" fill="${P.orange}" opacity="0.85"/>` +
      `<path d="M28 40 L72 40 L70 54 L30 54Z" fill="${P.yellow}" opacity="0.9"/>` +
      `<path d="M26 30 L74 30 L66 90 L34 90Z" fill="none" stroke="${P.ink}" stroke-width="3"/>` +
      `<path d="M56 30 L66 6 L72 8" fill="none" stroke="${P.pink}" stroke-width="4"/>` +
      `<path d="M22 32 A14 14 0 0 1 44 20Z" fill="${P.yellow}" stroke="${P.ink}" stroke-width="2.5"/>`
  ),
};

const PACKS = { flowers, cactus, fall, pineapple } as const;

export type PackId = keyof typeof PACKS;

/** Sticker ids in a pack, e.g. 'cactus/saguaro'. */
export const packStickerIds = (pack: PackId) => Object.keys(PACKS[pack]).map((name) => `${pack}/${name}`);

const urlCache = new Map<string, string>();

/** Image URL for a built-in sticker id ('cactus/saguaro'). */
export function packStickerUrl(id: string): string | undefined {
  const cached = urlCache.get(id);
  if (cached) return cached;
  const [pack, name] = id.split('/');
  const markup = (PACKS as Record<string, Record<string, string>>)[pack]?.[name];
  if (!markup) return undefined;
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  urlCache.set(id, url);
  return url;
}

/** Raw markup of every sticker, for the preview sheet script. */
export const ALL_STICKERS: Record<string, string> = Object.fromEntries(
  Object.entries(PACKS).flatMap(([pack, items]) => Object.entries(items).map(([name, markup]) => [`${pack}/${name}`, markup]))
);

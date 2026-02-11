import React from 'react';

/**
 * SVG Mannequin Preview Component
 * Renders a mannequin figure with clothing overlay that updates based on:
 * - gender (male/female/kids)
 * - clothingType (Shirt, Pant, Dress, etc.)
 * - fabricColor (hex code)
 * - patternName (Solid, Striped, Checked, etc.)
 */

const PATTERN_DEFS = {
  Striped: (color) => (
    <pattern id="pat-striped" patternUnits="userSpaceOnUse" width="10" height="10">
      <rect width="10" height="10" fill={color} />
      <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
    </pattern>
  ),
  Checked: (color) => (
    <pattern id="pat-checked" patternUnits="userSpaceOnUse" width="14" height="14">
      <rect width="14" height="14" fill={color} />
      <rect width="7" height="7" fill="rgba(255,255,255,0.15)" />
      <rect x="7" y="7" width="7" height="7" fill="rgba(255,255,255,0.15)" />
    </pattern>
  ),
  Plaid: (color) => (
    <pattern id="pat-plaid" patternUnits="userSpaceOnUse" width="20" height="20">
      <rect width="20" height="20" fill={color} />
      <line x1="0" y1="5" x2="20" y2="5" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
      <line x1="0" y1="15" x2="20" y2="15" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
      <line x1="5" y1="0" x2="5" y2="20" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
      <line x1="15" y1="0" x2="15" y2="20" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
    </pattern>
  ),
  Polka: (color) => (
    <pattern id="pat-polka" patternUnits="userSpaceOnUse" width="16" height="16">
      <rect width="16" height="16" fill={color} />
      <circle cx="4" cy="4" r="2" fill="rgba(255,255,255,0.3)" />
      <circle cx="12" cy="12" r="2" fill="rgba(255,255,255,0.3)" />
    </pattern>
  ),
  Floral: (color) => (
    <pattern id="pat-floral" patternUnits="userSpaceOnUse" width="20" height="20">
      <rect width="20" height="20" fill={color} />
      <circle cx="10" cy="10" r="3" fill="rgba(255,255,255,0.2)" />
      <circle cx="10" cy="7" r="1.5" fill="rgba(255,255,255,0.15)" />
      <circle cx="13" cy="10" r="1.5" fill="rgba(255,255,255,0.15)" />
      <circle cx="10" cy="13" r="1.5" fill="rgba(255,255,255,0.15)" />
      <circle cx="7" cy="10" r="1.5" fill="rgba(255,255,255,0.15)" />
    </pattern>
  ),
  Herringbone: (color) => (
    <pattern id="pat-herringbone" patternUnits="userSpaceOnUse" width="12" height="12">
      <rect width="12" height="12" fill={color} />
      <path d="M0,6 L6,0 L12,6" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" />
      <path d="M0,12 L6,6 L12,12" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" />
    </pattern>
  ),
  'Pin Stripe': (color) => (
    <pattern id="pat-pinstripe" patternUnits="userSpaceOnUse" width="8" height="8">
      <rect width="8" height="8" fill={color} />
      <line x1="4" y1="0" x2="4" y2="8" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
    </pattern>
  ),
  Paisley: (color) => (
    <pattern id="pat-paisley" patternUnits="userSpaceOnUse" width="18" height="18">
      <rect width="18" height="18" fill={color} />
      <path d="M9,3 Q14,5 12,10 Q10,14 6,12 Q2,10 4,6 Q6,2 9,3Z" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="rgba(255,255,255,0.08)" />
    </pattern>
  ),
};

const getPatternId = (name) => {
  const map = {
    'Striped': 'pat-striped', 'Checked': 'pat-checked', 'Plaid': 'pat-plaid',
    'Polka Dot': 'pat-polka', 'Polka': 'pat-polka', 'Floral': 'pat-floral',
    'Herringbone': 'pat-herringbone', 'Pin Stripe': 'pat-pinstripe', 'Paisley': 'pat-paisley',
  };
  return map[name] || null;
};

const getPatternDef = (name, color) => {
  const normalized = Object.keys(PATTERN_DEFS).find(
    (k) => name?.toLowerCase().includes(k.toLowerCase())
  );
  return normalized ? PATTERN_DEFS[normalized](color) : null;
};

const getFill = (color, patternName) => {
  if (!color) return '#ccc';
  const patId = getPatternId(patternName);
  if (patId && patternName && patternName !== 'Solid') return `url(#${patId})`;
  return color;
};

/* ═══════════════════════════════════════════════════════
   BASE MANNEQUIN BODIES
   ═══════════════════════════════════════════════════════ */

const MaleBody = () => (
  <g className="mannequin-body">
    {/* Head */}
    <ellipse cx="150" cy="52" rx="26" ry="30" fill="#e8d5c4" stroke="#c9b199" strokeWidth="1" />
    {/* Neck */}
    <rect x="141" y="80" width="18" height="18" rx="4" fill="#e8d5c4" />
    {/* Torso */}
    <path d="M110,98 L190,98 L195,200 L105,200 Z" fill="#e8d5c4" stroke="#c9b199" strokeWidth="1" />
    {/* Left Arm */}
    <path d="M110,98 L86,105 L74,180 L82,182 L96,115 L110,108" fill="#e8d5c4" stroke="#c9b199" strokeWidth="1" />
    {/* Right Arm */}
    <path d="M190,98 L214,105 L226,180 L218,182 L204,115 L190,108" fill="#e8d5c4" stroke="#c9b199" strokeWidth="1" />
    {/* Left Leg */}
    <path d="M105,200 L115,200 L120,340 L100,340 Z" fill="#e8d5c4" stroke="#c9b199" strokeWidth="1" />
    {/* Right Leg */}
    <path d="M185,200 L195,200 L200,340 L180,340 Z" fill="#e8d5c4" stroke="#c9b199" strokeWidth="1" />
    {/* Feet */}
    <ellipse cx="110" cy="345" rx="16" ry="8" fill="#c9b199" />
    <ellipse cx="190" cy="345" rx="16" ry="8" fill="#c9b199" />
  </g>
);

const FemaleBody = () => (
  <g className="mannequin-body">
    {/* Head */}
    <ellipse cx="150" cy="50" rx="24" ry="28" fill="#f0ddd0" stroke="#d4b9a4" strokeWidth="1" />
    {/* Hair */}
    <path d="M126,42 Q128,18 150,15 Q172,18 174,42" fill="#5a3825" stroke="none" />
    {/* Neck */}
    <rect x="143" y="76" width="14" height="18" rx="4" fill="#f0ddd0" />
    {/* Torso — feminine shape */}
    <path d="M115,94 L185,94 L188,130 Q192,155 185,170 L190,200 L110,200 L115,170 Q108,155 112,130 Z" fill="#f0ddd0" stroke="#d4b9a4" strokeWidth="1" />
    {/* Left Arm */}
    <path d="M115,94 L90,102 L78,175 L86,177 L96,110 L115,104" fill="#f0ddd0" stroke="#d4b9a4" strokeWidth="1" />
    {/* Right Arm */}
    <path d="M185,94 L210,102 L222,175 L214,177 L204,110 L185,104" fill="#f0ddd0" stroke="#d4b9a4" strokeWidth="1" />
    {/* Left Leg */}
    <path d="M110,200 L122,200 L126,340 L106,340 Z" fill="#f0ddd0" stroke="#d4b9a4" strokeWidth="1" />
    {/* Right Leg */}
    <path d="M178,200 L190,200 L194,340 L174,340 Z" fill="#f0ddd0" stroke="#d4b9a4" strokeWidth="1" />
    {/* Feet */}
    <ellipse cx="116" cy="345" rx="14" ry="7" fill="#d4b9a4" />
    <ellipse cx="184" cy="345" rx="14" ry="7" fill="#d4b9a4" />
  </g>
);

const KidsBody = () => (
  <g className="mannequin-body" transform="translate(25,40) scale(0.85)">
    {/* Head — bigger proportionally */}
    <ellipse cx="150" cy="52" rx="28" ry="30" fill="#f5e0d0" stroke="#d4b9a4" strokeWidth="1" />
    {/* Hair */}
    <path d="M124,44 Q130,20 150,18 Q170,20 176,44" fill="#6b4226" stroke="none" />
    {/* Neck */}
    <rect x="143" y="80" width="14" height="14" rx="4" fill="#f5e0d0" />
    {/* Torso */}
    <path d="M118,94 L182,94 L185,190 L115,190 Z" fill="#f5e0d0" stroke="#d4b9a4" strokeWidth="1" />
    {/* Left Arm */}
    <path d="M118,94 L96,100 L88,165 L96,167 L102,108 L118,102" fill="#f5e0d0" stroke="#d4b9a4" strokeWidth="1" />
    {/* Right Arm */}
    <path d="M182,94 L204,100 L212,165 L204,167 L198,108 L182,102" fill="#f5e0d0" stroke="#d4b9a4" strokeWidth="1" />
    {/* Left Leg */}
    <path d="M115,190 L128,190 L132,310 L112,310 Z" fill="#f5e0d0" stroke="#d4b9a4" strokeWidth="1" />
    {/* Right Leg */}
    <path d="M172,190 L185,190 L188,310 L170,310 Z" fill="#f5e0d0" stroke="#d4b9a4" strokeWidth="1" />
    {/* Feet */}
    <ellipse cx="122" cy="314" rx="14" ry="7" fill="#d4b9a4" />
    <ellipse cx="179" cy="314" rx="14" ry="7" fill="#d4b9a4" />
  </g>
);

/* ═══════════════════════════════════════════════════════
   CLOTHING OVERLAYS
   ═══════════════════════════════════════════════════════ */

// MALE overlays
const MaleShirt = ({ fill }) => (
  <g className="clothing-overlay">
    <path d="M110,98 L190,98 L195,200 L105,200 Z" fill={fill} stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
    {/* Collar */}
    <path d="M135,96 L150,110 L165,96" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" />
    {/* Buttons */}
    <circle cx="150" cy="125" r="2" fill="rgba(0,0,0,0.15)" />
    <circle cx="150" cy="145" r="2" fill="rgba(0,0,0,0.15)" />
    <circle cx="150" cy="165" r="2" fill="rgba(0,0,0,0.15)" />
    <circle cx="150" cy="185" r="2" fill="rgba(0,0,0,0.15)" />
    {/* Sleeves */}
    <path d="M110,98 L86,105 L90,140 L96,115 L110,108" fill={fill} stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
    <path d="M190,98 L214,105 L210,140 L204,115 L190,108" fill={fill} stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
  </g>
);

const MalePant = ({ fill }) => (
  <g className="clothing-overlay">
    {/* Waistband */}
    <rect x="103" y="196" width="94" height="12" rx="2" fill={fill} stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
    {/* Left leg */}
    <path d="M103,208 L148,208 L144,340 L98,340 Z" fill={fill} stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
    {/* Right leg */}
    <path d="M152,208 L197,208 L202,340 L156,340 Z" fill={fill} stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
    {/* Center line */}
    <line x1="150" y1="208" x2="150" y2="230" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
  </g>
);

const MaleKurta = ({ fill }) => (
  <g className="clothing-overlay">
    <path d="M108,98 L192,98 L196,260 L104,260 Z" fill={fill} stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
    {/* Collar band */}
    <path d="M140,96 L150,106 L160,96" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" />
    {/* Front slit */}
    <line x1="150" y1="106" x2="150" y2="260" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
    {/* Sleeves */}
    <path d="M108,98 L84,106 L88,155 L96,115 L108,106" fill={fill} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    <path d="M192,98 L216,106 L212,155 L204,115 L192,106" fill={fill} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    {/* Embroidery hint */}
    <path d="M140,98 L150,108 L160,98" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
  </g>
);

const MaleSuit = ({ fill }) => (
  <g className="clothing-overlay">
    {/* Jacket body */}
    <path d="M108,98 L192,98 L196,210 L104,210 Z" fill={fill} stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
    {/* Lapels */}
    <path d="M135,98 L145,130 L150,98" fill="rgba(255,255,255,0.1)" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
    <path d="M165,98 L155,130 L150,98" fill="rgba(255,255,255,0.1)" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
    {/* Buttons */}
    <circle cx="148" cy="155" r="2.5" fill="rgba(0,0,0,0.2)" />
    <circle cx="148" cy="175" r="2.5" fill="rgba(0,0,0,0.2)" />
    {/* Pocket lines */}
    <line x1="115" y1="160" x2="140" y2="160" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    <line x1="160" y1="160" x2="185" y2="160" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    {/* Sleeves */}
    <path d="M108,98 L84,106 L80,175 L88,177 L96,115 L108,106" fill={fill} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    <path d="M192,98 L216,106 L220,175 L212,177 L204,115 L192,106" fill={fill} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
  </g>
);

const MaleBlazer = ({ fill }) => (
  <g className="clothing-overlay">
    <path d="M108,98 L192,98 L194,205 L106,205 Z" fill={fill} stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
    {/* Lapels */}
    <path d="M137,98 L145,125 L150,98" fill="rgba(255,255,255,0.08)" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
    <path d="M163,98 L155,125 L150,98" fill="rgba(255,255,255,0.08)" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
    {/* Single button */}
    <circle cx="148" cy="160" r="2.5" fill="rgba(0,0,0,0.2)" />
    {/* Pocket */}
    <rect x="115" y="155" width="22" height="2" rx="1" fill="rgba(0,0,0,0.1)" />
    {/* Sleeves */}
    <path d="M108,98 L84,106 L80,178 L88,180 L96,115 L108,106" fill={fill} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    <path d="M192,98 L216,106 L220,178 L212,180 L204,115 L192,106" fill={fill} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
  </g>
);

const MaleSherwani = ({ fill }) => (
  <g className="clothing-overlay">
    {/* Long coat */}
    <path d="M106,98 L194,98 L198,300 L102,300 Z" fill={fill} stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
    {/* Mandarin collar */}
    <rect x="138" y="92" width="24" height="10" rx="3" fill={fill} stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
    {/* Button line */}
    {[120, 140, 160, 180, 200, 220, 240, 260].map((y) => (
      <circle key={y} cx="150" cy={y} r="2" fill="rgba(0,0,0,0.15)" />
    ))}
    {/* Embroidery at bottom */}
    <path d="M102,280 Q150,270 198,280" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
    <path d="M102,290 Q150,280 198,290" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
    {/* Sleeves */}
    <path d="M106,98 L82,106 L78,178 L86,180 L96,115 L106,106" fill={fill} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    <path d="M194,98 L218,106 L222,178 L214,180 L204,115 L194,106" fill={fill} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
  </g>
);

// FEMALE overlays
const FemaleBlouse = ({ fill }) => (
  <g className="clothing-overlay">
    <path d="M115,94 L185,94 L188,170 L112,170 Z" fill={fill} stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" />
    {/* V-neck */}
    <path d="M138,94 L150,115 L162,94" fill="rgba(255,255,255,0.08)" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
    {/* Sleeves */}
    <path d="M115,94 L92,102 L95,135 L100,110 L115,102" fill={fill} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    <path d="M185,94 L208,102 L205,135 L200,110 L185,102" fill={fill} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
  </g>
);

const FemaleSalwar = ({ fill }) => (
  <g className="clothing-overlay">
    {/* Top — kameez */}
    <path d="M113,94 L187,94 L190,240 L110,240 Z" fill={fill} stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" />
    {/* Neckline */}
    <path d="M140,94 L150,108 L160,94" fill="rgba(255,255,255,0.06)" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
    {/* Side slits */}
    <line x1="110" y1="210" x2="110" y2="240" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
    <line x1="190" y1="210" x2="190" y2="240" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
    {/* Sleeves */}
    <path d="M113,94 L90,102 L94,150 L100,110 L113,102" fill={fill} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    <path d="M187,94 L210,102 L206,150 L200,110 L187,102" fill={fill} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    {/* Salwar pants */}
    <path d="M108,240 L148,240 L140,340 L104,340 Z" fill={fill} stroke="rgba(0,0,0,0.08)" strokeWidth="1" opacity="0.85" />
    <path d="M152,240 L192,240 L196,340 L160,340 Z" fill={fill} stroke="rgba(0,0,0,0.08)" strokeWidth="1" opacity="0.85" />
  </g>
);

const FemaleLehenga = ({ fill }) => (
  <g className="clothing-overlay">
    {/* Choli (top) */}
    <path d="M118,94 L182,94 L185,155 L115,155 Z" fill={fill} stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" />
    {/* Neckline */}
    <path d="M135,94 L150,105 L165,94" fill="rgba(255,255,255,0.08)" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
    {/* Sleeves */}
    <path d="M118,94 L98,100 L100,130 L106,108 L118,100" fill={fill} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    <path d="M182,94 L202,100 L200,130 L194,108 L182,100" fill={fill} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    {/* Lehenga skirt */}
    <path d="M105,155 Q100,200 85,340 L215,340 Q200,200 195,155 Z" fill={fill} stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" opacity="0.9" />
    {/* Waistband */}
    <rect x="105" y="153" width="90" height="6" rx="2" fill="rgba(0,0,0,0.1)" />
    {/* Embroidery hint */}
    <path d="M95,310 Q150,295 205,310" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
  </g>
);

const FemaleDress = ({ fill }) => (
  <g className="clothing-overlay">
    <path d="M115,94 L185,94 L188,150 Q195,200 200,340 L100,340 Q105,200 112,150 Z" fill={fill} stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" />
    {/* Neckline */}
    <path d="M138,94 L150,108 L162,94" fill="rgba(255,255,255,0.06)" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
    {/* Waist shape */}
    <path d="M112,155 Q150,148 188,155" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
    {/* Sleeves */}
    <path d="M115,94 L92,100 L95,130 L100,108 L115,100" fill={fill} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    <path d="M185,94 L208,100 L205,130 L200,108 L185,100" fill={fill} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
  </g>
);

const FemaleKurti = ({ fill }) => (
  <g className="clothing-overlay">
    <path d="M113,94 L187,94 L190,270 L110,270 Z" fill={fill} stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" />
    {/* Neckline */}
    <path d="M140,94 L150,108 L160,94" fill="rgba(255,255,255,0.06)" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
    {/* Side slits */}
    <line x1="110" y1="230" x2="110" y2="270" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
    <line x1="190" y1="230" x2="190" y2="270" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
    {/* Sleeves */}
    <path d="M113,94 L90,102 L94,145 L100,110 L113,102" fill={fill} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    <path d="M187,94 L210,102 L206,145 L200,110 L187,102" fill={fill} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
  </g>
);

const FemaleSareeBlouse = ({ fill }) => (
  <g className="clothing-overlay">
    {/* Blouse */}
    <path d="M120,94 L180,94 L182,148 L118,148 Z" fill={fill} stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" />
    {/* Deep back / neckline */}
    <path d="M138,94 L150,102 L162,94" fill="rgba(255,255,255,0.06)" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
    {/* Short sleeves */}
    <path d="M120,94 L102,100 L105,125 L110,106 L120,100" fill={fill} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    <path d="M180,94 L198,100 L195,125 L190,106 L180,100" fill={fill} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    {/* Saree drape over shoulder */}
    <path d="M167,94 Q200,120 195,200 Q190,280 170,340 L155,340 Q165,260 175,180 Q180,130 162,98" fill={fill} stroke="rgba(0,0,0,0.1)" strokeWidth="1" opacity="0.7" />
    {/* Saree wrap around lower body */}
    <path d="M108,150 Q110,200 105,340 L200,340 Q195,200 192,150 Z" fill={fill} stroke="rgba(0,0,0,0.1)" strokeWidth="1" opacity="0.65" />
    {/* Pleats hint */}
    <line x1="140" y1="200" x2="138" y2="340" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
    <line x1="145" y1="200" x2="143" y2="340" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
    <line x1="150" y1="200" x2="148" y2="340" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
  </g>
);

// KIDS overlays
const KidsSchoolUniform = ({ fill }) => (
  <g className="clothing-overlay" transform="translate(25,40) scale(0.85)">
    {/* Shirt */}
    <path d="M118,94 L182,94 L185,190 L115,190 Z" fill={fill} stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" />
    {/* Collar */}
    <path d="M138,94 L150,106 L162,94" fill="rgba(255,255,255,0.08)" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
    {/* Buttons */}
    <circle cx="150" cy="120" r="1.5" fill="rgba(0,0,0,0.15)" />
    <circle cx="150" cy="140" r="1.5" fill="rgba(0,0,0,0.15)" />
    <circle cx="150" cy="160" r="1.5" fill="rgba(0,0,0,0.15)" />
    {/* Sleeves */}
    <path d="M118,94 L98,100 L102,140 L106,108 L118,100" fill={fill} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    <path d="M182,94 L202,100 L198,140 L194,108 L182,100" fill={fill} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    {/* Shorts/pants */}
    <path d="M113,190 L148,190 L145,260 L110,260 Z" fill="rgba(0,0,0,0.12)" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
    <path d="M152,190 L187,190 L190,260 L155,260 Z" fill="rgba(0,0,0,0.12)" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
  </g>
);

const KidsCasualWear = ({ fill }) => (
  <g className="clothing-overlay" transform="translate(25,40) scale(0.85)">
    {/* T-shirt */}
    <path d="M118,94 L182,94 L184,175 L116,175 Z" fill={fill} stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" />
    {/* Round neck */}
    <ellipse cx="150" cy="96" rx="14" ry="6" fill="rgba(255,255,255,0.06)" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
    {/* Sleeves */}
    <path d="M118,94 L100,100 L104,130 L108,106 L118,100" fill={fill} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    <path d="M182,94 L200,100 L196,130 L192,106 L182,100" fill={fill} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    {/* Shorts */}
    <path d="M115,175 L148,175 L146,240 L112,240 Z" fill={fill} stroke="rgba(0,0,0,0.08)" strokeWidth="1" opacity="0.8" />
    <path d="M152,175 L185,175 L188,240 L154,240 Z" fill={fill} stroke="rgba(0,0,0,0.08)" strokeWidth="1" opacity="0.8" />
  </g>
);

const KidsPartyWear = ({ fill }) => (
  <g className="clothing-overlay" transform="translate(25,40) scale(0.85)">
    {/* Dress/suit */}
    <path d="M116,94 L184,94 L190,290 L110,290 Z" fill={fill} stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
    {/* Collar / neckline */}
    <path d="M138,94 L150,106 L162,94" fill="rgba(255,255,255,0.08)" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
    {/* Bow / embellishment */}
    <circle cx="150" cy="110" r="3" fill="rgba(255,255,255,0.15)" />
    {/* Sleeves */}
    <path d="M116,94 L96,100 L100,145 L106,108 L116,100" fill={fill} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    <path d="M184,94 L204,100 L200,145 L194,108 L184,100" fill={fill} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    {/* Bottom embroidery */}
    <path d="M112,270 Q150,260 188,270" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
  </g>
);

const KidsEthnicWear = ({ fill }) => (
  <g className="clothing-overlay" transform="translate(25,40) scale(0.85)">
    {/* Kurta */}
    <path d="M116,94 L184,94 L188,270 L112,270 Z" fill={fill} stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
    {/* Band collar */}
    <rect x="140" y="90" width="20" height="8" rx="2" fill={fill} stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
    {/* Buttons / embroidery */}
    <circle cx="150" cy="115" r="1.5" fill="rgba(0,0,0,0.12)" />
    <circle cx="150" cy="130" r="1.5" fill="rgba(0,0,0,0.12)" />
    <circle cx="150" cy="145" r="1.5" fill="rgba(0,0,0,0.12)" />
    {/* Sleeves */}
    <path d="M116,94 L96,100 L100,150 L106,108 L116,100" fill={fill} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    <path d="M184,94 L204,100 L200,150 L194,108 L184,100" fill={fill} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    {/* Border */}
    <path d="M112,258 Q150,250 188,258" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
  </g>
);

/* ═══════════════════════════════════════════════════════
   CLOTHING LOOKUP MAP
   ═══════════════════════════════════════════════════════ */

const CLOTHING_MAP = {
  male: {
    'Shirt': MaleShirt,
    'Pant': MalePant,
    'Kurta': MaleKurta,
    'Suit': MaleSuit,
    'Blazer': MaleBlazer,
    'Sherwani': MaleSherwani,
  },
  female: {
    'Blouse': FemaleBlouse,
    'Salwar': FemaleSalwar,
    'Lehenga': FemaleLehenga,
    'Dress': FemaleDress,
    'Kurti': FemaleKurti,
    'Saree Blouse': FemaleSareeBlouse,
  },
  kids: {
    'School Uniform': KidsSchoolUniform,
    'Casual Wear': KidsCasualWear,
    'Party Wear': KidsPartyWear,
    'Ethnic Wear': KidsEthnicWear,
  },
};

const BODY_MAP = {
  male: MaleBody,
  female: FemaleBody,
  kids: KidsBody,
};

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

const MannequinPreview = ({ gender, clothingType, fabricColor, patternName }) => {
  const BodyComponent = BODY_MAP[gender] || null;
  const ClothingComponent = gender && clothingType ? CLOTHING_MAP[gender]?.[clothingType] : null;

  const color = fabricColor || '#ccc';
  const fill = getFill(color, patternName);
  const patternDef = getPatternDef(patternName, color);

  const getGenderLabel = () => {
    if (gender === 'male') return '👔 Male';
    if (gender === 'female') return '👗 Female';
    if (gender === 'kids') return '🧒 Kids';
    return '';
  };

  const getColorName = () => {
    if (!fabricColor) return null;
    const colorMap = {
      '#FF0000': 'Red', '#00FF00': 'Green', '#0000FF': 'Blue',
      '#FFFF00': 'Yellow', '#FF00FF': 'Magenta', '#00FFFF': 'Cyan',
      '#FFA500': 'Orange', '#800080': 'Purple', '#FFC0CB': 'Pink',
      '#000000': 'Black', '#FFFFFF': 'White', '#808080': 'Gray',
      '#A52A2A': 'Brown', '#FFD700': 'Gold', '#C0C0C0': 'Silver',
    };
    return colorMap[fabricColor?.toUpperCase()] || 'Custom';
  };

  return (
    <div className="mannequin-container">
      <div className="mannequin-header">
        <div className="mannequin-title">
          <div className="preview-icon">👁️</div>
          <h3>Live Preview</h3>
        </div>
        {gender && <span className="mannequin-badge">{getGenderLabel()}</span>}
      </div>

      <div className="mannequin-canvas">
        {!gender ? (
          <div className="mannequin-placeholder">
            <div className="placeholder-icon">👤</div>
            <p className="placeholder-text">Select a gender & clothing type</p>
            <p className="placeholder-hint">Your design will appear here</p>
          </div>
        ) : (
          <>
            <svg viewBox="0 0 300 370" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="mannequin-svg">
              <defs>
                {patternDef}
                <filter id="mannequin-shadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.12" />
                </filter>
                <linearGradient id="canvas-bg" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#f9fafb', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#e5e7eb', stopOpacity: 1 }} />
                </linearGradient>
              </defs>

              <g filter="url(#mannequin-shadow)">
                {BodyComponent && <BodyComponent />}
                {ClothingComponent && <ClothingComponent fill={fill} />}
              </g>
            </svg>
            {clothingType && (
              <div className="preview-floating-badge">
                {clothingType}
              </div>
            )}
          </>
        )}
      </div>

      {/* Enhanced Info Section */}
      {(clothingType || fabricColor || patternName) && (
        <div className="mannequin-details">
          <div className="details-header">Design Details</div>
          <div className="mannequin-info">
            {clothingType && (
              <div className="info-item">
                <span className="info-label">✂️ Garment</span>
                <span className="info-value">{clothingType}</span>
              </div>
            )}
            {fabricColor && (
              <div className="info-item">
                <span className="info-label">🎨 Color</span>
                <span className="info-value">
                  <span className="info-swatch" style={{ background: fabricColor }} />
                  {getColorName()}
                </span>
              </div>
            )}
            {patternName && patternName !== 'Solid' && (
              <div className="info-item">
                <span className="info-label">✨ Pattern</span>
                <span className="info-value">{patternName}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      {gender && (
        <div className="preview-progress">
          <div className="progress-step">
            <div className={`step-dot ${gender ? 'active' : ''}`} />
            <span>Gender</span>
          </div>
          <div className="progress-line" />
          <div className="progress-step">
            <div className={`step-dot ${clothingType ? 'active' : ''}`} />
            <span>Type</span>
          </div>
          <div className="progress-line" />
          <div className="progress-step">
            <div className={`step-dot ${fabricColor ? 'active' : ''}`} />
            <span>Style</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MannequinPreview;

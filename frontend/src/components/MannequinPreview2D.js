import React, { useMemo } from 'react';

// ============================================================================
// FITBYTE 2D MANNEQUIN PREVIEW - SVG Based Real-time Preview
// ============================================================================
// Supports: All genders (male, female, kids)
// Clothing: Shirt, Pant, Kurta, Suit, Blazer, Sherwani, Blouse, Salwar, 
//           Lehenga, Dress, Kurti, Saree Blouse, School Uniform, etc.
// Features: Real-time color/pattern updates, realistic fabric textures
// ============================================================================

// Pattern definitions for SVG
const PatternDefs = ({ patternName, color, patternId }) => {
  const baseColor = color || '#4a90d9';
  
  // Calculate lighter/darker shades
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 74, g: 144, b: 217 };
  };
  
  const rgb = hexToRgb(baseColor);
  const darkerColor = `rgb(${Math.max(0, rgb.r - 40)}, ${Math.max(0, rgb.g - 40)}, ${Math.max(0, rgb.b - 40)})`;
  const lighterColor = `rgb(${Math.min(255, rgb.r + 30)}, ${Math.min(255, rgb.g + 30)}, ${Math.min(255, rgb.b + 30)})`;
  const contrastColor = (rgb.r + rgb.g + rgb.b) / 3 > 128 ? darkerColor : lighterColor;
  
  const patternLower = (patternName || 'solid').toLowerCase();
  
  switch (patternLower) {
    case 'striped':
      return (
        <pattern id={patternId} patternUnits="userSpaceOnUse" width="8" height="8">
          <rect width="8" height="8" fill={baseColor} />
          <line x1="0" y1="0" x2="0" y2="8" stroke={contrastColor} strokeWidth="2" />
          <line x1="4" y1="0" x2="4" y2="8" stroke={contrastColor} strokeWidth="1" />
        </pattern>
      );
    
    case 'checked':
    case 'plaid':
      return (
        <pattern id={patternId} patternUnits="userSpaceOnUse" width="16" height="16">
          <rect width="16" height="16" fill={baseColor} />
          <rect x="0" y="0" width="8" height="8" fill={darkerColor} />
          <rect x="8" y="8" width="8" height="8" fill={darkerColor} />
        </pattern>
      );
    
    case 'polka':
      return (
        <pattern id={patternId} patternUnits="userSpaceOnUse" width="12" height="12">
          <rect width="12" height="12" fill={baseColor} />
          <circle cx="3" cy="3" r="2" fill={contrastColor} />
          <circle cx="9" cy="9" r="2" fill={contrastColor} />
        </pattern>
      );
    
    case 'floral':
      return (
        <pattern id={patternId} patternUnits="userSpaceOnUse" width="20" height="20">
          <rect width="20" height="20" fill={baseColor} />
          <circle cx="10" cy="10" r="3" fill={lighterColor} />
          <ellipse cx="10" cy="5" rx="2" ry="3" fill={contrastColor} />
          <ellipse cx="10" cy="15" rx="2" ry="3" fill={contrastColor} />
          <ellipse cx="5" cy="10" rx="3" ry="2" fill={contrastColor} />
          <ellipse cx="15" cy="10" rx="3" ry="2" fill={contrastColor} />
        </pattern>
      );
    
    case 'herringbone':
      return (
        <pattern id={patternId} patternUnits="userSpaceOnUse" width="10" height="10">
          <rect width="10" height="10" fill={baseColor} />
          <path d="M0,5 L5,0 L5,2 L2,5 L5,8 L5,10 L0,5 Z" fill={darkerColor} />
          <path d="M5,5 L10,0 L10,2 L7,5 L10,8 L10,10 L5,5 Z" fill={darkerColor} />
        </pattern>
      );
    
    case 'paisley':
      return (
        <pattern id={patternId} patternUnits="userSpaceOnUse" width="24" height="24">
          <rect width="24" height="24" fill={baseColor} />
          <path d="M12,4 Q18,8 16,14 Q14,18 8,16 Q4,14 6,8 Q8,4 12,4 Z" 
                fill="none" stroke={contrastColor} strokeWidth="1.5" />
          <circle cx="10" cy="10" r="2" fill={contrastColor} />
        </pattern>
      );
    
    case 'houndstooth':
      return (
        <pattern id={patternId} patternUnits="userSpaceOnUse" width="8" height="8">
          <rect width="8" height="8" fill={baseColor} />
          <path d="M0,0 L4,0 L4,4 L0,4 Z M4,4 L8,4 L8,8 L4,8 Z" fill={darkerColor} />
          <path d="M2,2 L4,0 L4,4 L2,2 Z M6,6 L8,4 L8,8 L6,6 Z" fill={baseColor} />
        </pattern>
      );
    
    default: // solid
      return (
        <pattern id={patternId} patternUnits="userSpaceOnUse" width="4" height="4">
          <rect width="4" height="4" fill={baseColor} />
        </pattern>
      );
  }
};

// Shadow/Highlight gradients for realistic fabric look
const FabricGradients = ({ baseColor, gradientId }) => {
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 74, g: 144, b: 217 };
  };
  
  const rgb = hexToRgb(baseColor || '#4a90d9');
  const highlight = `rgba(255, 255, 255, 0.15)`;
  const shadow = `rgba(0, 0, 0, 0.2)`;
  
  return (
    <>
      <linearGradient id={`${gradientId}-highlight`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={highlight} />
        <stop offset="50%" stopColor="transparent" />
        <stop offset="100%" stopColor={shadow} />
      </linearGradient>
      <radialGradient id={`${gradientId}-fold`} cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor={highlight} />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
    </>
  );
};

// ============================================================================
// MALE BODY MANNEQUIN
// ============================================================================
const MaleBody = ({ skinColor = '#e8beac' }) => (
  <g id="male-body">
    {/* Head */}
    <ellipse cx="200" cy="55" rx="28" ry="35" fill={skinColor} />
    {/* Face features */}
    <ellipse cx="190" cy="50" rx="3" ry="2" fill="#333" opacity="0.6" />
    <ellipse cx="210" cy="50" rx="3" ry="2" fill="#333" opacity="0.6" />
    <path d="M195,62 Q200,68 205,62" fill="none" stroke="#333" strokeWidth="1.5" opacity="0.4" />
    {/* Ears */}
    <ellipse cx="172" cy="55" rx="5" ry="8" fill={skinColor} />
    <ellipse cx="228" cy="55" rx="5" ry="8" fill={skinColor} />
    {/* Hair */}
    <path d="M172,40 Q180,15 200,18 Q220,15 228,40 Q225,30 200,28 Q175,30 172,40 Z" 
          fill="#2c1810" />
    
    {/* Neck */}
    <rect x="188" y="88" width="24" height="22" fill={skinColor} rx="3" />
    
    {/* Shoulders & Upper Arms */}
    <ellipse cx="200" cy="115" rx="65" ry="12" fill={skinColor} />
    
    {/* Left Arm */}
    <path d="M135,115 Q125,180 130,250 Q132,280 140,310" 
          fill="none" stroke={skinColor} strokeWidth="22" strokeLinecap="round" />
    {/* Left Hand */}
    <ellipse cx="142" cy="320" rx="12" ry="18" fill={skinColor} />
    
    {/* Right Arm */}
    <path d="M265,115 Q275,180 270,250 Q268,280 260,310"
          fill="none" stroke={skinColor} strokeWidth="22" strokeLinecap="round" />
    {/* Right Hand */}
    <ellipse cx="258" cy="320" rx="12" ry="18" fill={skinColor} />
    
    {/* Torso */}
    <path d="M145,125 Q140,200 150,280 L250,280 Q260,200 255,125 Z" 
          fill={skinColor} />
    
    {/* Legs */}
    <path d="M155,280 Q150,380 155,500 L185,500 Q188,380 185,280 Z" fill={skinColor} />
    <path d="M215,280 Q212,380 215,500 L245,500 Q250,380 245,280 Z" fill={skinColor} />
    
    {/* Feet */}
    <ellipse cx="170" cy="510" rx="20" ry="12" fill={skinColor} />
    <ellipse cx="230" cy="510" rx="20" ry="12" fill={skinColor} />
  </g>
);

// ============================================================================
// FEMALE BODY MANNEQUIN
// ============================================================================
const FemaleBody = ({ skinColor = '#f5d0c5' }) => (
  <g id="female-body">
    {/* Head - slightly smaller, more oval */}
    <ellipse cx="200" cy="52" rx="25" ry="32" fill={skinColor} />
    {/* Face features */}
    <ellipse cx="191" cy="48" rx="2.5" ry="1.8" fill="#333" opacity="0.5" />
    <ellipse cx="209" cy="48" rx="2.5" ry="1.8" fill="#333" opacity="0.5" />
    <path d="M195,58 Q200,63 205,58" fill="none" stroke="#c47" strokeWidth="2" opacity="0.6" />
    {/* Ears */}
    <ellipse cx="175" cy="52" rx="4" ry="6" fill={skinColor} />
    <ellipse cx="225" cy="52" rx="4" ry="6" fill={skinColor} />
    {/* Hair - long */}
    <path d="M175,35 Q180,10 200,12 Q220,10 225,35 Q230,80 220,110 L180,110 Q170,80 175,35 Z" 
          fill="#1a0f0a" />
    <path d="M175,40 Q185,20 200,22 Q215,20 225,40" fill="none" stroke="#2c1810" strokeWidth="8" />
    
    {/* Neck - slimmer */}
    <rect x="190" y="82" width="20" height="23" fill={skinColor} rx="3" />
    
    {/* Shoulders - narrower */}
    <ellipse cx="200" cy="110" rx="55" ry="10" fill={skinColor} />
    
    {/* Left Arm - slimmer */}
    <path d="M145,110 Q135,170 138,240 Q140,270 145,300" 
          fill="none" stroke={skinColor} strokeWidth="18" strokeLinecap="round" />
    <ellipse cx="147" cy="310" rx="10" ry="15" fill={skinColor} />
    
    {/* Right Arm */}
    <path d="M255,110 Q265,170 262,240 Q260,270 255,300"
          fill="none" stroke={skinColor} strokeWidth="18" strokeLinecap="round" />
    <ellipse cx="253" cy="310" rx="10" ry="15" fill={skinColor} />
    
    {/* Torso - feminine curves */}
    <path d="M150,118 Q145,150 148,180 Q140,220 155,280 L245,280 Q260,220 252,180 Q255,150 250,118 Z" 
          fill={skinColor} />
    {/* Waist curve emphasis */}
    <ellipse cx="200" cy="200" rx="40" ry="8" fill={skinColor} opacity="0.5" />
    
    {/* Legs - slimmer */}
    <path d="M160,280 Q155,380 158,500 L182,500 Q185,380 182,280 Z" fill={skinColor} />
    <path d="M218,280 Q215,380 218,500 L242,500 Q245,380 240,280 Z" fill={skinColor} />
    
    {/* Feet - smaller */}
    <ellipse cx="170" cy="510" rx="18" ry="10" fill={skinColor} />
    <ellipse cx="230" cy="510" rx="18" ry="10" fill={skinColor} />
  </g>
);

// ============================================================================
// KIDS BODY MANNEQUIN
// ============================================================================
const KidsBody = ({ skinColor = '#f5d5c8' }) => (
  <g id="kids-body" transform="translate(40, 80) scale(0.8)">
    {/* Head - proportionally larger */}
    <ellipse cx="200" cy="55" rx="30" ry="35" fill={skinColor} />
    {/* Face features */}
    <ellipse cx="190" cy="50" rx="4" ry="3" fill="#333" opacity="0.5" />
    <ellipse cx="210" cy="50" rx="4" ry="3" fill="#333" opacity="0.5" />
    <path d="M195,65 Q200,70 205,65" fill="none" stroke="#333" strokeWidth="1" opacity="0.3" />
    {/* Ears */}
    <ellipse cx="170" cy="55" rx="6" ry="8" fill={skinColor} />
    <ellipse cx="230" cy="55" rx="6" ry="8" fill={skinColor} />
    {/* Hair */}
    <path d="M170,40 Q180,15 200,18 Q220,15 230,40 Q225,30 200,28 Q175,30 170,40 Z" 
          fill="#4a3728" />
    
    {/* Neck */}
    <rect x="190" y="88" width="20" height="18" fill={skinColor} rx="3" />
    
    {/* Shoulders */}
    <ellipse cx="200" cy="110" rx="45" ry="8" fill={skinColor} />
    
    {/* Arms */}
    <path d="M155,110 Q148,160 150,210 Q152,235 155,255" 
          fill="none" stroke={skinColor} strokeWidth="16" strokeLinecap="round" />
    <ellipse cx="156" cy="262" rx="10" ry="14" fill={skinColor} />
    
    <path d="M245,110 Q252,160 250,210 Q248,235 245,255"
          fill="none" stroke={skinColor} strokeWidth="16" strokeLinecap="round" />
    <ellipse cx="244" cy="262" rx="10" ry="14" fill={skinColor} />
    
    {/* Torso - shorter */}
    <path d="M160,115 Q155,160 160,220 L240,220 Q245,160 240,115 Z" 
          fill={skinColor} />
    
    {/* Legs - shorter */}
    <path d="M165,220 Q162,300 165,380 L190,380 Q192,300 190,220 Z" fill={skinColor} />
    <path d="M210,220 Q208,300 210,380 L235,380 Q238,300 235,220 Z" fill={skinColor} />
    
    {/* Feet */}
    <ellipse cx="177" cy="388" rx="16" ry="10" fill={skinColor} />
    <ellipse cx="223" cy="388" rx="16" ry="10" fill={skinColor} />
  </g>
);

// ============================================================================
// CLOTHING COMPONENTS - MALE
// ============================================================================

// SHIRT - Male
const MaleShirt = ({ fill, patternId, gradientId }) => (
  <g id="male-shirt">
    {/* Main shirt body */}
    <path d="M145,125 Q140,180 145,250 L255,250 Q260,180 255,125 
             L240,110 Q220,105 200,108 Q180,105 160,110 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* Collar */}
    <path d="M175,108 L185,130 L200,115 L215,130 L225,108 Q210,100 200,102 Q190,100 175,108 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    {/* Collar shadow */}
    <path d="M185,115 L200,105 L215,115" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="2" />
    
    {/* Button placket */}
    <rect x="197" y="118" width="6" height="130" fill="rgba(255,255,255,0.1)" />
    {/* Buttons */}
    {[130, 155, 180, 205, 230].map((y, i) => (
      <g key={i}>
        <circle cx="200" cy={y} r="4" fill="#f5f5f5" stroke="#ccc" strokeWidth="0.5" />
        <circle cx="198.5" cy={y - 1} r="1" fill="#888" />
        <circle cx="201.5" cy={y - 1} r="1" fill="#888" />
        <circle cx="198.5" cy={y + 1.5} r="1" fill="#888" />
        <circle cx="201.5" cy={y + 1.5} r="1" fill="#888" />
      </g>
    ))}
    
    {/* Left sleeve */}
    <path d="M145,125 Q130,130 125,145 Q120,180 125,220 Q128,235 135,245 
             L150,245 Q145,200 148,160 Q150,140 145,125 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    {/* Sleeve cuff */}
    <rect x="125" y="238" width="28" height="10" fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* Right sleeve */}
    <path d="M255,125 Q270,130 275,145 Q280,180 275,220 Q272,235 265,245 
             L250,245 Q255,200 252,160 Q250,140 255,125 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    <rect x="247" y="238" width="28" height="10" fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* Pocket */}
    <path d="M165,150 L165,180 L185,180 L185,150" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
    
    {/* Fabric folds/shadows for realism */}
    <path d="M160,150 Q170,200 165,245" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="2" />
    <path d="M240,150 Q230,200 235,245" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="2" />
    
    {/* Highlight overlay */}
    <path d="M180,125 Q200,180 180,240" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
  </g>
);

// PANTS - Male
const MalePants = ({ fill, patternId }) => (
  <g id="male-pants">
    {/* Waistband */}
    <rect x="150" y="248" width="100" height="15" rx="2" fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    {/* Belt */}
    <rect x="152" y="250" width="96" height="10" fill="#2a1810" stroke="#1a0a00" strokeWidth="0.5" />
    <rect x="195" y="249" width="10" height="12" fill="#c9a227" rx="1" /> {/* Buckle */}
    {/* Belt loops */}
    {[165, 200, 235].map((x, i) => (
      <rect key={i} x={x - 3} y="248" width="6" height="15" fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.3" />
    ))}
    
    {/* Left leg */}
    <path d="M150,263 Q145,350 150,450 Q152,480 155,500 
             L185,500 Q188,480 190,450 Q195,350 190,263 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    {/* Left leg crease */}
    <path d="M170,280 L168,490" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    
    {/* Right leg */}
    <path d="M210,263 Q205,350 210,450 Q212,480 215,500 
             L245,500 Q248,480 250,450 Q255,350 250,263 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    {/* Right leg crease */}
    <path d="M230,280 L232,490" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    
    {/* Fly */}
    <path d="M200,263 L200,310" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" />
    
    {/* Pockets */}
    <path d="M155,270 Q160,285 165,290" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
    <path d="M245,270 Q240,285 235,290" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
    
    {/* Cuffs */}
    <rect x="150" y="492" width="38" height="10" fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.3" />
    <rect x="212" y="492" width="38" height="10" fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.3" />
  </g>
);

// KURTA - Male
const MaleKurta = ({ fill, patternId }) => (
  <g id="male-kurta">
    {/* Main kurta body - long */}
    <path d="M148,125 Q142,200 145,320 Q148,380 155,420 
             L245,420 Q252,380 255,320 Q258,200 252,125 
             L235,110 Q215,105 200,108 Q185,105 165,110 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* Mandarin collar */}
    <path d="M180,108 L180,125 Q190,130 200,130 Q210,130 220,125 L220,108 
             Q210,102 200,102 Q190,102 180,108 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    {/* Collar opening */}
    <path d="M200,108 L200,145" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
    
    {/* Front placket */}
    <rect x="196" y="125" width="8" height="120" fill="rgba(255,255,255,0.08)" />
    {/* Traditional buttons (potli) */}
    {[135, 160, 185, 210, 235].map((y, i) => (
      <g key={i}>
        <circle cx="200" cy={y} r="5" fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.8" />
        <circle cx="200" cy={y} r="2" fill="rgba(0,0,0,0.2)" />
      </g>
    ))}
    
    {/* Side slits */}
    <path d="M155,350 L155,420" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
    <path d="M245,350 L245,420" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
    
    {/* Left sleeve - loose */}
    <path d="M148,125 Q128,130 120,150 Q112,190 118,240 Q122,260 130,280 
             L155,280 Q148,240 152,190 Q155,150 148,125 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* Right sleeve */}
    <path d="M252,125 Q272,130 280,150 Q288,190 282,240 Q278,260 270,280 
             L245,280 Q252,240 248,190 Q245,150 252,125 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* Embroidery detail on neckline */}
    <path d="M185,115 Q200,120 215,115" fill="none" stroke="rgba(255,215,0,0.4)" strokeWidth="2" />
    
    {/* Fabric folds */}
    <path d="M170,200 Q175,300 170,400" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="3" />
    <path d="M230,200 Q225,300 230,400" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="3" />
  </g>
);

// SUIT/BLAZER - Male
const MaleSuit = ({ fill, patternId }) => (
  <g id="male-suit">
    {/* Jacket body */}
    <path d="M142,125 Q135,180 140,280 L260,280 Q265,180 258,125 
             L240,108 Q220,102 200,105 Q180,102 160,108 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* Lapels */}
    <path d="M175,108 L165,160 L180,175 L195,125 Q188,110 175,108 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    <path d="M225,108 L235,160 L220,175 L205,125 Q212,110 225,108 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    {/* Lapel notch */}
    <path d="M172,135 L180,125" fill="none" stroke="#333" strokeWidth="1" />
    <path d="M228,135 L220,125" fill="none" stroke="#333" strokeWidth="1" />
    
    {/* Inner shirt (white) */}
    <path d="M185,125 L200,108 L215,125 L215,200 L185,200 Z" fill="#fff" />
    <rect x="197" y="125" width="6" height="75" fill="#f8f8f8" />
    {/* Tie */}
    <path d="M200,115 L192,125 L200,200 L208,125 Z" fill="#8b0000" />
    <path d="M195,115 L200,112 L205,115 L200,125 Z" fill="#8b0000" />
    
    {/* Buttons */}
    {[180, 210].map((y, i) => (
      <circle key={i} cx="170" cy={y} r="5" fill="#2a2a2a" stroke="#000" strokeWidth="0.5" />
    ))}
    
    {/* Breast pocket */}
    <path d="M215,145 L215,165 L235,165 L235,145" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
    {/* Pocket square peek */}
    <path d="M218,147 L225,152 L232,147" fill="#d4a574" stroke="none" />
    
    {/* Lower pockets (flap) */}
    <rect x="148" y="220" width="35" height="12" fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.3" />
    <rect x="217" y="220" width="35" height="12" fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.3" />
    
    {/* Sleeves */}
    <path d="M142,125 Q125,135 118,155 Q110,200 115,250 Q118,270 125,285 
             L148,285 Q142,250 145,200 Q148,155 142,125 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    <path d="M258,125 Q275,135 282,155 Q290,200 285,250 Q282,270 275,285 
             L252,285 Q258,250 255,200 Q252,155 258,125 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* Sleeve buttons */}
    {[265, 272, 279].map((y, i) => (
      <g key={i}>
        <circle cx="132" cy={y} r="3" fill="#2a2a2a" />
        <circle cx="268" cy={y} r="3" fill="#2a2a2a" />
      </g>
    ))}
    
    {/* Shoulder padding hint */}
    <path d="M145,118 Q150,115 160,110" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="2" />
    <path d="M255,118 Q250,115 240,110" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="2" />
  </g>
);

// SHERWANI - Male
const MaleSherwani = ({ fill, patternId }) => (
  <g id="male-sherwani">
    {/* Long sherwani body */}
    <path d="M145,125 Q138,220 142,360 Q145,420 155,470 
             L245,470 Q255,420 258,360 Q262,220 255,125 
             L238,108 Q218,100 200,103 Q182,100 162,108 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* High collar (Nehru style) */}
    <path d="M178,103 L178,130 Q190,138 200,138 Q210,138 222,130 L222,103 
             Q210,95 200,95 Q190,95 178,103 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* Front panel overlay */}
    <path d="M178,130 L178,460 L195,460 L195,130 Z" 
          fill="rgba(255,255,255,0.05)" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
    <path d="M205,130 L205,460 L222,460 L222,130 Z" 
          fill="rgba(255,255,255,0.05)" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
    
    {/* Ornate buttons - gold */}
    {[145, 175, 205, 235, 265, 295, 325, 355, 385, 415].map((y, i) => (
      <g key={i}>
        <circle cx="200" cy={y} r="6" fill="#c9a227" stroke="#8b7500" strokeWidth="1" />
        <circle cx="200" cy={y} r="3" fill="#e6c847" />
      </g>
    ))}
    
    {/* Embroidery border */}
    <path d="M178,130 L178,460" fill="none" stroke="rgba(218,165,32,0.5)" strokeWidth="3" 
          strokeDasharray="2,4" />
    <path d="M222,130 L222,460" fill="none" stroke="rgba(218,165,32,0.5)" strokeWidth="3" 
          strokeDasharray="2,4" />
    
    {/* Collar embroidery */}
    <path d="M180,110 Q200,115 220,110" fill="none" stroke="rgba(218,165,32,0.6)" strokeWidth="2" />
    <path d="M182,118 Q200,123 218,118" fill="none" stroke="rgba(218,165,32,0.4)" strokeWidth="1.5" />
    
    {/* Bottom border embroidery */}
    <path d="M160,460 L240,460" fill="none" stroke="rgba(218,165,32,0.5)" strokeWidth="4" />
    
    {/* Sleeves - fitted */}
    <path d="M145,125 Q125,135 118,160 Q110,210 115,270 Q118,295 128,315 
             L152,315 Q145,280 148,220 Q152,160 145,125 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    <path d="M255,125 Q275,135 282,160 Q290,210 285,270 Q282,295 272,315 
             L248,315 Q255,280 252,220 Q248,160 255,125 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* Sleeve embroidery */}
    <path d="M128,305 Q140,310 152,305" fill="none" stroke="rgba(218,165,32,0.5)" strokeWidth="2" />
    <path d="M248,305 Q260,310 272,305" fill="none" stroke="rgba(218,165,32,0.5)" strokeWidth="2" />
  </g>
);

// ============================================================================
// CLOTHING COMPONENTS - FEMALE
// ============================================================================

// BLOUSE - Female
const FemaleBlouse = ({ fill, patternId }) => (
  <g id="female-blouse">
    {/* Blouse body - fitted */}
    <path d="M152,118 Q145,150 148,200 L252,200 Q255,150 248,118 
             L232,105 Q215,100 200,103 Q185,100 168,105 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* Neckline - round */}
    <path d="M175,105 Q185,115 200,118 Q215,115 225,105" 
          fill="none" stroke="#333" strokeWidth="1" />
    
    {/* Darts */}
    <path d="M165,130 L175,170" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    <path d="M235,130 L225,170" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    
    {/* Short sleeves */}
    <path d="M152,118 Q138,122 132,135 Q128,155 132,175 
             L152,175 Q148,155 150,135 Q152,125 152,118 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    <path d="M248,118 Q262,122 268,135 Q272,155 268,175 
             L248,175 Q252,155 250,135 Q248,125 248,118 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* Back closure hint */}
    <path d="M200,105 L200,103" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
  </g>
);

// SALWAR/PANTS - Female
const FemaleSalwar = ({ fill, patternId }) => (
  <g id="female-salwar">
    {/* Waistband with drawstring */}
    <path d="M155,198 Q150,200 150,210 L250,210 Q250,200 245,198 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    {/* Drawstring */}
    <path d="M180,204 Q200,210 220,204" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
    <circle cx="195" cy="208" r="3" fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.3" />
    <circle cx="205" cy="208" r="3" fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.3" />
    
    {/* Left leg - gathered at ankle */}
    <path d="M150,210 Q140,280 145,380 Q148,440 160,500 
             L182,500 Q190,440 192,380 Q198,280 195,210 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* Right leg */}
    <path d="M205,210 Q202,280 208,380 Q212,440 218,500 
             L240,500 Q252,440 255,380 Q260,280 250,210 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* Gathered ankle detail */}
    <path d="M160,490 Q165,495 175,495 Q180,492 182,490" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
    <path d="M218,490 Q225,495 232,495 Q238,492 240,490" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
    
    {/* Fabric folds */}
    <path d="M165,250 Q168,350 165,450" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2" />
    <path d="M225,250 Q222,350 225,450" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2" />
  </g>
);

// LEHENGA - Female
const FemaleLehenga = ({ fill, patternId }) => (
  <g id="female-lehenga">
    {/* Choli (blouse) */}
    <path d="M158,118 Q152,140 155,175 L245,175 Q248,140 242,118 
             L228,105 Q215,100 200,103 Q185,100 172,105 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* Sweetheart neckline */}
    <path d="M178,105 Q185,118 200,120 Q215,118 222,105" 
          fill="none" stroke="#333" strokeWidth="1" />
    
    {/* Short sleeves */}
    <path d="M158,118 Q145,122 140,135 Q137,150 142,165 
             L158,165 Q155,150 157,135 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    <path d="M242,118 Q255,122 260,135 Q263,150 258,165 
             L242,165 Q245,150 243,135 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* Lehenga waistband */}
    <rect x="150" y="175" width="100" height="12" rx="2" fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* Lehenga skirt - very flared */}
    <path d="M150,187 Q100,350 80,510 L320,510 Q300,350 250,187 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* Skirt pleats/folds */}
    {[110, 140, 170, 200, 230, 260, 290].map((x, i) => (
      <path key={i} d={`M${x},220 Q${x - 5},350 ${x - 15},505`} 
            fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1.5" />
    ))}
    
    {/* Border embroidery */}
    <path d="M85,500 Q200,510 315,500" fill="none" stroke="rgba(218,165,32,0.6)" strokeWidth="4" />
    <path d="M90,490 Q200,500 310,490" fill="none" stroke="rgba(218,165,32,0.4)" strokeWidth="2" />
    
    {/* Dupatta hint */}
    <path d="M158,130 Q130,200 120,300 Q115,400 130,480" 
          fill="none" stroke="rgba(255,200,100,0.4)" strokeWidth="12" strokeLinecap="round" />
  </g>
);

// DRESS - Female
const FemaleDress = ({ fill, patternId }) => (
  <g id="female-dress">
    {/* Bodice */}
    <path d="M155,118 Q148,145 152,195 L248,195 Q252,145 245,118 
             L230,105 Q215,100 200,103 Q185,100 170,105 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* V-neckline */}
    <path d="M175,105 L200,130 L225,105" fill="none" stroke="#333" strokeWidth="1" />
    
    {/* Waist seam */}
    <path d="M152,195 Q200,200 248,195" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
    
    {/* A-line skirt */}
    <path d="M152,195 Q130,350 120,510 L280,510 Q270,350 248,195 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* Short sleeves */}
    <path d="M155,118 Q140,122 135,140 Q132,160 138,175 
             L158,175 Q155,155 157,140 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    <path d="M245,118 Q260,122 265,140 Q268,160 262,175 
             L242,175 Q245,155 243,140 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* Belt */}
    <rect x="155" y="192" width="90" height="8" fill="#2a1810" rx="1" />
    <rect x="195" y="190" width="10" height="12" fill="#c9a227" rx="1" />
    
    {/* Skirt folds */}
    <path d="M165,220 Q160,350 140,500" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2" />
    <path d="M235,220 Q240,350 260,500" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2" />
  </g>
);

// KURTI - Female
const FemaleKurti = ({ fill, patternId }) => (
  <g id="female-kurti">
    {/* Kurti body - A-line */}
    <path d="M152,118 Q145,180 148,280 Q150,350 160,400 
             L240,400 Q250,350 252,280 Q255,180 248,118 
             L232,105 Q215,100 200,103 Q185,100 168,105 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* Round neckline with piping */}
    <path d="M178,105 Q190,115 200,118 Q210,115 222,105" 
          fill="none" stroke="#333" strokeWidth="1.5" />
    <path d="M180,107 Q190,116 200,119 Q210,116 220,107" 
          fill="none" stroke="rgba(218,165,32,0.5)" strokeWidth="2" />
    
    {/* Front slit indication */}
    <path d="M200,350 L200,400" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
    
    {/* 3/4 sleeves */}
    <path d="M152,118 Q135,125 128,145 Q122,185 128,235 
             L152,235 Q148,190 150,150 Q152,130 152,118 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    <path d="M248,118 Q265,125 272,145 Q278,185 272,235 
             L248,235 Q252,190 250,150 Q248,130 248,118 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* Sleeve border */}
    <path d="M128,225 L152,225" fill="none" stroke="rgba(218,165,32,0.5)" strokeWidth="2" />
    <path d="M248,225 L272,225" fill="none" stroke="rgba(218,165,32,0.5)" strokeWidth="2" />
    
    {/* Hem border */}
    <path d="M162,395 L238,395" fill="none" stroke="rgba(218,165,32,0.4)" strokeWidth="3" />
    
    {/* Side seams */}
    <path d="M155,150 Q152,280 162,395" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" />
    <path d="M245,150 Q248,280 238,395" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" />
  </g>
);

// SAREE BLOUSE - Female
const FemaleSareeBlouse = ({ fill, patternId }) => (
  <g id="female-saree-blouse">
    {/* Blouse */}
    <path d="M155,118 Q148,140 152,180 L248,180 Q252,140 245,118 
             L230,105 Q215,100 200,103 Q185,100 170,105 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* Deep back/front */}
    <path d="M175,105 Q188,120 200,122 Q212,120 225,105" 
          fill="none" stroke="#333" strokeWidth="1" />
    
    {/* Short sleeves */}
    <path d="M155,118 Q142,122 138,135 Q135,152 140,168 
             L158,168 Q155,150 157,135 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    <path d="M245,118 Q258,122 262,135 Q265,152 260,168 
             L242,168 Q245,150 243,135 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* Saree drape across shoulder */}
    <path d="M245,120 Q280,150 290,200 Q300,300 280,450 Q270,500 260,520" 
          fill="none" stroke={`url(#${patternId})`} strokeWidth="35" 
          strokeLinecap="round" opacity="0.9" />
    
    {/* Saree pallu pleats */}
    <path d="M250,140 Q270,180 275,250" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
    <path d="M258,145 Q278,185 283,255" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
    <path d="M266,150 Q286,190 291,260" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    
    {/* Saree wrapped around waist hint */}
    <path d="M152,175 Q100,200 90,280 Q85,380 100,500" 
          fill="none" stroke={`url(#${patternId})`} strokeWidth="15" opacity="0.7" />
    
    {/* Border */}
    <path d="M248,125 Q285,160 295,220 Q305,320 285,470" 
          fill="none" stroke="rgba(218,165,32,0.6)" strokeWidth="3" />
  </g>
);

// ============================================================================
// CLOTHING COMPONENTS - KIDS
// ============================================================================

// SCHOOL UNIFORM - Kids
const KidsSchoolUniform = ({ fill, patternId }) => (
  <g id="kids-uniform" transform="translate(40, 80) scale(0.8)">
    {/* Shirt */}
    <path d="M160,115 Q155,150 158,200 L242,200 Q245,150 240,115 
             L228,105 Q215,100 200,103 Q185,100 172,105 Z" 
          fill="#fff" stroke="#333" strokeWidth="0.5" />
    
    {/* Collar */}
    <path d="M180,105 L188,125 L200,112 L212,125 L220,105" 
          fill="#fff" stroke="#333" strokeWidth="0.5" />
    
    {/* Tie */}
    <path d="M200,115 L195,125 L200,195 L205,125 Z" fill="#1a3a6e" />
    <path d="M196,115 L200,110 L204,115 L200,122 Z" fill="#1a3a6e" />
    
    {/* Shorts/Skirt */}
    <path d="M158,198 L158,280 L195,280 L195,198 Z" fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    <path d="M205,198 L205,280 L242,280 L242,198 Z" fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* Short sleeves */}
    <path d="M160,115 Q148,120 145,135 Q143,155 148,170 
             L165,170 Q162,152 163,135 Z" 
          fill="#fff" stroke="#333" strokeWidth="0.5" />
    <path d="M240,115 Q252,120 255,135 Q257,155 252,170 
             L235,170 Q238,152 237,135 Z" 
          fill="#fff" stroke="#333" strokeWidth="0.5" />
  </g>
);

// CASUAL WEAR - Kids
const KidsCasualWear = ({ fill, patternId }) => (
  <g id="kids-casual" transform="translate(40, 80) scale(0.8)">
    {/* T-shirt */}
    <path d="M158,115 Q152,155 155,210 L245,210 Q248,155 242,115 
             L228,105 Q215,100 200,103 Q185,100 172,105 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* Round neck */}
    <ellipse cx="200" cy="108" rx="18" ry="8" fill="none" stroke="#333" strokeWidth="1" />
    
    {/* Graphic print hint */}
    <circle cx="200" cy="155" r="20" fill="rgba(255,255,255,0.2)" />
    <text x="200" y="160" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.5)">★</text>
    
    {/* Jeans */}
    <rect x="158" y="208" width="84" height="12" fill="#1a3d5c" rx="2" />
    <path d="M160,220 Q158,280 162,370 L188,370 Q192,280 188,220 Z" 
          fill="#1a3d5c" stroke="#333" strokeWidth="0.5" />
    <path d="M212,220 Q208,280 212,370 L238,370 Q242,280 240,220 Z" 
          fill="#1a3d5c" stroke="#333" strokeWidth="0.5" />
    
    {/* Short sleeves */}
    <path d="M158,115 Q145,120 142,138 Q140,158 145,175 
             L162,175 Q160,155 161,138 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    <path d="M242,115 Q255,120 258,138 Q260,158 255,175 
             L238,175 Q240,155 239,138 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
  </g>
);

// PARTY WEAR - Kids
const KidsPartyWear = ({ fill, patternId }) => (
  <g id="kids-party" transform="translate(40, 80) scale(0.8)">
    {/* Fancy dress/suit */}
    <path d="M158,115 Q150,170 155,280 L245,280 Q250,170 242,115 
             L228,105 Q215,100 200,103 Q185,100 172,105 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* Collar with bow */}
    <path d="M180,105 L185,120 L200,112 L215,120 L220,105" 
          fill="#fff" stroke="#333" strokeWidth="0.5" />
    <ellipse cx="200" cy="118" rx="8" ry="5" fill="#c41e3a" />
    <circle cx="200" cy="118" r="3" fill="#8b0000" />
    
    {/* Decorative buttons */}
    {[140, 165, 190, 215, 240].map((y, i) => (
      <circle key={i} cx="200" cy={y} r="4" fill="#c9a227" stroke="#8b7500" strokeWidth="0.5" />
    ))}
    
    {/* Sleeves with ruffles */}
    <path d="M158,115 Q142,122 138,145 Q135,175 142,205 
             L165,205 Q160,172 162,145 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    <path d="M242,115 Q258,122 262,145 Q265,175 258,205 
             L235,205 Q240,172 238,145 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* Skirt flare / pants */}
    <path d="M155,278 Q140,330 135,375" fill="none" stroke={`url(#${patternId})`} strokeWidth="25" />
    <path d="M245,278 Q260,330 265,375" fill="none" stroke={`url(#${patternId})`} strokeWidth="25" />
  </g>
);

// ETHNIC WEAR - Kids
const KidsEthnicWear = ({ fill, patternId }) => (
  <g id="kids-ethnic" transform="translate(40, 80) scale(0.8)">
    {/* Kurta style */}
    <path d="M158,115 Q150,180 155,300 L245,300 Q250,180 242,115 
             L228,105 Q215,100 200,103 Q185,100 172,105 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* Mandarin collar */}
    <path d="M182,105 L182,120 Q192,125 200,125 Q208,125 218,120 L218,105" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    
    {/* Front buttons */}
    {[135, 160, 185, 210, 235, 260].map((y, i) => (
      <circle key={i} cx="200" cy={y} r="4" fill="#c9a227" stroke="#8b7500" strokeWidth="0.5" />
    ))}
    
    {/* Embroidery border */}
    <path d="M160,290 L240,290" fill="none" stroke="rgba(218,165,32,0.5)" strokeWidth="3" />
    
    {/* Side slits */}
    <path d="M158,250 L158,300" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
    <path d="M242,250 L242,300" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
    
    {/* Churidar pants hint */}
    <path d="M165,300 Q162,340 165,375" fill="none" stroke={`url(#${patternId})`} strokeWidth="18" opacity="0.6" />
    <path d="M235,300 Q238,340 235,375" fill="none" stroke={`url(#${patternId})`} strokeWidth="18" opacity="0.6" />
    
    {/* Sleeves */}
    <path d="M158,115 Q142,125 138,150 Q135,190 142,235 
             L165,235 Q160,188 162,150 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
    <path d="M242,115 Q258,125 262,150 Q265,190 258,235 
             L235,235 Q240,188 238,150 Z" 
          fill={`url(#${patternId})`} stroke="#333" strokeWidth="0.5" />
  </g>
);

// ============================================================================
// MAIN COMPONENT - Clothing Selector
// ============================================================================
const ClothingComponent = ({ clothingType, gender, patternId, fill }) => {
  const type = (clothingType || '').toLowerCase();
  const genderLower = (gender || 'male').toLowerCase();
  
  // Map clothing types to components
  if (genderLower === 'male') {
    switch (type) {
      case 'shirt': return <MaleShirt patternId={patternId} fill={fill} />;
      case 'pant': return <MalePants patternId={patternId} fill={fill} />;
      case 'kurta': return <MaleKurta patternId={patternId} fill={fill} />;
      case 'suit': return <MaleSuit patternId={patternId} fill={fill} />;
      case 'blazer': return <MaleSuit patternId={patternId} fill={fill} />;
      case 'sherwani': return <MaleSherwani patternId={patternId} fill={fill} />;
      default: return <MaleShirt patternId={patternId} fill={fill} />;
    }
  } else if (genderLower === 'female') {
    switch (type) {
      case 'blouse': return <FemaleBlouse patternId={patternId} fill={fill} />;
      case 'salwar': return <FemaleSalwar patternId={patternId} fill={fill} />;
      case 'lehenga': return <FemaleLehenga patternId={patternId} fill={fill} />;
      case 'dress': return <FemaleDress patternId={patternId} fill={fill} />;
      case 'kurti': return <FemaleKurti patternId={patternId} fill={fill} />;
      case 'saree blouse': return <FemaleSareeBlouse patternId={patternId} fill={fill} />;
      default: return <FemaleBlouse patternId={patternId} fill={fill} />;
    }
  } else { // kids
    switch (type) {
      case 'school uniform': return <KidsSchoolUniform patternId={patternId} fill={fill} />;
      case 'casual wear': return <KidsCasualWear patternId={patternId} fill={fill} />;
      case 'party wear': return <KidsPartyWear patternId={patternId} fill={fill} />;
      case 'ethnic wear': return <KidsEthnicWear patternId={patternId} fill={fill} />;
      default: return <KidsCasualWear patternId={patternId} fill={fill} />;
    }
  }
};

// ============================================================================
// MAIN EXPORT COMPONENT
// ============================================================================
const MannequinPreview2D = ({ 
  gender = 'male',
  clothingType = 'Shirt',
  fabricColor = '#4a90d9',
  patternName = 'solid',
  fabricName = 'Cotton'
}) => {
  const patternId = useMemo(() => `pattern-${Date.now()}`, [fabricColor, patternName]);
  const gradientId = useMemo(() => `gradient-${Date.now()}`, [fabricColor]);
  
  const genderLower = (gender || 'male').toLowerCase();
  
  // Skin tone based on gender (can be customized)
  const skinColor = useMemo(() => {
    if (genderLower === 'female') return '#f5d0c5';
    if (genderLower === 'kids') return '#f5d5c8';
    return '#e8beac';
  }, [genderLower]);
  
  const BodyComponent = useMemo(() => {
    if (genderLower === 'female') return FemaleBody;
    if (genderLower === 'kids') return KidsBody;
    return MaleBody;
  }, [genderLower]);
  
  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)'
    }}>
      <svg 
        viewBox="0 0 400 550" 
        style={{ 
          width: '100%', 
          maxWidth: '350px',
          height: 'auto',
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))'
        }}
      >
        <defs>
          {/* Pattern definition */}
          <PatternDefs 
            patternName={patternName} 
            color={fabricColor} 
            patternId={patternId} 
          />
          
          {/* Fabric gradients for realism */}
          <FabricGradients baseColor={fabricColor} gradientId={gradientId} />
          
          {/* Shadow for grounding */}
          <radialGradient id="floor-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.2)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>
        
        {/* Background subtle gradient */}
        <rect x="0" y="0" width="400" height="550" fill="transparent" />
        
        {/* Floor shadow */}
        <ellipse cx="200" cy="530" rx="100" ry="15" fill="url(#floor-shadow)" />
        
        {/* Body */}
        <BodyComponent skinColor={skinColor} />
        
        {/* Clothing layer */}
        <ClothingComponent 
          clothingType={clothingType}
          gender={gender}
          patternId={patternId}
          fill={fabricColor}
        />
      </svg>
      
      {/* Info label */}
      <div style={{
        marginTop: '16px',
        padding: '8px 16px',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        fontSize: '13px',
        color: '#495057'
      }}>
        <span style={{ fontWeight: '600', color: '#212529' }}>{clothingType}</span>
        <span style={{ margin: '0 8px', color: '#adb5bd' }}>•</span>
        <span>{fabricName}</span>
        <span style={{ margin: '0 8px', color: '#adb5bd' }}>•</span>
        <span style={{ textTransform: 'capitalize' }}>{patternName}</span>
      </div>
    </div>
  );
};

export default MannequinPreview2D;

import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Center } from '@react-three/drei';
import * as THREE from 'three';

// ============================================================
// FABRIC TEXTURE GENERATORS
// ============================================================

// Generate procedural fabric normal map
const generateFabricNormalMap = (fabricType = 'cotton') => {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Base color for normal map (128, 128, 255) - pointing up
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, size, size);
  
  // Add fabric weave based on type
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      let nx = 128, ny = 128;
      
      switch (fabricType) {
        case 'silk':
          // Smooth with subtle horizontal lines
          nx = 128 + Math.sin(y * 0.5) * 3;
          ny = 128 + Math.cos(x * 0.3) * 2;
          break;
        case 'wool':
          // Fuzzy texture
          nx = 128 + (Math.random() - 0.5) * 30;
          ny = 128 + (Math.random() - 0.5) * 30;
          break;
        case 'linen':
          // Crosshatch weave
          if ((x % 6 < 2) || (y % 6 < 2)) {
            nx = 128 + Math.sin(x * 0.8 + y * 0.2) * 15;
            ny = 128 + Math.cos(y * 0.8 + x * 0.2) * 15;
          }
          break;
        case 'denim':
          // Diagonal twill weave
          const diag = (x + y) % 8;
          nx = 128 + (diag < 4 ? 20 : -20);
          ny = 128 + Math.sin(diag) * 10;
          break;
        case 'velvet':
          // Very smooth with subtle variations
          nx = 128 + Math.sin(x * 0.1) * Math.cos(y * 0.1) * 5;
          ny = 128 + Math.cos(x * 0.1) * Math.sin(y * 0.1) * 5;
          break;
        case 'polyester':
          // Uniform synthetic texture
          if ((x % 4 === 0) || (y % 4 === 0)) {
            nx = 128 + 8;
            ny = 128 + 8;
          }
          break;
        case 'cotton':
        default:
          // Plain weave pattern
          const warpWeft = ((x % 4 < 2) !== (y % 4 < 2));
          nx = 128 + (warpWeft ? 12 : -12);
          ny = 128 + (warpWeft ? -8 : 8);
          break;
      }
      
      data[i] = Math.max(0, Math.min(255, nx));
      data[i + 1] = Math.max(0, Math.min(255, ny));
      data[i + 2] = 255; // Z always pointing up
      data[i + 3] = 255;
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  return new THREE.CanvasTexture(canvas);
};

// Generate pattern texture
const generatePatternTexture = (patternName, baseColor) => {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Parse base color
  const color = new THREE.Color(baseColor);
  const r = Math.floor(color.r * 255);
  const g = Math.floor(color.g * 255);
  const b = Math.floor(color.b * 255);
  
  // Darker and lighter variants
  const darkerColor = `rgb(${Math.floor(r * 0.6)}, ${Math.floor(g * 0.6)}, ${Math.floor(b * 0.6)})`;
  const lighterColor = `rgb(${Math.min(255, Math.floor(r * 1.3))}, ${Math.min(255, Math.floor(g * 1.3))}, ${Math.min(255, Math.floor(b * 1.3))})`;
  const contrastColor = `rgb(${255 - r}, ${255 - g}, ${255 - b})`;
  
  // Fill base
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);
  
  switch (patternName?.toLowerCase()) {
    case 'striped':
      ctx.fillStyle = darkerColor;
      for (let i = 0; i < size; i += 32) {
        ctx.fillRect(i, 0, 16, size);
      }
      break;
      
    case 'checked':
    case 'checkered':
      const checkSize = 64;
      for (let y = 0; y < size; y += checkSize) {
        for (let x = 0; x < size; x += checkSize) {
          if (((x / checkSize) + (y / checkSize)) % 2 === 0) {
            ctx.fillStyle = darkerColor;
            ctx.fillRect(x, y, checkSize, checkSize);
          }
        }
      }
      break;
      
    case 'polka':
    case 'polka dots':
      ctx.fillStyle = lighterColor;
      for (let y = 20; y < size; y += 60) {
        for (let x = 20; x < size; x += 60) {
          const offsetX = (Math.floor(y / 60) % 2) * 30;
          ctx.beginPath();
          ctx.arc(x + offsetX, y, 12, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
      
    case 'floral':
      // Stylized floral pattern
      for (let y = 40; y < size; y += 100) {
        for (let x = 40; x < size; x += 100) {
          const offsetX = (Math.floor(y / 100) % 2) * 50;
          // Petals
          ctx.fillStyle = lighterColor;
          for (let p = 0; p < 5; p++) {
            const angle = (p / 5) * Math.PI * 2;
            ctx.beginPath();
            ctx.ellipse(
              x + offsetX + Math.cos(angle) * 15,
              y + Math.sin(angle) * 15,
              10, 6, angle, 0, Math.PI * 2
            );
            ctx.fill();
          }
          // Center
          ctx.fillStyle = darkerColor;
          ctx.beginPath();
          ctx.arc(x + offsetX, y, 8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
      
    case 'herringbone':
      ctx.strokeStyle = darkerColor;
      ctx.lineWidth = 3;
      for (let y = 0; y < size; y += 20) {
        for (let x = 0; x < size; x += 40) {
          const offset = (Math.floor(y / 20) % 2) * 20;
          ctx.beginPath();
          ctx.moveTo(x + offset, y);
          ctx.lineTo(x + offset + 20, y + 10);
          ctx.lineTo(x + offset, y + 20);
          ctx.stroke();
        }
      }
      break;
      
    case 'paisley':
      ctx.fillStyle = lighterColor;
      for (let y = 30; y < size; y += 80) {
        for (let x = 30; x < size; x += 80) {
          const offsetX = (Math.floor(y / 80) % 2) * 40;
          ctx.save();
          ctx.translate(x + offsetX, y);
          ctx.rotate(Math.PI / 4);
          // Paisley teardrop shape
          ctx.beginPath();
          ctx.moveTo(0, -20);
          ctx.bezierCurveTo(15, -15, 15, 10, 0, 20);
          ctx.bezierCurveTo(-15, 10, -15, -15, 0, -20);
          ctx.fill();
          ctx.restore();
        }
      }
      break;
      
    case 'houndstooth':
      const hSize = 24;
      for (let y = 0; y < size; y += hSize) {
        for (let x = 0; x < size; x += hSize) {
          const isOdd = ((x / hSize) + (y / hSize)) % 2;
          if (isOdd) {
            ctx.fillStyle = darkerColor;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + hSize, y);
            ctx.lineTo(x + hSize / 2, y + hSize / 2);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(x + hSize / 2, y + hSize / 2);
            ctx.lineTo(x + hSize, y + hSize);
            ctx.lineTo(x, y + hSize);
            ctx.closePath();
            ctx.fill();
          }
        }
      }
      break;
      
    case 'plaid':
      // Horizontal stripes
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = darkerColor;
      for (let i = 0; i < size; i += 80) {
        ctx.fillRect(0, i, size, 20);
        ctx.fillRect(0, i + 40, size, 10);
      }
      // Vertical stripes
      for (let i = 0; i < size; i += 80) {
        ctx.fillRect(i, 0, 20, size);
        ctx.fillRect(i + 40, 0, 10, size);
      }
      ctx.globalAlpha = 1;
      break;
      
    case 'solid':
    default:
      // Already filled with base color
      break;
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
};

// ============================================================
// FABRIC MATERIAL
// ============================================================

const FabricMaterial = ({ color, pattern, fabricName }) => {
  const patternTexture = useMemo(() => 
    generatePatternTexture(pattern, color), [pattern, color]);
  
  const normalMap = useMemo(() => 
    generateFabricNormalMap(fabricName?.toLowerCase()), [fabricName]);
  
  // Get fabric-specific properties
  const fabricProps = useMemo(() => {
    const name = fabricName?.toLowerCase() || 'cotton';
    switch (name) {
      case 'silk':
        return { roughness: 0.2, metalness: 0.1, sheenColor: new THREE.Color(color).multiplyScalar(0.3) };
      case 'velvet':
        return { roughness: 0.9, metalness: 0.0, sheenColor: new THREE.Color(color) };
      case 'wool':
        return { roughness: 0.85, metalness: 0.0 };
      case 'linen':
        return { roughness: 0.7, metalness: 0.0 };
      case 'denim':
        return { roughness: 0.75, metalness: 0.0 };
      case 'polyester':
        return { roughness: 0.4, metalness: 0.05 };
      case 'satin':
        return { roughness: 0.15, metalness: 0.15 };
      case 'cotton':
      default:
        return { roughness: 0.6, metalness: 0.0 };
    }
  }, [fabricName, color]);
  
  return (
    <meshStandardMaterial
      map={patternTexture}
      normalMap={normalMap}
      normalScale={new THREE.Vector2(0.5, 0.5)}
      roughness={fabricProps.roughness}
      metalness={fabricProps.metalness}
      side={THREE.DoubleSide}
    />
  );
};

// ============================================================
// BODY PARTS (Procedural Geometry)
// ============================================================

// Human skin material
const SkinMaterial = ({ gender }) => {
  const skinTone = gender === 'kids' ? '#f5d0b8' : '#e8c4a8';
  return (
    <meshStandardMaterial 
      color={skinTone} 
      roughness={0.7} 
      metalness={0.0}
    />
  );
};

// Head with neck
const Head = ({ gender, position = [0, 0, 0] }) => {
  const scale = gender === 'kids' ? 0.85 : 1;
  
  return (
    <group position={position} scale={scale}>
      {/* Head */}
      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <SkinMaterial gender={gender} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.1, 16]} />
        <SkinMaterial gender={gender} />
      </mesh>
    </group>
  );
};

// Torso - different shapes for male/female/kids
const Torso = ({ gender, showClothing = false, clothingProps = {} }) => {
  const isMale = gender === 'male';
  const isFemale = gender === 'female';
  const isKids = gender === 'kids';
  
  // Torso dimensions
  const shoulderWidth = isMale ? 0.22 : isFemale ? 0.18 : 0.15;
  const waistWidth = isMale ? 0.16 : isFemale ? 0.12 : 0.13;
  const hipWidth = isMale ? 0.15 : isFemale ? 0.17 : 0.14;
  const torsoHeight = isKids ? 0.25 : 0.35;
  const bustSize = isFemale ? 0.08 : 0;
  
  return (
    <group>
      {/* Upper torso */}
      <mesh position={[0, torsoHeight / 2, 0]}>
        <boxGeometry args={[shoulderWidth * 2, torsoHeight * 0.6, 0.12]} />
        {showClothing ? <FabricMaterial {...clothingProps} /> : <SkinMaterial gender={gender} />}
      </mesh>
      
      {/* Lower torso / waist */}
      <mesh position={[0, -torsoHeight * 0.1, 0]}>
        <boxGeometry args={[waistWidth * 2, torsoHeight * 0.5, 0.1]} />
        {showClothing ? <FabricMaterial {...clothingProps} /> : <SkinMaterial gender={gender} />}
      </mesh>
      
      {/* Female bust */}
      {isFemale && (
        <>
          <mesh position={[-0.06, torsoHeight * 0.4, 0.06]}>
            <sphereGeometry args={[bustSize, 16, 16]} />
            {showClothing ? <FabricMaterial {...clothingProps} /> : <SkinMaterial gender={gender} />}
          </mesh>
          <mesh position={[0.06, torsoHeight * 0.4, 0.06]}>
            <sphereGeometry args={[bustSize, 16, 16]} />
            {showClothing ? <FabricMaterial {...clothingProps} /> : <SkinMaterial gender={gender} />}
          </mesh>
        </>
      )}
    </group>
  );
};

// Arms
const Arms = ({ gender, showSleeves = false, sleeveLength = 'full', clothingProps = {} }) => {
  const scale = gender === 'kids' ? 0.7 : 1;
  const armLength = 0.3 * scale;
  const shoulderWidth = gender === 'male' ? 0.22 : gender === 'female' ? 0.18 : 0.15;
  
  const sleeveCoverage = sleeveLength === 'full' ? 0.9 : sleeveLength === 'half' ? 0.5 : 0.2;
  
  return (
    <group>
      {/* Left Arm */}
      <group position={[-shoulderWidth - 0.02, 0.15, 0]} rotation={[0, 0, Math.PI * 0.1]}>
        {/* Upper arm */}
        <mesh position={[0, -armLength * 0.3, 0]}>
          <capsuleGeometry args={[0.03, armLength * 0.5, 8, 16]} />
          {showSleeves ? <FabricMaterial {...clothingProps} /> : <SkinMaterial gender={gender} />}
        </mesh>
        {/* Forearm */}
        <mesh position={[0, -armLength * 0.75, 0]}>
          <capsuleGeometry args={[0.025, armLength * 0.4, 8, 16]} />
          {showSleeves && sleeveCoverage > 0.5 ? <FabricMaterial {...clothingProps} /> : <SkinMaterial gender={gender} />}
        </mesh>
        {/* Hand */}
        <mesh position={[0, -armLength * 1.1, 0]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <SkinMaterial gender={gender} />
        </mesh>
      </group>
      
      {/* Right Arm */}
      <group position={[shoulderWidth + 0.02, 0.15, 0]} rotation={[0, 0, -Math.PI * 0.1]}>
        {/* Upper arm */}
        <mesh position={[0, -armLength * 0.3, 0]}>
          <capsuleGeometry args={[0.03, armLength * 0.5, 8, 16]} />
          {showSleeves ? <FabricMaterial {...clothingProps} /> : <SkinMaterial gender={gender} />}
        </mesh>
        {/* Forearm */}
        <mesh position={[0, -armLength * 0.75, 0]}>
          <capsuleGeometry args={[0.025, armLength * 0.4, 8, 16]} />
          {showSleeves && sleeveCoverage > 0.5 ? <FabricMaterial {...clothingProps} /> : <SkinMaterial gender={gender} />}
        </mesh>
        {/* Hand */}
        <mesh position={[0, -armLength * 1.1, 0]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <SkinMaterial gender={gender} />
        </mesh>
      </group>
    </group>
  );
};

// Legs
const Legs = ({ gender, showPants = false, pantsLength = 'full', clothingProps = {} }) => {
  const scale = gender === 'kids' ? 0.65 : 1;
  const legLength = 0.45 * scale;
  const hipWidth = gender === 'male' ? 0.08 : gender === 'female' ? 0.09 : 0.07;
  
  const pantsCoverage = pantsLength === 'full' ? 0.95 : pantsLength === 'shorts' ? 0.4 : 0.7;
  
  return (
    <group position={[0, -0.35, 0]}>
      {/* Left leg */}
      <group position={[-hipWidth, 0, 0]}>
        {/* Upper leg / thigh */}
        <mesh position={[0, -legLength * 0.25, 0]}>
          <capsuleGeometry args={[0.05, legLength * 0.4, 8, 16]} />
          {showPants ? <FabricMaterial {...clothingProps} /> : <SkinMaterial gender={gender} />}
        </mesh>
        {/* Lower leg */}
        <mesh position={[0, -legLength * 0.65, 0]}>
          <capsuleGeometry args={[0.04, legLength * 0.4, 8, 16]} />
          {showPants && pantsCoverage > 0.5 ? <FabricMaterial {...clothingProps} /> : <SkinMaterial gender={gender} />}
        </mesh>
        {/* Foot */}
        <mesh position={[0, -legLength * 0.95, 0.02]}>
          <boxGeometry args={[0.05, 0.03, 0.1]} />
          <meshStandardMaterial color="#2c2c2c" roughness={0.8} />
        </mesh>
      </group>
      
      {/* Right leg */}
      <group position={[hipWidth, 0, 0]}>
        {/* Upper leg / thigh */}
        <mesh position={[0, -legLength * 0.25, 0]}>
          <capsuleGeometry args={[0.05, legLength * 0.4, 8, 16]} />
          {showPants ? <FabricMaterial {...clothingProps} /> : <SkinMaterial gender={gender} />}
        </mesh>
        {/* Lower leg */}
        <mesh position={[0, -legLength * 0.65, 0]}>
          <capsuleGeometry args={[0.04, legLength * 0.4, 8, 16]} />
          {showPants && pantsCoverage > 0.5 ? <FabricMaterial {...clothingProps} /> : <SkinMaterial gender={gender} />}
        </mesh>
        {/* Foot */}
        <mesh position={[0, -legLength * 0.95, 0.02]}>
          <boxGeometry args={[0.05, 0.03, 0.1]} />
          <meshStandardMaterial color="#2c2c2c" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
};

// ============================================================
// CLOTHING COMPONENTS
// ============================================================

// Shirt / Blouse / Top
const ShirtClothing = ({ gender, clothingProps }) => {
  const isMale = gender === 'male';
  const isFemale = gender === 'female';
  const isKids = gender === 'kids';
  
  const shoulderWidth = isMale ? 0.23 : isFemale ? 0.19 : 0.16;
  const torsoHeight = isKids ? 0.28 : 0.38;
  const bustSize = isFemale ? 0.09 : 0;
  
  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[shoulderWidth * 2, torsoHeight, 0.14]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Collar - V-neck for female, regular for male */}
      {isMale && (
        <mesh position={[0, 0.28, 0.05]}>
          <boxGeometry args={[0.08, 0.04, 0.06]} />
          <FabricMaterial {...clothingProps} />
        </mesh>
      )}
      
      {/* Female bust shaping */}
      {isFemale && (
        <>
          <mesh position={[-0.065, 0.18, 0.07]}>
            <sphereGeometry args={[bustSize, 16, 16]} />
            <FabricMaterial {...clothingProps} />
          </mesh>
          <mesh position={[0.065, 0.18, 0.07]}>
            <sphereGeometry args={[bustSize, 16, 16]} />
            <FabricMaterial {...clothingProps} />
          </mesh>
        </>
      )}
      
      {/* Sleeves */}
      <mesh position={[-shoulderWidth - 0.08, 0.12, 0]} rotation={[0, 0, Math.PI * 0.15]}>
        <cylinderGeometry args={[0.045, 0.055, 0.2, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      <mesh position={[shoulderWidth + 0.08, 0.12, 0]} rotation={[0, 0, -Math.PI * 0.15]}>
        <cylinderGeometry args={[0.045, 0.055, 0.2, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
    </group>
  );
};

// Pants / Trousers
const PantsClothing = ({ gender, clothingProps, isShorts = false }) => {
  const isKids = gender === 'kids';
  const hipWidth = gender === 'male' ? 0.17 : gender === 'female' ? 0.18 : 0.15;
  const legLength = isKids ? 0.28 : 0.42;
  const pantsLength = isShorts ? legLength * 0.4 : legLength;
  
  return (
    <group position={[0, -0.12, 0]}>
      {/* Waistband */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[hipWidth * 2, 0.06, 0.12]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Hip/seat area */}
      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[hipWidth * 2.1, 0.15, 0.13]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Left leg */}
      <mesh position={[-hipWidth * 0.5, -0.08 - pantsLength * 0.5, 0]}>
        <cylinderGeometry args={[0.055, 0.05, pantsLength, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Right leg */}
      <mesh position={[hipWidth * 0.5, -0.08 - pantsLength * 0.5, 0]}>
        <cylinderGeometry args={[0.055, 0.05, pantsLength, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
    </group>
  );
};

// Kurta (Indian long top)
const KurtaClothing = ({ gender, clothingProps }) => {
  const isFemale = gender === 'female';
  const shoulderWidth = gender === 'male' ? 0.23 : 0.19;
  const length = gender === 'male' ? 0.55 : 0.5;
  
  return (
    <group>
      {/* Main body - longer than shirt */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[shoulderWidth * 2, length, 0.14]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Collar band */}
      <mesh position={[0, 0.22, 0.05]}>
        <torusGeometry args={[0.06, 0.015, 8, 16, Math.PI]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Long sleeves */}
      <mesh position={[-shoulderWidth - 0.12, 0.08, 0]} rotation={[0, 0, Math.PI * 0.1]}>
        <cylinderGeometry args={[0.04, 0.055, 0.3, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      <mesh position={[shoulderWidth + 0.12, 0.08, 0]} rotation={[0, 0, -Math.PI * 0.1]}>
        <cylinderGeometry args={[0.04, 0.055, 0.3, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Bottom flare */}
      <mesh position={[0, -0.28, 0]}>
        <boxGeometry args={[shoulderWidth * 2.3, 0.1, 0.15]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
    </group>
  );
};

// Suit / Blazer
const SuitClothing = ({ gender, clothingProps, includeVest = false }) => {
  const shoulderWidth = gender === 'male' ? 0.25 : 0.2;
  
  return (
    <group>
      {/* Jacket body */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[shoulderWidth * 2, 0.45, 0.15]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Lapels */}
      <mesh position={[-0.08, 0.22, 0.08]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.06, 0.15, 0.02]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      <mesh position={[0.08, 0.22, 0.08]} rotation={[0, -0.3, 0]}>
        <boxGeometry args={[0.06, 0.15, 0.02]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Inner shirt visible */}
      <mesh position={[0, 0.18, 0.06]}>
        <boxGeometry args={[0.1, 0.12, 0.01]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </mesh>
      
      {/* Structured shoulders */}
      <mesh position={[-shoulderWidth, 0.22, 0]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      <mesh position={[shoulderWidth, 0.22, 0]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Sleeves */}
      <mesh position={[-shoulderWidth - 0.1, 0.08, 0]} rotation={[0, 0, Math.PI * 0.12]}>
        <cylinderGeometry args={[0.045, 0.06, 0.28, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      <mesh position={[shoulderWidth + 0.1, 0.08, 0]} rotation={[0, 0, -Math.PI * 0.12]}>
        <cylinderGeometry args={[0.045, 0.06, 0.28, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Buttons */}
      {[0.1, 0.02, -0.06].map((y, i) => (
        <mesh key={i} position={[0, y, 0.08]}>
          <cylinderGeometry args={[0.012, 0.012, 0.005, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#2c2c2c" metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
};

// Sherwani (Indian formal wear)
const SherwaniClothing = ({ gender, clothingProps }) => {
  const shoulderWidth = 0.24;
  
  return (
    <group>
      {/* Long coat body */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[shoulderWidth * 2, 0.65, 0.16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Mandarin collar */}
      <mesh position={[0, 0.25, 0.06]}>
        <cylinderGeometry args={[0.05, 0.055, 0.06, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Front overlap panel */}
      <mesh position={[0.06, 0.05, 0.09]}>
        <boxGeometry args={[0.12, 0.4, 0.02]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Decorative buttons/embroidery line */}
      {[-0.1, 0, 0.1, 0.2].map((y, i) => (
        <mesh key={i} position={[0.08, y, 0.1]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      
      {/* Sleeves with cuffs */}
      <mesh position={[-shoulderWidth - 0.12, 0.08, 0]} rotation={[0, 0, Math.PI * 0.08]}>
        <cylinderGeometry args={[0.04, 0.055, 0.32, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      <mesh position={[shoulderWidth + 0.12, 0.08, 0]} rotation={[0, 0, -Math.PI * 0.08]}>
        <cylinderGeometry args={[0.04, 0.055, 0.32, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Embroidered cuffs */}
      <mesh position={[-shoulderWidth - 0.18, -0.08, 0]} rotation={[0, 0, Math.PI * 0.08]}>
        <cylinderGeometry args={[0.045, 0.045, 0.04, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[shoulderWidth + 0.18, -0.08, 0]} rotation={[0, 0, -Math.PI * 0.08]}>
        <cylinderGeometry args={[0.045, 0.045, 0.04, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
};

// Dress (female)
const DressClothing = ({ gender, clothingProps }) => {
  const shoulderWidth = 0.18;
  
  return (
    <group>
      {/* Bodice */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[shoulderWidth * 2, 0.25, 0.13]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Bust shaping */}
      <mesh position={[-0.06, 0.18, 0.07]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      <mesh position={[0.06, 0.18, 0.07]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Waist */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.13, 0.12, 0.08, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* A-line skirt */}
      <mesh position={[0, -0.22, 0]}>
        <cylinderGeometry args={[0.22, 0.14, 0.4, 24]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Straps */}
      <mesh position={[-0.1, 0.28, 0]}>
        <boxGeometry args={[0.025, 0.06, 0.02]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      <mesh position={[0.1, 0.28, 0]}>
        <boxGeometry args={[0.025, 0.06, 0.02]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
    </group>
  );
};

// Lehenga (Indian skirt)
const LehengaClothing = ({ gender, clothingProps }) => {
  return (
    <group position={[0, -0.12, 0]}>
      {/* Waistband with embroidery */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.06, 24]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Heavy embroidered band */}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.135, 0.13, 0.03, 24]} />
        <meshStandardMaterial color="#d4af37" metalness={0.6} roughness={0.3} />
      </mesh>
      
      {/* Full flared skirt */}
      <mesh position={[0, -0.28, 0]}>
        <cylinderGeometry args={[0.35, 0.15, 0.5, 32]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Bottom border */}
      <mesh position={[0, -0.52, 0]}>
        <cylinderGeometry args={[0.36, 0.35, 0.04, 32]} />
        <meshStandardMaterial color="#d4af37" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
};

// Salwar (loose pants)
const SalwarClothing = ({ gender, clothingProps }) => {
  return (
    <group position={[0, -0.12, 0]}>
      {/* Waistband */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.05, 24]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Hip area - loose fitting */}
      <mesh position={[0, -0.1, 0]}>
        <sphereGeometry args={[0.18, 24, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Left leg - tapered */}
      <mesh position={[-0.08, -0.35, 0]}>
        <cylinderGeometry args={[0.04, 0.12, 0.4, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Right leg - tapered */}
      <mesh position={[0.08, -0.35, 0]}>
        <cylinderGeometry args={[0.04, 0.12, 0.4, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
    </group>
  );
};

// Saree Blouse
const SareeBlouseClothing = ({ gender, clothingProps }) => {
  return (
    <group>
      {/* Short fitted blouse */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.38, 0.22, 0.13]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Bust shaping */}
      <mesh position={[-0.07, 0.15, 0.07]}>
        <sphereGeometry args={[0.085, 16, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      <mesh position={[0.07, 0.15, 0.07]}>
        <sphereGeometry args={[0.085, 16, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Short sleeves */}
      <mesh position={[-0.22, 0.15, 0]} rotation={[0, 0, Math.PI * 0.15]}>
        <cylinderGeometry args={[0.04, 0.05, 0.1, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      <mesh position={[0.22, 0.15, 0]} rotation={[0, 0, -Math.PI * 0.15]}>
        <cylinderGeometry args={[0.04, 0.05, 0.1, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Saree drape indication */}
      <mesh position={[-0.15, 0.25, 0.08]} rotation={[0, 0, Math.PI * 0.7]}>
        <boxGeometry args={[0.25, 0.04, 0.02]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
    </group>
  );
};

// Kurti (Female Indian tunic)
const KurtiClothing = ({ gender, clothingProps }) => {
  return (
    <group>
      {/* Main body - knee length */}
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[0.38, 0.48, 0.13]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Bust shaping */}
      <mesh position={[-0.065, 0.15, 0.07]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      <mesh position={[0.065, 0.15, 0.07]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Round neckline */}
      <mesh position={[0, 0.24, 0.05]}>
        <torusGeometry args={[0.05, 0.015, 8, 16, Math.PI]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* 3/4 sleeves */}
      <mesh position={[-0.22, 0.1, 0]} rotation={[0, 0, Math.PI * 0.12]}>
        <cylinderGeometry args={[0.035, 0.05, 0.22, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      <mesh position={[0.22, 0.1, 0]} rotation={[0, 0, -Math.PI * 0.12]}>
        <cylinderGeometry args={[0.035, 0.05, 0.22, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Side slits */}
      <mesh position={[-0.19, -0.2, 0]}>
        <boxGeometry args={[0.01, 0.12, 0.01]} />
        <meshStandardMaterial color="#2c2c2c" />
      </mesh>
      <mesh position={[0.19, -0.2, 0]}>
        <boxGeometry args={[0.01, 0.12, 0.01]} />
        <meshStandardMaterial color="#2c2c2c" />
      </mesh>
    </group>
  );
};

// Kids School Uniform
const SchoolUniformClothing = ({ gender, clothingProps }) => {
  const isBlue = clothingProps.color?.includes('blue') || true;
  
  return (
    <group>
      {/* Shirt */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.32, 0.26, 0.11]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </mesh>
      
      {/* Collar */}
      <mesh position={[0, 0.22, 0.04]}>
        <boxGeometry args={[0.1, 0.03, 0.04]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </mesh>
      
      {/* Tie */}
      <mesh position={[0, 0.12, 0.06]}>
        <boxGeometry args={[0.04, 0.18, 0.01]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Shorts/Skirt */}
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[0.3, 0.16, 0.1]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Short sleeves */}
      <mesh position={[-0.18, 0.1, 0]} rotation={[0, 0, Math.PI * 0.15]}>
        <cylinderGeometry args={[0.035, 0.045, 0.1, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </mesh>
      <mesh position={[0.18, 0.1, 0]} rotation={[0, 0, -Math.PI * 0.15]}>
        <cylinderGeometry args={[0.035, 0.045, 0.1, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </mesh>
    </group>
  );
};

// Kids Casual Wear
const CasualWearClothing = ({ gender, clothingProps }) => {
  return (
    <group>
      {/* T-shirt */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.32, 0.26, 0.11]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Round neck */}
      <mesh position={[0, 0.22, 0.03]}>
        <torusGeometry args={[0.04, 0.015, 8, 16, Math.PI]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Short sleeves */}
      <mesh position={[-0.18, 0.1, 0]} rotation={[0, 0, Math.PI * 0.15]}>
        <cylinderGeometry args={[0.035, 0.045, 0.1, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      <mesh position={[0.18, 0.1, 0]} rotation={[0, 0, -Math.PI * 0.15]}>
        <cylinderGeometry args={[0.035, 0.045, 0.1, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Jeans/Shorts */}
      <mesh position={[0, -0.18, 0]}>
        <boxGeometry args={[0.28, 0.22, 0.1]} />
        <meshStandardMaterial color="#4a6fa5" roughness={0.7} />
      </mesh>
    </group>
  );
};

// Kids Party Wear
const PartyWearClothing = ({ gender, clothingProps }) => {
  return (
    <group>
      {/* Fancy top/dress */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.32, 0.34, 0.12]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Decorative collar/bow */}
      <mesh position={[0, 0.2, 0.07]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.2} />
      </mesh>
      
      {/* Puff sleeves */}
      <mesh position={[-0.18, 0.12, 0]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      <mesh position={[0.18, 0.12, 0]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Skirt/pants */}
      <mesh position={[0, -0.22, 0]}>
        <cylinderGeometry args={[0.2, 0.14, 0.22, 24]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Sparkle details */}
      {[[-0.08, 0.1], [0.08, 0.1], [0, 0.05], [-0.05, -0.1], [0.05, -0.1]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.07]}>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshStandardMaterial color="#ffffff" metalness={1} roughness={0} />
        </mesh>
      ))}
    </group>
  );
};

// Kids Ethnic Wear
const EthnicWearClothing = ({ gender, clothingProps }) => {
  return (
    <group>
      {/* Kurta top */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.32, 0.36, 0.11]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Mandarin collar */}
      <mesh position={[0, 0.2, 0.04]}>
        <cylinderGeometry args={[0.04, 0.045, 0.04, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Decorative front panel */}
      <mesh position={[0, 0.05, 0.06]}>
        <boxGeometry args={[0.06, 0.25, 0.01]} />
        <meshStandardMaterial color="#d4af37" metalness={0.5} roughness={0.3} />
      </mesh>
      
      {/* Sleeves */}
      <mesh position={[-0.18, 0.08, 0]} rotation={[0, 0, Math.PI * 0.1]}>
        <cylinderGeometry args={[0.03, 0.045, 0.18, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      <mesh position={[0.18, 0.08, 0]} rotation={[0, 0, -Math.PI * 0.1]}>
        <cylinderGeometry args={[0.03, 0.045, 0.18, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      
      {/* Pajama/churidar */}
      <mesh position={[-0.06, -0.32, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 0.3, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
      <mesh position={[0.06, -0.32, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 0.3, 16]} />
        <FabricMaterial {...clothingProps} />
      </mesh>
    </group>
  );
};

// ============================================================
// MAIN MANNEQUIN FIGURE
// ============================================================

const MannequinFigure = ({ gender, clothingType, fabricColor, patternName, fabricName }) => {
  const groupRef = useRef();
  
  // Gentle rotation animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
    }
  });
  
  const clothingProps = {
    color: fabricColor,
    pattern: patternName,
    fabricName: fabricName
  };
  
  // Get clothing component based on type
  const renderClothing = () => {
    const type = clothingType?.toLowerCase() || 'shirt';
    
    // Male clothing
    if (gender === 'male') {
      switch (type) {
        case 'shirt':
          return <ShirtClothing gender={gender} clothingProps={clothingProps} />;
        case 'pant':
        case 'pants':
        case 'trouser':
        case 'trousers':
          return <PantsClothing gender={gender} clothingProps={clothingProps} />;
        case 'kurta':
          return <KurtaClothing gender={gender} clothingProps={clothingProps} />;
        case 'suit':
        case 'blazer':
          return <SuitClothing gender={gender} clothingProps={clothingProps} />;
        case 'sherwani':
          return <SherwaniClothing gender={gender} clothingProps={clothingProps} />;
        default:
          return <ShirtClothing gender={gender} clothingProps={clothingProps} />;
      }
    }
    
    // Female clothing
    if (gender === 'female') {
      switch (type) {
        case 'blouse':
          return <ShirtClothing gender={gender} clothingProps={clothingProps} />;
        case 'salwar':
          return <SalwarClothing gender={gender} clothingProps={clothingProps} />;
        case 'lehenga':
          return <LehengaClothing gender={gender} clothingProps={clothingProps} />;
        case 'dress':
          return <DressClothing gender={gender} clothingProps={clothingProps} />;
        case 'kurti':
          return <KurtiClothing gender={gender} clothingProps={clothingProps} />;
        case 'saree blouse':
        case 'saree':
          return <SareeBlouseClothing gender={gender} clothingProps={clothingProps} />;
        default:
          return <ShirtClothing gender={gender} clothingProps={clothingProps} />;
      }
    }
    
    // Kids clothing
    if (gender === 'kids') {
      switch (type) {
        case 'school uniform':
          return <SchoolUniformClothing gender={gender} clothingProps={clothingProps} />;
        case 'casual wear':
          return <CasualWearClothing gender={gender} clothingProps={clothingProps} />;
        case 'party wear':
          return <PartyWearClothing gender={gender} clothingProps={clothingProps} />;
        case 'ethnic wear':
          return <EthnicWearClothing gender={gender} clothingProps={clothingProps} />;
        default:
          return <CasualWearClothing gender={gender} clothingProps={clothingProps} />;
      }
    }
    
    return <ShirtClothing gender="male" clothingProps={clothingProps} />;
  };
  
  const scale = gender === 'kids' ? 0.85 : 1;
  const headY = gender === 'kids' ? 0.32 : 0.42;
  
  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      {/* Head */}
      <Head gender={gender} position={[0, headY, 0]} />
      
      {/* Clothing */}
      {renderClothing()}
      
      {/* Arms (partially covered by clothing sleeves) */}
      <Arms gender={gender} />
      
      {/* Legs (may be covered by pants/skirt) */}
      <Legs gender={gender} />
    </group>
  );
};

// ============================================================
// SCENE SETUP
// ============================================================

const Scene = ({ gender, clothingType, fabricColor, patternName, fabricName }) => {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-5, 3, -5]} intensity={0.3} />
      <spotLight 
        position={[0, 5, 3]} 
        intensity={0.5} 
        angle={0.5} 
        penumbra={0.5}
      />
      
      {/* Environment for realistic reflections */}
      <Environment preset="studio" />
      
      {/* Ground shadow */}
      <ContactShadows 
        position={[0, -0.8, 0]} 
        opacity={0.4} 
        scale={3} 
        blur={2} 
        far={1}
      />
      
      {/* Mannequin */}
      <Center>
        <MannequinFigure 
          gender={gender}
          clothingType={clothingType}
          fabricColor={fabricColor}
          patternName={patternName}
          fabricName={fabricName}
        />
      </Center>
      
      {/* Camera controls */}
      <OrbitControls 
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.5}
        minDistance={1}
        maxDistance={3}
        autoRotate={false}
      />
    </>
  );
};

// ============================================================
// LOADING COMPONENT
// ============================================================

const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#666',
    fontFamily: 'system-ui, sans-serif'
  }}>
    <div style={{
      width: 50,
      height: 50,
      border: '4px solid #e0e0e0',
      borderTop: '4px solid #4a90d9',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <p style={{ marginTop: 16 }}>Loading 3D Preview...</p>
    <style>
      {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
    </style>
  </div>
);

// ============================================================
// MAIN COMPONENT
// ============================================================

const MannequinPreview3DRealistic = ({
  gender = 'male',
  clothingType = 'Shirt',
  fabricColor = '#4a90d9',
  patternName = 'solid',
  fabricName = 'Cotton'
}) => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: 500,
      background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)',
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Header with info */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        pointerEvents: 'none'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          padding: '10px 16px',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Live 3D Preview</div>
          <div style={{ fontWeight: 600, color: '#333' }}>
            {clothingType} • {fabricName}
          </div>
        </div>
        
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          padding: '8px 12px',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <div style={{
            width: 24,
            height: 24,
            borderRadius: 4,
            backgroundColor: fabricColor,
            border: '2px solid #fff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
          }} />
          <span style={{ fontSize: 12, color: '#666' }}>{patternName}</span>
        </div>
      </div>
      
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 0.5, 2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene 
            gender={gender}
            clothingType={clothingType}
            fabricColor={fabricColor}
            patternName={patternName}
            fabricName={fabricName}
          />
        </Suspense>
      </Canvas>
      
      {/* Interaction hint */}
      <div style={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.6)',
        color: '#fff',
        padding: '6px 12px',
        borderRadius: 20,
        fontSize: 11,
        pointerEvents: 'none'
      }}>
        🖱️ Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
};

export default MannequinPreview3DRealistic;

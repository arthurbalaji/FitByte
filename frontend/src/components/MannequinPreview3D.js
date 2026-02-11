import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  ContactShadows,
  Html,
  useProgress,
  SoftShadows
} from '@react-three/drei';
import * as THREE from 'three';

// ============================================
// PATTERN TEXTURE GENERATOR
// ============================================

const createPatternTexture = (color, pattern) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Base color
  ctx.fillStyle = color || '#4A90D9';
  ctx.fillRect(0, 0, 512, 512);
  
  const patternLower = (pattern || 'solid').toLowerCase();
  
  if (patternLower === 'striped') {
    ctx.strokeStyle = adjustColor(color, -40);
    ctx.lineWidth = 12;
    for (let i = 0; i < 512; i += 28) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
    }
  } else if (patternLower === 'checked' || patternLower === 'plaid') {
    ctx.strokeStyle = adjustColor(color, -30);
    ctx.lineWidth = 8;
    for (let i = 0; i < 512; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }
  } else if (patternLower === 'polka') {
    ctx.fillStyle = adjustColor(color, 50);
    for (let i = 20; i < 512; i += 40) {
      for (let j = 20; j < 512; j += 40) {
        ctx.beginPath();
        ctx.arc(i, j, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (patternLower === 'floral') {
    ctx.fillStyle = adjustColor(color, 60);
    for (let i = 64; i < 512; i += 128) {
      for (let j = 64; j < 512; j += 128) {
        for (let k = 0; k < 6; k++) {
          const angle = (k / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.ellipse(
            i + Math.cos(angle) * 15,
            j + Math.sin(angle) * 15,
            10, 6, angle, 0, Math.PI * 2
          );
          ctx.fill();
        }
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(i, j, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = adjustColor(color, 60);
      }
    }
  } else if (patternLower === 'herringbone') {
    ctx.strokeStyle = adjustColor(color, -35);
    ctx.lineWidth = 4;
    for (let i = 0; i < 512; i += 20) {
      for (let j = 0; j < 512; j += 40) {
        ctx.beginPath();
        ctx.moveTo(i, j);
        ctx.lineTo(i + 10, j + 20);
        ctx.lineTo(i, j + 40);
        ctx.stroke();
      }
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
};

const adjustColor = (hex, amount) => {
  if (!hex) return '#666666';
  hex = hex.replace('#', '');
  const num = parseInt(hex, 16);
  let r = Math.min(255, Math.max(0, (num >> 16) + amount));
  let g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  let b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

// ============================================
// PROFESSIONAL MANNEQUIN - REALISTIC HUMAN FORM
// ============================================

// Create smooth torso geometry using lathe
const createTorsoGeometry = (gender) => {
  const isFemale = gender === 'female';
  const isKids = gender === 'kids';
  
  // Body profile points (y, radius) - creates smooth curves
  const points = [];
  const segments = 32;
  
  if (isFemale) {
    // Elegant female silhouette
    points.push(new THREE.Vector2(0.045, 0));      // neck
    points.push(new THREE.Vector2(0.052, 0.02));
    points.push(new THREE.Vector2(0.065, 0.05));   // shoulders start
    points.push(new THREE.Vector2(0.072, 0.08));   // upper chest
    points.push(new THREE.Vector2(0.082, 0.12));   // bust line
    points.push(new THREE.Vector2(0.078, 0.16));
    points.push(new THREE.Vector2(0.068, 0.20));   // under bust
    points.push(new THREE.Vector2(0.058, 0.24));   // waist (narrow)
    points.push(new THREE.Vector2(0.055, 0.26));   // waist center
    points.push(new THREE.Vector2(0.062, 0.30));
    points.push(new THREE.Vector2(0.078, 0.34));   // hip curve
    points.push(new THREE.Vector2(0.088, 0.38));   // hip widest
    points.push(new THREE.Vector2(0.082, 0.42));
    points.push(new THREE.Vector2(0.068, 0.46));   // bottom hip
    points.push(new THREE.Vector2(0.055, 0.48));   // top of legs
  } else if (isKids) {
    // Kids proportions - rounder, less defined
    points.push(new THREE.Vector2(0.038, 0));
    points.push(new THREE.Vector2(0.045, 0.02));
    points.push(new THREE.Vector2(0.058, 0.06));
    points.push(new THREE.Vector2(0.068, 0.12));
    points.push(new THREE.Vector2(0.065, 0.18));
    points.push(new THREE.Vector2(0.060, 0.24));
    points.push(new THREE.Vector2(0.062, 0.30));
    points.push(new THREE.Vector2(0.065, 0.36));
    points.push(new THREE.Vector2(0.060, 0.42));
    points.push(new THREE.Vector2(0.052, 0.46));
  } else {
    // Male silhouette - broader shoulders, straight lines
    points.push(new THREE.Vector2(0.048, 0));      // neck
    points.push(new THREE.Vector2(0.058, 0.02));
    points.push(new THREE.Vector2(0.078, 0.05));   // shoulders
    points.push(new THREE.Vector2(0.088, 0.10));   // broad chest
    points.push(new THREE.Vector2(0.085, 0.16));
    points.push(new THREE.Vector2(0.078, 0.22));
    points.push(new THREE.Vector2(0.072, 0.26));   // waist
    points.push(new THREE.Vector2(0.070, 0.30));
    points.push(new THREE.Vector2(0.072, 0.34));   // hip
    points.push(new THREE.Vector2(0.070, 0.40));
    points.push(new THREE.Vector2(0.062, 0.46));
    points.push(new THREE.Vector2(0.055, 0.48));
  }
  
  return new THREE.LatheGeometry(points, segments);
};

// Create smooth limb geometry
const createLimbGeometry = (topRadius, bottomRadius, length, segments = 24) => {
  const points = [];
  const steps = 12;
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Smooth taper with slight curves for muscle definition
    const muscleShape = Math.sin(t * Math.PI) * 0.008;
    const radius = topRadius + (bottomRadius - topRadius) * t + muscleShape;
    points.push(new THREE.Vector2(radius, t * length));
  }
  
  return new THREE.LatheGeometry(points, segments);
};

// Realistic head with face features
const Head = ({ material, gender, isKids }) => {
  const headScale = isKids ? 0.95 : 1;
  const isFemale = gender === 'female';
  
  return (
    <group scale={headScale}>
      {/* Main head - oval shape */}
      <mesh position={[0, 0, 0]} material={material}>
        <sphereGeometry args={[0.092, 48, 48]} />
      </mesh>
      
      {/* Cranium top - slightly elongated */}
      <mesh position={[0, 0.035, -0.01]} scale={[1, 1.15, 0.95]} material={material}>
        <sphereGeometry args={[0.078, 32, 32]} />
      </mesh>
      
      {/* Face plane - flattens front */}
      <mesh position={[0, -0.01, 0.055]} scale={[0.8, 0.9, 0.4]} material={material}>
        <sphereGeometry args={[0.075, 24, 24]} />
      </mesh>
      
      {/* Chin - defined jaw */}
      <mesh position={[0, -0.065, 0.035]} material={material}>
        <sphereGeometry args={[isFemale ? 0.032 : 0.038, 20, 20]} />
      </mesh>
      
      {/* Jaw line - left */}
      <mesh position={[0.045, -0.045, 0.02]} rotation={[0, 0, 0.3]} scale={[0.8, 1, 0.7]} material={material}>
        <sphereGeometry args={[0.028, 16, 16]} />
      </mesh>
      {/* Jaw line - right */}
      <mesh position={[-0.045, -0.045, 0.02]} rotation={[0, 0, -0.3]} scale={[0.8, 1, 0.7]} material={material}>
        <sphereGeometry args={[0.028, 16, 16]} />
      </mesh>
      
      {/* Forehead */}
      <mesh position={[0, 0.04, 0.06]} scale={[1, 0.6, 0.5]} material={material}>
        <sphereGeometry args={[0.065, 24, 24]} />
      </mesh>
      
      {/* Brow ridge */}
      <mesh position={[0, 0.012, 0.078]} scale={[1.2, 0.35, 0.4]} material={material}>
        <sphereGeometry args={[0.04, 16, 16]} />
      </mesh>
      
      {/* Nose bridge */}
      <mesh position={[0, -0.005, 0.095]} rotation={[0.2, 0, 0]} material={material}>
        <capsuleGeometry args={[0.008, 0.03, 8, 12]} />
      </mesh>
      {/* Nose tip */}
      <mesh position={[0, -0.028, 0.098]} material={material}>
        <sphereGeometry args={[0.014, 12, 12]} />
      </mesh>
      
      {/* Cheekbones */}
      <mesh position={[0.048, -0.015, 0.062]} scale={[0.9, 0.7, 0.6]} material={material}>
        <sphereGeometry args={[0.025, 16, 16]} />
      </mesh>
      <mesh position={[-0.048, -0.015, 0.062]} scale={[0.9, 0.7, 0.6]} material={material}>
        <sphereGeometry args={[0.025, 16, 16]} />
      </mesh>
      
      {/* Eye sockets - subtle depressions */}
      <mesh position={[0.028, 0.005, 0.075]} scale={[1.2, 0.8, 0.5]} material={material}>
        <sphereGeometry args={[0.016, 12, 12]} />
      </mesh>
      <mesh position={[-0.028, 0.005, 0.075]} scale={[1.2, 0.8, 0.5]} material={material}>
        <sphereGeometry args={[0.016, 12, 12]} />
      </mesh>
      
      {/* Ears */}
      <mesh position={[0.088, -0.01, -0.01]} rotation={[0, 0.25, 0.1]} scale={[0.3, 1, 0.65]} material={material}>
        <sphereGeometry args={[0.035, 16, 16]} />
      </mesh>
      <mesh position={[-0.088, -0.01, -0.01]} rotation={[0, -0.25, -0.1]} scale={[0.3, 1, 0.65]} material={material}>
        <sphereGeometry args={[0.035, 16, 16]} />
      </mesh>
      
      {/* Back of head */}
      <mesh position={[0, 0.01, -0.055]} scale={[0.92, 0.95, 0.85]} material={material}>
        <sphereGeometry args={[0.078, 24, 24]} />
      </mesh>
    </group>
  );
};

// Smooth arm with hand
const Arm = ({ material, side, gender, isKids }) => {
  const isFemale = gender === 'female';
  const xDir = side === 'left' ? -1 : 1;
  const armScale = isKids ? 0.75 : 1;
  
  // Arm proportions
  const upperArmRadius = isFemale ? 0.032 : 0.038;
  const forearmRadius = isFemale ? 0.026 : 0.030;
  const wristRadius = isFemale ? 0.018 : 0.022;
  
  return (
    <group scale={armScale}>
      {/* Shoulder cap */}
      <mesh position={[0, 0, 0]} scale={[1, 0.8, 0.9]} material={material}>
        <sphereGeometry args={[0.048, 24, 24]} />
      </mesh>
      
      {/* Deltoid muscle shape */}
      <mesh position={[xDir * 0.015, -0.02, 0]} scale={[0.9, 1.1, 0.85]} material={material}>
        <sphereGeometry args={[0.042, 20, 20]} />
      </mesh>
      
      {/* Upper arm - bicep/tricep shape */}
      <mesh position={[xDir * 0.025, -0.11, 0]} rotation={[0, 0, xDir * 0.12]} material={material}>
        <capsuleGeometry args={[upperArmRadius, 0.13, 12, 24]} />
      </mesh>
      
      {/* Elbow - smooth joint */}
      <mesh position={[xDir * 0.04, -0.22, 0.005]} material={material}>
        <sphereGeometry args={[0.028, 20, 20]} />
      </mesh>
      
      {/* Forearm */}
      <mesh position={[xDir * 0.052, -0.36, 0]} rotation={[0, 0, xDir * 0.06]} material={material}>
        <capsuleGeometry args={[forearmRadius, 0.18, 12, 24]} />
      </mesh>
      
      {/* Wrist */}
      <mesh position={[xDir * 0.058, -0.52, 0]} material={material}>
        <sphereGeometry args={[wristRadius, 16, 16]} />
      </mesh>
      
      {/* Hand - palm */}
      <mesh position={[xDir * 0.060, -0.58, 0.005]} scale={[1, 1.3, 0.5]} material={material}>
        <sphereGeometry args={[0.022, 16, 16]} />
      </mesh>
      
      {/* Fingers group */}
      <group position={[xDir * 0.060, -0.62, 0.008]}>
        {/* Finger stubs */}
        <mesh position={[-0.012, -0.018, 0]} material={material}>
          <capsuleGeometry args={[0.006, 0.025, 6, 12]} />
        </mesh>
        <mesh position={[-0.004, -0.022, 0]} material={material}>
          <capsuleGeometry args={[0.006, 0.028, 6, 12]} />
        </mesh>
        <mesh position={[0.004, -0.022, 0]} material={material}>
          <capsuleGeometry args={[0.006, 0.028, 6, 12]} />
        </mesh>
        <mesh position={[0.012, -0.018, 0]} material={material}>
          <capsuleGeometry args={[0.006, 0.022, 6, 12]} />
        </mesh>
      </group>
      
      {/* Thumb */}
      <mesh position={[xDir * 0.042, -0.565, 0.018]} rotation={[0.4, xDir * 0.4, xDir * 0.3]} material={material}>
        <capsuleGeometry args={[0.008, 0.022, 6, 12]} />
      </mesh>
    </group>
  );
};

// Smooth leg with foot
const Leg = ({ material, side, gender, isKids }) => {
  const isFemale = gender === 'female';
  const xDir = side === 'left' ? -1 : 1;
  const legScale = isKids ? 0.72 : 1;
  
  const thighRadius = isFemale ? 0.058 : 0.062;
  const calfRadius = isFemale ? 0.042 : 0.046;
  const ankleRadius = isFemale ? 0.025 : 0.028;
  
  return (
    <group scale={legScale}>
      {/* Hip joint smooth */}
      <mesh position={[0, 0, 0]} scale={[1, 0.9, 0.95]} material={material}>
        <sphereGeometry args={[0.062, 24, 24]} />
      </mesh>
      
      {/* Upper thigh */}
      <mesh position={[0, -0.08, 0]} material={material}>
        <capsuleGeometry args={[thighRadius, 0.08, 12, 24]} />
      </mesh>
      
      {/* Mid thigh with muscle curve */}
      <mesh position={[0, -0.2, 0.008]} material={material}>
        <capsuleGeometry args={[thighRadius - 0.005, 0.16, 12, 24]} />
      </mesh>
      
      {/* Lower thigh */}
      <mesh position={[0, -0.36, 0]} material={material}>
        <capsuleGeometry args={[thighRadius - 0.012, 0.1, 12, 24]} />
      </mesh>
      
      {/* Knee cap */}
      <mesh position={[0, -0.44, 0.028]} scale={[1, 0.8, 0.6]} material={material}>
        <sphereGeometry args={[0.035, 20, 20]} />
      </mesh>
      
      {/* Knee joint back */}
      <mesh position={[0, -0.44, -0.015]} material={material}>
        <sphereGeometry args={[0.038, 16, 16]} />
      </mesh>
      
      {/* Upper calf - muscle bulge */}
      <mesh position={[0, -0.54, -0.012]} material={material}>
        <capsuleGeometry args={[calfRadius + 0.008, 0.08, 12, 24]} />
      </mesh>
      
      {/* Mid calf - tapered */}
      <mesh position={[0, -0.68, 0]} material={material}>
        <capsuleGeometry args={[calfRadius - 0.006, 0.14, 12, 24]} />
      </mesh>
      
      {/* Lower calf to ankle */}
      <mesh position={[0, -0.82, 0]} material={material}>
        <capsuleGeometry args={[ankleRadius + 0.005, 0.1, 12, 24]} />
      </mesh>
      
      {/* Ankle bones - outer */}
      <mesh position={[xDir * 0.022, -0.90, 0]} material={material}>
        <sphereGeometry args={[0.015, 12, 12]} />
      </mesh>
      {/* Ankle bones - inner */}
      <mesh position={[xDir * -0.018, -0.89, 0]} material={material}>
        <sphereGeometry args={[0.012, 12, 12]} />
      </mesh>
      
      {/* Foot - heel */}
      <mesh position={[0, -0.95, -0.02]} scale={[0.9, 0.6, 1]} material={material}>
        <sphereGeometry args={[0.032, 16, 16]} />
      </mesh>
      
      {/* Foot - arch and main */}
      <mesh position={[0, -0.96, 0.035]} scale={[1, 0.45, 1.8]} material={material}>
        <sphereGeometry args={[0.032, 20, 20]} />
      </mesh>
      
      {/* Foot - ball and toes area */}
      <mesh position={[0, -0.955, 0.085]} scale={[1.15, 0.4, 0.8]} material={material}>
        <sphereGeometry args={[0.028, 16, 16]} />
      </mesh>
      
      {/* Toe hints */}
      <mesh position={[0, -0.952, 0.105]} scale={[1.3, 0.35, 0.45]} material={material}>
        <sphereGeometry args={[0.022, 12, 12]} />
      </mesh>
    </group>
  );
};

// Neck connector
const Neck = ({ material, gender, isKids }) => {
  const isFemale = gender === 'female';
  const neckLength = isKids ? 0.06 : (isFemale ? 0.095 : 0.085);
  const neckRadius = isFemale ? 0.034 : 0.042;
  
  return (
    <group>
      {/* Main neck */}
      <mesh position={[0, 0, 0]} material={material}>
        <cylinderGeometry args={[neckRadius, neckRadius + 0.008, neckLength, 24]} />
      </mesh>
      {/* Throat area */}
      <mesh position={[0, -0.015, 0.018]} scale={[0.85, 0.9, 0.6]} material={material}>
        <sphereGeometry args={[neckRadius - 0.005, 16, 16]} />
      </mesh>
      {/* Trapezius hint */}
      <mesh position={[0, -neckLength / 2 - 0.01, -0.015]} scale={[1.8, 0.5, 0.9]} material={material}>
        <sphereGeometry args={[neckRadius, 16, 16]} />
      </mesh>
    </group>
  );
};

const Mannequin = ({ gender }) => {
  const genderType = gender || 'male';
  const isFemale = genderType === 'female';
  const isKids = genderType === 'kids';
  const overallScale = isKids ? 0.68 : 1;
  
  // Professional mannequin material - smooth matte finish
  const mannequinMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#E5DCD3',
    roughness: 0.75,
    metalness: 0.03,
    envMapIntensity: 0.4,
  }), []);
  
  // Torso mesh with lathe geometry
  const torsoGeometry = useMemo(() => createTorsoGeometry(genderType), [genderType]);
  
  // Position calculations
  const headY = isFemale ? 1.62 : (isKids ? 1.52 : 1.65);
  const neckY = isFemale ? 1.52 : (isKids ? 1.44 : 1.55);
  const torsoY = isFemale ? 1.005 : (isKids ? 0.98 : 1.02);
  const shoulderY = isFemale ? 1.38 : (isKids ? 1.28 : 1.40);
  const shoulderWidth = isFemale ? 0.185 : (isKids ? 0.15 : 0.215);
  const legY = isFemale ? 0.80 : (isKids ? 0.76 : 0.82);
  const legSpacing = isFemale ? 0.072 : (isKids ? 0.055 : 0.078);
  
  return (
    <group scale={overallScale}>
      {/* HEAD */}
      <group position={[0, headY, 0]}>
        <Head material={mannequinMaterial} gender={genderType} isKids={isKids} />
      </group>
      
      {/* NECK */}
      <group position={[0, neckY, 0]}>
        <Neck material={mannequinMaterial} gender={genderType} isKids={isKids} />
      </group>
      
      {/* TORSO - Using lathe geometry for smooth curves */}
      <mesh 
        position={[0, torsoY, 0]} 
        rotation={[Math.PI, 0, 0]} 
        geometry={torsoGeometry} 
        material={mannequinMaterial}
      />
      
      {/* Clavicle/Collar bone area */}
      <mesh position={[0, shoulderY + 0.02, 0.04]} scale={[1.6, 0.3, 0.5]} material={mannequinMaterial}>
        <sphereGeometry args={[0.055, 20, 20]} />
      </mesh>
      
      {/* Shoulder caps smoothing */}
      <mesh position={[shoulderWidth, shoulderY - 0.02, 0]} scale={[0.7, 0.6, 0.8]} material={mannequinMaterial}>
        <sphereGeometry args={[0.055, 20, 20]} />
      </mesh>
      <mesh position={[-shoulderWidth, shoulderY - 0.02, 0]} scale={[0.7, 0.6, 0.8]} material={mannequinMaterial}>
        <sphereGeometry args={[0.055, 20, 20]} />
      </mesh>
      
      {/* ARMS */}
      <group position={[-shoulderWidth - 0.01, shoulderY, 0]}>
        <Arm material={mannequinMaterial} side="left" gender={genderType} isKids={isKids} />
      </group>
      <group position={[shoulderWidth + 0.01, shoulderY, 0]}>
        <Arm material={mannequinMaterial} side="right" gender={genderType} isKids={isKids} />
      </group>
      
      {/* LEGS */}
      <group position={[-legSpacing, legY, 0]}>
        <Leg material={mannequinMaterial} side="left" gender={genderType} isKids={isKids} />
      </group>
      <group position={[legSpacing, legY, 0]}>
        <Leg material={mannequinMaterial} side="right" gender={genderType} isKids={isKids} />
      </group>
      
      {/* STAND */}
      <group position={[0, -0.24, 0]}>
        {/* Support pole */}
        <mesh position={[0, 0, 0]} material={mannequinMaterial}>
          <cylinderGeometry args={[0.018, 0.018, 0.28, 16]} />
        </mesh>
        {/* Base plate */}
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.14, 0.16, 0.018, 48]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.25} metalness={0.7} />
        </mesh>
      </group>
    </group>
  );
};

// ============================================
// CLOTHING COMPONENTS - ULTRA REALISTIC MEN'S WEAR
// ============================================

const ShirtClothing = ({ material, gender }) => {
  const isFemale = gender === 'female';
  const isKids = gender === 'kids';
  const scale = isKids ? 0.68 : 1;
  
  // Male-specific proportions for realistic fit
  const torsoWidth = isFemale ? 0.095 : 0.108;
  const shoulderWidth = isFemale ? 0.195 : 0.235;
  const sleeveRadius = isFemale ? 0.042 : 0.046;
  const chestDepth = isFemale ? 0.08 : 0.095;
  
  return (
    <group scale={scale}>
      {/* === TORSO BODY === */}
      {/* Upper chest - broader for men */}
      <mesh position={[0, 1.30, 0]} scale={[1, 1, chestDepth / 0.09]} material={material}>
        <cylinderGeometry args={[torsoWidth + 0.008, torsoWidth, 0.14, 36]} />
      </mesh>
      
      {/* Mid torso - slight taper */}
      <mesh position={[0, 1.18, 0]} scale={[1, 1, 0.92]} material={material}>
        <cylinderGeometry args={[torsoWidth, torsoWidth - 0.008, 0.14, 36]} />
      </mesh>
      
      {/* Lower torso - tucks into pants */}
      <mesh position={[0, 1.06, 0]} scale={[1, 1, 0.88]} material={material}>
        <cylinderGeometry args={[torsoWidth - 0.008, torsoWidth - 0.018, 0.12, 36]} />
      </mesh>
      
      {/* Back panel curvature */}
      <mesh position={[0, 1.20, -0.06]} scale={[0.95, 1.2, 0.35]} material={material}>
        <sphereGeometry args={[0.075, 24, 24]} />
      </mesh>
      
      {/* === COLLAR - Spread Collar Style === */}
      {/* Collar band */}
      <mesh position={[0, 1.395, 0]} material={material}>
        <cylinderGeometry args={[0.046, 0.048, 0.032, 24]} />
      </mesh>
      
      {/* Left collar point */}
      <group position={[-0.025, 1.405, 0.038]}>
        <mesh rotation={[0.45, 0.35, 0.12]} material={material}>
          <boxGeometry args={[0.042, 0.055, 0.006]} />
        </mesh>
        {/* Collar fold */}
        <mesh position={[-0.012, 0.015, 0.008]} rotation={[0.3, 0.25, 0.15]} material={material}>
          <boxGeometry args={[0.025, 0.03, 0.004]} />
        </mesh>
      </group>
      
      {/* Right collar point */}
      <group position={[0.025, 1.405, 0.038]}>
        <mesh rotation={[0.45, -0.35, -0.12]} material={material}>
          <boxGeometry args={[0.042, 0.055, 0.006]} />
        </mesh>
        <mesh position={[0.012, 0.015, 0.008]} rotation={[0.3, -0.25, -0.15]} material={material}>
          <boxGeometry args={[0.025, 0.03, 0.004]} />
        </mesh>
      </group>
      
      {/* Collar back stand */}
      <mesh position={[0, 1.405, -0.025]} scale={[1.1, 0.5, 0.4]} material={material}>
        <cylinderGeometry args={[0.038, 0.04, 0.035, 16, 1, true, 0, Math.PI]} />
      </mesh>
      
      {/* === PLACKET & BUTTONS === */}
      {/* Button placket - center front */}
      <mesh position={[0, 1.22, torsoWidth + 0.004]} material={material}>
        <boxGeometry args={[0.024, 0.38, 0.008]} />
      </mesh>
      
      {/* Buttons - realistic spacing */}
      {[1.36, 1.30, 1.22, 1.14, 1.06].map((y, i) => (
        <group key={i} position={[0, y, torsoWidth + 0.01]}>
          {/* Button body */}
          <mesh material={material}>
            <cylinderGeometry args={[0.006, 0.006, 0.003, 12]} />
          </mesh>
          {/* Button holes (4 hole style) */}
          <mesh position={[0.002, 0, 0.002]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.001, 0.001, 0.002, 6]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          <mesh position={[-0.002, 0, 0.002]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.001, 0.001, 0.002, 6]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
        </group>
      ))}
      
      {/* === SHOULDER YOKE === */}
      <mesh position={[0, 1.365, -0.015]} scale={[1, 0.28, 0.75]} material={material}>
        <capsuleGeometry args={[0.038, shoulderWidth - 0.06, 12, 24]} />
      </mesh>
      
      {/* Shoulder seams */}
      <mesh position={[-shoulderWidth / 2 + 0.01, 1.365, 0]} rotation={[0, 0, 0.1]} material={material}>
        <boxGeometry args={[0.06, 0.006, 0.055]} />
      </mesh>
      <mesh position={[shoulderWidth / 2 - 0.01, 1.365, 0]} rotation={[0, 0, -0.1]} material={material}>
        <boxGeometry args={[0.06, 0.006, 0.055]} />
      </mesh>
      
      {/* === SLEEVES - Long Sleeves with Cuffs === */}
      {/* Left sleeve */}
      <group position={[-shoulderWidth / 2, 1.35, 0]}>
        {/* Shoulder cap */}
        <mesh position={[-0.01, 0, 0]} scale={[0.65, 0.5, 0.75]} material={material}>
          <sphereGeometry args={[0.055, 20, 20]} />
        </mesh>
        
        {/* Upper sleeve */}
        <mesh position={[-0.035, -0.1, 0]} rotation={[0, 0, 0.18]} material={material}>
          <cylinderGeometry args={[sleeveRadius + 0.004, sleeveRadius, 0.16, 24]} />
        </mesh>
        
        {/* Elbow area */}
        <mesh position={[-0.055, -0.22, 0.006]} rotation={[0, 0, 0.15]} material={material}>
          <cylinderGeometry args={[sleeveRadius - 0.002, sleeveRadius - 0.004, 0.1, 24]} />
        </mesh>
        
        {/* Forearm */}
        <mesh position={[-0.072, -0.34, 0]} rotation={[0, 0, 0.12]} material={material}>
          <cylinderGeometry args={[sleeveRadius - 0.006, sleeveRadius - 0.01, 0.14, 24]} />
        </mesh>
        
        {/* Cuff - barrel style */}
        <group position={[-0.085, -0.44, 0]} rotation={[0, 0, 0.12]}>
          <mesh material={material}>
            <cylinderGeometry args={[sleeveRadius - 0.008, sleeveRadius - 0.004, 0.05, 20]} />
          </mesh>
          {/* Cuff button */}
          <mesh position={[0.025, 0, sleeveRadius - 0.01]} material={material}>
            <sphereGeometry args={[0.004, 8, 8]} />
          </mesh>
          {/* Cuff opening */}
          <mesh position={[0, 0, sleeveRadius - 0.008]} material={material}>
            <boxGeometry args={[0.015, 0.048, 0.003]} />
          </mesh>
        </group>
      </group>
      
      {/* Right sleeve - mirror */}
      <group position={[shoulderWidth / 2, 1.35, 0]}>
        <mesh position={[0.01, 0, 0]} scale={[0.65, 0.5, 0.75]} material={material}>
          <sphereGeometry args={[0.055, 20, 20]} />
        </mesh>
        <mesh position={[0.035, -0.1, 0]} rotation={[0, 0, -0.18]} material={material}>
          <cylinderGeometry args={[sleeveRadius + 0.004, sleeveRadius, 0.16, 24]} />
        </mesh>
        <mesh position={[0.055, -0.22, 0.006]} rotation={[0, 0, -0.15]} material={material}>
          <cylinderGeometry args={[sleeveRadius - 0.002, sleeveRadius - 0.004, 0.1, 24]} />
        </mesh>
        <mesh position={[0.072, -0.34, 0]} rotation={[0, 0, -0.12]} material={material}>
          <cylinderGeometry args={[sleeveRadius - 0.006, sleeveRadius - 0.01, 0.14, 24]} />
        </mesh>
        <group position={[0.085, -0.44, 0]} rotation={[0, 0, -0.12]}>
          <mesh material={material}>
            <cylinderGeometry args={[sleeveRadius - 0.008, sleeveRadius - 0.004, 0.05, 20]} />
          </mesh>
          <mesh position={[-0.025, 0, sleeveRadius - 0.01]} material={material}>
            <sphereGeometry args={[0.004, 8, 8]} />
          </mesh>
          <mesh position={[0, 0, sleeveRadius - 0.008]} material={material}>
            <boxGeometry args={[0.015, 0.048, 0.003]} />
          </mesh>
        </group>
      </group>
      
      {/* === HEM === */}
      <mesh position={[0, 0.995, 0]} material={material}>
        <torusGeometry args={[torsoWidth - 0.02, 0.006, 8, 36]} />
      </mesh>
      
      {/* Side seams */}
      <mesh position={[-torsoWidth + 0.01, 1.18, 0]} material={material}>
        <boxGeometry args={[0.004, 0.34, 0.008]} />
      </mesh>
      <mesh position={[torsoWidth - 0.01, 1.18, 0]} material={material}>
        <boxGeometry args={[0.004, 0.34, 0.008]} />
      </mesh>
    </group>
  );
};

const PantsClothing = ({ material, gender }) => {
  const isFemale = gender === 'female';
  const isKids = gender === 'kids';
  const scale = isKids ? 0.68 : 1;
  
  // Male formal trouser proportions
  const waistRadius = isFemale ? 0.072 : 0.082;
  const hipRadius = isFemale ? 0.088 : 0.085;
  const legSpacing = isFemale ? 0.072 : 0.08;
  const thighRadius = 0.068;
  const kneeRadius = 0.054;
  const ankleRadius = 0.048;
  
  return (
    <group scale={scale}>
      {/* === WAISTBAND === */}
      {/* Main waistband */}
      <mesh position={[0, 0.915, 0]} material={material}>
        <cylinderGeometry args={[waistRadius, waistRadius + 0.005, 0.05, 36]} />
      </mesh>
      
      {/* Waistband top edge */}
      <mesh position={[0, 0.942, 0]} material={material}>
        <torusGeometry args={[waistRadius, 0.008, 8, 36]} />
      </mesh>
      
      {/* Belt loops */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <mesh 
            key={i} 
            position={[Math.sin(rad) * waistRadius, 0.915, Math.cos(rad) * waistRadius]} 
            rotation={[0, -rad, 0]}
            material={material}
          >
            <boxGeometry args={[0.012, 0.045, 0.006]} />
          </mesh>
        );
      })}
      
      {/* === FRONT CLOSURE === */}
      {/* Fly */}
      <mesh position={[0, 0.86, hipRadius - 0.01]} material={material}>
        <boxGeometry args={[0.035, 0.12, 0.012]} />
      </mesh>
      
      {/* Fly stitching */}
      <mesh position={[0.018, 0.86, hipRadius - 0.004]} material={material}>
        <boxGeometry args={[0.003, 0.11, 0.004]} />
      </mesh>
      
      {/* Button at waist */}
      <mesh position={[0, 0.918, hipRadius + 0.002]}>
        <cylinderGeometry args={[0.008, 0.008, 0.004, 12]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.3} roughness={0.5} />
      </mesh>
      
      {/* === HIP/SEAT AREA === */}
      <mesh position={[0, 0.86, 0]} material={material}>
        <cylinderGeometry args={[hipRadius, hipRadius + 0.008, 0.08, 36]} />
      </mesh>
      
      {/* Back seat with slight curve */}
      <mesh position={[0, 0.85, -0.045]} scale={[0.85, 0.6, 0.4]} material={material}>
        <sphereGeometry args={[0.075, 20, 20]} />
      </mesh>
      
      {/* === CROTCH AREA === */}
      <mesh position={[0, 0.79, 0.008]} scale={[1.1, 0.55, 0.85]} material={material}>
        <sphereGeometry args={[0.072, 24, 24]} />
      </mesh>
      
      {/* Inseam connection */}
      <mesh position={[0, 0.74, 0]} material={material}>
        <cylinderGeometry args={[0.055, 0.075, 0.06, 24]} />
      </mesh>
      
      {/* === LEFT LEG === */}
      <group position={[-legSpacing, 0, 0]}>
        {/* Upper thigh */}
        <mesh position={[0, 0.62, 0]} material={material}>
          <cylinderGeometry args={[thighRadius, thighRadius - 0.006, 0.2, 28]} />
        </mesh>
        
        {/* Front crease - upper */}
        <mesh position={[0, 0.62, thighRadius - 0.015]} material={material}>
          <boxGeometry args={[0.003, 0.18, 0.006]} />
        </mesh>
        
        {/* Mid thigh */}
        <mesh position={[0, 0.48, 0]} material={material}>
          <cylinderGeometry args={[thighRadius - 0.008, kneeRadius + 0.008, 0.14, 28]} />
        </mesh>
        
        {/* Knee area - slight forward bend */}
        <mesh position={[0, 0.38, 0.01]} material={material}>
          <cylinderGeometry args={[kneeRadius + 0.006, kneeRadius, 0.1, 28]} />
        </mesh>
        
        {/* Front crease - lower */}
        <mesh position={[0, 0.28, kneeRadius - 0.008]} material={material}>
          <boxGeometry args={[0.003, 0.28, 0.006]} />
        </mesh>
        
        {/* Lower leg / calf area */}
        <mesh position={[0, 0.25, 0]} material={material}>
          <cylinderGeometry args={[kneeRadius - 0.002, ankleRadius + 0.006, 0.18, 28]} />
        </mesh>
        
        {/* Ankle/hem */}
        <mesh position={[0, 0.12, 0]} material={material}>
          <cylinderGeometry args={[ankleRadius + 0.004, ankleRadius, 0.1, 28]} />
        </mesh>
        
        {/* Cuff */}
        <mesh position={[0, 0.065, 0]} material={material}>
          <torusGeometry args={[ankleRadius, 0.006, 8, 24]} />
        </mesh>
        
        {/* Side seam */}
        <mesh position={[-thighRadius + 0.015, 0.45, 0]} material={material}>
          <boxGeometry args={[0.003, 0.55, 0.006]} />
        </mesh>
      </group>
      
      {/* === RIGHT LEG - Mirror === */}
      <group position={[legSpacing, 0, 0]}>
        <mesh position={[0, 0.62, 0]} material={material}>
          <cylinderGeometry args={[thighRadius, thighRadius - 0.006, 0.2, 28]} />
        </mesh>
        <mesh position={[0, 0.62, thighRadius - 0.015]} material={material}>
          <boxGeometry args={[0.003, 0.18, 0.006]} />
        </mesh>
        <mesh position={[0, 0.48, 0]} material={material}>
          <cylinderGeometry args={[thighRadius - 0.008, kneeRadius + 0.008, 0.14, 28]} />
        </mesh>
        <mesh position={[0, 0.38, 0.01]} material={material}>
          <cylinderGeometry args={[kneeRadius + 0.006, kneeRadius, 0.1, 28]} />
        </mesh>
        <mesh position={[0, 0.28, kneeRadius - 0.008]} material={material}>
          <boxGeometry args={[0.003, 0.28, 0.006]} />
        </mesh>
        <mesh position={[0, 0.25, 0]} material={material}>
          <cylinderGeometry args={[kneeRadius - 0.002, ankleRadius + 0.006, 0.18, 28]} />
        </mesh>
        <mesh position={[0, 0.12, 0]} material={material}>
          <cylinderGeometry args={[ankleRadius + 0.004, ankleRadius, 0.1, 28]} />
        </mesh>
        <mesh position={[0, 0.065, 0]} material={material}>
          <torusGeometry args={[ankleRadius, 0.006, 8, 24]} />
        </mesh>
        <mesh position={[thighRadius - 0.015, 0.45, 0]} material={material}>
          <boxGeometry args={[0.003, 0.55, 0.006]} />
        </mesh>
      </group>
      
      {/* === POCKETS === */}
      {/* Front pocket openings */}
      <mesh position={[-0.055, 0.84, 0.055]} rotation={[0.2, 0.4, 0.15]} material={material}>
        <boxGeometry args={[0.045, 0.004, 0.01]} />
      </mesh>
      <mesh position={[0.055, 0.84, 0.055]} rotation={[0.2, -0.4, -0.15]} material={material}>
        <boxGeometry args={[0.045, 0.004, 0.01]} />
      </mesh>
      
      {/* Back pockets */}
      <mesh position={[-0.04, 0.82, -hipRadius + 0.01]} material={material}>
        <boxGeometry args={[0.05, 0.055, 0.006]} />
      </mesh>
      <mesh position={[0.04, 0.82, -hipRadius + 0.01]} material={material}>
        <boxGeometry args={[0.05, 0.055, 0.006]} />
      </mesh>
    </group>
  );
};

const DressClothing = ({ material, gender }) => {
  const isKids = gender === 'kids';
  const scale = isKids ? 0.68 : 1;
  
  return (
    <group scale={scale}>
      {/* Bodice - fitted top */}
      <mesh position={[0, 1.26, 0]} material={material}>
        <cylinderGeometry args={[0.088, 0.080, 0.18, 32]} />
      </mesh>
      <mesh position={[0, 1.14, 0]} material={material}>
        <cylinderGeometry args={[0.075, 0.070, 0.12, 32]} />
      </mesh>
      
      {/* Empire waist band */}
      <mesh position={[0, 1.07, 0]} material={material}>
        <torusGeometry args={[0.068, 0.012, 8, 32]} />
      </mesh>
      
      {/* Neckline - sweetheart style */}
      <mesh position={[0.025, 1.35, 0.055]} rotation={[0.4, 0.2, 0]} scale={[0.8, 1, 0.4]} material={material}>
        <sphereGeometry args={[0.025, 12, 12]} />
      </mesh>
      <mesh position={[-0.025, 1.35, 0.055]} rotation={[0.4, -0.2, 0]} scale={[0.8, 1, 0.4]} material={material}>
        <sphereGeometry args={[0.025, 12, 12]} />
      </mesh>
      
      {/* Shoulder straps */}
      <mesh position={[-0.055, 1.38, 0.025]} rotation={[0.3, 0, 0.15]} material={material}>
        <boxGeometry args={[0.018, 0.08, 0.006]} />
      </mesh>
      <mesh position={[0.055, 1.38, 0.025]} rotation={[0.3, 0, -0.15]} material={material}>
        <boxGeometry args={[0.018, 0.08, 0.006]} />
      </mesh>
      
      {/* Skirt - flowing A-line */}
      <mesh position={[0, 0.85, 0]} material={material}>
        <cylinderGeometry args={[0.075, 0.18, 0.38, 48]} />
      </mesh>
      <mesh position={[0, 0.62, 0]} material={material}>
        <cylinderGeometry args={[0.18, 0.26, 0.24, 48]} />
      </mesh>
      
      {/* Hem detail */}
      <mesh position={[0, 0.495, 0]} material={material}>
        <torusGeometry args={[0.258, 0.012, 8, 48]} />
      </mesh>
    </group>
  );
};

const SuitClothing = ({ material, gender }) => {
  const isKids = gender === 'kids';
  const scale = isKids ? 0.68 : 1;
  
  return (
    <group scale={scale}>
      {/* ========== SUIT JACKET - Ultra Realistic ========== */}
      
      {/* Main jacket body - tailored silhouette */}
      {/* Upper chest area - structured with dart shaping */}
      <mesh position={[0, 1.26, 0]} material={material}>
        <cylinderGeometry args={[0.12, 0.118, 0.2, 36]} />
      </mesh>
      {/* Mid torso - tapered waist */}
      <mesh position={[0, 1.12, 0]} material={material}>
        <cylinderGeometry args={[0.118, 0.105, 0.12, 36]} />
      </mesh>
      {/* Lower jacket - slight flare at hip */}
      <mesh position={[0, 0.98, 0]} material={material}>
        <cylinderGeometry args={[0.105, 0.115, 0.16, 36]} />
      </mesh>
      
      {/* Front darts - tailoring detail */}
      <mesh position={[-0.055, 1.12, 0.09]} rotation={[0.1, 0, 0.05]} material={material}>
        <boxGeometry args={[0.003, 0.2, 0.008]} />
      </mesh>
      <mesh position={[0.055, 1.12, 0.09]} rotation={[0.1, 0, -0.05]} material={material}>
        <boxGeometry args={[0.003, 0.2, 0.008]} />
      </mesh>
      
      {/* Back panel seam (center) */}
      <mesh position={[0, 1.12, -0.105]} material={material}>
        <boxGeometry args={[0.003, 0.38, 0.006]} />
      </mesh>
      {/* Side seams */}
      <mesh position={[-0.105, 1.12, 0]} rotation={[0, 0, 0.02]} material={material}>
        <boxGeometry args={[0.003, 0.36, 0.006]} />
      </mesh>
      <mesh position={[0.105, 1.12, 0]} rotation={[0, 0, -0.02]} material={material}>
        <boxGeometry args={[0.003, 0.36, 0.006]} />
      </mesh>
      
      {/* Structured shoulders - padded look */}
      <mesh position={[0, 1.365, 0]} scale={[1, 0.25, 0.72]} material={material}>
        <capsuleGeometry args={[0.048, 0.18, 16, 28]} />
      </mesh>
      {/* Shoulder padding definition */}
      <mesh position={[-0.13, 1.365, 0]} scale={[0.55, 0.4, 0.65]} material={material}>
        <sphereGeometry args={[0.058, 24, 24]} />
      </mesh>
      <mesh position={[0.13, 1.365, 0]} scale={[0.55, 0.4, 0.65]} material={material}>
        <sphereGeometry args={[0.058, 24, 24]} />
      </mesh>
      {/* Shoulder seam line */}
      <mesh position={[-0.08, 1.365, 0.02]} rotation={[0, 0, 0.3]} material={material}>
        <boxGeometry args={[0.12, 0.004, 0.006]} />
      </mesh>
      <mesh position={[0.08, 1.365, 0.02]} rotation={[0, 0, -0.3]} material={material}>
        <boxGeometry args={[0.12, 0.004, 0.006]} />
      </mesh>
      
      {/* ===== NOTCH LAPELS - Signature suit detail ===== */}
      {/* Left lapel - main body */}
      <mesh position={[-0.045, 1.28, 0.1]} rotation={[0.12, 0.38, 0.06]} material={material}>
        <boxGeometry args={[0.065, 0.2, 0.012]} />
      </mesh>
      {/* Left lapel - notch cutout */}
      <mesh position={[-0.065, 1.36, 0.095]} rotation={[0.1, 0.5, 0.4]} material={material}>
        <boxGeometry args={[0.025, 0.025, 0.01]} />
      </mesh>
      {/* Left lapel - collar extension */}
      <mesh position={[-0.035, 1.39, 0.07]} rotation={[0.5, 0.3, 0.1]} material={material}>
        <boxGeometry args={[0.04, 0.04, 0.01]} />
      </mesh>
      {/* Right lapel - main body */}
      <mesh position={[0.045, 1.28, 0.1]} rotation={[0.12, -0.38, -0.06]} material={material}>
        <boxGeometry args={[0.065, 0.2, 0.012]} />
      </mesh>
      {/* Right lapel - notch cutout */}
      <mesh position={[0.065, 1.36, 0.095]} rotation={[0.1, -0.5, -0.4]} material={material}>
        <boxGeometry args={[0.025, 0.025, 0.01]} />
      </mesh>
      {/* Right lapel - collar extension */}
      <mesh position={[0.035, 1.39, 0.07]} rotation={[0.5, -0.3, -0.1]} material={material}>
        <boxGeometry args={[0.04, 0.04, 0.01]} />
      </mesh>
      
      {/* Under collar (back of neck) */}
      <mesh position={[0, 1.405, -0.025]} scale={[1.25, 0.35, 0.55]} material={material}>
        <cylinderGeometry args={[0.048, 0.052, 0.055, 20, 1, true, Math.PI * 0.25, Math.PI * 1.5]} />
      </mesh>
      {/* Collar roll line */}
      <mesh position={[0, 1.385, 0.04]} rotation={[0.6, 0, 0]} material={material}>
        <torusGeometry args={[0.06, 0.005, 6, 16, Math.PI]} />
      </mesh>
      
      {/* ===== FRONT CLOSURE ===== */}
      {/* Front edge - right side overlaps */}
      <mesh position={[0.02, 1.12, 0.115]} material={material}>
        <boxGeometry args={[0.035, 0.44, 0.01]} />
      </mesh>
      {/* Front edge stitching */}
      <mesh position={[0.035, 1.12, 0.118]} material={material}>
        <boxGeometry args={[0.003, 0.42, 0.004]} />
      </mesh>
      
      {/* Suit buttons - 2 button style with shanks */}
      {[1.18, 1.05].map((y, i) => (
        <group key={i} position={[0.022, y, 0.12]}>
          {/* Button body */}
          <mesh material={material}>
            <cylinderGeometry args={[0.012, 0.012, 0.006, 16]} rotation={[Math.PI / 2, 0, 0]} />
          </mesh>
          {/* Button rim */}
          <mesh position={[0, 0, 0.004]} material={material}>
            <torusGeometry args={[0.011, 0.002, 6, 16]} />
          </mesh>
          {/* Button holes - 4 hole pattern */}
          {[[-0.004, 0.004], [0.004, 0.004], [-0.004, -0.004], [0.004, -0.004]].map((pos, j) => (
            <mesh key={j} position={[pos[0], pos[1], 0.005]} material={material}>
              <cylinderGeometry args={[0.0015, 0.0015, 0.003, 8]} rotation={[Math.PI / 2, 0, 0]} />
            </mesh>
          ))}
        </group>
      ))}
      
      {/* ===== BREAST POCKET - Welt style with pocket square ===== */}
      <group position={[-0.06, 1.26, 0.108]}>
        {/* Welt pocket opening */}
        <mesh material={material}>
          <boxGeometry args={[0.045, 0.006, 0.01]} />
        </mesh>
        {/* Welt lip */}
        <mesh position={[0, -0.005, 0.002]} material={material}>
          <boxGeometry args={[0.044, 0.004, 0.008]} />
        </mesh>
        {/* Pocket square - folded triangle peek */}
        <mesh position={[0, 0.015, 0.004]} rotation={[0.1, 0, 0.78]} material={material}>
          <boxGeometry args={[0.022, 0.022, 0.003]} />
        </mesh>
        <mesh position={[-0.008, 0.012, 0.006]} rotation={[0.15, 0.2, 0.5]} material={material}>
          <boxGeometry args={[0.015, 0.018, 0.002]} />
        </mesh>
      </group>
      
      {/* ===== LOWER POCKETS - Flap pockets ===== */}
      {/* Left flap pocket */}
      <group position={[-0.055, 1.0, 0.105]}>
        {/* Pocket flap */}
        <mesh material={material}>
          <boxGeometry args={[0.06, 0.025, 0.012]} />
        </mesh>
        {/* Flap edge detail */}
        <mesh position={[0, -0.014, 0]} material={material}>
          <boxGeometry args={[0.058, 0.003, 0.01]} />
        </mesh>
        {/* Pocket body behind flap */}
        <mesh position={[0, -0.03, -0.003]} material={material}>
          <boxGeometry args={[0.058, 0.04, 0.008]} />
        </mesh>
      </group>
      {/* Right flap pocket */}
      <group position={[0.055, 1.0, 0.105]}>
        <mesh material={material}>
          <boxGeometry args={[0.06, 0.025, 0.012]} />
        </mesh>
        <mesh position={[0, -0.014, 0]} material={material}>
          <boxGeometry args={[0.058, 0.003, 0.01]} />
        </mesh>
        <mesh position={[0, -0.03, -0.003]} material={material}>
          <boxGeometry args={[0.058, 0.04, 0.008]} />
        </mesh>
      </group>
      
      {/* ===== JACKET SLEEVES - Tailored with buttons ===== */}
      {/* Left sleeve */}
      <group position={[-0.14, 1.36, 0]}>
        {/* Upper arm - slight room */}
        <mesh position={[-0.032, -0.12, 0]} rotation={[0, 0, 0.14]} material={material}>
          <cylinderGeometry args={[0.052, 0.05, 0.2, 24]} />
        </mesh>
        {/* Elbow - subtle shape */}
        <mesh position={[-0.048, -0.24, 0.008]} rotation={[0.08, 0, 0.12]} material={material}>
          <cylinderGeometry args={[0.05, 0.047, 0.08, 24]} />
        </mesh>
        {/* Forearm */}
        <mesh position={[-0.058, -0.32, 0]} rotation={[0, 0, 0.1]} material={material}>
          <cylinderGeometry args={[0.047, 0.044, 0.12, 24]} />
        </mesh>
        {/* Cuff */}
        <mesh position={[-0.068, -0.4, 0]} rotation={[0, 0, 0.1]} material={material}>
          <cylinderGeometry args={[0.045, 0.046, 0.05, 20]} />
        </mesh>
        {/* Sleeve buttons - 4 stacked */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[-0.035 - i * 0.012, -0.37 - i * 0.018, 0.042]} material={material}>
            <cylinderGeometry args={[0.006, 0.006, 0.004, 12]} rotation={[Math.PI / 2, 0, 0]} />
          </mesh>
        ))}
      </group>
      {/* Right sleeve */}
      <group position={[0.14, 1.36, 0]}>
        <mesh position={[0.032, -0.12, 0]} rotation={[0, 0, -0.14]} material={material}>
          <cylinderGeometry args={[0.052, 0.05, 0.2, 24]} />
        </mesh>
        <mesh position={[0.048, -0.24, 0.008]} rotation={[0.08, 0, -0.12]} material={material}>
          <cylinderGeometry args={[0.05, 0.047, 0.08, 24]} />
        </mesh>
        <mesh position={[0.058, -0.32, 0]} rotation={[0, 0, -0.1]} material={material}>
          <cylinderGeometry args={[0.047, 0.044, 0.12, 24]} />
        </mesh>
        <mesh position={[0.068, -0.4, 0]} rotation={[0, 0, -0.1]} material={material}>
          <cylinderGeometry args={[0.045, 0.046, 0.05, 20]} />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0.035 + i * 0.012, -0.37 - i * 0.018, 0.042]} material={material}>
            <cylinderGeometry args={[0.006, 0.006, 0.004, 12]} rotation={[Math.PI / 2, 0, 0]} />
          </mesh>
        ))}
      </group>
      
      {/* ===== JACKET BACK VENT ===== */}
      <mesh position={[0, 0.92, -0.108]} material={material}>
        <boxGeometry args={[0.003, 0.12, 0.008]} />
      </mesh>
      {/* Vent overlap */}
      <mesh position={[-0.012, 0.92, -0.106]} rotation={[0, 0.1, 0]} material={material}>
        <boxGeometry args={[0.02, 0.12, 0.006]} />
      </mesh>
      
      {/* Jacket bottom hem */}
      <mesh position={[0, 0.895, 0]} material={material}>
        <torusGeometry args={[0.112, 0.008, 8, 36]} />
      </mesh>
    </group>
  );
};

const KurtaClothing = ({ material, gender }) => {
  const isFemale = gender === 'female';
  const isKids = gender === 'kids';
  const scale = isKids ? 0.68 : 1;
  
  const bodyWidth = isFemale ? 0.09 : 0.105;
  
  return (
    <group scale={scale}>
      {/* ========== KURTA - Ultra Realistic Indian Traditional ========== */}
      
      {/* ===== MAIN BODY - Flowing A-line silhouette ===== */}
      {/* Shoulder yoke area */}
      <mesh position={[0, 1.32, 0]} material={material}>
        <cylinderGeometry args={[bodyWidth - 0.005, bodyWidth, 0.1, 36]} />
      </mesh>
      {/* Upper chest - fitted */}
      <mesh position={[0, 1.22, 0]} material={material}>
        <cylinderGeometry args={[bodyWidth, bodyWidth + 0.005, 0.12, 36]} />
      </mesh>
      {/* Mid chest - slight ease */}
      <mesh position={[0, 1.1, 0]} material={material}>
        <cylinderGeometry args={[bodyWidth + 0.005, bodyWidth + 0.012, 0.14, 36]} />
      </mesh>
      {/* Waist area - gentle taper */}
      <mesh position={[0, 0.96, 0]} material={material}>
        <cylinderGeometry args={[bodyWidth + 0.012, bodyWidth + 0.022, 0.16, 36]} />
      </mesh>
      {/* Hip area - starts flaring */}
      <mesh position={[0, 0.82, 0]} material={material}>
        <cylinderGeometry args={[bodyWidth + 0.022, bodyWidth + 0.038, 0.14, 36]} />
      </mesh>
      {/* Lower kurta - flowing */}
      <mesh position={[0, 0.68, 0]} material={material}>
        <cylinderGeometry args={[bodyWidth + 0.038, bodyWidth + 0.055, 0.16, 40]} />
      </mesh>
      
      {/* ===== MANDARIN COLLAR (Band Collar) - Authentic detail ===== */}
      {/* Collar band - stiff stand */}
      <mesh position={[0, 1.385, 0]} material={material}>
        <cylinderGeometry args={[0.044, 0.048, 0.045, 24]} />
      </mesh>
      {/* Collar top edge */}
      <mesh position={[0, 1.41, 0]} material={material}>
        <torusGeometry args={[0.043, 0.004, 8, 24]} />
      </mesh>
      {/* Collar front opening/split */}
      <mesh position={[0, 1.385, 0.044]} material={material}>
        <boxGeometry args={[0.008, 0.045, 0.008]} />
      </mesh>
      {/* Collar reinforcement stitching */}
      <mesh position={[0, 1.365, 0.035]} material={material}>
        <boxGeometry args={[0.05, 0.003, 0.003]} />
      </mesh>
      
      {/* ===== FRONT PLACKET - Traditional loop button style ===== */}
      {/* Placket panel - center front */}
      <mesh position={[0, 1.12, bodyWidth + 0.008]} material={material}>
        <boxGeometry args={[0.035, 0.5, 0.01]} />
      </mesh>
      {/* Placket edge stitching */}
      <mesh position={[-0.018, 1.12, bodyWidth + 0.012]} material={material}>
        <boxGeometry args={[0.003, 0.48, 0.004]} />
      </mesh>
      <mesh position={[0.018, 1.12, bodyWidth + 0.012]} material={material}>
        <boxGeometry args={[0.003, 0.48, 0.004]} />
      </mesh>
      
      {/* Traditional knot buttons (potli buttons) with loops */}
      {[1.32, 1.22, 1.12, 1.02, 0.92].map((y, i) => (
        <group key={i} position={[0, y, bodyWidth + 0.016]}>
          {/* Fabric knot button */}
          <mesh material={material}>
            <sphereGeometry args={[0.008, 12, 12]} />
          </mesh>
          {/* Button loop on other side */}
          <mesh position={[0.022, 0, -0.004]} rotation={[0, 0, Math.PI / 2]} material={material}>
            <torusGeometry args={[0.008, 0.002, 6, 12, Math.PI]} />
          </mesh>
        </group>
      ))}
      
      {/* ===== SHOULDER YOKE SEAM ===== */}
      <mesh position={[0, 1.34, 0.02]} rotation={[0.2, 0, 0]} material={material}>
        <boxGeometry args={[0.2, 0.004, 0.003]} />
      </mesh>
      <mesh position={[0, 1.34, -0.04]} rotation={[-0.15, 0, 0]} material={material}>
        <boxGeometry args={[0.18, 0.004, 0.003]} />
      </mesh>
      
      {/* ===== SIDE SEAMS ===== */}
      <mesh position={[-bodyWidth - 0.01, 1.02, 0]} rotation={[0, 0, 0.03]} material={material}>
        <boxGeometry args={[0.004, 0.6, 0.006]} />
      </mesh>
      <mesh position={[bodyWidth + 0.01, 1.02, 0]} rotation={[0, 0, -0.03]} material={material}>
        <boxGeometry args={[0.004, 0.6, 0.006]} />
      </mesh>
      
      {/* ===== TRADITIONAL SIDE SLITS (CHAAK) ===== */}
      {/* Left slit */}
      <group position={[-bodyWidth - 0.03, 0.72, 0]}>
        {/* Slit opening */}
        <mesh rotation={[0, 0, 0.08]} material={material}>
          <boxGeometry args={[0.004, 0.22, 0.012]} />
        </mesh>
        {/* Slit reinforcement - small triangle gusset */}
        <mesh position={[0.012, 0.11, 0]} rotation={[0, 0, 0.4]} material={material}>
          <boxGeometry args={[0.025, 0.025, 0.008]} />
        </mesh>
        {/* Slit edge stitching */}
        <mesh position={[0.004, 0, 0.006]} rotation={[0, 0, 0.08]} material={material}>
          <boxGeometry args={[0.003, 0.2, 0.003]} />
        </mesh>
      </group>
      {/* Right slit */}
      <group position={[bodyWidth + 0.03, 0.72, 0]}>
        <mesh rotation={[0, 0, -0.08]} material={material}>
          <boxGeometry args={[0.004, 0.22, 0.012]} />
        </mesh>
        <mesh position={[-0.012, 0.11, 0]} rotation={[0, 0, -0.4]} material={material}>
          <boxGeometry args={[0.025, 0.025, 0.008]} />
        </mesh>
        <mesh position={[-0.004, 0, 0.006]} rotation={[0, 0, -0.08]} material={material}>
          <boxGeometry args={[0.003, 0.2, 0.003]} />
        </mesh>
      </group>
      
      {/* ===== SLEEVES - Traditional full length ===== */}
      {/* Left sleeve */}
      <group position={[-0.125, 1.34, 0]}>
        {/* Shoulder attachment */}
        <mesh position={[-0.02, -0.02, 0]} rotation={[0, 0, 0.35]} material={material}>
          <cylinderGeometry args={[0.048, 0.055, 0.08, 24]} />
        </mesh>
        {/* Upper arm - traditional loose fit */}
        <mesh position={[-0.045, -0.12, 0]} rotation={[0, 0, 0.22]} material={material}>
          <cylinderGeometry args={[0.055, 0.058, 0.14, 24]} />
        </mesh>
        {/* Elbow area */}
        <mesh position={[-0.068, -0.24, 0]} rotation={[0, 0, 0.18]} material={material}>
          <cylinderGeometry args={[0.058, 0.056, 0.12, 24]} />
        </mesh>
        {/* Forearm - taper towards wrist */}
        <mesh position={[-0.085, -0.34, 0]} rotation={[0, 0, 0.15]} material={material}>
          <cylinderGeometry args={[0.056, 0.048, 0.1, 24]} />
        </mesh>
        {/* Wrist cuff - fitted */}
        <mesh position={[-0.095, -0.41, 0]} rotation={[0, 0, 0.15]} material={material}>
          <cylinderGeometry args={[0.048, 0.045, 0.05, 20]} />
        </mesh>
        {/* Cuff edge detail */}
        <mesh position={[-0.1, -0.44, 0]} rotation={[0, 0, 0.15]} material={material}>
          <torusGeometry args={[0.044, 0.006, 8, 20]} />
        </mesh>
        {/* Sleeve seam */}
        <mesh position={[-0.065, -0.22, -0.04]} rotation={[0.2, 0, 0.18]} material={material}>
          <boxGeometry args={[0.003, 0.4, 0.004]} />
        </mesh>
      </group>
      {/* Right sleeve */}
      <group position={[0.125, 1.34, 0]}>
        <mesh position={[0.02, -0.02, 0]} rotation={[0, 0, -0.35]} material={material}>
          <cylinderGeometry args={[0.048, 0.055, 0.08, 24]} />
        </mesh>
        <mesh position={[0.045, -0.12, 0]} rotation={[0, 0, -0.22]} material={material}>
          <cylinderGeometry args={[0.055, 0.058, 0.14, 24]} />
        </mesh>
        <mesh position={[0.068, -0.24, 0]} rotation={[0, 0, -0.18]} material={material}>
          <cylinderGeometry args={[0.058, 0.056, 0.12, 24]} />
        </mesh>
        <mesh position={[0.085, -0.34, 0]} rotation={[0, 0, -0.15]} material={material}>
          <cylinderGeometry args={[0.056, 0.048, 0.1, 24]} />
        </mesh>
        <mesh position={[0.095, -0.41, 0]} rotation={[0, 0, -0.15]} material={material}>
          <cylinderGeometry args={[0.048, 0.045, 0.05, 20]} />
        </mesh>
        <mesh position={[0.1, -0.44, 0]} rotation={[0, 0, -0.15]} material={material}>
          <torusGeometry args={[0.044, 0.006, 8, 20]} />
        </mesh>
        <mesh position={[0.065, -0.22, -0.04]} rotation={[0.2, 0, -0.18]} material={material}>
          <boxGeometry args={[0.003, 0.4, 0.004]} />
        </mesh>
      </group>
      
      {/* ===== BOTTOM HEM - Curved traditional finish ===== */}
      {/* Main hem line */}
      <mesh position={[0, 0.595, 0]} material={material}>
        <torusGeometry args={[bodyWidth + 0.052, 0.012, 10, 40]} />
      </mesh>
      {/* Hem facing - inside finish */}
      <mesh position={[0, 0.605, 0]} material={material}>
        <cylinderGeometry args={[bodyWidth + 0.048, bodyWidth + 0.054, 0.025, 40]} />
      </mesh>
      
      {/* ===== DECORATIVE EMBROIDERY HINT (Subtle) ===== */}
      {/* Neckline embroidery band */}
      <mesh position={[0, 1.36, 0.038]} material={material}>
        <boxGeometry args={[0.05, 0.015, 0.004]} />
      </mesh>
      {/* Placket embroidery dots */}
      {[1.27, 1.17, 1.07, 0.97].map((y, i) => (
        <mesh key={`emb-${i}`} position={[-0.025, y, bodyWidth + 0.015]} material={material}>
          <sphereGeometry args={[0.003, 8, 8]} />
        </mesh>
      ))}
    </group>
  );
};

const LehengaClothing = ({ material, gender }) => {
  const isKids = gender === 'kids';
  const scale = isKids ? 0.68 : 1;
  
  return (
    <group scale={scale}>
      {/* Choli - fitted blouse */}
      <mesh position={[0, 1.28, 0]} material={material}>
        <cylinderGeometry args={[0.085, 0.078, 0.16, 32]} />
      </mesh>
      <mesh position={[0, 1.16, 0]} material={material}>
        <cylinderGeometry args={[0.075, 0.068, 0.1, 32]} />
      </mesh>
      
      {/* Choli neckline - sweetheart */}
      <mesh position={[0.022, 1.36, 0.055]} rotation={[0.3, 0.15, 0]} scale={[0.7, 0.9, 0.3]} material={material}>
        <sphereGeometry args={[0.022, 12, 12]} />
      </mesh>
      <mesh position={[-0.022, 1.36, 0.055]} rotation={[0.3, -0.15, 0]} scale={[0.7, 0.9, 0.3]} material={material}>
        <sphereGeometry args={[0.022, 12, 12]} />
      </mesh>
      
      {/* Short sleeves */}
      <mesh position={[-0.095, 1.30, 0]} rotation={[0, 0, 0.35]} material={material}>
        <cylinderGeometry args={[0.038, 0.042, 0.08, 16]} />
      </mesh>
      <mesh position={[0.095, 1.30, 0]} rotation={[0, 0, -0.35]} material={material}>
        <cylinderGeometry args={[0.038, 0.042, 0.08, 16]} />
      </mesh>
      
      {/* Lehenga waistband */}
      <mesh position={[0, 1.08, 0]} material={material}>
        <cylinderGeometry args={[0.07, 0.075, 0.06, 32]} />
      </mesh>
      <mesh position={[0, 1.05, 0]} material={material}>
        <torusGeometry args={[0.073, 0.01, 8, 32]} />
      </mesh>
      
      {/* Lehenga skirt - heavily flared */}
      <mesh position={[0, 0.82, 0]} material={material}>
        <cylinderGeometry args={[0.08, 0.16, 0.38, 48]} />
      </mesh>
      <mesh position={[0, 0.52, 0]} material={material}>
        <cylinderGeometry args={[0.16, 0.32, 0.32, 64]} />
      </mesh>
      <mesh position={[0, 0.32, 0]} material={material}>
        <cylinderGeometry args={[0.32, 0.38, 0.16, 64]} />
      </mesh>
      
      {/* Skirt border */}
      <mesh position={[0, 0.235, 0]} material={material}>
        <torusGeometry args={[0.378, 0.015, 8, 64]} />
      </mesh>
      
      {/* Dupatta - draped */}
      <group position={[-0.08, 1.25, 0.05]}>
        <mesh position={[0, 0, 0]} rotation={[0.2, 0.4, 0.6]} material={material}>
          <boxGeometry args={[0.012, 0.5, 0.18]} />
        </mesh>
        <mesh position={[-0.06, -0.25, 0.08]} rotation={[0.3, 0.5, 0.8]} material={material}>
          <boxGeometry args={[0.01, 0.4, 0.16]} />
        </mesh>
      </group>
    </group>
  );
};

const SareeClothing = ({ material, gender }) => {
  const isKids = gender === 'kids';
  const scale = isKids ? 0.68 : 1;
  
  return (
    <group scale={scale}>
      {/* Blouse - fitted */}
      <mesh position={[0, 1.28, 0]} material={material}>
        <cylinderGeometry args={[0.085, 0.078, 0.14, 32]} />
      </mesh>
      <mesh position={[0, 1.18, 0]} material={material}>
        <cylinderGeometry args={[0.076, 0.070, 0.08, 32]} />
      </mesh>
      
      {/* Blouse neckline */}
      <mesh position={[0, 1.36, 0.045]} rotation={[0.25, 0, 0]} material={material}>
        <torusGeometry args={[0.035, 0.012, 8, 24, Math.PI]} />
      </mesh>
      
      {/* Short puff sleeves */}
      <mesh position={[-0.095, 1.30, 0]} rotation={[0, 0, 0.4]} scale={[1, 0.9, 0.95]} material={material}>
        <sphereGeometry args={[0.042, 16, 16]} />
      </mesh>
      <mesh position={[0.095, 1.30, 0]} rotation={[0, 0, -0.4]} scale={[1, 0.9, 0.95]} material={material}>
        <sphereGeometry args={[0.042, 16, 16]} />
      </mesh>
      
      {/* Petticoat waist */}
      <mesh position={[0, 1.10, 0]} material={material}>
        <cylinderGeometry args={[0.068, 0.072, 0.05, 28]} />
      </mesh>
      
      {/* Saree wrap - lower portion */}
      <mesh position={[0, 0.82, 0]} material={material}>
        <cylinderGeometry args={[0.075, 0.14, 0.48, 36]} />
      </mesh>
      <mesh position={[0, 0.52, 0]} material={material}>
        <cylinderGeometry args={[0.14, 0.20, 0.18, 40]} />
      </mesh>
      
      {/* Pleats at front */}
      <mesh position={[0, 0.72, 0.085]} material={material}>
        <boxGeometry args={[0.1, 0.36, 0.02]} />
      </mesh>
      {/* Pleat folds */}
      {[-0.03, -0.01, 0.01, 0.03].map((x, i) => (
        <mesh key={i} position={[x, 0.72, 0.098]} material={material}>
          <boxGeometry args={[0.006, 0.34, 0.015]} />
        </mesh>
      ))}
      
      {/* Pallu - draped over shoulder */}
      <group>
        {/* Shoulder drape */}
        <mesh position={[-0.085, 1.24, 0.045]} rotation={[0.2, 0.3, 0.5]} material={material}>
          <boxGeometry args={[0.015, 0.42, 0.2]} />
        </mesh>
        {/* Back drape */}
        <mesh position={[-0.05, 1.05, -0.06]} rotation={[0.1, -0.2, 0.4]} material={material}>
          <boxGeometry args={[0.012, 0.35, 0.18]} />
        </mesh>
        {/* Pallu end with pleats */}
        <mesh position={[-0.12, 0.88, 0.08]} rotation={[0.4, 0.6, 0.9]} material={material}>
          <boxGeometry args={[0.01, 0.28, 0.22]} />
        </mesh>
      </group>
      
      {/* Saree border at hem */}
      <mesh position={[0, 0.425, 0]} material={material}>
        <torusGeometry args={[0.198, 0.012, 8, 40]} />
      </mesh>
    </group>
  );
};

// ============================================
// CLOTHING SELECTOR
// ============================================

const ClothingLayer = ({ clothingType, gender, fabricColor, patternName }) => {
  const texture = useMemo(() => 
    createPatternTexture(fabricColor, patternName),
    [fabricColor, patternName]
  );
  
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.75,
    metalness: 0.02,
    side: THREE.DoubleSide,
  }), [texture]);
  
  const type = (clothingType || '').toLowerCase();
  
  if (type.includes('pant') || type.includes('trouser') || type.includes('salwar')) {
    return <PantsClothing material={material} gender={gender} />;
  }
  if (type.includes('dress') || type.includes('kurti')) {
    return <DressClothing material={material} gender={gender} />;
  }
  if (type.includes('suit') || type.includes('blazer') || type.includes('sherwani')) {
    return <SuitClothing material={material} gender={gender} />;
  }
  if (type.includes('kurta') || type.includes('ethnic')) {
    return <KurtaClothing material={material} gender={gender} />;
  }
  if (type.includes('lehenga')) {
    return <LehengaClothing material={material} gender={gender} />;
  }
  if (type.includes('saree')) {
    return <SareeClothing material={material} gender={gender} />;
  }
  
  // Default: Shirt
  return <ShirtClothing material={material} gender={gender} />;
};

// ============================================
// LOADING INDICATOR
// ============================================

const Loader = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        color: '#374151'
      }}>
        <div style={{
          width: '140px',
          height: '5px',
          background: '#e5e7eb',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
            transition: 'width 0.3s ease'
          }} />
        </div>
        <span style={{ fontSize: '13px', fontWeight: '500' }}>
          Loading preview...
        </span>
      </div>
    </Html>
  );
};

// ============================================
// MANNEQUIN SCENE
// ============================================

const MannequinScene = ({ gender, clothingType, fabricColor, patternName }) => {
  const groupRef = useRef();
  const genderLower = (gender || 'male').toLowerCase();
  
  // Gentle rotation animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.06;
    }
  });
  
  return (
    <group ref={groupRef} position={[0, -0.65, 0]}>
      <Mannequin gender={genderLower} />
      <ClothingLayer 
        clothingType={clothingType}
        gender={genderLower}
        fabricColor={fabricColor}
        patternName={patternName}
      />
    </group>
  );
};

// ============================================
// MAIN EXPORT COMPONENT
// ============================================

const MannequinPreview3D = ({ gender, clothingType, fabricColor, patternName }) => {
  return (
    <div className="mannequin-container-3d" style={{ 
      width: '100%', 
      height: '500px',
      position: 'relative',
      background: 'linear-gradient(180deg, #fafbfc 0%, #f1f5f9 40%, #e2e8f0 100%)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: 'inset 0 2px 30px rgba(0,0,0,0.04)'
    }}>
      <Canvas
        camera={{ position: [0, 0.5, 2.2], fov: 50 }}
        shadows
        dpr={[1, 2]}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={<Loader />}>
          <SoftShadows size={18} samples={12} />
          
          {/* Lighting setup */}
          <ambientLight intensity={0.5} color="#ffffff" />
          
          <directionalLight
            position={[4, 6, 4]}
            intensity={1.0}
            color="#fffaf5"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          
          <directionalLight
            position={[-3, 4, -2]}
            intensity={0.35}
            color="#e8f0ff"
          />
          
          <directionalLight
            position={[0, 2, -4]}
            intensity={0.25}
            color="#ffffff"
          />
          
          {/* Environment for realistic reflections */}
          <Environment preset="city" />
          
          {/* Mannequin with clothing */}
          <MannequinScene
            gender={gender}
            clothingType={clothingType}
            fabricColor={fabricColor}
            patternName={patternName}
          />
          
          {/* Ground plane */}
          <mesh 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[0, -0.98, 0]}
            receiveShadow
          >
            <circleGeometry args={[1.2, 64]} />
            <meshStandardMaterial 
              color="#f8f8f8" 
              roughness={0.92}
              metalness={0}
            />
          </mesh>
          
          {/* Shadows */}
          <ContactShadows
            position={[0, -0.97, 0]}
            opacity={0.35}
            scale={2.5}
            blur={2}
            far={1}
            color="#1e293b"
          />
          
          {/* Controls */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={1.4}
            maxDistance={3.5}
            minPolarAngle={Math.PI / 8}
            maxPolarAngle={Math.PI / 1.7}
            target={[0, 0.35, 0]}
            enableDamping={true}
            dampingFactor={0.05}
            rotateSpeed={0.6}
          />
        </Suspense>
      </Canvas>
      
      {/* Info badge */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '10px 18px',
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: '600',
        color: '#1f2937',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        textTransform: 'capitalize',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: gender === 'female' ? '#ec4899' : gender === 'kids' ? '#f59e0b' : '#3b82f6'
        }} />
        {gender || 'Male'} • {clothingType || 'Shirt'}
      </div>
      
      {/* Color/Pattern badge */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '10px 16px',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: fabricColor || '#4A90D9',
          border: '2px solid rgba(255,255,255,0.8)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
        }} />
        <span style={{ fontSize: '13px', fontWeight: '500', color: '#374151', textTransform: 'capitalize' }}>
          {patternName || 'Solid'}
        </span>
      </div>
      
      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(30, 41, 59, 0.85)',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '24px',
        fontSize: '12px',
        fontWeight: '500',
        pointerEvents: 'none',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5v14"/>
          </svg>
          Drag to rotate
        </span>
        <span style={{ opacity: 0.5 }}>|</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          Scroll to zoom
        </span>
      </div>
    </div>
  );
};

export default MannequinPreview3D;
